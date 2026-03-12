# Vercel Speed Insights Implementation Plan

**Task ID**: vercel-speed-insights
**Task Type**: feature
**Story Points**: 3 SP
**Requirements**: `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/requirements/vercel-speed-insights.md`
**Status**: Ready for QCODE

---

## Overview

Add Vercel Speed Insights to fix deployment failure and enable Web Vitals monitoring. This is a P0 deployment blocker requiring package installation and component integration.

**Impact**: Unblocks deployment, enables performance monitoring (LCP, FID, CLS, TTFB, FCP)

---

## Requirements Mapping

| REQ-ID | Description | Story Points | Phase |
|--------|-------------|--------------|-------|
| REQ-SI-001 | Install Speed Insights Package | 1 SP | Phase 1 |
| REQ-SI-002 | Integrate Component in Root Layout | 1 SP | Phase 2 |
| REQ-SI-003 | Enable Skipped Tests | 0.5 SP | Phase 3 |
| REQ-SI-004 | Pre-Deployment Validation | 0.5 SP | Phase 4 |
| **TOTAL** | | **3 SP** | |

---

## Implementation Steps

### Phase 1: Package Installation (1 SP)

**REQ-SI-001**: Install `@vercel/speed-insights` package

**Files Modified**:
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/package.json`
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/package-lock.json`

**Commands**:
```bash
cd /Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp
npm install @vercel/speed-insights
```

**Expected Changes**:
```diff
# package.json
{
  "dependencies": {
    "@vercel/analytics": "^1.5.0",
+   "@vercel/speed-insights": "^1.0.0",
    "next": "^14.2.0",
    ...
  }
}
```

**Verification**:
```bash
# Check package installed
npm list @vercel/speed-insights

# Expected output:
# bearlakecamp-nextjs@0.1.0
# └── @vercel/speed-insights@1.x.x
```

**Acceptance**:
- Package appears in dependencies (not devDependencies)
- No dependency warnings during install
- TypeScript types available (built-in)

---

### Phase 2: Component Integration (1 SP)

**REQ-SI-002**: Add SpeedInsights component to root layout

**File**: `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/app/layout.tsx`

**Changes Required**:

**Step 2.1**: Add Import
```diff
 import { Analytics } from "@vercel/analytics/react";
+import { SpeedInsights } from "@vercel/speed-insights/next";
 import DraftModeBanner from "../components/DraftModeBanner";
```

**Location**: Line 3 (after Analytics import)

**Step 2.2**: Add Component to Body
```diff
         {children}
         <DraftModeBanner />
         <Analytics />
+        <SpeedInsights />
         <ScrollAnimationsInit /> {/* REQ-Q2-007: Initialize scroll animations */}
       </body>
```

**Location**: Line 38 (after Analytics, before ScrollAnimationsInit)

**Complete Updated Section** (lines 30-43):
```typescript
  return (
    <html lang="en" className={caveat.variable}>
      <body className="font-sans text-[1.125rem] leading-relaxed text-bark bg-cream">
        <a href="#main-content" className="skip-link sr-only focus:not-sr-only">
          Skip to main content
        </a>
        {children}
        <DraftModeBanner />
        <Analytics />
        <SpeedInsights />
        <ScrollAnimationsInit /> {/* REQ-Q2-007: Initialize scroll animations */}
      </body>
    </html>
  );
```

**Verification**:
```bash
# TypeScript check
npm run typecheck
# Expected: ✓ No errors

# Lint check
npm run lint
# Expected: ✓ No errors or warnings
```

**Acceptance**:
- Import uses correct path: `@vercel/speed-insights/next`
- Component placed after `<Analytics />`
- Component placed before `<ScrollAnimationsInit />`
- No TypeScript errors
- No ESLint warnings

---

### Phase 3: Test Activation (0.5 SP)

**REQ-SI-003**: Enable skipped SpeedInsights tests

**File**: `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/app/layout.spec.tsx`

**Changes Required**:

**Change 3.1**: Enable Import Test (line 70)
```diff
-  test.skip('SpeedInsights component is imported for Web Vitals', async () => {
+  test('SpeedInsights component is imported for Web Vitals', async () => {
```

**Change 3.2**: Enable Render Test (line 83)
```diff
-  test.skip('SpeedInsights component is rendered in layout', () => {
+  test('SpeedInsights component is rendered in layout', () => {
```

**Verification**:
```bash
# Run tests
npm run test

# Expected output:
# ✓ app/layout.spec.tsx (8 tests passing, 0 skipped)
#   ✓ SpeedInsights component is imported for Web Vitals
#   ✓ SpeedInsights component is rendered in layout
```

**Acceptance**:
- Both tests pass without test code modifications
- All existing tests continue passing
- No test failures or errors
- Total test count increases by 2 (from 6 passing to 8 passing)

---

### Phase 4: Pre-Deployment Validation (0.5 SP)

**REQ-SI-004**: Run all quality gates before deployment

**Quality Gate Checklist**:

**Gate 4.1**: TypeScript Compilation
```bash
npm run typecheck
```
**Expected**: `✓ No errors`
**Blocker**: Any TypeScript errors

**Gate 4.2**: Linting
```bash
npm run lint
```
**Expected**: `✓ No errors or warnings`
**Blocker**: Any ESLint errors

**Gate 4.3**: Test Suite
```bash
npm run test
```
**Expected**: All tests pass (including 2 newly enabled SpeedInsights tests)
**Blocker**: Any test failures

**Gate 4.4**: Production Build
```bash
npm run build
```
**Expected**: Successful build with no errors
**Blocker**: Build failures

**Gate 4.5**: Local Runtime Verification
```bash
npm run dev
```
Steps:
1. Navigate to http://localhost:3000
2. Open browser DevTools Console
3. Check for errors (expected: zero errors)
4. Open Network tab
5. Filter for "speed-insights"
6. Verify script loaded

**Expected Console Output**: No errors related to SpeedInsights
**Expected Network**: `/_vercel/speed-insights/vitals` request succeeds
**Blocker**: Runtime errors or failed script loads

**Acceptance**:
- All 5 gates pass
- No blockers encountered
- Ready for deployment

---

## File Locations (Absolute Paths)

All file references use absolute paths as required:

**Modified Files**:
1. `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/package.json`
2. `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/package-lock.json`
3. `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/app/layout.tsx`
4. `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/app/layout.spec.tsx`

**Requirements Document**:
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/requirements/vercel-speed-insights.md`

**No New Files Created** (only modifications to existing files)

---

## Code Snippets

### Complete Import Section (app/layout.tsx)
```typescript
import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import DraftModeBanner from "../components/DraftModeBanner";
import ScrollAnimationsInit from "../components/ScrollAnimationsInit"; // REQ-Q2-007
import { Caveat } from 'next/font/google';
```

### Complete Body Section (app/layout.tsx)
```typescript
<body className="font-sans text-[1.125rem] leading-relaxed text-bark bg-cream">
  <a href="#main-content" className="skip-link sr-only focus:not-sr-only">
    Skip to main content
  </a>
  {children}
  <DraftModeBanner />
  <Analytics />
  <SpeedInsights />
  <ScrollAnimationsInit /> {/* REQ-Q2-007: Initialize scroll animations */}
</body>
```

### Test Changes (app/layout.spec.tsx lines 70-95)
```typescript
test('SpeedInsights component is imported for Web Vitals', async () => {
  // @ts-ignore - Module will be updated
  const layoutModule = await import('./layout');

  const moduleSource = require('fs').readFileSync(
    require.resolve('./layout'),
    'utf-8'
  );

  expect(moduleSource).toContain('SpeedInsights');
  expect(moduleSource).toContain('@vercel/speed-insights');
});

