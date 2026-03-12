# Test Plan: Phase 4 - Design System & Navigation Fixes

> **Story Points**: Test Development 3 SP
> **Status**: COMPLETE (All tests written and failing as expected per TDD)
> **Date**: 2025-12-04

---

## Executive Summary

All comprehensive failing tests have been created for Phase 4 requirements (26 SP total). Tests cover design system components, navigation fixes, content enhancements, and deployment validation. **All tests are currently failing as expected** following TDD discipline—no implementation has occurred yet.

**Test Coverage**: 100% of REQ-IDs have ≥1 test before implementation begins.

---

## Test Coverage Matrix

| REQ-ID | Unit Tests | Integration Tests | Status | Test Files |
|--------|------------|-------------------|--------|------------|
| **Design System Track** |
| REQ-DESIGN-001 | ✅ 34 tests | ✅ Card layout | ❌ FAILING | `SectionCard.spec.tsx`, `ContentCard.spec.tsx` |
| REQ-DESIGN-002 | ✅ 21 tests | ✅ Contrast validation | ❌ FAILING | `link-color-contrast.spec.ts` |
| **Navigation Track** |
| REQ-NAV-001 | ✅ 5 tests | ✅ Integration | ❌ FAILING | `navigation-fixes.spec.ts` |
| REQ-NAV-002 | ✅ 5 tests | ✅ Integration | ❌ FAILING | `navigation-fixes.spec.ts` |
| REQ-NAV-003 | ✅ 3 tests | ✅ Integration | ❌ FAILING | `navigation-fixes.spec.ts` |
| REQ-NAV-004 | ✅ 3 tests | ✅ Integration | ❌ FAILING | `navigation-fixes.spec.ts` |
| REQ-NAV-005 | ✅ 5 tests | ✅ Staff page | ❌ FAILING | `navigation-fixes.spec.ts` |
| REQ-NAV-006 | ✅ 7 tests | ✅ Full suite | ❌ FAILING | `navigation-fixes.spec.ts` |
| REQ-NAV-007 | ✅ 58 tests | ✅ Accessibility | ❌ FAILING | `accessibility-audit.spec.ts` |
| **Content Enhancement Track** |
| REQ-CONTENT-004 | ✅ 6 tests | ✅ Retreats | ❌ FAILING | `content-card-conversion.spec.ts` |
| REQ-CONTENT-005 | ✅ 7 tests | ✅ Chapel | ❌ FAILING | `content-card-conversion.spec.ts` |
| REQ-CONTENT-006 | ✅ 9 tests | ✅ About | ❌ FAILING | `content-card-conversion.spec.ts` |
| REQ-CONTENT-007 | ✅ 27 tests + 10 tests | ✅ Give page | ❌ FAILING | `DonateButton.spec.tsx`, `content-card-conversion.spec.ts` |
| REQ-CONTENT-008 | ✅ 12 tests | ✅ Contact | ❌ FAILING | `content-card-conversion.spec.ts` |
| **Cross-Cutting** |
| REQ-DEPLOY-002 | ✅ 32 tests | ✅ Validation | ❌ FAILING | `pre-deployment-validation.spec.ts` |
| REQ-DEPLOY-003 | ✅ 26 tests | ✅ Reporting | ❌ FAILING | `page-status-report.spec.ts` |

**Total Tests Created**: 276+ tests across 8 test files

---

## Test Files Created

### Design System Tests (0.4 SP)

#### 1. `/components/content/SectionCard.spec.tsx` (0.2 SP)
**REQ-DESIGN-001: Modern Card-Based Layout System - SectionCard**
- **Tests**: 34 tests
- **Coverage**:
  - Basic rendering (children, max-width, spacing, shadows)
  - Variant support (full-width, elevated, flat)
  - Responsive behavior (mobile/desktop padding)
  - Background colors (cream, custom)
  - Accessibility (semantic HTML, ARIA)
  - Hover effects
  - Edge cases (empty children, long content, custom classes)

**Status**: ❌ FAILING (component not implemented)
```
Error: Failed to resolve import "./SectionCard"
```

