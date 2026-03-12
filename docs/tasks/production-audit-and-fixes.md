# Production Site Audit & Fix Plan
**Site**: prelaunch.bearlakecamp.com
**Date**: 2025-12-03
**Audit Type**: Post-migration production gap analysis

---

## Executive Summary

**Current State**: Post-migration fixes (REQ-PM-001 through REQ-PM-009) have been successfully implemented. The homepage now renders from CMS (HomepageTemplate), all 19 pages use proper templates with hero images, and Keystatic admin is functional.

**Gap Analysis**: The production site is **60% complete** toward the full mockup vision (REQ-200 series). Core infrastructure is solid, but missing key homepage components that drive conversion.

**Priority Assessment**:
- **P0 (Must Have)**: 5 components, 3.5 SP - Critical for homepage conversion
- **P1 (Should Have)**: 4 components, 2.5 SP - Enhance user experience
- **P2 (Nice to Have)**: 2 components, 1.5 SP - Polish and social proof

**Total Work Remaining**: 7.5 SP

---

## Audit Checklist Results

### Homepage Components (REQ-200 Series) - Status Check

#### Implemented and Working
- [x] **HomepageTemplate** - REQ-PM-002: Hero section with image background, markdown body content, photo gallery grid, CTA section
- [x] **Hero Section** (partial) - Hero image background, title, tagline via HomepageTemplate
- [x] **Photo Gallery** (partial) - Responsive grid (2/3/4 cols) integrated into HomepageTemplate
- [x] **CTA Section** (partial) - Bottom CTA with heading, button text, and link via HomepageTemplate

#### Missing from Mockup
- [ ] **TrustBar** - REQ-211: Sticky bar with 5 trust signals (ACA Accredited, 500+ Families, Since 1948, 4.9/5 Rating, 80% Return)
- [ ] **MissionSection** - REQ-213: Background image with text overlay, parallax effect, handwritten kicker
- [ ] **ProgramCard Grid** - REQ-214: 2-card grid showcasing Jr High and High School programs with hover effects
- [ ] **TestimonialSection** - REQ-215: Video testimonial placeholders with play button overlays
- [ ] **InstagramFeed** - REQ-217: 6-item placeholder grid with "View on Instagram" hover overlay
- [ ] **ContactSection** - REQ-218: Centered heading + subtitle + button row
- [ ] **MobileStickyCTA** - REQ-219: Fixed bottom bar appearing after scroll (hidden on desktop)
- [ ] **Footer Enhancement** - REQ-220: 3-column grid with branding, quick links, social icons

#### Design System Status
- [x] **CSS Variables** - REQ-201: Colors, spacing scale defined in globals.css (Tailwind config)
- [x] **Typography** - REQ-202: System font stack + Caveat for handwritten accents
- [x] **Tailwind Integration** - REQ-203: Theme extended with design system tokens
- [ ] **Handwritten Font Usage** - Caveat font not applied to accent text (mission kicker, section headings)

---

### Navigation - Status Check

#### Implemented and Working
- [x] Header component with logo
- [x] Desktop navigation menu rendering from `content/navigation/navigation.yaml`
- [x] Mobile responsive hamburger menu
- [x] Dropdown menus for sections with children
- [x] Primary CTA button (Register Now) styled and functional
- [x] Navigation fully editable in Keystatic admin
- [x] 5 main sections: Summer Camp, Work at Camp, Retreats, Facilities, Give, About
- [x] 14 dropdown children across all sections

#### Issues Identified
- [ ] **Navigation content mismatch**: Mockup shows "Retreats" dropdown, current site has "Retreats, Facilities, Give, About"
- [ ] **Logo styling**: Current logo may not match mockup positioning/size
- [ ] **Dropdown hover states**: Need to verify against mockup interaction design

---

### Template Pages - Status Check

#### Program Pages (2 pages: Junior High, Senior High)
- [x] Hero images display as backgrounds (REQ-PM-003)
- [x] Session info cards render (age range, dates, pricing)
- [x] Gallery sections display (REQ-PM-004)
- [x] CTA buttons styled and functional
- [x] Responsive design works on mobile/tablet/desktop
- [ ] **Gap**: Program pages not using ProgramCard component from mockup (uses template instead)
- [ ] **Gap**: Hover effects not implemented on session cards

#### Facility Pages (4 pages: Cabins, Chapel, Dining Hall, Rec Center)
- [x] Hero images display as backgrounds
- [x] Facility-specific fields render (capacity, amenities)
- [x] Template styling consistent with design system
- [ ] **Gap**: Missing feature icon grid from mockup design

#### Staff Pages (4 pages: Summer Staff, Counselors, Kitchen Staff)
- [x] Hero images display as backgrounds
- [x] CTA buttons for applications
- [x] Staff-specific content renders
- [ ] **Gap**: No staff photo grid or testimonial integration

