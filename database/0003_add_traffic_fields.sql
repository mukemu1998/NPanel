ALTER TABLE nodes ADD COLUMN traffic_mode TEXT NOT NULL DEFAULT 'manual';
ALTER TABLE nodes ADD COLUMN traffic_quota_gb REAL;
ALTER TABLE nodes ADD COLUMN traffic_used_gb REAL;
ALTER TABLE nodes ADD COLUMN traffic_reset_day INTEGER;
ALTER TABLE nodes ADD COLUMN traffic_updated_at TEXT;

ALTER TABLE groups ADD COLUMN show_traffic_in_name INTEGER NOT NULL DEFAULT 0;
