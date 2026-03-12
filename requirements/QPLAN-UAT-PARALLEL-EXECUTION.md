# QPLAN: UAT Parallel Execution Plan

**Date**: 2026-01-07
**Source**: `/requirements/design-review-uat-verification.md`
**Total**: 22 Requirements | 42 SP | 3 Phases

---

## Context Management Strategy

**CRITICAL**: Each agent runs with SEPARATE context to prevent overflow.

### Rules for Context Management
1. **Max 3 SP per agent** - Smaller chunks = less context
2. **Fresh context per agent** - No agent resumption, all start fresh
3. **Clear handoffs** - Each agent outputs: commit SHA, screenshot path, test file
4. **Model selection**: Use `haiku` for verification-only tasks, `sonnet` for implementation
5. **Parallel where possible** - Independent requirements run simultaneously

### Agent Output Contract
Each agent MUST output:
```
DONE: REQ-UAT-XXX
COMMIT: <sha>
TESTS: <test-file-path>
SCREENSHOT: <verification-screenshots/REQ-UAT-XXX.png>
STATUS: PASS | FAIL | BLOCKED
```

---

## Phase 1: P0 Blockers (11 SP)

### Batch 1A: Admin Nav Strip (2 SP)
**Agent**: `sde-iii` | **Model**: `sonnet`
**Requirements**: REQ-UAT-001
**Dependencies**: None
**Run**: PARALLEL with 1B, 1C

```
PROMPT: Implement REQ-UAT-001 Admin Nav Strip Visibility from /requirements/design-review-uat-verification.md

TDD Steps:
1. Write failing test: tests/e2e/admin-nav-strip.spec.ts
2. Fix /api/auth/check endpoint if needed
3. Fix cookie handling for keystatic-gh-access-token
4. Add z-index fix if needed
5. Verify via Chrome extension MCP
6. Commit with: "fix(admin-nav): REQ-UAT-001 admin nav strip visibility"

Output: commit SHA, test file, screenshot
```

### Batch 1B: Media Browser (3 SP)
**Agent**: `sde-iii` | **Model**: `sonnet`
**Requirements**: REQ-UAT-015
**Dependencies**: None
**Run**: PARALLEL with 1A, 1C

```
PROMPT: Implement REQ-UAT-015 Media Browser with Upload from /requirements/design-review-uat-verification.md

TDD Steps:
1. Write failing test: tests/e2e/media-browser.spec.ts
2. Fix MediaPickerDialog.tsx if modal not opening
3. Fix MediaUploader.tsx for drag-drop upload
4. Verify sorting is newest-first
5. Verify via Chrome extension MCP in CMS
6. Commit with: "feat(cms): REQ-UAT-015 media browser with upload"

Output: commit SHA, test file, screenshot
```

### Batch 1C: Container Options (3 SP)
**Agent**: `sde-iii` | **Model**: `sonnet`
**Requirements**: REQ-UAT-017
**Dependencies**: None
**Run**: PARALLEL with 1A, 1B

```
PROMPT: Implement REQ-UAT-017 Container Width/Height/Background Options from /requirements/design-review-uat-verification.md

TDD Steps:
1. Write failing test: tests/e2e/container-options.spec.ts
2. Add width dropdown to Section component schema
3. Add height dropdown to schema
4. Add background color picker with presets
5. Verify via Chrome extension MCP in CMS
6. Commit with: "feat(cms): REQ-UAT-017 container width height background"

Output: commit SHA, test file, screenshot
```

### Batch 1D: Camp Session Card (3 SP)
**Agent**: `sde-iii` | **Model**: `sonnet`
**Requirements**: REQ-UAT-005
**Dependencies**: REQ-UAT-015 (Media Browser) must complete first
**Run**: SEQUENTIAL after Batch 1B

```
PROMPT: Implement REQ-UAT-005 Camp Session Card Component from /requirements/design-review-uat-verification.md

TDD Steps:
1. Write failing test: tests/e2e/camp-session-card.spec.ts
2. Verify CampSessionCard.tsx renders correctly
3. Add hover animation (scale 1.02)
4. Add bullet type selector in CMS
5. Verify image uses Media Browser
6. Verify via Chrome extension MCP on homepage AND in CMS
7. Commit with: "feat(components): REQ-UAT-005 camp session card"

Output: commit SHA, test file, screenshot
```

---

## Phase 2: P1 Features (15 SP)

