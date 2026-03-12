# QPLAN: Keystatic UI Gaps - SEO Accordion & AI Generation

> **Created**: 2024-12-14
> **Total Story Points**: 7 SP
> **Priority**: P0 (blocks editor UX)

---

## Executive Summary

Two Keystatic CMS requirements are **NOT IMPLEMENTED** despite being marked complete:

| REQ | Description | Status | Issue |
|-----|-------------|--------|-------|
| REQ-CMS-003 | SEO Metadata Accordion | ❌ NOT WORKING | Keystatic lacks native collapse support |
| REQ-CMS-012 | AI SEO Generation | ❌ NOT IN EDITOR | Button only on `/keystatic-tools` page |

**Root Cause**: Keystatic's `fields.object()` does NOT support `collapsed` or `collapsible` options (unlike Sanity.io or Payload CMS).

---

## Technical Constraints

### Keystatic Limitations (Verified via [Keystatic Docs](https://keystatic.com/docs/fields/object))

```typescript
// What fields.object() SUPPORTS:
fields.object({...fields}, {
  label: string,        // ✅ Supported
  description: string,  // ✅ Supported
  layout: number[],     // ✅ Supported (column spans)
})

// What fields.object() does NOT support:
{
  collapsed: boolean,    // ❌ NOT AVAILABLE
  collapsible: boolean,  // ❌ NOT AVAILABLE
}
```

### Available Extension Points

1. **Layout wrapper** (`app/keystatic/layout.tsx`) - Can add global UI
2. **Custom CSS injection** - Can target Keystatic's rendered DOM
3. **Toolbar components** - Already implemented (PageEditingToolbar)
4. **Header components** - Already implemented (KeystaticToolsHeader)

---

## Implementation Options

### Option A: CSS-Based Collapse (Recommended)
**SP: 3 | Risk: Low**

Inject CSS that:
1. Adds collapse/expand behavior to SEO fieldset via `details/summary` polyfill
2. Uses MutationObserver to detect SEO section and wrap it
3. Adds character counters via CSS `::after` pseudo-elements

**Pros**: Works within Keystatic constraints, no schema changes
**Cons**: Relies on DOM structure stability

### Option B: Side Panel SEO Editor
**SP: 5 | Risk: Medium**

Create a slide-out panel accessible from PageEditingToolbar:
1. Opens SEO editor in side panel
2. Reads/writes to page content via Keystatic's reader API
3. Integrates GenerateSEOButton directly

**Pros**: Full control over UX, cleaner integration
**Cons**: More complex, requires state sync

### Option C: Keystatic Component Block (Not Viable)
Component blocks only work inside `document` fields, not as schema-level wrappers.

---

## Recommended Plan: Option A (CSS + DOM Injection)

### Phase 1: SEO Accordion Collapse (2 SP)

#### Step 1.1: Create SEOFieldsetEnhancer Component
**File**: `components/keystatic/SEOFieldsetEnhancer.tsx`

```typescript
// REQ-CMS-003: SEO Metadata Accordion
// Injects collapse behavior into Keystatic's SEO fieldset

'use client';

import { useEffect } from 'react';

export function SEOFieldsetEnhancer() {
  useEffect(() => {
    // Find SEO fieldset by label text
    const observer = new MutationObserver(() => {
      const seoFieldset = document.querySelector(
        '[data-field="seo"], fieldset:has(legend:contains("SEO"))'
      );

      if (seoFieldset && !seoFieldset.hasAttribute('data-enhanced')) {
        enhanceSEOFieldset(seoFieldset);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return null;
}

function enhanceSEOFieldset(fieldset: Element) {
  // Mark as enhanced
  fieldset.setAttribute('data-enhanced', 'true');

  // Wrap content in details/summary for native collapse
  const legend = fieldset.querySelector('legend');
  const content = fieldset.querySelector(':scope > div');

  if (legend && content) {
    // Create collapsible wrapper
    const details = document.createElement('details');
    const summary = document.createElement('summary');
    summary.className = 'cursor-pointer font-medium text-gray-700 py-2';
    summary.textContent = legend.textContent || 'SEO & Social Media';

    // Add collapse indicator
    summary.innerHTML = `
      <span class="flex items-center gap-2">
        <svg class="w-4 h-4 transition-transform" viewBox="0 0 20 20">
          <path d="M6 6L14 10L6 14V6Z" fill="currentColor"/>
        </svg>
        ${legend.textContent || 'SEO & Social Media'}
        <span class="text-xs text-gray-400">(click to expand)</span>
      </span>
    `;

    details.appendChild(summary);
    details.appendChild(content.cloneNode(true));

    legend.style.display = 'none';
    content.replaceWith(details);
  }
}
```

