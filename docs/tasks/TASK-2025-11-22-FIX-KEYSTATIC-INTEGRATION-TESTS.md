# Implementation Plan: Fix Critical P0 Keystatic Integration Test Issues

**Task ID**: TASK-2025-11-22-FIX-KEYSTATIC-INTEGRATION-TESTS
**Created**: 2025-11-22
**Status**: READY FOR EXECUTION
**Priority**: P0 - Critical
**Total Story Points**: 8 SP
**Context**: Second QCHECKT review found tests crash on import + requirements conflict

---

## Executive Summary

The second QCHECKT review revealed critical P0 issues where integration tests **crash on import** before they can even run, because they reference a component (`KeystaticWrapper`) that doesn't exist. Additionally, research into Keystatic's actual API reveals that **the `ui.header` customization pattern specified in requirements does NOT exist in Keystatic's config API**.

**Root Cause**: Requirements conflict - REQ-INTEGRATE-001 specifies creating a wrapper component, while REQ-INTEGRATE-002 specifies using Keystatic's `ui.header` config option (which doesn't exist in the Keystatic API).

**Impact**: All integration tests are non-functional. Cannot verify component integration. Blocks deployment.

---

## Research Findings: Keystatic API Investigation

### Actual Keystatic Config API

**Source**: `/node_modules/@keystatic/core/dist/declarations/src/config.d.ts` (lines 48-54)

```typescript
type UserInterface<Collections, Singletons> = {
    brand?: {
        mark?: BrandMark;
        name: string;
    };
    navigation?: Navigation<...>;
};
```

**Supported `ui` properties**:
- `brand.mark` - Custom logo component
- `brand.name` - Brand name string
- `navigation` - Custom navigation structure

**NOT supported**:
- ❌ `ui.header` - Does not exist in type definition
- ❌ `ui.customNav` - Does not exist
- ❌ Custom header components

### Keystatic Architecture

**Current integration pattern** (`app/keystatic/keystatic.tsx`):
```typescript
import { makePage } from "@keystatic/next/ui/app";
import config from "../../keystatic.config";

export default makePage(config);
```

**Key limitation**: `makePage()` is a black-box function that returns a complete Keystatic admin UI. It does NOT accept custom header components or wrapper components as parameters.

### Available Integration Points

1. **Brand customization only**:
   ```typescript
   export default config({
     storage: storageConfig,
     ui: {
       brand: {
         name: 'Bear Lake Camp CMS',
         mark: CustomLogoComponent
       }
     },
     collections: { ... }
   });
   ```

2. **No header customization**: Keystatic's UI is fully controlled by `makePage()`.

---

## Requirements Analysis: Conflict Resolution

### Current Requirements Conflict

**REQ-INTEGRATE-001**: Create `KeystaticWrapper` component
- Specifies wrapper pattern with header components
- Assumes ability to wrap Keystatic UI with custom components
- **Problem**: `makePage()` returns complete UI, cannot be wrapped with custom headers

**REQ-INTEGRATE-002**: Use `config({ ui: { header: ... } })`
- Specifies Keystatic's native `ui.header` property
- **Problem**: This property DOES NOT EXIST in Keystatic's API

**Conflict**: Both requirements specify patterns that are incompatible with Keystatic's actual architecture.

### Recommended Resolution

**Option 1: Browser Extension Pattern** (NOT recommended)
- Inject header components via client-side JavaScript after Keystatic renders
- **Pros**: Works around Keystatic's closed architecture
- **Cons**: Fragile, breaks on Keystatic updates, not officially supported

**Option 2: Custom CMS Implementation** (NOT recommended for this task)
- Replace Keystatic with custom CMS built on `@keystatic/core` primitives
- **Pros**: Full control over UI
- **Cons**: Massive scope increase (100+ SP), loses Keystatic's admin features

**Option 3: Separate Admin Tools Page** (RECOMMENDED)
- Create separate route `/keystatic-tools` with ProductionLink, DeploymentStatus, etc.
- Keep Keystatic admin at `/keystatic` as-is
- Use brand customization for minimal branding
- **Pros**: Works with Keystatic's architecture, minimal SP, maintains existing components
- **Cons**: Components not in Keystatic header (separate page)

**Option 4: Requirements Withdrawal** (RECOMMENDED for P0 fix)
- Acknowledge that header integration is not possible with current Keystatic version
- Update requirements to reflect technical constraints
- Focus on fixing test infrastructure first
- **Pros**: Fixes P0 test crashes immediately, honest about technical reality
- **Cons**: Original feature goal not achievable

---

## Recommended Approach: Two-Phase Resolution

