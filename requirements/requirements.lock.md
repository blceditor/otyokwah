# Requirements Lock - Updates-04

**Locked**: 2025-12-31T10:00:00Z
**Source**: requirements/QPLAN-updates-04.md
**Execution Mode**: Autonomous
**Format**: Per-requirement verification tracking (REQ-PROC-008)

---

## Updates-04 Locked Requirements

### Phase 1: Blocking Issues (9 SP)

| REQ-ID | Description | SP | Tests | Screenshot | Production | Status |
|--------|------------|-----|-------|------------|------------|--------|
| REQ-ISSUE-001 | Admin Nav Strip Fix | 2 | ⏳ | N/A | ⏳ | PENDING |
| REQ-TEST-001 | Test Infrastructure Updates | 2 | ⏳ | N/A | ⏳ | PENDING |
| REQ-CMS-001 | Media Browser with Upload | 5 | ⏳ | ⏳ | ⏳ | PENDING |

### Phase 2: Homepage Foundation (11 SP)

| REQ-ID | Description | SP | Tests | Screenshot | Production | Status |
|--------|------------|-----|-------|------------|------------|--------|
| REQ-HOME-004 | Camp Session Card Component | 5 | ⏳ | ⏳ | ⏳ | PENDING |
| REQ-COMP-001 | Card Grid Container | 2 | ⏳ | ⏳ | ⏳ | PENDING |
| REQ-HOME-001 | CTA Buttons in Body | 3 | ⏳ | ⏳ | ⏳ | PENDING |
| REQ-HOME-002 | Gallery in Body | 1 | ⏳ | N/A | ⏳ | PENDING |

### Phase 3: CMS Enhancements (16 SP)

| REQ-ID | Description | SP | Tests | Screenshot | Production | Status |
|--------|------------|-----|-------|------------|------------|--------|
| REQ-CMS-005 | Color Picker with Presets | 4 | ⏳ | ⏳ | ⏳ | PENDING |
| REQ-CMS-003 | Container Width/Height/Background | 4 | ⏳ | ⏳ | ⏳ | PENDING |
| REQ-CMS-004 | Icon Size Settings | 2 | ⏳ | ⏳ | ⏳ | PENDING |
| REQ-CMS-008 | Light/Dark Mode Fix | 3 | ⏳ | ⏳ | ⏳ | PENDING |
| REQ-CMS-002 | Component Deduplication | 3 | ⏳ | N/A | ⏳ | PENDING |

### Phase 4: Homepage Sections (12 SP)

| REQ-ID | Description | SP | Tests | Screenshot | Production | Status |
|--------|------------|-----|-------|------------|------------|--------|
| REQ-HOME-006 | Wide Card Component | 3 | ⏳ | ⏳ | ⏳ | PENDING |
| REQ-HOME-005 | Work At Camp Section | 3 | ⏳ | ⏳ | ⏳ | PENDING |
| REQ-HOME-007 | Retreats Section | 2 | ⏳ | ⏳ | ⏳ | PENDING |
| REQ-HOME-008 | Rentals Section | 2 | ⏳ | ⏳ | ⏳ | PENDING |
| REQ-HOME-003 | Image Preload Fix | 2 | ⏳ | N/A | ⏳ | PENDING |

### Phase 5: Summer Camp Page (11 SP)

| REQ-ID | Description | SP | Tests | Screenshot | Production | Status |
|--------|------------|-----|-------|------------|------------|--------|
| REQ-SUMMER-001 | YouTube Hero Support | 4 | ⏳ | ⏳ | ⏳ | PENDING |
| REQ-SUMMER-003 | Session Cards (Reuse) | 2 | ⏳ | ⏳ | ⏳ | PENDING |
| REQ-SUMMER-006 | Prepare For Camp Buttons | 2 | ⏳ | ⏳ | ⏳ | PENDING |
| REQ-SUMMER-002 | Worthy Section Width | 1 | ⏳ | ⏳ | ⏳ | PENDING |
| REQ-SUMMER-004 | Prepare Card Width | 1 | ⏳ | ⏳ | ⏳ | PENDING |
| REQ-SUMMER-005 | Icon Size Increase | 1 | ⏳ | ⏳ | ⏳ | PENDING |

