# Quick Summary: Fix Keystatic Integration Test Failures

**Task ID**: TASK-2025-11-22-FIX-KEYSTATIC-INTEGRATION-TESTS
**Story Points**: 8 SP
**Priority**: P0 - Critical
**Status**: READY FOR EXECUTION

---

## The Problem (3 Critical Issues)

### P0-1: Tests Crash on Import
**Files**: `KeystaticWrapper.integration.test.tsx`, `page.integration.test.tsx`, `keystatic-route.e2e.test.tsx`

**Error**: `Cannot find module '../KeystaticWrapper'`

**Why**: Tests import component that doesn't exist

### P0-2: Tests Verify Non-Existent API
**File**: `keystatic.config.integration.test.ts`

**Problem**: Tests check for `config.ui.header` property

**Why**: This property DOES NOT EXIST in Keystatic's API (verified in type definitions)

### P0-3: Requirements Conflict
**REQ-INTEGRATE-001**: Create KeystaticWrapper component (wrapper pattern)
**REQ-INTEGRATE-002**: Use `config({ ui: { header: ... } })` (config pattern)

**Problem**: BOTH patterns are impossible with Keystatic's actual architecture

---

## Research Finding: Keystatic API Limitation

**Source**: `node_modules/@keystatic/core/dist/declarations/src/config.d.ts`

### What Keystatic DOES Support
```typescript
ui?: {
  brand?: {
    name: string;
    mark?: BrandMarkComponent;
  };
  navigation?: NavigationStructure;
}
```

### What Keystatic DOES NOT Support
- ❌ `ui.header` - Property doesn't exist
- ❌ Custom header components
- ❌ Wrapper components around Keystatic UI

**Why**: `makePage(config)` returns a black-box React component. No way to inject custom headers.

---

## Recommended Solution: Two-Phase Approach

### Phase 1: Fix Tests NOW (This Task - 8 SP)

**Goal**: Make tests functional, align with technical reality

**Actions**:
1. **Delete/disable** tests that reference `KeystaticWrapper`
2. **Update** config tests to verify actual API (`ui.brand`, not `ui.header`)
3. **Create** new tests that verify what IS possible (brand customization)
4. **Document** Keystatic's limitations in technical docs
5. **Update** requirements to reflect API constraints

**Outcome**: Tests pass, no crashes, honest assessment

### Phase 2: Deliver Value (Future Task)

**Options**:
- **Separate `/keystatic-tools` page** with ProductionLink, DeploymentStatus, etc. (RECOMMENDED)
- Browser bookmarklet/extension (fragile, not supported)
- Wait for Keystatic API updates (unknown timeline)

---

## Implementation Plan (5 Requirements)

### REQ-FIX-001: Remove Failing Import Tests (2 SP)
**Action**: Delete or disable tests that import non-existent `KeystaticWrapper`

**Files**:
- `app/keystatic/__tests__/KeystaticWrapper.integration.test.tsx`
- `app/keystatic/[[...params]]/__tests__/page.integration.test.tsx`
- `app/keystatic/__tests__/keystatic-route.e2e.test.tsx`

**Acceptance**: `npm test` runs without module import crashes

---

### REQ-FIX-002: Update Config Integration Tests (2 SP)
**Action**: Change tests to verify actual Keystatic API

**File**: `keystatic.config.integration.test.ts`

**Before** (incorrect):
```typescript
test('config has ui.header property', () => {
  expect(keystaticConfig.ui?.header).toBeDefined();
});
```

**After** (correct):
```typescript
test('config has valid ui structure', () => {
  // Keystatic only supports ui.brand and ui.navigation
  expect(keystaticConfig.ui).toBeUndefined() ||
    expect(keystaticConfig.ui).toMatchObject({
      brand: expect.objectContaining({
        name: expect.any(String)
      })
    });
});
```

**Acceptance**: Tests verify actual API, all pass

---

### REQ-FIX-003: Update Requirements Documentation (1 SP)
**Action**: Document API limitations in requirements

**Files**:
- `requirements/keystatic-integration.lock.md`
- `docs/project/CAPA-2025-11-22-KEYSTATIC-INTEGRATION-FAILURE.md`

**Changes**:
- Add "BLOCKED BY KEYSTATIC API LIMITATIONS" status
- Document actual API capabilities
- Propose alternatives (separate tools page)

**Acceptance**: Requirements reflect technical reality

---

### REQ-FIX-004: Create Minimal Passing Tests (2 SP)
**Action**: Write tests for what IS possible

**New file**: `keystatic.config.brand.test.ts`

**Tests**:
- Config can be imported
- Config has valid storage property
- Brand customization works (if used)
- `makePage()` returns valid component

**Acceptance**: All new tests pass, document actual API

---

### REQ-FIX-005: Document Technical Constraints (1 SP)
**Action**: Create architecture constraints doc

**New file**: `docs/technical/KEYSTATIC-ARCHITECTURE-CONSTRAINTS.md`

**Content**:
- What IS supported (brand, navigation)
- What is NOT supported (header, wrappers)
- Why header customization isn't possible
- Alternative approaches

**Acceptance**: Future engineers warned about limitations

---

## Success Criteria

### Must Have (Blocking)
- [ ] `npm test` runs without crashes
- [ ] All tests pass
- [ ] No references to non-existent APIs
- [ ] Requirements updated with constraints

### Should Have (Non-Blocking)
- [ ] Stakeholders acknowledge limitations
- [ ] Agreement on alternative approach
- [ ] Technical constraints documented

---

## Stakeholder Decision Required

**Question**: Accept that header integration is not possible with current Keystatic version?

**Options**:
1. **Accept constraints** → Proceed with separate tools page (RECOMMENDED)
2. **Wait for Keystatic** → Defer until API updated (unknown timeline)
3. **Replace Keystatic** → Custom CMS (100+ SP, massive scope)

**Recommendation**: Option 1 - Accept constraints, deliver value via separate tools page

---

## Quick Command Reference

```bash
# Run tests (currently crashes on import)
npm test

# After fix (should pass)
npm test

# Verify types
npm run typecheck

# Verify lint
npm run lint
```

---

## Files Changed Summary

**Deleted/Disabled**: 3 test files with failing imports
**Updated**: 1 config test file (fix API assertions)
**Created**: 2 new files (passing tests + constraints doc)
**Updated**: 2 requirements docs (add limitations)

**Total File Changes**: ~8 files

---

## Story Points: 8 SP

| Task | SP |
|------|------|
| Remove failing tests | 2 |
| Update config tests | 2 |
| Update requirements | 1 |
| Create new tests | 2 |
| Document constraints | 1 |
| **Total** | **8** |

---

## Next Steps

1. **Review this plan** with stakeholders
2. **Get approval** to accept Keystatic limitations
3. **Execute REQ-FIX-001 through REQ-FIX-005**
4. **Verify** tests pass
5. **Plan Phase 2** (separate tools page)

---

**Full details**: See `TASK-2025-11-22-FIX-KEYSTATIC-INTEGRATION-TESTS.md`
