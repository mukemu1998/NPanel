import type {
	AppSettings,
	AppStore,
	CheckRecord,
	DashboardSummary,
	GroupMemberRecord,
	GroupRecord,
	GroupWithMembers,
	NodeRecord,
} from "./types";

const DEFAULT_BRAND = "NPanel";

const toNode = (row: Record<string, unknown>): NodeRecord => ({
	id: String(row.id),
	name: String(row.name),
	protocol: String(row.protocol) as NodeRecord["protocol"],
	server: String(row.server),
	port: Number(row.port),
	enabled: Boolean(row.enabled),
	transport: String(row.transport),
	wsPath: String(row.ws_path ?? ""),
	uuid: String(row.uuid ?? ""),
	password: String(row.password ?? ""),
	publicKey: String(row.public_key ?? ""),
	shortId: String(row.short_id ?? ""),
	sni: String(row.sni ?? ""),
	flow: String(row.flow ?? ""),
	note: String(row.note ?? ""),
	trafficMode: String(row.traffic_mode ?? "manual") as NodeRecord["trafficMode"],
	trafficQuotaGb:
		row.traffic_quota_gb === null || row.traffic_quota_gb === undefined
			? null
			: Number(row.traffic_quota_gb),
	trafficUsedGb:
		row.traffic_used_gb === null || row.traffic_used_gb === undefined
			? null
			: Number(row.traffic_used_gb),
	trafficResetDay:
		row.traffic_reset_day === null || row.traffic_reset_day === undefined
			? null
			: Number(row.traffic_reset_day),
	trafficUpdatedAt:
		row.traffic_updated_at === null || row.traffic_updated_at === undefined
			? null
			: String(row.traffic_updated_at),
	createdAt: String(row.created_at),
	updatedAt: String(row.updated_at),
});

const toGroup = (row: Record<string, unknown>): GroupRecord => ({
	id: String(row.id),
	name: String(row.name),
	slug: String(row.slug),
	enabled: Boolean(row.enabled),
	subscriptionToken: String(row.subscription_token),
	showTrafficInName: Boolean(row.show_traffic_in_name),
	createdAt: String(row.created_at),
	updatedAt: String(row.updated_at),
});

async function ensureSettingsTable(db: D1Database) {
	await db
		.prepare(
			`CREATE TABLE IF NOT EXISTS app_settings (
				key TEXT PRIMARY KEY,
				value TEXT NOT NULL,
				updated_at TEXT NOT NULL
			)`,
		)
		.run();
}

async function readSettings(db: D1Database): Promise<AppSettings> {
	await ensureSettingsTable(db);
	const result = await db
		.prepare("SELECT key, value FROM app_settings WHERE key IN ('project_name', 'brand')")
		.all<{ key: string; value: string | null }>();
	const values = new Map(
		(result.results ?? []).map((row) => [String(row.key), String(row.value ?? "").trim()]),
	);
	const projectName = values.get("project_name") || values.get("brand") || DEFAULT_BRAND;
	return {
		brand: projectName,
		projectName,
	};
}

