# Smoke Test System Design

**Version**: 1.0
**Date**: 2025-12-05
**Status**: Strategic Design (Pre-Implementation)

---

## Executive Summary

Fast, repeatable curl-based smoke test system that validates production deployments by testing all pages discovered from navigation.yaml against live Vercel builds. Optimized for speed (parallel execution), simplicity (bash + curl), and build-aware caching to avoid redundant testing.

**Key Metrics**:
- Target: <30 seconds for full site test (20 pages × ~1s/page with parallelization)
- Zero dependencies beyond curl, jq, yq (ubiquitous tools)
- Build-aware: Skip testing if current Vercel build already validated

---

## System Architecture

### Components

```
┌─────────────────────────────────────────────────────┐
│ scripts/smoke-test.sh                               │
│ - Parse navigation.yaml → extract all hrefs         │
│ - Get current Vercel build ID                       │
│ - Check cache: tested this build?                   │
│ - Parallel curl tests (status + content validation) │
│ - Generate JSON + human-readable output             │
└─────────────────────────────────────────────────────┘
          │                            │
          ▼                            ▼
┌──────────────────┐        ┌──────────────────────┐
│ .cache/smoke/    │        │ logs/smoke/          │
│ last-tested-     │        │ smoke-{timestamp}-   │
│ {domain}.json    │        │ {buildID}.json       │
│ - buildID        │        │ - Full test results  │
│ - timestamp      │        │ - AI-debuggable      │
│ - pass %         │        │ - Retention: 30 days │
└──────────────────┘        └──────────────────────┘
```

### Technology Stack

| Layer | Tool | Rationale |
|-------|------|-----------|
| **HTTP Client** | `curl` | Fast, ubiquitous, scriptable |
| **YAML Parser** | `yq` | Extracts hrefs from navigation.yaml |
| **JSON Generator** | `jq` | Structured output for CI/AI parsing |
| **Parallelization** | `xargs -P` | Concurrent tests (10-20 workers) |
| **Build Detection** | `vercel` CLI | Get current production build ID |
| **Caching** | Filesystem (`.cache/`) | Simple, version-controlled |

**No external dependencies** (Python, Node test frameworks, etc.) — pure shell efficiency.

---

## Test Discovery & Execution Flow

### Phase 1: Discovery (Two-Source Test Case Generation)

**Sources**:
1. `/Users/travis/SparkryGDrive/dev/bearlakecamp/content/navigation/navigation.yaml` (navigation links)
2. `/Users/travis/SparkryGDrive/dev/bearlakecamp/content/pages/*.mdoc` (actual page slugs)

**Discovery Strategy**:
```bash
# Source 1: Extract navigation hrefs
yq eval '.menuItems[] | .. | select(has("href")) | .href' navigation.yaml | \
  grep -v "^http" > /tmp/nav-pages.txt

# Source 2: Discover all actual page slugs from content files
find content/pages -name "*.mdoc" | \
  sed 's|content/pages/||; s|\.mdoc$||; s|index|/|' | \
  sed 's|^|/|; s|^//|/|' > /tmp/content-pages.txt

# Merge and dedupe both sources
cat /tmp/nav-pages.txt /tmp/content-pages.txt | sort -u > /tmp/all-pages.txt

# Identify navigation links that don't have corresponding content files
comm -23 /tmp/nav-pages.txt /tmp/content-pages.txt > /tmp/broken-nav.txt
```

**Expected Output** (merged and deduped):
```
/
/about
/contact
/facilities
/facilities-cabins
/facilities-chapel
/facilities-dining-hall
/facilities-outdoor
/facilities-rec-center
/give
/retreats
/retreats-adult-retreats
/retreats-rentals
/retreats-youth-groups
/summer-camp
/summer-camp-faq
/summer-camp-junior-high
/summer-camp-senior-high
/summer-camp-what-to-bring
/summer-staff
/work-at-camp
/work-at-camp-counselors
/work-at-camp-kitchen-staff
/work-at-camp-year-round
```

**Total**: ~24 pages (actual content files discovered)

**Navigation Validation**:
- Pages in navigation but missing from content/ → **BROKEN NAV** (flagged as error)
- Pages in content/ but missing from navigation → **Not an error** (unlisted pages are valid)

---

### Phase 2: Build Detection & Cache Check

