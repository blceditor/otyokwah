# Website Enhancement Requirements - Phase 4 (Design System & Navigation Fixes)

**Created**: 2025-12-04
**Status**: Planning
**Dependencies**: Phase 3 completed (REQ-UI-003 Footer exists)
**Source**: requirements/website-notes2.md

---

## Overview

This phase addresses design system improvements (modern card-based layout, accessible link colors) and navigation/routing issues (404s, missing content). The work is organized into three parallel execution tracks:

1. **Design System Track**: Global styling improvements
2. **Navigation Track**: Fix 404s and routing configuration
3. **Content Enhancement Track**: Add card components to existing pages

**Total Estimated Story Points**: 26 SP (updated with staff page decision)

---

## Design System Track (5 SP)

### REQ-DESIGN-001: Modern Card-Based Layout System

**Description**: Implement a consistent, modern centered design system with card-based section separation across all pages. Build upon existing InfoCard component (REQ-UI-002).

**Acceptance Criteria**:
- All page templates (standard, program, facility, staff) updated with centered max-width containers
- Sections visually separated using card components with proper spacing
- Card variations defined: InfoCard (existing), SectionCard (new wrapper), ContentCard (new)
- Consistent padding/margin system: section-y spacing between cards (4rem/64px)
- Single card: centered with max-width constraint, not full-width
- Two cards: evenly spaced with margins matching page left/right margins
- Three+ cards: responsive grid (1-col mobile, 2-col tablet, 3-col desktop)
- Visual hierarchy: cards elevated with subtle shadows, rounded corners (theme: rounded-lg)
- Responsive behavior tested at 320px, 768px, 1024px, 1440px breakpoints

**Story Points**: 3 SP

**Dependencies**: None (extends existing InfoCard from REQ-UI-002)

**Affected Files**:
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/content/SectionCard.tsx` (new)
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/content/ContentCard.tsx` (new)
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/content/SectionCard.spec.tsx` (new test)
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/content/ContentCard.spec.tsx` (new test)
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/app/globals.css` (add card utilities)
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/templates/StandardTemplate.tsx` (apply cards)
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/app/[slug]/page.tsx` (update standard template rendering)

**Test Strategy**:
- Unit tests: SectionCard and ContentCard render correctly with all props
- Visual regression: Card layouts at all breakpoints
- Accessibility: Semantic HTML, proper heading hierarchy, ARIA if needed
- Integration: Cards render via Markdoc in mdoc files
- Responsive: Grid behavior tested in Playwright at breakpoints

**Non-Goals**:
- Rewriting existing ProgramCard or InfoCard components
- Adding animations beyond existing hover effects
- Dark mode support

**Pros**:
- Builds on existing InfoCard pattern (consistency)
- Improves visual hierarchy and scannability
- Modern, professional appearance
- Responsive by default

**Cons**:
- Requires updating all page templates
- Slightly more complex HTML structure
- May need content reflow testing

**Chosen Approach**: Create SectionCard wrapper for high-level sections and ContentCard for nested content. Use Tailwind utilities for consistency. This is the simplest approach that achieves modern card-based layout without over-engineering.

---

### REQ-DESIGN-002: Accessible Link Color System

**Description**: Update link colors from dark green (#2F4F3D secondary) to brighter, accessible green that maintains contrast ratios and aligns with color theory.

**Acceptance Criteria**:
- New link color selected using WCAG AA color contrast analysis (4.5:1 minimum against cream #F5F0E8)
- Recommended: Use `text-secondary-light` (#5A7A65) or create new `link` color variant
- Test against both cream (#F5F0E8) and white backgrounds
- Hover state defined with increased brightness (10-15% lighter)
- Focus state includes visible outline for keyboard navigation
- Visited link state uses slightly darker shade (accessibility best practice)
- Global link styles updated in `globals.css` for markdown content
- Component-specific links updated: Footer, navigation, MarkdownRenderer
- Color theory validation: green hue preserved, saturation/lightness adjusted
- Contrast checker validation documented in test artifacts

**Story Points**: 2 SP

**Dependencies**: None

**Affected Files**:
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/tailwind.config.ts` (add link color variant)
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/app/globals.css` (update prose link styles)
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/content/MarkdownRenderer.tsx` (update link class)
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/footer/Footer.tsx` (update hover states if using secondary)
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/content/MarkdownRenderer.spec.tsx` (test link rendering)

**Test Strategy**:
- Contrast validation: Use WebAIM contrast checker, document ratios
- Visual test: Links visible in light/dark sections
- Accessibility: Focus indicators visible and meet WCAG 2.4.7
- Integration: Links render with correct color in all templates
- User testing: Stakeholder validates readability

**Non-Goals**:
- Changing non-link text colors
- Updating button colors (separate from links)
- Adding underlines to all links (use underline on hover only)

**Color Analysis**:
- Current: `#2F4F3D` (secondary) on `#F5F0E8` (cream) = 7.2:1 contrast (passes AA, but hard to see)
- Target: `#5A9A01` (user requested bright green) on white = 3.47:1 contrast (FAILS WCAG AA)
- **Calculated: `#4d8401` on white = 4.55:1 contrast (PASSES WCAG AA)**
- Color distance from target: 25.55 (RGB space, very close to requested color)

