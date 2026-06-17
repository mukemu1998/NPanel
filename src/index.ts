import {
	clearSessionHeader,
	createSessionCookie,
	makeSessionHeader,
	verifySession,
} from "./auth";
import QRCode from "qrcode";
import { runTcpChecks } from "./checks";
import { getStore } from "./store";
import { buildClashSubscription, buildV2rayNSubscription } from "./subscriptions";
import type { AppSettings, AppStore, GroupMemberRecord, GroupRecord, NodeRecord } from "./types";

type AppEnv = Env & {
	ASSETS: Fetcher;
	DB?: D1Database;
	ADMIN_PASSWORD?: string;
	SESSION_SECRET?: string;
	TRAFFIC_REPORT_SECRET?: string;
};

const DEFAULT_BRAND = "NPanel";

const defaultHeaders = {
	"content-type": "application/json; charset=utf-8",
};

function isLocalRequest(request: Request): boolean {
	const hostname = new URL(request.url).hostname;
	return hostname === "127.0.0.1" || hostname === "localhost" || hostname === "::1";
}

function getAuthConfig(request: Request, env: AppEnv) {
	const local = isLocalRequest(request);
	const adminPassword = env.ADMIN_PASSWORD ?? (local ? "change-me" : null);
	const sessionSecret = env.SESSION_SECRET ?? (local ? "dev-session-secret" : null);
	return {
		local,
		adminPassword,
		sessionSecret,
		configured: Boolean(adminPassword && sessionSecret),
		usingDevFallback: local && (!env.ADMIN_PASSWORD || !env.SESSION_SECRET),
	};
}

function getStorageMode(request: Request, env: AppEnv): AppStore["mode"] | "unavailable" {
	if (env.DB) return "d1";
	return isLocalRequest(request) ? "mock" : "unavailable";
}

function requireStore(
	request: Request,
	env: AppEnv,
	format: "json" | "text" = "json",
): AppStore | Response {
	try {
		return getStore(env, { allowMock: isLocalRequest(request) });
	} catch {
		if (format === "text") {
			return text("Panel storage is not configured", { status: 503 });
		}
		return json(
			{
				error: "Panel storage is not configured",
				detail: "Bind a real D1 database before remote use.",
			},
			{ status: 503 },
		);
	}
}

function json(data: unknown, init: ResponseInit = {}) {
	return new Response(JSON.stringify(data, null, 2), {
		...init,
		headers: {
			...defaultHeaders,
			...(init.headers ?? {}),
		},
	});
}

function text(data: string, init: ResponseInit = {}) {
	return new Response(data, init);
}

async function svg(data: string, init: ResponseInit = {}) {
	return new Response(data, {
		...init,
		headers: {
			"content-type": "image/svg+xml; charset=utf-8",
			"cache-control": "no-store",
			...(init.headers ?? {}),
		},
	});
}

function base64EncodeUtf8(value: string): string {
	return btoa(unescape(encodeURIComponent(value)));
}

