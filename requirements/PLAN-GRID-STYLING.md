# QPLAN: Summer Camp Sessions Grid Styling Fixes

**Date**: 2025-12-23
**Source**: Updates-03.md
**Total SP**: 5

## Overview

Update the CMS-driven `/summer-camp-sessions` page to match the original static design at `/static-sessions`. The current implementation has the right 50/50 split structure but needs styling refinements for headers, session cards, buttons, and content flow.

## Reference Materials
- **Static version**: https://prelaunch.bearlakecamp.com/static-sessions
- **CMS version**: https://prelaunch.bearlakecamp.com/summer-camp-sessions
- **Reference images**: `requirements/image-1.png`, `image-3.png`, `image-4.png`

---

## Requirements

### REQ-GRID-010: Header Styling (SP: 1)

**Current**: Headers are styled with prose defaults, centered
**Target**: Match static design with TexturedHeading

**Changes**:
- Use TexturedHeading component (dark green textured text)
- Font-size: 3rem (text-5xl)
- Line-height: 1 (leading-none)
- Left-aligned
- Age group subtitle directly below (e.g., "Rising 2nd-3rd Graders")

**Files**:
- `components/content/GridSquare.tsx` - Apply text-left, adjust prose overrides
- `components/content/MarkdocRenderer.tsx` - Ensure headings use proper styling

**Acceptance**:
- [ ] Headers are left-aligned
- [ ] Font size matches static reference (~3rem)
- [ ] Age group appears directly under header

---

### REQ-GRID-011: Remove "Sessions" Sub-Headers (SP: 0.5)

**Current**: Content has "### Sessions" headings above session cards
**Target**: No "Sessions" text - cards flow directly after description

**Changes**:
- Update `content/pages/summer-camp-sessions.mdoc` to remove "### Sessions" lines

**Files**:
- `content/pages/summer-camp-sessions.mdoc`

**Acceptance**:
- [ ] No "Sessions" text appears on page
- [ ] Content flows: Header → Age group → Description → Session cards → Button

---

### REQ-GRID-012: Sub-Nav NOT Sticky (SP: 0.2)

**Current**: No sub-nav exists in CMS version (static has it but it's sticky)
**Target**: If sub-nav added, should NOT be sticky - just scroll away

**Note**: The CMS version doesn't have the anchor navigation. Per user: "It SHOULD NOT freeze at the top of the page."

**Files**: None needed currently (no sub-nav in CMS version)

**Acceptance**:
- [ ] No sticky navigation behavior

---

### REQ-GRID-013: Session Cards - Inline Compact Design (SP: 2)

**Current**: Session cards use full SessionCard component with icons, cream backgrounds
**Target**: Compact inline cards matching static design

**For single sessions (Primary Overnight, Sr. High)**:
- Lighter translucent background (white/10 or rgba)
- Rounded corners (rounded-lg)
- Content: Title, date, price in compact format
- Description BELOW the card (not inside)

**For multiple sessions (Junior, Jr. High)**:
- Stack 3 compact cards vertically
- Each card: Title in textured font, date, price
- Lighter translucent background
- ONE "Register Now" button after all cards

**Files**:
- `components/content/SessionCard.tsx` - Add compact variant OR
- Create `components/content/InlineSessionCard.tsx` - New compact component
- `components/content/MarkdocRenderer.tsx` - Update sessionCard tag
- `content/pages/summer-camp-sessions.mdoc` - Restructure content

**Acceptance**:
- [ ] Single-session camps show one compact card
- [ ] Multi-session camps show stacked compact cards
- [ ] Cards use lighter/translucent version of section background
- [ ] One button per section (not per card)

---

### REQ-GRID-014: Button Styling (SP: 0.5)

**Current**: Buttons have outline style, may not be white
**Target**: White background, text color matches section background

**Changes**:
- Button: White background
- Text: sky-600 (Primary), amber-600 (Junior), emerald-700 (Jr High), purple-700 (Sr High)
- Rounded corners, subtle hover scale

**Files**:
- `components/content/CtaButton.tsx` - Add inverse/white variant
- `content/pages/summer-camp-sessions.mdoc` - Update button variants

**Acceptance**:
- [ ] Buttons have white background
- [ ] Text color matches/complements section background

---

### REQ-GRID-015: Content Order & Layout (SP: 0.8)

**Current**: Content may not flow in correct order
**Target**: Match static design content order

**Order**:
1. Header (TexturedHeading style)
2. Age group subtitle (e.g., "Rising 2nd-3rd Graders")
3. Description paragraph
4. Session card(s) in translucent container
5. Date/price line (for simple sessions)
6. Register Now button

**Files**:
- `content/pages/summer-camp-sessions.mdoc` - Restructure content order
- `components/content/GridSquare.tsx` - Ensure proper prose styling

**Acceptance**:
- [ ] Content flows in correct order
- [ ] Description appears before session cards
- [ ] Button is last element in section

---

## Implementation Plan

### Phase 1: Component Updates (2.5 SP)

1. **Update GridSquare.tsx** - Fix text alignment, prose overrides
2. **Create InlineSessionCard component** - Compact translucent card design
3. **Update CtaButton.tsx** - Add white/inverse variant
4. **Update MarkdocRenderer.tsx** - Register inlineSessionCard tag

### Phase 2: Content Updates (1.5 SP)

1. **Update summer-camp-sessions.mdoc**:
   - Remove "### Sessions" headings
   - Restructure to use new inlineSessionCard components
   - Update button variants to inverse
   - Ensure proper content order

### Phase 3: Verification (1 SP)

1. Local build and visual comparison with static-sessions
2. Deploy and smoke test
3. Screenshot comparison

---

## Files to Modify

| File | Changes |
|------|---------|
| `components/content/GridSquare.tsx` | Text alignment, prose overrides |
| `components/content/CtaButton.tsx` | Add inverse variant |
| `components/content/InlineSessionCard.tsx` | NEW - Compact card design |
| `components/content/MarkdocRenderer.tsx` | Register new component |
| `content/pages/summer-camp-sessions.mdoc` | Restructure content |

---

## Out of Scope (Separate Plan)

**REQ-ADMIN-001: Admin Nav Strip** (from Updates-03 item #3)
- Site-strip admin nav when logged into GitHub CMS
- Black background, white text
- Links: CMS, deployment status, report bug, edit page
- Will be planned in `PLAN-ADMIN-NAV.md`

---

## Visual Reference Summary

### Primary Overnight (image-1.png)
- Large textured header "PRIMARY OVERNIGHT" (dark green)
- "Rising 2nd-3rd Graders" subtitle
- Description text
- "June 4-5, 2026 | $100" bold
- White button with blue text

### Sr. High Camp (image-3.png)
- Large textured header "SR. HIGH CAMP"
- "Rising 10th Graders - Graduates" subtitle
- Single card in lighter purple with rounded corners
  - "SR. HIGH" title, date, price
- Description below card
- White button with purple text

### Junior Camp (image-4.png)
- Large textured header "JUNIOR CAMP"
- "Rising 3rd-6th Graders" subtitle
- THREE stacked cards in lighter orange
  - Each: "JUNIOR 1/2/3", date, price
- Description below cards
- ONE white button with orange text
