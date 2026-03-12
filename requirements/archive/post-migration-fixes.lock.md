# Requirements Lock: Post-Migration Content Fixes

**Date**: 2025-12-03
**Objective**: Fix critical issues after 18-page WordPress migration to ensure all pages render with proper templates, styling, and images from CMS.

---

## Critical Issues Identified

1. Homepage showing hardcoded components instead of CMS content
2. Pages rendering as plain markdown walls instead of styled templates
3. Hero images and gallery images not displaying from CMS
4. Keystatic navigation UI not appearing
5. Keystatic edit page scroll issue (can't reach bottom)

---

## REQ-PM-001: Homepage CMS Integration (P0)

**Description**: Replace hardcoded homepage components with CMS-driven content from `index.mdoc`.

**Current State**:
- `app/page.tsx` renders hardcoded components (Hero, Mission, Programs, etc.)
- `content/pages/index.mdoc` exists with homepage template but is unused
- Homepage content not editable in Keystatic

**Acceptance Criteria**:
1. Root route `/` renders content from `content/pages/index.mdoc`
2. Homepage uses HomepageTemplate component (to be created)
3. All text content comes from CMS (hero tagline, body content, CTA)
4. Gallery images from `templateFields.value.galleryImages` render in grid
5. Hero image from frontmatter displays as background
6. CTA section renders with heading, button text, and link from CMS
7. Changes in Keystatic reflect immediately on homepage

**Non-Goals**:
- Video background support (image only for now)
- Animation/parallax effects

---

## REQ-PM-002: Create HomepageTemplate Component (P0)

**Description**: Build dedicated template component for homepage pages matching existing template pattern.

**Acceptance Criteria**:
1. Component created at `components/templates/HomepageTemplate.tsx`
2. Accepts props: title, bodyContent, heroImage, heroTagline, templateFields
3. templateFields includes: galleryImages[], ctaHeading, ctaButtonText, ctaButtonLink
4. Renders hero section with image background and tagline overlay
5. Renders markdown body content
6. Renders photo gallery grid (2 cols mobile, 3 cols tablet, 4 cols desktop)
7. Renders CTA section at bottom
8. Uses existing homepage component styles from components/homepage/*
9. Follows pattern established by ProgramTemplate, FacilityTemplate
10. TypeScript types for all props

**Non-Goals**:
- Instagram feed integration
- Trust bar component
- Mission parallax section

---

## REQ-PM-003: Add Hero Images to All Templates (P0)

**Description**: All page templates must display hero images from CMS frontmatter.

**Current State**:
- ProgramTemplate, FacilityTemplate, StaffTemplate use gradient placeholders
- Hero images defined in .mdoc frontmatter not being used
- No visual distinction between pages

**Acceptance Criteria**:
1. ProgramTemplate renders `heroImage` as full-width background
2. FacilityTemplate renders `heroImage` as full-width background
3. StaffTemplate renders `heroImage` as full-width background
4. Standard template in [slug]/page.tsx uses heroImage (already working)
5. Hero images are responsive (cover, center positioning)
6. Hero tagline overlays on image with proper contrast
7. Fallback gradient if heroImage missing

**Template Pattern**:
```tsx
<header
  className="relative w-full min-h-[400px] bg-cover bg-center"
  style={{ backgroundImage: heroImage ? `url(${heroImage})` : undefined }}
>
  <div className="absolute inset-0 bg-black/40" />
  <div className="relative z-10 text-white text-center px-4 py-16">
    <h1>{title}</h1>
    {heroTagline && <p>{heroTagline}</p>}
  </div>
</header>
```

**Non-Goals**:
- Image optimization/WebP conversion
- Lazy loading configuration

---

## REQ-PM-004: Add Gallery Images to Program Template (P1)

**Description**: Program pages should display photo galleries from CMS.

**Acceptance Criteria**:
1. ProgramTemplate renders `galleryImages` array from templateFields
2. Gallery displays in responsive grid (2 cols mobile, 3 cols desktop)
3. Each image shows alt text and optional caption
4. Gallery section appears after body content, before CTA
5. Uses Next.js Image component for optimization
6. Handles empty gallery array gracefully

**Non-Goals**:
- Lightbox/modal functionality
- Image upload in Keystatic (already configured)

---

## REQ-PM-005: Fix Keystatic Navigation UI (P0)

**Description**: Navigation singleton not appearing in Keystatic admin UI.

**Investigation Required**:
- Check if `content/navigation/` directory exists
- Verify navigation data file created
- Test Keystatic UI config navigation groups

**Acceptance Criteria**:
1. "Settings" group appears in Keystatic sidebar
2. "Site Navigation" link visible under Settings
3. Clicking link opens navigation editor
4. Can add/edit/delete menu items
5. Can add/edit dropdown children
6. Can edit primary CTA button

**Non-Goals**:
- Multi-level nested navigation (>2 levels)

---

## REQ-PM-006: Fix Keystatic Edit Page Scroll (P1)

**Description**: Cannot scroll to bottom of page when editing in Keystatic.

**Investigation Required**:
- Check CSS z-index conflicts
- Verify PageEditingToolbar positioning
- Test overflow/height constraints

**Acceptance Criteria**:
1. Full page content scrollable in Keystatic editor
2. Can reach "Save" button at bottom of long forms
3. Toolbar does not block content
4. Works on desktop and tablet viewports

**Non-Goals**:
- Mobile Keystatic editing support

---

## REQ-PM-007: Update Image Paths in Generated Content (P1)

**Description**: Many pages reference WordPress.com image URLs instead of local `/images/` paths.

**Current State**:
- Pages have mix of `https://www.bearlakecamp.com/wp-content/uploads/...` and `/images/...`
- Local images exist in `public/images/` subdirectories
- Inconsistent image sourcing

**Acceptance Criteria**:
1. All hero images use local paths starting with `/images/`
2. All gallery images use local paths starting with `/images/`
3. Script created to convert WordPress URLs to local paths
4. Script maps images by filename to `/public/images/` subdirectories
5. All 19 .mdoc files updated with local paths

**Script Example**:
```bash
# Find image in public/images by filename
# Update frontmatter heroImage field
# Update gallery image paths
```

**Non-Goals**:
- Downloading missing images from WordPress
- Image format conversion

---

## REQ-PM-008: Comprehensive Template Rendering Tests (P0)

**Description**: TDD tests for all template components and routing.

**Test Coverage Required**:
1. **HomepageTemplate.spec.tsx**:
   - Renders hero with image and tagline
   - Renders body content via MarkdownRenderer
   - Renders gallery grid with images
   - Renders CTA section
   - Handles missing optional fields

2. **[slug]/page.spec.tsx**:
   - Routes homepage to HomepageTemplate
   - Routes program pages to ProgramTemplate
   - Routes facility pages to FacilityTemplate
   - Routes staff pages to StaffTemplate
   - Routes standard pages to default template
   - Handles 404 for missing slugs

3. **Template Updates Tests**:
   - ProgramTemplate displays hero image
   - ProgramTemplate renders gallery
   - FacilityTemplate displays hero image
   - StaffTemplate displays hero image

**Acceptance Criteria**:
- Minimum 25 new tests across all template specs
- All tests FAIL before implementation (TDD requirement)
- All tests PASS after implementation
- Coverage includes edge cases (empty fields, missing images)

**Non-Goals**:
- Visual regression testing
- E2E browser tests

---

## REQ-PM-009: Keystatic Admin Testing (P1)

**Description**: Integration tests for Keystatic functionality.

**Test Coverage Required**:
1. Navigation singleton accessible
2. Pages collection accessible
3. Can create new page with each template type
4. Image fields render file pickers
5. Gallery arrays allow add/remove items

**Acceptance Criteria**:
- Keystatic smoke tests pass
- Navigation CRUD operations work
- Page templates selectable

**Non-Goals**:
- UI interaction testing (use manual QA)

---

## Implementation Plan (TDD Flow)

### Phase 1: Test Writing (QCODET)
**Agent**: test-writer
**SP**: 1.5

1. Write HomepageTemplate.spec.tsx (8 tests, all failing)
2. Write updated ProgramTemplate.spec.tsx (6 new tests, failing)
3. Write updated FacilityTemplate.spec.tsx (4 new tests, failing)
4. Write updated StaffTemplate.spec.tsx (4 new tests, failing)
5. Write app/[slug]/page.integration.spec.tsx (8 tests, failing)
6. Write keystatic-navigation.spec.tsx (5 tests)

**Total**: ~35 failing tests

---

### Phase 2: Code Review of Tests (QCHECKT)
**Agents**: pe-reviewer, test-writer
**SP**: 0.3

- Review test quality, coverage, REQ-ID mapping
- Identify P0-P1 issues in test design
- Fix test issues before implementation

---

### Phase 3: Implementation (QCODE)
**Agents**: sde-iii, implementation-coordinator
**SP**: 2.5

**Parallel Tracks**:

**Track A: Homepage Integration**
1. Create HomepageTemplate component
2. Update app/page.tsx to use index.mdoc content
3. Verify homepage tests pass

**Track B: Template Enhancements**
4. Add hero image rendering to ProgramTemplate
5. Add gallery rendering to ProgramTemplate
6. Add hero image to FacilityTemplate
7. Add hero image to StaffTemplate
8. Update [slug]/page.tsx routing for homepage

**Track C: Image Path Migration**
9. Create image path migration script
10. Run script on all 19 .mdoc files
11. Verify local images exist

**Track D: Keystatic UI Fixes**
12. Investigate navigation singleton issue
13. Fix scroll issue in edit pages
14. Create navigation data file if missing

---

### Phase 4: Code Review (QCHECK, QCHECKF)
**Agents**: pe-reviewer, code-quality-auditor
**SP**: 0.5

- Review all template components
- Review routing logic
- Check for XSS vulnerabilities in image rendering
- Verify TypeScript types

---

### Phase 5: P0-P1 Fixes Loop
**Process**: QPLAN → QCODE → QCHECK (recursive until clean)
**SP**: 1.0 (estimated)

1. Planner creates fix plan for P0-P1 issues
2. SDE-III implements fixes
3. PE-Reviewer checks fixes
4. Repeat until no P0-P1 issues remain

---

### Phase 6: End-to-End Verification
**SP**: 0.5

1. Run full test suite (`npm test`)
2. Run typecheck (`npm run typecheck`)
3. Run lint (`npm run lint`)
4. Manual QA on prelaunch.bearlakecamp.com:
   - Homepage renders from CMS
   - All 19 pages accessible
   - All pages use correct templates
   - Hero images display
   - Gallery images display
   - Keystatic navigation accessible
   - Keystatic page editing works
   - Can scroll to bottom of edit forms

---

## Story Points Summary

| Phase | Description | SP |
|-------|-------------|-----|
| 1 | Test Writing (QCODET) | 1.5 |
| 2 | Test Review (QCHECKT) | 0.3 |
| 3 | Implementation (QCODE) | 2.5 |
| 4 | Code Review (QCHECK) | 0.5 |
| 5 | P0-P1 Fix Loop | 1.0 |
| 6 | E2E Verification | 0.5 |
| **Total** | | **6.3 SP** |

---

## Success Criteria

**Pre-Deployment Gates**:
- [ ] All 35+ tests passing
- [ ] `npm run typecheck` passes
- [ ] `npm test` passes
- [ ] `npm run lint` passes
- [ ] No P0 or P1 issues remaining

**Production Verification (prelaunch.bearlakecamp.com)**:
- [ ] Homepage displays content from index.mdoc
- [ ] Homepage shows gallery images
- [ ] All 19 pages accessible via their URLs
- [ ] Program pages show hero images and session info
- [ ] Facility pages show hero images and amenities
- [ ] Staff pages show hero images and CTAs
- [ ] Keystatic "Settings > Site Navigation" accessible
- [ ] Can edit navigation menu items
- [ ] Can edit any page content
- [ ] Can scroll to bottom of edit forms
- [ ] No 404 errors
- [ ] No console errors
- [ ] All images load (no broken links)

---

## Dependencies

- Existing [slug]/page.tsx routing (in place)
- Keystatic config with page templates (in place)
- Template components (Program, Facility, Staff exist)
- Navigation singleton in config (exists)
- Local images in public/images/ (exist)

---

## Non-Goals

- Homepage video background
- Instagram API integration
- Trust bar component migration
- Mission section parallax
- Mobile sticky CTA
- Animation/scroll effects
- Image format optimization
- Lazy loading configuration
- Content approval workflow
- Draft/preview mode

---

## Related Requirements

- REQ-401 to REQ-421: Keystatic Complete Implementation
- REQ-200 to REQ-220: Homepage Conversion Requirements
- REQ-SEC-001: XSS Security (ensure no new vulnerabilities in image rendering)
