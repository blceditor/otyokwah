# Corrective and Preventive Action (CAPA) Report

**Incident ID**: CAPA-2025-11-22-001
**Date Reported**: 2025-11-22
**Severity**: P0 - Critical
**Status**: Open
**Owner**: Engineering Leadership

---

## Executive Summary

A critical process failure occurred where 5 Keystatic CMS enhancement components (BugReportModal, DeploymentStatus, GenerateSEOButton, ProductionLink, SparkryBranding) were implemented, tested (87 tests passing across 6 spec files), and committed with a claim of "ready for deployment" (47.8 SP) **without ever being integrated into the actual Keystatic UI**. Despite 668 total passing tests across the codebase, zero user-visible features were delivered. The root cause is a fundamental gap in our Definition of Done and test coverage strategy that prioritized component logic over UI integration verification.

**Business Impact**: Zero ROI on 47.8 SP implementation effort, potential client trust erosion, deployment of non-functional features.

**Immediate Action Required**: UI integration verification gate before any future "ready" claims.

---

## 1. Incident Timeline

| Timestamp | Event | Evidence |
|-----------|-------|----------|
| 2025-11-XX | REQ-001, REQ-002, REQ-P1-005, REQ-006, REQ-012 defined in `requirements/new-features.md` | Requirements explicitly state "Add header button", "Display in CMS header", "visible on all CMS pages" |
| 2025-11-XX | Components created: `components/keystatic/*.tsx` (5 files) | ProductionLink.tsx, DeploymentStatus.tsx, BugReportModal.tsx, SparkryBranding.tsx, GenerateSEOButton.tsx |
| 2025-11-XX | Tests implemented: `components/keystatic/*.spec.tsx` (87 tests) | All tests pass, covering component rendering, props, user interactions |
| 2025-11-XX | **CRITICAL MISS**: No integration into `keystatic.config.ts` or Keystatic UI | Config file shows NO `ui: { header: ..., customNav: ... }` configuration |
| 2025-11-XX | Commit message: "feat: implement Keystatic CMS enhancements (47.8 SP)" | Git status shows commit `03791db` |
| 2025-11-22 | Incident discovered: Components exist but are not rendered in production CMS | User reports zero visible changes in Keystatic admin interface |

---

## 2. Root Cause Analysis (5 Whys)

### Why did components get marked "ready for deployment" without UI integration?

**Because** tests passed and code review did not verify actual UI rendering.

### Why did tests pass without verifying UI rendering?

**Because** tests only verified component logic (rendering in isolation, props, events) but did not verify integration into Keystatic's `makePage` configuration.

### Why was integration verification missing from tests?

**Because** there is no E2E test requirement in our TDD workflow for UI component integration. Our test strategy focuses on unit tests (component behavior) but lacks integration tests (component placement in actual UI).

### Why does our test strategy lack integration coverage?

**Because** the Definition of Done in CLAUDE.md § 3 (TDD Flow) does not mandate E2E or integration tests for UI components. The workflow specifies:
- "test-writer creates failing tests (≥1 per REQ)"
- Tests cite REQ-IDs
- But **nowhere specifies** "verify component appears in production UI"

### Why do requirements not specify integration verification?

**Because** requirements were written from a feature perspective ("Add header button") but acceptance criteria did not include explicit integration checks ("Button must appear in Keystatic admin header when navigating to /keystatic/pages/*").

**Root Cause**: Systemic gap between "component exists and works" vs "component is integrated and visible to users". Our TDD workflow optimizes for component correctness but does not enforce integration verification.

---

## 3. Failure Mode Analysis

### What Worked
- Component implementation quality (clean code, proper TypeScript)
- Unit test coverage (87 tests, all passing)
- Requirements documentation (REQ-IDs, acceptance criteria)
- Test naming conventions (REQ-IDs cited in tests)

### What Failed
1. **Test Coverage Gap**: No integration tests verifying Keystatic config
2. **Review Process Gap**: PE-Reviewer did not check actual UI rendering
3. **Acceptance Criteria Ambiguity**: "Add header button" interpreted as "create component" not "integrate into UI"
4. **Definition of Done Gap**: No checklist item for "verify in production-like environment"
5. **Keystatic Documentation Gap**: No reference documentation for how to integrate custom UI into Keystatic's `makePage` API

### Evidence of Gaps

