# Requirements: Homepage Visual Enhancement Features

**Date**: 2025-12-09
**Status**: Active
**Story Points**: 8 SP (Coding: 3, 2, 1.5, 1.5 SP)

---

## Overview

Four modular, reusable visual components to enhance the Bear Lake Camp homepage and support future multi-page use. All components integrate with Keystatic CMS and maintain existing accessibility/security standards.

---

## REQ-HERO-001: Hero Image Carousel Component

**Priority**: P0
**Story Points**: 3 SP

### Description
Replace static hero image with auto-rotating carousel that cycles through 6 camp images. Must be reusable on any page.

### Acceptance Criteria
- Carousel displays 6 images in sequence with configurable interval (default: 5 seconds)
- Smooth fade/slide transition between images (CSS-based, no heavy libraries)
- Pause on hover for accessibility
- Keyboard navigation (left/right arrows)
- Touch/swipe support for mobile
- Indicators (dots) show current position
- Respects `prefers-reduced-motion` media query
- Works with existing hero overlay and text positioning
- Image list configurable via Keystatic CMS field (array of image objects with `src` and `alt`)

### Initial Images (Homepage)
1. `/images/summer-program-and-general/Top-promo-7-scaled-e1731002368158.jpg` (current)
2. `/images/summer-program-and-general/jr-high-boys-giant-water-slide.jpg`
3. `/images/summer-program-and-general/jr-high-girls-jumping-in-lake.jpg`
4. `/images/summer-program-and-general/boys-in-canoe.jpg`
5. `/images/summer-program-and-general/campfire.jpg`
6. `/images/summer-program-and-general/cross-with-lake-in-background.jpg`

### Non-Goals
- Video support (images only)
- External URL images (local `/images/` only)
- Complex animation libraries (use CSS transitions)

### Technical Notes
- Component: `components/content/HeroCarousel.tsx`
- Props: `images: Array<{src: string, alt: string}>`, `interval?: number`, `showIndicators?: boolean`
- Keystatic field: `heroImages` (array of image objects, optional, defaults to single `heroImage` for backward compatibility)
- Must work with `isSafeImageUrl()` validation

---

## REQ-TEXT-002: Textured Font Effect for Headings

**Priority**: P1
**Story Points**: 2 SP

### Description
Apply distressed/grunge texture to H2 headings to match current bearlakecamp.com "WHO WE ARE" section aesthetic.

### Acceptance Criteria
- Texture applied via CSS background-clip + SVG/PNG texture overlay
- Applies to all `<h2>` elements in `HomepageTemplate` (via Tailwind utility class or global CSS)
- Texture is subtle (not obscuring readability)
- Works across light and dark backgrounds
- No layout shift or performance degradation
- Accessible (WCAG AA compliant contrast ratios maintained)
- Optional: Tailwind utility class `text-textured` for reuse elsewhere

### Resources
- Inspect https://bearlakecamp.com "WHO WE ARE" section for texture asset
- If asset unavailable, use similar grunge texture from free sources (e.g., Unsplash Texture, Subtle Patterns)

### Non-Goals
- Texture on all headings (H2 only initially)
- User-configurable texture (designer choice, not CMS field)

### Technical Notes
- Implementation: CSS `background-clip: text` + `-webkit-background-clip: text`
- Texture image: `/images/textures/heading-grunge.png` or inline SVG
- Fallback: Solid color if texture fails to load

---

## REQ-BG-003: Background Texture for Light Sections

**Priority**: P1
**Story Points**: 1.5 SP

### Description
Add subtle background texture to cream-colored sections (matching current bearlakecamp.com "Who We Are" background).

### Acceptance Criteria
- Texture extracted from current bearlakecamp.com site or similar grunge paper texture
- Applied to sections with `bg-cream` or `.bg-bark/5` via CSS
- Subtle (low opacity ~5-15%) to avoid overwhelming content
- Repeating/tiling texture (seamless)
- Performance: <50KB image, optimized PNG/WebP
- Accessible: Does not interfere with text contrast ratios (WCAG AA)

### Resources
- Extract texture from https://bearlakecamp.com "Who We Are" section background
- Fallback: Use subtle paper texture from Subtle Patterns or similar

