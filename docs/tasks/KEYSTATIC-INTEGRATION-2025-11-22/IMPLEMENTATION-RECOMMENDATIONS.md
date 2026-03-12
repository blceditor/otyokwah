# Implementation Recommendations
## Based on TDD Red Phase Analysis

**Date**: December 2, 2025
**Phase**: Transition from Red to Green (Implementation)
**Status**: Ready for Implementation Start

---

## Priority Breakdown

### P0 (CRITICAL) - Unblock All Tests
These must be completed first to allow other tests to run.

#### P0-1: Navigation Module
**File**: `/lib/keystatic/navigation.ts`
**Story Points**: 0.5 SP
**Time Estimate**: 2-4 hours
**Blocks**: 71 tests (41% of all tests)
**REQ Coverage**: REQ-412, REQ-414, REQ-415, REQ-416, integration tests

**What to Implement**:
```typescript
// 1. Define NavigationData interface
interface MenuItem {
  label: string;
  href: string;
  external: boolean;
  children?: MenuItem[];
}

interface NavigationData {
  menuItems: MenuItem[];
  primaryCTA: {
    label: string;
    href: string;
    external: boolean;
  };
}

// 2. Create defaultNavigation constant
const defaultNavigation: NavigationData = {
  menuItems: [
    {
      label: 'Summer Camp',
      href: '/summer-camp',
      external: false,
      children: [
        { label: 'Junior High', href: '/summer-camp/junior-high', external: false },
        { label: 'Senior High', href: '/summer-camp/senior-high', external: false }
      ]
    },
    // ... more items
  ],
  primaryCTA: {
    label: 'Register',
    href: 'https://ultracamp.com/register',
    external: true
  }
};

// 3. Implement getNavigation() function
export async function getNavigation(): Promise<NavigationData> {
  try {
    // Try to read from Keystatic
    const reader = createReader(process.env.KEYSTATIC_GITHUB_REPO || '');
    const data = await reader.singletons.siteNavigation.read();
    return data ?? defaultNavigation;
  } catch (error) {
    console.warn('Failed to read navigation from Keystatic', error);
    return defaultNavigation;
  }
}

export { NavigationData };
export { defaultNavigation };
```

**Test Entry Point**: `/lib/keystatic/navigation.spec.ts`
**Tests to Pass**: 21 (11 + 10)
**Success Metrics**:
- ✓ Module imports without errors
- ✓ getNavigation() is async function
- ✓ Returns NavigationData interface
- ✓ Falls back to defaultNavigation on error
- ✓ Handles missing Keystatic gracefully

**Acceptance Tests**:
```bash
npx vitest run lib/keystatic/navigation.spec.ts
# Expected: 21 tests passing
```

---

### P0-2: Markdoc Components
**File**: `/components/markdoc/MarkdocComponents.tsx`
**Story Points**: 1.5 SP
**Time Estimate**: 6-8 hours
**Blocks**: 50 tests (29% of all tests)
**REQ Coverage**: REQ-404 through REQ-411

**Component Checklist**:

1. **ImageComponent**
   - [ ] Takes props: src, alt, caption (optional)
   - [ ] Uses Next.js Image for optimization
   - [ ] Default size: 800x600
   - [ ] Caption renders below image (optional)
   - [ ] Works with /uploads/content/ directory

2. **CTAComponent**
   - [ ] Takes props: heading, text, buttonText, buttonLink
   - [ ] Renders centered card
   - [ ] Uses bg-secondary background color
   - [ ] Uses Next.js Link for internal navigation
   - [ ] Has hover state styling
   - [ ] Supports multiline text

3. **FeatureGridComponent**
   - [ ] Takes props: features array
   - [ ] Each feature: icon, title, description
   - [ ] Desktop: 3-column grid (md:grid-cols-3 or lg:grid-cols-3)
   - [ ] Mobile: 1-column layout
   - [ ] Icon accepts emoji and text
   - [ ] Responsive design

4. **PhotoGalleryComponent**
   - [ ] Takes props: images array
   - [ ] Each image: image, alt, caption (optional)
   - [ ] Image size: 400x400
   - [ ] Mobile: 2-column grid (grid-cols-2)
   - [ ] Desktop: 3-column grid (md:grid-cols-3 or lg:grid-cols-3)
   - [ ] Works with /uploads/gallery/ directory

5. **YouTubeComponent**
   - [ ] Takes props: videoId, title
   - [ ] Renders iframe with embed URL
   - [ ] Aspect ratio: 16:9 (responsive)
   - [ ] Has allowFullScreen attribute
   - [ ] URL: youtube.com/embed/{videoId}

