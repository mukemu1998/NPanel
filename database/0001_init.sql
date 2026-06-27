CREATE TABLE IF NOT EXISTS nodes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  protocol TEXT NOT NULL,
  server TEXT NOT NULL,
  port INTEGER NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  transport TEXT NOT NULL DEFAULT 'tcp',
  ws_path TEXT NOT NULL DEFAULT '',
  uuid TEXT NOT NULL DEFAULT '',
  password TEXT NOT NULL DEFAULT '',
  public_key TEXT NOT NULL DEFAULT '',
  short_id TEXT NOT NULL DEFAULT '',
  sni TEXT NOT NULL DEFAULT '',
  flow TEXT NOT NULL DEFAULT '',
  note TEXT NOT NULL DEFAULT '',
  traffic_mode TEXT NOT NULL DEFAULT 'manual',
  traffic_quota_gb REAL,
  traffic_used_gb REAL,
  traffic_reset_day INTEGER,
  traffic_updated_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  enabled INTEGER NOT NULL DEFAULT 1,
  subscription_token TEXT NOT NULL UNIQUE,
  show_traffic_in_name INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS group_nodes (
  group_id TEXT NOT NULL,
  node_id TEXT NOT NULL,
  display_name TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (group_id, node_id),
  FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
  FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS checks (
  node_id TEXT PRIMARY KEY,
  tcp_ok INTEGER NOT NULL DEFAULT 0,
  latency_ms INTEGER,
  last_error TEXT NOT NULL DEFAULT '',
  checked_at TEXT NOT NULL,
  FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE
);
