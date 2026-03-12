# QRALPH Synthesis Report: 001-remove-live-preview

## Request
1. REMOVE Live Preview feature completely - strip out all preview components and functionality from the Keystatic editor. 2. REVERT homepage hero back to video (not image) - undo the content change that switched from heroVideo to heroImage. 3. DELETE all smoke tests and stop doing smoke testing entirely - remove scripts/smoke-test.sh and all related smoke test infrastructure

## Agent Summaries
### security-reviewer
The request to remove Live Preview feature and smoke tests has significant security implications. While removing Live Preview eliminates a cross-frame communication attack surface, removing smoke tests creates a critical security gap by eliminating production validation that catches misconfigurations, broken authentication flows, and deployment failures. The content change (video vs image) has no security impact.### code-quality-auditor
(No summary found)### architecture-advisor
The Live Preview feature is deeply integrated into the Keystatic CMS layout and depends on ~24 preview-specific files, 2 custom hooks, feature flags, and analytics tracking. Removing it requires architectural changes to the layout component structure. The smoke test removal directly conflicts with CLAUDE.md's core workflow automation system and will require 59+ file updates across requirements, documentation, scripts, and validation infrastructure. The homepage hero change is straightforward but conflicts with recent smoke tests that check for video presence.### requirements-analyst
Project 001-remove-live-preview involves three distinct removal tasks: (1) completely removing the Live Preview feature from Keystatic CMS editor, (2) reverting homepage hero from static image back to video, and (3) removing all smoke testing infrastructure. Total estimated effort: 7 SP across three independent tasks.

## Consolidated Findings

### P0 - Critical (36 issues)
- **[security-reviewer]** *SMOKE-001: Removing smoke tests violates mandatory production validation requirements**
- **[security-reviewer]** Location: `CLAUDE.md` lines 11, 110-127, 191, 327
- **[security-reviewer]** The codebase has a GLOBAL RULE: "Your job is NOT done until production is verified working"
- **[security-reviewer]** Smoke tests are MANDATORY after ANY deployment per `CLAUDE.md`
- **[security-reviewer]** Issue: Removing `scripts/smoke-test.sh` eliminates the only automated production validation mechanism
- **[security-reviewer]** Impact: Creates deployment blind spots where broken auth, 404s, SSR failures, or security misconfigurations could reach production undetected
- **[security-reviewer]** Blocker: This directly contradicts the project's core deployment safety requirements
- **[security-reviewer]** *SMOKE-002: Loss of security validation for homepage visual elements**
- **[security-reviewer]** Location: `scripts/smoke-test.sh` lines 278-301 (REQ-FIX-005, REQ-SMOKE-010)
- **[security-reviewer]** Smoke test validates presence of `id="hero-video"`, `text-textured`, and `bg-textured` classes
- **[security-reviewer]** Issue: These checks ensure homepage renders correctly and prevents broken UI that could indicate injection attacks or template rendering failures
- **[security-reviewer]** Impact: Without these checks, attackers could potentially inject malicious content through CMS fields that would go undetected until manual inspection
- **[security-reviewer]** Blocker: Eliminates defense-in-depth validation layer
- **[security-reviewer]** *SMOKE-003: Keystatic admin UI security validation removed**
- **[security-reviewer]** Location: `scripts/smoke-test.sh` lines 348-605 (Agent 6: Keystatic Admin UI Smoke Tests)
- **[security-reviewer]** Functions: `test_keystatic_admin_ui()`, `test_cms_field_exists()`, `test_custom_component_visibility()`
- **[security-reviewer]** Issue: These tests verify that CMS admin routes exist, CMS fields are properly configured, and custom components render correctly
- **[security-reviewer]** Security concern: Without these tests, misconfigurations in Keystatic could expose admin routes publicly or break authentication flows without detection
- **[security-reviewer]** Blocker: CMS security validation is critical infrastructure
- **[architecture-advisor]** *1. Layout.tsx Structural Dependency**
- **[architecture-advisor]** **Issue**: `app/keystatic/layout.tsx` wraps children with `<PreviewPanelLayout>` component (lines 59-63)
- **[architecture-advisor]** **Impact**: Removing preview requires unwrapping children and handling two rendering paths controlled by `<IframeGuard>`
- **[architecture-advisor]** **Current Structure**:
- **[architecture-advisor]** **Required Action**: After removing preview, only one rendering path needed (hideInIframe=false becomes dead code)
- **[architecture-advisor]** **Files**: `/Users/travis/SGDrive/dev/bearlakecamp/app/keystatic/layout.tsx`
- **[architecture-advisor]** *2. CLAUDE.md Core Workflow Violation**
- **[architecture-advisor]** **Issue**: Smoke tests are mandated in multiple workflow phases:
- **[architecture-advisor]** **Impact**: Removing smoke tests breaks the entire validation workflow and creates deployment blindness
- **[architecture-advisor]** **Scope**: 59 files reference smoke tests, including:
- **[architecture-advisor]** **Files**: See complete list in grep results (59 files)
- **[architecture-advisor]** *3. Homepage Smoke Test Conflict**
- **[architecture-advisor]** **Issue**: `scripts/smoke-test.sh` lines 280-286 explicitly check for `id="hero-video"` and video element on homepage
- **[architecture-advisor]** **Impact**: Switching from heroVideo to heroImage will cause production validation to fail
- **[architecture-advisor]** **Current Check**:
- **[architecture-advisor]** **Required Action**: Must update or remove this check before reverting to heroVideo (note: request asks to delete smoke tests entirely, so this becomes moot)
- **[architecture-advisor]** **Files**: `/Users/travis/SGDrive/dev/bearlakecamp/scripts/smoke-test.sh`