6. **TestimonialComponent**
   - [ ] Takes props: quote, author, role, photo (optional)
   - [ ] Renders blockquote
   - [ ] Photo: 48x48 rounded circle (optional)
   - [ ] Left border accent
   - [ ] Supports multiline quote
   - [ ] Works with /uploads/testimonials/ directory

7. **AccordionComponent**
   - [ ] Takes props: items array
   - [ ] Each item: question, answer
   - [ ] Uses native HTML <details> element
   - [ ] Bottom border between items
   - [ ] Supports multiline answer

**Test Entry Point**: `/components/markdoc/MarkdocComponents.spec.tsx`
**Tests to Pass**: 50
**Success Metrics**:
- ✓ All 7 components export from file
- ✓ Components render without errors
- ✓ Proper Tailwind styling applied
- ✓ Next.js optimizations used (Image, Link)
- ✓ Responsive design verified
- ✓ Optional props handled gracefully

**Acceptance Tests**:
```bash
npx vitest run components/markdoc/MarkdocComponents.spec.tsx
# Expected: 50 tests passing
```

---

### P0-3: Page Generation Script
**File**: `/scripts/generate-sample-pages.ts`
**Story Points**: 1.5 SP
**Time Estimate**: 6-8 hours
**Blocks**: 21 tests (12% of all tests)
**REQ Coverage**: REQ-401, REQ-402, REQ-403

**Script Specification**:

```typescript
export async function generateSamplePages(): Promise<void> {
  // Create /content/pages/ directory if not exists

  // Generate 18 MDOC files:
  const pages = [
    // Homepage (homepage template)
    'index.mdoc',

    // Standard template pages
    'about.mdoc',
    'contact.mdoc',
    'give.mdoc',

    // Summer Camp (program template)
    'summer-camp.mdoc',
    'summer-camp-junior-high.mdoc',
    'summer-camp-senior-high.mdoc',

    // Retreats (program template)
    'retreats.mdoc',
    'retreats-youth-groups.mdoc',
    'retreats-adult-retreats.mdoc',

    // Work at Camp (staff template)
    'work-at-camp.mdoc',
    'work-at-camp-counselors.mdoc',
    'work-at-camp-kitchen-staff.mdoc',

    // Facilities (facility template)
    'facilities.mdoc',
    'facilities-chapel.mdoc',
    'facilities-dining-hall.mdoc',
    'facilities-cabins.mdoc',
    'facilities-rec-center.mdoc',
  ];

  // For each page:
  // 1. Create MDOC file with proper frontmatter
  // 2. Include template-specific fields
  // 3. Add realistic Bear Lake Camp content
  // 4. Reference existing images in /public/images/
  // 5. Validate YAML structure
}
```

**File Structure (Example)**:
```yaml
---
title: "Summer Camp 2024"
heroImage: "/images/camp-hero.jpg"
heroTagline: "Create Lifelong Memories at Bear Lake Camp"
templateFields:
  discriminant: "program"
  value:
    ageRange: "Grades 6-8"
    dates: "June 14-20, 2024"
    pricing: "$350"
    registrationLink: "https://ultracamp.com/register"
    galleryImages:
      - image: "/uploads/gallery/camp1.jpg"
        alt: "Campers swimming in the lake"
        caption: "Water activities at Bear Lake"
    ctaHeading: "Ready to Register?"
    ctaButtonText: "Sign Up Today"
    ctaButtonLink: "https://ultracamp.com/register"
seo:
  metaTitle: "Summer Camp for Grades 6-8 | Bear Lake Camp"
  metaDescription: "Join our Christ-centered summer camp experience"
---

## What to Expect

Experience the transformative power of faith-based summer camp...
```

**Content Guidelines**:
- Use Bear Lake Camp branding and messaging
- Include Christ-centered messaging where appropriate
- Reference real facilities and programs
- Keep tone engaging and welcoming
- Match existing design system

**Test Entry Point**: `/scripts/generate-sample-pages.spec.ts`
**Tests to Pass**: 21
**Success Metrics**:
- ✓ All 18 MDOC files created
- ✓ Valid YAML frontmatter in all files
- ✓ Template types correctly specified
- ✓ All image references valid
- ✓ Script is idempotent (safe to run multiple times)
- ✓ TypeScript compiles without errors
- ✓ All required fields present
- ✓ Realistic content included

**Acceptance Tests**:
```bash
npx vitest run scripts/generate-sample-pages.spec.ts
# Expected: 21 tests passing
```

---

## P1 (HIGH) - Integration & Documentation
These can run in parallel with P0, but depend on P0 completion.

