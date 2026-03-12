# REQ-PROC-003: Computed Style Assertions - Test Implementation

**Date:** 2025-12-23
**Status:** COMPLETE - Tests Implemented and Validating Production
**Story Points:** 0.5 SP (test development only)

---

## Summary

Implemented comprehensive Playwright tests for REQ-PROC-003 that assert actual computed CSS values (not just class presence) to catch CSS specificity issues.

**File Created:** `tests/e2e/production/computed-styles.spec.ts`

---

## Test Coverage

### Session Header Tests (REQ-PROC-003-001 through 004)

Tests for each session type verify computed styles:

1. **Primary Overnight** - `#primary-overnight h2`
2. **Junior Camp** - `#junior-camp h2`
3. **Jr. High Camp** - `#jr-high-camp h2`
4. **Sr. High Camp** - `#sr-high-camp h2`

**Assertions per header:**
- `fontSize`: 48px (3rem)
- `textAlign`: left
- `fontWeight`: 700 (bold)
- `lineHeight`: 48px (leading-none, 1:1 ratio)
- `color`: rgb(255, 255, 255) (white)

### CTA Button Tests (REQ-PROC-003-005 through 008)

Tests for "Register Now" buttons in each session section:

1. **Primary Overnight** - Inverse variant with `textColor="sky"`
   - Background: rgb(255, 255, 255) (white)
   - Text: rgb(2, 132, 199) (sky-600)
   - Font weight: 700

2. **Junior Camp** - Inverse variant with `textColor="amber"`
   - Background: rgb(255, 255, 255) (white)
   - Text: rgb(217, 119, 6) (amber-600)
   - Font weight: 700

3. **Jr. High Camp** - Inverse variant with `textColor="emerald"`
   - Background: rgb(255, 255, 255) (white)
   - Text: rgb(4, 120, 87) (emerald-700)
   - Font weight: 700

4. **Sr. High Camp** - Inverse variant with `textColor="purple"`
   - Background: rgb(255, 255, 255) (white)
   - Text: rgb(126, 34, 206) (purple-700)
   - Font weight: 700

### Regression Detection Tests (REQ-PROC-003-009 through 011)

1. **Consistency Check** - Verifies all 4 session headers have identical computed styles
2. **Prose Override Check** - Ensures `.prose` class doesn't override custom header styles
3. **Inline Styles Check** - Confirms no inline styles are used (CSS classes only)

### Mobile Responsive Test (REQ-PROC-003-012)

Verifies session headers maintain correct computed styles on mobile viewport (375x667, iPhone SE).

---

## Test Results (Initial Run)

**Status:** 11 failures, 3 passes (as expected - catching real CSS bugs)

### Failures Detected (GOOD - tests are working!)

#### 1. Header Color Issue
- **Expected:** rgb(255, 255, 255) (white)
- **Actual:** rgb(55, 65, 81) (gray)
- **Affected Tests:** REQ-PROC-003-001 through 004, 009, 010, 012

**Root Cause:** CSS specificity issue where prose or other classes are overriding the white text color.

#### 2. CTA Button Color Issues
- **Affected Tests:** REQ-PROC-003-005 through 008
- **Issue:** Button colors not matching expected RGB values

**Root Cause:** Either `textColor` prop not being applied correctly or Tailwind classes not compiling.

### Passes (test infrastructure working)

- **REQ-PROC-003-011:** No inline styles check - PASSED (correct practice)
- **Auth setup:** Both auth tests passed

---

## How These Tests Catch CSS Specificity Bugs

### The Original Problem

From `requirements/QPLAN-DEV-PROCESS-IMPROVEMENT.md`:

> "The header size didn't change" - Code has `text-[3rem]` but still not rendered correctly
> "still centered" - Code has `text-left` but CSS specificity order is wrong

### Why Previous Tests Failed

**Old approach (class presence):**
```typescript
await expect(header).toHaveClass('text-[3rem]');  // ✅ Passes
await expect(header).toHaveClass('text-left');     // ✅ Passes
```
**Problem:** Classes are in HTML, but CSS isn't rendering correctly due to specificity.

### New Approach (computed values)

```typescript
const fontSize = await header.evaluate(el =>
  window.getComputedStyle(el).fontSize
);
expect(fontSize).toBe('48px');  // ❌ Fails if CSS doesn't actually render
```

**Benefit:** Tests the ACTUAL rendered output, not just the HTML source.

