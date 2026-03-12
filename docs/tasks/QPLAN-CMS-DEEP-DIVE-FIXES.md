# QPLAN: CMS Deep Dive Fixes - December 2024

## Executive Summary

After deep-dive analysis by parallel specialist agents, we identified **root causes** for 5 persistent CMS issues. These issues have resisted multiple fix attempts because they require understanding underlying framework architecture (Keystatic/Voussoir) rather than surface-level fixes.

| Issue | Root Cause | Complexity | SP |
|-------|------------|------------|-----|
| 1. Recent Sort Error | Wrong DOM selectors (Keystatic uses React Spectrum, not role="list") | High | 3-5 |
| 2. DonateButton Wrapping | CSS specificity conflict in globals.css | Low | 1 |
| 3. Dark Mode Incomplete | Two theme systems not synced (Tailwind vs Voussoir) | High | 6 |
| 4. SEO UX Issues | Redundant UI + no navigation handling | Medium | 3 |
| 5. AI Model Change | Simple config change | Low | 0.1 |

**Total: 13-17 SP** (depends on Recent Sort approach chosen)

---

## Issue 1: Recent Sort Error

### Problem
"Could not find the pages list. Try refreshing the page." error on production.

### Root Cause
The DOM selectors are fundamentally wrong:
```typescript
// CURRENT (BROKEN)
'main ul[role="list"]'  // Keystatic uses role="listbox" or role="grid"
'[data-keystatic-collection] ul'  // This attribute doesn't exist
```

Keystatic uses **React Spectrum** components which:
- Use `role="listbox"` or `role="grid"` (not `role="list"`)
- Use `data-key` attributes (not `data-slug`)
- Have dynamic class names that change between builds

Additionally, **timing issues**: The button appears before Keystatic's async React rendering completes.

### Solution Options

**Option A: Robust Selector with MutationObserver (3 SP)**
```typescript
const findPagesList = (): Promise<HTMLElement | null> => {
  return new Promise((resolve) => {
    const selectors = [
      '[role="listbox"]',           // React Spectrum ListView
      '[role="grid"]',              // React Spectrum GridList
    ];

    const attemptFind = (retriesLeft: number) => {
      for (const selector of selectors) {
        const candidates = document.querySelectorAll(selector);
        for (const candidate of candidates) {
          if (candidate.querySelector('a[href*="/collection/pages/"]')) {
            resolve(candidate as HTMLElement);
            return;
          }
        }
      }
      if (retriesLeft > 0) setTimeout(() => attemptFind(retriesLeft - 1), 500);
      else resolve(null);
    };
    attemptFind(10);
  });
};
```

**Option B: Overlay Component (5 SP)** - More robust but more work
- Render our own sorted list component
- Hide Keystatic's list with CSS
- Links navigate to same Keystatic edit URLs

### Playwright Test Required
```typescript
test('REQ-CMS-017-003: No error when clicking Recent', async ({ page }) => {
  let alertText: string | null = null;
  page.on('dialog', async dialog => {
    alertText = dialog.message();
    await dialog.dismiss();
  });

  await page.locator('button:has-text("Recent")').click();
  await page.waitForTimeout(5000);

  expect(alertText).not.toContain('Could not find the pages list');
});
```

### Critical Files
- `components/keystatic/KeystaticToolsHeader.tsx` (lines 59-157)
- `app/api/keystatic/git-dates/route.ts`

---

## Issue 2: DonateButton Wrapping

### Problem
Heart icon appears on separate line from "Donate Now" text.

### Root Cause
**CSS Specificity Conflict** in `globals.css` (lines 188-191):
```css
.prose a[class*="bg-secondary"],
.prose a[class*="bg-accent"] {
  @apply block mx-auto text-center w-fit;
}
```

This selector has **higher specificity** (0-2-1) than the component's `inline-flex` class (0-1-0).

When `display: block` is applied:
- Flex container behavior removed
- Children stack vertically
- `flex-nowrap` becomes no-op

### Solution (1 SP)
Add exclusion for inline-flex elements:
```css
/* REQ-CENTER-002: Center CTA buttons in content */
/* Exclude elements with inline-flex which manage their own layout */
.prose a[class*="bg-secondary"]:not([class*="inline-flex"]),
.prose a[class*="bg-accent"]:not([class*="inline-flex"]) {
  @apply block mx-auto text-center w-fit;
}
```

### Playwright Test Required
```typescript
test('icon and label appear on same horizontal line', async ({ page }) => {
  await page.goto('/testing-components');
  const donateButton = page.locator('a:has-text("Test Donate Button")');
  const buttonBox = await donateButton.boundingBox();

  // Button height should be reasonable (not stretched from vertical stacking)
  expect(buttonBox!.height).toBeLessThan(100);
});
```

### Critical Files
- `app/globals.css` (lines 188-191)

---

## Issue 3: Dark Mode Incomplete

### Problem
Dark mode only updates left nav and text boxes, NOT top nav or body.

### Root Cause
**Two incompatible theme systems**:

| System | Class | Storage Key |
|--------|-------|-------------|
| next-themes (Tailwind) | `.dark` | `localStorage.theme` |
| Voussoir (Keystatic) | `.kui-scheme--dark` | `localStorage.keystatic-color-scheme` |

Current ThemeProvider observes `.dark` class changes, but Keystatic components only respond to `.kui-scheme--dark` and `--kui-color-*` CSS variables.

### Solution (6 SP)

