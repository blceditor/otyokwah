# Smoke Test System Implementation Plan

**Task ID**: smoke-test-system-v1
**Date**: 2025-12-05
**Status**: Ready for Implementation
**Source**: `/Users/travis/SparkryGDrive/dev/bearlakecamp/docs/technical/SMOKE-TEST-SYSTEM-DESIGN.md`

---

## Executive Summary

Fast, repeatable curl-based smoke test system for validating production deployments. Targets 2-3 seconds for ~24 pages using parallel execution with build-aware caching.

**Key Metrics**:
- **Performance**: <3 seconds for 24 pages (15 parallel workers)
- **Dependencies**: Zero (curl, jq, yq only)
- **Build-Aware**: Skip testing if current build already validated
- **CI-Ready**: GitHub Actions compatible, AI-debuggable error output

**Total Story Points**: 3.5 SP (Phase 1 MVP)

---

## Requirements Summary

### Phase 1: MVP (3.5 SP)
- Two-source page discovery (navigation.yaml + content/*.mdoc)
- Broken navigation detection
- Build ID detection via HTTP headers
- Build-aware caching
- HTTP status validation (200 only)
- Content heuristics (≥500 bytes, <title> tag)
- Parallel execution (15 workers default)
- Enhanced error logging (full dumps, headers, debug hints)
- JSON + human-readable output
- CLI interface (--force, --sequential, --verbose, --workers)

### Phase 2: Content Validation (0.9 SP - Optional)
- HTML text extraction via lynx
- .mdoc content extraction
- Key phrase validation

---

## Parallel Implementation Plan

### Agent Assignment Strategy

**Agent 1: Discovery & Validation Engineer** (1.3 SP)
- REQ-001: Two-Source Page Discovery (0.3 SP)
- REQ-002: Broken Navigation Detection (0.2 SP)
- REQ-005: HTTP Status Validation (0.3 SP)
- REQ-006: Content Length Heuristic (0.1 SP)
- REQ-007: Title Tag Validation (0.1 SP)
- REQ-015: Directory Creation (0.05 SP)
- **Blockers**: None
- **Deliverable**: `test_page()` function with validation logic

**Agent 2: Caching & Build Engineer** (0.8 SP)
- REQ-003: Build ID Detection (0.3 SP)
- REQ-004: Build-Aware Caching (0.5 SP)
- **Blockers**: None
- **Deliverable**: Cache read/write functions, build ID detection

**Agent 3: Execution & Orchestration Engineer** (0.5 SP)
- REQ-008: Parallel Test Execution (0.5 SP)
- **Blockers**: REQ-001 (needs page list), REQ-005 (needs test function)
- **Deliverable**: `xargs -P` execution logic, worker management

**Agent 4: Output & Logging Engineer** (0.8 SP)
- REQ-009: Enhanced Error Logging (0.3 SP)
- REQ-010: JSON Output Format (0.3 SP)
- REQ-011: Human-Readable Console Output (0.2 SP)
- **Blockers**: REQ-008 (needs test results)
- **Deliverable**: Output formatters, log generators

**Agent 5: CLI & Integration Engineer** (0.35 SP)
- REQ-012: Exit Code Semantics (0.05 SP)
- REQ-013: CLI Interface (0.2 SP)
- REQ-014: Environment Variable Support (0.1 SP)
- **Blockers**: None
- **Deliverable**: Argument parsing, help text, env var loading

### Execution Timeline

```
Phase 1A (Parallel) — Foundation [Day 1, AM]
├── Agent 1: Discovery + validation logic (1.3 SP)
├── Agent 2: Caching + build detection (0.8 SP)
└── Agent 5: CLI interface (0.35 SP)
    Duration: ~2-3 hours (parallel execution)

Phase 1B (Parallel) — Integration [Day 1, PM]
├── Agent 3: Parallel execution (0.5 SP) [blocks on Agent 1]
└── Agent 4: Output formatting (0.8 SP) [blocks on Agent 3]
    Duration: ~2-3 hours (sequential dependency)

Phase 1C (Sequential) — Integration Testing [Day 1, EOD]
├── All Agents: Integration smoke test
├── Validation: Run against prelaunch.bearlakecamp.com
└── Bug fixes and edge case handling
    Duration: ~1 hour

Phase 2 (Optional) — Content Validation [Day 2+]
├── Agent 1: Lynx integration + .mdoc extraction (0.4 SP)
└── Agent 1: Key phrase validation (0.5 SP)
    Duration: ~1-2 hours
```

**Critical Path**: Agent 1 → Agent 3 → Agent 4 (2.6 SP, ~4-5 hours)

---

## Parallel Task Breakdown

### Phase 1A: Foundation (Parallel)

#### Task 1.1: Page Discovery & Validation [Agent 1]
**Duration**: 1-2 hours
**Story Points**: 1.3 SP
**Blockers**: None

**Subtasks**:
1. Implement `discover_pages()` function
   - Parse navigation.yaml with yq
   - Find all content/pages/*.mdoc files
   - Merge and dedupe sources
   - Test: Validate ~24 pages discovered

2. Implement `detect_broken_nav()` function
   - Compare nav hrefs vs content files
   - Flag missing content files
   - Test: Detect intentional broken link

3. Implement `test_page()` function
   - curl -s -i -w "%{http_code}" $URL
   - Validate HTTP 200 status
   - Validate content ≥500 bytes
   - Validate <title> tag exists
   - Test: Pass on valid page, fail on 404/empty/no-title

**Test Validation**:
```bash
# Test discovery
pages=$(bash smoke-test.sh --dry-run prelaunch.bearlakecamp.com 2>&1 | grep "pages found")
[[ "$pages" =~ "24 pages found" ]] && echo "✓ Discovery" || echo "✗ Discovery"

# Test validation
test_page "/" "prelaunch.bearlakecamp.com"
# Should return JSON: {"page":"/","status":200,"title":"...","contentLength":...}
```

**Interface Contract**:
```bash
# discover_pages() output (stdout)
# One page per line, absolute paths
/
/summer-camp
/summer-camp-junior-high
...

# test_page() output (stdout, JSON)
{"page":"/about","status":200,"title":"About | Bear Lake Camp","contentLength":9432,"url":"https://..."}

# detect_broken_nav() output (stdout, JSON array)
[{"page":"/missing","inNavigation":true,"inContent":false,"issue":"..."}]
```

---

#### Task 1.2: Caching & Build Detection [Agent 2]
**Duration**: 1-2 hours
**Story Points**: 0.8 SP
**Blockers**: None

**Subtasks**:
1. Implement `get_build_id()` function
   - curl -sI $URL | grep x-vercel-id
   - Extract and clean build ID
   - Test: Validate against known build ID format

2. Implement `check_cache()` function
   - Read .cache/smoke/last-tested-{domain}.json
   - Compare buildID and passPercentage
   - Return: 0 (run tests) or 1 (skip tests)
   - Test: Cache hit on same build, cache miss on different build

3. Implement `update_cache()` function
   - Write cache file after test run
   - Include buildID, timestamp, passPercentage, testCount, logFile
   - Test: Cache file valid JSON with correct structure

4. Implement `create_directories()` function
   - mkdir -p .cache/smoke logs/smoke
   - Test: Directories created, no error if exist

**Test Validation**:
```bash
# Test build ID detection
BUILD_ID=$(get_build_id "prelaunch.bearlakecamp.com")
[[ "$BUILD_ID" =~ ^dpl_ ]] && echo "✓ Build ID" || echo "✗ Build ID"

# Test cache logic
# First run: should execute tests
check_cache "prelaunch.bearlakecamp.com" "$BUILD_ID" && echo "Run tests" || echo "Skip tests"
```

**Interface Contract**:
```bash
# get_build_id() output (stdout)
dpl_9FmK3xHq2LpZvN8rW5tQ1yJ6

# check_cache() return codes
# 0 = run tests (cache miss or failures)
# 1 = skip tests (cache hit, 100% pass)

# Cache file structure (.cache/smoke/last-tested-{domain}.json)
{
  "domain": "prelaunch.bearlakecamp.com",
  "buildID": "dpl_...",
  "timestamp": "2025-12-05T14:32:18Z",
  "testCount": 24,
  "passCount": 24,
  "passPercentage": 100,
  "logFile": "logs/smoke/smoke-20251205-143218-dpl_....json"
}
```

---

#### Task 1.3: CLI Interface [Agent 5]
**Duration**: 30-60 minutes
**Story Points**: 0.35 SP
**Blockers**: None

**Subtasks**:
1. Implement argument parsing
   - Required: domain
   - Optional: --force, --sequential, --verbose, --workers N
   - Help text on invalid usage
   - Test: All flags parsed correctly

2. Implement environment variable loading
   - SMOKE_TEST_WORKERS (default: 15)
   - SMOKE_TEST_TIMEOUT (default: 10)
   - SMOKE_TEST_LOG_DIR (default: logs/smoke)
   - Load from .env.local if present
   - CLI flags override env vars
   - Test: Env vars applied, CLI overrides work

3. Implement exit code logic
   - Exit 0: all tests passed
   - Exit 1: one or more failures
   - Exit 2: cache hit (build already tested)
   - Test: Correct exit codes returned

**Test Validation**:
```bash
# Test argument parsing
bash smoke-test.sh --help 2>&1 | grep "Usage:" && echo "✓ Help" || echo "✗ Help"
bash smoke-test.sh --workers 10 test.com && echo "✓ Workers flag" || echo "✗ Workers flag"

# Test environment variables
SMOKE_TEST_WORKERS=20 bash smoke-test.sh test.com
# Should use 20 workers (check log output)
```

**Interface Contract**:
```bash
# Usage
scripts/smoke-test.sh [OPTIONS] <domain>

# Arguments
domain              Target domain (prelaunch.bearlakecamp.com)

# Options
--force             Ignore cache, run tests even if build validated
--sequential        Disable parallelization (debugging)
--verbose           Show curl output for each test
--workers N         Number of parallel workers (default: 15)
--help              Show help text

# Environment Variables
SMOKE_TEST_WORKERS=15
SMOKE_TEST_TIMEOUT=10
SMOKE_TEST_LOG_DIR=logs/smoke

# Exit Codes
0 = all tests passed
1 = one or more failures
2 = cache hit (build already tested)
```

---

### Phase 1B: Integration (Sequential Dependencies)

#### Task 1.4: Parallel Execution [Agent 3]
**Duration**: 1 hour
**Story Points**: 0.5 SP
**Blockers**: Task 1.1 (needs page list and test function)

**Subtasks**:
1. Implement parallel execution logic
   - Export test_page function for workers
   - Use xargs -P $WORKERS to parallelize
   - Collect results from all workers
   - Test: Parallel faster than sequential, same results

2. Implement sequential fallback
   - --sequential flag disables parallelization
   - Loop through pages sequentially
   - Test: Sequential mode works correctly

3. Handle worker failures
   - Capture partial results if workers crash
   - Log worker errors
   - Test: Graceful handling of worker failures

**Test Validation**:
```bash
# Test parallel vs sequential
time bash smoke-test.sh --workers 15 test.com  # Should be ~2-3s
time bash smoke-test.sh --sequential test.com  # Should be ~15-20s

# Verify same results
diff <(bash smoke-test.sh --workers 15 test.com | sort) \
     <(bash smoke-test.sh --sequential test.com | sort)
```

**Interface Contract**:
```bash
# Parallel execution (internal)
discover_pages | xargs -P $WORKERS -I {} bash -c "test_page {} $DOMAIN"

# Output: JSON per page (one line per worker)
{"page":"/","status":200,...}
{"page":"/about","status":200,...}
...
```

---

#### Task 1.5: Output & Logging [Agent 4]
**Duration**: 1-2 hours
**Story Points**: 0.8 SP
**Blockers**: Task 1.4 (needs test results)

**Subtasks**:
1. Implement enhanced error logging
   - Save full response to /tmp/smoke-error-{page}-{ts}.html
   - Capture headers and body snippet
   - Generate debug hints per error type
   - Test: Error files created, debug hints accurate

2. Implement JSON output
   - Aggregate test results into structured JSON
   - Include metadata, results, failures, brokenNavigation
   - Save to logs/smoke/smoke-{ts}-{buildID}.json
   - Test: Valid JSON, all required fields present

3. Implement human-readable console output
   - Header with domain and build ID
   - Progress per page (✓/✗ status, size, title)
   - Summary (pass count, percentage, duration)
   - Failures section with errors
   - Log file path at end
   - Test: Output readable, visually clear

**Test Validation**:
```bash
# Test JSON output
bash smoke-test.sh test.com
jq . logs/smoke/smoke-*.json && echo "✓ JSON valid" || echo "✗ JSON invalid"

# Test error logging (force error by testing invalid domain)
bash smoke-test.sh invalid-domain-404.com || true
[[ -f /tmp/smoke-error-*-*.html ]] && echo "✓ Error dump" || echo "✗ Error dump"

# Test console output
bash smoke-test.sh test.com 2>&1 | grep "✓ /" && echo "✓ Console" || echo "✗ Console"
```

**Interface Contract**:
```bash
# JSON output structure (logs/smoke/smoke-{ts}-{buildID}.json)
{
  "metadata": {
    "timestamp": "2025-12-05T14:32:18Z",
    "domain": "prelaunch.bearlakecamp.com",
    "buildID": "dpl_ABC123",
    "testCount": 24,
    "passCount": 23,
    "failCount": 1,
    "passPercentage": 95.83,
    "durationSeconds": 2.3,
    "workers": 15
  },
  "results": [
    {"page":"/","status":200,"title":"...","contentLength":8402,"url":"https://..."},
    ...
  ],
  "failures": [
    {
      "page":"/contact",
      "status":500,
      "error":"Non-200 status",
      "url":"https://...",
      "headers":"HTTP/2 500...",
      "bodySnippet":"...",
      "fullResponseDump":"/tmp/smoke-error-contact-1733418738.html",
      "debugHint":"Check server logs for /contact route handler"
    }
  ],
  "brokenNavigation": [
    {"page":"/missing","inNavigation":true,"inContent":false,"issue":"..."}
  ]
}

# Console output format
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Smoke Test: prelaunch.bearlakecamp.com
Build: dpl_ABC123
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ / (200, 8.2 KB, "Bear Lake Camp | Christian Summer Camp")
✓ /summer-camp (200, 12.5 KB, "Summer Camp | Bear Lake Camp")
✗ /contact (500, Non-200 status)
...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESULT: 23/24 tests passed (95.83%)
Duration: 2.3 seconds
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Failures:
  • /contact — 500 error
    Debug: Check server logs for /contact route handler
    URL: https://prelaunch.bearlakecamp.com/contact

Log saved: logs/smoke/smoke-20251205-143218-dpl_ABC123.json
```

---

### Phase 1C: Integration Testing [All Agents]

**Duration**: 1 hour
**Objective**: Validate end-to-end functionality against live site

**Test Checklist**:
- [ ] Run against prelaunch.bearlakecamp.com
- [ ] Verify 24 pages discovered
- [ ] Verify all pages return 200 status
- [ ] Verify cache hit on second run (exit 2)
- [ ] Verify --force flag bypasses cache
- [ ] Verify --sequential produces same results
- [ ] Verify --workers N changes parallelization
- [ ] Verify JSON output valid and complete
- [ ] Verify console output readable
- [ ] Verify error logging (force 404 by testing invalid page)
- [ ] Verify broken navigation detection
- [ ] Performance: <5 seconds for 24 pages

**Integration Test Script**:
```bash
#!/usr/bin/env bash
# scripts/smoke-test-integration.sh
# Full integration test suite

set -euo pipefail

DOMAIN="prelaunch.bearlakecamp.com"
SCRIPT="./scripts/smoke-test.sh"

echo "Integration Test: Smoke Test System"
echo "====================================="
echo ""

# Test 1: Page discovery
echo "TEST 1: Page discovery"
output=$("$SCRIPT" --force "$DOMAIN" 2>&1 | grep "pages found")
echo "$output"
[[ "$output" =~ "24 pages found" ]] && echo "✓ PASS" || echo "✗ FAIL"
echo ""

# Test 2: All tests pass
echo "TEST 2: All tests pass"
if "$SCRIPT" --force "$DOMAIN" >/dev/null 2>&1; then
  echo "✓ PASS (exit 0)"
else
  echo "✗ FAIL (exit $?)"
fi
echo ""

# Test 3: Cache hit
echo "TEST 3: Cache hit on second run"
"$SCRIPT" "$DOMAIN" >/dev/null 2>&1  # First run
if "$SCRIPT" "$DOMAIN" >/dev/null 2>&1; then
  exit_code=$?
  if [[ $exit_code -eq 2 ]]; then
    echo "✓ PASS (exit 2)"
  else
    echo "✗ FAIL (exit $exit_code, expected 2)"
  fi
else
  echo "✗ FAIL"
fi
echo ""

# Test 4: JSON output valid
echo "TEST 4: JSON output valid"
"$SCRIPT" --force "$DOMAIN" >/dev/null 2>&1
latest_log=$(ls -t logs/smoke/smoke-*.json | head -1)
if jq . "$latest_log" >/dev/null 2>&1; then
  echo "✓ PASS"
else
  echo "✗ FAIL"
fi
echo ""

# Test 5: Performance target
echo "TEST 5: Performance <5 seconds"
start=$(date +%s)
"$SCRIPT" --force "$DOMAIN" >/dev/null 2>&1
duration=$(($(date +%s) - start))
if [[ $duration -lt 5 ]]; then
  echo "✓ PASS ($duration seconds)"
else
  echo "✗ FAIL ($duration seconds)"
fi
echo ""

echo "====================================="
echo "Integration tests complete"
```

---

## Phase 2: Content Validation (Optional)

### Task 2.1: Lynx Integration [Agent 1]
**Duration**: 30-60 minutes
**Story Points**: 0.2 SP
**Prerequisites**: Phase 1 complete

**Subtasks**:
1. Install and test lynx
2. Implement HTML text extraction
3. Test: Verify clean text output
4. Integration: Add to test_page() function

**Implementation**:
```bash
extract_html_text() {
  local html_file=$1
  lynx -dump -stdin -nolist < "$html_file"
}
```

---

### Task 2.2: .mdoc Content Extraction [Agent 1]
**Duration**: 30-60 minutes
**Story Points**: 0.2 SP
**Prerequisites**: Task 2.1

**Subtasks**:
1. Implement frontmatter skipping
2. Implement Markdoc tag removal
3. Implement markdown link removal
4. Test: Verify clean content output

**Implementation**:
```bash
extract_mdoc_content() {
  local mdoc_file=$1
  # Skip frontmatter, remove Markdoc/markdown syntax
  awk '/^---$/ {count++; next} count >= 2 {print}' "$mdoc_file" | \
    sed -e 's/{%[^%]*%}//g' -e 's/\[.*\]//g' -e 's/^#* *//'
}
```

---

### Task 2.3: Key Phrase Validation [Agent 1]
**Duration**: 1 hour
**Story Points**: 0.5 SP
**Prerequisites**: Task 2.1, Task 2.2

**Subtasks**:
1. Implement key phrase extraction from .mdoc
2. Implement phrase matching in HTML text
3. Implement enhanced error reporting
4. Test: Verify missing phrases detected
5. Add --skip-content-validation flag

**Implementation**:
```bash
validate_content() {
  local page=$1
  local html_text=$2
  local mdoc_file="content/pages${page}.mdoc"

  # Extract key phrases (H1, H2 headings)
  key_phrases=$(extract_mdoc_content "$mdoc_file" | grep "^#" | sed 's/^#* *//')

  # Check each phrase exists in HTML
  while IFS= read -r phrase; do
    if ! echo "$html_text" | grep -qi "$phrase"; then
      echo "Missing phrase: $phrase"
      return 1
    fi
  done <<< "$key_phrases"
}
```

---

## File Structure

```
bearlakecamp/
├── scripts/
│   ├── smoke-test.sh                    # Main script (NEW)
│   ├── smoke-test.spec.sh               # Validation test harness (NEW)
│   ├── smoke-test-benchmark.sh          # Performance benchmark (NEW)
│   └── smoke-test-integration.sh        # Integration tests (NEW)
├── .cache/
│   └── smoke/
│       ├── last-tested-prelaunch.bearlakecamp.com.json (NEW)
│       └── last-tested-www.bearlakecamp.com.json (NEW)
├── logs/
│   └── smoke/
│       ├── smoke-20251205-143218-dpl_ABC123.json (NEW)
│       └── ... (retention: 30 days)
├── requirements/
│   ├── smoke-test-system.md             # Requirements (NEW)
│   └── smoke-test-system.lock.md        # Requirements lock (NEW)
├── docs/
│   ├── tasks/
│   │   └── smoke-test-implementation-plan.md (THIS FILE)
│   ├── technical/
│   │   └── SMOKE-TEST-SYSTEM-DESIGN.md (EXISTING)
│   └── operations/
│       └── SMOKE-TEST-USAGE.md          # Usage guide (FUTURE)
└── .gitignore                           # Update to exclude cache/logs (NEW)
```

---

## Interface Contracts

### 1. smoke-test.sh Main Script

**Inputs**:
- `$1`: Domain (required)
- `--force`: Flag to ignore cache
- `--sequential`: Flag to disable parallelization
- `--verbose`: Flag for debug output
- `--workers N`: Number of parallel workers

**Outputs**:
- **stdout**: Human-readable test progress and summary
- **stderr**: Errors and warnings
- **Exit codes**: 0 (pass), 1 (fail), 2 (cache hit)
- **Files**:
  - `.cache/smoke/last-tested-{domain}.json` (cache)
  - `logs/smoke/smoke-{timestamp}-{buildID}.json` (results)
  - `/tmp/smoke-error-{page}-{timestamp}.html` (error dumps)

**Functions** (internal):
- `discover_pages()` → list of pages (stdout)
- `detect_broken_nav()` → JSON array of broken links
- `get_build_id(domain)` → build ID string
- `check_cache(domain, buildID)` → 0 (run) or 1 (skip)
- `update_cache(domain, buildID, results)` → void
- `test_page(page, domain)` → JSON object
- `format_json_output(results)` → JSON file
- `format_console_output(results)` → stdout

---

### 2. Test Validation Script (smoke-test.spec.sh)

**Inputs**: None
**Outputs**:
- **stdout**: Test results (✓ PASS / ✗ FAIL)
- **Exit codes**: 0 (all pass), 1 (any fail)

**Test Cases**:
- Page discovery (24 pages expected)
- Cache hit behavior
- Parallel vs sequential performance
- JSON output validity
- Error logging

---

### 3. Integration Test Script (smoke-test-integration.sh)

**Inputs**: None
**Outputs**:
- **stdout**: Integration test results
- **Exit codes**: 0 (all pass), 1 (any fail)

**Test Cases**:
- Full end-to-end test against live site
- Cache behavior
- Performance target (<5 seconds)
- JSON validity

---

## Dependencies & Tools

### Required Tools
- `curl` - HTTP client (pre-installed macOS/Linux)
- `jq` - JSON parser (install: `brew install jq` or `apt-get install jq`)
- `yq` - YAML parser (install: `brew install yq` or use mikefarah/yq)

### Optional Tools (Phase 2)
- `lynx` - Text browser (install: `brew install lynx` or `apt-get install lynx`)

### Installation Commands
```bash
# macOS
brew install jq yq lynx

