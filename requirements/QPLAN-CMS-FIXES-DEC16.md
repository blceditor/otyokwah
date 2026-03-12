# QPLAN: CMS Fixes - December 16, 2025

**Total Estimated Story Points**: 21 SP
**Status**: Implementation Ready

---

## Issue Analysis

### Issue 1: SEO Generation Loading State (2 SP)
**Problem**: Generate SEO generates slowly without positive feedback
**Root Cause**: SEOGenerationPanel.tsx has basic loading but no timeout or progress indication
**Solution**:
- Add progressive loading messages ("Analyzing content...", "Generating SEO...")
- Add 30-second timeout with error message
- Show elapsed time during generation

### Issue 2: Apply to Form Console Error (1 SP)
**Problem**: `SyntaxError: 'details:has(summary:has-text("SEO"))' is not a valid selector`
**Root Cause**: `:has-text()` is Playwright-specific, not valid CSS
**File**: `lib/keystatic/injectSEOIntoForm.ts:108`
**Solution**: Remove invalid `:has-text()` selector, use standard CSS

### Issue 3: Auto-Apply SEO and Remove "Apply to Form" (2 SP)
**Problem**: Extra step to click "Apply to Form" is unnecessary
**Root Cause**: Two-step process (Generate → Apply) when one is sufficient
**Solution**:
- After generation completes, auto-inject SEO into form
- Close panel and show toast with remaining credits
- Remove "Apply to Form" button

### Issue 4: Token Usage Estimation (1 SP)
**Problem**: Need to estimate tokens for proper rate limiting
**Analysis**:
- Input: ~3000 tokens (page content + prompts)
- Output: ~200 tokens (JSON SEO data)
- Total per request: ~3,200 tokens
- 2Bn tokens/month ÷ 3,200 = ~625,000 generations
- Setting conservative limit: 100 generations/month

### Issue 5: Dual Dark Mode Buttons (3 SP)
**Problem**: Two buttons controlling different parts of UI
- Custom ThemeToggle in KeystaticToolsHeader (top nav)
- Keystatic's built-in dark mode in sidebar (left menu)
**Solution**:
- Remove ThemeToggle from KeystaticToolsHeader
- Override Keystatic's built-in dark mode to control all UI
- Add CSS that applies dark mode to Keystatic's internal components

### Issue 6: Donate Button Color Conflict (1 SP)
**Problem**: Screenshot shows olive/dark green heart vs medium green button - colors clash
**Root Cause**: DonateButton uses `emerald` colors not aligned with design system
**Solution**: Use design system colors (`bg-secondary`, `text-cream`)

### Issue 7: Add Donate Button to Give Page (1 SP)
**Problem**: Give page has no donate button
**Solution**: Add DonateButton component linking to DonorBox URL

### Issue 8: Give CMS Page Error (2 SP)
**Problem**: "Expected "(" or "=" but ":" found"
**Root Cause**: Markdoc syntax validation in Keystatic
**Investigation**: Content looks standard, likely Keystatic schema mismatch
**Solution**: Validate content schema alignment

### Issue 9: summer-camp-sessions SessionCard Error (2 SP)
**Problem**: "Missing component definition for sessionCard"
**Root Cause**: Keystatic's Markdoc parser vs our MarkdocRenderer config mismatch
**Analysis**: sessionCard IS defined in MarkdocRenderer.tsx but Keystatic validates separately
**Solution**: Add sessionCard to Keystatic's markdoc schema or fix content syntax

### Issue 10: CMS Page Validation Tests (3 SP)
**Problem**: No automated tests catch validation errors like Issues 8-9
**Solution**:
- Add Playwright tests that load each CMS page
- Check for validation error messages
- Verify content renders without errors

### Issue 11: Save → "Deploying to Site" Indicator (2 SP)
**Problem**: Need better deployment status feedback
**Current**: DeploymentStatus.tsx has basic polling
**Solution**:
- On save: Show "Deploying to Site"
- Wait 2 minutes for Vercel build to start
- Poll every 30 seconds with 6 retries
- Show build failure if exceeded

### Issue 12: Link Validator 404 Detection (1 SP)
**Problem**: Validator not catching 404s on contact page
**Root Cause**: Contact page has placeholder links like `[Address Line 1]`
**Solution**: Validate that internal links resolve to actual pages

---

## Implementation Order

### Phase 1: Critical Fixes (5 SP)
1. **Issue 2**: Fix invalid CSS selector (1 SP)
2. **Issue 3**: Auto-apply SEO + toast (2 SP)
3. **Issue 1**: Loading state + timeout (2 SP)

### Phase 2: Dark Mode & Styling (4 SP)
4. **Issue 5**: Consolidate dark mode (3 SP)
5. **Issue 6**: Fix Donate Button colors (1 SP)

### Phase 3: Content Fixes (5 SP)
6. **Issue 7**: Add Donate Button to Give page (1 SP)
7. **Issue 8**: Fix Give page validation (2 SP)
8. **Issue 9**: Fix SessionCard validation (2 SP)

### Phase 4: Validation & Monitoring (5 SP)
9. **Issue 11**: Deployment status polling (2 SP)
10. **Issue 12**: Fix Link Validator (1 SP)
11. **Issue 10**: CMS validation tests (3 SP - runs in parallel)

### Phase 5: Testing & Deployment (2 SP)
12. **Issue 4**: Document token limits (1 SP)
13. Playwright tests for all features (1 SP)
14. Full validation and deploy

---

## Files to Modify

### High-Priority
- `lib/keystatic/injectSEOIntoForm.ts` - Fix invalid selector
- `components/keystatic/SEOGenerationPanel.tsx` - Auto-apply + loading
- `components/keystatic/KeystaticToolsHeader.tsx` - Remove ThemeToggle
- `components/keystatic/ThemeProvider.tsx` - Enhance dark mode coverage

### Medium-Priority
- `components/content/DonateButton.tsx` - Fix colors
- `content/pages/give.mdoc` - Add DonateButton
- `components/keystatic/DeploymentStatus.tsx` - Enhanced polling

### New Files
- `tests/e2e/keystatic/cms-page-validation.spec.ts` - CMS validation tests
