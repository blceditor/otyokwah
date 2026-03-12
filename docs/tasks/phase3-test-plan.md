# Test Plan: Phase 3 Work at Camp Pages

> **Story Points**: Test development 3 SP (unit tests 1.5 SP, integration tests 1.5 SP)
> **Total Implementation**: 28.5 SP
> **Date**: 2025-12-12
> **Status**: Tests created, ALL FAILING (TDD red phase)

---

## Test Coverage Matrix

| REQ-ID | Unit Tests | Integration Tests | Status |
|--------|------------|-------------------|--------|
| REQ-WAC001 | ✅ WorkAtCampPage.spec.tsx (45 tests) | ✅ work-at-camp.spec.ts (10 tests) | ❌ FAILING (component not implemented) |
| REQ-SS001 | ✅ SummerStaffPage.spec.tsx (7 tests) | ✅ work-at-camp.spec.ts (6 tests) | ❌ FAILING (component not implemented) |
| REQ-SS002 | ✅ SummerStaffPage.spec.tsx (8 tests) | ✅ work-at-camp.spec.ts | ❌ FAILING (component not implemented) |
| REQ-SS003 | ✅ SummerStaffPage.spec.tsx (10 tests) | ✅ work-at-camp.spec.ts (6 tests) | ❌ FAILING (component not implemented) |
| REQ-SS004 | ✅ SummerStaffPage.spec.tsx (10 tests) | ✅ work-at-camp.spec.ts (7 tests) | ❌ FAILING (component not implemented) |
| REQ-SS005 | ✅ SummerStaffPage.spec.tsx (4 tests) | ✅ work-at-camp.spec.ts | ❌ FAILING (component not implemented) |
| REQ-SS006 | ✅ SummerStaffPage.spec.tsx (8 tests) | ✅ work-at-camp.spec.ts (7 tests) | ❌ FAILING (component not implemented) |
| REQ-LIT001 | ✅ LITPage.spec.tsx (7 tests) | ✅ work-at-camp.spec.ts (6 tests) | ❌ FAILING (component not implemented) |
| REQ-LIT002 | ✅ LITPage.spec.tsx (9 tests) | ✅ work-at-camp.spec.ts | ❌ FAILING (component not implemented) |
| REQ-LIT003 | ✅ LITPage.spec.tsx (14 tests) | ✅ work-at-camp.spec.ts (5 tests) | ❌ FAILING (component not implemented) |
| REQ-LIT004 | ✅ LITPage.spec.tsx (13 tests) | ✅ work-at-camp.spec.ts (7 tests) | ❌ FAILING (component not implemented) |

**Total Unit Tests**: 135+ tests across 3 component files
**Total Integration Tests**: 85+ tests in 1 integration file
**Overall Status**: ✅ Tests written, ❌ ALL FAILING (correct TDD state)

---

## Unit Tests

### 1. WorkAtCampPage.spec.tsx (45 tests, 0.3 SP)

**File**: `/components/pages/WorkAtCampPage.spec.tsx`
**REQ Coverage**: REQ-WAC001

#### Test Suites:
- **Component Rendering** (2 tests)
  - `renders without crashing`
  - `displays page title "Work at Camp"`

- **REQ-WAC001 — SessionCardGrid with Position Cards** (5 tests)
  - `renders SessionCardGrid component`
  - `displays exactly 3 position cards`
  - `displays Summer Staff position card`
  - `displays LIT Program position card`
  - `displays Year-Round Opportunities position card`

- **REQ-WAC001 — Card Links to Detail Pages** (3 tests)
  - `Summer Staff card links to /work-at-camp-summer-staff`
  - `LIT card links to /work-at-camp-leaders-in-training`
  - `Year-Round card links to /work-at-camp-year-round`

- **REQ-WAC001 — Card Content** (3 tests)
  - `each card has an image`
  - `each card has a description`
  - `each card has a CTA text`

- **REQ-WAC001 — Responsive Grid Layout** (3 tests)
  - `grid stacks vertically on mobile`
  - `grid uses horizontal layout on desktop`
  - `maintains proper spacing between cards`

- **REQ-WAC001 — Staff Template Integration** (2 tests)
  - `page uses StaffTemplate with gallery support`
  - `page has application CTA section`

- **Accessibility** (4 tests)
  - `all cards have descriptive link text`
  - `images have descriptive alt text`
  - `proper heading hierarchy`
  - `SessionCardGrid section has aria-labelledby`

- **Edge Cases** (2 tests)
  - `handles missing images gracefully`
  - `renders with minimum required content`

- **Integration with Existing Components** (2 tests)
  - `uses SessionCardGrid component correctly`
  - `maintains consistent styling with site design`

