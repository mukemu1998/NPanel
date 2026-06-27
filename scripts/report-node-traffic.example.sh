#!/usr/bin/env bash
set -euo pipefail

# Replace these with your own values.
PANEL_BASE_URL="https://your-panel.example.com"
NODE_ID="replace-with-node-id"
REPORT_SECRET="replace-with-traffic-report-secret"
INITIAL_USED_GB="0"
BASELINE_FILE="/var/lib/npanel/node-traffic-baseline.bytes"

# Requires vnstat with JSON output support.
# This example reports the usage within the current billing cycle.
# For a one-year VPS plan, initialize BASELINE_FILE near the start of the service period,
# then reset that file when the provider traffic quota resets next year.
mkdir -p "$(dirname "${BASELINE_FILE}")"

TOTAL_BYTES="$(
  vnstat --json \
    | jq '[.interfaces[].traffic.total? | ((.tx // 0) + (.rx // 0))] | add // 0'
)"

if [[ ! -f "${BASELINE_FILE}" ]]; then
  printf '%s\n' "${TOTAL_BYTES}" > "${BASELINE_FILE}"
fi

BASELINE_BYTES="$(cat "${BASELINE_FILE}")"
DELTA_BYTES="$(( TOTAL_BYTES - BASELINE_BYTES ))"
if (( DELTA_BYTES < 0 )); then
  DELTA_BYTES=0
fi

USED_GB="$(
  python3 - <<PY
initial_used = float("${INITIAL_USED_GB}")
delta_gb = ${DELTA_BYTES} / 1024 / 1024 / 1024
print(f"{initial_used + delta_gb:.3f}")
PY
)"

PAYLOAD="$(
  jq -cn \
    --arg usedGb "${USED_GB}" \
    --arg updatedAt "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" \
    '{usedGb: ($usedGb | tonumber), updatedAt: $updatedAt}'
)"

curl -fsS \
  -X POST \
  -H "content-type: application/json" \
  -H "x-traffic-report-secret: ${REPORT_SECRET}" \
  "${PANEL_BASE_URL}/api/nodes/${NODE_ID}/traffic" \
  --data "${PAYLOAD}"

# Cron example (run at 06:00 every day in your billing timezone):
# CRON_TZ=UTC
# 0 6 * * * /usr/local/bin/report-node-traffic.sh >> /var/log/npanel-traffic.log 2>&1
