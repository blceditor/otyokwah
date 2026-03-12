# SDE-III Position Memo: Remove Live Preview Feature

**Recommendation:** Build (deletion/reversion)

**Effort Estimation:**
- Story Points: 3 SP
- Confidence: High

## Summary

This project involves three distinct removal/reversion tasks: (1) Complete removal of the Live Preview feature from Keystatic editor, (2) Reverting homepage hero from image back to video, and (3) Deleting all smoke test infrastructure. The work is straightforward deletion with some layout cleanup, minimal risk since we're removing features rather than adding complexity.

## Implementation Breakdown

### Phase 1: Delete Live Preview Files (0.5 SP - simple)

Delete all preview-related component files:

```bash
# Component files
rm -rf /Users/travis/SGDrive/dev/bearlakecamp/components/keystatic/preview/

# App routes
rm -rf /Users/travis/SGDrive/dev/bearlakecamp/app/keystatic/preview/

# Library utilities
rm -rf /Users/travis/SGDrive/dev/bearlakecamp/lib/preview/

# Hooks
rm /Users/travis/SGDrive/dev/bearlakecamp/hooks/usePreviewContentExtractor.ts
rm /Users/travis/SGDrive/dev/bearlakecamp/hooks/usePreviewSync.ts

# API routes
rm -rf /Users/travis/SGDrive/dev/bearlakecamp/pages/api/preview/

# Analytics
rm /Users/travis/SGDrive/dev/bearlakecamp/lib/analytics/preview-events.ts

# Types
rm /Users/travis/SGDrive/dev/bearlakecamp/lib/types/preview.ts

# Spike/POC files
rm /Users/travis/SGDrive/dev/bearlakecamp/spike/preview-poc.tsx
rm /Users/travis/SGDrive/dev/bearlakecamp/spike/preview-poc.spec.tsx

# E2E tests
rm /Users/travis/SGDrive/dev/bearlakecamp/tests/e2e/spike/live-preview-spike.spec.ts

# Documentation
rm /Users/travis/SGDrive/dev/bearlakecamp/requirements/REQ-PREVIEW-PANEL.md
rm /Users/travis/SGDrive/dev/bearlakecamp/requirements/REQ-PREVIEW-UX.md
rm /Users/travis/SGDrive/dev/bearlakecamp/requirements/LIVE-PREVIEW-ARCHITECTURE.md
rm /Users/travis/SGDrive/dev/bearlakecamp/requirements/QPLAN-LIVE-PREVIEW-SYNTHESIZED.md
rm /Users/travis/SGDrive/dev/bearlakecamp/requirements/REQ-PREVIEW-PANEL-TECH.md
```

### Phase 2: Update Keystatic Layout (1.0 SP - moderate)

Edit `/Users/travis/SGDrive/dev/bearlakecamp/app/keystatic/layout.tsx`:

**Remove these imports:**
```typescript
import { PreviewPanelLayout } from "@/components/keystatic/preview/PreviewPanelLayout";
import { IframeGuard } from "@/components/keystatic/preview/IframeGuard";
```

**Replace the layout structure:**

OLD (lines 34-75):
```typescript
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <div className="flex flex-col h-screen bg-white dark:bg-dark-bg transition-colors duration-200">
        {/* REQ-LP-V4-002: Hide editor UI when rendered in preview iframe */}
        <IframeGuard hideInIframe={true}>
          {/* ... enhancers ... */}
          <div className="sticky top-0 z-10 bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border flex-shrink-0 transition-colors duration-200">
            <KeystaticToolsHeader />
          </div>
          <RepoAccessErrorBanner />
          {/* REQ-LP-001: Live Preview Panel - checks localStorage directly */}
          <PreviewPanelLayout>
            <div className="flex-1 overflow-auto pb-20">
              {children}
            </div>
          </PreviewPanelLayout>
          <PageEditingToolbar />
        </IframeGuard>

        {/* When in iframe, render children directly without editor chrome */}
        <IframeGuard hideInIframe={false}>
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </IframeGuard>
      </div>
    </ThemeProvider>
  );
}
```

