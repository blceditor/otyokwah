# Detailed Requirements: Updates 04

**Document Version**: 1.0
**Date**: 2025-12-31
**Status**: Ready for QPLAN

---

## Executive Summary

This document contains production-ready requirements derived from `/requirements/updates-04.md`. Each requirement has been broken down into single-focus REQ-IDs (max 5 SP each), with acceptance criteria, use cases, test scenarios, and dependencies clearly defined.

### Specialist Contributors
- **PM (Product Manager)**: User scenarios, JTBD validation, prioritization
- **PE (Principal Engineer)**: Technical feasibility, dependencies, architecture
- **SDE-III (Senior Engineer)**: Story points, implementation complexity
- **UX-Designer**: User flows, accessibility, visual design consistency
- **Strategic-Advisor**: Business impact prioritization

---

## Categorization Key

| Category | Description |
|----------|-------------|
| **ISSUE** | Bug fixes for existing functionality |
| **HOME** | Homepage (/) requirements |
| **SUMMER** | Summer Camp page (/summer-camp) requirements |
| **BRING** | What To Bring page requirements |
| **CMS** | Keystatic CMS feature changes |
| **COMP** | Shared component requirements |

---

## Issue Requirements

### REQ-ISSUE-001: Admin Nav Strip Not Rendering

**Category**: ISSUE
**Priority**: P0 (Blocking admin workflows)
**Story Points**: 2 SP

**Problem Statement**:
The admin nav strip (`AdminNavStrip.tsx`) is not appearing for authenticated admin users on the main site. It was working previously.

**Root Cause Analysis** (PE):
Based on code review of `components/admin/AdminNavStrip.tsx`:
1. Component uses client-side auth check via `/api/auth/check`
2. Returns `null` when `isLoading || !isAdmin`
3. Possible causes: API route issue, cookie not being sent, auth check timing

**Acceptance Criteria**:
- [ ] Admin nav strip appears for authenticated GitHub users within 2 seconds of page load
- [ ] Admin nav strip does NOT appear for unauthenticated users
- [ ] All admin nav links function correctly (CMS, Edit Page, Report Bug, Deployment Status)
- [ ] Admin nav strip appears on all pages except `/keystatic/*`

**Use Cases**:

| ID | Scenario | Expected Behavior |
|----|----------|-------------------|
| UC-001-1 | Admin logs into GitHub via Keystatic, navigates to homepage | Admin nav strip visible with all 4 links |
| UC-001-2 | Admin nav strip displayed, admin navigates to /summer-camp | Admin nav strip persists, Edit Page link updates |
| UC-001-3 | Unauthenticated user visits homepage | No admin nav strip visible, no console errors |
| UC-001-4 | Admin visits /keystatic/... | Admin nav strip hidden (per REQ-U03-FIX-011) |
| UC-001-5 | Auth cookie expires mid-session | Admin nav strip gracefully disappears on next page load |

**Error Paths**:
- API auth check returns 500: Log error, don't show strip, don't break page
- Network timeout on auth check: Default to not showing strip after 5s timeout

**Test Scenarios**:
```typescript
// tests/e2e/admin-nav-strip.spec.ts - UPDATE existing tests
test('REQ-ISSUE-001: Admin nav renders when authenticated', async ({ page, context }) => {
  // Mock successful auth
  await context.route('/api/auth/check', route =>
    route.fulfill({ json: { isAdmin: true } })
  );
  await page.goto(PRODUCTION_URL);
  await expect(page.locator('[data-testid="admin-nav-strip"]')).toBeVisible({ timeout: 3000 });
});

test('REQ-ISSUE-001: Admin nav hidden when not authenticated', async ({ page }) => {
  await page.goto(PRODUCTION_URL);
  await expect(page.locator('[data-testid="admin-nav-strip"]')).not.toBeVisible();
});

test('REQ-ISSUE-001: Auth API failure does not break page', async ({ page, context }) => {
  await context.route('/api/auth/check', route => route.abort('failed'));
  await page.goto(PRODUCTION_URL);
  // Page should still load normally
  await expect(page.locator('header')).toBeVisible();
});
```

**Dependencies**: None (isolated fix)

**Non-Goals**:
- Changing authentication mechanism
- Adding additional admin features

---

## Homepage Requirements

### REQ-HOME-001: CTA Buttons in CMS Editor

**Category**: HOME, CMS
**Priority**: P1
**Story Points**: 3 SP

**Problem Statement**:
CTA buttons on homepage are hardcoded in the template. Need to be editable via CMS.

**Current State** (PE Analysis):
- `ctaButton` component exists in `shared-components.ts`
- Homepage template (`templateFields.homepage`) has basic CTA fields but they're in a fixed object
- Need to allow inline CTA buttons within page body content

**Acceptance Criteria**:
- [ ] CTA buttons can be added/edited in Page Content (body) field
- [ ] Button text, link, variant, and size are all configurable
- [ ] Preview shows accurate button styling in CMS
- [ ] Homepage renders CTA buttons from CMS content

**Use Cases**:

