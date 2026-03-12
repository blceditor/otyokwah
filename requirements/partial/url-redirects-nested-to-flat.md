# URL Redirects: Nested Paths to Flat Slugs

**Created**: 2025-12-04
**Status**: Planning
**Related REQ**: REQ-NAV-008 (extends Phase 4 Navigation Track)
**Dependencies**: None (extends existing redirect configuration)

---

## Overview

Implement 301 permanent redirects for nested URL patterns that should map to flat slug routes. The original WordPress site used nested paths (`/work-at-camp/summer-staff`), but the Next.js site uses flat slugs (`/summer-staff`). Users with bookmarks or external links to nested URLs encounter 404 errors.

**Total Estimated Story Points**: 0.5 SP

---

## REQ-NAV-008: Add Nested-to-Flat URL Redirects

### Problem Statement

**Current State**:
- Next.js config has 6 existing redirects (Summer Camp and Facilities)
- Navigation config uses flat slug routing (`/summer-staff`, `/work-at-camp-year-round`)
- Content files exist with flat slug naming (e.g., `summer-staff.mdoc`)
- Users accessing nested paths (`/work-at-camp/summer-staff`) receive 404 errors

**Root Cause**:
- WordPress legacy URLs used nested structure (`/parent/child`)
- Next.js implementation uses flat slug routing (`/parent-child` or `/child`)
- Missing redirect rules in `next.config.mjs` for 7 nested patterns

**Impact**:
- SEO: External links and backlinks return 404 (negative ranking signal)
- UX: Users with bookmarks encounter broken links
- Analytics: Traffic loss from referral sources using old URLs

---

### Required Redirects

| Source (Nested) | Destination (Flat) | Reason |
|-----------------|-------------------|--------|
| `/work-at-camp/summer-staff` | `/summer-staff` | Navigation link uses flat slug |
| `/work-at-camp/year-round` | `/work-at-camp-year-round` | Content file uses compound slug |
| `/summer-camp/what-to-bring` | `/summer-camp-what-to-bring` | Content file uses compound slug |
| `/summer-camp/faq` | `/summer-camp-faq` | Content file uses compound slug |
| `/retreats/rentals` | `/retreats-rentals` | Content file uses compound slug |
| `/facilities/outdoor` | `/facilities-outdoor` | Content file uses compound slug |
| `/about/staff` | `/staff` | Navigation link uses flat slug |

**Total**: 7 redirect rules

---

### Solution Analysis

#### Option A: Next.js redirects in next.config.mjs (RECOMMENDED)

**Implementation**:
```javascript
// next.config.mjs
async redirects() {
  return [
    // ... existing redirects ...

    // Work at Camp redirects (REQ-NAV-008)
    {
      source: '/work-at-camp/summer-staff',
      destination: '/summer-staff',
      permanent: true,
    },
    {
      source: '/work-at-camp/year-round',
      destination: '/work-at-camp-year-round',
      permanent: true,
    },

    // Summer Camp redirects (REQ-NAV-008)
    {
      source: '/summer-camp/what-to-bring',
      destination: '/summer-camp-what-to-bring',
      permanent: true,
    },
    {
      source: '/summer-camp/faq',
      destination: '/summer-camp-faq',
      permanent: true,
    },

    // Retreats redirects (REQ-NAV-008)
    {
      source: '/retreats/rentals',
      destination: '/retreats-rentals',
      permanent: true,
    },

    // Facilities redirects (REQ-NAV-008)
    {
      source: '/facilities/outdoor',
      destination: '/facilities-outdoor',
      permanent: true,
    },

    // About redirects (REQ-NAV-008)
    {
      source: '/about/staff',
      destination: '/staff',
      permanent: true,
    },
  ];
}
```

**Pros**:
- Built-in Next.js feature (standard pattern)
- 301 permanent redirects (SEO-friendly, caches in browsers)
- Zero runtime performance cost (resolved at edge/CDN layer)
- Extends existing redirect configuration (lines 22-57 in next.config.mjs)
- No additional files or middleware required
- Vercel Edge Network handles redirects efficiently

