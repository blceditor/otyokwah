# Architecture Advisor Review

## Summary
The Live Preview feature is deeply integrated into the Keystatic CMS layout and depends on ~24 preview-specific files, 2 custom hooks, feature flags, and analytics tracking. Removing it requires architectural changes to the layout component structure. The smoke test removal directly conflicts with CLAUDE.md's core workflow automation system and will require 59+ file updates across requirements, documentation, scripts, and validation infrastructure. The homepage hero change is straightforward but conflicts with recent smoke tests that check for video presence.

## Findings

### P0 - Critical (blocks progress)

**1. Layout.tsx Structural Dependency**
- **Issue**: `app/keystatic/layout.tsx` wraps children with `<PreviewPanelLayout>` component (lines 59-63)
- **Impact**: Removing preview requires unwrapping children and handling two rendering paths controlled by `<IframeGuard>`
- **Current Structure**:
  ```tsx
  <IframeGuard hideInIframe={true}>
    {/* All editor chrome */}
    <PreviewPanelLayout>
      <div className="flex-1 overflow-auto pb-20">
        {children}
      </div>
    </PreviewPanelLayout>
  </IframeGuard>

  <IframeGuard hideInIframe={false}>
    {/* Render children directly when in iframe */}
    <div className="flex-1 overflow-auto">
      {children}
    </div>
  </IframeGuard>
  ```
- **Required Action**: After removing preview, only one rendering path needed (hideInIframe=false becomes dead code)
- **Files**: `/Users/travis/SGDrive/dev/bearlakecamp/app/keystatic/layout.tsx`

**2. CLAUDE.md Core Workflow Violation**
- **Issue**: Smoke tests are mandated in multiple workflow phases:
  - **Line 11**: `./scripts/smoke-test.sh --force prelaunch.bearlakecamp.com` MANDATORY after ANY deployment
  - **Line 110**: PHASE 3 "Production smoke tests (HTTP 200 checks)" as validation gate
  - **Line 126**: Post-deployment monitoring runs smoke tests
  - **Line 191**: QVERIFY explicitly runs smoke-test.sh
  - **Line 327**: Post-commit validation runs `smoke-test.sh prelaunch.bearlakecamp.com --force`
- **Impact**: Removing smoke tests breaks the entire validation workflow and creates deployment blindness
- **Scope**: 59 files reference smoke tests, including:
  - Core workflow: CLAUDE.md, .claude/agents/validation-specialist.md
  - Requirements: 18 requirements files (QPLAN-*, EXECUTION-PLAN-*, etc.)
  - Documentation: 8 docs files (SMOKE-TEST-SYSTEM-DESIGN.md, etc.)
  - Scripts: smoke-test.sh, post-commit-validate.sh, test-agent-3.sh
  - Tests: 3 integration test files
- **Files**: See complete list in grep results (59 files)

**3. Homepage Smoke Test Conflict**
- **Issue**: `scripts/smoke-test.sh` lines 280-286 explicitly check for `id="hero-video"` and video element on homepage
- **Impact**: Switching from heroVideo to heroImage will cause production validation to fail
- **Current Check**:
  ```bash
  if ! grep -qE 'id="hero-video"' "$temp_response" 2>/dev/null; then
    status="fail"
    error="Homepage missing HeroVideo component (id='hero-video')"
  fi
  ```
- **Required Action**: Must update or remove this check before reverting to heroVideo (note: request asks to delete smoke tests entirely, so this becomes moot)
- **Files**: `/Users/travis/SGDrive/dev/bearlakecamp/scripts/smoke-test.sh`

### P1 - Important (should address)

**4. Preview-Specific Hook Dependencies**
- **Issue**: Two custom hooks exist solely for preview functionality:
  - `hooks/usePreviewContentExtractor.ts` (479 lines) - Extracts content from Keystatic DOM
  - `hooks/usePreviewSync.ts` (293 lines) - Manages postMessage sync with iframe
