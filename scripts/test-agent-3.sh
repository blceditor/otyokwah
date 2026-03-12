#!/usr/bin/env bash
# Integration test for Agent 3: Parallel Test Execution
# Verifies REQ-SMOKE-008 implementation

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Agent 3: Parallel Test Execution - Integration Tests"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 1: run_tests_parallel function exists
echo -e "${BLUE}[T-008-01]${NC} Verify run_tests_parallel function exists"
TESTS_RUN=$((TESTS_RUN + 1))
if bash -c "source $SCRIPT_DIR/smoke-test.sh && declare -f run_tests_parallel > /dev/null 2>&1"; then
  echo -e "${GREEN}✓${NC} PASS: run_tests_parallel function is defined"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}✗${NC} FAIL: run_tests_parallel function not found"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo ""

# Test 2: aggregate_test_results function exists
echo -e "${BLUE}[T-008-02]${NC} Verify aggregate_test_results function exists"
TESTS_RUN=$((TESTS_RUN + 1))
if bash -c "source $SCRIPT_DIR/smoke-test.sh && declare -f aggregate_test_results > /dev/null 2>&1"; then
  echo -e "${GREEN}✓${NC} PASS: aggregate_test_results function is defined"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}✗${NC} FAIL: aggregate_test_results function not found"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo ""

# Test 3: Parallel execution completes successfully
echo -e "${BLUE}[T-008-03]${NC} Parallel execution completes successfully (5 workers)"
TESTS_RUN=$((TESTS_RUN + 1))
if bash "$SCRIPT_DIR/smoke-test.sh" --workers 5 prelaunch.bearlakecamp.com >/dev/null 2>&1; then
  exit_code=$?
  if [[ $exit_code -eq 0 ]]; then
    echo -e "${GREEN}✓${NC} PASS: Parallel execution succeeded (exit 0)"
    TESTS_PASSED=$((TESTS_PASSED + 1))
  else
    echo -e "${RED}✗${NC} FAIL: Parallel execution failed (exit $exit_code)"
    TESTS_FAILED=$((TESTS_FAILED + 1))
  fi
else
  echo -e "${RED}✗${NC} FAIL: Parallel execution failed"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo ""

# Test 4: Sequential mode works
echo -e "${BLUE}[T-008-04]${NC} Sequential mode executes correctly"
TESTS_RUN=$((TESTS_RUN + 1))
if bash "$SCRIPT_DIR/smoke-test.sh" --sequential prelaunch.bearlakecamp.com >/dev/null 2>&1; then
  exit_code=$?
  if [[ $exit_code -eq 0 ]]; then
    echo -e "${GREEN}✓${NC} PASS: Sequential execution succeeded (exit 0)"
    TESTS_PASSED=$((TESTS_PASSED + 1))
  else
    echo -e "${RED}✗${NC} FAIL: Sequential execution failed (exit $exit_code)"
    TESTS_FAILED=$((TESTS_FAILED + 1))
  fi
else
  echo -e "${RED}✗${NC} FAIL: Sequential execution failed"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo ""

# Test 5: Parallel is faster than sequential
echo -e "${BLUE}[T-008-05]${NC} Parallel execution is faster than sequential"
TESTS_RUN=$((TESTS_RUN + 1))

# Measure sequential
start=$(date +%s)
bash "$SCRIPT_DIR/smoke-test.sh" --sequential prelaunch.bearlakecamp.com >/dev/null 2>&1 || true
sequential_duration=$(($(date +%s) - start))

# Measure parallel (15 workers)
start=$(date +%s)
bash "$SCRIPT_DIR/smoke-test.sh" --workers 15 prelaunch.bearlakecamp.com >/dev/null 2>&1 || true
parallel_duration=$(($(date +%s) - start))

echo "  Sequential: ${sequential_duration}s"
echo "  Parallel:   ${parallel_duration}s"

if [[ $parallel_duration -le $sequential_duration ]]; then
  if [[ $parallel_duration -gt 0 ]]; then
    speedup=$(echo "scale=2; $sequential_duration / $parallel_duration" | bc)
    echo -e "${GREEN}✓${NC} PASS: Parallel is ${speedup}x faster than sequential"
  else
    echo -e "${GREEN}✓${NC} PASS: Parallel <= sequential (both very fast)"
  fi
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}✗${NC} FAIL: Parallel not faster than sequential"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo ""

# Test 6: Verify all pages tested in parallel mode
echo -e "${BLUE}[T-008-06]${NC} Parallel mode tests all discovered pages"
TESTS_RUN=$((TESTS_RUN + 1))

output=$(bash "$SCRIPT_DIR/smoke-test.sh" --workers 15 prelaunch.bearlakecamp.com 2>&1)
discovered=$(echo "$output" | grep "Total pages discovered:" | awk '{print $4}')
tested=$(echo "$output" | grep "Total tests executed:" | awk '{print $4}')

if [[ "$discovered" == "$tested" ]]; then
  echo -e "${GREEN}✓${NC} PASS: Tested all $tested discovered pages"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}✗${NC} FAIL: Discovered $discovered pages but only tested $tested"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo ""

# Test 7: Workers flag changes worker count
echo -e "${BLUE}[T-008-07]${NC} --workers flag changes parallelization"
TESTS_RUN=$((TESTS_RUN + 1))

# Test with different worker counts and measure time
start=$(date +%s)
bash "$SCRIPT_DIR/smoke-test.sh" --workers 1 prelaunch.bearlakecamp.com >/dev/null 2>&1 || true
workers_1=$(($(date +%s) - start))

start=$(date +%s)
bash "$SCRIPT_DIR/smoke-test.sh" --workers 10 prelaunch.bearlakecamp.com >/dev/null 2>&1 || true
workers_10=$(($(date +%s) - start))

echo "  Workers=1:  ${workers_1}s"
echo "  Workers=10: ${workers_10}s"

if [[ $workers_10 -le $workers_1 ]]; then
  echo -e "${GREEN}✓${NC} PASS: Higher worker count improves performance"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}✗${NC} FAIL: Worker count doesn't affect performance as expected"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo ""

# Test 8: Performance target (<5 seconds for 24 pages)
echo -e "${BLUE}[T-008-08]${NC} Performance target: <5 seconds for ~24 pages (15 workers)"
TESTS_RUN=$((TESTS_RUN + 1))

start=$(date +%s)
bash "$SCRIPT_DIR/smoke-test.sh" --workers 15 prelaunch.bearlakecamp.com >/dev/null 2>&1 || true
duration=$(($(date +%s) - start))

echo "  Duration: ${duration}s"

if [[ $duration -lt 5 ]]; then
  echo -e "${GREEN}✓${NC} PASS: Performance target met (${duration}s < 5s)"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}✗${NC} FAIL: Performance target missed (${duration}s >= 5s)"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Total tests:  $TESTS_RUN"
echo -e "${GREEN}Passed:${NC}       $TESTS_PASSED"
echo -e "${RED}Failed:${NC}       $TESTS_FAILED"
echo ""

if [[ $TESTS_FAILED -eq 0 ]]; then
  echo -e "${GREEN}✓ All Agent 3 tests passed!${NC}"
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  exit 0
else
  echo -e "${RED}✗ Some Agent 3 tests failed${NC}"
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  exit 1
fi
