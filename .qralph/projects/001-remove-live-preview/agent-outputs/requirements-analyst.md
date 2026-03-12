# Requirements Analyst Review

## Summary
Project 001-remove-live-preview involves three distinct removal tasks: (1) completely removing the Live Preview feature from Keystatic CMS editor, (2) reverting homepage hero from static image back to video, and (3) removing all smoke testing infrastructure. Total estimated effort: 7 SP across three independent tasks.

## Task 1: Remove Live Preview
- **Acceptance Criteria**:
  - [ ] All preview panel components deleted from `components/keystatic/preview/` (16 files identified)
  - [ ] Preview routes removed: `app/keystatic/preview/page.tsx`, `app/keystatic/preview/layout.tsx`
  - [ ] Preview-related types deleted from `lib/types/preview.ts`
  - [ ] Preview analytics tracking removed from `lib/analytics/preview-events.ts`
  - [ ] Preview extraction utilities removed from `lib/keystatic/template-extractors.ts`
  - [ ] Spike/POC files deleted: `spike/preview-poc.tsx`, `spike/preview-poc.spec.tsx`
  - [ ] Preview requirements documents voided: `requirements/REQ-PREVIEW-UX.md`, `requirements/REQ-PREVIEW-PANEL.md`, `requirements/REQ-PREVIEW-PANEL-TECH.md`, `requirements/QPLAN-LIVE-PREVIEW-SYNTHESIZED.md`, `requirements/LIVE-PREVIEW-ARCHITECTURE.md`
  - [ ] All tests referencing preview components removed or updated
  - [ ] No console errors in Keystatic editor after removal
  - [ ] Keystatic editor still functions for normal content editing
  - [ ] TypeScript compilation successful (`npm run typecheck`)
  - [ ] All existing tests pass (`npm run test`)

- **Story Points**: 3 SP
- **Files affected**: 37+ files (16 components, 2 routes, 5 requirements docs, 3 lib files, 2 spike files, 9+ test files)

## Task 2: Revert Homepage Hero to Video
- **Acceptance Criteria**:
  - [ ] `content/pages/index.mdoc` frontmatter changed from `heroImage: /images/summer-program-and-general/Top-promo-7-scaled-e1731002368158.jpg` to `heroVideo: /videos/hero-camp.mp4`
  - [ ] Optional: Add `heroImage` as poster fallback (recommended: `/uploads/heroes/program-page-test/heroImage.jpg`)
  - [ ] Homepage renders HeroVideo component on production
  - [ ] Video autoplay works on desktop
  - [ ] Video has accessible poster image for browsers blocking autoplay
  - [ ] Smoke test validation passes: homepage includes `id="hero-video"` element
  - [ ] Visual regression test confirms video rendering
  - [ ] No layout shift during video load

- **Story Points**: 1 SP
- **Original state**: Based on `lib/config/homepage.ts` and `app/page.tsx` logic, the original homepage used `heroVideo` field with values:
  - `mp4: '/videos/hero-camp.mp4'`
  - `webm: '/videos/hero-camp.webm'` (optional)
  - `poster: '/uploads/heroes/program-page-test/heroImage.jpg'` (fallback)

**Current state**: `content/pages/index.mdoc` line 3 shows `heroImage: /images/summer-program-and-general/Top-promo-7-scaled-e1731002368158.jpg`