### Phase 6: Cleanup (5 SP)

| REQ-ID | Description | SP | Tests | Screenshot | Production | Status |
|--------|------------|-----|-------|------------|------------|--------|
| REQ-BRING-001 | Hero Height Configurable | 2 | ⏳ | ⏳ | ⏳ | PENDING |
| REQ-CMS-006 | UX Review | 3 | N/A | N/A | N/A | PENDING |

**Total**: 59 SP

---

## Previous Requirements Lock (Process Improvement)

| REQ-ID | Description | SP | Tests | Screenshot | Production | Status |
|--------|------------|-----|-------|------------|------------|--------|
| REQ-PROC-007 | Visual Checkpoint for CSS Changes | 0.5 | N/A | N/A | ⏳ | IMPLEMENTED |
| REQ-PROC-008 | Per-Requirement Verification in Lock File | 0.3 | N/A | N/A | ⏳ | IMPLEMENTED |
| REQ-PROC-009 | Reduce Requirements Batch Size | 0.2 | N/A | N/A | ⏳ | IMPLEMENTED |

**Total**: 1.0 SP

**Legend**:
- ✅ = Verified
- ⏳ = Pending
- ❌ = Failed
- N/A = Not applicable

---

## Previous Requirements (Historical Reference)

### Updates-01 (2025-12-17)

| REQ-ID | Title | SP | Status |
|--------|-------|-----|--------|
| REQ-U01-001 | Hero Video Height Consistency | 0.3 | COMPLETE |
| REQ-U01-002 | Camp Sessions Page Redesign | 5.0 | COMPLETE |
| REQ-U01-003 | ContentCard Icon Alignment Fix | 0.2 | COMPLETE |
| REQ-U01-004 | Accordion Styling Improvements | 0.5 | COMPLETE |
| REQ-U01-005 | GitHub OAuth Keystatic 404 Fix | 2.0 | COMPLETE |

**Total**: 8.0 SP

---

## Autonomous Execution Plan

### PHASE 1: Test Development (TDD - Tests First)

**Order**: REQ-U01-001 → REQ-U01-003 → REQ-U01-004 → REQ-U01-005 → REQ-U01-002

1. **REQ-U01-001 Tests** (0.1 SP):
   - Create `tests/e2e/smoke/hero-videos.spec.ts`
   - Test hero video height >= 600px on work-at-camp pages
   - Run and verify tests FAIL (component not yet modified)

2. **REQ-U01-003 Tests** (0.1 SP):
   - Update `components/content/ContentCard.spec.tsx`
   - Test icon and title on same line (flex)
   - Test icon has flex-shrink-0
   - Run and verify tests FAIL

3. **REQ-U01-004 Tests** (0.1 SP):
   - Update `components/content/FAQAccordion.spec.tsx`
   - Test padding symmetry
   - Test border uses secondary color
   - Run and verify tests FAIL

4. **REQ-U01-005 Tests** (0.1 SP):
   - Create `tests/e2e/production/keystatic-oauth.spec.ts`
   - Test callback route returns non-404
   - Create collaborator setup documentation

5. **REQ-U01-002 Tests** (0.5 SP):
   - Create `tests/e2e/camp-sessions.spec.ts`
   - Test hero video present
   - Test anchor navigation
   - Test session cards with 2026 dates
   - Run and verify tests FAIL

### PHASE 2: Implementation

**FIX LOOP**: Up to 4 iterations per fix

1. **REQ-U01-001 Implementation**:
   - Edit `components/hero/HeroVideo.tsx` line 29
   - Change `min-h-[60vh] md:min-h-[70vh] lg:min-h-[80vh]` to `min-h-[600px]`
   - Run tests → verify PASS

2. **REQ-U01-003 Implementation**:
   - Edit `components/content/ContentCard.tsx`
   - Change layout to flex row for icon + title
   - Update icon size to h-6 w-6
   - Increase title to text-2xl
   - Run tests → verify PASS

3. **REQ-U01-004 Implementation**:
   - Edit `components/content/FAQAccordion.tsx`
   - Change border to border-secondary/20
   - Add top padding to answer content
   - Edit `components/content/Accordion.tsx` (same changes)
   - Run tests → verify PASS

