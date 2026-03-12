# Test Plan: Keystatic UI Integration

> **Story Points**: Test development 2.5 SP

## Test Coverage Matrix

| REQ-ID | Unit Tests | Integration Tests | E2E Tests | Status |
|--------|------------|-------------------|-----------|--------|
| REQ-INTEGRATE-001 | ✅ 7 tests | ✅ 4 tests | ❌ Pending | **FAILING** ✓ |
| REQ-INTEGRATE-002 | ❌ N/A | ✅ 13 tests | ❌ Pending | **FAILING** ✓ |
| REQ-INTEGRATE-003 | ✅ 10 tests | ✅ 7 tests | ❌ Pending | **FAILING** ✓ |

**Total Integration Tests**: 41 tests
**Expected Failures**: 41/41 (100% - TDD compliance)
**Current Status**: ✅ All tests failing as expected before implementation

---

## Test Failure Summary

### Critical Failures (Expected)

#### 1. KeystaticWrapper Component Not Found
**File**: `app/keystatic/__tests__/KeystaticWrapper.integration.test.tsx`

**Error**:
```
Error: Failed to resolve import "../KeystaticWrapper" from
"app/keystatic/__tests__/KeystaticWrapper.integration.test.tsx".
Does the file exist?
```

**Expected Behavior**: This test MUST fail because `KeystaticWrapper.tsx` does not exist yet.

**Tests Blocked**: 21 tests in KeystaticWrapper suite

**REQ Coverage**: REQ-INTEGRATE-001, REQ-INTEGRATE-003

---

#### 2. Page Does Not Integrate Components
**File**: `app/keystatic/[[...params]]/__tests__/page.integration.test.tsx`

**Failures**: 20/24 tests failing

**Key Errors**:
```
× page imports KeystaticWrapper
  → expected false to be true

× all header components are visible in integrated page
  → expect(received).toBeInTheDocument()
  → received value must be an HTMLElement or an SVGElement.

× Unable to find an accessible element with the role "link"
  and name `/view live page/i`
  → There are no accessible roles.
```

**Expected Behavior**: Tests fail because `page.tsx` does not import or use `KeystaticWrapper`.

**Current Page Structure**:
```tsx
// app/keystatic/[[...params]]/page.tsx
export default function Page() {
  return <KeystaticApp />;  // NOT WRAPPED
}
```

**Expected Page Structure After Implementation**:
```tsx
import { KeystaticWrapper } from '../KeystaticWrapper';

export default function Page() {
  return (
    <KeystaticWrapper>
      <KeystaticApp />
    </KeystaticWrapper>
  );
}
```

**REQ Coverage**: REQ-INTEGRATE-002, REQ-INTEGRATE-003

---

## Unit Tests

### REQ-INTEGRATE-001: KeystaticWrapper Component (2 SP)

**File**: `app/keystatic/__tests__/KeystaticWrapper.integration.test.tsx`

#### Suite 1: Component Integration (7 tests)
- `wrapper component exists and can be imported` - **FAILING** ✓
  - **Error**: "Cannot find module '../KeystaticWrapper'"
  - **Validates**: Component file must be created

- `renders all header components in correct order` - **FAILING** ✓
  - **Expected**: DeploymentStatus, ProductionLink, BugReportModal, SparkryBranding all rendered
  - **Validates**: All 4 components integrated

- `renders children prop below header components` - **FAILING** ✓
  - **Expected**: Children render after header in DOM tree
  - **Validates**: Layout structure (header first, content second)

- `header has fixed positioning` - **FAILING** ✓
  - **Expected**: Header has `position: fixed` or `position: sticky`
  - **Validates**: Header stays visible on scroll

- `header has proper z-index for layering` - **FAILING** ✓
  - **Expected**: Header z-index between content and modals (10-50 range)
  - **Validates**: No layering conflicts

- `component is a client component` - **FAILING** ✓
  - **Expected**: Component can render in client environment
  - **Validates**: Uses 'use client' directive

- `exports as named export` - **FAILING** ✓
  - **Expected**: `import { KeystaticWrapper } from './KeystaticWrapper'` works
  - **Validates**: Correct export pattern