NEW (simplified):
```typescript
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <div className="flex flex-col h-screen bg-white dark:bg-dark-bg transition-colors duration-200">
        {/* REQ-CMS-003: SEO Accordion Enhancement */}
        <SEOFieldsetEnhancer />
        {/* REQ-FUTURE-013: Recent Pages Sort */}
        <RecentPagesEnhancer />
        {/* REQ-FUTURE-019: Alt Text Suggestions */}
        <ImageFieldEnhancer />
        {/* REQ-MEDIA-003: Media Picker for Image/Video Fields */}
        <MediaFieldEnhancer />
        {/* REQ-CARD-004: Visual Icon Picker for Icon Fields */}
        <IconFieldEnhancer />
        {/* REQ-CMS-003: Save Monitor for deployment status updates */}
        <SaveMonitor />

        <div className="sticky top-0 z-10 bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border flex-shrink-0 transition-colors duration-200">
          <KeystaticToolsHeader />
        </div>

        {/* REQ-CMS-AUTH: Show banner when signed in with wrong GitHub account */}
        <RepoAccessErrorBanner />

        <div className="flex-1 overflow-auto pb-20">
          {children}
        </div>

        <PageEditingToolbar />
      </div>
    </ThemeProvider>
  );
}
```

### Phase 3: Remove Preview Imports from Other Files (0.5 SP - simple)

Files that import preview components will need cleanup:

1. **Template files** (if any import preview utilities):
   - `/Users/travis/SGDrive/dev/bearlakecamp/components/templates/StaffTemplate.tsx`
   - `/Users/travis/SGDrive/dev/bearlakecamp/components/templates/ProgramTemplate.tsx`
   - `/Users/travis/SGDrive/dev/bearlakecamp/components/templates/StaffListTemplate.tsx`
   - `/Users/travis/SGDrive/dev/bearlakecamp/components/templates/HomepageTemplate.tsx`
   - `/Users/travis/SGDrive/dev/bearlakecamp/components/templates/FacilityTemplate.tsx`

2. **Utility files**:
   - `/Users/travis/SGDrive/dev/bearlakecamp/lib/keystatic/template-extractors.ts`
   - `/Users/travis/SGDrive/dev/bearlakecamp/hooks/usePerformanceMonitor.ts`

**Action:** Search and remove any `import` statements referencing preview modules, and remove related code that uses those imports.

### Phase 4: Revert Homepage Hero to Video (0.3 SP - simple)

Use git to restore the heroVideo field:

```bash
# Show the version with heroVideo
git show 3089e55:content/pages/index.mdoc > /tmp/homepage-with-video.mdoc

# Review the diff to confirm it's correct
diff /tmp/homepage-with-video.mdoc /Users/travis/SGDrive/dev/bearlakecamp/content/pages/index.mdoc

# Apply the restoration (just add heroVideo line back)
```

**Manual edit required:**

In `/Users/travis/SGDrive/dev/bearlakecamp/content/pages/index.mdoc`, add this line after line 3:

```yaml
heroVideo: /videos/hero-home.mp4
```

The file should have BOTH heroImage and heroVideo (the component logic will prefer video over image).

### Phase 5: Delete Smoke Tests (0.5 SP - simple)

Remove all smoke test infrastructure:

```bash
# Delete smoke test scripts
rm /Users/travis/SGDrive/dev/bearlakecamp/scripts/smoke-test.sh
rm /Users/travis/SGDrive/dev/bearlakecamp/scripts/smoke-test.spec.sh

# Delete post-commit validation (depends on smoke tests)
rm /Users/travis/SGDrive/dev/bearlakecamp/scripts/post-commit-validate.sh

# Check if there are cached smoke test results to delete
rm -rf /Users/travis/SGDrive/dev/bearlakecamp/.cache/smoke/ 2>/dev/null || true
rm -rf /Users/travis/SGDrive/dev/bearlakecamp/logs/smoke/ 2>/dev/null || true
```

### Phase 6: Update CLAUDE.md (0.2 SP - simple)

Edit `/Users/travis/SGDrive/dev/bearlakecamp/CLAUDE.md`:

**Remove these sections:**

1. **Lines 9-12** - Global Production Verification rule:
```markdown
**GLOBAL RULE - Production Verification (MANDATORY)**:
- **Your job is NOT done until production is verified working**
- After ANY deployment, run: `./scripts/smoke-test.sh --force prelaunch.bearlakecamp.com`
- ALL pages must return HTTP 200 before claiming success
- This rule applies to ALL work, FOREVER - no exceptions
- Production domain: `prelaunch.bearlakecamp.com` (NOT bearlakecamp.org)
```

2. **Line 110** - Remove smoke tests from QVERIFY phase:
```markdown
  │  │  ├─ Production smoke tests (HTTP 200 checks)
```

