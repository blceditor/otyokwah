# Keystatic Complete Implementation - Requirements Lock

**Source**: `/Users/travis/.claude/plans/complete-keystatic-implementation.md`
**Date**: 2025-12-02
**Objective**: Create a fully editable camp template where all 18 pages are generated with realistic content, all text/images are editable in Keystatic, navigation is fully editable, and every component is CMS-controlled.

---

## Phase 1: Content Generation Script

### REQ-401: Page Generation Script
- **Acceptance**:
  - Script creates all 18 page files in `/content/pages/` directory
  - Each page has valid frontmatter matching its template type (standard, program, facility, staff)
  - All generated content references actual images in `/public/images/` directory
  - Script is idempotent (can be run multiple times safely)
  - Running `npm run typecheck` passes after generation
  - Generated files are valid MDOC format
- **Non-Goals**:
  - Dynamic image validation
  - Content translation or localization

### REQ-402: Realistic Content Generation
- **Acceptance**:
  - Each of 18 pages contains contextually appropriate content for Bear Lake Camp
  - Program pages include age ranges, dates, pricing, and registration links
  - Facility pages include capacity and amenities information
  - Staff pages include employment overview and application CTAs
  - All SEO fields (metaTitle, metaDescription) are populated
  - Hero images and taglines are appropriate to page context
- **Non-Goals**:
  - AI-generated content
  - Content approval workflow

### REQ-403: Template-Specific Field Support
- **Acceptance**:
  - Program template pages include: ageRange, dates, pricing, registrationLink, galleryImages, ctaHeading, ctaButtonText, ctaButtonLink
  - Facility template pages include: capacity, amenities, features
  - Staff template pages include: position types, application information
  - Standard template pages include basic hero and body fields
  - All template-specific fields validate against Keystatic schema
- **Non-Goals**:
  - Runtime template switching
  - Template inheritance

---

## Phase 2: Rich Content Components

### REQ-404: Image Component
- **Acceptance**:
  - Available in Markdoc editor via `/image` command
  - Fields: src (image picker), alt (required text), caption (optional text)
  - Image picker uses directory: `public/uploads/content`
  - Frontend renders with Next.js Image component (800x600 default)
  - Caption appears below image with appropriate styling
  - Preview in Keystatic shows the selected image
- **Non-Goals**:
  - Image cropping/editing
  - Lazy loading configuration

### REQ-405: Call-to-Action Component
- **Acceptance**:
  - Available via `/cta` command
  - Fields: heading (text), text (multiline), buttonText (text), buttonLink (text)
  - Preview shows centered card with heading and button
  - Frontend renders with brand colors (bg-secondary, text-cream)
  - Button uses Next.js Link for internal navigation
  - Button has hover state styling
- **Non-Goals**:
  - Multiple buttons in single CTA
  - Icon support

### REQ-406: Feature Grid Component
- **Acceptance**:
  - Available via `/features` command
  - Array field allowing multiple features
  - Each feature has: icon (text/emoji), title (text), description (text)
  - Frontend renders 3-column grid on desktop, stacks on mobile
  - Item labels in editor show feature title
  - Preview shows "Feature Grid (3 columns)" placeholder
- **Non-Goals**:
  - Variable column count
  - Custom icon libraries

### REQ-407: Photo Gallery Component
- **Acceptance**:
  - Available via `/gallery` command
  - Array field for multiple images
  - Each image has: image (image picker), alt (text), caption (text)
  - Image picker uses directory: `public/uploads/gallery`
  - Frontend renders responsive grid (2 cols mobile, 3 cols desktop)
  - Images are properly sized (400x400)
- **Non-Goals**:
  - Lightbox/modal view
  - Image reordering UI

### REQ-408: YouTube Component
- **Acceptance**:
  - Available via `/youtube` command
  - Fields: videoId (text), title (text)
  - Preview shows "YouTube Video: {videoId}"
  - Frontend renders responsive 16:9 iframe embed
  - Embed includes allowFullScreen attribute
  - Video title used for iframe title attribute
- **Non-Goals**:
  - Video thumbnail preview
  - Playlist support

### REQ-409: Testimonial Component
- **Acceptance**:
  - Available via `/testimonial` command
  - Fields: quote (multiline text), author (text), role (text), photo (optional image)
  - Image picker uses directory: `public/uploads/testimonials`
  - Preview shows styled blockquote with author attribution
  - Frontend renders with left border accent
  - Photo appears as 48x48 rounded circle
  - Photo is optional (component works without it)
- **Non-Goals**:
  - Video testimonials
  - Star ratings

### REQ-410: Accordion Component
- **Acceptance**:
  - Available via `/accordion` command
  - Array field for FAQ items
  - Each item has: question (text), answer (multiline text)
  - Item labels in editor show question text
  - Preview shows "FAQ Accordion" placeholder
  - Frontend uses native HTML `<details>` element
  - Each item has bottom border separation
- **Non-Goals**:
  - Animation/transitions
  - Expand-all functionality

### REQ-411: Component Renderers Implementation
- **Acceptance**:
  - All 7 components export from `components/markdoc/MarkdocComponents.tsx`
  - All components receive typed props
  - All components use Tailwind utility classes for styling
  - Image components use Next.js Image for optimization
  - Link components use Next.js Link for navigation
  - Running `npm run typecheck` passes for all component files
- **Non-Goals**:
  - Server Components optimization
  - Dynamic imports

---

## Phase 3: Navigation in Keystatic

