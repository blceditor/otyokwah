# Keystatic Complete Implementation - Test Suite Guide

**Date**: 2025-12-02
**Test Development**: 2.5 SP
**Total Tests**: 153 tests
**Status**: All tests failing (TDD Red phase) ✅

---

## Quick Start

### Run All Tests

```bash
npm test
```

### Run Tests by Phase

```bash
# Phase 1: Content Generation
npm test -- scripts/generate-sample-pages.spec.ts

# Phase 2: Rich Content Components
npm test -- components/markdoc/MarkdocComponents.spec.tsx

# Phase 3: Navigation
npm test -- lib/keystatic/navigation.spec.ts
npm test -- keystatic.config.navigation.spec.ts

# Phase 4: Integration
npm test -- tests/integration/keystatic-complete.spec.tsx
```

### Watch Mode (for development)

```bash
npm test -- --watch scripts/generate-sample-pages.spec.ts
```

---

## Test Files Overview

### 1. Content Generation Script Tests
**File**: `/scripts/generate-sample-pages.spec.ts`
**Requirements**: REQ-401, REQ-402, REQ-403
**Tests**: 19 tests

**What to implement**:
- `generateSamplePages()` function in `/scripts/generate-sample-pages.ts`
- Creates 18 MDOC page files in `/content/pages/`
- Each page has valid frontmatter for its template type
- All content references actual images in `/public/images/`

**Test execution**:
```bash
npm test -- scripts/generate-sample-pages.spec.ts
```

**Success criteria**:
- All 18 pages created
- Valid MDOC format with frontmatter
- Type-safe (npm run typecheck passes)
- Idempotent (can run multiple times)

---

### 2. Markdoc Components Tests
**File**: `/components/markdoc/MarkdocComponents.spec.tsx`
**Requirements**: REQ-404 to REQ-411
**Tests**: 48 tests

**What to implement**:
Create 7 components in `/components/markdoc/MarkdocComponents.tsx`:

1. **ImageComponent**
   - Props: `src`, `alt`, `caption?`
   - Uses Next.js Image (800x600 default)
   - Image picker: `public/uploads/content`

2. **CTAComponent**
   - Props: `heading`, `text`, `buttonText`, `buttonLink`
   - Brand colors: `bg-secondary`, `text-cream`
   - Next.js Link for internal navigation

3. **FeatureGridComponent**
   - Props: `features[]` (icon, title, description)
   - 3-column grid desktop, stack mobile
   - Supports emoji or text icons

4. **PhotoGalleryComponent**
   - Props: `images[]` (image, alt, caption)
   - 2 cols mobile, 3 cols desktop
   - Image picker: `public/uploads/gallery`
   - Images sized 400x400

5. **YouTubeComponent**
   - Props: `videoId`, `title`
   - 16:9 responsive iframe
   - allowFullScreen attribute

6. **TestimonialComponent**
   - Props: `quote`, `author`, `role`, `photo?`
   - Blockquote with left border accent
   - Photo: 48x48 rounded circle
   - Image picker: `public/uploads/testimonials`

7. **AccordionComponent**
   - Props: `items[]` (question, answer)
   - Native HTML `<details>` element
   - Bottom border separation

**Test execution**:
```bash
npm test -- components/markdoc/MarkdocComponents.spec.tsx
```

**Success criteria**:
- All 7 components export from MarkdocComponents.tsx
- Use Next.js Image and Link
- Tailwind CSS styling
- Responsive (mobile + desktop)
- Handle missing optional fields

---

### 3. Navigation Tests
**Files**:
- `/lib/keystatic/navigation.spec.ts` (18 tests)
- `/keystatic.config.navigation.spec.ts` (17 tests)

**Requirements**: REQ-412, REQ-413, REQ-414

**What to implement**:

1. **Navigation Data File** (`/content/navigation.yaml`)
   - Structure: `menuItems[]`, `primaryCTA`
   - Menu items: label, href, children?, external
   - Matches site structure (Summer Camp, Work at Camp, Retreats, Give, About)

2. **Navigation Reader** (`/lib/keystatic/navigation.ts`)
   - Export: `getNavigation()` function
   - Uses Keystatic reader
   - Returns NavigationData interface
   - Fallback to `defaultNavigation`
   - Error handling (console.warn)

3. **Keystatic Config** (`/keystatic.config.ts`)
   - Add `siteNavigation` singleton
   - Path: `content/navigation`
   - Fields: menuItems (array), primaryCTA (object)
   - UI navigation: Settings section