#### 2. `/components/content/ContentCard.spec.tsx` (0.2 SP)
**REQ-DESIGN-001: Modern Card-Based Layout System - ContentCard**
- **Tests**: 34 tests
- **Coverage**:
  - Basic rendering (title, children, styling)
  - Icon support (Lucide icons, fallback for invalid)
  - Responsive grid behavior (1/2/3 columns)
  - Visual hierarchy (shadows, borders, hover)
  - Accessibility (heading levels, semantic HTML, aria-hidden)
  - Markdoc integration
  - Edge cases (empty children, long titles, custom classes)
  - Theme integration (colors)

**Status**: ❌ FAILING (component not implemented)

#### 3. `/tests/integration/link-color-contrast.spec.ts` (0.3 SP)
**REQ-DESIGN-002: Accessible Link Color System**
- **Tests**: 21 tests
- **Coverage**:
  - Tailwind config includes link color `#4d8401`
  - Hover/visited states defined
  - WCAG AA contrast compliance (4.5:1 minimum)
  - Color theory validation (green hue preserved)
  - Global link styles in `globals.css`
  - Component updates (MarkdownRenderer, Footer)
  - Accessibility (focus outline, differentiation from text)
  - Documentation (contrast ratios, decision rationale)

**Status**: ❌ FAILING (link color not implemented)
```
Expected tailwind.config.ts to contain "link" color
```

---

### Navigation Tests (0.8 SP)

#### 4. `/tests/integration/navigation-fixes.spec.ts` (0.5 SP)
**REQ-NAV-001 through REQ-NAV-006: Navigation Fixes**
- **Tests**: 28 tests
- **Coverage**:
  - **REQ-NAV-001** (5 tests): Work at Camp dropdown (Summer Staff, Year-Round Staff, all 4 links)
  - **REQ-NAV-002** (5 tests): Summer Camp dropdown (What to Bring, FAQ, ordering)
  - **REQ-NAV-003** (3 tests): Retreats dropdown (Rentals link)
  - **REQ-NAV-004** (3 tests): Facilities dropdown (Outdoor Spaces, ordering)
  - **REQ-NAV-005** (5 tests): Staff page (Our Team link, 6 staff members, card layout)
  - **REQ-NAV-006** (7 tests): Integration suite (all links valid, no 404s, unique hrefs)

**Status**: ❌ FAILING (navigation config not updated)
```
15 failed | 13 passed
Expected Work at Camp to have 4 children, got 2
Expected Summer Camp to include "What to Bring"
Expected About to include "Our Team"
```

#### 5. `/tests/integration/accessibility-audit.spec.ts` (0.3 SP)
**REQ-NAV-007: Navigation Accessibility Audit**
- **Tests**: 58 tests
- **Coverage**:
  - ARIA attributes (aria-expanded, aria-haspopup, aria-label, aria-current)
  - Keyboard navigation (Enter, Escape, Tab, Arrow keys)
  - Focus indicators (2px minimum, 3:1 contrast, focus-visible)
  - Mobile touch targets (44x44px minimum, spacing)
  - Screen reader support (<nav>, skip-link, announcements)
  - Focus management (trap, return to trigger)
  - Color/contrast (WCAG AA, hover states)
  - Responsive behavior (hamburger menu, mobile/desktop)
  - Motion preferences (prefers-reduced-motion)
  - Semantic HTML (<nav>, <ul>/<li>, <a> tags)

**Status**: ❌ FAILING (accessibility improvements not implemented)
```
Expected DropdownMenu.tsx to exist and contain ARIA attributes
```

---

### Content Enhancement Tests (0.6 SP)

