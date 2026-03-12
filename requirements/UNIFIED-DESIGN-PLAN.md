# Unified Design Plan: Bear Lake Camp & Otyokwah Enhancements

**Date:** 2025-12-20
**Status:** READY FOR IMPLEMENTATION
**Total Estimated Effort:** 13 SP

---

## Executive Summary

This plan synthesizes insights from 5 parallel design agents to address all issues identified in the regression test checklist. The design creates a cohesive, user-friendly solution that:

1. **Converts static layouts to CMS-driven templates** with color picker support
2. **Improves editor experience** with inline FAQ editing
3. **Fixes Otyokwah branding** (logo, social links, contact info)
4. **Cleans up unused pages** with proper redirects

---

## Part 1: Bear Lake Camp - Grid Template System

### REQ-GRID-001: Camp Sessions Grid Template (3 SP)

**User Need:** The user wants the look of the previous `CampSessionsPage.tsx` static design but as CMS-editable components with color picker support.

**Static Design Reference (from CampSessionsPage.tsx):**
- 2-column alternating layout (image | colored content)
- Background colors: `sky-600`, `amber-600`, `emerald-700`, `purple-700`
- Full-bleed images filling half the viewport
- Smooth scroll anchor navigation

**Solution: `squareGrid` + `gridSquare` Components**

```
squareGrid (wrapper)
├── gridSquare (image type) - Full-bleed photo
├── gridSquare (color type) - Colored background with content
│   ├── TexturedHeading
│   ├── Description text
│   ├── sessionCard components
│   └── ctaButton
└── ...repeat pattern...
```

**Keystatic Schema:**

```typescript
// keystatic.config.ts (add after line ~1050)

gridSquare: {
  label: 'Grid Square',
  description: 'Image or colored background square for layouts',
  kind: 'wrapper',
  schema: {
    contentType: fields.select({
      label: 'Content Type',
      options: [
        { label: 'Full-Bleed Image', value: 'image' },
        { label: 'Color Background', value: 'color' },
      ],
      defaultValue: 'color',
    }),
    image: fields.image({
      label: 'Image',
      directory: 'public/images/grid',
      publicPath: '/images/grid/',
    }),
    imageAlt: fields.text({ label: 'Image Alt Text' }),
    backgroundColor: fields.text({
      label: 'Background Color (Hex)',
      description: 'e.g., #3B5249 or #8FA68E',
      defaultValue: '#f5f1e8',
    }),
    textColor: fields.select({
      label: 'Text Color',
      options: [
        { label: 'Dark (for light backgrounds)', value: 'dark' },
        { label: 'Light (for dark backgrounds)', value: 'light' },
      ],
      defaultValue: 'dark',
    }),
  },
},

squareGrid: {
  label: 'Square Grid',
  description: '2-column grid of squares (alternating image/content)',
  kind: 'wrapper',
  schema: {
    columns: fields.select({
      label: 'Columns',
      options: [
        { label: '2 Columns', value: '2' },
        { label: '3 Columns', value: '3' },
      ],
      defaultValue: '2',
    }),
    gap: fields.select({
      label: 'Gap',
      options: [
        { label: 'None', value: 'none' },
        { label: 'Small', value: 'sm' },
        { label: 'Medium', value: 'md' },
      ],
      defaultValue: 'none',
    }),
  },
},
```

**React Components:**

| File | Purpose | Props |
|------|---------|-------|
| `components/content/GridSquare.tsx` | Single grid square | `contentType`, `image`, `backgroundColor`, `textColor`, `children` |
| `components/content/SquareGrid.tsx` | Grid container | `columns`, `gap`, `children` |

**Design System Colors (from FINAL-DESIGN-STYLEGUIDE.md):**

| Section | Hex Code | Use Case |
|---------|----------|----------|
| Primary Overnight | `#0284c7` (sky-600) | Light blue for youngest campers |
| Junior Camp | `#d97706` (amber-600) | Warm orange for elementary |
| Jr. High | `#047857` (emerald-700) | Forest green for middle school |
| Sr. High | `#7e22ce` (purple-700) | Royal purple for high school |

**Example Usage (summer-camp-sessions.mdoc):**

