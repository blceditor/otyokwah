# QPLAN: Updates-03 Bug Fixes (v2 - Team Reviewed)

**Created**: 2025-12-23
**Revised**: 2025-12-23 (Incorporated PE, Test, SDE-III, PM feedback)
**Total SP**: 6.8 SP (4 batches)
**Execution Mode**: Autonomous with visual verification gates

---

## Revision Summary

| Change | Reason |
|--------|--------|
| Grid fix: Content reorder, not code | PE: Runtime prop access doesn't work |
| Button fix: Surgical `:not()` selector | SDE-III: Full removal breaks prose links |
| Added 4 missing requirements | PM: Only 4/14 requirements were covered |
| Re-prioritized batches | PM: Blocking issues weren't in Batch 1 |
| Fixed all test strategies | Test-Writer: Tests checked DOM, not styles |
| Updated SP estimates | Team: Several under-estimated |

---

## Context (MUST READ ON RESUME)

### Production State
- **URL**: https://prelaunch.bearlakecamp.com/summer-camp-sessions
- **Branch**: main
- **Known Bugs**:
  - Grid rows 2 & 4 show image LEFT (should be content LEFT)
  - AnchorNav has green bullets, gray text (should be no bullets, white text)
  - CTA button text is WHITE (should be section-matching color)
  - Admin edit URL format wrong
  - Header size not 3rem (still broken)
  - Keystatic testing-components validation error
  - Admin nav shows in CMS (shouldn't)

### Critical Code Context

**SquareGrid** (`components/content/SquareGrid.tsx`):
- Line 40: `const isImageLeft = index % 2 === 0;`
- Logic is CORRECT - problem is content file ordering

**GridSquare** (`components/content/GridSquare.tsx`):
- Line 83: `[&_a]:!text-inherit` overrides ALL link colors
- FIX: Use `[&_a:not([class*='text-'])]:!text-inherit` (surgical)

**AnchorNav** (`components/content/AnchorNav.tsx`):
- Line 32: Missing `list-none` class
- Line 37: `text-cream` should be `text-white`

**AdminNavStrip** (`components/admin/AdminNavStrip.tsx`):
- Lines 24-31: URL missing `/branch/main/` and `/item/`

---

## Batch 1A: Blocking Issues (1.8 SP)

*These block content editing or are visible regressions*

### REQ-U03-FIX-001: Alternating Row Pattern (0.5 SP)

**Problem**: Rows 2 and 4 show image on LEFT, should show content on LEFT.

**Root Cause**: Content file ordering doesn't match visual intent. SquareGrid logic is correct.

**Solution**: Reorder `{% gridSquare %}` tags in mdoc file. ZERO code changes.

**Implementation**:
1. Edit `content/pages/summer-camp-sessions.mdoc`
2. Current order creates pairs: [Img,Content], [Content,Img], [Img,Content], [Content,Img]
3. SquareGrid alternates display order by pair INDEX, not content type
4. Reorder so each pair has IMAGE FIRST:
   - Row 1: Keep as-is (image line 25, content line 27) ✓
   - Row 2: SWAP - move image (line 57) BEFORE content (line 41)
   - Row 3: Keep as-is (image line 59, content line 61) ✓
   - Row 4: SWAP - move image (line 91) BEFORE content (line 77)

**Test** (`tests/e2e/production/grid-alternating.spec.ts`):
```typescript
test('REQ-U03-FIX-001 — rows alternate image/content positions', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/summer-camp-sessions');

  const sections = page.locator('section[role="region"]');

  // Row 1: Image should be visually LEFT (lower x position)
  const row1Divs = await sections.nth(0).locator('> div').all();
  const row1Boxes = await Promise.all(row1Divs.map(d => d.boundingBox()));
  const row1ImageIdx = await sections.nth(0).evaluate(s => {
    const divs = Array.from(s.querySelectorAll(':scope > div'));
    return divs.findIndex(d => d.querySelector('img') !== null);
  });
  expect(row1Boxes[row1ImageIdx]!.x, 'Row 1: image should be LEFT').toBeLessThan(row1Boxes[1 - row1ImageIdx]!.x);

  // Row 2: Content should be visually LEFT (image on RIGHT)
  const row2Divs = await sections.nth(1).locator('> div').all();
  const row2Boxes = await Promise.all(row2Divs.map(d => d.boundingBox()));
  const row2ImageIdx = await sections.nth(1).evaluate(s => {
    const divs = Array.from(s.querySelectorAll(':scope > div'));
    return divs.findIndex(d => d.querySelector('img') !== null);
  });
  expect(row2Boxes[row2ImageIdx]!.x, 'Row 2: image should be RIGHT').toBeGreaterThan(row2Boxes[1 - row2ImageIdx]!.x);

  // Row 3: Image should be visually LEFT
  const row3ImageIdx = await sections.nth(2).evaluate(s => {
    const divs = Array.from(s.querySelectorAll(':scope > div'));
    return divs.findIndex(d => d.querySelector('img') !== null);
  });
  const row3Boxes = await Promise.all((await sections.nth(2).locator('> div').all()).map(d => d.boundingBox()));
  expect(row3Boxes[row3ImageIdx]!.x, 'Row 3: image should be LEFT').toBeLessThan(row3Boxes[1 - row3ImageIdx]!.x);

  // Row 4: Content should be visually LEFT (image on RIGHT)
  const row4ImageIdx = await sections.nth(3).evaluate(s => {
    const divs = Array.from(s.querySelectorAll(':scope > div'));
    return divs.findIndex(d => d.querySelector('img') !== null);
  });
  const row4Boxes = await Promise.all((await sections.nth(3).locator('> div').all()).map(d => d.boundingBox()));
  expect(row4Boxes[row4ImageIdx]!.x, 'Row 4: image should be RIGHT').toBeGreaterThan(row4Boxes[1 - row4ImageIdx]!.x);
});
```

---

### REQ-U03-FIX-002: AnchorNav No Bullets + White Text (0.2 SP)

**Problem**: Green bullets before session names, text is green/cream instead of white.

**Implementation**:
1. Edit `components/content/AnchorNav.tsx` line 32:
   ```tsx
   // BEFORE:
   <ul className="flex flex-wrap justify-center gap-4 md:gap-8">

   // AFTER:
   <ul className="list-none flex flex-wrap justify-center gap-4 md:gap-8">
   ```

2. Edit line 37:
   ```tsx
   // BEFORE:
   className="text-cream hover:text-white transition-colors font-medium..."

   // AFTER:
   className="text-white hover:text-white/80 transition-colors font-medium..."
   ```

**Test** (`tests/e2e/production/anchor-nav.spec.ts`):
```typescript
test.describe('REQ-U03-FIX-002 — AnchorNav styling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/summer-camp-sessions');
  });

  test('no bullets on navigation list', async ({ page }) => {
    const ul = page.locator('nav[aria-label="Page section navigation"] ul');
    const listStyle = await ul.evaluate(el => window.getComputedStyle(el).listStyleType);
    expect(listStyle).toBe('none');
  });

  test('all session links are white', async ({ page }) => {
    const links = page.locator('nav[aria-label="Page section navigation"] a');
    const count = await links.count();

    for (let i = 0; i < count; i++) {
      const color = await links.nth(i).evaluate(el => window.getComputedStyle(el).color);
      expect(color, `Link ${i + 1} should be white`).toBe('rgb(255, 255, 255)');
    }
  });
});
```

---

### REQ-U03-FIX-009: Header Size 3rem (0.3 SP) — **NEW**

**Problem**: Session headers (Primary Overnight, Junior Camp, etc.) are not 3rem/48px.

**Customer Feedback**: "[TS- The header size didn't change]"

**Implementation**:
1. Verify `components/content/GridSquare.tsx` line 83 has:
   ```tsx
   [&_h2]:!text-[3rem] [&_h2]:!leading-none
   ```

2. If present but not working, check CSS specificity. May need:
   ```tsx
   [&_h2]:!text-[48px]
   ```

3. Verify `tailwind.config.ts` safelist includes these classes.

**Test** (`tests/e2e/production/session-headers.spec.ts`):
```typescript
test('REQ-U03-FIX-009 — session headers are 3rem/48px', async ({ page }) => {
  await page.goto('/summer-camp-sessions');

  const headers = ['#primary-overnight h2', '#junior-camp h2', '#jr-high-camp h2', '#sr-high-camp h2'];

  for (const selector of headers) {
    const header = page.locator(selector).first();
    const styles = await header.evaluate(el => {
      const cs = window.getComputedStyle(el);
      return { fontSize: cs.fontSize, lineHeight: cs.lineHeight, color: cs.color };
    });

    expect(styles.fontSize, `${selector} fontSize`).toBe('48px');
    expect(styles.color, `${selector} color`).toBe('rgb(255, 255, 255)');
  }
});
```

---

### REQ-U03-FIX-010: Keystatic Testing-Components Error (0.5 SP) — **NEW**

**Problem**: `/keystatic/branch/main/collection/pages/item/testing-components` shows validation error:
> "Field validation failed: body: Unexpected error: Error: 44:tag has unexpected children 47:tag has unexpected children 50:tag has unexpected children"

**Purpose**: This page is used in smoke-tests to verify all components load correctly.

**Investigation Required**:
1. Read `content/pages/testing-components.mdoc`
2. Check lines 44, 47, 50 for invalid Markdoc tag nesting
3. Verify Markdoc schema in `keystatic.config.tsx` allows the tag combinations used

**Likely Fix**: Markdoc schema doesn't allow certain child tags. Update schema or fix content.

**Test** (`tests/e2e/production/keystatic-validation.spec.ts`):
```typescript
test('REQ-U03-FIX-010 — testing-components page loads without errors', async ({ page }) => {
  // Navigate to Keystatic editor for testing-components
  await page.goto('/keystatic/branch/main/collection/pages/item/testing-components');

  // Should NOT show validation error
  const errorText = page.locator('text=Field validation failed');
  await expect(errorText).not.toBeVisible({ timeout: 5000 });

  // Should show the editor content
  const editor = page.locator('[data-keystatic-editor]');
  await expect(editor).toBeVisible();
});
```

---

### REQ-U03-FIX-011: Hide Admin Nav in CMS (0.3 SP) — **NEW**

**Problem**: Admin nav strip shows inside Keystatic CMS where it's not needed.

**Implementation**:
Edit `components/admin/AdminNavStrip.tsx`:
```typescript
export function AdminNavStrip() {
  const pathname = usePathname();

  // Don't show admin strip inside Keystatic CMS
  if (pathname?.startsWith('/keystatic')) {
    return null;
  }

  // ... rest of component
}
```

**Test** (`components/admin/AdminNavStrip.spec.tsx` - update existing):
```typescript
test('REQ-U03-FIX-011 — does not render on keystatic pages', () => {
  (usePathname as jest.Mock).mockReturnValue('/keystatic/branch/main');
  render(<AdminNavStrip />);

  expect(screen.queryByTestId('admin-nav-strip')).not.toBeInTheDocument();
});
```

---

## Batch 1B: Visual Regressions (1.3 SP)

### REQ-U03-FIX-003: CTA Button Text Color Regression (0.8 SP)

**Problem**: Button text is WHITE (invisible). Should be section-matching color.

**Root Cause**: `[&_a]:!text-inherit` in GridSquare overrides CTAButton's explicit colors.

**⚠️ WARNING**: Simply removing `[&_a]:!text-inherit` will break prose markdown links!

**Surgical Fix** - Edit `components/content/GridSquare.tsx` line 83:
```tsx
// BEFORE:
className="prose prose-lg max-w-none !text-inherit [&_h2]:!text-inherit [&_h3]:!text-inherit [&_p]:!text-inherit [&_li]:!text-inherit [&_strong]:!text-inherit [&_a]:!text-inherit ..."

// AFTER (exempt links with explicit text-color classes):
className="prose prose-lg max-w-none !text-inherit [&_h2]:!text-inherit [&_h3]:!text-inherit [&_p]:!text-inherit [&_li]:!text-inherit [&_strong]:!text-inherit [&_a:not([class*='text-'])]:!text-inherit ..."
```

**Test** (`tests/e2e/production/cta-button-colors.spec.ts`):
```typescript
test.describe('REQ-U03-FIX-003 — CTA button colors', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/summer-camp-sessions');
  });

  test('Primary Overnight button has sky-600 text', async ({ page }) => {
    const button = page.locator('#primary-overnight a[href*="ultracamp"]');
    const color = await button.evaluate(el => window.getComputedStyle(el).color);
    expect(color).toBe('rgb(2, 132, 199)'); // sky-600
  });

  test('Junior Camp button has amber-600 text', async ({ page }) => {
    const button = page.locator('#junior-camp a[href*="ultracamp"]');
    const color = await button.evaluate(el => window.getComputedStyle(el).color);
    expect(color).toBe('rgb(217, 119, 6)'); // amber-600
  });

  test('Jr. High button has emerald-700 text', async ({ page }) => {
    const button = page.locator('#jr-high-camp a[href*="ultracamp"]');
    const color = await button.evaluate(el => window.getComputedStyle(el).color);
    expect(color).toBe('rgb(4, 120, 87)'); // emerald-700
  });

  test('Sr. High button has purple-700 text', async ({ page }) => {
    const button = page.locator('#sr-high-camp a[href*="ultracamp"]');
    const color = await button.evaluate(el => window.getComputedStyle(el).color);
    expect(color).toBe('rgb(126, 34, 206)'); // purple-700
  });

  test('prose markdown links still inherit white', async ({ page }) => {
    // Verify prose links without explicit text-color classes still work
    await page.goto('/summer-camp-sessions');
    await page.locator('#primary-overnight').scrollIntoViewIfNeeded();

    // If there are any prose links (e.g., "contact us"), they should be white
    const proseLinks = page.locator('#primary-overnight .prose a:not([class*="text-"])');
    const count = await proseLinks.count();

    for (let i = 0; i < count; i++) {
      const color = await proseLinks.nth(i).evaluate(el => window.getComputedStyle(el).color);
      expect(color, 'Prose links should inherit white').toBe('rgb(255, 255, 255)');
    }
  });
});
```

---

### REQ-U03-FIX-004: Admin Edit URL Format (0.3 SP)

**Problem**: Edit Page link goes to wrong URL format.

**Current**: `/keystatic/collection/pages/about`
**Required**: `/keystatic/branch/main/collection/pages/item/about`

**Implementation** - Edit `components/admin/AdminNavStrip.tsx` lines 24-31:
```typescript
const getEditUrl = () => {
  if (pathname === "/") {
    return "/keystatic/branch/main/collection/pages/item/index";
  }
  const pagePath = pathname.slice(1).replace(/\//g, "-");
  return `/keystatic/branch/main/collection/pages/item/${pagePath}`;
};
```

**Test** (`components/admin/AdminNavStrip.spec.tsx` - update existing):
```typescript
describe('REQ-U03-FIX-004 — Edit Page URL format', () => {
  test('homepage generates correct Keystatic URL', () => {
    (usePathname as jest.Mock).mockReturnValue('/');
    render(<AdminNavStrip />);

    const editLink = screen.getByRole('link', { name: /edit page/i });
    expect(editLink).toHaveAttribute('href', '/keystatic/branch/main/collection/pages/item/index');
  });

  test('about page generates correct Keystatic URL', () => {
    (usePathname as jest.Mock).mockReturnValue('/about');
    render(<AdminNavStrip />);

    const editLink = screen.getByRole('link', { name: /edit page/i });
    expect(editLink).toHaveAttribute('href', '/keystatic/branch/main/collection/pages/item/about');
  });

  test('nested path generates correct Keystatic URL', () => {
    (usePathname as jest.Mock).mockReturnValue('/work-at-camp/counselors');
    render(<AdminNavStrip />);

    const editLink = screen.getByRole('link', { name: /edit page/i });
    expect(editLink).toHaveAttribute('href', '/keystatic/branch/main/collection/pages/item/work-at-camp-counselors');
  });
});
```

---

### REQ-U03-FIX-007: Register Button Top Padding (0.2 SP)

**Problem**: Register Now button needs more spacing above it.

**Implementation** - Edit `components/content/GridSquare.tsx`:
Add margin-top to button container or update prose spacing:
```tsx
// Add to prose classes:
[&_.cta-button]:mt-6
```

Or wrap CTAButton rendering with spacing div in the mdoc content.

**Test**:
```typescript
test('REQ-U03-FIX-007 — Register button has adequate top spacing', async ({ page }) => {
  await page.goto('/summer-camp-sessions');

  const button = page.locator('#primary-overnight a[href*="ultracamp"]');
  const buttonBox = await button.boundingBox();

  // Find the text element above the button
  const textAbove = page.locator('#primary-overnight p').last();
  const textBox = await textAbove.boundingBox();

  const spacing = buttonBox!.y - (textBox!.y + textBox!.height);
  expect(spacing, 'Button should have at least 24px spacing above').toBeGreaterThanOrEqual(24);
});
```

---

## Batch 2: Spacing & Polish (0.7 SP)

### REQ-U03-FIX-006: Session Card Tight Spacing (0.5 SP)

**Problem**: Session sub-cards have too much vertical spacing.

**Visual Reference**: `requirements/image-10.png` shows desired tight spacing.

**Implementation**:
1. Find session card component (likely `InlineSessionCard` or similar)
2. Reduce padding/margin between cards
3. Compare to static-sessions page styling

**Test**:
```typescript
test('REQ-U03-FIX-006 — session cards have tight spacing', async ({ page }) => {
  await page.goto('/summer-camp-sessions');

  // Get Junior Camp cards (has 3 cards)
  const cards = page.locator('#junior-camp [data-session-card]');
  const count = await cards.count();

  if (count >= 2) {
    const card1Box = await cards.nth(0).boundingBox();
    const card2Box = await cards.nth(1).boundingBox();

    const gap = card2Box!.y - (card1Box!.y + card1Box!.height);
    expect(gap, 'Card gap should be <= 16px').toBeLessThanOrEqual(16);
  }
});
```

---

### REQ-U03-FIX-014: AnchorNav No Bullets (Mobile) (0.2 SP)

**Problem**: Need to verify bullets fix works on mobile too.

**Test**:
```typescript
test.describe('Mobile responsive verification', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('REQ-U03-FIX-002 — nav bullets removed on mobile', async ({ page }) => {
    await page.goto('/summer-camp-sessions');

    const ul = page.locator('nav[aria-label="Page section navigation"] ul');
    const listStyle = await ul.evaluate(el => window.getComputedStyle(el).listStyleType);
    expect(listStyle).toBe('none');
  });

  test('grid stacks vertically on mobile', async ({ page }) => {
    await page.goto('/summer-camp-sessions');

    const section = page.locator('section[role="region"]').first();
    const flexDir = await section.evaluate(el => window.getComputedStyle(el).flexDirection);
    expect(flexDir).toBe('column');
  });
});
```

---

## Batch 3: Bottom Template (3.0 SP) — SEPARATE SCOPE

### REQ-U03-FIX-008: Static Sessions Bottom Template

**Problem**: Bottom of page doesn't match static-sessions template.

**Customer Feedback**: "[TS-not even close to right]"

**Scope** (6 components):
1. Registration card 1 (Online Registration)
2. Registration card 2 (Scholarships Available)
3. Registration card 3 (Share the Love)
4. Registration card 4 (Grade Levels)
5. Green CTA row "Scholarships Available" (white heading, green button text)
6. Brown CTA row "Ready to Register" (white heading, brown button text)

**Visual References**: `requirements/image-5.png`, `requirements/image-6.png`

**Implementation**: Build new components - cleaner than refactoring.

**Sub-requirements**:
- REQ-U03-FIX-008a: 4-card registration info grid (1.0 SP)
- REQ-U03-FIX-008b: Green scholarships CTA row (0.8 SP)
- REQ-U03-FIX-008c: Brown register CTA row (0.8 SP)
- REQ-U03-FIX-008d: Integration and testing (0.4 SP)

*Detailed acceptance criteria to be written before implementation.*

---

## Batch 4: Future Enhancements (1.0 SP)

### REQ-U03-FIX-012: Report Bug Screenshot Capture (1.0 SP)

**Problem**: Customer wants screenshot capture in bug reports.

**Customer Feedback**: Lowest priority, but browser screenshot desired.

**Implementation Options**:
- Use `navigator.clipboard` + `html2canvas` for page screenshot
- Attach to GitHub issue as base64 or upload to temp storage

**Deferred**: Implement after core fixes are stable.

---

## Execution Protocol

### Before Each Batch

```bash
# 1. Capture baseline screenshot
npx playwright screenshot https://prelaunch.bearlakecamp.com/summer-camp-sessions \
  --output requirements/baselines/batch-XX-BEFORE.png

# 2. Verify git state
git status && git log -1 --oneline

# 3. Read this plan section completely
```

### After Each Fix

```bash
# 1. Type check
npm run typecheck

# 2. Lint
npm run lint

# 3. Run specific test
npm test -- [test-file].spec.ts

# 4. Run anti-regression suite
npm test -- tests/e2e/production/*.spec.ts
```

### After Batch Complete

```bash
# 1. Full test suite
npm test

# 2. Commit with REQ-IDs
git add . && git commit -m "fix(ui): Batch 1A - grid, nav, headers, keystatic, admin

- REQ-U03-FIX-001: Reorder content for alternating grid pattern
- REQ-U03-FIX-002: Remove bullets, white text on anchor nav
- REQ-U03-FIX-009: Verify header size 3rem/48px
- REQ-U03-FIX-010: Fix Keystatic testing-components validation
- REQ-U03-FIX-011: Hide admin nav in CMS

Story Points: 1.8 SP"

# 3. Push and wait for Vercel
git push && sleep 120

# 4. Production smoke test
./scripts/smoke-test.sh --force prelaunch.bearlakecamp.com

# 5. Capture AFTER screenshot
npx playwright screenshot https://prelaunch.bearlakecamp.com/summer-camp-sessions \
  --output requirements/baselines/batch-XX-AFTER.png
```

---

## Anti-Regression Test Suite (Automated)

Create `tests/e2e/production/anti-regression.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Anti-Regression Suite @anti-regression', () => {
  test('hero video exists and loads', async ({ page }) => {
    await page.goto('/summer-camp-sessions');
    const video = page.locator('video').first();
    await expect(video).toBeVisible();
  });

  test('all session sections render', async ({ page }) => {
    await page.goto('/summer-camp-sessions');

    for (const id of ['#primary-overnight', '#junior-camp', '#jr-high-camp', '#sr-high-camp']) {
      await expect(page.locator(id)).toBeVisible();
    }
  });

  test('navigation menu works', async ({ page }) => {
    await page.goto('/summer-camp-sessions');
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible();
  });

  test('footer renders', async ({ page }) => {
    await page.goto('/summer-camp-sessions');
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });

  test('all pages return HTTP 200', async ({ request }) => {
    const pages = [
      '/', '/about', '/summer-camp', '/summer-camp-sessions',
      '/work-at-camp', '/retreats', '/facilities', '/give'
    ];

    for (const path of pages) {
      const response = await request.get(`https://prelaunch.bearlakecamp.com${path}`);
      expect(response.status(), `${path} should return 200`).toBe(200);
    }
  });
});
```

Run with: `npm test -- --grep @anti-regression`

---

## Context Handoff Template

If context exceeds 70%, create this summary:

```markdown
# Handoff: Updates-03 Fixes