**Cons**:
- Requires server restart in dev mode to see changes
- Config file grows with each redirect rule
- Static configuration (cannot add redirects without deploy)

**Effort**: 0.5 SP

---

#### Option B: Middleware redirects

**Implementation**:
```typescript
// middleware.ts (new file)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const REDIRECT_MAP: Record<string, string> = {
  '/work-at-camp/summer-staff': '/summer-staff',
  '/work-at-camp/year-round': '/work-at-camp-year-round',
  '/summer-camp/what-to-bring': '/summer-camp-what-to-bring',
  '/summer-camp/faq': '/summer-camp-faq',
  '/retreats/rentals': '/retreats-rentals',
  '/facilities/outdoor': '/facilities-outdoor',
  '/about/staff': '/staff',
};

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (REDIRECT_MAP[pathname]) {
    return NextResponse.redirect(
      new URL(REDIRECT_MAP[pathname], request.url),
      { status: 301 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/work-at-camp/:path*',
    '/summer-camp/:path*',
    '/retreats/:path*',
    '/facilities/:path*',
    '/about/:path*',
  ],
};
```

**Pros**:
- Dynamic logic (can add conditional redirects)
- Can log redirect activity for analytics
- Runtime flexibility (add tracking, A/B testing)
- Single source of truth (redirect map object)

**Cons**:
- Runs on every request (performance overhead)
- More complex implementation
- Additional file to maintain
- Edge runtime has limitations (no Node.js APIs)
- Not necessary for simple static redirects

**Effort**: 1 SP

---

#### Option C: Nested route files with redirect components

**Implementation**:
```typescript
// app/work-at-camp/summer-staff/page.tsx (new file)
import { redirect } from 'next/navigation';

export default function WorkAtCampSummerStaffRedirect() {
  redirect('/summer-staff');
}
```

**Pros**:
- Explicit file structure (easy to discover)
- Type-safe redirect function from Next.js
- Easy to debug (visible in file tree)

**Cons**:
- Creates 7 new files (directory pollution)
- Not scalable (N redirects = N files)
- More maintenance overhead
- Requires creating nested directory structure
- Still builds as separate pages (bundle size impact)

**Effort**: 1.5 SP

---

### Decision: Option A (next.config.mjs redirects)

**Rationale**:
1. **Simplest**: Extends existing pattern (6 redirects already in config)
2. **Most efficient**: Zero runtime cost, handled at edge/CDN layer
3. **SEO-optimal**: 301 permanent redirects signal URL canonicalization
4. **Standard practice**: Next.js recommended approach for static redirects
5. **Lowest effort**: 0.5 SP vs 1-1.5 SP for alternatives

**Trade-offs accepted**:
- Static configuration (acceptable for known legacy URLs)
- Requires deploy to add redirects (acceptable for stable redirect set)

---

### Acceptance Criteria

**Functional**:
- [ ] All 7 nested URLs return HTTP 301 status
- [ ] Redirects point to correct flat slug destinations (verified in response headers)
- [ ] Final destination returns HTTP 200 status
- [ ] Redirect chain is single-hop (no multiple redirects)
- [ ] Redirects work in both development and production environments

**SEO**:
- [ ] HTTP status code is 301 (permanent), not 302 (temporary)
- [ ] `Location` header contains absolute URL to destination
- [ ] Redirects preserve query parameters if present (optional, document if not)

**Testing**:
- [ ] Integration test validates all 7 redirects return 301
- [ ] Integration test validates destinations return 200
- [ ] Test verifies redirect configuration structure (source, destination, permanent)
- [ ] Manual curl test confirms redirect chain (document in test artifacts)

**Documentation**:
- [ ] Redirect mapping table in requirements document
- [ ] Code comment in next.config.mjs references REQ-NAV-008
- [ ] Test file includes REQ-NAV-008 citation

**Quality Gates**:
- [ ] `npm run typecheck` passes (0 errors)
- [ ] `npm run lint` passes (0 errors)
- [ ] `npm run test` passes (100% pass rate)
- [ ] All existing tests continue to pass (no regressions)

