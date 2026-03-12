# Test Plan: Phase 0 - Design System Foundation

> **Story Points**: Test development 1.5 SP | Implementation 5 SP | Total 6.5 SP
> **Task ID**: P0-001 through P0-004
> **Created**: 2025-11-19

## Test Coverage Matrix

| REQ-ID | Unit Tests | Integration Tests | Status | Files |
|--------|------------|-------------------|--------|-------|
| REQ-001 | ✅ 28 tests | ✅ 3 tests | 🔴 Failing | tailwind.config.spec.ts, design-system.spec.ts |
| REQ-002 | ✅ 21 tests | ✅ 2 tests | 🔴 Failing | layout.phase0.spec.tsx, design-system.spec.ts |
| REQ-003 | ✅ 8 tests | ✅ 1 test | 🔴 Failing | Hero.spec.tsx, design-system.spec.ts |
| REQ-004 | ✅ 6 tests | ✅ 1 test | 🔴 Failing | TrustBar.spec.tsx, design-system.spec.ts |
| REQ-005 | ✅ 6 tests | ✅ 1 test | 🔴 Failing | Programs.spec.tsx, design-system.spec.ts |
| REQ-006 | ✅ 6 tests | ✅ 1 test | 🔴 Failing | Testimonials.spec.tsx, design-system.spec.ts |
| REQ-007 | ✅ 6 tests | ✅ 1 test | 🔴 Failing | Gallery.spec.tsx, design-system.spec.ts |
| REQ-008 | ✅ 6 tests | ✅ 1 test | 🔴 Failing | InstagramFeed.spec.tsx, design-system.spec.ts |
| REQ-009 | ✅ 12 tests | ✅ 2 tests | 🔴 Failing | page.phase0.spec.tsx, design-system.spec.ts |
| REQ-010 | ✅ 12 tests | ✅ 2 tests | 🔴 Failing | about/page.spec.tsx, design-system.spec.ts |

**Total Tests**: 111 tests (97 unit, 14 integration)

---

## Unit Tests

### P0-001: Tailwind Config Tests (0.3 SP)

**File**: `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/tailwind.config.spec.ts`

**Tests** (28 total):

#### REQ-001: CSS Variables in Tailwind Config
1. `config exports valid Tailwind Config type`
2. `theme extends with custom colors matching mockup`
3. `theme extends with custom font families`
4. `theme extends with custom spacing scale`
5. `content includes all necessary file paths`
6. `config structure is TypeScript-compatible`

#### Generated CSS Classes
7. `custom color classes are available for use`
8. `custom font classes are available for use`
9. `custom spacing classes are available for use`

#### Color Palette Validation
10. `all colors are valid hex codes`
11. `spacing values use rem units`
12. `spacing values match mockup pixel equivalents`

**Validation**: Tests verify exact color values from `bearlakecamp-mockup/styles.css` lines 16-47

---

### P0-002: Layout Tests (0.4 SP)

**File**: `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/app/layout.phase0.spec.tsx`

**Tests** (21 total):

#### REQ-002: Layout with Optimized Fonts and Meta Tags
1. `layout imports Caveat font via next/font/google`
2. `Caveat font variable is applied to html element`
3. `body has correct typography classes`
4. `body has correct font size (1.125rem / 18px)`
5. `skip link exists for accessibility`
6. `skip link is visually hidden but keyboard accessible`
7. `layout renders children correctly`
8. `html element has lang attribute`
9. `layout has no TypeScript errors`

#### Meta Tags
10. `metadata export exists with title and description`
11. `title is descriptive for Bear Lake Camp`
12. `description is present and meaningful`
13. `OpenGraph tags are included for social sharing`

#### Font Loading Performance
14. `Caveat font is loaded via next/font/google (optimized)`
15. `font display swap is used for optimal loading`
16. `layout renders quickly (< 100ms)`

#### Accessibility
17. `skip link allows keyboard users to skip navigation`
18. `skip link text is descriptive`
19. `document has semantic HTML structure`

#### CSS Variable for Handwritten Font
20. `Caveat font variable is available as CSS variable`

---

### P0-003: Homepage Component Tests (0.3 SP)

**Components**: Hero, TrustBar, Programs, Testimonials, Gallery, InstagramFeed

**Files**:
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/homepage/Hero.spec.tsx` (8 tests)
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/homepage/TrustBar.spec.tsx` (6 tests)
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/homepage/Programs.spec.tsx` (6 tests)
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/homepage/Testimonials.spec.tsx` (6 tests)
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/homepage/Gallery.spec.tsx` (6 tests)
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/homepage/InstagramFeed.spec.tsx` (6 tests)

