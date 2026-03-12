# WordPress Migration Fix - Executive Summary

**Task:** Fix rendering and design issues in 5 migrated Keystatic pages
**Approach:** TDD with parallel agents
**Total Effort:** 21 SP (4-5 days realistic)
**Status:** Ready to Execute

---

## The Problem (Quick Diagnosis)

### 1. Broken Markdown Rendering (app/[slug]/page.tsx:213-245)
```typescript
// CURRENT: Custom parser causing issues
function convertMarkdownToHtml(markdown: string): string {
  // Creates excessive <br/> tags
  html = html.replace(/\n/g, '<br/>');  // ❌ Too aggressive

  // YouTube links stay as text
  https://youtu.be/8N9Yeup1xVA  // ❌ Not converted to embed

  // Broken links render with empty hrefs
  [Registration Opens Jan 1st]()  // ❌ Clickable but goes nowhere

  // HTML comments visible
  <!-- TBD: Partners page not migrated yet -->  // ❌ Shows to users
}
```

### 2. No Visual Design
- Pages = plain text on white background
- No proper component structure
- Template sections (program dates, facilities, staff positions) look unfinished

### 3. Content Issues (5 .mdoc files)
- YouTube URLs need embed conversion
- Empty markdown links: `[text]()`
- HTML comments visible in output

---

## The Solution (High-Level)

### Phase 1: Fix Markdown (8 SP, 1-2 days)
**Replace custom parser with proper library**

```typescript
// NEW: Use Keystatic DocumentRenderer
import { DocumentRenderer } from '@keystatic/core/renderer';

// Custom renderer for YouTube
<DocumentRenderer
  document={content}
  componentBlocks={{
    youtube: (props) => <YouTubeEmbed url={props.url} />
  }}
/>

// Result:
// ✅ YouTube URLs → responsive embeds
// ✅ Proper paragraph breaks (no excessive <br/>)
// ✅ Empty links stripped or rendered as text
// ✅ HTML comments removed
```

**Also:** Clean up all .mdoc files to fix content issues

---

### Phase 2: Build Templates (10 SP, 2-3 days)
**Create visual components for each page type**

1. **ProgramTemplate** (summer-camp page) - 3 SP
   - Hero with background image
   - Sessions grid (age/dates/pricing cards)
   - Registration CTA (large button)
   - FAQ accordion

2. **FacilityTemplate** (cabins page) - 3 SP
   - Hero section
   - Image gallery (from Keystatic galleryImages)
   - Features/amenities grid
   - Booking CTA with contact info

3. **StaffTemplate** (summer-staff page) - 3 SP
   - Hero with tagline
   - Staff positions grid (expandable cards)
   - Testimonials (quote cards with photos)
   - Application CTA (top + bottom)

4. **Reusable Components** - 1 SP
   - FAQAccordion (collapsible Q&A)
   - ImageGallery (responsive grid with lazy loading)

---

### Phase 3: Polish (3 SP, 1 day)
**Complete remaining templates + component library**

- StandardTemplate (about page)
- HomepageTemplate (Home page)
- CTAButton, SessionCard, StaffCard components

---

## Requirements at a Glance

| REQ-ID | Description | SP | Priority |
|--------|-------------|-----|----------|
| REQ-201 | Proper Markdown Rendering (DocumentRenderer + YouTube embeds) | 5 | P0 |
| REQ-202 | Program Template Component | 3 | P0 |
| REQ-203 | Facility Template Component | 3 | P0 |
| REQ-204 | Staff Template Component | 3 | P0 |
| REQ-205 | Standard/Homepage Template Component | 2 | P1 |
| REQ-206 | Content Cleanup (fix .mdoc files) | 2 | P1 |
| REQ-207 | Reusable Component Library (FAQ, Gallery, CTA, Cards) | 3 | P1 |
| **Total** | | **21 SP** | |

**Full Details:** `/requirements/wordpress-migration-fix.lock.md`

---

## TDD Workflow (Enforced)