### Batch 2A: Independent Features (6 SP)
**Agent**: `sde-iii` | **Model**: `sonnet`
**Requirements**: REQ-UAT-002 (CTA), REQ-UAT-006 (Work At Camp), REQ-UAT-012 (Button Links)
**Dependencies**: None
**Run**: PARALLEL with 2B, 2C

```
PROMPT: Implement 3 independent P1 features from /requirements/design-review-uat-verification.md:
- REQ-UAT-002: CTA Buttons CMS Editability (2 SP)
- REQ-UAT-006: Work At Camp Section (2 SP)
- REQ-UAT-012: Prepare For Camp Button Links (2 SP)

TDD Steps:
1. Write failing tests for each in tests/e2e/
2. Implement each feature
3. Verify each via Chrome extension
4. Single commit: "feat(homepage): REQ-UAT-002,006,012 CTA buttons work section button links"

Output: commit SHA, test files, screenshots
```

### Batch 2B: YouTube Hero (3 SP)
**Agent**: `sde-iii` | **Model**: `sonnet`
**Requirements**: REQ-UAT-010
**Dependencies**: None
**Run**: PARALLEL with 2A, 2C

```
PROMPT: Implement REQ-UAT-010 YouTube Hero Video from /requirements/design-review-uat-verification.md

TDD Steps:
1. Write failing test: tests/e2e/youtube-hero.spec.ts
2. Verify HeroYouTube.tsx autoplay muted
3. Test fallback when YouTube blocked
4. Verify heroYouTubeId field in CMS schema
5. Verify via Chrome extension on /summer-camp
6. Commit with: "feat(hero): REQ-UAT-010 youtube hero with fallback"

Output: commit SHA, test file, screenshot
```

### Batch 2C: Light/Dark Mode (2 SP)
**Agent**: `sde-iii` | **Model**: `sonnet`
**Requirements**: REQ-UAT-021
**Dependencies**: None
**Run**: PARALLEL with 2A, 2B

```
PROMPT: Implement REQ-UAT-021 Light/Dark Mode Fix from /requirements/design-review-uat-verification.md

TDD Steps:
1. Write failing test: tests/e2e/keystatic-theme.spec.ts (update existing)
2. Fix ThemeProvider.tsx for popup theme sync
3. Fix any hardcoded dark colors in CMS
4. Test persistence across navigation
5. Verify via Chrome extension in CMS light mode
6. Commit with: "fix(cms): REQ-UAT-021 light dark mode consistency"

Output: commit SHA, test file, screenshot
```

### Batch 2D: Gallery + Dependent Features (4 SP)
**Agent**: `sde-iii` | **Model**: `sonnet`
**Requirements**: REQ-UAT-003 (Gallery), REQ-UAT-007 (Wide Card)
**Dependencies**: REQ-UAT-015 (Media Browser), REQ-UAT-017 (Container Options)
**Run**: SEQUENTIAL after Phase 1 complete

```
PROMPT: Implement 2 dependent P1 features from /requirements/design-review-uat-verification.md:
- REQ-UAT-003: Gallery Component (2 SP) - needs Media Browser
- REQ-UAT-007: Wide Card Component (2 SP) - needs Container Options

TDD Steps:
1. Write failing tests for each
2. Implement Gallery with Media Browser integration
3. Implement Wide Card with width/background options
4. Verify via Chrome extension
5. Commit with: "feat(components): REQ-UAT-003,007 gallery wide card"

Output: commit SHA, test files, screenshots
```

---

## Phase 3: P2 Polish (5 SP)

### Batch 3A: Image Preload (1 SP)
**Agent**: `sde-iii` | **Model**: `haiku`
**Requirements**: REQ-UAT-004
**Dependencies**: None
**Run**: PARALLEL with 3B

```
PROMPT: Implement REQ-UAT-004 Mission Image Preloading from /requirements/design-review-uat-verification.md

TDD Steps:
1. Add priority prop to mission section Image
2. Verify loading attribute is eager
3. Simple verification via Chrome extension
4. Commit with: "perf(homepage): REQ-UAT-004 mission image preload"

Output: commit SHA, screenshot
```

### Batch 3B: Retreats + Rentals Sections (2 SP)
**Agent**: `sde-iii` | **Model**: `haiku`
**Requirements**: REQ-UAT-008, REQ-UAT-009
**Dependencies**: REQ-UAT-007 (Wide Card)
**Run**: SEQUENTIAL after Batch 2D

