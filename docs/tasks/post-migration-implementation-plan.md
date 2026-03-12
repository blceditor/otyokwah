# Post-Migration Implementation Plan
**Phase 2-3: Homepage, Templates, Images, and Keystatic UI Fixes**

**Date**: 2025-12-03
**Status**: Planning Complete
**Story Points**: 6.3 SP
**Lock File**: `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/requirements/post-migration-fixes.lock.md`

---

## Executive Summary

This plan addresses the critical post-migration fixes needed after the WordPress-to-Markdoc migration. The system currently has 19 pages successfully migrated to `.mdoc` format, but the homepage still uses hardcoded components, templates lack hero images, and Keystatic has UI/UX issues preventing efficient content management.

**Key Decisions**:
1. **Homepage Strategy**: Modify `app/page.tsx` to read `index.mdoc` directly using Keystatic reader (no redirect)
2. **Component Reuse**: Create `HomepageTemplate.tsx` that reuses existing `Gallery` component patterns
3. **Image Strategy**: Add hero images to all templates with graceful fallback to gradients
4. **Keystatic Investigation**: Navigation singleton already configured; issue is likely missing data file initialization
5. **Scroll Fix**: Investigate z-index conflicts between PageEditingToolbar and Keystatic UI

---

## Architecture Decisions

### Decision 1: Homepage Routing Pattern

**Question**: Should `app/page.tsx` redirect to `/index` or render `index.mdoc` directly?

**Answer**: Render `index.mdoc` directly in `app/page.tsx`.

**Rationale**:
- SEO: Root URL `/` should serve content directly without redirect
- Performance: Eliminates extra HTTP round-trip
- User Experience: No visible redirect flash
- Consistency: Matches Next.js patterns for root route handling

**Implementation**:
```typescript
// app/page.tsx
import { createReader } from '@keystatic/core/reader';
import keystaticConfig from '../keystatic.config';
import { HomepageTemplate } from '@/components/templates/HomepageTemplate';

const reader = createReader('', keystaticConfig);

export default async function Home() {
  const page = await reader.collections.pages.read('index');

  if (!page || page.templateFields.discriminant !== 'homepage') {
    // Fallback to hardcoded components if needed
    return <div>Homepage not found</div>;
  }

  // Extract body content from .mdoc file
  const filePath = path.join(process.cwd(), 'content', 'pages', 'index.mdoc');
  const fileContent = await fs.readFile(filePath, 'utf-8');
  const contentMatch = fileContent.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);
  const bodyContent = contentMatch ? contentMatch[1].trim() : '';

  return (
    <HomepageTemplate
      title={page.title}
      heroImage={page.heroImage}
      heroTagline={page.heroTagline}
      bodyContent={bodyContent}
      templateFields={page.templateFields.value}
    />
  );
}
```

**Risks**:
- If `index.mdoc` is deleted, homepage breaks (mitigated by fallback check)
- Content editors might not realize homepage uses this file (mitigated by Keystatic UI showing "Home" page)

---

### Decision 2: Component Hierarchy for HomepageTemplate

**Question**: Should HomepageTemplate reuse existing `components/homepage/*` or build new components?

**Answer**: Create new `HomepageTemplate.tsx` that follows template patterns but reuses layout/styling concepts.

**Rationale**:
- **Consistency**: Matches `ProgramTemplate`, `FacilityTemplate`, `StaffTemplate` patterns
- **CMS-Driven**: Existing homepage components are hardcoded; new template must be data-driven
- **Maintainability**: Separates hardcoded homepage (if ever needed) from CMS-driven homepage
- **Gallery Reuse**: Can extract gallery grid layout into shared component if needed

**Component Structure**:
```
components/
  templates/
    HomepageTemplate.tsx        # New - CMS-driven homepage
    ProgramTemplate.tsx         # Existing - add hero image
    FacilityTemplate.tsx        # Existing - add hero image
    StaffTemplate.tsx           # Existing - add hero image
  homepage/                     # Existing - keep for future hardcoded needs
    Hero.tsx                    # Hardcoded video/config
    Gallery.tsx                 # Hardcoded image array
    ...
```

