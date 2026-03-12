# Requirements Lock - WordPress to Keystatic Migration Fix

**Date:** 2025-11-20
**Task Type:** Bug Fix + Feature Enhancement (Hybrid)
**Story Points:** 21 SP
**Status:** Planning

---

## REQ-201: Proper Markdown Rendering
**Status:** 🟡 Planning
**Story Points:** 5 SP
**Priority:** P0 (Blocking)

### Description
Replace custom `convertMarkdownToHtml()` function with proper markdown rendering library that handles:
- YouTube URL conversion to embeds
- Proper link rendering (no empty hrefs)
- Correct paragraph breaks (no excessive `<br/>` tags)
- Images with proper styling
- Heading hierarchy preservation

### Acceptance Criteria
- [ ] YouTube URLs automatically converted to iframe embeds
  - Format: `https://youtu.be/VIDEO_ID` or `https://www.youtube.com/watch?v=VIDEO_ID`
  - Must render as responsive iframe (16:9 aspect ratio)
  - Should include title attribute for accessibility
- [ ] Markdown links render correctly (no `[text]()` with empty hrefs)
  - Links with empty hrefs should be stripped or rendered as plain text
  - Valid links should have proper hover states
- [ ] Paragraph breaks render correctly
  - Single newlines should not create `<br/>` tags
  - Double newlines should create paragraph breaks
  - No excessive `<br/>` tags in output
- [ ] Images render with proper styling
  - Use Next.js Image component for optimization
  - Responsive sizing
  - Lazy loading
  - Alt text support
- [ ] Heading hierarchy maintained (h1, h2, h3)
  - Proper Tailwind typography classes applied
  - Consistent spacing
- [ ] HTML comments are stripped from rendered output
- [ ] Uses Keystatic's DocumentRenderer or proper markdown library (react-markdown, marked, etc.)
- [ ] All existing unit tests pass
- [ ] New tests verify YouTube embeds, links, paragraphs