### Phase 1: Fix P0 Test Infrastructure (This Task - 8 SP)

**Goal**: Make tests functional again, align with technical reality

**Actions**:
1. Remove tests that reference non-existent `KeystaticWrapper`
2. Update requirements to reflect Keystatic's actual API
3. Create integration tests that verify what IS possible (brand customization)
4. Document Keystatic's limitations in technical docs

**Outcome**: Tests pass, no crashes, honest assessment of what's possible

### Phase 2: Deliver Value Within Constraints (Future Task - TBD)

**Goal**: Make components useful despite Keystatic limitations

**Options**:
- Separate `/keystatic-tools` page with all header components
- Browser bookmarklet for power users
- Next.js middleware to inject components (advanced)
- Wait for Keystatic API updates

**Outcome**: Components provide value to users, even if not in exact location originally specified

---

## Implementation Plan: Phase 1 (This Task)

### REQ-FIX-001: Remove Failing Import Tests
**Story Points**: 2 SP

**Problem**: Tests crash because `KeystaticWrapper` doesn't exist

**Files to fix**:
- `app/keystatic/__tests__/KeystaticWrapper.integration.test.tsx`
- `app/keystatic/[[...params]]/__tests__/page.integration.test.tsx`
- `app/keystatic/__tests__/keystatic-route.e2e.test.tsx`

**Action**: Delete or disable tests that import non-existent components

**Acceptance Criteria**:
- [ ] `npm test` runs without module import crashes
- [ ] Test suite executes (even if some tests are skipped)
- [ ] No references to `KeystaticWrapper` in test files

---

### REQ-FIX-002: Update Config Integration Tests
**Story Points**: 2 SP

**Problem**: Tests verify `config.ui.header` which doesn't exist in Keystatic API

**File**: `keystatic.config.integration.test.ts`

**Current (incorrect) test**:
```typescript
test('config has ui.header property', () => {
  expect(keystaticConfig.ui?.header).toBeDefined();
});
```

**Corrected test**:
```typescript
test('config has valid ui structure matching Keystatic API', () => {
  // Keystatic only supports ui.brand and ui.navigation
  expect(keystaticConfig.ui).toBeUndefined() ||
    expect(keystaticConfig.ui).toMatchObject({
      brand: expect.objectContaining({
        name: expect.any(String)
      })
    });
});
```

**Acceptance Criteria**:
- [ ] Tests verify actual Keystatic API properties (`ui.brand`, `ui.navigation`)
- [ ] No tests for non-existent `ui.header` property
- [ ] Tests pass with current `keystatic.config.ts`
- [ ] Tests document what Keystatic DOES support

---

### REQ-FIX-003: Update Requirements Documentation
**Story Points**: 1 SP

**Problem**: Requirements specify features that Keystatic doesn't support

**Files to update**:
- `requirements/keystatic-integration.lock.md`
- `docs/project/CAPA-2025-11-22-KEYSTATIC-INTEGRATION-FAILURE.md`

**Changes**:
1. Add "BLOCKED BY KEYSTATIC API LIMITATIONS" status to REQ-INTEGRATE-001 and REQ-INTEGRATE-002
2. Document Keystatic's actual API capabilities
3. Propose alternative approaches (separate tools page, etc.)
4. Update story points to reflect scope change

**Acceptance Criteria**:
- [ ] Requirements document Keystatic's actual API
- [ ] Clear statement: "ui.header does not exist in Keystatic v0.5.48"
- [ ] Alternative approaches proposed
- [ ] Stakeholder acknowledgment that original approach not possible

---

### REQ-FIX-004: Create Minimal Passing Integration Tests
**Story Points**: 2 SP

**Goal**: Replace broken tests with tests that verify what IS possible

**New test file**: `keystatic.config.brand.test.ts`

**Tests**:
```typescript
describe('REQ-FIX-004 — Keystatic Brand Customization', () => {
  test('config can be imported without errors', () => {
    expect(keystaticConfig).toBeDefined();
  });

  test('config has required storage property', () => {
    expect(keystaticConfig.storage).toBeDefined();
    expect(keystaticConfig.storage.kind).toMatch(/^(local|github)$/);
  });

  test('config can customize brand name (if needed)', () => {
    // Keystatic supports ui.brand.name customization
    const configWithBrand = config({
      storage: { kind: 'local' },
      ui: {
        brand: { name: 'Bear Lake Camp CMS' }
      },
      collections: {}
    });

    expect(configWithBrand.ui?.brand?.name).toBe('Bear Lake Camp CMS');
  });

  test('makePage returns valid React component', () => {
    const KeystaticApp = makePage(keystaticConfig);
    expect(KeystaticApp).toBeDefined();
    expect(typeof KeystaticApp).toBe('function');
  });
});
```

