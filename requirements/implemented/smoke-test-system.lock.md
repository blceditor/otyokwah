# Requirements Lock: Smoke Test System Implementation

**Task**: Production Smoke Test System
**Date**: 2025-12-05
**Source**: `/Users/travis/SparkryGDrive/dev/bearlakecamp/docs/technical/SMOKE-TEST-SYSTEM-DESIGN.md`
**Status**: Locked for Implementation
**Task ID**: smoke-test-system-v1

---

## Snapshot

This requirements lock captures all requirements from the smoke test system design document for implementation tracking and validation.

### Scope: Phase 1 MVP (3.5 SP)

Core smoke test functionality with build-aware caching, parallel execution, and enhanced error logging.

**Deliverables**:
1. `scripts/smoke-test.sh` - Main test runner script
2. `.cache/smoke/` - Cache directory structure
3. `logs/smoke/` - Test result logs
4. Updated `.gitignore` - Exclude cache and logs

### Scope: Phase 2 Content Validation (0.9 SP - Optional)

Enhanced validation using lynx for HTML text extraction and .mdoc content matching.

**Deliverables**:
1. Content extraction functions in smoke-test.sh
2. Key phrase validation logic

---

## Requirements Test Matrix

### Page Discovery & Validation (0.8 SP)

#### REQ-001: Two-Source Page Discovery (0.3 SP)
**Test Cases**:
- T-001-01: Extract all hrefs from navigation.yaml (expected: ~17 pages)
- T-001-02: Discover all .mdoc file slugs (expected: ~24 files)
- T-001-03: Merge sources and dedupe (expected: ~24 unique pages)
- T-001-04: Handle navigation with children (nested hrefs)
- T-001-05: Convert index.mdoc to "/" slug

#### REQ-002: Broken Navigation Detection (0.2 SP)
**Test Cases**:
- T-002-01: Detect page in navigation.yaml but missing from content/
- T-002-02: Allow page in content/ but not in navigation (unlisted valid)
- T-002-03: Report broken navigation in JSON output brokenNavigation array
- T-002-04: No false positives for valid navigation-content pairs

#### REQ-015: Cache and Log Directory Creation (0.05 SP)
**Test Cases**:
- T-015-01: Create .cache/smoke/ if missing
- T-015-02: Create logs/smoke/ if missing
- T-015-03: No error if directories already exist

#### REQ-016: Performance Target (0.3 SP - validation)
**Test Cases**:
- T-016-01: Measure end-to-end duration with parallelization
- T-016-02: Validate 2-3 second typical case (15 workers)

---

### HTTP Testing & Validation (0.5 SP)

#### REQ-005: HTTP Status Validation (0.3 SP)
**Test Cases**:
- T-005-01: Test passes on HTTP 200 response
- T-005-02: Test fails on HTTP 404 with error details
- T-005-03: Test fails on HTTP 500 with error details
- T-005-04: Test fails on HTTP 301/302 redirect (should be resolved)
- T-005-05: Capture full response (headers + body) on any status

#### REQ-006: Content Length Heuristic (0.1 SP)
**Test Cases**:
- T-006-01: Pass on page with ≥500 bytes
- T-006-02: Fail on empty page (<500 bytes)
- T-006-03: Report actual byte count in error

#### REQ-007: Title Tag Validation (0.1 SP)
**Test Cases**:
- T-007-01: Pass on page with valid <title> tag
- T-007-02: Fail on page missing <title>
- T-007-03: Extract title text for success reporting
- T-007-04: Handle malformed HTML with title in attributes

---

### Caching & Build Detection (0.8 SP)

#### REQ-003: Build ID Detection via HTTP Headers (0.3 SP)
**Test Cases**:
- T-003-01: Extract x-vercel-id from curl -sI response
- T-003-02: Handle missing x-vercel-id header (error exit)
- T-003-03: Strip carriage return from header value
- T-003-04: Store BUILD_ID for cache comparison

