# Requirements Lock: Navigation 404s and Missing Images Remediation

**Date**: 2025-12-03
**Task ID**: navigation-404-fixes
**Total Story Points**: 22.1 SP

---

## REQ-NAV-001: Create URL Redirects for Nested Routes
**Priority**: P0
**Story Points**: 2 SP

**Acceptance Criteria**:
- All nested route URLs (`/summer-camp/jr-high`, `/facilities/chapel`, etc.) redirect to flat slug equivalents
- Redirects use 301 permanent status for SEO preservation
- No broken links in primary navigation dropdowns
- Redirects tested on both dev and production environments

**Non-Goals**:
- Converting to actual nested route structure (out of scope)
- Changing CMS slug patterns (existing content stays flat)

**Test Cases**:
- TC-001: Navigate to `/summer-camp/jr-high` → redirects to `/summer-camp-junior-high` with 301 status
- TC-002: Navigate to `/summer-camp/high-school` → redirects to `/summer-camp-senior-high` with 301 status
- TC-003: Navigate to `/facilities/cabins` → redirects to `/facilities-cabins` with 301 status
- TC-004: Navigate to `/facilities/chapel` → redirects to `/facilities-chapel` with 301 status
- TC-005: Navigate to `/facilities/dining-hall` → redirects to `/facilities-dining-hall` with 301 status
- TC-006: Navigate to `/facilities/mac` → redirects to `/facilities-rec-center` with 301 status

---

## REQ-NAV-002: Align Navigation Configs with Existing Pages
**Priority**: P0
**Story Points**: 1 SP

**Acceptance Criteria**:
- `components/navigation/config.ts` defaultNavigation uses URLs that exist or have redirects
- `content/navigation/navigation.yaml` mirrors defaultNavigation structure
- All navigation menu items return 200 or 301 status (no 404s)
- Navigation structure validated across desktop and mobile menus

**Non-Goals**:
- Adding new navigation items (only fixing existing)
- Changing navigation UI/UX design

**Test Cases**:
- TC-007: All URLs in defaultNavigation config resolve successfully
- TC-008: All URLs in navigation.yaml resolve successfully
- TC-009: Desktop dropdown menus display correctly
- TC-010: Mobile navigation displays all items

---

## REQ-IMG-001: Update Homepage Component Image Paths
**Priority**: P0
**Story Points**: 1 SP

**Acceptance Criteria**:
- All homepage component images display without 404 errors
- Image paths updated to point to existing files in `/public/images/`
- Alt text remains descriptive and accessible
- Images load correctly on production build

**Non-Goals**:
- Changing image dimensions or optimization
- Adding new images (only fixing paths)

**Test Cases**:
- TC-011: Programs.tsx displays jr-high program image
- TC-012: Programs.tsx displays high-school program image
- TC-013: Hero.tsx displays default hero image
- TC-014: Mission.tsx displays background image
- TC-015: Gallery.tsx displays all 6 gallery images
- TC-016: No console errors for missing images
- TC-017: All images have appropriate alt text

**Files Modified**:
- `components/homepage/Programs.tsx`
- `components/homepage/Hero.tsx`
- `components/homepage/Mission.tsx`
- `components/homepage/Gallery.tsx`

---

## REQ-IMG-002: Fix CMS Mission Background Image Reference
**Priority**: P0
**Story Points**: 0.1 SP

**Acceptance Criteria**:
- Mission section background image loads correctly
- `content/homepage/mission.yaml` references existing file
- Image displays on production site
- No Keystatic CMS errors when editing mission section

**Non-Goals**:
- Changing mission section layout or styling

**Test Cases**:
- TC-018: Mission section displays background image
- TC-019: Keystatic CMS shows correct image preview
- TC-020: Image loads with proper aspect ratio

**Files Modified**:
- `content/homepage/mission.yaml`

---

## REQ-PAGE-001: Create "What To Bring" Page
**Priority**: P1
**Story Points**: 2 SP