**Acceptance Criteria**:
- [ ] Tests verify actual Keystatic API capabilities
- [ ] All tests pass
- [ ] No references to non-existent components or APIs
- [ ] Tests serve as documentation of what IS possible

---

### REQ-FIX-005: Document Technical Constraints
**Story Points**: 1 SP

**Goal**: Prevent future attempts to customize Keystatic UI in unsupported ways

**New file**: `docs/technical/KEYSTATIC-ARCHITECTURE-CONSTRAINTS.md`

**Content**:
```markdown
# Keystatic Architecture Constraints

## Customization Limitations (v0.5.48)

### What IS Supported
- Brand name: `ui.brand.name`
- Brand logo: `ui.brand.mark` (custom React component)
- Navigation structure: `ui.navigation`

### What is NOT Supported
- Custom header components: `ui.header` DOES NOT EXIST
- Wrapper components around Keystatic UI
- Injection of custom components into admin interface
- Custom footer components

## Why Header Customization Isn't Possible

`makePage()` from `@keystatic/next/ui/app` returns a complete, self-contained admin UI component. It does NOT accept:
- Children props
- Header components
- Wrapper components
- Custom UI elements

**Type signature**:
```typescript
function makePage(config: Config): React.ComponentType
```

The returned component is a black box. You cannot pass custom header components to it.

## Alternative Approaches

### 1. Separate Admin Tools Page (Recommended)
Create `/keystatic-tools` route with ProductionLink, DeploymentStatus, etc.

**Pros**:
- Works within Keystatic's constraints
- Components remain useful
- Clean separation of concerns

**Cons**:
- Not integrated into Keystatic header
- Users must navigate to separate page

### 2. Browser Extension/Bookmarklet
Inject components via client-side JavaScript after Keystatic renders.

**Pros**:
- Appears in Keystatic header

**Cons**:
- Fragile, breaks on updates
- Not officially supported
- Requires browser extension installation

### 3. Wait for Keystatic API Updates
Monitor Keystatic releases for header customization support.

**Pros**:
- Official solution when/if available

**Cons**:
- Unknown timeline
- May never be added
```

**Acceptance Criteria**:
- [ ] Document created in `docs/technical/`
- [ ] Explains Keystatic's API limitations
- [ ] Proposes alternative approaches
- [ ] Referenced in updated requirements

---

## Test Strategy

### Before This Task
- **Status**: Tests crash on import, cannot run
- **Error**: `Cannot find module '../KeystaticWrapper'`
- **Passing Tests**: 0 (crashes before execution)

### After This Task
- **Status**: Tests run successfully
- **Passing Tests**: All tests pass
- **Coverage**: Verifies actual Keystatic API capabilities
- **Documentation**: Tests serve as API usage examples

### Test Files

**To Delete/Disable**:
- ❌ `app/keystatic/__tests__/KeystaticWrapper.integration.test.tsx` (references non-existent component)
- ❌ `app/keystatic/[[...params]]/__tests__/page.integration.test.tsx` (expects wrapper pattern)
- ❌ `app/keystatic/__tests__/keystatic-route.e2e.test.tsx` (expects header components)

**To Update**:
- ✏️ `keystatic.config.integration.test.ts` (update to test actual API)

**To Create**:
- ✅ `keystatic.config.brand.test.ts` (test supported customizations)
- ✅ `keystatic.makePage.test.ts` (verify makePage returns valid component)

---

## Story Point Breakdown

| Requirement | Development | Testing | Documentation | Total |
|-------------|-------------|---------|---------------|-------|
| REQ-FIX-001 | 0.5 SP | 0.5 SP | 0 SP | 1 SP |
| REQ-FIX-002 | 1.0 SP | 0.5 SP | 0 SP | 1.5 SP |
| REQ-FIX-003 | 0 SP | 0 SP | 1.0 SP | 1 SP |
| REQ-FIX-004 | 1.0 SP | 0.5 SP | 0.5 SP | 2 SP |
| REQ-FIX-005 | 0 SP | 0 SP | 1.0 SP | 1 SP |
| **TOTAL** | **2.5 SP** | **1.5 SP** | **2.5 SP** | **6.5 SP** |

**Rounded Total**: 8 SP (includes buffer for requirements clarification discussions)

---

## Dependencies & Blockers

### Dependencies
- ✅ Keystatic v0.5.48 installed
- ✅ Vitest test infrastructure
- ✅ Access to Keystatic type definitions

