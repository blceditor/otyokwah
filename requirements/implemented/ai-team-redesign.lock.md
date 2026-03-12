# Requirements Lock: AI Team Redesign for TDD Excellence

> Locked: 2025-12-11
> Version: 1.0.0

---

## REQ-TEAM-001: Technology Specialist Agents
- **Acceptance**: 3 specialist agents exist with full ownership mandates
- **Deliverables**:
  - `.claude/agents/nextjs-vercel-specialist.md` ✅ EXISTS
  - `.claude/agents/keystatic-specialist.md` ✅ EXISTS
  - `.claude/agents/react-frontend-specialist.md` ✅ EXISTS
- **Non-Goals**: Not implementing reviewer agents in this phase

## REQ-TEAM-002: Pattern Libraries (8 core)
- **Acceptance**: 8 pattern library files exist and are loadable by specialists
- **Deliverables**:
  - `.claude/patterns/nextjs/app-router-patterns.md`
  - `.claude/patterns/nextjs/metadata-generation.md`
  - `.claude/patterns/nextjs/server-components-best-practices.md`
  - `.claude/patterns/keystatic/schema-design-patterns.md`
  - `.claude/patterns/keystatic/field-types-reference.md`
  - `.claude/patterns/react/server-client-components.md`
  - `.claude/patterns/tailwind/responsive-design-patterns.md`
  - `.claude/patterns/accessibility/wcag-compliance.md`
- **Non-Goals**: Not implementing Vercel deployment patterns in Phase 1

## REQ-TEAM-003: Implementation Scripts (21 for T1)
- **Acceptance**: Each script is TDD-built, executable, and passes tests
- **Scripts per specialist**:
  - nextjs-vercel-specialist: 8 scripts
  - keystatic-specialist: 6 scripts
  - react-frontend-specialist: 7 scripts
- **Test requirement**: Each script has co-located `.spec.py` test file

## REQ-TEAM-004: Process Cleanup
- **Acceptance**: No orphaned processes after workflow execution
- **Deliverables**:
  - Process cleanup script or hook
  - Automatic cleanup on VSCode crash
- **Non-Goals**: Not implementing full process monitoring daemon

## REQ-TEAM-005: Validation Scripts (T3)
- **Acceptance**: Production validation runs autonomously with machine-verifiable proof
- **Deliverables**:
  - `scripts/validation/component-presence-validator.py`
  - `scripts/validation/dom-snapshot-differ.py`
  - Integration with `smoke-test.sh`
- **Non-Goals**: Visual regression testing (only component presence)

## REQ-TEAM-006: Closed Loop System
- **Acceptance**: After requirements given, AI can iterate until production matches requirements
- **Deliverables**:
  - Enhanced `scripts/post-commit-validate.sh`
  - Diagnosis agent integration
  - Autofix agent integration
- **Non-Goals**: Full human replacement (escalation path must exist)

---

## Implementation Phases

### Phase 1: T1 Specialists (This Sprint)
- REQ-TEAM-002: Pattern Libraries (8 files)
- REQ-TEAM-003: Implementation Scripts (21 scripts)
- REQ-TEAM-004: Process Cleanup

### Phase 2: T2 Reviewers (Next Sprint)
- Architecture reviewer agents (3)
- Quality scripts (13)

### Phase 3: T3 Validation (Final Sprint)
- REQ-TEAM-005: Validation Scripts
- REQ-TEAM-006: Closed Loop System

---

## Story Points

| Deliverable | SP |
|-------------|-----|
| Pattern Libraries (8) | 8 |
| T1 Scripts (21) | 21 |
| Process Cleanup | 2 |
| **Phase 1 Total** | **31** |

---

## Test Coverage Requirements

- Pattern libraries: Verified by existence check + specialist can load
- Scripts: Each has `.spec.py` with ≥1 test case
- Process cleanup: Integration test with orphaned process detection

---

**Locked By**: AI Team Redesign Initiative
**Approved**: Pending user confirmation