```markdown
{% squareGrid columns="2" gap="none" %}

{% gridSquare contentType="image"
   image="/images/summer-program-and-general/primary-overnight.jpg"
   imageAlt="Young campers at Primary Overnight" /%}

{% gridSquare contentType="color" backgroundColor="#0284c7" textColor="light" %}
## Primary Overnight
**Rising 2nd-3rd Graders**

A fun first taste of overnight camp just for our youngest campers!

**June 4-5, 2026 | $100**

{% ctaButton label="Register Now" href="https://ultracamp.com/..." variant="outline" size="lg" /%}
{% /gridSquare %}

{% gridSquare contentType="color" backgroundColor="#d97706" textColor="light" %}
## Junior Camp
**Rising 3rd-6th Graders**

{% sessionCard title="Junior 1" dates="June 14-19, 2026" grades="Grades 4-6" pricing="$440" earlyBird="$390" /%}
{% sessionCard title="Junior 2" dates="July 5-10, 2026" grades="Grades 4-6" pricing="$440" earlyBird="$390" /%}

{% ctaButton label="Register Now" href="https://ultracamp.com/..." variant="outline" size="lg" /%}
{% /gridSquare %}

{% gridSquare contentType="image"
   image="/images/summer-program-and-general/junior-camp.jpg"
   imageAlt="Junior campers enjoying activities" /%}

{% /squareGrid %}
```

---

### REQ-GRID-002: Work at Camp Template Refactor (2 SP)

**User Need:** Same grid layout approach as Camp Sessions for work-at-camp pages.

**Current State:** `work-at-camp-summer-staff.mdoc` uses basic text layout with embedded staff-photo-grid div.

**Solution:** Apply same `squareGrid` pattern with position cards.

**Example Usage (work-at-camp-summer-staff.mdoc):**

```markdown
{% squareGrid columns="2" gap="none" %}

{% gridSquare contentType="image"
   image="/images/staff/Top-promo-1-scaled.jpg"
   imageAlt="Summer staff leading activities" /%}

{% gridSquare contentType="color" backgroundColor="#047857" textColor="light" %}
## What is Summer Staff

Summer staff at Bear Lake Camp is more than just a job - it's a transformative experience where you'll grow in leadership, deepen your faith, and make a lasting impact.

{% ctaButton label="Apply Now" href="https://ultracamp.com/..." variant="primary" size="lg" /%}
{% /gridSquare %}

{% gridSquare contentType="color" backgroundColor="#0284c7" textColor="light" %}
## Available Positions

{% contentCard icon="Users" title="Counselor" %}
Lead campers and facilitate spiritual growth
{% /contentCard %}

{% contentCard icon="UtensilsCrossed" title="Kitchen Staff" %}
Serve meals and create community
{% /contentCard %}
{% /gridSquare %}

{% gridSquare contentType="image"
   image="/images/staff/kitchen-team.jpg"
   imageAlt="Kitchen staff preparing meals" /%}

{% /squareGrid %}
```

---

### REQ-FAQ-001: FAQ Inline Editing (1.5 SP)

**User Need:** Show question AND answer in CMS editor, not just "faqItem" blocks.

**Keystatic Limitation:** `kind: 'inline'` components render as form fields, not WYSIWYG.

**Solution:** Change `faqItem` from `kind: 'inline'` to `kind: 'wrapper'`

**Schema Change:**

```typescript
// keystatic.config.ts - update faqItem (line ~990)

faqItem: {
  label: 'FAQ Item',
  description: 'Question with rich-text answer',
  kind: 'wrapper',  // Changed from 'inline'
  schema: {
    question: fields.text({
      label: 'Question',
      validation: { isRequired: true },
    }),
    category: fields.text({
      label: 'Category',
      defaultValue: 'general',
    }),
    // NOTE: Answer is now in wrapper content, not a field
  },
},
```

**Content Migration (Before/After):**

**Before:**
```markdown
{% faqItem question="How do I register?" answer="Visit our registration page..." category="registration" /%}
```

**After:**
```markdown
{% faqItem question="How do I register?" category="registration" %}
Visit our [registration page](/register) to complete online registration through UltraCamp.

**Payment options:**
- Pay in full
- Set up payment plan
- All payments due before camp starts

Need help? Call (260) 636-7656.
{% /faqItem %}
```

**Benefits:**
- Answer content visible directly in editor
- Supports rich formatting (bold, links, lists)
- Question field still visible in sidebar
- Category for filtering preserved

**Migration Script:** `scripts/migrate-faq-to-wrapper.py`

---

### REQ-DELETE-001: Page Deletions (0.5 SP)

**Pages to Delete:**
- `content/pages/summer-camp-junior-high.mdoc`
- `content/pages/summer-camp-senior-high.mdoc`

**Reason:** Not linked anywhere; content consolidated into `summer-camp-sessions`.

**Redirect Strategy:**

```javascript
// next.config.mjs - add to redirects array

{
  source: '/summer-camp-junior-high',
  destination: '/summer-camp-sessions#jr-high-camp',
  permanent: true,
},
{
  source: '/summer-camp-senior-high',
  destination: '/summer-camp-sessions#sr-high-camp',
  permanent: true,
},
```

**Test Updates Required:**
- Remove assertions expecting these pages
- Add redirect tests (verify HTTP 301)
- Update `summer-camp-sessions.mdoc` to remove internal links to deleted pages

