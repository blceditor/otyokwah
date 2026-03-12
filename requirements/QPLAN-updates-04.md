# QPLAN: Updates-04 Implementation

**Document Version**: 1.0
**Date**: 2025-12-31
**Status**: Ready for Autonomous Execution
**Total SP**: 59 SP (excluding TBD items)
**Source**: `/requirements/updates-04-detailed.md`

---

## Executive Summary

This QPLAN breaks down 26 requirements into 16 implementation batches across 6 phases, respecting the **5 SP max per batch** and **3 visual requirements max per batch** constraints from CLAUDE.md.

---

## Execution Mode

**Mode**: Autonomous (default per CLAUDE.md)

**TDD Flow per Batch**:
```
QCODET (failing tests) -> QCHECKT (review) -> FIX 4x ->
QCODE (implement) -> QCHECK (review) -> FIX 4x ->
QVERIFY (validate) -> FIX 4x -> QDOC -> QGIT
```

**Validation Requirements**:
- All tests pass locally
- Production smoke test passes (`./scripts/smoke-test.sh --force prelaunch.bearlakecamp.com`)
- Playwright e2e tests pass
- Visual changes require screenshot verification

---

## Phase 1: Blocking Issues (6 SP)

### Batch 1A: Admin Nav Fix (2 SP)

**REQ-ID**: REQ-ISSUE-001

**Priority**: P0 (Blocking admin workflows)

**Problem**: Admin nav strip not rendering for authenticated users.

**Files to Modify**:
- `/Users/travis/SparkryDrive/dev/bearlakecamp/components/admin/AdminNavStrip.tsx`
- `/Users/travis/SparkryDrive/dev/bearlakecamp/app/api/auth/check/route.ts`
- `/Users/travis/SparkryDrive/dev/bearlakecamp/lib/keystatic/auth.ts`

**Files to Create/Update (Tests)**:
- `/Users/travis/SparkryDrive/dev/bearlakecamp/tests/e2e/admin-nav-strip.spec.ts` (update)
- `/Users/travis/SparkryDrive/dev/bearlakecamp/components/admin/AdminNavStrip.spec.tsx` (update)

**Test Scenarios**:
```typescript
// REQ-ISSUE-001: Admin nav renders when authenticated
test('admin nav renders when authenticated', async ({ page, context }) => {
  await context.route('/api/auth/check', route =>
    route.fulfill({ json: { isAdmin: true } })
  );
  await page.goto(PRODUCTION_URL);
  await expect(page.locator('[data-testid="admin-nav-strip"]')).toBeVisible({ timeout: 3000 });
});

// REQ-ISSUE-001: Admin nav hidden when not authenticated
test('admin nav hidden when not authenticated', async ({ page }) => {
  await page.goto(PRODUCTION_URL);
  await expect(page.locator('[data-testid="admin-nav-strip"]')).not.toBeVisible();
});

// REQ-ISSUE-001: Auth API failure does not break page
test('auth API failure does not break page', async ({ page, context }) => {
  await context.route('/api/auth/check', route => route.abort('failed'));
  await page.goto(PRODUCTION_URL);
  await expect(page.locator('header')).toBeVisible();
});
```

**Acceptance Validation**:
1. Admin nav strip appears for authenticated GitHub users within 2s of page load
2. Admin nav strip does NOT appear for unauthenticated users
3. All admin nav links function correctly
4. Admin nav strip appears on all pages except `/keystatic/*`

**Root Cause Investigation**:
- Check `/api/auth/check` response
- Verify `keystatic-gh-access-token` cookie handling
- Check `isKeystatiAuthenticated` function in `/lib/keystatic/auth.ts`

---

### Batch 1B: Test Infrastructure (2 SP)

**REQ-ID**: REQ-TEST-001

**Priority**: P0 (Required for all other work)

**Problem**: Existing tests need updates before new component implementation.

**Files to Create/Update**:
- `/Users/travis/SparkryDrive/dev/bearlakecamp/tests/e2e/homepage-cms.spec.ts` (update)
- `/Users/travis/SparkryDrive/dev/bearlakecamp/tests/e2e/camp-sessions.spec.ts` (update)
- `/Users/travis/SparkryDrive/dev/bearlakecamp/tests/e2e/keystatic-theme.spec.ts` (update)
- `/Users/travis/SparkryDrive/dev/bearlakecamp/tests/e2e/updates-04/` (new directory)

**Test Scenarios to Add**:
```typescript
// tests/e2e/updates-04/index.spec.ts
import { test, expect } from '@playwright/test';

const PRODUCTION_URL = process.env.PRODUCTION_URL || 'https://prelaunch.bearlakecamp.com';

test.describe('Updates-04 Requirements Validation', () => {
  // Will be populated as each batch is implemented
});

// tests/e2e/homepage-cms.spec.ts additions
test('REQ-HOME-001: CTA button visible on homepage', async ({ page }) => {
  await page.goto(PRODUCTION_URL);
  const ctaButton = page.locator('[data-component="cta-button"]');
  await expect(ctaButton.first()).toBeVisible();
});

test('REQ-HOME-002: Gallery renders on homepage', async ({ page }) => {
  await page.goto(PRODUCTION_URL);
  const gallery = page.locator('[data-component="gallery"]');
  if (await gallery.count() > 0) {
    await expect(gallery.first()).toBeVisible();
  }
});

// tests/e2e/camp-sessions.spec.ts additions
test('REQ-HOME-004: Camp session cards visible', async ({ page }) => {
  await page.goto(PRODUCTION_URL);
  const cards = page.locator('[data-component="camp-session-card"]');
  await expect(cards.first()).toBeVisible();
});
```

**Acceptance Validation**:
1. All existing tests pass with current production
2. New test stubs added for each REQ-ID
3. Test selectors use `data-testid` or `data-component` attributes
4. Tests include visual verification placeholders

---

### Batch 1C: Media Browser Enhancement (5 SP)

**REQ-ID**: REQ-CMS-001

**Priority**: P0 (Blocks image workflows)

**Problem**: Image fields should open media browser with upload capability.

**Files to Modify**:
- `/Users/travis/SparkryDrive/dev/bearlakecamp/app/keystatic/media/page.tsx`
- `/Users/travis/SparkryDrive/dev/bearlakecamp/components/keystatic/MediaLibrary.tsx`
- `/Users/travis/SparkryDrive/dev/bearlakecamp/components/keystatic/MediaPickerDialog.tsx`