## Task 3: Remove Smoke Tests
- **Acceptance Criteria**:
  - [ ] Delete `scripts/smoke-test.sh` (1,375 lines)
  - [ ] Delete `scripts/smoke-test.spec.sh` (test for smoke-test.sh)
  - [ ] Delete `scripts/test-agent-3.sh` (smoke test helper)
  - [ ] Delete `scripts/post-commit-validate.sh` (uses smoke-test.sh)
  - [ ] Delete `.cache/smoke/` directory (build caching)
  - [ ] Delete `logs/smoke/` directory (test logs)
  - [ ] Remove smoke test requirements: `requirements/implemented/smoke-test-system.lock.md`, `docs/technical/SMOKE-TEST-SYSTEM-DESIGN.md`, `docs/operations/SMOKE-TEST-USAGE.md`, `docs/tasks/smoke-test-*.md` files
  - [ ] Remove smoke test Playwright specs: `tests/e2e/smoke/*.spec.ts`, `tests/integration/keystatic-admin-smoke.spec.ts`
  - [ ] Remove smoke test configuration from `config/site.sh` (if exists)
  - [ ] Update CLAUDE.md to remove ALL smoke test references (8 occurrences found)
  - [ ] Update `.claude/agents/validation-specialist.md` to remove smoke-test.sh references
  - [ ] Remove smoke test execution from QVERIFY workflow in CLAUDE.md
  - [ ] Remove "Production Verification (MANDATORY)" rule mentioning smoke-test.sh
  - [ ] Remove "Edge Function Tests (smoke tests mandatory)" section
  - [ ] Remove smoke test from pre-deployment gates section
  - [ ] Remove postCommitHooks production validation configuration from `.claude/settings.json` (if exists)
  - [ ] TypeScript compilation successful after removal
  - [ ] CI/CD pipeline does not break (verify deployment still works without smoke tests)

- **Story Points**: 3 SP
- **CLAUDE.md sections to update**:
  - Line 11: "GLOBAL RULE - Production Verification (MANDATORY)" - **DELETE entire section**
  - Line 110: "Production smoke tests (HTTP 200 checks)" - **DELETE from QVERIFY checklist**
  - Line 126: "Run smoke tests + Playwright on production" - **DELETE from autonomous workflow**
  - Line 167-177: "Edge Function Tests (smoke tests mandatory)" - **DELETE entire section**
  - Line 191: QVERIFY description mentions smoke-test.sh - **UPDATE to remove smoke test reference**
  - Line 275: Pre-deployment gates mention smoke test - **DELETE smoke test requirement**
  - Line 327: Example command `smoke-test.sh` - **DELETE example**
  - Section 6.6: "Post-Commit Production Validation" - **DELETE entire section** (lines ~300-350)

## Total Estimate
7 SP total (3 + 1 + 3)

## Recommendations

1. **Execute tasks in sequence**: Task 2 (homepage revert) first (1 SP, lowest risk), then Task 3 (smoke tests, 3 SP, medium risk), then Task 1 (live preview, 3 SP, highest complexity due to component interdependencies).

2. **Verify before deletion**: For Task 1, run `grep -r "preview" --include="*.tsx" --include="*.ts"` after deletion to catch any orphaned imports or references.

3. **Backup consideration**: Live Preview feature represents ~13 SP of implementation work (per REQ-PREVIEW-PANEL.md Phase estimates). Consider creating a feature branch backup before deletion in case future reversion is needed.

4. **CLAUDE.md cleanup critical**: Smoke test removal requires surgical updates to CLAUDE.md workflow documentation. The "Production Verification (MANDATORY)" rule is deeply embedded in autonomous workflow - removal changes core development process.

5. **CI/CD impact assessment**: Smoke tests are mentioned in deployment validation workflows. Verify that Vercel deployments, GitHub Actions, and any other CI systems do not depend on smoke-test.sh exit codes before removal.

6. **Documentation debt**: After removal, create a lightweight alternative to smoke tests (e.g., manual production checklist or simplified curl-based health check) if production validation is still needed.

7. **Test coverage gap**: Removing smoke tests eliminates HTTP 200 validation for all pages. Consider adding basic Playwright production tests for critical paths (homepage, registration links) before removal.

8. **Batch size compliance**: Each task is under 5 SP limit (REQ-PROC-009). Task 1 has 0 visual requirements, Task 2 has 1 visual requirement (video rendering), Task 3 has 0 visual requirements - all within batch limits.

9. **Edge case**: If heroVideo files (`/videos/hero-camp.mp4`, `/videos/hero-camp.webm`) are missing from `public/videos/`, Task 2 will fail in production. Verify video file existence before deploying content change.

10. **Dependency check**: Smoke test removal impacts `.claude/agents/validation-specialist.md` and potentially `.claude/settings.json`. Verify no other agents or skills reference smoke-test.sh before deletion.
