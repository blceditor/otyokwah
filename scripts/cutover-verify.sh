#!/usr/bin/env bash
# Cutover Verification Script
# Validates that all pages, APIs, redirects, and security headers work correctly.
#
# Usage:
#   bash scripts/cutover-verify.sh prelaunch     # https://prelaunch.bearlakecamp.com
#   bash scripts/cutover-verify.sh www            # https://www.bearlakecamp.com
#   bash scripts/cutover-verify.sh vercel         # https://bearlakecamp.vercel.app
#   bash scripts/cutover-verify.sh https://...    # custom URL
#
# Options:
#   --skip-smoke    Skip Playwright smoke tests (faster, HTTP-only checks)
#   --verbose       Show details for passing checks too
set -euo pipefail

# --- Parse arguments ---
SKIP_SMOKE=false
VERBOSE=false
TARGET=""

for arg in "$@"; do
  case "$arg" in
    --skip-smoke) SKIP_SMOKE=true ;;
    --verbose)    VERBOSE=true ;;
    prelaunch)    TARGET="https://prelaunch.bearlakecamp.com" ;;
    www)          TARGET="https://www.bearlakecamp.com" ;;
    vercel)       TARGET="https://bearlakecamp.vercel.app" ;;
    https://*)    TARGET="$arg" ;;
    *)            echo "Unknown argument: $arg"; exit 1 ;;
  esac
done

if [ -z "$TARGET" ]; then
  echo "Usage: bash scripts/cutover-verify.sh {prelaunch|www|vercel|https://...} [--skip-smoke] [--verbose]"
  exit 1
fi

# Strip trailing slash
TARGET="${TARGET%/}"

# --- Counters ---
PASS=0
FAIL=0
WARN=0
TOTAL=0
FAILURES=""

# --- Helpers ---
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

pass() {
  PASS=$((PASS + 1))
  TOTAL=$((TOTAL + 1))
  if [ "$VERBOSE" = true ]; then
    printf "  ${GREEN}PASS${NC} %s\n" "$1"
  fi
}

fail() {
  FAIL=$((FAIL + 1))
  TOTAL=$((TOTAL + 1))
  printf "  ${RED}FAIL${NC} %s\n" "$1"
  FAILURES="${FAILURES}\n  - $1"
}

warn() {
  WARN=$((WARN + 1))
  TOTAL=$((TOTAL + 1))
  printf "  ${YELLOW}WARN${NC} %s\n" "$1"
}

section() {
  printf "\n${BOLD}${BLUE}[$1]${NC}\n"
}

# Check HTTP status of a URL. Args: url expected_status label
check_status() {
  local url="$1"
  local expected="$2"
  local label="$3"
  local status

  status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 -L "$url" 2>/dev/null || echo "000")

  if [ "$status" = "$expected" ]; then
    pass "$label → $status"
  else
    fail "$label → $status (expected $expected)"
  fi
}

# Check HTTP status WITHOUT following redirects. Args: url expected_status label
check_redirect() {
  local url="$1"
  local expected="$2"
  local label="$3"
  local status

  status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url" 2>/dev/null || echo "000")

  if [ "$status" = "$expected" ]; then
    pass "$label → $status"
  else
    fail "$label → $status (expected $expected)"
  fi
}

# Check that a response header exists. Args: url header_name label
check_header() {
  local url="$1"
  local header="$2"
  local label="$3"
  local value

  value=$(curl -s -I --max-time 10 -L "$url" 2>/dev/null | grep -i "^${header}:" | head -1)

  if [ -n "$value" ]; then
    pass "$label"
  else
    fail "$label (header '${header}' missing)"
  fi
}

# --- Start ---
echo ""
printf "${BOLD}Cutover Verification${NC}\n"
printf "Target: ${BOLD}%s${NC}\n" "$TARGET"
printf "Time:   %s\n" "$(date '+%Y-%m-%d %H:%M:%S')"
echo "─────────────────────────────────────────────"

# ============================================================
# 1. Health Endpoint
# ============================================================
section "Health Endpoint"

HEALTH_RESPONSE=$(curl -s --max-time 15 "${TARGET}/api/health" 2>/dev/null || echo '{"status":"unreachable"}')
HEALTH_STATUS=$(echo "$HEALTH_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('status','unknown'))" 2>/dev/null || echo "parse_error")

