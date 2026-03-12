# Security Reviewer Review

## Summary
The request to remove Live Preview feature and smoke tests has significant security implications. While removing Live Preview eliminates a cross-frame communication attack surface, removing smoke tests creates a critical security gap by eliminating production validation that catches misconfigurations, broken authentication flows, and deployment failures. The content change (video vs image) has no security impact.

## Findings

### P0 - Critical (blocks progress)

**SMOKE-001: Removing smoke tests violates mandatory production validation requirements**
- Location: `CLAUDE.md` lines 11, 110-127, 191, 327
- The codebase has a GLOBAL RULE: "Your job is NOT done until production is verified working"
- Smoke tests are MANDATORY after ANY deployment per `CLAUDE.md`
- Issue: Removing `scripts/smoke-test.sh` eliminates the only automated production validation mechanism
- Impact: Creates deployment blind spots where broken auth, 404s, SSR failures, or security misconfigurations could reach production undetected
- Blocker: This directly contradicts the project's core deployment safety requirements

**SMOKE-002: Loss of security validation for homepage visual elements**
- Location: `scripts/smoke-test.sh` lines 278-301 (REQ-FIX-005, REQ-SMOKE-010)
- Smoke test validates presence of `id="hero-video"`, `text-textured`, and `bg-textured` classes
- Issue: These checks ensure homepage renders correctly and prevents broken UI that could indicate injection attacks or template rendering failures
- Impact: Without these checks, attackers could potentially inject malicious content through CMS fields that would go undetected until manual inspection
- Blocker: Eliminates defense-in-depth validation layer

**SMOKE-003: Keystatic admin UI security validation removed**
- Location: `scripts/smoke-test.sh` lines 348-605 (Agent 6: Keystatic Admin UI Smoke Tests)
- Functions: `test_keystatic_admin_ui()`, `test_cms_field_exists()`, `test_custom_component_visibility()`
- Issue: These tests verify that CMS admin routes exist, CMS fields are properly configured, and custom components render correctly
- Security concern: Without these tests, misconfigurations in Keystatic could expose admin routes publicly or break authentication flows without detection
- Blocker: CMS security validation is critical infrastructure

### P1 - Important (should address)

**PREVIEW-001: Live Preview cross-frame communication properly secured**
- Location: `components/keystatic/preview/iframe-security.ts`, `app/keystatic/preview/page.tsx`
- Current implementation: Origin validation (`event.origin === window.location.origin`), URL validation blocking `/api/`, `/auth/`, `/_next/`
- Finding: Security measures are correctly implemented with strict origin checks and URL pattern blocking
- Recommendation: Removal is safe from security perspective - no sensitive data flows through preview system, all content is CMS-managed markdown

**PREVIEW-002: Iframe sandbox restrictions are defense-in-depth**
- Location: `components/keystatic/preview/PreviewIframe.tsx`, `iframe-security.ts` lines 49-54
- Current implementation: `sandbox="allow-scripts allow-same-origin"`, empty `allow=""` attribute
- Finding: Minimal permissions model correctly implemented
- Impact of removal: Eliminates iframe-based attack surface (positive security impact)
- Recommendation: Safe to remove - reduces complexity and attack surface

**PREVIEW-003: No credential or sensitive data in preview content**
- Location: `lib/types/preview.ts`, `app/keystatic/preview/page.tsx`
- Analysis: Preview content only contains markdown, template fields, hero images, and public CMS data
- Finding: No authentication tokens, API keys, or secrets flow through preview system
- Recommendation: Safe to remove from data exposure perspective

**SMOKE-004: Post-commit validation workflow depends on smoke tests**
- Location: `CLAUDE.md` lines 313-360 (Post-Commit Production Validation), `scripts/post-commit-validate.sh`
- Issue: Autonomous post-commit workflow calls `smoke-test.sh prelaunch.bearlakecamp.com --force`
- Impact: Removing smoke tests breaks the auto-fix and deployment monitoring system
- Recommendation: Must replace with alternative validation or remove entire post-commit workflow

