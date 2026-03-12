# Test Plan: UAT P0 Requirements

> **Story Points**: Test development 1.5 SP

## Test Coverage Matrix

| REQ-ID | Unit Tests | Integration Tests | E2E Tests | Status |
|--------|------------|-------------------|-----------|--------|
| REQ-UAT-001 | N/A | N/A | 13 tests | Mixed (Failing) |
| REQ-UAT-015 | N/A | N/A | 11 tests | Mixed (Failing) |
| REQ-UAT-005 | N/A | N/A | 17 tests | Mixed (Failing) |
| REQ-UAT-017 | N/A | N/A | 17 tests | Mixed (Failing) |
| REQ-UAT-011 | N/A | N/A | 3 tests | Passing |
| REQ-UAT-022 | N/A | N/A | 17 tests | Mixed (Failing) |

**Total Tests**: 78 tests (15 failing, 63 passing as of initial run)

---

## E2E Tests (1.5 SP)

### REQ-UAT-001: Admin Nav Strip (2 SP)

**File**: `/Users/travis/SparkryDrive/dev/bearlakecamp/tests/e2e/uat/p0-admin-nav.spec.ts`

**Tests**:
- `REQ-UAT-001-01` - admin nav is hidden for unauthenticated users on homepage
- `REQ-UAT-001-02` - admin nav is hidden for unauthenticated users on all pages
- `REQ-UAT-001-03` - admin nav appears within 3 seconds for authenticated user
- `REQ-UAT-001-04` - admin nav persists across page navigation
- `REQ-UAT-001-05` - CMS link exists and points to /keystatic
- `REQ-UAT-001-06` - Edit Page link exists and uses correct format
- `REQ-UAT-001-07` - Report Bug link exists and opens GitHub issues
- `REQ-UAT-001-08` - Deployment Status indicator is visible
- `REQ-UAT-001-09` - admin strip has black background
- `REQ-UAT-001-10` - admin strip is fixed at top of viewport
- `REQ-UAT-001-11` - cannot spoof admin access via query params
- `REQ-UAT-001-12` - cannot spoof admin access via localStorage
- `REQ-UAT-001-13` - capture admin nav strip screenshot on failure

---

### REQ-UAT-015: Media Browser (3 SP)

**File**: `/Users/travis/SparkryDrive/dev/bearlakecamp/tests/e2e/uat/p0-media-browser.spec.ts`

**Tests**:
- `REQ-UAT-015-01` - media browser modal opens when clicking image field (FAILING)
- `REQ-UAT-015-02` - media browser shows upload button
- `REQ-UAT-015-03` - media browser modal has close functionality
- `REQ-UAT-015-04` - images are sorted newest first by default
- `REQ-UAT-015-05` - sort control allows changing sort order (FAILING)
- `REQ-UAT-015-06` - file size limit of 5MB is enforced
- `REQ-UAT-015-07` - oversized file upload shows error message (FAILING)
- `REQ-UAT-015-08` - search functionality exists in media browser
- `REQ-UAT-015-09` - filter by type (Images/Videos) exists
- `REQ-UAT-015-10` - image preview shows on hover or click
- `REQ-UAT-015-11` - capture media browser screenshot

---

### REQ-UAT-005: Camp Session Card (3 SP)

**File**: `/Users/travis/SparkryDrive/dev/bearlakecamp/tests/e2e/uat/p0-session-card.spec.ts`

**Tests**:
- `REQ-UAT-005-01` - at least 4 session cards visible in Which Camp section (FAILING)
- `REQ-UAT-005-02` - session card has required image element (FAILING)
- `REQ-UAT-005-03` - session card has heading element
- `REQ-UAT-005-04` - session card has subheading element
- `REQ-UAT-005-05` - session card has bullet list
- `REQ-UAT-005-06` - session card has CTA button
- `REQ-UAT-005-07` - card heading is left-aligned (FAILING)
- `REQ-UAT-005-08` - bullet list is left-aligned (FAILING)
- `REQ-UAT-005-09` - card has hover scale transform
- `REQ-UAT-005-10` - card has hover shadow enhancement
- `REQ-UAT-005-11` - card has cream/white background
- `REQ-UAT-005-12` - card has rounded corners
- `REQ-UAT-005-13` - CTA button has emerald green color
- `REQ-UAT-005-14` - session cards are editable in CMS (FAILING)
- `REQ-UAT-005-15` - CMS allows editing card image (FAILING)
- `REQ-UAT-005-16` - CMS allows editing card bullets (FAILING)
- `REQ-UAT-005-17` - capture session cards screenshot

---

### REQ-UAT-011: Session Cards on Summer Camp (1 SP)