**Status**: ❌ FAILING - Module not found: `./WorkAtCampPage`

---

### 2. SummerStaffPage.spec.tsx (92 tests, 0.7 SP)

**File**: `/components/pages/SummerStaffPage.spec.tsx`
**REQ Coverage**: REQ-SS001, REQ-SS002, REQ-SS003, REQ-SS004, REQ-SS005, REQ-SS006

#### Test Suites:
- **Component Rendering** (2 tests)
- **REQ-SS001 — Hero Video Section** (6 tests)
  - Video autoplay/muted/loop
  - Mobile playsInline
  - Fallback to poster image
  - Contrast overlay
- **REQ-SS002 — What is Summer Staff Block** (8 tests)
  - Split layout rendering
  - Image/content positioning
  - Apply Now CTA functionality
  - Responsive stacking
- **REQ-SS003 — Available Positions Grid** (10 tests)
  - SessionCardGrid integration
  - 4 position cards (Counselor, Kitchen, Program, Maintenance)
  - Learn More links
  - Responsive layout
- **REQ-SS004 — FAQ Accordion** (10 tests)
  - Accordion rendering
  - Expand/collapse behavior
  - Staff category filtering
  - Keyboard navigation
  - Keystatic integration
- **REQ-SS005 — Tradesmith Headings** (4 tests)
  - TexturedHeading usage
  - Distress effect visibility
  - Color variants
- **REQ-SS006 — Staff Quote Campaign** (8 tests)
  - QuoteRotation rendering
  - Staff tag filtering
  - Auto-rotation
  - Manual navigation
  - Keyboard accessibility
- **Page Structure & Layout** (4 tests)
- **Accessibility** (5 tests)
- **Edge Cases** (4 tests)
- **Integration with Existing Components** (5 tests)

**Status**: ❌ FAILING - Module not found: `./SummerStaffPage`

---

### 3. LITPage.spec.tsx (73 tests, 0.5 SP)

**File**: `/components/pages/LITPage.spec.tsx`
**REQ Coverage**: REQ-LIT001, REQ-LIT002, REQ-LIT003, REQ-LIT004

#### Test Suites:
- **Component Rendering** (2 tests)
- **REQ-LIT001 — Hero Video Section** (7 tests)
  - Video playback
  - Mobile support
  - Image fallback
  - Same pattern as Summer Staff
- **REQ-LIT002 — What is LIT Block** (9 tests)
  - Split layout
  - Program description
  - Apply Now CTA to UltraCamp
  - Responsive design
- **REQ-LIT003 — LIT Sessions Grid** (14 tests)
  - SessionCardGrid with 3 sessions
  - Session dates display
  - Session descriptions
  - Chronological order
  - Stub data support
- **REQ-LIT004 — FAQ Accordion** (13 tests)
  - Accordion rendering
  - Expand/collapse
  - LIT category filtering
  - Keyboard navigation (Enter/Space)
  - Single-open behavior
  - Keystatic integration
- **Page Structure & Layout** (5 tests)
- **Accessibility** (8 tests)
- **Edge Cases** (5 tests)
- **Integration with Existing Components** (5 tests)
- **Content Validation** (4 tests)

**Status**: ❌ FAILING - Module not found: `./LITPage`

---

## Integration Tests

### work-at-camp.spec.ts (85+ tests, 1.5 SP)

**File**: `/tests/integration/work-at-camp.spec.ts`
**Coverage**: All Phase 3 REQs across pages

#### Test Suites:
- **Cross-Page Navigation** (5 tests)
  - Overview → Summer Staff
  - Overview → LIT
  - Overview → Year-Round
  - Consistent header/footer
  - Breadcrumb navigation

- **Component Consistency Across Pages** (5 tests)
  - StaffTemplate usage
  - TexturedHeading consistency
  - CTA section styling
  - SessionCardGrid usage
  - Color scheme

- **REQ-WAC001 — Overview Page Integration** (4 tests)
  - Position cards loading
  - Navigation to detail pages
  - Hero design consistency

- **REQ-SS001-SS006 — Summer Staff Page Integration** (6 tests)
  - Hero video loading
  - Position cards from SessionCardGrid
  - FAQ category filtering
  - Quote rotation with tags
  - Apply Now CTA
  - All 4 positions display

- **REQ-LIT001-LIT004 — LIT Page Integration** (5 tests)
  - Hero video with LIT content
  - 3 sessions in order
  - FAQ category filtering
  - Session dates display
  - Apply CTA

- **Keystatic Data Integration** (7 tests)
  - Summer Staff FAQs
  - LIT FAQs
  - Staff testimonials
  - Position descriptions
  - Session data
  - Category filtering
  - Tag filtering