#### REQ-004: Build-Aware Caching (0.5 SP)
**Test Cases**:
- T-004-01: Skip tests on cache hit (same buildID, 100% pass)
- T-004-02: Run tests on cache miss (different buildID)
- T-004-03: Re-run tests if cached build had failures (<100%)
- T-004-04: Run tests if no cache file exists
- T-004-05: Update cache after successful test run
- T-004-06: Cache file format: buildID, timestamp, passPercentage, testCount, logFile
- T-004-07: Separate cache files per domain

---

### Parallel Execution (0.5 SP)

#### REQ-008: Parallel Test Execution (0.5 SP)
**Test Cases**:
- T-008-01: Execute tests using xargs -P 15 by default
- T-008-02: Export test_page function for worker processes
- T-008-03: --workers N flag overrides default
- T-008-04: --sequential flag disables parallelization (1 worker)
- T-008-05: Parallel execution produces same results as sequential
- T-008-06: Handle worker failures gracefully (partial results)

---

### Output & Logging (0.8 SP)

#### REQ-009: Enhanced Error Logging (0.3 SP)
**Test Cases**:
- T-009-01: Save full response to /tmp/smoke-error-{page}-{timestamp}.html
- T-009-02: Capture HTTP headers in JSON output
- T-009-03: Extract first 500 bytes of body as snippet
- T-009-04: Include debugHint field with actionable guidance
- T-009-05: Full response path in JSON failures array
- T-009-06: Different debug hints per error type (404 vs 500 vs content)

#### REQ-010: JSON Output Format (0.3 SP)
**Test Cases**:
- T-010-01: Create logs/smoke/smoke-{timestamp}-{buildID}.json
- T-010-02: Metadata section with timestamp, domain, buildID, counts, passPercentage, duration
- T-010-03: Results array with all test outcomes
- T-010-04: Failures array with detailed error records
- T-010-05: BrokenNavigation array for nav-content mismatches
- T-010-06: Valid JSON syntax (parseable by jq)
- T-010-07: Output saved even when tests fail

#### REQ-011: Human-Readable Console Output (0.2 SP)
**Test Cases**:
- T-011-01: Header with domain and build ID
- T-011-02: Progress line per page (✓/✗ status, size, title)
- T-011-03: Summary with pass count, percentage, duration
- T-011-04: Failures section with detailed errors
- T-011-05: Log file path at end
- T-011-06: Unicode box drawing for visual separation

---

### CLI & Configuration (0.35 SP)

#### REQ-012: Exit Code Semantics (0.05 SP)
**Test Cases**:
- T-012-01: Exit 0 when all tests pass
- T-012-02: Exit 1 when one or more tests fail
- T-012-03: Exit 2 on cache hit (build already tested)

#### REQ-013: CLI Interface (0.2 SP)
**Test Cases**:
- T-013-01: Required domain argument (e.g., prelaunch.bearlakecamp.com)
- T-013-02: --force flag ignores cache
- T-013-03: --sequential flag disables parallelization
- T-013-04: --verbose flag shows curl output
- T-013-05: --workers N sets worker count
- T-013-06: Help text on missing/invalid arguments
- T-013-07: Error on unknown flags

#### REQ-014: Environment Variable Support (0.1 SP)
**Test Cases**:
- T-014-01: SMOKE_TEST_WORKERS sets default parallelization
- T-014-02: SMOKE_TEST_TIMEOUT sets curl timeout
- T-014-03: SMOKE_TEST_LOG_DIR sets log directory
- T-014-04: CLI flags override environment variables
- T-014-05: Load from .env.local if present

---

## Phase 2: Content Validation (0.9 SP - Optional)

#### REQ-017: HTML Text Extraction via Lynx (0.2 SP)
**Test Cases**:
- T-017-01: lynx -dump -stdin -nolist produces plain text
- T-017-02: HTML tags removed from output
- T-017-03: Navigation and boilerplate excluded
- T-017-04: Text structure preserved

