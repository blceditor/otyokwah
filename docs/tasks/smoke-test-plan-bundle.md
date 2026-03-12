# Smoke Test System: Plan Bundle

**Task ID**: smoke-test-system-v1
**Date**: 2025-12-05
**Status**: Ready for Implementation
**Total Story Points**: 4.4 SP (3.5 SP Phase 1 MVP + 0.9 SP Phase 2 Optional)

---

## Quick Links

- **Design Document**: `/Users/travis/SparkryGDrive/dev/bearlakecamp/docs/technical/SMOKE-TEST-SYSTEM-DESIGN.md`
- **Requirements**: `/Users/travis/SparkryGDrive/dev/bearlakecamp/requirements/smoke-test-system.md`
- **Requirements Lock**: `/Users/travis/SparkryGDrive/dev/bearlakecamp/requirements/smoke-test-system.lock.md`
- **Implementation Plan**: `/Users/travis/SparkryGDrive/dev/bearlakecamp/docs/tasks/smoke-test-implementation-plan.md`

---

## Executive Summary

Production smoke test system for validating Vercel deployments. Tests all ~24 pages discovered from navigation.yaml and content files in **2-3 seconds** using parallel execution with build-aware caching.

**Key Features**:
- Two-source page discovery (navigation.yaml + content/*.mdoc)
- Broken navigation detection
- Build-aware caching (skips redundant tests)
- Parallel execution (15 workers default)
- Enhanced error logging with AI-debuggable output
- Zero external dependencies (curl, jq, yq only)
- GitHub Actions compatible

---

## Requirements Summary (21 Requirements)

### Phase 1: MVP (16 Requirements, 3.5 SP)

**Page Discovery & Validation** (0.8 SP):
- REQ-001: Two-source page discovery (navigation.yaml + content/) - 0.3 SP
- REQ-002: Broken navigation detection - 0.2 SP
- REQ-015: Auto-create cache/log directories - 0.05 SP
- REQ-016: Performance target <5 seconds - 0.3 SP validation

**HTTP Testing** (0.5 SP):
- REQ-005: HTTP 200 status validation - 0.3 SP
- REQ-006: Content length heuristic (≥500 bytes) - 0.1 SP
- REQ-007: Title tag validation - 0.1 SP

**Caching & Build Detection** (0.8 SP):
- REQ-003: Build ID detection via HTTP headers - 0.3 SP
- REQ-004: Build-aware caching - 0.5 SP

**Parallel Execution** (0.5 SP):
- REQ-008: Parallel test execution (15 workers) - 0.5 SP

**Output & Logging** (0.8 SP):
- REQ-009: Enhanced error logging - 0.3 SP
- REQ-010: JSON output format - 0.3 SP
- REQ-011: Human-readable console output - 0.2 SP

**CLI & Configuration** (0.35 SP):
- REQ-012: Exit code semantics (0/1/2) - 0.05 SP
- REQ-013: CLI interface (--force, --sequential, --verbose, --workers) - 0.2 SP
- REQ-014: Environment variable support - 0.1 SP

**Non-Functional**:
- REQ-021: Zero external dependencies (constraint)
- REQ-022: GitHub Actions compatibility (constraint)
- REQ-023: Maintainability (quality attribute)

### Phase 2: Content Validation (3 Requirements, 0.9 SP - Optional)
- REQ-017: HTML text extraction via lynx - 0.2 SP
- REQ-018: .mdoc content extraction - 0.2 SP
- REQ-019: Key phrase validation - 0.5 SP
- REQ-020: Performance target <0.5s overhead - validation

### Future Enhancements (4 Requirements, Deferred)
- REQ-FUT-001: Dynamic route testing (/staff/[slug])
- REQ-FUT-002: GitHub Actions workflow integration
- REQ-FUT-003: PR comment integration
- REQ-FUT-004: Content expectations file

---

## Parallel Implementation Strategy

### Agent Assignments

**Agent 1: Discovery & Validation Engineer** (1.3 SP)
- REQ-001, REQ-002, REQ-005, REQ-006, REQ-007, REQ-015
- Deliverable: Page discovery + `test_page()` function
- Duration: 1-2 hours
- Blockers: None

**Agent 2: Caching & Build Engineer** (0.8 SP)
- REQ-003, REQ-004
- Deliverable: Cache logic + build ID detection
- Duration: 1-2 hours
- Blockers: None

**Agent 3: Execution & Orchestration Engineer** (0.5 SP)
- REQ-008
- Deliverable: Parallel execution with xargs
- Duration: 1 hour
- Blockers: Agent 1 (needs page list and test function)

**Agent 4: Output & Logging Engineer** (0.8 SP)
- REQ-009, REQ-010, REQ-011
- Deliverable: JSON + console output formatters
- Duration: 1-2 hours
- Blockers: Agent 3 (needs test results)

**Agent 5: CLI & Integration Engineer** (0.35 SP)
- REQ-012, REQ-013, REQ-014
- Deliverable: Argument parsing + env var loading
- Duration: 30-60 minutes
- Blockers: None

### Execution Timeline

```
Phase 1A (Parallel) — Foundation [Day 1, AM]
├── Agent 1: Discovery + validation (1.3 SP) ─┐
├── Agent 2: Caching + build (0.8 SP)         ├─> ~2-3 hours
└── Agent 5: CLI interface (0.35 SP) ─────────┘

Phase 1B (Sequential) — Integration [Day 1, PM]
├── Agent 3: Parallel execution (0.5 SP) ──> ~1 hour [blocks on Agent 1]
└── Agent 4: Output formatting (0.8 SP) ───> ~1-2 hours [blocks on Agent 3]

Phase 1C (Integration Testing) [Day 1, EOD]
├── All Agents: Integration test
└── Bug fixes + edge cases ──> ~1 hour

Phase 2 (Optional) [Day 2+]
└── Agent 1: Content validation (0.9 SP) ──> ~1-2 hours
```

**Critical Path**: Agent 1 → Agent 3 → Agent 4 (2.6 SP, ~4-5 hours)
**Total Duration**: 1 day (MVP) + 0.5 day (optional)

---

## Test Strategy

### Validation Approach
**This is a testing tool**, so validation differs from typical TDD:
- **Test Harness**: `scripts/smoke-test.spec.sh` validates script behavior
- **Integration Tests**: `scripts/smoke-test-integration.sh` tests against live site
- **Performance Benchmark**: `scripts/smoke-test-benchmark.sh` measures scaling
- **Real-World Validation**: Run against prelaunch.bearlakecamp.com

### Test Matrix (96 Test Cases)
- T-001-01 through T-019-06: All requirements have 1-7 test cases
- **Coverage**: 100% of requirements (all 21 REQs)
- **Validation**: bash-based test harness (no Jest/Vitest)

---

## QShortcuts Sequence

### Planning Phase (DONE)
✓ **QPLAN**: This document (planner orchestrator)
- Requirements extraction: 21 REQs identified
- Story point estimation: 4.4 SP total
- Parallel agent assignment: 5 agents
- Interface contracts defined

### Implementation Phase (NEXT)
**QCODET**: Create validation test harness
- Agent: test-writer
- Deliverable: `scripts/smoke-test.spec.sh`
- Story Points: 0.5 SP (not in main plan)
- Blockers: None

**QCODE Phase 1A**: Foundation (parallel)
- Agents: 1, 2, 5 (discovery, caching, CLI)
- Deliverables: Core functions
- Story Points: 2.35 SP
- Duration: ~2-3 hours

**QCODE Phase 1B**: Integration (sequential)
- Agents: 3, 4 (execution, output)
- Deliverables: Parallel execution + output
- Story Points: 1.3 SP
- Duration: ~2-3 hours

**QCODE Phase 1C**: Integration testing
- All Agents: Validate end-to-end
- Deliverable: Working smoke test script
- Duration: ~1 hour

### Review Phase
**QCHECK**: PE review + code quality audit
- Agents: pe-reviewer, code-quality-auditor
- Focus: Bash script quality, edge cases, error handling
- No security-reviewer needed (read-only HTTP operations)

**QCHECKF**: Review functions
- Focus: test_page(), discover_pages(), caching logic
- Validation: Complexity, error handling, performance

### Documentation Phase
**QDOC**: Create usage guide
- Agent: docs-writer
- Deliverable: `docs/operations/SMOKE-TEST-USAGE.md`
- Content: How to run, interpret results, troubleshoot

### Deployment Phase
**QGIT**: Commit and tag
- Agent: release-manager
- Strategy: Commit per phase for granular rollback
- Tag: `smoke-test-v1.0`

### Optional Phase 2
**QCODE Phase 2**: Content validation
- Agent: 1 (reuse discovery engineer)
- Deliverables: Lynx integration + key phrase validation
- Story Points: 0.9 SP
- Duration: ~1-2 hours

---

## Deliverables Checklist

### Code Artifacts
- [ ] `scripts/smoke-test.sh` - Main test runner (Phase 1A-E)
- [ ] `scripts/smoke-test.spec.sh` - Validation test harness (QCODET)
- [ ] `scripts/smoke-test-integration.sh` - Integration tests (Phase 1C)
- [ ] `scripts/smoke-test-benchmark.sh` - Performance benchmark (Phase 1C)

### Directory Structure
- [ ] `.cache/smoke/` - Cache directory (auto-created by script)
- [ ] `logs/smoke/` - Log directory (auto-created by script)

### Requirements Documents
- [x] `requirements/smoke-test-system.md` - Requirements (DONE)
- [x] `requirements/smoke-test-system.lock.md` - Requirements lock (DONE)

### Design Documents
- [x] `docs/technical/SMOKE-TEST-SYSTEM-DESIGN.md` - Design (EXISTING)
- [x] `docs/tasks/smoke-test-implementation-plan.md` - Implementation plan (DONE)
- [x] `docs/tasks/smoke-test-plan-bundle.md` - This summary (DONE)

### Operations Documents
- [ ] `docs/operations/SMOKE-TEST-USAGE.md` - Usage guide (QDOC)

### Configuration
- [x] `.gitignore` - Exclude cache/logs (DONE)

---

## Success Metrics

### Performance KPIs
- **P50 test duration**: <3 seconds (24 pages, 15 workers)
- **P95 test duration**: <5 seconds
- **Cache hit rate**: >80% (avoid redundant testing)
- **Throughput**: ~8.5 pages/second (parallel)

### Quality KPIs
- **False positive rate**: <5% (tests pass but site broken)
- **False negative rate**: <1% (tests fail but site working)
- **Coverage**: 100% of discoverable pages (navigation + content)

### Developer Experience
- **Time to first feedback**: <10 seconds (local run)
- **CI feedback latency**: <20 seconds (GitHub Actions, future)
- **Maintenance effort**: <1 hour/month

---

## Interface Contracts

### smoke-test.sh Main Script

**Usage**:
```bash
scripts/smoke-test.sh [OPTIONS] <domain>

Arguments:
  domain              Target domain (e.g., prelaunch.bearlakecamp.com)

Options:
  --force             Ignore cache, run tests even if build validated
  --sequential        Disable parallelization (debugging)
  --verbose           Show curl output for each test
  --workers N         Number of parallel workers (default: 15)
  --help              Show help text

Environment Variables:
  SMOKE_TEST_WORKERS=15
  SMOKE_TEST_TIMEOUT=10
  SMOKE_TEST_LOG_DIR=logs/smoke

Exit Codes:
  0 = all tests passed
  1 = one or more failures
  2 = cache hit (build already tested)
```

**Output Files**:
```bash
.cache/smoke/last-tested-{domain}.json       # Cache file
logs/smoke/smoke-{timestamp}-{buildID}.json  # Test results
/tmp/smoke-error-{page}-{timestamp}.html     # Error dumps
```

---

## Dependencies

### Required Tools
```bash
# macOS
brew install jq yq

# Ubuntu/GitHub Actions
sudo apt-get install -y jq curl
wget https://github.com/mikefarah/yq/releases/download/v4.35.1/yq_linux_amd64 -O /usr/local/bin/yq
chmod +x /usr/local/bin/yq
```

### Optional Tools (Phase 2)
```bash
# macOS
brew install lynx

# Ubuntu
sudo apt-get install -y lynx
```

---

## Risk Mitigation

**Risk 1: yq YAML parsing fails**
- Mitigation: Test with sample navigation.yaml first; fallback to sed/awk

**Risk 2: Parallel execution race conditions**
- Mitigation: Use unique temp files per worker ($$); test sequential mode first

**Risk 3: Build ID header missing**
- Mitigation: Detect missing header and exit with clear error

**Risk 4: Performance target not met**
- Mitigation: Benchmark early; tune worker count; profile slow pages

---

## Rollback Plan

### Per-Phase Rollback
```bash
git revert <commit-hash>
git push origin main
```

### Full Rollback
```bash
git rm scripts/smoke-test*.sh
git commit -m "revert(smoke-test): remove smoke test system"
```

---

## Next Actions

1. **User Review**: Approve this plan and requirements
2. **QCODET**: Create validation test harness (`smoke-test.spec.sh`)
3. **QCODE Phase 1A**: Implement foundation (parallel agents 1, 2, 5)
4. **QCODE Phase 1B**: Implement integration (sequential agents 3, 4)
5. **QCODE Phase 1C**: Integration testing and bug fixes
6. **QCHECK**: PE review and code quality audit
7. **QDOC**: Create usage guide
8. **QGIT**: Commit in phases, tag v1.0
9. **Optional**: Implement Phase 2 content validation

---

## Acceptance Criteria for Plan Approval

**This plan is approved when**:
- [ ] User confirms understanding of scope (3.5 SP MVP)
- [ ] User confirms parallel agent approach acceptable
- [ ] User confirms lynx dependency acceptable for Phase 2
- [ ] User confirms 1-day implementation timeline acceptable
- [ ] User confirms test validation approach (bash harness) acceptable

**Implementation can begin when**:
- [ ] Plan approved by user
- [ ] Requirements locked (DONE)
- [ ] .gitignore updated (DONE)
- [ ] QCODET ready to create test harness

---

**Plan Status**: ✓ Complete, Ready for User Approval

**Total Artifacts Created**:
- 3 requirements documents (current.md, lock.md, this bundle)
- 1 implementation plan (detailed task breakdown)
- 1 .gitignore update (cache/logs exclusion)

**Total Story Points**: 4.4 SP (3.5 SP Phase 1 + 0.9 SP Phase 2)

**Estimated Implementation Time**: 1 day (MVP) + 0.5 day (optional content validation)