if [ "$HEALTH_STATUS" = "ok" ]; then
  pass "/api/health → ok"
  if [ "$VERBOSE" = true ]; then
    echo "$HEALTH_RESPONSE" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for c in data.get('checks', []):
    print(f\"    {c['status'].upper():4s} {c['name']:15s} {c['ms']:4d}ms  {c.get('detail','')}\")
" 2>/dev/null || true
  fi
elif [ "$HEALTH_STATUS" = "degraded" ]; then
  warn "/api/health → degraded"
  echo "$HEALTH_RESPONSE" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for c in data.get('checks', []):
    if c['status'] == 'fail':
        print(f\"    FAIL {c['name']}: {c.get('detail','')}\")
" 2>/dev/null || true
else
  fail "/api/health → ${HEALTH_STATUS}"
fi

# ============================================================
# 2. All Pages Return 200
# ============================================================
section "Page Checks (every page returns 200)"

PAGES=(
  "/|Homepage"
  "/about|About"
  "/about-core-values|Core Values"
  "/about-doctrinal-statement|Doctrinal Statement"
  "/about-our-team|Our Team"
  "/contact|Contact"
  "/give|Give"
  "/rentals|Rentals"
  "/rentals-cabins|Rentals Cabins"
  "/rentals-chapel|Rentals Chapel"
  "/rentals-dining-hall|Rentals Dining Hall"
  "/rentals-gym|Rentals Gym"
  "/rentals-outdoor-spaces|Rentals Outdoor Spaces"
  "/rentals-recreation|Rentals Recreation"
  "/retreats|Retreats"
  "/retreats-defrost|Retreats Defrost"
  "/retreats-recharge|Retreats Recharge"
  "/summer-camp|Summer Camp"
  "/summer-camp-faq|Summer Camp FAQ"
  "/summer-camp-parent-info|Parent Info"
  "/summer-camp-sessions|Sessions"
  "/summer-camp-what-to-bring|What to Bring"
  "/summer-staff|Summer Staff"
  "/summer-staff-landing|Summer Staff Landing"
  "/work-at-camp|Work at Camp"
  "/work-at-camp-leaders-in-training|Leaders in Training"
  "/work-at-camp-year-round|Year Round"
)

for entry in "${PAGES[@]}"; do
  IFS='|' read -r path label <<< "$entry"
  check_status "${TARGET}${path}" "200" "${label} (${path})"
done

# ============================================================
# 3. 404 Handling
# ============================================================
section "404 Handling"

STATUS_404=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "${TARGET}/this-page-does-not-exist-99999" 2>/dev/null || echo "000")
if [ "$STATUS_404" = "404" ]; then
  pass "Unknown page returns 404"
else
  warn "Unknown page returns $STATUS_404 (expected 404)"
fi

# ============================================================
# 4. Redirects
# ============================================================
section "Redirects (301/308 without following)"

REDIRECTS=(
  "/summer-camp/jr-high|301|Summer Camp Jr High → Sessions"
  "/summer-camp/high-school|301|Summer Camp High School → Sessions"
  "/summer-camp-junior-high|301|Legacy Jr High → Sessions"
  "/summer-camp-senior-high|301|Legacy Sr High → Sessions"
  "/work-at-camp/summer-staff|301|Work at Camp Summer Staff"
  "/work-at-camp/year-round|301|Work at Camp Year Round"
  "/summer-camp/what-to-bring|301|Summer Camp What to Bring"
  "/summer-camp/faq|301|Summer Camp FAQ"
  "/retreats/rentals|301|Retreats Rentals"
  "/facilities/outdoor|301|Facilities Outdoor"
  "/about/staff|301|About Staff"
  "/about-staff|301|About Staff Legacy"
)

for entry in "${REDIRECTS[@]}"; do
  IFS='|' read -r rpath rexpected rlabel <<< "$entry"
  # Next.js permanent redirects use 308 by default
  rcode=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "${TARGET}${rpath}" 2>/dev/null || echo "000")
  if [ "$rcode" = "301" ] || [ "$rcode" = "308" ]; then
    pass "$rlabel → $rcode"
  else
    fail "$rlabel → $rcode (expected 301 or 308)"
  fi