**Get Current Vercel Build ID**:
```bash
# Option 1: Query Vercel API
BUILD_ID=$(vercel inspect $DOMAIN --token=$VERCEL_TOKEN | jq -r '.id')

# Option 2: Fetch from live site headers (faster)
BUILD_ID=$(curl -sI https://$DOMAIN | grep -i "x-vercel-id" | awk '{print $2}' | tr -d '\r')
```

**Cache Check**:
```bash
CACHE_FILE=".cache/smoke/last-tested-${DOMAIN}.json"

if [[ -f "$CACHE_FILE" ]]; then
  CACHED_BUILD=$(jq -r '.buildID' "$CACHE_FILE")
  CACHED_PASS_PCT=$(jq -r '.passPercentage' "$CACHE_FILE")

  if [[ "$CACHED_BUILD" == "$BUILD_ID" && "$CACHED_PASS_PCT" == "100" ]]; then
    echo "✓ Build $BUILD_ID already tested at 100% pass ($(jq -r '.timestamp' $CACHE_FILE))"
    exit 0
  fi
fi
```

**Cache Invalidation**:
- New build ID → run tests
- Cached build had failures → re-run tests (allows retry after fixes)

---

### Phase 3: Parallel Test Execution

**Test Function** (per page):
```bash
test_page() {
  local PAGE=$1
  local DOMAIN=$2
  local URL="https://${DOMAIN}${PAGE}"
  local RESPONSE_FILE="/tmp/smoke-${PAGE//\//-}-$$.html"

  # Test 1: HTTP Status + capture all response headers
  HTTP_RESPONSE=$(curl -s -i -o "$RESPONSE_FILE" -w "%{http_code}" "$URL")
  STATUS="${HTTP_RESPONSE: -3}"

  # Extract response headers
  HEADERS=$(sed -n '1,/^\r$/p' "$RESPONSE_FILE")

  # Extract body (everything after blank line)
  sed -n '/^\r$/,$p' "$RESPONSE_FILE" | tail -n +2 > "${RESPONSE_FILE}.body"

  if [[ "$STATUS" != "200" ]]; then
    # On error: capture headers, body snippet, and save full response
    ERROR_LOG="/tmp/smoke-error-${PAGE//\//-}-$(date +%s).html"
    cp "$RESPONSE_FILE" "$ERROR_LOG"

    BODY_SNIPPET=$(head -c 500 "${RESPONSE_FILE}.body" | tr '\n' ' ')

    echo "{\"page\":\"$PAGE\",\"status\":$STATUS,\"error\":\"Non-200 status\",\"url\":\"$URL\",\"headers\":$(echo "$HEADERS" | jq -Rs .),\"bodySnippet\":$(echo "$BODY_SNIPPET" | jq -Rs .),\"fullResponseDump\":\"$ERROR_LOG\"}"
    return
  fi

  # Test 2: Content Validation (simple heuristic: page has <title> and meaningful content)
  TITLE=$(grep -o "<title>[^<]*</title>" "${RESPONSE_FILE}.body" | sed 's/<[^>]*>//g')
  CONTENT_LENGTH=$(wc -c < "${RESPONSE_FILE}.body")

  if [[ -z "$TITLE" || "$CONTENT_LENGTH" -lt 500 ]]; then
    ERROR_LOG="/tmp/smoke-error-${PAGE//\//-}-$(date +%s).html"
    cp "$RESPONSE_FILE" "$ERROR_LOG"

    echo "{\"page\":\"$PAGE\",\"status\":$STATUS,\"error\":\"Insufficient content (${CONTENT_LENGTH} bytes, no title)\",\"url\":\"$URL\",\"fullResponseDump\":\"$ERROR_LOG\"}"
    return
  fi

  # Success - clean up temp files
  rm -f "$RESPONSE_FILE" "${RESPONSE_FILE}.body"

  echo "{\"page\":\"$PAGE\",\"status\":$STATUS,\"title\":\"$TITLE\",\"contentLength\":$CONTENT_LENGTH,\"url\":\"$URL\"}"
}
export -f test_page
```

**Parallel Execution**:
```bash
# Run 15 parallel workers (tunable based on system resources)
cat /tmp/internal-pages.txt | xargs -P 15 -I {} bash -c "test_page {} $DOMAIN"
```

**Performance Estimate**:
- 17 pages ÷ 15 workers = ~2 seconds (assuming 1s avg per curl)
- Serial would take ~17 seconds

---

### Phase 4: Results Aggregation & Output