**Shared Styling**:
- Hero section: Consistent with templates (min-h-[400px], bg-cover, overlay)
- Gallery grid: `grid grid-cols-2 md:grid-cols-3 gap-4`
- CTA section: Same button styles as templates (`bg-secondary hover:bg-secondary-light`)

---

### Decision 3: Image Rendering Strategy

**Hero Images**:
- Use CSS `background-image` for hero sections (consistent with standard template in `[slug]/page.tsx`)
- Fallback to gradient if `heroImage` is missing
- Overlay: `bg-black/40` for text contrast
- Responsive: `bg-cover bg-center`

**Gallery Images**:
- Use Next.js `Image` component for optimization
- Grid: `grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4`
- Aspect ratio: `aspect-square` for consistency
- Loading: First 3 eager, rest lazy
- Sizes: `(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw`

**Image Path Pattern**:
```typescript
// Keystatic config stores paths relative to public/
// e.g., "/uploads/gallery/image.jpg" → served as /uploads/gallery/image.jpg

// Hero image from frontmatter
style={{ backgroundImage: `url(${page.heroImage})` }}

// Gallery images from templateFields
<Image src={image.image} alt={image.alt} fill />
```

**XSS Security**:
- All image paths from Keystatic are string fields (not user-uploaded at runtime)
- No `dangerouslySetInnerHTML` used
- Alt text sanitized by React (automatic escaping)

---

### Decision 4: Keystatic Navigation Investigation

**Current State**:
- Navigation singleton configured in `keystatic.config.ts` (lines 44-89)
- File exists: `content/navigation.yaml`
- UI config includes `Settings: ['siteNavigation']` (line 40)
- `initializeNavigation()` function exists in `lib/keystatic/navigation.ts`

**Hypothesis**: Navigation singleton should already be visible in Keystatic UI under "Settings" group.

**Investigation Steps**:
1. Check if `content/navigation.yaml` is being read by Keystatic
2. Verify singleton path matches: `path: 'content/navigation'` (no file extension)
3. Test if navigation appears in local dev environment (`npm run dev`, visit `/keystatic`)
4. Check browser console for Keystatic errors
5. Verify GitHub storage mode isn't blocking singleton access in production

**Likely Issues**:
- **Path Mismatch**: Singleton expects `content/navigation` but file is `content/navigation.yaml` (Keystatic may need directory-based singleton)
- **GitHub Mode**: Production mode might require write permissions not granted
- **UI Grouping**: "Settings" group might be collapsed or hidden

**Fix Strategy**:
```typescript
// Option A: Change singleton to use directory-based storage
siteNavigation: singleton({
  label: 'Site Navigation',
  path: 'content/navigation/index', // directory-based
  // ...
})

// Option B: Verify file-based singleton works
// Keystatic should handle .yaml automatically
```

---

### Decision 5: Scroll Fix Strategy

**Current State**:
- Keystatic layout: `app/keystatic/layout.tsx` uses flexbox with `overflow-auto`
- PageEditingToolbar: Fixed position `bottom-4 right-4 z-50`
- Header: Sticky `top-0 z-10`

**Hypothesis**: Keystatic's internal UI elements may have higher z-index blocking scroll or overflow issues.

**Investigation Steps**:
1. Inspect Keystatic's internal modals/dialogs (they may use `z-50` or higher)
2. Check if `overflow-auto` on content div actually scrolls
3. Test if removing PageEditingToolbar fixes scroll (isolate issue)
4. Check for `height: 100vh` or fixed heights preventing scroll

**Known Issue Pattern**:
```css
/* Common problem: */
.content-area {
  flex: 1;
  overflow: auto; /* This looks right but... */
  height: 100vh; /* This breaks it! Should be removed */
}
```

**Fix Strategy**:
```typescript
// Ensure proper flexbox scroll pattern
<div className="flex flex-col h-screen">
  <div className="sticky top-0 z-10 flex-shrink-0">Header</div>
  <div className="flex-1 overflow-auto"> {/* Parent must have h-screen */}
    <KeystaticApp /> {/* Child can grow naturally */}
  </div>
</div>
```