#### Standard Pages (9 pages: About, Contact, Give, etc.)
- [x] Hero images display
- [x] Markdown content renders with proper styling
- [x] Responsive layout works
- [ ] **Gap**: Standard pages feel plain compared to mockup's visual richness

---

### Keystatic Admin - Status Check

#### Fully Functional
- [x] `/keystatic` route accessible
- [x] "Settings > Site Navigation" appears in sidebar (REQ-PM-005)
- [x] Can scroll to bottom of edit forms (REQ-PM-006)
- [x] All 19 pages editable
- [x] Image fields use file pickers
- [x] Gallery arrays support add/remove items
- [x] Template selection works for new pages
- [x] Navigation CRUD operations work

#### Areas for Improvement
- [ ] **Onboarding**: No editor guide visible in admin UI
- [ ] **Preview mode**: No way to preview changes before publishing
- [ ] **Image library**: No centralized image browser (uses directory pickers)

---

## Gap Analysis: Current vs Mockup

### What's Missing from Mockup

#### 1. TrustBar Component (P0 - Critical)
**Mockup Has**: Sticky horizontal bar with 5 trust signals, horizontal scroll on mobile
**Current Site Has**: Nothing (no trust signals visible)
**Impact**: High - Trust signals are critical for parent conversion
**Implementation**: 0.5 SP

#### 2. MissionSection Component (P0 - Critical)
**Mockup Has**: Full-width background image with overlay, handwritten kicker, mission statement, parallax effect
**Current Site Has**: Plain markdown content in HomepageTemplate body
**Impact**: High - Mission is core to brand identity
**Implementation**: 0.5 SP

#### 3. ProgramCard Grid (P0 - Critical)
**Mockup Has**: 2-card grid with hover lift effects, image zoom, feature bullets, age ranges
**Current Site Has**: Navigation links to program pages (no homepage showcase)
**Impact**: Critical - Primary conversion path for parents
**Implementation**: 1 SP

#### 4. TestimonialSection Component (P1 - Important)
**Mockup Has**: Video placeholders with play button overlays, captions, durations
**Current Site Has**: Nothing (no testimonials on homepage)
**Impact**: Medium - Social proof drives trust
**Implementation**: 0.5 SP

#### 5. InstagramFeed Component (P1 - Important)
**Mockup Has**: 6-item grid with hover overlay, link to Instagram profile
**Current Site Has**: Nothing (no social media integration)
**Impact**: Medium - Shows active community
**Implementation**: 0.5 SP

#### 6. ContactSection Component (P1 - Important)
**Mockup Has**: Centered section with heading, subtitle, dual CTAs (Email Us + View Programs)
**Current Site Has**: CTA section at bottom of HomepageTemplate (single button)
**Impact**: Medium - Reduces friction for inquiries
**Implementation**: 0.3 SP

#### 7. MobileStickyCTA Component (P1 - Important)
**Mockup Has**: Fixed bottom bar with 2 buttons (Register Now + Find Your Week), appears after scrolling past hero
**Current Site Has**: Nothing (mobile users have no persistent CTA)
**Impact**: High on mobile - 60% of traffic is mobile
**Implementation**: 0.5 SP

#### 8. Footer Enhancement (P2 - Nice to Have)
**Mockup Has**: 3-column grid (branding, quick links, social icons), styled social buttons
**Current Site Has**: Basic footer (exists but may not match mockup styling)
**Impact**: Low - Footer is informational, not conversion-focused
**Implementation**: 0.3 SP

#### 9. Handwritten Font Accents (P2 - Nice to Have)
**Mockup Has**: Caveat font for kickers, taglines, accent text
**Current Site Has**: Caveat font loaded but not consistently applied
**Impact**: Low - Brand personality enhancement
**Implementation**: 0.2 SP

#### 10. Scroll Animations (P2 - Nice to Have)
**Mockup Has**: Fade-in sections on scroll, bouncing scroll indicator, parallax effects
**Current Site Has**: No animations (static sections)
**Impact**: Low - Polish and engagement
**Implementation**: 1 SP (includes accessibility considerations)

---

### What's Working Well

#### Infrastructure
- [x] **CMS Integration**: All content editable in Keystatic
- [x] **Template System**: 4 template types working correctly
- [x] **Routing**: Next.js App Router handling all 19 pages
- [x] **Hero Images**: Background images rendering on all templates
- [x] **Gallery Grids**: Responsive image grids working
- [x] **Security**: XSS protection, safe URL validation in place
- [x] **Type Safety**: TypeScript checks passing

#### Content
- [x] **19 Pages Generated**: All content migrated from WordPress
- [x] **Local Images**: All images in `/public/images/` directories
- [x] **Image Paths Updated**: No WordPress.com URLs remaining
- [x] **SEO Metadata**: All pages have metaTitle, metaDescription