- **Impact**: Both hooks can be deleted entirely but must verify no other code imports them
- **Used By**: Only `components/keystatic/preview/PreviewPanelLayout.tsx`
- **Files**:
  - `/Users/travis/SGDrive/dev/bearlakecamp/hooks/usePreviewContentExtractor.ts`
  - `/Users/travis/SGDrive/dev/bearlakecamp/hooks/usePreviewSync.ts`

**5. Feature Flag Cleanup**
- **Issue**: Preview system controlled by feature flags in `lib/config/feature-flags.ts`
- **Functions**: `isLivePreviewEnabled()`, `getLivePreviewConfig()`
- **Impact**: After removal, these become dead code
- **Storage**: Uses localStorage key `'live-preview-enabled'`
- **Files**: `/Users/travis/SGDrive/dev/bearlakecamp/lib/config/feature-flags.ts`

**6. Analytics Tracking Removal**
- **Issue**: Preview events tracked via `lib/analytics/preview-events.ts`
- **Events**: `trackPreviewOpened`, `trackPreviewClosed`, `trackPreviewCollapsed`, `trackPreviewExpanded`
- **Impact**: Dead code after preview removal; clean up to avoid unused imports
- **Files**: `/Users/travis/SGDrive/dev/bearlakecamp/lib/analytics/preview-events.ts`

**7. Preview Route and Page Deletion**
- **Issue**: `/keystatic/preview` route exists to render preview iframe content
- **Files to Delete**:
  - `app/keystatic/preview/page.tsx` (134 lines)
  - `app/keystatic/preview/layout.tsx` (if exists)
- **Impact**: Route will 404 after deletion (acceptable since preview feature removed)
- **Files**: `/Users/travis/SGDrive/dev/bearlakecamp/app/keystatic/preview/page.tsx`

**8. IframeGuard Component Becomes Obsolete**
- **Issue**: `components/keystatic/preview/IframeGuard.tsx` only used to hide editor UI when rendered in preview iframe
- **Current Usage**: Only in `app/keystatic/layout.tsx` (2 instances)
- **Impact**: After removing preview iframe, no more iframe rendering scenarios exist
- **Decision**: Can delete or keep (harmless since window.self === window.top will always be false)
- **Files**: `/Users/travis/SGDrive/dev/bearlakecamp/components/keystatic/preview/IframeGuard.tsx`

### P2 - Suggestions (nice to have)

**9. Preview Component Directory Cleanup**
- **Issue**: 17 preview-specific files in `components/keystatic/preview/` directory
- **Complete List**:
  - PreviewPanelLayout.tsx, PreviewPanelLayout.spec.tsx
  - PreviewIframe.tsx, PreviewIframe.spec.tsx
  - PreviewHeader.tsx, PreviewHeader.spec.tsx
  - PreviewRenderer.tsx
  - IframeGuard.tsx
  - DeviceFrame.tsx
  - ResizeDivider.tsx, ResizeDivider.spec.tsx
  - SyncStatusIndicator.tsx
  - ViewportToggle.tsx, ViewportToggle.spec.tsx
  - WidthIndicator.tsx
  - iframe-security.ts
- **Impact**: Clean directory removal (no dependencies outside this folder)
- **Files**: All files in `/Users/travis/SGDrive/dev/bearlakecamp/components/keystatic/preview/`

**10. Preview Lib Utilities Cleanup**
- **Issue**: Preview-specific library files support preview rendering
- **Files to Delete**:
  - `lib/preview/MarkdocErrorBoundary.tsx`
  - `lib/preview/content-renderer.tsx`
  - `lib/preview/feature-flags.ts`
  - `lib/preview/tag-allowlist.ts`
  - `lib/preview/template-loader.tsx`
  - `lib/preview/viewport-storage.ts`
  - `pages/api/preview/markdoc-source.ts` (API route)
- **Impact**: No production code depends on these (preview-only)
- **Files**: All files in `/Users/travis/SGDrive/dev/bearlakecamp/lib/preview/`

**11. Preview Type Definitions Cleanup**
- **Issue**: `lib/types/preview.ts` defines TypeScript types for preview system
- **Impact**: After deleting preview components, these types become unused
- **Decision**: Delete after confirming no other imports
- **Files**: `/Users/travis/SGDrive/dev/bearlakecamp/lib/types/preview.ts`