### P1-1: Update Header Component
**File**: `/components/navigation/Header.tsx` (update existing)
**Story Points**: 0.5 SP
**Time Estimate**: 2-4 hours
**Blocks**: 7 tests
**REQ Coverage**: REQ-416

**Changes Needed**:
```typescript
// Add prop to Header component
interface HeaderProps {
  navigation: NavigationData;
}

export function Header({ navigation }: HeaderProps) {
  // 1. Render desktop menu from navigation.menuItems
  // 2. Render mobile menu with same items
  // 3. Render primary CTA button from navigation.primaryCTA
  // 4. Support dropdown menus for items with children
  // 5. Handle external flag (target="_blank" for external=true)
  // 6. Keep existing logo configuration separate
}
```

**Test Entry Point**: REQ-416 in `/tests/integration/keystatic-complete.spec.tsx`
**Tests to Pass**: 7
**Success Metrics**:
- ✓ Component accepts navigation prop
- ✓ MenuItems render correctly
- ✓ Dropdowns work for items with children
- ✓ External links open in new tab
- ✓ Active link highlighting works
- ✓ Mobile and desktop menus functional

---

### P1-2: Create Keystatic Editing Guide
**File**: `/docs/operations/KEYSTATIC-EDITING-GUIDE.md`
**Story Points**: 0.3 SP
**Time Estimate**: 2-3 hours
**REQ Coverage**: REQ-417

**Content Outline**:

```markdown
# Keystatic Editing Guide

## Accessing Keystatic
- Local development: http://localhost:3000/keystatic
- Production: https://yoursite.com/keystatic

## Managing Navigation
- How to add/remove menu items
- How to reorder navigation
- How to add dropdown menus
- How to set external links to open in new tab

## Creating Pages
### Using Standard Template
- What: About page, contact page
- Fields: title, hero image, hero tagline, body content, SEO

### Using Program Template
- What: Summer camp pages, retreat pages
- Fields: age range, dates, pricing, registration link, galleries, CTA

### Using Facility Template
- What: Chapel, dining hall, cabins, rec center
- Fields: capacity, amenities, gallery images

### Using Staff Template
- What: Work at camp pages
- Fields: employment overview, gallery, CTA button

## Rich Content Components

### Image Component
- Upload from /uploads/content/
- Set alt text (required)
- Add caption (optional)

### Call-to-Action Component
- Heading and descriptive text
- Button text and link
- Appears with secondary color background

### Feature Grid
- Up to 9 features in 3-column grid
- Each: emoji/icon, title, description

### Photo Gallery
- Multiple images in responsive grid
- 2 columns on mobile, 3 on desktop
- Upload from /uploads/gallery/

### YouTube Embed
- Paste video ID (e.g., dQw4w9WgXcQ)
- Add title
- Shows 16:9 responsive embed

### Testimonial
- Quote, author name, role/relationship
- Optional photo from /uploads/testimonials/
- Shows as blockquote with left border

### Accordion (FAQ)
- Question and answer pairs
- Expands/collapses
- Each answer can be multiline

## Real-World Workflows

### Workflow 1: Update Hero Image
1. Go to Pages
2. Find page to edit
3. Click "Change" on heroImage
4. Upload new image
5. Save changes

### Workflow 2: Add Program Page
1. Go to Pages
2. Click "Create"
3. Select "program" template
4. Fill in: title, age range, dates, pricing, registration link
5. Add gallery images
6. Write description
7. Publish

### Workflow 3: Edit Navigation Menu
1. Go to Settings
2. Select "Site Navigation"
3. Click "Edit" on menuItems
4. Add/remove/reorder items
5. Save changes
6. Changes appear on website immediately

## Troubleshooting
- Images not showing: Check upload directory
- Save not working: Check internet connection
- Fields missing: Refresh page and try again
```

**Test Entry Point**: REQ-417 in `/tests/integration/keystatic-complete.spec.tsx`
**Tests to Pass**: 8
**Success Metrics**:
- ✓ Documentation file exists
- ✓ Covers accessing Keystatic
- ✓ Documents all 4 template types
- ✓ Covers all 7 rich content components
- ✓ Includes 3+ real workflow examples
- ✓ Non-technical, editor-friendly language
- ✓ Minimal technical jargon

---

### P1-3: Update Layout Component
**File**: `/app/layout.tsx` (update existing)
**Story Points**: 0.3 SP
**Time Estimate**: 1-2 hours
**REQ Coverage**: REQ-415

**Changes Needed**:
```typescript
import { getNavigation } from '@/lib/keystatic/navigation';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigation = await getNavigation();

  return (
    <html lang="en">
      <body>
        <Header navigation={navigation} />
        {children}
      </body>
    </html>
  );
}
```