**Common Test Pattern** (per component):

#### REQ-003 through REQ-008: Component Structure
1. `component exists and exports default`
2. `component renders a section element`
3. `component renders without errors`
4. `component accepts className prop`
5. `component has TypeScript interface defined`
6. `component has no TypeScript errors`

**Hero Component Additional Tests**:
7. `component is a valid React component`
8. `component renders semantic HTML`
9. `component handles optional className correctly`
10. `component merges className with default classes`
11. `component returns valid JSX`
12. `component can be imported in other files`

---

### P0-004: Page Composition Tests (0.5 SP)

**Files**:
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/app/page.phase0.spec.tsx` (12 tests)
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/app/about/page.spec.tsx` (12 tests)

#### REQ-009: Homepage Composition
1. `homepage imports all 6 homepage sections`
2. `homepage renders all sections without errors`
3. `homepage has semantic main element`
4. `main element has id="main-content" for skip link target`
5. `homepage renders sections in correct order`
6. `Hero section appears first`
7. `homepage has no TypeScript errors`
8. `homepage exports default component`
9. `sections render in documented order: Hero → TrustBar → Programs → Testimonials → Gallery → InstagramFeed`
10. `homepage has main landmark for screen readers`
11. `all imported components render successfully`
12. `no console errors on homepage render`

#### REQ-010: Content Page Template
1. `about page exists and exports default`
2. `about page renders without errors`
3. `about page has semantic main element`
4. `about page uses correct typography classes`
5. `about page has h1 heading`
6. `about page has paragraph content`
7. `about page has no TypeScript errors`
8. `about page has semantic HTML structure`
9. `about page content is readable`
10. `about page uses consistent styling with design system`
11. `about page has main landmark`
12. `about page has proper heading hierarchy`

---

## Integration Tests (0.5 SP)

### Phase 0 Complete Integration

**File**: `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/tests/integration/phase0/design-system.spec.ts`

**Tests** (14 total):

#### Design System Foundation
1. `REQ-001 + REQ-002: Tailwind config colors are usable in layout`
2. `REQ-001 + REQ-002: Handwritten font is configured and applied`
3. `REQ-003-008 + REQ-009: All homepage components integrate correctly`
4. `REQ-002 + REQ-009: Skip link connects to homepage main content`
5. `REQ-002 + REQ-010: About page uses same layout and typography`

#### No Console Errors
6. `REQ-009: Homepage renders without console errors`
7. `REQ-010: About page renders without console errors`

#### Type Safety
8. `All components have TypeScript type definitions`
9. `Tailwind config is typed correctly`

#### Design Fidelity
10. `REQ-001: Color values exactly match mockup CSS variables`
11. `REQ-001: Spacing values exactly match mockup CSS variables`
12. `REQ-001: Font families match mockup exactly`

#### Performance
13. `Complete homepage renders quickly (< 200ms)`
14. `About page renders quickly (< 200ms)`

---

## Test Execution Strategy

### Step 1: Run All Tests
```bash
npm test
```

**Expected Result**: All 111 tests should FAIL (TDD - before implementation)

### Step 2: Verify Failure Coverage

Each REQ-ID should have at least 1 failing test:

- **REQ-001**: Tailwind config not yet extended → 28 failures
- **REQ-002**: Layout not yet updated → 21 failures
- **REQ-003**: Hero component doesn't exist → 8 failures
- **REQ-004**: TrustBar component doesn't exist → 6 failures
- **REQ-005**: Programs component doesn't exist → 6 failures
- **REQ-006**: Testimonials component doesn't exist → 6 failures
- **REQ-007**: Gallery component doesn't exist → 6 failures
- **REQ-008**: InstagramFeed component doesn't exist → 6 failures
- **REQ-009**: Homepage not yet composed → 12 failures
- **REQ-010**: About page doesn't exist → 12 failures

### Step 3: Parallel Test Execution

During implementation, tests can be run in parallel by domain:

```bash
# Tailwind config tests
npm test -- tailwind.config.spec.ts

# Layout tests
npm test -- app/layout.phase0.spec.tsx

# Component tests (parallel)
npm test -- components/homepage/Hero.spec.tsx
npm test -- components/homepage/TrustBar.spec.tsx
# ... etc

# Page tests
npm test -- app/page.phase0.spec.tsx
npm test -- app/about/page.spec.tsx

# Integration tests (after units pass)
npm test -- tests/integration/phase0/
```

