# QPLAN: Updates-03 Bug Fixes

**Created**: 2025-12-23
**Total SP**: 3.5 SP (split into 2 batches)
**Execution Mode**: Autonomous with visual verification gates

---

## Context (MUST READ ON RESUME)

### Production State
- **URL**: https://prelaunch.bearlakecamp.com/summer-camp-sessions
- **Branch**: main
- **Key Files**:
  - `components/content/SquareGrid.tsx` - alternating row logic
  - `components/content/AnchorNav.tsx` - navigation bullets
  - `components/content/GridSquare.tsx` - prose CSS overrides
  - `components/admin/AdminNavStrip.tsx` - edit URL format

### Critical Code Context

**SquareGrid Bug** (line 40):
```typescript
// BUG: Assumes pair[0] is always image
const isImageLeft = index % 2 === 0;
```

**GridSquare Regression** (line 83):
```typescript
// BUG: [&_a]:!text-inherit overrides button colors
className="... [&_a]:!text-inherit ..."
```

**AnchorNav Bug** (line 32):
```typescript
// BUG: Missing list-none class
<ul className="flex flex-wrap ...">
```

**AdminNavStrip Bug** (lines 24-30):
```typescript
// BUG: Wrong URL format
return `/keystatic/collection/pages/${pagePath}`;
// SHOULD BE:
return `/keystatic/branch/main/collection/pages/item/${pagePath}`;
```

---

## Batch 1: Visual Fixes (2.0 SP)

### REQ-U03-FIX-001: Alternating Row Pattern (1.0 SP)

**Problem**: Rows 2 and 4 show image on LEFT, should show content on LEFT.

**Acceptance Criteria** (COMPUTED STYLE VERIFICATION):
```typescript
// Row 1: Image LEFT (order: 1), Content RIGHT (order: 2)
// Row 2: Content LEFT (order: 1), Image RIGHT (order: 2)
// Row 3: Image LEFT (order: 1), Content RIGHT (order: 2)
// Row 4: Content LEFT (order: 1), Image RIGHT (order: 2)
```

**Visual Reference**: `requirements/image-7.png` shows current broken state

**Implementation**:
1. Edit `components/content/SquareGrid.tsx`
2. Change logic to check content TYPE, not just index:
   ```typescript
   // Detect if first child is image based on props
   const firstChildIsImage = React.isValidElement(pair[0]) &&
     pair[0].props?.contentType === 'image';

   // Alternate based on row index
   const shouldSwap = index % 2 === 1;
   ```

**Test** (`tests/e2e/production/grid-alternating.spec.ts`):
```typescript
test('rows alternate image/content positions', async ({ page }) => {
  await page.goto('/summer-camp-sessions');

  const sections = page.locator('section[role="region"]');

  // Row 1: first child should have image
  const row1FirstChild = sections.nth(0).locator('> div').first();
  await expect(row1FirstChild.locator('img')).toBeVisible();

  // Row 2: first child should have h2 (content, not image)
  const row2FirstChild = sections.nth(1).locator('> div').first();
  await expect(row2FirstChild.locator('h2')).toBeVisible();

  // Row 3: first child should have image
  const row3FirstChild = sections.nth(2).locator('> div').first();
  await expect(row3FirstChild.locator('img')).toBeVisible();

  // Row 4: first child should have h2 (content, not image)
  const row4FirstChild = sections.nth(3).locator('> div').first();
  await expect(row4FirstChild.locator('h2')).toBeVisible();
});
```

---

### REQ-U03-FIX-002: AnchorNav No Bullets + White Text (0.2 SP)

**Problem**: Green bullets before session names, text is green instead of white.

**Acceptance Criteria** (COMPUTED STYLE VERIFICATION):
```typescript
// UL element: list-style-type = 'none'
// Session name links: color = 'rgb(255, 255, 255)'
```

**Visual Reference**:
- Current: `requirements/image-8.png` (bullets, green text)
- Desired: `requirements/image-9.png` (no bullets, white text)

**Implementation**:
1. Edit `components/content/AnchorNav.tsx` line 32:
   ```tsx
   // BEFORE:
   <ul className="flex flex-wrap justify-center gap-4 md:gap-8">

   // AFTER:
   <ul className="list-none flex flex-wrap justify-center gap-4 md:gap-8">
   ```

