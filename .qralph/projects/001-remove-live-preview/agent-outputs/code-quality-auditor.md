# Code Quality Audit: Live Preview & Smoke Test Removal

**Project**: 001-remove-live-preview
**Date**: 2026-02-05
**Auditor**: Code-Quality-Auditor
**Execution Mode**: QPLAN Debug Analysis

---

## Executive Summary

Complete inventory of files requiring deletion and modification for three cleanup tasks:
1. **Live Preview Feature Removal** (16 component files, 6 hook files, 3 library files)
2. **Smoke Test Infrastructure Removal** (2 shell scripts, 8 test files, 5 documentation files)
3. **Homepage Hero Content Revert** (1 content file change)

**Total Files to DELETE**: 34
**Total Files to MODIFY**: 8 (imports/references)
**Content Changes**: 1 (index.mdoc)

---

## Section 1: Live Preview Files to DELETE

### Components (Keystatic Preview UI)
Location: `/Users/travis/SGDrive/dev/bearlakecamp/components/keystatic/preview/`

Complete directory deletion (16 files):
```
components/keystatic/preview/ResizeDivider.tsx
components/keystatic/preview/ResizeDivider.spec.tsx
components/keystatic/preview/PreviewPanelLayout.tsx
components/keystatic/preview/PreviewPanelLayout.spec.tsx
components/keystatic/preview/PreviewIframe.tsx
components/keystatic/preview/PreviewIframe.spec.tsx
components/keystatic/preview/PreviewHeader.tsx
components/keystatic/preview/PreviewHeader.spec.tsx
components/keystatic/preview/ViewportToggle.tsx
components/keystatic/preview/ViewportToggle.spec.tsx
components/keystatic/preview/WidthIndicator.tsx
components/keystatic/preview/DeviceFrame.tsx
components/keystatic/preview/PreviewRenderer.tsx
components/keystatic/preview/IframeGuard.tsx
components/keystatic/preview/iframe-security.ts
components/keystatic/preview/SyncStatusIndicator.tsx
```

### App Routes (Keystatic Preview Page)
Location: `/Users/travis/SGDrive/dev/bearlakecamp/app/keystatic/preview/`

Complete directory deletion (2 files):
```
app/keystatic/preview/page.tsx
app/keystatic/preview/layout.tsx
```

### Library (Preview Runtime & Types)
Location: `/Users/travis/SGDrive/dev/bearlakecamp/lib/preview/`

Complete directory deletion (6 files):
```
lib/preview/feature-flags.ts
lib/preview/content-renderer.tsx
lib/preview/viewport-storage.ts
lib/preview/template-loader.tsx
lib/preview/tag-allowlist.ts
lib/preview/MarkdocErrorBoundary.tsx
```

### Type Definitions
Location: `/Users/travis/SGDrive/dev/bearlakecamp/lib/types/`

Single file deletion:
```
lib/types/preview.ts
```

### Analytics
Location: `/Users/travis/SGDrive/dev/bearlakecamp/lib/analytics/`

Single file deletion:
```
lib/analytics/preview-events.ts
```

### Hooks
Location: `/Users/travis/SGDrive/dev/bearlakecamp/hooks/`

Two files to delete:
```
hooks/usePreviewSync.ts
hooks/usePreviewContentExtractor.ts
```

### Keystatic Utilities
Location: `/Users/travis/SGDrive/dev/bearlakecamp/lib/keystatic/`

Single file (affects live preview feature):
```
lib/keystatic/template-extractors.ts (DELETE - used only by preview content extractor)
```

### Spike/POC Files
Location: `/Users/travis/SGDrive/dev/bearlakecamp/spike/`

Two files to delete (proof of concept):
```
spike/preview-poc.tsx
spike/preview-poc.spec.tsx
```

### Test Files (E2E)
Location: `/Users/travis/SGDrive/dev/bearlakecamp/tests/e2e/spike/`

Single file to delete:
```
tests/e2e/spike/live-preview-spike.spec.ts
```

**Live Preview Total: 28 files to DELETE**

---

## Section 2: Smoke Test Files to DELETE

