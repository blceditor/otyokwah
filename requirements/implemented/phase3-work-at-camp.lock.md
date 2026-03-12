# Requirements Lock - Phase 3: Work at Camp Pages
> **Snapshot Date**: 2025-12-12
> **Total Story Points**: 28.5 SP
> **Source**: requirements/current.md

---

## Phase 3 Requirements Summary

### Work at Camp Overview Page

#### REQ-WAC001: Overview Summary Page
**Story Points**: 5 SP
**Description**: Summary blocks for Summer Staff, LIT, Year-Round
**Design Reference**: Homepage-style summary with CTAs to detail pages
**Implementation**:
- SessionCardGrid component with position cards
- Cards: Summer Staff, LIT Program, Year-Round Opportunities
- Each card with image, description, CTA link
**Dependencies**: REQ-F005 (SessionCardGrid) - COMPLETE
**Acceptance Criteria**:
- [ ] Summary blocks for all 3 position types
- [ ] Each block links to detail page
- [ ] Responsive grid layout (stacks on mobile)
- [ ] Staff template with gallery and CTA

---

### Summer Staff Page

#### REQ-SS001: Hero Video Section
**Story Points**: 1 SP
**Description**: Hero with video background support
**Dependencies**: REQ-F002 (Hero Video) - COMPLETE
**Implementation**:
- Extend StaffTemplate to support heroVideo config
- Fallback to heroImage if video unavailable
- Stub with placeholder (DEP-010 pending from Ben)
**Acceptance Criteria**:
- [ ] Video plays muted and autoloop on desktop
- [ ] Falls back to poster/image on mobile or failure
- [ ] Uses existing Hero video pattern from homepage

#### REQ-SS002: What is Summer Staff Block
**Story Points**: 2 SP
**Description**: Text/image layout with Apply Now CTA
**Implementation**:
- Split layout section: image left, content right
- Brief description of summer staff experience
- "Apply Now" CTA linking to application form
**Acceptance Criteria**:
- [ ] Text/image split layout
- [ ] Apply Now CTA button
- [ ] Content from existing work-at-camp.mdoc or stub

#### REQ-SS003: Available Positions Grid
**Story Points**: 5 SP
**Description**: Position cards with image + description
**Design Reference**: Miracle Camp Camp Aide page
**Dependencies**: REQ-F005 (SessionCardGrid) - COMPLETE
**Implementation**:
- Use SessionCardGrid with position cards
- Positions: Counselor, Kitchen Staff, Program Staff, Maintenance
- Each card: title, description, "Learn More" link
**Acceptance Criteria**:
- [ ] Grid of position cards
- [ ] Each card links to detail page
- [ ] Images + descriptions for each position
- [ ] Responsive layout

#### REQ-SS004: FAQ Accordion
**Story Points**: 3 SP
**Description**: FAQ section for summer staff questions
**Dependencies**: REQ-F004 (FAQAccordion) - COMPLETE
**Implementation**:
- Use FAQAccordion component
- Load FAQs from Keystatic collection (category: 'staff')
- Create staff FAQ entries if none exist
**Acceptance Criteria**:
- [ ] Accordion with expand/collapse
- [ ] FAQs filtered by 'staff' category
- [ ] Accessible keyboard navigation
- [ ] Content from Keystatic

#### REQ-SS005: Tradesmith Headings
**Story Points**: 0.5 SP
**Description**: Apply Tradesmith distress styling to headings
**Dependencies**: REQ-F001 (Tradesmith Typography) - COMPLETE
**Implementation**:
- Use TexturedHeading component for section headings
- Apply text-textured class via StaffTemplate
**Acceptance Criteria**:
- [ ] Section headings use Tradesmith styling
- [ ] Distress effect visible on headings

#### REQ-SS006: Staff Quote Campaign
**Story Points**: 1 SP
**Description**: Quote rotation filtered by staff tag
**Dependencies**: REQ-F003 (QuoteRotation) - COMPLETE
**Implementation**:
- QuoteRotation component filtered by 'staff' tag
- Load quotes from Keystatic testimonials collection
- Create staff testimonial entries if none exist
**Acceptance Criteria**:
- [ ] Quote rotation with staff-tagged quotes
- [ ] Auto-rotation with manual navigation
- [ ] Content from Keystatic testimonials