#### Step 1.2: Add Character Counters CSS
**File**: `app/keystatic/seo-enhancements.css`

```css
/* REQ-CMS-003: Character counters for SEO fields */

/* Meta Title counter (target: 50-60 chars) */
[data-field="seo"] input[name*="metaTitle"] {
  position: relative;
}

[data-field="seo"] input[name*="metaTitle"]::after {
  content: attr(data-length) " / 60";
  position: absolute;
  right: 8px;
  font-size: 12px;
  color: var(--counter-color, #666);
}

/* Meta Description counter (target: 150-155 chars) */
[data-field="seo"] textarea[name*="metaDescription"]::after {
  content: attr(data-length) " / 155";
}
```

#### Step 1.3: Integrate into Layout
**File**: `app/keystatic/layout.tsx`

```typescript
import { SEOFieldsetEnhancer } from "@/components/keystatic/SEOFieldsetEnhancer";
import "./seo-enhancements.css";

export default function Layout() {
  return (
    <div className="flex flex-col h-screen">
      <SEOFieldsetEnhancer />
      {/* ... existing layout */}
    </div>
  );
}
```

### Phase 2: AI SEO Generation in Editor (2 SP)

#### Step 2.1: Add GenerateSEO to PageEditingToolbar
**File**: `components/keystatic/PageEditingToolbar.tsx`

```typescript
// Add to existing PageEditingToolbar component

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import GenerateSEOButton from './GenerateSEOButton';

export function PageEditingToolbar() {
  const [showSEOPanel, setShowSEOPanel] = useState(false);
  const pathname = usePathname();
  const pageInfo = extractPageInfo(pathname);

  if (!pageInfo) return null;

  const { slug } = pageInfo;

  // Get page content for SEO generation
  const pageContent = usePageContent(slug); // New hook to read from Keystatic

  return (
    <div role="toolbar" aria-label="Page Editing Tools" className="...">
      {/* Existing deployment status and view live link */}
      <DeploymentStatus />
      <div className="w-px h-6 bg-gray-200" aria-hidden="true" />

      {/* NEW: Generate SEO button */}
      <button
        onClick={() => setShowSEOPanel(!showSEOPanel)}
        className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-800"
        aria-label="Generate SEO metadata"
      >
        <Sparkles size={14} />
        Generate SEO
      </button>

      {/* SEO Generation Panel */}
      {showSEOPanel && (
        <SEOGenerationPanel
          pageContent={pageContent}
          onClose={() => setShowSEOPanel(false)}
          onGenerated={(seoData) => {
            // Inject into form fields
            injectSEOIntoForm(seoData);
            setShowSEOPanel(false);
          }}
        />
      )}

      <div className="w-px h-6 bg-gray-200" aria-hidden="true" />
      <a href={productionUrl} target="_blank" rel="noopener noreferrer" className="...">
        View {pathDisplay} Live
        <ExternalLink size={14} aria-hidden="true" />
      </a>
    </div>
  );
}
```

#### Step 2.2: Create SEOGenerationPanel Component
**File**: `components/keystatic/SEOGenerationPanel.tsx`

```typescript
'use client';

import { useState } from 'react';
import { X, Check, Copy } from 'lucide-react';
import GenerateSEOButton from './GenerateSEOButton';

interface SEOData {
  metaTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
}

interface Props {
  pageContent: { title: string; body: string };
  onClose: () => void;
  onGenerated: (data: SEOData) => void;
}

export function SEOGenerationPanel({ pageContent, onClose, onGenerated }: Props) {
  const [generatedSEO, setGeneratedSEO] = useState<SEOData | null>(null);

  return (
    <div className="fixed bottom-20 right-4 w-96 bg-white rounded-lg shadow-xl border p-4 z-50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Generate SEO Metadata</h3>
        <button onClick={onClose} aria-label="Close">
          <X size={16} />
        </button>
      </div>

      <GenerateSEOButton
        pageContent={pageContent}
        onSEOGenerated={(data) => setGeneratedSEO(data)}
      />

      {generatedSEO && (
        <div className="mt-4 space-y-3">
          <div>
            <label className="text-xs text-gray-500">Meta Title ({generatedSEO.metaTitle.length}/60)</label>
            <p className="text-sm border rounded p-2">{generatedSEO.metaTitle}</p>
          </div>
          <div>
            <label className="text-xs text-gray-500">Meta Description ({generatedSEO.metaDescription.length}/155)</label>
            <p className="text-sm border rounded p-2">{generatedSEO.metaDescription}</p>
          </div>

          <button
            onClick={() => onGenerated(generatedSEO)}
            className="w-full flex items-center justify-center gap-2 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            <Check size={16} />
            Apply to Form
          </button>
        </div>
      )}
    </div>
  );
}
```