3. **Line 126** - Remove from production monitoring:
```markdown
     ├─ Run smoke tests + Playwright on production
```

4. **Lines 167-175** - Edge Function smoke tests section:
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

5. **Line 191** - Remove smoke-test.sh from QVERIFY description:
```markdown
- **QVERIFY**: Verify production deployment works, run smoke tests, capture screenshot proof → **validation-specialist** (scripts: smoke-test.sh, post-commit-validate.sh)
```
   Change to:
```markdown
- **QVERIFY**: Verify production deployment works, capture screenshot proof → **validation-specialist**
```

6. **Line 275** - Remove smoke test requirement:
```markdown
- Have smoke test verifying endpoint responds 200/401
```

7. **Lines 324-327** - Remove post-commit production validation section:
```markdown
### Post-Commit Production Validation (after git push)

**Script**: `scripts/post-commit-validate.sh`
```
   (Remove entire subsection including configuration)

## Dependencies

**None** - This is pure deletion work with no external dependencies.

## Technical Risks

**Risk 1:** Broken imports after preview component deletion
- **Severity:** Medium
- **Mitigation:** Run `npm run typecheck` after each phase to catch import errors immediately
- **Detection:** TypeScript compiler will fail on missing imports

**Risk 2:** Layout regression in Keystatic editor
- **Severity:** Low
- **Mitigation:** Test Keystatic editor UI locally after layout changes
- **Detection:** Visual inspection - editor should render without preview panel

**Risk 3:** Lost heroVideo functionality if schema changed
- **Severity:** Low
- **Mitigation:** Verify heroVideo field still exists in keystatic.config.ts before reverting content
- **Detection:** Check schema definition, test homepage rendering locally

**Risk 4:** Scripts referenced elsewhere in workflow
- **Severity:** Low
- **Mitigation:** Grep for smoke-test.sh references in package.json, CI configs, other scripts
- **Detection:** Search entire codebase for "smoke-test" before deletion

## Verification Steps

After implementation:

1. **TypeScript compilation:**
   ```bash
   npm run typecheck
   ```
   Must pass with zero errors.

2. **Lint check:**
   ```bash
   npm run lint
   ```
   Must pass (no unused imports).

3. **Local Keystatic test:**
   ```bash
   npm run dev
   # Navigate to http://localhost:3000/keystatic
   # Verify editor loads without preview panel
   # Verify all enhancers still work (SEO, media picker, etc.)
   ```

4. **Homepage hero verification:**
   ```bash
   npm run dev
   # Navigate to http://localhost:3000
   # Verify video hero displays (not static image)
   ```

5. **File search verification:**
   ```bash
   # Ensure no references to deleted files remain
   grep -r "PreviewPanelLayout" . --exclude-dir=node_modules --exclude-dir=.git
   grep -r "smoke-test.sh" . --exclude-dir=node_modules --exclude-dir=.git
   grep -r "usePreviewSync" . --exclude-dir=node_modules --exclude-dir=.git
   ```
   All searches should return zero results.

6. **Build test:**
   ```bash
   npm run build
   ```
   Must complete successfully.

## Build vs Buy

**Build** - This is deletion/cleanup work, not a feature addition. No "buy" option applies.

## Recommendations

1. **Execute in order** - Follow phases 1-6 sequentially to minimize broken state duration
2. **Commit per phase** - Create a git commit after each phase completes to enable easy rollback
3. **Test incrementally** - Run typecheck after each file deletion batch to catch import issues early
4. **Archive documentation** - Move .ralph/ preview docs to an archive folder instead of deleting (historical context)
5. **Update package.json scripts** - Check if any npm scripts reference smoke-test.sh or preview routes

## Confidence

**High** - This is straightforward deletion work with clear file boundaries and minimal interdependencies. TypeScript will catch any import issues immediately, and the changes are easily reversible via git if needed.

## Story Point Breakdown Summary

| Phase | Task | SP | Complexity |
|-------|------|-----|-----------|
| 1 | Delete preview files | 0.5 | Simple |
| 2 | Update Keystatic layout | 1.0 | Moderate |
| 3 | Remove preview imports | 0.5 | Simple |
| 4 | Revert homepage hero | 0.3 | Simple |
| 5 | Delete smoke tests | 0.5 | Simple |
| 6 | Update CLAUDE.md | 0.2 | Simple |
| **Total** | | **3.0 SP** | |

---

**Files Referenced:**

All file paths in this document are absolute paths starting from `/Users/travis/SGDrive/dev/bearlakecamp/`.