**JSON Output Format** (`logs/smoke/smoke-{timestamp}-{buildID}.json`):
```json
{
  "metadata": {
    "timestamp": "2025-12-05T14:32:18Z",
    "domain": "prelaunch.bearlakecamp.com",
    "buildID": "dpl_ABC123XYZ",
    "testCount": 17,
    "passCount": 16,
    "failCount": 1,
    "passPercentage": 94.12,
    "durationSeconds": 2.3
  },
  "results": [
    {
      "page": "/summer-camp",
      "status": 200,
      "title": "Summer Camp | Bear Lake Camp",
      "contentLength": 12453,
      "url": "https://prelaunch.bearlakecamp.com/summer-camp"
    },
    {
      "page": "/contact",
      "status": 500,
      "error": "Non-200 status",
      "url": "https://prelaunch.bearlakecamp.com/contact"
    }
  ],
  "failures": [
    {
      "page": "/contact",
      "status": 500,
      "error": "Non-200 status",
      "url": "https://prelaunch.bearlakecamp.com/contact",
      "headers": "HTTP/2 500\r\ncontent-type: text/html\r\nx-vercel-id: sfo1::xxxxxx\r\n...",
      "bodySnippet": "<!DOCTYPE html><html><body><h1>Application error: a server-side exception occurred</h1>...",
      "fullResponseDump": "/tmp/smoke-error-contact-1733418738.html",
      "debugHint": "Check server logs for /contact route handler. Possible uncaught exception. Full response saved to /tmp/smoke-error-contact-1733418738.html"
    }
  ],
  "brokenNavigation": [
    {
      "page": "/facilities-outdoor",
      "inNavigation": false,
      "inContent": true,
      "issue": "Page exists but not linked in navigation.yaml"
    }
  ]
}
```

**Human-Readable Output** (stdout):
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Smoke Test: prelaunch.bearlakecamp.com
Build: dpl_ABC123XYZ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ /summer-camp (200, 12.5 KB)
✓ /summer-camp-junior-high (200, 9.8 KB)
✗ /contact (500, Non-200 status)
✓ /facilities (200, 11.2 KB)
...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESULT: 16/17 tests passed (94.12%)
Duration: 2.3 seconds
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Failures:
  • /contact — 500 error
    Debug: Check server logs for /contact route handler
    URL: https://prelaunch.bearlakecamp.com/contact

Log saved: logs/smoke/smoke-20251205-143218-dpl_ABC123XYZ.json
```

**Exit Codes**:
- `0` — All tests passed
- `1` — One or more tests failed
- `2` — Build already tested (cache hit, informational)

---

## Content Validation Strategy

### Approach 1: Simple Heuristics (Recommended for v1)

**Rationale**: Fast, low-complexity, catches 90% of issues (500 errors, empty pages, build failures)

**Validation Rules**:
1. **Status 200** — Page rendered without server error
2. **Title exists** — Page has `<title>` tag (confirms HTML structure)
3. **Minimum content** — Response ≥500 bytes (filters out blank/error pages)

**Implementation**:
```bash
# Already shown in test_page() function above
grep -o "<title>[^<]*</title>" /tmp/response.html
wc -c < /tmp/response.html
```

**Pros**:
- Near-zero overhead (grep + wc)
- Catches catastrophic failures (500s, blank pages, missing routes)

**Cons**:
- Doesn't validate specific content (e.g., "Bear Lake Camp mission statement")

---

### Approach 2: Content Matching Against .mdoc Files (Phase 2 Enhancement)

**Rationale**: Validate that content from `.mdoc` files actually appears on rendered pages

**Strategy**: Extract text content from both HTML response and source `.mdoc` file, compare key phrases

**HTML Text Extraction** (strip HTML tags):
```bash
# Method 1: sed-based (no dependencies, fast)
curl -s "https://prelaunch.bearlakecamp.com/about" | \
  sed -e 's/<[^>]*>//g' -e 's/&nbsp;/ /g' -e 's/&amp;/\&/g' | \
  tr -s '[:space:]' '\n' | \
  grep -v '^$' > /tmp/page-text.txt

# Method 2: html2text (cleaner, requires apt/brew install)
curl -s "https://prelaunch.bearlakecamp.com/about" | \
  html2text -nobs > /tmp/page-text.txt

# Method 3: lynx dump (best quality, requires lynx)
curl -s "https://prelaunch.bearlakecamp.com/about" | \
  lynx -dump -stdin -nolist > /tmp/page-text.txt
