# Requirements Lock: XSS Security Fix

> **Date**: 2025-12-02
> **Task**: P0-P1 XSS Vulnerability Fix in SplitContent Component
> **Status**: Tests Written (Implementation Pending)

## REQ-SEC-001: Sanitize HTML Content in SplitContent

**Priority**: P0 (Critical Security Vulnerability)

**Acceptance Criteria**:
1. All user-provided HTML content MUST be sanitized before rendering
2. Script tags MUST be completely removed from content
3. Inline event handlers (onclick, onerror, onload, etc.) MUST be stripped
4. javascript: protocol in URLs MUST be neutralized
5. data: URIs containing HTML MUST be blocked
6. iframe, object, and embed tags MUST be removed
7. Safe HTML elements (p, h1-h6, strong, em, ul, ol, li, a) MUST be preserved
8. Safe attributes (href, class, id) MUST be preserved on allowed elements
9. Component MUST handle empty content without errors
10. Component MUST handle malformed HTML gracefully

**Non-Goals**:
- Support for arbitrary JavaScript execution in content
- Support for embedded third-party content (iframes)
- Custom styling via inline styles or style tags
- Form elements in content area

**Context**:
- PE review identified vulnerability at `components/content/SplitContent.tsx:40`
- Component currently uses `dangerouslySetInnerHTML` without sanitization
- Content sourced from Keystatic CMS (trusted editors, but defense-in-depth principle applies)

**Test Coverage**:
- 15 comprehensive security tests written
- 10 tests currently failing (expected, implementation pending)
- Tests cover OWASP Top 10 XSS attack vectors

## REQ-SEC-002: DOM Clobbering Prevention

**Priority**: P1 (Advanced Attack Vector)

**Acceptance Criteria**:
1. Elements with `name` attributes that shadow DOM properties MUST be sanitized
2. Dangerous `name` values (createElement, innerHTML, body, write, writeln) MUST be removed
3. Form elements with clobbering potential MUST have name attributes validated

**Non-Goals**:
- Support for form elements in content (forms not allowed)

**Test Coverage**:
- 1 test for DOM clobbering attacks

## REQ-SEC-003: Mutation XSS (mXSS) Protection

**Priority**: P1 (Edge Case)

**Acceptance Criteria**:
1. Content MUST be sanitized using a library resistant to mXSS attacks
2. Sanitization MUST occur before DOM insertion
3. No event handlers should be executable after DOM mutations

**Non-Goals**:
- Custom mXSS detection logic (rely on battle-tested DOMPurify)

**Test Coverage**:
- 1 test for mXSS attack vectors

## REQ-SEC-004: Safe HTML Preservation

**Priority**: P0 (Functional Requirement)

**Acceptance Criteria**:
1. Paragraphs, headings (h1-h6), lists (ul, ol, li) MUST be preserved
2. Text formatting (strong, em, u, strike) MUST be preserved
3. Links with safe protocols (http, https, mailto) MUST be preserved
4. HTML5 semantic elements (article, section, aside) MUST be preserved
5. Line breaks (br, hr) MUST be preserved
6. Code blocks (pre, code, blockquote) MUST be preserved

**Non-Goals**:
- Support for tables, forms, or interactive elements

**Test Coverage**:
- 2 tests verify safe HTML preservation

## Implementation Strategy

### Dependency Selection

**Option 1: DOMPurify (Recommended)**
- Industry standard for HTML sanitization
- Actively maintained, security-focused
- Configurable allowlists
- mXSS protection built-in
- Size: ~20KB minified

**Option 2: Reuse rehype-sanitize**
- Already in dependencies (package.json:27)
- Used in MarkdownRenderer component
- Would require extracting to shared utility
- Less flexible for custom allowlists

**Decision**: Use DOMPurify for dedicated sanitization with strict configuration

### Configuration

```typescript
// lib/security/sanitize.ts
import DOMPurify from 'dompurify';

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
  ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
};

export function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, CONTENT_SANITIZE_CONFIG);
}
```

### Component Update

```typescript
// components/content/SplitContent.tsx (updated)
import { sanitizeHTML } from '@/lib/security/sanitize';

export function SplitContent({ content, ...props }: SplitContentProps) {
  const sanitizedContent = sanitizeHTML(content);

  return (
    <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
  );
}
```

## Story Points

### Test Development: 0.5 SP
- Security research and test planning: 0.1 SP
- Test implementation (15 tests): 0.35 SP
- Documentation: 0.05 SP

### Implementation: 0.3 SP
- Add DOMPurify dependency: 0.05 SP
- Create sanitization utility: 0.1 SP
- Update SplitContent component: 0.1 SP
- Verify all tests pass: 0.05 SP

**Total**: 0.8 SP

## Security Audit

### OWASP XSS Vectors Covered

1. **Script Injection**: `<script>alert('XSS')</script>` ✓
2. **Event Handlers**: `<img onerror="alert('XSS')">` ✓
3. **JavaScript Protocol**: `<a href="javascript:alert('XSS')">` ✓
4. **Data URIs**: `<img src="data:text/html,<script>...">` ✓
5. **SVG Scripts**: `<svg onload="alert('XSS')">` ✓
6. **Iframe Injection**: `<iframe src="evil.com">` ✓
7. **Object/Embed**: `<object data="malware">` ✓
8. **Style Expressions**: `<style>expression(...)</style>` ✓
9. **DOM Clobbering**: `<form name="createElement">` ✓
10. **Mutation XSS**: Complex DOM manipulation attacks ✓

### Related Components Requiring Audit

Based on grep for `dangerouslySetInnerHTML`:

1. **MarkdownRenderer.tsx**: Uses `rehype-sanitize` ✓ (Safe)
2. **Callout.tsx**: Needs review
3. **Hero.tsx**: Needs review
4. **Testimonial.tsx**: Needs review (if present)

### Future Work

Create shared sanitization strategy:
- Extract common sanitization utility
- Define different security profiles (strict/permissive)
- Document which components use which profiles
- Add ESLint rule to flag unsanitized dangerouslySetInnerHTML

## References

- **OWASP XSS Prevention Cheat Sheet**: https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
- **DOMPurify Documentation**: https://github.com/cure53/DOMPurify
- **mXSS Research**: https://cure53.de/fp170.pdf
- **Test Best Practices**: `.claude/agents/test-writer.md`
- **PE Review Findings**: Original security audit that identified vulnerability

## Success Criteria

**Pre-Implementation**:
- [x] 15 comprehensive security tests written
- [x] Tests cover P0-P1 attack vectors
- [x] All critical tests failing as expected
- [x] Test plan documented
- [x] Requirements locked

**Post-Implementation**:
- [ ] All 15 security tests passing
- [ ] No safe HTML stripped
- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] `npm test` passes (all tests green)
- [ ] Security re-audit confirms no XSS vectors
- [ ] Documentation updated with security notes

## Deployment Checklist

Before merging:
- [ ] All tests pass
- [ ] DOMPurify added to dependencies
- [ ] Type definitions (@types/dompurify) added
- [ ] Sanitization utility created and tested
- [ ] Component updated to use sanitization
- [ ] No breaking changes to component API
- [ ] Related components audited
- [ ] Security notes added to component docs
