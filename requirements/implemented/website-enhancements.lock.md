# Requirements Lock - Website Enhancements

**Project**: Bear Lake Camp Website Enhancements
**Date**: 2025-12-06
**Status**: Locked for Implementation
**Total Story Points**: 23 SP

---

## Website UI Enhancements

### REQ-WEB-001: Top-Level Navigation Links
**Priority**: P0 (Critical)
**Story Points**: 2 SP

**Description**: Top-level navigation items must be clickable links to parent pages, not just dropdown triggers.

**Current Behavior**:
- Top-level nav items (e.g., "Summer Camp", "Work at Camp") only trigger dropdowns
- No way to navigate to parent pages like `/summer-staff`

**Required Behavior**:
- Desktop: Click text → navigate to parent page; Click chevron → open dropdown
- Mobile: First tap → open dropdown; Second tap → navigate to parent
- Keyboard: Enter on parent → navigate; Arrow Down → open menu

**Acceptance Criteria**:
- [ ] Desktop users can click nav text to navigate to parent pages
- [ ] Desktop users can click chevron to open dropdown
- [ ] Mobile users can tap once to expand, twice to navigate
- [ ] Keyboard navigation works (Tab, Enter, Arrows, Escape)
- [ ] ARIA labels correct for screen readers
- [ ] No regression in existing dropdown functionality

**Implementation Files**:
- `/Users/travis/SparkryGDrive/dev/bearlakecamp/components/navigation/NavItem.tsx`
- `/Users/travis/SparkryGDrive/dev/bearlakecamp/components/navigation/DropdownMenu.tsx`
- `/Users/travis/SparkryGDrive/dev/bearlakecamp/keystatic.config.ts` (add `parentHref` field)

**Test Files**:
- `components/navigation/NavItem.spec.tsx`
- `tests/integration/navigation.spec.tsx`

**Non-Goals**:
- Changing mobile nav drawer behavior
- Modifying navigation styling/colors

---

### REQ-WEB-002: Logo 2X Larger + Hanging Effect
**Priority**: P0 (Critical) - Client HARD REQUIREMENT
**Story Points**: 3 SP

**Description**: Logo must be 2X current size (200x102px) and hang below header bottom edge using absolute positioning.

**Current State**:
- Logo: 100x51px in header
- File: `/Users/travis/SparkryGDrive/dev/bearlakecamp/public/blc-logo-transparent-500x250.png`
- Logo has transparent background (confirmed)

**Required State**:
- Initial: 200x102px, positioned to hang below header
- On scroll: Shrink to 150x76px, fit within header
- Use CSS `transform: scale()` for performance
- Smooth transition (300ms ease-in-out)

**Acceptance Criteria**:
- [ ] Logo renders at 200x102px on page load
- [ ] Logo hangs below header bottom edge (absolute positioning)
- [ ] On scroll down (>100px), logo smoothly shrinks to 150x76px
- [ ] No layout shift or jank (CLS < 0.1)
- [ ] Works on mobile (scaled proportionally)
- [ ] Logo remains clickable to homepage
- [ ] z-index management prevents overlap issues

**Implementation Files**:
- `/Users/travis/SparkryGDrive/dev/bearlakecamp/components/navigation/Logo.tsx`
- `/Users/travis/SparkryGDrive/dev/bearlakecamp/components/navigation/Header.tsx`

**Test Files**:
- `components/navigation/Logo.spec.tsx`
- `tests/integration/logo-scroll-behavior.spec.tsx`

**Technical Constraints**:
- Must use GPU-accelerated CSS (`transform: scale()`)
- Debounce scroll listener (throttle to 16ms for 60fps)
- Preload logo for faster initial render

**Non-Goals**:
- Changing logo design/colors
- Adding logo animation beyond scroll behavior

---

### REQ-WEB-003: Gallery - Add 5 More Images
**Priority**: P1 (High)
**Story Points**: 1 SP

**Description**: Homepage gallery must include 5 additional images (11 total).

**Current State**: 6 images in gallery
**Required State**: 11 images in masonry grid layout

**New Images** (all exist in `/Users/travis/SparkryGDrive/dev/bearlakecamp/public/images/summer-program-and-general/`):
1. `backflip-water.jpg` - Already in gallery
2. `boys-in-canoe.jpg`
3. `cross-with-lake-in-background.jpg`
4. `lawn-games.jpg`
5. `crafts.jpg` - Already in gallery