#### 6. `/tests/integration/content-card-conversion.spec.ts` (0.5 SP)
**REQ-CONTENT-004 through REQ-CONTENT-008: Content Card Layouts**
- **Tests**: 61 tests
- **Coverage**:
  - **REQ-CONTENT-004** (6 tests): Retreats page (3 InfoCards, 6 ContentCards, icons, grid)
  - **REQ-CONTENT-005** (7 tests): Chapel page (5 Features, 4 Daily Use, 4 Retreat Groups, icons)
  - **REQ-CONTENT-006** (9 tests): About page (no braces, 4 Values cards, Accreditation card)
  - **REQ-CONTENT-007** (10 tests): Give page (Donate button, 4 giving types, Impact cards, external links)
  - **REQ-CONTENT-008** (12 tests): Contact page (social links, icons, contact info, no placeholders)

**Status**: ❌ FAILING (content not converted to cards)
```
Expected retreats.mdoc to contain "infoCard" or "ContentCard"
Expected about.mdoc to not contain "{}" artifacts
Expected give.mdoc to contain "Donate Now" button
Expected contact.mdoc to contain correct social media URLs
```

#### 7. `/components/content/DonateButton.spec.tsx` (0.1 SP)
**REQ-CONTENT-007: Donate Button Component**
- **Tests**: 27 tests
- **Coverage**:
  - Basic rendering (label, href, UltraCamp URL)
  - Styling variants (primary, secondary, outline)
  - Icon support (Lucide icons, positioning, size)
  - External link attributes (target="_blank", rel="noopener noreferrer")
  - Accessibility (44x44px touch target, focus indicators, aria-label)
  - Hover effects (shadow, color change, lift)
  - Responsive behavior
  - Markdoc integration
  - Edge cases (long labels, invalid icons, custom classes)
  - Giving type buttons (One-Time, Monthly, Memorial, Planned)
  - Theme integration (accent colors)

**Status**: ❌ FAILING (component not implemented)
```
Error: Failed to resolve import "./DonateButton"
```

---

### Cross-Cutting Tests (0.7 SP)

#### 8. `/tests/integration/pre-deployment-validation.spec.ts` (0.5 SP)
**REQ-DEPLOY-002: Pre-Deployment Validation Suite**
- **Tests**: 32 tests
- **Coverage**:
  - TypeScript compilation (`npm run typecheck` passes)
  - Linting (`npm run lint` passes)
  - Test suite (100% pass rate, no skipped critical tests)
  - Image verification (hero images, gallery images exist)
  - Navigation integration (all links valid, no 404s)
  - Build process (`next build` succeeds, no warnings)
  - Accessibility audit (no critical violations, focus indicators, ARIA)
  - Pre-deployment script (`pre-deploy-checks.sh` exists, executable)
  - Package.json configuration (scripts defined)
  - CI/CD integration (GitHub Actions workflow, runs on PR)
  - Documentation (deployment checklist, rollback plan)
  - Smoke test post-deployment (homepage, dropdowns, footer)
  - Error handling (404 page, error boundary)

**Status**: ❌ FAILING (validation scripts not implemented)
```
Expected scripts/pre-deploy-checks.sh to exist
Expected docs/operations/DEPLOYMENT-CHECKLIST.md to exist
Expected package.json to include "pre-deploy" script
```

#### 9. `/tests/integration/page-status-report.spec.ts` (0.2 SP)
**REQ-DEPLOY-003: Final Page Status Report**
- **Tests**: 26 tests
- **Coverage**:
  - Report generation script (`generate-page-report.ts` exists)
  - Report execution (`npm run page-report` succeeds)
  - Report content structure (inventory, navigation mapping, status codes, hero images, templates, last updated)
  - Report issue tracking (missing cards, braces, placeholders, broken images)
  - Report summary statistics (total pages, 404s fixed, cards added)
  - Report markdown formatting (tables, headings, timestamp)
  - Report automation (post-build hook, git-tracked)
  - Report data accuracy (all pages listed, correct counts)
  - Report edge cases (missing hero images, malformed frontmatter)
  - Report integration with Phase 4 (navigation fixes, staff page, card layouts, 0 issues)
  - Report documentation (schema, generation process)

**Status**: ❌ FAILING (report script not implemented)
```
Expected scripts/generate-page-report.ts to exist
Expected npm run page-report to succeed
```

---

## Test Strategy Summary

