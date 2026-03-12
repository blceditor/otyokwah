# Requirements Lock - Keystatic Integration Test Fixes

**Task ID**: TASK-2025-11-22-FIX-KEYSTATIC-INTEGRATION-TESTS
**Snapshot Date**: 2025-11-22
**Status**: READY FOR EXECUTION
**Total Story Points**: 8 SP
**Context**: P0 fix for QCHECKT-identified test crashes and API conflicts

---

## REQ-FIX-001: Remove Failing Import Tests

**Status**: ❌ Not Started
**Story Points**: 2 SP
**Priority**: P0 - Critical

### Description

Remove or disable integration tests that crash on import because they reference a non-existent `KeystaticWrapper` component. Tests cannot run if they crash before execution.

### Acceptance Criteria

- [ ] `npm test` runs without module import errors
- [ ] No references to `../KeystaticWrapper` or `./KeystaticWrapper` in test files
- [ ] Test suite executes (even if some tests are marked as skipped/pending)
- [ ] Console output shows tests running, not import crashes

### Files Affected

**To Delete or Disable**:
- `app/keystatic/__tests__/KeystaticWrapper.integration.test.tsx`
- `app/keystatic/[[...params]]/__tests__/page.integration.test.tsx`
- `app/keystatic/__tests__/keystatic-route.e2e.test.tsx`

### Implementation Options

**Option A: Delete files** (RECOMMENDED)
- Remove test files entirely
- Clean approach
- No maintenance burden

**Option B: Disable with skip**
```typescript
describe.skip('REQ-INTEGRATE-001 — KeystaticWrapper (BLOCKED)', () => {
  // Tests here - marked as skipped
  // Reason: Keystatic API does not support ui.header customization
});
```

### Non-Goals

- Rewriting tests to work around limitations (Phase 2)
- Creating KeystaticWrapper component (not possible with Keystatic API)
- Mocking non-existent components (defeats purpose of integration tests)

### Verification

**Before**:
```bash
npm test
# Error: Cannot find module '../KeystaticWrapper'
# CRASHES before running any tests
```

**After**:
```bash
npm test
# ✓ All test files load
# Tests run (pass or fail, but don't crash on import)
```

---

## REQ-FIX-002: Update Config Integration Tests

**Status**: ❌ Not Started
**Story Points**: 2 SP
**Priority**: P0 - Critical

### Description

Update `keystatic.config.integration.test.ts` to test Keystatic's ACTUAL API capabilities, not non-existent `ui.header` properties. Tests should verify what IS supported: `ui.brand` and `ui.navigation`.

### Acceptance Criteria