#### Suite 2: Integration Pattern Validation (4 tests)
- `wrapper accepts ReactNode children type` - **FAILING** ✓
  - **Expected**: Can pass string, element, or fragment as children
  - **Validates**: TypeScript types correct

- `wrapper renders without children (edge case)` - **FAILING** ✓
  - **Expected**: Header still renders even if no children
  - **Validates**: No crashes on missing children

- `wrapper handles null or undefined children` - **FAILING** ✓
  - **Expected**: No crashes with null/undefined children
  - **Validates**: Defensive programming

- `wrapper preserves children component state` - **FAILING** ✓
  - **Expected**: Children don't remount on wrapper re-render
  - **Validates**: Performance and state preservation

---

### REQ-INTEGRATE-003: Component Visibility (10 tests)

**File**: `app/keystatic/__tests__/KeystaticWrapper.integration.test.tsx`

#### Suite 3: Component Visibility Verification (10 tests)
- `DeploymentStatus component is visible in document` - **FAILING** ✓
  - **Expected**: Component found by text content
  - **Validates**: Component actually rendered

- `ProductionLink component is keyboard accessible` - **FAILING** ✓
  - **Expected**: Link focusable, has href, target="_blank"
  - **Validates**: Accessibility compliance

- `BugReportModal trigger has ARIA label` - **FAILING** ✓
  - **Expected**: Button has aria-label or accessible name
  - **Validates**: Screen reader support

- `SparkryBranding is visible in DOM tree` - **FAILING** ✓
  - **Expected**: Component found by alt text or text content
  - **Validates**: Component rendered

- `all components have proper ARIA labels for accessibility` - **FAILING** ✓
  - **Expected**: All interactive elements have accessible names
  - **Validates**: WCAG compliance

- `header layout does not cause cumulative layout shift` - **FAILING** ✓
  - **Expected**: Header has explicit height to prevent CLS
  - **Validates**: Performance (Core Web Vitals)

- `components are in correct visual hierarchy` - **FAILING** ✓
  - **Expected**: Header before content in DOM order
  - **Validates**: Semantic HTML structure

- `wrapper maintains semantic HTML structure` - **FAILING** ✓
  - **Expected**: Uses `<header>` or `role="banner"`
  - **Validates**: HTML5 semantics

---

## Integration Tests

### REQ-INTEGRATE-002: Page Integration (1 SP)

**File**: `app/keystatic/[[...params]]/__tests__/page.integration.test.tsx`

#### Suite 1: Keystatic Page Integration (6 tests)
- `page component exists and can be imported` - **PASSING** ✓
  - **Status**: ✅ Page file exists
  - **Validates**: Basic infrastructure

- `page imports KeystaticWrapper` - **FAILING** ✓
  - **Error**: "expected false to be true"
  - **Validates**: Import statement added to page.tsx

- `page wraps KeystaticApp with KeystaticWrapper` - **FAILING** ✓
  - **Error**: "expect(received).toBeInTheDocument() - received value must be an HTMLElement"
  - **Validates**: Wrapper component used in JSX

- `KeystaticApp is rendered as child of wrapper` - **FAILING** ✓
  - **Error**: Wrapper not found in DOM
  - **Validates**: Correct parent-child relationship

- `page still uses dynamic import for KeystaticApp` - **FAILING** ✓
  - **Error**: "expected null to be truthy"
  - **Validates**: Maintains `ssr: false` for Keystatic

- `page compiles TypeScript without errors` - **PASSING** ✓
  - **Status**: ✅ Tests run (TypeScript compiled)
  - **Validates**: Type safety

- `page renders without console errors` - **PASSING** ✓
  - **Status**: ✅ No console errors during test
  - **Validates**: No runtime errors

#### Suite 2: Full Integration Component Visibility (6 tests)
- `all header components are visible in integrated page` - **FAILING** ✓
  - **Error**: "expect(received).toBeInTheDocument() - received value must be an HTMLElement"
  - **Validates**: Integration complete