### Non-Goals
- Custom markdown extensions beyond standard features
- Video player customization (YouTube's default player sufficient)
- Markdown WYSIWYG editor improvements (Keystatic handles this)

### Technical Approach
- Option 1: Use Keystatic's `@keystatic/core` DocumentRenderer (recommended)
  - Already in dependencies
  - Designed to work with Keystatic's markdoc format
  - Supports custom component rendering
- Option 2: Use `react-markdown` + `remark-gfm`
  - Popular, well-maintained
  - Requires additional dependencies
  - Need custom YouTube plugin

**Recommendation:** Use Keystatic's DocumentRenderer with custom renderers for YouTube embeds and images.

---

## REQ-202: Program Template Component
**Status:** 🟡 Planning
**Story Points:** 3 SP
**Priority:** P0 (Blocking)

### Description
Create visually appealing Program template component for pages like "Summer Camp" with proper sections, styling, and responsive design.

### Acceptance Criteria
- [ ] Hero section with background image
  - Full-width, proper aspect ratio
  - Dark overlay for text readability
  - Title and tagline centered
- [ ] Camp sessions grid
  - Displays age range, dates, pricing from frontmatter
  - Responsive grid (1 column mobile, 2-3 columns desktop)
  - Card-based design with hover effects
  - Each session has visual distinction
- [ ] Registration CTA prominently displayed
  - Large, contrasting button
  - Links to UltraCamp registration
  - Sticky on mobile (optional enhancement)
- [ ] FAQ sections properly formatted
  - Collapsible/expandable design (accordion)
  - Clean typography
  - Proper spacing
- [ ] Content sections with visual hierarchy
  - Markdown content rendered properly (depends on REQ-201)
  - Section dividers
  - Appropriate spacing
- [ ] Responsive design
  - Mobile-first approach
  - Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
  - Touch-friendly tap targets (min 48px)
- [ ] Uses Tailwind custom colors (bark, cream, secondary)
- [ ] Semantic HTML (sections, articles, proper headings)
- [ ] Accessibility labels (ARIA where needed)

### Non-Goals
- Real-time registration availability checking (external system)
- Payment processing integration
- Interactive date picker

---

## REQ-203: Facility Template Component
**Status:** 🟡 Planning
**Story Points:** 3 SP
**Priority:** P0 (Blocking)

### Description
Create visually appealing Facility template component for pages like "Cabins" with image gallery, features grid, and booking CTA.

### Acceptance Criteria
- [ ] Hero section
  - Full-width background image
  - Title overlay with proper contrast
- [ ] Image gallery for facility photos
  - Grid layout (2 columns mobile, 3-4 columns desktop)
  - Lightbox/modal on click (optional)
  - Lazy loading
  - Alt text support
  - Uses galleryImages from Keystatic schema
- [ ] Features/amenities grid
  - Card-based layout
  - Icons (optional) or bullet points
  - Displays capacity and amenities from frontmatter
  - Responsive (1-2 columns mobile, 3-4 columns desktop)
- [ ] Capacity information display
  - Prominent visual treatment
  - Clear, readable typography
- [ ] FAQ accordion (reusable component from REQ-202)
  - Collapsible sections
  - Proper spacing
- [ ] Booking/contact CTA
  - Phone number display
  - Email link
  - Contact form link (if exists)
  - Prominent placement at bottom
- [ ] Responsive layout
  - Mobile-first
  - Touch-friendly
- [ ] Semantic HTML and accessibility

### Non-Goals
- Real-time availability calendar
- Online booking system
- Virtual tour/360 photos

---

## REQ-204: Staff Template Component
**Status:** 🟡 Planning
**Story Points:** 3 SP
**Priority:** P0 (Blocking)

### Description
Create visually appealing Staff template component for "Summer Staff" page with positions grid, testimonials, and application CTA.

### Acceptance Criteria
- [ ] Hero section
  - Background image
  - Compelling tagline ("BEST. SUMMER. JOB. EVER.")
- [ ] Staff positions grid/cards
  - Each position as card
  - Title, description, requirements
  - Icon or image per position
  - Responsive grid (1 column mobile, 2-3 columns desktop)
  - Expandable details (accordion or modal)
- [ ] Staff testimonials section
  - Quote cards with staff photo
  - Name and role
  - Grid layout (1 column mobile, 2-3 columns desktop)
  - Styled with background color or borders
- [ ] Benefits section
  - Bullet list or card grid
  - Icons (optional)
  - Clear, readable format
- [ ] Application CTA
  - Large, prominent button
  - Links to UltraCamp application
  - Repeated at top and bottom
- [ ] FAQ accordion (reusable component)
  - Similar to REQ-202 and REQ-203
- [ ] Responsive layout
- [ ] Semantic HTML and accessibility

### Non-Goals
- Application form embedded in page (links to external UltraCamp)
- Staff profile management system
- Staff login/dashboard

---

## REQ-205: Standard/Homepage Template Component
**Status:** 🟡 Planning
**Story Points:** 2 SP
**Priority:** P1 (High)

### Description
Create visually appealing Standard and Homepage template components with proper hero, content sections, and CTAs.

### Acceptance Criteria
- [ ] Hero section with tagline
  - Background image support
  - Centered text overlay
  - Proper contrast and readability
- [ ] Content sections properly formatted
  - Markdown rendering (depends on REQ-201)
  - Visual hierarchy (headings, paragraphs, lists)
  - Appropriate spacing between sections
  - Optional section backgrounds (alternating cream/white)
- [ ] CTA sections
  - Card-based or full-width design
  - Button styling consistent with brand
  - Links to registration, donations, etc.
- [ ] Homepage-specific: Photo gallery
  - Grid layout from galleryImages
  - Responsive
  - Lazy loading
  - Lightbox (optional)
- [ ] Responsive layout
  - Mobile-first
  - Proper breakpoints
- [ ] Semantic HTML and accessibility

### Non-Goals
- Dynamic content loading (static generation sufficient)
- Complex animations
- Interactive widgets beyond basic CTAs

---

## REQ-206: Content Cleanup
**Status:** 🟡 Planning
**Story Points:** 2 SP
**Priority:** P1 (High)

### Description
Fix content issues in migrated .mdoc files from WordPress: YouTube URLs, broken links, HTML comments, formatting inconsistencies.

### Acceptance Criteria
- [ ] All YouTube URLs converted to proper format
  - From: `https://youtu.be/8N9Yeup1xVA?si=4KXXFghbmpg0j46-`
  - To: `https://youtu.be/8N9Yeup1xVA` (clean URL) or custom YouTube component
- [ ] All broken markdown links fixed
  - Links with empty hrefs `[text]()` either:
    - Given proper URLs
    - Converted to plain text
    - Removed if not needed
- [ ] HTML comments removed
  - Strip `<!-- TBD: Partners page not migrated yet -->`
  - Replace with editor notes if needed for future reference
- [ ] Consistent formatting applied
  - Proper heading hierarchy
  - Consistent spacing
  - Remove excessive line breaks
  - Standardize lists and bullet points
- [ ] Script to detect and report content issues
  - Scans all .mdoc files
  - Reports: empty links, HTML comments, malformed markdown
  - Can be run as pre-commit hook or CI check
- [ ] Documentation of content standards
  - Markdown style guide
  - Examples of proper formatting
  - Migration checklist for future content

### Non-Goals
- Rewriting content for tone/style (preserve original)
- SEO optimization of text content
- Translating content to other languages

---

## REQ-207: Reusable Component Library
**Status:** 🟡 Planning
**Story Points:** 3 SP
**Priority:** P1 (High)

### Description
Extract reusable components from template implementations to ensure DRY principles and maintainability.

### Acceptance Criteria
- [ ] `FAQAccordion` component
  - Accepts array of {question, answer} objects
  - Collapsible/expandable behavior
  - Keyboard accessible (space/enter to toggle)
  - ARIA attributes for screen readers
  - Consistent styling across all templates
- [ ] `ImageGallery` component
  - Accepts array of image objects
  - Responsive grid layout
  - Lazy loading
  - Optional lightbox/modal
  - Alt text support
- [ ] `CTAButton` component
  - Primary and secondary variants
  - Size variants (small, medium, large)
  - Icon support (optional)
  - Consistent hover/focus states
  - Loading state (optional)
- [ ] `StaffCard` component
  - Photo, name, title, bio
  - Consistent styling
  - Responsive
- [ ] `SessionCard` component (for programs)
  - Age range, dates, pricing
  - Registration link
  - Hover effects
- [ ] All components have TypeScript types
- [ ] All components co-located with .spec.ts tests
- [ ] Storybook documentation (optional, P2)

### Non-Goals
- Full design system with extensive variants
- Third-party component library integration
- Component versioning/publishing

---

## Cross-Cutting Requirements

### Performance
- All images use Next.js Image component with optimization
- Lazy loading for images and YouTube embeds
- Bundle size increase < 50 KB (gzipped) from new components
- Lighthouse Performance score remains ≥ 90
- LCP < 2.5s maintained

### Accessibility
- WCAG AA compliance (4.5:1 color contrast)
- Keyboard navigation for all interactive elements
- ARIA labels for complex components (accordion, modals)
- Alt text for all images
- Focus indicators visible
- Screen reader tested (VoiceOver or NVDA)
- Lighthouse Accessibility score ≥ 90

### Browser Compatibility
- Chrome (desktop + mobile) latest 2 versions
- Safari (desktop + iOS) latest 2 versions
- Firefox (desktop) latest 2 versions
- Edge (desktop) latest 2 versions

### Type Safety
- All components have proper TypeScript types
- No `any` types (use `unknown` if necessary)
- Proper types for Keystatic schema data
- No type errors from `npm run typecheck`

### Testing
- Unit tests for all components (≥80% coverage)
- Integration tests for template rendering
- Visual regression tests (optional, P2)
- Tests reference REQ-IDs in descriptions

---

## Dependencies & Blockers

### Technical Dependencies
- `@keystatic/core` - already installed (markdown rendering)
- `next/image` - already installed (image optimization)
- Potential additions:
  - `react-markdown` + `remark-gfm` (if not using Keystatic renderer)
  - No other dependencies recommended (keep bundle small)

### Design Assets
- ✅ Tailwind config with custom colors (bark, cream, secondary) exists
- ✅ Hero images exist in migrated pages
- Need: Component design specifications (can infer from existing WordPress design)

### Content Dependencies
- Depends on REQ-206 content cleanup for proper rendering
- No external blockers (all content exists in .mdoc files)

---

## Success Metrics

### Functional Metrics
- All 5 migrated pages render without errors
- YouTube embeds work on all pages
- No broken links visible to users
- All images display properly

### Quality Metrics
- Lighthouse Accessibility score ≥ 90
- Lighthouse Performance score ≥ 90
- Zero TypeScript errors
- All tests passing
- No console errors on any page

### User Experience Metrics
- Pages are visually complete (no placeholder text/styling)
- Mobile responsive on all templates
- Load time < 3 seconds on 3G
- Improved design over WordPress version (subjective)

---

## Test Strategy

### Unit Tests (QCODET)
- `YouTubeEmbed.spec.ts` - REQ-201
  - Converts various YouTube URL formats to embeds
  - Handles invalid URLs gracefully
  - Renders responsive iframe
  - Includes accessibility attributes
- `MarkdownRenderer.spec.ts` - REQ-201
  - Renders headings with proper hierarchy
  - Handles paragraphs and line breaks correctly
  - Strips HTML comments
  - Handles empty links
- `FAQAccordion.spec.ts` - REQ-207
  - Expands/collapses on click
  - Keyboard navigation works
  - ARIA attributes present
  - Multiple items can be open simultaneously (or single-open behavior)
- `ImageGallery.spec.ts` - REQ-207
  - Renders grid layout
  - Lazy loads images
  - Alt text present
- `ProgramTemplate.spec.ts` - REQ-202
  - Renders hero section
  - Displays session cards
  - Registration CTA present
  - Responsive layout
- `FacilityTemplate.spec.ts` - REQ-203
  - Renders facility details
  - Gallery displays
  - Booking CTA present
- `StaffTemplate.spec.ts` - REQ-204
  - Renders positions grid
  - Testimonials display
  - Application CTA present
- `StandardTemplate.spec.ts` - REQ-205
  - Renders hero and content sections
  - CTAs display properly
- `content-validator.spec.ts` - REQ-206
  - Detects empty links
  - Detects HTML comments
  - Reports content issues

### Integration Tests (QCODE)
- `app/[slug]/page.spec.ts` - Template routing
  - Correct template renders based on discriminant
  - 404 for non-existent pages
  - Metadata generation works
- Template composition tests
  - All sections render in correct order
  - Props passed correctly from frontmatter
  - Markdown content renders within templates

### Visual Tests (Optional - P2)
- Screenshot comparison for each template
- Responsive breakpoint testing
- Cross-browser rendering

### Accessibility Tests (QCHECK)
- Lighthouse audit on all 5 pages
- axe DevTools scan (zero violations)
- Keyboard navigation manual test
- Screen reader manual test (VoiceOver on Mac or NVDA on Windows)

### Performance Tests (QCHECK)
- Lighthouse Performance audit
- Bundle size analysis
- Core Web Vitals monitoring

---

## Implementation Phases

### Phase 1: Foundation & Markdown (8 SP)
**Focus:** Fix core rendering issues before building templates

**Requirements:**
- REQ-201: Proper Markdown Rendering (5 SP)
- REQ-206: Content Cleanup (2 SP)
- Part of REQ-207: YouTubeEmbed component (1 SP)

**Deliverables:**
- DocumentRenderer implementation with YouTube support
- All content issues fixed in .mdoc files
- Tests for markdown rendering
- Content validation script

**Success Criteria:**
- Markdown renders correctly on all pages
- YouTube embeds work
- No HTML comments visible
- No broken links

---

### Phase 2: Template Components (10 SP)
**Focus:** Build visual templates for each page type

**Requirements:**
- REQ-202: Program Template (3 SP)
- REQ-203: Facility Template (3 SP)
- REQ-204: Staff Template (3 SP)
- Part of REQ-207: FAQAccordion, ImageGallery (1 SP)

**Deliverables:**
- Program template with sessions grid, FAQ, CTA
- Facility template with gallery, features, contact CTA
- Staff template with positions, testimonials, application CTA
- Reusable FAQ and Gallery components
- Tests for all templates

**Success Criteria:**
- All 3 specialized templates render properly
- Responsive on mobile and desktop
- FAQs expand/collapse correctly
- Image galleries display

---

### Phase 3: Polish & Standard Templates (3 SP)
**Focus:** Complete remaining templates and components

**Requirements:**
- REQ-205: Standard/Homepage Template (2 SP)
- Complete REQ-207: CTAButton, SessionCard, StaffCard (1 SP)

**Deliverables:**
- Standard and Homepage templates
- All reusable components complete
- Component documentation
- Tests for remaining components

**Success Criteria:**
- All 5 pages fully styled and functional
- All components have tests
- Component library documented
- Zero console errors

---

## Quality Gates (QCHECK, QCHECKF, QCHECKT)

### Pre-Implementation Gates
- [x] Requirements reviewed and approved
- [ ] Story points estimated using planning poker
- [ ] Test strategy defined
- [ ] Technical approach agreed upon

### Phase 1 Gates
- [ ] All Phase 1 tests passing (QCHECKT)
- [ ] TypeScript errors resolved
- [ ] Markdown renders correctly on sample page
- [ ] Content validation script working
- [ ] PE Review: Markdown implementation (QCHECKF)

### Phase 2 Gates
- [ ] All Phase 2 tests passing (QCHECKT)
- [ ] All 3 specialized templates functional
- [ ] Components are reusable and DRY
- [ ] Responsive design verified on 3 devices
- [ ] PE Review: Template implementations (QCHECKF)

### Phase 3 Gates
- [ ] All tests passing (QCHECKT)
- [ ] All 5 pages fully functional
- [ ] Lighthouse scores: Accessibility ≥90, Performance ≥90
- [ ] Zero TypeScript errors
- [ ] All P0 and P1 issues resolved
- [ ] PE Review: Final implementation (QCHECK)

### Pre-Deployment Gates (QGIT)
- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] `npm run test` passes (all unit + integration tests)
- [ ] Manual smoke test on localhost
- [ ] Browser compatibility verified (Chrome, Safari, Firefox, Edge)
- [ ] Mobile responsive verified (iOS Safari, Chrome Android)