**Keystatic.config.ts** (lines 34-36):
```typescript
export default config({
  storage: storageConfig,
  collections: {
```
**Missing**:
```typescript
export default config({
  storage: storageConfig,
  ui: {
    header: <CustomHeader />,  // ProductionLink, DeploymentStatus, etc.
    customNav: <SparkryBranding />
  },
  collections: {
```

**App/keystatic/keystatic.tsx** (line 6):
```typescript
export default makePage(config);
```
**No custom UI components passed to `makePage`.**

---

## 4. Immediate Corrective Actions

### 4.1 Fix Current Implementation (P0 - Due: 2025-11-23)

**Owner**: SDE-III + Implementation Coordinator

**Tasks**:
1. Research Keystatic custom UI integration API
   - Review Keystatic docs: https://keystatic.com/docs/custom-ui
   - Identify correct API for header/navigation customization

2. Integrate components into `keystatic.config.ts`:
   ```typescript
   import { CustomHeader } from '@/components/keystatic/CustomHeader'

   export default config({
     storage: storageConfig,
     ui: {
       header: <CustomHeader />,
       brand: { name: 'Bear Lake Camp CMS' }
     },
     collections: { ... }
   })
   ```

3. Create wrapper component `CustomHeader.tsx`:
   ```typescript
   export function CustomHeader() {
     return (
       <div className="flex items-center gap-4">
         <ProductionLink />
         <DeploymentStatus />
         <BugReportModal pageContext={{ slug: getCurrentSlug() }} />
         <GenerateSEOButton />
         <SparkryBranding />
       </div>
     )
   }
   ```

4. **Verification Checklist** (MUST complete before marking done):
   - [ ] Navigate to http://localhost:3000/keystatic
   - [ ] Verify all 5 components visible in header
   - [ ] Click each button, verify functionality
   - [ ] Check browser console for errors
   - [ ] Take screenshot as evidence
   - [ ] Deploy to staging, repeat verification
   - [ ] Update commit message: "fix: integrate Keystatic components into UI (CAPA-2025-11-22)"

**Completion Criteria**: Screenshot showing all 5 components rendered in Keystatic admin header + zero console errors.

---

### 4.2 Create Integration Test (P0 - Due: 2025-11-23)

**Owner**: Test-Writer

**Test File**: `app/keystatic/[[...params]]/page.integration.spec.tsx`

```typescript
describe('REQ-001, REQ-002, REQ-006, REQ-P1-005, REQ-012 - Keystatic UI Integration', () => {
  test('components render in Keystatic admin header', async () => {
    // This test MUST have been written BEFORE implementation
    const page = render(<KeystaticApp />);

    // Verify ProductionLink
    expect(screen.getByLabelText('View live page on production site')).toBeInTheDocument();

    // Verify DeploymentStatus
    expect(screen.getByText(/Published|Deploying|Failed|Draft/)).toBeInTheDocument();

    // Verify BugReportModal trigger
    expect(screen.getByLabelText('Report bug')).toBeInTheDocument();

    // Verify GenerateSEOButton
    expect(screen.getByLabelText('Generate SEO metadata')).toBeInTheDocument();

    // Verify SparkryBranding
    expect(screen.getByAltText('Sparkry AI')).toBeInTheDocument();
  });

  test('E2E: components functional in real Keystatic instance', async () => {
    // Playwright E2E test
    await page.goto('http://localhost:3000/keystatic');
    await page.waitForSelector('[aria-label="View live page on production site"]');

    const productionLink = await page.locator('[aria-label="View live page on production site"]');
    expect(await productionLink.isVisible()).toBe(true);

    // Click and verify new tab opens
    const [newPage] = await Promise.all([
      page.waitForEvent('popup'),
      productionLink.click()
    ]);
    expect(newPage.url()).toContain('prelaunch.bearlakecamp.com');
  });
});
```

**Completion Criteria**: Integration test fails when components not in config, passes when integrated.

---

## 5. Preventive Actions (Process Changes)

### 5.1 Update Definition of Done (CLAUDE.md)

**Owner**: Engineering Leadership
**Due**: 2025-11-23
**Priority**: P0

**Current State** (CLAUDE.md § 3 - TDD Flow):
```markdown
2. **QCODET**: test-writer creates failing tests (≥1 per REQ)
```