| ID | Scenario | Expected Behavior |
|----|----------|-------------------|
| UC-HOME-001-1 | Admin adds CTA button in editor | Button appears with default styling |
| UC-HOME-001-2 | Admin changes button variant to "secondary" | Preview updates to secondary styling |
| UC-HOME-001-3 | Admin enters invalid URL | Validation error shown before save |
| UC-HOME-001-4 | Page renders with multiple CTA buttons | All buttons render in correct order |

**Test Scenarios**:
```typescript
// tests/e2e/homepage-cms.spec.ts
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
  expect(href).toMatch(/^https?:\/\//);
});
```

**Dependencies**: None (CTA component already exists)

---

### REQ-HOME-002: Gallery Component in CMS Editor

**Category**: HOME, CMS
**Priority**: P1
**Story Points**: 2 SP

**Problem Statement**:
Gallery component exists but isn't available as an inline component in page body.

**Acceptance Criteria**:
- [ ] Gallery component can be inserted into Page Content
- [ ] Images can be selected from media browser
- [ ] Gallery renders with proper grid layout on homepage

**Use Cases**:

| ID | Scenario | Expected Behavior |
|----|----------|-------------------|
| UC-HOME-002-1 | Admin inserts gallery, adds 3 images | Gallery preview shows 3-column grid |
| UC-HOME-002-2 | Admin adds gallery with 1 image | Gallery renders as single centered image |
| UC-HOME-002-3 | Admin clicks image field | Media browser opens (per CMS-1) |

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

**Dependencies**: CMS-1 (Media Browser)

---

### REQ-HOME-003: Faith.Adventure.Transformation Image Preload

**Category**: HOME
**Priority**: P2
**Story Points**: 2 SP

**Problem Statement**:
The "Faith. Adventure. Transformation." section image loads last or only on scroll. Should preload after hero video.

**Root Cause** (PE):
Likely using lazy loading attribute or intersection observer. Needs `loading="eager"` or preload hint.

**Acceptance Criteria**:
- [ ] Image begins loading immediately after hero video starts loading
- [ ] Image is visible without scrolling (LCP optimization)
- [ ] No visible loading state or placeholder after 3 seconds on fast connection

**Use Cases**:

| ID | Scenario | Expected Behavior |
|----|----------|-------------------|
| UC-HOME-003-1 | User loads homepage on 4G connection | Image visible within 3 seconds of page load |
| UC-HOME-003-2 | User loads homepage on slow 3G | Image loads before user scrolls to section |
| UC-HOME-003-3 | User refreshes page | Image loads from cache immediately |

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

**Dependencies**: None

---

### REQ-HOME-004: "Which Camp is Right for You?" Card Component

**Category**: HOME, COMP
**Priority**: P0
**Story Points**: 5 SP

**Problem Statement**:
New card component needed for camp session overview. Must match mock in `requirements/image-12.png`.

**Design Spec** (from mock):
- Rounded corners card (border-radius ~12px)
- Image at top (full width within card)
- Left-justified text section:
  - Heading (camp name, e.g., "JR. HIGH CAMP")
  - Subheading (age group, e.g., "Rising 7th-9th Graders")
  - Bullet list (1-5 items) with configurable bullet type with preview of bullet type
  - CTA button (green with white text, centered)
- Hover animation (subtle scale or shadow)

**Acceptance Criteria**:
- [ ] Card renders with image, heading, subheading, bullets, and CTA
- [ ] Text is left-justified (card-level, not page-level)
- [ ] Bullet type is configurable (checkmark, bullet, diamond, numbers)
- [ ] CTA button is green (#047857) with white text, centered
- [ ] Card has subtle hover animation
- [ ] Card is fully editable in CMS

**Schema Design** (PE):
```typescript
campSessionCard: {
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
}
```

**Use Cases**:

| ID | Scenario | Expected Behavior |
|----|----------|-------------------|
| UC-HOME-004-1 | Admin adds camp session card | Card renders with all fields |
| UC-HOME-004-2 | Admin selects "checkmark" bullets | Bullets render with checkmark icons |
| UC-HOME-004-3 | Admin adds 0 bullets | Bullet section hidden, other content renders |
| UC-HOME-004-4 | User hovers on card | Subtle scale/shadow animation |
| UC-HOME-004-5 | User clicks CTA | Navigates to specified link |

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
  await expect(card.locator('h2, h3, h4')).toBeVisible(); // heading
  await expect(card.locator('a, button')).toBeVisible(); // CTA
});