**File**: `/Users/travis/SparkryDrive/dev/bearlakecamp/tests/e2e/uat/p0-session-card.spec.ts` (included in same file)

**Tests**:
- `REQ-UAT-011-01` - same card component used on /summer-camp page
- `REQ-UAT-011-02` - summer camp session cards have same structure as homepage
- `REQ-UAT-011-03` - capture summer camp session cards screenshot

---

### REQ-UAT-017: Container Options (3 SP)

**File**: `/Users/travis/SparkryDrive/dev/bearlakecamp/tests/e2e/uat/p0-container-options.spec.ts`

**Tests**:
- `REQ-UAT-017-01` - width dropdown exists in CMS component settings (FAILING)
- `REQ-UAT-017-02` - width dropdown has Auto option
- `REQ-UAT-017-03` - width dropdown has 25% option
- `REQ-UAT-017-04` - width dropdown has 50% option
- `REQ-UAT-017-05` - width dropdown has 75% option
- `REQ-UAT-017-06` - width dropdown has 100% option
- `REQ-UAT-017-07` - width dropdown has Custom option
- `REQ-UAT-017-08` - height field exists in CMS (FAILING)
- `REQ-UAT-017-09` - height field accepts values
- `REQ-UAT-017-10` - background color picker exists (FAILING)
- `REQ-UAT-017-11` - color picker shows preset colors (FAILING)
- `REQ-UAT-017-12` - color picker allows custom hex value
- `REQ-UAT-017-13` - preview updates when width changes
- `REQ-UAT-017-14` - preview updates when background color changes
- `REQ-UAT-017-15` - container width is applied on frontend
- `REQ-UAT-017-16` - container background color is applied on frontend
- `REQ-UAT-017-17` - capture container options CMS screenshot

---

### REQ-UAT-022: Card Grid Container (2 SP)

**File**: `/Users/travis/SparkryDrive/dev/bearlakecamp/tests/e2e/uat/p0-card-grid.spec.ts`

**Tests**:
- `REQ-UAT-022-01` - card grid displays 4 columns on desktop (FAILING)
- `REQ-UAT-022-02` - all 4 cards visible in single row on desktop
- `REQ-UAT-022-03` - card grid displays 2 columns on tablet
- `REQ-UAT-022-04` - cards wrap to second row on tablet
- `REQ-UAT-022-05` - card grid displays 1 column on mobile
- `REQ-UAT-022-06` - cards stack vertically on mobile
- `REQ-UAT-022-07` - cards take full width on mobile
- `REQ-UAT-022-08` - cards in same row have equal height on desktop
- `REQ-UAT-022-09` - cards in same row have equal height on tablet
- `REQ-UAT-022-10` - equal heights maintained with varying content
- `REQ-UAT-022-11` - card grid has consistent gap between cards
- `REQ-UAT-022-12` - horizontal gap matches vertical gap
- `REQ-UAT-022-13` - grid transitions smoothly at breakpoints
- `REQ-UAT-022-14` - no horizontal scroll at any viewport width
- `REQ-UAT-022-15` - capture desktop grid layout screenshot
- `REQ-UAT-022-16` - capture tablet grid layout screenshot
- `REQ-UAT-022-17` - capture mobile grid layout screenshot

---

## Test Execution Strategy

1. **TDD Phase**: All 78 tests created before implementation
2. **Failing Tests**: 15 tests currently fail (expected - TDD)
3. **Implementation Phase**: Make failing tests pass
4. **Validation Phase**: All 78 tests must pass before QGIT

**Run Command**:
```bash
npx playwright test tests/e2e/uat/p0- --project=chromium
```

---

## Failure Categories

### CMS Integration Failures
- Session card CMS editing not accessible
- Container options not visible in page editor
- Media browser modal trigger not found

### Content Failures
- Homepage only shows 1 session card (expected 4)
- Card grid not using full 4-column layout

### Visual/Style Failures
- Text alignment computed styles differ from expected
- Color picker presets not visible

---

## Success Criteria

1. All 78 tests pass
2. Screenshots captured in `verification-screenshots/`
3. No horizontal scroll on any viewport
4. All REQ-IDs have at least 1 passing test
5. CMS integration tests confirm editing works

---

## Files Created

| File | Tests | Description |
|------|-------|-------------|
| `tests/e2e/uat/p0-admin-nav.spec.ts` | 13 | Admin navigation strip |
| `tests/e2e/uat/p0-media-browser.spec.ts` | 11 | Media browser modal and upload |
| `tests/e2e/uat/p0-session-card.spec.ts` | 20 | Session cards + REQ-UAT-011 |
| `tests/e2e/uat/p0-container-options.spec.ts` | 17 | CMS container settings |
| `tests/e2e/uat/p0-card-grid.spec.ts` | 17 | Responsive grid layout |