function encodeDispositionFilename(value: string): string {
	return encodeURIComponent(value)
		.replace(/['()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`)
		.replace(/%(7C|60|5E)/g, (match) => match.toLowerCase());
}

function buildSubscriptionTitle(
	group: Pick<GroupRecord, "name" | "slug">,
	settings?: AppSettings,
): string {
	const brand = settings?.brand?.trim();
	return brand && brand !== DEFAULT_BRAND
		? brand
		: group.name.trim() || group.slug || "subscription";
}

function buildSubscriptionHeaders(
	group: Pick<GroupRecord, "name" | "slug">,
	format: "v2rayn" | "clash",
	settings?: AppSettings,
): HeadersInit {
	const extension = format === "clash" ? "yaml" : "txt";
	const title = buildSubscriptionTitle(group, settings);
	const usingCustomBrand = title === settings?.brand?.trim() && title !== DEFAULT_BRAND;
	const fallbackFileBase =
		(usingCustomBrand ? slugify(title) : group.slug || slugify(title)) || "subscription";
	const utf8FileName = `${title}.${extension}`;
	const fallbackFileName = `${fallbackFileBase}.${extension}`;

	return {
		"cache-control": "no-store",
		"content-disposition": `inline; filename="${fallbackFileName}"; filename*=UTF-8''${encodeDispositionFilename(utf8FileName)}`,
		"profile-title": `base64:${base64EncodeUtf8(title)}`,
	};
}

function getSubscriptionToken(pathname: string, prefix: string): string {
	const rest = pathname.slice(prefix.length);
	const segment = rest.split("/")[0] ?? "";
	return decodeURIComponent(segment).replace(/\.(txt|ya?ml)$/i, "");
}

async function readBody<T>(request: Request): Promise<T> {
	return (await request.json()) as T;
}

function slugify(value: string): string {
	return value
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

function nullableNumber(value: unknown): number | null {
	if (value === null || value === undefined || value === "") return null;
	return Number(value);
}

function normalizeNode(input: Partial<NodeRecord>): Partial<NodeRecord> {
	return {
		...input,
		port: Number(input.port ?? 443),
		enabled: Boolean(input.enabled ?? true),
		protocol: (input.protocol ?? "vless-reality") as NodeRecord["protocol"],
		transport: input.transport ?? "tcp",
		flow: input.flow ?? "xtls-rprx-vision",
		trafficMode: (input.trafficMode ?? "manual") as NodeRecord["trafficMode"],
		trafficQuotaGb: nullableNumber(input.trafficQuotaGb),
		trafficUsedGb: nullableNumber(input.trafficUsedGb),
		trafficResetDay: nullableNumber(input.trafficResetDay),
		trafficUpdatedAt: input.trafficUpdatedAt ?? null,
	};
}

function normalizeGroup(
	input: Partial<GroupRecord> & { members?: Array<Partial<GroupMemberRecord>> },
) {
	return {
		...input,
		enabled: Boolean(input.enabled ?? true),
		showTrafficInName: Boolean(input.showTrafficInName ?? false),
		slug: slugify(input.slug || input.name || "new-group"),
		subscriptionToken: input.subscriptionToken || crypto.randomUUID(),
		members: (input.members ?? []).map((member, index) => ({
			groupId: member.groupId,
			nodeId: member.nodeId,
			displayName: member.displayName ?? "",
			sortOrder: Number(member.sortOrder ?? (index + 1) * 10),
		})),
	};
}

function isReportAuthorized(request: Request, env: AppEnv): boolean {
	const secret = env.TRAFFIC_REPORT_SECRET;
	if (!secret) return false;
	return request.headers.get("x-traffic-report-secret") === secret;
}

async function isAuthenticated(request: Request, env: AppEnv): Promise<boolean> {
	const auth = getAuthConfig(request, env);
	if (!auth.sessionSecret) return false;
	return verifySession(request, auth.sessionSecret);
}

async function requireAuth(request: Request, env: AppEnv): Promise<Response | null> {
	const auth = getAuthConfig(request, env);
	if (!auth.configured) {
		return json(
			{
				error: "Panel auth is not configured",
				detail: "Set ADMIN_PASSWORD and SESSION_SECRET before remote use.",
			},
			{ status: 503 },
		);
	}
	if (await isAuthenticated(request, env)) {
		return null;
	}
	return json({ error: "Unauthorized" }, { status: 401 });
}

async function getSettingsSnapshot(request: Request, env: AppEnv): Promise<AppSettings> {
	const store = requireStore(request, env);
	if (store instanceof Response) {
		return { brand: DEFAULT_BRAND };
	}
	try {
		return await store.getSettings();
	} catch {
		return { brand: DEFAULT_BRAND };
	}
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const url = new URL(request.url);
		const auth = getAuthConfig(request, env);
		const storageMode = getStorageMode(request, env);

		if (url.pathname === "/api/health" && request.method === "GET") {
			const settings = await getSettingsSnapshot(request, env);
			return json({
				ok: true,
				storageMode,
				proxyTrafficViaCloudflare: false,
				storageReady: storageMode !== "unavailable",
				authConfigured: auth.configured,
				usingDevAuthFallback: auth.usingDevFallback,
				settings,
			});
		}

		if (url.pathname === "/api/session" && request.method === "GET") {
			const settings = await getSettingsSnapshot(request, env);
			return json({
				authenticated: await isAuthenticated(request, env),
				storageMode,
				storageReady: storageMode !== "unavailable",
				authConfigured: auth.configured,
				usingDevAuthFallback: auth.usingDevFallback,
				settings,
			});
		}

		if (url.pathname === "/api/auth/login" && request.method === "POST") {
			if (!auth.configured || !auth.adminPassword || !auth.sessionSecret) {
				return json(
					{
						error: "Panel auth is not configured",
						detail: "Set ADMIN_PASSWORD and SESSION_SECRET before remote login.",
					},
					{ status: 503 },
				);
			}
			const body = await readBody<{ password?: string }>(request);
			if ((body.password ?? "") !== auth.adminPassword) {
				return json({ error: "Invalid password" }, { status: 401 });
			}
			const session = await createSessionCookie(auth.sessionSecret);
			return json(
				{ ok: true },
				{
					headers: {
						"set-cookie": makeSessionHeader(session, !auth.local),
					},
				},
			);
		}

		if (url.pathname === "/api/auth/logout" && request.method === "POST") {
			return json(
				{ ok: true },
				{
					headers: {
						"set-cookie": clearSessionHeader(!auth.local),
					},
				},
			);
		}

		if (url.pathname.startsWith("/subscribe/v2rayn/") && request.method === "GET") {
			const store = requireStore(request, env, "text");
			if (store instanceof Response) return store;
			const token = getSubscriptionToken(url.pathname, "/subscribe/v2rayn/");
			const group = await store.getGroupByToken(token);
			if (!group || !group.enabled) {
				return text("Subscription not found", { status: 404 });
			}
			const settings = await store.getSettings();
			return text(buildV2rayNSubscription(group), {
				headers: {
					"content-type": "text/plain; charset=utf-8",
					...buildSubscriptionHeaders(group, "v2rayn", settings),
				},
			});
		}

		if (url.pathname.startsWith("/subscribe/clash/") && request.method === "GET") {
			const store = requireStore(request, env, "text");
			if (store instanceof Response) return store;
			const token = getSubscriptionToken(url.pathname, "/subscribe/clash/");
			const group = await store.getGroupByToken(token);
			if (!group || !group.enabled) {
				return text("Subscription not found", { status: 404 });
			}
			const settings = await store.getSettings();
			return text(buildClashSubscription(group, buildSubscriptionTitle(group, settings)), {
				headers: {
					"content-type": "text/yaml; charset=utf-8",
					...buildSubscriptionHeaders(group, "clash", settings),
				},
			});
		}

		if (url.pathname.startsWith("/api/nodes/") && url.pathname.endsWith("/traffic") && request.method === "POST") {
			const store = requireStore(request, env);
			if (store instanceof Response) return store;
			const authed = await isAuthenticated(request, env);
			if (!authed && !isReportAuthorized(request, env)) {
				return json({ error: "Unauthorized" }, { status: 401 });
			}
			const parts = url.pathname.split("/");
			const id = parts.at(-2) ?? "";
			const current = await store.getNodeById(id);
			if (!current) {
				return json({ error: "Node not found" }, { status: 404 });
			}
			const body = await readBody<{
				usedGb?: number | string | null;
				usedBytes?: number | string | null;
				updatedAt?: string | null;
			}>(request);
			const usedFromGb =
				body.usedGb === null || body.usedGb === undefined || body.usedGb === ""
					? null
					: Number(body.usedGb);
			const usedFromBytes =
				body.usedBytes === null || body.usedBytes === undefined || body.usedBytes === ""
					? null
					: Number(body.usedBytes) / 1024 / 1024 / 1024;
			const nextUsed = usedFromGb ?? usedFromBytes;
			const saved = await store.saveNode({
				...current,
				trafficMode:
					current.trafficMode === "unlimited"
						? "unlimited"
						: current.trafficMode === "shared-report"
							? "shared-report"
							: "self-report",
				trafficUsedGb: nextUsed,
				trafficUpdatedAt: body.updatedAt ?? new Date().toISOString(),
			});
			return json(saved);
		}

		if (url.pathname.startsWith("/api/")) {
			const blocked = await requireAuth(request, env);
			if (blocked) return blocked;
			const store = requireStore(request, env);
			if (store instanceof Response) return store;

			if (url.pathname === "/api/qr" && request.method === "GET") {
				const qrText = url.searchParams.get("text")?.trim() ?? "";
				if (!qrText) {
					return json({ error: "Missing text" }, { status: 400 });
				}
				const qrSvg = await QRCode.toString(qrText, {
					type: "svg",
					errorCorrectionLevel: "M",
					margin: 2,
					width: 720,
					color: {
						dark: "#111113",
						light: "#ffffff",
					},
				});
				return svg(qrSvg);
			}

			if (url.pathname === "/api/dashboard" && request.method === "GET") {
				return json(await store.getSummary());
			}

			if (url.pathname === "/api/settings" && request.method === "GET") {
				return json(await store.getSettings());
			}

			if (url.pathname === "/api/settings" && request.method === "PUT") {
				const body = await readBody<Partial<AppSettings>>(request);
				return json(await store.saveSettings(body));
			}

			if (url.pathname === "/api/nodes" && request.method === "GET") {
				return json({ items: await store.listNodes() });
			}

			if (url.pathname === "/api/nodes" && request.method === "POST") {
				const body = await readBody<Partial<NodeRecord>>(request);
				return json(await store.saveNode(normalizeNode(body)));
			}

			if (url.pathname.startsWith("/api/nodes/")) {
				const id = url.pathname.split("/").at(-1) ?? "";
				if (request.method === "PUT") {
					const body = await readBody<Partial<NodeRecord>>(request);
					return json(await store.saveNode(normalizeNode({ ...body, id })));
				}
				if (request.method === "DELETE") {
					await store.deleteNode(id);
					return json({ ok: true });
				}
			}

			if (url.pathname === "/api/groups" && request.method === "GET") {
				return json({ items: await store.listGroups() });
			}

			if (url.pathname === "/api/groups" && request.method === "POST") {
				const body = await readBody<
					Partial<GroupRecord> & { members?: Array<Partial<GroupMemberRecord>> }
				>(request);
				return json(await store.saveGroup(normalizeGroup(body)));
			}

			if (url.pathname.startsWith("/api/groups/")) {
				const id = url.pathname.split("/").at(-1) ?? "";
				if (request.method === "PUT") {
					const body = await readBody<
						Partial<GroupRecord> & { members?: Array<Partial<GroupMemberRecord>> }
					>(request);
					return json(await store.saveGroup(normalizeGroup({ ...body, id })));
				}
				if (request.method === "DELETE") {
					await store.deleteGroup(id);
					return json({ ok: true });
				}
			}

			if (url.pathname === "/api/subscriptions" && request.method === "GET") {
				const groups = await store.listGroups();
				return json({
					items: groups.map((group) => ({
						id: group.id,
						name: group.name,
						slug: group.slug,
						enabled: group.enabled,
						memberCount: group.members.length,
						v2raynPath: `/subscribe/v2rayn/${group.subscriptionToken}`,
						clashPath: `/subscribe/clash/${group.subscriptionToken}`,
					})),
				});
			}

			if (url.pathname === "/api/export" && request.method === "GET") {
				const [summary, nodes, groups, checks] = await Promise.all([
					store.getSummary(),
					store.listNodes(),
					store.listGroups(),
					store.listChecks(),
				]);
				return json({
					exportedAt: new Date().toISOString(),
					version: 1,
					summary,
					nodes,
					groups,
					checks,
				});
			}

			if (url.pathname === "/api/checks" && request.method === "GET") {
				return json({ items: await store.listChecks() });
			}

			if (url.pathname === "/api/checks/run" && request.method === "POST") {
				const checks = await runTcpChecks(await store.listNodes());
				await store.saveChecks(checks);
				return json({ items: await store.listChecks() });
			}

			return json({ error: "Not found" }, { status: 404 });
		}

		if (url.pathname === "/favicon.ico") {
			return new Response(null, { status: 204 });
		}

		if (!env.ASSETS) {
			return text("Static assets are not configured", { status: 503 });
		}

		return env.ASSETS.fetch(request);
	},
} satisfies ExportedHandler<AppEnv>;