**Z-Index Hierarchy**:
- Keystatic modals/dialogs: `z-[100]` (Keystatic internal)
- PageEditingToolbar: `z-50` (below modals, above content)
- Header: `z-10` (below toolbar, above content)
- Content: `z-0` (default)

**Action**: Adjust PageEditingToolbar to `z-40` if conflicts detected.

---

## Parallel Track Breakdown

### Track A: Homepage Integration (2.0 SP)
**Owner**: sde-iii
**Depends On**: None
**Can Start**: Immediately

**Tasks**:
1. Create `HomepageTemplate.tsx` component (0.8 SP)
   - Hero section with image/tagline
   - Body content via MarkdownRenderer
   - Gallery grid (CMS-driven, not hardcoded)
   - CTA section
2. Update `app/page.tsx` to use `index.mdoc` (0.5 SP)
   - Import Keystatic reader
   - Read `index` page
   - Extract body content from file
   - Render HomepageTemplate
3. Create `HomepageTemplate.spec.tsx` (0.7 SP)
   - Test hero rendering
   - Test gallery grid
   - Test CTA section
   - Test missing fields fallback

**Acceptance Criteria**:
- REQ-PM-001: Homepage renders from `index.mdoc`
- REQ-PM-002: HomepageTemplate component created
- Changes in Keystatic reflect immediately on `/`

---

### Track B: Template Enhancements (1.5 SP)
**Owner**: sde-iii
**Depends On**: None
**Can Start**: Immediately (parallel with Track A)

**Tasks**:
1. Add hero image to `ProgramTemplate.tsx` (0.3 SP)
   - Accept `heroImage` and `heroTagline` props
   - Replace gradient with `background-image`
   - Maintain fallback gradient
2. Add gallery rendering to `ProgramTemplate.tsx` (0.5 SP)
   - Accept `galleryImages` array in templateFields
   - Render after body content, before CTA
   - Use Next.js Image component
3. Add hero image to `FacilityTemplate.tsx` (0.2 SP)
4. Add hero image to `StaffTemplate.tsx` (0.2 SP)
5. Update `app/[slug]/page.tsx` routing (0.3 SP)
   - Pass `heroImage` and `heroTagline` to all templates
   - Handle `index` slug to avoid conflict with `/`

**Acceptance Criteria**:
- REQ-PM-003: All templates display hero images
- REQ-PM-004: Program template displays gallery
- Hero images responsive and accessible
- Fallback gradients if image missing

---

### Track C: Image Path Migration (0.8 SP)
**Owner**: sde-iii
**Depends On**: None
**Can Start**: Immediately (parallel)

**Tasks**:
1. Create `scripts/migrate-image-paths.ts` (0.5 SP)
   - Read all `.mdoc` files
   - Find WordPress URLs (`https://www.bearlakecamp.com/wp-content/uploads/...`)
   - Extract filename
   - Search `public/images/**` for matching file
   - Replace URL with local path (`/images/...`)
   - Write updated `.mdoc` file
2. Run script and verify (0.3 SP)
   - Test on one file first
   - Run on all 19 pages
   - Verify images load

**Script Pattern**:
```typescript
// scripts/migrate-image-paths.ts
import fs from 'fs';
import path from 'path';
import glob from 'glob';

const WP_URL_PATTERN = /https:\/\/www\.bearlakecamp\.com\/wp-content\/uploads\/[\w\/-]+\.(jpg|jpeg|png|webp)/gi;

function findLocalImage(filename: string): string | null {
  const images = glob.sync(`public/images/**/${filename}`);
  if (images.length > 0) {
    return images[0].replace('public', ''); // /images/...
  }
  return null;
}

// For each .mdoc file:
// - Read content
// - Find WordPress URLs
// - Replace with local paths
// - Write back
```

**Acceptance Criteria**:
- REQ-PM-007: All WordPress URLs replaced with local paths
- Script idempotent (can run multiple times safely)
- No broken image links