#### User Experience
- [x] **Mobile Responsive**: All templates adapt to screen sizes
- [x] **Navigation**: Dropdown menus work on desktop and mobile
- [x] **Performance**: Next.js Image optimization in place
- [x] **Accessibility**: Semantic HTML, ARIA labels on key components

---

## Implementation Strategy

### Approach: Phased Component Development

**Philosophy**: Build reusable homepage components that can be composed together OR integrated into HomepageTemplate as needed. Maintain flexibility for future homepage redesigns.

**Two Viable Paths**:

#### Path A: Standalone Components (Recommended)
- Create separate components (TrustBar, MissionSection, ProgramCard, etc.)
- Compose them in `app/page.tsx` alongside HomepageTemplate
- **Pros**: More flexible, easier to A/B test, can reuse on other pages
- **Cons**: Homepage is combination of components + template (requires coordination)

#### Path B: Monolithic HomepageTemplate
- Add all missing sections to HomepageTemplate component
- Drive everything from `index.mdoc` frontmatter
- **Pros**: Single source of truth, all editable in Keystatic
- **Cons**: HomepageTemplate becomes very large, harder to maintain

**Recommendation**: **Path A** - Compose standalone components in `app/page.tsx` for maximum flexibility.

---

## Detailed Fix Plan

### Phase 1: P0 Critical Components (3.5 SP)

#### REQ-PROD-001: TrustBar Component (0.5 SP)
**File**: `components/homepage/TrustBar.tsx`
**Status**: Component exists but not integrated into homepage

**Tasks**:
1. Verify TrustBar component matches mockup design
2. Create TrustBar content singleton in Keystatic
3. Add TrustBar to `app/page.tsx` above HomepageTemplate
4. Implement sticky behavior on scroll
5. Test mobile horizontal scroll
6. Write 5 tests (rendering, sticky behavior, mobile scroll, content from CMS, accessibility)

**Acceptance**:
- TrustBar appears at top of homepage
- Sticky on scroll (remains visible when scrolling down)
- Horizontal scroll on mobile (< 768px)
- All 5 trust signals editable in Keystatic
- ARIA labels for screen readers

**Dependencies**: None

---

#### REQ-PROD-002: MissionSection Component (0.5 SP)
**File**: `components/homepage/Mission.tsx`
**Status**: Component exists but not integrated into homepage

**Tasks**:
1. Verify Mission component matches mockup (background image, overlay, handwritten kicker)
2. Create Mission content singleton in Keystatic
3. Add Mission to `app/page.tsx` after TrustBar
4. Implement parallax effect (CSS fixed attachment) on desktop
5. Disable parallax on mobile (performance)
6. Apply Caveat font to kicker text
7. Write 6 tests (rendering, background image, overlay, parallax, content from CMS, reduced motion)

**Acceptance**:
- Mission section displays below TrustBar
- Background image with 40% black overlay
- Handwritten kicker in Caveat font
- Parallax effect on desktop (disabled on mobile)
- All text editable in Keystatic
- Respects `prefers-reduced-motion`

**Dependencies**: None

---

#### REQ-PROD-003: ProgramCard Grid (1 SP)
**File**: `components/homepage/Programs.tsx`, `components/homepage/ProgramCard.tsx`
**Status**: Components exist but not integrated into homepage

**Tasks**:
1. Verify ProgramCard matches mockup (hover lift, image zoom, feature bullets)
2. Create Programs collection in Keystatic (or extend existing)
3. Add Programs grid to `app/page.tsx` after Mission
4. Implement hover effects (lift + image zoom)
5. Connect to existing program pages (Jr High, Senior High)
6. Make feature bullets editable
7. Write 8 tests (rendering, 2-card grid, hover effects, responsive, CMS content, accessibility)

**Acceptance**:
- 2-card grid displays Jr High and High School programs
- Hover lift effect on cards
- Image zoom effect on hover
- Feature bullets render from CMS
- CTAs link to program detail pages
- Grid responsive (1 col mobile, 2 col tablet+)

**Dependencies**: None

---

#### REQ-PROD-004: Homepage Component Integration (1.5 SP)
**File**: `app/page.tsx`
**Purpose**: Compose all homepage components together

**Tasks**:
1. Refactor `app/page.tsx` to render component composition:
   - TrustBar (above all)
   - HomepageTemplate (hero + body content)
   - Mission (after hero)
   - Programs (after mission)
   - HomepageTemplate gallery (reuse existing)
   - HomepageTemplate CTA (reuse existing)
2. Create Keystatic singletons for TrustBar, Mission content
3. Update homepage reader logic to fetch all singletons
4. Ensure proper spacing between sections
5. Test scroll behavior (sections flow naturally)
6. Write integration tests (10 tests covering full page composition)

**Acceptance**:
- Homepage renders all components in correct order
- TrustBar sticky behavior works
- Smooth scroll transitions between sections
- All content editable in Keystatic
- No layout shifts or overlap
- Performance: LCP < 2.5s