**Files to Update:**
- `next.config.mjs` - Add redirects
- `content/pages/summer-camp-sessions.mdoc` - Remove links (lines 102, 123)
- `tests/e2e/keystatic/seo-generation.spec.ts` - Remove page tests
- `tests/integration/navigation-links.spec.ts` - Update assertions

---

## Part 2: Camp Otyokwah Fixes

### REQ-OTY-001: Logo Restoration (1 SP)

**Issue:** Navigation shows Bear Lake Camp logo instead of Otyokwah logo.

**Root Cause:** `/public/logo-white.png` contains BLC compass logo, not Otyokwah tree logo.

**Solution:**

1. **Source Logo:** Copy from mirror site:
   ```
   Source: /mirror/www.otyokwah.org/uploads/1/1/0/7/110788137/published/otyokwah-black-logo-forthekingdom.png
   ```

2. **Create White Version:** Need to create white/inverted version for dark backgrounds

3. **File Placements:**
   - `/public/logo-white.png` - White logo for dark nav
   - `/public/logo-dark.png` - Dark logo for light backgrounds

4. **Scroll Behavior Preserved:** Current implementation already handles:
   - Size transition: 160px → 120px on scroll
   - Throttled scroll listener (16ms)
   - Threshold: `window.scrollY > 100`

**Implementation Steps:**
```bash
# 1. Copy source logo
cp "/Users/travis/SparkryGDrive/dev/otyokwah/mirror/www.otyokwah.org/uploads/1/1/0/7/110788137/published/otyokwah-black-logo-forthekingdom.png" /Users/travis/SparkryGDrive/dev/otyokwah/public/logo-source.png

# 2. Create white version using ImageMagick (or Photoshop)
convert logo-source.png -negate logo-white.png

# 3. Verify config points to correct path (already does)
# components/navigation/config.ts: logo: '/logo-white.png'
```

---

### REQ-OTY-002: Footer Social Links (1 SP)

**Issue:** Footer shows Bear Lake Camp social links.

**Correct Otyokwah Social Links (from mirror site):**

| Platform | URL |
|----------|-----|
| Facebook | `https://facebook.com/campoty` |
| Instagram | `https://instagram.com/campotyokwah` |
| YouTube | `https://www.youtube.com/user/CampOtyokwah` |

**Current Implementation:** `components/footer/Footer.tsx` lines ~145-175

**Fix:**

```typescript
// components/footer/Footer.tsx - Update social links

const socialLinks = [
  {
    platform: 'facebook',
    url: 'https://facebook.com/campoty',
    label: 'Camp Otyokwah on Facebook',
  },
  {
    platform: 'instagram',
    url: 'https://instagram.com/campotyokwah',
    label: 'Camp Otyokwah on Instagram',
  },
  {
    platform: 'youtube',
    url: 'https://www.youtube.com/user/CampOtyokwah',
    label: 'Camp Otyokwah on YouTube',
  },
];
```

---

### REQ-OTY-003: Footer Contact Info (1 SP)

**Issue:** Footer shows Bear Lake Camp contact information.

**Correct Otyokwah Contact Info (from mirror site):**

| Field | Value |
|-------|-------|
| Name | Otyokwah Camp & Retreat Center |
| Address | 3380 Tugend Road, Butler, OH 44822 |
| Phone | 419-883-3854 |
| Email | info@otyokwah.org |
| Rental Phone | (567)-772-4322 |

**Fix Location:** `components/footer/Footer.tsx` - contact section

**Also Update:** `content/singletons/camp-settings.yaml`

```yaml
# camp-settings.yaml - verify/update values
campName: Camp Otyokwah
tagline: For The Kingdom
contactEmail: info@otyokwah.org
contactPhone: 419-883-3854
address:
  street: 3380 Tugend Road
  city: Butler
  state: OH
  zip: "44822"
rentalPhone: "(567) 772-4322"
```

---

## Part 3: Implementation Plan

### Phase 1: Grid System (3.5 SP)

**Priority:** P0 (Addresses primary user requirement)

| Task | SP | Owner |
|------|-----|-------|
| Create `GridSquare.tsx` component | 1 | react-frontend-specialist |
| Create `SquareGrid.tsx` component | 0.5 | react-frontend-specialist |
| Add Keystatic schema for gridSquare/squareGrid | 0.5 | keystatic-specialist |
| Register Markdoc tags in MarkdocRenderer | 0.5 | sde-iii |
| Migrate summer-camp-sessions.mdoc | 0.5 | content migration |
| Migrate work-at-camp pages | 0.5 | content migration |

### Phase 2: FAQ Enhancement (1.5 SP)

**Priority:** P1 (Improves editor experience)

