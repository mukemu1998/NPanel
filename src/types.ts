export type NodeProtocol = "vless-reality" | "vless" | "trojan";
export type NodeTrafficMode = "unlimited" | "self-report" | "shared-report" | "manual";

export interface NodeRecord {
	id: string;
	name: string;
	protocol: NodeProtocol;
	server: string;
	port: number;
	enabled: boolean;
	transport: string;
	uuid: string;
	password: string;
	publicKey: string;
	shortId: string;
	sni: string;
	flow: string;
	note: string;
	trafficMode: NodeTrafficMode;
	trafficQuotaGb: number | null;
	trafficUsedGb: number | null;
	trafficResetDay: number | null;
	trafficUpdatedAt: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface GroupRecord {
	id: string;
	name: string;
	slug: string;
	enabled: boolean;
	subscriptionToken: string;
	showTrafficInName: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface GroupMemberRecord {
	groupId: string;
	nodeId: string;
	displayName: string;
	sortOrder: number;
}

export interface CheckRecord {
	nodeId: string;
	tcpOk: boolean;
	latencyMs: number | null;
	lastError: string;
	checkedAt: string;
}

export interface GroupWithMembers extends GroupRecord {
	members: Array<GroupMemberRecord & { node: NodeRecord | null }>;
}

export interface DashboardSummary {
	nodeCount: number;
	groupCount: number;
	activeNodeCount: number;
	storageMode: "mock" | "d1";
	lastCheckAt: string | null;
}

export interface AppSettings {
	brand: string;
}

export interface AppStore {
	mode: "mock" | "d1";
	getSummary(): Promise<DashboardSummary>;
	getSettings(): Promise<AppSettings>;
	saveSettings(input: Partial<AppSettings>): Promise<AppSettings>;
	listNodes(): Promise<NodeRecord[]>;
	getNodeById(id: string): Promise<NodeRecord | null>;
	saveNode(input: Partial<NodeRecord>): Promise<NodeRecord>;
	deleteNode(id: string): Promise<void>;
	listGroups(): Promise<GroupWithMembers[]>;
	saveGroup(
		input: Partial<GroupRecord> & {
			members?: Array<Partial<GroupMemberRecord>>;
		},
	): Promise<GroupWithMembers>;
	deleteGroup(id: string): Promise<void>;
	getGroupByToken(token: string): Promise<GroupWithMembers | null>;
	listChecks(): Promise<Array<CheckRecord & { node: NodeRecord | null }>>;
	saveChecks(items: CheckRecord[]): Promise<void>;
}