**Dependencies**: REQ-PROD-001, REQ-PROD-002, REQ-PROD-003

---

### Phase 2: P1 Important Components (2.5 SP)

#### REQ-PROD-005: TestimonialSection Component (0.5 SP)
**File**: `components/homepage/Testimonials.tsx`
**Status**: Component exists but not integrated into homepage

**Tasks**:
1. Verify Testimonials component matches mockup (video placeholders, play button overlay)
2. Create Testimonials collection in Keystatic
3. Add Testimonials to homepage after Programs
4. Implement play button hover state
5. Add caption and duration display
6. Write 5 tests (rendering, video placeholders, play button, CMS content, accessibility)

**Acceptance**:
- 2 video testimonial placeholders display
- Play button overlay with hover effect
- Caption and duration text below each video
- All content editable in Keystatic
- Accessible (keyboard navigation, ARIA labels)

**Dependencies**: REQ-PROD-004

---

#### REQ-PROD-006: InstagramFeed Component (0.5 SP)
**File**: `components/homepage/InstagramFeed.tsx`
**Status**: Component exists but not integrated into homepage

**Tasks**:
1. Verify InstagramFeed matches mockup (6-item grid, hover overlay)
2. Add InstagramFeed to homepage after gallery
3. Implement hover overlay ("View on Instagram")
4. Make Instagram handle editable in Keystatic
5. Add link to Instagram profile
6. Write 5 tests (rendering, 6-item grid, hover overlay, link, accessibility)

**Acceptance**:
- 6-item placeholder grid displays
- Hover overlay shows "View on Instagram"
- Link to Instagram profile works
- Instagram handle editable in Keystatic
- Grid responsive (2 cols mobile, 3 cols tablet, 6 cols desktop)

**Dependencies**: REQ-PROD-004

**Non-Goal**: Instagram API integration (Phase 3)

---

#### REQ-PROD-007: ContactSection Component (0.3 SP)
**File**: `components/homepage/Contact.tsx` (or enhance HomepageTemplate CTA)
**Status**: Partial (CTA section exists in HomepageTemplate)

**Options**:
1. **Option A**: Create separate Contact component with dual CTAs
2. **Option B**: Enhance HomepageTemplate CTA to support multiple buttons

**Recommended**: Option B (simpler, leverages existing component)

**Tasks**:
1. Extend HomepageTemplate CTA to support array of buttons
2. Update `index.mdoc` templateFields to include `ctaButtons: [{text, link}]`
3. Update Keystatic schema for array of CTA buttons
4. Style dual buttons side-by-side on desktop, stacked on mobile
5. Write 4 tests (dual buttons, responsive layout, CMS content, accessibility)

**Acceptance**:
- Contact section displays 2 buttons (Email Us + View Programs)
- Buttons side-by-side on desktop, stacked on mobile
- Buttons editable in Keystatic
- Accessible (focus states, ARIA labels)

**Dependencies**: REQ-PROD-004

---

#### REQ-PROD-008: MobileStickyCTA Component (0.5 SP)
**File**: `components/MobileStickyCTA.tsx`
**Status**: Component exists but not integrated into homepage

**Tasks**:
1. Verify MobileStickyCTA matches mockup (2 buttons, appears after scroll)
2. Add MobileStickyCTA to `app/layout.tsx` (global component)
3. Implement scroll trigger (appears after scrolling past hero)
4. Hide on desktop (≥1024px)
5. Make button text/links editable in Keystatic
6. Write 6 tests (rendering, scroll trigger, visibility, desktop hide, CMS content, accessibility)

**Acceptance**:
- Fixed bottom bar with 2 buttons
- Appears after scrolling 50% of hero height
- Hidden on desktop (≥1024px)
- Buttons editable in Keystatic
- Z-index correct (above content, below modals)
- Accessible (focus trap, keyboard navigation)

**Dependencies**: REQ-PROD-004

---

#### REQ-PROD-009: Footer Enhancement (0.7 SP)
**File**: `components/layout/Footer.tsx` (or `components/Footer.tsx`)
**Status**: Footer exists but may not match mockup styling

**Tasks**:
1. Audit existing Footer component against mockup
2. Implement 3-column grid (branding, quick links, social icons)
3. Style social icon buttons (FB, IG, YT)
4. Make all footer content editable in Keystatic (singleton)
5. Ensure responsive (stacks on mobile)
6. Write 5 tests (rendering, 3-column grid, social icons, responsive, CMS content)

**Acceptance**:
- 3-column grid on desktop, stacked on mobile
- Social icon buttons styled consistently
- All links functional
- All content editable in Keystatic
- Accessible (focus states, ARIA labels)

**Dependencies**: None

---

### Phase 3: P2 Nice-to-Have Polish (1.5 SP)

#### REQ-PROD-010: Handwritten Font Accents (0.2 SP)
**File**: Multiple (Mission, Hero, section headings)

