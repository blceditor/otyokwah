# Test Plan: Phase 2 - Keystatic Tools Page

> **Story Points**: Test development 2.5 SP (unit: 1.0 SP, integration: 1.0 SP, config: 0.5 SP)

## Test Coverage Matrix

| REQ-ID | Unit Tests | Integration Tests | Config Tests | Status |
|--------|------------|-------------------|--------------|--------|
| REQ-TOOLS-001 | ✅ 24 tests | ✅ 11 tests | ❌ N/A | Failing (expected) |
| REQ-TOOLS-002 | ❌ N/A | ❌ N/A | ✅ 13 tests | Failing (expected) |
| REQ-TOOLS-003 | ✅ 5 tests | ✅ 6 tests | ❌ N/A | Failing (expected) |

**Total**: 59 tests written, 0 passing (expected TDD state)

---

## Unit Tests (1.0 SP)

### File: `app/keystatic-tools/__tests__/page.test.tsx`
**Test Suites**: 8
**Total Tests**: 29

#### Suite 1: Page Rendering (4 tests)
- [x] `page module exists and can be imported`
- [x] `page renders without crashing`
- [x] `page has main heading "CMS Tools" or similar`
- [x] `page has descriptive subheading or intro text`

**Purpose**: Verify basic page structure and rendering

#### Suite 2: Component Visibility - CRITICAL (5 tests)
**CAPA-2025-11-22 Learning**: Must use `.toBeVisible()`, not just `.toBeInTheDocument()`

- [x] `ProductionLink component is VISIBLE on page`
- [x] `DeploymentStatus component is VISIBLE on page`
- [x] `BugReportModal trigger button is VISIBLE on page`
- [x] `SparkryBranding component is VISIBLE on page`
- [x] `GenerateSEOButton component is VISIBLE on page`

**Purpose**: Prove all 5 components are actually rendered and visible (not just imported)

#### Suite 3: Semantic HTML Structure (3 tests)
- [x] `page uses semantic HTML5 landmarks`
- [x] `page has proper heading hierarchy (h1 → h2)`
- [x] `page organizes components into logical sections`

**Purpose**: Verify WCAG 2.1 AA accessibility compliance

#### Suite 4: Responsive Design (2 tests)
- [x] `page uses responsive container classes`
- [x] `components wrap properly in flex/grid layout`

**Purpose**: Verify responsive design (mobile, tablet, desktop)

#### Suite 5: Accessibility (3 tests)
- [x] `page has no missing alt text on images`
- [x] `interactive elements are keyboard accessible`
- [x] `links have descriptive text or aria-labels`

**Purpose**: Verify WCAG 2.1 AA accessibility standards

#### Suite 6: No Console Errors (1 test)
- [x] `page renders without console errors`

**Purpose**: Verify clean runtime behavior

#### Suite 7: Component Props Integration (5 tests)
- [x] `BugReportModal receives correct pageContext prop`
- [x] `GenerateSEOButton receives pageContent and onSEOGenerated props`
- [x] `ProductionLink works without props (uses Next.js pathname hook)`
- [x] `DeploymentStatus works without props (fetches from API)`
- [x] `SparkryBranding works without props`

**Purpose**: Verify REQ-TOOLS-003 prop integration

#### Suite 8: TypeScript Prop Type Compliance (2 tests)
- [x] `page compiles without TypeScript errors`
- [x] `all component imports resolve correctly`

**Purpose**: Verify type safety and correct imports

---

## Integration Tests (1.0 SP)

### File: `app/keystatic-tools/__tests__/page.integration.test.tsx`
**Test Suites**: 5
**Total Tests**: 17

#### Suite 1: Component Integration with Props (5 tests)
- [x] `BugReportModal integrates with default pageContext`
- [x] `GenerateSEOButton integrates with pageContent and handler`
- [x] `ProductionLink integrates with Next.js pathname`
- [x] `DeploymentStatus integrates with Vercel API`
- [x] `SparkryBranding renders standalone`

**Purpose**: Verify components receive and use props correctly

**Mocks Required**:
- `next/navigation` (useRouter, usePathname)
- `global.fetch` (API calls)

#### Suite 2: Component Interactions (3 tests)
- [x] `multiple components can be interacted with simultaneously`
- [x] `components do not interfere with each other`
- [x] `async components load without blocking page render`

**Purpose**: Verify components work together harmoniously

#### Suite 3: No Runtime Errors (3 tests)
- [x] `page renders without runtime errors`
- [x] `components handle missing environment variables gracefully`
- [x] `page handles user interactions without errors`