#### Step 2.3: Create usePageContent Hook
**File**: `lib/hooks/usePageContent.ts`

```typescript
import { useEffect, useState } from 'react';

export function usePageContent(slug: string) {
  const [content, setContent] = useState({ title: '', body: '' });

  useEffect(() => {
    // Read from form inputs on the page
    const titleInput = document.querySelector('input[name="title"]') as HTMLInputElement;
    const bodyEditor = document.querySelector('[data-field="content"]');

    if (titleInput) {
      setContent(prev => ({ ...prev, title: titleInput.value }));
    }

    if (bodyEditor) {
      setContent(prev => ({ ...prev, body: bodyEditor.textContent || '' }));
    }
  }, [slug]);

  return content;
}
```

#### Step 2.4: Create injectSEOIntoForm Utility
**File**: `lib/keystatic/injectSEOIntoForm.ts`

```typescript
interface SEOData {
  metaTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
}

export function injectSEOIntoForm(data: SEOData) {
  // Find SEO form fields and inject values
  const fields = {
    metaTitle: document.querySelector('input[name*="metaTitle"]') as HTMLInputElement,
    metaDescription: document.querySelector('textarea[name*="metaDescription"]') as HTMLTextAreaElement,
    ogTitle: document.querySelector('input[name*="ogTitle"]') as HTMLInputElement,
    ogDescription: document.querySelector('textarea[name*="ogDescription"]') as HTMLTextAreaElement,
  };

  Object.entries(fields).forEach(([key, input]) => {
    if (input && data[key as keyof SEOData]) {
      input.value = data[key as keyof SEOData];
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
}
```

### Phase 3: E2E Tests (2 SP)

#### Step 3.1: SEO Accordion E2E Tests
**File**: `tests/e2e/keystatic/seo-accordion.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.use({ storageState: 'tests/e2e/.auth/user.json' });

test.describe('REQ-CMS-003 — SEO Metadata Accordion', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/keystatic/branch/main/collection/pages/item/about');
    await page.waitForTimeout(3000);
  });

  test('SEO section is collapsible', async ({ page }) => {
    // Look for collapsed SEO section
    const seoSection = page.locator('details:has(summary:has-text("SEO"))');

    // Should be collapsed by default
    await expect(seoSection).not.toHaveAttribute('open');

    // Click to expand
    await seoSection.locator('summary').click();
    await expect(seoSection).toHaveAttribute('open');

    // SEO fields should now be visible
    await expect(page.locator('input[name*="metaTitle"]')).toBeVisible();
    await expect(page.locator('textarea[name*="metaDescription"]')).toBeVisible();
  });

  test('SEO fields show character counters', async ({ page }) => {
    // Expand SEO section
    await page.locator('details:has(summary:has-text("SEO")) summary').click();

    // Type in meta title
    const titleInput = page.locator('input[name*="metaTitle"]');
    await titleInput.fill('Test Title');

    // Should show character count
    await expect(page.locator('text=/\\d+\\s*\\/\\s*60/')).toBeVisible();
  });
});
```