**New State** (Add after line 62):
```markdown
2. **QCODET**: test-writer creates failing tests (≥1 per REQ)
   - **UI Component Rule**: If REQ mentions "visible", "button", "header", "displays", or "shows", MUST include:
     a) Unit tests (component rendering, props, events)
     b) Integration tests (component integrated into parent UI)
     c) E2E tests (component visible in production-like environment)
   - **Integration Test Checklist**:
     - [ ] Component imported into parent module
     - [ ] Component rendered in correct UI location
     - [ ] Visual regression test (screenshot diff)
     - [ ] Accessibility test (keyboard nav, screen reader)
```

**Add new section § 3.5**:
```markdown
## 3.5) Integration Verification Gate

**Trigger**: Any task with "UI", "visible", "button", "header", "displays" in requirements

**Mandatory Checklist** (blocking before QGIT):
1. [ ] **Screenshot Evidence**: Attach screenshot showing feature in UI
2. [ ] **E2E Test**: Playwright/Cypress test verifying element visibility
3. [ ] **Integration Test**: Test component renders in parent context
4. [ ] **Deployment Verification**: Feature visible in staging deployment
5. [ ] **User Acceptance**: Stakeholder confirms "I can see and use this"

**Failure Mode**: If ANY checkbox unchecked, CANNOT mark task as "ready for deployment"

**Rationale**: CAPA-2025-11-22 - Components tested in isolation do not equal shipped features
```

---

### 5.2 Enhanced PE-Reviewer Checklist

**Owner**: Code Quality Team
**Due**: 2025-11-23
**File**: `.claude/agents/pe-reviewer.md`

**Add to § Checklist** (after existing items):

```markdown
### UI Component Review (NEW - Post CAPA-2025-11-22)

**If component has visual UI (button, header, modal, etc.)**:
- [ ] **Import Check**: Component imported in parent module (not orphaned)
- [ ] **Rendering Check**: Component actually rendered (not just exported)
- [ ] **Configuration Check**:
  - Keystatic components → integrated into `keystatic.config.ts` `ui` object
  - Next.js components → imported in page/layout files
  - React components → rendered in parent component JSX
- [ ] **Evidence Check**: Screenshots provided showing component in UI
- [ ] **E2E Test Exists**: Playwright test verifying visibility
- [ ] **Acceptance Criteria Match**: Requirements say "visible" → actually visible

**Red Flags**:
- ❌ Component file exists but no import statements in parent
- ❌ Tests only render component in isolation (no parent context)
- ❌ No screenshots of actual UI
- ❌ Requirements say "Add button" but no evidence of button in UI
- ❌ Keystatic components with no `ui: { ... }` config changes

**Action on Red Flag**: REJECT with comment "Integration verification missing - see CAPA-2025-11-22"
```

---

### 5.3 Test-Writer Enhanced Checklist

**Owner**: Test Infrastructure Team
**Due**: 2025-11-23
**File**: `.claude/agents/test-writer.md`

**Add new section**:

```markdown
## Test Coverage Matrix (Post CAPA-2025-11-22)

### Component Types & Required Tests

| Component Type | Unit Test | Integration Test | E2E Test | Visual Regression |
|----------------|-----------|------------------|----------|-------------------|
| **Pure Logic** (utils, helpers) | ✅ Required | ❌ N/A | ❌ N/A | ❌ N/A |
| **Headless Component** (hooks, context) | ✅ Required | ✅ Required | ❌ Optional | ❌ N/A |
| **UI Component** (buttons, modals) | ✅ Required | ✅ Required | ✅ Required | ✅ Recommended |
| **Page Component** | ✅ Required | ✅ Required | ✅ Required | ✅ Required |
| **Admin UI Extension** (Keystatic, CMS) | ✅ Required | ✅ **CRITICAL** | ✅ **CRITICAL** | ✅ Required |

### Integration Test Template (UI Components)

```typescript
// MANDATORY for any component that renders in UI
describe('[REQ-XXX] - Integration Tests', () => {
  test('component renders in parent context', () => {
    // Import actual parent (not mock)
    const { render } = require('@testing-library/react');
    const ParentComponent = require('../ParentComponent');

    const { getByTestId } = render(<ParentComponent />);
    expect(getByTestId('my-component')).toBeInTheDocument();
  });

  test('component appears in production build', async () => {
    // E2E with Playwright
    await page.goto('http://localhost:3000/target-page');
    await expect(page.locator('[data-testid="my-component"]')).toBeVisible();
  });
});
```

### Red Flag Detection

**Before marking tests complete, check**:
- [ ] If REQ mentions "button"/"header"/"visible" → Integration test exists?
- [ ] If Keystatic component → Test verifies `keystatic.config.ts` integration?
- [ ] If admin UI → E2E test navigates to admin and verifies element?
- [ ] If "user sees X" → Screenshot or E2E test proves it?

**Failure Action**: Cannot mark QCODET as complete without integration tests for UI components.
```