### Blockers
- ⚠️ **Stakeholder decision required**: Accept that header integration isn't possible with current Keystatic version?
- ⚠️ **Requirements approval**: Update requirements to reflect technical constraints?

### Questions for Stakeholders

1. **Accept limitations?**: Acknowledge that `ui.header` doesn't exist in Keystatic API?
2. **Separate tools page?**: Is `/keystatic-tools` route acceptable alternative?
3. **Wait for API update?**: Defer header integration until Keystatic adds support?
4. **Component reuse?**: Keep ProductionLink, DeploymentStatus, etc. for future use?

---

## Success Criteria

### Technical Success
- [ ] `npm test` runs without crashes
- [ ] All tests pass
- [ ] No references to non-existent Keystatic APIs
- [ ] Tests document actual API capabilities

### Process Success
- [ ] Requirements updated to reflect technical reality
- [ ] Stakeholders informed of constraints
- [ ] Alternative approaches proposed
- [ ] Clear path forward for delivering value

### Documentation Success
- [ ] Keystatic limitations documented
- [ ] Future engineers warned about unsupported patterns
- [ ] Alternative approaches clearly explained

---

## Verification Checklist

**Before marking task complete**:

1. **Tests**:
   - [ ] `npm test` runs without import crashes
   - [ ] All tests pass (no skipped tests with "TODO: Fix")
   - [ ] Test coverage for actual Keystatic API features

2. **Requirements**:
   - [ ] `keystatic-integration.lock.md` updated with constraints
   - [ ] CAPA report updated with resolution
   - [ ] Stakeholders acknowledge API limitations

3. **Documentation**:
   - [ ] `KEYSTATIC-ARCHITECTURE-CONSTRAINTS.md` created
   - [ ] Technical constraints clearly explained
   - [ ] Alternative approaches documented

4. **Code Quality**:
   - [ ] `npm run typecheck` passes
   - [ ] `npm run lint` passes
   - [ ] No console errors

5. **Stakeholder Approval**:
   - [ ] Product owner acknowledges header integration not possible
   - [ ] Agreement on alternative approach (separate tools page, etc.)
   - [ ] Sign-off to proceed with constraints in place

---

## Follow-Up Tasks (Not in This Plan)

**Future tasks to consider**:

1. **Create `/keystatic-tools` Page** (5 SP)
   - Separate route with ProductionLink, DeploymentStatus, BugReportModal, etc.
   - Links from Keystatic to tools page
   - Achieves component value without Keystatic integration

2. **Monitor Keystatic Releases** (1 SP/quarter)
   - Check for `ui.header` or custom component support
   - Revisit integration if API updated

3. **Custom CMS Evaluation** (3 SP)
   - Evaluate cost/benefit of replacing Keystatic
   - Only if header integration is critical business requirement

---

## Related Documents

- **CAPA Report**: `docs/project/CAPA-2025-11-22-KEYSTATIC-INTEGRATION-FAILURE.md`
- **Original Requirements**: `requirements/keystatic-integration.lock.md`
- **Keystatic Config**: `keystatic.config.ts`
- **Failing Tests**: `app/keystatic/__tests__/*.tsx`
- **Keystatic API Types**: `node_modules/@keystatic/core/dist/declarations/src/config.d.ts`

---

## Risk Assessment

### Technical Risks
- **Low**: Keystatic API is stable, well-documented
- **Low**: Test infrastructure is solid
- **Low**: Alternative approaches are straightforward

### Process Risks
- **Medium**: Stakeholders may resist accepting technical constraints
- **Medium**: Scope creep if "must have header integration" becomes blocker
- **Low**: Team velocity impact (8 SP is small task)

### Mitigation
- Present research findings clearly (Keystatic API types prove constraints)
- Propose concrete alternatives (separate tools page)
- Emphasize value delivery (components still useful, just different location)

---

## Lessons Learned

### What Went Wrong
1. Requirements specified features without verifying API capabilities
2. Tests written before understanding integration points
3. No research phase to validate technical approach

### How to Prevent
1. **Research-first planning**: Investigate third-party APIs BEFORE writing requirements
2. **API type verification**: Check type definitions, not just docs
3. **Prototype integration**: Build spike before committing to approach
4. **Requirements review**: Technical lead reviews feasibility before QCODET

### Process Improvements
1. Add "API Research" step to QPLAN for third-party integrations
2. Create checklist: "Have we verified this API exists?"
3. Update test-writer guidelines: "Don't test non-existent APIs"

---

**Document Version**: 1.0
**Last Updated**: 2025-11-22
**Next Review**: After stakeholder decision on approach