### Shell Scripts
Location: `/Users/travis/SGDrive/dev/bearlakecamp/scripts/`

```
scripts/smoke-test.sh
scripts/smoke-test.spec.sh
scripts/post-commit-validate.sh (DELETE - orchestrates smoke tests)
```

### Integration Test Files
Location: `/Users/travis/SGDrive/dev/bearlakecamp/tests/integration/`

```
tests/integration/keystatic-smoke.spec.ts
tests/integration/keystatic-admin-smoke.spec.ts
tests/integration/post-commit-workflow.spec.ts
tests/integration/verification-workflow.spec.ts
tests/integration/KEYSTATIC-SMOKE-TEST-SUMMARY.md
```

### Configuration Test
Location: `/Users/travis/SGDrive/dev/bearlakecamp/`

```
keystatic.config.smoke.test.ts
```

### Documentation/Requirements
Location: `/Users/travis/SGDrive/dev/bearlakecamp/requirements/implemented/` & `/Users/travis/SGDrive/dev/bearlakecamp/docs/tasks/`

```
requirements/implemented/smoke-test-system.lock.md
docs/tasks/smoke-test-implementation-plan.md
docs/tasks/smoke-test-plan-bundle.md
```

### Log Directory (entire directory)
Location: `/Users/travis/SGDrive/dev/bearlakecamp/logs/smoke/`

```
logs/smoke/ (entire directory with all JSON logs)
```

**Smoke Test Total: 15 files/directories to DELETE**

---

## Section 3: Files to MODIFY (Remove Imports)

### 1. app/keystatic/layout.tsx
**Location**: `/Users/travis/SGDrive/dev/bearlakecamp/app/keystatic/layout.tsx`

**Lines to remove**:
```typescript
// Line 11-12
import { PreviewPanelLayout } from "@/components/keystatic/preview/PreviewPanelLayout";
import { IframeGuard } from "@/components/keystatic/preview/IframeGuard";
```

**Component usage to remove** (lines 38-72):
- Remove `<IframeGuard hideInIframe={true}>` wrapper (line 38)
- Remove `<PreviewPanelLayout>` wrapper (line 59)
- Remove closing `</PreviewPanelLayout>` (line 63)
- Remove closing `</IframeGuard>` (line 65)
- Remove second `<IframeGuard hideInIframe={false}>` section (lines 68-72)

**Simplified result**: Direct children rendering without preview UI

---

### 2. components/templates/HomepageTemplate.tsx
**Location**: `/Users/travis/SGDrive/dev/bearlakecamp/components/templates/HomepageTemplate.tsx`

**Lines to remove**:
```typescript
// Lines 22-23
import { PreviewBodyContent } from "@/lib/preview/content-renderer";
import { hasValidMarkdocTags } from "@/lib/preview/tag-allowlist";
```

**Impact**: Remove preview-specific rendering logic if any conditional logic exists

---

### 3. components/templates/ProgramTemplate.tsx
**Location**: `/Users/travis/SGDrive/dev/bearlakecamp/components/templates/ProgramTemplate.tsx`

**Lines to remove**:
```typescript
// Line 11
import { PreviewBodyContent } from "@/lib/preview/content-renderer";
```

---

### 4. components/templates/StaffListTemplate.tsx
**Location**: `/Users/travis/SGDrive/dev/bearlakecamp/components/templates/StaffListTemplate.tsx`

**Lines to remove**:
```typescript
// Line 12
import { PreviewBodyContent } from "@/lib/preview/content-renderer";
```

---

### 5. components/templates/StaffTemplate.tsx
**Location**: `/Users/travis/SGDrive/dev/bearlakecamp/components/templates/StaffTemplate.tsx`

**Lines to remove**:
```typescript
// Line 12
import { PreviewBodyContent } from "@/lib/preview/content-renderer";
```

---

### 6. components/templates/FacilityTemplate.tsx
**Location**: `/Users/travis/SGDrive/dev/bearlakecamp/components/templates/FacilityTemplate.tsx`

**Lines to remove**:
```typescript
// Line 10
import { PreviewBodyContent } from "@/lib/preview/content-renderer";
```

---