### P1 - Important (53 issues)
- **[security-reviewer]** *PREVIEW-001: Live Preview cross-frame communication properly secured**
- **[security-reviewer]** Location: `components/keystatic/preview/iframe-security.ts`, `app/keystatic/preview/page.tsx`
- **[security-reviewer]** Current implementation: Origin validation (`event.origin === window.location.origin`), URL validation blocking `/api/`, `/auth/`, `/_next/`
- **[security-reviewer]** Finding: Security measures are correctly implemented with strict origin checks and URL pattern blocking
- **[security-reviewer]** Recommendation: Removal is safe from security perspective - no sensitive data flows through preview system, all content is CMS-managed markdown
- **[security-reviewer]** *PREVIEW-002: Iframe sandbox restrictions are defense-in-depth**
- **[security-reviewer]** Location: `components/keystatic/preview/PreviewIframe.tsx`, `iframe-security.ts` lines 49-54
- **[security-reviewer]** Current implementation: `sandbox="allow-scripts allow-same-origin"`, empty `allow=""` attribute
- **[security-reviewer]** Finding: Minimal permissions model correctly implemented
- **[security-reviewer]** Impact of removal: Eliminates iframe-based attack surface (positive security impact)
- **[security-reviewer]** Recommendation: Safe to remove - reduces complexity and attack surface
- **[security-reviewer]** *PREVIEW-003: No credential or sensitive data in preview content**
- **[security-reviewer]** Location: `lib/types/preview.ts`, `app/keystatic/preview/page.tsx`
- **[security-reviewer]** Analysis: Preview content only contains markdown, template fields, hero images, and public CMS data
- **[security-reviewer]** Finding: No authentication tokens, API keys, or secrets flow through preview system
- **[security-reviewer]** Recommendation: Safe to remove from data exposure perspective
- **[security-reviewer]** *SMOKE-004: Post-commit validation workflow depends on smoke tests**
- **[security-reviewer]** Location: `CLAUDE.md` lines 313-360 (Post-Commit Production Validation), `scripts/post-commit-validate.sh`
- **[security-reviewer]** Issue: Autonomous post-commit workflow calls `smoke-test.sh prelaunch.bearlakecamp.com --force`
- **[security-reviewer]** Impact: Removing smoke tests breaks the auto-fix and deployment monitoring system
- **[security-reviewer]** Recommendation: Must replace with alternative validation or remove entire post-commit workflow
- **[security-reviewer]** *SMOKE-005: Build-aware caching prevents regression detection**
- **[security-reviewer]** Location: `scripts/smoke-test.sh` lines 620-767 (Agent 2: Build Detection & Caching)
- **[security-reviewer]** Finding: Cache system tracks build IDs and re-runs tests if previous build had failures
- **[security-reviewer]** Issue: Without smoke tests, build ID tracking becomes unused infrastructure
- **[security-reviewer]** Security impact: Loss of regression detection for security-impacting bugs (e.g., broken auth redirects, exposed admin routes)
- **[architecture-advisor]** *4. Preview-Specific Hook Dependencies**
- **[architecture-advisor]** **Issue**: Two custom hooks exist solely for preview functionality:
- **[architecture-advisor]** **Impact**: Both hooks can be deleted entirely but must verify no other code imports them
- **[architecture-advisor]** **Used By**: Only `components/keystatic/preview/PreviewPanelLayout.tsx`
- **[architecture-advisor]** **Files**:
- **[architecture-advisor]** *5. Feature Flag Cleanup**
- **[architecture-advisor]** **Issue**: Preview system controlled by feature flags in `lib/config/feature-flags.ts`
- **[architecture-advisor]** **Functions**: `isLivePreviewEnabled()`, `getLivePreviewConfig()`
- **[architecture-advisor]** **Impact**: After removal, these become dead code
- **[architecture-advisor]** **Storage**: Uses localStorage key `'live-preview-enabled'`
- **[architecture-advisor]** **Files**: `/Users/travis/SGDrive/dev/bearlakecamp/lib/config/feature-flags.ts`
- **[architecture-advisor]** *6. Analytics Tracking Removal**
- **[architecture-advisor]** **Issue**: Preview events tracked via `lib/analytics/preview-events.ts`
- **[architecture-advisor]** **Events**: `trackPreviewOpened`, `trackPreviewClosed`, `trackPreviewCollapsed`, `trackPreviewExpanded`
- **[architecture-advisor]** **Impact**: Dead code after preview removal; clean up to avoid unused imports
- **[architecture-advisor]** **Files**: `/Users/travis/SGDrive/dev/bearlakecamp/lib/analytics/preview-events.ts`
- **[architecture-advisor]** *7. Preview Route and Page Deletion**
- **[architecture-advisor]** **Issue**: `/keystatic/preview` route exists to render preview iframe content
- **[architecture-advisor]** **Files to Delete**:
- **[architecture-advisor]** **Impact**: Route will 404 after deletion (acceptable since preview feature removed)
- **[architecture-advisor]** **Files**: `/Users/travis/SGDrive/dev/bearlakecamp/app/keystatic/preview/page.tsx`
- **[architecture-advisor]** *8. IframeGuard Component Becomes Obsolete**
- **[architecture-advisor]** **Issue**: `components/keystatic/preview/IframeGuard.tsx` only used to hide editor UI when rendered in preview iframe
- **[architecture-advisor]** **Current Usage**: Only in `app/keystatic/layout.tsx` (2 instances)
- **[architecture-advisor]** **Impact**: After removing preview iframe, no more iframe rendering scenarios exist
- **[architecture-advisor]** **Decision**: Can delete or keep (harmless since window.self === window.top will always be false)
- **[architecture-advisor]** **Files**: `/Users/travis/SGDrive/dev/bearlakecamp/components/keystatic/preview/IframeGuard.tsx`