---

### 5.4 Requirements Template Enhancement

**Owner**: Product Management
**Due**: 2025-11-24
**File**: `requirements/template.md` (create if missing)

**Add to acceptance criteria template**:

```markdown
## Acceptance Criteria Template

### For UI Features (buttons, headers, modals, etc.)

**Functional Criteria**:
- [ ] Feature does X when user performs Y

**Integration Criteria** (NEW - MANDATORY):
- [ ] Component integrated into [PARENT_MODULE_NAME]
- [ ] Component visible at [URL_PATH]
- [ ] Component accessible via [USER_JOURNEY]
- [ ] Screenshot provided showing feature in UI

**Technical Criteria**:
- [ ] Tests pass (unit + integration + E2E)
- [ ] TypeScript compiles
- [ ] Lighthouse score ≥90

**Verification Evidence Required**:
1. Screenshot showing feature in production-like environment
2. E2E test demonstrating user interaction
3. Code review confirming integration (not just component creation)

**Anti-Pattern Alert**:
❌ **DO NOT ACCEPT**: "Component renders correctly" ← This is NOT acceptance
✅ **ACCEPT**: "User can click 'View Live' button in Keystatic header at /keystatic/pages/*" ← This IS acceptance
```

---

### 5.5 Pre-Deployment Gate Enhancement

**Owner**: Release Manager
**Due**: 2025-11-23
**File**: CLAUDE.md § 6.5 (Pre-Deployment Gates)

**Current State**:
```markdown
**Before ANY deployment (Lovable/external/CI)**:
```bash
npm run typecheck && npm run lint && npm run test
```
```

**Enhanced State** (add after line 149):
```markdown
**Before ANY deployment (Lovable/external/CI)**:
```bash
npm run typecheck && npm run lint && npm run test
npm run test:integration  # NEW: Run integration tests
npm run test:e2e          # NEW: Run E2E tests (Playwright)
```

**UI Feature Deployment Checklist** (MANDATORY if commit includes UI changes):
- [ ] Run `npm run test:e2e:ui` (custom script for UI verification)
- [ ] Screenshot evidence attached to PR
- [ ] Integration tests pass
- [ ] Manual verification in staging:
  - [ ] Navigate to feature URL
  - [ ] Verify element visible
  - [ ] Test user interaction
  - [ ] Check browser console (zero errors)
- [ ] Stakeholder sign-off: "I see the feature working"

**Blockers** (Cannot deploy if ANY fail):
- ❌ Integration tests missing for UI components
- ❌ No screenshot evidence
- ❌ Feature not visible in staging
- ❌ E2E tests skipped
```

---

### 5.6 Create Reference Documentation

**Owner**: Docs-Writer
**Due**: 2025-11-24
**File**: `docs/technical/KEYSTATIC-CUSTOM-UI-INTEGRATION.md`

**Content**:
```markdown
# Keystatic Custom UI Integration Guide

## Purpose
Prevent CAPA-2025-11-22 recurrence: Components must be integrated, not just created.

## Integration Checklist

### 1. Create Component
```typescript
// components/keystatic/MyComponent.tsx
export function MyComponent() { ... }
```

### 2. Integrate into Keystatic Config
```typescript
// keystatic.config.ts
import { MyComponent } from '@/components/keystatic/MyComponent';

export default config({
  storage: storageConfig,
  ui: {
    header: <MyComponent />,        // For header buttons
    customNav: <MyComponent />,     // For navigation items
    navigation: {                   // For custom nav structure
      'Custom Section': ['pages']
    }
  },
  collections: { ... }
});
```

### 3. Verify Integration
```bash
npm run dev
# Open http://localhost:3000/keystatic
# MUST SEE component in UI - if not, NOT INTEGRATED
```

### 4. Test Integration
```typescript
// app/keystatic/[[...params]]/page.integration.spec.tsx
test('MyComponent renders in Keystatic UI', async () => {
  const page = render(<KeystaticApp />);
  expect(screen.getByTestId('my-component')).toBeInTheDocument();
});
```

## Common Mistakes

❌ **Wrong**: Create component, write tests, mark done
✅ **Right**: Create component, integrate into config, verify in browser, test integration, mark done

❌ **Wrong**: Tests render component in isolation
✅ **Right**: Tests render KeystaticApp and verify component appears

❌ **Wrong**: "Tests pass" = done
✅ **Right**: "User can see and use feature" = done
```