---

## Story Point Breakdown

| Requirement | Story Points | Priority | Phase |
|-------------|--------------|----------|-------|
| REQ-201: Proper Markdown Rendering | 5 SP | P0 | Phase 1 |
| REQ-206: Content Cleanup | 2 SP | P1 | Phase 1 |
| REQ-207: YouTubeEmbed component | 1 SP | P1 | Phase 1 |
| **Phase 1 Total** | **8 SP** | | |
| REQ-202: Program Template | 3 SP | P0 | Phase 2 |
| REQ-203: Facility Template | 3 SP | P0 | Phase 2 |
| REQ-204: Staff Template | 3 SP | P0 | Phase 2 |
| REQ-207: FAQ, Gallery components | 1 SP | P1 | Phase 2 |
| **Phase 2 Total** | **10 SP** | | |
| REQ-205: Standard/Homepage Template | 2 SP | P1 | Phase 3 |
| REQ-207: Remaining components | 1 SP | P1 | Phase 3 |
| **Phase 3 Total** | **3 SP** | | |
| **Overall Total** | **21 SP** | | |

**Velocity Estimate:** 7-8 SP per day (2-3 days total with focused work)

---

## Agent Assignments & Parallel Execution

### Phase 1: Foundation & Markdown (8 SP)

#### Wave 1A - Analysis (Parallel)
1. **debug-planner** (1 SP)
   - Analyze root cause of markdown rendering issues
   - Document current convertMarkdownToHtml failures
   - Output: Root cause analysis document

