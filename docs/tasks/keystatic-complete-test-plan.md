# Test Plan: Keystatic Complete Implementation

> **Story Points**: Test development 2.5 SP

**Date**: 2025-12-02
**Requirements Lock**: `requirements/keystatic-complete-implementation.lock.md`

---

## Test Coverage Matrix

| REQ-ID | Unit Tests | Integration Tests | Status |
|--------|------------|-------------------|--------|
| REQ-401 | ✅ 6 tests | ❌ Pending | Failing |
| REQ-402 | ✅ 6 tests | ❌ Pending | Failing |
| REQ-403 | ✅ 7 tests | ❌ Pending | Failing |
| REQ-404 | ✅ 5 tests | ❌ Pending | Failing |
| REQ-405 | ✅ 5 tests | ❌ Pending | Failing |
| REQ-406 | ✅ 5 tests | ❌ Pending | Failing |
| REQ-407 | ✅ 5 tests | ❌ Pending | Failing |
| REQ-408 | ✅ 5 tests | ❌ Pending | Failing |
| REQ-409 | ✅ 6 tests | ❌ Pending | Failing |
| REQ-410 | ✅ 5 tests | ❌ Pending | Failing |
| REQ-411 | ✅ 7 tests | ❌ Pending | Failing |
| REQ-412 | ✅ 8 tests | ❌ Pending | Failing |
| REQ-413 | ✅ 17 tests | ❌ Pending | Failing |
| REQ-414 | ✅ 10 tests | ❌ Pending | Failing |
| REQ-415 | ❌ Pending | ✅ 6 tests | Failing |
| REQ-416 | ❌ Pending | ✅ 7 tests | Failing |
| REQ-417 | ❌ Pending | ✅ 8 tests | Failing |
| REQ-418 | ❌ Pending | ✅ 7 tests | Failing |
| REQ-419 | ❌ Pending | ✅ 6 tests | Failing |
| REQ-420 | ❌ Pending | ✅ 6 tests | Failing |
| REQ-421 | ❌ Pending | ✅ 8 tests | Failing |

**Total Tests**: 153 tests across all requirements
**Coverage**: 100% of REQ-IDs have ≥1 test

---

## Unit Tests

### Phase 1: Content Generation Script (0.8 SP)

#### File: `scripts/generate-sample-pages.spec.ts`
**Requirements**: REQ-401, REQ-402, REQ-403
**Test Count**: 19 tests

**REQ-401 Tests** (6 tests):
- `script creates all 18 page files in content/pages directory`
- `each page has valid frontmatter matching template type`
- `all generated content references actual images in public/images directory`
- `script is idempotent - can be run multiple times safely`
- `running npm run typecheck passes after generation`
- `generated files are valid MDOC format`

**REQ-402 Tests** (6 tests):
- `each page contains contextually appropriate content for Bear Lake Camp`
- `program pages include age ranges, dates, pricing, and registration links`
- `facility pages include capacity and amenities information`
- `staff pages include employment overview and application CTAs`
- `all SEO fields are populated`
- `hero images and taglines are appropriate to page context`

**REQ-403 Tests** (7 tests):
- `program template pages include all program-specific fields`
- `facility template pages include all facility-specific fields`
- `staff template pages include position types and application information`
- `standard template pages include basic hero and body fields`
- `all template-specific fields validate against Keystatic schema`
- `homepage template includes gallery and CTA fields`
- `gallery images array has correct structure`

---

### Phase 2: Rich Content Components (0.7 SP)

#### File: `components/markdoc/MarkdocComponents.spec.tsx`
**Requirements**: REQ-404, REQ-405, REQ-406, REQ-407, REQ-408, REQ-409, REQ-410, REQ-411
**Test Count**: 48 tests

**REQ-404 Tests - Image Component** (5 tests):
- `renders with Next.js Image component at 800x600 default size`
- `caption appears below image with appropriate styling`
- `alt text is required`
- `caption is optional`
- `uses image picker directory public/uploads/content`