---

### LIT Page

#### REQ-LIT001: Hero Video Section
**Story Points**: 1 SP
**Description**: Hero with video background support
**Dependencies**: REQ-F002 (Hero Video) - COMPLETE
**Implementation**:
- Same pattern as REQ-SS001
- Stub with placeholder (DEP-016 pending from Ben)
**Acceptance Criteria**:
- [ ] Video plays muted and autoloop
- [ ] Falls back to image on failure

#### REQ-LIT002: What is LIT Block
**Story Points**: 2 SP
**Description**: Text/image layout with Apply Now CTA
**Implementation**:
- Split layout explaining LIT program
- "Apply Now" CTA to UltraCamp
**Acceptance Criteria**:
- [ ] Text/image split layout
- [ ] Apply Now CTA button
- [ ] Program description content

#### REQ-LIT003: LIT Sessions Grid
**Story Points**: 5 SP
**Description**: Sessions 1, 2, 3 with image + description + dates
**Design Reference**: Miracle Camp Camp Aide sessions
**Dependencies**: REQ-F005 (SessionCardGrid) - COMPLETE
**Implementation**:
- Use SessionCardGrid with LIT session cards
- 3 sessions with dates (stub with sample data)
- Each card: session name, dates, description
**Acceptance Criteria**:
- [ ] Grid of 3 LIT session cards
- [ ] Dates displayed on each card
- [ ] Description of each session
- [ ] Responsive layout

#### REQ-LIT004: FAQ Accordion
**Story Points**: 3 SP
**Description**: FAQ section for LIT questions
**Dependencies**: REQ-F004 (FAQAccordion) - COMPLETE
**Implementation**:
- Use FAQAccordion component
- Load FAQs from Keystatic collection (category: 'lit')
- Create LIT FAQ entries if none exist
**Acceptance Criteria**:
- [ ] Accordion with expand/collapse
- [ ] FAQs filtered by 'lit' category
- [ ] Accessible keyboard navigation

---

## Dependencies Status

### Foundation Components (Phase 0)
| REQ | Component | Status |
|-----|-----------|--------|
| REQ-F001 | TexturedHeading | COMPLETE |
| REQ-F002 | Hero Video | COMPLETE |
| REQ-F003 | QuoteRotation | COMPLETE |
| REQ-F004 | FAQAccordion | COMPLETE |
| REQ-F005 | SessionCardGrid | COMPLETE |
| REQ-F006 | CTAButton | COMPLETE |

### Content Dependencies (from Ben)
| DEP | Item | Status |
|-----|------|--------|
| DEP-010 | Staff recruiting video | Pending (stub) |
| DEP-011 | Staff hero text | Pending (stub) |
| DEP-012 | "What is Summer Staff" text | Pending (stub) |
| DEP-013 | Position blocks content | Pending (stub) |
| DEP-014 | Staff FAQ content | Pending (stub) |
| DEP-015 | Staff quotes | Pending (stub) |
| DEP-016 | LIT recruiting video | Pending (stub) |
| DEP-017 | LIT hero text | Pending (stub) |
| DEP-018 | "What is LIT" text | Pending (stub) |
| DEP-019 | LIT session blocks | Pending (stub) |
| DEP-020 | LIT FAQ content | Pending (stub) |

---

## Implementation Strategy

### Components to Create/Modify
1. **StaffTemplate Enhancement** - Add hero video support, SessionCardGrid integration, QuoteRotation, FAQAccordion
2. **WorkAtCampPage component** - New page component with position overview using SessionCardGrid
3. **SummerStaffPage component** - New page with full feature set
4. **LITPage component** - Update from standard to staff template with sessions grid

### Data to Create
1. Staff FAQ entries in Keystatic (content/faqs/)
2. LIT FAQ entries in Keystatic (content/faqs/)
3. Staff testimonials in Keystatic (content/testimonials/)

### Content Pages to Modify
1. `/content/pages/work-at-camp.mdoc` - Add SessionCardGrid for position overview
2. Create/enhance `/content/pages/work-at-camp-summer-staff.mdoc`
3. Update `/content/pages/work-at-camp-leaders-in-training.mdoc` to staff template with sessions grid

