# Navigation 404s and Missing Images - Audit and Remediation Plan

**Date**: 2025-12-03
**Site**: https://prelaunch.bearlakecamp.com/
**Status**: Draft

---

## Executive Summary

User feedback indicates "a lot of 404s from the nav" and "several images are missing" on the Bear Lake Camp website. This audit identifies all navigation structure issues and missing image references, providing a prioritized remediation plan with story point estimates.

### Key Findings

**Navigation Issues**: 8 broken links found (5 missing nested routes, 3 naming mismatches)
**Missing Images**: 11 image references pointing to non-existent files
**Priority**: P0 issues block user journeys; P1 issues affect UX quality

---

## Part 1: Navigation 404 Analysis

### Current Navigation Structure

The site uses two navigation configurations:
1. **Default Navigation** (`components/navigation/config.ts`) - Used as fallback
2. **Keystatic Navigation** (`content/navigation/navigation.yaml`) - CMS-managed

Both configurations reference URLs that don't have corresponding pages.

### 1.1 Navigation Configuration Comparison

| Menu Item | Default Config URL | Keystatic Config URL | Page Exists? | Issue |
|-----------|-------------------|---------------------|--------------|-------|
| **Summer Camp** |
| Jr. High Week | `/summer-camp/jr-high` | `/summer-camp-junior-high` | ✅ Yes (flat) | Mismatch |
| High School Week | `/summer-camp/high-school` | `/summer-camp-senior-high` | ✅ Yes (flat) | Mismatch |
| What To Bring | `/summer-camp/what-to-bring` | N/A | ❌ No | Missing |
| FAQ | `/summer-camp/faq` | N/A | ❌ No | Missing |
| **Work at Camp** |
| Summer Staff | `/work-at-camp/summer-staff` | N/A | ✅ Yes (flat) | Structure |
| Year-Round | `/work-at-camp/year-round` | N/A | ❌ No | Missing |
| **Retreats** |
| Group Retreats | `/retreats` | `/retreats` | ✅ Yes | OK |
| Rentals | `/retreats/rentals` | N/A | ❌ No | Missing |
| Youth Groups | N/A | `/retreats-youth-groups` | ✅ Yes (flat) | Structure |
| Adult Retreats | N/A | `/retreats-adult-retreats` | ✅ Yes (flat) | Structure |
| **Facilities** |
| Cabins | `/facilities/cabins` | `/facilities-cabins` | ✅ Yes (flat) | Mismatch |
| Chapel | `/facilities/chapel` | `/facilities-chapel` | ✅ Yes (flat) | Mismatch |
| Dining Hall | `/facilities/dining-hall` | `/facilities-dining-hall` | ✅ Yes (flat) | Mismatch |
| MAC/Rec Center | `/facilities/mac` | `/facilities-rec-center` | ✅ Yes (flat) | Mismatch |
| Outdoor Spaces | `/facilities/outdoor` | N/A | ❌ No | Missing |
| **About** |
| Staff & Leadership | `/about/staff` | N/A | ❌ No | Missing |

### 1.2 Root Cause Analysis

**Problem**: Next.js App Router expects nested routes (folders with `page.tsx`) but all pages exist as flat slugs via dynamic `[slug]/page.tsx`.

**Current Structure**:
```
/Users/travis/.../bearlakecamp/
├── app/
│   ├── [slug]/page.tsx          # Handles /summer-camp, /facilities, etc.
│   ├── about/page.tsx            # Custom route for /about
│   └── page.tsx                  # Homepage
└── content/pages/
    ├── summer-camp.mdoc          # Flat slug
    ├── summer-camp-junior-high.mdoc
    ├── facilities-chapel.mdoc
    └── ...
```

**Navigation Expects**:
```
/summer-camp/jr-high              # Would need app/summer-camp/jr-high/page.tsx
/facilities/mac                   # Would need app/facilities/mac/page.tsx
```

### 1.3 Broken Links by Priority

#### P0 - Critical User Journey Blockers (5 links)