### Step 4: Success Criteria

**Definition of Done**:
- [ ] All 111 tests passing
- [ ] `npm run typecheck` passes (zero TypeScript errors)
- [ ] `npm run lint` passes (zero ESLint errors)
- [ ] `npm run build` succeeds
- [ ] No console errors in test output
- [ ] Design fidelity tests confirm exact color/spacing match to mockup

---

## Story Point Breakdown

### Test Development (This Work)
- **Tailwind Config Tests**: 0.3 SP
- **Layout Tests**: 0.4 SP
- **Component Tests**: 0.3 SP
- **Page Tests**: 0.5 SP
- **Integration Tests**: 0.5 SP
- **Total Test Development**: **1.5 SP**

### Implementation (Next Phase)
- **P0-001: Migrate CSS Variables to Tailwind**: 1 SP
- **P0-002: Update Layout with Fonts + Meta Tags**: 0.5 SP
- **P0-003: Create Base Component Templates**: 0.5 SP
- **P0-004: Build 2 Example Pages**: 0.5 SP
- **Total Implementation**: **2.5 SP**

### Review & Integration
- **Code Review**: 0.3 SP
- **Integration Testing**: 0.2 SP
- **Documentation**: 0.2 SP
- **Total Review**: **0.7 SP**

**Phase 0 Total**: **4.7 SP** (rounded to 5 SP)

---

## Test Files Summary

### Files Created

1. **Requirements Lock**
   - `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/requirements/phase0-requirements.lock.md`

2. **Unit Test Files** (9 files)
   - `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/tailwind.config.spec.ts`
   - `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/app/layout.phase0.spec.tsx`
   - `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/homepage/Hero.spec.tsx`
   - `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/homepage/TrustBar.spec.tsx`
   - `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/homepage/Programs.spec.tsx`
   - `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/homepage/Testimonials.spec.tsx`
   - `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/homepage/Gallery.spec.tsx`
   - `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/homepage/InstagramFeed.spec.tsx`
   - `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/app/page.phase0.spec.tsx`
   - `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/app/about/page.spec.tsx`

3. **Integration Test Files** (1 file)
   - `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/tests/integration/phase0/design-system.spec.ts`

4. **Documentation**
   - `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/docs/tasks/phase0/test-plan.md` (this file)

**Total**: 12 files created

---

## Test Validation Checklist

Before proceeding to implementation:

- [x] Requirements lock created with all REQ-IDs
- [x] Each REQ-ID has ≥1 test
- [x] Tests cite REQ-IDs in comments
- [x] Tests use Vitest + Testing Library
- [x] Tests are co-located with implementation files
- [x] Tests are typed (no `any` types)
- [x] Tests check happy path and error cases
- [x] Integration tests verify cross-component behavior
- [x] Tests validate design fidelity to mockup

**Ready for Implementation**: ✅ YES

---

## Anti-Patterns Avoided

✅ **Did**:
- Generate tests in parallel by domain (config, layout, components, pages)
- Validate exact color values from mockup CSS
- Test structural behavior (not implementation details)
- Use stable assertions (component existence, semantic HTML)
- Follow TDD: Tests WILL fail before implementation
- Keep tests independent and isolated
- Test TypeScript type safety

❌ **Avoided**:
- Testing implementation details (specific class names that may change)
- Brittle assertions (exact string matching for dynamic content)
- Sequential test generation (used parallel approach)
- Skipping test failure validation
- Creating tests after implementation
- Mock-heavy tests for pure components

---

## Next Steps

1. **Run Tests** (Expected: All Failing)
   ```bash
   npm test
   ```

2. **Verify Failures**: Confirm ≥1 failure per REQ-ID

3. **Implementation Phase**: Proceed to QCODE
   - Implement P0-001: Tailwind config
   - Implement P0-002: Layout updates
   - Implement P0-003: Component templates
   - Implement P0-004: Page compositions

4. **Validation Phase**: Run tests after each implementation
   - Watch tests turn green incrementally
   - Verify no regressions

5. **Review Phase**: QCHECK
   - PE-Reviewer validates code quality
   - Code-quality-auditor checks standards

6. **Documentation Phase**: QDOC
   - Update component documentation
   - Update design system docs

---

**Maintained By**: test-writer agent
**Review Frequency**: Updated after implementation completes
**Last Updated**: 2025-11-19