---

## Story Point Breakdown

| REQ | Description | SP |
|-----|-------------|-----|
| REQ-WAC001 | Overview Summary Page | 5 |
| REQ-SS001 | Hero Video Section | 1 |
| REQ-SS002 | What is Summer Staff Block | 2 |
| REQ-SS003 | Available Positions Grid | 5 |
| REQ-SS004 | FAQ Accordion | 3 |
| REQ-SS005 | Tradesmith Headings | 0.5 |
| REQ-SS006 | Staff Quote Campaign | 1 |
| REQ-LIT001 | Hero Video Section | 1 |
| REQ-LIT002 | What is LIT Block | 2 |
| REQ-LIT003 | LIT Sessions Grid | 5 |
| REQ-LIT004 | FAQ Accordion | 3 |
| **TOTAL** | | **28.5 SP** |

---

## Implementation Order

### Phase 3A: Template Enhancement (3 SP)
1. Enhance StaffTemplate with:
   - Hero video support (REQ-SS001, REQ-LIT001)
   - TexturedHeading integration (REQ-SS005)
   - QuoteRotation slot (REQ-SS006)
   - FAQAccordion slot (REQ-SS004, REQ-LIT004)

### Phase 3B: Work at Camp Overview (5 SP)
2. REQ-WAC001: Update work-at-camp.mdoc with SessionCardGrid
   - Summer Staff card → /work-at-camp-summer-staff
   - LIT card → /work-at-camp-leaders-in-training
   - Year-Round card → /work-at-camp-year-round

### Phase 3C: Summer Staff Page (12.5 SP)
3. REQ-SS001-SS006: Create/enhance work-at-camp-summer-staff.mdoc
   - Hero video section
   - What is Summer Staff block
   - Available Positions Grid (SessionCardGrid)
   - FAQ Accordion
   - Staff Quote Campaign

### Phase 3D: LIT Page (11 SP)
4. REQ-LIT001-LIT004: Enhance work-at-camp-leaders-in-training.mdoc
   - Hero video section
   - What is LIT block
   - LIT Sessions Grid (SessionCardGrid)
   - FAQ Accordion

### Phase 3E: Content Data (0 SP - included in above)
5. Create Keystatic entries:
   - Staff FAQs (5-8 questions)
   - LIT FAQs (5-8 questions)
   - Staff testimonials (3-5 quotes)

---

## Test Strategy

### Unit Tests
- StaffTemplate renders all sections correctly
- SessionCardGrid renders position cards
- FAQAccordion renders FAQ items
- QuoteRotation rotates through quotes
- TexturedHeading applies correct styles

### Integration Tests
- Work-at-camp page loads all position cards
- Summer Staff page loads all sections
- LIT page loads sessions grid
- FAQ sections filter by correct category
- Quote rotation filters by staff tag

### E2E Tests
- Navigation to all work-at-camp pages returns 200
- All CTAs link to correct pages
- Responsive behavior at mobile/tablet/desktop

### Accessibility Tests
- All headings have correct hierarchy
- FAQs keyboard accessible
- Quotes accessible via keyboard navigation
- Touch targets meet 44x44px minimum

---

## Rollback Plan

**Per-REQ Rollback**:
- Each REQ in separate Git commit for granular rollback
- Tag commits: `phase3-WAC001`, `phase3-SS001`, etc.
- Revert command: `git revert <commit-hash>`

**Full Phase Rollback**:
- Tag before starting Phase 3: `git tag before-phase3`
- Rollback command: `git reset --hard before-phase3 && git push -f`

---

## Definition of Done

Phase 3 is complete when:
1. All work-at-camp pages render without errors
2. SessionCardGrid displays on overview page
3. Summer Staff page has all 6 required sections
4. LIT page has sessions grid and FAQ
5. All FAQ accordions expand/collapse correctly
6. Quote rotation works with staff-tagged testimonials
7. All headings use Tradesmith styling
8. All tests pass (unit, integration, accessibility)
9. Smoke tests pass on production
10. All pages return 200 status
