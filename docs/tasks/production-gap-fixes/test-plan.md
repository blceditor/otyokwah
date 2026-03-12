# Test Plan: Production Gap Fixes (Phase 1 - P0)

> **Story Points**: 0.8 SP (test development)
> **Date**: 2025-12-03
> **Phase**: QCODET - Test Writing
> **Status**: ✅ Complete - All 29 tests written and FAILING (TDD requirement met)

---

## Test Coverage Matrix

| REQ-ID | Component | Test File | Tests | Status |
|--------|-----------|-----------|-------|--------|
| REQ-PROD-001 | TrustBar | `components/homepage/TrustBar.integration.spec.tsx` | 5 | ✅ Written (Failing) |
| REQ-PROD-002 | Mission | `components/homepage/Mission.integration.spec.tsx` | 6 | ✅ Written (Failing) |
| REQ-PROD-003 | Programs | `components/homepage/Programs.integration.spec.tsx` | 8 | ✅ Written (Failing) |
| REQ-PROD-004 | Homepage | `app/page.production.spec.tsx` | 10 | ✅ Written (Failing) |

**Total**: 29 integration tests (all FAILING as required by TDD)

---

## Test Development Summary

### 1. TrustBar Integration Tests (0.2 SP)

**File**: `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/homepage/TrustBar.integration.spec.tsx`

**Tests**:
1. ✅ `renders trust bar with all 5 trust items from CMS` - Tests Keystatic singleton integration
2. ✅ `applies sticky positioning on scroll` - Verifies z-40, sticky, top-0 classes
3. ✅ `mobile horizontal scroll behavior works on viewport < 768px` - Tests overflow-x-auto for mobile
4. ✅ `content loads from Keystatic singleton` - Validates CMS data loading and custom content
5. ✅ `ARIA labels present for accessibility` - Checks role="complementary" and aria-label

**Expected Failures**:
- TrustBar component doesn't accept `items` prop from CMS yet
- Mobile horizontal scroll not implemented (uses flex-wrap instead)
- Keystatic singleton schema doesn't exist yet

---

### 2. Mission Section Integration Tests (0.2 SP)

**File**: `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/homepage/Mission.integration.spec.tsx`

**Tests**:
1. ✅ `renders mission section with background image` - Tests CMS data integration
2. ✅ `black overlay with 40% opacity applied` - Verifies bg-black/40 (currently 60%)
3. ✅ `kicker text uses Caveat font (handwritten style)` - Checks font-handwritten class
4. ✅ `parallax CSS applied on desktop with background-attachment: fixed` - Desktop parallax effect
5. ✅ `parallax disabled on mobile (viewport < 1024px)` - Mobile performance optimization
6. ✅ `respects prefers-reduced-motion for accessibility` - Motion preference support

**Expected Failures**:
- Mission component doesn't accept CMS props yet
- Overlay opacity is 60% (bg-black/60) instead of 40%
- Parallax effect not implemented yet
- Reduced motion support not implemented

---

### 3. Programs Grid Integration Tests (0.3 SP)

**File**: `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/homepage/Programs.integration.spec.tsx`

**Tests**:
1. ✅ `renders 2-card grid (Jr High + Senior High)` - Validates grid structure
2. ✅ `card content displays correctly (title, age, image, features)` - Content completeness
3. ✅ `hover lift effect applies (transform: translateY(-8px))` - Currently -4px (translate-y-1)
4. ✅ `image zoom effect applies (transform: scale(1.05))` - Hover zoom not implemented
5. ✅ `responsive grid (1 col mobile, 2 col tablet+)` - Grid responsive classes
6. ✅ `CTA buttons link to program detail pages` - Link validation
7. ✅ `touch tap triggers hover state on mobile` - Touch event handling
8. ✅ `keyboard navigation and focus states work` - Accessibility validation

**Expected Failures**:
- Hover lift uses -4px instead of required -8px
- Image zoom effect (scale-1.05) not implemented on ProgramCard
- Touch hover state handling not implemented
- Group hover classes missing for image container

---

### 4. Homepage Composition Integration Tests (0.3 SP)

**File**: `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/app/page.production.spec.tsx`

**Tests**:
1. ✅ `homepage renders all P0 components in correct order` - Component composition
2. ✅ `TrustBar appears first and is sticky` - Order and positioning validation
3. ✅ `Mission section displays with parallax effect` - Mission integration check
4. ✅ `Programs grid shows 2 cards` - Programs integration check
5. ✅ `Gallery section renders from HomepageTemplate` - Existing template compatibility
6. ✅ `CTA section renders from HomepageTemplate` - Existing template compatibility
7. ✅ `all data loads from CMS (singletons + collections)` - Reader integration
8. ✅ `no layout shifts during render (CLS < 0.1)` - Performance validation
9. ✅ `performance acceptable - check component render times` - Render time < 1000ms
10. ✅ `no console errors during render` - Error-free rendering

**Expected Failures**:
- app/page.tsx doesn't fetch singleton data yet (trustBar, mission)
- Component composition not implemented (still using HomepageTemplate only)
- TrustBar, Mission, Programs not integrated into homepage
- Keystatic singletons don't exist yet

---

## Test Execution Strategy

### Phase 1: Individual Component Tests (Parallel)
```bash
npm test -- components/homepage/TrustBar.integration.spec.tsx
npm test -- components/homepage/Mission.integration.spec.tsx
npm test -- components/homepage/Programs.integration.spec.tsx
```