### 7. hooks/usePerformanceMonitor.ts
**Location**: `/Users/travis/SGDrive/dev/bearlakecamp/hooks/usePerformanceMonitor.ts`

**Lines to remove**:
```typescript
// Lines 13-14
} from "@/lib/types/preview";
import { DEFAULT_PERFORMANCE_BUDGETS } from "@/lib/types/preview";
```

**Impact**: Remove preview-specific performance monitoring (if applicable)

---

### 8. lib/keystatic/template-extractors.ts
**Location**: `/Users/travis/SGDrive/dev/bearlakecamp/lib/keystatic/template-extractors.ts`

**Lines to remove** (entire file deletion):
```typescript
// This file imports from @/lib/types/preview
import type { TemplateName } from "@/lib/types/preview";
```

**Status**: DELETE entirely - file exists solely to support live preview feature extraction

---

## Section 4: Content Changes - Homepage Hero Revert

### File: content/pages/index.mdoc
**Location**: `/Users/travis/SGDrive/dev/bearlakecamp/content/pages/index.mdoc`

**Current Content** (Line 3):
```yaml
heroImage: /images/summer-program-and-general/Top-promo-7-scaled-e1731002368158.jpg
```

**Change Required**: Replace with
```yaml
heroVideo: /path/to/hero-video.mp4
```

**Action Plan**:
1. Determine correct heroVideo path (need to locate existing hero video file)
2. Change `heroImage:` to `heroVideo:`
3. Update value to video path
4. Verify app/page.tsx renders video correctly (check logic at lines with `page.heroVideo`)

**Current Logic in app/page.tsx** (verified):
```typescript
{page.heroVideo ? (
    <video
        src={page.heroVideo}
        poster={page.heroImage || undefined}
    />
) : templateFields.heroImages.length > 0 ? (
    <HeroCarousel images={templateFields.heroImages} />
) : (
    // fallback to heroImage
)}
```

**Note**: The app code already supports `heroVideo` field - the content change is sufficient.

---

## Section 5: Breaking Change Analysis

### Cascading Import Failures (Will break without removal)

**Files importing from lib/types/preview:**
```
components/keystatic/preview/SyncStatusIndicator.tsx (imports PreviewConnectionStatus)
hooks/usePerformanceMonitor.ts (imports multiple types)
hooks/usePreviewContentExtractor.ts (DELETE - entire file)
components/keystatic/preview/DeviceFrame.tsx (imports ViewportMode)
hooks/usePreviewSync.ts (DELETE - entire file)
components/keystatic/preview/PreviewRenderer.tsx (imports PreviewContent)
components/keystatic/preview/PreviewHeader.tsx (imports PreviewConnectionStatus, ViewportMode)
components/keystatic/preview/ViewportToggle.tsx (imports ViewportMode)
components/keystatic/preview/WidthIndicator.tsx (imports ViewportMode, VIEWPORT_WIDTHS)
lib/preview/template-loader.tsx (imports TemplateName from preview types)
app/keystatic/preview/page.tsx (imports PreviewContent, PreviewMessage)
lib/keystatic/template-extractors.ts (imports TemplateName from preview types)
```

**Status**: ALL cleared when preview directory deleted + files modified above

### Smoke Test Infrastructure Dependencies

**Files reference post-commit-validate.sh:**
```
.claude/settings.json (line 17) - "script": "./scripts/post-commit-validate.sh"
CLAUDE.md (section 6.6) - references post-commit validation
```

**Required Actions**:
1. Remove `"script": "./scripts/post-commit-validate.sh"` from settings.json
2. Disable or remove postCommitHooks section from settings.json
3. Update CLAUDE.md to remove references to smoke test automation

---

## Section 6: Dependency Cross-References in CLAUDE.md

**Lines to Review/Update in CLAUDE.md**:
- Line ~85: "run: `./scripts/smoke-test.sh --force prelaunch.bearlakecamp.com`"
- Section 6.6 (Pre-Deployment Gates): References smoke-test.sh
- Section 3 (Post-Commit Validation): References post-commit-validate.sh and smoke test flows
- Validation-specialist agent references: smoke-test execution

