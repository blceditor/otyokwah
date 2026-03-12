# QPLAN: UAT Full Implementation (All Phases)

**Date**: 2026-01-07
**Source**: `/requirements/design-review-uat-verification.md`
**Total Story Points**: 42 SP
**Execution Mode**: Autonomous with Parallel Agents

---

## Executive Summary

This plan implements ALL 22 requirements across 3 phases using parallel agent workstreams. Following TDD methodology with Chrome extension verification for every requirement.

| Phase | Requirements | Story Points | Parallel Workstreams |
|-------|-------------|--------------|---------------------|
| Phase 1 (P0) | 6 | 14 SP | 3 workstreams |
| Phase 2 (P1) | 11 | 23 SP | 4 workstreams |
| Phase 3 (P2) | 5 | 5 SP | 2 workstreams |

---

## Dependency Analysis

```
INDEPENDENT (can start immediately):
├── REQ-UAT-001: Admin Nav Strip (P0, 2 SP)
├── REQ-UAT-002: CTA Buttons (P1, 2 SP)
├── REQ-UAT-006: Work At Camp Section (P1, 2 SP)
├── REQ-UAT-010: YouTube Hero (P1, 3 SP)
├── REQ-UAT-012: Button Links (P1, 2 SP)
├── REQ-UAT-016: Component Deduplication (P1, 2 SP)
├── REQ-UAT-018: Icon Size Settings (P1, 1 SP)
├── REQ-UAT-019: Color Picker (P1, 2 SP)
├── REQ-UAT-020: CMS Navigation (P1, 2 SP)
├── REQ-UAT-021: Light/Dark Mode (P1, 2 SP)
├── REQ-UAT-004: Image Preload (P2, 1 SP)
└── REQ-UAT-014: Hero Height (P2, 1 SP)

DEPENDENCY CHAIN A: Media Browser
├── REQ-UAT-015: Media Browser (P0, 3 SP) ← START
│   ├── REQ-UAT-003: Gallery (P1, 2 SP)
│   └── REQ-UAT-005: Camp Session Card (P0, 3 SP)
│       ├── REQ-UAT-011: Session Cards Summer (P0, 1 SP)
│       └── REQ-UAT-022: Card Grid (P0, 2 SP)

DEPENDENCY CHAIN B: Container Options
├── REQ-UAT-017: Container Options (P0, 3 SP) ← START
│   ├── REQ-UAT-007: Wide Card (P1, 2 SP)
│   │   ├── REQ-UAT-008: Retreats (P2, 1 SP)
│   │   └── REQ-UAT-009: Rentals (P2, 1 SP)
│   └── REQ-UAT-013: Size Adjustments (P2, 2 SP)
```

---

## Phase 1: P0 Blockers (14 SP)

### Parallel Workstream Configuration

**Workstream 1A: Admin Nav Strip** (2 SP)
- Agent: `sde-iii` + `test-writer`
- No dependencies, can start immediately

**Workstream 1B: Media Browser Chain** (6 SP)
- Agent: `sde-iii` + `test-writer`
- Sequence: Media Browser → Camp Session Card → Card Grid + Session Cards

**Workstream 1C: Container Options** (3 SP)
- Agent: `sde-iii` + `test-writer`
- No dependencies, can start immediately

### Phase 1 Requirements Detail

#### REQ-UAT-001: Admin Nav Strip (2 SP)
**Files to Modify**:
- `components/admin/AdminNavStrip.tsx`
- `lib/keystatic/auth.ts`
- `app/layout.tsx`

**Failing Tests to Create First**:
```typescript
// tests/e2e/admin-nav.spec.ts
test('REQ-UAT-001: admin nav visible for authenticated users', async ({ page }) => {
  // Login via Keystatic OAuth
  await authenticateWithGitHub(page);
  await page.goto('/');
  await expect(page.locator('[data-testid="admin-nav-strip"]')).toBeVisible({ timeout: 3000 });
});

test('REQ-UAT-001: admin nav hidden for unauthenticated users', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-testid="admin-nav-strip"]')).not.toBeVisible();
});
```

**Chrome Verification**:
- Navigate to `/` as authenticated user → verify nav visible
- Navigate to `/` in incognito → verify nav hidden
- Screenshots: `REQ-UAT-001-auth.png`, `REQ-UAT-001-unauth.png`

---

#### REQ-UAT-015: Media Browser (3 SP)
**Files to Modify**:
- `components/keystatic/MediaPickerDialog.tsx`
- `components/keystatic/MediaUploader.tsx`
- `lib/keystatic/media.ts`

**Failing Tests to Create First**:
```typescript
// tests/e2e/keystatic/media-browser.spec.ts
test('REQ-UAT-015: media browser opens on image field click', async ({ page }) => {
  await page.goto('/keystatic/collection/pages/item/index');
  await page.click('[data-field-type="image"]');
  await expect(page.locator('[data-testid="media-browser-modal"]')).toBeVisible();
});

test('REQ-UAT-015: upload button visible in media browser', async ({ page }) => {
  // ... open media browser
  await expect(page.locator('button:has-text("Upload")')).toBeVisible();
});

test('REQ-UAT-015: images sorted newest first', async ({ page }) => {
  // ... verify sorting
});
```