2. **requirements-scribe** (0.5 SP)
   - Review and refine REQ-201 and REQ-206
   - Ensure all edge cases captured
   - Output: Refined requirements

3. **research-coordinator** (0.5 SP)
   - Research Keystatic DocumentRenderer API
   - Investigate YouTube embed best practices
   - Output: Technical research findings

**Wave 1A Total:** 2 SP (runs in parallel)

#### Wave 1B - Test Writing (Parallel)
1. **test-writer** (2 SP)
   - Write failing tests for REQ-201 (markdown rendering)
   - Write failing tests for REQ-206 (content validation)
   - Write tests for YouTubeEmbed component
   - Output: Complete test suite (all tests RED)

2. **content-validator** (0.5 SP)
   - Create script to scan .mdoc files for issues
   - Report empty links, HTML comments, malformed markdown
   - Output: content-validator.ts script

**Wave 1B Total:** 2.5 SP (runs in parallel, after Wave 1A)

#### Wave 1C - Implementation (Sequential)
1. **sde-iii** (3 SP)
   - Implement DocumentRenderer with YouTube support
   - Implement custom renderers for images, links
   - Fix all content issues in .mdoc files
   - Make all tests GREEN
   - Output: Working markdown rendering + cleaned content

**Wave 1C Total:** 3 SP (runs after Wave 1B)