test('REQ-HOME-004: Camp session card hover animation', async ({ page }) => {
  await page.goto('https://prelaunch.bearlakecamp.com/');
  const card = page.locator('[data-component="camp-session-card"]').first();
  const initialTransform = await card.evaluate(el => getComputedStyle(el).transform);
  await card.hover();
  await page.waitForTimeout(300); // wait for animation
  const hoverTransform = await card.evaluate(el => getComputedStyle(el).transform);
  // Transform should change on hover (scale or translateY)
  expect(hoverTransform).not.toBe(initialTransform);
});
```

**Dependencies**: CMS-1 (for image selection)

---

### REQ-HOME-005: Work At Camp Section

**Category**: HOME
**Priority**: P1
**Story Points**: 3 SP

**Problem Statement**:
New homepage section linking to Summer Staff, Leaders in Training, and Year-Round opportunities.

**Design Spec** (UX):
- NOT the same card style as "Which Camp" cards
- Horizontal layout preferred (3 columns on desktop)
- Each item: Image thumbnail + Title + Brief description + Link
- Visual differentiation from session cards (different shape/style)

**Content Sources**:
- `/work-at-camp-summer-staff`: "Make an Eternal Impact" - Summer staff positions
- `/work-at-camp-leaders-in-training`: High School Servant Leadership Program
- `/work-at-camp-year-round`: Year-round employment opportunities

**Acceptance Criteria**:
- [ ] Section displays 3 work opportunity cards
- [ ] Each card links to correct page
- [ ] Cards are visually distinct from camp session cards
- [ ] Section is editable in CMS (or uses existing page content)

**Use Cases**:

| ID | Scenario | Expected Behavior |
|----|----------|-------------------|
| UC-HOME-005-1 | User views Work At Camp section | 3 distinct opportunities visible |
| UC-HOME-005-2 | User clicks "Summer Staff" card | Navigates to /work-at-camp-summer-staff |
| UC-HOME-005-3 | Mobile user views section | Cards stack vertically |

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

**Dependencies**: REQ-HOME-006 (Wide Card Component)

---

### REQ-HOME-006: Wide Card Component

**Category**: HOME, COMP
**Priority**: P1
**Story Points**: 3 SP

**Problem Statement**:
New component for "Retreats" and "Rentals" sections - wide cards with image, text, and link.

**Design Spec** (UX):
- Full-width within content area
- Image on left (40%) or right (alternating), content on right (60%)
- Different background colors for Retreats vs Rentals
- Title, brief description, CTA link
- Responsive: Stacks on mobile

**Acceptance Criteria**:
- [ ] Wide card component renders with image and content
- [ ] Background color is configurable
- [ ] Image position (left/right) is configurable
- [ ] Retreats card and Rentals card have distinct colors
- [ ] Component is CMS-editable

**Schema Design**:
```typescript
wideCard: {
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
}
```

**Test Scenarios**:
```typescript
test('REQ-HOME-006: Retreats wide card visible', async ({ page }) => {
  await page.goto('https://prelaunch.bearlakecamp.com/');
  const retreatsCard = page.locator('[data-component="wide-card"][data-section="retreats"]');
  await expect(retreatsCard).toBeVisible();
  await expect(retreatsCard.locator('a[href*="retreats"]')).toBeVisible();
});

test('REQ-HOME-006: Rentals wide card has different color', async ({ page }) => {
  await page.goto('https://prelaunch.bearlakecamp.com/');
  const retreatsCard = page.locator('[data-section="retreats"]').first();
  const rentalsCard = page.locator('[data-section="rentals"]').first();
  const retreatsBg = await retreatsCard.evaluate(el => getComputedStyle(el).backgroundColor);
  const rentalsBg = await rentalsCard.evaluate(el => getComputedStyle(el).backgroundColor);
  expect(retreatsBg).not.toBe(rentalsBg);
});
```

**Dependencies**: CMS-5 (Color Picker)

---

### REQ-HOME-007: Retreats Section on Homepage

**Category**: HOME
**Priority**: P2
**Story Points**: 2 SP

**Problem Statement**:
Add Retreats highlight section to homepage using wide card component.

**Content Source**: `/retreats` page - "Host Your Group at Bear Lake"

**Acceptance Criteria**:
- [ ] Retreats section appears on homepage below Work At Camp
- [ ] Uses wide card component (REQ-HOME-006)
- [ ] Links to /retreats page
- [ ] Content pulled from existing retreats page or manually configured

**Dependencies**: REQ-HOME-006

---

### REQ-HOME-008: Rentals Section on Homepage

**Category**: HOME
**Priority**: P2
**Story Points**: 2 SP

**Problem Statement**:
Add Rentals highlight section to homepage using wide card component with different color.

**Content Source**: `/rentals` page - "Your Next Retreat Starts Here"

**Acceptance Criteria**:
- [ ] Rentals section appears on homepage below Retreats
- [ ] Uses wide card component with different background color
- [ ] Links to /rentals page
- [ ] Visually distinct from Retreats section

**Dependencies**: REQ-HOME-006

---

## Summer Camp Page Requirements

### REQ-SUMMER-001: YouTube Hero Video Support

**Category**: SUMMER, COMP
**Priority**: P1
**Story Points**: 4 SP

**Problem Statement**:
Hero component needs to support YouTube videos in addition to local videos.

**Current State** (PE):
- `heroVideo` field exists but only supports local paths
- YouTube component exists for inline content but not hero

**Acceptance Criteria**:
- [ ] Hero can display YouTube video by URL or video ID
- [ ] YouTube hero auto-plays (muted per browser requirements)
- [ ] Fallback to hero image if YouTube fails to load
- [ ] CMS allows choice between local video, YouTube, or image-only

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

**Use Cases**:

| ID | Scenario | Expected Behavior |
|----|----------|-------------------|
| UC-SUMMER-001-1 | Admin sets YouTube ID | Hero displays YouTube video |
| UC-SUMMER-001-2 | YouTube video blocked by ad blocker | Fallback to hero image |
| UC-SUMMER-001-3 | User on mobile | YouTube plays muted, no autoplay issues |
| UC-SUMMER-001-4 | Admin switches from YouTube to local | Hero updates correctly |

**Test Scenarios**:
```typescript
test('REQ-SUMMER-001: YouTube hero video renders', async ({ page }) => {
  await page.goto('https://prelaunch.bearlakecamp.com/summer-camp');
  const youtubeHero = page.locator('[data-component="hero-youtube"], iframe[src*="youtube"]');
  // Should either have YouTube iframe or fallback image
  const heroElement = page.locator('.hero-section, [data-component="hero"]');
  await expect(heroElement).toBeVisible();
});