4. **REQ-U01-005 Implementation**:
   - Create `docs/operations/KEYSTATIC-COLLABORATOR-SETUP.md`
   - Document GitHub App authorization process
   - Verify route exists via curl test

5. **REQ-U01-002 Implementation**:
   - Create `components/pages/CampSessionsPage.tsx`
   - Create `components/content/AnchorNavigation.tsx`
   - Update `content/pages/summer-camp-sessions.mdoc`
   - Update `app/[slug]/page.tsx` for routing
   - Run tests → verify PASS

### PHASE 3: Quality Gates

**All Must Pass Before Commit**:
```bash
npm run typecheck    # Zero type errors
npm run lint         # Zero lint errors
npm run test         # All unit tests pass
npm run test:e2e     # All e2e tests pass
```

### PHASE 4: Commit & Deploy

1. Stage all changes
2. Create conventional commit:
   ```
   feat(ui): Updates-01 - hero videos, content cards, accordion, camp sessions

   - REQ-U01-001: Fix hero video height to min-h-[600px]
   - REQ-U01-002: Redesign camp sessions page with LIT-style layout
   - REQ-U01-003: Align ContentCard icon inline with title
   - REQ-U01-004: Add accordion top padding and brown theme border
   - REQ-U01-005: Document GitHub App authorization for collaborators

   Story Points: 8.0 SP
   ```
3. Push to main branch
4. Vercel auto-deploys

### PHASE 5: Production Monitoring

**Timeline**:
- Wait 2 minutes for Vercel deployment
- Poll every 30 seconds for 5 minutes total

**Validation**:
```bash
./scripts/smoke-test.sh --force prelaunch.bearlakecamp.com
```

**Success Criteria**:
- All pages return HTTP 200
- Playwright production tests pass
- Screenshot proof captured

### PHASE 6: Fix Loop (If Issues Found)

**If ANY Failure**:
1. Diagnose root cause
2. Create QPLAN for fix
3. Execute TDD flow on fix
4. Repeat up to 4 times
5. If still failing after 4 attempts → BLOCKER (escalate)

---

## Blocker Protocol

**True Blocker Definition**:
- 5 different solutions attempted without success
- Integration issue tried 5 different fixes

**Escalation**:
1. Assume WE are the problem first
2. Try 5 different integration approaches
3. Convene exec-team for debate
4. If consensus → apply solution
5. If no consensus → escalate to human

---

## Validation Checklist

**Local Testing**:
- [ ] npm run typecheck passes
- [ ] npm run lint passes
- [ ] npm run test passes (with counts)
- [ ] npm run test:e2e passes (with counts)

**Production Testing**:
- [ ] smoke-test.sh all pages 200
- [ ] Playwright production tests pass
- [ ] Screenshots captured in verification-screenshots/

**Requirements Verification**:
- [ ] REQ-U01-001: Hero videos >= 600px height
- [ ] REQ-U01-002: Camp sessions page redesigned
- [ ] REQ-U01-003: ContentCard icon aligned with title
- [ ] REQ-U01-004: Accordion has top padding + brown border
- [ ] REQ-U01-005: OAuth docs created, route exists

---

## Final Report Template

```markdown
# Updates-01 Completion Report

**Date**: [DATE]
**Duration**: [TIME]
**Story Points Delivered**: 8.0 SP

## Requirements Status

| REQ | Status | Evidence |
|-----|--------|----------|
| REQ-U01-001 | [PASS/FAIL] | [Screenshot/Test] |
| REQ-U01-002 | [PASS/FAIL] | [Screenshot/Test] |
| REQ-U01-003 | [PASS/FAIL] | [Screenshot/Test] |
| REQ-U01-004 | [PASS/FAIL] | [Screenshot/Test] |
| REQ-U01-005 | [PASS/FAIL] | [Doc created] |

## Test Results

### Unit Tests
- Total: X
- Passed: X
- Failed: 0
- Coverage: X%

### E2E Tests
- Total: X
- Passed: X
- Failed: 0

### Smoke Tests
- Pages Tested: X
- All HTTP 200: YES/NO

## Screenshots
- verification-screenshots/[SESSION]/

## Commit
- SHA: [HASH]
- Message: [MESSAGE]

## Production URL
https://prelaunch.bearlakecamp.com
```