**Net New Images to Add**: 3 images (2 already present)
- `boys-in-canoe.jpg`
- `cross-with-lake-in-background.jpg`
- `lawn-games.jpg`

**Acceptance Criteria**:
- [ ] Gallery displays 11 images total
- [ ] Images load performantly (lazy loading for images below fold)
- [ ] Grid is responsive (2 cols mobile, 3 tablet, 4 desktop)
- [ ] Alt text provided for all new images
- [ ] Images compressed (<200KB each)
- [ ] First 4 images load eagerly, rest lazy

**Implementation Files**:
- `/Users/travis/SparkryGDrive/dev/bearlakecamp/components/homepage/Gallery.tsx`

**Test Files**:
- `components/homepage/Gallery.spec.tsx`

**Non-Goals**:
- Changing gallery layout significantly
- Adding gallery filtering/categories

---

### REQ-WEB-004: Summer Staff YouTube Embed Fix
**Priority**: P0 (Critical)
**Story Points**: 1 SP

**Description**: YouTube video embed on `/summer-staff` page must display correctly.

**Current State**:
- Page content has: `{% youtube id="gosIrrZAtHw" %}`
- Video not rendering on page

**Video Details**:
- URL: https://youtu.be/gosIrrZAtHw
- Video ID: `gosIrrZAtHw`

**Root Cause Analysis**:
- YouTube component exists in keystatic.config.ts (line 438)
- YouTubeEmbed component exists at `/Users/travis/SparkryGDrive/dev/bearlakecamp/components/content/YouTubeEmbed.tsx`
- Issue: MarkdocRenderer component does not register youtube tag

**Required Fix**:
- Add youtube tag to MarkdocRenderer.tsx config
- Map to YouTubeEmbed component

**Acceptance Criteria**:
- [ ] YouTube video displays on `/summer-staff` page
- [ ] Video is responsive (16:9 aspect ratio)
- [ ] Video plays on click
- [ ] Works on mobile devices
- [ ] No console errors
- [ ] Accessible (title attribute, keyboard controls)
- [ ] Uses youtube-nocookie.com for privacy

**Implementation Files**:
- `/Users/travis/SparkryGDrive/dev/bearlakecamp/components/content/MarkdocRenderer.tsx`
- `/Users/travis/SparkryGDrive/dev/bearlakecamp/app/[slug]/page.tsx` (if needed)

**Test Files**:
- `components/content/MarkdocRenderer.spec.tsx`
- `tests/integration/youtube-embed.spec.tsx`

**Technical Details**:
- Component accepts: `videoId`, `title`, `caption`, `startTime`
- Already implements privacy controls (youtube-nocookie.com)
- Already implements lazy loading

**Non-Goals**:
- Adding video download capabilities
- Creating custom video player

---

### REQ-WEB-005: Tradesmith Font for All Headings
**Priority**: P1 (High)
**Story Points**: 2 SP

**Description**: Apply Tradesmith font to all h1-h6 headings across the site.

**Font File Location**: `/Users/travis/SparkryGDrive/dev/bearlakecamp/public/TradesmithStamp.otf`

**Current State**:
- Tradesmith font already configured in `app/layout.tsx` (line 20-24)
- CSS variable: `--font-tradesmith`
- Font loaded via `next/font/local`

**Required State**:
- All h1-h6 elements use Tradesmith font
- Fallback: `system-ui, sans-serif`
- Font loads without FOIT/FOUT

**Acceptance Criteria**:
- [ ] Tradesmith font loads on all pages
- [ ] All h1-h6 elements use Tradesmith
- [ ] Font loads without flash of unstyled text
- [ ] Fallback font specified for graceful degradation
- [ ] Font displays correctly on all browsers
- [ ] No increase in page load time (>100ms)

**Implementation Files**:
- `/Users/travis/SparkryGDrive/dev/bearlakecamp/app/globals.css` (add h1-h6 font-family rules)
- `/Users/travis/SparkryGDrive/dev/bearlakecamp/tailwind.config.ts` (extend fontFamily if needed)

**Test Files**:
- `tests/integration/typography.spec.tsx`

**Technical Constraints**:
- Already using `font-display: swap` (line 23)
- Font already loaded in root layout
- Just need global CSS rule

**Non-Goals**:
- Changing body text font
- Adding additional font weights
- Creating typography component library

---

### REQ-WEB-006: Summer Staff Page Style Match
**Priority**: P1 (High)
**Story Points**: 3 SP

**Description**: `/summer-staff` page must match style of reference site.