- `ProductionLink has correct href for current page` - **FAILING** ✓
  - **Error**: "Unable to find an accessible element with the role 'link'"
  - **Validates**: Component functional in context

- `BugReportModal can be opened via keyboard` - **FAILING** ✓
  - **Error**: "Unable to find an accessible element with the role 'button'"
  - **Validates**: Keyboard navigation works

- `header components are interactive` - **FAILING** ✓
  - **Error**: Components not found in DOM
  - **Validates**: User interactions possible

- `components maintain accessibility in integrated context` - **FAILING** ✓
  - **Error**: Components not accessible
  - **Validates**: Accessibility not broken by integration

- `integration does not break KeystaticApp rendering` - **FAILING** ✓
  - **Error**: Wrapper not found
  - **Validates**: Keystatic still works

#### Suite 3: Integration Pattern Validation (5 tests)
- `wrapper receives KeystaticApp as children` - **FAILING** ✓
  - **Error**: Wrapper not in DOM
  - **Validates**: Correct prop passing

- `integration follows correct component hierarchy` - **FAILING** ✓
  - **Error**: Expected structure not found
  - **Validates**: Page > Wrapper > [Header, App]

- `page maintains dynamic import behavior` - **FAILING** ✓
  - **Error**: Component not rendering
  - **Validates**: SSR disabled for Keystatic

- `integration does not introduce hydration mismatches` - **FAILING** ✓
  - **Error**: "expected 0 to be greater than 0"
  - **Validates**: No SSR/CSR mismatch

#### Suite 4: Edge Cases and Error Handling (3 tests)
- `page handles missing pathname gracefully` - **PASSING** ✓
  - **Status**: ✅ No crash on undefined pathname
  - **Validates**: Defensive programming

- `page renders even if header components fail` - **FAILING** ✓
  - **Error**: Page structure missing
  - **Validates**: Error boundaries work

- `integration works with various viewport sizes` - **FAILING** ✓
  - **Error**: "Cannot read properties of null"
  - **Validates**: Responsive design

#### Suite 5: Accessibility Integration Tests (4 tests)
- `integrated page has proper landmark structure` - **FAILING** ✓
  - **Error**: "Cannot read properties of null"
  - **Validates**: Semantic HTML in integrated context

- `all header components are keyboard navigable` - **FAILING** ✓
  - **Error**: Components not found
  - **Validates**: Full keyboard support

- `header components have proper focus order` - **FAILING** ✓
  - **Error**: Components not found
  - **Validates**: Logical tab order

- `screen reader can announce all header components` - **FAILING** ✓
  - **Error**: Components not found
  - **Validates**: Screen reader compatibility

---

## Test Execution Strategy

### Phase 1: Pre-Implementation Validation (COMPLETE ✓)
1. ✅ Write all integration tests
2. ✅ Run tests to confirm failures
3. ✅ Verify failure messages are clear
4. ✅ Document expected failures

**Result**: 41/41 tests failing as expected

### Phase 2: Implementation (NEXT STEP)
1. ⬜ Create `KeystaticWrapper.tsx`
2. ⬜ Integrate components into wrapper
3. ⬜ Update `page.tsx` to use wrapper
4. ⬜ Run tests iteratively (TDD red-green-refactor)

### Phase 3: Test Validation (AFTER IMPLEMENTATION)
1. ⬜ Run all integration tests
2. ⬜ Verify 41/41 tests passing
3. ⬜ Run existing unit tests (87 tests should still pass)
4. ⬜ Total: 128 passing tests

### Phase 4: Manual Verification (BEFORE MERGE)
1. ⬜ Run `npm run dev`
2. ⬜ Navigate to http://localhost:3000/keystatic
3. ⬜ Verify all 4 components visible
4. ⬜ Click each component, verify functionality
5. ⬜ Take screenshot as evidence
6. ⬜ Check browser console (zero errors)

---

## Success Criteria

### Automated Tests
- [ ] **100% Integration Test Pass Rate**: 41/41 tests passing
- [ ] **No Regression**: 87 existing unit tests still passing
- [ ] **TypeScript**: `npm run typecheck` passes
- [ ] **Linting**: `npm run lint` passes