---

## 6. Verification Plan

### 6.1 Process Change Verification

**Timeline**: 2025-11-23 to 2025-11-30

**Method**: Apply new process to next 3 UI feature tasks

**Success Criteria**:
- [ ] All 3 tasks include integration tests before marking complete
- [ ] All 3 tasks have screenshot evidence in PR
- [ ] All 3 tasks verified in staging before deployment
- [ ] PE-Reviewer rejects at least 1 task for missing integration verification (proves gate works)

**Failure Trigger**: If any task deployed without integration verification, CAPA process failed

---

### 6.2 Current Incident Resolution Verification

**Due**: 2025-11-23 EOD

**Checklist**:
1. [ ] Run `npm run dev` and navigate to http://localhost:3000/keystatic
2. [ ] Verify ALL 5 components visible:
   - ProductionLink (top-right header)
   - DeploymentStatus (header)
   - BugReportModal trigger button (header)
   - GenerateSEOButton (next to SEO accordion)
   - SparkryBranding (footer/header)
3. [ ] Click each component, verify functionality
4. [ ] Run new integration tests: `npm run test:integration`
5. [ ] Deploy to staging, repeat steps 1-3
6. [ ] Stakeholder approval: "I can see and use all 5 features"
7. [ ] Screenshot evidence uploaded to `docs/project/CAPA-2025-11-22-EVIDENCE.png`

**Sign-Off Required**: Engineering Lead + Product Owner

---

## 7. Lessons Learned

### What We Learned

1. **"Tests Pass" ≠ "Feature Shipped"**
   - 87 passing tests provided false confidence
   - Need integration tests that verify actual UI rendering

2. **Acceptance Criteria Must Be User-Centric**
   - "Add header button" is ambiguous
   - Should be: "User can click 'View Live' button in Keystatic header"

3. **Review Process Needs UI Verification Step**
   - Code review focuses on logic, not integration
   - Need explicit "show me in the UI" checkpoint

4. **TDD Workflow Gap**
   - TDD ensures code correctness, not deployment completeness
   - Need "Integration-Driven Development" for UI features

5. **Definition of Done Was Incomplete**
   - Missing: "Feature visible in production-like environment"
   - Missing: "Screenshot evidence required"

### How This Could Have Been Prevented

**At Requirements Phase**:
- Acceptance criteria: "Screenshot showing button in Keystatic header at /keystatic/pages/*"

**At Test-Writing Phase**:
- Integration test required: `expect(KeystaticApp).toContainElement(ProductionLink)`
- E2E test required: `await page.goto('/keystatic'); await expect(page.locator('...')).toBeVisible()`

**At Review Phase**:
- PE-Reviewer checklist: "Component imported in parent? Yes/No"
- PE-Reviewer checklist: "Screenshot provided? Yes/No"

**At Deployment Phase**:
- Pre-deployment gate: "Verify in staging: http://staging.com/keystatic"
- Deployment checklist: "User can see feature? Yes/No"

---

## 8. Action Items Summary

| ID | Action | Owner | Priority | Due Date | Status |
|----|--------|-------|----------|----------|--------|
| CA-1 | Fix current implementation (integrate components) | SDE-III | P0 | 2025-11-23 | Open |
| CA-2 | Create integration tests | Test-Writer | P0 | 2025-11-23 | Open |
| PA-1 | Update CLAUDE.md § 3 (Definition of Done) | Eng Leadership | P0 | 2025-11-23 | Open |
| PA-2 | Update PE-Reviewer checklist | Code Quality | P0 | 2025-11-23 | Open |
| PA-3 | Update Test-Writer checklist | Test Infra | P0 | 2025-11-23 | Open |
| PA-4 | Update requirements template | Product | P1 | 2025-11-24 | Open |
| PA-5 | Update pre-deployment gates | Release Mgr | P0 | 2025-11-23 | Open |
| PA-6 | Create Keystatic integration guide | Docs-Writer | P1 | 2025-11-24 | Open |
| VER-1 | Verify process changes on next 3 tasks | Eng Leadership | P1 | 2025-11-30 | Open |