**Tasks**:
1. Audit all locations where Caveat font should be applied
2. Add `.handwritten` class or Tailwind equivalent
3. Update Mission kicker to use Caveat
4. Update homepage hero tagline if appropriate
5. Update section subheadings where mockup uses handwritten style
6. Test font loading (ensure no FOUT/FOIT)

**Acceptance**:
- Caveat font displays on mission kicker
- Handwritten accents match mockup
- Font loads without layout shift
- Respects font-display: swap

**Dependencies**: REQ-PROD-002

---

#### REQ-PROD-011: Scroll Animations (1 SP)
**File**: Multiple components + new animation utility

**Tasks**:
1. Create scroll animation utility (Intersection Observer)
2. Add fade-in animation to all major sections
3. Add bouncing scroll indicator to hero
4. Implement parallax effect on MissionSection
5. Ensure all animations respect `prefers-reduced-motion`
6. Test performance (no janky animations)
7. Write 8 tests (fade-in, scroll indicator, parallax, reduced motion, performance)

**Acceptance**:
- Sections fade in as user scrolls
- Scroll indicator bounces in hero
- Parallax effect on mission section (desktop only)
- All animations disabled when `prefers-reduced-motion: reduce`
- No performance impact (60fps maintained)

**Dependencies**: REQ-PROD-002, REQ-PROD-004

---

#### REQ-PROD-012: Accessibility Audit (0.3 SP)
**File**: All homepage components

**Tasks**:
1. Run Lighthouse accessibility audit on production
2. Fix any issues with focus states
3. Add ARIA labels where missing
4. Test keyboard navigation flow
5. Test with screen reader (VoiceOver or NVDA)
6. Ensure touch targets ≥48×48px
7. Document accessibility features in editing guide

**Acceptance**:
- Lighthouse accessibility score ≥90
- All interactive elements keyboard accessible
- Screen reader announces all content correctly
- Touch targets meet minimum size
- Focus states visible on all elements

**Dependencies**: All previous REQs

---

## Story Points Breakdown

| Phase | Component | SP | Priority | Keystatic |
|-------|-----------|-----|----------|-----------|
| **Phase 1: P0 Critical** | | **3.5** | | |
| 1 | TrustBar Component | 0.5 | P0 | Yes |
| 1 | MissionSection Component | 0.5 | P0 | Yes |
| 1 | ProgramCard Grid | 1.0 | P0 | Yes |
| 1 | Homepage Integration | 1.5 | P0 | Yes |
| **Phase 2: P1 Important** | | **2.5** | | |
| 2 | TestimonialSection | 0.5 | P1 | Yes |
| 2 | InstagramFeed | 0.5 | P1 | Partial |
| 2 | ContactSection Enhancement | 0.3 | P1 | Yes |
| 2 | MobileStickyCTA | 0.5 | P1 | Yes |
| 2 | Footer Enhancement | 0.7 | P1 | Yes |
| **Phase 3: P2 Nice to Have** | | **1.5** | | |
| 3 | Handwritten Font Accents | 0.2 | P2 | No |
| 3 | Scroll Animations | 1.0 | P2 | No |
| 3 | Accessibility Audit | 0.3 | P2 | No |
| **TOTAL** | | **7.5 SP** | | |

---

## TDD Flow (Per CLAUDE.md Requirements)

### Phase 1: Test Writing (QCODET)
**Agent**: test-writer
**SP**: 1.5

**Tests to Write** (all failing initially):
1. `TrustBar.spec.tsx` - 5 tests
2. `Mission.spec.tsx` - 6 tests (verify existing or create new)
3. `Programs.spec.tsx` - 8 tests (verify existing or create new)
4. `ProgramCard.spec.tsx` - 5 tests (verify existing or create new)
5. `app/page.integration.spec.tsx` - 10 tests (new integration tests)
6. `Testimonials.spec.tsx` - 5 tests (verify existing or enhance)
7. `InstagramFeed.spec.tsx` - 5 tests (verify existing or enhance)
8. `MobileStickyCTA.spec.tsx` - 6 tests (verify existing or enhance)
9. `Footer.spec.tsx` - 5 tests (verify existing or enhance)

**Total**: ~55 tests (25 new, 30 enhanced)

---

### Phase 2: Test Review (QCHECKT)
**Agents**: pe-reviewer, test-writer
**SP**: 0.3

- Review test quality, coverage, REQ-ID mapping
- Identify P0-P1 issues in test design
- Verify all tests FAIL before implementation
- Fix test issues before proceeding

---

### Phase 3: Implementation (QCODE)
**Agents**: sde-iii, implementation-coordinator
**SP**: 5.5

**Parallel Tracks**:

**Track A: P0 Components**
1. Integrate TrustBar into homepage
2. Integrate Mission into homepage
3. Integrate Programs into homepage
4. Refactor `app/page.tsx` for component composition
5. Create Keystatic singletons for new components

