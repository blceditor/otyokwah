# Test Plan: Keystatic Layout Integration

> **Story Points**: Test development 1 SP

## Test Coverage Matrix

| REQ-ID | Unit Tests | Integration Tests | Status |
|--------|------------|-------------------|--------|
| REQ-LAYOUT-001 | ✅ 7 tests | ✅ 6 tests | ❌ Failing (21/26) |
| REQ-LAYOUT-002 | ✅ 2 tests | - | ✅ Passing (2/2) |
| REQ-LAYOUT-003 | ✅ 5 tests | - | ❌ Failing (5/5) |
| REQ-LAYOUT-004 | ✅ 2 tests | - | ❌ Failing (2/2) |
| REQ-LAYOUT-005 | ✅ 3 tests | - | ❌ Failing (2/3) |
| REQ-LAYOUT-006 | ✅ 3 tests | - | ❌ Failing (1/3) |

**Total**: 26 tests (21 failing, 4 passing, 1 skipped)

## Test File Location

**File**: `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/app/keystatic/__tests__/layout.test.tsx`

**Story Points**: 1 SP for comprehensive test suite

## Test Execution Results

```bash
npm test -- app/keystatic/__tests__/layout.test.tsx --run
```

**Results**:
- ✅ 4 tests passing (basic structure)
- ❌ 21 tests failing (KeystaticToolsHeader integration not implemented)
- ⏭️ 1 test skipped (Vite build-time import issue)

## Failing Tests by Requirement

### REQ-LAYOUT-001: KeystaticToolsHeader Component Rendering

**Failed Tests** (7):
1. ✅ `layout renders KeystaticToolsHeader component` - FAIL: Cannot find ProductionLink, DeploymentStatus, BugReportModal, GenerateSEOButton, SparkryBranding
2. ✅ `header appears before KeystaticApp in DOM order` - FAIL: Header not in DOM
3. ✅ `ProductionLink component is VISIBLE in header` - FAIL: Component not found
4. ✅ `DeploymentStatus component is VISIBLE in header` - FAIL: Component not found
5. ✅ `BugReportModal trigger button is VISIBLE in header` - FAIL: Component not found
6. ✅ `GenerateSEOButton component is VISIBLE in header` - FAIL: Component not found
7. ✅ `SparkryBranding component is VISIBLE in header` - FAIL: Component not found
8. ✅ `all 5 header components render together without conflicts` - FAIL: No components found

**Passing Tests** (1):
- ✅ `layout renders KeystaticApp content area` - PASS: Current layout structure works

### REQ-LAYOUT-002: KeystaticApp Rendering

**Passing Tests** (2):
- ✅ `layout renders without crashing` - PASS
- ✅ `layout renders KeystaticApp content area` - PASS

### REQ-LAYOUT-003: Header Positioning

**Failed Tests** (5):
1. ✅ `header has fixed position styling` - FAIL: No header element
2. ✅ `header has high z-index for overlay behavior` - FAIL: No z-index styling
3. ✅ `header spans full width` - FAIL: No width styling
4. ✅ `header remains fixed during scroll (does not scroll with content)` - FAIL: No fixed positioning
5. ✅ `header has appropriate background for readability over content` - FAIL: No background styling
6. ✅ `header has border or shadow to distinguish from content` - FAIL: No border/shadow styling
7. ✅ `layout works on different viewport sizes (responsive)` - FAIL: Header not present

### REQ-LAYOUT-004: Content Padding

**Failed Tests** (2):
1. ✅ `KeystaticApp content area has padding-top for header clearance` - FAIL: No padding-top class
2. ✅ `content padding matches header height` - FAIL: No coordinated heights

### REQ-LAYOUT-005: Dynamic Routing

**Failed Tests** (2):
1. ✅ `layout accepts and renders children prop` - FAIL: Children prop not handled
2. ✅ `layout preserves KeystaticApp when children are passed` - FAIL: Children prop issue

**Passing Tests** (1):
- ✅ `layout works with [[...params]] catch-all routes` - PASS

### REQ-LAYOUT-006: Hydration and SSR

**Failed Tests** (1):
1. ✅ `layout renders on initial page load without hydration warnings` - PASS (no warnings currently)

**Passing Tests** (2):
- ✅ `layout has consistent HTML structure for SSR/CSR` - PASS
- ✅ `no console errors during render` - PASS

**Skipped Tests** (1):
- ⏭️ `KeystaticToolsHeader is client component (has "use client")` - SKIPPED (Vite build-time issue)

## Critical Learnings Applied

From **CAPA-2025-11-22**:
- ✅ Tests verify components are **RENDERED**, not just imported
- ✅ Tests use `.toBeVisible()`, not just `.toBeInTheDocument()`
- ✅ Tests verify actual integration, not isolated behavior

## Test Structure

### Unit Tests (0.5 SP)

**File**: `app/keystatic/__tests__/layout.test.tsx`