---

### Non-Goals

**Out of Scope**:
- Adding redirects for URLs not in the required 7
- Wildcard redirects (e.g., `/work-at-camp/:slug` → `/:slug`)
- Query parameter preservation logic (unless user requests)
- Redirect tracking/analytics (separate feature)
- Creating nested route structure in `app/` directory
- Changing content file slugs or naming conventions

---

### Test Strategy

#### 1. Unit Tests: Redirect Configuration Validation

**File**: `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/next.config.spec.ts` (new)

**Test Cases**:
```typescript
describe('REQ-NAV-008 — URL Redirects Configuration', () => {
  test('redirect configuration includes all 7 required redirects', () => {
    // Verify redirect array contains sources and destinations
  });

  test('all redirects are marked as permanent (status 301)', () => {
    // Verify permanent: true on all redirect rules
  });

  test('redirect sources use nested path structure', () => {
    // Verify sources match pattern /parent/child
  });

  test('redirect destinations use flat slug structure', () => {
    // Verify destinations exist as page routes
  });

  test('no duplicate redirect sources exist', () => {
    // Verify each source appears only once
  });
});
```

---

#### 2. Integration Tests: Redirect HTTP Status Validation

**File**: `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/tests/integration/navigation-links.spec.ts` (update existing)

**Test Cases**:
```typescript
describe('REQ-NAV-008 — Nested URL Redirects', () => {
  const redirects = [
    { source: '/work-at-camp/summer-staff', destination: '/summer-staff' },
    { source: '/work-at-camp/year-round', destination: '/work-at-camp-year-round' },
    { source: '/summer-camp/what-to-bring', destination: '/summer-camp-what-to-bring' },
    { source: '/summer-camp/faq', destination: '/summer-camp-faq' },
    { source: '/retreats/rentals', destination: '/retreats-rentals' },
    { source: '/facilities/outdoor', destination: '/facilities-outdoor' },
    { source: '/about/staff', destination: '/staff' },
  ];

  test('all nested URLs return 301 redirect status', async () => {
    // For each redirect source, verify HTTP 301 response
  });

  test('all redirect destinations return 200 status', async () => {
    // Verify destination pages exist and load successfully
  });

  test('redirect Location headers point to correct destinations', async () => {
    // Verify Location header matches expected destination
  });

  test('redirect destinations have corresponding page files', () => {
    // Verify .mdoc or page.tsx files exist for each destination
  });
});
```

---

#### 3. Manual Testing: curl Verification

**Test Script**: `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/scripts/test-redirects.sh` (new)

**Commands**:
```bash
#!/bin/bash
# REQ-NAV-008: Manual redirect verification
# Usage: ./scripts/test-redirects.sh [dev|prod]

ENV=${1:-dev}
BASE_URL=${ENV == "dev" ? "http://localhost:3000" : "https://bearlakecamp.com"}

echo "Testing redirects on $BASE_URL..."

# Test each redirect
curl -I "$BASE_URL/work-at-camp/summer-staff" | grep "301\|Location"
curl -I "$BASE_URL/work-at-camp/year-round" | grep "301\|Location"
curl -I "$BASE_URL/summer-camp/what-to-bring" | grep "301\|Location"
curl -I "$BASE_URL/summer-camp/faq" | grep "301\|Location"
curl -I "$BASE_URL/retreats/rentals" | grep "301\|Location"
curl -I "$BASE_URL/facilities/outdoor" | grep "301\|Location"
curl -I "$BASE_URL/about/staff" | grep "301\|Location"

echo "✓ All redirects validated"
```

**Expected Output**:
```
HTTP/2 301
location: https://bearlakecamp.com/summer-staff
```

---

#### 4. Regression Tests: Existing Redirects

