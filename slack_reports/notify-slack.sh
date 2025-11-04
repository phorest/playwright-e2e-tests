#!/usr/bin/env bash
# notify-slack.sh
# Sends Playwright test results to Slack

set -e

# --- Configuration ---
PLAYWRIGHT_RESULTS_FILE="playwright-report/test-results.json"
SLACK_WEBHOOK_URL="${SLACK_WEBHOOK_URL:-}"
JOB_NAME="${JOB_NAME:-Playwright E2E Tests}"
CI_URL="${CI_URL:-}"

if [[ -z "$SLACK_WEBHOOK_URL" ]]; then
  echo "❌ SLACK_WEBHOOK_URL not set."
  exit 1
fi

# --- Determine result ---
if [[ "$1" == "success" ]]; then
  STATUS="✅ SUCCESS"
  COLOR="#2eb886"
elif [[ "$1" == "failure" ]]; then
  STATUS="❌ FAILURE"
  COLOR="#cc0000"
else
  STATUS="⚪️ UNKNOWN"
  COLOR="#aaaaaa"
fi

# Optional: Count test results from JSON (if available)
if [[ -f "$PLAYWRIGHT_RESULTS_FILE" ]]; then
  TOTAL=$(jq '.suites | map(.specs | length) | add' "$PLAYWRIGHT_RESULTS_FILE")
  PASSED=$(jq '[.suites[].specs[] | select(.ok == true)] | length' "$PLAYWRIGHT_RESULTS_FILE")
  FAILED=$(jq '[.suites[].specs[] | select(.ok == false)] | length' "$PLAYWRIGHT_RESULTS_FILE")
else
  TOTAL="N/A"; PASSED="N/A"; FAILED="N/A"
fi

# --- Message payload ---
read -r -d '' PAYLOAD <<EOF
{
  "attachments": [
    {
      "color": "$COLOR",
      "title": "$JOB_NAME: $STATUS",
      "text": "Total: $TOTAL | Passed: $PASSED | Failed: $FAILED",
      "footer": "Playwright E2E",
      "footer_icon": "https://playwright.dev/img/playwright-logo.svg",
      "actions": [
        {
          "type": "button",
          "text": "View CI Run",
          "url": "$CI_URL"
        }
      ],
      "ts": $(date +%s)
    }
  ]
}
EOF

# --- Send to Slack ---
curl -X POST -H 'Content-type: application/json' \
     --data "$PAYLOAD" "$SLACK_WEBHOOK_URL"

echo "📢 Slack notification sent: $STATUS"