**12. Documentation and Requirements Cleanup**
- **Issue**: Preview-specific requirements and design docs exist
- **Files**:
  - `requirements/REQ-PREVIEW-PANEL-TECH.md`
  - `requirements/QPLAN-LIVE-PREVIEW-SYNTHESIZED.md`
  - `requirements/REQ-PREVIEW-UX.md`
  - `requirements/REQ-PREVIEW-PANEL.md`
  - `.ralph/RALPH-LOOP-LIVE-PREVIEW-v3.md` (and v2, v1)
  - `docs/technical/keystatic-prosemirror-structure.md` (may contain preview references)
- **Impact**: Historical documentation; can move to archive or delete
- **Files**: Listed above

**13. Test File Cleanup**
- **Issue**: Spike tests and e2e tests for preview exist
- **Files**:
  - `spike/preview-poc.spec.tsx`
  - `spike/preview-poc.tsx`
  - `tests/e2e/spike/live-preview-spike.spec.ts`
- **Impact**: Test code can be deleted safely
- **Files**: Listed above

## Integration Points to Update

### 1. Keystatic Layout (app/keystatic/layout.tsx)
**Current State**:
- Lines 11-12: Imports `PreviewPanelLayout` and `IframeGuard`
- Lines 38-39: `IframeGuard` wraps editor chrome to hide in iframe
- Lines 59-63: `PreviewPanelLayout` wraps children
- Lines 68-72: Second `IframeGuard` renders children when in iframe

**Required Changes**:
```tsx
// BEFORE:
<PreviewPanelLayout>
  <div className="flex-1 overflow-auto pb-20">
    {children}
  </div>
</PreviewPanelLayout>

// AFTER:
<div className="flex-1 overflow-auto pb-20">
  {children}
</div>
```

**Remove Imports**:
- Line 11: `import { PreviewPanelLayout } from "@/components/keystatic/preview/PreviewPanelLayout";`
- Line 12: `import { IframeGuard } from "@/components/keystatic/preview/IframeGuard";`

**Remove IframeGuard Logic**:
- Delete lines 38-65 (entire first IframeGuard block)
- Delete lines 68-72 (second IframeGuard block for iframe rendering)
- Keep all other enhancers and layout structure

### 2. Homepage Content (content/pages/index.mdoc)
**Current State**:
- Line 3: `heroImage: /images/summer-program-and-general/Top-promo-7-scaled-e1731002368158.jpg`
- Missing: `heroVideo` field

**Required Changes**:
- Remove line 3 (`heroImage` field)
- Add `heroVideo: /videos/hero-video.mp4` (or correct path to video file)
- Verify video file exists in public directory

**Note**: This conflicts with smoke test line 282-286 check for video element, but smoke tests will be deleted per requirement #3.

### 3. Workflow Automation Files
**Files Requiring Smoke Test Reference Removal**:

**Critical Workflow Files**:
1. `CLAUDE.md` - Lines 11, 110, 126, 191, 327 (remove smoke test mandates)
2. `.claude/agents/validation-specialist.md` - Remove smoke test references
3. `scripts/post-commit-validate.sh` - Remove smoke-test.sh invocation
4. `.claude/settings.json` (if exists) - Remove postCommitHooks.productionValidation config (lines 336-348 of CLAUDE.md show config structure)

**Requirements Files** (18 files):
- All QPLAN-*.md files in `requirements/`
- EXECUTION-PLAN-*.md files
- REGRESSION-TEST-CHECKLIST.md
- PROCESS-IMPROVEMENT-PROPOSAL.md
- All lock files referencing smoke tests

**Documentation Files** (8+ files):
- `docs/operations/SMOKE-TEST-USAGE.md` - DELETE entirely
- `docs/technical/SMOKE-TEST-SYSTEM-DESIGN.md` - DELETE entirely
- `docs/tasks/smoke-test-*.md` files - DELETE entirely
- `docs/tasks/PARALLEL-RACE-CONDITION-FIX.md` - Update or remove smoke test references