---

#### REQ-UAT-005: Camp Session Card (3 SP)
**Depends on**: REQ-UAT-015 (Media Browser)

**Files to Modify**:
- `components/camp/CampSessionCard.tsx`
- `lib/keystatic/shared-components.ts`
- `components/markdoc/MarkdocComponents.tsx`

**Failing Tests**:
```typescript
// tests/e2e/camp-session-card.spec.ts
test('REQ-UAT-005: camp session cards visible on homepage', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-section="which-camp"]').scrollIntoViewIfNeeded();
  const cards = page.locator('[data-component="camp-session-card"]');
  await expect(cards).toHaveCount(4);
});

test('REQ-UAT-005: card has hover animation', async ({ page }) => {
  await page.goto('/');
  const card = page.locator('[data-component="camp-session-card"]').first();
  await card.hover();
  const transform = await card.evaluate(el => getComputedStyle(el).transform);
  expect(transform).not.toBe('none');
});
```

---

#### REQ-UAT-017: Container Options (3 SP)
**Files to Modify**:
- `lib/keystatic/shared-components.ts` (section schema)
- `components/sections/Section.tsx`

**Failing Tests**:
```typescript
// tests/e2e/keystatic/container-options.spec.ts
test('REQ-UAT-017: width dropdown has correct options', async ({ page }) => {
  await page.goto('/keystatic/collection/pages/item/index');
  // Add Section component
  await page.click('button:has-text("Add")');
  await page.click('text=Section');
  // Find width dropdown
  const widthSelect = page.locator('[data-field="width"]');
  await expect(widthSelect).toBeVisible();
});
```

---

#### REQ-UAT-011: Session Cards on Summer Camp (1 SP)
**Depends on**: REQ-UAT-005

#### REQ-UAT-022: Card Grid Container (2 SP)
**Depends on**: REQ-UAT-005

---

## Phase 2: P1 Features (23 SP)

### Parallel Workstream Configuration

**Workstream 2A: CMS Features** (7 SP)
- REQ-UAT-016: Component Deduplication (2 SP)
- REQ-UAT-018: Icon Size Settings (1 SP)
- REQ-UAT-019: Color Picker (2 SP)
- REQ-UAT-020: CMS Navigation (2 SP)

**Workstream 2B: Homepage Components** (6 SP)
- REQ-UAT-002: CTA Buttons (2 SP)
- REQ-UAT-006: Work At Camp Section (2 SP)
- REQ-UAT-003: Gallery (2 SP) - after Media Browser

**Workstream 2C: Summer Camp Features** (5 SP)
- REQ-UAT-010: YouTube Hero (3 SP)
- REQ-UAT-012: Button Links (2 SP)

**Workstream 2D: Theme + Wide Card** (5 SP)
- REQ-UAT-021: Light/Dark Mode (2 SP)
- REQ-UAT-007: Wide Card (2 SP) - after Container Options

---

## Phase 3: P2 Polish (5 SP)

### Parallel Workstream Configuration

**Workstream 3A: Visual Polish** (3 SP)
- REQ-UAT-004: Image Preload (1 SP)
- REQ-UAT-013: Size Adjustments (2 SP)

**Workstream 3B: Section Content** (2 SP)
- REQ-UAT-008: Retreats Section (1 SP)
- REQ-UAT-009: Rentals Section (1 SP)
- REQ-UAT-014: Hero Height (1 SP)

---

## Execution Plan

### Step 1: Create All Failing Tests First (QCODET)

Launch parallel test-writer agents:

```
Agent 1: P0 Tests (Admin Nav, Media Browser, Session Card, Container, Card Grid)
Agent 2: P1 CMS Tests (Dedup, Icon Size, Color Picker, Nav, Theme)
Agent 3: P1 Homepage Tests (CTA, Work Section, Gallery, Wide Card)
Agent 4: P1 Summer Camp Tests (YouTube Hero, Button Links)
Agent 5: P2 Tests (Image Preload, Size Adjustments, Retreats, Rentals, Hero Height)
```

### Step 2: Implement P0 Blockers (QCODE)

Launch 3 parallel implementation agents:

```
Agent P0-A: Admin Nav Strip (2 SP)
Agent P0-B: Media Browser → Camp Session Card → Card Grid (6 SP) [sequential]
Agent P0-C: Container Options (3 SP)
```

### Step 3: Review P0 (QCHECK)

PE-Reviewer validates all P0 implementations. Fix recursively 4x until clean.

### Step 4: Implement P1 Features (QCODE)

Launch 4 parallel implementation agents:

```
Agent P1-A: CMS Features (7 SP)
Agent P1-B: Homepage Components (6 SP)
Agent P1-C: Summer Camp Features (5 SP)
Agent P1-D: Theme + Wide Card (4 SP)
```