### Non-Goals
- Full-screen textures (section backgrounds only)
- User-configurable textures (designer choice)

### Technical Notes
- CSS: `background-image: url('/images/textures/section-bg.png')`, `background-repeat: repeat`, `background-blend-mode: multiply` or `opacity` on pseudo-element
- Apply globally via Tailwind config `backgroundImage` extension or utility class `.bg-textured`

---

## REQ-GALLERY-004: Reusable Gallery Component

**Priority**: P1
**Story Points**: 1.5 SP

### Description
Create modular gallery component for displaying curated image sets on any page. Distinct from existing grid gallery (which shows all `galleryImages` from frontmatter).

### Acceptance Criteria
- Displays images in responsive grid (2 cols mobile, 3 cols tablet, 4 cols desktop)
- Lightbox/modal view on click (full-size image with prev/next navigation)
- Image captions display in modal
- Keyboard navigation (arrow keys, ESC to close)
- Lazy loading for performance
- Configurable via Keystatic CMS (array of image objects with `src`, `alt`, `caption`)
- Reusable on any page (not homepage-specific)
- Accessible: ARIA labels, focus management, keyboard traps

### Initial Images (Homepage Gallery)
All images from `/images/summer-program-and-general/` **except** carousel images:
- `backflip-water.jpg`
- `bible-study.jpg`
- `cheering-in-gym.jpg`
- `crafts.jpg`
- `girls-crafting.jpg`
- `girls-playing-jenga.jpg`
- `jr-high-Bible-study-10-scaled.jpg`
- `jr-high-Bible-study-9-scaled.jpg`
- `jr-high-girls-on-picnic-tagle.jpg`
- `jr-high-kids-with-banner.jpg`
- `kids-after-swimming.jpg`
- `kids-playing-with-blocks.jpg`
- `lawn-games.jpg`
- `paint-balloon-battle.jpg`
- `teen-girls-at-picnic-table-near-snack-shack.jpg`
- `Top-promo-1-scaled.jpg`
- `Two-Alia-Kyle-1-scaled.jpg`
- `volleyball.jpg`
- `water-launch.jpg`

### Non-Goals
- Automatic image fetching from directory (manual CMS curation)
- Video support (images only)
- Social sharing from lightbox

### Technical Notes
- Component: `components/content/Gallery.tsx`
- Props: `images: Array<{src: string, alt: string, caption?: string}>`, `columns?: {mobile: number, tablet: number, desktop: number}`
- Lightbox: Use Headless UI Dialog or similar accessible modal primitive (no heavy dependencies like react-image-gallery)
- Keystatic field: `galleryImages` (reuse existing field schema, or new `customGallery` field for non-homepage pages)

---

## Architecture Decisions

### Modularity Strategy
- **Carousel**: Standalone component, composable into any hero section
- **Textured Font**: Tailwind utility class (`.text-textured`) for broad reuse
- **Background Texture**: Global CSS applied to color utility classes
- **Gallery**: Standalone component, invokable via Keystatic custom component or frontmatter field

### CMS Integration
- Backward compatibility: Pages without new fields default to existing behavior
- Keystatic schema updates:
  - `heroImages?: Array<{src: string, alt: string}>` (optional, falls back to `heroImage`)
  - `customGallery?: Array<{src: string, alt: string, caption?: string}>` (optional)

### Performance Budget
- Carousel: <5KB JS (vanilla or preact), CSS transitions only
- Textures: <100KB total (heading + background textures combined)
- Gallery lightbox: <10KB JS (Headless UI Dialog)
- Target: No new dependencies >50KB gzipped

### Accessibility
- Carousel: `aria-live="polite"`, `role="region"`, pause on focus
- Lightbox: Focus trap, ESC key, ARIA modal
- Textures: Maintain WCAG AA contrast (4.5:1 for text, 3:1 for UI components)

---

## Testing Strategy

### Unit Tests (Per Component)
- **Carousel**: Image rotation timing, keyboard nav, pause on hover, reduced-motion fallback
- **Textured Font**: CSS applied, contrast ratio validation (via Axe)
- **Background Texture**: CSS applied to correct classes
- **Gallery**: Grid rendering, lightbox open/close, keyboard nav

