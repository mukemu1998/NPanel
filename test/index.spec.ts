import {
	createExecutionContext,
	env,
	SELF,
	waitOnExecutionContext,
} from "cloudflare:test";
import { beforeAll, describe, expect, it } from "vitest";
import worker from "../src";
import schemaSql from "../database/0001_init.sql?raw";
import seedSql from "../database/0002_seed_demo.sql?raw";

function splitSqlStatements(sql: string): string[] {
	return sql
		.split(/;\s*(?:\r?\n|$)/)
		.map((query) => query.trim())
		.filter(Boolean)
		.map((query) => `${query};`);
}

beforeAll(async () => {
	for (const statement of splitSqlStatements(schemaSql)) {
		await env.DB.prepare(statement).run();
	}
	for (const statement of splitSqlStatements(seedSql)) {
		await env.DB.prepare(statement).run();
	}
});

describe("NPanel worker", () => {
	it("returns health metadata", async () => {
		const request = new Request<unknown, IncomingRequestCfProperties>(
			"http://127.0.0.1/api/health",
		);
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);
		const payload = await response.json<{
			ok: boolean;
			proxyTrafficViaCloudflare: boolean;
			authConfigured: boolean;
		}>();
		expect(payload.ok).toBe(true);
		expect(payload.proxyTrafficViaCloudflare).toBe(false);
		expect(payload.authConfigured).toBe(true);
	});

	it("returns anonymous session by default", async () => {
		const response = await SELF.fetch("http://127.0.0.1/api/session");
		const payload = await response.json<{
			authenticated: boolean;
			authConfigured: boolean;
			settings: { brand: string };
		}>();
		expect(payload.authenticated).toBe(false);
		expect(payload.authConfigured).toBe(true);
		expect(payload.settings.brand).toBe("NPanel");
	});

	it("allows authenticated node creation", async () => {
		const loginResponse = await SELF.fetch("http://127.0.0.1/api/auth/login", {
			method: "POST",
			headers: {
				"content-type": "application/json",
			},
			body: JSON.stringify({ password: "change-me" }),
		});
		expect(loginResponse.status).toBe(200);

		const setCookie = loginResponse.headers.get("set-cookie");
		expect(setCookie).toBeTruthy();
		const cookie = setCookie!.split(";")[0];

		const createResponse = await SELF.fetch("http://127.0.0.1/api/nodes", {
			method: "POST",
			headers: {
				"content-type": "application/json",
				cookie,
			},
			body: JSON.stringify({
				name: "Test Node",
				protocol: "vless",
				server: "203.0.113.123",
				port: 443,
				enabled: true,
				uuid: "33333333-3333-3333-3333-333333333333",
				sni: "www.cloudflare.com",
			}),
		});
		expect(createResponse.status).toBe(200);

		const listResponse = await SELF.fetch("http://127.0.0.1/api/nodes", {
			headers: { cookie },
		});
		const payload = await listResponse.json<{ items: Array<{ name: string }> }>();
		expect(payload.items.some((item) => item.name === "Test Node")).toBe(true);
	});

	it("saves custom brand settings", async () => {
		const loginResponse = await SELF.fetch("http://127.0.0.1/api/auth/login", {
			method: "POST",
			headers: {
				"content-type": "application/json",
			},
			body: JSON.stringify({ password: "change-me" }),
		});
		const cookie = loginResponse.headers.get("set-cookie")!.split(";")[0];

		const saveResponse = await SELF.fetch("http://127.0.0.1/api/settings", {
			method: "PUT",
			headers: {
				"content-type": "application/json",
				cookie,
			},
			body: JSON.stringify({ brand: "Example Panel" }),
		});
		expect(saveResponse.status).toBe(200);
		const saved = await saveResponse.json<{ brand: string }>();
		expect(saved.brand).toBe("Example Panel");

		const sessionResponse = await SELF.fetch("http://127.0.0.1/api/session");
		const session = await sessionResponse.json<{ settings: { brand: string } }>();
		expect(session.settings.brand).toBe("Example Panel");

		await SELF.fetch("http://127.0.0.1/api/settings", {
			method: "PUT",
			headers: {
				"content-type": "application/json",
				cookie,
			},
			body: JSON.stringify({ brand: "NPanel" }),
		});
	});

	it("uses custom brand in clash subscription title headers", async () => {
		const loginResponse = await SELF.fetch("http://127.0.0.1/api/auth/login", {
			method: "POST",
			headers: {
				"content-type": "application/json",
			},
			body: JSON.stringify({ password: "change-me" }),
		});
		const cookie = loginResponse.headers.get("set-cookie")!.split(";")[0];

		await SELF.fetch("http://127.0.0.1/api/settings", {
			method: "PUT",
			headers: {
				"content-type": "application/json",
				cookie,
			},
			body: JSON.stringify({ brand: "Example Panel" }),
		});

		const response = await SELF.fetch(
			"http://example.com/subscribe/clash/demo-gemini-group/Example%20Panel.yaml",
		);
		expect(response.status).toBe(200);
		expect(response.headers.get("profile-title")).toBe("base64:RXhhbXBsZSBQYW5lbA==");
		expect(response.headers.get("content-disposition")).toContain('filename="example-panel.yaml"');
		const text = await response.text();
		expect(text).toContain("name: 'Example Panel'");

		await SELF.fetch("http://127.0.0.1/api/settings", {
			method: "PUT",
			headers: {
				"content-type": "application/json",
				cookie,
			},
			body: JSON.stringify({ brand: "NPanel" }),
		});
	});

	it("blocks remote login when production secrets are missing", async () => {
		const request = new Request("https://panel.example.com/api/auth/login", {
			method: "POST",
			headers: {
				"content-type": "application/json",
			},
			body: JSON.stringify({ password: "change-me" }),
		});
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);
		expect(response.status).toBe(503);
	});

	it("rejects remote dashboard access when D1 binding is missing", async () => {
		const remoteEnv = {
			...env,
			DB: undefined,
			ADMIN_PASSWORD: "remote-secret",
			SESSION_SECRET: "remote-session-secret",
		};

		const loginRequest = new Request("https://panel.example.com/api/auth/login", {
			method: "POST",
			headers: {
				"content-type": "application/json",
			},
			body: JSON.stringify({ password: "remote-secret" }),
		});
		const loginCtx = createExecutionContext();
		const loginResponse = await worker.fetch(loginRequest, remoteEnv, loginCtx);
		await waitOnExecutionContext(loginCtx);
		expect(loginResponse.status).toBe(200);

		const cookie = loginResponse.headers.get("set-cookie")!.split(";")[0];
		const dashboardRequest = new Request("https://panel.example.com/api/dashboard", {
			headers: { cookie },
		});
		const dashboardCtx = createExecutionContext();
		const dashboardResponse = await worker.fetch(dashboardRequest, remoteEnv, dashboardCtx);
		await waitOnExecutionContext(dashboardCtx);
		expect(dashboardResponse.status).toBe(503);
		const payload = await dashboardResponse.json<{ error: string; detail: string }>();
		expect(payload.error).toContain("storage");
	});

	it("returns 204 for favicon even when assets binding is missing", async () => {
		const remoteEnv = {
			...env,
			ASSETS: undefined,
		};
		const request = new Request("https://panel.example.com/favicon.ico");
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, remoteEnv, ctx);
		await waitOnExecutionContext(ctx);
		expect(response.status).toBe(204);
	});

	it("serves public v2rayN subscription with custom title headers", async () => {
		const response = await SELF.fetch(
			"http://example.com/subscribe/v2rayn/demo-gemini-group/Gemini.txt",
		);
		expect(response.status).toBe(200);
		expect(response.headers.get("profile-title")).toBe("base64:R2VtaW5p");
		expect(response.headers.get("content-disposition")).toContain('filename="gemini.txt"');
		const text = await response.text();
		expect(text.length).toBeGreaterThan(20);
		const decoded = decodeURIComponent(escape(atob(text)));
		expect(decoded).toContain(encodeURIComponent("共享流量"));
	});

	it("serves clash subscription with custom title headers", async () => {
		const response = await SELF.fetch(
			"http://example.com/subscribe/clash/demo-gemini-group/Gemini.yaml",
		);
		expect(response.status).toBe(200);
		expect(response.headers.get("profile-title")).toBe("base64:R2VtaW5p");
		expect(response.headers.get("content-disposition")).toContain('filename="gemini.yaml"');
		const text = await response.text();
		expect(text).toContain("US-Gemini-via-HK");
		expect(text).toContain("US-Gemini-Reality");
		expect(text).toContain("共享流量");
	});

	it("serves authenticated subscription qr svg", async () => {
		const loginResponse = await SELF.fetch("http://127.0.0.1/api/auth/login", {
			method: "POST",
			headers: {
				"content-type": "application/json",
			},
			body: JSON.stringify({ password: "change-me" }),
		});
		const cookie = loginResponse.headers.get("set-cookie")!.split(";")[0];

		const response = await SELF.fetch(
			"http://127.0.0.1/api/qr?text=https%3A%2F%2Fexample.com%2Fsubscribe%2Fclash%2Fdemo&label=Gemini%20Clash",
			{
				headers: { cookie },
			},
		);
		expect(response.status).toBe(200);
		expect(response.headers.get("content-type")).toContain("image/svg+xml");
		const text = new TextDecoder().decode(await response.arrayBuffer());
		expect(text).toContain("<svg");
		expect(text).toContain('viewBox="0 0 ');
		expect(text).toContain('stroke="#111113"');
	});

	it("renders clash rules correctly for emoji group names", async () => {
		const loginResponse = await SELF.fetch("http://127.0.0.1/api/auth/login", {
			method: "POST",
			headers: {
				"content-type": "application/json",
			},
			body: JSON.stringify({ password: "change-me" }),
		});
		const cookie = loginResponse.headers.get("set-cookie")!.split(";")[0];

		const nodeResponse = await SELF.fetch("http://127.0.0.1/api/nodes", {
			method: "POST",
			headers: {
				"content-type": "application/json",
				cookie,
			},
			body: JSON.stringify({
				name: "Emoji Node",
				protocol: "vless",
				server: "203.0.113.50",
				port: 443,
				enabled: true,
				uuid: "44444444-4444-4444-4444-444444444444",
				sni: "www.cloudflare.com",
			}),
		});
		expect(nodeResponse.status).toBe(200);
		const node = await nodeResponse.json<{ id: string }>();

		const createGroupResponse = await SELF.fetch("http://127.0.0.1/api/groups", {
			method: "POST",
			headers: {
				"content-type": "application/json",
				cookie,
			},
			body: JSON.stringify({
				name: "Example Relay Group",
				slug: "example-relay-group",
				enabled: true,
				subscriptionToken: "emoji-group-token",
				members: [
					{
						nodeId: node.id,
						displayName: "HK Single Node",
						sortOrder: 10,
					},
				],
			}),
		});
		expect(createGroupResponse.status).toBe(200);

		const response = await SELF.fetch("http://example.com/subscribe/clash/emoji-group-token");
		expect(response.status).toBe(200);
		expect(response.headers.get("profile-title")).toBe("base64:RXhhbXBsZSBSZWxheSBHcm91cA==");
		expect(response.headers.get("content-disposition")).toContain('filename="example-relay-group.yaml"');
		const text = await response.text();
		expect(text).toContain("name: 'Example Relay Group'");
		expect(text).toContain("- 'MATCH,Example Relay Group'");
		expect(text).not.toContain("MATCH,'Example Relay Group'");
	});

	it("accepts traffic reports with the report secret", async () => {
		const request = new Request("http://127.0.0.1/api/nodes/node-us-reality/traffic", {
			method: "POST",
			headers: {
				"content-type": "application/json",
				"x-traffic-report-secret": "traffic-secret",
			},
			body: JSON.stringify({
				usedGb: 22.5,
				updatedAt: "2026-06-17T05:00:00.000Z",
			}),
		});
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, { ...env, TRAFFIC_REPORT_SECRET: "traffic-secret" }, ctx);
		await waitOnExecutionContext(ctx);
		expect(response.status).toBe(200);
		const payload = await response.json<{ trafficUsedGb: number; trafficUpdatedAt: string }>();
		expect(payload.trafficUsedGb).toBe(22.5);
		expect(payload.trafficUpdatedAt).toBe("2026-06-17T05:00:00.000Z");
	});

	it("exports dashboard data snapshot", async () => {
		const loginResponse = await SELF.fetch("http://127.0.0.1/api/auth/login", {
			method: "POST",
			headers: {
				"content-type": "application/json",
			},
			body: JSON.stringify({ password: "change-me" }),
		});
		const cookie = loginResponse.headers.get("set-cookie")!.split(";")[0];
		const response = await SELF.fetch("http://127.0.0.1/api/export", {
			headers: { cookie },
		});
		expect(response.status).toBe(200);
		const payload = await response.json<{
			version: number;
			nodes: Array<{ id: string }>;
			groups: Array<{ id: string }>;
		}>();
		expect(payload.version).toBe(1);
		expect(payload.nodes.length).toBeGreaterThan(0);
		expect(payload.groups.length).toBeGreaterThan(0);
	});
});
