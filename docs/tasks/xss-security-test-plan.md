# Test Plan: XSS Security Fix for SplitContent Component

> **Story Points**: 0.5 SP (test development)
> **REQ-ID**: REQ-SEC-001
> **Status**: Tests written and failing (implementation pending)

## Overview

Comprehensive failing tests written for XSS vulnerability in `SplitContent` component (`components/content/SplitContent.tsx:40`). The component currently uses `dangerouslySetInnerHTML` without sanitization, exposing users to cross-site scripting attacks.

## Test Coverage Matrix

| REQ-ID      | Test Category           | Tests | Status     | Priority |
|-------------|-------------------------|-------|------------|----------|
| REQ-SEC-001 | Script Injection        | 2     | FAILING ✓  | P0       |
| REQ-SEC-001 | Event Handler Injection | 3     | FAILING ✓  | P0       |
| REQ-SEC-001 | Protocol Exploits       | 2     | FAILING ✓  | P0       |
| REQ-SEC-001 | Embedded Content        | 2     | FAILING ✓  | P0       |
| REQ-SEC-001 | DOM Clobbering          | 1     | FAILING ✓  | P1       |
| REQ-SEC-001 | Mutation XSS            | 1     | FAILING ✓  | P1       |
| REQ-SEC-001 | Safe HTML Preservation  | 2     | PASSING ✓  | P0       |
| REQ-SEC-001 | Edge Cases              | 2     | PASSING ✓  | P1       |

