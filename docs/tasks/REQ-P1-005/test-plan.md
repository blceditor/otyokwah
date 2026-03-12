# Test Plan: Sparkry AI Branding

> **Story Points**: Test development 0.5 SP

## Test Coverage Summary

**REQ-ID**: REQ-P1-005
**Component**: SparkryBranding
**Location**: `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/keystatic/SparkryBranding.spec.tsx`
**Total Tests**: 29
**Status**: ✅ All failing (TDD red phase complete)

---

## Test Coverage Matrix

| REQ-ID | Unit Tests | Integration Tests | E2E Tests | Status |
|--------|------------|-------------------|-----------|--------|
| REQ-P1-005 | ✅ 29 tests | N/A | N/A | Failing (expected) |

---

## Test Breakdown

### Core Functionality Tests (4 tests - as specified)

1. **renders "Powered by" text with logo**
   - Verifies "Powered by" text is present
   - Verifies logo image renders with correct alt text

2. **link opens https://sparkry.ai in new tab**
   - Verifies href attribute is correct
   - Verifies target="_blank" attribute
   - Verifies rel="noopener noreferrer" for security

3. **logo loads from https://sparkry.ai/sparkry-logo.png**
   - Verifies image src attribute
   - Verifies Next.js Image optimization is applied
   - Verifies alt text for accessibility

4. **hides text on mobile, keeps logo visible**
   - Verifies "Powered by" text has responsive hide classes
   - Verifies logo remains visible on all breakpoints
   - Tests Tailwind responsive utilities (hidden sm:inline pattern)

### Detailed Implementation Tests (25 additional tests)

#### Visual & Styling Tests (7 tests)
- Logo dimensions (height: 24px, auto width)
- Subtle, non-intrusive styling (text-xs/sm, gray colors)
- Flexbox layout for proper alignment
- Gap spacing between elements
- Matches Keystatic design system aesthetics
- Responsive spacing maintained
- Smooth transition on hover

#### Accessibility Tests (3 tests)
- Proper ARIA attributes
- Keyboard accessibility
- Semantic HTML usage

#### Security Tests (2 tests)
- External link security attributes (noopener, noreferrer)
- No performance impact from external link

#### Next.js Integration Tests (3 tests)
- Uses Next.js Image component for optimization
- Logo loads with appropriate priority (lazy loading)
- Image srcset generated for responsive images

#### Component Integration Tests (5 tests)
- Component is self-contained (no required props)
- Can be imported and rendered
- Works in header context alongside other elements
- Maintains visibility across viewport sizes
- Does not interfere with CMS functionality

#### Responsive Behavior Tests (3 tests)
- Text hidden on mobile (< 640px)
- Logo visible on all screen sizes
- Proper alignment when text is hidden

#### Icon & UX Tests (2 tests)
- ExternalLink icon is small and subtle
- Link has hover state for better UX

---

## Acceptance Criteria Coverage

| Acceptance Criterion | Test Coverage | Status |
|---------------------|---------------|--------|
| Logo visible on all CMS pages | Unit test (visibility) | ✅ Covered |
| Link opens https://sparkry.ai in new tab | Unit test (target, rel) | ✅ Covered |
| Subtle, non-intrusive design | Unit tests (styling, colors) | ✅ Covered |
| Responsive (hide text on mobile, keep logo) | Unit tests (responsive) | ✅ Covered |
| Logo source: https://sparkry.ai/sparkry-logo.png | Unit test (image src) | ✅ Covered |

---

## Test Execution Results

### First Run (TDD Red Phase)
```bash
npm test -- components/keystatic/SparkryBranding.spec.tsx
```

**Result**: ✅ All 29 tests failing as expected

**Error**: `Cannot find module './SparkryBranding'`

**Status**: EXPECTED - Component not yet implemented (TDD red phase)

---

## Test Quality Checklist

✅ **Parameterized inputs** - All magic strings extracted to constants
✅ **Tests can fail for real defects** - Each test catches specific bugs
✅ **Descriptions align with assertions** - Test names match what's verified
✅ **Independent expectations** - No circular logic, pre-computed values used
✅ **Same quality as production** - TypeScript, proper formatting
✅ **REQ-ID citations** - All tests reference REQ-P1-005
✅ **Edge cases covered** - Mobile responsive, accessibility, security
✅ **Realistic inputs** - Actual Sparkry AI branding requirements

---

## Implementation Guidance

### Component Requirements (derived from tests)

**File**: `components/keystatic/SparkryBranding.tsx`

**Required Structure**:
```typescript
import Image from 'next/image'
import { ExternalLink } from 'lucide-react'

export function SparkryBranding() {
  return (
    <div className="flex items-center gap-2 text-xs text-gray-500">
      <span className="hidden sm:inline">Powered by</span>
      <a
        href="https://sparkry.ai"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 hover:text-gray-700 transition-colors"
      >
        <Image
          src="https://sparkry.ai/sparkry-logo.png"
          alt="Sparkry AI"
          width={80}
          height={24}
          className="h-6 w-auto"
          loading="lazy"
        />
        <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  )
}
```

**Key Implementation Points**:
1. Use Next.js Image component (not img tag)
2. Use Lucide React ExternalLink icon
3. Implement responsive hide with `hidden sm:inline`
4. Include security attributes on external link
5. Add hover transition for better UX
6. Keep styling subtle (gray-500, text-xs)

---

## Dependencies Required

- `next/image` - ✅ Already installed
- `lucide-react` - ⚠️ Check if installed, may need: `npm install lucide-react`

---

## Next Steps

1. ✅ **Test Writer** (this phase) - Tests created and failing
2. **SDE-III** - Implement SparkryBranding component
3. **PE-Reviewer** - Code quality review
4. **Test Validation** - Verify all 29 tests pass
5. **Integration** - Add component to Keystatic header
6. **Documentation** - Update Keystatic customization docs

---

## Story Point Estimates

- **Test Development**: 0.5 SP (completed)
- **Component Implementation**: 0.2 SP
- **Integration into Keystatic**: 0.3 SP
- **Code Review & Fixes**: 0.1 SP

**Total Feature**: 1.1 SP

---

## Test Failure Tracking

No bugs discovered yet - tests are expected TDD failures.

When implementation reveals actual bugs, log to:
`.claude/metrics/test-failures.md`

---

## References

- **Requirements**: `requirements/new-features.md` § REQ-P1-005
- **Test Best Practices**: `CLAUDE.md` § 7
- **Component Pattern**: `components/DraftModeBanner.tsx` (similar header component)
- **Image Optimization**: `components/OptimizedImage.tsx`
- **Planning Poker**: `docs/project/PLANNING-POKER.md`