**Step 1: Sync both theme systems in ThemeProvider.tsx**
```typescript
useEffect(() => {
  // Observe Voussoir's kui-scheme--dark class
  const observer = new MutationObserver((mutations) => {
    if (document.documentElement.classList.contains('kui-scheme--dark')) {
      setTheme('dark');
    }
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  return () => observer.disconnect();
}, [setTheme]);

// Sync back to Keystatic
useEffect(() => {
  localStorage.setItem('keystatic-color-scheme', resolvedTheme);
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'keystatic-color-scheme', newValue: resolvedTheme,
  }));
}, [resolvedTheme]);
```

**Step 2: Override Voussoir CSS variables in keystatic-dark.css**
```css
.dark {
  --kui-color-background-canvas: #1f1f1f;
  --kui-color-background-surface: #252525;
  --kui-color-foreground-neutral: #e3e3e3;
  /* ... full color scale overrides */
}
```

**Alternative: Use Keystatic's Built-in Toggle**
Remove custom ThemeToggle, use Keystatic's sidebar toggle. Simpler but less integrated.

### Playwright Test Required
```typescript
test('dark mode updates ALL UI areas', async ({ page }) => {
  await page.evaluate(() => {
    localStorage.setItem('theme', 'dark');
    localStorage.setItem('keystatic-color-scheme', 'dark');
  });
  await page.reload();

  const areas = ['header', 'nav', 'main', 'input'];
  for (const area of areas) {
    const bgColor = await page.locator(area).first().evaluate(
      el => window.getComputedStyle(el).backgroundColor
    );
    // Verify dark background (RGB values < 100)
  }
});
```

### Critical Files
- `components/keystatic/ThemeProvider.tsx`
- `app/keystatic/keystatic-dark.css`

---

## Issue 4: SEO Generation UX

### Problem
a. Redundant UI: Button spinner AND panel spinner shown simultaneously
b. No handling if user navigates away during generation

### Root Cause
- PageEditingToolbar shows Loader2 when panel open
- SEOGenerationPanel also shows its own Loader2
- AbortController only handles timeout, not navigation

### Solution (3 SP - Option B: Fixed Panel)

**Fix 4a: Remove button spinner when panel is open**
```typescript
// PageEditingToolbar.tsx
{showSEOPanel ? (
  <span className="text-purple-600">Active</span>  // Not a spinner
) : (
  <Sparkles size={14} />
)}
```

**Fix 4b: Add navigation handling**
```typescript
function useNavigationGuard(isGenerating: boolean, onAbort: () => void) {
  const pathname = usePathname();
  const previousPathnameRef = useRef(pathname);

  useEffect(() => {
    if (previousPathnameRef.current !== pathname && isGenerating) {
      onAbort();
    }
    previousPathnameRef.current = pathname;
  }, [pathname, isGenerating, onAbort]);

  useEffect(() => {
    if (!isGenerating) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'SEO generation in progress. Leave?';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isGenerating]);
}
```

### Playwright Test Required
```typescript
test('shows loading state ONLY on button OR panel, not both', async ({ page }) => {
  await page.locator('button:has-text("Generate SEO")').click();

  const buttonSpinner = page.locator('button:has-text("Generate SEO") .animate-spin');
  const panelSpinner = page.locator('.seo-generation-panel .animate-spin');

  const both = (await buttonSpinner.count() > 0) && (await panelSpinner.count() > 0);
  expect(both).toBeFalsy();
});
```

### Critical Files
- `components/keystatic/SEOGenerationPanel.tsx`
- `components/keystatic/PageEditingToolbar.tsx`

---

## Issue 5: AI Model Change

### Status: COMPLETED

Changed from `model: 'cost'` to `model: 'fast'` in:
- `app/api/generate-seo/route.ts` (lines 161, 175)
- `app/api/generate-seo/route.spec.ts` (tests updated)

---

## Implementation Priority

### Quick Wins (Do First)
| Task | SP | Why |
|------|-----|-----|
| DonateButton CSS fix | 1 | Single line change, high visibility |
| AI model change | 0.1 | Already done |

### Medium Effort
| Task | SP | Why |
|------|-----|-----|
| SEO UX fixes | 3 | Clear solution, moderate scope |
| Recent Sort (Option A) | 3 | Critical for CMS usability |

### Higher Effort
| Task | SP | Why |
|------|-----|-----|
| Dark Mode sync | 6 | Complex, two systems to coordinate |
| Recent Sort (Option B) | 5 | If Option A proves fragile |

---

## Comprehensive Production Playwright Tests

All fixes require production verification. Create:
- `tests/e2e/production/donate-button.spec.ts`
- `tests/e2e/production/recent-sort.spec.ts`
- `tests/e2e/production/dark-mode.spec.ts`
- `tests/e2e/production/seo-generation.spec.ts`

Each test must:
1. Run against `prelaunch.bearlakecamp.com`
2. Handle GitHub authentication
3. Capture screenshot proof
4. Assert specific success criteria
5. Report detailed errors for debugging

---

## Why These Kept Breaking

| Issue | Why Previous Fixes Failed |
|-------|--------------------------|
| Recent Sort | Fixed symptoms (selectors) not root cause (wrong selector type entirely) |
| DonateButton | Added flex classes but didn't check what was overriding them |
| Dark Mode | Added CSS for `.dark` but Keystatic uses `.kui-scheme--dark` |
| SEO UX | Never identified the dual-spinner as a problem |

**Common Pattern**: Surface-level fixes without understanding framework internals.

---

## Approval Checklist

- [ ] DonateButton CSS fix approved
- [ ] Recent Sort approach selected (Option A or B)
- [ ] Dark Mode sync approach approved
- [ ] SEO UX Option B approved
- [ ] Playwright test strategy approved
- [ ] Ready to implement