#### REQ-018: .mdoc Content Source Extraction (0.2 SP)
**Test Cases**:
- T-018-01: Skip YAML frontmatter (between --- delimiters)
- T-018-02: Remove Markdoc tags ({%...%})
- T-018-03: Remove markdown links ([...])
- T-018-04: Strip heading markers (#)
- T-018-05: Normalize whitespace

#### REQ-019: Key Phrase Content Validation (0.5 SP)
**Test Cases**:
- T-019-01: Extract H1/H2 headings as key phrases
- T-019-02: Case-insensitive phrase matching
- T-019-03: Report missing phrases in failures array
- T-019-04: Enhanced error with rendered snippet vs expected
- T-019-05: Include source .mdoc file reference
- T-019-06: --skip-content-validation flag to disable

---

## Validation Strategy

Since this is a **testing tool itself**, validation approach differs from typical TDD:

### Validation Scripts (scripts/smoke-test.spec.sh)

```bash
#!/usr/bin/env bash
# Test harness for smoke-test.sh
# Run with: bash scripts/smoke-test.spec.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEST_DOMAIN="prelaunch.bearlakecamp.com"

test_page_discovery() {
  echo "TEST: Page discovery from navigation.yaml and content/"

  # Run smoke test with --dry-run (if implemented)
  output=$("$SCRIPT_DIR/smoke-test.sh" --dry-run "$TEST_DOMAIN" 2>&1 || true)

  # Validate expected page count
  if echo "$output" | grep -q "24 pages found"; then
    echo "✓ Page discovery: 24 pages found"
  else
    echo "✗ Page discovery: Expected 24 pages"
    return 1
  fi
}

test_cache_hit() {
  echo "TEST: Cache skips redundant tests"

  # First run: should execute tests
  "$SCRIPT_DIR/smoke-test.sh" "$TEST_DOMAIN" > /tmp/smoke-test-first.log 2>&1
  first_exit=$?

  # Second run: should hit cache (exit 2)
  "$SCRIPT_DIR/smoke-test.sh" "$TEST_DOMAIN" > /tmp/smoke-test-second.log 2>&1
  second_exit=$?

  if [[ $first_exit -eq 0 ]] && [[ $second_exit -eq 2 ]]; then
    echo "✓ Cache hit: Second run skipped tests"
  else
    echo "✗ Cache hit: Expected exit 0 then 2, got $first_exit then $second_exit"
    return 1
  fi

  # Cleanup
  rm -f .cache/smoke/last-tested-${TEST_DOMAIN}.json
}

test_parallel_vs_sequential() {
  echo "TEST: Parallel execution faster than sequential"

  # Parallel (15 workers)
  start=$(date +%s)
  "$SCRIPT_DIR/smoke-test.sh" --workers 15 --force "$TEST_DOMAIN" >/dev/null 2>&1
  parallel_duration=$(($(date +%s) - start))

  # Sequential (1 worker)
  start=$(date +%s)
  "$SCRIPT_DIR/smoke-test.sh" --sequential --force "$TEST_DOMAIN" >/dev/null 2>&1
  sequential_duration=$(($(date +%s) - start))

  if [[ $parallel_duration -lt $((sequential_duration / 2)) ]]; then
    echo "✓ Parallel ($parallel_duration s) faster than sequential ($sequential_duration s)"
  else
    echo "✗ Parallel not significantly faster: $parallel_duration vs $sequential_duration"
    return 1
  fi
}

test_json_output() {
  echo "TEST: Valid JSON structure"

  "$SCRIPT_DIR/smoke-test.sh" --force "$TEST_DOMAIN" >/dev/null 2>&1 || true

  # Find most recent log file
  latest_log=$(ls -t logs/smoke/smoke-*.json | head -1)

  # Validate JSON with jq
  if jq . "$latest_log" >/dev/null 2>&1; then
    echo "✓ JSON output valid"
  else
    echo "✗ JSON output invalid"
    return 1
  fi

  # Validate required fields
  if jq -e '.metadata.buildID' "$latest_log" >/dev/null 2>&1; then
    echo "✓ JSON contains metadata.buildID"
  else
    echo "✗ JSON missing metadata.buildID"
    return 1
  fi
}

test_error_logging() {
  echo "TEST: Full response dump on failure"

  # Mock 500 error by testing invalid domain (skip for now)
  # This would require setting up a test server
  echo "⊘ Error logging: Manual test required"
}

# Run all tests
main() {
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "Smoke Test Validation Suite"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""

  test_page_discovery
  test_cache_hit
  test_parallel_vs_sequential
  test_json_output
  test_error_logging

  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "Validation complete"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

main "$@"
```

### Performance Benchmark (scripts/smoke-test-benchmark.sh)

```bash
#!/usr/bin/env bash
# Benchmark parallel execution scaling

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOMAIN="${1:-prelaunch.bearlakecamp.com}"

echo "Benchmarking smoke-test.sh parallel execution"
echo "Domain: $DOMAIN"
echo ""
echo "Workers | Duration (seconds)"
echo "--------|-------------------"

for workers in 1 5 10 15 20 30; do
  start=$(date +%s)
  "$SCRIPT_DIR/smoke-test.sh" --workers "$workers" --force "$DOMAIN" >/dev/null 2>&1 || true
  duration=$(($(date +%s) - start))
  printf "%7d | %d\n" "$workers" "$duration"
done
```

---

## Implementation Sequence

### Validation Approach
- **Local manual testing** against prelaunch.bearlakecamp.com
- **Test harness** (`smoke-test.spec.sh`) validates script behavior
- **Real-world validation** by testing actual deployment
- **No Jest/Vitest** - bash script tested with bash

### Implementation Phases
1. **Phase 1A**: Page discovery + basic HTTP testing (REQ-001, REQ-002, REQ-005, REQ-006, REQ-007) - 0.8 SP
2. **Phase 1B**: Caching + build detection (REQ-003, REQ-004, REQ-015) - 0.8 SP
3. **Phase 1C**: Parallel execution (REQ-008) - 0.5 SP
4. **Phase 1D**: Output formatting (REQ-009, REQ-010, REQ-011) - 0.8 SP
5. **Phase 1E**: CLI interface (REQ-012, REQ-013, REQ-014) - 0.35 SP
6. **Phase 2** (Optional): Content validation (REQ-017, REQ-018, REQ-019) - 0.9 SP

---

## Acceptance Criteria (Overall)

### Must Have (Phase 1)
- [ ] Discovers all pages from navigation.yaml and content/pages/*.mdoc
- [ ] Detects broken navigation links
- [ ] Validates HTTP 200, minimum content, title tag
- [ ] Build-aware caching (skips redundant tests)
- [ ] Parallel execution (~2-3 seconds for 24 pages)
- [ ] Enhanced error logging with full response dumps
- [ ] JSON output for CI/AI parsing
- [ ] Human-readable console output
- [ ] CLI interface with flags (--force, --sequential, --verbose, --workers)

### Should Have (Phase 2 - Optional)
- [ ] Content validation via lynx text extraction
- [ ] Key phrase matching against .mdoc sources

### Nice to Have (Future)
- [ ] GitHub Actions workflow integration
- [ ] PR comment posting on failures
- [ ] Dynamic route testing (/staff/[slug])

---

**Lock Status**: Ready for Implementation

**Next Steps**:
1. Create validation test harness (smoke-test.spec.sh)
2. Implement smoke-test.sh in phases (1A → 1B → 1C → 1D → 1E)
3. Validate each phase with test harness
4. Deploy and test against live site
5. Document usage in operations guide