**Total Tests**: 15 security tests
**Failing Tests**: 10 (expected, no sanitization implemented)
**Passing Tests**: 5 (safe HTML and edge cases that don't require sanitization)

## Test Suite Details

### File: `components/content/SplitContent.spec.tsx`

#### 1. Script Injection Tests (P0)

**Test**: "strips script tags from content"
```typescript
MALICIOUS_CONTENT = '<p>Safe content</p><script>alert("XSS")</script><p>More content</p>'
```
- **Assertion**: No `<script>` elements in rendered output
- **Expected**: Removes script tags while preserving safe content
- **Status**: FAILING ✓ (found 1 script tag, expected 0)

**Test**: "handles SVG with embedded scripts"
```typescript
MALICIOUS_CONTENT = '<svg onload="alert(\'XSS\')"><script>alert("XSS")</script></svg>'
```
- **Assertion**: No `onload` attribute on SVG, no script tags
- **Status**: FAILING ✓ (script tag present, onload attribute present)

#### 2. Event Handler Injection Tests (P0)

**Test**: "removes inline event handlers from content"
```typescript
MALICIOUS_CONTENT = '<p onclick="alert(\'XSS\')">Click me</p><img src="x" onerror="alert(\'XSS\')" />'
```
- **Assertion**: No attributes starting with "on" (onclick, onerror, onmouseover, etc.)
- **Status**: FAILING ✓ (found onclick, onerror attributes)

**Test**: "sanitizes multiple XSS vectors in single content string"
```typescript
MULTI_VECTOR_CONTENT = script + onerror + javascript: + iframe + onclick + svg/onload
```
- **Assertion**: All event handlers removed, scripts removed, javascript: protocol neutralized
- **Status**: FAILING ✓ (multiple XSS vectors present)

**Test**: "prevents mutation XSS (mXSS) attacks"
```typescript
MXSS_CONTENT = '<noscript><form><math>...</form><img src onerror=alert(1)>'
```
- **Assertion**: No event handlers after DOM mutation
- **Status**: FAILING ✓ (event handlers detected)

#### 3. Protocol Exploits (P0)

**Test**: "neutralizes javascript: protocol in links"
```typescript
MALICIOUS_CONTENT = '<a href="javascript:alert(\'XSS\')">Click me</a>'
```
- **Assertion**: No `href` attributes containing "javascript:"
- **Status**: FAILING ✓ (javascript: protocol found)

**Test**: "removes data: URIs that could contain malicious content"
```typescript
MALICIOUS_CONTENT = '<img src="data:text/html,<script>alert(\'XSS\')</script>" />'
```
- **Assertion**: Data URIs with text/html MIME type removed
- **Status**: FAILING ✓ (data:text/html URIs present)

#### 4. Embedded Content (P0)

**Test**: "removes malicious iframe tags"
```typescript
MALICIOUS_CONTENT = '<p>Safe</p><iframe src="https://evil.com/malware"></iframe>'
```
- **Assertion**: No `<iframe>` elements
- **Status**: FAILING ✓ (found 1 iframe, expected 0)

**Test**: "removes malicious object and embed tags"
```typescript
MALICIOUS_CONTENT = '<object data="https://evil.com"></object><embed src="malware.swf">'
```
- **Assertion**: No `<object>` or `<embed>` elements
- **Status**: FAILING ✓ (found object tag)

#### 5. DOM Clobbering (P1)

**Test**: "prevents DOM clobbering attacks"
```typescript
MALICIOUS_CONTENT = '<form name="createElement"><input name="innerHTML"></form>'
```
- **Assertion**: Dangerous `name` attributes removed (createElement, innerHTML, body, etc.)
- **Status**: FAILING ✓ (dangerous name attributes present)

#### 6. Style-Based XSS (P1)

**Test**: "removes style tags that could contain expression-based XSS"
```typescript
MALICIOUS_CONTENT = '<style>body { background: expression(alert("XSS")); }</style>'
```
- **Assertion**: No `<style>` elements
- **Status**: FAILING ✓ (found 1 style tag)

#### 7. Safe HTML Preservation (P0)

**Test**: "preserves safe HTML elements (paragraphs, headings, links)"
```typescript
SAFE_HTML = '<h3>Subheading</h3><p><strong>bold</strong></p><a href="/safe">Link</a>'
```
- **Assertion**: All safe elements preserved with correct attributes
- **Status**: PASSING ✓

**Test**: "preserves safe HTML5 elements (article, section, aside)"
```typescript
SAFE_HTML5 = '<article><section><h4>Heading</h4></section></article>'
```
- **Assertion**: HTML5 semantic elements preserved
- **Status**: PASSING ✓

#### 8. Edge Cases (P1)

**Test**: "handles empty content string safely"
```typescript
EMPTY_CONTENT = ''
```
- **Assertion**: No errors thrown
- **Status**: PASSING ✓

**Test**: "handles malformed HTML gracefully"
```typescript
MALFORMED_HTML = '<p>Unclosed<div>Nested incorrectly<strong>Bold</div>'
```
- **Assertion**: No errors, content still visible
- **Status**: PASSING ✓

## Test Execution Results

### Run Command
```bash
npm test -- components/content/SplitContent.spec.tsx
```

### Output Summary
```
Total Tests:   22 (7 existing + 15 security)
Passed:        12 (7 existing + 5 security edge cases)
Failed:        10 (all expected security vulnerabilities)
Duration:      128ms
```

### Sample Failures (Expected)

```
FAIL  strips script tags from content
  AssertionError: expected <script></script> to have a length of +0 but got 1
  ❯ components/content/SplitContent.spec.tsx:172:28

FAIL  removes inline event handlers from content
  AssertionError: expected true to be false // Object.is equality
  ❯ components/content/SplitContent.spec.tsx:198:31

FAIL  removes malicious iframe tags
  AssertionError: expected <iframe …(1)></iframe> to have a length of +0 but got 1
  ❯ components/content/SplitContent.spec.tsx:243:28
```

## Implementation Requirements

### Dependencies

Add DOMPurify for HTML sanitization:
```bash
npm install dompurify
npm install --save-dev @types/dompurify
```

### Recommended Sanitization Approach

#### Option 1: DOMPurify (Recommended)
```typescript
import DOMPurify from 'dompurify';

const sanitizedContent = DOMPurify.sanitize(content, {
  ALLOWED_TAGS: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'br'],
  ALLOWED_ATTR: ['href', 'class'],
  ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
});
```

#### Option 2: Use existing rehype-sanitize
The project already uses `rehype-sanitize` (package.json:27). Consider extracting sanitization logic to a shared utility.

### Configuration

**DOMPurify Config** (`lib/security/sanitize.ts`):
```typescript
export const CONTENT_SANITIZE_CONFIG = {
  ALLOWED_TAGS: [
    'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'strong', 'em', 'u', 'strike',
    'ul', 'ol', 'li',
    'a', 'br', 'hr',
    'blockquote', 'pre', 'code',
    'article', 'section', 'aside'
  ],
  ALLOWED_ATTR: ['href', 'class', 'id'],
  ALLOW_DATA_ATTR: false,
  FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
};
```

## Test Best Practices Applied

### Mandatory Rules (MUST)

✓ **Parameterized inputs**: All test inputs use named constants with descriptive names
```typescript
const MALICIOUS_CONTENT = '<script>alert("XSS")</script>';  // Not "foo" or 42
```

✓ **Tests can fail for real defects**: Every test checks specific XSS vectors
```typescript
expect(scriptElements).toHaveLength(0);  // NOT expect(2).toBe(2)
```

✓ **Aligned descriptions and assertions**:
```typescript
test('strips script tags from content', () => {
  expect(container.querySelectorAll('script')).toHaveLength(0);  // Matches description
});
```

✓ **Independent expectations**: Tests verify against domain properties (no script tags, no event handlers)
```typescript
// NOT: const result = sanitize(input); expect(sanitize(input)).toBe(result);
// YES: expect(sanitized).not.toContain('<script>');
```

✓ **Same quality as production**: TypeScript strict mode, proper types, no `any`

### Recommended Practices (SHOULD)

✓ **Tests grouped by function/concern**: Security tests grouped in dedicated describe block

✓ **Strong assertions**: Using exact checks, not weak approximations
```typescript
expect(scriptElements).toHaveLength(0);  // NOT toBeGreaterThanOrEqual(0)
```

✓ **Edge cases tested**: Empty strings, malformed HTML, multiple vectors

✓ **Realistic input**: Based on OWASP XSS testing guide and real-world attack vectors

## Story Point Breakdown

### Test Development: 0.5 SP

- **Security research**: 0.1 SP (OWASP XSS vectors, common exploits)
- **Test scaffolding**: 0.1 SP (describe blocks, test structure)
- **P0 test implementation**: 0.2 SP (10 tests covering critical vulnerabilities)
- **P1 test implementation**: 0.05 SP (3 tests for advanced attacks)
- **Edge case tests**: 0.05 SP (2 tests for error handling)

**Total**: 0.5 SP

### Implementation (Not Included)

- **Add DOMPurify dependency**: 0.05 SP
- **Create sanitization utility**: 0.1 SP
- **Update SplitContent component**: 0.1 SP
- **Verify all tests pass**: 0.05 SP

**Implementation Total**: 0.3 SP

## Security Impact

### Vulnerabilities Addressed

1. **Stored XSS**: Malicious content stored in CMS cannot execute
2. **DOM-based XSS**: Client-side rendering of unsanitized HTML blocked
3. **Protocol smuggling**: javascript: and data: URIs neutralized
4. **Event handler injection**: All inline event handlers removed
5. **DOM clobbering**: Dangerous name attributes stripped

### Attack Surface Reduction

**Before**: Any HTML content from Keystatic CMS rendered without validation
**After**: Strict allowlist of safe tags and attributes

### Related Components

These components also use `dangerouslySetInnerHTML` and may need similar fixes:
```bash
$ grep -r "dangerouslySetInnerHTML" components/
components/content/MarkdownRenderer.tsx (uses rehype-sanitize ✓)
components/content/Callout.tsx (needs review)
components/content/Hero.tsx (needs review)
```

## References

- **PE Review**: Identified XSS vulnerability at `components/content/SplitContent.tsx:40`
- **OWASP XSS Guide**: https://owasp.org/www-community/attacks/xss/
- **DOMPurify Docs**: https://github.com/cure53/DOMPurify
- **Test Best Practices**: `.claude/agents/test-writer.md` § Checklist
- **Planning Poker**: `docs/project/PLANNING-POKER.md`

## Next Steps

1. **Implementation Phase** (QCODE): Add DOMPurify and sanitize content
2. **Verification** (QCHECK): Run tests, verify all 15 security tests pass
3. **Documentation** (QDOC): Update component docs with security notes
4. **Audit** (QCHECK): Review other components using `dangerouslySetInnerHTML`

## Success Criteria

- All 10 failing tests pass after implementation
- No safe HTML elements are stripped
- Component behavior unchanged for valid content
- `npm run typecheck && npm run lint && npm test` all pass
- Security audit confirms no XSS vectors remain
