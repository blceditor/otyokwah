# Parallel Execution Race Condition Fix

**Date**: 2025-12-05
**Issue**: Only 8/24 pages tested in parallel mode
**Root Cause**: stdout race condition causing JSON output merging
**Fix**: File-based result collection
**Status**: ✅ FIXED

---

## Problem Description

### User Report
"The production test only tested 7 pages"

### Actual Symptom
When running smoke tests in parallel mode (default 15 workers), only 8 out of 24 discovered pages were being tested and reported.

### Root Cause Analysis

**Parallel Execution Flow (BROKEN)**:
```
Page Discovery: 24 pages discovered ✓
Build ID Detection: Working ✓
Parallel Execution: 15 workers started ✓
├─ Worker 1: test_page("/") → stdout: {"page":"/"...}
├─ Worker 2: test_page("/about") → stdout: {"page":"/about"...}
├─ Workers write simultaneously → RACE CONDITION
└─ Result: Merged JSON on stdout

Invalid JSON examples:
{"page":"/","status":200...}{"page":"/contact"...}  # No newline
{"page":"/facilities"...{"page":"/retreats"...}     # Concatenated
"title":"Summer Camp"...}                            # Fragment only
```

**Aggregation (scripts/smoke-test.sh:532-537)**:
```bash
if ! echo "$line" | jq . >/dev/null 2>&1; then
  if [[ "${VERBOSE_MODE:-0}" -eq 1 ]]; then
    echo "WARNING: Skipping invalid JSON result: $line" >&2
  fi
  continue  # P1-5 fix correctly skips invalid JSON
fi
```

**Result**: Only 8 valid JSON lines → **8/24 tests reported** instead of 24/24

---

## Solution Implementation

### Change Summary
Modified `run_tests_parallel()` function in `/Users/travis/SparkryGDrive/dev/bearlakecamp/scripts/smoke-test.sh` (lines 488-532) to use file-based output instead of stdout.

### Before (Lines 499-512)
```bash
else
  # Parallel execution with xargs
  if [[ "${VERBOSE_MODE:-0}" -eq 1 ]]; then
    echo "Running tests in parallel (WORKER_COUNT=$WORKER_COUNT)..." >&2
  fi

  # Use xargs -P for parallelization
  export -f test_page
  export DOMAIN
  cat "$pages_file" | xargs -P "$WORKER_COUNT" -n 1 bash -c 'test_page "$1" "$DOMAIN"' _
fi
```

**Problem**: All workers write JSON to stdout simultaneously → output merging

### After (Lines 499-531)
```bash
else
  # Parallel execution with xargs using file-based output to prevent race conditions
  if [[ "${VERBOSE_MODE:-0}" -eq 1 ]]; then
    echo "Running tests in parallel (WORKER_COUNT=$WORKER_COUNT)..." >&2
  fi

  # Create temp directory for results
  local results_dir=$(mktemp -d)

  # Use xargs -P for parallelization with file-based output
  # Each worker writes to a separate file to prevent stdout race conditions
  export -f test_page
  export DOMAIN
  export RESULTS_DIR="$results_dir"

  cat "$pages_file" | xargs -P "$WORKER_COUNT" -n 1 bash -c '
    page="$1"
    # Sanitize page for filename (prevent path traversal)
    safe_page=$(echo "$page" | sed "s|[^a-zA-Z0-9]|-|g")
    # Use unique PID to prevent file collisions
    result_file="$RESULTS_DIR/result-${safe_page}-$$.json"
    test_page "$page" "$DOMAIN" > "$result_file"
  ' _

  # Concatenate all result files to stdout
  cat "$results_dir"/result-*.json 2>/dev/null || true

  # Cleanup temp directory
  rm -rf "$results_dir"
fi
```

**Solution**: Each worker writes to separate file → no race conditions → all results captured

---

## Technical Details

### File-Based Result Collection

**Per-Worker Process**:
1. Receive page parameter: `page="$1"`
2. Sanitize page slug for filename: `safe_page=$(echo "$page" | sed "s|[^a-zA-Z0-9]|-|g")`
3. Create unique result file: `result_file="$RESULTS_DIR/result-${safe_page}-$$.json"`
4. Write test result to file: `test_page "$page" "$DOMAIN" > "$result_file"`