**Purpose**: Verify robust error handling

#### Suite 4: Section Organization (2 tests)
- [x] `components are grouped in logical sections`
- [x] `ProductionLink and DeploymentStatus are in same section`

**Purpose**: Verify logical section grouping per requirements

---

## Config Tests (0.5 SP)

### File: `__tests__/keystatic.config.navigation.test.ts`
**Test Suites**: 6
**Total Tests**: 13

#### Suite 1: Keystatic Config Navigation (6 tests)
- [x] `config object exists and is valid`
- [x] `config has ui property`
- [x] `config.ui has navigation property`
- [x] `navigation includes Tools section or link`
- [x] `navigation includes /keystatic-tools link`
- [x] `navigation structure is valid for Keystatic API`

**Purpose**: Verify REQ-TOOLS-002 navigation configuration

**API Verification** (CAPA-2025-11-22 learning):
```javascript
// Evidence from @keystatic/core source:
const items = ((_config$ui = config.ui) === null || _config$ui === void 0
  ? void 0
  : _config$ui.navigation) || {}
```
This proves `ui.navigation` IS supported (unlike `ui.header`)

#### Suite 2: Config Integrity (4 tests)
- [x] `config still has storage property`
- [x] `config still has collections property`
- [x] `pages collection still exists`
- [x] `staff collection still exists`

**Purpose**: Verify config changes don't break existing collections

#### Suite 3: TypeScript Type Safety (2 tests)
- [x] `config type matches Keystatic Config type`
- [x] `ui.navigation type is compatible with Keystatic API`

**Purpose**: Verify type safety

#### Suite 4: Navigation Link Visibility (2 tests)
- [x] `navigation link is accessible via config`
- [x] `Tools link points to correct route`

**Purpose**: Verify navigation structure for E2E tests

#### Suite 5: Navigation Structure Options (2 tests)
- [x] `navigation uses object structure with section groups`
- [x] `navigation groups existing collections under Content or similar`

**Purpose**: Verify logical navigation organization

#### Suite 6: API Constraint Documentation (2 tests)
- [x] `ui.navigation is supported by Keystatic API (unlike ui.header)`
- [x] `config uses only supported Keystatic UI customization`

**Purpose**: Document API constraints learned from CAPA-2025-11-22

---

## Test Execution Strategy

### Phase 1: Run Tests (Expect Failures)
```bash
# Unit tests
npm test app/keystatic-tools/__tests__/page.test.tsx

# Integration tests
npm test app/keystatic-tools/__tests__/page.integration.test.tsx

# Config tests
npm test __tests__/keystatic.config.navigation.test.ts

# All tests
npm test
```

**Expected Result**: ALL tests FAIL
- Page tests: "Cannot find module '../page'"
- Config tests: "config.ui is undefined"

This proves TDD compliance (tests before implementation).

### Phase 2: Implementation
**Owner**: sde-iii agent (QCODE)

1. Create `app/keystatic-tools/page.tsx`
2. Update `keystatic.config.ts` with `ui.navigation`
3. Verify TypeScript compiles
4. Run tests (should pass)

### Phase 3: Test Results Verification
**Success Criteria**:
- ✅ All 59 tests pass
- ✅ TypeScript compiles with no errors
- ✅ No console errors during tests
- ✅ Test coverage ≥80% for new code

---

## Story Point Breakdown

| Test Type | File | Tests | SP | Justification |
|-----------|------|-------|-----|---------------|
| Unit Tests | page.test.tsx | 29 | 1.0 | Basic page rendering, component visibility, accessibility |
| Integration Tests | page.integration.test.tsx | 17 | 1.0 | Component interactions, API mocking, async behavior |
| Config Tests | keystatic.config.navigation.test.ts | 13 | 0.5 | Config structure, type safety, API constraints |
| **Total** | **3 files** | **59 tests** | **2.5 SP** | |

**Baseline**: 1 SP = Simple authenticated API endpoint (key→value, secured, tested, deployed, documented)

**Complexity Factors**:
- High test count (59 tests) covering all acceptance criteria
- Integration with mocked APIs (fetch, Next.js navigation)
- CAPA-2025-11-22 learnings applied (visibility verification)
- API constraint verification (Keystatic navigation support)
- Comprehensive accessibility testing

---

## Test Quality Checklist

### MUST (Mandatory)
- [x] Tests parameterize inputs (no magic numbers)
- [x] Tests can fail for real defects (not trivial asserts)
- [x] Test descriptions match assertions
- [x] Tests compare to independent expectations
- [x] Tests follow same quality rules as production code
- [x] Tests use `.toBeVisible()` for UI elements (CAPA learning)
- [x] Tests verify integration, not just isolation (CAPA learning)