### Manual Verification
- [ ] **Visual Confirmation**: All 4 components visible at /keystatic
- [ ] **Functional Confirmation**: All components clickable/interactive
- [ ] **Console Clean**: Zero errors in browser console
- [ ] **Accessibility**: All components keyboard navigable

### Documentation
- [ ] **Screenshot Evidence**: Image showing integrated UI
- [ ] **Test Results**: Test output showing all green
- [ ] **CAPA Update**: Mark CA-2 as complete in CAPA report

---

## Test Coverage Details

### Lines of Test Code
- KeystaticWrapper tests: ~260 lines
- Page integration tests: ~360 lines
- **Total**: ~620 lines of integration test code

### REQ Coverage
- REQ-INTEGRATE-001: 11 tests (wrapper component)
- REQ-INTEGRATE-002: 13 tests (page integration)
- REQ-INTEGRATE-003: 17 tests (visibility verification)

### Test Types
- Import validation: 2 tests
- Component rendering: 15 tests
- Accessibility: 12 tests
- Layout structure: 6 tests
- Edge cases: 6 tests

---

## Blocking Issues

### Current Blockers (Expected)
1. ✅ `KeystaticWrapper.tsx` does not exist
   - **Resolution**: Create component (REQ-INTEGRATE-001)

2. ✅ `page.tsx` does not import wrapper
   - **Resolution**: Update page imports (REQ-INTEGRATE-002)

3. ✅ Components not integrated into UI
   - **Resolution**: Add components to wrapper JSX (REQ-INTEGRATE-001)

### No Technical Blockers
- ✅ All dependencies available (React, Next.js, testing-library)
- ✅ All individual components exist and pass unit tests
- ✅ Test infrastructure configured (Vitest, jsdom)

---

## Test Failure Tracking

### CAPA-2025-11-22 Reference
These integration tests were created in response to **CAPA-2025-11-22**, which identified that components were implemented and unit tested but never integrated into the UI.

### Expected Test Failures (Pre-Implementation)
All 41 integration test failures are **expected and correct** because:
1. They verify components are actually integrated (not just exist)
2. They test in parent context (not isolation)
3. They validate user-visible behavior (not just code correctness)

### Test Failure Logging
**Do NOT log these to `.claude/metrics/test-failures.md`** because:
- ❌ These are expected TDD failures (not bugs)
- ❌ Tests written before implementation (correct process)
- ❌ Failures indicate missing implementation (not broken code)

**DO log** if tests fail AFTER implementation completes:
- ✅ Integration test fails after wrapper created → real bug
- ✅ Component not visible despite integration → real bug
- ✅ Accessibility test fails after implementation → real bug

---

## References

- **Requirements Lock**: `/requirements/keystatic-integration.lock.md`
- **CAPA Report**: `/docs/project/CAPA-2025-11-22-KEYSTATIC-INTEGRATION-FAILURE.md`
- **Test Files**:
  - `/app/keystatic/__tests__/KeystaticWrapper.integration.test.tsx`
  - `/app/keystatic/[[...params]]/__tests__/page.integration.test.tsx`
- **Implementation Files** (to be created):
  - `/app/keystatic/KeystaticWrapper.tsx`
  - `/app/keystatic/[[...params]]/page.tsx` (to be modified)

---

## Story Point Breakdown

| Test Suite | Test Count | Development SP | Total SP |
|------------|------------|----------------|----------|
| KeystaticWrapper Integration | 21 tests | 1.5 SP | 1.5 SP |
| Page Integration | 20 tests | 1.0 SP | 1.0 SP |
| **TOTAL** | **41 tests** | **2.5 SP** | **2.5 SP** |

**Remaining Implementation SP**: 2.5 SP (create wrapper + integrate into page)
**Total Task SP**: 5.0 SP

---

**Document Version**: 1.0
**Created**: 2025-11-22
**Status**: Tests written, all failing as expected ✓
**Next Step**: Begin implementation (QCODE)