**Acceptance Criteria**:
- Page accessible at `/summer-camp-what-to-bring`
- Contains comprehensive packing list for summer camp
- Uses standard template with hero image
- Includes SEO metadata (title, description, OG tags)
- Hero image appropriate for camping/packing theme
- Content organized in clear sections (Essentials, Optional, Don't Bring)

**Non-Goals**:
- Creating printable PDF version (future enhancement)
- Integration with registration system

**Test Cases**:
- TC-021: Page loads at `/summer-camp-what-to-bring`
- TC-022: Hero image displays
- TC-023: Packing list sections render correctly
- TC-024: SEO metadata present in HTML head
- TC-025: Page responsive on mobile devices

**Content Sections**:
- Clothing essentials
- Toiletries and personal items
- Bedding and linens
- Optional items (Bible, journal, camera)
- Items NOT to bring (electronics, valuables)

---

## REQ-PAGE-002: Create "FAQ" Page
**Priority**: P1
**Story Points**: 3 SP

**Acceptance Criteria**:
- Page accessible at `/summer-camp-faq`
- Uses Markdoc accordion component for Q&A sections
- Covers 10-15 common parent/camper questions
- Each question/answer pair in collapsible accordion
- Includes SEO metadata
- Hero image appropriate for FAQ theme
- Questions organized by category (Registration, Arrival, Health, Activities, etc.)

**Non-Goals**:
- Live chat integration
- Search functionality within FAQs

**Test Cases**:
- TC-026: Page loads at `/summer-camp-faq`
- TC-027: Accordion items expand/collapse correctly
- TC-028: All questions accessible
- TC-029: SEO metadata present
- TC-030: Accordion keyboard accessible (Enter/Space to toggle)

**FAQ Categories**:
- Registration and Payment
- Arrival and Check-In
- Health and Medications
- Activities and Daily Schedule
- Communication During Camp
- What to Bring / What Not to Bring

---

## REQ-PAGE-003: Create "Year-Round Positions" Page
**Priority**: P1
**Story Points**: 2 SP

**Acceptance Criteria**:
- Page accessible at `/work-at-camp-year-round`
- Lists full-time staff positions (Director, Program Director, Facilities Manager, etc.)
- Uses staff template with gallery and CTA
- Includes application CTA button
- Each position has description, qualifications, benefits
- Hero image featuring year-round staff
- SEO metadata optimized for job seekers

**Non-Goals**:
- Online application form (links to external form)
- Salary information display

**Test Cases**:
- TC-031: Page loads at `/work-at-camp-year-round`
- TC-032: All position descriptions display
- TC-033: Application CTA button links correctly
- TC-034: Gallery images display
- TC-035: Template renders correctly

**Positions to Include**:
- Camp Director
- Program Director
- Facilities Manager
- Kitchen Manager
- Office Administrator

---

## REQ-PAGE-004: Create "Rentals" Page
**Priority**: P1
**Story Points**: 2 SP

**Acceptance Criteria**:
- Page accessible at `/retreats-rentals`
- Explains facility rental process and options
- Includes pricing guidelines or contact for quote
- Lists available facilities and capacities
- Uses program template with pricing section
- Hero image of retreat group or facilities
- SEO metadata optimized for retreat search

**Non-Goals**:
- Online booking system (contact form only)
- Real-time availability calendar

**Test Cases**:
- TC-036: Page loads at `/retreats-rentals`
- TC-037: Rental process clearly explained
- TC-038: Pricing information or contact CTA present
- TC-039: Facility options listed
- TC-040: Template renders correctly

**Content Sections**:
- Rental Options (Weekend, Week, Custom)
- Available Facilities
- What's Included
- Pricing Guidelines
- Booking Process
- Contact Information

---

## REQ-PAGE-005: Create "Outdoor Spaces" Page
**Priority**: P1
**Story Points**: 2 SP

**Acceptance Criteria**:
- Page accessible at `/facilities-outdoor`
- Describes outdoor recreation areas and amenities
- Uses facility template with gallery
- Includes waterfront, sports fields, trails, campfire areas
- Hero image of outdoor activity or landscape
- Gallery shows variety of outdoor spaces
- SEO metadata optimized for outdoor recreation

**Non-Goals**:
- Interactive facility map
- Reservation system for specific spaces

**Test Cases**:
- TC-041: Page loads at `/facilities-outdoor`
- TC-042: All outdoor areas described
- TC-043: Gallery displays outdoor images
- TC-044: Template renders correctly
- TC-045: Hero image displays

**Outdoor Areas to Feature**:
- Waterfront (swimming, canoeing, kayaking)
- Athletic Fields (soccer, capture the flag)
- Sand Volleyball Courts
- Hiking Trails
- Campfire Circles
- Prayer and Reflection Areas
- Amphitheater

---

## REQ-PAGE-006: Create "Staff & Leadership" Listing Page
**Priority**: P1
**Story Points**: 3 SP

**Acceptance Criteria**:
- Page accessible at `/about-staff`
- Displays all staff bios from Keystatic staff collection
- Staff cards show photo, name, title
- Cards link to individual bio pages (if available)
- Staff ordered by `order` field (ascending)
- Grid layout responsive (1 col mobile, 2-3 cols desktop)
- Hero image featuring staff team
- SEO metadata present

**Non-Goals**:
- Individual bio detail pages (use existing if available)
- Staff search/filter functionality

**Test Cases**:
- TC-046: Page loads at `/about-staff`
- TC-047: All staff from CMS collection display
- TC-048: Staff photos load correctly
- TC-049: Staff ordered by `order` field
- TC-050: Grid responsive on mobile/desktop
- TC-051: Links to individual bios work (if applicable)

**Implementation Notes**:
- Query Keystatic staff collection via `createReader()`
- Sort by `order` field ascending
- Display name, title, photo
- Optional: truncate bio to 2-3 lines with "Read More" link

---

## REQ-TEST-001: Navigation Integration Tests
**Priority**: P1
**Story Points**: 2 SP

**Acceptance Criteria**:
- Test suite verifies all navigation links return 200 or 301 status
- Tests verify redirects work correctly
- Tests run automatically in CI pipeline
- Tests fail if any navigation link returns 404
- Tests cover both default and Keystatic navigation configs

**Non-Goals**:
- Testing navigation UI animations
- Testing dropdown hover states

**Test Cases**:
- TC-052: All links in defaultNavigation return 200 or 301
- TC-053: All links in navigation.yaml return 200 or 301
- TC-054: Redirect links return correct destination
- TC-055: Tests run in CI without flakiness
- TC-056: Test failures block PR merge

**Test File**:
- `components/navigation/Header.navigation.spec.tsx`

**Test Implementation**:
```typescript
describe('Navigation Link Validation', () => {
  it('should resolve all navigation URLs successfully', async () => {
    const links = getAllNavigationLinks(defaultNavigation);
    for (const link of links) {
      const response = await fetch(link);
      expect([200, 301]).toContain(response.status);
    }
  });
});
```

---

## REQ-TEST-002: Image Existence Tests
**Priority**: P1
**Story Points**: 2 SP

**Acceptance Criteria**:
- Script verifies all hardcoded image paths exist in `/public`
- Script parses all component files for image references
- Script checks file existence on filesystem
- CI pipeline fails if images missing
- Script runs before build in package.json

**Non-Goals**:
- Image optimization validation
- Image dimension checking

**Test Cases**:
- TC-057: Script detects all image references in components
- TC-058: Script validates existence in `/public` directory
- TC-059: Script fails if any images missing
- TC-060: Script runs in CI pipeline
- TC-061: Script output lists specific missing images

**Script File**:
- `scripts/verify-image-references.ts`

**Script Implementation**:
```typescript
// Parse all .tsx/.ts files
// Extract image path patterns
// Check fs.existsSync() for each
// Exit 1 if any missing
```

**Package.json Integration**:
```json
"scripts": {
  "verify-images": "tsx scripts/verify-image-references.ts",
  "prebuild": "npm run verify-images"
}
```

---

## Summary Table

| REQ ID | Description | Priority | SP | Phase |
|--------|-------------|----------|----|----|
| REQ-NAV-001 | URL redirects for nested routes | P0 | 2 | 1 |
| REQ-NAV-002 | Align navigation configs | P0 | 1 | 1 |
| REQ-IMG-001 | Update component image paths | P0 | 1 | 1 |
| REQ-IMG-002 | Fix CMS mission image | P0 | 0.1 | 1 |
| REQ-PAGE-001 | What To Bring page | P1 | 2 | 2 |
| REQ-PAGE-002 | FAQ page | P1 | 3 | 2 |
| REQ-PAGE-003 | Year-Round Positions page | P1 | 2 | 2 |
| REQ-PAGE-004 | Rentals page | P1 | 2 | 2 |
| REQ-PAGE-005 | Outdoor Spaces page | P1 | 2 | 2 |
| REQ-PAGE-006 | Staff listing page | P1 | 3 | 3 |
| REQ-TEST-001 | Navigation integration tests | P1 | 2 | 3 |
| REQ-TEST-002 | Image existence tests | P1 | 2 | 3 |
| **TOTAL** | | | **22.1** | |

---

## Phase Breakdown

**Phase 1 (P0 - Sprint 1)**: 4.1 SP
- Eliminate all user-facing 404s and missing images
- Critical for site usability

**Phase 2 (P1 - Sprint 2)**: 11 SP
- Create missing content pages
- Complete navigation structure

**Phase 3 (P1 - Sprint 3)**: 7 SP
- Staff listing page
- Automated testing and quality gates

---

## Dependencies

- **REQ-NAV-002** depends on **REQ-NAV-001** (redirects must exist before updating configs)
- **REQ-TEST-001** should run after **REQ-NAV-001** and **REQ-NAV-002** are complete
- **REQ-TEST-002** should run after **REQ-IMG-001** and **REQ-IMG-002** are complete

---

## Notes

- All new pages follow existing Keystatic schema patterns
- All pages include proper SEO metadata per `docs/project/PLANNING-POKER.md` guidelines
- Image paths use consistent `/images/` prefix pattern
- Redirects preserve SEO equity with 301 permanent status

**End of Requirements Lock**