**Test Cases**:
```typescript
describe('REQ-NAV-001 — Existing Redirects (Regression)', () => {
  const existingRedirects = [
    { source: '/summer-camp/jr-high', destination: '/summer-camp-junior-high' },
    { source: '/summer-camp/high-school', destination: '/summer-camp-senior-high' },
    { source: '/facilities/cabins', destination: '/facilities-cabins' },
    { source: '/facilities/chapel', destination: '/facilities-chapel' },
    { source: '/facilities/dining-hall', destination: '/facilities-dining-hall' },
    { source: '/facilities/mac', destination: '/facilities-rec-center' },
  ];

  test('existing redirects continue to work after adding new ones', async () => {
    // Verify all 6 existing redirects still return 301
  });
});
```

---

### Implementation Steps

#### Step 1: Read current next.config.mjs (DONE via Read tool)
- Understand existing redirect structure
- Identify where to insert new redirects
- Verify syntax and formatting

#### Step 2: Add 7 new redirect rules
- Insert after existing redirects (line 56)
- Group by category (Work at Camp, Summer Camp, Retreats, Facilities, About)
- Add comment: `// REQ-NAV-008: Nested to flat slug redirects`
- Maintain consistent formatting with existing rules

#### Step 3: Create unit tests for redirect configuration
- New file: `next.config.spec.ts`
- Validate redirect structure
- Verify permanent: true on all rules
- Check for duplicates

#### Step 4: Update integration tests
- Extend `tests/integration/navigation-links.spec.ts`
- Add REQ-NAV-008 test suite
- Validate 301 status codes
- Verify Location headers

#### Step 5: Create manual test script
- New file: `scripts/test-redirects.sh`
- Bash script with curl commands
- Test both dev and prod environments
- Document expected output

#### Step 6: Run quality gates
```bash
npm run typecheck  # Must pass
npm run lint       # Must pass
npm run test       # Must pass
```

#### Step 7: Manual verification
- Start dev server: `npm run dev`
- Run test script: `./scripts/test-redirects.sh dev`
- Verify redirects in browser DevTools Network tab
- Check redirect chain (should be single-hop)

#### Step 8: Deploy to Vercel preview
- Create PR with changes
- Vercel automatically builds preview
- Run test script on preview URL
- Verify production build works correctly

#### Step 9: Update documentation
- Add redirect mapping table to this requirements file
- Document testing process in `docs/technical/REDIRECTS.md` (new)
- Update `CHANGELOG.md` with REQ-NAV-008 entry

---

### Affected Files

**Modified**:
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/next.config.mjs` (add 7 redirects)
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/tests/integration/navigation-links.spec.ts` (expand tests)