test('REQ-SUMMER-001: YouTube hero has fallback', async ({ page, context }) => {
  // Block YouTube
  await context.route('**/youtube.com/**', route => route.abort());
  await page.goto('https://prelaunch.bearlakecamp.com/summer-camp');
  const heroImage = page.locator('.hero-section img, [data-component="hero"] img');
  await expect(heroImage).toBeVisible();
});
```

**Dependencies**: None

---

### REQ-SUMMER-002: Summer 2026 Worthy Section Card Width

**Category**: SUMMER
**Priority**: P2
**Story Points**: 1 SP

**Problem Statement**:
Summer 2026 Worthy section card needs width adjustment capability.

**Acceptance Criteria**:
- [ ] Card width can be set in CMS
- [ ] Width options: 50%, 75%, 100%, or custom px value
- [ ] Centered when less than 100%

**Dependencies**: CMS-3 (Width/Height Options)

---

### REQ-SUMMER-003: Summer Camp Sessions Cards

**Category**: SUMMER
**Priority**: P0
**Story Points**: 2 SP (reuse of REQ-HOME-004)

**Problem Statement**:
Summer Camp page needs same session cards as homepage "Which Camp is Right for You?" section.

**Acceptance Criteria**:
- [ ] Camp session cards render on /summer-camp page
- [ ] Cards use same component as homepage (REQ-HOME-004)
- [ ] Content matches summer-camp-sessions page data
- [ ] Cards link to relevant session sections

**Dependencies**: REQ-HOME-004

---

### REQ-SUMMER-004: Prepare For Camp Card Width

**Category**: SUMMER
**Priority**: P2
**Story Points**: 1 SP

**Problem Statement**:
"Prepare For Camp" cards are too wide. Need ~60% of current width.

**Acceptance Criteria**:
- [ ] Card width reduced to approximately 60% of current
- [ ] Width configurable via CMS (CMS-3)
- [ ] Cards remain centered and responsive

**Dependencies**: CMS-3

---

### REQ-SUMMER-005: Prepare For Camp Icon Size

**Category**: SUMMER
**Priority**: P2
**Story Points**: 1 SP

**Problem Statement**:
Icons in "Prepare For Camp" cards need to be larger.

**Acceptance Criteria**:
- [ ] Icon size increased visually
- [ ] Icon size configurable via CMS (CMS-4)
- [ ] Default size is larger than current

**Dependencies**: CMS-4

---

### REQ-SUMMER-006: Prepare For Camp Button Links

**Category**: SUMMER
**Priority**: P1
**Story Points**: 2 SP

**Problem Statement**:
Links at bottom of Prepare For Camp cards should be styled as buttons and centered.

**Acceptance Criteria**:
- [ ] Links render as button-styled elements
- [ ] Buttons are horizontally centered within card
- [ ] Button styling consistent with site design system

**Use Cases**:

| ID | Scenario | Expected Behavior |
|----|----------|-------------------|
| UC-SUMMER-006-1 | User views Prepare For Camp section | Links appear as buttons |
| UC-SUMMER-006-2 | User clicks button | Navigates to correct page |
| UC-SUMMER-006-3 | Mobile view | Buttons remain centered and tappable |

**Test Scenarios**:
```typescript
test('REQ-SUMMER-006: Prepare for Camp has centered buttons', async ({ page }) => {
  await page.goto('https://prelaunch.bearlakecamp.com/summer-camp');
  const prepareSection = page.locator('[data-section="prepare-for-camp"]');
  const buttons = prepareSection.locator('a[class*="button"], button');
  await expect(buttons.first()).toBeVisible();
  // Check centered alignment
  const buttonBox = await buttons.first().boundingBox();
  const sectionBox = await prepareSection.boundingBox();
  if (buttonBox && sectionBox) {
    const buttonCenter = buttonBox.x + buttonBox.width / 2;
    const sectionCenter = sectionBox.x + sectionBox.width / 2;
    expect(Math.abs(buttonCenter - sectionCenter)).toBeLessThan(50); // Allow 50px tolerance
  }
});
```

**Dependencies**: None

---

## What To Bring Page Requirements

### REQ-BRING-001: Hero Image Size

**Category**: BRING
**Priority**: P2
**Story Points**: 2 SP

**Problem Statement**:
Hero image area on What To Bring page cuts off people's heads. Needs to be taller.

**Acceptance Criteria**:
- [ ] Hero image height increased to show full subject matter
- [ ] Hero height configurable per page (not global)
- [ ] No aspect ratio distortion

**Use Cases**:

| ID | Scenario | Expected Behavior |
|----|----------|-------------------|
| UC-BRING-001-1 | User views What To Bring hero | Full image visible including heads |
| UC-BRING-001-2 | Admin sets hero height in CMS | Image area adjusts accordingly |
| UC-BRING-001-3 | Different aspect ratio image uploaded | Image crops gracefully without head cutoff |

**Test Scenarios**:
```typescript
test('REQ-BRING-001: What To Bring hero is sufficiently tall', async ({ page }) => {
  await page.goto('https://prelaunch.bearlakecamp.com/summer-camp-what-to-bring');
  const hero = page.locator('.hero-section, [data-component="hero"]');
  const heroBox = await hero.boundingBox();
  // Hero should be at least 400px tall (adjust based on design)
  expect(heroBox?.height).toBeGreaterThanOrEqual(400);
});
```

**Dependencies**: CMS-3 (Height options)

---

## CMS Feature Requirements

### REQ-CMS-001: Media Browser with Upload

**Category**: CMS
**Priority**: P0
**Story Points**: 5 SP

**Problem Statement**:
Image fields should open media browser with ability to upload new images.

**Current State** (PE):
- `MediaLibrary.tsx` and `MediaPickerDialog.tsx` exist
- Need to audit all image fields and ensure media browser integration
- Add upload capability if missing

**Acceptance Criteria**:
- [ ] All image fields in CMS open media browser on click
- [ ] Media browser shows existing images sorted by date (newest first)
- [ ] "Upload" button allows adding new images
- [ ] Newly uploaded image can be immediately selected
- [ ] Upload supports drag-and-drop

**Use Cases**:

| ID | Scenario | Expected Behavior |
|----|----------|-------------------|
| UC-CMS-001-1 | Admin clicks image field | Media browser modal opens |
| UC-CMS-001-2 | Admin clicks Upload | File picker opens |
| UC-CMS-001-3 | Admin drags image to browser | Image uploads, appears at top |
| UC-CMS-001-4 | Admin selects existing image | Field populates, modal closes |
| UC-CMS-001-5 | Upload fails (file too large) | Error message shown, modal stays open |

**Error Paths**:
- File too large (>5MB): Show size limit error
- Invalid file type: Show "Images only" error
- Upload network failure: Show retry option

**Test Scenarios**:
```typescript
// tests/e2e/keystatic/media-library.spec.ts - ENHANCE
test('REQ-CMS-001: Media browser opens from image field', async ({ page }) => {
  // Navigate to page editor with image field
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
  await page.goto('https://prelaunch.bearlakecamp.com/keystatic/collection/pages/item/index');
  const imageField = page.locator('[data-field-type="image"]').first();
  await imageField.click();
  // First image should be most recent (this test may need mock data)
  const firstImage = page.locator('[data-testid="media-browser"] img').first();
  await expect(firstImage).toBeVisible();
});
```

**Dependencies**: None

**Non-Goals**:
- Image editing/cropping within browser (future feature)
- Bulk upload (future feature)

---

### REQ-CMS-002: Component Deduplication Audit

**Category**: CMS
**Priority**: P1
**Story Points**: 3 SP

**Problem Statement**:
Multiple similar components exist in CMS. Need audit and consolidation.

**Audit Required** (PE):
Review these components for overlap:
- `contentCard` vs `infoCard` vs `sectionCard`
- `gallery` vs `imageGallery`
- `cta` vs `ctaButton` vs `ctaSection`
- `accordion` vs `faqAccordion`

**Acceptance Criteria**:
- [ ] All duplicate components identified
- [ ] Consolidated component set documented
- [ ] Deprecated components removed or aliased
- [ ] All pages updated to use canonical components
- [ ] No visual regressions

**Deliverables**:
1. Component audit document listing overlaps
2. Deprecation plan with migration steps
3. Updated pages using canonical components
4. Tests verifying no regressions

**Test Scenarios**:
```typescript
test('REQ-CMS-002: No deprecated components in use', async ({ page }) => {
  // This test checks that deprecated component names don't appear in content
  const response = await fetch('https://prelaunch.bearlakecamp.com/');
  const html = await response.text();
  // List of deprecated component markers
  const deprecated = ['data-component="old-card"', 'data-component="info-card-v1"'];
  deprecated.forEach(marker => {
    expect(html).not.toContain(marker);
  });
});
```

**Dependencies**: None

---

### REQ-CMS-003: Container Width/Height/Background Options

**Category**: CMS
**Priority**: P0
**Story Points**: 4 SP

**Problem Statement**:
Page Content Card, Card Grid, Grid, Section components need width, height, and background options.

**Target Components**:
- `cardGrid`
- `squareGrid`
- `gridSquare`
- `section`
- `contentBox`
- `contentCard`

**Schema Additions**:
```typescript
// Add to each target component
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