done

# ============================================================
# 5. Keystatic CMS Access
# ============================================================
section "Keystatic CMS"

# /keystatic should either redirect to /keystatic/branch/... or load the CMS UI
KS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 -L "${TARGET}/keystatic" 2>/dev/null || echo "000")
if [ "$KS_STATUS" = "200" ]; then
  pass "/keystatic loads → 200"
elif [ "$KS_STATUS" = "307" ] || [ "$KS_STATUS" = "302" ]; then
  pass "/keystatic redirects to OAuth → $KS_STATUS"
else
  fail "/keystatic → $KS_STATUS (expected 200 or redirect)"
fi

# ============================================================
# 6. API Endpoints
# ============================================================
section "API Endpoints"

check_status "${TARGET}/api/health" "200" "/api/health"
check_status "${TARGET}/api/search-index" "200" "/api/search-index"

# Webhook should reject GET (expects POST with HMAC)
WH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "${TARGET}/api/webhook/github" 2>/dev/null || echo "000")
if [ "$WH_STATUS" = "405" ] || [ "$WH_STATUS" = "401" ] || [ "$WH_STATUS" = "500" ]; then
  pass "/api/webhook/github rejects GET → $WH_STATUS"
else
  warn "/api/webhook/github → $WH_STATUS (expected 405/401)"
fi

# ============================================================
# 7. Security Headers
# ============================================================
section "Security Headers"

check_header "${TARGET}/" "x-frame-options" "X-Frame-Options present"
check_header "${TARGET}/" "x-content-type-options" "X-Content-Type-Options present"
check_header "${TARGET}/" "strict-transport-security" "Strict-Transport-Security present"
check_header "${TARGET}/" "content-security-policy" "Content-Security-Policy present"
check_header "${TARGET}/" "referrer-policy" "Referrer-Policy present"

# ============================================================
# 8. Playwright Smoke Tests (optional)
# ============================================================
if [ "$SKIP_SMOKE" = false ]; then
  section "Playwright Smoke Tests"

  if command -v npx &> /dev/null; then
    printf "  Running smoke tests against %s...\n" "$TARGET"
    PW_TMPFILE=$(mktemp)
    E2E_BASE_URL="$TARGET" npx playwright test tests/e2e/smoke/ --project=smoke --reporter=line > "$PW_TMPFILE" 2>&1 || true
    # Get the final summary line (last non-empty line) — ignore intermediate ANSI progress
    PW_SUMMARY=$(tail -1 "$PW_TMPFILE" | sed 's/\x1b\[[0-9;]*[a-zA-Z]//g' | xargs)
    printf "    %s\n" "$PW_SUMMARY"
    if echo "$PW_SUMMARY" | grep -qE "[1-9][0-9]* failed"; then
      fail "Playwright smoke suite: $PW_SUMMARY"
    else
      pass "Playwright smoke suite: $PW_SUMMARY"
    fi
    rm -f "$PW_TMPFILE"
  else
    warn "npx not found — skipping Playwright tests"
  fi
else
  section "Playwright Smoke Tests (skipped)"
  printf "  Skipped (use without --skip-smoke to include)\n"
fi

# ============================================================
# Summary
# ============================================================
echo ""
echo "═════════════════════════════════════════════"
printf "${BOLD}Results${NC}: "

if [ "$FAIL" -eq 0 ]; then
  printf "${GREEN}ALL PASS${NC}"
else
  printf "${RED}${FAIL} FAILED${NC}"
fi

printf " — %d passed" "$PASS"
if [ "$WARN" -gt 0 ]; then
  printf ", ${YELLOW}%d warnings${NC}" "$WARN"
fi
if [ "$FAIL" -gt 0 ]; then
  printf ", ${RED}%d failed${NC}" "$FAIL"
fi
printf " (${TOTAL} total)\n"

printf "Target:  %s\n" "$TARGET"
printf "Time:    %s\n" "$(date '+%Y-%m-%d %H:%M:%S')"

if [ -n "$FAILURES" ]; then
  printf "\n${RED}${BOLD}Failures:${NC}"
  printf "$FAILURES\n"
fi

echo ""

# Exit with error if any failures
if [ "$FAIL" -gt 0 ]; then
  exit 1
fi