**Scope**: Update documentation but preserve CI/CD validation concepts

---

## Section 7: Code Quality Issues Identified

### Technical Debt Items

1. **Orphaned Dependencies**: After deletion
   - `lib/types/preview.ts` has no remaining consumers
   - `lib/keystatic/template-extractors.ts` only used by preview
   - `lib/preview/` entire directory unused after removal

2. **Keystatic Layout Complexity**:
   - Current `app/keystatic/layout.tsx` has dual-render logic (IframeGuard for preview + regular)
   - After removal, can simplify to single render path (lines 33-76 can reduce to ~20 lines)

3. **Hook Cleanup**:
   - `hooks/usePerformanceMonitor.ts` has conditional preview logic
   - `hooks/usePreviewSync.ts` and `hooks/usePreviewContentExtractor.ts` are 100% preview-dependent

4. **Test Coverage Gap**:
   - Removing smoke-test infrastructure means losing production validation
   - Recommend replacing with simpler Playwright production tests

### Anti-Patterns Removed

1. **postMessage Communication Complexity**:
   - `usePreviewSync.ts` uses complex retry/recovery strategies (68 lines of recovery logic)
   - Removing unnecessary complexity from CMS editor

2. **DOM Extraction Coupling**:
   - `usePreviewContentExtractor.ts` tightly couples to Keystatic editor DOM selectors (250+ lines)
   - High maintenance burden for editor UI changes

3. **Feature Flag Overhead**:
   - `lib/preview/feature-flags.ts` adds conditional rendering overhead
   - Can be eliminated entirely

---

## Section 8: Summary Statistics

