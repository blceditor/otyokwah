# Keystatic ProseMirror Structure - Spike Findings

**Date:** 2026-01-25
**REQ-ID:** REQ-LP-V5-002
**Spike Status:** COMPLETE - DECISION GATE EXECUTED

---

## Spike Questions & Answers

### Q1: Does ProseMirror store Markdoc source or rendered HTML?

**Answer: RENDERED HTML (custom nodes)**

Evidence from codebase analysis:
- `usePreviewContentExtractor.ts` line 323: `const rawContent = bodyElement.innerHTML`
- ProseMirror renders Markdoc tags as custom block nodes, not literal `{%` text
- The `htmlToMarkdown()` function only handles standard HTML elements (h1-h6, p, ul, ol, a, etc.)
- Custom Markdoc tags get stripped or converted to plain text

### Q2: Can we access ProseMirror EditorView from DOM?

**Answer: POSSIBLE but FRAGILE**

ProseMirror typically attaches the EditorView instance to the DOM element:
```javascript
const proseMirror = document.querySelector('.ProseMirror');
const view = proseMirror.__view__; // Non-standard, internal API
```

However:
- This is an internal API that could change
- Keystatic may use different internal structures
- No TypeScript types available for Keystatic's ProseMirror schema

### Q3: Are Markdoc tags represented as inspectable nodes?

**Answer: YES, but complex**

Keystatic uses ProseMirror with a custom schema for Markdoc:
- Markdoc tags become `node.type.name === 'component_block'` or similar
- Tag attributes stored in `node.attrs`
- Children stored as nested ProseMirror nodes

Challenges:
- Need to understand Keystatic's exact node types
- Need to reverse-engineer the document → Markdoc serialization

---

## Decision Gate Outcome

### RECOMMENDATION: PIVOT TO FILE-BASED PRIMARY

**Rationale:**
1. File-based extraction (V5-006) provides RELIABLE Markdoc source
2. ProseMirror extraction is fragile and depends on Keystatic internals
3. User experience impact: "Showing last saved version" warning is acceptable
4. Development effort: File-based is 1.5 SP vs ProseMirror 8.5 SP

### Implementation Path

```
PRIMARY: V5-006 File-Based Extraction
├── Read .mdoc files directly via API
├── Parse frontmatter with gray-matter
├── Return body content with full Markdoc syntax
└── Show "Showing last saved version" warning

FALLBACK: Current htmlToMarkdown (v4)
├── Used only if file-based API fails
├── Handles basic Markdown content
└── Markdoc tags show as placeholders
```

### SP Savings

| Original Plan | Revised Plan | Savings |
|--------------|--------------|---------|
| V5-001: 5.0 SP | DEFERRED | -5.0 SP |
| V5-003: 4.75 SP | DEFERRED | -4.75 SP |
| V5-006: 1.5 SP | PRIMARY +1.0 SP | +1.0 SP |
| Total: 26.0 SP | Revised: ~17.25 SP | -8.75 SP |

---

## Technical Implementation

### File-Based Extraction API (V5-006 as PRIMARY)

```typescript
// pages/api/preview/markdoc-source.ts
import { isValidSlug, sanitizeSlug } from '@/lib/security/validate-slug';
import matter from 'gray-matter';
import fs from 'fs/promises';
import path from 'path';

export default async function handler(req, res) {
  const { collection, slug } = req.query;
  
  // Security validation
  if (!ALLOWED_COLLECTIONS.includes(collection)) {
    return res.status(400).json({ error: 'Invalid collection' });
  }
  if (!isValidSlug(slug)) {
    return res.status(400).json({ error: 'Invalid slug' });
  }
  
  // Read .mdoc file
  const filePath = path.join(process.cwd(), 'content', collection, `${slug}.mdoc`);
  const content = await fs.readFile(filePath, 'utf-8');
  const { data, content: body } = matter(content);
  
  return res.json({ frontmatter: data, body });
}
```

### Client Integration

```typescript
// In usePreviewContentExtractor.ts
async function extractMarkdocContent() {
  // Try file-based extraction first
  try {
    const res = await fetch(`/api/preview/markdoc-source?collection=${collection}&slug=${slug}`);
    if (res.ok) {
      const { body } = await res.json();
      return { content: body, method: 'file-based', showSaveWarning: true };
    }
  } catch (e) {
    console.warn('[Preview] File-based extraction failed:', e);
  }
  
  // Fall back to DOM extraction (v4)
  const html = document.querySelector('.ProseMirror')?.innerHTML || '';
  return { content: htmlToMarkdown(html), method: 'dom-html', showSaveWarning: false };
}
```

---

## Future Enhancement: ProseMirror State Extraction

If we want to support unsaved content preview in the future:

1. **Option A:** Hook into Keystatic's form state
   - Find `window.__KEYSTATIC__?.currentEntry?.fields?.body`
   - Extract serialized Markdoc from form value

2. **Option B:** Build custom ProseMirror serializer
   - Understand Keystatic's node schema
   - Build `serializeProseMirrorToMarkdoc()` function
   - Requires ~5 SP additional work

3. **Option C:** Request Keystatic API
   - Ask Keystatic team for official content extraction API
   - May be added in future Keystatic versions

---

## Validation Criteria Met

- [x] Spike validates approach feasibility: FILE-BASED is feasible and reliable
- [x] Decision gate executed: PIVOT to file-based primary
- [x] Document structure analyzed: ProseMirror uses custom nodes
- [x] Implementation path defined: V5-006 as primary
- [x] Time-box respected: Analysis completed within 4 hours

---

*Spike Complete - REQ-LP-V5-002*
*Decision: File-Based Primary, ProseMirror Deferred*