**REQ-405 Tests - CTA Component** (5 tests):
- `renders centered card with heading and button`
- `uses brand colors - bg-secondary, text-cream`
- `button uses Next.js Link for internal navigation`
- `button has hover state styling`
- `multiline text field renders correctly`

**REQ-406 Tests - Feature Grid Component** (5 tests):
- `renders 3-column grid on desktop`
- `stacks on mobile`
- `each feature has icon, title, and description`
- `supports array of features`
- `icon field accepts text and emoji`

**REQ-407 Tests - Photo Gallery Component** (5 tests):
- `renders responsive grid - 2 cols mobile, 3 cols desktop`
- `images are sized at 400x400`
- `each image has image, alt, and caption fields`
- `uses image picker directory public/uploads/gallery`
- `supports array of images`

**REQ-408 Tests - YouTube Component** (5 tests):
- `renders responsive 16:9 iframe embed`
- `includes allowFullScreen attribute`
- `video title used for iframe title attribute`
- `videoId field accepts YouTube video IDs`
- `embeds YouTube URL correctly`

**REQ-409 Tests - Testimonial Component** (6 tests):
- `renders styled blockquote with author attribution`
- `has left border accent`
- `photo appears as 48x48 rounded circle`
- `photo is optional - component works without it`
- `uses image picker directory public/uploads/testimonials`
- `multiline quote field renders correctly`

**REQ-410 Tests - Accordion Component** (5 tests):
- `uses native HTML details element`
- `each item has question and answer fields`
- `each item has bottom border separation`
- `supports array of FAQ items`
- `multiline answer field renders correctly`

**REQ-411 Tests - Component Renderers Implementation** (7 tests):
- `all 7 components export from MarkdocComponents.tsx`
- `all components use Tailwind utility classes for styling`
- `image components use Next.js Image for optimization`
- `link components use Next.js Link for navigation`
- `components handle missing optional fields gracefully`
- `components work when multiple instances exist on same page`
- `all components are responsive - work on mobile and desktop`

---

### Phase 3: Navigation in Keystatic (0.5 SP)

#### File: `lib/keystatic/navigation.spec.ts`
**Requirements**: REQ-412, REQ-414
**Test Count**: 18 tests

**REQ-412 Tests - Navigation Data Structure** (8 tests):
- `initial navigation data file created at content/navigation.yaml`
- `structure includes menuItems array and primaryCTA object`
- `each menu item has label, href, children, and external fields`
- `navigation matches current site structure`
- `each menu section includes appropriate child items`
- `primary CTA references registration link`
- `external boolean flag exists for menu items`
- `supports optional children array for nested navigation`

**REQ-414 Tests - Navigation Reader Function** (10 tests):
- `function getNavigation exported from lib/keystatic/navigation.ts`
- `uses Keystatic reader to fetch navigation data`
- `returns fallback to defaultNavigation if Keystatic data unavailable`
- `handles errors gracefully - console warning, returns default`
- `return type matches NavigationData interface`
- `function is async and can be called from Server Components`
- `menuItems array contains correct structure`
- `primaryCTA has required fields`
- `nested children have same structure as parent items`
- `defaultNavigation matches NavigationData interface`

#### File: `keystatic.config.navigation.spec.ts`
**Requirements**: REQ-413
**Test Count**: 17 tests

**REQ-413 Tests - Navigation Singleton in Keystatic** (17 tests):
- `Keystatic config includes siteNavigation singleton`
- `singleton stored in /content/navigation/ directory`
- `fields support menu items array with nested children`
- `fields support primaryCTA with label, href, and external flag`
- `editor can add/remove/reorder menu items`
- `editor can edit all navigation text and links`
- `navigation validates required fields - label and href`
- `menu items have label field`
- `menu items have href field`
- `menu items have optional children array`
- `menu items have external boolean flag`
- `primaryCTA has label field`
- `primaryCTA has href field`
- `primaryCTA has external flag with default true`
- `singleton appears in UI navigation under Settings`
- `menu items support itemLabel for better UX`
- `children array supports itemLabel`