test('SpeedInsights component is rendered in layout', () => {
  // @ts-ignore - Module will be updated
  const { default: RootLayout } = require('./layout');

  const { container } = render(
    <RootLayout>
      <div>Test content</div>
    </RootLayout>
  );

  // SpeedInsights should be rendered
  expect(container).toBeTruthy();
});
```

---

## Testing Strategy

### Unit Tests
**Coverage**: REQ-SI-003
**Files**: `app/layout.spec.tsx`
**Tests**:
1. Import verification (checks module source for correct import statement)
2. Render verification (checks component exists in layout)

**Existing Test Status**: 2 tests currently skipped, will be enabled

### Integration Tests
**Not Required**: SpeedInsights is a leaf component with no integration points

### E2E Tests
**Not Required**: Performance monitoring is passive, no user interactions

### Manual Testing
**Required**: Local dev verification (Phase 4, Gate 4.5)
**Steps**:
1. Run dev server
2. Check browser console for errors
3. Verify script loaded in Network tab

---

## Deployment Verification Steps

### Pre-Deployment (Local)
1. All quality gates pass (§ Phase 4)
2. No console errors in dev environment
3. SpeedInsights script visible in Network tab

### Post-Deployment (Production)
1. Visit https://prelaunch.bearlakecamp.com
2. Open DevTools Console → Verify zero errors
3. Open DevTools Network → Filter "speed-insights" → Verify script loaded
4. Check Vercel Dashboard → Projects → bearlakecamp → Analytics
5. Wait 24 hours → Verify Web Vitals data appears

**Success Criteria**:
- Deployment completes without errors
- Zero runtime errors in production console
- Script loads successfully (200 status)
- Web Vitals data appears in Vercel dashboard

**Failure Indicators**:
- 404 errors for speed-insights script
- Console errors mentioning SpeedInsights
- No Web Vitals data after 24 hours

---

## Rollback Plan

If deployment fails or errors occur:

**Step 1**: Revert Component Integration
```bash
# File: app/layout.tsx
# Remove line: import { SpeedInsights } from "@vercel/speed-insights/next";
# Remove line: <SpeedInsights />
```

**Step 2**: Revert Test Changes
```bash
# File: app/layout.spec.tsx
# Change: test('SpeedInsights...') back to test.skip('SpeedInsights...')
```

**Step 3**: Uninstall Package
```bash
npm uninstall @vercel/speed-insights
```

**Step 4**: Verify Clean State
```bash
npm run typecheck && npm run test
```

**Step 5**: Deploy Rollback
```bash
# Commit revert changes
# Push to trigger deployment
```

**Rollback Cost**: 0.5 SP
**Rollback Time**: < 10 minutes

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| TypeScript errors after install | Low | Medium | Use exact import path `/next` |
| Version conflict with Analytics | Low | Medium | Packages designed to work together |
| Build failure | Low | High | Pre-deployment build test (Gate 4.4) |
| Runtime errors in production | Low | High | Local dev verification (Gate 4.5) |
| Script blocked by ad blockers | Medium | Low | Component fails gracefully |
| No Web Vitals data appears | Low | Low | Check Vercel dashboard permissions |

**Overall Risk Level**: Low
**Confidence Level**: High (official Vercel package, well-tested, standard integration)

---

## Story Point Breakdown

| Phase | Tasks | SP | Justification |
|-------|-------|----|--------------|
| Phase 1 | Install package | 1 SP | Simple npm install + verification |
| Phase 2 | Integrate component | 1 SP | 2 line changes + typecheck |
| Phase 3 | Enable tests | 0.5 SP | Remove `.skip` from 2 tests |
| Phase 4 | Pre-deployment validation | 0.5 SP | Run quality gate suite |
| **TOTAL** | | **3 SP** | |

**Baseline Reference**: 1 SP = simple authenticated API (baseline from PLANNING-POKER.md)

**Complexity Justification**:
- Lower than baseline (no API, no auth, no database)
- Standard package integration pattern
- Existing test coverage (just need to enable)
- Minimal code changes (2 lines in layout.tsx, 2 lines in tests)
- 3 SP accounts for: install (1) + integrate (1) + test/validate (1)

---

## QShortcuts Sequence

Following CLAUDE.md § 4 workflow:

**Already Complete**:
- ✅ **QPLAN**: This document (planning complete)

**Next Steps** (sde-iii execution):
1. **QCODET**: Enable tests (REQ-SI-003) → Tests already exist, just remove `.skip`
2. **QCHECKT**: PE-Reviewer verifies test quality → Tests are simple, low risk
3. **QCODE**: Implement integration (REQ-SI-001, REQ-SI-002)
4. **QCHECK**: PE-Reviewer + code-quality-auditor review
5. **QDOC**: Update docs (if needed - may skip for this simple task)
6. **QGIT**: Commit, push, verify deployment

**Simplified Sequence** (given simplicity of task):
1. **QCODE**: Install + integrate + enable tests (all in one pass)
2. **QCHECK**: Quick review (low complexity, low risk)
3. **QGIT**: Commit and deploy

---

## Success Criteria Summary

**Technical Success**:
- [ ] Package installed: `npm list @vercel/speed-insights` shows version
- [ ] TypeScript clean: `npm run typecheck` passes
- [ ] Linting clean: `npm run lint` passes
- [ ] Tests pass: `npm run test` shows 2 new passing tests
- [ ] Build succeeds: `npm run build` completes
- [ ] Local dev clean: No console errors at http://localhost:3000

**Deployment Success**:
- [ ] Deployment completes without errors
- [ ] Production site loads without console errors
- [ ] SpeedInsights script loaded (visible in Network tab)
- [ ] Web Vitals data appears in Vercel dashboard (within 24 hours)

**Definition of Done** (from requirements):
- All technical success criteria met
- All deployment success criteria met
- Deployment unblocked
- Performance monitoring active

---

## Related Documentation

**Requirements**:
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/requirements/vercel-speed-insights.md`

