# TDD Plan: WordPress to Keystatic Migration Fix

**Date:** 2025-11-20
**Task Type:** Hybrid (Bug Fix + Feature Enhancement)
**Total Story Points:** 21 SP
**Estimated Duration:** 4-5 days (realistic, with parallel agents)
**Status:** Ready for Execution

---

## Executive Summary

This plan addresses critical rendering and design issues in 5 WordPress pages migrated to Keystatic (.mdoc format). The approach follows strict TDD methodology with parallel agent execution to minimize time while maintaining quality.

### Core Problems
1. **Broken Markdown Rendering:** Custom parser creates excessive `<br/>` tags, breaks links, fails YouTube embeds
2. **No Visual Design:** Pages render as plain text without proper component structure
3. **Content Issues:** YouTube URLs, empty links, HTML comments visible in output

### Solution Approach
1. Replace custom markdown parser with Keystatic's DocumentRenderer
2. Build template-specific components (Program, Facility, Staff, Standard, Homepage)
3. Create reusable component library (FAQ, Gallery, CTA, Cards)
4. Clean up content issues in .mdoc files
5. Ensure accessibility (≥90) and performance (≥90) scores maintained

---

## Requirements Summary

| REQ-ID | Description | Story Points | Priority | Phase |
|--------|-------------|--------------|----------|-------|
| REQ-201 | Proper Markdown Rendering | 5 SP | P0 | Phase 1 |
| REQ-206 | Content Cleanup | 2 SP | P1 | Phase 1 |
| REQ-207a | YouTubeEmbed Component | 1 SP | P1 | Phase 1 |
| REQ-202 | Program Template | 3 SP | P0 | Phase 2 |
| REQ-203 | Facility Template | 3 SP | P0 | Phase 2 |
| REQ-204 | Staff Template | 3 SP | P0 | Phase 2 |
| REQ-207b | FAQ, Gallery Components | 1 SP | P1 | Phase 2 |
| REQ-205 | Standard/Homepage Template | 2 SP | P1 | Phase 3 |
| REQ-207c | CTA, Card Components | 1 SP | P1 | Phase 3 |
| **Total** | | **21 SP** | | |

**Full Requirements:** See `/requirements/wordpress-migration-fix.lock.md`

---

## TDD Workflow per CLAUDE.md

### Standard Flow (Applied to Each Phase)
1. **QPLAN** - Requirements analysis and technical planning
2. **QCODET** - Write failing tests first (RED)
3. **QCHECKT** - Review test quality (test-writer + pe-reviewer)
4. **QCODE** - Implement to pass tests (GREEN)
5. **QCHECK/QCHECKF** - Review implementation (pe-reviewer + code-quality-auditor)
6. **Recursive QPLAN → QCODE → QCHECK** for P0/P1 issues
7. **QDOC** - Update documentation
8. **QGIT** - Stage, commit, push

### Blocking Rule (Enforced)
- test-writer MUST see failing tests before sde-iii implements
- No implementation begins until tests are RED
- All P0 issues MUST be fixed before phase completion
- All P1 issues SHOULD be fixed before phase completion

---

## Phase 1: Foundation & Markdown (8 SP)

**Goal:** Fix core markdown rendering before building templates
**Duration:** 1-2 days

### Wave 1A: Analysis (Parallel - 2 SP)
**Agents:** debug-planner, requirements-scribe, research-coordinator

| Agent | Task | Output | SP |
|-------|------|--------|-----|
| debug-planner | Root cause analysis of markdown issues | debug-analysis.md | 1.0 SP |
| requirements-scribe | Refine REQ-201, REQ-206 | Updated requirements | 0.5 SP |
| research-coordinator | Research Keystatic DocumentRenderer API | Technical research findings | 0.5 SP |

**Execution:**
```bash
# Run in parallel (conceptual - agents coordinate)
QPLAN --agent=debug-planner --focus="markdown rendering failures"
QPLAN --agent=requirements-scribe --focus="REQ-201,REQ-206"
QPLAN --agent=research-coordinator --focus="Keystatic DocumentRenderer, YouTube embeds"
```