**SMOKE-005: Build-aware caching prevents regression detection**
- Location: `scripts/smoke-test.sh` lines 620-767 (Agent 2: Build Detection & Caching)
- Finding: Cache system tracks build IDs and re-runs tests if previous build had failures
- Issue: Without smoke tests, build ID tracking becomes unused infrastructure
- Security impact: Loss of regression detection for security-impacting bugs (e.g., broken auth redirects, exposed admin routes)

### P2 - Suggestions (nice to have)

**CONTENT-001: heroImage vs heroVideo content change has no security impact**
- Location: `content/pages/index.mdoc` line 3
- Current: `heroImage: /images/summer-program-and-general/Top-promo-7-scaled-e1731002368158.jpg`
- Requested change: Revert to `heroVideo` field
- Finding: Both are public assets, no authentication or authorization differences
- Recommendation: Safe to change - purely presentational with no security implications

**PREVIEW-004: IframeGuard hydration mismatch prevention**
- Location: `components/keystatic/preview/IframeGuard.tsx` lines 29-46
- Finding: Component uses `hasMounted` state to prevent hydration mismatches during SSR
- Impact of removal: Eliminates client-side `window.self !== window.top` checks
- Recommendation: Safe to remove - no security benefit, only UX improvement

**SMOKE-006: Parallel execution could mask timing-based security issues**
- Location: `scripts/smoke-test.sh` lines 768-834 (Agent 3: Parallel Test Execution)
- Finding: Uses `xargs -P` for parallel execution with 15 workers by default
- Issue: Race conditions in security checks could go undetected
- Impact of removal: Actually neutral - sequential testing was more thorough for security validation
- Recommendation: If smoke tests are preserved, consider sequential mode for security-critical checks

## Recommendations

1. **MUST NOT remove smoke tests** - This violates the project's GLOBAL RULE for production validation. Instead, consider:
   - Keep smoke tests and enhance with additional security checks
   - Replace with equivalent production validation mechanism before removal
   - Document explicit exception to GLOBAL RULE with stakeholder approval

2. **SHOULD remove Live Preview feature** - Security analysis confirms safe removal:
   - No sensitive data flows through preview system
   - Cross-frame attack surface eliminated
   - Reduces code complexity and maintenance burden
   - Files to remove: `components/keystatic/preview/*`, `app/keystatic/preview/*`, `lib/types/preview.ts`, `hooks/usePreviewSync.ts`

3. **MUST preserve Keystatic admin UI smoke tests** (from `scripts/smoke-test.sh` Agent 6):
   - Move `test_keystatic_admin_ui()`, `test_cms_field_exists()`, `test_custom_component_visibility()` to separate security validation script
   - These tests verify CMS security configuration and must run after every deployment
   - Critical for detecting broken authentication flows and exposed admin routes

4. **MAY revert homepage content from heroImage to heroVideo**:
   - No security implications for this content change
   - Update `content/pages/index.mdoc` line 3 to use `heroVideo` field
   - Update smoke test validation (if preserved) to check for video element instead of image

5. **MUST update post-commit validation workflow**:
   - Either preserve smoke tests OR rewrite `scripts/post-commit-validate.sh` to use alternative validation
   - Cannot remove smoke tests without addressing dependent automation

6. **SHOULD update CLAUDE.md if smoke tests are removed**:
   - Remove/revise GLOBAL RULE about production verification (lines 11, 110-127, 191, 327)
   - Document new production validation approach
   - Update QShortcuts to remove QVERIFY references to smoke tests

## Security Posture Impact

**Removing Live Preview: +1 (positive)**
- Reduces attack surface
- Eliminates cross-frame communication risks
- Simplifies codebase

**Removing Smoke Tests: -3 (critical negative)**
- Loses production security validation
- Eliminates regression detection
- Breaks mandatory deployment verification
- Creates blind spots for authentication failures

**Content Change (video vs image): 0 (neutral)**
- No security impact

**Net Impact: -2 (negative)** - Only proceed if smoke tests are replaced with equivalent security validation mechanism.

---
*Review completed at: 2026-02-05T18:30:00Z*