1. **`/summer-camp/jr-high`** → Should redirect to `/summer-camp-junior-high`
2. **`/summer-camp/high-school`** → Should redirect to `/summer-camp-senior-high`
3. **`/facilities/cabins`** → Should redirect to `/facilities-cabins`
4. **`/facilities/chapel`** → Should redirect to `/facilities-chapel`
5. **`/facilities/dining-hall`** → Should redirect to `/facilities-dining-hall`

#### P1 - Secondary Navigation Issues (6 links)

6. **`/facilities/mac`** → Should redirect to `/facilities-rec-center`
7. **`/summer-camp/what-to-bring`** → Page needs to be created
8. **`/summer-camp/faq`** → Page needs to be created
9. **`/work-at-camp/year-round`** → Page needs to be created
10. **`/retreats/rentals`** → Page needs to be created
11. **`/facilities/outdoor`** → Page needs to be created

#### P2 - Missing Staff Page (1 link)

12. **`/about/staff`** → Page needs to be created (staff bio collection exists but no listing page)

---

## Part 2: Missing Images Analysis

### 2.1 Image Directory Audit

**Available Images**: 65 files across 3 directories
- `/public/images/logo/` - 1 file
- `/public/images/facilities/` - 13 files
- `/public/images/staff/` - 14 files (including PDFs)
- `/public/images/summer-program-and-general/` - 31 files

