import { connect } from "cloudflare:sockets";
import type { CheckRecord, NodeRecord } from "./types";

export async function runTcpChecks(nodes: NodeRecord[]): Promise<CheckRecord[]> {
	const results = await Promise.all(nodes.filter((node) => node.enabled).map(runSingleCheck));
	return results;
}

async function runSingleCheck(node: NodeRecord): Promise<CheckRecord> {
	const startedAt = Date.now();
	let socket: ReturnType<typeof connect> | null = null;
	try {
		socket = connect({
			hostname: node.server,
			port: node.port,
		});
		await Promise.race([
			socket.opened,
			timeoutAfter(5000, `Timed out connecting to ${node.server}:${node.port}`),
		]);
		socket.close();
		return {
			nodeId: node.id,
			tcpOk: true,
			latencyMs: Date.now() - startedAt,
			lastError: "",
			checkedAt: new Date().toISOString(),
		};
	} catch (error) {
		try {
			socket?.close();
		} catch {
			// Ignore close failures after connect errors.
		}
		return {
			nodeId: node.id,
			tcpOk: false,
			latencyMs: null,
			lastError: error instanceof Error ? error.message : "Unknown TCP check error",
			checkedAt: new Date().toISOString(),
		};
	}
}

function timeoutAfter(ms: number, message: string): Promise<never> {
	return new Promise((_, reject) => {
		setTimeout(() => reject(new Error(message)), ms);
	});
}