**Test Files**:
- `tests/integration/keystatic-admin-smoke.spec.ts` - DELETE or convert to standard integration test
- `tests/integration/post-commit-workflow.spec.ts` - UPDATE to remove smoke test validation
- `tests/e2e/production/build-optimization.spec.ts` - UPDATE if it invokes smoke tests

**Scripts**:
- `scripts/smoke-test.sh` - DELETE (1,375 lines)
- `scripts/smoke-test.spec.sh` - DELETE (test for smoke-test.sh)
- `scripts/test-agent-3.sh` - UPDATE or DELETE if smoke-test-specific

### 4. Type System Cleanup
**After Component Deletion**:
- Run TypeScript compiler to find orphaned imports: `npm run typecheck`
- Remove unused type imports from `lib/types/preview.ts`
- Delete `lib/types/preview.ts` if no remaining references

### 5. Build System Verification
**After All Deletions**:
- Check for broken imports: `npm run typecheck`
- Verify no runtime errors: `npm run dev` and test /keystatic route
- Ensure homepage renders correctly: Test `/` route with heroVideo
- Run existing tests (excluding deleted smoke tests): `npm test`

## CLAUDE.md Updates Required

### Section 1) Core Principles (Lines 9-14)
**DELETE**:
```markdown
**GLOBAL RULE - Production Verification (MANDATORY)**:
- **Your job is NOT done until production is verified working**
- After ANY deployment, run: `./scripts/smoke-test.sh --force prelaunch.bearlakecamp.com`
- ALL pages must return HTTP 200 before claiming success
- This rule applies to ALL work, FOREVER - no exceptions
- Production domain: `prelaunch.bearlakecamp.com` (NOT bearlakecamp.org)
```

**REPLACE WITH**:
```markdown
**GLOBAL RULE - Production Verification (MANDATORY)**:
- **Your job is NOT done until production is verified working**
- After ANY deployment, manually verify critical routes load correctly
- Use browser DevTools or curl to validate production deployment
- Production domain: `prelaunch.bearlakecamp.com` (NOT bearlakecamp.org)
```

### Section 3) TDD Flow - PHASE 3 (Lines 107-117)
**CURRENT**:
```markdown
├─ PHASE 3: Comprehensive Validation
│  ├─ QVERIFY[comprehensive]:
│  │  ├─ Local tests (unit, integration, e2e)
│  │  ├─ Production smoke tests (HTTP 200 checks)
│  │  ├─ Playwright production tests (MANDATORY - blocks QGIT if missing)
│  │  ├─ Screenshot proof (auto-captured)
│  │  └─ Generate comprehensive report
```

**UPDATE TO**:
```markdown
├─ PHASE 3: Comprehensive Validation
│  ├─ QVERIFY[comprehensive]:
│  │  ├─ Local tests (unit, integration, e2e)
│  │  ├─ Playwright production tests (MANDATORY - blocks QGIT if missing)
│  │  ├─ Screenshot proof (auto-captured)
│  │  └─ Generate comprehensive report
```

### Section 3) TDD Flow - PHASE 5 (Lines 123-128)
**CURRENT**:
```markdown
└─ PHASE 5: Production Monitoring (autonomous)
   ├─ Wait 2min for Vercel deployment
   ├─ Poll every 30s for 5min total
   ├─ Run smoke tests + Playwright on production
   ├─ If fail → diagnose + auto-fix → re-deploy
   └─ Max 3 auto-fix attempts → escalate
```

**UPDATE TO**:
```markdown
└─ PHASE 5: Production Monitoring (autonomous)
   ├─ Wait 2min for Vercel deployment
   ├─ Poll every 30s for 5min total
   ├─ Run Playwright tests on production
   ├─ If fail → diagnose + auto-fix → re-deploy
   └─ Max 3 auto-fix attempts → escalate
```

### Section 3) Edge Function Tests (Lines 167-175)
**DELETE ENTIRE SECTION**:
```markdown
### Edge Function Tests (smoke tests mandatory)

```typescript
// supabase/functions/<name>/__tests__/smoke.test.ts
test('endpoint exists and responds', async () => {
  const res = await supabase.functions.invoke('<name>');
  expect([200, 400, 401]).toContain(res.status); // not 404
});
```
```

