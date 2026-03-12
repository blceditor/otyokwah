# Phase 2: Summer Camp Pages Implementation Plan

> **Total Story Points**: 42 SP
> **Dependencies**: All Phase 0 components complete ✅
> **Production Domain**: prelaunch.bearlakecamp.com

---

## Executive Summary

Phase 2 enhances 5 summer camp pages with foundation components built in Phase 0. All components exist and are tested. Implementation focuses on content integration and page layout assembly.

### Dependency Status
| Component | REQ ID | Status |
|-----------|--------|--------|
| Tradesmith Distress | REQ-F001 | ✅ Complete |
| Hero Video | REQ-F002 | ✅ Complete |
| Quote Rotation | REQ-F003 | ✅ Complete |
| FAQ Accordion | REQ-F004 | ✅ Complete |
| Session Card Grid | REQ-F005 | ✅ Complete |
| CTA Button | REQ-F006 | ✅ Complete |

---

## Implementation Order

### Work Stream A: Summer Camp Main Page (12.5 SP)

#### REQ-SC001: Hero Video Section (1 SP)
**Files to modify**: `content/pages/summer-camp.mdoc`
**Approach**:
1. Add HeroVideo component to page template
2. Use placeholder video (public/videos/summer-camp-hero.mp4)
3. Add poster fallback image
4. Title: "Summer Camp" with TexturedHeading

**Acceptance**:
- [ ] Video auto-plays muted on load
- [ ] Poster image shows if video fails
- [ ] Responsive across breakpoints

#### REQ-SC002: What to Expect Block (2 SP)
**Files to create**: None (use existing Markdoc valueCards)
**Files to modify**: `content/pages/summer-camp.mdoc`
**Approach**:
1. Use Markdoc `valueCards` component for 3-4 value blocks
2. Content: "Christ Centered", "Super Fun", "Safe & Caring", "Lifelong Memories"
3. Icons: Heart, Smile, Shield, Users (Lucide icons)

**Design Reference**: Miracle Camp "Safety / Christ Centered / Super Fun" blocks

**Acceptance**:
- [ ] 3-4 value cards with icons
- [ ] Responsive grid (1 col mobile, 2 col tablet, 4 col desktop)
- [ ] Matches design language

#### REQ-SC003: Current Summer Theme Block (3 SP)
**Files to modify**: `content/pages/summer-camp.mdoc`
**Approach**:
1. Add Markdoc `twoColumns` section with video embed
2. Left: Theme description with TexturedHeading
3. Right: Embedded promo video (placeholder initially)
4. Content stub: "2025 Theme - Coming Soon"

**Content Dependency**: DEP-007 (theme blurb from Ben)

**Acceptance**:
- [ ] Split layout with text and video
- [ ] Video placeholder functional
- [ ] Tradesmith heading styling

#### REQ-SC004: Camp Sessions Calendar Quick Look (3 SP)
**Files to modify**: `content/pages/summer-camp.mdoc`
**Approach**:
1. Summary section with session overview
2. Link cards for each age group (Primary, Junior, Jr. High, Sr. High)
3. "View All Sessions" CTA linking to sessions page

**Acceptance**:
- [ ] Age group links visible
- [ ] Links work to respective pages
- [ ] Clean visual hierarchy

#### REQ-SC005: Session Blocks (3 SP)
**Files to modify**: `content/pages/summer-camp.mdoc`
**Approach**:
1. Use SessionCardGrid component for age group showcase
2. Image left, cards right layout
3. Cards: Primary (K-2), Junior (3-5), Jr. High (6-8), Sr. High (9-12)
4. Each card links to detailed page

**Dependencies**: REQ-F005 ✅

**Acceptance**:
- [ ] SessionCardGrid renders correctly
- [ ] Image positioning works
- [ ] Cards link to detail pages
- [ ] Mobile responsive (stacked)

#### REQ-SC006: Register CTA (0.5 SP)
**Files to modify**: `content/pages/summer-camp.mdoc`
**Approach**:
1. Add CTAButton component at page bottom
2. Default registration URL (Ultracamp)
3. Primary variant, large size

**Acceptance**:
- [ ] CTA visible and styled
- [ ] Opens registration in new tab

---

### Work Stream B: Camp Sessions Page (10 SP)

#### REQ-CS001: Summer Camp Dates Block (5 SP)
**Files to modify**: `content/pages/summer-camp-sessions.mdoc`
**Approach**:
1. Create comprehensive session grid with all 8 sessions
2. Use SessionCardGrid for visual display
3. Session data structure:
   ```
   - Primary Overnight (K-2): Week 1
   - Jr. High 1 (6-8): Week 2
   - Junior 1 (3-5): Week 3
   - Jr. High 2 (6-8): Week 4
   - Sr. High (9-12): Week 5
   - Junior 2 (3-5): Week 6
   - Jr. High 3 (6-8): Week 7
   - Junior 3 (3-5): Week 8
   ```
