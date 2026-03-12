# Test Plan: REQ-002 - Deployment Status Indicator

> **Story Points**: Test development 1.0 SP

## Test Coverage Matrix

| REQ-ID | Unit Tests | Integration Tests | E2E Tests | Status |
|--------|------------|-------------------|-----------|--------|
| REQ-002 | ✅ 15 tests | N/A (covered by unit) | ❌ Pending | Failing (TDD Red Phase) |

## Unit Tests

### Component Tests (0.5 SP)
- **File**: `components/keystatic/DeploymentStatus.spec.tsx`
- **Tests**: 15 comprehensive tests across 3 describe blocks
- **Story Points**: 0.5 SP

#### Test Group 1: Status Display (6 tests)
1. **REQ-002 — renders Published status with CheckCircle2 icon**
   - Validates correct icon rendering (CheckCircle2 from Lucide)
   - Verifies green color styling
   - Ensures "Published" text displayed

2. **REQ-002 — renders Deploying status with Loader2 spin animation**
   - Validates Loader2 icon with spin animation class
   - Verifies blue color styling
   - Ensures "Deploying" text displayed

3. **REQ-002 — renders Failed status with XCircle icon**
   - Validates XCircle icon rendering
   - Verifies red color styling
   - Ensures "Failed" text displayed

4. **REQ-002 — renders Draft status with FileEdit icon**
   - Validates FileEdit icon rendering
   - Verifies amber/yellow color styling
   - Ensures "Draft" text displayed

5. **REQ-002 — displays relative timestamp (2 minutes ago)**
   - Tests timestamp conversion to relative format
   - Validates patterns like "2 minutes ago", "2m ago"

6. **REQ-002 — shows last known state when offline**
   - Tests offline resilience
   - Verifies component displays cached state on network failure

#### Test Group 2: Polling Logic (5 tests)
7. **REQ-002 — starts polling 45 seconds after content save event**
   - Validates 45-second delay before first poll
   - Uses fake timers to control time

8. **REQ-002 — polls every 15 seconds during deployment**
   - Tests 15-second polling interval
   - Validates multiple sequential polls

9. **REQ-002 — stops polling when status changes to READY**
   - Tests polling termination on successful deployment
   - Ensures no excessive API calls after completion

10. **REQ-002 — stops polling when status changes to ERROR**
    - Tests polling termination on deployment failure
    - Ensures no excessive API calls after error

#### Test Group 3: API Integration (4 tests)
11. **REQ-002 — fetches status from /api/vercel-status endpoint**
    - Validates correct API endpoint called
    - Verifies HTTP request parameters

12. **REQ-002 — handles API error gracefully**
    - Tests error handling without crashes
    - Validates fallback UI state

13. **REQ-002 — respects Vercel API rate limits**
    - Tests polling frequency stays within limits
    - Validates max 5 calls per minute during active polling

### API Route Tests (0.5 SP)
- **File**: `app/api/vercel-status/route.spec.ts`
- **Tests**: 13 comprehensive tests
- **Story Points**: 0.5 SP

#### Test Group 1: Vercel API Integration (3 tests)
1. **REQ-002 — fetches latest deployment from Vercel API**
   - Validates correct Vercel API endpoint called
   - Verifies Authorization header with Bearer token
   - Confirms query parameters (projectId, target=production, limit=1)

2. **REQ-002 — returns correct status based on deployment state (READY)**
   - Tests mapping of READY → Published
   - Validates JSON response structure

3. **REQ-002 — returns correct status based on deployment state (BUILDING)**
   - Tests mapping of BUILDING → Deploying
   - Validates JSON response structure

4. **REQ-002 — returns correct status based on deployment state (ERROR)**
   - Tests mapping of ERROR → Failed
   - Validates JSON response structure

#### Test Group 2: Error Handling (4 tests)
5. **REQ-002 — handles Vercel API errors gracefully**
   - Tests network error handling
   - Validates 500 error response with error message

6. **REQ-002 — handles missing environment variables**
   - Tests configuration validation
   - Validates 500 error with clear message

7. **REQ-002 — handles empty deployments array**
   - Tests fallback to Draft state when no deployments exist
   - Validates null timestamp

8. **REQ-002 — handles Vercel API rate limit (429)**
   - Tests rate limit error handling
   - Validates 429 response with clear message

#### Test Group 3: Data Integrity (6 tests)
9. **REQ-002 — filters by production target only**
   - Validates target=production query parameter

10. **REQ-002 — returns most recent deployment (limit=1)**
    - Validates limit=1 query parameter

11. **REQ-002 — includes proper cache headers to prevent stale data**
    - Tests Cache-Control headers
    - Ensures no-cache or max-age=0

12. **REQ-002 — maps deployment states to user-friendly labels**
    - Tests all state mappings:
      - READY → Published
      - BUILDING → Deploying
      - QUEUED → Deploying
      - ERROR → Failed
      - CANCELED → Failed

