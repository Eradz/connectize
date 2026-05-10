#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPORT_ROOT="${REPORT_ROOT:-$ROOT_DIR/reports/release_tests}"
REPORT_DIR="${REPORT_DIR:-$REPORT_ROOT/$(date -u +"%Y%m%dT%H%M%SZ")}"

mkdir -p "$REPORT_DIR"
cd "$ROOT_DIR"

printf 'Connectize web release test\n'
printf 'Reports: %s\n' "$REPORT_DIR"
printf 'Web URL: %s\n' "${WEB_BASE_URL:-https://connectize.co}"
printf 'API URL: %s\n' "${API_BASE_URL:-${BASE_URL:-https://about.connectize.co}}"

run_step() {
  local name="$1"
  shift
  local log_file="$REPORT_DIR/${name}.log"

  printf '\n==> %s\n' "$name"
  "$@" 2>&1 | tee "$log_file"
}

if [[ "${RUN_WEB_BUILD:-1}" == "1" ]]; then
  run_step web-build npm run build
fi

if [[ "${INSTALL_PLAYWRIGHT_BROWSERS:-0}" == "1" ]]; then
  run_step playwright-install npx playwright install chromium
fi

if [[ "${RUN_PLAYWRIGHT:-1}" == "1" ]]; then
  run_step playwright-production-smoke \
    env \
      WEB_BASE_URL="${WEB_BASE_URL:-https://connectize.co}" \
      API_BASE_URL="${API_BASE_URL:-${BASE_URL:-https://about.connectize.co}}" \
      CONNECTIZE_EMAIL="${CONNECTIZE_EMAIL:-}" \
      CONNECTIZE_PASSWORD="${CONNECTIZE_PASSWORD:-}" \
      CONNECTIZE_ACCESS_TOKEN="${CONNECTIZE_ACCESS_TOKEN:-}" \
      WEB_API_TARGET_MS="${WEB_API_TARGET_MS:-1000}" \
      npx playwright test --output "$REPORT_DIR/playwright-results"
fi

printf '\nWeb release test complete. Reports saved in %s\n' "$REPORT_DIR"