**Example Files Created**:
```
/tmp/tmp.abc123/result----$WORKER_PID.json          # For "/"
/tmp/tmp.abc123/result-about-$WORKER_PID.json       # For "/about"
/tmp/tmp.abc123/result-facilities-cabins-$WORKER_PID.json  # For "/facilities-cabins"
```

**Result Aggregation**:
```bash
cat "$results_dir"/result-*.json 2>/dev/null || true
```

**Cleanup**:
```bash
rm -rf "$results_dir"
```

### Security Considerations

**Path Traversal Prevention**:
```bash
safe_page=$(echo "$page" | sed "s|[^a-zA-Z0-9]|-|g")
```

Prevents attacks like:
- `/../../../etc/passwd` → `----------etc-passwd`
- `/admin;rm -rf /` → `-admin-rm--rf--`

**PID Collision Prevention**:
```bash
result_file="$RESULTS_DIR/result-${safe_page}-$$.json"
```

Each worker process has unique `$$` (PID), preventing file collisions even for same page.

---

## Verification Results

### Test 1: Force Mode (Bypass Cache)
```bash
./scripts/smoke-test.sh --force --verbose prelaunch.bearlakecamp.com
```

**Output**:
```
Discovered 24 pages
Build ID: pdx1::hzr5v-1764973901361-a365af6fe6cc
Running tests (workers: 15)...

✓ / (200, 41330 bytes, "Bear Lake Camp - Where Faith Grows Wild")
✓ /about (200, 28452 bytes, "About Bear Lake Camp - Our History & Mission")
✓ /contact (200, 39299 bytes, "Contact Bear Lake Camp - Get in Touch")
[... 21 more pages ...]

RESULT: 24/24 tests passed (100.00%)
Duration: 0 seconds
```

✅ **All 24 pages tested**

### Test 2: Normal Mode (With Caching)
```bash
./scripts/smoke-test.sh prelaunch.bearlakecamp.com
```

**Output**:
```
✓ / (200, 41330 bytes, "Bear Lake Camp - Where Faith Grows Wild")
✓ /about (200, 28452 bytes, "About Bear Lake Camp - Our History & Mission")
[... 22 more pages ...]

RESULT: 24/24 tests passed (100.00%)
Duration: 0 seconds
```

✅ **All 24 pages tested**

---

## Performance Impact

### Before Fix
- **Parallel execution**: ~1 second
- **Pages tested**: 8/24 (33%)
- **Invalid JSON warnings**: Many
- **Accuracy**: ❌ BROKEN

### After Fix
- **Parallel execution**: ~0-1 seconds (no change)
- **Pages tested**: 24/24 (100%)
- **Invalid JSON warnings**: None
- **Accuracy**: ✅ CORRECT

**Conclusion**: Fix has **no performance impact** while ensuring **100% test coverage**

---

## Files Modified

- `/Users/travis/SparkryGDrive/dev/bearlakecamp/scripts/smoke-test.sh` (lines 488-532)

---

## Related Issues

### Known Issues (RESOLVED)
- **P1-5: JSON Validation Continue** (scripts/smoke-test.sh:532-537) - Was correctly filtering invalid JSON, but root cause was parallel race condition producing invalid output
- **Parallel Mode JSON Output Race Condition** (mentioned in docs/tasks/SMOKE-TEST-PE-FIXES-SUMMARY.md:188-208) - Marked as "minor" but actually caused 67% test loss

### Documentation Updates
- Updated `/Users/travis/SparkryGDrive/dev/bearlakecamp/docs/tasks/SMOKE-TEST-PE-FIXES-SUMMARY.md` to note race condition is now FIXED
- Created this document: `/Users/travis/SparkryGDrive/dev/bearlakecamp/docs/tasks/PARALLEL-RACE-CONDITION-FIX.md`

---

## Lessons Learned

1. **stdout is not thread-safe**: Multiple processes writing to stdout simultaneously will have output merging
2. **File-based result collection**: Superior pattern for parallel execution results
3. **Error filtering != fix**: P1-5 correctly filtered invalid JSON, but masked the real problem
4. **User reports are critical**: "Only tested 7 pages" was accurate - 8/24 = 33% coverage

---

## Next Steps

None required - fix is complete and verified.

**Future Enhancements** (Optional):
- Consider named pipes (FIFOs) for lower disk I/O
- Add performance metrics to log files
- Monitor temp directory space usage for large test suites