**Test Groups**:
1. **REQ-LAYOUT-001 — Layout Structure Tests** (4 tests)
   - Basic rendering
   - KeystaticToolsHeader presence
   - KeystaticApp presence
   - DOM order

2. **REQ-LAYOUT-003 — Header Positioning Tests** (3 tests)
   - Fixed positioning
   - Z-index
   - Full width

3. **REQ-LAYOUT-004 — Content Padding Tests** (2 tests)
   - Padding-top presence
   - Height coordination

4. **REQ-LAYOUT-005 — Dynamic Routing Tests** (3 tests)
   - Catch-all routes
   - Children prop
   - Component preservation

5. **REQ-LAYOUT-006 — Hydration and SSR Tests** (4 tests)
   - HTML consistency
   - Console errors
   - Client component verification
   - Hydration warnings

### Integration Tests (0.5 SP)

**File**: Same file (integrated with unit tests)

**Test Groups**:
1. **REQ-LAYOUT-001 — Integration: All Header Components Visible** (6 tests)
   - ProductionLink visibility
   - DeploymentStatus visibility
   - BugReportModal visibility
   - GenerateSEOButton visibility
   - SparkryBranding visibility
   - All components together

2. **REQ-LAYOUT-003 — Edge Cases and Layout Behavior** (4 tests)
   - Fixed scroll behavior
   - Background styling
   - Border/shadow
   - Responsive design

## Implementation Requirements

To make all tests pass, the following must be implemented:

### 1. Create KeystaticToolsHeader Component

**File**: `components/keystatic/KeystaticToolsHeader.tsx`

**Must include**:
- 'use client' directive
- Import all 5 components:
  - ProductionLink
  - DeploymentStatus
  - BugReportModal
  - GenerateSEOButton
  - SparkryBranding
- Render all components in a header container

### 2. Update Layout Component

**File**: `app/keystatic/layout.tsx`

**Must**:
- Import KeystaticToolsHeader
- Render header BEFORE KeystaticApp
- Add fixed positioning classes (fixed, top-0, z-50)
- Add full width class (w-full)
- Add background class (bg-white or similar)
- Add border/shadow for separation
- Add padding-top to KeystaticApp wrapper (pt-16 or matching header height)
- Accept and handle children prop (if needed for dynamic routes)

### 3. Styling Requirements

**Header**:
```tsx
<header className="fixed top-0 w-full z-50 bg-white border-b shadow-sm">
  <KeystaticToolsHeader />
</header>
```

**Content Wrapper**:
```tsx
<div className="pt-16"> {/* Match header height */}
  <KeystaticApp />
</div>
```

## Test Execution Strategy

1. **Parallel Test Execution**: All tests run concurrently (no dependencies)
2. **Watch Mode**: Use `npm test -- --watch` during development
3. **CI Integration**: Tests must pass before merge

## Success Criteria

✅ **Definition of Done**:
- 100% of tests passing (26/26)
- No console errors or warnings
- All 5 header components visible in layout
- Header properly positioned (fixed, top, z-index)
- Content padding matches header height
- No hydration errors
- Works with dynamic [[...params]] routing

## Test Failure Root Causes

| Test Failure | Root Cause | Fix Required |
|-------------|------------|--------------|
| Cannot find ProductionLink | KeystaticToolsHeader not in layout | Add component to layout |
| Cannot find DeploymentStatus | KeystaticToolsHeader not in layout | Add component to layout |
| Cannot find BugReportModal | KeystaticToolsHeader not in layout | Add component to layout |
| Cannot find GenerateSEOButton | KeystaticToolsHeader not in layout | Add component to layout |
| Cannot find SparkryBranding | KeystaticToolsHeader not in layout | Add component to layout |
| No fixed positioning | Header styling not implemented | Add Tailwind classes |
| No z-index | Header styling not implemented | Add z-50 class |
| No padding-top | Content wrapper styling missing | Add pt-16 class |
| Children prop not handled | Layout doesn't accept children | Update layout signature |

## Next Steps

1. **QCODE**: Create `KeystaticToolsHeader.tsx` component
2. **QCODE**: Update `layout.tsx` to integrate header
3. **QCHECK**: Run tests to verify all pass
4. **QGIT**: Commit changes with passing tests

## References

- **Test Best Practices**: `.claude/agents/test-writer.md`
- **CAPA Learnings**: `docs/tasks/KEYSTATIC-INTEGRATION-2025-11-22/CAPA-2025-11-22.md`
- **Interface Contracts**: `docs/tasks/INTERFACE-CONTRACT-SCHEMA.md`
- **Story Point Estimation**: `docs/project/PLANNING-POKER.md`

---

**Generated**: 2025-12-01
**Test Suite**: app/keystatic/__tests__/layout.test.tsx
**Story Points**: 1 SP
**Status**: ✅ Tests written and failing (TDD compliance)
