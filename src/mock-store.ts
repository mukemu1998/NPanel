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

const now = () => new Date().toISOString();
const DEFAULT_BRAND = "NPanel";

const mockState: {
	settings: AppSettings;
	nodes: NodeRecord[];
	groups: GroupRecord[];
	groupMembers: GroupMemberRecord[];
	checks: CheckRecord[];
} = {
	settings: {
		brand: DEFAULT_BRAND,
	},
	nodes: [
		{
			id: "node-us-reality",
			name: "US Reality",
			protocol: "vless-reality",
			server: "203.0.113.10",
			port: 443,
			enabled: true,
			transport: "tcp",
			uuid: "11111111-1111-1111-1111-111111111111",
			password: "",
			publicKey: "examplePublicKeyReplaceMe",
			shortId: "abcdef0123456789",
			sni: "www.microsoft.com",
			flow: "xtls-rprx-vision",
			note: "Demo direct US node",
			trafficMode: "self-report",
			trafficQuotaGb: 2048,
			trafficUsedGb: 11.12,
			trafficResetDay: 1,
			trafficUpdatedAt: now(),
			createdAt: now(),
			updatedAt: now(),
		},
		{
			id: "node-us-via-hk",
			name: "US via HK",
			protocol: "vless-reality",
			server: "198.51.100.20",
			port: 24443,
			enabled: true,
			transport: "tcp",
			uuid: "11111111-1111-1111-1111-111111111111",
			password: "",
			publicKey: "examplePublicKeyReplaceMe",
			shortId: "abcdef0123456789",
			sni: "www.microsoft.com",
			flow: "xtls-rprx-vision",
			note: "Demo HK relay to US",
			trafficMode: "shared-report",
			trafficQuotaGb: 2048,
			trafficUsedGb: 11.12,
			trafficResetDay: 1,
			trafficUpdatedAt: now(),
			createdAt: now(),
			updatedAt: now(),
		},
	],
	groups: [
		{
			id: "group-gemini",
			name: "Gemini",
			slug: "gemini",
			enabled: true,
			subscriptionToken: "demo-gemini-group",
			showTrafficInName: true,
			createdAt: now(),
			updatedAt: now(),
		},
	],
	groupMembers: [
		{
			groupId: "group-gemini",
			nodeId: "node-us-reality",
			displayName: "US-Gemini-Reality",
			sortOrder: 10,
		},
		{
			groupId: "group-gemini",
			nodeId: "node-us-via-hk",
			displayName: "US-Gemini-via-HK",
			sortOrder: 20,
		},
	],
	checks: [],
};

function buildGroup(group: GroupRecord): GroupWithMembers {
	const members = mockState.groupMembers
		.filter((member) => member.groupId === group.id)
		.sort((a, b) => a.sortOrder - b.sortOrder)
		.map((member) => ({
			...member,
			node: mockState.nodes.find((node) => node.id === member.nodeId) ?? null,
		}));
	return { ...group, members };
}

function ensureNode(input: Partial<NodeRecord>): NodeRecord {
	const stamp = now();
	return {
		id: input.id ?? crypto.randomUUID(),
		name: input.name ?? "New Node",
		protocol: (input.protocol as NodeRecord["protocol"]) ?? "vless-reality",
		server: input.server ?? "",
		port: Number(input.port ?? 443),
		enabled: Boolean(input.enabled ?? true),
		transport: input.transport ?? "tcp",
		uuid: input.uuid ?? "",
		password: input.password ?? "",
		publicKey: input.publicKey ?? "",
		shortId: input.shortId ?? "",
		sni: input.sni ?? "",
		flow: input.flow ?? "xtls-rprx-vision",
		note: input.note ?? "",
		trafficMode: (input.trafficMode as NodeRecord["trafficMode"]) ?? "manual",
		trafficQuotaGb:
			input.trafficQuotaGb === null || input.trafficQuotaGb === undefined
				? null
				: Number(input.trafficQuotaGb),
		trafficUsedGb:
			input.trafficUsedGb === null || input.trafficUsedGb === undefined
				? null
				: Number(input.trafficUsedGb),
		trafficResetDay:
			input.trafficResetDay === null || input.trafficResetDay === undefined
				? null
				: Number(input.trafficResetDay),
		trafficUpdatedAt: input.trafficUpdatedAt ?? null,
		createdAt: input.createdAt ?? stamp,
		updatedAt: stamp,
	};
}