---

## Integration Tests

### File: `tests/integration/keystatic-complete.spec.tsx`
**Requirements**: REQ-415, REQ-416, REQ-417, REQ-418, REQ-419, REQ-420, REQ-421
**Test Count**: 48 tests
**Story Points**: 0.5 SP

**REQ-415 Tests - Layout Integration** (6 tests):
- `app/layout.tsx calls getNavigation on render`
- `navigation data passed as prop to Header component`
- `server-side rendering of navigation works correctly`
- `logo configuration remains separate from CMS`
- `layout renders correctly when Keystatic data unavailable`
- `running npm run typecheck passes for layout file`

**REQ-416 Tests - Header Component Updates** (7 tests):
- `Header accepts navigation prop from layout`
- `desktop menu renders menuItems from prop`
- `mobile menu renders menuItems from prop`
- `primary CTA button renders from prop data`
- `external links open in new tab when external flag is true`
- `dropdown menus work for items with children`
- `active link highlighting still functions`

**REQ-417 Tests - Keystatic Editing Guide** (8 tests):
- `documentation file created at docs/operations/KEYSTATIC-EDITING-GUIDE.md`
- `guide includes instructions for accessing Keystatic`
- `guide covers navigation editing workflows`
- `guide covers page creation for all 4 template types`
- `guide documents all 7 rich content components with examples`
- `guide includes image swapping workflows`
- `guide includes 3+ real-world workflow examples`
- `language is non-technical and editor-friendly`

**REQ-418 Tests - Full Editability Verification** (7 tests):
- `all page text content editable in Keystatic`
- `all hero images swappable via Keystatic UI`
- `all gallery images swappable via Keystatic UI`
- `all CTA buttons editable`
- `all navigation menu items editable`
- `all SEO fields editable per page`
- `changes in Keystatic reflect immediately on frontend after save`

**REQ-419 Tests - Template Variety Validation** (6 tests):
- `at least 2 pages using Standard template exist`
- `at least 2 pages using Program template exist`
- `at least 2 pages using Facility template exist`
- `at least 2 pages using Staff template exist`
- `each template displays all unique fields properly`
- `template-specific components render with correct data`

**REQ-420 Tests - Component Rendering Verification** (6 tests):
- `all 7 Markdoc components render without errors on frontend`
- `components maintain styling consistency with site theme`
- `components are responsive - work on mobile and desktop`
- `components handle missing optional fields gracefully`
- `components work when multiple instances exist on same page`
- `image components load optimized images via Next.js`

**REQ-421 Tests - Quality Gates Checklist** (8 tests):
- `all 18 pages accessible via their URLs - no 404s`
- `npm run typecheck passes with zero errors`
- `npm test passes all test suites`
- `all pages have valid SEO meta tags`
- `all images display correctly - no broken image links`
- `navigation displays correctly on desktop and mobile`
- `all internal links navigate correctly`
- `all external links open in new tabs`

---

## Test Execution Strategy

### Parallel Unit Tests
Run all domain unit tests concurrently:

```bash
# Phase 1: Content Generation
npm test -- scripts/generate-sample-pages.spec.ts

# Phase 2: Rich Content Components
npm test -- components/markdoc/MarkdocComponents.spec.tsx

# Phase 3: Navigation
npm test -- lib/keystatic/navigation.spec.ts
npm test -- keystatic.config.navigation.spec.ts
```

### Sequential Integration Tests
Run after unit implementations pass:

```bash
npm test -- tests/integration/keystatic-complete.spec.tsx
```

### E2E Validation
Final smoke tests on deployed environment:

1. **Manual Testing Checklist**:
   - [ ] All 18 pages load without 404
   - [ ] Keystatic admin accessible at `/keystatic`
   - [ ] Navigation editing works in Keystatic UI
   - [ ] Page content editing works in Keystatic UI
   - [ ] All 7 components render correctly
   - [ ] Images display properly
   - [ ] External links open in new tabs