- [ ] No tests for `config.ui.header` (property doesn't exist)
- [ ] Tests verify `config.ui.brand` structure (if used)
- [ ] Tests verify `config.storage` is valid
- [ ] Tests verify `config.collections` structure
- [ ] All tests pass
- [ ] Tests serve as API documentation

### Current Test Problems

**Line 12-15** (incorrect):
```typescript
test('config has ui.header property', () => {
  expect(keystaticConfig.ui?.header).toBeDefined(); // FAILS - property doesn't exist
});
```

**Problem**: Tests for API that doesn't exist in Keystatic v0.5.48

### Corrected Tests

```typescript
describe("REQ-FIX-002 — Keystatic Config API Verification", () => {
  test('config can be imported without errors', () => {
    expect(keystaticConfig).toBeDefined();
    expect(typeof keystaticConfig).toBe('object');
  });

  test('config has required storage property', () => {
    expect(keystaticConfig.storage).toBeDefined();
    expect(keystaticConfig.storage.kind).toMatch(/^(local|github)$/);
  });

  test('config has collections', () => {
    expect(keystaticConfig.collections).toBeDefined();
    expect(keystaticConfig.collections.pages).toBeDefined();
    expect(keystaticConfig.collections.staff).toBeDefined();
  });

  test('config ui property matches Keystatic API (if present)', () => {
    // Keystatic supports ui.brand and ui.navigation ONLY
    // ui.header does NOT exist
    if (keystaticConfig.ui) {
      expect(keystaticConfig.ui).toHaveProperty('brand');
      expect(keystaticConfig.ui).not.toHaveProperty('header'); // Verify NOT present
    }
  });

  test('storage config returns correct type for test environment', () => {
    const storage = getStorageConfig();
    expect(storage.kind).toBe('local'); // Test env uses local storage
  });
});
```

### Non-Goals

- Adding `ui.header` to config (API doesn't support it)
- Creating custom Keystatic UI (out of scope)
- Testing Keystatic internals (test our config, not their code)

### Verification

```bash
npm test keystatic.config.integration.test.ts
# ✓ All tests pass
# ✓ No tests for non-existent APIs
# ✓ Tests document actual capabilities
```

---

## REQ-FIX-003: Update Requirements Documentation

**Status**: ❌ Not Started
**Story Points**: 1 SP
**Priority**: P0 - Critical

### Description

Update requirements documents to reflect the technical constraint that Keystatic's API does NOT support custom header components via `ui.header` or wrapper patterns.

### Acceptance Criteria

- [ ] `keystatic-integration.lock.md` updated with "BLOCKED" status
- [ ] Clear statement: "Keystatic v0.5.48 does not support ui.header"
- [ ] Alternative approaches documented
- [ ] CAPA report updated with resolution path
- [ ] Stakeholders informed of constraints

### Files to Update

**1. `requirements/keystatic-integration.lock.md`**

Add to REQ-INTEGRATE-001 and REQ-INTEGRATE-002:

```markdown
**Status**: ⛔ BLOCKED - API Limitation
**Blocker**: Keystatic v0.5.48 does not support custom header components

### API Limitation

Research into Keystatic's type definitions (`@keystatic/core/dist/declarations/src/config.d.ts`) confirms that the `ui` configuration object supports ONLY:
- `ui.brand.name` - Brand name string
- `ui.brand.mark` - Custom logo component
- `ui.navigation` - Custom navigation structure

The `ui.header` property referenced in requirements **DOES NOT EXIST** in Keystatic's API.

### Alternative Approaches

**Option 1: Separate Admin Tools Page** (5 SP)
- Create `/keystatic-tools` route
- Display ProductionLink, DeploymentStatus, BugReportModal, etc.
- Link from Keystatic to tools page
- Components remain useful, just not in Keystatic header

**Option 2: Wait for API Update** (0 SP, unknown timeline)
- Monitor Keystatic releases for header customization support
- Revisit integration when/if API updated

**Option 3: Custom CMS** (100+ SP, not recommended)
- Replace Keystatic entirely
- Build custom admin UI
- Full control, but massive effort
```

**2. `docs/project/CAPA-2025-11-22-KEYSTATIC-INTEGRATION-FAILURE.md`**

Add resolution section:

```markdown
## Resolution: Technical Constraint Identified

**Date**: 2025-11-22
**Finding**: Keystatic API does not support custom header components

### Root Cause Update

Original CAPA identified process gaps (missing integration tests, unclear requirements). Subsequent research revealed a deeper issue: **the integration pattern specified in requirements is technically impossible with Keystatic v0.5.48**.

**Evidence**:
- Type definition (`@keystatic/core/dist/declarations/src/config.d.ts`, lines 48-54) shows `ui` object supports ONLY `brand` and `navigation` properties
- `ui.header` property does not exist
- `makePage()` function returns black-box component, no wrapper pattern support

### Corrective Action

**Phase 1 (8 SP)**: Fix test infrastructure
- Remove tests for non-existent components
- Update tests to verify actual API
- Document constraints

**Phase 2 (TBD)**: Deliver value within constraints
- Separate `/keystatic-tools` page with components
- OR wait for Keystatic API updates
- Stakeholder decision required
```

### Non-Goals

- Arguing with technical reality (API doesn't support it, end of story)
- Proposing impossible solutions
- Hiding constraints from stakeholders

### Verification

- [ ] Requirements clearly state "BLOCKED" with reason
- [ ] Alternative approaches proposed
- [ ] Stakeholders acknowledge constraint
- [ ] Future engineers warned about limitation

---

## REQ-FIX-004: Create Minimal Passing Integration Tests

**Status**: ❌ Not Started
**Story Points**: 2 SP
**Priority**: P0 - Critical

### Description

Create new integration tests that verify what IS possible with Keystatic's actual API: config structure, storage modes, brand customization, and `makePage()` integration.

### Acceptance Criteria

- [ ] New test file: `keystatic.config.brand.test.ts`
- [ ] Tests verify config imports without errors
- [ ] Tests verify storage configuration
- [ ] Tests verify `makePage()` returns valid component
- [ ] Tests verify brand customization (if used)
- [ ] All tests pass
- [ ] Tests serve as API usage examples

### New Test File

**File**: `keystatic.config.brand.test.ts`

```typescript
// REQ-FIX-004: Keystatic API Capability Tests
import { describe, test, expect } from "vitest";
import keystaticConfig, { getStorageConfig } from "./keystatic.config";
import { makePage } from "@keystatic/next/ui/app";
import { config } from "@keystatic/core";

describe("REQ-FIX-004 — Keystatic API Capabilities", () => {
  test("config can be imported without errors", () => {
    expect(keystaticConfig).toBeDefined();
    expect(typeof keystaticConfig).toBe("object");
  });

  test("config has valid storage configuration", () => {
    expect(keystaticConfig.storage).toBeDefined();
    expect(keystaticConfig.storage).toHaveProperty("kind");
    expect(["local", "github"]).toContain(keystaticConfig.storage.kind);
  });

  test("config has required collections", () => {
    expect(keystaticConfig.collections).toBeDefined();
    expect(keystaticConfig.collections.pages).toBeDefined();
    expect(keystaticConfig.collections.staff).toBeDefined();
  });

  test("storage config returns local mode in test environment", () => {
    const storage = getStorageConfig();
    expect(storage.kind).toBe("local");
  });

  test("makePage returns valid React component", () => {
    const KeystaticApp = makePage(keystaticConfig);
    expect(KeystaticApp).toBeDefined();
    expect(typeof KeystaticApp).toBe("function");
  });

  test("brand customization works (Keystatic DOES support this)", () => {
    // This test verifies what IS possible: brand customization
    const configWithBrand = config({
      storage: { kind: "local" as const },
      ui: {
        brand: { name: "Bear Lake Camp CMS" },
      },
      collections: {},
    });

    expect(configWithBrand.ui?.brand?.name).toBe("Bear Lake Camp CMS");
  });

  test("ui.header property does NOT exist (documents limitation)", () => {
    // This test DOCUMENTS the limitation for future engineers
    expect(keystaticConfig.ui).not.toHaveProperty("header");
  });
});
```

### Test Coverage

**What these tests verify**:
- ✅ Config imports successfully
- ✅ Storage configuration is valid
- ✅ Collections are defined
- ✅ `makePage()` integration works
- ✅ Brand customization (if needed)
- ✅ Documentation of what is NOT supported

**What these tests do NOT verify** (because not possible):
- ❌ Custom header components (API doesn't support)
- ❌ Wrapper components (not possible with `makePage()`)
- ❌ Component injection (no API for this)

### Non-Goals

- Testing Keystatic's internal implementation
- Creating mocks for non-existent APIs
- Workarounds that break on updates

### Verification

```bash
npm test keystatic.config.brand.test.ts
# ✓ config can be imported without errors
# ✓ config has valid storage configuration
# ✓ config has required collections
# ✓ storage config returns local mode in test environment
# ✓ makePage returns valid React component
# ✓ brand customization works
# ✓ ui.header property does NOT exist
#
# Tests: 7 passed, 7 total
```

---

## REQ-FIX-005: Document Technical Constraints

**Status**: ❌ Not Started
**Story Points**: 1 SP
**Priority**: P0 - Critical

### Description

Create comprehensive technical documentation explaining Keystatic's architecture constraints, what IS and is NOT possible, and alternative approaches for delivering value.

### Acceptance Criteria

- [ ] New file: `docs/technical/KEYSTATIC-ARCHITECTURE-CONSTRAINTS.md`
- [ ] Documents supported features (`ui.brand`, `ui.navigation`)
- [ ] Documents unsupported features (`ui.header`, wrappers)
- [ ] Explains WHY header customization isn't possible
- [ ] Proposes alternative approaches
- [ ] Includes code examples

### Document Outline

```markdown
# Keystatic Architecture Constraints

## Purpose
Prevent future attempts to customize Keystatic UI in ways not supported by the API.

## Keystatic API Version
This document applies to `@keystatic/core` v0.5.48 and `@keystatic/next` v5.0.4.

## What IS Supported

### Brand Customization
✅ Custom brand name
✅ Custom logo component
✅ Navigation structure

### What is NOT Supported
❌ Custom header components
❌ Wrapper components around Keystatic UI
❌ Footer customization
❌ Sidebar customization
❌ Component injection into admin interface

## Why Header Customization Isn't Possible

### Type Definition Evidence
[Include excerpt from config.d.ts]

### Architecture Explanation
`makePage()` returns a complete, self-contained React component. It does NOT accept:
- Children props
- Header components
- Wrapper components
- Custom UI injection

## Alternative Approaches

### 1. Separate Admin Tools Page (RECOMMENDED)
[Details of /keystatic-tools approach]

### 2. Browser Extension/Bookmarklet
[Pros/cons of client-side injection]

### 3. Monitor for API Updates
[How to track Keystatic releases]

## Code Examples
[Working examples of brand customization]
[Non-working examples with explanations]

## Future Considerations
[What to watch for in Keystatic releases]
```

### Non-Goals

- Workarounds that break Keystatic's intended architecture
- Hacks that will break on updates
- Advice that contradicts Keystatic documentation

### Verification

- [ ] Document exists at `docs/technical/KEYSTATIC-ARCHITECTURE-CONSTRAINTS.md`
- [ ] All sections complete
- [ ] Code examples tested
- [ ] Linked from main requirements docs
- [ ] Future engineers can understand constraints

---

## Cross-Cutting Requirements

### Test Infrastructure
- All tests run without crashes
- Test output is readable
- Tests document actual API capabilities
- No false positives (tests that pass but don't verify anything)

### Documentation Quality
- Technical constraints clearly explained
- Alternative approaches proposed
- Stakeholders informed
- Future engineers warned

### Process Alignment
- Follows TDD principles (tests verify actual behavior)
- Honest about technical limitations
- Proposes value delivery within constraints

---

## Success Metrics

### Completion Criteria
- [ ] `npm test` runs without import crashes
- [ ] All tests pass
- [ ] Requirements updated with constraints
- [ ] Technical constraints documented
- [ ] Stakeholders acknowledge limitations

### Verification Checklist
```bash
# All commands must succeed
npm test                    # ✅ No crashes, all pass
npm run typecheck          # ✅ No errors
npm run lint               # ✅ No errors
```

### Stakeholder Sign-Off
- [ ] Product owner acknowledges header integration not possible
- [ ] Agreement on alternative approach (Phase 2)
- [ ] Approval to proceed with constraints

---

## Dependencies & Blockers

### Dependencies
- ✅ Keystatic v0.5.48 installed
- ✅ Vitest test infrastructure
- ✅ Type definitions available

### Blockers
- ⚠️ **Stakeholder decision required**: Accept that header integration isn't possible?
- ⚠️ **Approach approval**: Proceed with separate tools page (Phase 2)?

---

## Story Point Breakdown

| Requirement | Development | Testing | Documentation | Total |
|-------------|-------------|---------|---------------|-------|
| REQ-FIX-001 | 0.5 SP | 0.5 SP | 0 SP | 1 SP |
| REQ-FIX-002 | 1.0 SP | 0.5 SP | 0 SP | 1.5 SP |
| REQ-FIX-003 | 0 SP | 0 SP | 1.0 SP | 1 SP |
| REQ-FIX-004 | 1.0 SP | 0.5 SP | 0.5 SP | 2 SP |
| REQ-FIX-005 | 0 SP | 0 SP | 1.0 SP | 1 SP |
| **Buffer** | 0.5 SP | 0.5 SP | 0.5 SP | 1.5 SP |
| **TOTAL** | **3.0 SP** | **2.0 SP** | **3.0 SP** | **8.0 SP** |

---

## Test Strategy

### Before This Task
- **Test Status**: CRASHING on import
- **Error**: `Cannot find module '../KeystaticWrapper'`
- **Passing Tests**: 0 (cannot run)

### After This Task
- **Test Status**: PASSING
- **Coverage**: Actual Keystatic API capabilities
- **Documentation**: Tests serve as API examples

---

## Related Documents

- **Full Plan**: `docs/tasks/TASK-2025-11-22-FIX-KEYSTATIC-INTEGRATION-TESTS.md`
- **Summary**: `docs/tasks/TASK-2025-11-22-FIX-KEYSTATIC-INTEGRATION-TESTS-SUMMARY.md`
- **CAPA Report**: `docs/project/CAPA-2025-11-22-KEYSTATIC-INTEGRATION-FAILURE.md`
- **Original Requirements**: `requirements/keystatic-integration.lock.md`

---

**Document Version**: 1.0
**Last Updated**: 2025-11-22
**Next Review**: After stakeholder decision on constraints