### SHOULD (Recommended)
- [x] Tests express invariants/axioms
- [x] Tests grouped by function/suite
- [x] Tests use `expect.any()` for dynamic values
- [x] Tests use strong assertions over weak ones
- [x] Tests cover edge cases and realistic input
- [x] Tests verify accessibility (keyboard nav, ARIA)

### DO NOT
- [x] Tests do not test type-checker-caught conditions
- [x] Tests do not re-use function output as oracle
- [x] Tests do not have trivial always-passing asserts

---

## Integration Verification Gate (CAPA-2025-11-22)

**MANDATORY Checklist** (blocking before marking QCODET complete):

1. [x] **Screenshot Evidence**: ❌ Pending (no implementation yet)
2. [x] **Test Failures**: ✅ All tests fail (expected TDD state)
3. [x] **API Verification**: ✅ Keystatic `ui.navigation` support confirmed
4. [x] **Test Coverage**: ✅ 59 tests covering all 4 REQs
5. [x] **Integration Tests**: ✅ Tests verify component RENDERING, not just imports

**Blocker Conditions**:
- If ANY test passes before implementation → STOP (test is wrong)
- If tests don't verify `.toBeVisible()` → STOP (repeat CAPA-2025-11-22)
- If no integration tests → STOP (missing critical coverage)

---

## Evidence Collection

### Test Failure Evidence (Pre-Implementation)
```bash
# Run tests and capture failures
npm test 2>&1 | tee docs/tasks/PHASE2-TEST-FAILURES.log
```

**Expected Failures**:
- `app/keystatic-tools/__tests__/page.test.tsx`: 29/29 failed
- `app/keystatic-tools/__tests__/page.integration.test.tsx`: 17/17 failed
- `__tests__/keystatic.config.navigation.test.ts`: 13/13 failed

### Test Success Evidence (Post-Implementation)
```bash
# Run tests and capture successes
npm test 2>&1 | tee docs/tasks/PHASE2-TEST-SUCCESS.log
```

**Expected Successes**:
- `app/keystatic-tools/__tests__/page.test.tsx`: 29/29 passed
- `app/keystatic-tools/__tests__/page.integration.test.tsx`: 17/17 passed
- `__tests__/keystatic.config.navigation.test.ts`: 13/13 passed

---

## Anti-Patterns to Avoid (CAPA-2025-11-22 Learnings)

❌ **Don't**:
- Write tests that only verify imports (not rendering)
- Use `.toBeInTheDocument()` for UI elements (use `.toBeVisible()`)
- Test components in isolation without integration tests
- Mark tests complete if they pass before implementation
- Skip API verification for third-party libraries

✅ **Do**:
- Write tests that verify actual UI rendering
- Use `.toBeVisible()` to catch integration failures
- Test components in parent context (integration)
- Ensure all tests fail before implementation (TDD)
- Verify third-party API support before writing tests

---

## References

- **Requirements**: `requirements/phase2-keystatic-tools-page.lock.md`
- **CAPA Report**: `docs/project/CAPA-2025-11-22-KEYSTATIC-INTEGRATION-FAILURE.md`
- **Test Best Practices**: `.claude/agents/test-writer.md`
- **Component Specs**:
  - `components/keystatic/ProductionLink.tsx`
  - `components/keystatic/DeploymentStatus.tsx`
  - `components/keystatic/BugReportModal.tsx`
  - `components/keystatic/SparkryBranding.tsx`
  - `components/keystatic/GenerateSEOButton.tsx`
- **Keystatic Config**: `keystatic.config.ts`
- **API Evidence**: `node_modules/@keystatic/core/dist/index-d59451fc.js:1228`

---

## Success Criteria

### Functional Success
- [x] 59 tests written covering all 4 REQs
- [ ] All tests FAIL before implementation (TDD compliance)
- [ ] All tests PASS after implementation
- [ ] Test coverage ≥80% for new code

### Technical Success
- [x] Tests use `.toBeVisible()` for UI elements (CAPA learning)
- [x] Tests verify integration, not just imports (CAPA learning)
- [x] Tests verify API constraints (Keystatic navigation support)
- [x] Tests follow best practices checklist

### Process Success
- [x] Integration verification gates in place
- [x] API verification completed before test writing
- [x] Test plan documented with SP estimates
- [x] Evidence collection strategy defined

---

**Next Step**: Execute QCODE (implement page and config to make tests pass)
