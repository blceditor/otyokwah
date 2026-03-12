# Test Plan: REQ-006 Bug Submission to GitHub

> **Story Points**: Test development 0.8 SP

## Test Coverage Matrix

| REQ-ID | Unit Tests | Integration Tests | E2E Tests | Status |
|--------|------------|-------------------|-----------|--------|
| REQ-006 | ✅ 16 tests | ❌ Pending | ❌ Pending | Failing (TDD red phase) |

## Component Tests (10 tests)

**File**: `components/keystatic/BugReportModal.spec.tsx`
**Story Points**: 0.5 SP

### Test Suite: BugReportModal Component

1. **REQ-006 — modal opens on button click**
   - Validates trigger button exists
   - Confirms dialog not visible initially
   - Verifies dialog appears after click
   - Uses `role="dialog"` query

2. **REQ-006 — form has title and description fields (required)**
   - Checks for title input with required attribute
   - Checks for description textarea with required attribute
   - Uses accessible label queries

3. **REQ-006 — include context checkbox checked by default**
   - Finds checkbox via accessible role
   - Validates default checked state
   - Tests user can uncheck if desired

4. **REQ-006 — captures current page slug**
   - Mocks `onSubmit` handler
   - Verifies slug included in submission payload
   - Tests with nested slug: `about/staff`

5. **REQ-006 — captures browser info (userAgent)**
   - Mocks `window.navigator.userAgent`
   - Validates browser info in context object
   - Tests with realistic userAgent string

6. **REQ-006 — form validation prevents empty submission**
   - Attempts submission with empty fields
   - Verifies `onSubmit` not called
   - Confirms validation error messages appear

7. **REQ-006 — shows success message after submission**
   - Mocks successful API response
   - Submits valid bug report
   - Verifies success message displayed

8. **REQ-006 — closes modal after successful submission**
   - Confirms modal open before submission
   - Submits valid form
   - Verifies dialog removed from DOM

9. **REQ-006 — shows error message if submission fails**
   - Mocks failed API response (500)
   - Submits form
   - Verifies error message displayed to user

10. **REQ-006 — modal accessible (ARIA, keyboard nav)**
    - Checks dialog has ARIA attributes
    - Validates close button accessible
    - Tests ESC key closes modal
    - Ensures keyboard navigation works

## API Route Tests (6 tests)

**File**: `app/api/submit-bug/route.spec.ts`
**Story Points**: 0.3 SP

### Test Suite: Bug Submission API

1. **REQ-006 — creates GitHub issue with correct format**
   - Mocks GitHub API
   - Verifies POST to correct endpoint
   - Validates Authorization header
   - Confirms issue title included

2. **REQ-006 — includes captured context in issue body**
   - Verifies markdown formatted body
   - Checks for Context section
   - Validates page slug included
   - Confirms field values present
   - Tests browser info included

3. **REQ-006 — applies labels: bug, cms-reported**
   - Parses request to GitHub
   - Validates `labels` array contains both labels
   - Ensures exact label names match

4. **REQ-006 — enforces rate limit (5 reports/hour)**
   - Submits 5 bug reports successfully
   - Verifies all return 201
   - Confirms 6th request returns 429
   - Tests rate limit per user/session

5. **REQ-006 — returns 429 when rate limit exceeded**
   - Fills rate limit quota
   - Attempts additional submission
   - Validates 429 status code
   - Checks for `retryAfter` in response
   - Confirms error message mentions rate limit

6. **REQ-006 — returns 500 on GitHub API failure**
   - Mocks GitHub API returning 500
   - Submits bug report
   - Verifies route returns 500
   - Validates error message in response

## Additional Test Coverage (Bonus Tests)

**File**: `app/api/submit-bug/route.spec.ts` (additional scenarios)

7. **REQ-006 — handles GitHub API authentication error (401)**
   - Mocks GitHub 401 response
   - Verifies internal server error (don't expose auth details)

8. **REQ-006 — validates required fields (title, description)**
   - Tests missing title returns 400
   - Tests missing description returns 400
   - Validates error messages

9. **REQ-006 — generates markdown formatted issue body**
   - Verifies markdown structure
   - Checks for headers (##, ###)
   - Validates code blocks for JSON context
   - Tests all expected sections present

10. **REQ-006 — omits context when includeContext is false**
    - Submits with `includeContext: false`
    - Confirms no Context section in body
    - Validates basic info still included

11. **REQ-006 — returns issue URL in response**
    - Mocks GitHub response with issue URL
    - Validates response includes `issueUrl`
    - Checks for issue number in response

## Test Execution Strategy

### Phase 1: Component Tests (Parallel)
```bash
npm test -- components/keystatic/BugReportModal.spec.tsx
```
**Expected**: 10 tests, all failing (no implementation yet)

### Phase 2: API Route Tests (Parallel)
```bash
npm test -- app/api/submit-bug/route.spec.ts
```
**Expected**: 11 tests, all failing (no implementation yet)

### Phase 3: Integration Tests (After Implementation)
**File**: `tests/integration/bug-submission.spec.ts` (to be created)
- Full flow: open modal → submit → create GitHub issue
- Real GitHub API interaction (test repo)

## Mock Strategies

### Component Tests
- **User Interactions**: `@testing-library/user-event`
- **API Responses**: `global.fetch = vi.fn()`
- **Browser APIs**: Mock `navigator.userAgent`
- **Router Context**: Not needed (modal is self-contained)

### API Route Tests
- **GitHub API**: Mock `fetch()` with various responses
- **Rate Limiting**: Mock timestamp storage (localStorage/memory)
- **Environment Variables**: `vi.stubEnv()`

## Test Data Fixtures

### Mock Page Context
```typescript
{
  slug: 'about/staff',
  fieldValues: {
    title: 'Staff Page',
    content: 'Meet our amazing team'
  },
  timestamp: '2025-11-21T10:00:00Z'
}
```

### Mock GitHub Response
```typescript
{
  id: 123456789,
  number: 42,
  html_url: 'https://github.com/sparkst/bearlakecamp/issues/42',
  title: 'Issue title'
}
```

## Expected Test Failures (TDD Red Phase)

All tests are expected to fail with:
- `Cannot find module './BugReportModal'`
- `Cannot find module './route'`

This is intentional - we write failing tests first, then implement to make them pass.

## Success Criteria

✅ **Phase 1 Complete**: All 16 tests written and failing
⬜ **Phase 2 Complete**: Component implementation passes 10 tests
⬜ **Phase 3 Complete**: API route implementation passes 11 tests
⬜ **Phase 4 Complete**: Integration tests pass
⬜ **Phase 5 Complete**: Manual QA confirms functionality

## Story Point Breakdown

| Task | Story Points | Status |
|------|--------------|--------|
| Write component tests | 0.5 SP | ✅ Complete |
| Write API route tests | 0.3 SP | ✅ Complete |
| Integration test planning | 0.1 SP | ⬜ Pending |
| **Total Test Development** | **0.9 SP** | **In Progress** |

## Notes

- Tests use TypeScript `@ts-ignore` for unimplemented modules (intentional)
- Component tests use `require()` to support dynamic imports
- Rate limiting tests use in-memory storage (not persistent)
- GitHub API tests use full mocking (no real API calls)
- All tests follow naming convention: `REQ-006 — description`

## References

- **Requirement**: `requirements/new-features.md` § REQ-006
- **Test Best Practices**: `CLAUDE.md` § Test Writing Guidelines
- **Testing Framework**: Vitest + Testing Library
- **Mock Library**: Vitest built-in mocking