**Missing Directory**: `/public/images/homepage/` (referenced but doesn't exist)

### 2.2 Missing Image References

| Component/Page | Image Reference | Status | Best-Fit Replacement |
|----------------|----------------|--------|----------------------|
| **Homepage Components** |
| Programs.tsx | `/programs/jr-high-group.jpg` | ❌ Missing | `/images/summer-program-and-general/jr-high-Bible-study-10-scaled.jpg` |
| Programs.tsx | `/programs/high-school-activity.jpg` | ❌ Missing | `/images/summer-program-and-general/teen-girls-at-picnic-table-near-snack-shack.jpg` |
| Hero.tsx | `/hero-summer-camp.jpg` | ❌ Missing | `/images/summer-program-and-general/Top-promo-7-scaled-e1731002368158.jpg` |
| Mission.tsx | `/mission-background.jpg` | ❌ Missing | `/images/summer-program-and-general/cross-with-lake-in-background.jpg` |
| Gallery.tsx | `/gallery/campfire.jpg` | ❌ Missing | `/images/summer-program-and-general/campfire.jpg` |
| Gallery.tsx | `/gallery/backflip-water.jpg` | ❌ Missing | `/images/summer-program-and-general/backflip-water.jpg` |
| Gallery.tsx | `/gallery/bible-study.jpg` | ❌ Missing | `/images/summer-program-and-general/bible-study.jpg` |
| Gallery.tsx | `/gallery/volleyball.jpg` | ❌ Missing | `/images/summer-program-and-general/volleyball.jpg` |
| Gallery.tsx | `/gallery/water-blob.jpg` | ❌ Missing | `/images/summer-program-and-general/water-launch.jpg` |
| Gallery.tsx | `/gallery/crafts.jpg` | ❌ Missing | `/images/summer-program-and-general/girls-crafting.jpg` |
| **CMS Reference** |
| mission.yaml | `/images/homepage/mission-background.jpg` | ❌ Missing | `/images/summer-program-and-general/cross-with-lake-in-background.jpg` |

### 2.3 Image Path Pattern Issues

**Problem**: Hardcoded paths in components don't match actual directory structure.

**Pattern Mismatch**:
- Components expect: `/programs/`, `/gallery/`, `/hero-*.jpg`
- Actual location: `/images/summer-program-and-general/`

---

## Part 3: Remediation Plan

### Phase 1: Fix Critical Navigation 404s (P0)

**Objective**: Eliminate all user-facing navigation errors

#### REQ-NAV-001: Create URL Redirects for Nested Routes
**Acceptance**:
- All nested route URLs (`/summer-camp/jr-high`) redirect to flat slug equivalents
- 301 permanent redirects preserve SEO
- No broken links in primary navigation

**Implementation**:
1. Create `next.config.js` redirects or `middleware.ts` for URL rewriting
2. Map all nested routes to flat slugs

**Files to Modify**:
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/next.config.js`

**Story Points**: 2 SP (straightforward redirect configuration)

---

#### REQ-NAV-002: Align Navigation Configs with Existing Pages
**Acceptance**:
- `components/navigation/config.ts` uses only URLs that exist or have redirects
- `content/navigation/navigation.yaml` matches default config
- All navigation links return 200 status

**Implementation**:
1. Update `defaultNavigation` URLs to match flat slug pattern
2. Update Keystatic navigation YAML to mirror changes

**Files to Modify**:
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/navigation/config.ts`
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/content/navigation/navigation.yaml`

**Story Points**: 1 SP (data update only)

---

### Phase 2: Fix Missing Images (P0)

#### REQ-IMG-001: Update Homepage Component Image Paths
**Acceptance**:
- All homepage components display images correctly
- Image paths point to existing files
- Alt text remains descriptive

**Implementation**:
1. Update Programs.tsx to use actual images
2. Update Hero.tsx default image path
3. Update Mission.tsx background path
4. Update Gallery.tsx image paths

**Files to Modify**:
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/homepage/Programs.tsx`
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/homepage/Hero.tsx`
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/homepage/Mission.tsx`
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/homepage/Gallery.tsx`

**Story Points**: 1 SP (path updates, no logic changes)

---

#### REQ-IMG-002: Fix CMS Mission Background Image Reference
**Acceptance**:
- Mission section displays background image correctly
- Keystatic CMS reference points to existing file
- Image loads on production site

**Implementation**:
1. Update `content/homepage/mission.yaml` background image path

**Files to Modify**:
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/content/homepage/mission.yaml`

**Story Points**: 0.1 SP (single path change)

---

### Phase 3: Create Missing Pages (P1)

#### REQ-PAGE-001: Create "What To Bring" Page
**Acceptance**:
- Page accessible at `/summer-camp-what-to-bring`
- Contains packing list for summer camp
- Uses standard template
- Hero image appropriate for topic

**Implementation**:
1. Create `content/pages/summer-camp-what-to-bring.mdoc`
2. Add frontmatter with SEO, hero image
3. Write content with packing list sections

**Story Points**: 2 SP (content creation + template)

---

#### REQ-PAGE-002: Create "FAQ" Page
**Acceptance**:
- Page accessible at `/summer-camp-faq`
- Uses accordion component for Q&A
- Covers common parent/camper questions
- Hero image appropriate for topic

**Implementation**:
1. Create `content/pages/summer-camp-faq.mdoc`
2. Use Markdoc accordion component
3. Populate with 10-15 FAQs

**Story Points**: 3 SP (content creation + accordion implementation)

---

#### REQ-PAGE-003: Create "Year-Round Positions" Page
**Acceptance**:
- Page accessible at `/work-at-camp-year-round`
- Lists full-time positions
- Includes application CTA
- Uses staff template

**Implementation**:
1. Create `content/pages/work-at-camp-year-round.mdoc`
2. Use staff template
3. Add gallery images and CTA

**Story Points**: 2 SP (content + template)

---

#### REQ-PAGE-004: Create "Rentals" Page
**Acceptance**:
- Page accessible at `/retreats-rentals`
- Explains facility rental process
- Includes pricing/contact info
- Hero image of facilities

**Implementation**:
1. Create `content/pages/retreats-rentals.mdoc`
2. Use program template
3. Add facility images

**Story Points**: 2 SP (content + template)

---

#### REQ-PAGE-005: Create "Outdoor Spaces" Page
**Acceptance**:
- Page accessible at `/facilities-outdoor`
- Describes outdoor recreation areas
- Uses facility template
- Gallery of outdoor spaces

**Implementation**:
1. Create `content/pages/facilities-outdoor.mdoc`
2. Use facility template
3. Add outdoor activity images

**Story Points**: 2 SP (content + template)

---

#### REQ-PAGE-006: Create "Staff & Leadership" Listing Page
**Acceptance**:
- Page accessible at `/about-staff`
- Displays all staff bios from CMS
- Links to individual bio pages (if needed)
- Ordered by `order` field

**Implementation**:
1. Create `app/about-staff/page.tsx` or add to dynamic slug handler
2. Query staff collection from Keystatic
3. Display grid of staff cards with photos

**Story Points**: 3 SP (new page type with collection query)

---

### Phase 4: Alignment and Testing (P1)

#### REQ-TEST-001: Navigation Integration Tests
**Acceptance**:
- Tests verify all nav links return 200 status
- Tests verify redirects work correctly
- Tests run in CI pipeline

**Implementation**:
1. Create `components/navigation/Header.navigation.spec.tsx`
2. Test each navigation link
3. Mock Next.js router for link testing

**Story Points**: 2 SP (comprehensive test suite)

---

#### REQ-TEST-002: Image Existence Tests
**Acceptance**:
- Tests verify all hardcoded image paths exist in `/public`
- Tests fail if new components reference non-existent images
- CI fails on missing images

**Implementation**:
1. Create `scripts/verify-image-references.ts`
2. Parse all components for image paths
3. Check file existence
4. Add to CI pipeline

**Story Points**: 2 SP (script + CI integration)

---

## Part 4: Story Point Summary

| Phase | Requirement | Description | SP | Priority |
|-------|------------|-------------|----|------------|
| **Phase 1** | REQ-NAV-001 | Create URL redirects | 2 | P0 |
| | REQ-NAV-002 | Align navigation configs | 1 | P0 |
| **Phase 2** | REQ-IMG-001 | Update component image paths | 1 | P0 |
| | REQ-IMG-002 | Fix CMS mission image | 0.1 | P0 |
| **Phase 3** | REQ-PAGE-001 | What To Bring page | 2 | P1 |
| | REQ-PAGE-002 | FAQ page | 3 | P1 |
| | REQ-PAGE-003 | Year-Round Positions page | 2 | P1 |
| | REQ-PAGE-004 | Rentals page | 2 | P1 |
| | REQ-PAGE-005 | Outdoor Spaces page | 2 | P1 |
| | REQ-PAGE-006 | Staff listing page | 3 | P1 |
| **Phase 4** | REQ-TEST-001 | Navigation tests | 2 | P1 |
| | REQ-TEST-002 | Image verification tests | 2 | P1 |
| **TOTAL** | | | **22.1 SP** | |

### Breakdown by Priority
- **P0 (Critical)**: 4.1 SP — Blocks user journeys
- **P1 (High)**: 18 SP — Improves completeness and quality

---

## Part 5: Implementation Order

### Sprint 1: Eliminate User-Facing Errors (P0)
**Goal**: Zero 404s in navigation, all images load

1. ✅ **REQ-NAV-001** (2 SP) — Set up redirects
2. ✅ **REQ-NAV-002** (1 SP) — Update navigation configs
3. ✅ **REQ-IMG-001** (1 SP) — Fix component image paths
4. ✅ **REQ-IMG-002** (0.1 SP) — Fix CMS mission image

**Sprint 1 Total**: 4.1 SP

---

### Sprint 2: Complete Missing Content (P1)
**Goal**: All navigation links lead to real pages

5. ✅ **REQ-PAGE-001** (2 SP) — What To Bring page
6. ✅ **REQ-PAGE-002** (3 SP) — FAQ page
7. ✅ **REQ-PAGE-003** (2 SP) — Year-Round Positions
8. ✅ **REQ-PAGE-004** (2 SP) — Rentals page
9. ✅ **REQ-PAGE-005** (2 SP) — Outdoor Spaces page

**Sprint 2 Total**: 11 SP

---

### Sprint 3: Complete Edge Cases + Testing (P1)
**Goal**: Staff page and automated quality gates

10. ✅ **REQ-PAGE-006** (3 SP) — Staff listing page
11. ✅ **REQ-TEST-001** (2 SP) — Navigation integration tests
12. ✅ **REQ-TEST-002** (2 SP) — Image verification tests

**Sprint 3 Total**: 7 SP

---

## Part 6: Technical Notes

### Redirect Implementation Options

**Option A: Next.js Config Redirects** (Recommended)
```javascript
// next.config.js
module.exports = {
  async redirects() {
    return [
      {
        source: '/summer-camp/jr-high',
        destination: '/summer-camp-junior-high',
        permanent: true,
      },
      // ... more redirects
    ];
  },
};
```

**Pros**: Simple, declarative, SEO-friendly
**Cons**: Requires server restart to update

---

**Option B: Middleware Rewrite** (Alternative)
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  if (url.pathname === '/summer-camp/jr-high') {
    url.pathname = '/summer-camp-junior-high';
    return NextResponse.rewrite(url);
  }
}
```

**Pros**: More flexible, can add logic
**Cons**: Runs on every request, more complex

**Recommendation**: Use **Option A** for simplicity and performance.

---

### Image Path Centralization (Future Enhancement)

**Problem**: Hardcoded image paths across components create fragility.

**Future Improvement**:
```typescript
// lib/constants/images.ts
export const IMAGES = {
  programs: {
    jrHigh: '/images/summer-program-and-general/jr-high-Bible-study-10-scaled.jpg',
    highSchool: '/images/summer-program-and-general/teen-girls-at-picnic-table-near-snack-shack.jpg',
  },
  hero: {
    default: '/images/summer-program-and-general/Top-promo-7-scaled-e1731002368158.jpg',
  },
};
```

**Benefits**: Single source of truth, easier refactoring, automated validation

---

## Part 7: Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Redirects break existing external links | Low | Medium | Use 301 permanent redirects, monitor analytics |
| New pages have SEO duplication issues | Low | Medium | Add canonical tags, review meta descriptions |
| Image replacements don't match content context | Medium | Low | Review all replacements with stakeholder |
| Tests introduce CI pipeline failures | Low | Medium | Make tests non-blocking initially |

---

## Part 8: Success Metrics

### Definition of Done
- ✅ All navigation links return 200 or 301 status
- ✅ All images load without 404 errors
- ✅ All new pages have SEO metadata
- ✅ All new pages use appropriate templates
- ✅ Tests pass in CI pipeline
- ✅ Manual QA on production site confirms fixes

### Post-Deployment Verification
1. Crawl site with Screaming Frog or similar (check for 404s)
2. Review Google Search Console for new 404 reports
3. Verify Core Web Vitals not negatively impacted
4. Stakeholder UAT on new pages

---

## Appendix A: File Reference Map

### Navigation Files
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/navigation/config.ts`
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/content/navigation/navigation.yaml`
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/lib/keystatic/navigation.ts`