#### Wave 1D - Review (Parallel)
1. **pe-reviewer** (0.5 SP)
   - Review markdown renderer implementation
   - Check for edge cases, security issues
   - Output: P0/P1 recommendations

2. **code-quality-auditor** (0.3 SP)
   - Review code quality, DRY principles
   - Check TypeScript types
   - Output: Quality recommendations

3. **test-writer** (0.2 SP)
   - Review test coverage
   - Ensure all edge cases tested
   - Output: Test quality report

**Wave 1D Total:** 1 SP (runs in parallel, after Wave 1C)

**Phase 1 Total:** 8 SP (critical path: ~4 days with context switches)

---

### Phase 2: Template Components (10 SP)

#### Wave 2A - Test Writing (Parallel)
1. **test-writer** - Program Template (1 SP)
   - Write failing tests for REQ-202
   - Output: ProgramTemplate.spec.ts (RED)

2. **test-writer** - Facility Template (1 SP)
   - Write failing tests for REQ-203
   - Output: FacilityTemplate.spec.ts (RED)

3. **test-writer** - Staff Template (1 SP)
   - Write failing tests for REQ-204
   - Output: StaffTemplate.spec.ts (RED)

4. **test-writer** - Shared Components (0.5 SP)
   - Write failing tests for FAQAccordion, ImageGallery
   - Output: Component tests (RED)