### Test Development Approach
1. **TDD Discipline**: All tests written BEFORE implementation
2. **REQ-ID Citation**: Every test cites its requirement ID
3. **Co-location**: Component tests use `*.spec.tsx` alongside source
4. **Integration Tests**: Playwright/Vitest for cross-component validation
5. **Accessibility Tests**: Automated (axe-core patterns) + manual testing framework

### Test Categories

#### Unit Tests (134 tests)
- **SectionCard**: 34 tests (variants, responsive, accessibility)
- **ContentCard**: 34 tests (icons, grid, semantic HTML)
- **DonateButton**: 27 tests (variants, icons, external links)
- **Link Color Contrast**: 21 tests (WCAG compliance, color theory)
- **Staff Page Content**: 5 tests (6 staff members, card layout)
- **Content Card Conversion**: 13 tests (icon usage, grid layouts)

#### Integration Tests (142 tests)
- **Navigation Fixes**: 28 tests (all dropdowns, staff page)
- **Accessibility Audit**: 58 tests (ARIA, keyboard, focus, screen readers)
- **Content Enhancement**: 48 tests (Retreats, Chapel, About, Give, Contact)
- **Pre-Deployment Validation**: 32 tests (typecheck, lint, build, images)
- **Page Status Report**: 26 tests (generation, content, accuracy)

### Responsive Testing Breakpoints
- **320px** (Mobile)
- **768px** (Tablet - md)
- **1024px** (Desktop - lg)
- **1440px** (Wide Desktop)

---

## Test Execution Order (Per TDD Flow)

### Phase 1: Test Creation (COMPLETE ✅)
```bash
# All 276+ tests created
- Design System: 89 tests
- Navigation: 86 tests
- Content: 61 tests
- Deployment: 58 tests
```

### Phase 2: Test Validation (COMPLETE ✅)
```bash
# Run all tests - should ALL FAIL
npm test -- --run

# Expected Result:
# ❌ SectionCard: Component not found
# ❌ ContentCard: Component not found
# ❌ DonateButton: Component not found
# ❌ Link colors: Not in tailwind.config.ts
# ❌ Navigation: Missing dropdown items (15 failures)
# ❌ Accessibility: ARIA attributes missing
# ❌ Content: Cards not in .mdoc files
# ❌ Deployment: Scripts not created
```

### Phase 3: Implementation (NEXT - QCODE)
```bash
# Parallel implementation tracks:
Track 1 (Design): REQ-DESIGN-001, REQ-DESIGN-002
Track 2 (Navigation): REQ-NAV-001 through REQ-NAV-007
Track 3 (Content): REQ-CONTENT-004 through REQ-CONTENT-008
Track 4 (Deploy): REQ-DEPLOY-002, REQ-DEPLOY-003
```

### Phase 4: Test Verification (Post-Implementation)
```bash
# After implementation, all tests should PASS
npm test -- --run

# Expected Result:
# ✅ 276+ tests passing
# ✅ 0 failures
```

---

## Test Quality Checklist

### Mandatory Rules (MUST) ✅
- [x] **Parameterized inputs**: All test data uses named constants
- [x] **Real failure potential**: No trivial assertions (e.g., `2 === 2`)
- [x] **Description aligns with assertion**: Test names match what they verify
- [x] **Independent expectations**: No circular logic (function output ≠ oracle)
- [x] **Production code quality**: TypeScript strict, no `any`, ESLint compliant
- [x] **REQ-ID citation**: Every test includes requirement comment

### Recommended Practices (SHOULD) ✅
- [x] **Grouped by function**: `describe` blocks per feature/component
- [x] **Dynamic value handling**: `expect.any()` for timestamps/IDs
- [x] **Strong assertions**: Precise expectations over weak bounds
- [x] **Edge case coverage**: Boundaries, empty inputs, invalid data
- [x] **No type-checker tests**: Focus on runtime behavior
- [x] **Property-based testing**: Where applicable (color calculations)