### REQ-412: Navigation Data Structure
- **Acceptance**:
  - Initial navigation data file created at `content/navigation.yaml`
  - Structure includes: menuItems (array), primaryCTA (object)
  - Each menu item has: label, href, children (optional array), external (boolean)
  - Navigation matches current site structure (Summer Camp, Work at Camp, Retreats, Give, About)
  - Each menu section includes appropriate child items
  - Primary CTA references registration link
- **Non-Goals**:
  - Multi-level nested navigation (>2 levels)
  - Per-page navigation overrides

### REQ-413: Navigation Singleton in Keystatic
- **Acceptance**:
  - Keystatic config includes `siteNavigation` singleton
  - Singleton stored in `/content/navigation/` directory
  - Fields support menu items array with nested children
  - Fields support primaryCTA with label, href, and external flag
  - Editor can add/remove/reorder menu items
  - Editor can edit all navigation text and links
  - Navigation validates required fields (label, href)
- **Non-Goals**:
  - Role-based navigation visibility
  - Navigation analytics

### REQ-414: Navigation Reader Function
- **Acceptance**:
  - Function `getNavigation()` exported from `lib/keystatic/navigation.ts`
  - Function uses Keystatic reader to fetch navigation data
  - Function returns fallback to `defaultNavigation` if Keystatic data unavailable
  - Function handles errors gracefully (console warning, returns default)
  - Return type matches NavigationData interface
  - Function is async and can be called from Server Components
- **Non-Goals**:
  - Navigation caching layer
  - Navigation versioning

### REQ-415: Layout Integration with Keystatic Navigation
- **Acceptance**:
  - `app/layout.tsx` calls `getNavigation()` on render
  - Navigation data passed as prop to `<Header>` component
  - Server-side rendering of navigation works correctly
  - Logo configuration remains separate from CMS (stays in default config)
  - Layout renders correctly when Keystatic data is unavailable
  - Running `npm run typecheck` passes for layout file
- **Non-Goals**:
  - Client-side navigation fetching
  - Navigation prefetching

### REQ-416: Header Component Navigation Updates
- **Acceptance**:
  - Header component accepts navigation prop from layout
  - Desktop menu renders menuItems from prop
  - Mobile menu renders menuItems from prop
  - Primary CTA button renders from prop data
  - External links open in new tab when external flag is true
  - Dropdown menus work for items with children
  - Active link highlighting still functions
- **Non-Goals**:
  - Mega menu layouts
  - Navigation search

---

## Phase 4: Documentation & Quality

### REQ-417: Keystatic Editing Guide
- **Acceptance**:
  - Documentation file created at `docs/operations/KEYSTATIC-EDITING-GUIDE.md`
  - Guide includes instructions for accessing Keystatic (dev and production URLs)
  - Guide covers navigation editing workflows (add, reorder, edit CTA)
  - Guide covers page creation for all 4 template types
  - Guide documents all 7 rich content components with usage examples
  - Guide includes image swapping workflows (hero, gallery, body images)
  - Guide includes 3+ real-world workflow examples
  - Language is non-technical and editor-friendly
- **Non-Goals**:
  - Video tutorials
  - Interactive demos

### REQ-418: Full Editability Verification
- **Acceptance**:
  - All page text content editable in Keystatic (zero hardcoded strings in components)
  - All hero images swappable via Keystatic UI
  - All gallery images swappable via Keystatic UI
  - All CTA buttons editable (text and links)
  - All navigation menu items editable
  - All SEO fields editable per page
  - Changes in Keystatic reflect immediately on frontend (after save)
- **Non-Goals**:
  - Draft/preview mode
  - Content approval workflow

### REQ-419: Template Variety Validation
- **Acceptance**:
  - At least 2 pages using Standard template exist and render correctly
  - At least 2 pages using Program template exist and render correctly
  - At least 2 pages using Facility template exist and render correctly
  - At least 2 pages using Staff template exist and render correctly
  - Each template displays all its unique fields properly
  - Template-specific components (e.g., pricing, capacity) render with correct data
- **Non-Goals**:
  - Template migration tools
  - Template analytics

### REQ-420: Component Rendering Verification
- **Acceptance**:
  - All 7 Markdoc components render without errors on frontend
  - Components maintain styling consistency with site theme
  - Components are responsive (work on mobile and desktop)
  - Components handle missing optional fields gracefully
  - Components work when multiple instances exist on same page
  - Image components load optimized images via Next.js
- **Non-Goals**:
  - Component A/B testing
  - Component usage analytics

### REQ-421: Quality Gates Checklist
- **Acceptance**:
  - All 18 pages accessible via their URLs (no 404s)
  - `npm run typecheck` passes with zero errors
  - `npm test` passes all test suites
  - All pages have valid SEO meta tags
  - All images display correctly (no broken image links)
  - Navigation displays correctly on desktop and mobile
  - All internal links navigate correctly
  - All external links open in new tabs
- **Non-Goals**:
  - Automated visual regression testing
  - Performance benchmarking

---

## Success Criteria Summary

**Core Deliverables**:
- ✅ 18 pages generated with realistic content
- ✅ 7 rich content components available in editor
- ✅ Navigation fully manageable in Keystatic
- ✅ Complete editor documentation
- ✅ Zero hardcoded content remaining
- ✅ All quality gates passing

**Story Points**: 8.5 SP total
- Phase 1: 3 SP
- Phase 2: 2 SP
- Phase 3: 2.5 SP
- Phase 4: 1 SP

**Dependencies**:
- Existing Keystatic integration (completed)
- Next.js 15 and App Router (in place)
- Tailwind CSS configuration (in place)
- Current navigation component structure (in place)
