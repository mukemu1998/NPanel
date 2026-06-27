DELETE FROM checks;
DELETE FROM group_nodes;
DELETE FROM groups;
DELETE FROM nodes;

INSERT INTO nodes (
	id, name, protocol, server, port, enabled, transport, uuid, password,
	public_key, short_id, sni, flow, note,
	traffic_mode, traffic_quota_gb, traffic_used_gb, traffic_reset_day, traffic_updated_at,
	created_at, updated_at
) VALUES
(
	'node-primary-direct',
	'Primary Direct',
	'vless-reality',
	'203.0.113.10',
	443,
	1,
	'tcp',
	'11111111-1111-1111-1111-111111111111',
	'',
	'examplePublicKeyReplaceMe',
	'abcdef0123456789',
	'edge.example.com',
	'xtls-rprx-vision',
	'Demo primary direct node',
	'self-report',
	2048,
	11.12,
	1,
	'2026-06-17T03:06:12.000Z',
	'2026-06-16T00:00:00.000Z',
	'2026-06-16T00:00:00.000Z'
),
(
	'node-primary-relay',
	'Primary Relay',
	'vless-reality',
	'198.51.100.20',
	24443,
	1,
	'tcp',
	'11111111-1111-1111-1111-111111111111',
	'',
	'examplePublicKeyReplaceMe',
	'abcdef0123456789',
	'edge.example.com',
	'xtls-rprx-vision',
	'Demo relay node',
	'shared-report',
	2048,
	11.12,
	1,
	'2026-06-17T03:06:12.000Z',
	'2026-06-16T00:00:00.000Z',
	'2026-06-16T00:00:00.000Z'
);

INSERT INTO groups (
	id, name, slug, enabled, subscription_token, show_traffic_in_name, created_at, updated_at
) VALUES
(
	'group-starter',
	'Starter',
	'starter',
	1,
	'demo-starter-group',
	1,
	'2026-06-16T00:00:00.000Z',
	'2026-06-16T00:00:00.000Z'
);

INSERT INTO group_nodes (
	group_id, node_id, display_name, sort_order
) VALUES
(
	'group-starter',
	'node-primary-direct',
	'Primary-Direct',
	10
),
(
	'group-starter',
	'node-primary-relay',
	'Primary-Relay',
	20
);