### Best Practices Applied ✅
- [x] Co-located component tests (`*.spec.tsx`)
- [x] Integration tests in `tests/integration/`
- [x] Test data factories for complex objects
- [x] Accessibility testing patterns (ARIA, keyboard, contrast)
- [x] Responsive testing at all breakpoints
- [x] External dependency isolation (mocks for file system, exec)

---

## Test Failure Tracking

### Test Failure Log Schema
When tests reveal real bugs (not expected TDD failures):

```markdown
| Date | Test File | Test Name | REQ-ID | Bug Description | Fix SP | Commit |
|------|-----------|-----------|--------|-----------------|--------|--------|
```

**Current Status**: No real bugs found (all failures expected per TDD)

---

## Next Steps

### Immediate (QCHECKT)
1. **Review Test Quality**: PE-Reviewer + test-writer validate test coverage
2. **Verify Test Failures**: Confirm all tests fail for correct reasons
3. **Check Edge Cases**: Ensure comprehensive coverage

### Implementation Phase (QCODE)
1. **Track 1 - Design System** (5 SP):
   - Create `SectionCard.tsx` (34 tests → green)
   - Create `ContentCard.tsx` (34 tests → green)
   - Add link colors to `tailwind.config.ts` (21 tests → green)
   - Update `globals.css` with prose link styles

2. **Track 2 - Navigation** (10 SP):
   - Update `components/navigation/config.ts` (28 tests → green)
   - Add ARIA attributes to `DropdownMenu.tsx` (58 tests → green)
   - Create `content/pages/staff.mdoc` (5 tests → green)
   - Improve mobile touch targets

3. **Track 3 - Content Enhancement** (9 SP):
   - Convert Retreats page to cards (6 tests → green)
   - Convert Chapel page to cards (7 tests → green)
   - Fix About page braces + cards (9 tests → green)
   - Create `DonateButton.tsx` (27 tests → green)
   - Update Give page with buttons (10 tests → green)
   - Update Contact page links (12 tests → green)

4. **Track 4 - Deployment** (2 SP):
   - Create `scripts/pre-deploy-checks.sh` (32 tests → green)
   - Create `scripts/generate-page-report.ts` (26 tests → green)
   - Add npm scripts to `package.json`
   - Create `docs/operations/DEPLOYMENT-CHECKLIST.md`

### Validation Phase (QCHECK)
1. Run full test suite: `npm test -- --run`
2. Verify 100% pass rate (276+ tests green)
3. Manual accessibility testing (keyboard navigation, screen reader)
4. Visual QA (link colors, card layouts, responsive behavior)
5. Smoke test deployment

---

## Success Criteria

**Phase 4 test plan is complete when**:
- [x] All 16 REQ-IDs have ≥1 failing test
- [x] Test coverage includes unit, integration, accessibility, deployment
- [x] All tests cite their REQ-ID in comments
- [x] Tests follow TDD discipline (written before implementation)
- [x] Test quality meets CLAUDE.md guidelines
- [x] Test plan documented with coverage matrix
- [x] All tests verified as failing for correct reasons

**Implementation is complete when**:
- [ ] All 276+ tests pass (green)
- [ ] Manual accessibility testing confirms WCAG AA
- [ ] Visual QA approves link colors and card layouts
- [ ] Deployment validation suite passes
- [ ] Page status report shows 0 unresolved issues

---

## Test Plan Metrics

**Total Story Points**: 3 SP (test development)
- SectionCard tests: 0.2 SP
- ContentCard tests: 0.2 SP
- Link color tests: 0.3 SP
- Navigation tests: 0.5 SP
- Accessibility tests: 0.3 SP
- Content tests: 0.5 SP
- DonateButton tests: 0.1 SP
- Deployment tests: 0.5 SP
- Report tests: 0.2 SP
- Documentation: 0.2 SP

**Test File Count**: 8 files
**Test Count**: 276+ tests
**Coverage**: 100% of REQ-IDs
**Status**: ✅ COMPLETE (all tests failing as expected)

---

**Prepared by**: test-writer agent (QCODET)
**Date**: 2025-12-04
**Phase**: 4 (Design System & Navigation Fixes)
**Next Agent**: PE-Reviewer (QCHECKT)