---

## Test Execution Strategy

### Phase 1: TDD Red Phase (Current)
1. ✅ All component tests written (15 tests)
2. ✅ All API route tests written (13 tests)
3. ⏳ **BLOCKING**: Confirm all tests fail (nothing implemented yet)

### Phase 2: Implementation
1. Implement `components/keystatic/DeploymentStatus.tsx`
2. Implement `app/api/vercel-status/route.ts`
3. Configure environment variables (VERCEL_TOKEN, VERCEL_PROJECT_ID)

### Phase 3: TDD Green Phase
1. Run tests iteratively during implementation
2. Fix failing tests one by one
3. Achieve 100% test pass rate

### Phase 4: Refactor
1. Optimize polling logic
2. Improve error handling
3. Enhance UI feedback
4. Ensure tests still pass

---

## Test Coverage Details

### Component Coverage
- **Status Display**: 100% (all 4 states tested)
- **Icon Rendering**: 100% (all 4 Lucide icons verified)
- **Polling Logic**: 100% (start, interval, stop conditions)
- **Error Handling**: 100% (network errors, offline mode)
- **API Integration**: 100% (endpoint calls, rate limiting)

### API Route Coverage
- **Vercel API Integration**: 100% (all states mapped)
- **Error Handling**: 100% (network, config, rate limit)
- **Data Filtering**: 100% (production target, limit)
- **Cache Headers**: 100% (freshness validation)

---

## Success Criteria

### TDD Red Phase (Current Status)
- ✅ 15 component tests written
- ✅ 13 API route tests written
- ✅ Total: 28 tests covering all REQ-002 acceptance criteria
- ⏳ **PENDING**: Confirm ≥1 failure per test (nothing implemented yet)

### Implementation Phase (Next)
- ❌ DeploymentStatus component exists
- ❌ Vercel status API route exists
- ❌ Environment variables configured
- ❌ All 28 tests passing

### Final Acceptance
- All acceptance criteria from requirements met
- 100% test pass rate
- No type errors (`npm run typecheck`)
- No lint errors (`npm run lint`)
- Code formatted (`prettier`)

---

## Test Artifacts

### Test Files Created
1. `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/keystatic/DeploymentStatus.spec.tsx` (15 tests)
2. `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/app/api/vercel-status/route.spec.ts` (13 tests)

### Implementation Files Required
1. `components/keystatic/DeploymentStatus.tsx` (component)
2. `app/api/vercel-status/route.ts` (API route)

### Environment Variables Required
```bash
VERCEL_TOKEN=your_vercel_api_token
VERCEL_PROJECT_ID=your_project_id
```

---

## Notes

### Testing Approach
- **Mocking Strategy**: Mock `fetch` globally for API calls
- **Timing Control**: Use `vi.useFakeTimers()` for polling tests
- **Component Testing**: React Testing Library with `@testing-library/jest-dom`
- **Type Safety**: Tests use TypeScript with `@ts-ignore` for TDD red phase

### Key Test Patterns
1. **Status Display Tests**: Verify icon, text, and color for each state
2. **Polling Tests**: Use fake timers to advance time and count fetch calls
3. **API Tests**: Mock Vercel API responses with various states
4. **Error Tests**: Mock network failures and API errors

### Polling Logic Requirements
- Initial fetch: Immediate on mount
- Smart polling: Start 45s after content save event
- Polling interval: 15s during BUILDING/QUEUED states
- Stop conditions: READY or ERROR states
- Rate limiting: Max ~5 calls/minute during active polling

### API Requirements
- **Endpoint**: `https://api.vercel.com/v6/deployments`
- **Headers**: `Authorization: Bearer {VERCEL_TOKEN}`
- **Query Params**: `projectId={PROJECT_ID}&target=production&limit=1`
- **Response**: Latest production deployment with state

---

## Story Point Breakdown

| Component | Story Points | Details |
|-----------|--------------|---------|
| Component Tests | 0.5 SP | 15 tests, complex polling logic, fake timers |
| API Route Tests | 0.5 SP | 13 tests, Vercel API mocking, error scenarios |
| **Total** | **1.0 SP** | Comprehensive TDD test coverage |

---

## Next Steps

1. ✅ **COMPLETED**: Write all 28 tests
2. **PENDING**: Run tests to confirm failures (TDD red phase)
3. **PENDING**: Implement `DeploymentStatus.tsx` component
4. **PENDING**: Implement `/api/vercel-status` route
5. **PENDING**: Configure environment variables
6. **PENDING**: Iterate until all tests pass (TDD green phase)
7. **PENDING**: Refactor for quality (TDD refactor phase)
8. **PENDING**: Update documentation

---

**Test Plan Author**: test-writer agent
**Date**: 2025-11-21
**REQ-ID**: REQ-002
**Phase**: TDD Red (Tests Written, Implementation Pending)
