# Execution Plan: Keystatic CMS Enhancements (19 SP)

> **Created**: 2025-12-16
> **Status**: Code implemented, validation pending
> **Reference**: `/Users/travis/SparkryGDrive/dev/bearlakecamp/qrunfree.md`

---

## Current State Assessment

### ✅ Completed
- REQ-FUTURE-020: Dark Mode Toggle (3 SP) - Code complete
- REQ-FUTURE-013: Recent Pages Sort Option (2 SP) - Code complete
- REQ-FUTURE-017: Link Validator (3 SP) - Code complete
- REQ-FUTURE-019: Image Alt Text Suggestions (3 SP) - Code complete
- REQ-FUTURE-007: Media Library Manager (8 SP) - Code complete
- Typecheck passes
- Lint passes (0 errors)

### ❌ NOT Completed (qrunfree.md violations)
- Rule 3: No commit made
- Rule 3: No full test suite run
- Rule 4: No deployment monitoring
- Rule 6: No smoke-test.sh validation
- Rule 6: No Playwright production tests
- Rule 7: No comprehensive report generated
- Rule 6: Missing e2e tests for new features

---

## Files Created/Modified

### New Files (14)
```
components/keystatic/ThemeToggle.tsx
components/keystatic/ThemeProvider.tsx
components/keystatic/RecentPagesEnhancer.tsx
components/keystatic/LinkValidator.tsx
components/keystatic/ImageFieldEnhancer.tsx
components/keystatic/MediaLibrary.tsx
lib/keystatic/recentPagesTracker.ts
lib/keystatic/linkParser.ts
lib/keystatic/mediaScanner.ts
app/api/validate-links/route.ts
app/api/suggest-alt-text/route.ts
app/api/media/route.ts
app/keystatic/media/page.tsx
requirements/current.md (replaced)
```

### Modified Files (8)
```
package.json (added next-themes)
package-lock.json
tailwind.config.ts (darkMode, dark colors)
app/keystatic/layout.tsx (ThemeProvider, enhancers)
components/keystatic/KeystaticToolsHeader.tsx (ThemeToggle, Media link)
components/keystatic/PageEditingToolbar.tsx (LinkValidator)
components/keystatic/SEOGenerationPanel.tsx (dark mode)
components/keystatic/BugReportModal.tsx (dark mode)
components/keystatic/DeploymentStatus.tsx (dark mode)
```

---

## Remaining Tasks (qrunfree.md compliance)

### 1. Run Full Local Test Suite
```bash
npm run test          # Unit tests (vitest)
npm run typecheck     # Already passes
npm run lint          # Already passes
```

### 2. Create E2E Tests for New Features
Create tests in `tests/e2e/keystatic/`:
- `dark-mode.spec.ts` - Theme toggle, persistence
- `recent-pages.spec.ts` - Sort functionality
- `link-validator.spec.ts` - Validation modal
- `alt-text.spec.ts` - AI suggestion button (if testable)
- `media-library.spec.ts` - Grid, upload, delete

### 3. Commit All Changes
```bash
git add -A
git commit -m "feat(keystatic): add 5 CMS enhancements (19 SP)

- REQ-FUTURE-020: Dark mode toggle with system preference
- REQ-FUTURE-013: Recent pages sort option
- REQ-FUTURE-017: Link validator with modal
- REQ-FUTURE-019: AI-powered alt text suggestions
- REQ-FUTURE-007: Media library manager

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

### 4. Push and Monitor Deployment
```bash
git push
# Wait 2 minutes for Vercel
# Poll every 30s for 5 minutes
```

### 5. Run Production Validation
```bash
./scripts/smoke-test.sh --force prelaunch.bearlakecamp.com
npx playwright test tests/e2e/production/
npx playwright test tests/e2e/keystatic/
```

### 6. Fix Any Issues (up to 4 recursive cycles)
- If smoke-test fails → diagnose, fix, re-commit, re-deploy
- If Playwright fails → diagnose, fix, re-commit, re-deploy
- Max 4 cycles per qrunfree.md Rule 5

### 7. Generate Final Report (Rule 7)
Report must include:
- All requirements 100% complete confirmation
- Full test coverage breakdown (unit, integration, e2e)
- Playwright test results with screenshot links
- smoke-test.sh success report
- Test counts by type: executed vs passing

---

## Test Strategy for New Features

### Dark Mode (REQ-FUTURE-020)
```typescript
// tests/e2e/keystatic/dark-mode.spec.ts
test('toggle switches theme', async ({ page }) => {
  await page.goto('/keystatic');
  await page.click('[aria-label="Switch to dark mode"]');
  await expect(page.locator('html')).toHaveClass(/dark/);
});

test('preference persists', async ({ page }) => {
  await page.goto('/keystatic');
  await page.click('[aria-label="Switch to dark mode"]');
  await page.reload();
  await expect(page.locator('html')).toHaveClass(/dark/);
});
```

### Recent Pages (REQ-FUTURE-013)
```typescript
// tests/e2e/keystatic/recent-pages.spec.ts
test('recent sort button appears on collection page', async ({ page }) => {
  await page.goto('/keystatic/branch/main/collection/pages');
  await expect(page.locator('#recent-pages-sort-btn')).toBeVisible();
});
```

### Link Validator (REQ-FUTURE-017)
```typescript
// tests/e2e/keystatic/link-validator.spec.ts
test('validate links button appears in toolbar', async ({ page }) => {
  await page.goto('/keystatic/branch/main/collection/pages/item/index');
  await expect(page.locator('button:has-text("Validate Links")')).toBeVisible();
});
```

### Media Library (REQ-FUTURE-007)
```typescript
// tests/e2e/keystatic/media-library.spec.ts
test('media library page loads', async ({ page }) => {
  await page.goto('/keystatic/media');
  await expect(page.locator('h1:has-text("Media Library")')).toBeVisible();
});
```

---

## Execution Command Summary

```bash
# 1. Run local tests
npm run test
npm run typecheck
npm run lint

# 2. Commit
git add -A && git commit -m "feat(keystatic): add 5 CMS enhancements (19 SP)"

# 3. Push
git push

# 4. Wait and validate (after ~2min)
./scripts/smoke-test.sh --force prelaunch.bearlakecamp.com

# 5. Run Playwright
npx playwright test --reporter=html

# 6. Generate report
# Collect all results and format per Rule 7
```

---

## Notes for Session Continuation

This plan was created because the previous session:
1. Implemented all code successfully
2. Passed typecheck and lint
3. Did NOT commit, push, or validate
4. Ran out of context before completing qrunfree.md requirements

Resume from **Task 1: Run Full Local Test Suite** and proceed through all remaining tasks.