**Decision**: USER APPROVED - Use `#4d8401` (closest WCAG-compliant green to #5A9A01)

**Acceptance Criteria** (updated):
- New link color: `link` variant = `#4d8401` added to Tailwind config
- Hover state: Lighten by 10% to `#5d9b01` (calculated)
- Focus state: 2px outline with same color
- Visited links: Darken by 10% to `#3d6b01` (accessibility best practice)

**Pros**:
- Closest possible match to user's requested color (#5A9A01)
- Meets WCAG AA standards (4.55:1 contrast)
- Bright, highly visible green
- Maintains color theory (yellow-green hue preserved)

**Cons**:
- Requires adding new color to Tailwind config (not using existing palette)
- May be very bright compared to existing site aesthetics (requires visual QA)

**Chosen Approach**: Add custom `link` color (`#4d8401`) to Tailwind config and apply globally. This is the scientifically calculated closest WCAG-compliant color to the user's target.

---

## Navigation Track (8 SP)

### REQ-NAV-001: Fix Work at Camp Navigation

**Description**: Fix 404 errors for `/work-at-camp/summer-staff` and `/work-at-camp/year-round` routes. Pages exist as `summer-staff.mdoc` and `work-at-camp-year-round.mdoc` but are not accessible via navigation dropdown.

**Current State**:
- Navigation config (`components/navigation/config.ts`) has:
  - `/work-at-camp-counselors` (exists)
  - `/work-at-camp-kitchen-staff` (exists)
- Files exist:
  - `content/pages/summer-staff.mdoc` (slug: `summer-staff`)
  - `content/pages/work-at-camp-year-round.mdoc` (slug: `work-at-camp-year-round`)
- User expects:
  - `/work-at-camp/summer-staff` → should route to `summer-staff.mdoc`
  - `/work-at-camp/year-round` → should route to `work-at-camp-year-round.mdoc`

**Root Cause**: Next.js uses flat slug routing (`/[slug]`), not nested routes. Navigation expects nested paths but content uses flat slugs.

**Solution Options**:
1. **Option A**: Update navigation config to point to actual flat slugs (`/summer-staff`, `/work-at-camp-year-round`)
2. **Option B**: Rename mdoc files to match nested structure (requires slug rewrite)
3. **Option C**: Create Next.js nested route structure (`app/work-at-camp/[slug]/page.tsx`)

**Chosen Approach**: Option A - Update navigation config. Simplest solution that doesn't require file renaming or routing architecture changes.

**Acceptance Criteria**:
- Navigation dropdown "Work at Camp" includes:
  - "Summer Staff" → `/summer-staff`
  - "Year-Round Staff" → `/work-at-camp-year-round`
  - "Counselors" → `/work-at-camp-counselors`
  - "Kitchen Staff" → `/work-at-camp-kitchen-staff`
- All four links resolve to 200 status (not 404)
- Navigation integration test updated with new paths
- Dropdown renders all four items correctly
- Active state highlights correct menu item

**Story Points**: 1 SP

**Dependencies**: None

**Affected Files**:
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/navigation/config.ts` (update children array)
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/tests/integration/navigation-links.spec.ts` (update test assertions)

**Test Strategy**:
- Integration test: All navigation links return 200 status
- E2E test: Click each dropdown item, verify correct page loads
- Accessibility: Keyboard navigation through dropdown works

**Non-Goals**:
- Changing URL structure beyond navigation config
- Adding new staff pages

---

### REQ-NAV-002: Fix Summer Camp Navigation

**Description**: Fix 404 errors for `/summer-camp/what-to-bring` and `/summer-camp/faq` routes.

**Current State**:
- Files exist:
  - `content/pages/summer-camp-what-to-bring.mdoc` (slug: `summer-camp-what-to-bring`)
  - `content/pages/summer-camp-faq.mdoc` (slug: `summer-camp-faq`)
- Navigation has: Junior High, Senior High (but no What to Bring or FAQ)

**Acceptance Criteria**:
- Navigation dropdown "Summer Camp" includes:
  - "Junior High" → `/summer-camp-junior-high`
  - "Senior High" → `/summer-camp-senior-high`
  - "What to Bring" → `/summer-camp-what-to-bring`
  - "FAQ" → `/summer-camp-faq`
- All four links resolve to 200 status
- Dropdown ordering: programs first (JH, SH), then info (What to Bring, FAQ)
- Navigation integration test updated

**Story Points**: 1 SP

**Dependencies**: None

**Affected Files**:
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/navigation/config.ts` (add children)
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/tests/integration/navigation-links.spec.ts` (update test)

**Test Strategy**:
- Integration test: All navigation links return 200 status
- E2E test: Dropdown renders four items in correct order
- Visual test: Dropdown height adjusts properly

**Non-Goals**:
- Creating new content for these pages (already exist)
- Changing existing Junior High/Senior High links

---

### REQ-NAV-003: Fix Retreats Navigation

**Description**: Fix 404 error for `/retreats/rentals` and add navigation link.

**Current State**:
- File exists: `content/pages/retreats-rentals.mdoc` (slug: `retreats-rentals`)
- Navigation has: Adult Retreats, Youth Groups (no Rentals)

**Acceptance Criteria**:
- Navigation dropdown "Retreats" includes:
  - "Adult Retreats" → `/retreats-adult-retreats`
  - "Youth Groups" → `/retreats-youth-groups`
  - "Rentals" → `/retreats-rentals`
- All three links resolve to 200 status
- Navigation integration test updated

**Story Points**: 0.5 SP

**Dependencies**: None

**Affected Files**:
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/navigation/config.ts` (add child)
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/tests/integration/navigation-links.spec.ts` (update test)

**Test Strategy**:
- Integration test: `/retreats-rentals` returns 200
- E2E test: Dropdown renders three items

**Non-Goals**:
- Creating rentals content (already exists)

---

### REQ-NAV-004: Fix Facilities Navigation

**Description**: Fix 404 error for `/facilities/outdoor` route.

**Current State**:
- File exists: `content/pages/facilities-outdoor.mdoc` (slug: `facilities-outdoor`)
- Navigation has: Cabins, Chapel, Dining Hall, Rec Center (no Outdoor)

**Acceptance Criteria**:
- Navigation dropdown "Facilities" includes:
  - "Cabins" → `/facilities-cabins`
  - "Chapel" → `/facilities-chapel`
  - "Dining Hall" → `/facilities-dining-hall`
  - "Rec Center" → `/facilities-rec-center`
  - "Outdoor Spaces" → `/facilities-outdoor`
- All five links resolve to 200 status
- Dropdown ordering: indoor first (Cabins, Chapel, Dining, Rec), outdoor last
- Navigation integration test updated

**Story Points**: 0.5 SP

**Dependencies**: None

**Affected Files**:
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/navigation/config.ts` (add child)
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/tests/integration/navigation-links.spec.ts` (update test)

**Test Strategy**:
- Integration test: `/facilities-outdoor` returns 200
- E2E test: Dropdown renders five items in correct order

**Non-Goals**:
- Creating outdoor facilities content (already exists)

---

### REQ-NAV-005: Create Staff Page with Bio Information

**Description**: Create new `/staff` page with permanent staff bios and photos, and add to About navigation dropdown.

**Decision**: USER APPROVED - Option A (Create new staff page with bios)

**Current State**:
- Navigation has: Contact (only child of About)
- No `staff.mdoc` file exists
- Staff data available from WordPress export (6 full-time staff)

**Staff Roster** (from bearlakecamp.com):
1. **Monty Harlan** - Executive Director (since 1992)
2. **Ben Harlan** - Director of Camping Ministry
3. **Jared Yorke** - Facilities Manager
4. **Karli Harlan** - Food Service Director/Guest Group Coordinator
5. **John Scheiber** - Communications Manager
6. **Kyle Campbell** - Program Intern

**Acceptance Criteria**:
- Create `content/pages/staff.mdoc` with staff bios in card layout
- Each staff member has: Photo (placeholder if not available), Name, Title, Bio paragraph, Education/Background bullet list
- Staff cards use InfoCard or ContentCard component in 2-col grid (mobile 1-col)
- Navigation dropdown "About" includes:
  - "Our Team" → `/staff`
  - "Contact" → `/contact`
- Link resolves to 200 status
- Navigation integration test updated
- Page uses standard or custom staff template
- Hero image: Team photo or camp leadership image

**Story Points**: 3 SP

**Dependencies**: REQ-DESIGN-001 (card components)

**Affected Files**:
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/content/pages/staff.mdoc` (new)
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/navigation/config.ts` (add staff link)
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/tests/integration/navigation-links.spec.ts` (add staff test)
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/public/images/staff/` (staff photos directory)

**Test Strategy**:
- Integration test: `/staff` returns 200 status
- Content: All 6 staff members rendered with complete bios
- Responsive: Staff cards display correctly at all breakpoints
- Navigation: "Our Team" link in About dropdown functional

**Staff Content Structure**:
```markdown
# Our Team

{% section %}
  {% contentCard icon="Users" title="Monty Harlan" subtitle="Executive Director" %}
    Director since 1992, first full-time employee...
    - B.A. from Taylor University
    - M.Div. from Winebrenner Theological Seminary
  {% /contentCard %}
{% /section %}
```

**Non-Goals**:
- Adding contact forms per staff member
- Email/phone links (use general contact info)
- Staff scheduling or calendar integration

---

### REQ-NAV-006: Navigation Integration Test Suite

**Description**: Comprehensive integration test to validate all navigation links across the site return 200 status and resolve to correct pages.

**Acceptance Criteria**:
- Test file: `tests/integration/navigation-links.spec.ts` (already exists, needs updates)
- All navigation dropdown links tested (Summer Camp, Work at Camp, Retreats, Facilities, About)
- Primary CTA link tested (Register Now)
- Logo link tested (homepage)
- Footer social media and contact links tested
- Test fails on any 404 response
- Test validates correct page title/heading loads
- CI/CD integration: Test runs on every commit

**Story Points**: 1 SP

**Dependencies**: REQ-NAV-001 through REQ-NAV-005

**Affected Files**:
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/tests/integration/navigation-links.spec.ts` (expand test coverage)

**Test Strategy**:
- Integration test: Playwright or Vitest fetches all navigation URLs
- Assertion: Response status = 200
- Assertion: Page contains expected h1 or title
- CI: Test runs in GitHub Actions / Vercel preview builds

**Non-Goals**:
- Testing external links (UltraCamp, social media) - only validate href exists
- Testing authenticated routes (if any)

---

### REQ-NAV-007: Navigation Accessibility Audit

**Description**: Ensure all navigation dropdowns meet WCAG AA standards for keyboard navigation, focus indicators, and ARIA attributes.

**Acceptance Criteria**:
- Keyboard navigation: Tab through all menu items, dropdowns open/close with Enter/Escape
- Focus indicators: Visible focus ring on all interactive elements (min 2px, contrast ratio 3:1)
- ARIA attributes: `aria-expanded`, `aria-haspopup`, `aria-label` on all dropdowns
- Screen reader: Announces menu structure and current location
- Mobile: Touch targets minimum 44x44px (WCAG 2.5.5)
- Automated test: axe-core or similar accessibility testing tool
- Manual test: Navigate site with keyboard only, document findings

**Story Points**: 2 SP

**Dependencies**: REQ-NAV-001 through REQ-NAV-005 (navigation structure finalized)

**Affected Files**:
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/navigation/DropdownMenu.tsx` (add ARIA if missing)
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/navigation/MobileNav.tsx` (mobile touch targets)
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/tests/integration/phase2/accessibility.spec.ts` (expand test)

**Test Strategy**:
- Automated: Playwright with axe-core scans all pages
- Manual: Keyboard-only navigation test (document in test artifacts)
- Screen reader: VoiceOver (macOS) or NVDA (Windows) test navigation
- Regression: Run accessibility tests on every navigation change

**Non-Goals**:
- Full WCAG AAA compliance (target AA only)
- Fixing non-navigation accessibility issues (separate REQs)

---

## Content Enhancement Track (8 SP)

### REQ-CONTENT-004: Retreats Page Card Layout

**Description**: Add card components to `/retreats` page to improve visual structure. Convert sections (Available Year-Round, What We Provide, Perfect For) into InfoCard components.

**Current State**:
- Page uses standard markdown with headings and bullet lists
- No visual separation between sections
- Content exists but lacks modern card-based design

**Acceptance Criteria**:
- "What We Provide" section: 3 InfoCards (Facilities, Support, Activities)
- "Perfect For" section: 6 ContentCards in 2-col grid (mobile 1-col)
- Each card has icon from Lucide (Building, Users, Activity, Church, Briefcase, Heart, GraduationCap, Trophy)
- Cards use theme colors: cream background, secondary border, hover shadow
- Content extracted from existing bullets, no content changes
- Page maintains hero image and overall structure
- Responsive: Cards stack on mobile, grid on desktop

**Story Points**: 2 SP

**Dependencies**: REQ-DESIGN-001 (ContentCard component)

**Affected Files**:
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/content/pages/retreats.mdoc` (convert to cards)
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/markdoc/MarkdocComponents.tsx` (register ContentCard if new)

**Test Strategy**:
- Visual regression: Compare before/after screenshots
- Responsive: Test card grid at mobile/tablet/desktop
- Integration: Page renders without errors
- Content: Verify no text lost in conversion

**Non-Goals**:
- Adding new content
- Changing page structure beyond cards
- Modifying hero section

---

### REQ-CONTENT-005: Facilities Chapel Page Card Layout

**Description**: Add card components to `/facilities-chapel` page. Convert "Features" and "Daily Use" sections into cards.

**Current State**:
- Page is a facility template with gallery
- Content uses markdown bullets under headings
- No visual separation

**Acceptance Criteria**:
- "Features" section: 5 InfoCards (Natural Beauty, Excellent Acoustics, Flexible Seating, Climate Controlled, Audio/Visual)
- Icons: Eye, Volume2, Users, Thermometer, Monitor (Lucide)
- "Daily Use" section: 4 ContentCards (Morning worship, Small groups, Personal prayer, Evening services, Staff devotions)
- Icons: Sun, BookOpen, Heart, Moon
- "Retreat Groups" section: 4 ContentCards (Worship space, Teaching, Prayer area, Flexible config)
- Icons: Music, PresentationChart, Sparkles, Settings
- Cards responsive: 2-col tablet, 3-col desktop
- Facility template updated to support cards if needed

**Story Points**: 2 SP

**Dependencies**: REQ-DESIGN-001 (card components)

**Affected Files**:
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/content/pages/facilities-chapel.mdoc` (convert to cards)
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/templates/FacilityTemplate.tsx` (may need card support)

**Test Strategy**:
- Visual regression: Before/after comparison
- Responsive: Test at all breakpoints
- Gallery: Ensure gallery still displays correctly
- Integration: Facility template renders cards

**Non-Goals**:
- Changing facility template structure significantly
- Modifying gallery layout

---

### REQ-CONTENT-006: About Page Card Layout and Brace Removal

**Description**: Fix braces "{}" appearing in headings on `/about` page and add card layout for sections.

**Current State**:
- Page shows "{}" in some headings (likely Markdoc template syntax error)
- Content uses markdown bullets
- No visual separation

**Acceptance Criteria**:
- All "{}" artifacts removed from headings and content
- "Our Values" section: 4 InfoCards (Christ-Centered, Community, Creation, Character)
- Icons: Cross, Users, Leaf, Award (Lucide)
- Each card has value title, description (from bullets)
- "Accreditation and Safety" section: ContentCard with check icon
- Cards responsive: 2-col mobile, 4-col desktop (for values)
- Page maintains hero image and mission statement
- No Markdoc syntax errors

**Story Points**: 2 SP

**Dependencies**: REQ-DESIGN-001 (card components)

**Affected Files**:
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/content/pages/about.mdoc` (fix braces, convert to cards)
- Potentially template file if braces caused by template bug

**Test Strategy**:
- Visual inspection: No "{}" visible on page
- Content validation: All text renders correctly
- Responsive: Cards display properly at all breakpoints
- Markdoc: No template syntax errors in logs

**Root Cause Analysis**: Braces likely caused by:
1. Markdoc variable syntax not evaluated: `{%variable%}` or `{{variable}}`
2. Template conditionals with empty values
3. Keystatic schema issue

**Non-Goals**:
- Major content rewrite
- Changing About page structure beyond cards

---

### REQ-CONTENT-007: Give Page Button Styling

**Description**: Convert "Donate Now" text links to prominent button components on `/give` page.

**Current State**:
- Page has text content about giving
- Likely has inline links to donation form
- No prominent CTA buttons

**Acceptance Criteria**:
- Primary CTA button at top: "Donate Now" (large, prominent)
- Button styling: `bg-accent hover:bg-accent-light text-cream font-semibold px-8 py-4 rounded-lg text-xl`
- Button links to: `https://www.ultracamp.com/donation.aspx?idCamp=268&campCode=blc`
- Secondary buttons for specific giving types (One-Time, Monthly, Memorial, Planned)
- Each button has icon: Heart, Calendar, Flower, Gift (Lucide)
- Buttons in 2x2 grid on desktop, stacked on mobile
- Buttons accessible: aria-label, focus indicators, min 44x44px touch target
- External link attributes: `target="_blank" rel="noopener noreferrer"`
- "Your Impact" section: 5 ContentCards with dollar amounts
- Icons: DollarSign (all cards, different sizes/colors)

**Decision**: USER APPROVED - Proceed with button design as specified

**Story Points**: 2 SP

**Dependencies**: REQ-DESIGN-001 (card components for impact section)

**Affected Files**:
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/content/pages/give.mdoc` (add buttons and cards)
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/content/DonateButton.tsx` (new reusable button component)
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/content/DonateButton.spec.tsx` (new test)
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/markdoc/MarkdocComponents.tsx` (register DonateButton)

**Test Strategy**:
- Visual: Buttons prominent and styled correctly
- Click test: Links navigate to correct donation page (external)
- Accessibility: Focus indicators visible, keyboard navigable
- Responsive: Button grid collapses on mobile
- Integration: Markdoc renders button component

**Non-Goals**:
- Integrating payment gateway (external UltraCamp form)
- Adding donation tracking/analytics beyond basic link clicks

---

### REQ-CONTENT-008: Contact Page Social Media Links

**Description**: Update `/contact` page to include correct social media links from Footer (REQ-UI-003). Replace placeholder links with actual URLs.

**Current State**:
- Page has "Stay Connected" section with placeholder social media links
- Footer already has correct links (Facebook, Instagram, YouTube, Spotify, Donate)
- Contact info may have placeholders (address, phone, email)

**Acceptance Criteria**:
- Social media links match Footer:
  - Facebook: `https://www.facebook.com/blc.bear.lake.camp/`
  - Instagram: `https://www.instagram.com/bearlakecamp/`
  - YouTube: `https://www.youtube.com/channel/UCiw_MKtM5hN83IghEjydmGw?view_as=subscriber`
  - Spotify: `https://open.spotify.com/playlist/1Dw4cfs5pj7p95uy2f3b0k?si=eZ6NDfybSsGG14DjJ-wXKA`
- Contact info updated:
  - Address: "1805 S 16th St, Albion, IN 46701" (with Google Maps link)
  - Email: "info@bearlakecamp.com" (mailto link)
  - Phone: "(260) 799 5988" (tel link)
- Social media section uses InfoCards or ContentCards with icons
- Icons: Facebook, Instagram, Youtube, Music (Lucide)
- All external links open in new tab with `rel="noopener noreferrer"`
- Contact info section uses icons: MapPin, Mail, Phone (Lucide)
- Remove placeholder text (e.g., "[Address Line 1]", "(XXX) XXX-XXXX")

**Story Points**: 1 SP

**Dependencies**: None (Footer already exists with correct links)

**Affected Files**:
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/content/pages/contact.mdoc` (update links and content)

**Test Strategy**:
- Link validation: All social media links navigate to correct pages
- Contact links: mailto and tel links functional on mobile
- Visual: Icons display correctly
- Content: No placeholder text visible
- Integration: Page renders without errors

**Non-Goals**:
- Adding contact form (if not already present)
- Changing page layout beyond updating links

---

## Cross-Cutting Concerns (2 SP)

### REQ-DEPLOY-002: Pre-Deployment Validation Suite

**Description**: Comprehensive validation before deploying to production, including build checks, image verification, navigation testing, and page status reporting.

**Acceptance Criteria**:
- All pre-deployment gates pass:
  - `npm run typecheck` (0 errors)
  - `npm run lint` (0 errors)
  - `npm run test` (100% pass rate)
  - `npm run verify-images` (all hero images and gallery images exist)
- Navigation integration test passes (all links 200 status)
- Visual regression test suite passes (Playwright screenshots)
- Accessibility audit passes (axe-core, 0 critical violations)
- Build succeeds locally and in Vercel preview
- Post-deployment smoke test:
  - Homepage loads
  - All navigation dropdowns render
  - Footer displays correctly
  - No console errors
- Page status report generated (see REQ-DEPLOY-003)

**Story Points**: 1 SP

**Dependencies**: All REQs in this phase

**Affected Files**:
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/.github/workflows/deploy-checks.yml` (new CI workflow)
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/scripts/pre-deploy-checks.sh` (new validation script)
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/docs/operations/DEPLOYMENT-CHECKLIST.md` (new checklist)

**Test Strategy**:
- CI/CD: All checks run automatically on pull request
- Local: Developer runs `npm run pre-deploy` before committing
- Smoke test: Automated Playwright test on Vercel preview URL
- Rollback plan: Document previous commit hash

**Non-Goals**:
- Full E2E test suite (smoke test only)
- Performance benchmarking (separate REQ if needed)

---

### REQ-DEPLOY-003: Final Page Status Report

**Description**: Generate comprehensive report of all pages, their status (live, 404, draft), navigation paths, and validation results.

**Acceptance Criteria**:
- Report generated as markdown file: `docs/operations/page-status-report.md`
- Report includes:
  - Page inventory: All .mdoc files with slugs and titles
  - Navigation mapping: Which nav items link to which pages
  - Status codes: 200 (live), 404 (missing route), 301 (redirect)
  - Hero image status: exists/missing for each page
  - Template type: standard/program/facility/staff
  - Last updated: Git commit date for each .mdoc file
  - Issues found: Missing cards, braces, placeholder text, broken images
- Report generated automatically on deploy
- Report committed to repo for historical tracking
- Summary statistics: X pages live, Y 404s fixed, Z cards added

**Story Points**: 1 SP

**Dependencies**: All REQs in this phase

**Affected Files**:
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/scripts/generate-page-report.ts` (new script)
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/docs/operations/page-status-report.md` (generated output)
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/package.json` (add `page-report` script)

**Test Strategy**:
- Script execution: Runs without errors
- Report accuracy: Manual spot-check against actual pages
- Automation: Script runs in post-build hook

**Non-Goals**:
- Real-time monitoring (static report only)
- External link checking (internal pages only)

---

## Additional Implemented Requirements

### REQ-STAFF-001: Rounded Staff Images

**Description**: Staff photos rendered in a grid with rounded styling for consistent visual presentation.

**Acceptance Criteria**:
- `staff-photo-grid` CSS class applies grid layout with rounded images
- Images inside `.staff-photo-grid` are uniformly sized with `object-cover`
- Grid responsive: 2-col mobile, 4-col desktop
- Alt text preserved on all images

**Story Points**: 0.5 SP
**Status**: IMPLEMENTED (in `app/globals.css`, `MarkdownRenderer.tsx`)

---

### REQ-P0-2: Error Telemetry and Monitoring

**Description**: Health check endpoint for Keystatic integration with error tracking, navigation validation, and performance monitoring.

**Acceptance Criteria**:
- GET `/api/health/keystatic` returns structured health status
- Response includes: status, timestamp, navigation health, keystatic reader status, error metrics, performance data
- Status values: healthy, degraded, unhealthy based on error rate and navigation validity
- Sensitive error details sanitized (no stack traces or internal paths exposed)
- Cache-control: no-cache headers set
- Error rate threshold: >1 error/second triggers unhealthy status

**Story Points**: 3 SP
**Status**: IMPLEMENTED (in `app/api/health/keystatic/route.ts`, `lib/telemetry/error-reporter.ts`)

---

### REQ-INFOCARD-001: InfoCard Integration in Markdown

**Description**: InfoCard component renders from markdown using `info-card-grid` class with optional icon syntax.

**Acceptance Criteria**:
- `{icon="Heart"}` or `{icon=Heart}` syntax in headings renders corresponding icon
- Multiple cards rendered in responsive grid
- Cards without icons render correctly
- Grid classes applied to container
- Does not interfere with regular divs

**Story Points**: 1 SP
**Status**: IMPLEMENTED (in `MarkdownRenderer.tsx`)

---

## Summary

### Story Point Breakdown by Track

**Design System Track**:
- REQ-DESIGN-001: Modern Card-Based Layout System (3 SP)
- REQ-DESIGN-002: Accessible Link Color System (2 SP)
- **Subtotal**: 5 SP

**Navigation Track**:
- REQ-NAV-001: Fix Work at Camp Navigation (1 SP)
- REQ-NAV-002: Fix Summer Camp Navigation (1 SP)
- REQ-NAV-003: Fix Retreats Navigation (0.5 SP)
- REQ-NAV-004: Fix Facilities Navigation (0.5 SP)
- REQ-NAV-005: Create Staff Page with Bio Information (3 SP)
- REQ-NAV-006: Navigation Integration Test Suite (1 SP)
- REQ-NAV-007: Navigation Accessibility Audit (2 SP)
- **Subtotal**: 10 SP

**Content Enhancement Track**:
- REQ-CONTENT-004: Retreats Page Card Layout (2 SP)
- REQ-CONTENT-005: Facilities Chapel Page Card Layout (2 SP)
- REQ-CONTENT-006: About Page Card Layout and Brace Removal (2 SP)
- REQ-CONTENT-007: Give Page Button Styling (2 SP)
- REQ-CONTENT-008: Contact Page Social Media Links (1 SP)
- **Subtotal**: 9 SP

**Cross-Cutting Concerns**:
- REQ-DEPLOY-002: Pre-Deployment Validation Suite (1 SP)
- REQ-DEPLOY-003: Final Page Status Report (1 SP)
- **Subtotal**: 2 SP

**Total Story Points**: 26 SP

---

### Parallel Execution Strategy

**Agent 1 (Design Systems Engineer)**: REQ-DESIGN-001, REQ-DESIGN-002
- Focus: Card components, global styles, link colors
- Duration: ~2 days
- Blocking: None (foundational work)

**Agent 2 (Navigation Engineer)**: REQ-NAV-001 through REQ-NAV-007
- Focus: Navigation config, routing, integration tests, accessibility
- Duration: ~2 days
- Blocking: None (independent of design system)

**Agent 3 (Content Engineer)**: REQ-CONTENT-004 through REQ-CONTENT-008
- Focus: Page content updates, card conversion, button styling
- Duration: ~2 days
- Dependency: REQ-DESIGN-001 (card components) must complete first
- Execution: Start with CONTENT-008 (no dependency), then others after DESIGN-001

**Agent 4 (DevOps Engineer)**: REQ-DEPLOY-002, REQ-DEPLOY-003
- Focus: CI/CD, validation scripts, reporting
- Duration: ~1 day
- Dependency: All other REQs (runs last)

### Execution Phases

**Phase 1 (Parallel)**: Design System + Navigation + Contact Links
- Agent 1: REQ-DESIGN-001, REQ-DESIGN-002 (5 SP)
- Agent 2: REQ-NAV-001 through REQ-NAV-006 (5 SP)
- Agent 3: REQ-CONTENT-008 (1 SP, no dependencies)

**Phase 2 (Parallel)**: Content Enhancement + Accessibility
- Agent 2: REQ-NAV-007 (2 SP, continues from Phase 1)
- Agent 3: REQ-CONTENT-004 through REQ-CONTENT-007 (8 SP, depends on DESIGN-001)

**Phase 3 (Sequential)**: Deployment Validation
- Agent 4: REQ-DEPLOY-002, REQ-DEPLOY-003 (2 SP, depends on all)

### Dependencies Graph

```
DESIGN-001 (cards) ──┬──> CONTENT-004 (retreats cards)
                     ├──> CONTENT-005 (chapel cards)
                     ├──> CONTENT-006 (about cards)
                     └──> CONTENT-007 (give buttons/cards)

DESIGN-002 (links) ──> (no blockers)

NAV-001 through NAV-006 ──> NAV-007 (accessibility)

All REQs ──> DEPLOY-002 ──> DEPLOY-003
```

---

## Test Execution Order (TDD)

1. **QCODET**: Write failing tests for all REQs
   - Card component tests (DESIGN-001)
   - Link color contrast tests (DESIGN-002)
   - Navigation integration tests (NAV-001 through NAV-007)
   - Content rendering tests (CONTENT-004 through CONTENT-008)
   - Deployment validation tests (DEPLOY-002, DEPLOY-003)

2. **QCHECKT**: Review test quality (test-writer + PE-Reviewer)
   - Verify test coverage (components, integration, accessibility)
   - Validate test isolation (no interdependencies)
   - Check test data quality

3. **QCODE**: Implement to pass tests (SDE-III + implementation-coordinator)
   - Execute in parallel per agent assignments
   - Run tests continuously during development
   - Fix any test failures immediately

4. **QCHECK**: Code review (PE-Reviewer + code-quality-auditor)
   - Skeptical review of all implementations
   - Verify adherence to TDD (tests first, implementation second)
   - Check for edge cases and error handling

5. **QDOC**: Update documentation (docs-writer)
   - Document new card components in component library
   - Update navigation structure in site documentation
   - Generate page status report (DEPLOY-003)

6. **QGIT**: Commit & deploy (release-manager)
   - Stage changes by REQ-ID
   - Conventional commit messages: `fix(nav): resolve 404s for work-at-camp routes (REQ-NAV-001, 1 SP)`
   - Run pre-deployment gates (DEPLOY-002)
   - Deploy to Vercel
   - Validate deployment with smoke tests
   - Generate and commit page status report

---

## Risk Assessment

**High Risk**:
- REQ-DESIGN-001: Card system affects all pages, potential for layout breakage
- REQ-NAV-007: Accessibility audit may reveal systemic issues requiring refactoring
- REQ-CONTENT-006: Brace removal root cause unknown, may indicate template bug

**Medium Risk**:
- REQ-DESIGN-002: Link color change requires stakeholder visual approval
- REQ-NAV-001 through NAV-004: Navigation changes could break existing links
- REQ-CONTENT-007: Donate button styling may not match brand guidelines

**Low Risk**:
- REQ-CONTENT-008: Simple content update
- REQ-DEPLOY-002: Validation suite (low risk of breaking existing functionality)
- REQ-DEPLOY-003: Reporting only (no functional changes)

### Mitigation Strategies

1. **Card System (DESIGN-001)**:
   - Implement cards incrementally (one component at a time)
   - Visual regression tests before/after
   - Feature flag: Use environment variable to toggle card system (easy rollback)

2. **Navigation (NAV-001 through NAV-006)**:
   - Update integration tests before changing navigation config
   - Test in Vercel preview before production deploy
   - Document old URLs for redirect setup if needed

3. **Brace Issue (CONTENT-006)**:
   - Investigate Markdoc/Keystatic logs before making changes
   - Test fix in isolated environment
   - Document root cause for future reference

4. **Accessibility (NAV-007)**:
   - Run automated scans early to identify issues
   - Budget extra time for fixes if needed
   - Separate P0 (blocking) from P1 (nice-to-have) issues

---

## Rollback Plan

**Per-REQ Rollback**:
- Each REQ in separate Git commit for granular rollback
- Tag commits: `phase4-DESIGN-001`, `phase4-NAV-001`, etc.
- Revert command: `git revert <commit-hash>`

**Full Phase Rollback**:
- Tag before starting Phase 4: `git tag before-phase4`
- Rollback command: `git reset --hard before-phase4 && git push -f`

**Vercel Rollback**:
- Use Vercel dashboard to redeploy previous successful build
- Automatic rollback trigger: If smoke test fails post-deploy

---

## Decision Points (RESOLVED)

### DECISION-001: About Staff Page (REQ-NAV-005) ✓ RESOLVED
**Question**: What should "About" → "Staff" link to?
**User Decision**: Create new `/staff` page with permanent staff bios (Option A)
**Implementation**: Create `staff.mdoc` with 6 full-time staff members (Monty Harlan, Ben Harlan, Jared Yorke, Karli Harlan, John Scheiber, Kyle Campbell)
**Story Points**: 3 SP

### DECISION-002: Link Color (REQ-DESIGN-002) ✓ RESOLVED
**Question**: Use WCAG-compliant green as close to #5A9A01 as possible
**User Decision**: Approved - Use `#4d8401` (4.55:1 contrast ratio on white)
**Implementation**: Add custom `link` color to Tailwind config with hover/focus/visited states
**Calculation**: Closest WCAG AA-compliant color to target #5A9A01 (distance: 25.55 RGB units)

### DECISION-003: Give Page Buttons (REQ-CONTENT-007) ✓ RESOLVED
**Question**: Approve button styling and placement?
**User Decision**: Approved - Proceed with specified button design
**Implementation**: Primary CTA + grid of giving type buttons as planned

---

## Acceptance Criteria for Full Phase

**Phase 4 is complete when**:
1. All navigation dropdown links return 200 status (no 404s)
2. All identified pages have card-based layouts (Retreats, Chapel, About, Give, Contact)
3. Link colors meet WCAG AA contrast standards and are visually approved
4. Navigation accessibility audit passes with 0 critical issues
5. Pre-deployment validation suite passes (typecheck, lint, test, images)
6. Page status report generated and shows 0 unresolved issues
7. All tests green (unit, integration, accessibility)
8. Deployed to production and smoke test passes
9. User validates visual appearance on production site

---

## Next Steps

1. **User Review**: Approve requirements and make decisions on DECISION-001, DECISION-002, DECISION-003
2. **Lock Requirements**: Create `requirements/requirements.lock.md` snapshot
3. **Execute QCODET**: test-writer creates failing tests for all REQs
4. **Execute QCHECKT**: PE-Reviewer validates test quality
5. **Execute QCODE**: Implement in parallel per agent assignments (Phase 1 → Phase 2 → Phase 3)
6. **Execute QCHECK**: PE-Reviewer + code-quality-auditor skeptical review
7. **Execute QDOC**: docs-writer updates documentation
8. **Execute QGIT**: release-manager commits, deploys, validates

---

**Planning Poker Baseline**: 1 SP = simple authenticated API (key→value, secured, tested, deployed, documented)

**Estimation Notes**:
- Card components (DESIGN-001): 3 SP = Complex component with multiple variants, Markdoc integration, responsive layout
- Link colors (DESIGN-002): 2 SP = Global style change affecting multiple components, requires visual QA
- Navigation fixes (NAV-001-006): 0.5-1 SP each = Config changes with testing (simple)
- Accessibility audit (NAV-007): 2 SP = Manual testing + automated tooling + potential fixes
- Content updates (CONTENT-004-008): 1-2 SP each = Convert content to cards, update links
- Deployment (DEPLOY-002-003): 1 SP each = Scripting and validation automation

**Total: 26 SP**