**Files to Create**:
- `/Users/travis/SparkryDrive/dev/bearlakecamp/components/keystatic/MediaPickerField.tsx`
- `/Users/travis/SparkryDrive/dev/bearlakecamp/components/keystatic/MediaUploader.tsx`

**Test Files**:
- `/Users/travis/SparkryDrive/dev/bearlakecamp/tests/e2e/keystatic/media-library.spec.ts` (update)
- `/Users/travis/SparkryDrive/dev/bearlakecamp/components/keystatic/MediaLibrary.spec.tsx` (update)

**Test Scenarios**:
```typescript
test('REQ-CMS-001: Media browser opens from image field', async ({ page }) => {
  await page.goto('https://prelaunch.bearlakecamp.com/keystatic/collection/pages/item/index');
  const imageField = page.locator('[data-field-type="image"]').first();
  await imageField.click();
  const mediaBrowser = page.locator('[data-testid="media-browser"]');
  await expect(mediaBrowser).toBeVisible();
});

test('REQ-CMS-001: Media browser has upload button', async ({ page }) => {
  await page.goto('https://prelaunch.bearlakecamp.com/keystatic/collection/pages/item/index');
  const imageField = page.locator('[data-field-type="image"]').first();
  await imageField.click();
  const uploadButton = page.locator('[data-testid="media-upload-button"]');
  await expect(uploadButton).toBeVisible();
});

test('REQ-CMS-001: Images sorted by date descending', async ({ page }) => {
  await page.goto('https://prelaunch.bearlakecamp.com/keystatic/media');
  const firstImage = page.locator('[data-testid="media-browser"] img').first();
  await expect(firstImage).toBeVisible();
});
```

**Acceptance Validation**:
1. All image fields in CMS open media browser on click
2. Media browser shows existing images sorted by date (newest first)
3. "Upload" button allows adding new images
4. Newly uploaded image can be immediately selected
5. Upload supports drag-and-drop

---

## Phase 2: Homepage Foundation (11 SP)

### Batch 2A: Camp Session Card Component (5 SP)

**REQ-ID**: REQ-HOME-004

**Priority**: P0 (New design from mock)

**Design Reference**: `/Users/travis/SparkryDrive/dev/bearlakecamp/requirements/image-12.png`

**Files to Create**:
- `/Users/travis/SparkryDrive/dev/bearlakecamp/components/content/CampSessionCard.tsx`
- `/Users/travis/SparkryDrive/dev/bearlakecamp/components/content/CampSessionCard.spec.tsx`

**Files to Modify**:
- `/Users/travis/SparkryDrive/dev/bearlakecamp/lib/keystatic/collections/shared-components.ts`
- `/Users/travis/SparkryDrive/dev/bearlakecamp/components/markdoc/MarkdocComponents.tsx`

**Component Schema** (add to shared-components.ts):
```typescript
export const campSessionCardComponent = {
  label: "Camp Session Card",
  description: "Card displaying camp session with image, details, and CTA",
  kind: "inline" as const,
  schema: {
    image: fields.text({
      label: "Image Path",
      description: "Path to session image (e.g., /images/summer-sessions/jr-high.jpg)",
    }),
    imageAlt: fields.text({
      label: "Image Alt Text",
    }),
    heading: fields.text({
      label: "Session Name",
      description: 'E.g., "Jr. High Camp"',
    }),
    subheading: fields.text({
      label: "Age Group",
      description: 'E.g., "Rising 7th-9th Graders"',
    }),
    bulletType: fields.select({
      label: "Bullet Style",
      options: [
        { label: "Checkmark", value: "checkmark" },
        { label: "Bullet", value: "bullet" },
        { label: "Diamond", value: "diamond" },
        { label: "Numbers", value: "numbers" },
        { label: "Custom Icon", value: "icon" },
      ],
      defaultValue: "checkmark",
    }),
    bullets: fields.array(
      fields.text({ label: "Bullet Item" }),
      { label: "Features", itemLabel: (p) => p.value || "Feature" }
    ),
    ctaLabel: fields.text({
      label: "Button Text",
      defaultValue: "See Dates & Pricing",
    }),
    ctaHref: fields.text({
      label: "Button Link",
    }),
  },
};
```

**Test Scenarios**:
```typescript
test('REQ-HOME-004: Camp session cards visible on homepage', async ({ page }) => {
  await page.goto('https://prelaunch.bearlakecamp.com/');
  const cards = page.locator('[data-component="camp-session-card"]');
  await expect(cards.first()).toBeVisible();
});

test('REQ-HOME-004: Camp session card has required elements', async ({ page }) => {
  await page.goto('https://prelaunch.bearlakecamp.com/');
  const card = page.locator('[data-component="camp-session-card"]').first();
  await expect(card.locator('img')).toBeVisible();
  await expect(card.locator('h2, h3, h4')).toBeVisible();
  await expect(card.locator('a, button')).toBeVisible();
});

test('REQ-HOME-004: Camp session card hover animation', async ({ page }) => {
  await page.goto('https://prelaunch.bearlakecamp.com/');
  const card = page.locator('[data-component="camp-session-card"]').first();
  const initialTransform = await card.evaluate(el => getComputedStyle(el).transform);
  await card.hover();
  await page.waitForTimeout(300);
  const hoverTransform = await card.evaluate(el => getComputedStyle(el).transform);
  expect(hoverTransform).not.toBe(initialTransform);
});

test('REQ-HOME-004: Checkmark bullets render correctly', async ({ page }) => {
  await page.goto('https://prelaunch.bearlakecamp.com/');
  const card = page.locator('[data-component="camp-session-card"]').first();
  const bullets = card.locator('[data-bullet-type="checkmark"]');
  await expect(bullets.first()).toBeVisible();
});
```