4. Each session: name, dates, grades, price, Register CTA

**Content Dependency**: DEP-008 (session dates from Ben)

**Design Reference**: Miracle Camp session cards

**Acceptance**:
- [ ] All 8 sessions displayed
- [ ] Prices visible ($350 regular / $325 early bird)
- [ ] Register CTAs link to Ultracamp
- [ ] Grade levels clear

#### REQ-CS002: Summer Promo Video (1 SP)
**Files to modify**: `content/pages/summer-camp-sessions.mdoc`
**Approach**:
1. Add video embed section using Markdoc
2. Placeholder video until Ben provides

**Content Dependency**: DEP-006 (promo video from Ben)

**Acceptance**:
- [ ] Video section renders
- [ ] Placeholder works
- [ ] Responsive sizing

#### REQ-CS003: Registration Block (3 SP)
**Files to modify**: `content/pages/summer-camp-sessions.mdoc`
**Approach**:
1. Create registration info section with:
   - Online registration link (Ultracamp)
   - Scholarship information
   - Printable forms link (if available)
2. Use ContentCard or InfoCard component

**Acceptance**:
- [ ] Registration options clear
- [ ] Scholarship info visible
- [ ] Links functional

#### REQ-CS004: Staff/LIT CTA Block (1 SP)
**Files to modify**: `content/pages/summer-camp-sessions.mdoc`
**Approach**:
1. Add section promoting work opportunities
2. Two CTAs: "Join Our Staff", "Become a LIT"
3. Link to work-at-camp pages

**Acceptance**:
- [ ] CTAs visible
- [ ] Links to correct pages

---

### Work Stream C: Summer Camp FAQ Page (4 SP)

#### REQ-FAQ001: Tradesmith Headings (0.5 SP)
**Files to modify**: `content/pages/summer-camp-faq.mdoc`
**Approach**:
1. Apply TexturedHeading to main title
2. Apply to category headers

**Dependencies**: REQ-F001 ✅

**Acceptance**:
- [ ] Main heading distressed
- [ ] Category headings styled

#### REQ-FAQ002: FAQ Accordion (3 SP)
**Files to modify**: `content/pages/summer-camp-faq.mdoc`
**Approach**:
1. Convert existing markdown FAQs to FAQAccordion component
2. Categories: Registration, Arrival, Health, Activities, Communication, Packing, Pick-up
3. Use Markdoc accordion component or direct component integration

**Dependencies**: REQ-F004 ✅

**Acceptance**:
- [ ] All FAQs render in accordion
- [ ] Categories grouped correctly
- [ ] Expand/collapse works
- [ ] Keyboard accessible (Enter/Space)

#### REQ-FAQ003: Registration CTA (0.5 SP)
**Files to modify**: `content/pages/summer-camp-faq.mdoc`
**Approach**:
1. Add CTAButton at page bottom
2. Link to Ultracamp registration

**Acceptance**:
- [ ] CTA visible
- [ ] Link works

---

### Work Stream D: What To Bring Page (3.5 SP)

#### REQ-WTB001: Visual Enhancement (3 SP)
**Files to modify**: `content/pages/summer-camp-what-to-bring.mdoc`
**Approach**:
1. Replace text-only list with visual cards
2. Use Markdoc infoCard with icons for categories:
   - Clothing (Shirt icon)
   - Toiletries (Droplet icon)
   - Bedding (Bed icon)
   - Recreation (Activity icon)
   - Do NOT Bring (XCircle icon)
3. Checklist format within each category

**Acceptance**:
- [ ] Visual cards instead of text list
- [ ] Icons for each category
- [ ] Checklist format maintained
- [ ] Mobile responsive

#### REQ-WTB002: Tradesmith Headings (0.5 SP)
**Files to modify**: `content/pages/summer-camp-what-to-bring.mdoc`
**Approach**:
1. Apply TexturedHeading to main title
2. Apply to category headers

**Dependencies**: REQ-F001 ✅

**Acceptance**:
- [ ] Headings styled consistently

---

### Work Stream E: Parent Info Page (5.5 SP)

#### REQ-PI001: Card Component Sections (5 SP)
**Files to modify**: `content/pages/summer-camp-parent-info.mdoc`
**Approach**:
1. Break wall of text into logical card sections:
   - Check-In/Check-Out
   - Camp Schedule
   - Communication
   - Health & Safety
   - What to Bring (link)
   - Emergency Contact
2. Use ContentCard or SectionCard components
3. Each section: icon, title, content
4. Add relevant images between sections

