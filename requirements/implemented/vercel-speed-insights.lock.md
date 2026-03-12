# Vercel Speed Insights Integration - Requirements Lock

**Task ID**: vercel-speed-insights
**Date Locked**: 2025-11-22
**Source**: requirements/vercel-speed-insights.md
**Story Points**: 3 SP
**Status**: Ready for Implementation

---

## REQ-SI-001: Install Speed Insights Package

**Acceptance Criteria**:
- Package appears in `package.json` dependencies section
- `package-lock.json` updated with exact version
- No dependency conflicts with existing `@vercel/analytics@^1.5.0`
- TypeScript types available (package includes built-in types)

**Non-Goals**:
- Do NOT modify `@vercel/analytics` version
- Do NOT add to devDependencies (runtime dependency)

**Story Points**: 1 SP

---

## REQ-SI-002: Integrate SpeedInsights Component in Root Layout

**Acceptance Criteria**:
- Component imported from correct path (`@vercel/speed-insights/next`)
- Rendered in `<body>` element
- Positioned after `<Analytics />` component
- No TypeScript compilation errors
- No runtime errors in browser console

**Non-Goals**:
- Do NOT add to Keystatic layout (`app/keystatic/layout.tsx`)
- Do NOT configure custom options (use defaults)
- Do NOT conditionally render (production filtering handled by package)

**File**: `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/app/layout.tsx`

**Story Points**: 1 SP

---

## REQ-SI-003: Enable Skipped Tests

**Acceptance Criteria**:
- Both tests pass without modifications to test logic
- Tests verify import from `@vercel/speed-insights`
- Tests confirm component presence in module
- All existing analytics tests continue passing
- Test suite runs without errors: `npm run test`

**File**: `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/app/layout.spec.tsx`

**Changes**:
- Line 70: Remove `.skip` from SpeedInsights import test
- Line 83: Remove `.skip` from SpeedInsights render test

**Story Points**: 0.5 SP

---

## REQ-SI-004: Pre-Deployment Validation

**Acceptance Criteria**:
- All pre-deployment gates pass (§ 6.5 in CLAUDE.md)
- No TypeScript errors
- No lint violations
- All tests green
- Production build succeeds
- Local dev server runs without console errors

**Blockers** (Cannot deploy if ANY fail):
- TypeScript compilation errors
- Test failures
- Build failures
- Runtime errors in browser console

**Quality Gates**:
1. `npm run typecheck` → ✓ No errors
2. `npm run lint` → ✓ No errors
3. `npm run test` → ✓ All tests pass
4. `npm run build` → ✓ Successful build
5. Local runtime verification → ✓ No console errors

**Story Points**: 0.5 SP

---

## Total Story Points: 3 SP

**Breakdown**:
- Installation: 1 SP
- Integration: 1 SP
- Testing: 0.5 SP
- Validation: 0.5 SP

**Baseline**: 1 SP = simple authenticated API (from PLANNING-POKER.md)

---

## Files Modified

1. `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/package.json`
2. `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/package-lock.json`
3. `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/app/layout.tsx`
4. `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/app/layout.spec.tsx`

**No New Files Created**

---

## Dependencies

**Required Packages**:
- Next.js 13+ (current: `^14.2.0` ✓)
- React 18+ (current: `^18.3.0` ✓)
- Compatible with `@vercel/analytics@^1.5.0` ✓

**New Package**:
- `@vercel/speed-insights` (latest compatible version)

---

## Risk Assessment

**Risk Level**: Low
**Confidence**: High

**Mitigations**:
- Official Vercel package (well-tested)
- No breaking changes to existing analytics
- Pre-deployment validation gates
- Simple rollback plan (0.5 SP)

---

## Definition of Done

- [ ] Package installed in package.json
- [ ] Component integrated in app/layout.tsx
- [ ] Tests enabled and passing
- [ ] TypeScript compilation clean
- [ ] Linting clean
- [ ] Production build succeeds
- [ ] Local dev verification complete
- [ ] Deployment succeeds
- [ ] Web Vitals data appears in Vercel dashboard

---

**Locked By**: planner
**Implementation Plan**: docs/tasks/vercel-speed-insights-implementation-plan.md
**Next Step**: QCODE (sde-iii execution)