function ensureGroup(
	input: Partial<GroupRecord> & { members?: Array<Partial<GroupMemberRecord>> },
): GroupRecord {
	const stamp = now();
	return {
		id: input.id ?? crypto.randomUUID(),
		name: input.name ?? "New Group",
		slug: input.slug ?? "new-group",
		enabled: Boolean(input.enabled ?? true),
		subscriptionToken: input.subscriptionToken ?? crypto.randomUUID(),
		showTrafficInName: Boolean(input.showTrafficInName ?? false),
		createdAt: input.createdAt ?? stamp,
		updatedAt: stamp,
	};
}

export function createMockStore(): AppStore {
	return {
		mode: "mock",
		async getSummary(): Promise<DashboardSummary> {
			return {
				nodeCount: mockState.nodes.length,
				groupCount: mockState.groups.length,
				activeNodeCount: mockState.nodes.filter((node) => node.enabled).length,
				storageMode: "mock",
				lastCheckAt:
					mockState.checks
						.map((item) => item.checkedAt)
						.sort()
				.at(-1) ?? null,
			};
		},
		async getSettings() {
			return { ...mockState.settings };
		},
		async saveSettings(input) {
			mockState.settings = {
				brand: String(input.brand ?? "").trim() || DEFAULT_BRAND,
			};
			return { ...mockState.settings };
		},
		async listNodes() {
			return [...mockState.nodes].sort((a, b) => a.name.localeCompare(b.name));
		},
		async getNodeById(id) {
			return mockState.nodes.find((node) => node.id === id) ?? null;
		},
		async saveNode(input) {
			const next = ensureNode(input);
			const index = mockState.nodes.findIndex((node) => node.id === next.id);
			if (index >= 0) {
				next.createdAt = mockState.nodes[index].createdAt;
				mockState.nodes[index] = next;
			} else {
				mockState.nodes.push(next);
			}
			return next;
		},
		async deleteNode(id) {
			mockState.nodes = mockState.nodes.filter((node) => node.id !== id);
			mockState.groupMembers = mockState.groupMembers.filter((item) => item.nodeId !== id);
			mockState.checks = mockState.checks.filter((item) => item.nodeId !== id);
		},
		async listGroups() {
			return mockState.groups
				.map(buildGroup)
				.sort((a, b) => a.name.localeCompare(b.name));
		},
		async saveGroup(input) {
			const next = ensureGroup(input);
			const index = mockState.groups.findIndex((group) => group.id === next.id);
			if (index >= 0) {
				next.createdAt = mockState.groups[index].createdAt;
				mockState.groups[index] = next;
			} else {
				mockState.groups.push(next);
			}

			if (input.members) {
				mockState.groupMembers = mockState.groupMembers.filter(
					(item) => item.groupId !== next.id,
				);
				for (const member of input.members) {
					if (!member.nodeId) continue;
					mockState.groupMembers.push({
						groupId: next.id,
						nodeId: member.nodeId,
						displayName: member.displayName ?? "",
						sortOrder: Number(member.sortOrder ?? 0),
					});
				}
			}

			return buildGroup(next);
		},
		async deleteGroup(id) {
			mockState.groups = mockState.groups.filter((group) => group.id !== id);
			mockState.groupMembers = mockState.groupMembers.filter((item) => item.groupId !== id);
		},
		async getGroupByToken(token) {
			const group = mockState.groups.find((item) => item.subscriptionToken === token);
			return group ? buildGroup(group) : null;
		},
		async listChecks() {
			return mockState.checks
				.map((item) => ({
					...item,
					node: mockState.nodes.find((node) => node.id === item.nodeId) ?? null,
				}))
				.sort((a, b) => b.checkedAt.localeCompare(a.checkedAt));
		},
		async saveChecks(items) {
			for (const item of items) {
				const index = mockState.checks.findIndex((check) => check.nodeId === item.nodeId);
				if (index >= 0) {
					mockState.checks[index] = item;
				} else {
					mockState.checks.push(item);
				}
			}
		},
	};
}