**OPTIONAL REPLACEMENT** (if edge function validation still needed):
```markdown
### Edge Function Tests (integration tests recommended)

```typescript
// supabase/functions/<name>/__tests__/integration.test.ts
test('endpoint handles valid requests', async () => {
  const res = await supabase.functions.invoke('<name>', {
    body: { /* test payload */ }
  });
  expect(res.status).toBe(200);
  expect(res.data).toBeDefined();
});
```
```

### Section 4) QShortcuts - QVERIFY (Line 191)
**CURRENT**:
```markdown
- **QVERIFY**: Verify production deployment works, run smoke tests, capture screenshot proof → **validation-specialist** (scripts: smoke-test.sh, post-commit-validate.sh)
```

**UPDATE TO**:
```markdown
- **QVERIFY**: Verify production deployment works, run Playwright tests, capture screenshot proof → **validation-specialist** (scripts: post-commit-validate.sh)
```

### Section 6.5) Pre-Deployment Gates (Lines 266-278)
**CURRENT**:
```markdown
**Edge functions MUST**:
- Use pinned `@supabase/supabase-js@2.50.2` (grep all functions)
- Have smoke test verifying endpoint responds 200/401
- Match TypeScript signatures in frontend (no arg count mismatches)
```

**UPDATE TO**:
```markdown
**Edge functions MUST**:
- Use pinned `@supabase/supabase-js@2.50.2` (grep all functions)
- Have integration tests verifying expected behavior
- Match TypeScript signatures in frontend (no arg count mismatches)
```

### Section 6.6) Post-Commit Production Validation (Lines 317-334)
**CURRENT**:
```markdown
**Autonomous Workflow**:
```
QGIT (commit + push)
       ↓
Wait 2 min for Vercel deployment (poll x-vercel-id header)
       ↓
Run smoke-test.sh prelaunch.bearlakecamp.com --force
       ↓
PASS? → Done (log success)
FAIL? → Diagnosis agent categorizes failure
       ↓
Safe fix? → Auto-fix agent applies fix → new commit → retry (max 3x)
Unsafe?  → Escalate to human (notify and block)
```
```

**UPDATE TO**:
```markdown
**Autonomous Workflow**:
```
QGIT (commit + push)
       ↓
Wait 2 min for Vercel deployment (poll x-vercel-id header)
       ↓
Run Playwright production tests
       ↓
PASS? → Done (log success)
FAIL? → Diagnosis agent categorizes failure
       ↓
Safe fix? → Auto-fix agent applies fix → new commit → retry (max 3x)
Unsafe?  → Escalate to human (notify and block)
```
```

## Recommendations

### 1. Phased Removal Approach (Recommended)
Execute removals in this order to minimize breakage:

**Phase 1: Disable Preview Feature**
- Update `lib/config/feature-flags.ts` to return `false` for `isLivePreviewEnabled()`
- Test Keystatic editor without preview panel
- Deploy and verify no regressions
- **Benefit**: Reversible without code changes

**Phase 2: Remove Preview Integration from Layout**
- Update `app/keystatic/layout.tsx` to remove PreviewPanelLayout wrapper
- Remove IframeGuard components
- Test editor layout renders correctly
- **Benefit**: Visual confirmation before file deletions

**Phase 3: Delete Preview Components and Utilities**
- Delete `components/keystatic/preview/` directory (17 files)
- Delete `lib/preview/` directory (6 files)
- Delete `hooks/usePreviewContentExtractor.ts` and `hooks/usePreviewSync.ts`
- Delete `lib/analytics/preview-events.ts`
- Delete `app/keystatic/preview/` route
- Run `npm run typecheck` to verify no broken imports
- **Benefit**: Bulk deletion with type-safety verification

**Phase 4: Revert Homepage Hero to Video**
- Update `content/pages/index.mdoc` to use `heroVideo` instead of `heroImage`
- Verify video file exists in public directory
- Test homepage renders with video
- **Benefit**: Independent from preview removal, can be done separately