**New**:
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/next.config.spec.ts` (unit tests)
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/scripts/test-redirects.sh` (manual test script)
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/docs/technical/REDIRECTS.md` (documentation)

---

### Risk Assessment

**Risks**:
1. **Redirect loop**: If destination also has redirect rule (MITIGATED: test single-hop)
2. **Breaking existing redirects**: Adding new rules could interfere (MITIGATED: regression tests)
3. **Development server restart**: Requires server restart to see changes (ACCEPTABLE: one-time config change)
4. **Missing destination pages**: If flat slug page doesn't exist (MITIGATED: integration test validates destinations)

**Mitigation Strategies**:
1. Run full test suite before and after changes (regression detection)
2. Manual curl testing to verify redirect chain
3. Integration tests validate destination pages exist
4. Document rollback procedure (git revert commit)

---

### Rollback Plan

**If redirects cause issues**:
1. **Immediate rollback**: Vercel dashboard → Redeploy previous build
2. **Git revert**: `git revert <commit-hash>`
3. **Config rollback**: Remove 7 redirect rules from next.config.mjs
4. **Restart dev server**: `npm run dev` (for local testing)

**Monitoring**:
- Check Vercel logs for redirect errors
- Monitor 404 rate in analytics (should decrease)
- Validate external link health in Google Search Console

---

### Success Metrics

**Quantitative**:
- 7 new redirect rules added to next.config.mjs
- 0 test failures after implementation
- 100% of curl tests return 301 status
- 0 redirect loops detected
- Page load time impact: <10ms (redirects handled at edge)

**Qualitative**:
- Users with bookmarks reach correct pages
- External links no longer return 404
- SEO: Google Search Console shows 404 reduction
- Code review: Redirect structure consistent with existing patterns

---

### Post-Implementation Validation

**Checklist**:
1. [ ] All 7 redirects return 301 in production
2. [ ] All 7 destinations return 200 in production
3. [ ] Browser DevTools shows single-hop redirect
4. [ ] Google Search Console updated (submit redirect URLs for recrawl)
5. [ ] Analytics dashboards show 404 rate decrease
6. [ ] User acceptance: Stakeholder validates bookmarks work

---

## Related Requirements

**Prerequisites**:
- None (independent implementation)

**Builds Upon**:
- REQ-NAV-001 through REQ-NAV-005 (Phase 4 navigation fixes)
- Existing redirect configuration in next.config.mjs

**Enables**:
- REQ-SEO-001: URL canonicalization for search engines
- REQ-ANALYTICS-001: Reduced 404 tracking noise

---

## TDD Workflow Integration

### QNEW/QPLAN (This Document)
- Requirements captured with REQ-NAV-008 identifier
- Solution options analyzed (A, B, C)
- Option A selected (next.config.mjs redirects)
- Acceptance criteria defined
- Test strategy documented
- Story point estimate: 0.5 SP

### QCODET (Next Step)
**Agent**: test-writer
**Deliverables**:
1. Create `next.config.spec.ts` with failing unit tests
2. Extend `tests/integration/navigation-links.spec.ts` with failing redirect tests
3. Create `scripts/test-redirects.sh` manual test script
4. All tests reference REQ-NAV-008

**Test Coverage**:
- Unit: Redirect configuration structure validation
- Integration: HTTP 301 status validation, Location header validation
- Manual: curl verification script
- Regression: Existing redirects continue to work

**Blocking Rule**: Test writer must see failures before implementation begins.

### QCHECKT
**Agent**: pe-reviewer, test-writer
**Checklist**:
- [ ] Tests cover all 7 redirect rules
- [ ] Tests validate 301 status (not 302)
- [ ] Tests verify destination pages exist
- [ ] Regression tests for existing 6 redirects
- [ ] Manual test script documented with expected output
- [ ] Test names cite REQ-NAV-008

### QCODE
**Agent**: sde-iii, implementation-coordinator
**Implementation**:
1. Add 7 redirect rules to next.config.mjs (lines 57-99)
2. Run tests continuously (watch mode)
3. Verify all tests pass
4. Run quality gates: typecheck, lint, test
5. Manual verification with curl script

**Blocking Rule**: Implementation stops if any test fails.

### QCHECK
**Agent**: pe-reviewer, code-quality-auditor
**Review Checklist**:
- [ ] Redirect syntax matches existing patterns
- [ ] Comments reference REQ-NAV-008
- [ ] No duplicate sources
- [ ] All redirects marked permanent: true
- [ ] Code formatting consistent with existing config
- [ ] No accidental removal of existing redirects

### QDOC
**Agent**: docs-writer
**Documentation**:
1. Create `docs/technical/REDIRECTS.md` with:
   - Redirect mapping table
   - Testing procedures
   - curl examples
   - Troubleshooting guide
2. Update this requirements file with test results
3. Update CHANGELOG.md

### QGIT
**Agent**: release-manager
**Commit Message**:
```
feat(redirects): add nested-to-flat URL redirects (REQ-NAV-008, 0.5 SP)

- Add 7 redirect rules for nested WordPress URLs
- Redirect to flat slug structure used by Next.js
- All redirects are 301 permanent for SEO
- Integration tests validate redirect chain

BREAKING CHANGE: None (additive change only)