# Ubuntu/GitHub Actions
sudo apt-get install -y jq curl
sudo wget https://github.com/mikefarah/yq/releases/download/v4.35.1/yq_linux_amd64 -O /usr/local/bin/yq
sudo chmod +x /usr/local/bin/yq
sudo apt-get install -y lynx  # Phase 2 only
```

---

## Git Workflow

### Commit Strategy
Each phase as separate commit for granular rollback:

```bash
# Phase 1A
git add scripts/smoke-test.sh requirements/
git commit -m "feat(smoke-test): implement page discovery and validation (REQ-001, REQ-002, REQ-005-007, 1.3 SP)"

# Phase 1B
git add scripts/smoke-test.sh .cache/ logs/
git commit -m "feat(smoke-test): implement caching and build detection (REQ-003, REQ-004, 0.8 SP)"

# Phase 1C
git add scripts/smoke-test.sh
git commit -m "feat(smoke-test): implement parallel execution (REQ-008, 0.5 SP)"

# Phase 1D
git add scripts/smoke-test.sh
git commit -m "feat(smoke-test): implement output formatting (REQ-009-011, 0.8 SP)"

# Phase 1E
git add scripts/smoke-test.sh
git commit -m "feat(smoke-test): implement CLI interface (REQ-012-014, 0.35 SP)"

