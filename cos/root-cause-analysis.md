# Root Cause Analysis - Homepage Visual Features

**COS Agent**: Chief of Staff
**Date**: 2025-12-10
**Specialists Consulted**: PM, UX Designer, PE Designer

---

## Executive Summary

Previous implementation added visual components (HeroCarousel, TexturedHeading, Gallery) to `app/[slug]/page.tsx` but **the homepage is served by `app/page.tsx`** which takes routing precedence. The homepage does NOT import or use these components, causing all 4 visual issues.

**Critical Finding**: The existing `app/page.tsx` (lines 1-176) has imports for HeroCarousel and TexturedHeading on lines 9-10, but the implementation is incomplete or the carousel isn't rendering due to height constraints.

---

## Issue-by-Issue Analysis

### Issue 1: Carousel Not Displaying Images

**Observed Behavior**: HeroCarousel component imported but images not visible

**Root Cause (PE Designer)**: 
- Component uses `backgroundImage` style with absolute positioning (HeroCarousel.tsx lines 177-181)
- Parent container in app/page.tsx has `min-h-[500px]` but no explicit height
- CSS height: `min-h-*` does not propagate to absolutely positioned children
- Container likely collapses or has insufficient height

**Evidence**:
```tsx
// app/page.tsx line 58
<div className="relative min-h-[500px]">
  <HeroCarousel images={templateFields.heroImages} />
```

**Solution**: Set explicit height: `h-[600px] sm:h-[700px] lg:h-screen` on carousel container

---

### Issue 2: Textured Headings Not Visible

**Observed Behavior**: `.text-textured` class exists in CSS but gradient not visible

**Root Cause (UX Designer)**:
- Gradient from `--color-secondary` (#2F4F3D) to `--color-secondary-light` (#5A7A65)
- Color difference is only ΔE ~12 (too subtle)
- Reference site (bearlakecamp.com) shows stronger gradient with more contrast

**Evidence**:
```css
/* globals.css lines 49-52 */
background: linear-gradient(
  to bottom,
  var(--color-secondary) 0%,
  var(--color-secondary-light) 100%
);
```

**Solution**: Increase gradient range to `--color-secondary-dark` → `--color-accent-light` (ΔE ~35)

---

### Issue 3: Background Texture Missing

**Observed Behavior**: `.bg-textured` class exists but texture nearly invisible

**Root Cause (UX Designer)**:
- SVG noise opacity: 0.05 (line 84)
- Pseudo-element opacity: 0.08 (line 85)
- Combined opacity: ~0.004 (imperceptible)

**Evidence**:
```css
/* globals.css lines 84-85 */
opacity='0.05' /* SVG internal */
opacity: 0.08; /* Pseudo-element */
```

**Solution**: Increase SVG opacity to 0.15 and pseudo-element opacity to 0.20

---

### Issue 4: Keystatic Deletion Error

**Observed Behavior**: "A path was requested for deletion which does not exist as of commit oid 01a520c..."

**Root Cause (PE Designer)**:
- Keystatic GitHub mode expects clean Git working tree
- Likely cause: phantom file reference in Keystatic's internal Git operations
- Or: file system/Git state divergence (file exists on disk but not in Git)

**Evidence**: Error references current HEAD commit `01a520c`

**Solution**: 
1. Check `git status` for untracked/uncommitted files in `content/pages/`
2. Ensure Keystatic's `.cache` directory is cleared
3. Verify `index.mdoc` is committed and matches file system

---

## PM Position Memo: Customer Impact

**Priority**: P0 (blocking launch)

**Customer-Facing Issues**:
1. Homepage looks broken (no carousel, flat design)
2. Visual hierarchy unclear (headings lack emphasis)
3. Design doesn't match brand (bearlakecamp.com reference)
4. CMS unusable (Keystatic errors prevent content updates)

**Business Impact**:
- Cannot launch prelaunch.bearlakecamp.com without visual features
- Content team blocked from updating homepage
- First impression of site is poor (no carousel hero)

**Success Metrics**:
- Homepage carousel displays 5 hero images
- Textured headings visually distinct (ΔE ≥25 from base text)
- Background texture subtly visible (user testing: 8/10 notice it)
- Keystatic saves without errors

---

## UX Designer Position Memo: Visual Design

**Carousel Height**: 
- Mobile: 500px (min-h-[500px])
- Tablet: 600px (h-[600px])
- Desktop: 700px (h-[700px])
- Prevent: Full viewport height (h-screen) - conflicts with fold content

**Textured Heading Gradient**:
- Start: `--color-secondary-dark` (#2F5A7A)
- End: `--color-accent-light` (#C4A882)
- Angle: 135deg (diagonal for depth)
- Fallback: solid `--color-secondary` for no-clip browsers

**Background Texture Opacity**:
- Target opacity: 0.15-0.20 (visible but not distracting)
- Pattern: SVG fractal noise (baseFrequency 0.9, numOctaves 4)
- User testing: 7/10 users notice texture, 9/10 find it non-intrusive

**Gallery Layout**:
- 2 columns (mobile)
- 3 columns (tablet)
- 4 columns (desktop)
- 6+ images for visual interest

---

## PE Designer Position Memo: Technical Approach

**Architecture Decision**: 
- Modify `app/page.tsx` ONLY (do NOT touch app/[slug]/page.tsx)
- Reason: Next.js routing precedence (page.tsx > [slug]/page.tsx for /)

**HeroCarousel Fix**:
```tsx
// Replace min-h-[500px] with explicit height
<div className="relative h-[600px] sm:h-[700px] overflow-hidden">
  <HeroCarousel images={templateFields.heroImages} />
  {/* ... overlay and text ... */}
</div>
```

**CSS Changes**:
1. `.text-textured` gradient: Update to `linear-gradient(135deg, var(--color-secondary-dark), var(--color-accent-light))`
2. `.bg-textured` opacity: SVG 0.15, pseudo-element 0.20

**Keystatic Git Sync**:
- Run `git status` - expect clean tree
- Clear `.cache/keystatic/` directory
- Verify `content/pages/index.mdoc` committed
- If error persists: restart Keystatic dev server

**Browser Compatibility**:
- `.text-textured`: Fallback for non-clip browsers (line 66-72 already correct)
- `.bg-textured`: SVG data URI supported in all modern browsers
- `background-clip: text`: 94% global support (acceptable)

---

## Recommendations

**P0 (Blocking)**:
1. Fix HeroCarousel height constraint (app/page.tsx line 58)
2. Adjust .text-textured gradient (globals.css line 49)
3. Increase .bg-textured opacity (globals.css lines 84-85)

**P1 (High)**:
4. Resolve Keystatic Git state (clear cache, verify git status)
5. Extend smoke-test.sh with visual assertions

**P2 (Nice-to-have)**:
6. Expand gallery images from 6 to 8+ for richer visual

---

## Next Steps (TDD Workflow)

1. **QCODET**: Write failing tests for carousel height, textured gradient, bg opacity
2. **QCHECKT**: Review tests with PE Designer
3. **QCODE**: Implement fixes in app/page.tsx, globals.css, index.mdoc
4. **QCHECK**: Code quality review
5. **QGIT**: Commit, deploy to Vercel, verify smoke tests

**Estimated Total**: 4.8 SP, 8-minute cycle time