```

**Recommendation**: Use **sed-based** for zero dependencies, **lynx** for best quality if available

**Content Source Text Extraction** (from .mdoc):
```bash
# Extract body content from .mdoc (skip YAML frontmatter)
awk '/^---$/ {count++; next} count >= 2 {print}' content/pages/about.mdoc | \
  sed -e 's/{%[^%]*%}//g' -e 's/\[.*\]//g' -e 's/^#* *//' | \
  tr -s '[:space:]' '\n' | \
  grep -v '^$' > /tmp/expected-text.txt
```

**Validation Logic**:
```bash
# Extract key phrases from .mdoc (H1, H2 headings + first sentence of paragraphs)
expected_phrases=(
  "About Bear Lake Camp"
  "Our Mission"
  "Our History"
  "Christ-centered ministry"
)

# Check each phrase appears in rendered HTML
missing_phrases=()
for phrase in "${expected_phrases[@]}"; do
  if ! grep -qi "$phrase" /tmp/page-text.txt; then
    missing_phrases+=("$phrase")
  fi
done

if [ ${#missing_phrases[@]} -gt 0 ]; then
  echo "FAIL: Missing content phrases: ${missing_phrases[*]}"
  exit 1
fi
```

**Enhanced Error Output** (when content validation fails):
```json
{
  "page": "/about",
  "status": 200,
  "error": "Content validation failed",
  "missingPhrases": [
    "Our Mission",
    "Christ-centered ministry"
  ],
  "renderedPageSnippet": "About Bear Lake Camp\n\nOur History\n\nBear Lake Camp has been...",
  "expectedContent": "content/pages/about.mdoc",
  "debugHint": "Content file may not be rendering. Check MarkdocRenderer component.",
  "fullPageDump": "/tmp/smoke-about-20251205-143218.html"
}
```

**Performance Impact**: +0.2-0.5s per page (text extraction + comparison)

---

### Approach 2: Content Substring Matching (Optional v2 Enhancement)

**Rationale**: Validates page-specific content rendered correctly

**Mapping Strategy**:
Create `scripts/smoke-test-expectations.json`:
```json
{
  "/": {
    "expectedText": "To Know Christ",
    "source": "content/homepage/mission.yaml"
  },
  "/summer-camp": {
    "expectedText": "Junior High",
    "source": "Inferred from navigation (has child pages)"
  },
  "/about": {
    "expectedText": "Bear Lake Camp",
    "source": "Generic site name (low-confidence)"
  }
}
```

**Test Enhancement**:
```bash
EXPECTED_TEXT=$(jq -r --arg page "$PAGE" '.[$page].expectedText // ""' expectations.json)

if [[ -n "$EXPECTED_TEXT" ]]; then
  if ! grep -q "$EXPECTED_TEXT" /tmp/response.html; then
    echo "{\"page\":\"$PAGE\",\"error\":\"Missing expected text: $EXPECTED_TEXT\"}"
    return
  fi
fi
```

**Pros**:
- Higher confidence in correctness
- Catches content regressions (e.g., wrong data file loaded)

**Cons**:
- Maintenance burden (expectations.json must stay synced with content)
- Slower (grep for each expectation)

**Recommendation**: Start with Approach 1, add Approach 2 if regressions occur.

---

## Caching Strategy

### Cache Structure

**File**: `.cache/smoke/last-tested-{domain}.json`

```json
{
  "domain": "prelaunch.bearlakecamp.com",
  "buildID": "dpl_ABC123XYZ",
  "timestamp": "2025-12-05T14:32:18Z",
  "testCount": 17,
  "passCount": 17,
  "passPercentage": 100,
  "logFile": "logs/smoke/smoke-20251205-143218-dpl_ABC123XYZ.json"
}
```

### Cache Invalidation Logic

```bash
should_run_tests() {
  local DOMAIN=$1
  local CURRENT_BUILD=$2
  local CACHE_FILE=".cache/smoke/last-tested-${DOMAIN}.json"

  # No cache → run tests
  [[ ! -f "$CACHE_FILE" ]] && return 0

  # Different build ID → run tests
  CACHED_BUILD=$(jq -r '.buildID' "$CACHE_FILE")
  [[ "$CACHED_BUILD" != "$CURRENT_BUILD" ]] && return 0

  # Cached tests failed → re-run (allow retry after fixes)
  CACHED_PASS_PCT=$(jq -r '.passPercentage' "$CACHE_FILE")
  [[ "$CACHED_PASS_PCT" != "100" ]] && return 0

  # Cache hit: same build, 100% pass → skip tests
  return 1
}
```

**Cache Location**:
- **Development**: `.cache/smoke/` (gitignored)
- **CI**: `$GITHUB_WORKSPACE/.cache/smoke/` (restored from GitHub Actions cache)

**Cache Sharing** (for CI):
```yaml
# .github/workflows/smoke-test.yml
- uses: actions/cache@v3
  with:
    path: .cache/smoke
    key: smoke-cache-${{ runner.os }}
```

**Cache Expiration**: Not needed (build IDs are unique; old builds never re-tested)

---

## Script Interface

### Usage

```bash
scripts/smoke-test.sh [OPTIONS] <domain>

Arguments:
  domain              Target domain (prelaunch.bearlakecamp.com or www.bearlakecamp.com)

Options:
  --force             Ignore cache, run tests even if build already validated
  --sequential        Disable parallelization (for debugging)
  --verbose           Show curl output for each test
  --workers N         Number of parallel workers (default: 15)
  --expectations FILE Use custom content expectations JSON

Examples:
  # Test prelaunch (respects cache)
  scripts/smoke-test.sh prelaunch.bearlakecamp.com

  # Test production (force re-run)
  scripts/smoke-test.sh --force www.bearlakecamp.com

  # Debug single-threaded
  scripts/smoke-test.sh --sequential --verbose prelaunch.bearlakecamp.com
```

### Environment Variables

```bash
# Required (loaded from .env.local automatically)
VERCEL_TOKEN=nC5BEf...
VERCEL_PROJECT_ID=prj_pnIf...

# Optional
SMOKE_TEST_WORKERS=15        # Parallelization factor
SMOKE_TEST_TIMEOUT=10        # Curl timeout (seconds)
SMOKE_TEST_LOG_DIR=logs/smoke
```

---

## GitHub Actions Integration

### Workflow Design

**File**: `.github/workflows/smoke-test.yml`

```yaml
name: Smoke Test Production

on:
  deployment_status:  # Trigger after Vercel deployment
  workflow_dispatch:  # Allow manual trigger
    inputs:
      domain:
        description: 'Domain to test'
        required: true
        default: 'prelaunch.bearlakecamp.com'

jobs:
  smoke-test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Install dependencies
        run: |
          sudo apt-get update
          sudo apt-get install -y jq yq curl

      - name: Restore smoke test cache
        uses: actions/cache@v3
        with:
          path: .cache/smoke
          key: smoke-cache-${{ runner.os }}

      - name: Run smoke tests
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
        run: |
          scripts/smoke-test.sh prelaunch.bearlakecamp.com

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: smoke-test-logs
          path: logs/smoke/*.json
          retention-days: 30

      - name: Comment on PR (if failed)
        if: failure() && github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const log = fs.readdirSync('logs/smoke').sort().reverse()[0];
            const results = JSON.parse(fs.readFileSync(`logs/smoke/${log}`));

            const failures = results.failures.map(f =>
              `- ❌ ${f.page}: ${f.error}\n  ${f.url}`
            ).join('\n');

            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `## Smoke Test Failed\n\n${failures}`
            });
```

### Trigger Strategies

| Trigger | Use Case | Frequency |
|---------|----------|-----------|
| `deployment_status` | Auto-test after Vercel deploy | Every deploy |
| `workflow_dispatch` | Manual test before DNS cutover | Ad-hoc |
| `schedule` (cron) | Daily production health check | 1x/day |

**Recommendation**: Use `deployment_status` for prelaunch, `schedule` for www (production uptime monitoring).

---

## Implementation Plan

### Phase 1: MVP (1-2 Story Points)

**Deliverables**:
1. `scripts/smoke-test.sh` — Core test runner
   - Parse navigation.yaml
   - Parallel curl tests (status + heuristics)
   - JSON + human-readable output
2. `.cache/smoke/` — Cache directory (gitignored)
3. `logs/smoke/` — Log directory (gitignored, 30-day retention)

**Acceptance Criteria**:
- Tests all 17 pages in <5 seconds
- Detects 500 errors, missing pages, blank responses
- Caches build IDs (skips redundant tests)

---

### Phase 2: CI Integration (1 Story Point)

**Deliverables**:
1. `.github/workflows/smoke-test.yml` — GitHub Actions workflow
2. GitHub secrets: `VERCEL_TOKEN`, `VERCEL_PROJECT_ID`
3. PR comment integration (on failure)

**Acceptance Criteria**:
- Runs automatically after Vercel deployments
- Uploads test logs as artifacts
- Comments on PRs with failure details

---

### Phase 3: Content Validation (2 Story Points, Optional)

**Deliverables**:
1. `scripts/smoke-test-expectations.json` — Content assertions
2. Enhanced test logic (grep for expected text)

**Acceptance Criteria**:
- Validates page-specific content (e.g., mission statement on homepage)
- Maintenance doc: how to update expectations

---

## Performance Characteristics

### Benchmark Estimates

| Configuration | Pages | Workers | Time | Throughput |
|---------------|-------|---------|------|------------|
| Sequential | 17 | 1 | ~17s | 1 page/s |
| Parallel (5 workers) | 17 | 5 | ~4s | 4.25 pages/s |
| Parallel (15 workers) | 17 | 15 | ~2s | 8.5 pages/s |
| Parallel (30 workers) | 17 | 30 | ~1.5s | 11.3 pages/s |

**Recommendation**: 15 workers (balances speed + system load)

**Scaling**:
- At 50 pages: ~4 seconds (15 workers)
- At 100 pages: ~7 seconds (15 workers)

---

## Error Handling & Debugging

### AI-Debuggable Error Format

**Failure Record**:
```json
{
  "page": "/contact",
  "status": 500,
  "error": "Non-200 status",
  "url": "https://prelaunch.bearlakecamp.com/contact",
  "debugHint": "Check server logs for /contact route handler. Possible uncaught exception.",
  "timestamp": "2025-12-05T14:32:19Z",
  "responseSnippet": "Internal Server Error\n<stack trace...>"
}
```

**AI Debugging Prompt Template** (auto-generated):
```
The smoke test failed for /contact with a 500 error.

URL: https://prelaunch.bearlakecamp.com/contact
Error: Non-200 status
Timestamp: 2025-12-05T14:32:19Z

Response snippet:
Internal Server Error
TypeError: Cannot read property 'email' of undefined
  at ContactPage (/app/contact/page.tsx:12:24)

Please diagnose the issue and suggest a fix.
```

### Common Failure Modes

| Error | Likely Cause | Debug Steps |
|-------|--------------|-------------|
| **500 status** | Server-side exception | Check Vercel logs for uncaught errors |
| **404 status** | Missing route or file | Verify page exists in `app/` directory |
| **Blank page** (< 500 bytes) | Render failure (no content) | Check component logic, data fetching |
| **Missing title** | Malformed HTML | Check layout.tsx, SEO metadata |
| **Timeout** | Slow serverless function | Check cold start times, API dependencies |

---

## Comparison to Alternatives

### Why Not Playwright/Cypress?

| Criterion | curl (This Design) | Playwright/Cypress |
|-----------|-------------------|-------------------|
| **Speed** | 2-3 seconds (17 pages) | 20-40 seconds |
| **Setup** | Zero (curl pre-installed) | npm install, browser binaries |
| **CI Time** | <5 seconds | 30-60 seconds |
| **Maintenance** | Minimal (pages auto-discovered) | Test code for each page |
| **Debuggability** | Simple (HTTP status + logs) | Complex (screenshots, traces) |

**Use Playwright When**:
- Testing JavaScript interactions (clicks, forms)
- Validating client-side rendering
- Visual regression testing

**Use curl When** (This System):
- Validating server-side rendering (SSR/SSG)
- Deployment smoke tests (fast feedback)
- Build health checks

---

## Success Metrics

### Performance KPIs

- **P50 test duration**: <3 seconds (17 pages)
- **P95 test duration**: <5 seconds
- **Cache hit rate**: >80% (same build not re-tested)

### Quality KPIs

- **False positive rate**: <5% (tests pass but site broken)
- **False negative rate**: <1% (tests fail but site working)
- **Coverage**: 100% of navigation.yaml pages

### Developer Experience

- **Time to first feedback**: <10 seconds (local run)
- **CI feedback latency**: <20 seconds (GitHub Actions)
- **Maintenance effort**: <1 hour/month

---

## Open Questions for Implementation

### Q1: Content Validation Depth

**Decision Point**: Start with heuristics (v1) or implement content matching (v2)?

**Recommendation**: Start with heuristics. Add content matching if regressions occur.

---

### Q2: Test Granularity

**Decision Point**: Test only navigation.yaml pages, or discover all routes from Next.js build?

**Options**:
1. **Navigation.yaml only** (this design) — Fast, intentional coverage
2. **All routes** (`next build` → extract routes) — Comprehensive but slower

**Recommendation**: Navigation.yaml only. Add dynamic route testing if needed (e.g., `/staff/[slug]`).

---

### Q3: Dynamic Route Testing

**Challenge**: `/staff/[slug]` has infinite possible values

**Approaches**:
1. **Sample testing**: Test 1-2 examples (e.g., `/staff/john-doe`)
2. **Full enumeration**: Parse content files to find all slugs
3. **Skip dynamic routes**: Only test static routes

**Recommendation**: Full enumeration (parse content to get all staff slugs). One-time setup, covers real pages.

---

### Q4: Vercel Build Detection

**Challenge**: Getting build ID without Vercel CLI (for lightweight CI)

**Options**:
1. **Vercel CLI** (`vercel inspect`) — Requires auth, slow
2. **HTTP headers** (`x-vercel-id`) — Fast, no auth needed
3. **Deployment webhook** — Vercel sends build ID to our API

**Recommendation**: HTTP headers (fastest, simplest).

---

## Appendix A: File Structure

```
bearlakecamp/
├── scripts/
│   ├── smoke-test.sh                    # Main test runner
│   └── smoke-test-expectations.json     # (Optional) Content assertions
├── .cache/
│   └── smoke/
│       ├── last-tested-prelaunch.bearlakecamp.com.json
│       └── last-tested-www.bearlakecamp.com.json
├── logs/
│   └── smoke/
│       ├── smoke-20251205-143218-dpl_ABC123.json
│       └── smoke-20251205-151042-dpl_XYZ789.json
├── .github/
│   └── workflows/
│       └── smoke-test.yml               # CI integration
└── .gitignore
    └── .cache/smoke/                    # Cache not committed
    └── logs/smoke/                      # Logs not committed
```

---

## Appendix B: Dependencies

### Local Environment

```bash
# Required
curl          # HTTP client (pre-installed macOS/Linux)
jq            # JSON parser (brew install jq)
yq            # YAML parser (brew install yq)

# Optional (for enhanced features)
vercel        # Build ID detection (npm install -g vercel)
```

### GitHub Actions

```yaml
# .github/workflows/smoke-test.yml
- name: Install dependencies
  run: sudo apt-get install -y jq yq curl
```

**Note**: `yq` in apt is Python-based. For Go-based `yq` (faster), use:
```bash
wget https://github.com/mikefarah/yq/releases/download/v4.35.1/yq_linux_amd64 -O /usr/local/bin/yq
chmod +x /usr/local/bin/yq
```

---

## Appendix C: Example Test Output (Full)

**Command**:
```bash
scripts/smoke-test.sh prelaunch.bearlakecamp.com
```

**Console Output**:
```
Smoke Test: prelaunch.bearlakecamp.com
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Discovering pages from navigation.yaml... 17 pages found
Fetching build ID... dpl_9FmK3xHq2LpZvN8rW5tQ1yJ6
Checking cache... No cached results for this build

Running tests (15 parallel workers)...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ / (200, 8.2 KB, "Bear Lake Camp | Christian Summer Camp")
✓ /summer-camp (200, 12.5 KB, "Summer Camp | Bear Lake Camp")
✓ /summer-camp-junior-high (200, 9.8 KB, "Junior High Camp | Bear Lake Camp")
✓ /summer-camp-senior-high (200, 10.1 KB, "Senior High Camp | Bear Lake Camp")
✓ /work-at-camp (200, 7.3 KB, "Work at Camp | Bear Lake Camp")
✓ /work-at-camp-counselors (200, 8.9 KB, "Counselors | Bear Lake Camp")
✓ /work-at-camp-kitchen-staff (200, 6.7 KB, "Kitchen Staff | Bear Lake Camp")
✓ /retreats (200, 11.2 KB, "Retreats | Bear Lake Camp")
✓ /retreats-adult-retreats (200, 8.5 KB, "Adult Retreats | Bear Lake Camp")
✓ /retreats-youth-groups (200, 9.1 KB, "Youth Groups | Bear Lake Camp")
✓ /facilities (200, 10.8 KB, "Facilities | Bear Lake Camp")
✓ /facilities-cabins (200, 7.6 KB, "Cabins | Bear Lake Camp")
✓ /facilities-chapel (200, 6.4 KB, "Chapel | Bear Lake Camp")
✓ /facilities-dining-hall (200, 7.2 KB, "Dining Hall | Bear Lake Camp")
✓ /facilities-rec-center (200, 8.3 KB, "Rec Center | Bear Lake Camp")
✓ /give (200, 5.9 KB, "Give | Bear Lake Camp")
✓ /about (200, 9.4 KB, "About | Bear Lake Camp")
✓ /contact (200, 6.8 KB, "Contact | Bear Lake Camp")

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESULT: 17/17 tests passed (100%)
Duration: 2.3 seconds
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Cache updated: .cache/smoke/last-tested-prelaunch.bearlakecamp.com.json
Log saved: logs/smoke/smoke-20251205-143218-dpl_9FmK3xHq2LpZvN8rW5tQ1yJ6.json
```

**JSON Log** (`logs/smoke/smoke-20251205-143218-dpl_9FmK3xHq2LpZvN8rW5tQ1yJ6.json`):
```json
{
  "metadata": {
    "timestamp": "2025-12-05T14:32:18Z",
    "domain": "prelaunch.bearlakecamp.com",
    "buildID": "dpl_9FmK3xHq2LpZvN8rW5tQ1yJ6",
    "testCount": 17,
    "passCount": 17,
    "failCount": 0,
    "passPercentage": 100,
    "durationSeconds": 2.3,
    "workers": 15
  },
  "results": [
    {
      "page": "/",
      "status": 200,
      "title": "Bear Lake Camp | Christian Summer Camp",
      "contentLength": 8402,
      "url": "https://prelaunch.bearlakecamp.com/"
    },
    {
      "page": "/summer-camp",
      "status": 200,
      "title": "Summer Camp | Bear Lake Camp",
      "contentLength": 12763,
      "url": "https://prelaunch.bearlakecamp.com/summer-camp"
    }
    // ... (15 more entries)
  ],
  "failures": []
}
```

---

## Appendix D: Story Point Estimates

### Phase 1: MVP Implementation

| Task | SP | Assignee | Dependencies |
|------|----|---------|--------------|
| Parse navigation.yaml (yq) | 0.2 | sde-iii | None |
| Build ID detection (curl headers) | 0.3 | sde-iii | None |
| Cache read/write logic | 0.5 | sde-iii | Build ID detection |
| Parallel curl tests (xargs) | 0.8 | sde-iii | Page discovery |
| JSON output generation (jq) | 0.3 | sde-iii | Test execution |
| Human-readable formatting | 0.2 | sde-iii | JSON output |
| **Total Phase 1** | **2.3** | | |

### Phase 2: CI Integration

| Task | SP | Assignee | Dependencies |
|------|----|-----------|--------------|
| GitHub Actions workflow | 0.5 | sde-iii | Phase 1 complete |
| GitHub secrets setup | 0.1 | sde-iii | None |
| PR comment integration | 0.3 | sde-iii | Workflow |
| **Total Phase 2** | **0.9** | | |

### Phase 3: Content Validation (Optional)

| Task | SP | Assignee | Dependencies |
|------|----|-----------|--------------|
| Expectations JSON schema | 0.3 | pm | Phase 1 complete |
| Content mapping (manual) | 0.5 | pm | Schema |
| Grep-based validation | 0.5 | sde-iii | Expectations file |
| Maintenance documentation | 0.2 | docs-writer | Implementation |
| **Total Phase 3** | **1.5** | | |

**Grand Total**: 4.7 SP (MVP + CI + Content Validation)
**Recommended Minimum Viable Product**: 2.3 SP (Phase 1 only)

---

## Next Steps for Implementation

1. **Review this design** with stakeholders (PM, PE, DevOps)
2. **Approve Phase 1 scope** (MVP: 2.3 SP)
3. **QPLAN**: Create requirements.lock.md with REQ-IDs
4. **QCODET**: Write tests for smoke-test.sh (edge cases: cache hit, build mismatch, 500 errors)
5. **QCODE**: Implement scripts/smoke-test.sh
6. **QCHECK**: PE review + security review (curl safety, injection risks)
7. **QDOC**: Document usage in docs/operations/SMOKE-TESTS.md
8. **QGIT**: Commit and deploy

---

**End of Design Document**