**Track B: P1 Components**
6. Integrate Testimonials into homepage
7. Integrate InstagramFeed into homepage
8. Enhance CTA section for dual buttons
9. Integrate MobileStickyCTA into layout
10. Enhance Footer component

**Track C: P2 Polish**
11. Apply handwritten font accents
12. Implement scroll animations
13. Run accessibility audit and fix issues

---

### Phase 4: Code Review (QCHECK, QCHECKF)
**Agents**: pe-reviewer, code-quality-auditor
**SP**: 0.8

- Review all homepage components
- Review `app/page.tsx` composition logic
- Check for XSS vulnerabilities in new components
- Verify TypeScript types
- Verify performance (LCP, CLS, FID)

---

### Phase 5: P0-P1 Fixes Loop
**Process**: QPLAN → QCODE → QCHECK (recursive until clean)
**SP**: 1.0 (estimated)

1. Planner creates fix plan for P0-P1 issues
2. SDE-III implements fixes
3. PE-Reviewer checks fixes
4. Repeat until no P0-P1 issues remain

---

### Phase 6: End-to-End Verification (QUX)
**Agent**: ux-tester
**SP**: 0.5

**Manual QA Checklist** (prelaunch.bearlakecamp.com):
1. Homepage loads and displays all components
2. TrustBar sticky behavior works
3. Mission section parallax works (desktop only)
4. Program cards hover effects work
5. Gallery grid responsive
6. CTA buttons functional
7. Testimonial section displays
8. Instagram feed displays
9. MobileStickyCTA appears on scroll (mobile only)
10. Footer displays with all links working
11. Navigation dropdowns work
12. All 19 pages accessible
13. Keystatic admin accessible
14. Can edit all homepage content
15. No console errors
16. No broken images

---

## Risk Assessment

### High Risk
**Issue**: Component composition in `app/page.tsx` could conflict with HomepageTemplate
**Mitigation**: Clear separation of concerns - HomepageTemplate handles hero/body/gallery/CTA, standalone components handle trust/mission/programs/testimonials
**Contingency**: If conflicts arise, refactor to single composition model

**Issue**: Keystatic schema changes could break existing content
**Mitigation**: Add new singletons, don't modify existing page schema
**Contingency**: Backup `content/` directory before schema changes

### Medium Risk
**Issue**: Performance degradation from adding multiple components
**Mitigation**: Lazy load below-fold components, optimize images, use Intersection Observer for animations
**Contingency**: Disable animations if performance drops below 60fps

**Issue**: Mobile scroll behavior with MobileStickyCTA could overlap content
**Mitigation**: Test z-index layering, ensure CTA doesn't block important content
**Contingency**: Reduce CTA height or make dismissible

### Low Risk
**Issue**: Handwritten font loading could cause FOUT/FOIT
**Mitigation**: Use font-display: swap, preconnect to Google Fonts
**Contingency**: Use system font fallback if Caveat fails to load

---

## Dependencies

### Technical Dependencies
- Next.js 15 App Router (in place)
- Keystatic core (in place)
- Tailwind CSS (in place)
- Homepage template system (in place)
- Navigation singleton (in place)

### Content Dependencies
- Hero images for all pages (in place)
- Gallery images for homepage (in place)
- Program content (Jr High, Senior High) (in place)
- Trust signals data (needs to be gathered)
- Testimonial video IDs (needs to be gathered)
- Instagram handle (needs to be verified)

### External Dependencies
- Google Fonts (Caveat) (already loaded)
- Instagram profile link (already exists)
- Registration link (UltraCamp) (already exists)

---

## Success Criteria

### Pre-Deployment Gates (MUST PASS)
- [ ] All 55+ tests passing
- [ ] `npm run typecheck` passes
- [ ] `npm test` passes
- [ ] `npm run lint` passes
- [ ] No P0 or P1 issues remaining
- [ ] Lighthouse Performance ≥80
- [ ] Lighthouse Accessibility ≥90
- [ ] No console errors on homepage
- [ ] No broken images

### Production Verification (prelaunch.bearlakecamp.com)
- [ ] Homepage displays all 10 components in correct order
- [ ] TrustBar sticky on scroll
- [ ] Mission section with parallax (desktop)
- [ ] Program cards with hover effects
- [ ] Gallery grid responsive
- [ ] Testimonials display
- [ ] Instagram feed displays
- [ ] MobileStickyCTA appears on scroll (mobile only)
- [ ] Footer with 3-column grid
- [ ] All CTAs functional
- [ ] All navigation links work
- [ ] Keystatic admin accessible
- [ ] Can edit all homepage content in Keystatic
- [ ] Mobile responsive on all screen sizes
- [ ] LCP < 2.5s on mobile 3G
- [ ] CLS < 0.1
- [ ] FID < 100ms