Closes REQ-NAV-008
```

**Deployment**:
1. Run pre-deployment gates (DEPLOY-002 checklist)
2. Create PR with test results
3. Vercel preview build → run manual test script
4. Merge to main
5. Validate production deployment
6. Monitor analytics for 404 rate decrease

---

## Planning Poker Estimate

**Baseline**: 1 SP = simple authenticated API (key→value, secured, tested, deployed, documented)

**Estimation Factors**:
- **Complexity**: Low (config file update, extends existing pattern)
- **Risk**: Low (additive change, no modifications to existing redirects)
- **Testing**: Medium (integration tests, manual verification, regression testing)
- **Documentation**: Low (single technical doc, update requirements)
- **Unknowns**: None (Next.js redirect API well-documented, existing examples in codebase)

**Calculation**:
- Config update: 0.1 SP (straightforward addition)
- Unit tests: 0.1 SP (validate configuration structure)
- Integration tests: 0.2 SP (HTTP status validation, extend existing test file)
- Manual test script: 0.05 SP (bash script with curl)
- Documentation: 0.05 SP (technical doc, CHANGELOG update)
- **Total**: 0.5 SP

**Comparison to Baseline**:
- Simpler than 1 SP baseline (no authentication, no database, no API)
- Mostly configuration and testing
- Low risk of breakage (additive change)

**Story Point**: **0.5 SP**

---

## Appendix A: Redirect Testing Checklist

**Pre-Implementation**:
- [ ] Verify destination pages exist (content/pages/*.mdoc)
- [ ] Check navigation config uses correct flat slugs
- [ ] Review existing redirects for patterns

**During Implementation**:
- [ ] Add redirect rules to next.config.mjs
- [ ] Write unit tests for redirect configuration
- [ ] Extend integration tests for 301 status validation
- [ ] Create manual curl test script
- [ ] Run quality gates (typecheck, lint, test)

**Post-Implementation**:
- [ ] Restart dev server (see changes)
- [ ] Run manual test script on localhost
- [ ] Deploy to Vercel preview
- [ ] Run manual test script on preview URL
- [ ] Validate redirect chain in browser DevTools
- [ ] Check all 7 redirects return 301
- [ ] Check all 7 destinations return 200
- [ ] Run full test suite (confirm no regressions)

**Production Validation**:
- [ ] Deploy to production
- [ ] Run manual test script on production URL
- [ ] Validate in Google Search Console
- [ ] Monitor 404 rate in analytics
- [ ] User acceptance testing (stakeholder validates bookmarks)

---

## Appendix B: SEO Impact Analysis

**Before Redirects**:
- External links to `/work-at-camp/summer-staff` return 404
- Search engines see broken links (negative ranking signal)
- Users bounce back to search results (high bounce rate)
- Link equity lost (backlinks don't pass PageRank)

**After Redirects**:
- 301 permanent redirects signal URL canonicalization
- Link equity preserved (PageRank flows through 301)
- Search engines update index with new URLs
- User experience improved (bookmarks work)
- 404 rate decreases in analytics

**Google Search Console Actions**:
1. Submit redirect URLs for recrawl (Fetch as Google)
2. Monitor "Coverage" report for 404 reduction
3. Check "Links" report for updated backlink destinations
4. Validate mobile usability (redirects work on mobile)

---

## Appendix C: Example curl Output

**Testing Redirect Chain**:

```bash
# Test nested URL redirect
$ curl -I http://localhost:3000/work-at-camp/summer-staff

HTTP/1.1 301 Moved Permanently
Location: /summer-staff
Date: Wed, 04 Dec 2025 12:00:00 GMT
```

```bash
# Test destination URL loads successfully
$ curl -I http://localhost:3000/summer-staff

HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Date: Wed, 04 Dec 2025 12:00:01 GMT
```

**Production Testing**:

```bash
# Test on production
$ curl -I https://bearlakecamp.com/work-at-camp/summer-staff

HTTP/2 301
location: https://bearlakecamp.com/summer-staff
date: Wed, 04 Dec 2025 12:00:00 GMT
server: Vercel
x-vercel-id: sfo1::xxxxxx
```

---

**End of Requirements Document**

**Next Steps**:
1. User approval of requirements
2. Lock requirements → `requirements/requirements.lock.md`
3. Execute QCODET (test-writer creates failing tests)
4. Execute QCODE (sde-iii implements redirects)
5. Execute QCHECK (pe-reviewer validates)
6. Execute QDOC (docs-writer creates technical documentation)
7. Execute QGIT (release-manager deploys)