#### Step 3.2: AI SEO Generation E2E Tests
**File**: `tests/e2e/keystatic/seo-generation.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.use({ storageState: 'tests/e2e/.auth/user.json' });

test.describe('REQ-CMS-012 — AI SEO Generation in Editor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/keystatic/branch/main/collection/pages/item/about');
    await page.waitForTimeout(3000);
  });

  test('Generate SEO button appears in toolbar', async ({ page }) => {
    const toolbar = page.locator('[role="toolbar"][aria-label="Page Editing Tools"]');
    await expect(toolbar).toBeVisible();

    const generateButton = toolbar.locator('button:has-text("Generate SEO")');
    await expect(generateButton).toBeVisible();
  });

  test('clicking Generate SEO opens panel', async ({ page }) => {
    await page.locator('button:has-text("Generate SEO")').click();

    // Panel should appear
    await expect(page.locator('h3:has-text("Generate SEO Metadata")')).toBeVisible();

    // Should have the generate button
    await expect(page.locator('button:has-text("Generate SEO"):visible')).toHaveCount(2); // toolbar + panel
  });

  test('generated SEO can be applied to form', async ({ page }) => {
    // This test requires API key - skip in CI without it
    test.skip(!process.env.UNIVERSAL_LLM_KEY, 'Requires UNIVERSAL_LLM_KEY');

    await page.locator('button:has-text("Generate SEO")').click();

    // Wait for generation (mocked or real)
    await page.waitForSelector('button:has-text("Apply to Form")', { timeout: 30000 });

    // Apply
    await page.click('button:has-text("Apply to Form")');

    // Expand SEO section and verify fields populated
    await page.locator('details:has(summary:has-text("SEO")) summary').click();

    const titleInput = page.locator('input[name*="metaTitle"]');
    await expect(titleInput).not.toHaveValue('');
  });
});
```

### Phase 4: Documentation Update (1 SP)

Update `docs/operations/KEYSTATIC-CMS-USER-GUIDE.md` with:
- How to use collapsible SEO section
- How to use Generate SEO from toolbar
- Screenshots

---

## Implementation Order

| Order | Task | SP | File(s) |
|-------|------|-----|---------|
| 1 | SEOFieldsetEnhancer component | 1.0 | `components/keystatic/SEOFieldsetEnhancer.tsx` |
| 2 | CSS character counters | 0.5 | `app/keystatic/seo-enhancements.css` |
| 3 | Update layout to include enhancer | 0.5 | `app/keystatic/layout.tsx` |
| 4 | SEOGenerationPanel component | 1.0 | `components/keystatic/SEOGenerationPanel.tsx` |
| 5 | usePageContent hook | 0.5 | `lib/hooks/usePageContent.ts` |
| 6 | injectSEOIntoForm utility | 0.5 | `lib/keystatic/injectSEOIntoForm.ts` |
| 7 | Update PageEditingToolbar | 1.0 | `components/keystatic/PageEditingToolbar.tsx` |
| 8 | E2E tests for accordion | 1.0 | `tests/e2e/keystatic/seo-accordion.spec.ts` |
| 9 | E2E tests for generation | 1.0 | `tests/e2e/keystatic/seo-generation.spec.ts` |
| **TOTAL** | | **7.0 SP** | |

---

## Test Requirements (TDD)

### Unit Tests (Before Implementation)

```
tests/unit/
├── SEOFieldsetEnhancer.spec.tsx   # REQ-CMS-003
├── SEOGenerationPanel.spec.tsx    # REQ-CMS-012
├── usePageContent.spec.ts         # REQ-CMS-012
└── injectSEOIntoForm.spec.ts      # REQ-CMS-012
```

### E2E Tests (Before Implementation)

```
tests/e2e/keystatic/
├── seo-accordion.spec.ts          # REQ-CMS-003
└── seo-generation.spec.ts         # REQ-CMS-012
```

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Keystatic DOM structure changes | Low | High | Use semantic selectors, add version check |
| MutationObserver performance | Low | Medium | Disconnect when not on page editor |
| SEO injection doesn't trigger save | Medium | High | Test with actual Keystatic save flow |

---

## Success Criteria

- [ ] SEO section is collapsed by default in page editor
- [ ] SEO section can be expanded/collapsed
- [ ] Character counters show for meta title and description
- [ ] Generate SEO button visible in toolbar when editing page
- [ ] Generated SEO populates form fields
- [ ] All E2E tests pass
- [ ] QVERIFY smoke tests pass on production

---

## Sources

- [Keystatic Object Field Docs](https://keystatic.com/docs/fields/object)
- [Keystatic Custom Components Discussion](https://github.com/Thinkmill/keystatic/discussions/595)
- [Payload CMS Collapsible Field](https://payloadcms.com/docs/fields/collapsible) (comparison)
