# QPLAN: Updates-03 Final Requirements

> **Created**: 2025-12-27
> **Status**: Ready for Implementation
> **Total Estimated SP**: 8 SP (split into 2 batches)

---

## Summary of Remaining Requirements

Based on analysis of Updates-03.md with `[TS-` status markers:

| REQ ID | Description | Status | SP |
|--------|-------------|--------|-----|
| REQ-U03-001 | Session headings 3rem size | Needs work | 1 |
| REQ-U03-003.3 | Bug Report screenshot capture | Needs work | 2 |
| REQ-U03-006a | Button text underline removal | Needs work | 0.5 |
| REQ-U03-006b | Session card spacing (CMS only) | Needs work | 1 |
| REQ-U03-013 | Bottom page template redesign | MAJOR work | 3.5 |

---

## Batch 1: Visual Fixes (3 SP)

### REQ-U03-001: Session Headings Size
**File**: `components/markdoc/GridSquare.tsx` or relevant heading component
**Change**: Desktop session headings need `font-size: 3rem; line-height: 1;`

**Acceptance Criteria**:
- [ ] "Primary Overnight", "Junior Camp", etc. headings are 3rem on desktop
- [ ] Line-height is 1 (tight)
- [ ] White color (already done)
- [ ] Visual verification screenshot captured

### REQ-U03-006a: Button Text Underline Removal
**File**: `components/markdoc/CtaButton.tsx` or button styles
**Change**: Remove text-decoration underline from Register Now buttons

**Acceptance Criteria**:
- [ ] No underline on button text
- [ ] Button still has correct text color matching background
- [ ] Visual verification screenshot captured

### REQ-U03-006b: Session Card Spacing (CMS Only)
**File**: `components/markdoc/InlineSessionCard.tsx` or sessionCardGroup
**Reference**: image-10.png (target) vs image-11.png (current)
**Change**: Remove excessive vertical spacing between title/date/price lines

**Acceptance Criteria**:
- [ ] Session card lines are tight (minimal gap between title, date, price)
- [ ] Matches image-10.png reference
- [ ] Only affects CMS/Markdoc rendering (not CampSessionsPage.tsx)
- [ ] Visual verification screenshot captured

---

## Batch 2: Feature Work (5 SP)

### REQ-U03-003.3: Bug Report Screenshot Capture
**Files**:
- `components/admin/AdminStrip.tsx`
- NEW: `lib/screenshot.ts`

**Implementation**:
1. Add html2canvas dependency (~50KB)
2. Create screenshot capture utility
3. Update "Report a Bug" button to:
   - Capture current viewport screenshot
   - Convert to data URL
   - Open GitHub issue with screenshot embedded or link

**Acceptance Criteria**:
- [ ] Clicking "Report a Bug" captures screenshot
- [ ] GitHub issue opens with page URL pre-filled
- [ ] Screenshot is included (either embedded or as downloadable link)
- [ ] Works on both public pages and admin areas

### REQ-U03-013: Bottom Page Template Redesign
**Files**:
- `components/markdoc/MarkdocComponents.tsx` (register new components)
- NEW: `components/content/RegistrationInfoGrid.tsx`
- `components/content/CtaSection.tsx` (update heading color)
- `content/pages/summer-camp-sessions.mdoc` (update content)

**Target Design** (from images 5 & 6):

#### Registration Information Section
4 cards in 2x2 grid with:
- Outlined card style (border, not filled)
- Icon at top-left of each card
- Cream/off-white background

Cards:
1. **$ Pricing & Early Bird**
   - Primary Overnight: $100
   - All Other Sessions: $390 through 4/14, $440 after 4/14
   - Early bird note

2. **♡ Share the Love Discount**
   - $50 off for each first-time camper referral
   - Applied at check-in

3. **🎓 Grade Levels**
   - Based on upcoming school year grade

4. **✉ Questions?**
   - Email: registrar@bearlakecamp.com
   - Phone: 260-799-5988

#### Scholarships Available Section (Green)
- Full-width green (`bg-secondary`) background
- **WHITE heading text** for "Scholarships Available"
- Description text in white/cream
- Button: white background, **green text** (matching `text-secondary`)

#### Ready to Register Section (Brown)
- Full-width brown (`bg-bark`) background
- **WHITE heading text** for "Ready to Register?"
- Description text in white/cream
- Button: white background, **brown text** (matching `text-bark`)

**Acceptance Criteria**:
- [ ] 4 Registration Info cards in 2x2 grid with outlined style
- [ ] Cards have icons matching mockup
- [ ] Scholarships section has WHITE heading text
- [ ] Scholarships button text is GREEN (not white)
- [ ] Ready to Register section has WHITE heading text
- [ ] Ready to Register button text is BROWN (not white)
- [ ] Visual verification screenshots captured for all sections

---

## Implementation Order

1. **Batch 1 First** (3 SP) - Quick visual fixes
   - REQ-U03-006a (underline) - 30 min
   - REQ-U03-006b (spacing) - 1 hour
   - REQ-U03-001 (heading size) - 1 hour

2. **Batch 2 Second** (5 SP) - Feature work
   - REQ-U03-013 (bottom template) - 3 hours
   - REQ-U03-003.3 (screenshot) - 2 hours

---

## Files to Modify

### Batch 1
- `components/markdoc/CtaButton.tsx` - Remove underline
- `components/markdoc/InlineSessionCard.tsx` - Tighten spacing
- `components/markdoc/GridSquare.tsx` - Heading size

### Batch 2
- `components/content/CtaSection.tsx` - Heading already white, verify button text color
- NEW: `components/content/RegistrationInfoCard.tsx` - Outlined card component
- NEW: `components/content/RegistrationInfoGrid.tsx` - 2x2 grid wrapper
- `components/markdoc/MarkdocComponents.tsx` - Register new components
- `content/pages/summer-camp-sessions.mdoc` - Update to use new components
- `components/admin/AdminStrip.tsx` - Add screenshot functionality
- NEW: `lib/screenshot.ts` - html2canvas wrapper

---

## Verification Plan

After each batch:
1. Run `npm run typecheck && npm run lint`
2. Run `npm run build`
3. Deploy to preview
4. Run `./scripts/smoke-test.sh --force prelaunch.bearlakecamp.com`
5. Capture verification screenshots
6. Update requirements.lock.md

---

## Questions Resolved

| Question | Answer |
|----------|--------|
| Bug Report approach | Screenshot capture using html2canvas |
| Card styling | Match mockup exactly (outlined cards with icons) |
| Spacing fix scope | CMS only (Markdoc rendering) |