# Integration
git add scripts/smoke-test-spec.sh scripts/smoke-test-integration.sh
git commit -m "test(smoke-test): add validation and integration tests"

# Documentation
git add docs/operations/SMOKE-TEST-USAGE.md
git commit -m "docs(smoke-test): add usage guide"

# Finalize
git add .gitignore
git commit -m "chore(smoke-test): update gitignore for cache and logs"
```

### Tag Strategy
```bash
git tag smoke-test-v1.0
git push origin smoke-test-v1.0
```

---

## Testing Strategy

### Unit-Level Validation (Function Testing)
```bash
# Test discover_pages()
bash -c "source scripts/smoke-test.sh && discover_pages" | wc -l
# Expected: 24

# Test get_build_id()
bash -c "source scripts/smoke-test.sh && get_build_id prelaunch.bearlakecamp.com"
# Expected: dpl_...

# Test test_page()
bash -c "source scripts/smoke-test.sh && test_page / prelaunch.bearlakecamp.com" | jq .
# Expected: Valid JSON with status 200
```

### Integration Testing
```bash
# Full script test
bash scripts/smoke-test.sh prelaunch.bearlakecamp.com
# Expected: All tests pass, exit 0

# Validation test harness
bash scripts/smoke-test.spec.sh
# Expected: All validation tests pass
```

### Performance Benchmarking
```bash
# Benchmark parallel execution
bash scripts/smoke-test-benchmark.sh prelaunch.bearlakecamp.com
# Expected: 15 workers ~2-3 seconds
```

### Real-World Validation
```bash
# Test against live deployment
bash scripts/smoke-test.sh prelaunch.bearlakecamp.com
# Expected: 24/24 tests pass, <3 seconds

