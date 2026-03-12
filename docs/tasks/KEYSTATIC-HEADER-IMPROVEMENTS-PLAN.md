# Keystatic Header Improvements Plan

**Date**: 2025-12-01
**Status**: PLANNING

---

## Issues Summary

| # | Issue | Priority | Effort |
|---|-------|----------|--------|
| 1 | DeploymentStatus stuck on "Deploying" | P0 | 0.5 SP |
| 2 | Bug Report lacks context | P1 | 1.0 SP |
| 3 | SparkryBranding refinements | P2 | 0.2 SP |
| 4 | Z-index blocking Keystatic tooltips | P0 | 0.3 SP |
| 5 | View Live dynamic page linking | P1 | 0.5 SP |
| 6 | Slug field live URL preview | P2 | 1.5 SP |
| 7 | Move tools to page editing context | P1 | 2.0 SP |

**Total Estimated Effort**: 6.0 SP

---

## Issue 1: DeploymentStatus Stuck on "Deploying" (P0)

### Problem Analysis
The deployment status shows "Deploying" with "22 minutes ago" timestamp even when deployment is complete. Root causes:
1. API returns `deployment.created` (when deploy **started**), not completion time
2. No distinction between active deployment and stale state
3. Component doesn't re-fetch on mount if state was previously "Deploying"

### Solution
1. Fix timestamp display logic:
   - For "Published": show "Last deployed X ago"
   - For "Deploying": show "Started X ago" or "Deploying..."
   - Don't show stale "Deploying" state - if timestamp > 10 mins, assume complete and re-fetch

2. Add auto-refresh on component mount if state is "Deploying"

### Implementation
```typescript
// DeploymentStatus.tsx changes:
// 1. Add smart timestamp display based on state
// 2. Re-fetch if stale "Deploying" state (>10 min old)
// 3. Show "Published" as default if API errors
```

**Effort**: 0.5 SP

---

## Issue 2: Bug Report Lacks Context (P1)

### Current State
- Only captures: slug, browser UA, timestamp, deploymentUrl
- Missing: logged-in user, full CMS URL, form field values

### Solution
Enhance BugReportModal to capture:

1. **Full CMS URL**: `window.location.href` (already partial - needs full URL)
2. **User Info**: Extract from Keystatic auth context or session
3. **Form Field Values**: This is complex - Keystatic doesn't expose form state
   - Option A: DOM scraping (fragile)
   - Option B: Pass form values through props (requires Keystatic customization)
   - **Recommended**: Capture visible form field labels/values via DOM query

### Implementation
```typescript
// BugReportModal.tsx enhancements:
interface PageContext {
  slug: string;
  fullUrl: string;           // NEW: window.location.href
  userEmail?: string;        // NEW: from auth context
  userName?: string;         // NEW: from auth context
  formFieldValues?: Record<string, string>; // NEW: scraped from DOM
  timestamp?: string;
}

// Add DOM scraper for form fields
function captureFormFields(): Record<string, string> {
  const fields: Record<string, string> = {};
  // Query Keystatic's form inputs and capture label:value pairs
  document.querySelectorAll('[data-field-name]').forEach(el => {
    // Extract field name and value
  });
  return fields;
}
```

**Effort**: 1.0 SP

---

## Issue 3: SparkryBranding Refinements (P2)

### Changes Required
1. Remove "Powered by" text
2. Remove ExternalLink icon
3. Make logo bigger (h-8 w-8 instead of h-6 w-auto)

### Implementation
```typescript
// SparkryBranding.tsx - minimal changes
export function SparkryBranding() {
  return (
    <a href="https://sparkry.ai" target="_blank" rel="noopener noreferrer">
      <Image
        src="https://sparkry.ai/sparkry-logo.png"
        alt="Sparkry AI"
        width={32}
        height={32}
        className="h-8 w-8"
      />
    </a>
  );
}
```

**Effort**: 0.2 SP

---

## Issue 4: Z-index Blocking Keystatic Tooltips (P0)

### Problem Analysis
Our header uses `z-50` which blocks Keystatic's icon tooltips (trash, github, etc.)
Keystatic's tooltips appear as children of the main content area which is below our header.

### Solution Options

| Option | Approach | Pros | Cons |
|--------|----------|------|------|
| A | Lower header z-index to z-30 | Quick fix | May get hidden behind Keystatic modals |
| B | Add top margin to content area | Doesn't block tooltips | Shifts entire Keystatic UI down |
| C | Use pointer-events on header | Allows clicks through | May affect header usability |
| **D** | Don't overlap - use margin not fixed+padding | Clean separation | Requires layout restructure |

### Recommended: Option D
Instead of `fixed` header with `pt-16` padding, use a static header that naturally flows before content:

```typescript
// layout.tsx change
<body>
  <div className="sticky top-0 z-40"> {/* sticky not fixed */}
    <KeystaticToolsHeader />
  </div>
  <KeystaticApp /> {/* No padding needed - header doesn't overlap */}
</body>
```