2. Edit line 37 - change `text-cream` to `text-white`:
   ```tsx
   // BEFORE:
   className="text-cream hover:text-white ..."

   // AFTER:
   className="text-white hover:text-cream ..."
   ```

**Test** (`tests/e2e/production/anchor-nav.spec.ts`):
```typescript
test('anchor nav has no bullets and white text', async ({ page }) => {
  await page.goto('/summer-camp-sessions');

  const ul = page.locator('nav[aria-label="Page section navigation"] ul');
  const styles = await ul.evaluate(el => window.getComputedStyle(el));
  expect(styles.listStyleType).toBe('none');

  const firstLink = page.locator('nav[aria-label="Page section navigation"] a').first();
  const linkStyles = await firstLink.evaluate(el => window.getComputedStyle(el));
  expect(linkStyles.color).toBe('rgb(255, 255, 255)');
});
```

---

### REQ-U03-FIX-003: CTA Button Text Color Regression (0.5 SP)

**Problem**: Button text is WHITE (invisible on white button background). Should match section color.

**Acceptance Criteria** (COMPUTED STYLE VERIFICATION):
```typescript
// Primary Overnight button: color = 'rgb(2, 132, 199)' (sky-600)
// Junior Camp button: color = 'rgb(217, 119, 6)' (amber-600)
// Jr. High button: color = 'rgb(4, 120, 87)' (emerald-700)
// Sr. High button: color = 'rgb(126, 34, 206)' (purple-700)
```

**Root Cause**: `[&_a]:!text-inherit` in GridSquare.tsx overrides button's explicit color.

**Implementation**:
1. Edit `components/content/GridSquare.tsx` line 83
2. Remove `[&_a]:!text-inherit` from the className
3. The CTAButton has its own explicit text color classes that should not be overridden

   ```tsx
   // BEFORE:
   className="prose prose-lg max-w-none !text-inherit [&_h2]:!text-inherit [&_h3]:!text-inherit [&_p]:!text-inherit [&_li]:!text-inherit [&_strong]:!text-inherit [&_a]:!text-inherit ..."

   // AFTER (remove [&_a]:!text-inherit):
   className="prose prose-lg max-w-none !text-inherit [&_h2]:!text-inherit [&_h3]:!text-inherit [&_p]:!text-inherit [&_li]:!text-inherit [&_strong]:!text-inherit ..."
   ```

**Test** (`tests/e2e/production/cta-button-colors.spec.ts`):
```typescript
test('CTA buttons have correct text colors', async ({ page }) => {
  await page.goto('/summer-camp-sessions');

  // Primary Overnight (sky)
  const skyButton = page.locator('#primary-overnight a[href*="ultracamp"]');
  const skyStyles = await skyButton.evaluate(el => window.getComputedStyle(el));
  expect(skyStyles.color).toBe('rgb(2, 132, 199)');

  // Junior Camp (amber)
  const amberButton = page.locator('#junior-camp a[href*="ultracamp"]');
  const amberStyles = await amberButton.evaluate(el => window.getComputedStyle(el));
  expect(amberStyles.color).toBe('rgb(217, 119, 6)');

  // Jr. High (emerald)
  const emeraldButton = page.locator('#jr-high-camp a[href*="ultracamp"]');
  const emeraldStyles = await emeraldButton.evaluate(el => window.getComputedStyle(el));
  expect(emeraldStyles.color).toBe('rgb(4, 120, 87)');

  // Sr. High (purple)
  const purpleButton = page.locator('#sr-high-camp a[href*="ultracamp"]');
  const purpleStyles = await purpleButton.evaluate(el => window.getComputedStyle(el));
  expect(purpleStyles.color).toBe('rgb(126, 34, 206)');
});
```

---

### REQ-U03-FIX-004: Admin Edit URL Format (0.3 SP)

**Problem**: Edit Page link goes to wrong URL format.

**Current**: `/keystatic/collection/pages/about`
**Required**: `/keystatic/branch/main/collection/pages/item/about`