### Step 5: Review P1 (QCHECK)

PE-Reviewer validates all P1 implementations. Fix recursively 4x until clean.

### Step 6: Implement P2 Polish (QCODE)

Launch 2 parallel implementation agents:

```
Agent P2-A: Visual Polish (3 SP)
Agent P2-B: Section Content (2 SP)
```

### Step 7: Review P2 (QCHECK)

PE-Reviewer validates all P2 implementations. Fix recursively 4x until clean.

### Step 8: Comprehensive Validation (QVERIFY)

1. Run all local tests: `npm test`
2. Run lint: `npm run lint`
3. Run typecheck: `npm run typecheck`
4. Commit and push: `git add . && git commit && git push`
5. Wait 2 minutes for Vercel deployment
6. Run smoke tests: `./scripts/smoke-test.sh --force prelaunch.bearlakecamp.com`
7. Run Playwright production tests
8. Chrome extension verification for all 22 requirements
9. Capture screenshots for all requirements

### Step 9: Production Monitoring

Poll every 30s for 5 minutes:
- If failure detected → diagnose → auto-fix → re-deploy (max 3x)
- If success → generate final report

---

## Chrome Extension Verification Checklist

| REQ-ID | Description | Screenshot Path | Verified |
|--------|-------------|-----------------|----------|
| REQ-UAT-001 | Admin Nav Auth | `verification-screenshots/REQ-UAT-001-*.png` | [ ] |
| REQ-UAT-002 | CTA Buttons | `verification-screenshots/REQ-UAT-002-*.png` | [ ] |
| REQ-UAT-003 | Gallery | `verification-screenshots/REQ-UAT-003-*.png` | [ ] |
| REQ-UAT-004 | Image Preload | `verification-screenshots/REQ-UAT-004-*.png` | [ ] |
| REQ-UAT-005 | Session Card | `verification-screenshots/REQ-UAT-005-*.png` | [ ] |
| REQ-UAT-006 | Work At Camp | `verification-screenshots/REQ-UAT-006-*.png` | [ ] |
| REQ-UAT-007 | Wide Card | `verification-screenshots/REQ-UAT-007-*.png` | [ ] |
| REQ-UAT-008 | Retreats | `verification-screenshots/REQ-UAT-008-*.png` | [ ] |
| REQ-UAT-009 | Rentals | `verification-screenshots/REQ-UAT-009-*.png` | [ ] |
| REQ-UAT-010 | YouTube Hero | `verification-screenshots/REQ-UAT-010-*.png` | [ ] |
| REQ-UAT-011 | Session Cards Summer | `verification-screenshots/REQ-UAT-011-*.png` | [ ] |
| REQ-UAT-012 | Button Links | `verification-screenshots/REQ-UAT-012-*.png` | [ ] |
| REQ-UAT-013 | Size Adjustments | `verification-screenshots/REQ-UAT-013-*.png` | [ ] |
| REQ-UAT-014 | Hero Height | `verification-screenshots/REQ-UAT-014-*.png` | [ ] |
| REQ-UAT-015 | Media Browser | `verification-screenshots/REQ-UAT-015-*.png` | [ ] |
| REQ-UAT-016 | Component Dedup | `verification-screenshots/REQ-UAT-016-*.png` | [ ] |
| REQ-UAT-017 | Container Options | `verification-screenshots/REQ-UAT-017-*.png` | [ ] |
| REQ-UAT-018 | Icon Size | `verification-screenshots/REQ-UAT-018-*.png` | [ ] |
| REQ-UAT-019 | Color Picker | `verification-screenshots/REQ-UAT-019-*.png` | [ ] |
| REQ-UAT-020 | CMS Navigation | `verification-screenshots/REQ-UAT-020-*.png` | [ ] |
| REQ-UAT-021 | Light/Dark Mode | `verification-screenshots/REQ-UAT-021-*.png` | [ ] |
| REQ-UAT-022 | Card Grid | `verification-screenshots/REQ-UAT-022-*.png` | [ ] |

---

## Success Criteria

### Local Testing
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] All e2e tests pass
- [ ] Lint passes with 0 errors
- [ ] Typecheck passes with 0 errors
- [ ] Test coverage > 80%

### Production Validation
- [ ] smoke-test.sh: 33/33 pages return HTTP 200
- [ ] Playwright production tests: 22/22 requirements verified
- [ ] Chrome extension: 22/22 screenshots captured
- [ ] No console errors on any page

### Final Report Requirements
1. Playwright test results with pass/fail counts
2. Screenshot directory link
3. Smoke test results
4. Local test breakdown (unit/integration/e2e)
5. Test coverage percentage by level

---

## Blocker Escalation Protocol

1. Try 5 different solutions before declaring blocker
2. Assume we are the problem (not dependencies)
3. Convene exec-team (PE, PM, SDE-III, Strategic-Advisor) for debate
4. If consensus → apply solution
5. If no consensus or major design change → escalate to human

---

## Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-07 | Initial QPLAN with parallel agent workstreams |