```
┌─────────────────────────────────────────────────────────────┐
│  Phase 1: Foundation & Markdown (8 SP)                      │
│                                                              │
│  Wave 1A: Analysis (Parallel - 2 SP)                        │
│    - debug-planner: Root cause analysis                     │
│    - requirements-scribe: Refine requirements               │
│    - research-coordinator: DocumentRenderer API research    │
│                                                              │
│  Wave 1B: Test Writing (Parallel - 2.5 SP)                  │
│    - test-writer: Write failing tests (RED)                 │
│    - QCHECKT: Review test quality                           │
│    ⚠️  BLOCKER: Tests must FAIL before implementation       │
│                                                              │
│  Wave 1C: Implementation (Sequential - 3 SP)                │
│    - sde-iii: Make tests pass (GREEN)                       │
│    - Implement DocumentRenderer with YouTube support        │
│    - Fix content issues in .mdoc files                      │
│                                                              │
│  Wave 1D: Review (Parallel - 1 SP)                          │
│    - pe-reviewer: Implementation review                     │
│    - code-quality-auditor: Code quality check               │
│    - QCHECK/QCHECKF: Fix P0 issues before proceeding        │
│                                                              │
│  Phase 1 Gate: ✅ Markdown renders correctly                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Phase 2: Template Components (10 SP)                       │
│                                                              │
│  Wave 2A: Test Writing (Parallel - 3.5 SP)                  │
│    - test-writer: Program, Facility, Staff template tests   │
│    - QCHECKT: Review test quality                           │
│    ⚠️  BLOCKER: Tests must FAIL before implementation       │
│                                                              │
│  Wave 2B: Implementation (Parallel - 6 SP)                  │
│    - sde-iii: Implement 3 templates (can parallelize)       │
│    - Make tests pass (GREEN)                                │
│                                                              │
│  Wave 2C: Shared Components (Sequential - 1 SP)             │
│    - sde-iii: Extract FAQ, Gallery components               │
│                                                              │
│  Wave 2D: Review (Parallel - 1.5 SP)                        │
│    - pe-reviewer, code-quality-auditor, ux-tester           │
│    - QCHECK: Fix P0 issues before proceeding                │
│                                                              │
│  Phase 2 Gate: ✅ 3 specialized templates functional        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Phase 3: Polish & Standard Templates (3 SP)                │
│                                                              │
│  Wave 3A: Test Writing (0.5 SP)                             │
│  Wave 3B: Implementation (1.5 SP)                           │
│  Wave 3C: Review (1 SP)                                     │
│                                                              │
│  Phase 3 Gate: ✅ All 5 pages fully functional              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Final Quality Gates                                        │
│                                                              │
│  - Accessibility Audit (Lighthouse ≥90, axe DevTools)       │
│  - Performance Audit (Lighthouse ≥90, LCP <2.5s)            │
│  - Fix all P0 issues                                        │
│  - QGIT: Stage, commit, push                                │
└─────────────────────────────────────────────────────────────┘
```

---

## Agent Assignments (Parallel Execution)

### Phase 1: Foundation & Markdown
| Wave | Agents | Tasks | Duration |
|------|--------|-------|----------|
| 1A | debug-planner, requirements-scribe, research-coordinator | Analysis (parallel) | 0.5 day |
| 1B | test-writer, sde-iii | Test writing (parallel) | 0.5 day |
| 1C | sde-iii | Implementation (sequential) | 0.5-1 day |
| 1D | pe-reviewer, code-quality-auditor, test-writer | Review (parallel) | 0.5 day |

### Phase 2: Template Components
| Wave | Agents | Tasks | Duration |
|------|--------|-------|----------|
| 2A | test-writer | Test writing (parallel for 3 templates) | 0.5 day |
| 2B | sde-iii (×3 or sequential) | Implement 3 templates | 1-2 days |
| 2C | sde-iii | Extract shared components | 0.5 day |
| 2D | pe-reviewer, code-quality-auditor, ux-tester | Review (parallel) | 0.5 day |