### Integration Tests
- Homepage smoke test with all 4 features enabled
- Keystatic field validation (schema changes)
- Mobile responsive checks (Playwright viewport tests)

### Visual Regression
- Percy snapshots for textured headings and background texture
- Manual QA: Compare to current bearlakecamp.com reference

---

## Dependencies

### New Dependencies (If Needed)
- None (use existing Headless UI for modals if not already present)
- Texture assets: Extract from current site or use free textures

### Existing Dependencies
- Next.js Image component (Gallery)
- Tailwind CSS (all styling)
- Keystatic CMS (field schema updates)

---

## Rollout Plan

### Phase 1: Carousel (3 SP)
1. QCODET: Write failing tests for carousel
2. QCHECKT: Review tests
3. QPLAN: Plan fixes for P0/P1 test issues
4. QCODET: Fix test issues
5. QCODE: Implement `HeroCarousel.tsx`
6. QCHECK: PE review + security review
7. QPLAN: Fix P0/P1 issues
8. QCODE: Implement fixes
9. QCHECK: Recheck until clean

### Phase 2: Textured Font (2 SP)
1. Extract/source texture asset
2. QCODET: Write CSS tests (contrast, applied classes)
3. QCHECKT: Review tests
4. QPLAN: Plan fixes for P0/P1 test issues
5. QCODET: Fix test issues
6. QCODE: Implement CSS + Tailwind config
7. QCHECK: PE review
8. QPLAN: Fix P0/P1 issues
9. QCODE: Implement fixes
10. QCHECK: Recheck until clean

### Phase 3: Background Texture (1.5 SP)
1. Extract/source texture asset
2. QCODET: Write CSS tests
3. QCHECKT: Review tests
4. QPLAN: Plan fixes for P0/P1 test issues
5. QCODET: Fix test issues
6. QCODE: Implement CSS + Tailwind config
7. QCHECK: PE review
8. QPLAN: Fix P0/P1 issues
9. QCODE: Implement fixes
10. QCHECK: Recheck until clean

### Phase 4: Gallery Component (1.5 SP)
1. QCODET: Write failing tests for gallery + lightbox
2. QCHECKT: Review tests
3. QPLAN: Plan fixes for P0/P1 test issues
4. QCODET: Fix test issues
5. QCODE: Implement `Gallery.tsx`
6. QCHECK: PE review + security review
7. QPLAN: Fix P0/P1 issues
8. QCODE: Implement fixes
9. QCHECK: Recheck until clean

### Phase 5: Integration & Deployment
1. Update homepage `index.mdoc` to use new components
2. Update Keystatic schema for new fields
3. Run full test suite + smoke tests
4. QDOC: Update docs
5. QGIT: Commit and deploy

---

## PM Notes

### User Value Proposition
- **Carousel**: Showcases camp diversity in single hero space (increases engagement)
- **Textured Font**: Brand consistency with current site (reduces migration friction)
- **Background Texture**: Visual warmth and authenticity (aligns with camp ethos)
- **Gallery**: Content flexibility for multi-page storytelling (retreats, programs, etc.)

### Risk Analysis
- **Low Risk**: All features are additive (no breaking changes)
- **Moderate Risk**: Texture extraction from current site (may require designer assets)
- **Mitigation**: Fallback to free textures if extraction fails

### Success Metrics
- Homepage engagement: Time on page +10% (visual interest)
- Accessibility: Maintain 100% Lighthouse accessibility score
- Performance: Maintain Lighthouse performance score >90

---

## Open Questions

1. **Carousel Transition Style**: Fade or slide? (Recommend fade for accessibility)
2. **Texture Asset Ownership**: Can we extract from current site or need designer source? (Fallback: free textures)
3. **Gallery Lightbox Dependency**: Use existing Headless UI Dialog or custom? (Recommend Headless UI)
4. **CMS Field Naming**: `heroImages` vs `carouselImages`? (Recommend `heroImages` for semantic clarity)

---

## Related Documents

- Current Homepage: `/content/pages/index.mdoc`
- Homepage Template: `/components/templates/HomepageTemplate.tsx`
- Keystatic Schema: `/keystatic.config.tsx`
- Tailwind Config: `/tailwind.config.ts`