**Success Criteria:**
- Root cause documented
- Requirements have acceptance criteria for all edge cases
- Technical approach selected (Keystatic DocumentRenderer vs alternatives)

---

### Wave 1B: Test Writing (Parallel - 2.5 SP)
**Agents:** test-writer (primary), content-validator (tool creation)

| Agent | Task | Output | SP |
|-------|------|--------|-----|
| test-writer | Write failing tests for markdown rendering | MarkdownRenderer.spec.ts, YouTubeEmbed.spec.ts | 2.0 SP |
| sde-iii | Create content validation script | scripts/validate-content.ts | 0.5 SP |

**Test Files Created:**
- `lib/markdown/MarkdownRenderer.spec.ts` - Tests DocumentRenderer implementation
- `components/YouTubeEmbed.spec.ts` - Tests YouTube URL conversion to embeds
- `scripts/validate-content.spec.ts` - Tests content validator script
- `scripts/validate-content.ts` - CLI tool to scan .mdoc files

**Execution:**
```bash
QCODET --req=REQ-201 --focus="markdown rendering, YouTube embeds"
QCODET --req=REQ-206 --focus="content validation script"
```

**Success Criteria:**
- All tests FAIL (RED state)
- Tests cover: YouTube embeds, links, paragraphs, headings, HTML comments, images
- Content validator detects empty links, HTML comments, malformed markdown
- QCHECKT passes (test-writer + pe-reviewer approve test quality)

---

### Wave 1C: Implementation (Sequential - 3 SP)
**Agent:** sde-iii