---

### Track D: Keystatic UI Fixes (1.0 SP)
**Owner**: sde-iii
**Depends On**: None
**Can Start**: Immediately (investigation first)

**Tasks**:
1. Investigate navigation singleton visibility (0.3 SP)
   - Check local dev environment
   - Verify singleton path/config
   - Test if directory-based path needed
   - Check GitHub mode permissions
2. Fix navigation singleton if needed (0.2 SP)
   - Update config or create missing file
   - Test CRUD operations
3. Investigate scroll issue (0.3 SP)
   - Test Keystatic editor with long forms
   - Check z-index conflicts
   - Identify overflow/height issues
4. Fix scroll issue (0.2 SP)
   - Adjust PageEditingToolbar z-index if needed
   - Fix overflow/height constraints
   - Verify can reach bottom of forms

**Acceptance Criteria**:
- REQ-PM-005: Navigation singleton accessible in Keystatic
- REQ-PM-006: Can scroll to bottom of edit forms
- Toolbar doesn't block content
- Works on desktop and tablet

---

## Risk Assessment

### High Risk: Homepage Routing Change

**Risk**: Changing `app/page.tsx` could break existing homepage functionality.

**Impact**: Production homepage down (P0).

**Mitigation**:
1. TDD approach: Write failing tests first
2. Keep existing homepage components as fallback
3. Deploy to staging first (`prelaunch.bearlakecamp.com`)
4. Verify all sections render correctly
5. Check Google Analytics to ensure no 404s

**Rollback Plan**:
```typescript
// app/page.tsx fallback
if (!page || page.templateFields.discriminant !== 'homepage') {
  // Revert to hardcoded components
  return (
    <main>
      <Hero />
      <Mission />
      <Programs />
      // ...
    </main>
  );
}
```

---

### Medium Risk: Image Path Migration

**Risk**: Script could corrupt `.mdoc` files or break frontmatter parsing.

**Impact**: Pages fail to load, content lost (P0).

**Mitigation**:
1. Git commit before running script
2. Test on single file first (`index.mdoc`)
3. Verify frontmatter YAML remains valid
4. Check images load in browser
5. Keep script idempotent (can re-run safely)

**Validation**:
```bash
# After script runs:
npm run typecheck  # Ensure no TypeScript errors
npm run dev        # Start dev server
# Visit each page and verify images load
```

---

### Low Risk: Template Hero Image Changes

**Risk**: Adding hero images could break existing template tests.

**Impact**: CI fails, deployment blocked.

**Mitigation**:
1. Update tests first (TDD)
2. Make `heroImage` prop optional with fallback
3. Keep gradient fallback for backward compatibility
4. Test with and without hero images

---

### Low Risk: Keystatic UI Fixes

**Risk**: Changing layout/z-index could break Keystatic's internal UI.

**Impact**: CMS unusable (P0).

**Mitigation**:
1. Test locally first
2. Make minimal changes
3. Verify all Keystatic features still work (create/edit/delete)
4. Test modals/dialogs still appear correctly

---

## Testing Strategy

### Unit Tests (QCODET)

**HomepageTemplate.spec.tsx** (8 tests):
```typescript
describe('HomepageTemplate', () => {
  test('REQ-PM-002: renders hero with image and tagline', () => {});
  test('REQ-PM-002: renders body content via MarkdownRenderer', () => {});
  test('REQ-PM-002: renders gallery grid with images', () => {});
  test('REQ-PM-002: renders CTA section with heading and button', () => {});
  test('REQ-PM-002: handles missing heroImage gracefully', () => {});
  test('REQ-PM-002: handles empty galleryImages array', () => {});
  test('REQ-PM-002: handles missing CTA fields', () => {});
  test('REQ-PM-002: uses Next.js Image for gallery optimization', () => {});
});
```