### P2 - Suggestions (42 issues)
- **[security-reviewer]** *CONTENT-001: heroImage vs heroVideo content change has no security impact**
- **[security-reviewer]** Location: `content/pages/index.mdoc` line 3
- **[security-reviewer]** Current: `heroImage: /images/summer-program-and-general/Top-promo-7-scaled-e1731002368158.jpg`
- **[security-reviewer]** Requested change: Revert to `heroVideo` field
- **[security-reviewer]** Finding: Both are public assets, no authentication or authorization differences
- **[security-reviewer]** Recommendation: Safe to change - purely presentational with no security implications
- **[security-reviewer]** *PREVIEW-004: IframeGuard hydration mismatch prevention**
- **[security-reviewer]** Location: `components/keystatic/preview/IframeGuard.tsx` lines 29-46
- **[security-reviewer]** Finding: Component uses `hasMounted` state to prevent hydration mismatches during SSR
- **[security-reviewer]** Impact of removal: Eliminates client-side `window.self !== window.top` checks
- **[security-reviewer]** Recommendation: Safe to remove - no security benefit, only UX improvement
- **[security-reviewer]** *SMOKE-006: Parallel execution could mask timing-based security issues**
- **[security-reviewer]** Location: `scripts/smoke-test.sh` lines 768-834 (Agent 3: Parallel Test Execution)
- **[security-reviewer]** Finding: Uses `xargs -P` for parallel execution with 15 workers by default
- **[security-reviewer]** Issue: Race conditions in security checks could go undetected
- **[security-reviewer]** Impact of removal: Actually neutral - sequential testing was more thorough for security validation
- **[security-reviewer]** Recommendation: If smoke tests are preserved, consider sequential mode for security-critical checks
- **[architecture-advisor]** *9. Preview Component Directory Cleanup**
- **[architecture-advisor]** **Issue**: 17 preview-specific files in `components/keystatic/preview/` directory
- **[architecture-advisor]** **Complete List**:
- **[architecture-advisor]** **Impact**: Clean directory removal (no dependencies outside this folder)
- **[architecture-advisor]** **Files**: All files in `/Users/travis/SGDrive/dev/bearlakecamp/components/keystatic/preview/`
- **[architecture-advisor]** *10. Preview Lib Utilities Cleanup**
- **[architecture-advisor]** **Issue**: Preview-specific library files support preview rendering
- **[architecture-advisor]** **Files to Delete**:
- **[architecture-advisor]** **Impact**: No production code depends on these (preview-only)
- **[architecture-advisor]** **Files**: All files in `/Users/travis/SGDrive/dev/bearlakecamp/lib/preview/`
- **[architecture-advisor]** *11. Preview Type Definitions Cleanup**
- **[architecture-advisor]** **Issue**: `lib/types/preview.ts` defines TypeScript types for preview system
- **[architecture-advisor]** **Impact**: After deleting preview components, these types become unused
- **[architecture-advisor]** **Decision**: Delete after confirming no other imports
- **[architecture-advisor]** **Files**: `/Users/travis/SGDrive/dev/bearlakecamp/lib/types/preview.ts`
- **[architecture-advisor]** *12. Documentation and Requirements Cleanup**
- **[architecture-advisor]** **Issue**: Preview-specific requirements and design docs exist
- **[architecture-advisor]** **Files**:
- **[architecture-advisor]** **Impact**: Historical documentation; can move to archive or delete
- **[architecture-advisor]** **Files**: Listed above
- **[architecture-advisor]** *13. Test File Cleanup**
- **[architecture-advisor]** **Issue**: Spike tests and e2e tests for preview exist
- **[architecture-advisor]** **Files**:
- **[architecture-advisor]** **Impact**: Test code can be deleted safely
- **[architecture-advisor]** **Files**: Listed above