**Acceptance Criteria**:
- [ ] Width options available on all container components
- [ ] Height options available on all container components
- [ ] Background color picker works (see CMS-5)
- [ ] Background image selection works
- [ ] Preview updates in real-time
- [ ] Custom values validate correctly

**Use Cases**:

| ID | Scenario | Expected Behavior |
|----|----------|-------------------|
| UC-CMS-003-1 | Admin sets width to 50% | Component renders at half width, centered |
| UC-CMS-003-2 | Admin sets custom width "300px" | Component renders at 300px |
| UC-CMS-003-3 | Admin sets background color | Preview shows color immediately |
| UC-CMS-003-4 | Admin sets background image | Image tiles/covers as appropriate |
| UC-CMS-003-5 | Invalid custom value entered | Validation error shown |

**Test Scenarios**:
```typescript
test('REQ-CMS-003: Card with custom width renders correctly', async ({ page }) => {
  await page.goto('https://prelaunch.bearlakecamp.com/testing-components');
  const customWidthCard = page.locator('[data-width="50"]');
  if (await customWidthCard.count() > 0) {
    const cardBox = await customWidthCard.first().boundingBox();
    const containerWidth = await page.evaluate(() => document.body.clientWidth);
    // Card should be roughly 50% of container width
    expect(cardBox?.width).toBeLessThan(containerWidth * 0.6);
  }
});
```

