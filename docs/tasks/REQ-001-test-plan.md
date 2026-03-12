# Test Plan: REQ-001 — Production Link in CMS Header

> **Story Points**: Test development 0.2 SP

## Test Coverage Matrix

| REQ-ID | Unit Tests | Integration Tests | E2E Tests | Status |
|--------|------------|-------------------|-----------|--------|
| REQ-001 | ✅ 11 tests | ❌ Pending | ❌ Pending | **Failing** |

## Test Suite Overview

**Test File**: `components/keystatic/ProductionLink.spec.tsx`
**Framework**: Vitest + React Testing Library
**Mocked Dependencies**: Next.js `usePathname`, `useRouter`

## Unit Tests (0.2 SP)

### Component Behavior Tests
- **File**: `components/keystatic/ProductionLink.spec.tsx`
- **Tests**:
  1. `REQ-001 — renders link with correct production URL for nested page`
     - Mocks pathname: `/keystatic/pages/about`
     - Expected href: `https://prelaunch.bearlakecamp.com/about`

  2. `REQ-001 — constructs URL correctly for homepage`
     - Mocks pathname: `/keystatic/pages/home`
     - Expected href: `https://prelaunch.bearlakecamp.com/`

  3. `REQ-001 — constructs URL correctly for deeply nested pages`
     - Mocks pathname: `/keystatic/pages/programs/summer-camp`
     - Expected href: `https://prelaunch.bearlakecamp.com/programs/summer-camp`

  4. `REQ-001 — opens in new tab with secure attributes`
     - Verifies `target="_blank"` and `rel="noopener noreferrer"`

  5. `REQ-001 — renders ExternalLink icon from lucide-react`
     - Verifies SVG element is present

  6. `REQ-001 — shows fallback message for unpublished pages`
     - Tests behavior for new, unpublished pages
     - Flexible assertion to allow implementation choice

  7. `REQ-001 — handles edge case with trailing slash in pathname`
     - Ensures no double slashes or incorrect trailing slashes

  8. `REQ-001 — is keyboard accessible`
     - Verifies link is focusable with keyboard navigation

  9. `REQ-001 — has proper styling with hover state`
     - Checks for interactive CSS classes (hover, cursor, transition)

  10. `REQ-001 — renders as client component`
      - Validates `'use client'` directive is present

  11. `REQ-001 — correctly extracts slug from keystatic pathname structure`
      - Tests multiple pathname patterns
      - Validates slug extraction logic

## Mocking Strategy

### Next.js Navigation
```typescript
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => mockPathname(),
}));
```

### Test Data Patterns
- Keystatic pathname format: `/keystatic/pages/{slug}`
- Production URL format: `https://prelaunch.bearlakecamp.com/{slug}`
- Special case: `home` slug → `/` (root path)

## Edge Cases Covered

1. **Homepage Handling**: `home` slug maps to `/`
2. **Nested Routes**: Multi-level paths like `/programs/summer-camp`
3. **Trailing Slashes**: Prevents malformed URLs
4. **Unpublished Pages**: Graceful handling of pages not yet deployed
5. **Keystatic Path Extraction**: Correctly parses `/keystatic/pages/*` patterns

## Integration Tests (Pending)

### Future Coverage
- **Test Suite**: Keystatic Header Integration
- **Scope**: Verify ProductionLink renders within Keystatic admin UI
- **Dependencies**: Full Keystatic environment mock
- **Estimated SP**: 0.3 SP

## E2E Tests (Pending)

### Future Coverage
- **Test Suite**: CMS Admin User Flow
- **Scope**:
  - Editor logs into Keystatic
  - Navigates to page editor
  - Clicks "View Live Page" button
  - Production site opens in new tab
- **Tool**: Playwright
- **Estimated SP**: 0.5 SP

## Test Execution Strategy

### Current Phase (Unit Tests)
```bash
npm test -- components/keystatic/ProductionLink.spec.tsx
```

**Expected Result**: 11 failing tests (component not implemented)

### Implementation Phase
1. Implement `components/keystatic/ProductionLink.tsx`
2. Run tests iteratively as features are added
3. Achieve 11 passing tests

### Quality Gates
- All 11 tests must pass before merging
- TypeScript compilation: `npm run typecheck`
- Linting: `npm run lint`
- Prettier: Auto-format on save

## Dependencies

### Required Packages
- `lucide-react` (for ExternalLink icon) - **NEEDS INSTALLATION**
- `next/navigation` (already installed)

### Installation Command
```bash
npm install lucide-react
```

## Success Criteria

✅ **Test Development Complete** (current state):
- 11 comprehensive unit tests written
- All tests failing (expected TDD behavior)
- Test file location: `components/keystatic/ProductionLink.spec.tsx`

✅ **Implementation Ready When**:
- All 11 tests pass
- TypeScript compiles without errors
- Component renders correctly in Keystatic UI
- Production link opens correct page

## Test Failure Tracking

**Current Status**: Expected TDD failures
- **Date**: 2025-11-21
- **Failures**: 11/11 tests (Cannot find module './ProductionLink')
- **Reason**: Component not yet implemented (correct TDD state)
- **Next Step**: Implement `ProductionLink.tsx` component

## REQ-001 Acceptance Criteria Mapping

| Acceptance Criterion | Test Coverage |
|---------------------|--------------|
| Button visible in header on all CMS pages | Tests 1-11 verify component renders |
| Correct URL construction for nested pages | Tests 1, 2, 3, 11 |
| Works for both new and existing pages | Test 6 |
| Opens in new tab | Test 4 |
| Uses ExternalLink icon | Test 5 |
| Keyboard accessible | Test 8 |
| Proper styling/UX | Test 9 |

**Coverage**: 100% of acceptance criteria have test coverage

## Implementation Notes for Developer

### Component Location
- **Path**: `components/keystatic/ProductionLink.tsx`
- **Type**: Client component (`'use client'` directive required)

### Key Implementation Details
1. **URL Construction Logic**:
   - Extract slug from `usePathname()`
   - Remove `/keystatic/pages/` prefix
   - Handle `home` → `/` mapping
   - Construct: `https://prelaunch.bearlakecamp.com/{slug}`

2. **Required Imports**:
   ```typescript
   'use client';
   import { usePathname } from 'next/navigation';
   import { ExternalLink } from 'lucide-react';
   ```

3. **Accessibility**:
   - Proper ARIA labels
   - Keyboard navigation support
   - `rel="noopener noreferrer"` for security

4. **Styling**:
   - Tailwind CSS classes
   - Hover states
   - Responsive design

## References

- **Requirements**: `requirements/new-features.md` § REQ-001
- **Component Spec**: REQ-001 lines 35-60
- **Test Best Practices**: `CLAUDE.md` § 7, `.claude/agents/test-writer.md`
- **Story Point Estimation**: `docs/project/PLANNING-POKER.md`