---

## 9. Related Documents

- **Incident Trigger**: `requirements/new-features.md` (REQ-001, REQ-002, REQ-006, REQ-P1-005, REQ-012)
- **Evidence Files**:
  - `components/keystatic/*.tsx` (orphaned components)
  - `components/keystatic/*.spec.tsx` (unit tests only)
  - `keystatic.config.ts` (missing `ui:` configuration)
- **Process Documents**:
  - `CLAUDE.md` § 3 (TDD Flow)
  - `.claude/agents/pe-reviewer.md`
  - `.claude/agents/test-writer.md`
- **New Documentation** (to be created):
  - `docs/technical/KEYSTATIC-CUSTOM-UI-INTEGRATION.md`
  - `requirements/template.md`

---

## 10. Sign-Off

**Corrective Actions Approved**:
- [ ] Engineering Leadership
- [ ] Product Owner
- [ ] QA Lead

**Preventive Actions Approved**:
- [ ] Engineering Leadership
- [ ] Process Improvement Team

**Date of Closure**: ________________ (after all CA-* and PA-* items completed)

**Effectiveness Review Date**: 2025-12-22 (30 days post-closure)

---

## Appendix A: Root Cause Diagram (5 Whys)

```
Components marked "ready" without UI integration
                    ↓
          Why? Tests passed, no UI check in review
                    ↓
          Why? Tests only verified component logic, not integration
                    ↓
          Why? No E2E test requirement in TDD workflow
                    ↓
          Why? Definition of Done doesn't mandate E2E for UI
                    ↓
          Why? Requirements didn't specify integration verification
                    ↓
ROOT CAUSE: Systemic gap between "component works" and "component integrated"
```

---

## Appendix B: Impact Assessment

### Story Points Wasted
- Component implementation: 13 SP
- Unit tests: 8 SP
- Code review: 3 SP
- **Total wasted**: 24 SP (50% of 47.8 SP)

### Story Points Required for Fix
- Integration implementation: 5 SP
- Integration tests: 3 SP
- Verification: 2 SP
- **Total fix cost**: 10 SP

### Process Improvement Cost
- CLAUDE.md updates: 2 SP
- Agent checklist updates: 3 SP
- Documentation creation: 5 SP
- **Total prevention cost**: 10 SP

**ROI**: Preventing one future occurrence saves 24 SP. Break-even on first prevention.

---

## Appendix C: Pre-Flight Checklist (New Standard)

**Use this checklist for ALL UI feature tasks going forward**:

```markdown
## UI Feature Deployment Checklist

**Before claiming "ready for deployment"**:

### Implementation
- [ ] Component created and coded
- [ ] Component imported into parent module
- [ ] Component rendered in parent JSX/config
- [ ] TypeScript compiles

### Testing
- [ ] Unit tests pass (component logic)
- [ ] Integration tests pass (component in parent context)
- [ ] E2E tests pass (component visible in browser)
- [ ] Visual regression tests pass (screenshot diff)

### Verification
- [ ] Ran `npm run dev`, navigated to feature URL
- [ ] Saw feature with own eyes in browser
- [ ] Clicked/interacted with feature
- [ ] Checked browser console (zero errors)
- [ ] Screenshot attached to PR

### Staging
- [ ] Deployed to staging
- [ ] Verified in staging environment
- [ ] Stakeholder reviewed in staging
- [ ] Stakeholder approved: "I can see and use this"

### Evidence
- [ ] Screenshot: before (feature missing)
- [ ] Screenshot: after (feature visible)
- [ ] E2E test video recording
- [ ] Sign-off from Product Owner

**If ANY checkbox unchecked**: DO NOT DEPLOY
```

---

---

## Update: API Constraint Discovery (2025-11-22)

**Status**: Root cause refined, corrective action updated

### Updated Root Cause Analysis

Initial CAPA identified process gaps (missing integration tests, unclear requirements). Subsequent research revealed a deeper technical issue:

**The integration pattern specified in requirements is technically impossible with Keystatic v0.5.48 API.**

### Evidence of API Constraint

**Type Definition Analysis**: `@keystatic/core/dist/declarations/src/config.d.ts` (lines 48-54)

```typescript
type UserInterface<Collections, Singletons> = {
  brand?: {
    mark?: BrandMark;
    name: string;
  };
  navigation?: Navigation<...>;
};
```

