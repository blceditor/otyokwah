# Requirements Lock: T3 Validation Orchestration Layer

> Locked: 2025-12-11
> Version: 1.0.0
> Depends on: T1 (21 scripts), T2 (5 scripts) - 216 tests passing

---

## Context

T1 completed: 18 implementation scripts (next-route-validator, keystatic-schema-validator, component-isolator, etc.)
T2 completed: 5 security/quality scripts (cyclomatic-complexity, dependency-risk, secret-scanner, injection-detector, auth-flow-validator)

Total: 23 scripts, 216 passing tests

**Gap**: No unified way to run all validators in CI/pre-commit/production flow

---

## REQ-VAL-001: Unified Validator Runner
- **Acceptance**: Single command runs all validators with consolidated output
- **Deliverable**: `scripts/validation/validator_runner.py`
- **Features**:
  - Runs all scripts in `scripts/implementation/` (excluding `_spec.py`)
  - Parallel execution where possible
  - Consolidated JSON output: `{script, status, issues[], duration_ms}`
  - Markdown summary report
  - Exit code: 0 if all pass, 1 if any fail
- **Test Requirements**:
  - Test with mock scripts (success/failure/timeout)
  - Test parallel execution (≥2 scripts run concurrently)
  - Test JSON output schema validation
  - Test markdown report generation
  - Test timeout handling (default 30s per script)

---

## REQ-VAL-002: CI Integration
- **Acceptance**: GitHub Actions workflow runs validators on every PR
- **Deliverable**: `.github/workflows/validation.yml`
- **Features**:
  - Triggers on: push to main, pull requests
  - Runs `validator_runner.py` with production paths
  - Uploads validation report as artifact
  - Fails PR if critical issues found
  - Caches Python dependencies
- **Test Requirements**:
  - Workflow syntax validation (`actionlint` or similar)
  - Test report artifact upload (mock run)
  - Test failure detection (inject failing script)

---

## REQ-VAL-003: Pre-Commit Hook Integration
- **Acceptance**: Validators run automatically before git commit
- **Deliverable**: `scripts/validation/pre_commit_hook.py`
- **Features**:
  - Detects modified files (`git diff --cached --name-only`)
  - Runs only relevant validators (e.g., only run `next_route_validator.py` if `.ts` files changed)
  - Fast feedback (<10s for typical commit)
  - Allows bypass with `git commit --no-verify` (but warns)
  - Logs run to `.cache/validation/pre-commit-runs.jsonl`
- **Test Requirements**:
  - Test modified file detection
  - Test validator selection logic
  - Test bypass flag handling
  - Test JSONL logging

---

## REQ-VAL-004: Report Aggregation
- **Acceptance**: Combined JSON and markdown output from all validators
- **Deliverable**: `scripts/validation/report_aggregator.py`
- **Features**:
  - **JSON Output** (`validation-report.json`):
    ```json
    {
      "timestamp": "2025-12-11T10:30:00Z",
      "total_scripts": 23,
      "passed": 20,
      "failed": 3,
      "duration_ms": 4532,
      "results": [
        {
          "script": "cyclomatic_complexity.py",
          "status": "failed",
          "issues": [
            {
              "severity": "high",
              "file": "app/utils/complex.ts",
              "line": 42,
              "message": "Function calculatePrice has complexity 18 (threshold: 10)"
            }
          ],
          "duration_ms": 234
        }
      ]
    }
    ```
  - **Markdown Output** (`validation-report.md`):
    - Executive summary (passed/failed counts)
    - Issues grouped by severity (critical, high, medium, low)
    - Per-script details
    - Recommendations section
- **Test Requirements**:
  - Test JSON schema validation
  - Test markdown formatting
  - Test severity grouping
  - Test empty results handling

---

## REQ-VAL-005: Incremental Validation
- **Acceptance**: Only validate changed files, not entire codebase
- **Deliverable**: Enhancement to `validator_runner.py`
- **Features**:
  - `--incremental` flag uses `git diff` to find changed files
  - Pass only changed files to each validator
  - Fallback to full validation if git unavailable
  - Track previous validation state in `.cache/validation/last-run.json`
- **Test Requirements**:
  - Test git diff parsing
  - Test changed file filtering
  - Test fallback to full validation
  - Test state file creation/reading

---

## Story Points

| Deliverable | SP | Notes |
|-------------|-----|-------|
| REQ-VAL-001: Validator Runner | 3 | Parallel execution, JSON/markdown output |
| REQ-VAL-002: CI Integration | 2 | GitHub Actions workflow, artifact upload |
| REQ-VAL-003: Pre-Commit Hook | 2 | File detection, validator selection |
| REQ-VAL-004: Report Aggregation | 2 | JSON schema, markdown formatting |
| REQ-VAL-005: Incremental Validation | 2 | Git integration, state tracking |
| **T3 Total** | **11** | |

---

## Test Coverage Requirements

- Each script has co-located `_spec.py` test file
- Minimum 5 test cases per script (success, failure, edge cases)
- Integration test: Run validator_runner on actual codebase
- CI test: Mock GitHub Actions environment

---

## Success Criteria

1. ✅ `scripts/validation/validator_runner.py --help` shows usage
2. ✅ `scripts/validation/validator_runner.py` runs all 23 scripts, exits 0
3. ✅ `validation-report.json` has valid schema
4. ✅ `validation-report.md` is readable, shows issues
5. ✅ `.github/workflows/validation.yml` passes on PR
6. ✅ Pre-commit hook runs in <10s for typical commit
7. ✅ Incremental validation only runs on changed files
8. ✅ All tests passing: `pytest scripts/validation/*_spec.py`

---

## Non-Goals (Out of Scope for T3)

- Visual validation (component presence checking) - Deferred to T4
- Production deployment validation - Exists in `smoke-test.sh`
- Auto-fix integration - Separate workstream
- Custom validator configuration UI - Use CLI flags/env vars

---

## Dependencies

- T1 scripts: Must be executable, have consistent CLI interface
- T2 scripts: Must output JSON when called with `--json` flag
- Git: Pre-commit hook requires git repository
- GitHub Actions: CI integration requires GitHub-hosted repo

---

## Interface Contract

All validators MUST support:
```bash
# Run validator
python3 scripts/implementation/<script>.py <target>

# JSON output mode
python3 scripts/implementation/<script>.py <target> --json

# Exit codes
# 0 = no issues
# 1 = issues found
# 2 = script error (e.g., invalid path)
```

---

**Locked By**: COS (T3 Orchestration Sprint)
**Approved**: Pending QPLAN review