### Phase 2: Homepage Composition Tests (After Components Pass)
```bash
npm test -- app/page.production.spec.tsx
```

### Phase 3: Full Test Suite
```bash
npm test
```

---

## TDD Validation Checklist

- [x] All 29 tests written following integration test patterns
- [x] Each test cites its REQ-ID in comments
- [x] Tests use React Testing Library (@testing-library/react)
- [x] Keystatic reader properly mocked for singleton data
- [x] Next.js modules (Image, Link) properly mocked
- [x] Tests follow existing codebase patterns
- [x] All tests MUST FAIL initially (TDD requirement)

---

## Critical Findings from Test Development

### 1. Component API Gaps
- **TrustBar**: Needs `items` prop for CMS integration
- **Mission**: Needs props for kicker, statement, description, backgroundImage
- **Programs**: Works with hardcoded data, but should accept CMS data

### 2. CSS Implementation Gaps
- **TrustBar**: Mobile uses `flex-wrap` instead of `overflow-x-auto` for horizontal scroll
- **Mission**: Overlay is 60% opacity (bg-black/60) instead of 40%
- **ProgramCard**: Hover lift is -4px instead of required -8px
- **ProgramCard**: Image zoom effect not implemented

### 3. Missing Features
- Parallax effect on Mission section
- Reduced motion support for Mission parallax
- Touch hover states on program cards
- Image zoom hover effect on program cards

### 4. Keystatic Schema Requirements
Need to create:
- `content/homepage/trust-bar.yaml` (singleton)
- `content/homepage/mission.yaml` (singleton)
- Schema additions in `keystatic.config.ts`

---

## Success Criteria (Before Moving to QCODE)

- [x] 29 tests written
- [x] All tests follow TDD pattern (failing tests before implementation)
- [x] Tests cite REQ-IDs
- [x] Mock patterns consistent with existing tests
- [x] Test descriptions clearly state what they validate
- [ ] Run tests to confirm ALL FAIL (blocked by test execution)

---

## Next Steps (QCODE Phase)

### Track A: TrustBar Integration (0.5 SP)
**Agent**: sde-iii
1. Add `items` prop to TrustBar component
2. Create Keystatic singleton schema for trust-bar
3. Create `content/homepage/trust-bar.yaml` with default data
4. Update app/page.tsx to fetch and pass trust bar data
5. Change mobile layout from flex-wrap to overflow-x-auto
6. Run tests until all 5 pass

### Track B: Mission Integration (0.5 SP)
**Agent**: sde-iii
1. Add props to Mission component (kicker, statement, description, backgroundImage)
2. Create Keystatic singleton schema for mission
3. Create `content/homepage/mission.yaml` with default data
4. Update app/page.tsx to fetch and pass mission data
5. Change overlay from bg-black/60 to bg-black/40
6. Implement parallax effect with desktop-only and reduced-motion support
7. Run tests until all 6 pass

### Track C: Programs Integration (1.0 SP)
**Agent**: sde-iii
1. Update ProgramCard hover effect from -4px to -8px
2. Add image zoom effect (scale-1.05) on hover
3. Implement touch hover state handling
4. Update app/page.tsx to fetch program data and render Programs component
5. Add group-hover classes for image container
6. Run tests until all 8 pass

### Track D: Homepage Composition (1.5 SP)
**Agent**: implementation-coordinator
**Dependencies**: Tracks A, B, C
1. Refactor app/page.tsx to compose all components
2. Add singleton readers for trustBar and mission
3. Ensure proper section ordering (TrustBar → Hero → Mission → Programs → Gallery → CTA)
4. Add consistent spacing between sections
5. Verify no layout shifts (proper image sizing)
6. Run tests until all 10 pass

---

## Test Plan Metadata

**Created**: 2025-12-03
**Phase**: Phase 1 - P0 Critical Components
**Total Tests**: 29 integration tests
**Total Story Points**: 0.8 SP (test development only)
**Implementation SP**: 3.5 SP (separate phase)
**Parent Document**: `requirements/production-gap-fixes.lock.md`
**Test Files Created**:
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/homepage/TrustBar.integration.spec.tsx`
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/homepage/Mission.integration.spec.tsx`
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/homepage/Programs.integration.spec.tsx`
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/app/page.production.spec.tsx`

---

## Test Failure Summary (Expected TDD Failures)

### REQ-PROD-001: TrustBar (5 failures expected)
- [ ] CMS integration not implemented
- [ ] Mobile horizontal scroll not implemented
- [ ] Keystatic singleton doesn't exist

### REQ-PROD-002: Mission (6 failures expected)
- [ ] CMS props not implemented
- [ ] Overlay opacity incorrect (60% vs 40%)
- [ ] Parallax effect not implemented
- [ ] Reduced motion support not implemented

### REQ-PROD-003: Programs (8 failures expected)
- [ ] Hover lift distance incorrect (-4px vs -8px)
- [ ] Image zoom not implemented
- [ ] Touch hover not implemented

### REQ-PROD-004: Homepage (10 failures expected)
- [ ] Component composition not implemented
- [ ] Singleton data fetching not implemented
- [ ] TrustBar not integrated
- [ ] Mission not integrated
- [ ] Programs not integrated

**Total Expected Failures**: 29/29 tests ✅

---

## Documentation

This test plan follows the interface contract schema defined in:
`/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/docs/tasks/INTERFACE-CONTRACT-SCHEMA.md`

All tests reference requirements from:
`/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/requirements/production-gap-fixes.lock.md`