| Category | Count | Files |
|----------|-------|-------|
| **Preview Components** | 16 | components/keystatic/preview/* |
| **Preview Routes** | 2 | app/keystatic/preview/* |
| **Preview Libraries** | 6 | lib/preview/* |
| **Preview Types** | 1 | lib/types/preview.ts |
| **Preview Hooks** | 2 | hooks/usePreview*.ts |
| **Preview Analytics** | 1 | lib/analytics/preview-events.ts |
| **Preview Extractors** | 1 | lib/keystatic/template-extractors.ts |
| **Preview POC/Spikes** | 2 | spike/preview-*.tsx |
| **Preview E2E Tests** | 1 | tests/e2e/spike/live-preview-spike.spec.ts |
| **Smoke Test Scripts** | 3 | scripts/{smoke-test,post-commit-validate}* |
| **Smoke Test Integration Tests** | 4 | tests/integration/{keystatic,post-commit,verification}-smoke* |
| **Smoke Test Config** | 1 | keystatic.config.smoke.test.ts |
| **Smoke Test Docs** | 3 | requirements/docs/tasks/*smoke* |
| **Smoke Test Logs** | 1 dir | logs/smoke/ |
| **Files to Modify** | 8 | app/keystatic/layout.tsx + 7 templates |
| **Content Changes** | 1 | content/pages/index.mdoc |
| | | |
| **TOTAL FILES TO DELETE** | **34** | |
| **TOTAL FILES TO MODIFY** | **8** | |

---

## Section 9: Recommendations

### Immediate Actions (Critical Path)

1. **Delete Preview Components** (16 files)
   - Remove entire `/components/keystatic/preview/` directory
   - Verify no import errors with `npm run typecheck`

2. **Delete Preview Routes** (2 files)
   - Remove entire `/app/keystatic/preview/` directory
   - Keystatic will no longer route to /keystatic/preview

3. **Delete Preview Libraries** (6 files)
   - Remove entire `/lib/preview/` directory
   - Removes ~800 lines of feature-specific code

4. **Update Keystatic Layout** (1 file, 4 changes)
   - Modify `/app/keystatic/layout.tsx`
   - Remove IframeGuard imports and components
   - Remove PreviewPanelLayout wrapper
   - Simplify to single render path (reduces ~40 lines)

5. **Delete Type Definitions** (1 file)
   - Remove `/lib/types/preview.ts`
   - ~300 lines of type definitions eliminated

6. **Update Template Imports** (6 files)
   - Remove `PreviewBodyContent` import from all templates
   - Verify templates still render correctly

### Phase 2: Smoke Test Removal

7. **Delete Shell Scripts** (3 files)
   - Remove `/scripts/smoke-test.sh`
   - Remove `/scripts/smoke-test.spec.sh`
   - Remove `/scripts/post-commit-validate.sh`

8. **Delete Smoke Test Integration Tests** (4 files)
   - Remove `/tests/integration/keystatic-smoke.spec.ts`
   - Remove `/tests/integration/keystatic-admin-smoke.spec.ts`
   - Remove `/tests/integration/post-commit-workflow.spec.ts`
   - Remove `/tests/integration/verification-workflow.spec.ts`

9. **Delete Smoke Test Configuration** (1 file)
   - Remove `/keystatic.config.smoke.test.ts`

10. **Clean Up Documentation** (3 files)
    - Remove `/requirements/implemented/smoke-test-system.lock.md`
    - Remove `/docs/tasks/smoke-test-implementation-plan.md`
    - Remove `/docs/tasks/smoke-test-plan-bundle.md`

11. **Remove Log Directory** (1 directory)
    - Remove entire `/logs/smoke/` directory

12. **Update Settings** (1 file)
    - Modify `/.claude/settings.json`
    - Remove `"postCommitHooks"` section (lines 13-21)
    - Remove `"script"` reference to post-commit-validate.sh

### Phase 3: Content & Documentation Updates

13. **Update Homepage Content** (1 file)
    - Modify `/content/pages/index.mdoc`
    - Change `heroImage:` to `heroVideo:` (line 3)
    - Set correct video path

14. **Update CLAUDE.md** (1 file)
    - Remove references to `./scripts/smoke-test.sh`
    - Remove post-commit validation workflow descriptions
    - Simplify production validation section (6.6)
    - Keep CI/CD gate concepts but remove shell script references

### Phase 4: Cleanup

15. **Delete Spike/POC Files** (2 files)
    - Remove `/spike/preview-poc.tsx`
    - Remove `/spike/preview-poc.spec.tsx`

16. **Delete Preview Hook Files** (2 files)
    - Remove `/hooks/usePreviewSync.ts`
    - Remove `/hooks/usePreviewContentExtractor.ts`

17. **Delete Analytics** (1 file)
    - Remove `/lib/analytics/preview-events.ts`

18. **Delete E2E Spike Test** (1 file)
    - Remove `/tests/e2e/spike/live-preview-spike.spec.ts`

19. **Delete Template Extractor** (1 file)
    - Remove `/lib/keystatic/template-extractors.ts`

### Verification Steps

1. Run `npm run typecheck` - should have 0 errors
2. Run `npm run lint` - should pass
3. Run `npm run test` - all tests should pass
4. Verify Keystatic editor loads without errors
5. Verify homepage renders with video hero
6. Verify no console errors in production build

---

## Section 10: Risk Assessment

### Low Risk
- Deleting preview components (isolated feature)
- Deleting smoke test infrastructure (standalone scripts)
- Removing CLAUDE.md documentation (non-functional)

### Medium Risk
- Updating keystatic/layout.tsx (modifies core editor layout)
  - **Mitigation**: Simplified logic easier to verify
- Changing index.mdoc heroImage to heroVideo
  - **Mitigation**: App code already supports heroVideo field

### High Risk (None Identified)
- No breaking changes to core application
- No database schema changes
- No API contract changes
- Live preview is truly isolated feature

---

## Conclusion

This is a **well-scoped cleanup** of two isolated features:

1. **Live Preview**: 28 files (components, routes, utilities, tests, spikes)
2. **Smoke Test Infrastructure**: 15 files (scripts, tests, configs, logs)
3. **Content Update**: 1 file change (heroImage → heroVideo)
4. **Import Cleanup**: 8 files (remove unused imports)

**Total Effort**: Low-complexity deletions with straightforward import removals. No architectural changes required. Keystatic and homepage will continue functioning normally with simplified codebase.

**Recommendation**: Execute as single batch (PRv1: Preview removal, PRv2: Smoke test removal, PRv3: Content updates) or all together per request.