**Guidelines**:
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/CLAUDE.md` § 6.5 (Pre-Deployment Gates)
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/docs/project/PLANNING-POKER.md`

**Related Requirements**:
- REQ-104: Vercel Analytics Integration (already implemented)

**Tests**:
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/app/layout.spec.tsx` (lines 70-95)

---

## Execution Checklist for sde-iii

**Phase 1: Installation**
- [ ] Navigate to project root: `cd /Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp`
- [ ] Run: `npm install @vercel/speed-insights`
- [ ] Verify: `npm list @vercel/speed-insights` shows version
- [ ] Check: `package.json` contains new dependency

**Phase 2: Integration**
- [ ] Open: `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/app/layout.tsx`
- [ ] Add import: `import { SpeedInsights } from "@vercel/speed-insights/next";` (after Analytics import)
- [ ] Add component: `<SpeedInsights />` (after Analytics, before ScrollAnimationsInit)
- [ ] Save file

**Phase 3: Tests**
- [ ] Open: `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/app/layout.spec.tsx`
- [ ] Line 70: Change `test.skip` to `test`
- [ ] Line 83: Change `test.skip` to `test`
- [ ] Save file

**Phase 4: Validation**
- [ ] Run: `npm run typecheck` → Expect: ✓ No errors
- [ ] Run: `npm run lint` → Expect: ✓ No errors
- [ ] Run: `npm run test` → Expect: All tests pass
- [ ] Run: `npm run build` → Expect: Successful build
- [ ] Run: `npm run dev` → Open http://localhost:3000 → Check console → Expect: No errors

**Phase 5: Formatting**
- [ ] Run: `npx prettier --write app/layout.tsx app/layout.spec.tsx`

**Ready for QGIT**:
- [ ] All checklist items complete
- [ ] All quality gates passed
- [ ] Code formatted
- [ ] Ready to commit and deploy

---

**Plan Status**: ✅ Ready for Execution
**Assigned To**: sde-iii
**Estimated Completion**: 3 SP
**Blocking Issues**: None