**Reference Site**: https://www.bearlakecamp.com/summer-staff/

**Design Audit Required**:
- Hero image style (full-width, overlay, text positioning)
- Typography (heading sizes, weights, spacing)
- Color palette (greens, tans, whites)
- Section layouts (padding/margins)
- CTA buttons (style, positioning)
- Image gallery layout
- Content spacing and hierarchy

**Acceptance Criteria**:
- [ ] Summer Staff page visually matches reference site
- [ ] All sections aligned (hero, content, gallery, CTA)
- [ ] Typography consistent (font, sizes, weights)
- [ ] Color palette matches reference
- [ ] Responsive on mobile (even if reference isn't)
- [ ] Passes accessibility audit (WCAG AA)
- [ ] Client approval obtained

**Implementation Files**:
- `/Users/travis/SparkryGDrive/dev/bearlakecamp/app/[slug]/page.tsx`
- `/Users/travis/SparkryGDrive/dev/bearlakecamp/components/templates/` (may need new template)
- `/Users/travis/SparkryGDrive/dev/bearlakecamp/content/pages/summer-staff.mdoc`

**Test Files**:
- `tests/visual-regression/summer-staff.spec.tsx`
- `tests/integration/summer-staff-layout.spec.tsx`

**Design Tokens to Extract**:
- Hero min-height, overlay opacity
- Section padding-y values
- Typography scale (h1, h2, h3, body)
- Color values (primary, secondary, accent)
- Button styles (padding, border-radius, colors)

**Non-Goals**:
- Rewriting entire page from scratch
- Changing content structure
- Migrating to different template system

---

## Keystatic CMS Enhancements

### REQ-CMS-001: Floating Editing Toolbar
**Priority**: P0
**Status**: ✅ IMPLEMENTED
**Story Points**: 0 SP (Already Complete)

**Components**:
- `components/keystatic/PageEditingToolbar.tsx`
- `components/keystatic/DeploymentStatus.tsx`
- `components/keystatic/ProductionLink.tsx`

**No Action Needed**: Confirmed in `requirements/cms-enhancements.lock.md`

---

### REQ-CMS-002: Quote Component System
**Priority**: P1 (High)
**Story Points**: 5 SP

**Description**: Centralized testimonial quote management with page tagging system.

**Quote Volume**: <10 quotes (confirmed by client)

**Data Model**:
```yaml
quote: "Main quote text (max 200 chars)"
attribution: "1st Time Camper"
context: "Extended quote (optional)"
backgroundImage: /images/quotes/camper-testimonial-1.jpg
taggedPages:
  - summer-staff
  - about
category: camper | parent | staff | alumni
featured: true | false
displayOrder: 0
```

**Architecture**:
- Global quote collection in Keystatic
- Page tagging via multiselect field
- Server-side rendering (no client JS)
- Build-time quote-to-page mapping

**Acceptance Criteria**:
- [ ] Editors can create quotes in Keystatic CMS
- [ ] Editors can tag quotes to multiple pages
- [ ] Editors can set display order per page
- [ ] Quotes appear on all tagged pages
- [ ] Quotes sort by display order
- [ ] Quote card matches reference design (overlay variant)
- [ ] Background images display correctly
- [ ] Attribution displays prominently
- [ ] Build time increase <10 seconds for 10 quotes
- [ ] Page load time <500ms for quotes section
- [ ] Accessible (ARIA labels, semantic HTML)
- [ ] Responsive on all screen sizes

**Implementation Files**:
- `/Users/travis/SparkryGDrive/dev/bearlakecamp/keystatic.config.ts` (add quotes collection)
- `/Users/travis/SparkryGDrive/dev/bearlakecamp/components/content/QuoteCard.tsx` (new)
- `/Users/travis/SparkryGDrive/dev/bearlakecamp/components/content/QuoteSection.tsx` (new)
- `/Users/travis/SparkryGDrive/dev/bearlakecamp/lib/quotes/getQuotesForPage.ts` (new)
- `/Users/travis/SparkryGDrive/dev/bearlakecamp/app/[slug]/page.tsx` (integrate quotes)

**Test Files**:
- `lib/quotes/__tests__/getQuotesForPage.test.ts`
- `components/content/__tests__/QuoteCard.test.tsx`
- `components/content/__tests__/QuoteSection.test.tsx`
- `tests/integration/quote-system.spec.tsx`

**Quote Display Variants**:
1. **Overlay** (Primary): Full-width with background image, dark overlay
2. **Card** (Future): White card for grid layouts
3. **Inline** (Future): Within content flow

**Story Point Breakdown**:
- Quote collection schema: 1 SP
- Page slug sync system: 1 SP
- Quote rendering components: 2 SP
- Integration with page templates: 1 SP

**Non-Goals**:
- Quote carousel/rotation (Phase 2)
- Video quotes (Phase 2)
- Public quote submission form (Phase 3)
- Quote analytics (Phase 3)

---

## Cross-Cutting Concerns

### REQ-QUALITY-001: Typography System Consistency
**Priority**: P2 (Nice-to-have)
**Story Points**: 1 SP (included in REQ-WEB-005)

**Description**: Ensure consistent typography hierarchy across site.

**Acceptance Criteria**:
- [ ] Typography scale documented
- [ ] Design tokens defined
- [ ] All pages use consistent heading styles

---

### REQ-QUALITY-002: Responsive Design Verification
**Priority**: P2 (Nice-to-have)
**Story Points**: 1 SP

**Description**: Verify all enhancements work across devices.

**Breakpoints**:
- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px+

**Acceptance Criteria**:
- [ ] Logo scales appropriately on mobile
- [ ] Navigation collapses to hamburger menu
- [ ] Gallery grid responsive (2 cols → 3 cols → 4 cols)
- [ ] Quote cards readable on mobile
- [ ] YouTube embeds maintain aspect ratio
- [ ] Touch targets ≥44x44px

---

### REQ-QUALITY-003: Accessibility Audit (WCAG 2.1 AA)
**Priority**: P2 (Nice-to-have)
**Story Points**: 2 SP

**Description**: Ensure all enhancements meet accessibility standards.

**Acceptance Criteria**:
- [ ] Color contrast ≥4.5:1 for text
- [ ] Keyboard navigation for all interactive elements
- [ ] Screen reader support (ARIA labels)
- [ ] Focus indicators visible
- [ ] Alt text for all images
- [ ] Zero critical axe violations

---

### REQ-QUALITY-004: Performance Optimization
**Priority**: P2 (Nice-to-have)
**Story Points**: 2 SP

**Description**: Optimize Core Web Vitals for all enhancements.

**Targets**:
- LCP (Largest Contentful Paint): <2.5s
- FID (First Input Delay): <100ms
- CLS (Cumulative Layout Shift): <0.1

**Acceptance Criteria**:
- [ ] Lighthouse score >90 (mobile & desktop)
- [ ] Images lazy load below fold
- [ ] Fonts preload correctly
- [ ] No layout shift on logo scroll

---

### REQ-QUALITY-005: SEO Optimization
**Priority**: P2 (Nice-to-have)
**Story Points**: 1 SP

**Description**: Ensure proper meta tags and structured data.

**Acceptance Criteria**:
- [ ] All pages have unique meta titles
- [ ] All pages have meta descriptions
- [ ] Structured data implemented (Organization, LocalBusiness)
- [ ] XML sitemap updated

---

## Summary

**Total Story Points**: 23 SP

**Phase Breakdown**:
- Phase 1 (P0 Critical): 6 SP
  - REQ-WEB-001: Navigation (2 SP)
  - REQ-WEB-002: Logo (3 SP)
  - REQ-WEB-004: YouTube (1 SP)

- Phase 2 (P1 High): 11 SP
  - REQ-WEB-003: Gallery (1 SP)
  - REQ-WEB-005: Font (2 SP)
  - REQ-WEB-006: Staff page (3 SP)
  - REQ-CMS-002: Quotes (5 SP)

- Phase 3 (P2 Polish): 6 SP
  - REQ-QUALITY-002: Responsive (1 SP)
  - REQ-QUALITY-003: Accessibility (2 SP)
  - REQ-QUALITY-004: Performance (2 SP)
  - REQ-QUALITY-005: SEO (1 SP)

**Dependencies**:
- REQ-WEB-005 must complete before REQ-WEB-006 (font needed for style matching)
- REQ-WEB-004 can run parallel to all others
- REQ-CMS-002 can run parallel to website enhancements

**Risks**:
- Logo hanging effect may require z-index tweaking (Medium risk)
- Staff page style matching requires client approval (High risk)
- Quote system build time may increase if >10 quotes added later (Low risk)

---

**Document Version**: 1.0
**Last Updated**: 2025-12-06
**Locked By**: Planner Agent
**Next Phase**: QCODET (Test-Driven Development)