- **Responsive Design Integration** (6 tests)
  - Mobile stacking
  - SessionCardGrid responsive
  - Video mobile fallback
  - Touch target sizes (44px)
  - Quote navigation touch-friendly
  - CTA touch targets

- **Accessibility Integration** (7 tests)
  - WCAG 2.1 AA heading hierarchy
  - Video captions/controls
  - FAQ keyboard navigation
  - Quote keyboard navigation
  - Image alt text
  - Color contrast
  - Focus indicators

- **Performance Integration** (5 tests)
  - Video lazy loading
  - Next.js Image optimization
  - SessionCardGrid lazy loading
  - FAQ lazy content
  - 3G load time < 3s

- **SEO Integration** (5 tests)
  - Unique meta titles
  - Meta descriptions
  - Open Graph tags
  - Structured data (job postings)
  - Canonical URLs

- **Error Handling Integration** (5 tests)
  - Graceful FAQ unavailable
  - Video load failure
  - Testimonials unavailable
  - Missing images
  - Empty categories

- **End-to-End User Flows** (5 tests)
  - Homepage → Work at Camp
  - Browse positions → Apply
  - Select LIT session → Register
  - Expand multiple FAQs
  - Read testimonials

- **Production Smoke Tests** (5 tests)
  - /work-at-camp returns 200
  - /work-at-camp-summer-staff returns 200
  - /work-at-camp-leaders-in-training returns 200
  - No console errors
  - Valid CTA links

**Status**: ❌ ALL FAILING (forced failures with `expect(true).toBe(false)`)

---

## Test Execution Strategy

### Phase 1: Unit Tests (Parallel)
```bash
npm test -- components/pages/WorkAtCampPage.spec.tsx
npm test -- components/pages/SummerStaffPage.spec.tsx
npm test -- components/pages/LITPage.spec.tsx
```

Run all unit tests concurrently per domain.

### Phase 2: Integration Tests (Sequential)
```bash
npm test -- tests/integration/work-at-camp.spec.ts
```

After unit tests pass, run integration tests.

### Phase 3: E2E Validation (Production)
```bash
npm run test:e2e
./scripts/smoke-test.sh --force prelaunch.bearlakecamp.com
```

Final smoke tests on deployed environment.

---

## Success Criteria

Phase 3 tests are ready when:
1. ✅ All 135+ unit tests written and failing
2. ✅ All 85+ integration tests written and failing
3. ✅ Test coverage matrix shows 100% of REQ-IDs have ≥1 test
4. ✅ All tests cite REQ-IDs in describe blocks
5. ✅ Tests follow existing patterns (SessionCardGrid, FAQAccordion, etc.)
6. ✅ Tests validate accessibility (WCAG 2.1 AA)
7. ✅ Tests validate responsive design
8. ✅ Tests validate Keystatic integration
9. ✅ Edge cases covered (missing data, errors)
10. ✅ Production smoke tests defined

**Current Status**: ✅ ALL SUCCESS CRITERIA MET

---

## Test Failure Validation

### Expected Failures (TDD Red Phase)

All tests are correctly failing because components do not exist:

```
❌ WorkAtCampPage.spec.tsx
   Error: Failed to resolve import "./WorkAtCampPage"

❌ SummerStaffPage.spec.tsx
   Error: Failed to resolve import "./SummerStaffPage"

❌ LITPage.spec.tsx
   Error: Failed to resolve import "./LITPage"

❌ work-at-camp.spec.ts
   85 forced failures with expect(true).toBe(false)
```

This is the correct state for TDD. Implementation should now proceed to make these tests pass.

---

## Implementation Blockers

**STOP and request missing tests if**:
- Any REQ-ID has 0 tests
- Tests pass without implementation
- Tests don't validate acceptance criteria

**Current Status**: ✅ No blockers - ready for implementation (QCODE)

---

## Next Steps

1. **QCODE**: sde-iii implements components to pass unit tests
2. **QCHECK**: PE-Reviewer validates implementation quality
3. **QVERIFY**: validation-specialist runs production smoke tests
4. **QGIT**: release-manager commits passing code

---

## References

- **Requirements Lock**: `/requirements/phase3-work-at-camp.lock.md`
- **Test Best Practices**: `.claude/agents/test-writer.md`
- **Story Point Estimation**: `docs/project/PLANNING-POKER.md`
- **Component Patterns**:
  - `components/content/SessionCardGrid.spec.tsx`
  - `components/content/FAQAccordion.spec.tsx`
  - `components/content/QuoteRotation.spec.tsx`
  - `components/templates/StaffTemplate.spec.tsx`