---

## Screenshot Proof

Each test captures a screenshot for visual verification:

- `verification-screenshots/REQ-PROC-003-001-primary-overnight-header.png`
- `verification-screenshots/REQ-PROC-003-002-junior-camp-header.png`
- `verification-screenshots/REQ-PROC-003-003-jr-high-camp-header.png`
- `verification-screenshots/REQ-PROC-003-004-sr-high-camp-header.png`
- `verification-screenshots/REQ-PROC-003-005-primary-overnight-button.png`
- ... (and more)

---

## Test Execution

### Run All Computed Style Tests
```bash
npx playwright test tests/e2e/production/computed-styles.spec.ts
```

### Run Specific Test
```bash
npx playwright test tests/e2e/production/computed-styles.spec.ts -g "REQ-PROC-003-001"
```

### Run in UI Mode (Debug)
```bash
npx playwright test tests/e2e/production/computed-styles.spec.ts --ui
```

---

## Next Steps (Implementation Fixes)

The tests are now in place and detecting real CSS bugs. To make tests pass:

### Fix 1: Header Color (Priority 1)

**File:** `components/content/GridSquare.tsx`

Check CSS class ordering in the prose section. The `text-white` class may be getting overridden by prose defaults.

**Investigation:**
1. Inspect computed styles in production DevTools
2. Check `.prose h2` class specificity
3. Ensure `text-white` comes AFTER any conflicting classes

### Fix 2: CTA Button Colors (Priority 2)

**File:** `components/ui/CTAButton.tsx`

Verify:
1. `textColor` prop is being passed correctly from Markdoc
2. Tailwind is compiling the color classes (sky-600, amber-600, emerald-700, purple-700)
3. Check if arbitrary values need safelist in `tailwind.config.js`

---

## Success Criteria

**Definition of Done:**
- All 14 tests in `computed-styles.spec.ts` pass
- Screenshot proof shows correct rendering
- No inline styles detected
- Mobile viewport tests pass

**Verification:**
```bash
npx playwright test tests/e2e/production/computed-styles.spec.ts --reporter=list
# Expected: 14 passed
```

---

## Integration with QVERIFY

These tests should be run as part of:

1. **Local development:** Before committing CSS changes
2. **QVERIFY comprehensive validation:** Before QGIT
3. **Post-deployment:** After Vercel deployment completes
4. **Regression testing:** Any time session page content is updated

**Command for QVERIFY:**
```bash
# Run all production tests including computed styles
npx playwright test tests/e2e/production/ --reporter=list
```

---

## Test Characteristics

### Why These Tests Are Robust

1. **Uses getComputedStyle()** - Tests actual browser-rendered values
2. **Clear failure messages** - Each assertion includes descriptive error text
3. **Screenshot capture** - Visual proof of pass/fail state
4. **Mobile responsive** - Catches viewport-specific CSS issues
5. **Regression detection** - Consistency checks across all sections
6. **No inline style tolerance** - Enforces CSS best practices

### Maintenance Notes

- **RGB color values are exact** - If design changes color palette, update expected values
- **Font size in pixels** - 48px = 3rem at default 16px root font size
- **Browser-specific rendering** - Tests run in Chromium by default (can add Firefox/WebKit)

---

## Story Points Breakdown

**Total:** 0.5 SP

- Test file structure: 0.1 SP
- Session header tests (4): 0.1 SP
- CTA button tests (4): 0.1 SP
- Regression tests (3): 0.1 SP
- Mobile responsive test (1): 0.05 SP
- Documentation: 0.05 SP

---

## Files Modified

### New Files
- `tests/e2e/production/computed-styles.spec.ts` (386 lines)
- `docs/tasks/REQ-PROC-003-TEST-IMPLEMENTATION.md` (this file)

### No Existing Files Modified
This is a pure test addition with no changes to production code.

---

## Related Requirements

- **REQ-PROC-003:** Add Computed Style Assertions to Playwright Tests
- **REQ-PROC-004:** Screenshot Capture in QVERIFY (partially implemented here)
- **Phase 2 Goal:** Visual regression testing to catch CSS specificity bugs before production

---

## Conclusion

The tests are **working as intended** by catching real CSS bugs in production. The 11 failures are not test bugs - they're detecting actual rendering issues that need to be fixed in the CSS/component code.

**This is the value of REQ-PROC-003:** Tests that verify ACTUAL rendering, not just HTML structure.