**Wave 2A Total:** 3.5 SP (runs in parallel)

#### Wave 2B - Implementation (Parallel - 3 agents)
1. **sde-iii** - Program Template (2 SP)
   - Implement Program template component
   - Session cards, FAQ, CTA
   - Make tests GREEN
   - Output: components/templates/ProgramTemplate.tsx

2. **sde-iii** - Facility Template (2 SP)
   - Implement Facility template component
   - Gallery, features, contact CTA
   - Make tests GREEN
   - Output: components/templates/FacilityTemplate.tsx

3. **sde-iii** - Staff Template (2 SP)
   - Implement Staff template component
   - Positions, testimonials, application CTA
   - Make tests GREEN
   - Output: components/templates/StaffTemplate.tsx

**Wave 2B Total:** 6 SP (runs in parallel, after Wave 2A)

#### Wave 2C - Shared Components (Sequential)
1. **sde-iii** (1 SP)
   - Implement FAQAccordion component
   - Implement ImageGallery component
   - Extract from templates, make reusable
   - Make tests GREEN
   - Output: components/shared/FAQAccordion.tsx, ImageGallery.tsx

**Wave 2C Total:** 1 SP (runs after Wave 2B or in parallel if extracted first)

#### Wave 2D - Review (Parallel)
1. **pe-reviewer** (0.8 SP)
   - Review all 3 templates
   - Check component reusability
   - Output: P0/P1 recommendations

2. **code-quality-auditor** (0.5 SP)
   - Check for DRY violations
   - Review TypeScript types
   - Output: Quality recommendations

3. **ux-tester** (0.2 SP)
   - Test responsive design
   - Check mobile UX
   - Output: UX issues

**Wave 2D Total:** 1.5 SP (runs in parallel, after Wave 2B/2C)