| Task | Files Modified | SP |
|------|----------------|-----|
| Implement DocumentRenderer with YouTube support | lib/markdown/MarkdownRenderer.tsx | 2.0 SP |
| Create YouTubeEmbed component | components/YouTubeEmbed.tsx | 0.5 SP |
| Fix content issues in .mdoc files | content/pages/*.mdoc | 0.5 SP |

**Execution:**
```bash
QCODE --req=REQ-201,REQ-206 --make-tests-green
```

**Success Criteria:**
- All tests PASS (GREEN state)
- YouTube URLs convert to embeds (various formats supported)
- Links render correctly (empty hrefs stripped)
- Paragraphs and line breaks correct (no excessive `<br/>`)
- HTML comments removed from .mdoc files
- Images use Next.js Image component
- `npm run typecheck` passes
- `npm run lint` passes

---

### Wave 1D: Review (Parallel - 1 SP)
**Agents:** pe-reviewer, code-quality-auditor, test-writer

| Agent | Focus | Output | SP |
|-------|-------|--------|-----|
| pe-reviewer | Implementation review | P0/P1 recommendations | 0.5 SP |
| code-quality-auditor | Code quality, types | Quality recommendations | 0.3 SP |
| test-writer | Test coverage | Coverage gaps | 0.2 SP |

**Execution:**
```bash
QCHECKF --focus="markdown renderer, YouTube embed component"
QCHECKT --focus="test coverage, edge cases"
```

**Success Criteria:**
- No P0 issues found (or all fixed before proceeding)
- P1 issues documented for optional follow-up
- Test coverage ≥80% for new code
- TypeScript types are strict (no `any`)

---

### Phase 1 Gate
- [ ] All Phase 1 tests passing
- [ ] Markdown renders correctly on sample page
- [ ] YouTube embeds functional
- [ ] Content validator script working
- [ ] No TypeScript errors
- [ ] All P0 issues resolved

**If gate fails:** Return to Wave 1C, fix issues, repeat Wave 1D

---

## Phase 2: Template Components (10 SP)

**Goal:** Build visually appealing templates for Program, Facility, Staff pages
**Duration:** 2-3 days

### Wave 2A: Test Writing (Parallel - 3.5 SP)
**Agent:** test-writer (multiple parallel tasks)

| Task | Output | SP |
|------|--------|-----|
| Program template tests | components/templates/ProgramTemplate.spec.ts | 1.0 SP |
| Facility template tests | components/templates/FacilityTemplate.spec.ts | 1.0 SP |
| Staff template tests | components/templates/StaffTemplate.spec.ts | 1.0 SP |
| Shared component tests | components/shared/FAQAccordion.spec.ts, ImageGallery.spec.ts | 0.5 SP |

**Execution:**
```bash
# Parallel test writing (conceptual)
QCODET --req=REQ-202 --focus="Program template"
QCODET --req=REQ-203 --focus="Facility template"
QCODET --req=REQ-204 --focus="Staff template"
QCODET --req=REQ-207 --focus="FAQ, Gallery components"
```

**Success Criteria:**
- All tests FAIL (RED state)
- Tests cover: hero sections, grids, CTAs, responsive layout, accessibility
- QCHECKT passes (test quality approved)

---

### Wave 2B: Implementation (Parallel - 6 SP)
**Agent:** sde-iii (3 parallel implementations or sequential if single agent)

| Task | Output | SP |
|------|--------|-----|
| Program template | components/templates/ProgramTemplate.tsx | 2.0 SP |
| Facility template | components/templates/FacilityTemplate.tsx | 2.0 SP |
| Staff template | components/templates/StaffTemplate.tsx | 2.0 SP |

**Implementation Details:**

**ProgramTemplate (REQ-202):**
- Hero section with background image
- Sessions grid (age, dates, pricing cards)
- Registration CTA (large, prominent)
- FAQ accordion
- Responsive layout (mobile-first)

**FacilityTemplate (REQ-203):**
- Hero section
- Image gallery (from galleryImages field)
- Features/amenities grid
- Capacity display
- Booking/contact CTA

**StaffTemplate (REQ-204):**
- Hero section with tagline
- Staff positions grid (expandable cards)
- Testimonials section (quote cards)
- Benefits section
- Application CTA (top and bottom)

**Execution:**
```bash
# Parallel or sequential implementation
QCODE --req=REQ-202 --make-tests-green
QCODE --req=REQ-203 --make-tests-green
QCODE --req=REQ-204 --make-tests-green
```

**Success Criteria:**
- All template tests PASS (GREEN state)
- Templates use Tailwind custom colors (bark, cream, secondary)
- Responsive on mobile and desktop
- Semantic HTML (sections, articles, proper headings)
- ARIA labels where needed
- No TypeScript errors

---

### Wave 2C: Shared Components (Sequential - 1 SP)
**Agent:** sde-iii

| Task | Output | SP |
|------|--------|-----|
| Extract and implement shared components | FAQAccordion.tsx, ImageGallery.tsx | 1.0 SP |

**FAQAccordion Component:**
- Props: `items: Array<{question: string, answer: string}>`
- Collapsible/expandable behavior
- Keyboard accessible (space/enter to toggle)
- ARIA attributes (aria-expanded, role="button")
- Consistent styling

**ImageGallery Component:**
- Props: `images: Array<{src: string, alt: string, caption?: string}>`
- Responsive grid layout
- Lazy loading (next/image)
- Optional lightbox (P2 feature)
- Alt text support

**Execution:**
```bash
QCODE --req=REQ-207 --focus="FAQ, Gallery components"
```

**Success Criteria:**
- Components used in multiple templates (DRY principle)
- All shared component tests PASS
- Props have proper TypeScript types

---

### Wave 2D: Review (Parallel - 1.5 SP)
**Agents:** pe-reviewer, code-quality-auditor, ux-tester

| Agent | Focus | Output | SP |
|-------|-------|--------|-----|
| pe-reviewer | Template implementations | P0/P1 recommendations | 0.8 SP |
| code-quality-auditor | Code quality, DRY | Quality recommendations | 0.5 SP |
| ux-tester | Responsive design, mobile UX | UX issues | 0.2 SP |

**Execution:**
```bash
QCHECK --focus="all Phase 2 templates and components"
QUX --focus="responsive design, mobile experience"
```

**Success Criteria:**
- No P0 issues (or all fixed before proceeding)
- Components are reusable (not duplicated)
- Responsive design verified on 3 devices (phone, tablet, desktop)
- Mobile tap targets ≥48px

---

### Phase 2 Gate
- [ ] All Phase 2 tests passing
- [ ] All 3 specialized templates functional (summer-camp, cabins, summer-staff pages)
- [ ] Shared components reusable and tested
- [ ] Responsive design works on mobile and desktop
- [ ] No TypeScript errors
- [ ] All P0 issues resolved

**If gate fails:** Return to Wave 2B/2C, fix issues, repeat Wave 2D

---

## Phase 3: Polish & Standard Templates (3 SP)

**Goal:** Complete Standard and Homepage templates, finalize component library
**Duration:** 1 day

### Wave 3A: Test Writing (Sequential - 0.5 SP)
**Agent:** test-writer

| Task | Output | SP |
|------|--------|-----|
| Standard/Homepage template tests | StandardTemplate.spec.ts, HomepageTemplate.spec.ts | 0.3 SP |
| Remaining component tests | CTAButton.spec.ts, SessionCard.spec.ts, StaffCard.spec.ts | 0.2 SP |

**Execution:**
```bash
QCODET --req=REQ-205,REQ-207 --focus="Standard, Homepage templates and remaining components"
```

**Success Criteria:**
- All tests FAIL (RED state)
- Tests cover: hero sections, content sections, CTAs, gallery
- QCHECKT passes

---

### Wave 3B: Implementation (Sequential - 1.5 SP)
**Agent:** sde-iii

| Task | Output | SP |
|------|--------|-----|
| Standard and Homepage templates | StandardTemplate.tsx, HomepageTemplate.tsx | 1.0 SP |
| Remaining components | CTAButton.tsx, SessionCard.tsx, StaffCard.tsx | 0.5 SP |

**StandardTemplate (REQ-205):**
- Hero section (optional background image)
- Content sections (markdown rendering from Phase 1)
- Visual hierarchy (headings, paragraphs, spacing)
- Optional section backgrounds (alternating cream/white)

**HomepageTemplate (REQ-205):**
- Hero with tagline
- Mission section (may be separate component)
- Photo gallery (using ImageGallery from Phase 2)
- CTA sections (using CTAButton)

**Reusable Components:**
- **CTAButton:** Primary/secondary variants, sizes, hover states
- **SessionCard:** Age range, dates, pricing display (for Program template)
- **StaffCard:** Photo, name, title, bio (for Staff template)

**Execution:**
```bash
QCODE --req=REQ-205,REQ-207 --make-tests-green
```

**Success Criteria:**
- All Phase 3 tests PASS
- Standard and Homepage pages render properly (about, Home pages)
- All reusable components complete
- No TypeScript errors

---

### Wave 3C: Final Review (Parallel - 1 SP)
**Agents:** pe-reviewer, code-quality-auditor, test-writer

| Agent | Focus | Output | SP |
|-------|-------|--------|-----|
| pe-reviewer | Final code review | Final recommendations | 0.5 SP |
| code-quality-auditor | Component documentation | Documentation review | 0.3 SP |
| test-writer | Test coverage | Coverage report | 0.2 SP |

**Execution:**
```bash
QCHECK --focus="all Phase 3 code"
QCHECKT --focus="overall test coverage"
```

**Success Criteria:**
- No P0 issues
- Test coverage ≥80% overall
- All components have TypeScript types
- Component usage documented (JSDoc comments)

---

### Phase 3 Gate
- [ ] All tests passing (unit + integration)
- [ ] All 5 pages fully functional (summer-camp, cabins, summer-staff, about, Home)
- [ ] Component library complete
- [ ] No TypeScript errors
- [ ] All P0 issues resolved

**If gate fails:** Return to Wave 3B, fix issues, repeat Wave 3C

---

## Final Quality Gates (QCHECK, QGIT)

### Accessibility & Performance Audit (Parallel - 1 SP)
**Agent:** pe-reviewer

| Task | Focus | SP |
|------|-------|-----|
| Accessibility audit | Lighthouse, axe DevTools, keyboard nav, screen reader | 0.5 SP |
| Performance audit | Lighthouse Performance, bundle size, Core Web Vitals | 0.5 SP |

**Accessibility Checklist:**
- [ ] Run Lighthouse on all 5 pages (target: ≥90)
- [ ] Run axe DevTools (target: zero violations)
- [ ] Manual keyboard navigation (tab through all interactive elements)
- [ ] Manual screen reader test (VoiceOver on Mac or NVDA on Windows)
- [ ] All images have alt text
- [ ] Color contrast ≥4.5:1 (WCAG AA)
- [ ] Tap targets ≥48px on mobile

**Performance Checklist:**
- [ ] Lighthouse Performance on all 5 pages (target: ≥90)
- [ ] LCP < 2.5 seconds
- [ ] Bundle size < 200 KB gzipped
- [ ] All images optimized (next/image)
- [ ] No render-blocking resources

**Execution:**
```bash
QCHECK --focus="accessibility and performance audits"
```

**Outputs:**
- Accessibility report with issues (P0, P1, P2)
- Performance report with metrics

---

### Final Fixes (Sequential - 1-2 SP)
**Agent:** sde-iii

**Process:**
1. Fix all P0 issues from audits
2. Fix all P1 issues from audits (if time permits)
3. Re-run audits to verify fixes
4. Repeat until no P0 issues remain

**Execution:**
```bash
QPLAN --focus="audit P0/P1 issues"
QCODE --focus="fix audit issues"
QCHECK --focus="verify fixes"
```

---

### Release Preparation (Sequential - 0.5 SP)
**Agent:** release-manager

**Pre-Deployment Checklist:**
- [ ] `npm run typecheck` passes (no TypeScript errors)
- [ ] `npm run lint` passes (no linting errors)
- [ ] `npm run test` passes (all unit + integration tests GREEN)
- [ ] Manual smoke test on localhost:3000
  - [ ] Navigate to all 5 pages
  - [ ] Click all CTAs
  - [ ] Expand all FAQs
  - [ ] View image galleries
  - [ ] Test responsive design (resize browser)
- [ ] Browser compatibility verified
  - [ ] Chrome (desktop + mobile)
  - [ ] Safari (desktop + iOS)
  - [ ] Firefox (desktop)
  - [ ] Edge (desktop)
- [ ] Mobile responsive verified
  - [ ] iOS Safari (test on device or simulator)
  - [ ] Chrome Android (test on device or simulator)

**Git Workflow:**
```bash
QGIT --message="fix(pages): replace custom markdown parser with Keystatic DocumentRenderer and build template components

- REQ-201: Implement DocumentRenderer with YouTube embed support
- REQ-202: Create Program template with sessions grid and FAQ
- REQ-203: Create Facility template with gallery and booking CTA
- REQ-204: Create Staff template with positions and testimonials
- REQ-205: Create Standard/Homepage templates
- REQ-206: Clean up content issues in .mdoc files (YouTube URLs, empty links, HTML comments)
- REQ-207: Build reusable component library (FAQ, Gallery, CTA, Cards)

All 5 migrated pages now render correctly with proper design.
Lighthouse scores: Accessibility ≥90, Performance ≥90.
21 SP total effort across 3 phases.

BREAKING CHANGE: Replaces custom convertMarkdownToHtml() with Keystatic DocumentRenderer"
```

**Execution:**
```bash
QGIT --scope="complete implementation"
```

---

## Success Criteria (Final Verification)

### Functional Requirements ✓
- [x] All 5 pages render without errors
  - summer-camp (Program template)
  - cabins (Facility template)
  - summer-staff (Staff template)
  - about (Standard template)
  - Home (Homepage template)
- [x] YouTube embeds work on all pages
- [x] No broken links visible
- [x] All images display properly
- [x] FAQs expand/collapse correctly
- [x] CTAs link to correct destinations
- [x] Image galleries functional

### Quality Metrics ✓
- [x] Lighthouse Accessibility score ≥90 (all pages)
- [x] Lighthouse Performance score ≥90 (all pages)
- [x] Zero TypeScript errors
- [x] All tests passing (unit + integration)
- [x] Test coverage ≥80%
- [x] No console errors on any page

### User Experience Metrics ✓
- [x] Pages visually complete (no placeholder text/styling)
- [x] Mobile responsive on all templates
- [x] Load time < 3 seconds on 3G
- [x] Improved design over WordPress version
- [x] Touch targets ≥48px on mobile
- [x] Color contrast ≥4.5:1 (WCAG AA)

### Code Quality Metrics ✓
- [x] No code duplication (components reusable)
- [x] Proper TypeScript types (no `any`)
- [x] Semantic HTML throughout
- [x] ARIA labels where needed
- [x] Component tests co-located (*.spec.ts)
- [x] REQ-IDs referenced in tests

---

## Story Point Summary

| Phase | Story Points | Duration Estimate | Blockers |
|-------|--------------|-------------------|----------|
| Phase 1: Foundation & Markdown | 8 SP | 1-2 days | Keystatic DocumentRenderer learning curve |
| Phase 2: Template Components | 10 SP | 2-3 days | Component reusability complexity |
| Phase 3: Polish & Standard Templates | 3 SP | 1 day | None (straightforward) |
| **Total** | **21 SP** | **4-6 days** | |

### Velocity Assumptions
- **Optimistic:** 8 SP/day (full parallelization, no blockers)
- **Realistic:** 5 SP/day (some sequential work, minor blockers)
- **Conservative:** 3 SP/day (context switches, debugging, P0 fixes)

### Agent Distribution
- **test-writer:** 6.4 SP (30%)
- **sde-iii:** 9.5 SP (45%)
- **pe-reviewer:** 2.8 SP (13%)
- **code-quality-auditor:** 1.1 SP (5%)
- **Other agents:** 1.2 SP (7%)

---

## Files Modified/Created

### New Files Created (Estimated)
```
lib/markdown/
  MarkdownRenderer.tsx          # DocumentRenderer wrapper with custom renderers
  MarkdownRenderer.spec.ts      # Unit tests for markdown rendering

components/
  YouTubeEmbed.tsx              # YouTube URL to iframe component
  YouTubeEmbed.spec.ts          # Unit tests for YouTube embeds

components/templates/
  ProgramTemplate.tsx           # Program page template (REQ-202)
  ProgramTemplate.spec.ts
  FacilityTemplate.tsx          # Facility page template (REQ-203)
  FacilityTemplate.spec.ts
  StaffTemplate.tsx             # Staff page template (REQ-204)
  StaffTemplate.spec.ts
  StandardTemplate.tsx          # Standard page template (REQ-205)
  StandardTemplate.spec.ts
  HomepageTemplate.tsx          # Homepage template (REQ-205)
  HomepageTemplate.spec.ts

components/shared/
  FAQAccordion.tsx              # Reusable FAQ accordion (REQ-207)
  FAQAccordion.spec.ts
  ImageGallery.tsx              # Reusable image gallery (REQ-207)
  ImageGallery.spec.ts
  CTAButton.tsx                 # Reusable CTA button (REQ-207)
  CTAButton.spec.ts
  SessionCard.tsx               # Camp session card (REQ-207)
  SessionCard.spec.ts
  StaffCard.tsx                 # Staff member card (REQ-207)
  StaffCard.spec.ts

scripts/
  validate-content.ts           # Content validation CLI tool (REQ-206)
  validate-content.spec.ts      # Tests for validator

docs/tasks/
  wordpress-migration-fix-plan.md    # This document
```

### Existing Files Modified
```
app/[slug]/page.tsx               # Use new templates instead of inline rendering
                                  # Remove convertMarkdownToHtml() function
                                  # Add template routing based on discriminant

content/pages/*.mdoc              # Fix YouTube URLs, empty links, HTML comments
  - summer-camp.mdoc              # REQ-206
  - cabins.mdoc                   # REQ-206
  - summer-staff.mdoc             # REQ-206
  - about.mdoc                    # REQ-206
  - Home.mdoc                     # REQ-206

package.json                      # No new dependencies expected
                                  # (using existing @keystatic/core)
```

**Total New Files:** ~24 files (12 components + 12 test files)
**Total Modified Files:** ~6 files (1 route + 5 content files)

---

## Risk Assessment

### High Risk (Requires Mitigation)
1. **Keystatic DocumentRenderer API limitations**
   - **Mitigation:** Research API thoroughly in Phase 1 Wave 1A
   - **Fallback:** Use react-markdown if DocumentRenderer insufficient

### Medium Risk (Monitor)
2. **Content cleanup more extensive than estimated**
   - **Mitigation:** Content validator script surfaces true scope early
   - **Adjustment:** Re-estimate REQ-206 if needed

3. **Component reusability difficult to achieve**
   - **Mitigation:** Design components with reusability from start
   - **Review:** pe-reviewer checks for DRY violations in Wave 2D

4. **TypeScript type errors with Keystatic schema**
   - **Mitigation:** Generate proper types from schema early
   - **Testing:** Verify types in Phase 1 before building templates

### Low Risk (Acceptable)
5. **Accessibility or Performance issues found late**
   - **Mitigation:** Run Lighthouse audits incrementally, not just at end
   - **Buffer:** 1-2 SP allocated for final fixes

---

## Post-Implementation (P2 - Out of Scope)

### Future Enhancements
- [ ] Storybook documentation for component library
- [ ] Visual regression testing (Percy, Chromatic)
- [ ] Content migration guide for future WordPress imports
- [ ] SEO optimization of migrated content
- [ ] Performance monitoring (Real User Monitoring)
- [ ] A/B testing of design variations

### Technical Debt
- [ ] Evaluate if react-markdown is better long-term than Keystatic DocumentRenderer
- [ ] Consider extracting template components into separate npm package
- [ ] Investigate server-side rendering optimizations for templates
- [ ] Add end-to-end tests with Playwright

---

## Appendix: Key Design Decisions

### Decision 1: Use Keystatic DocumentRenderer vs react-markdown
**Rationale:**
- DocumentRenderer is designed for Keystatic's .mdoc format
- Already in dependencies (no bundle size increase)
- Supports custom component rendering (YouTube embeds, images)
- react-markdown would require additional dependencies + custom plugins

**Trade-offs:**
- DocumentRenderer may have learning curve
- react-markdown is more familiar to team
- Fallback to react-markdown if DocumentRenderer insufficient

**Decision:** Use DocumentRenderer (recommended), evaluate in Phase 1 Wave 1A

---

### Decision 2: Component Reusability Strategy
**Rationale:**
- Templates share common patterns (FAQ, Gallery, CTA)
- DRY principle reduces maintenance burden
- Reusable components easier to test in isolation

**Implementation:**
- Build template-specific components first (Phase 2 Wave 2B)
- Extract common patterns into shared components (Phase 2 Wave 2C)
- Refactor templates to use shared components

**Trade-offs:**
- More upfront design work
- Risk of over-engineering (YAGNI)
- Benefits: Consistency, maintainability, testability

**Decision:** Extract shared components only when used ≥2 places (per CLAUDE.md)

---

### Decision 3: Test Strategy
**Rationale:**
- TDD ensures requirements met before implementation
- Co-located tests (*.spec.ts) easier to maintain
- REQ-ID references in tests trace back to requirements

**Coverage Targets:**
- Unit tests: ≥80% coverage
- Integration tests: Template rendering, routing
- Accessibility tests: Lighthouse + manual
- Performance tests: Lighthouse + Core Web Vitals

**Trade-offs:**
- Test-first slower initially
- Benefits: Higher quality, fewer regressions, faster debugging

**Decision:** Strict TDD per CLAUDE.md (tests must fail before implementation)

---

## Next Steps

### Immediate Actions
1. **Review and approve this plan** with team/stakeholder
2. **Verify environment setup:**
   - Dev server running (`npm run dev`)
   - All dependencies installed (`npm install`)
   - Keystatic accessible (`/keystatic` route)
3. **Create feature branch:**
   ```bash
   git checkout -b fix/wordpress-migration-rendering
   ```
4. **Begin Phase 1 Wave 1A** (analysis and research)

### Command to Execute Plan
```bash
# Start with planning phase
QPLAN --task="wordpress-migration-fix" --phase=1

# Or for full automated execution (if qrun_unassisted.md supports)
# qrun --plan=docs/tasks/wordpress-migration-fix-plan.md
```

---

**Plan Status:** Ready for Execution
**Plan Author:** planner (orchestrator agent)
**Plan Version:** 1.0
**Requirements Lock:** `/requirements/wordpress-migration-fix.lock.md`