**Dependencies**: CMS-5 (Color Picker)

---

### REQ-CMS-004: Icon Size Settings

**Category**: CMS
**Priority**: P1
**Story Points**: 2 SP

**Problem Statement**:
Icons in components need configurable size.

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

**Acceptance Criteria**:
- [ ] Icon size dropdown appears on all icon-enabled components
- [ ] Size change reflects in preview immediately
- [ ] Size change reflects on production site
- [ ] Default size is Medium (24px)

**Test Scenarios**:
```typescript
test('REQ-CMS-004: Large icon renders at 48px', async ({ page }) => {
  await page.goto('https://prelaunch.bearlakecamp.com/testing-components');
  const largeIcon = page.locator('[data-icon-size="xl"] svg');
  if (await largeIcon.count() > 0) {
    const iconBox = await largeIcon.first().boundingBox();
    expect(iconBox?.width).toBeGreaterThanOrEqual(44); // Allow small variance
  }
});
```

**Dependencies**: None

---

### REQ-CMS-005: Color Picker with Presets

**Category**: CMS
**Priority**: P1
**Story Points**: 4 SP

**Problem Statement**:
Color selection needs preset theme colors, hex input, and live preview.

**Design Spec** (UX):
```
+-------------------+-------------------+
| Theme Colors      | Recent Colors     |
| [#047857] [#0284c7] | [last 5 used]   |
| [#d97706] [#7e22ce] |                 |
| [#f5f0e8] [#1f2937] |                 |
+-------------------+-------------------+
| Standard Web Colors (8x3 grid)        |
| [grid of common colors]               |
+--------------------------------------|
| Hex: [#______] | Preview: [square]   |
+--------------------------------------+
```

**Theme Colors** (from tailwind.config.ts):
- `#047857` (emerald/forest green)
- `#0284c7` (sky blue)
- `#d97706` (amber/gold)
- `#7e22ce` (purple)
- `#f5f0e8` (cream)
- `#1f2937` (bark/dark)

**Acceptance Criteria**:
- [ ] Theme color presets clickable
- [ ] Standard web color grid visible
- [ ] Hex input accepts valid hex codes
- [ ] Preview square updates in real-time
- [ ] Invalid hex shows validation error
- [ ] Recent colors remembered per session

**Use Cases**:

| ID | Scenario | Expected Behavior |
|----|----------|-------------------|
| UC-CMS-005-1 | Admin clicks theme color | Hex field updates, preview updates |
| UC-CMS-005-2 | Admin types "047857" | Preview updates to green |
| UC-CMS-005-3 | Admin types "invalid" | Validation error, preview unchanged |
| UC-CMS-005-4 | Admin selects 3 colors | Recent colors shows those 3 |