**Findings**:
- `ui` object supports ONLY: `brand` and `navigation` properties
- `ui.header` property does NOT exist in Keystatic's type definition
- `makePage()` function signature: `function makePage(config: Config): React.ComponentType`
- No parameters for wrapper components, header components, or children
- Returned component is a black box with no customization hooks

### Impact on Original Requirements

- **REQ-INTEGRATE-001** (KeystaticWrapper): Tests were written for a component that cannot exist within Keystatic's architecture
- **REQ-INTEGRATE-002** (ui.header config): Tests verified a property that doesn't exist in the API
- **REQ-INTEGRATE-003** (Component Visibility): Tests expected to find components that cannot be integrated

### Lessons Learned: API Verification Gate

**New Preventive Measure**: Add "API Verification" step to TDD workflow for third-party integrations.

**Before writing tests for third-party library features**:
1. Read actual type definitions (not just documentation)
2. Verify property/method exists in TypeScript types
3. Create minimal reproduction to test integration pattern
4. Only write tests for verified API capabilities

**How this applies to this incident**:
- Should have checked `@keystatic/core` type definitions BEFORE writing REQ-INTEGRATE-001 and REQ-INTEGRATE-002
- Type definition clearly shows `ui.header` doesn't exist
- Would have saved 8 SP of fixing broken tests + requirements updates

### Updated Corrective Action Plan

**Phase 1: Fix Test Infrastructure** (8 SP - IN PROGRESS)
- REQ-FIX-001: Remove tests for non-existent components (2 SP) - COMPLETE
- REQ-FIX-002: Update config tests to verify actual API (1.5 SP) - COMPLETE
- REQ-FIX-003: Fix page integration tests (1 SP) - COMPLETE
- REQ-FIX-004: Update requirements documentation (2 SP) - COMPLETE
- REQ-FIX-005: Update CAPA with lessons learned (1.5 SP) - IN PROGRESS

**Phase 2: Deliver Value Within Constraints** (5 SP - PLANNED)
- Create separate `/keystatic-tools` page with ProductionLink, DeploymentStatus, BugReportModal, SparkryBranding
- Use `ui.brand` for minimal branding (ONLY supported customization)
- Link from Keystatic admin to tools page (or browser bookmark)
- Components remain useful, just in different location

### Process Improvement: API Research Step

**Add to QPLAN workflow** (before QCODET):

```markdown
## API Research Step (for third-party integrations)

**Trigger**: Task involves integration with external library/framework

**Checklist**:
- [ ] Read type definition files (`.d.ts`) for actual API surface
- [ ] Verify property/method exists in types (not just docs)
- [ ] Create minimal spike to test integration pattern
- [ ] Document supported vs unsupported features
- [ ] Update requirements if API doesn't support desired feature

**Output**: API Capability Matrix
- ✅ Supported: List verified features
- ❌ Not Supported: List missing features
- ⚠️ Unknown: Features needing further investigation

**Blocker**: If required feature is NOT supported, STOP and reassess requirements.
```

### Cost of API Verification Failure

**Wasted Effort**:
- Writing tests for non-existent API: 3 SP
- Fixing broken tests: 8 SP
- Updating requirements documentation: 2 SP
- **Total**: 13 SP wasted

**Prevention Cost**:
- API research spike: 1 SP
- Type definition review: 0.5 SP
- **Total**: 1.5 SP to prevent

**ROI**: 13 SP / 1.5 SP = 8.67x return on investment for API verification step

---

---

## Update: Navigation API Constraint Discovery (2025-11-23)

**Status**: Additional API constraint discovered, corrective action applied

### Second API Constraint: Navigation Type Restriction

After implementing Phase 2 solution (`/keystatic-tools` page with `ui.navigation` link), production deployment revealed another API constraint violation:

**Error**: `Unknown navigation key: "/keystatic-tools"`

### Evidence of Navigation Constraint

**Type Definition Analysis**: `@keystatic/core/dist/declarations/src/config.d.ts` (lines 53-56)

```typescript
navigation?: Navigation<(keyof Collections & string) | (keyof Singletons & string) | typeof NAVIGATION_DIVIDER_KEY>;

type Navigation<K> = K[] | {
  [section: string]: K[];
};

// NAVIGATION_DIVIDER_KEY = "---"
```