```
PROMPT: Implement REQ-UAT-008 and REQ-UAT-009 from /requirements/design-review-uat-verification.md:
- REQ-UAT-008: Retreats Section (1 SP)
- REQ-UAT-009: Rentals Section (1 SP)

TDD Steps:
1. Verify both use Wide Card component
2. Verify different background colors
3. Verify links work
4. Chrome extension verification
5. Commit with: "feat(homepage): REQ-UAT-008,009 retreats rentals sections"

Output: commit SHA, screenshots
```

### Batch 3C: Size Adjustments (2 SP)
**Agent**: `sde-iii` | **Model**: `haiku`
**Requirements**: REQ-UAT-013
**Dependencies**: REQ-UAT-017 (Container Options)
**Run**: SEQUENTIAL after Phase 1 complete

```
PROMPT: Implement REQ-UAT-013 Card and Icon Size Adjustments from /requirements/design-review-uat-verification.md

TDD Steps:
1. Adjust Worthy section to 75% width
2. Adjust Prepare For Camp cards to 60% width
3. Set icon size to XL (48px)
4. Chrome extension verification
5. Commit with: "style(summer-camp): REQ-UAT-013 size adjustments"

Output: commit SHA, screenshots
```

---

## Execution Order

```
TIME ─────────────────────────────────────────────────────────>

PHASE 1 (P0 Blockers):
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ Batch 1A    │  │ Batch 1B    │  │ Batch 1C    │   PARALLEL
│ Admin Nav   │  │ Media       │  │ Container   │
│ (2 SP)      │  │ Browser     │  │ Options     │
└─────────────┘  │ (3 SP)      │  │ (3 SP)      │
                 └──────┬──────┘  └─────────────┘
                        │
                        ▼
                 ┌─────────────┐
                 │ Batch 1D    │   SEQUENTIAL
                 │ Session     │   (depends on 1B)
                 │ Card (3 SP) │
                 └─────────────┘

PHASE 2 (P1 Features):
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ Batch 2A    │  │ Batch 2B    │  │ Batch 2C    │   PARALLEL
│ CTA+Work+   │  │ YouTube     │  │ Light/Dark  │
│ Btns (6 SP) │  │ Hero (3 SP) │  │ Mode (2 SP) │
└─────────────┘  └─────────────┘  └─────────────┘
                        │
                        ▼  (after Phase 1)
                 ┌─────────────┐
                 │ Batch 2D    │   SEQUENTIAL
                 │ Gallery +   │   (depends on 1B, 1C)
                 │ Wide (4 SP) │
                 └─────────────┘

PHASE 3 (P2 Polish):
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ Batch 3A    │  │ Batch 3B    │  │ Batch 3C    │   MIXED
│ Preload     │  │ Retreats+   │  │ Sizes       │
│ (1 SP)      │  │ Rentals     │  │ (2 SP)      │
│ PARALLEL    │  │ (2 SP)      │  │ after 1C    │
└─────────────┘  │ after 2D    │  └─────────────┘
                 └─────────────┘
```

---

## Verification Batch (Final)

### Batch V1: Full Validation
**Agent**: `validation-specialist` | **Model**: `sonnet`
**Run**: AFTER all implementation batches

```
PROMPT: Run comprehensive validation for all REQ-UAT-* requirements:

1. Run smoke-test.sh --force prelaunch.bearlakecamp.com
2. Run all Playwright tests: npx playwright test tests/e2e/
3. Verify all screenshots in verification-screenshots/
4. Compile final report with:
   - All test results (unit, integration, e2e)
   - Screenshot evidence for each REQ-UAT
   - Any remaining issues

Output: Full validation report
```

---

## Summary

| Phase | Batches | Parallel | Sequential | Total SP |
|-------|---------|----------|------------|----------|
| 1     | 4       | 3        | 1          | 11       |
| 2     | 4       | 3        | 1          | 15       |
| 3     | 3       | 1        | 2          | 5        |
| V     | 1       | -        | 1          | -        |
| **Total** | **12** | **7** | **5** | **31** |

**Estimated Parallel Execution Time**:
- Phase 1: 2 parallel rounds (1A+1B+1C, then 1D)
- Phase 2: 2 parallel rounds (2A+2B+2C, then 2D)
- Phase 3: 2 parallel rounds (3A+3C, then 3B)
- Verification: 1 round

**Total Rounds**: 7 (vs 12 sequential)