### Phase 3: Polish
| Wave | Agents | Tasks | Duration |
|------|--------|-------|----------|
| 3A-3C | test-writer, sde-iii, pe-reviewer | Standard templates + final review | 1 day |

**Total Realistic Duration:** 4-5 days (with parallel work and some sequential dependencies)

---

## Success Metrics

### Must Have (P0)
- [ ] All 5 pages render without errors
- [ ] YouTube embeds work (no plain text URLs)
- [ ] No broken links visible (empty hrefs fixed)
- [ ] All images display properly
- [ ] Lighthouse Accessibility ≥90
- [ ] Lighthouse Performance ≥90
- [ ] Zero TypeScript errors
- [ ] All tests passing

### Should Have (P1)
- [ ] Pages visually appealing (better than WordPress)
- [ ] Mobile responsive on all templates
- [ ] FAQs expand/collapse smoothly
- [ ] Image galleries functional
- [ ] Component library reusable (DRY)
- [ ] Test coverage ≥80%

---

## Files Affected

### Modified
- `app/[slug]/page.tsx` - Replace custom parser with templates
- `content/pages/*.mdoc` (5 files) - Fix YouTube URLs, links, HTML comments

### Created (~24 files)
**Markdown Rendering:**
- `lib/markdown/MarkdownRenderer.tsx` + `.spec.ts`
- `components/YouTubeEmbed.tsx` + `.spec.ts`

**Templates:**
- `components/templates/ProgramTemplate.tsx` + `.spec.ts`
- `components/templates/FacilityTemplate.tsx` + `.spec.ts`
- `components/templates/StaffTemplate.tsx` + `.spec.ts`
- `components/templates/StandardTemplate.tsx` + `.spec.ts`
- `components/templates/HomepageTemplate.tsx` + `.spec.ts`

**Shared Components:**
- `components/shared/FAQAccordion.tsx` + `.spec.ts`
- `components/shared/ImageGallery.tsx` + `.spec.ts`
- `components/shared/CTAButton.tsx` + `.spec.ts`
- `components/shared/SessionCard.tsx` + `.spec.ts`
- `components/shared/StaffCard.tsx` + `.spec.ts`

**Tools:**
- `scripts/validate-content.ts` + `.spec.ts`

---

## Pre-Deployment Checklist

```bash
# Quality gates (MUST pass before QGIT)
npm run typecheck  # Zero errors
npm run lint       # Zero errors
npm run test       # All tests pass

# Manual verification
# - Visit all 5 pages on localhost:3000
# - Click all CTAs
# - Expand all FAQs
# - View image galleries
# - Resize browser (responsive design)
# - Test on Chrome, Safari, Firefox, Edge
# - Test on iOS Safari, Chrome Android

# Git workflow (Conventional Commits)
git add .
git commit -m "fix(pages): replace custom markdown parser with Keystatic DocumentRenderer

- REQ-201: Implement DocumentRenderer with YouTube embeds
- REQ-202-205: Build Program, Facility, Staff, Standard, Homepage templates
- REQ-206: Clean up content issues in .mdoc files
- REQ-207: Create reusable component library

All 5 migrated pages render correctly with proper design.
Lighthouse scores: Accessibility ≥90, Performance ≥90.

BREAKING CHANGE: Replaces custom convertMarkdownToHtml() with DocumentRenderer"
```

---

## Quick Reference

**Full Plan:** `/docs/tasks/wordpress-migration-fix-plan.md`
**Requirements Lock:** `/requirements/wordpress-migration-fix.lock.md`
**CLAUDE.md Guidelines:** `/CLAUDE.md` (TDD flow, QShortcuts)

**Start Execution:**
```bash
# Create feature branch
git checkout -b fix/wordpress-migration-rendering

# Begin Phase 1
QPLAN --task="wordpress-migration-fix" --phase=1
```

**Estimated Completion:** 4-5 days (realistic with parallel agents)