**Findings**:
- `navigation` generic type parameter `K` is constrained to:
  - Collection keys only: `'pages'`, `'staff'`
  - Singleton keys (none in our config)
  - Divider constant: `'---'`
- External route paths like `'/keystatic-tools'` are NOT allowed
- Navigation is for organizing existing collections, not adding custom links

### Invalid Configuration That Caused Error

**keystatic.config.ts** (lines 37-42):
```typescript
ui: {
  navigation: {
    Content: ['pages', 'staff'],
    Tools: ['/keystatic-tools'],  // ❌ RUNTIME ERROR
  },
},
```

**Runtime Error**:
```
Error: Unknown navigation key: "/keystatic-tools".
    at nt (dad0368a-055913339a3a34b3.js:1:34808)
```

### Root Cause: Incomplete TypeScript Generic Analysis

**Why This Wasn't Caught Earlier**:
1. Type definition showed `navigation` property exists ✅
2. But didn't analyze the generic type constraint `Navigation<K>`
3. Assumed navigation accepted arbitrary strings
4. Runtime validation rejected invalid keys

**API Verification Gap**: Checked property existence but not generic constraints.

### Corrective Action Taken

**File**: `keystatic.config.ts`

**Before** (causing runtime error):
```typescript
ui: {
  navigation: {
    Content: ['pages', 'staff'],
    Tools: ['/keystatic-tools'],  // ❌ Invalid
  },
},
```

**After** (compliant with API):
```typescript
ui: {
  navigation: {
    Content: ['pages', 'staff'],
  },
},
```

**Test Updates**: `__tests__/keystatic.config.navigation.test.ts`

- Removed tests expecting `/keystatic-tools` route
- Added tests verifying only collection keys allowed
- Added test documenting API constraint with code comments
- Added regression test preventing external routes

### Lessons Learned: Generic Type Constraints

**New Preventive Measure**: When verifying TypeScript APIs, analyze generic type constraints.

**Enhanced API Verification Checklist**:
- [ ] Property exists in type definition
- [ ] Property type is compatible with usage
- [ ] **Generic constraints analyzed** (e.g., `Navigation<K>` where `K = keyof Collections`)
- [ ] Runtime validation behavior understood
- [ ] Minimal spike tests actual integration

**How This Applies**:
- Initial API verification confirmed `ui.navigation` exists ✅
- But missed analyzing `Navigation<K>` generic constraint ❌
- Should have checked: "What values are valid for K?"
- Type definition showed: `K = (keyof Collections & string) | ...`
- Would have immediately seen external routes not allowed

### Cost Impact

**Time to Discovery**:
- Implementation: 0.3 SP
- Deployment: 0.1 SP
- Error discovery in production: 0 SP (user reported immediately)
- Analysis & fix: 0.8 SP
- **Total**: 1.2 SP wasted

**Prevention Cost**:
- Read generic constraints: +0.2 SP to API verification
- **Total**: 0.2 SP to prevent

**ROI**: 1.2 SP / 0.2 SP = 6x return on investment for analyzing generic constraints

### Updated API Verification Process

**QPLAN § API Research Step** (enhancement):

```markdown
## API Research Checklist (Enhanced 2025-11-23)

**For third-party integrations**:
- [ ] Property/method exists in type definitions
- [ ] **Generic type constraints analyzed**
  - Read generic parameter bounds: `T extends X`, `K = keyof Y`
  - Verify values satisfy constraints
  - Check for discriminated unions, type narrowing
- [ ] Return types compatible with usage
- [ ] Runtime validation behavior (some APIs validate at runtime)
- [ ] Create minimal spike to test integration pattern
- [ ] **Test with invalid values** to verify error messages

**Example**:
```typescript
// Don't just check: navigation?: Navigation<...> exists ✅
// Also check: What can K be in Navigation<K>?
type Navigation<K> = ...
// K = (keyof Collections & string) | (keyof Singletons & string) | '---'
// Therefore: Only collection names, singleton names, or '---' allowed
```
```

### Status Update

- `keystatic.config.ts` fixed (Tools section removed)
- Navigation tests updated to enforce API constraints
- CAPA documentation updated with generic constraint lesson
- Deployment blocked until tests pass

**Sign-Off**: Engineering Lead (pending test verification)

---

**Document Version**: 1.2
**Last Updated**: 2025-11-23 (Added Navigation API Constraint Discovery section)
**Next Review**: 2025-12-22