This way Keystatic's tooltips render **after** our header in DOM order, so they can overlay properly.

**Effort**: 0.3 SP

---

## Issue 5: View Live Dynamic Page Linking (P1)

### Current State
- Shows "View Live" with static link
- Extracts slug from URL path

### Solution
1. Extract page name from slug (capitalize, replace hyphens)
2. Show "View [PageName] Live" with contextual link
3. Handle edge cases (dashboard, collections list)

### Implementation
```typescript
// ProductionLink.tsx enhancements
function formatPageName(slug: string): string {
  if (slug === '/' || slug === '') return 'Home';
  // Convert "about-us" to "About Us"
  return slug
    .split('/').pop()
    ?.split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ') || 'Page';
}

// Show: "View About Us Live" instead of "View Live"
<a href={productionUrl}>
  View {formatPageName(slug)} Live
  <ExternalLink size={14} />
</a>
```

**Effort**: 0.5 SP

---

## Issue 6: Slug Field Live URL Preview (P2)

### Problem Analysis
This requires injecting content **inside** Keystatic's form UI, specifically under the slug field.
Keystatic doesn't have a documented API for field decorators.

### Solution Options

| Option | Approach | Effort | Reliability |
|--------|----------|--------|-------------|
| A | Custom field component in keystatic.config | 1.5 SP | 90% |
| B | DOM injection via MutationObserver | 2.0 SP | 60% |
| C | CSS ::after pseudo-element | 0.5 SP | 40% |

### Recommended: Option A - Custom Slug Field

```typescript
// keystatic.config.ts
import { fields } from '@keystatic/core';

// Custom slug field with URL preview
const slugWithPreview = fields.slug({
  name: { label: 'Slug' },
  // Keystatic doesn't support field descriptions per se
  // We'll need a custom component wrapper
});

// OR: Create a separate URL preview field that reads slug value
const urlPreview = fields.text({
  label: 'Live URL',
  defaultValue: 'https://prelaunch.bearlakecamp.com/',
  // Make read-only via component override
});
```

**Note**: This may require Keystatic component customization which is limited.

**Alternative**: Add URL preview to the page editing header (Issue 7) instead.

**Effort**: 1.5 SP (or 0 SP if combined with Issue 7)

---

## Issue 7: Move Tools to Page Editing Context (P1)

### Current State
- Header shows tools on ALL Keystatic routes
- User wants deployment status and view live in page editing context only

### Solution
Detect route context and show contextual tools:

1. **Dashboard/List routes** (`/keystatic`, `/keystatic/collections/*`):
   - Show: SparkryBranding, Bug Report
   - Hide: Deployment Status, View Live (not relevant)

2. **Page editing routes** (`/keystatic/pages/*`):
   - Show: ALL tools including Deployment Status, View Live
   - Add: Live URL preview (from Issue 6)

### Implementation
```typescript
// KeystaticToolsHeader.tsx - route-aware rendering
const pathname = usePathname();
const isPageEditingContext = pathname.includes('/keystatic/pages/');

return (
  <header>
    {/* Always visible */}
    <SparkryBranding />
    <BugReportModal />

    {/* Page editing context only */}
    {isPageEditingContext && (
      <>
        <DeploymentStatus />
        <ProductionLink />
        <LiveUrlPreview slug={extractSlug(pathname)} />
      </>
    )}
  </header>
);
```