**Acceptance Validation**:
1. Card renders with image, heading, subheading, bullets, and CTA
2. Text is left-justified within card
3. Bullet type is configurable (checkmark, bullet, diamond, numbers)
4. CTA button is green (#047857) with white text, centered
5. Card has subtle hover animation (scale or shadow)
6. Card is fully editable in CMS

**Visual Verification**:
- Screenshot required: `verification-screenshots/REQ-HOME-004-camp-session-card.png`
- Verify rounded corners (~12px)
- Verify button color matches #047857

---

### Batch 2B: Card Grid Container (2 SP)

**REQ-ID**: REQ-COMP-001

**Priority**: P0 (Container for session cards)

**Files to Create**:
- `/Users/travis/SparkryDrive/dev/bearlakecamp/components/content/CampSessionCardGrid.tsx`
- `/Users/travis/SparkryDrive/dev/bearlakecamp/components/content/CampSessionCardGrid.spec.tsx`

**Files to Modify**:
- `/Users/travis/SparkryDrive/dev/bearlakecamp/lib/keystatic/collections/shared-components.ts`

**Component Schema**:
```typescript
export const campSessionCardGridComponent = {
  label: "Camp Session Cards",
  description: "Grid of camp session cards for homepage and summer camp page",
  kind: "wrapper" as const,
  schema: {
    columns: fields.select({
      label: "Columns (Desktop)",
      options: [
        { label: "2 Columns", value: "2" },
        { label: "3 Columns", value: "3" },
        { label: "4 Columns", value: "4" },
      ],
      defaultValue: "4",
    }),
    gap: fields.select({
      label: "Gap",
      options: [
        { label: "Small", value: "sm" },
        { label: "Medium", value: "md" },
        { label: "Large", value: "lg" },
      ],
      defaultValue: "md",
    }),
  },
};
```

**Test Scenarios**:
```typescript
test('REQ-COMP-001: Card grid responsive columns', async ({ page }) => {
  await page.goto('https://prelaunch.bearlakecamp.com/');
  const grid = page.locator('[data-component="camp-session-card-grid"]');

  // Desktop: 4 columns
  await page.setViewportSize({ width: 1280, height: 800 });
  const desktopClass = await grid.evaluate(el => getComputedStyle(el).gridTemplateColumns);
  expect(desktopClass.split(' ').length).toBeGreaterThanOrEqual(4);

  // Mobile: 1 column
  await page.setViewportSize({ width: 375, height: 667 });
  const mobileClass = await grid.evaluate(el => getComputedStyle(el).gridTemplateColumns);
  expect(mobileClass.split(' ').length).toBe(1);
});

test('REQ-COMP-001: Equal height cards within row', async ({ page }) => {
  await page.goto('https://prelaunch.bearlakecamp.com/');
  const cards = page.locator('[data-component="camp-session-card"]');
  const count = await cards.count();
  if (count >= 2) {
    const height1 = await cards.nth(0).boundingBox();
    const height2 = await cards.nth(1).boundingBox();
    expect(Math.abs((height1?.height || 0) - (height2?.height || 0))).toBeLessThan(5);
  }
});
```

**Acceptance Validation**:
1. Container arranges cards in responsive grid
2. 1 column on mobile, 2-3 on tablet, 4 on desktop
3. Equal height cards within row
4. Configurable gap between cards

**Dependencies**: REQ-HOME-004 (CampSessionCard component)

---

### Batch 2C: CTA Buttons in Body (3 SP)

**REQ-ID**: REQ-HOME-001

**Priority**: P1

**Problem**: CTA buttons on homepage are hardcoded. Need to be editable via CMS body content.

**Files to Modify**:
- `/Users/travis/SparkryDrive/dev/bearlakecamp/lib/keystatic/collections/pages.ts` (already has ctaButton)
- `/Users/travis/SparkryDrive/dev/bearlakecamp/components/markdoc/MarkdocComponents.tsx`
- `/Users/travis/SparkryDrive/dev/bearlakecamp/app/page.tsx`

**Test Scenarios**:
```typescript
test('REQ-HOME-001: CTA button visible on homepage', async ({ page }) => {
  await page.goto('https://prelaunch.bearlakecamp.com/');
  const ctaButton = page.locator('[data-component="cta-button"]');
  await expect(ctaButton.first()).toBeVisible();
});

test('REQ-HOME-001: CTA button links correctly', async ({ page }) => {
  await page.goto('https://prelaunch.bearlakecamp.com/');
  const ctaButton = page.locator('[data-component="cta-button"]').first();
  const href = await ctaButton.getAttribute('href');
  expect(href).toBeTruthy();
  expect(href).toMatch(/^https?:\/\/|^\//);
});

test('REQ-HOME-001: CTA button has correct styling', async ({ page }) => {
  await page.goto('https://prelaunch.bearlakecamp.com/');
  const ctaButton = page.locator('[data-component="cta-button"]').first();
  const bgColor = await ctaButton.evaluate(el => getComputedStyle(el).backgroundColor);
  // Primary variant should have green background
  expect(bgColor).toMatch(/rgb\(4,|rgba\(4,/);
});
```

**Acceptance Validation**:
1. CTA buttons can be added/edited in Page Content (body) field
2. Button text, link, variant, and size are all configurable
3. Preview shows accurate button styling in CMS
4. Homepage renders CTA buttons from CMS content

---

### Batch 2D: Gallery in Body (1 SP)

**REQ-ID**: REQ-HOME-002

**Priority**: P1

**Note**: Gallery component already exists in shared-components.ts. Need to ensure it renders in body content.

**Files to Verify/Modify**:
- `/Users/travis/SparkryDrive/dev/bearlakecamp/components/markdoc/MarkdocComponents.tsx`
- `/Users/travis/SparkryDrive/dev/bearlakecamp/components/content/Gallery.tsx`

**Test Scenarios**:
```typescript
test('REQ-HOME-002: Gallery renders on homepage', async ({ page }) => {
  await page.goto('https://prelaunch.bearlakecamp.com/');
  const gallery = page.locator('[data-component="gallery"]');
  if (await gallery.count() > 0) {
    await expect(gallery.first()).toBeVisible();
    const images = gallery.first().locator('img');
    await expect(images.first()).toBeVisible();
  }
});
```

**Acceptance Validation**:
1. Gallery component can be inserted into Page Content
2. Images can be selected from media browser
3. Gallery renders with proper grid layout on homepage

**Dependencies**: REQ-CMS-001 (Media Browser)

---

## Phase 3: CMS Enhancements (16 SP)

### Batch 3A: Color Picker with Presets (4 SP)

**REQ-ID**: REQ-CMS-005

**Priority**: P1 (Dependency for CMS-003)

**Files to Create**:
- `/Users/travis/SparkryDrive/dev/bearlakecamp/components/keystatic/ColorPicker.tsx`
- `/Users/travis/SparkryDrive/dev/bearlakecamp/components/keystatic/ColorPicker.spec.tsx`
- `/Users/travis/SparkryDrive/dev/bearlakecamp/components/keystatic/ColorPresets.tsx`

**Theme Colors** (from tailwind.config.ts):
- `#047857` - emerald/forest green
- `#0284c7` - sky blue
- `#d97706` - amber/gold
- `#7e22ce` - purple
- `#f5f0e8` - cream
- `#1f2937` - bark/dark

**Test Scenarios**:
```typescript
test('REQ-CMS-005: Color picker shows theme presets', async ({ page }) => {
  await page.goto('https://prelaunch.bearlakecamp.com/keystatic/collection/pages/item/testing-components');
  const colorField = page.locator('[data-field-type="color"]').first();
  await colorField.click();
  const themeColors = page.locator('[data-testid="theme-color-preset"]');
  await expect(themeColors.first()).toBeVisible();
});

test('REQ-CMS-005: Color preview updates on hex input', async ({ page }) => {
  await page.goto('https://prelaunch.bearlakecamp.com/keystatic/collection/pages/item/testing-components');
  const colorField = page.locator('[data-field-type="color"]').first();
  await colorField.click();
  const hexInput = page.locator('[data-testid="color-hex-input"]');
  await hexInput.fill('#ff0000');
  const preview = page.locator('[data-testid="color-preview"]');
  const bgColor = await preview.evaluate(el => getComputedStyle(el).backgroundColor);
  expect(bgColor).toBe('rgb(255, 0, 0)');
});
```

**Acceptance Validation**:
1. Theme color presets clickable
2. Standard web color grid visible
3. Hex input accepts valid hex codes
4. Preview square updates in real-time
5. Invalid hex shows validation error
6. Recent colors remembered per session

---

### Batch 3B: Container Width/Height/Background (4 SP)

**REQ-ID**: REQ-CMS-003

**Priority**: P0

**Target Components**:
- `cardGrid`
- `squareGrid`
- `gridSquare`
- `section`
- `contentBox`
- `contentCard`

**Files to Modify**:
- `/Users/travis/SparkryDrive/dev/bearlakecamp/lib/keystatic/collections/shared-components.ts`
- `/Users/travis/SparkryDrive/dev/bearlakecamp/lib/keystatic/collections/pages.ts`
- `/Users/travis/SparkryDrive/dev/bearlakecamp/components/markdoc/MarkdocComponents.tsx`

**Schema Additions** (add to each target component):
```typescript
width: fields.select({
  label: "Width",
  options: [
    { label: "Auto", value: "auto" },
    { label: "25%", value: "25" },
    { label: "50%", value: "50" },
    { label: "75%", value: "75" },
    { label: "100%", value: "100" },
    { label: "Custom", value: "custom" },
  ],
  defaultValue: "auto",
}),
customWidth: fields.text({
  label: "Custom Width (px or %)",
  description: "E.g., 300px or 80%",
}),
height: fields.select({
  label: "Height",
  options: [
    { label: "Auto", value: "auto" },
    { label: "Small (200px)", value: "200" },
    { label: "Medium (400px)", value: "400" },
    { label: "Large (600px)", value: "600" },
    { label: "Custom", value: "custom" },
  ],
  defaultValue: "auto",
}),
customHeight: fields.text({
  label: "Custom Height (px)",
}),
backgroundType: fields.select({
  label: "Background Type",
  options: [
    { label: "None", value: "none" },
    { label: "Color", value: "color" },
    { label: "Image", value: "image" },
  ],
  defaultValue: "none",
}),
backgroundColor: fields.text({
  label: "Background Color (Hex)",
  description: "Use color picker or enter hex code",
}),
backgroundImage: fields.text({
  label: "Background Image Path",
}),
```

**Test Scenarios**:
```typescript
test('REQ-CMS-003: Card with custom width renders correctly', async ({ page }) => {
  await page.goto('https://prelaunch.bearlakecamp.com/testing-components');
  const customWidthCard = page.locator('[data-width="50"]');
  if (await customWidthCard.count() > 0) {
    const cardBox = await customWidthCard.first().boundingBox();
    const containerWidth = await page.evaluate(() => document.body.clientWidth);
    expect(cardBox?.width).toBeLessThan(containerWidth * 0.6);
  }
});
```

**Acceptance Validation**:
1. Width options available on all container components
2. Height options available on all container components
3. Background color picker works (CMS-5)
4. Background image selection works
5. Preview updates in real-time
6. Custom values validate correctly

**Dependencies**: REQ-CMS-005 (Color Picker)

---

### Batch 3C: Icon Size + Light/Dark Mode (5 SP)

**REQ-IDs**: REQ-CMS-004 (2 SP) + REQ-CMS-008 (3 SP)

**Priority**: P1

#### REQ-CMS-004: Icon Size Settings

**Target Components**:
- `contentCard` (icon field)
- `infoCard` (icon field)
- `donateButton` (icon field)
- Any component with Lucide icon

**Schema Addition**:
```typescript
iconSize: fields.select({
  label: "Icon Size",
  options: [
    { label: "Small (16px)", value: "sm" },
    { label: "Medium (24px)", value: "md" },
    { label: "Large (32px)", value: "lg" },
    { label: "Extra Large (48px)", value: "xl" },
  ],
  defaultValue: "md",
}),
```

**Files to Modify**:
- `/Users/travis/SparkryDrive/dev/bearlakecamp/lib/keystatic/collections/shared-components.ts`

#### REQ-CMS-008: Light/Dark Mode Fix

**Files to Investigate/Modify**:
- `/Users/travis/SparkryDrive/dev/bearlakecamp/components/ThemeToggle.tsx`
- `/Users/travis/SparkryDrive/dev/bearlakecamp/components/ThemeProvider.tsx`
- `/Users/travis/SparkryDrive/dev/bearlakecamp/app/keystatic/[[...path]]/layout.tsx`

**Test Scenarios**:
```typescript
test('REQ-CMS-004: Large icon renders at 48px', async ({ page }) => {
  await page.goto('https://prelaunch.bearlakecamp.com/testing-components');
  const largeIcon = page.locator('[data-icon-size="xl"] svg');
  if (await largeIcon.count() > 0) {
    const iconBox = await largeIcon.first().boundingBox();
    expect(iconBox?.width).toBeGreaterThanOrEqual(44);
  }
});

test('REQ-CMS-008: Light mode applies to all elements', async ({ page }) => {
  await page.goto('https://prelaunch.bearlakecamp.com/keystatic');
  const themeToggle = page.locator('[aria-label*="light mode"], [aria-label*="dark mode"]');
  await themeToggle.click();
  await page.waitForTimeout(500);
  const bgColor = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(bgColor).toMatch(/rgb\((2[0-5]\d|1\d\d|[5-9]\d),/);
});

test('REQ-CMS-008: Component popup respects theme', async ({ page }) => {
  await page.goto('https://prelaunch.bearlakecamp.com/keystatic/collection/pages/item/index');
  const themeToggle = page.locator('[aria-label*="light mode"], [aria-label*="dark mode"]');
  await themeToggle.click();
  const addButton = page.locator('button:has-text("Add")').first();
  if (await addButton.isVisible()) {
    await addButton.click();
    const popup = page.locator('[role="dialog"]');
    if (await popup.isVisible()) {
      const popupBg = await popup.evaluate(el => getComputedStyle(el).backgroundColor);
      expect(popupBg).not.toContain('rgb(0, 0, 0)');
    }
  }
});
```

**Acceptance Validation**:
1. Icon size dropdown appears on all icon-enabled components
2. Size change reflects in preview immediately
3. Toggle switches between light and dark mode
4. All CMS UI elements respond to theme change
5. Component editing popups use correct theme
6. Theme persists across sessions

---

### Batch 3D: Component Deduplication (3 SP)

**REQ-ID**: REQ-CMS-002

**Priority**: P1

**Audit Required**:
- `contentCard` vs `infoCard` vs `sectionCard`
- `gallery` vs `imageGallery`
- `cta` vs `ctaButton` vs `ctaSection`
- `accordion` vs `faqAccordion`

**Files to Modify**:
- `/Users/travis/SparkryDrive/dev/bearlakecamp/lib/keystatic/collections/shared-components.ts`
- `/Users/travis/SparkryDrive/dev/bearlakecamp/components/markdoc/MarkdocComponents.tsx`

**Deliverables**:
1. Component audit document (`docs/analysis/component-audit.md`)
2. Deprecation plan with migration steps
3. Updated pages using canonical components
4. Tests verifying no regressions

**Test Scenarios**:
```typescript
test('REQ-CMS-002: No deprecated components in use', async ({ page }) => {
  const response = await fetch('https://prelaunch.bearlakecamp.com/');
  const html = await response.text();
  const deprecated = ['data-component="old-card"', 'data-component="info-card-v1"'];
  deprecated.forEach(marker => {
    expect(html).not.toContain(marker);
  });
});
```

**Acceptance Validation**:
1. All duplicate components identified
2. Consolidated component set documented
3. Deprecated components removed or aliased
4. All pages updated to use canonical components
5. No visual regressions

---

## Phase 4: Homepage Sections (12 SP)

### Batch 4A: Wide Card Component (3 SP)

**REQ-ID**: REQ-HOME-006

**Priority**: P1

**Design Spec**:
- Full-width within content area
- Image on left (40%) or right (alternating), content on right (60%)
- Different background colors for Retreats vs Rentals
- Title, brief description, CTA link
- Responsive: Stacks on mobile

**Files to Create**:
- `/Users/travis/SparkryDrive/dev/bearlakecamp/components/content/WideCard.tsx`
- `/Users/travis/SparkryDrive/dev/bearlakecamp/components/content/WideCard.spec.tsx`

**Files to Modify**:
- `/Users/travis/SparkryDrive/dev/bearlakecamp/lib/keystatic/collections/shared-components.ts`

**Schema**:
```typescript
export const wideCardComponent = {
  label: "Wide Card",
  description: "Full-width card with image and content for sections like Retreats/Rentals",
  kind: "wrapper" as const,
  schema: {
    image: fields.text({ label: "Image Path" }),
    imageAlt: fields.text({ label: "Image Alt Text" }),
    imagePosition: fields.select({
      label: "Image Position",
      options: [
        { label: "Left", value: "left" },
        { label: "Right", value: "right" },
      ],
      defaultValue: "left",
    }),
    backgroundColor: fields.text({
      label: "Background Color (Hex)",
      defaultValue: "#f5f0e8",
    }),
    title: fields.text({ label: "Title" }),
    description: fields.text({ label: "Description", multiline: true }),
    ctaLabel: fields.text({ label: "Button Text" }),
    ctaHref: fields.text({ label: "Button Link" }),
  },
};
```

**Test Scenarios**:
```typescript
test('REQ-HOME-006: Wide card renders with image and content', async ({ page }) => {
  await page.goto('https://prelaunch.bearlakecamp.com/');
  const wideCard = page.locator('[data-component="wide-card"]');
  if (await wideCard.count() > 0) {
    await expect(wideCard.first().locator('img')).toBeVisible();
    await expect(wideCard.first().locator('a, button')).toBeVisible();
  }
});

test('REQ-HOME-006: Wide card stacks on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('https://prelaunch.bearlakecamp.com/');
  const wideCard = page.locator('[data-component="wide-card"]');
  if (await wideCard.count() > 0) {
    const flexDirection = await wideCard.first().evaluate(el =>
      getComputedStyle(el).flexDirection
    );
    expect(flexDirection).toBe('column');
  }
});
```

**Acceptance Validation**:
1. Wide card component renders with image and content
2. Background color is configurable
3. Image position (left/right) is configurable
4. Responsive stacking on mobile

**Dependencies**: REQ-CMS-005 (Color Picker)

---

### Batch 4B: Work At Camp Section (3 SP)

**REQ-ID**: REQ-HOME-005

**Priority**: P1

**Content Sources**:
- `/work-at-camp-summer-staff`: "Make an Eternal Impact"
- `/work-at-camp-leaders-in-training`: High School Servant Leadership Program
- `/work-at-camp-year-round`: Year-round employment

**Files to Create**:
- `/Users/travis/SparkryDrive/dev/bearlakecamp/components/homepage/WorkAtCamp.tsx`
- `/Users/travis/SparkryDrive/dev/bearlakecamp/components/homepage/WorkAtCamp.spec.tsx`

**Files to Modify**:
- `/Users/travis/SparkryDrive/dev/bearlakecamp/app/page.tsx`

**Test Scenarios**:
```typescript
test('REQ-HOME-005: Work At Camp section visible', async ({ page }) => {
  await page.goto('https://prelaunch.bearlakecamp.com/');
  const section = page.locator('[data-section="work-at-camp"]');
  await expect(section).toBeVisible();
  const links = section.locator('a');
  await expect(links).toHaveCount(3);
});

test('REQ-HOME-005: Work At Camp links are correct', async ({ page }) => {
  await page.goto('https://prelaunch.bearlakecamp.com/');
  const section = page.locator('[data-section="work-at-camp"]');
  await expect(section.locator('a[href*="summer-staff"]')).toBeVisible();
  await expect(section.locator('a[href*="leaders-in-training"]')).toBeVisible();
  await expect(section.locator('a[href*="year-round"]')).toBeVisible();
});
```

**Acceptance Validation**:
1. Section displays 3 work opportunity cards
2. Each card links to correct page
3. Cards are visually distinct from camp session cards
4. Section is editable in CMS

**Dependencies**: REQ-HOME-006 (Wide Card for styling reference)

---

### Batch 4C: Retreats + Rentals Sections (4 SP)

**REQ-IDs**: REQ-HOME-007 (2 SP) + REQ-HOME-008 (2 SP)

**Priority**: P2

**Files to Modify**:
- `/Users/travis/SparkryDrive/dev/bearlakecamp/app/page.tsx`
- `/Users/travis/SparkryDrive/dev/bearlakecamp/content/pages/index.mdoc`

**Test Scenarios**:
```typescript
test('REQ-HOME-007: Retreats wide card visible', async ({ page }) => {
  await page.goto('https://prelaunch.bearlakecamp.com/');
  const retreatsCard = page.locator('[data-component="wide-card"][data-section="retreats"]');
  await expect(retreatsCard).toBeVisible();
  await expect(retreatsCard.locator('a[href*="retreats"]')).toBeVisible();
});

test('REQ-HOME-008: Rentals wide card has different color', async ({ page }) => {
  await page.goto('https://prelaunch.bearlakecamp.com/');
  const retreatsCard = page.locator('[data-section="retreats"]').first();
  const rentalsCard = page.locator('[data-section="rentals"]').first();
  const retreatsBg = await retreatsCard.evaluate(el => getComputedStyle(el).backgroundColor);
  const rentalsBg = await rentalsCard.evaluate(el => getComputedStyle(el).backgroundColor);
  expect(retreatsBg).not.toBe(rentalsBg);
});
```

**Acceptance Validation**:
1. Retreats section appears on homepage below Work At Camp
2. Rentals section appears below Retreats
3. Both use wide card component
4. Different background colors
5. Links to respective pages

**Dependencies**: REQ-HOME-006 (Wide Card)

---

### Batch 4D: Image Preload Fix (2 SP)

**REQ-ID**: REQ-HOME-003

**Priority**: P2

**Files to Modify**:
- `/Users/travis/SparkryDrive/dev/bearlakecamp/app/page.tsx`
- `/Users/travis/SparkryDrive/dev/bearlakecamp/components/homepage/Mission.tsx`

**Test Scenarios**:
```typescript
test('REQ-HOME-003: Mission image has eager loading', async ({ page }) => {
  await page.goto('https://prelaunch.bearlakecamp.com/');
  const missionImage = page.locator('[data-section="mission"] img, .mission-section img').first();
  const loading = await missionImage.getAttribute('loading');
  expect(loading).not.toBe('lazy');
});

test('REQ-HOME-003: Mission image is preloaded', async ({ page }) => {
  const preloadPromise = page.waitForRequest(req =>
    req.url().includes('campfire') && req.resourceType() === 'image'
  );
  await page.goto('https://prelaunch.bearlakecamp.com/');
  const request = await preloadPromise;
  expect(request).toBeTruthy();
});
```

**Acceptance Validation**:
1. Image begins loading immediately after hero video starts loading
2. Image is visible without scrolling (LCP optimization)
3. No visible loading state or placeholder after 3 seconds on fast connection

---

## Phase 5: Summer Camp Page (11 SP)

### Batch 5A: YouTube Hero Support (4 SP)

**REQ-ID**: REQ-SUMMER-001

**Priority**: P1

**Files to Create**:
- `/Users/travis/SparkryDrive/dev/bearlakecamp/components/hero/HeroYouTube.tsx`
- `/Users/travis/SparkryDrive/dev/bearlakecamp/components/hero/HeroYouTube.spec.tsx`

**Files to Modify**:
- `/Users/travis/SparkryDrive/dev/bearlakecamp/lib/keystatic/collections/pages.ts`
- `/Users/travis/SparkryDrive/dev/bearlakecamp/components/hero/HeroVideo.tsx`

**Schema Update**:
```typescript
heroVideoType: fields.select({
  label: "Hero Video Type",
  options: [
    { label: "None (Image Only)", value: "none" },
    { label: "Local Video", value: "local" },
    { label: "YouTube Video", value: "youtube" },
  ],
  defaultValue: "none",
}),
heroYouTubeId: fields.text({
  label: "YouTube Video ID",
  description: 'E.g., "dQw4w9WgXcQ" from youtube.com/watch?v=dQw4w9WgXcQ',
}),
```

**Test Scenarios**:
```typescript
test('REQ-SUMMER-001: YouTube hero video renders', async ({ page }) => {
  await page.goto('https://prelaunch.bearlakecamp.com/summer-camp');
  const youtubeHero = page.locator('[data-component="hero-youtube"], iframe[src*="youtube"]');
  const heroElement = page.locator('.hero-section, [data-component="hero"]');
  await expect(heroElement).toBeVisible();
});

test('REQ-SUMMER-001: YouTube hero has fallback', async ({ page, context }) => {
  await context.route('**/youtube.com/**', route => route.abort());
  await page.goto('https://prelaunch.bearlakecamp.com/summer-camp');
  const heroImage = page.locator('.hero-section img, [data-component="hero"] img');
  await expect(heroImage).toBeVisible();
});
```

**Acceptance Validation**:
1. Hero can display YouTube video by URL or video ID
2. YouTube hero auto-plays (muted per browser requirements)
3. Fallback to hero image if YouTube fails to load
4. CMS allows choice between local video, YouTube, or image-only

---

### Batch 5B: Session Cards + Buttons (4 SP)

**REQ-IDs**: REQ-SUMMER-003 (2 SP) + REQ-SUMMER-006 (2 SP)

**Priority**: P0/P1

**Files to Modify**:
- `/Users/travis/SparkryDrive/dev/bearlakecamp/content/pages/summer-camp.mdoc`
- `/Users/travis/SparkryDrive/dev/bearlakecamp/app/(site)/[slug]/page.tsx`

**Test Scenarios**:
```typescript
test('REQ-SUMMER-003: Session cards on summer camp page', async ({ page }) => {
  await page.goto('https://prelaunch.bearlakecamp.com/summer-camp');
  const cards = page.locator('[data-component="camp-session-card"]');
  await expect(cards.first()).toBeVisible();
});

test('REQ-SUMMER-006: Prepare for Camp has centered buttons', async ({ page }) => {
  await page.goto('https://prelaunch.bearlakecamp.com/summer-camp');
  const prepareSection = page.locator('[data-section="prepare-for-camp"]');
  const buttons = prepareSection.locator('a[class*="button"], button');
  await expect(buttons.first()).toBeVisible();
  const buttonBox = await buttons.first().boundingBox();
  const sectionBox = await prepareSection.boundingBox();
  if (buttonBox && sectionBox) {
    const buttonCenter = buttonBox.x + buttonBox.width / 2;
    const sectionCenter = sectionBox.x + sectionBox.width / 2;
    expect(Math.abs(buttonCenter - sectionCenter)).toBeLessThan(50);
  }
});
```

**Acceptance Validation**:
1. Camp session cards render on /summer-camp page
2. Cards use same component as homepage (REQ-HOME-004)
3. Links render as button-styled elements
4. Buttons are horizontally centered within card

**Dependencies**: REQ-HOME-004

---

### Batch 5C: Width + Icon Adjustments (3 SP)

**REQ-IDs**: REQ-SUMMER-002 (1 SP) + REQ-SUMMER-004 (1 SP) + REQ-SUMMER-005 (1 SP)

**Priority**: P2

**Files to Modify**:
- `/Users/travis/SparkryDrive/dev/bearlakecamp/content/pages/summer-camp.mdoc`

**Test Scenarios**:
```typescript
test('REQ-SUMMER-002/004: Cards have custom width', async ({ page }) => {
  await page.goto('https://prelaunch.bearlakecamp.com/summer-camp');
  const worthySection = page.locator('[data-section="summer-2026-worthy"]');
  const card = worthySection.locator('[data-width]');
  if (await card.count() > 0) {
    const width = await card.getAttribute('data-width');
    expect(['50', '75', '100']).toContain(width);
  }
});

test('REQ-SUMMER-005: Prepare icons are larger', async ({ page }) => {
  await page.goto('https://prelaunch.bearlakecamp.com/summer-camp');
  const prepareSection = page.locator('[data-section="prepare-for-camp"]');
  const icon = prepareSection.locator('[data-icon-size]').first();
  if (await icon.count() > 0) {
    const size = await icon.getAttribute('data-icon-size');
    expect(['lg', 'xl']).toContain(size);
  }
});
```

**Acceptance Validation**:
1. Card width can be set in CMS (50%, 75%, 100%, custom)
2. Icon size increased visually
3. Changes visible on production

**Dependencies**: REQ-CMS-003, REQ-CMS-004

---

## Phase 6: Cleanup (5 SP)

### Batch 6A: Hero Height (2 SP)

**REQ-ID**: REQ-BRING-001

**Priority**: P2

**Files to Modify**:
- `/Users/travis/SparkryDrive/dev/bearlakecamp/lib/keystatic/collections/pages.ts`
- `/Users/travis/SparkryDrive/dev/bearlakecamp/components/hero/HeroVideo.tsx`
- `/Users/travis/SparkryDrive/dev/bearlakecamp/content/pages/summer-camp-what-to-bring.mdoc`

**Schema Addition**:
```typescript
heroHeight: fields.select({
  label: "Hero Height",
  options: [
    { label: "Default", value: "default" },
    { label: "Small (300px)", value: "sm" },
    { label: "Medium (400px)", value: "md" },
    { label: "Large (500px)", value: "lg" },
    { label: "Extra Large (600px)", value: "xl" },
  ],
  defaultValue: "default",
}),
```

**Test Scenarios**:
```typescript
test('REQ-BRING-001: What To Bring hero is sufficiently tall', async ({ page }) => {
  await page.goto('https://prelaunch.bearlakecamp.com/summer-camp-what-to-bring');
  const hero = page.locator('.hero-section, [data-component="hero"]');
  const heroBox = await hero.boundingBox();
  expect(heroBox?.height).toBeGreaterThanOrEqual(400);
});
```

**Acceptance Validation**:
1. Hero image height increased to show full subject matter
2. Hero height configurable per page (not global)
3. No aspect ratio distortion

**Dependencies**: REQ-CMS-003 (Height options)

---

### Batch 6B: UX Review (3 SP)

**REQ-ID**: REQ-CMS-006

**Priority**: P2

**Scope**:
- Usability testing of new CMS features
- Consistency audit
- Accessibility review
- Recommendations for improvements

**Deliverables**:
1. UX review document (`requirements/updates-04-ux-review.md`)
2. Priority assigned to each finding
3. Stories created for any P0/P1 issues

**Acceptance Validation**:
1. UX expert has reviewed all new CMS features
2. Findings documented in requirements format
3. Priority assigned to each finding
4. Stories created for any P0/P1 issues

**Dependencies**: All CMS requirements (CMS-1 through CMS-5)

---

## Dependency Verification Checklist

Before starting each batch, verify:

- [ ] All dependency batches are complete and deployed
- [ ] Production smoke tests pass
- [ ] No TypeScript errors (`npm run typecheck`)
- [ ] No lint errors (`npm run lint`)
- [ ] All existing tests pass (`npm run test`)

---

## Production Validation Checklist

After each batch deployment:

1. [ ] Run smoke test: `./scripts/smoke-test.sh --force prelaunch.bearlakecamp.com`
2. [ ] Run Playwright tests: `npm run test:e2e`
3. [ ] Verify visual changes with screenshots (if applicable)
4. [ ] Check Keystatic CMS editor functionality (if CMS changes)
5. [ ] Verify mobile responsiveness
6. [ ] Check for console errors in browser dev tools

---

## QShortcuts Sequence

For each batch, follow this sequence:

```
QCODET -> QCHECKT -> FIX 4x ->
QCODE -> QCHECK -> FIX 4x ->
QVERIFY -> FIX 4x -> QDOC -> QGIT
```

---

## Summary Table

| Batch | REQ-IDs | SP | Priority | Dependencies |
|-------|---------|-----|----------|--------------|
| 1A | REQ-ISSUE-001 | 2 | P0 | None |
| 1B | REQ-TEST-001 | 2 | P0 | None |
| 1C | REQ-CMS-001 | 5 | P0 | None |
| 2A | REQ-HOME-004 | 5 | P0 | 1C |
| 2B | REQ-COMP-001 | 2 | P0 | 2A |
| 2C | REQ-HOME-001 | 3 | P1 | None |
| 2D | REQ-HOME-002 | 1 | P1 | 1C |
| 3A | REQ-CMS-005 | 4 | P1 | None |
| 3B | REQ-CMS-003 | 4 | P0 | 3A |
| 3C | REQ-CMS-004, REQ-CMS-008 | 5 | P1 | None |
| 3D | REQ-CMS-002 | 3 | P1 | None |
| 4A | REQ-HOME-006 | 3 | P1 | 3A |
| 4B | REQ-HOME-005 | 3 | P1 | 4A |
| 4C | REQ-HOME-007, REQ-HOME-008 | 4 | P2 | 4A |
| 4D | REQ-HOME-003 | 2 | P2 | None |
| 5A | REQ-SUMMER-001 | 4 | P1 | None |
| 5B | REQ-SUMMER-003, REQ-SUMMER-006 | 4 | P0/P1 | 2A |
| 5C | REQ-SUMMER-002, 004, 005 | 3 | P2 | 3B, 3C |
| 6A | REQ-BRING-001 | 2 | P2 | 3B |
| 6B | REQ-CMS-006 | 3 | P2 | All CMS |

**Total**: 59 SP (excluding REQ-CMS-007 which is TBD pending clarification)

---

## Output Contract

```json
{
  "task_type": "feature",
  "req_ids": [
    "REQ-ISSUE-001", "REQ-TEST-001", "REQ-CMS-001", "REQ-CMS-002",
    "REQ-CMS-003", "REQ-CMS-004", "REQ-CMS-005", "REQ-CMS-006",
    "REQ-CMS-008", "REQ-HOME-001", "REQ-HOME-002", "REQ-HOME-003",
    "REQ-HOME-004", "REQ-HOME-005", "REQ-HOME-006", "REQ-HOME-007",
    "REQ-HOME-008", "REQ-COMP-001", "REQ-SUMMER-001", "REQ-SUMMER-002",
    "REQ-SUMMER-003", "REQ-SUMMER-004", "REQ-SUMMER-005", "REQ-SUMMER-006",
    "REQ-BRING-001"
  ],
  "plan_steps": [
    "Phase 1: Blocking Issues (Batches 1A-1C)",
    "Phase 2: Homepage Foundation (Batches 2A-2D)",
    "Phase 3: CMS Enhancements (Batches 3A-3D)",
    "Phase 4: Homepage Sections (Batches 4A-4D)",
    "Phase 5: Summer Camp Page (Batches 5A-5C)",
    "Phase 6: Cleanup (Batches 6A-6B)"
  ],
  "test_plan": [
    {"req": "REQ-ISSUE-001", "cases": ["admin-nav-auth", "admin-nav-hidden", "auth-api-failure"]},
    {"req": "REQ-TEST-001", "cases": ["test-infrastructure-setup", "stubs-created"]},
    {"req": "REQ-CMS-001", "cases": ["media-browser-opens", "upload-button", "image-selection"]},
    {"req": "REQ-HOME-004", "cases": ["card-visible", "card-elements", "hover-animation", "bullet-types"]},
    {"req": "REQ-COMP-001", "cases": ["responsive-columns", "equal-height"]},
    {"req": "REQ-HOME-001", "cases": ["cta-visible", "cta-links", "cta-styling"]},
    {"req": "REQ-HOME-002", "cases": ["gallery-renders"]},
    {"req": "REQ-CMS-005", "cases": ["theme-presets", "hex-input", "preview-update"]},
    {"req": "REQ-CMS-003", "cases": ["width-options", "height-options", "background-color"]},
    {"req": "REQ-CMS-004", "cases": ["icon-size-renders"]},
    {"req": "REQ-CMS-008", "cases": ["light-mode-applies", "popup-respects-theme"]},
    {"req": "REQ-CMS-002", "cases": ["no-deprecated-components"]},
    {"req": "REQ-HOME-006", "cases": ["wide-card-renders", "mobile-stacking"]},
    {"req": "REQ-HOME-005", "cases": ["work-section-visible", "correct-links"]},
    {"req": "REQ-HOME-007", "cases": ["retreats-card-visible"]},
    {"req": "REQ-HOME-008", "cases": ["rentals-different-color"]},
    {"req": "REQ-HOME-003", "cases": ["eager-loading", "preload-request"]},
    {"req": "REQ-SUMMER-001", "cases": ["youtube-renders", "youtube-fallback"]},
    {"req": "REQ-SUMMER-003", "cases": ["session-cards-visible"]},
    {"req": "REQ-SUMMER-006", "cases": ["centered-buttons"]},
    {"req": "REQ-SUMMER-002", "cases": ["custom-width"]},
    {"req": "REQ-SUMMER-004", "cases": ["reduced-width"]},
    {"req": "REQ-SUMMER-005", "cases": ["larger-icons"]},
    {"req": "REQ-BRING-001", "cases": ["hero-height"]}
  ],
  "sp_total": 59,
  "sp_breakdown": [
    {"phase": "Phase 1", "sp": 9},
    {"phase": "Phase 2", "sp": 11},
    {"phase": "Phase 3", "sp": 16},
    {"phase": "Phase 4", "sp": 12},
    {"phase": "Phase 5", "sp": 11},
    {"phase": "Phase 6", "sp": 5}
  ],
  "qshortcuts_sequence": ["QCODET", "QCHECKT", "QCODE", "QCHECK", "QVERIFY", "QDOC", "QGIT"],
  "artifacts": [
    "requirements/updates-04-detailed.md",
    "requirements/QPLAN-updates-04.md",
    "requirements/requirements.lock.md"
  ]
}
```

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-31 | QPLAN Agent | Initial plan document |
