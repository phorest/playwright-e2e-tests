#!/usr/bin/env bash
# notify-slack.sh
# Sends Playwright test results to Slack

set -e

JOB_NAME="${JOB_NAME:-Playwright E2E Tests}"
CI_URL="${CI_URL:-}"
PLAYWRIGHT_RESULTS_FILE="playwright-report/json/test-results.json"

# --- Check dependencies ---
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
  STATUS="✅ SUCCESS"
  COLOR="#2eb886"
elif [[ "$1" == "failure" ]]; then
  STATUS="❌ FAILURE"
  COLOR="#cc0000"
else
  STATUS="⚪️ UNKNOWN"
  COLOR="#aaaaaa"
fi

# --- Parse Playwright JSON ---
if [[ -f "$PLAYWRIGHT_RESULTS_FILE" ]]; then
  TOTAL=$(jq '.suites | map(.specs | length) | add' "$PLAYWRIGHT_RESULTS_FILE")
  PASSED=$(jq '[.suites[].specs[] | select(.ok == true)] | length' "$PLAYWRIGHT_RESULTS_FILE")
  FAILED=$(jq '[.suites[].specs[] | select(.ok == false)] | length' "$PLAYWRIGHT_RESULTS_FILE")
else
  TOTAL="N/A"
  PASSED="N/A"
  FAILED="N/A"
fi

# --- Build Slack payload ---
PAYLOAD=$(jq -n \
  --arg color "$COLOR" \
  --arg title "$JOB_NAME: $STATUS" \
  --arg text "Total: $TOTAL | Passed: $PASSED | Failed: $FAILED" \
  --arg url "$CI_URL" \
  --argjson ts "$(date +%s)" \
  '{
    attachments: [{
      color: $color,
      title: $title,
      text: $text,
      footer: "Playwright E2E",
      footer_icon: "https://playwright.dev/img/playwright-logo.svg",
      actions: (if $url != "" then [{type: "button", text: "View CI Run", url: $url}] else [] end),
      ts: $ts
    }]
  }'
)

# --- Send payload to Slack ---
curl -s -X POST -H 'Content-type: application/json' --data "$PAYLOAD" "$SLACK_WEBHOOK_URL"

echo "📢 Slack notification sent: $STATUS"