**Test Scenarios**:
```typescript
test('REQ-CMS-005: Color picker shows theme presets', async ({ page }) => {
  await page.goto('https://prelaunch.bearlakecamp.com/keystatic/collection/pages/item/testing-components');
  // Open a component with color field
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

**Dependencies**: None

---

### REQ-CMS-006: UX Review Post-Implementation

**Category**: CMS
**Priority**: P2
**Story Points**: 3 SP

**Problem Statement**:
After CMS-1 through CMS-5 are complete, need UX expert review.

**Scope**:
- Usability testing of new CMS features
- Consistency audit
- Accessibility review
- Recommendations for improvements

**Acceptance Criteria**:
- [ ] UX expert has reviewed all new CMS features
- [ ] Findings documented in requirements format
- [ ] Priority assigned to each finding
- [ ] Stories created for any P0/P1 issues

**Dependencies**: CMS-1, CMS-2, CMS-3, CMS-4, CMS-5

**Output**: New requirements document `requirements/updates-04-ux-review.md`

---

### REQ-CMS-007: Navigation Updates (Incomplete)

**Category**: CMS
**Priority**: P3 (Pending clarification)
**Story Points**: TBD

**Problem Statement**:
Source requirement was incomplete: "Change the CMS nav to have all..."

**Action Required**:
- Clarify with stakeholder what navigation changes are needed
- Document full requirement once clarified

**Current CMS Navigation** (for reference):
```typescript
ui: {
  navigation: {
    Content: ["pages", "staff", "testimonials", "faqs"],
    Homepage: ["mission", "homepage"],
    Settings: ["campSettings", "siteNavigation"],
  },
},
```

**Acceptance Criteria**: TBD pending clarification

**Dependencies**: None

---

### REQ-CMS-008: Light/Dark Mode Fix

**Category**: CMS
**Priority**: P1
**Story Points**: 3 SP

**Problem Statement**:
Light mode not working correctly in CMS. Dark mode is fine. Component editing popups may not switch themes.

**Current State** (PE):
- `ThemeToggle.tsx` exists using `next-themes`
- `ThemeProvider.tsx` provides context
- Issue may be in specific component styling or Keystatic override

**Investigation Areas**:
1. Check if `dark:` classes exist for all light mode alternatives
2. Check if Keystatic CSS overrides theme
3. Check if popup modals have theme context

**Acceptance Criteria**:
- [ ] Toggle switches between light and dark mode
- [ ] All CMS UI elements respond to theme change
- [ ] Component editing popups use correct theme
- [ ] Theme persists across sessions

**Use Cases**:

| ID | Scenario | Expected Behavior |
|----|----------|-------------------|
| UC-CMS-008-1 | Admin toggles to light mode | All backgrounds become light |
| UC-CMS-008-2 | Admin opens component editor in light mode | Popup has light background |
| UC-CMS-008-3 | Admin refreshes in light mode | Light mode persists |
| UC-CMS-008-4 | Admin visits different CMS page | Theme stays consistent |

**Test Scenarios**:
```typescript
test('REQ-CMS-008: Light mode applies to all elements', async ({ page }) => {
  await page.goto('https://prelaunch.bearlakecamp.com/keystatic');
  // Set light mode
  const themeToggle = page.locator('[aria-label*="light mode"], [aria-label*="dark mode"]');
  await themeToggle.click();
  await page.waitForTimeout(500);

  // Check background is light
  const bgColor = await page.evaluate(() =>
    getComputedStyle(document.body).backgroundColor
  );
  // Light background should have high luminance
  expect(bgColor).toMatch(/rgb\((2[0-5]\d|1\d\d|[5-9]\d),/); // R > 50
});

test('REQ-CMS-008: Component popup respects theme', async ({ page }) => {
  await page.goto('https://prelaunch.bearlakecamp.com/keystatic/collection/pages/item/index');
  // Set light mode
  const themeToggle = page.locator('[aria-label*="light mode"], [aria-label*="dark mode"]');
  await themeToggle.click();

  // Open a component editor (this selector may need adjustment)
  const addButton = page.locator('button:has-text("Add")').first();
  if (await addButton.isVisible()) {
    await addButton.click();
    const popup = page.locator('[role="dialog"]');
    if (await popup.isVisible()) {
      const popupBg = await popup.evaluate(el => getComputedStyle(el).backgroundColor);
      // Should be light colored
      expect(popupBg).not.toContain('rgb(0, 0, 0)');
    }
  }
});
```

**Dependencies**: None

---

## Shared Component Requirements

### REQ-COMP-001: Camp Session Card Container

**Category**: COMP
**Priority**: P0
**Story Points**: 2 SP

**Problem Statement**:
Need a container component to hold multiple camp session cards in a responsive grid.

**Acceptance Criteria**:
- [ ] Container arranges camp session cards in responsive grid
- [ ] 1 column on mobile, 2-3 on tablet, 4 on desktop
- [ ] Equal height cards within row
- [ ] Configurable gap between cards

**Schema**:
```typescript
campSessionCardGrid: {
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
}
```

**Dependencies**: REQ-HOME-004

---

## Test Infrastructure Updates

### REQ-TEST-001: Update Existing Tests for New Components

**Category**: TEST
**Priority**: P0
**Story Points**: 2 SP

**Problem Statement**:
Existing tests must be updated before implementation to match new requirements.

**Tests to Update**:
1. `tests/e2e/homepage-cms.spec.ts` - Add CTA button and gallery tests
2. `tests/e2e/admin-nav-strip.spec.ts` - Fix failing auth tests
3. `tests/e2e/camp-sessions.spec.ts` - Add new card component tests
4. `tests/e2e/keystatic-theme.spec.ts` - Add light mode tests

**Acceptance Criteria**:
- [ ] All existing tests pass with current production
- [ ] New test cases added for each REQ-ID
- [ ] Tests use proper selectors (data-testid, data-component)
- [ ] Tests include visual verification where applicable

**Dependencies**: None (must be first)

---

## Implementation Order (Strategic-Advisor Recommendation)

### Phase 1: Blocking Issues (Week 1)
1. **REQ-ISSUE-001** - Admin Nav Fix (P0, blocks admin workflow)
2. **REQ-TEST-001** - Test Infrastructure Updates (P0, required first)
3. **REQ-CMS-001** - Media Browser (P0, blocks image workflows)

### Phase 2: Homepage Foundation (Week 1-2)
4. **REQ-HOME-004** - Camp Session Card Component (P0, new design)
5. **REQ-COMP-001** - Camp Session Card Grid (P0, container)
6. **REQ-HOME-001** - CTA Buttons in CMS (P1)
7. **REQ-HOME-002** - Gallery in CMS (P1)

### Phase 3: CMS Enhancements (Week 2)
8. **REQ-CMS-003** - Container Width/Height/Background (P0)
9. **REQ-CMS-005** - Color Picker (P1, needed for CMS-3)
10. **REQ-CMS-004** - Icon Size Settings (P1)
11. **REQ-CMS-002** - Component Deduplication (P1)
12. **REQ-CMS-008** - Light/Dark Mode Fix (P1)

### Phase 4: Homepage Sections (Week 2-3)
13. **REQ-HOME-006** - Wide Card Component (P1)
14. **REQ-HOME-005** - Work At Camp Section (P1)
15. **REQ-HOME-007** - Retreats Section (P2)
16. **REQ-HOME-008** - Rentals Section (P2)
17. **REQ-HOME-003** - Image Preload Fix (P2)

### Phase 5: Summer Camp Page (Week 3)
18. **REQ-SUMMER-001** - YouTube Hero (P1)
19. **REQ-SUMMER-003** - Session Cards (P0, reuse)
20. **REQ-SUMMER-006** - Prepare For Camp Buttons (P1)
21. **REQ-SUMMER-002** - Worthy Section Width (P2)
22. **REQ-SUMMER-004** - Prepare Card Width (P2)
23. **REQ-SUMMER-005** - Icon Size (P2)

### Phase 6: Cleanup (Week 3-4)
24. **REQ-BRING-001** - Hero Image Size (P2)
25. **REQ-CMS-006** - UX Review (P2)
26. **REQ-CMS-007** - Nav Updates (P3, pending clarification)

---

## Total Story Points

| Category | Story Points |
|----------|--------------|
| ISSUE | 2 SP |
| HOME | 22 SP |
| SUMMER | 11 SP |
| BRING | 2 SP |
| CMS | 24 SP |
| COMP | 2 SP |
| TEST | 2 SP |
| **TOTAL** | **65 SP** |

---

## Appendix A: Mock Reference

The camp session card design from `requirements/image-12.png`:

**Visual Elements**:
- Card with rounded corners (approximately 12px radius)
- Image at top spanning full card width
- "JR. HIGH CAMP" as main heading (uppercase, bold)
- "Rising 7th-9th Graders" as subheading (smaller, regular weight)
- Checkmark bullet list:
  - Faith growth & exploration
  - Team games & Slip-n-Slide
  - Friendship & independence
- Green CTA button "See Dates & Pricing" (centered, full width within padding)

---

## Appendix B: Component Cross-Reference

| New Component | Similar Existing Component | Notes |
|---------------|---------------------------|-------|
| campSessionCard | gridSquare | Different purpose - card vs grid cell |
| wideCard | sectionCard | New full-width variant needed |
| campSessionCardGrid | cardGrid | May extend existing |

---

## Appendix C: Dependencies Graph

```
REQ-CMS-001 (Media Browser)
    |
    +-- REQ-HOME-002 (Gallery)
    |
    +-- REQ-HOME-004 (Session Card)

REQ-CMS-005 (Color Picker)
    |
    +-- REQ-CMS-003 (Container Options)
    |
    +-- REQ-HOME-006 (Wide Card)

REQ-HOME-004 (Session Card)
    |
    +-- REQ-COMP-001 (Card Grid)
    |
    +-- REQ-SUMMER-003 (Summer Camp Sessions)

REQ-HOME-006 (Wide Card)
    |
    +-- REQ-HOME-007 (Retreats)
    |
    +-- REQ-HOME-008 (Rentals)

REQ-CMS-003 (Container Options)
    |
    +-- REQ-SUMMER-002 (Worthy Width)
    |
    +-- REQ-SUMMER-004 (Prepare Width)
    |
    +-- REQ-BRING-001 (Hero Height)

REQ-CMS-004 (Icon Size)
    |
    +-- REQ-SUMMER-005 (Prepare Icons)
```

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-31 | COS Team | Initial detailed requirements |