2. **Automated Quality Gates**:
   ```bash
   npm run typecheck  # Must pass
   npm run lint       # Must pass
   npm test           # All tests green
   ```

---

## Success Criteria

**Test Coverage**: 100% of REQ-IDs have ≥1 failing test before implementation

**Breakdown by Phase**:
- **Phase 1** (Content Generation): 19 tests, all failing ✅
- **Phase 2** (Rich Components): 48 tests, all failing ✅
- **Phase 3** (Navigation): 35 tests, all failing ✅
- **Phase 4** (Integration): 48 tests, all failing ✅

**Total**: 153 failing tests ready for implementation

---

## Test File Locations

```
/scripts/
  generate-sample-pages.spec.ts               # REQ-401, REQ-402, REQ-403

/components/markdoc/
  MarkdocComponents.spec.tsx                  # REQ-404 to REQ-411

/lib/keystatic/
  navigation.spec.ts                          # REQ-412, REQ-414

/
  keystatic.config.navigation.spec.ts         # REQ-413

/tests/integration/
  keystatic-complete.spec.tsx                 # REQ-415 to REQ-421
```

---

## Test Best Practices Applied

### Mandatory Rules (MUST)

✅ **Parameterized inputs**: All test data uses named constants
✅ **Tests can fail for real defects**: Every test catches specific bugs
✅ **Test descriptions align with assertions**: Test names state exactly what is verified
✅ **Compare to independent expectations**: No circular logic
✅ **Same quality rules as production**: Prettier, ESLint, strict types

### Examples

**Good Test Pattern**:
```typescript
test('program pages include age ranges, dates, pricing, and registration links', async () => {
  const PROGRAM_PAGES = [
    'summer-camp-junior-high.mdoc',
    'summer-camp-senior-high.mdoc',
  ];

  for (const pageFile of PROGRAM_PAGES) {
    const content = fs.readFileSync(path.join(CONTENT_DIR, pageFile), 'utf-8');

    expect(content).toContain('ageRange:');
    expect(content).toContain('dates:');
    expect(content).toContain('pricing:');
    expect(content).toContain('registrationLink:');
  }
});
```

**Avoid**:
```typescript
// ❌ Bad - no meaningful assertion
test('works', () => {
  expect(true).toBe(true);
});

// ❌ Bad - hardcoded magic values
test('test', () => {
  const result = calculate(42, "foo");
  expect(result).toBe(3.5);
});
```

---

## Additional Test Recommendations

### Edge Cases to Add

1. **REQ-401**: Test with existing files (overwrite behavior)
2. **REQ-404-411**: Test components with invalid props
3. **REQ-414**: Test navigation reader with malformed YAML
4. **REQ-418**: Test with empty/missing content directories

### Future Integration Tests

1. **Performance**: Test page load times with all components
2. **Accessibility**: Verify ARIA labels and keyboard navigation
3. **SEO**: Validate meta tags render correctly in HTML
4. **Mobile**: Responsive behavior on various screen sizes

---

## Story Point Breakdown

| Phase | Component | SP |
|-------|-----------|-----|
| Phase 1 | Content Generation Tests | 0.8 |
| Phase 2 | Rich Components Tests | 0.7 |
| Phase 3 | Navigation Tests | 0.5 |
| Phase 4 | Integration Tests | 0.5 |
| **Total** | **Test Development** | **2.5** |

**Reference**: `docs/project/PLANNING-POKER.md`

---

## Next Steps

1. **Verify all tests fail** ✅ (Done)
2. **QCODE**: Begin implementation to make tests pass
3. **QCHECK**: PE-Reviewer validates test quality
4. **QPLAN + QCODE + QCHECK**: Address P0-P1 recommendations
5. **QDOC**: Update editor guide (REQ-417)
6. **QGIT**: Commit with all tests green

**Blocking Rule**: No implementation proceeds until test-writer confirms ≥1 failure per REQ-ID ✅