### Business Goals
- [ ] Homepage matches mockup design ≥90%
- [ ] All content editable by non-technical editors
- [ ] Homepage conversion elements present (trust signals, CTAs, social proof)
- [ ] Mobile experience optimized (sticky CTA, responsive layout)
- [ ] Site ready for launch announcement

---

## Non-Goals (Explicitly Out of Scope)

### Phase 1-3 Non-Goals
- Video background for hero (using static image)
- Instagram API integration (using placeholder grid)
- Animation library (CSS-only animations)
- Program detail page redesign (templates work as-is)
- Multi-level nested navigation (>2 levels)
- Content approval workflow
- Draft/preview mode
- Image format optimization (WebP conversion)
- Advanced lazy loading configuration
- SEO audit (covered in separate effort)

### Future Phases (Not Included in 7.5 SP)
- Video testimonial hosting (currently placeholders)
- Instagram API integration
- Advanced analytics integration
- A/B testing framework
- Content versioning
- Multi-language support
- Advanced image optimization (WebP, AVIF)
- Page speed optimization beyond basics
- Advanced accessibility features (dyslexia-friendly fonts, high contrast mode)

---

## Related Requirements

### Completed Requirements
- REQ-PM-001 to REQ-PM-009: Post-migration fixes (COMPLETED)
- REQ-401 to REQ-421: Keystatic complete implementation (COMPLETED)

### Current Requirements
- REQ-200 to REQ-220: Homepage mockup conversion (60% complete, this plan addresses remaining 40%)
- REQ-230 to REQ-234: Accessibility (partially complete, REQ-PROD-012 addresses gaps)
- REQ-240 to REQ-242: Performance (partially complete, monitoring needed)

### New Requirements (This Plan)
- REQ-PROD-001 to REQ-PROD-012: Production gap fixes

---

## Implementation Timeline Estimate

**Note**: Per CLAUDE.md guidelines, story points only, no time estimates.

| Phase | SP | Dependencies |
|-------|-----|--------------|
| Phase 1: Test Writing (QCODET) | 1.5 | None |
| Phase 2: Test Review (QCHECKT) | 0.3 | Phase 1 |
| Phase 3: Implementation (QCODE) | 5.5 | Phase 2 |
| Phase 4: Code Review (QCHECK) | 0.8 | Phase 3 |
| Phase 5: P0-P1 Fix Loop | 1.0 | Phase 4 |
| Phase 6: E2E Verification (QUX) | 0.5 | Phase 5 |
| **TOTAL** | **9.6 SP** | |

**Note**: Total includes implementation (7.5 SP) + testing/review/QA overhead (2.1 SP)

---

## Next Steps

### Immediate Actions (Today)
1. Review this audit with stakeholders
2. Prioritize P0 vs P1 vs P2 components
3. Decide on Path A (composition) vs Path B (monolithic template)
4. Gather missing content (trust signals, testimonial videos, Instagram handle)

### This Week
1. Run **QCODET** to write failing tests for all components
2. Run **QCHECKT** to review test quality
3. Start **QCODE** implementation on P0 components (TrustBar, Mission, Programs)

### Next Week
1. Complete P0 components integration
2. Start P1 components (Testimonials, Instagram, MobileStickyCTA)
3. Run **QCHECK** code review on completed work

### Following Week
1. Complete P1 components
2. Add P2 polish (handwritten fonts, animations)
3. Run **QCHECKF** function review
4. Run **QUX** end-to-end testing
5. Run **QDOC** to update editor guide
6. Run **QGIT** to commit and deploy

---

## Appendix A: Component Inventory

### Existing Components (Not on Homepage)
- `components/homepage/TrustBar.tsx` - EXISTS
- `components/homepage/Mission.tsx` - EXISTS
- `components/homepage/Programs.tsx` - EXISTS
- `components/homepage/ProgramCard.tsx` - EXISTS
- `components/homepage/Testimonials.tsx` - EXISTS
- `components/homepage/TestimonialsVideoPlayer.tsx` - EXISTS
- `components/homepage/InstagramFeed.tsx` - EXISTS
- `components/homepage/Gallery.tsx` - EXISTS (but gallery is in HomepageTemplate)
- `components/homepage/Hero.tsx` - EXISTS (but hero is in HomepageTemplate)
- `components/MobileStickyCTA.tsx` - EXISTS

### Current Homepage Structure
```tsx
// app/page.tsx (CURRENT)
export default async function Home() {
  return (
    <HomepageTemplate
      title={page.title}
      bodyContent={bodyContent}
      heroImage={page.heroImage}
      heroTagline={page.heroTagline}
      templateFields={{
        galleryImages: [...],
        ctaHeading: "...",
        ctaButtonText: "...",
        ctaButtonLink: "..."
      }}
    />
  );
}
```