**Content Dependency**: DEP-009 (parent info pictures from Ben)

**Design Reference**: Miracle Camp facilities page card layout

**Acceptance**:
- [ ] Content broken into scannable sections
- [ ] Each section has icon/visual
- [ ] Information organized logically
- [ ] Mobile responsive

#### REQ-PI002: Tradesmith Headings (0.5 SP)
**Files to modify**: `content/pages/summer-camp-parent-info.mdoc`
**Approach**:
1. Apply TexturedHeading to page title
2. Apply to section headers

**Dependencies**: REQ-F001 ✅

**Acceptance**:
- [ ] Headings styled consistently

---

## Implementation Phases

### Phase 2.1: Core Content Pages (15 SP)
**Priority**: P0 - Ship First
**Parallel Work**:
- REQ-SC001 + REQ-SC002 + REQ-SC005 + REQ-SC006 (Summer Camp Main)
- REQ-FAQ001 + REQ-FAQ002 + REQ-FAQ003 (FAQ Page)

### Phase 2.2: Sessions Page (10 SP)
**Priority**: P1
**Work**:
- REQ-CS001 + REQ-CS002 + REQ-CS003 + REQ-CS004

### Phase 2.3: Supplementary Pages (9 SP)
**Priority**: P2
**Parallel Work**:
- REQ-SC003 + REQ-SC004 (Summer Camp additions)
- REQ-WTB001 + REQ-WTB002 (What To Bring)
- REQ-PI001 + REQ-PI002 (Parent Info)

---

## Technical Implementation Notes

### Component Integration Pattern
```tsx
// Page component pattern
import { HeroVideo } from '@/components/hero/HeroVideo';
import { SessionCardGrid } from '@/components/content/SessionCardGrid';
import { FAQAccordion } from '@/components/content/FAQAccordion';
import { CTAButton } from '@/components/ui/CTAButton';
import { TexturedHeading } from '@/components/typography/TexturedHeading';
```

### Session Data Structure
```typescript
interface Session {
  title: string;
  subtitle?: string; // e.g., "Grades 6-8"
  dates: string;
  price: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
}
```

### Content Strategy
1. **Placeholder Content**: Use stub data for Ben-dependent items
2. **Mark Placeholders**: Comment `<!-- DEP-XXX: Waiting on Ben -->`
3. **Keystatic Ready**: Structure content for future CMS migration

### Testing Requirements
Each page change requires:
1. Visual verification in development
2. Mobile responsive check
3. Keyboard navigation test for interactive elements
4. Production smoke test after deploy

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Ben content delays | Medium | Use placeholder content, mark dependencies |
| Video hosting | Low | Use Vercel for free tier, optimize file sizes |
| Mobile layout breaks | Medium | Test each component on mobile during development |
| FAQ data migration | Low | Keep markdown FAQs, enhance incrementally |

---

## Quality Gates

Before marking Phase 2 complete:
- [ ] All pages render without errors
- [ ] All CTAs link correctly
- [ ] Mobile responsive on all pages
- [ ] Tradesmith headings applied consistently
- [ ] FAQ accordion keyboard accessible
- [ ] Production smoke test passes
- [ ] Screenshot proof of production verification

---

## Estimated Breakdown by Day

| Day | Work | SP |
|-----|------|-----|
| 1 | REQ-SC001, REQ-SC002, REQ-SC005, REQ-SC006 | 6.5 |
| 2 | REQ-FAQ001, REQ-FAQ002, REQ-FAQ003 | 4 |
| 3 | REQ-CS001, REQ-CS002 | 6 |
| 4 | REQ-CS003, REQ-CS004 | 4 |
| 5 | REQ-SC003, REQ-SC004 | 6 |
| 6 | REQ-WTB001, REQ-WTB002 | 3.5 |
| 7 | REQ-PI001, REQ-PI002 | 5.5 |
| 8 | Integration, testing, fixes | 6.5 |

**Total**: 42 SP

---

## Appendix: File Locations

| File | Purpose |
|------|---------|
| `content/pages/summer-camp.mdoc` | Main landing page |
| `content/pages/summer-camp-sessions.mdoc` | Sessions list |
| `content/pages/summer-camp-faq.mdoc` | FAQ page |
| `content/pages/summer-camp-what-to-bring.mdoc` | Packing list |
| `content/pages/summer-camp-parent-info.mdoc` | Parent info |
| `components/content/SessionCardGrid.tsx` | Session cards |
| `components/content/FAQAccordion.tsx` | FAQ accordion |
| `components/hero/HeroVideo.tsx` | Hero video |
| `components/ui/CTAButton.tsx` | CTA buttons |
| `components/typography/TexturedHeading.tsx` | Distressed headings |