**Test Entry Point**: REQ-415 in `/tests/integration/keystatic-complete.spec.tsx`
**Tests to Pass**: 6
**Success Metrics**:
- ✓ Layout calls getNavigation()
- ✓ Navigation passed to Header
- ✓ Server-side rendering works
- ✓ Falls back to default on error
- ✓ TypeScript compiles
- ✓ No SSR hydration issues

---

## P2 (MEDIUM) - Refinement & Optimization
These can be done after core implementation passes all tests.

### P2-1: Page Templates
**Files**:
- `/components/templates/StandardTemplate.tsx`
- `/components/templates/ProgramTemplate.tsx`
- `/components/templates/FacilityTemplate.tsx`
- `/components/templates/StaffTemplate.tsx`

**Story Points**: 1.0 SP
**Time Estimate**: 4-6 hours
**REQ Coverage**: REQ-419

**Requirements**:
- [ ] Each template renders all its specific fields
- [ ] All content comes from props (not hardcoded)
- [ ] Template-specific components render properly
- [ ] Responsive design verified
- [ ] Styling consistent with site theme

---

## Parallel Work Plan

### Week 1: Foundation
- **Team 1**: P0-1 Navigation Module (0.5 SP)
- **Team 2**: P0-2 Markdoc Components (1.5 SP)
- **Team 3**: P0-3 Page Generation Script (1.5 SP)

**Expected Outcome**: 142 tests unblocked, starting to pass

### Week 2: Integration
- **Team 1**: P1-1 Header Component Update (0.5 SP)
- **Team 2**: P1-2 Keystatic Editing Guide (0.3 SP)
- **Team 3**: P1-3 Layout Integration (0.3 SP)
- **Team 4**: P2-1 Page Templates (1.0 SP)

**Expected Outcome**: All 172 tests passing, full integration complete

---

## Test-Driven Implementation Checklist

For each P0 item:

### Before Starting
- [ ] Read corresponding test file fully
- [ ] Understand all test assertions
- [ ] Note expected interfaces/types
- [ ] Identify dependencies

### During Implementation
- [ ] Run tests frequently: `npm test -- <file>.spec.ts`
- [ ] Watch tests progress from FAIL → PASS
- [ ] Ensure no new TypeScript errors: `npm run typecheck`
- [ ] Keep linting clean: `npm run lint`

### After Each Feature
- [ ] All tests for that feature pass
- [ ] No regressions in existing tests
- [ ] No console errors or warnings
- [ ] Code follows project style guide

### When Done
- [ ] All 172 tests passing
- [ ] `npm run typecheck` zero errors
- [ ] `npm run lint` zero errors
- [ ] Ready for code review

---

## Expected Test Progression

### Start of Week 1
```
Test Files  5 failed (4 module errors + 1 passing)
Tests       155 failing, 17 passing
```

### Mid Week 1 (After P0-1)
```
Test Files  3 failed (2 module errors)
Tests       50 failing, 122 passing
```

### End of Week 1 (After P0-1, P0-2, P0-3)
```
Test Files  1 passing
Tests       0 failing, 172 passing ✓
```

---

## Success Definition

### Implementation is Complete When:
1. ✓ All 172 tests passing
2. ✓ `npm run typecheck` passes (zero errors)
3. ✓ `npm run lint` passes (zero errors)
4. ✓ All 18 pages render without errors
5. ✓ Navigation working on all pages
6. ✓ Components display with proper styling
7. ✓ Responsive design verified
8. ✓ No console errors or warnings

### Deployment Gates:
```bash
# All must pass before deploy
npm run typecheck
npm run lint
npm test
```

---

## Summary

| Phase | Component | SP | Priority | Time | Status |
|-------|-----------|----|----|------|--------|
| P0 | Navigation Module | 0.5 | CRITICAL | 2-4h | Ready |
| P0 | Markdoc Components | 1.5 | CRITICAL | 6-8h | Ready |
| P0 | Page Generation | 1.5 | CRITICAL | 6-8h | Ready |
| P1 | Header Update | 0.5 | HIGH | 2-4h | Ready |
| P1 | Editing Guide | 0.3 | HIGH | 2-3h | Ready |
| P1 | Layout Integration | 0.3 | HIGH | 1-2h | Ready |
| P2 | Page Templates | 1.0 | MEDIUM | 4-6h | Ready |
| **Total** | | **6.6 SP** | | **23-35h** | **Ready** |

---

**Document**: Implementation Recommendations
**Created**: December 2, 2025
**Status**: Ready for Implementation Handoff
**Next Steps**: Begin P0-1, P0-2, P0-3 implementation