export function createD1Store(db: D1Database): AppStore {
	return {
		mode: "d1",
		async getSummary(): Promise<DashboardSummary> {
			const nodeCount = await db
				.prepare("SELECT COUNT(*) AS count FROM nodes")
				.first<{ count: number }>();
			const groupCount = await db
				.prepare("SELECT COUNT(*) AS count FROM groups")
				.first<{ count: number }>();
			const activeNodeCount = await db
				.prepare("SELECT COUNT(*) AS count FROM nodes WHERE enabled = 1")
				.first<{ count: number }>();
			const lastCheck = await db
				.prepare("SELECT MAX(checked_at) AS checked_at FROM checks")
				.first<{ checked_at: string | null }>();
			return {
				nodeCount: Number(nodeCount?.count ?? 0),
				groupCount: Number(groupCount?.count ?? 0),
				activeNodeCount: Number(activeNodeCount?.count ?? 0),
				storageMode: "d1",
				lastCheckAt: lastCheck?.checked_at ?? null,
			};
		},
		async getSettings() {
			return readSettings(db);
		},
		async saveSettings(input) {
			const projectName = String(input.projectName ?? input.brand ?? "").trim() || DEFAULT_BRAND;
			const updatedAt = new Date().toISOString();
			await ensureSettingsTable(db);
			for (const key of ["project_name", "brand"]) {
				await db
					.prepare(
						`INSERT INTO app_settings (key, value, updated_at)
						 VALUES (?, ?, ?)
						 ON CONFLICT(key) DO UPDATE SET
								value = excluded.value,
								updated_at = excluded.updated_at`,
					)
					.bind(key, projectName, updatedAt)
					.run();
			}
			return { brand: projectName, projectName };
		},
		async listNodes() {
			const result = await db.prepare("SELECT * FROM nodes ORDER BY name ASC").all();
			return (result.results ?? []).map((row) => toNode(row as Record<string, unknown>));
		},
		async getNodeById(id) {
			const row = await db.prepare("SELECT * FROM nodes WHERE id = ?").bind(id).first();
			return row ? toNode(row as Record<string, unknown>) : null;
		},
		async saveNode(input) {
			const stamp = new Date().toISOString();
			const row = {
				id: input.id ?? crypto.randomUUID(),
				name: input.name ?? "New Node",
				protocol: input.protocol ?? "vless-reality",
				server: input.server ?? "",
				port: Number(input.port ?? 443),
				enabled: input.enabled ? 1 : 0,
				transport: input.transport ?? "tcp",
				ws_path: input.wsPath ?? "",
				uuid: input.uuid ?? "",
				password: input.password ?? "",
				public_key: input.publicKey ?? "",
				short_id: input.shortId ?? "",
				sni: input.sni ?? "",
				flow: input.flow ?? "xtls-rprx-vision",
				note: input.note ?? "",
				traffic_mode: input.trafficMode ?? "manual",
				traffic_quota_gb: input.trafficQuotaGb ?? null,
				traffic_used_gb: input.trafficUsedGb ?? null,
				traffic_reset_day: input.trafficResetDay ?? null,
				traffic_updated_at: input.trafficUpdatedAt ?? null,
				created_at: input.createdAt ?? stamp,
				updated_at: stamp,
			};
			await db
				.prepare(
					`INSERT INTO nodes (
						id, name, protocol, server, port, enabled, transport, ws_path, uuid, password,
						public_key, short_id, sni, flow, note,
						traffic_mode, traffic_quota_gb, traffic_used_gb, traffic_reset_day, traffic_updated_at,
						created_at, updated_at
					) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
					ON CONFLICT(id) DO UPDATE SET
						name=excluded.name,
						protocol=excluded.protocol,
						server=excluded.server,
						port=excluded.port,
						enabled=excluded.enabled,
						transport=excluded.transport,
						ws_path=excluded.ws_path,
						uuid=excluded.uuid,
						password=excluded.password,
						public_key=excluded.public_key,
						short_id=excluded.short_id,
						sni=excluded.sni,
						flow=excluded.flow,
						note=excluded.note,
						traffic_mode=excluded.traffic_mode,
						traffic_quota_gb=excluded.traffic_quota_gb,
						traffic_used_gb=excluded.traffic_used_gb,
						traffic_reset_day=excluded.traffic_reset_day,
						traffic_updated_at=excluded.traffic_updated_at,
						updated_at=excluded.updated_at`,
				)
				.bind(
					row.id,
					row.name,
					row.protocol,
					row.server,
					row.port,
					row.enabled,
					row.transport,
					row.ws_path,
					row.uuid,
					row.password,
					row.public_key,
					row.short_id,
					row.sni,
					row.flow,
					row.note,
					row.traffic_mode,
					row.traffic_quota_gb,
					row.traffic_used_gb,
					row.traffic_reset_day,
					row.traffic_updated_at,
					row.created_at,
					row.updated_at,
				)
				.run();
			const saved = await db.prepare("SELECT * FROM nodes WHERE id = ?").bind(row.id).first();
			return toNode(saved as Record<string, unknown>);
		},
		async deleteNode(id) {
			await db.prepare("DELETE FROM group_nodes WHERE node_id = ?").bind(id).run();
			await db.prepare("DELETE FROM checks WHERE node_id = ?").bind(id).run();
			await db.prepare("DELETE FROM nodes WHERE id = ?").bind(id).run();
		},
		async listGroups() {
			const groupsResult = await db.prepare("SELECT * FROM groups ORDER BY name ASC").all();
			const groups = (groupsResult.results ?? []).map((row) =>
				toGroup(row as Record<string, unknown>),
			);
			const membersResult = await db
				.prepare(
					`SELECT
						gm.group_id,
						gm.node_id,
						gm.display_name,
						gm.sort_order,
						n.id AS node_ref_id,
						n.name,
						n.protocol,
						n.server,
						n.port,
						n.enabled,
						n.transport,
						n.ws_path,
						n.uuid,
						n.password,
						n.public_key,
						n.short_id,
						n.sni,
						n.flow,
						n.note,
						n.traffic_mode,
						n.traffic_quota_gb,
						n.traffic_used_gb,
						n.traffic_reset_day,
						n.traffic_updated_at,
						n.created_at,
						n.updated_at
					FROM group_nodes gm
					LEFT JOIN nodes n ON n.id = gm.node_id
					ORDER BY gm.sort_order ASC`,
				)
				.all();
			const members = (membersResult.results ?? []).map((row) => ({
				groupId: String(row.group_id),
				nodeId: String(row.node_id),
				displayName: String(row.display_name ?? ""),
				sortOrder: Number(row.sort_order ?? 0),
				node: row.node_ref_id ? toNode(row as Record<string, unknown>) : null,
			}));
			return groups.map((group) => ({
				...group,
				members: members.filter((member) => member.groupId === group.id),
			}));
		},
		async saveGroup(input) {
			const stamp = new Date().toISOString();
			const row = {
				id: input.id ?? crypto.randomUUID(),
				name: input.name ?? "New Group",
				slug: input.slug ?? "new-group",
				enabled: input.enabled ? 1 : 0,
				subscription_token: input.subscriptionToken ?? crypto.randomUUID(),
				show_traffic_in_name: input.showTrafficInName ? 1 : 0,
				created_at: input.createdAt ?? stamp,
				updated_at: stamp,
			};
			await db
				.prepare(
					`INSERT INTO groups (
						id, name, slug, enabled, subscription_token, show_traffic_in_name, created_at, updated_at
					) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
					ON CONFLICT(id) DO UPDATE SET
						name=excluded.name,
						slug=excluded.slug,
						enabled=excluded.enabled,
						subscription_token=excluded.subscription_token,
						show_traffic_in_name=excluded.show_traffic_in_name,
						updated_at=excluded.updated_at`,
				)
				.bind(
					row.id,
					row.name,
					row.slug,
					row.enabled,
					row.subscription_token,
					row.show_traffic_in_name,
					row.created_at,
					row.updated_at,
				)
				.run();
			if (input.members) {
				await db.prepare("DELETE FROM group_nodes WHERE group_id = ?").bind(row.id).run();
				for (const member of input.members) {
					if (!member.nodeId) continue;
					await db
						.prepare(
							"INSERT INTO group_nodes (group_id, node_id, display_name, sort_order) VALUES (?, ?, ?, ?)",
						)
						.bind(
							row.id,
							member.nodeId,
							member.displayName ?? "",
							Number(member.sortOrder ?? 0),
						)
						.run();
				}
			}
			const groups = await this.listGroups();
			return groups.find((group) => group.id === row.id)!;
		},
		async deleteGroup(id) {
			await db.prepare("DELETE FROM group_nodes WHERE group_id = ?").bind(id).run();
			await db.prepare("DELETE FROM groups WHERE id = ?").bind(id).run();
		},
		async getGroupByToken(token) {
			const groups = await this.listGroups();
			return groups.find((group) => group.subscriptionToken === token) ?? null;
		},
		async listChecks() {
			const result = await db
				.prepare(
					`SELECT
						c.node_id,
						c.tcp_ok,
						c.latency_ms,
						c.last_error,
						c.checked_at,
						n.id AS node_ref_id,
						n.name,
						n.protocol,
						n.server,
						n.port,
						n.enabled,
						n.transport,
						n.ws_path,
						n.uuid,
						n.password,
						n.public_key,
						n.short_id,
						n.sni,
						n.flow,
						n.note,
						n.traffic_mode,
						n.traffic_quota_gb,
						n.traffic_used_gb,
						n.traffic_reset_day,
						n.traffic_updated_at,
						n.created_at,
						n.updated_at
					FROM checks c
					LEFT JOIN nodes n ON n.id = c.node_id
					ORDER BY c.checked_at DESC`,
				)
				.all();
			return (result.results ?? []).map((row) => ({
				nodeId: String(row.node_id),
				tcpOk: Boolean(row.tcp_ok),
				latencyMs:
					row.latency_ms === null || row.latency_ms === undefined
						? null
						: Number(row.latency_ms),
				lastError: String(row.last_error ?? ""),
				checkedAt: String(row.checked_at),
				node: row.node_ref_id ? toNode(row as Record<string, unknown>) : null,
			}));
		},
		async saveChecks(items) {
			for (const item of items) {
				await db
					.prepare(
						`INSERT INTO checks (node_id, tcp_ok, latency_ms, last_error, checked_at)
						VALUES (?, ?, ?, ?, ?)
						ON CONFLICT(node_id) DO UPDATE SET
							tcp_ok=excluded.tcp_ok,
							latency_ms=excluded.latency_ms,
							last_error=excluded.last_error,
							checked_at=excluded.checked_at`,
					)
					.bind(
						item.nodeId,
						item.tcpOk ? 1 : 0,
						item.latencyMs,
						item.lastError,
						item.checkedAt,
					)
					.run();
			}
		},
	};
}