**Phase 2 Total:** 10 SP (critical path: ~3 days with parallel work)

---

### Phase 3: Polish & Standard Templates (3 SP)

#### Wave 3A - Test Writing (Sequential)
1. **test-writer** (0.5 SP)
   - Write tests for Standard/Homepage templates
   - Write tests for remaining components
   - Output: StandardTemplate.spec.ts, HomepageTemplate.spec.ts (RED)

#### Wave 3B - Implementation (Sequential)
1. **sde-iii** (1.5 SP)
   - Implement Standard and Homepage templates
   - Implement CTAButton, SessionCard, StaffCard components
   - Make tests GREEN
   - Output: All remaining components

#### Wave 3C - Final Review (Parallel)
1. **pe-reviewer** (0.5 SP)
   - Final review of all code
   - Check for any remaining issues
   - Output: Final recommendations

2. **code-quality-auditor** (0.3 SP)
   - Final quality check
   - Component documentation review
   - Output: Quality report

3. **test-writer** (0.2 SP)
   - Verify test coverage ≥80%
   - Check for missing edge cases
   - Output: Coverage report

**Wave 3C Total:** 1 SP (runs in parallel, after Wave 3B)

**Phase 3 Total:** 3 SP (critical path: ~1 day)

---

### Final Quality Gates (QCHECK, QGIT)

#### Accessibility & Performance Audit (Parallel)
1. **pe-reviewer** (0.5 SP)
   - Run Lighthouse audits on all 5 pages
   - Run axe DevTools
   - Manual keyboard navigation test
   - Manual screen reader test
   - Output: Accessibility report with issues

2. **pe-reviewer** (0.5 SP)
   - Lighthouse Performance audit
   - Bundle size analysis
   - Core Web Vitals check
   - Output: Performance report

**Audit Total:** 1 SP (runs in parallel after Phase 3)

#### Final Fixes (Sequential)
1. **sde-iii** (varies - estimate 1-2 SP)
   - Fix all P0 issues from audits
   - Fix all P1 issues from audits
   - Output: Production-ready code

#### Release Preparation (Sequential)
1. **release-manager** (0.5 SP)
   - Run full test suite
   - Run typecheck, lint
   - Create git commit with Conventional Commits format
   - Create PR with detailed description
   - Output: Ready for deployment

---

## Total Story Points: 21 SP

### Breakdown by Agent Type
- **test-writer:** 6.4 SP (30% of effort)
- **sde-iii:** 9.5 SP (45% of effort)
- **pe-reviewer:** 2.8 SP (13% of effort)
- **code-quality-auditor:** 1.1 SP (5% of effort)
- **Other agents:** 1.2 SP (7% of effort)

### Timeline Estimate
- **Optimistic (full parallelization):** 2-3 days
- **Realistic (some sequential dependencies):** 4-5 days
- **Conservative (context switches, debugging):** 6-7 days

---

## Risk Mitigation

### Risk: Keystatic DocumentRenderer has limitations
**Probability:** Medium
**Impact:** High
**Mitigation:** Research DocumentRenderer API in Phase 1 Wave 1A; have react-markdown as fallback option

### Risk: Content cleanup more extensive than estimated
**Probability:** Medium
**Impact:** Medium
**Mitigation:** Content validation script in Phase 1 will surface true scope early; can adjust estimates

### Risk: Component reusability not achievable
**Probability:** Low
**Impact:** Medium
**Mitigation:** Design components with reusability from start; pe-reviewer checks in Wave 2D

### Risk: Accessibility or Performance issues found late
**Probability:** Low
**Impact:** High
**Mitigation:** Run Lighthouse audits incrementally during phases, not just at end

### Risk: TypeScript type errors with Keystatic schema
**Probability:** Medium
**Impact:** Medium
**Mitigation:** Generate proper types from Keystatic schema; use branded types where needed

---

## Post-Implementation Tasks (P2 - Not in scope)

- [ ] Storybook documentation for component library
- [ ] Visual regression testing setup
- [ ] Content migration guide/documentation
- [ ] SEO optimization of content
- [ ] Performance monitoring setup (Real User Monitoring)
- [ ] A/B testing of design variations