## Session Info
- Context: [%]
- Branch: main
- Last commit: [sha]

## Batch Status
- [x] Batch 1A: 1.8 SP (grid, nav, headers, keystatic, admin-hide)
- [ ] Batch 1B: 1.3 SP (buttons, admin-url, button-padding)
- [ ] Batch 2: 0.7 SP (card spacing, mobile)
- [ ] Batch 3: 3.0 SP (bottom template)
- [ ] Batch 4: 1.0 SP (screenshot feature)

## Current Task
[What's in progress]

## Blockers
[Any issues]

## Next Action
[Specific next step with file:line]

## Test Commands
npm run typecheck
npm test -- tests/e2e/production/[specific].spec.ts
./scripts/smoke-test.sh --force prelaunch.bearlakecamp.com
```

---

## Success Criteria

### Batch 1A Complete When:
- [ ] Grid rows alternate correctly (visual proof)
- [ ] AnchorNav has no bullets, white text (computed style test)
- [ ] Headers are 48px (computed style test)
- [ ] Keystatic testing-components loads without error
- [ ] Admin nav hidden in CMS
- [ ] Smoke test passes (29/29 pages HTTP 200)
- [ ] Anti-regression suite passes

### Batch 1B Complete When:
- [ ] CTA buttons have colored text (sky, amber, emerald, purple)
- [ ] Prose links still inherit white (no regression)
- [ ] Admin edit URL format correct
- [ ] Register button has adequate top spacing

---

## Story Point Summary

| Batch | SP | Requirements |
|-------|-----|--------------|
| 1A | 1.8 | FIX-001, 002, 009, 010, 011 |
| 1B | 1.3 | FIX-003, 004, 007 |
| 2 | 0.7 | FIX-006, 014 |
| 3 | 3.0 | FIX-008 (bottom template) |
| 4 | 1.0 | FIX-012 (screenshot) |
| **Total** | **7.8** | |

---

## Files to Modify

| File | Batch | Changes |
|------|-------|---------|
| `content/pages/summer-camp-sessions.mdoc` | 1A | Reorder gridSquare tags |
| `components/content/AnchorNav.tsx` | 1A | Add list-none, text-white |
| `components/content/GridSquare.tsx` | 1A, 1B | Verify headers, surgical CSS fix |
| `content/pages/testing-components.mdoc` | 1A | Fix Markdoc nesting |
| `components/admin/AdminNavStrip.tsx` | 1A, 1B | Hide in CMS, fix URL |
| `keystatic.config.tsx` | 1A | Possibly update schema |
