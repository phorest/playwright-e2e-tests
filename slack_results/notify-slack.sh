#!/usr/bin/env bash
set -e

JOB_NAME="${JOB_NAME:-Playwright E2E Tests}"
CI_URL="${CI_URL:-}"
PLAYWRIGHT_RESULTS_FILE="playwright-report/json/test-results.json"

if ! command -v jq &> /dev/null; then
  echo "❌ jq is required but not installed."
  exit 1
fi

if [[ -z "$SLACK_WEBHOOK_URL" ]]; then
  echo "❌ SLACK_WEBHOOK_URL not set."
  exit 1
fi

# --- Determine result ---
if [[ "$1" == "success" ]]; then
  STATUS="SUCCESS"
  EMOJI="✅"
elif [[ "$1" == "failure" ]]; then
  STATUS="FAILURE"
  EMOJI="❌"
else
  STATUS="UNKNOWN"
  EMOJI="⚪️"
fi

# --- Parse JSON ---
if [[ -f "$PLAYWRIGHT_RESULTS_FILE" ]]; then
  TOTAL=$(jq '.suites | map(.specs | length) | add' "$PLAYWRIGHT_RESULTS_FILE")
  PASSED=$(jq '[.suites[].specs[] | select(.ok == true)] | length' "$PLAYWRIGHT_RESULTS_FILE")
  FAILED=$(jq '[.suites[].specs[] | select(.ok == false)] | length' "$PLAYWRIGHT_RESULTS_FILE")
else
  TOTAL="N/A"
  PASSED="N/A"
  FAILED="N/A"
fi

# --- Build blocks using here-doc to avoid Bash parsing issues ---
read -r -d '' BLOCKS <<EOF
[
  { "type": "section", "text": { "type": "mrkdwn", "text": "$EMOJI *$JOB_NAME: $STATUS*" } },
  { "type": "section", "text": { "type": "mrkdwn", "text": "*Total:* $TOTAL | *Passed:* $PASSED | *Failed:* $FAILED" } }
]
EOF

# --- Add CI button if CI_URL is set ---
if [[ -n "$CI_URL" ]]; then
  read -r -d '' BUTTON_BLOCK <<EOF
[
  { "type": "actions", "elements": [ { "type": "button", "text": { "type": "plain_text", "text": "View CI Run" }, "url": "$CI_URL" } ] }
]
EOF
  BLOCKS=$(jq -n --argjson a "$BLOCKS" --argjson b "$BUTTON_BLOCK" '$a + $b')
fi

# --- Build final payload ---
PAYLOAD=$(jq -n --argjson blocks "$BLOCKS" '{ blocks: $blocks }')

# --- Send to Slack ---
curl -s -X POST -H 'Content-type: application/json' --data "$PAYLOAD" "$SLACK_WEBHOOK_URL"

echo "📢 Slack notification sent: $EMOJI $STATUS"