### Proposed Homepage Structure (Path A)
```tsx
// app/page.tsx (PROPOSED)
export default async function Home() {
  const trustBar = await reader.singletons.trustBar.read();
  const mission = await reader.singletons.mission.read();
  const programs = await reader.collections.programs.all();
  const testimonials = await reader.collections.testimonials.all();
  const instagramHandle = await reader.singletons.instagram.read();

  return (
    <>
      <TrustBar items={trustBar.items} />
      <HomepageTemplate {...homepageProps} />
      <Mission {...mission} />
      <Programs programs={programs} />
      <Testimonials testimonials={testimonials} />
      <InstagramFeed handle={instagramHandle} />
      <MobileStickyCTA /> {/* Global in layout.tsx */}
    </>
  );
}
```

---

## Appendix B: Keystatic Schema Changes

### New Singletons Needed
```typescript
// keystatic.config.ts additions

singletons: {
  // ... existing singletons ...

  trustBar: singleton({
    label: 'Trust Bar',
    path: 'content/homepage/trust-bar',
    schema: {
      items: fields.array(
        fields.object({
          icon: fields.text({ label: 'Icon (emoji or text)' }),
          text: fields.text({ label: 'Text' }),
          number: fields.text({ label: 'Number (optional)' }),
        }),
        {
          label: 'Trust Items',
          itemLabel: props => props.fields.text.value,
        }
      ),
    },
  }),

  mission: singleton({
    label: 'Mission Section',
    path: 'content/homepage/mission',
    schema: {
      kicker: fields.text({ label: 'Kicker (handwritten text)' }),
      statement: fields.text({ label: 'Mission Statement' }),
      description: fields.text({ label: 'Description', multiline: true }),
      backgroundImage: fields.image({
        label: 'Background Image',
        directory: 'public/images/homepage',
        publicPath: '/images/homepage/',
      }),
    },
  }),

  instagram: singleton({
    label: 'Instagram Feed',
    path: 'content/homepage/instagram',
    schema: {
      handle: fields.text({ label: 'Instagram Handle' }),
      profileUrl: fields.text({ label: 'Instagram Profile URL' }),
      hashtag: fields.text({ label: 'Hashtag (without #)' }),
    },
  }),

  mobileStickyCTA: singleton({
    label: 'Mobile Sticky CTA',
    path: 'content/homepage/mobile-cta',
    schema: {
      button1Text: fields.text({ label: 'Button 1 Text' }),
      button1Link: fields.text({ label: 'Button 1 Link' }),
      button2Text: fields.text({ label: 'Button 2 Text' }),
      button2Link: fields.text({ label: 'Button 2 Link' }),
    },
  }),
}
```

### Enhanced Collections
```typescript
// Add testimonials collection (if not exists)
collections: {
  // ... existing collections ...

  testimonials: collection({
    label: 'Testimonials',
    path: 'content/testimonials/*',
    slugField: 'name',
    schema: {
      name: fields.slug({ name: { label: 'Name' } }),
      videoId: fields.text({ label: 'YouTube Video ID' }),
      caption: fields.text({ label: 'Caption' }),
      duration: fields.text({ label: 'Duration (e.g., 0:45)' }),
      type: fields.select({
        label: 'Type',
        options: [
          { label: 'Parent', value: 'parent' },
          { label: 'Camper', value: 'camper' },
          { label: 'Staff', value: 'staff' },
        ],
        defaultValue: 'parent',
      }),
    },
  }),
}
```

---

## Appendix C: Visual Comparison Checklist

### Homepage Sections (Top to Bottom)

| Section | Mockup | Current | Gap | Priority |
|---------|--------|---------|-----|----------|
| Skip Link | Yes | No | Missing | P2 |
| TrustBar | Yes | No | **Missing** | **P0** |
| Hero Section | Yes | Yes | ✓ Implemented | - |
| Mission Section | Yes (parallax) | No | **Missing** | **P0** |
| Programs Grid | Yes (2 cards) | No | **Missing** | **P0** |
| Body Content | Yes | Yes | ✓ Implemented | - |
| Testimonials | Yes (2 videos) | No | **Missing** | **P1** |
| Gallery Grid | Yes (6 images) | Yes (3 images) | Partial | P1 |
| Instagram Feed | Yes (6 posts) | No | **Missing** | **P1** |
| Contact Section | Yes (2 CTAs) | Yes (1 CTA) | Partial | P1 |
| Footer | Yes (3-col) | Yes | Verify styling | P2 |
| Mobile Sticky CTA | Yes | No | **Missing** | **P1** |

---

## Document Metadata

**Author**: Planner Agent
**Date**: 2025-12-03
**Version**: 1.0
**Status**: Draft - Awaiting Review
**Related Documents**:
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/requirements/homepage-conversion.md`
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/requirements/post-migration-fixes.lock.md`
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/requirements/keystatic-complete-implementation.lock.md`
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/public/mockup/index.html`
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/CLAUDE.md`