| Task | SP | Owner |
|------|-----|-------|
| Update faqItem schema to wrapper | 0.3 | keystatic-specialist |
| Update FAQAccordion for ReactNode children | 0.5 | react-frontend-specialist |
| Create migration script | 0.2 | sde-iii |
| Migrate FAQ content files | 0.5 | content migration |

### Phase 3: Page Cleanup (1 SP)

**Priority:** P1 (Prevents confusion)

| Task | SP | Owner |
|------|-----|-------|
| Add redirects to next.config.mjs | 0.2 | sde-iii |
| Update tests for redirects | 0.3 | test-writer |
| Delete unused mdoc files | 0.1 | sde-iii |
| Remove internal links | 0.2 | content migration |
| Verify smoke tests pass | 0.2 | validation-specialist |

### Phase 4: Otyokwah Fixes (3 SP)

**Priority:** P0 (Branding issues)

| Task | SP | Owner |
|------|-----|-------|
| Create/install Otyokwah logo files | 1 | design asset |
| Update Footer social links | 0.5 | react-frontend-specialist |
| Update Footer contact info | 0.5 | react-frontend-specialist |
| Update camp-settings.yaml | 0.2 | content migration |
| Verify logo scroll behavior | 0.3 | validation-specialist |
| Run smoke tests on Otyokwah | 0.5 | validation-specialist |

---

## Testing Requirements

### Playwright Tests Required

| Test | Target | Type |
|------|--------|------|
| Grid squares render correctly | summer-camp-sessions | visual regression |
| Color picker hex values apply | CMS editor | functional |
| FAQ items expand/collapse | summer-camp-faq | functional |
| FAQ inline editing works | Keystatic CMS | functional |
| Page redirects work | deleted pages | redirect verification |
| Otyokwah logo displays correctly | all pages | visual |
| Otyokwah social links correct | footer | link verification |

### Smoke Test Checklist

```bash
# Bear Lake Camp
./scripts/smoke-test.sh --force prelaunch.bearlakecamp.com
# Expected: 31/31 (100%)

# Otyokwah
cd /Users/travis/SparkryGDrive/dev/otyokwah
./scripts/smoke-test.sh --force otyokwah.vercel.app
# Expected: 31/31 (100%)
```

---

## Story Point Summary

| Category | SP |
|----------|-----|
| Grid Template System | 5 |
| FAQ Enhancement | 1.5 |
| Page Cleanup | 1 |
| Otyokwah Fixes | 3 |
| Testing & Validation | 2.5 |
| **TOTAL** | **13 SP** |

---

## Files to Modify/Create

### New Files

| Path | Purpose |
|------|---------|
| `components/content/GridSquare.tsx` | Grid square component |
| `components/content/SquareGrid.tsx` | Grid container component |
| `scripts/migrate-faq-to-wrapper.py` | FAQ content migration |

### Modified Files (Bear Lake Camp)

| Path | Changes |
|------|---------|
| `keystatic.config.ts` | Add gridSquare, squareGrid; update faqItem |
| `components/content/MarkdocRenderer.tsx` | Register new Markdoc tags |
| `components/content/FAQAccordion.tsx` | Support ReactNode children |
| `next.config.mjs` | Add page redirects |
| `content/pages/summer-camp-sessions.mdoc` | Use new grid components |
| `content/pages/work-at-camp-summer-staff.mdoc` | Use new grid components |
| `content/pages/summer-camp-faq.mdoc` | Migrate to wrapper format |

### Modified Files (Otyokwah)

| Path | Changes |
|------|---------|
| `public/logo-white.png` | Replace with Otyokwah logo |
| `public/logo-dark.png` | Add Otyokwah dark logo |
| `components/footer/Footer.tsx` | Update social links, contact info |
| `content/singletons/camp-settings.yaml` | Update contact details |

### Deleted Files

| Path | Reason |
|------|--------|
| `content/pages/summer-camp-junior-high.mdoc` | Consolidated into sessions |
| `content/pages/summer-camp-senior-high.mdoc` | Consolidated into sessions |

---

## Rollback Plan

If any phase fails:

1. **Grid System:** Revert to existing `cardGrid` components (no breaking changes)
2. **FAQ Migration:** Restore `.backup` files, revert keystatic schema
3. **Page Deletions:** Remove redirects, restore mdoc files from git
4. **Otyokwah:** Revert logo files, footer changes from git

---

## Approval Checklist

- [ ] Grid design matches user's vision of previous static page
- [ ] Color picker supports hex values
- [ ] FAQ editing improved for CMS users
- [ ] Page deletions won't break external links (redirects in place)
- [ ] Otyokwah logo files obtained/created
- [ ] All agents agree on architecture approach

**Ready for Implementation:** YES (pending user approval)
