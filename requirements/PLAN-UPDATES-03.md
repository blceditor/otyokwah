# PLAN-UPDATES-03: Summer Camp Sessions Page Fixes

## Overview
Fix remaining styling and functionality issues on the summer-camp-sessions page identified in Updates-03.md.

## Requirements

### REQ-U03-001: Section Header Styling (MUST)
**Current**: Headers using TexturedHeading, may not be white 3rem
**Required**:
- Font size: 3rem (48px)
- Line height: 1
- Color: white
- Left-aligned (not centered)
**Acceptance**:
- Headers render at 3rem/48px
- Headers are white color
- Headers are left-aligned
**Files**: `GridSquare.tsx`, `summer-camp-sessions.mdoc`

### REQ-U03-002: Alternating Row Layout (MUST)
**Current**: All rows may have same image/content order
**Required**:
- Row 1: image LEFT | session details RIGHT
- Row 2: session details LEFT | image RIGHT
- Row 3: image LEFT | session details RIGHT
- Row 4: session details LEFT | image RIGHT
**Acceptance**: Grid squares alternate order on desktop
**Files**: `summer-camp-sessions.mdoc`

### REQ-U03-003: Sub-Nav Non-Sticky (MUST)
**Current**: Sub-nav freezes at top of page (sticky)
**Required**: Sub-nav scrolls with page, does NOT stick
**Acceptance**: Navigation scrolls up with page content
**Files**: Create new `SessionNav` component or update `CampSessionsPage.tsx`

### REQ-U03-004: Admin Strip (NEW FEATURE - SHOULD)
**Current**: No admin nav
**Required**: When logged into GitHub for CMS:
- Black background, white text
- Same font as BLC nav
- Links: CMS (keystatic), deployment status, report bug (with current URL), edit page (opens in keystatic)
**Acceptance**: Logged-in users see admin strip at top
**Files**: New `AdminStrip.tsx` component, layout updates

### REQ-U03-005: Button Text Color Matching (MUST)
**Current**: Button text may not match section color
**Required**: Button text colors match section backgrounds:
- Primary Overnight (sky-600): text-sky-600
- Junior Camp (amber-600): text-amber-600
- Jr. High Camp (emerald-700): text-emerald-700
- Sr. High Camp (purple-700): text-purple-700
**Acceptance**: Each button text matches its section's background
**Files**: `CTAButton.tsx`, `summer-camp-sessions.mdoc`

### REQ-U03-006: Description Below Session Cards (MUST)
**Current**: Description appears before session cards
**Required**: Description text appears AFTER session cards list
**Acceptance**: Order is: Header → Age Group → Session Cards → Description → Button
**Files**: `summer-camp-sessions.mdoc`, `GridSquare.tsx` prose ordering

### REQ-U03-007: Session Card Styling (MUST)
**Current**: bg-white/10 rounded-lg
**Required**:
- Lighter translucent background matching section color
- Rounded corners
- Session title in dark bark color (not white)
- Left-aligned title
**Acceptance**: Cards match reference images
**Files**: `InlineSessionCard.tsx`

### REQ-U03-008: Delete Obsolete Pages (MUST)
**Required**: Remove completely:
- `/summer-camp-junior-high` page
- `/summer-camp-senior-high` page
- All references in tests, navigation, sitemaps
**Acceptance**: Pages return 404, no test references
**Files**:
- Delete `content/pages/summer-camp-junior-high.mdoc`
- Delete `content/pages/summer-camp-senior-high.mdoc`
- Update smoke tests, navigation, sitemap

## Implementation Plan

### Phase 1: TDD Test Setup (QCODET)
1. Write failing Playwright tests for:
   - REQ-U03-001: Header styling (size, color, alignment)
   - REQ-U03-002: Alternating row layout
   - REQ-U03-003: Non-sticky nav behavior
   - REQ-U03-005: Button text colors
   - REQ-U03-006: Description below cards
   - REQ-U03-007: Session card styling
   - REQ-U03-008: 404 for deleted pages

2. Write unit tests for:
   - InlineSessionCard styling
   - CTAButton text colors
   - GridSquare content ordering

### Phase 2: Implementation (QCODE)
1. Fix GridSquare component for header styling and content ordering
2. Update summer-camp-sessions.mdoc with correct structure
3. Update InlineSessionCard styling
4. Verify CTAButton text colors
5. Remove sub-nav sticky behavior
6. Delete obsolete pages and update references

### Phase 3: Admin Strip (QCODE - Lower Priority)
1. Create AdminStrip component
2. Add authentication check for GitHub login
3. Integrate into layout

### Phase 4: Validation (QVERIFY)
1. Run all unit tests
2. Run Playwright production tests
3. Run smoke tests
4. Visual validation against reference images
5. Keystatic editing validation

## Story Points
- REQ-U03-001: 1 SP (CSS fix)
- REQ-U03-002: 1 SP (mdoc reorder)
- REQ-U03-003: 0.5 SP (remove sticky)
- REQ-U03-004: 3 SP (new feature)
- REQ-U03-005: 0.5 SP (verify/fix)
- REQ-U03-006: 1 SP (mdoc reorder)
- REQ-U03-007: 1 SP (CSS fix)
- REQ-U03-008: 1 SP (delete + cleanup)

**Total: 9 SP**

## Files to Modify
1. `components/content/GridSquare.tsx` - Header styling, prose ordering
2. `components/content/InlineSessionCard.tsx` - Card styling updates
3. `content/pages/summer-camp-sessions.mdoc` - Content restructuring
4. `components/content/MarkdocRenderer.tsx` - Any tag updates needed
5. Delete: `content/pages/summer-camp-junior-high.mdoc`
6. Delete: `content/pages/summer-camp-senior-high.mdoc`
7. Update: `scripts/smoke-test.sh` - Remove deleted pages
8. New: `components/admin/AdminStrip.tsx` (Phase 3)