**Phase 5: Remove Smoke Test Infrastructure** (HIGHEST RISK)
- Update CLAUDE.md to remove smoke test mandates (8 sections)
- Update .claude/agents/validation-specialist.md
- Delete `scripts/smoke-test.sh` and `scripts/smoke-test.spec.sh`
- Update `scripts/post-commit-validate.sh` to use Playwright instead
- Update or delete 18 requirements files
- Delete 8 documentation files in docs/operations/ and docs/technical/
- Update 3 test files
- **Benefit**: Removes 1,375+ lines of shell script complexity
- **Risk**: Loses automated HTTP 200 validation; must ensure Playwright covers equivalent checks

**Phase 6: Documentation Cleanup**
- Move preview requirements to archive or delete
- Update CLAUDE.md references to preview system (if any remain)
- Clean up .ralph/ historical files
- **Benefit**: Reduces documentation debt

### 2. Alternative: Keep Smoke Tests, Remove Only Preview
If smoke test removal is too risky, consider:
- Execute Phases 1-4 only (remove preview, keep smoke tests)
- Update smoke-test.sh line 280-286 to remove HeroVideo check (or adapt to HeroImage)
- Keep CLAUDE.md workflow automation intact
- **Benefit**: Maintains production validation safety net
- **Trade-off**: Keeps 1,375 lines of shell script and 59 dependent files

### 3. Type Safety Validation Script
After all deletions, run this verification:
```bash
# Check for broken imports
npm run typecheck

# Find any remaining preview references in code
grep -r "preview" --include="*.ts" --include="*.tsx" app/ components/ lib/ hooks/

# Verify no preview types imported
grep -r "import.*preview" --include="*.ts" --include="*.tsx" app/ components/ lib/ hooks/

# Run tests
npm test

# Build production bundle
npm run build
```

### 4. Rollback Plan
**If Issues Arise**:
1. Revert commits in reverse order (git revert)
2. Restore deleted files from git history: `git checkout HEAD~1 -- path/to/file`
3. Re-enable preview feature flag as temporary measure
4. Debug specific integration issues before re-attempting

**Critical Rollback Points**:
- After Phase 2: Can restore layout.tsx from git
- After Phase 3: Can restore deleted directories from git
- After Phase 5: **CANNOT easily rollback** - smoke test removal touches 59 files

## Risks

### 1. CLAUDE.md Workflow Disruption (CRITICAL)
**Risk**: Removing smoke tests eliminates production HTTP 200 validation
- **Severity**: HIGH - Deployments may succeed with broken pages
- **Mitigation**: Ensure Playwright tests cover ALL routes smoke tests validated
- **Detection**: Update Playwright tests to fail if any critical route returns non-200
- **Alternative**: Keep smoke tests, update only to remove HeroVideo check

### 2. Orphaned Dependencies (MEDIUM)
**Risk**: Deleting preview components may leave orphaned imports in unexpected places
- **Severity**: MEDIUM - TypeScript compile errors
- **Mitigation**: Run `npm run typecheck` after each phase
- **Detection**: CI will catch before deployment
- **Alternative**: Use grep to find all preview imports before deletion

### 3. Layout Regression (MEDIUM)
**Risk**: Removing PreviewPanelLayout wrapper may cause layout issues in Keystatic editor
- **Severity**: MEDIUM - Editor may not scroll correctly or lose flex layout
- **Mitigation**: Test editor extensively after layout.tsx changes
- **Detection**: Visual inspection of /keystatic route
- **Alternative**: Keep same div structure, just remove PreviewPanelLayout component wrapper

### 4. Homepage Video Missing (LOW)
**Risk**: heroVideo file path may not exist, causing homepage rendering error
- **Severity**: LOW - Homepage would show broken video or error
- **Mitigation**: Verify video file exists before content change
- **Detection**: Test homepage at / route after content update
- **Alternative**: Use heroImage temporarily until video file confirmed

### 5. Documentation Drift (LOW)
**Risk**: 59 files reference smoke tests; incomplete updates create misleading docs
- **Severity**: LOW - Confusing for future developers
- **Mitigation**: Use global search/replace for "smoke-test.sh" and "smoke test"
- **Detection**: Code review of CLAUDE.md and requirements files
- **Alternative**: Move smoke test docs to archive/ instead of deleting