**Test execution**:
```bash
npm test -- lib/keystatic/navigation.spec.ts
npm test -- keystatic.config.navigation.spec.ts
```

**Success criteria**:
- navigation.yaml file created with site structure
- getNavigation() async function works
- Keystatic singleton configured
- TypeScript types match NavigationData interface

---

### 4. Integration Tests
**File**: `/tests/integration/keystatic-complete.spec.tsx`
**Requirements**: REQ-415 to REQ-421
**Tests**: 48 tests

**What to implement**:

1. **Layout Integration** (REQ-415)
   - `app/layout.tsx` calls `getNavigation()`
   - Pass navigation data to `<Header>` component
   - Server-side rendering works
   - Fallback when Keystatic unavailable

2. **Header Component Updates** (REQ-416)
   - Accept `navigation` prop
   - Render menuItems in desktop/mobile menus
   - Render primaryCTA button
   - External links: `target="_blank"`
   - Dropdown menus for items with children

3. **Keystatic Editing Guide** (REQ-417)
   - Create `/docs/operations/KEYSTATIC-EDITING-GUIDE.md`
   - Instructions for accessing Keystatic
   - Navigation editing workflows
   - Page creation for all 4 templates
   - All 7 component usage examples
   - Image swapping workflows
   - 3+ real-world examples
   - Non-technical, editor-friendly language

4. **Full Editability** (REQ-418)
   - Zero hardcoded content in components
   - All hero images editable via Keystatic
   - All gallery images editable
   - All CTA buttons editable
   - All navigation editable
   - All SEO fields editable

5. **Template Variety** (REQ-419)
   - ≥2 pages per template type (Standard, Program, Facility, Staff)
   - All template-specific fields render correctly

6. **Component Rendering** (REQ-420)
   - All 7 components render without errors
   - Consistent styling with theme
   - Responsive behavior
   - Handle missing optional fields
   - Multiple instances work

7. **Quality Gates** (REQ-421)
   - All 18 pages accessible (no 404s)
   - `npm run typecheck` passes
   - `npm test` passes
   - Valid SEO meta tags
   - Images display correctly
   - Navigation works on mobile/desktop
   - Internal links navigate correctly
   - External links open in new tabs

**Test execution**:
```bash
npm test -- tests/integration/keystatic-complete.spec.tsx
```

**Success criteria**:
- Layout and Header components integrated
- Keystatic Editing Guide complete
- All content editable via CMS
- Quality gates pass

---

## TDD Workflow

### Red Phase (Current) ✅
All tests failing because implementations don't exist yet.

```bash
npm test

# Expected output:
# FAIL  scripts/generate-sample-pages.spec.ts
# FAIL  components/markdoc/MarkdocComponents.spec.tsx
# FAIL  lib/keystatic/navigation.spec.ts
# FAIL  keystatic.config.navigation.spec.ts
# FAIL  tests/integration/keystatic-complete.spec.tsx
#
# Test Suites: 5 failed, 5 total
# Tests:       153 failed, 153 total
```

### Green Phase (Implementation)
Implement minimal code to make tests pass.

**Order of implementation**:
1. Phase 1: Content Generation Script (19 tests)
2. Phase 2: Markdoc Components (48 tests)
3. Phase 3: Navigation (35 tests)
4. Phase 4: Integration (48 tests)

**For each phase**:
```bash
# 1. Run tests (should fail)
npm test -- <test-file>

# 2. Implement minimal code
# 3. Run tests again (should pass)
npm test -- <test-file>

# 4. Continue until all tests green
```

### Refactor Phase
Once all tests pass, refactor code while keeping tests green.

```bash
# Continuous test watching
npm test -- --watch <test-file>

# Make changes
# Tests auto-run and should stay green
```

---

## Test Organization

### By Requirement Phase

| Phase | Requirements | Tests | Files |
|-------|--------------|-------|-------|
| Phase 1 | REQ-401 to REQ-403 | 19 | 1 |
| Phase 2 | REQ-404 to REQ-411 | 48 | 1 |
| Phase 3 | REQ-412 to REQ-414 | 35 | 2 |
| Phase 4 | REQ-415 to REQ-421 | 48 | 1 |

### By Test Type

| Type | Tests | Percentage |
|------|-------|------------|
| Unit | 105 | 68.6% |
| Integration | 48 | 31.4% |

---

## Test Patterns Used

### Parameterized Inputs
```typescript
const EXPECTED_PAGES = [
  'index.mdoc',
  'about.mdoc',
  'summer-camp.mdoc',
  // ...
];

for (const pageFile of EXPECTED_PAGES) {
  const filePath = path.join(CONTENT_DIR, pageFile);
  expect(fs.existsSync(filePath)).toBe(true);
}
```