**ProgramTemplate.spec.tsx updates** (6 new tests):
```typescript
describe('ProgramTemplate - Hero Images', () => {
  test('REQ-PM-003: displays hero image as background', () => {});
  test('REQ-PM-003: displays hero tagline overlay', () => {});
  test('REQ-PM-003: falls back to gradient if no image', () => {});
});

describe('ProgramTemplate - Gallery', () => {
  test('REQ-PM-004: renders gallery grid after body content', () => {});
  test('REQ-PM-004: handles empty gallery array', () => {});
  test('REQ-PM-004: uses Next.js Image for gallery images', () => {});
});
```

**FacilityTemplate.spec.tsx updates** (4 new tests):
```typescript
describe('FacilityTemplate - Hero Images', () => {
  test('REQ-PM-003: displays hero image as background', () => {});
  test('REQ-PM-003: displays hero tagline overlay', () => {});
  test('REQ-PM-003: falls back to gradient if no image', () => {});
  test('REQ-PM-003: maintains responsive hero height', () => {});
});
```

**StaffTemplate.spec.tsx updates** (4 new tests):
```typescript
describe('StaffTemplate - Hero Images', () => {
  test('REQ-PM-003: displays hero image as background', () => {});
  test('REQ-PM-003: displays hero tagline overlay', () => {});
  test('REQ-PM-003: falls back to gradient if no image', () => {});
  test('REQ-PM-003: maintains responsive hero height', () => {});
});
```

---

### Integration Tests

**app/page.integration.spec.tsx** (6 tests):
```typescript
describe('Homepage Integration', () => {
  test('REQ-PM-001: / route renders content from index.mdoc', () => {});
  test('REQ-PM-001: homepage uses HomepageTemplate component', () => {});
  test('REQ-PM-001: changes in Keystatic reflect on homepage', () => {});
  test('REQ-PM-001: gallery images render in grid', () => {});
  test('REQ-PM-001: CTA section renders from CMS', () => {});
  test('REQ-PM-001: SEO metadata from index.mdoc', () => {});
});
```

**app/[slug]/page.integration.spec.tsx** (4 tests):
```typescript
describe('[slug] Routing with Hero Images', () => {
  test('REQ-PM-003: program pages display hero images', () => {});
  test('REQ-PM-003: facility pages display hero images', () => {});
  test('REQ-PM-003: staff pages display hero images', () => {});
  test('REQ-PM-001: index slug does not conflict with /', () => {});
});
```

**scripts/migrate-image-paths.spec.ts** (5 tests):
```typescript
describe('Image Path Migration Script', () => {
  test('REQ-PM-007: converts WordPress URLs to local paths', () => {});
  test('REQ-PM-007: finds images in public/images subdirectories', () => {});
  test('REQ-PM-007: preserves frontmatter YAML structure', () => {});
  test('REQ-PM-007: script is idempotent', () => {});
  test('REQ-PM-007: handles missing local images gracefully', () => {});
});
```

---

### Manual QA Checklist

**Homepage** (REQ-PM-001, REQ-PM-002):
- [ ] Visit `/` and verify content from `index.mdoc`
- [ ] Hero image displays correctly
- [ ] Hero tagline overlays on image
- [ ] Gallery images display in grid
- [ ] CTA section renders with button
- [ ] Click CTA button navigates to correct URL
- [ ] Edit homepage in Keystatic, verify changes reflect immediately

**Templates** (REQ-PM-003, REQ-PM-004):
- [ ] Visit program page (e.g., `/summer-camp-junior-high`)
- [ ] Hero image displays correctly
- [ ] Gallery displays after body content
- [ ] Visit facility page (e.g., `/facilities-chapel`)
- [ ] Hero image displays correctly
- [ ] Visit staff page (e.g., `/work-at-camp`)
- [ ] Hero image displays correctly

**Keystatic UI** (REQ-PM-005, REQ-PM-006):
- [ ] Visit `/keystatic`
- [ ] "Settings" group visible in sidebar
- [ ] "Site Navigation" link visible under Settings
- [ ] Click navigation, editor opens
- [ ] Edit a page with long content
- [ ] Scroll to bottom of form
- [ ] Verify Save button is accessible
- [ ] Verify PageEditingToolbar doesn't block content