### 6. Test Coverage Gap (HIGH)
**Risk**: Deleting smoke tests without equivalent Playwright coverage creates blind spots
- **Severity**: HIGH - Production issues may not be detected
- **Mitigation**:
  - Audit current smoke test coverage (24+ pages validated)
  - Ensure Playwright tests cover same routes
  - Add HTTP status code assertions to Playwright tests
  - Verify Keystatic admin routes (/keystatic/collection/pages) still validated
- **Detection**: Compare smoke-test.sh route list vs Playwright test coverage
- **Alternative**: Convert smoke-test.sh checks to Playwright assertions before deleting script

## Migration Path

### Current State
```
Keystatic Layout:
  ├─ IframeGuard (hideInIframe=true)
  │   ├─ Editor enhancers (SEO, RecentPages, etc.)
  │   ├─ PreviewPanelLayout (wraps children)
  │   │   └─ children (Keystatic editor content)
  │   └─ PageEditingToolbar
  └─ IframeGuard (hideInIframe=false)
      └─ children (rendered when in iframe)

Homepage Content:
  ├─ heroImage: /images/...jpg
  └─ templateFields.discriminant: homepage

Validation Workflow:
  ├─ smoke-test.sh validates 24+ routes
  ├─ Checks HTTP 200, content length, title tag
  ├─ Homepage-specific checks for video element
  └─ CLAUDE.md mandates after every deployment
```

### Target State
```
Keystatic Layout:
  ├─ Editor enhancers (SEO, RecentPages, etc.)
  ├─ children (Keystatic editor content, no wrapper)
  └─ PageEditingToolbar

Homepage Content:
  ├─ heroVideo: /videos/hero-video.mp4
  └─ templateFields.discriminant: homepage

Validation Workflow:
  ├─ Playwright tests validate critical routes
  ├─ Screenshot verification for visual changes
  └─ CLAUDE.md recommends manual verification + Playwright
```

### Deleted Components
```
components/keystatic/preview/ (17 files, ~2,500 lines)
lib/preview/ (6 files, ~800 lines)
hooks/usePreviewContentExtractor.ts (479 lines)
hooks/usePreviewSync.ts (293 lines)
app/keystatic/preview/ (route, 134+ lines)
scripts/smoke-test.sh (1,375 lines)
+ 50+ documentation and requirement files
```

### Files Modified (Estimated)
```
app/keystatic/layout.tsx (remove 15 lines, update structure)
content/pages/index.mdoc (change 1 field)
CLAUDE.md (update 8 sections)
.claude/agents/validation-specialist.md (update tools list)
scripts/post-commit-validate.sh (replace smoke-test.sh with Playwright)
+ 15-20 requirements files (remove smoke test references)
+ 5-8 documentation files (remove or update)
```

### Estimated Story Points
- **Preview Removal** (Phases 1-4): 3 SP
  - Layout refactor: 0.5 SP
  - Component deletion: 0.5 SP
  - Type cleanup: 0.5 SP
  - Testing: 1 SP
  - Documentation: 0.5 SP

- **Homepage Hero Revert** (Phase 4): 0.2 SP
  - Content change: 0.1 SP
  - Verification: 0.1 SP

- **Smoke Test Removal** (Phase 5): 5 SP
  - CLAUDE.md updates: 1 SP
  - Script deletion and validation: 1 SP
  - Requirements file updates: 1.5 SP
  - Documentation updates: 0.5 SP
  - Playwright migration: 2 SP (ensure coverage parity)
  - Testing and verification: 1 SP

**Total: 8 SP** (split into two batches per REQ-PROC-009: max 5 SP per phase)

### Recommended Batch Split
**Batch 1 (5 SP)**: Phases 1-4 + partial Phase 5
- Remove preview feature completely
- Revert homepage hero to video
- Update CLAUDE.md and core workflow files
- Deploy and verify

**Batch 2 (3 SP)**: Complete Phase 5 + Phase 6
- Complete smoke test infrastructure removal
- Update remaining requirements and docs
- Final verification and cleanup