### Additional: Live URL Display
For Issue 6, instead of injecting into slug field, show live URL in header:
```typescript
// New component: LiveUrlPreview.tsx
export function LiveUrlPreview({ slug }: { slug: string }) {
  const liveUrl = `https://prelaunch.bearlakecamp.com${slug}`;

  return (
    <div className="text-xs text-gray-500">
      <span>Live URL: </span>
      <a href={liveUrl} target="_blank" className="text-blue-600 hover:underline">
        {liveUrl}
      </a>
      <Tooltip content="Deploy changes to see updates on this URL" />
    </div>
  );
}
```

**Effort**: 2.0 SP (includes Issue 6 alternative)

---

## Implementation Order

### Phase 1: Critical Fixes (P0) - 0.8 SP
1. Issue 4: Z-index fix (0.3 SP)
2. Issue 1: DeploymentStatus fix (0.5 SP)

### Phase 2: Enhancements (P1) - 3.5 SP
3. Issue 5: Dynamic View Live (0.5 SP)
4. Issue 7: Context-aware tools + Live URL (2.0 SP)
5. Issue 2: Bug Report context (1.0 SP)

### Phase 3: Polish (P2) - 0.2 SP
6. Issue 3: SparkryBranding refinements (0.2 SP)

**Issue 6 (Slug field preview)**: Absorbed into Issue 7 via header-based Live URL display

---

## TDD Test Plan

### Issue 1 Tests (DeploymentStatus)
- `should show "Published" when API returns READY state`
- `should re-fetch if stale Deploying state (>10 min)`
- `should show appropriate timestamp text per state`

### Issue 2 Tests (BugReportModal)
- `should include full CMS URL in context`
- `should capture form field values when available`
- `should show user info when authenticated`

### Issue 4 Tests (Z-index)
- `header should use sticky positioning`
- `header z-index should not block Keystatic tooltips`

### Issue 5 Tests (ProductionLink)
- `should format page name from slug correctly`
- `should show "View Home Live" for root page`
- `should show "View About Us Live" for /about-us slug`

### Issue 7 Tests (Context-aware)
- `should show deployment tools only on page edit routes`
- `should hide deployment tools on dashboard route`
- `should show live URL preview on page edit routes`

---

## User Decisions (Answered)

1. **User Auth**: Use Keystatic GitHub auth - Extract user info from Keystatic's GitHub authentication
2. **URL Preview**: Both locations - Show in header AND attempt slug field injection
3. **Tools Location**: Move to content - Remove deployment status and View Live from header, integrate into Keystatic's page editing UI

---

## REVISED Implementation Plan

Based on user decisions, the architecture changes significantly:

### Header (Minimal - Always Visible)
- SparkryBranding (logo only)
- Bug Report button (with GitHub user context)

### Page Editing Context (Content Area)
- Deployment Status indicator
- View [PageName] Live button
- Live URL preview (under slug field AND in editing toolbar)

### Approach for Content Area Integration
Keystatic supports `ui.navigation` for custom navigation items, but NOT for custom content area components.

**Options:**
1. **Floating Toolbar** - Fixed position toolbar that appears when editing pages (similar to Notion's floating toolbar)
2. **DOM Injection** - Use MutationObserver to inject our components into Keystatic's UI
3. **Custom Page Wrapper** - Wrap Keystatic's page rendering with our own component

**Recommended: Option 1 - Floating Toolbar**
- Create a floating toolbar that appears at the bottom of the viewport when on `/keystatic/pages/*` routes
- Contains: DeploymentStatus, View Live button, Live URL
- Doesn't interfere with Keystatic's UI
- Easy to implement and maintain

### Slug Field URL Preview (DOM Injection)
- Use MutationObserver to watch for slug field rendering
- Inject a small preview URL under the input
- Add tooltip about deployment requirement

---

## REVISED Files to Modify

| File | Changes |
|------|---------|
| `components/keystatic/DeploymentStatus.tsx` | Fix timestamp logic, add re-fetch |
| `components/keystatic/BugReportModal.tsx` | Add GitHub user context, full URL capture |
| `components/keystatic/SparkryBranding.tsx` | Remove text/icon, resize |
| `components/keystatic/ProductionLink.tsx` | Dynamic page name display |
| `components/keystatic/KeystaticToolsHeader.tsx` | Simplify - only Bug Report + SparkryBranding |
| `components/keystatic/PageEditingToolbar.tsx` | **NEW**: Floating toolbar for page editing context |
| `components/keystatic/LiveUrlPreview.tsx` | **NEW**: Live URL display with tooltip |
| `components/keystatic/SlugFieldInjector.tsx` | **NEW**: MutationObserver-based slug field URL injection |
| `app/keystatic/layout.tsx` | Change positioning, add PageEditingToolbar + SlugFieldInjector |

---

## REVISED Effort Estimates

| # | Issue | Original | Revised |
|---|-------|----------|---------|
| 1 | DeploymentStatus fix | 0.5 SP | 0.5 SP |
| 2 | Bug Report context + GitHub auth | 1.0 SP | 1.5 SP |
| 3 | SparkryBranding refinements | 0.2 SP | 0.2 SP |
| 4 | Z-index fix (now via layout change) | 0.3 SP | 0.3 SP |
| 5 | Dynamic View Live | 0.5 SP | 0.5 SP |
| 6 | Slug field URL preview (DOM injection) | 1.5 SP | 2.0 SP |
| 7 | Floating toolbar for page editing | 2.0 SP | 2.5 SP |

**Total Estimated Effort**: 7.5 SP

---

## Implementation Phases

### Phase 1: Critical Fixes (1.0 SP)
1. Issue 4: Z-index fix via layout change (0.3 SP)
2. Issue 1: DeploymentStatus fix (0.5 SP)
3. Issue 3: SparkryBranding refinements (0.2 SP)

### Phase 2: Header Simplification + Page Toolbar (4.5 SP)
4. Simplify KeystaticToolsHeader (remove deployment/view live) (0.5 SP)
5. Create PageEditingToolbar with DeploymentStatus + ProductionLink (2.0 SP)
6. Issue 5: Dynamic View Live page name (0.5 SP)
7. Issue 2: Bug Report with GitHub auth (1.5 SP)

### Phase 3: Slug Field Enhancement (2.0 SP)
8. Issue 6: SlugFieldInjector for URL preview under slug field (2.0 SP)

---

**Ready for approval to proceed with TDD implementation.**
