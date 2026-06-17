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
	'node-us-reality',
	'US Reality',
	'vless-reality',
	'203.0.113.10',
	443,
	1,
	'tcp',
	'11111111-1111-1111-1111-111111111111',
	'',
	'examplePublicKeyReplaceMe',
	'abcdef0123456789',
	'www.microsoft.com',
	'xtls-rprx-vision',
	'Demo direct US node',
	'self-report',
	2048,
	11.12,
	1,
	'2026-06-17T03:06:12.000Z',
	'2026-06-16T00:00:00.000Z',
	'2026-06-16T00:00:00.000Z'
),
(
	'node-us-via-hk',
	'US via HK',
	'vless-reality',
	'198.51.100.20',
	24443,
	1,
	'tcp',
	'11111111-1111-1111-1111-111111111111',
	'',
	'examplePublicKeyReplaceMe',
	'abcdef0123456789',
	'www.microsoft.com',
	'xtls-rprx-vision',
	'Demo HK relay to US',
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
	'group-gemini',
	'Gemini',
	'gemini',
	1,
	'demo-gemini-group',
	1,
	'2026-06-16T00:00:00.000Z',
	'2026-06-16T00:00:00.000Z'
);

INSERT INTO group_nodes (
	group_id, node_id, display_name, sort_order
) VALUES
(
	'group-gemini',
	'node-us-reality',
	'US-Gemini-Reality',
	10
),
(
	'group-gemini',
	'node-us-via-hk',
	'US-Gemini-via-HK',
	20
);
