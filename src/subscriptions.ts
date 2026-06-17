import type { GroupWithMembers, NodeRecord } from "./types";

function base64EncodeUtf8(value: string): string {
	return btoa(unescape(encodeURIComponent(value)));
}

function encodeName(name: string): string {
	return encodeURIComponent(name);
}

function formatTrafficBadge(node: NodeRecord): string {
	if (node.trafficMode === "unlimited") {
		return "不限流";
	}
	const isShared = node.trafficMode === "shared-report";
	const prefix = isShared ? "共享流量 " : "";
	if (node.trafficQuotaGb != null && node.trafficUsedGb != null) {
		const remaining = Math.max(0, node.trafficQuotaGb - node.trafficUsedGb);
		return `${prefix}余 ${remaining.toFixed(1)}GB`;
	}
	if (node.trafficUsedGb != null) {
		return `${prefix}已用 ${node.trafficUsedGb.toFixed(1)}GB`;
	}
	return isShared ? "共享流量" : "流量未知";
}

function renderNodeName(
	groupName: string,
	node: NodeRecord,
	override: string,
	showTrafficInName = false,
): string {
	const baseName = override.trim() || `${groupName}-${node.name}`;
	return showTrafficInName ? `${baseName} | ${formatTrafficBadge(node)}` : baseName;
}

function renderVlessRealityLink(node: NodeRecord, displayName: string): string {
	return [
		`vless://${node.uuid}@${node.server}:${node.port}`,
		`?encryption=none`,
		`&flow=${encodeURIComponent(node.flow || "xtls-rprx-vision")}`,
		`&security=reality`,
		`&sni=${encodeURIComponent(node.sni)}`,
		`&fp=chrome`,
		`&pbk=${encodeURIComponent(node.publicKey)}`,
		`&sid=${encodeURIComponent(node.shortId)}`,
		`&type=${encodeURIComponent(node.transport || "tcp")}`,
		`&headerType=none#${encodeName(displayName)}`,
	].join("");
}

function renderVlessLink(node: NodeRecord, displayName: string): string {
	return [
		`vless://${node.uuid}@${node.server}:${node.port}`,
		`?encryption=none`,
		`&security=tls`,
		`&sni=${encodeURIComponent(node.sni)}`,
		`&type=${encodeURIComponent(node.transport || "tcp")}#${encodeName(displayName)}`,
	].join("");
}

function renderTrojanLink(node: NodeRecord, displayName: string): string {
	return [
		`trojan://${encodeURIComponent(node.password)}@${node.server}:${node.port}`,
		`?sni=${encodeURIComponent(node.sni)}`,
		`&type=${encodeURIComponent(node.transport || "tcp")}#${encodeName(displayName)}`,
	].join("");
}

export function buildV2rayNSubscription(group: GroupWithMembers): string {
	const lines = group.members
		.filter((member) => member.node?.enabled)
		.map((member) => {
			const node = member.node!;
			const displayName = renderNodeName(group.name, node, member.displayName, group.showTrafficInName);
			switch (node.protocol) {
				case "vless-reality":
					return renderVlessRealityLink(node, displayName);
				case "vless":
					return renderVlessLink(node, displayName);
				case "trojan":
					return renderTrojanLink(node, displayName);
				default:
					return "";
			}
		})
		.filter(Boolean)
		.join("\n");
	return base64EncodeUtf8(lines);
}

function yamlEscape(value: string): string {
	return `'${value.replace(/'/g, "''")}'`;
}

function renderClashProxy(node: NodeRecord, displayName: string): string[] {
	switch (node.protocol) {
		case "vless-reality":
			return [
				`  - name: ${yamlEscape(displayName)}`,
				`    type: vless`,
				`    server: ${node.server}`,
				`    port: ${node.port}`,
				`    uuid: ${yamlEscape(node.uuid)}`,
				`    network: ${node.transport || "tcp"}`,
				`    tls: true`,
				`    udp: true`,
				`    flow: ${yamlEscape(node.flow || "xtls-rprx-vision")}`,
				`    servername: ${yamlEscape(node.sni)}`,
				`    reality-opts:`,
				`      public-key: ${yamlEscape(node.publicKey)}`,
				`      short-id: ${yamlEscape(node.shortId)}`,
				`    client-fingerprint: chrome`,
			];
		case "trojan":
			return [
				`  - name: ${yamlEscape(displayName)}`,
				`    type: trojan`,
				`    server: ${node.server}`,
				`    port: ${node.port}`,
				`    password: ${yamlEscape(node.password)}`,
				`    sni: ${yamlEscape(node.sni)}`,
				`    udp: true`,
			];
		case "vless":
			return [
				`  - name: ${yamlEscape(displayName)}`,
				`    type: vless`,
				`    server: ${node.server}`,
				`    port: ${node.port}`,
				`    uuid: ${yamlEscape(node.uuid)}`,
				`    network: ${node.transport || "tcp"}`,
				`    tls: true`,
				`    servername: ${yamlEscape(node.sni)}`,
				`    udp: true`,
			];
		default:
			return [];
	}
}

export function buildClashSubscription(group: GroupWithMembers, profileName = group.name): string {
	const members = group.members.filter((member) => member.node?.enabled);
	const names = members.map((member) =>
		yamlEscape(renderNodeName(group.name, member.node!, member.displayName, group.showTrafficInName)),
	);
	const proxyLines = members.flatMap((member) =>
		renderClashProxy(
			member.node!,
			renderNodeName(group.name, member.node!, member.displayName, group.showTrafficInName),
		),
	);
	return [
		`name: ${yamlEscape(profileName)}`,
		`mixed-port: 7890`,
		`allow-lan: false`,
		`mode: rule`,
		`log-level: info`,
		`proxies:`,
		...proxyLines,
		`proxy-groups:`,
		`  - name: ${yamlEscape(group.name)}`,
		`    type: select`,
		`    proxies: [${names.join(", ")}]`,
		`rules:`,
		`  - ${yamlEscape(`MATCH,${group.name}`)}`,
	].join("\n");
}