### Component Testing
```typescript
test('renders with correct props', () => {
  const { ImageComponent } = require('./MarkdocComponents');

  const { container } = render(
    <ImageComponent
      src="/uploads/content/test.jpg"
      alt="Test image"
      caption="Test caption"
    />
  );

  const img = container.querySelector('img');
  expect(img).toBeInTheDocument();
  expect(img).toHaveAttribute('alt', 'Test image');
});
```

### Error Handling
```typescript
test('handles errors gracefully - console warning, returns default', async () => {
  const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

  const { getNavigation } = await import('./navigation');

  // Mock error
  vi.mock('@keystatic/core/reader', () => ({
    createReader: () => ({
      singletons: {
        siteNavigation: {
          read: () => { throw new Error('Failed to read'); },
        },
      },
    }),
  }));

  const navigationData = await getNavigation();

  expect(consoleWarnSpy).toHaveBeenCalled();
  expect(navigationData).toBeDefined();

  consoleWarnSpy.mockRestore();
});
```

---

## Common Issues & Solutions

### Issue: Tests fail with "Cannot find module"
**Solution**: Module doesn't exist yet. Create the file and export the required functions/components.

```typescript
// scripts/generate-sample-pages.ts
export async function generateSamplePages() {
  // Implementation here
}
```

### Issue: Tests fail with "Property does not exist"
**Solution**: Add the missing property to your Keystatic config.

```typescript
// keystatic.config.ts
export default config({
  singletons: {
    siteNavigation: singleton({
      // Add schema here
    }),
  },
});
```

### Issue: Component tests fail with rendering errors
**Solution**: Ensure component is properly exported and uses correct prop types.

```typescript
// components/markdoc/MarkdocComponents.tsx
export function ImageComponent({ src, alt, caption }: {
  src: string;
  alt: string;
  caption?: string;
}) {
  // Implementation
}
```

---

## Quality Gates

Before considering a phase complete, verify:

### 1. Tests Pass
```bash
npm test -- <test-file>
# All tests green ✅
```

### 2. Type Check
```bash
npm run typecheck
# No errors ✅
```

### 3. Lint Check
```bash
npm run lint
# No errors ✅
```

### 4. Format Check
```bash
npx prettier --check <files>
# All formatted ✅
```

---

## Additional Resources

- **Requirements Lock**: `/requirements/keystatic-complete-implementation.lock.md`
- **Test Plan**: `/docs/tasks/keystatic-complete-test-plan.md`
- **Test Summary**: `/docs/tasks/keystatic-complete-test-summary.md`
- **Planning Poker Guide**: `/docs/project/PLANNING-POKER.md`
- **TDD Best Practices**: `/.claude/agents/test-writer.md`

---

## Next Steps for Implementation Team

1. **Start with Phase 1** (Content Generation)
   ```bash
   npm test -- --watch scripts/generate-sample-pages.spec.ts
   ```

   Create `/scripts/generate-sample-pages.ts` and implement `generateSamplePages()`

2. **Move to Phase 2** (Components)
   ```bash
   npm test -- --watch components/markdoc/MarkdocComponents.spec.tsx
   ```

   Create `/components/markdoc/MarkdocComponents.tsx` with all 7 components

3. **Implement Phase 3** (Navigation)
   ```bash
   npm test -- --watch lib/keystatic/navigation.spec.ts
   npm test -- --watch keystatic.config.navigation.spec.ts
   ```

   Create navigation.yaml, navigation.ts, update keystatic.config.ts

4. **Complete Phase 4** (Integration)
   ```bash
   npm test -- --watch tests/integration/keystatic-complete.spec.tsx
   ```

   Update layout.tsx, Header component, create editing guide

5. **Verify All Tests Green**
   ```bash
   npm test
   # 153 tests passed ✅
   ```

6. **Run Quality Gates**
   ```bash
   npm run typecheck && npm run lint && npm test
   # All pass ✅
   ```

7. **Ready for QCHECK** (PE-Reviewer validation)

---

## Success Metrics

- [x] 153 tests created
- [x] 100% REQ-ID coverage (21/21)
- [x] All tests currently failing (TDD Red phase)
- [ ] All tests passing after implementation (TDD Green phase)
- [ ] Quality gates passing (typecheck, lint, test)
- [ ] Ready for code review (QCHECK)

**Current Status**: ✅ Test-Writer phase complete, ready for QCODE (implementation)
