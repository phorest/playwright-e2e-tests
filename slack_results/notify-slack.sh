#!/usr/bin/env bash
# notify-slack.sh
# Sends Playwright test results to Slack

set -e

# -------------------------------
# Configuration
# -------------------------------
PLAYWRIGHT_RESULTS_FILE="playwright-report/json/test-results.json"
SLACK_WEBHOOK_URL="${SLACK_WEBHOOK_URL:-}"
CI_URL="${CI_URL:-}"
JOB_NAME="${JOB_NAME:-Playwright E2E Tests}"

# -------------------------------
# Prerequisites
# -------------------------------
if ! command -v jq &> /dev/null; then
  echo "❌ jq is required but not installed."
  exit 1
fi

if [[ -z "$SLACK_WEBHOOK_URL" ]]; then
  echo "❌ SLACK_WEBHOOK_URL not set."
  exit 1
fi

# -------------------------------
# Determine run status
# -------------------------------
if [[ "$1" == "success" ]]; then
  STATUS="SUCCESS"
  EMOJI="✅"
  COLOR="#2eb886"
elif [[ "$1" == "failure" ]]; then
  STATUS="FAILURE"
  EMOJI="❌"
  COLOR="#cc0000"
else
  STATUS="UNKNOWN"
  EMOJI="⚪️"
  COLOR="#aaaaaa"
fi

# -------------------------------
# Parse Playwright JSON results
# -------------------------------
TOTAL="N/A"
PASSED="N/A"
FAILED="N/A"

if [[ -f "$PLAYWRIGHT_RESULTS_FILE" ]]; then
  TOTAL=$(jq '.suites | map(.specs | length) | add' "$PLAYWRIGHT_RESULTS_FILE" 2>/dev/null || echo "N/A")
  PASSED=$(jq '[.suites[].specs[] | select(.ok == true)] | length' "$PLAYWRIGHT_RESULTS_FILE" 2>/dev/null || echo "N/A")
  FAILED=$(jq '[.suites[].specs[] | select(.ok == false)] | length' "$PLAYWRIGHT_RESULTS_FILE" 2>/dev/null || echo "N/A")
fi

# -------------------------------
# Build Slack payload
# -------------------------------
# Use a here-doc to avoid Bash parsing issues
read -r -d '' BLOCKS <<EOF
[
  { "type": "section", "text": { "type": "mrkdwn", "text": "$EMOJI *$JOB_NAME: $STATUS*" } },
  { "type": "section", "text": { "type": "mrkdwn", "text": "*Total:* $TOTAL | *Passed:* $PASSED | *Failed:* $FAILED" } }
]
EOF

# Add CI button if CI_URL is set
if [[ -n "$CI_URL" ]]; then
  read -r -d '' BUTTON_BLOCK <<EOF
[
  { "type": "actions", "elements": [ { "type": "button", "text": { "type": "plain_text", "text": "View CI Run" }, "url": "$CI_URL" } ] }
]
EOF
  BLOCKS=$(jq -n --argjson a "$BLOCKS" --argjson b "$BUTTON_BLOCK" '$a + $b')
fi

# Final payload
PAYLOAD=$(jq -n --argjson blocks "$BLOCKS" '{ blocks: $blocks }')

# -------------------------------
# Send notification to Slack
# -------------------------------
curl -s -X POST -H 'Content-type: application/json' --data "$PAYLOAD" "$SLACK_WEBHOOK_URL"

echo "📢 Slack notification sent: $EMOJI $STATUS"