# Test cache behavior
bash scripts/smoke-test.sh prelaunch.bearlakecamp.com  # First run
bash scripts/smoke-test.sh prelaunch.bearlakecamp.com  # Second run (cache hit)
# Expected: Second run exits with code 2 (cache hit)
```

---

## Success Criteria

### Phase 1 MVP Complete When:
- [ ] All 21 test cases from requirements.lock pass
- [ ] Script discovers 24 pages from navigation.yaml + content/
- [ ] Broken navigation detection works (flags missing content files)
- [ ] Build ID detection via x-vercel-id header works
- [ ] Cache skips redundant tests (exit 2 on cache hit)
- [ ] HTTP 200 validation works
- [ ] Content heuristics (≥500 bytes, <title>) work
- [ ] Parallel execution (<3 seconds for 24 pages) works
- [ ] Enhanced error logging (full dumps) works
- [ ] JSON output valid and complete
- [ ] Human-readable console output clear
- [ ] CLI flags (--force, --sequential, --verbose, --workers) work
- [ ] Environment variables (SMOKE_TEST_*) work
- [ ] Exit codes (0/1/2) correct
- [ ] Integration tests pass
- [ ] Performance target met (<5 seconds)

### Phase 2 Content Validation Complete When:
- [ ] Lynx HTML text extraction works
- [ ] .mdoc content extraction works
- [ ] Key phrase validation detects missing content
- [ ] --skip-content-validation flag works
- [ ] Performance overhead <0.5s per page

---

## Risk Mitigation

### Risk 1: yq YAML parsing fails
**Mitigation**: Test with sample navigation.yaml first; fallback to sed/awk if needed

### Risk 2: Parallel execution race conditions
**Mitigation**: Use unique temp files per worker ($$); test sequential mode first

### Risk 3: Build ID header missing
**Mitigation**: Detect missing header and exit with clear error; document manual override

### Risk 4: Lynx not available (Phase 2)
**Mitigation**: Make lynx optional; skip content validation if not installed

### Risk 5: Performance target not met
**Mitigation**: Benchmark early; tune worker count; profile slow pages

---

## Rollback Plan

### Per-Phase Rollback
```bash
# Revert specific commit
git revert <commit-hash>
git push origin main
```

### Full Rollback
```bash
# Remove smoke-test.sh entirely
git rm scripts/smoke-test.sh scripts/smoke-test-spec.sh scripts/smoke-test-integration.sh
git commit -m "revert(smoke-test): remove smoke test system"
git push origin main
```

### Vercel Impact
None. This is a local development tool with optional CI integration (future work).

---

## Next Steps

1. **QCODET**: Create validation test harness (`smoke-test.spec.sh`)
2. **QCODE Phase 1A**: Implement foundation (discovery, caching, CLI) in parallel
3. **QCODE Phase 1B**: Implement integration (execution, output)
4. **QCODE Phase 1C**: Integration testing and bug fixes
5. **QCHECK**: PE review of implementation
6. **QDOC**: Create usage guide (`docs/operations/SMOKE-TEST-USAGE.md`)
7. **QGIT**: Commit in phases, tag v1.0
8. **Optional Phase 2**: Content validation (lynx integration)

---

**Plan Status**: Ready for Implementation
**Estimated Total Duration**: 1 day (MVP), +0.5 day (optional content validation)
**Story Points**: 3.5 SP (MVP) + 0.9 SP (optional) = 4.4 SP total