## Recommended Actions

1. **BLOCK** - Address P0 issues before proceeding:
   1. *SMOKE-001: Removing smoke tests violates mandatory production validation requirements**...
   2. Location: `CLAUDE.md` lines 11, 110-127, 191, 327...
   3. The codebase has a GLOBAL RULE: "Your job is NOT done until production is verified working"...
   4. Smoke tests are MANDATORY after ANY deployment per `CLAUDE.md`...
   5. Issue: Removing `scripts/smoke-test.sh` eliminates the only automated production validation mechanis...
   6. Impact: Creates deployment blind spots where broken auth, 404s, SSR failures, or security misconfigu...
   7. Blocker: This directly contradicts the project's core deployment safety requirements...
   8. *SMOKE-002: Loss of security validation for homepage visual elements**...
   9. Location: `scripts/smoke-test.sh` lines 278-301 (REQ-FIX-005, REQ-SMOKE-010)...
   10. Smoke test validates presence of `id="hero-video"`, `text-textured`, and `bg-textured` classes...
   11. Issue: These checks ensure homepage renders correctly and prevents broken UI that could indicate inj...
   12. Impact: Without these checks, attackers could potentially inject malicious content through CMS field...
   13. Blocker: Eliminates defense-in-depth validation layer...
   14. *SMOKE-003: Keystatic admin UI security validation removed**...
   15. Location: `scripts/smoke-test.sh` lines 348-605 (Agent 6: Keystatic Admin UI Smoke Tests)...
   16. Functions: `test_keystatic_admin_ui()`, `test_cms_field_exists()`, `test_custom_component_visibility...
   17. Issue: These tests verify that CMS admin routes exist, CMS fields are properly configured, and custo...
   18. Security concern: Without these tests, misconfigurations in Keystatic could expose admin routes publ...
   19. Blocker: CMS security validation is critical infrastructure...
   20. *1. Layout.tsx Structural Dependency**...
   21. **Issue**: `app/keystatic/layout.tsx` wraps children with `<PreviewPanelLayout>` component (lines 59...
   22. **Impact**: Removing preview requires unwrapping children and handling two rendering paths controlle...
   23. **Current Structure**:...
   24. **Required Action**: After removing preview, only one rendering path needed (hideInIframe=false beco...
   25. **Files**: `/Users/travis/SGDrive/dev/bearlakecamp/app/keystatic/layout.tsx`...
   26. *2. CLAUDE.md Core Workflow Violation**...
   27. **Issue**: Smoke tests are mandated in multiple workflow phases:...
   28. **Impact**: Removing smoke tests breaks the entire validation workflow and creates deployment blindn...
   29. **Scope**: 59 files reference smoke tests, including:...
   30. **Files**: See complete list in grep results (59 files)...
   31. *3. Homepage Smoke Test Conflict**...
   32. **Issue**: `scripts/smoke-test.sh` lines 280-286 explicitly check for `id="hero-video"` and video el...
   33. **Impact**: Switching from heroVideo to heroImage will cause production validation to fail...
   34. **Current Check**:...
   35. **Required Action**: Must update or remove this check before reverting to heroVideo (note: request a...
   36. **Files**: `/Users/travis/SGDrive/dev/bearlakecamp/scripts/smoke-test.sh`...

2. **FIX** - Address 53 P1 issues

3. **CONSIDER** - Review 42 P2 suggestions

---
*Synthesized at: 2026-02-05T10:29:00.593312*