**Images** (REQ-PM-007):
- [ ] All hero images load (no 404s)
- [ ] All gallery images load (no 404s)
- [ ] No WordPress URLs in page source
- [ ] Images are responsive

---

## Story Point Breakdown

| Phase | Task | SP | Notes |
|-------|------|-----|-------|
| **Phase 1: Test Writing (QCODET)** | | **1.5** | |
| 1.1 | HomepageTemplate.spec.tsx | 0.5 | 8 tests |
| 1.2 | ProgramTemplate.spec.tsx updates | 0.3 | 6 new tests |
| 1.3 | FacilityTemplate.spec.tsx updates | 0.2 | 4 new tests |
| 1.4 | StaffTemplate.spec.tsx updates | 0.2 | 4 new tests |
| 1.5 | Integration tests (page.tsx, [slug]) | 0.3 | 10 tests |
| **Phase 2: Test Review (QCHECKT)** | | **0.3** | |
| 2.1 | Review test quality and coverage | 0.2 | PE-Reviewer |
| 2.2 | Fix P0-P1 test issues | 0.1 | test-writer |
| **Phase 3: Implementation (QCODE)** | | **2.5** | |
| 3.1 | HomepageTemplate component | 0.8 | Track A |
| 3.2 | Update app/page.tsx | 0.5 | Track A |
| 3.3 | ProgramTemplate hero + gallery | 0.8 | Track B |
| 3.4 | FacilityTemplate hero | 0.2 | Track B |
| 3.5 | StaffTemplate hero | 0.2 | Track B |
| 3.6 | Update [slug]/page.tsx routing | 0.3 | Track B |
| 3.7 | Image path migration script | 0.5 | Track C |
| 3.8 | Run migration and verify | 0.3 | Track C |
| 3.9 | Keystatic navigation investigation | 0.3 | Track D |
| 3.10 | Fix navigation singleton | 0.2 | Track D |
| 3.11 | Keystatic scroll investigation | 0.3 | Track D |
| 3.12 | Fix scroll issue | 0.2 | Track D |
| **Phase 4: Code Review (QCHECK, QCHECKF)** | | **0.5** | |
| 4.1 | Review HomepageTemplate | 0.1 | PE-Reviewer |
| 4.2 | Review template updates | 0.1 | PE-Reviewer |
| 4.3 | Review routing changes | 0.1 | PE-Reviewer |
| 4.4 | Review image migration script | 0.1 | code-quality-auditor |
| 4.5 | Review Keystatic UI fixes | 0.1 | PE-Reviewer |
| **Phase 5: P0-P1 Fix Loop** | | **1.0** | |
| 5.1 | Plan fixes for P0-P1 issues | 0.3 | planner |
| 5.2 | Implement fixes | 0.5 | sde-iii |
| 5.3 | Re-review fixes | 0.2 | PE-Reviewer |
| **Phase 6: E2E Verification** | | **0.5** | |
| 6.1 | Run quality gates | 0.1 | `npm run typecheck && npm test` |
| 6.2 | Manual QA checklist | 0.3 | All features |
| 6.3 | Deploy to staging and verify | 0.1 | prelaunch.bearlakecamp.com |
| **Total** | | **6.3 SP** | |

---

## Dependencies

**Existing Infrastructure**:
- Keystatic reader (`@keystatic/core/reader`)
- Template components (`ProgramTemplate`, `FacilityTemplate`, `StaffTemplate`)
- MarkdownRenderer component
- Next.js Image component
- Keystatic config with homepage template (already configured)
- `content/pages/index.mdoc` (already exists)
- Local images in `public/images/` (already exist)
- Navigation singleton config (already exists)

**External Dependencies**:
- None (all work is internal)

**Blockers**:
- None (all tracks can run in parallel)

---

## QShortcuts Sequence

After planning approval, execute in order:

1. **QCODET** → test-writer creates all failing tests
2. **QCHECKT** → PE-Reviewer + test-writer review tests
3. **QPLAN + QCODET + QCHECKT** → Fix P0-P1 test issues
4. **QCODE** → sde-iii implements all tracks (A, B, C, D in parallel)
5. **QCHECK** → PE-Reviewer + code-quality-auditor review implementation
6. **QCHECKF** → PE-Reviewer reviews functions (HomepageTemplate, routing)
7. **QPLAN + QCODE + QCHECK** → Fix P0-P1 implementation issues (loop until clean)
8. **Manual QA** → Execute checklist
9. **QDOC** → Update docs if needed (likely not required)
10. **QGIT** → Stage, commit, push

---

## Success Criteria

**Pre-Deployment Gates** (MUST PASS):
- [ ] All 35+ tests passing
- [ ] `npm run typecheck` passes
- [ ] `npm test` passes
- [ ] `npm run lint` passes
- [ ] No P0 or P1 issues remaining from code review

**Production Verification** (`prelaunch.bearlakecamp.com`):
- [ ] Homepage displays content from `index.mdoc`
- [ ] Homepage shows gallery images
- [ ] All 19 pages accessible via URLs
- [ ] Program pages show hero images and galleries
- [ ] Facility pages show hero images
- [ ] Staff pages show hero images
- [ ] Keystatic "Settings > Site Navigation" accessible
- [ ] Can edit navigation menu items
- [ ] Can edit any page content
- [ ] Can scroll to bottom of edit forms
- [ ] No 404 errors
- [ ] No console errors
- [ ] All images load (no broken links)

**Keystatic Functionality**:
- [ ] Can create new page with homepage template
- [ ] Can add/remove gallery images
- [ ] Can edit hero image and tagline
- [ ] Can edit CTA section
- [ ] Changes save successfully
- [ ] Changes reflect immediately on frontend

---

## Non-Goals (Deferred)

Explicitly **NOT** included in this phase:
- Homepage video background (keep hardcoded Hero component for this)
- Instagram API integration (existing InstagramFeed component)
- Trust bar component migration (not needed in templates)
- Mission section parallax (hardcoded component)
- Mobile sticky CTA (existing MobileStickyCTA component)
- Animation/scroll effects (future enhancement)
- Image format optimization (WebP conversion)
- Lazy loading configuration (Next.js Image handles this)
- Content approval workflow (future feature)
- Draft/preview mode (Keystatic feature)
- Multi-level nested navigation (>2 levels)
- Lightbox/modal for gallery images (future enhancement)

---

## Artifacts

This plan will generate:
1. `components/templates/HomepageTemplate.tsx`
2. `components/templates/HomepageTemplate.spec.tsx`
3. `scripts/migrate-image-paths.ts`
4. Updated `ProgramTemplate.tsx` (hero + gallery)
5. Updated `FacilityTemplate.tsx` (hero)
6. Updated `StaffTemplate.tsx` (hero)
7. Updated `app/page.tsx` (use index.mdoc)
8. Updated `app/[slug]/page.tsx` (pass hero props)
9. Updated `.mdoc` files (local image paths)
10. Updated `app/keystatic/layout.tsx` (scroll fix if needed)

---

## Open Questions

**Q1**: Should we add a visual indicator that the homepage is CMS-driven?
**A1**: No. Users will see "Home" page in Keystatic pages collection. No special indicator needed.

**Q2**: What if editors delete the `index.mdoc` file?
**A2**: Homepage will show fallback message. Editors can recreate the page in Keystatic with template type "Homepage".

**Q3**: Should gallery images support captions?
**A3**: Yes, the schema already includes `caption` field. HomepageTemplate should render captions below images.

**Q4**: What if an image path migration can't find a local file?
**A4**: Script should log warning but continue. Leave WordPress URL in place (image will still load from remote).

**Q5**: Should we migrate hardcoded homepage components to use HomepageTemplate?
**A5**: No. Keep existing components intact as fallback. They can coexist.

---

## Approval & Next Steps

**Plan Status**: READY FOR REVIEW

**Approver**: User (Travis)

**Next Action**: Confirm approval, then proceed to **QCODET** (test-writer creates failing tests).

---

**Plan Author**: planner agent
**Date Created**: 2025-12-03
**Last Updated**: 2025-12-03