### Homepage Components with Image References
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/homepage/Programs.tsx`
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/homepage/Hero.tsx`
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/homepage/Mission.tsx`
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/homepage/Gallery.tsx`

### CMS Content
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/content/homepage/mission.yaml`
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/content/pages/*.mdoc`

### Routing
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/app/[slug]/page.tsx`
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/next.config.js`

---

## Appendix B: Available Images Inventory

### Logo (1 file)
- `BLC-Logo-compass-whiteletters-no-background-small.png`

### Facilities (13 files)
- `chapel-exterior.jpg`
- `facilities-bunks.jpg`
- `facilities-cabin-bunk-room.jpg`
- `facility-activity-field.jpg`
- `facility-amphitheater.jpg`
- `facility-cabin-showers.jpg`
- `facility-chapel-outside-scaled-os6euyyd5n1xgduahdlbyznxw89lpoao07w454hv88.jpg`
- `facility-dining-hall-outside-scaled-os6ez0nckyldfxynumki7gwdyybhurd2890dj0hufs.jpg`
- `facility-dining-hall-winter-snow.jpg`
- `facility-fire-circle.jpg`
- `facility-fire-in-fireplace.jpg`
- `facility-multi-activity-center-MAC-outside-os6f0egsn6hkj9yarq3qdmbtgdhy6puu33l3yofza0.jpg`
- `retreat-group-PXL_20230108_144750450.MP_-scaled-qwnt78klwbhbovjpur5dflq1vlu4wvvupi57zzx3rs.jpg`

### Staff (14 files, including PDFs)
- Multiple staff headshots and group photos
- Job description PDFs

### Summer Programs (31 files)
- Activity photos (canoeing, crafts, swimming, sports)
- Bible study and worship photos
- Camper group photos
- Facility photos relevant to summer programs

---

**End of Audit Plan**
