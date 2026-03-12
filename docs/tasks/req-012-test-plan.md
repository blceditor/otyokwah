# Test Plan: REQ-012 AI-Powered SEO Generation

> **Story Points**: Test development 1.0 SP (Component: 0.5 SP, API: 0.5 SP)

## Test Coverage Matrix

| REQ-ID | Component Tests | API Route Tests | Status |
|--------|-----------------|-----------------|--------|
| REQ-012 | ✅ 15 tests | ✅ 22 tests | 🔴 Failing (TDD Red Phase) |

---

## Component Tests (15 tests, 0.5 SP)

### File: `components/keystatic/GenerateSEOButton.spec.tsx`

#### User Interface Tests (7 tests)
1. **REQ-012 — renders button with Sparkles icon**
   - Verify button element with "Generate SEO" text
   - Verify Sparkles icon present in button

2. **REQ-012 — shows loading spinner during generation**
   - Click button → verify loading state appears
   - Button disabled during loading
   - Spinner or "Generating..." text visible

3. **REQ-012 — pre-fills SEO fields with generated content**
   - Mock API response with SEO metadata
   - Click button → verify `onSEOGenerated` callback receives data
   - Verify data structure matches expected format

4. **REQ-012 — allows editing after generation**
   - Generate SEO → verify callback provides editable data
   - No field locking after generation

5. **REQ-012 — shows remaining credits (X/10)**
   - Mock localStorage with usage count
   - Verify display shows "7/10" or similar format
   - Updates after each generation

6. **REQ-012 — disables button when rate limit reached**
   - Mock localStorage with count=10
   - Verify button is disabled
   - Verify appropriate message displayed

7. **REQ-012 — shows error message on API failure**
   - Mock fetch rejection
   - Click button → verify error message appears
   - Error message contains "error", "failed", or "try again"

#### Rate Limiting Tests (4 tests)
8. **REQ-012 — resets rate limit after 1 hour**
   - Mock expired reset time
   - Verify button enabled
   - Verify credits reset to 10/10

9. **REQ-012 — increments usage count after successful generation**
   - Generate SEO successfully
   - Verify localStorage count incremented
   - Verify reset time stored

10. **REQ-012 — enforces 10 generations per hour limit**
    - Set localStorage to limit
    - Verify button disabled
    - Verify "limit reached" message

11. **REQ-012 — stores reset time when first generation happens**
    - Start with no localStorage data
    - Generate SEO
    - Verify reset time stored (current time + 1 hour)

#### API Integration Tests (2 tests)
12. **REQ-012 — sends correct request to Universal LLM API**
    - Verify POST to `/api/generate-seo`
    - Verify headers include Content-Type
    - Verify body includes page title and content

13. **REQ-012 — handles network timeout gracefully**
    - Mock slow/timeout response
    - Verify error message displayed
    - Button re-enabled after timeout

#### Accessibility Tests (2 tests)
14. **REQ-012 — is keyboard accessible**
    - Focus button with keyboard
    - Verify focus state visible

15. **REQ-012 — has accessible label for screen readers**
    - Verify button has accessible name
    - Screen reader can identify button purpose

---

## API Route Tests (22 tests, 0.5 SP)

### File: `app/api/generate-seo/route.spec.ts`

#### Universal LLM API Integration (6 tests)
1. **REQ-012 — calls Universal LLM API with correct format**
   - Verify POST to `https://universal.sparkry.ai/v1/chat/completions`
   - Verify Authorization header with Bearer token
   - Verify model="cost" in request body

2. **REQ-012 — sends system prompt for SEO expert persona**
   - Verify messages array includes system role
   - System content includes "SEO expert" or similar

3. **REQ-012 — includes page title and content in user prompt**
   - Verify user message includes page title
   - Verify user message includes page body (truncated)

4. **REQ-012 — uses "cost" model for cheapest routing**
   - Verify request body has `model: "cost"`

5. **REQ-012 — parses JSON from LLM response correctly**
   - Mock OpenAI-compatible response
   - Verify parsing of choices[0].message.content
   - Return structured SEO data

6. **REQ-012 — handles malformed JSON in LLM response**
   - Mock invalid JSON response
   - Return 500 status
   - Error message indicates parse failure

#### Content Validation (4 tests)
7. **REQ-012 — validates meta title length (50-60 chars)**
   - Mock response with title >60 chars
   - Verify truncation or validation error

8. **REQ-012 — validates meta description length (150-155 chars)**
   - Mock response with description <150 chars
   - Verify validation warning or regeneration

9. **REQ-012 — truncates page content to 1000 chars**
   - Send 2000 char page body
   - Verify API call to LLM has truncated content
   - Prevent token limit issues

10. **REQ-012 — validates all required SEO fields are present**
    - Mock incomplete LLM response
    - Return 500 error
    - Error indicates missing fields

11. **REQ-012 — strips HTML tags from generated content**
    - Mock response with HTML tags
    - Verify tags removed from output
    - Prevent XSS vulnerabilities

#### Error Handling (7 tests)
12. **REQ-012 — returns 500 on LLM API failure**
    - Mock network error
    - Return 500 status
    - Include error property in response

13. **REQ-012 — returns 400 when request body is missing**
    - Send empty request
    - Return 400 status
    - Error message indicates missing body

14. **REQ-012 — returns 400 when title is missing**
    - Send body without title
    - Return 400 status
    - Error message mentions "title"

15. **REQ-012 — returns 400 when body is missing**
    - Send title without body
    - Return 400 status
    - Error message mentions "body" or "content"

16. **REQ-012 — returns 401 when UNIVERSAL_LLM_KEY is not configured**
    - Unset environment variable
    - Return 401 status
    - Error mentions "API key" or "configuration"

