# Comprehensive Fix Plan: Updates-02 + Otyokwah Branding + Missing Content

## Overview

This plan addresses three categories of issues following the qrunfree.md TDD workflow:

1. **Otyokwah Logo Scroll Issue** - Logo reverts to Bear Lake when scrolling
2. **Otyokwah Missing Content Pages** - 10 pages returning 404
3. **Updates-02.md Issues** - CMS template issues on bearlakecamp and otyokwah nav

---

## Phase 1: Otyokwah Logo Scroll Issue (0.5 SP)

### Root Cause Analysis
The logo image file at `/images/logo/BLC-Logo-compass-whiteletters-no-background-small.png` was replaced with Otyokwah branding, BUT:
- The new logo has **black text on white background** (not transparent)
- When over the dark green header, it shows as a white box with black text
- Browser caching may show old logo intermittently

### Fix
2. **Option B**: Apply CSS `filter: invert(1)` to logo when over dark background

### Implementation
- [ ] Check if white-text Otyokwah logo exists in mirror
- [ ] If not, use CSS filter approach for consistency
- [ ] Update Header.spec.tsx to reference "Camp Otyokwah" instead of "Bear Lake Camp"

---

## Phase 2: Otyokwah Missing Content Pages (3 SP)

### Pages to Create (from mirror content)

| Missing Page | Source File | Priority |
|--------------|-------------|----------|
| `/about-our-story` | `about-*.html` | P1 |
| `/facilities-dining` | `dining.html` | P1 |
| `/facilities-lodging` | `lodging.html` | P1 |
| `/facilities-meeting-space` | `meeting-space.html` | P1 |
| `/retreats-ignite` | `ignite-retreat.html` | P1 |
| `/retreats-inquiry` | `reservation-inquiry.html` | P2 |
| `/summer-camp-activities` | `activities.html` | P1 |
| `/summer-camp-scholarships` | Create from pricing.html | P2 |
| `/work-at-camp-lit` | `leaders-in-training.html` | P1 |
| `/work-at-camp-volunteer` | Create placeholder | P3 |

### Implementation Steps
1. Extract content from each source HTML file
2. Create `.mdoc` files in `content/pages/` with proper frontmatter
3. Use voice/tone consistent with existing otyokwah pages
4. Ensure heroImage, heroTagline, and SEO fields are populated
5. Update navigation config if needed

---

## Phase 3: Updates-02.md Issues - bearlakecamp (5 SP)

### Issue 3.1: summer-camp-sessions CMS Content Not Showing

**Problem**: The template renders static content instead of reading from CMS

**Investigation**:
- Compare Keystatic CMS page with production page via Chrome
- Identify which fields in the `.mdoc` file are not being rendered
- Check if template uses hardcoded content vs dynamic CMS data

**Fix**:
- Modify template to read body content from CMS
- Ensure all images are editable via CMS fields
- Preserve current design while making content dynamic

### Issue 3.2: work-at-camp-summer-staff CMS Content Not Showing

**Problem**: Same as 3.1 - template not reading CMS body content

**Fix**:
- Update template to render CMS body content
- Remove photo gallery from Keystatic schema (per user request)
- Ensure all visible content is CMS-editable

### Issue 3.3: Field Validation Errors (variant key)

**Pages Affected**: `summer-camp-what-to-bring`, `summer-camp-faq`, `summer-camp-parent-info`

**Error**: `Field validation failed: body: Key on object value "variant" is not allowed`

**Root Cause**: These pages likely have markdoc components in their body that use a `variant` prop, but the schema doesn't allow it.

**Fix Options**:
1. Update Keystatic schema to allow `variant` key in markdoc components
2. Remove/update the problematic markdoc components in the content files
3. Add `variant` to allowed keys in the markdoc component schema

### Issue 3.4: Otyokwah Nav Inconsistency

**Problem**: Different nav appears on `/facilities-lodging` vs `/`

**Investigation**:
- Check if `/facilities-lodging` uses a different layout
- Verify Header component is consistent across page templates
- Check for conditional navigation based on page type

**Fix**:
- Ensure all pages use the same Header component
- Remove any page-specific navigation overrides

---

## Phase 4: Testing Strategy

### Failing Tests First (TDD)
1. Create Playwright test: Logo shows "Camp Otyokwah" text when scrolled
2. Create Playwright test: All 10 missing pages return 200 and content is correct
3. Create Playwright test: CMS body content renders on summer-camp-sessions
4. Create Playwright test: No validation errors when loading CMS pages
5. Create Playwright test: Nav is consistent across all otyokwah pages

### Local Tests
- Run full test suite: `npm run test`
- Run lint: `npm run lint`
- Run typecheck: `npm run typecheck`

### Production Validation
- Run `smoke-test.sh` on both domains
- Chrome validation of all fixes
- Screenshot capture for proof

---

## Phase 5: Execution Order

1. **Fix bearlakecamp CMS issues first** (Issues 3.1-3.3)
   - These are higher priority as they affect content editing
   - Deploy and validate bearlakecamp

2. **Fix otyokwah nav inconsistency** (Issue 3.4)
   - Quick investigation and fix

3. **Create otyokwah missing content pages** (Phase 2)
   - Extract content from mirror
   - Create all 10 pages
   - Deploy and validate

4. **Address logo scroll issue** (Phase 1)
   - Implement CSS filter or obtain proper logo
   - Deploy and validate

---

## Success Criteria

- [ ] All 31 bearlakecamp smoke tests pass (100%)
- [ ] All otyokwah smoke tests pass (including new pages)
- [ ] CMS pages load without validation errors
- [ ] CMS body content renders on templates
- [ ] Logo shows Camp Otyokwah consistently
- [ ] Nav is consistent on all otyokwah pages
- [ ] Playwright tests pass for all new features
- [ ] Screenshot proof of all fixes
- [ ] You use the Chrome Extension to validate all of the fixes
- [ ] You fixed all P0 and P1 issues and any existing issues no matter how old they are along the way.
- [ ] You run the entire plan without stopping through to production deployment playwright test completion and Chrome Extension test completion.
---

## Estimated Total: 8.5 SP

| Phase | Description | Estimate |
|-------|-------------|----------|
| 1 | Logo scroll fix | 0.5 SP |
| 2 | Missing content pages | 3 SP |
| 3.1-3.2 | CMS template fixes | 2 SP |
| 3.3 | Field validation fix | 1 SP |
| 3.4 | Nav consistency fix | 0.5 SP |
| 4-5 | Testing & validation | 1.5 SP |