**Implementation**:
1. Edit `components/admin/AdminNavStrip.tsx` lines 24-31:
   ```typescript
   const getEditUrl = () => {
     if (pathname === "/") {
       return "/keystatic/branch/main/collection/pages/item/index";
     }
     const pagePath = pathname.slice(1).replace(/\//g, "-");
     return `/keystatic/branch/main/collection/pages/item/${pagePath}`;
   };
   ```

**Test** (`tests/unit/AdminNavStrip.spec.tsx`):
```typescript
describe('getEditUrl', () => {
  it('homepage returns correct URL', () => {
    // pathname = "/"
    expect(getEditUrl()).toBe('/keystatic/branch/main/collection/pages/item/index');
  });

  it('about page returns correct URL', () => {
    // pathname = "/about"
    expect(getEditUrl()).toBe('/keystatic/branch/main/collection/pages/item/about');
  });

  it('nested path returns correct URL', () => {
    // pathname = "/work-at-camp/counselors"
    expect(getEditUrl()).toBe('/keystatic/branch/main/collection/pages/item/work-at-camp-counselors');
  });
});
```

---

## Batch 2: Component & Template Fixes (1.5 SP)

*Batch 2 should be executed AFTER Batch 1 is verified complete.*

### REQ-U03-FIX-005: Hide Admin Nav in CMS (0.3 SP)

**Problem**: Admin strip shows inside Keystatic CMS (not needed there).

**Implementation**:
Add route check to not render on `/keystatic/*` paths.

---

### REQ-U03-FIX-006: Session Card Tight Spacing (0.5 SP)

**Problem**: Session cards have too much vertical spacing.

**Visual Reference**: `requirements/image-10.png` shows desired tight spacing.

---

### REQ-U03-FIX-007: Register Button Top Padding (0.2 SP)

**Problem**: Register Now button needs more spacing above it.

---

### REQ-U03-FIX-008: Static Sessions Bottom Template (0.5 SP)

**Problem**: Bottom of page doesn't match static-sessions template.

---

## Execution Protocol

### Before Starting Each Batch

1. **Capture baseline screenshot**:
   ```bash
   npx playwright screenshot https://prelaunch.bearlakecamp.com/summer-camp-sessions \
     --output requirements/baselines/batch-N-BEFORE.png
   ```

2. **Read this plan completely** - don't skip the code context section

3. **Verify current git state**:
   ```bash
   git status
   git log -1 --oneline
   ```

### After Each Fix

1. **Run typecheck**: `npm run typecheck`
2. **Run lint**: `npm run lint`
3. **Run specific test**: `npm test -- [test-file]`
4. **Visual verification**: Compare before/after screenshots

### After Batch Complete

1. **Run full test suite**: `npm test`
2. **Deploy and wait for Vercel**
3. **Run smoke test**: `./scripts/smoke-test.sh --force prelaunch.bearlakecamp.com`
4. **Run computed style tests on production**
5. **Capture AFTER screenshot**
6. **Commit with REQ-IDs in message**

---

## Anti-Regression Checklist

These features MUST NOT break:

- [ ] Hero video plays on summer-camp-sessions
- [ ] Session headers are WHITE and 3rem
- [ ] Session cards display correctly
- [ ] Navigation menu works
- [ ] Footer renders
- [ ] All pages return HTTP 200

---

## Context Handoff Template

If context window nears limit, create this summary:

```markdown
# Handoff: Updates-03 Fixes

## Completed
- [ ] REQ-U03-FIX-001 (grid alternating)
- [ ] REQ-U03-FIX-002 (nav bullets)
- [ ] REQ-U03-FIX-003 (button colors)
- [ ] REQ-U03-FIX-004 (edit URL)

## Current Status
[What's in progress, any blockers]

## Next Action
[Specific next step to take]

## Screenshots
- Before: requirements/baselines/batch-1-BEFORE.png
- After: requirements/baselines/batch-1-AFTER.png
```

---

## Success Criteria

Batch 1 is COMPLETE when:

1. All 4 fix tests pass in production
2. Screenshot comparison shows fixes applied
3. Smoke test passes (29/29 pages HTTP 200)
4. No regressions in anti-regression checklist
5. Commit pushed with conventional message