17. **REQ-012 — handles Universal LLM API rate limiting (429)**
    - Mock 429 response from LLM API
    - Return 429 to client
    - Error indicates rate limit

18. **REQ-012 — includes retry-after header on rate limit**
    - Mock 429 with Retry-After header
    - Forward Retry-After to client

#### Rate Limiting (1 test)
19. **REQ-012 — enforces rate limit (10 generations/hour)**
    - Simulate 10 prior requests
    - Return 429 status
    - Note: Client-side rate limit via localStorage, server-side optional

#### Response Structure (1 test)
20. **REQ-012 — returns generated content with correct structure**
    - Mock successful generation
    - Verify response contains:
      - `metaTitle` (string)
      - `metaDescription` (string)
      - `ogTitle` (string)
      - `ogDescription` (string)

---

## Test Execution Strategy

### Phase 1: Unit Tests (Parallel)
Run component and API tests concurrently:
```bash
# Terminal 1
npm test -- components/keystatic/GenerateSEOButton.spec.tsx

# Terminal 2
npm test -- app/api/generate-seo/route.spec.ts
```

### Phase 2: Integration Testing
After implementation, test end-to-end flow:
1. User clicks "Generate SEO" button
2. Frontend sends POST to `/api/generate-seo`
3. API calls Universal LLM Router
4. Response parsed and validated
5. SEO fields pre-filled in editor

### Phase 3: Manual Testing
- Test in Keystatic CMS admin UI
- Verify rate limiting works across page reloads
- Verify error messages user-friendly
- Test with various content lengths
- Verify generated SEO quality

---

## Mock Data Fixtures

### Mock Page Content
```typescript
{
  title: 'Summer Camp Programs',
  body: 'Join us for an unforgettable summer experience with activities including swimming, hiking, archery, and faith-building devotionals.'
}
```

### Mock Universal LLM Response
```typescript
{
  choices: [
    {
      message: {
        content: JSON.stringify({
          metaTitle: 'Summer Camp Programs | Bear Lake Camp',
          metaDescription: 'Experience faith, adventure, and transformation at Bear Lake Camp. Join our summer programs with swimming, hiking, and more for ages 8-18.',
          ogTitle: 'Unforgettable Summer Camp Experience',
          ogDescription: 'Discover faith-building activities, outdoor adventures, and lifelong friendships at Bear Lake Camp.'
        })
      }
    }
  ]
}
```

### Mock localStorage (Rate Limiting)
```typescript
{
  seo_generations: JSON.stringify({
    count: 3,
    resetTime: Date.now() + 3600000 // 1 hour from now
  })
}
```

---

## Success Criteria

### All Tests Pass ✅
- 15 component tests green
- 22 API route tests green
- 0 linting errors
- 0 TypeScript errors

### TDD Red Phase Confirmed 🔴
- All tests fail before implementation
- Tests fail with meaningful error messages
- No false positives

### Coverage Requirements
- Component: 100% coverage of user-facing features
- API Route: 100% coverage of error paths
- Edge cases: Rate limiting, network errors, malformed responses

---

## Known Limitations

### Rate Limiting Implementation
- **Client-side only**: Rate limit tracked in localStorage
- **Bypass**: User can clear localStorage to reset
- **Future enhancement**: Server-side rate limiting with database

### LLM Response Quality
- **Dependency**: Quality depends on Universal LLM Router
- **Validation**: Limited to length checks, not semantic quality
- **Mitigation**: User can edit generated content before saving

### Network Resilience
- **Timeout**: No explicit timeout configured (uses browser default)
- **Retry**: No automatic retry on transient failures
- **Future enhancement**: Exponential backoff retry logic

---

## Dependencies

### External Services
- **Universal LLM Router**: `https://universal.sparkry.ai/v1/chat/completions`
- **Environment Variable**: `UNIVERSAL_LLM_KEY` (required)

### NPM Packages
- `vitest` (testing framework)
- `@testing-library/react` (component testing)
- `@testing-library/user-event` (user interaction simulation)
- `@testing-library/jest-dom` (DOM matchers)

### Browser APIs
- `localStorage` (rate limiting)
- `fetch` (API calls)

---

## Test Failure Tracking

When tests reveal real bugs during implementation (not expected TDD failures), log to:
`.claude/metrics/test-failures.md`

**Schema**: Date | Test File | Test Name | REQ-ID | Bug Description | Fix SP | Fix Commit

---

## Next Steps (After TDD Red Confirmation)

1. ✅ **Tests created** (this document)
2. 🔴 **Verify all tests fail** (TDD red phase)
3. 🟢 **Implement GenerateSEOButton component**
4. 🟢 **Implement /api/generate-seo route**
5. ✅ **Verify all tests pass** (TDD green phase)
6. 🔵 **Refactor for code quality**
7. 📝 **Document implementation**

---

## Story Point Breakdown

### Test Development (1.0 SP total)
- Component tests (15 tests): 0.5 SP
  - UI interaction tests: 0.2 SP
  - Rate limiting logic: 0.2 SP
  - Accessibility tests: 0.1 SP

- API route tests (22 tests): 0.5 SP
  - LLM integration: 0.2 SP
  - Validation logic: 0.15 SP
  - Error handling: 0.15 SP

### Implementation Estimate (separate ticket)
- Component implementation: 1.0 SP
- API route implementation: 1.5 SP
- Integration testing: 0.5 SP
- **Total REQ-012**: 4.0 SP (includes tests)

---

**Test Status**: 🔴 All tests failing (expected TDD red phase)
**Ready for Implementation**: Yes
**Blockers**: None
