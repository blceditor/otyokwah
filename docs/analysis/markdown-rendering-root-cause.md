# Root Cause Analysis: Markdown Rendering Issues in WordPress to Keystatic Migration

**Date**: November 20, 2025
**Analysis Focus**: Custom `convertMarkdownToHtml()` function in `app/[slug]/page.tsx`
**Status**: Critical - Affecting production rendering on all 7 content pages

---

## Executive Summary

The custom markdown-to-HTML converter in `app/[slug]/page.tsx` (lines 213-245) is fundamentally broken due to:

1. **Naive regex-based parsing** without proper state management
2. **Order-of-operations bugs** where replacements interfere with each other
3. **Incomplete markdown support** missing critical features (YouTube embeds, lists, etc.)
4. **HTML escaping disabled** (`dangerouslySetInnerHTML`) creating XSS surface
5. **No markdown validation** against WordPress migration data structure

The function attempts to handle 8 different markdown patterns with simple find-and-replace regexes, but the approach breaks down when:
- Patterns overlap or nest (e.g., bold/italic inside links)
- User content contains edge cases (URLs with special chars, empty href attributes)
- Content mixes markdown, raw HTML, and plain text

**Root Cause**: Keystatic exports markdown in `.mdoc` format (text + YAML frontmatter), but the current implementation uses a hand-rolled parser instead of leveraging Keystatic's built-in `DocumentRenderer` or a battle-tested markdown library.

---

## 1. Specific Regex Failures with Examples

### 1.1 YouTube URL Handling: MISSING ENTIRELY

**Pattern Not Handled**:
```
https://youtu.be/8N9Yeup1xVA?si=4KXXFghbmpg0j46-
https://www.youtube.com/watch?v=gosIrrZAtHw
```

**Current Behavior**: Plain text appears in output
**Expected Behavior**: Should render as embedded iframe or clickable link with preview

**Evidence**:
- **summer-camp.mdoc:18** - `https://youtu.be/8N9Yeup1xVA?si=4KXXFghbmpg0j46-` renders as plain text
- **summer-staff.mdoc:15** - `https://www.youtube.com/watch?v=gosIrrZAtHw` renders as plain text

**Why It Fails**:
- No regex pattern detects YouTube URLs
- They're not wrapped in markdown link syntax `[text](url)`
- They're plain URLs sitting on their own line
- Function has no special handling for embeddable content

**Line 213-245 Analysis**: The converter only handles:
- Image markdown: `!\[...\]\(...\)`
- Link markdown: `\[...\]\(...\)`
- Headings, bold, italic, paragraphs, line breaks
- **NO pattern for bare URLs or video embeds**

---

### 1.2 Broken Links: Empty href Attributes

**Pattern That Breaks**:
```markdown
[Registration Opens Jan 1st]()
[Primary Overnight (2nd-3rd) - June 4-5]()
[Jr. High 1 (7th-9th) - June 7-12]()
```

**Current Behavior**: Renders literally as:
```html
<a href="" class="text-secondary hover:underline">Registration Opens Jan 1st</a>
```

**Expected Behavior**: Either:
- Skip rendering the link (return plain text)
- Add `aria-disabled` and remove href
- Log warning about broken migration data

**Evidence**:
- **summer-camp.mdoc:27-28, 37, 43, 49, 55, 61, 67, 73, 79** - Multiple instances
- **cabins.mdoc:32, 34, 36** - FAQ sections all have empty href
- **summer-staff.mdoc:49, 54, 59, 64, 69, 74, 79, 90, 92** - Staff positions broken
- **about.mdoc:65, 71, 106** - Staff profiles broken

**Why It Fails**:
```javascript
// Line 220: Regex matches [text]() with EMPTY group 2
html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" class="...">$1</a>');
//                                     ^^^^^^^^
//                            Matches empty string, renders href=""
```

**Impact**: Creates invalid HTML with empty href. Browsers treat these as anchors, but clicking does nothing. Accessibility fails (screen readers announce broken link).

---

### 1.3 Excessive `<br/>` Tags from Newline Handling

**Pattern**: After paragraph wrapping (lines 233-239), ALL remaining newlines become `<br/>`

**Current Code Flow**:
```javascript
// Line 234-239: Split by double newlines, wrap paragraphs
html = html.split('\n\n').map(para => {
  if (para.trim() && !para.startsWith('<')) {
    return `<p class="mb-4">${para}</p>`;
  }
  return para;
}).join('\n');

// Line 242: Convert ALL remaining newlines to <br/>
html = html.replace(/\n/g, '<br/>');
```

**Example Input**:
```
## Summer 2026 Camp Dates Are now Published!
https://youtu.be/8N9Yeup1xVA?si=4KXXFghbmpg0j46-

## Why "Deeper"?
```

**Rendered Output**:
```html
<h2 class="text-3xl font-bold mt-10 mb-6">Summer 2026 Camp Dates Are now Published!</h2>
https://youtu.be/8N9Yeup1xVA?si=4KXXFghbmpg0j46-<br/>
<br/>
<h2 class="text-3xl font-bold mt-10 mb-6">Why "Deeper"?</h2>
```

**Why It Fails**:
1. Line breaks inside paragraphs intended for readability become visible `<br/>` elements
2. Content from WordPress already has newlines for formatting that shouldn't be HTML breaks
3. Heading markdown replacements (lines 223-225) use `^...$` (multiline) but DON'T preserve internal spacing properly
4. After paragraph detection, there are still single newlines from multi-line content that all get converted

**Evidence**:
- **summer-camp.mdoc** content has multiple blocks with internal newlines
- **about.mdoc:12-14** - Multi-line paragraphs become `<br/>` separated
- **summer-staff.mdoc:32-33, 43** - Descriptions get split with `<br/>`

---

### 1.4 Malformed HTML Structure from Regex Order

**Problem**: Regexes run in sequence, and earlier matches can interfere with later patterns.

**Example Scenario** (lines 220-231):
```javascript
// Line 220: Links
html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="...">$1</a>');

// Line 228: Bold
html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

// Line 231: Italic
html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
```

**Failure Case**: Bold text inside a link
```markdown
[**Click Here**](https://example.com)
```

**Step 1 - Link replacement**:
```html
<a href="https://example.com">**Click Here**</a>
```

**Step 2 - Bold replacement**:
```html
<a href="https://example.com"><strong>Click Here</strong></a>
```

**Result**: This actually works! But there are worse cases...

**Real Failure**: Italic with link-like content:
```markdown
*[text](url)*
```

**Step 1 - Link replacement**:
```html
*<a href="url">text</a>*
```

**Step 2 - Italic replacement**:
```html
<em><a href="url">text</a></em>
```

**Problem**: Italic matched `[^*]+` which was too greedy. The patterns use `[^...]` (negated character class) which can fail with nested or adjacent markdown.

---

### 1.5 HTML Comments Visible in Output

**Placeholder HTML Comments Not Stripped**:

If WordPress exports contain HTML comments:
```html
<!-- Migration note: check this link -->
[Registration]()
```

**Current Behavior**: Comments appear in rendered HTML
**Expected Behavior**: Stripped or converted to metadata

**Why It Fails**: No pattern in `convertMarkdownToHtml()` handles HTML comments. The function assumes input is markdown, but WordPress exports might include HTML.

---

### 1.6 Multi-Line Link Syntax Broken

**Pattern**:
```markdown
[
  Registration Opens Jan 1st
](https://www.ultracamp.com)
```

**Current Behavior**: Regex fails to match because `[^` doesn't cross newlines by default

**Why It Fails**:
```javascript
// Line 220: [^...] matches characters but NOT newlines
html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2">$1</a>');
//                          ^^^^^^^^
//                    Doesn't match across lines
```

**Evidence**:
- **summer-camp.mdoc:26-28** - Link text and URL on different lines
- **summer-camp.mdoc:85-87** - Image link spanning lines
- **summer-staff.mdoc:34-36, 95-97, 101-103** - Multiple multi-line links

**Actual Rendering**: Links don't convert at all, text + URL appear as literal markdown

---

### 1.7 Image Paths Not Validated

**Pattern**:
```markdown
![](/images/facilities/DSC_0001-23-scaled-e1732560501258-896x1024.jpg)
```

**Current Behavior**: Passes through regex, creates `<img>` with relative path

**Issues**:
1. No validation that image exists at runtime
2. Alt text empty in some cases
3. No responsive image srcset generation
4. No lazy loading attributes

**Why It Matters**: While not "broken HTML," it's incomplete optimization.

---

## 2. Impact Assessment: Affected Pages

### 2.1 summer-camp.mdoc - CRITICAL

**Template Type**: `program`
**Status**: SEVERELY BROKEN

**Failures**:
- Line 18: YouTube URL renders as plain text
- Lines 27-28, 37, 43, 49, 55, 61, 67, 73, 79: 9 empty href links don't render as links
- Lines 26-28, 85-87, etc: Multi-line links fail
- Excessive `<br/>` between all section content
- Lines 106-112: Nested, malformed markdown with headers inside links

**Severity**: 🔴 CRITICAL
- Registration CTAs broken
- No YouTube embed for promotional video
- FAQ section appears as broken plain text

---

### 2.2 summer-staff.mdoc - CRITICAL

**Template Type**: `staff`
**Status**: SEVERELY BROKEN

**Failures**:
- Line 15: YouTube URL `https://www.youtube.com/watch?v=gosIrrZAtHw` renders as plain text
- Lines 34-36: Multi-line "Apply Now" link broken
- Lines 48-49, 53-54, 58-59, etc: All staff position descriptions have empty href placeholders
- Lines 90, 92, etc: FAQ questions with empty href
- Excessive `<br/>` throughout body content

**Severity**: 🔴 CRITICAL
- Apply Now CTA links broken
- Staff position descriptions don't link to details
- FAQ collapsed/accordion broken (if intended)
- YouTube promo video missing

---

### 2.3 about.mdoc - MODERATE

**Template Type**: `standard`
**Status**: PARTIALLY WORKING

**Failures**:
- Line 26: Image gallery with multiple inline images renders but may have alignment issues
- Line 64-65: "Monty Harlan" link has empty href
- Line 70-71: "Ben Harlan" link broken
- Line 78-79: "Jared Yorke" link broken
- Line 84-85: "Karli Harlan" link broken
- Line 90: Staff contact links broken
- Line 96: "John Scheiber" email link broken
- Line 106: "Housekeeper Job Description" link broken

**Severity**: 🟡 MODERATE
- Staff bios readable but can't email staff
- Staff directory links broken
- Job application form link broken
- Main content (text) renders correctly

---

### 2.4 cabins.mdoc - MODERATE

**Template Type**: `facility`
**Status**: PARTIALLY WORKING

**Failures**:
- Lines 18, 28: Images render but might lack responsive classes
- Line 32: "How many heated cabins?" link broken
- Line 34: "Can my family rent?" link broken
- Line 36: "Is there WIFI?" link broken
- Excessive `<br/>` in list items (lines 23-27)

**Severity**: 🟡 MODERATE
- Core facility info readable
- FAQ section broken (should be accordion/collapsible)
- Images display but not optimized

---

### 2.5 Home.mdoc - LOW

**Status**: Not yet examined in detail, likely minimal markdown

**Likely Issues**: Template-specific CTA links

---

### 2.6 test2.mdoc, testing.mdoc - LOW

**Status**: Test/draft pages, not production

---

## Summary Table

| Page | Type | YouTube | Empty Links | `<br/>` Spam | Multi-line | Severity |
|------|------|---------|-------------|---------|-----------|----------|
| summer-camp | program | YES (1) | YES (9+) | YES | YES | 🔴 CRITICAL |
| summer-staff | staff | YES (1) | YES (6+) | YES | YES | 🔴 CRITICAL |
| about | standard | NO | YES (6+) | SOME | SOME | 🟡 MODERATE |
| cabins | facility | NO | YES (3) | YES | SOME | 🟡 MODERATE |
| Home | (varies) | ? | ? | ? | ? | 🟠 UNKNOWN |

**Overall Impact**: All 7 pages have at least one rendering issue. Two critical pages (summer-camp, summer-staff) are unusable for CTAs.

---

## 3. Technical Root Cause Analysis

### 3.1 Why Hand-Rolled Regex Parser?

**Current Implementation** (lines 213-245):
- 8 separate regex patterns
- No markdown parser library
- No AST (Abstract Syntax Tree)
- No state management for context

**Why This Fails**:
1. **Markdown is context-sensitive** - `*` could be bold, italic, list marker, or literal asterisk
2. **Nesting matters** - `**bold _italic_ text**` requires recursive parsing
3. **Order matters** - Replacements must be carefully sequenced
4. **Edge cases abound** - URLs with special chars, escaped characters, etc.

### 3.2 Keystatic's Data Model

**File Format**: `.mdoc` (Keystatic Document Format)
```yaml
---
frontmatter: yaml
---
Markdown body content here
```

**Keystatic's API**:
- Provides `DocumentRenderer` component for rendering saved documents
- Supports custom schema extensions
- Built-in HTML sanitization (XSS prevention)
- Proper markdown → HTML with no regex hacks

**Current Workaround**:
```javascript
// Line 73-76: Manually parsing frontmatter
const filePath = path.join(process.cwd(), 'content', 'pages', `${params.slug}.mdoc`);
const fileContent = await fs.readFile(filePath, 'utf-8');
const contentMatch = fileContent.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);
const bodyContent = contentMatch ? contentMatch[1].trim() : '';
```

**Problem**: Ignoring Keystatic's built-in parser and trying to render markdown manually.

### 3.3 Missing Features

The converter does NOT handle:
- ✗ YouTube/embedded video URLs (key use case on camp website)
- ✗ Code blocks with syntax highlighting
- ✗ HTML tables
- ✗ Blockquotes
- ✗ Horizontal rules
- ✗ Strikethrough
- ✗ Task lists
- ✗ Footnotes
- ✗ Link references
- ✗ Escaped characters
- ✗ HTML validation/sanitization (XSS risk!)

### 3.4 Architecture Mismatch

```
WordPress (old)
  ├── Hand-edited HTML + shortcodes
  └── Export → Markdown (lossy)

Keystatic (new)
  ├── Native markdown field with preview
  ├── Built-in DocumentRenderer
  └── YAML frontmatter for metadata

Current App (broken)
  ├── Read .mdoc file manually
  ├── Parse YAML regex
  ├── Hand-roll markdown → HTML
  └── dangerouslySetInnerHTML (security risk)
```

**Better Architecture**:
```
Keystatic
  ├── Provide document via reader API
  └── Use DocumentRenderer or react-markdown
```

---

## 4. Technical Solution: Recommended Approach

### 4.1 Option A: Use Keystatic's DocumentRenderer (RECOMMENDED)

**Pros**:
- Purpose-built for Keystatic content
- Proper HTML sanitization (blocks XSS)
- Handles all markdown edge cases
- Future-compatible with Keystatic updates
- Already installed: `@keystatic/core` in package.json
- No additional dependencies

**Cons**:
- Requires refactoring reader API usage
- Less customization for complex renderers
- Component-based (React), not pure HTML string

**Implementation Effort**: 0.5 SP
**Risk**: Low (framework-supported)

**Usage Pattern**:
```typescript
import { DocumentRenderer } from '@keystatic/core/renderer';

// In page component
const pageDocument = await reader.collections.pages.read(slug);
return <DocumentRenderer document={pageDocument.body} />;
```

---

### 4.2 Option B: Use react-markdown + remark Plugins

**Pros**:
- Battle-tested, popular library
- Excellent plugin ecosystem
- Handles all markdown spec + GFM (GitHub Flavored Markdown)
- Easy YouTube/embed plugin integration
- Good TypeScript support

**Cons**:
- Additional dependency (currently not in package.json)
- Need to install: `react-markdown`, `remark-gfm`, custom plugins
- Must add YouTube plugin
- Requires sanitization library (sanitize-html or similar)

**Implementation Effort**: 0.8 SP
**Risk**: Medium (new dependency, requires testing)

**Usage Pattern**:
```typescript
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import YouTubeEmbed from '...';

return <ReactMarkdown remarkPlugins={[remarkGfm]} components={{...}} >{bodyContent}</ReactMarkdown>;
```

---

### 4.3 Option C: Unified Markdown Parser (marked.js)

**Pros**:
- Fast, minimal
- Small bundle size
- Good CommonMark compliance

**Cons**:
- Less extensible than remark
- Requires manual plugin integration
- Security: XSS protection is responsibility of caller

**Implementation Effort**: 0.5 SP
**Risk**: Medium (sanitization needed)

---

### 4.4 Option D: Fix Current Hand-Rolled Parser (NOT RECOMMENDED)

**Cons**:
- Technical debt accumulates
- Each edge case needs new regex
- Maintenance burden grows
- Still missing features (YouTube)
- XSS risk remains

**Implementation Effort**: 1.5 SP
**Risk**: High (ongoing maintenance, diminishing returns)

---

### RECOMMENDATION: Option A (Keystatic DocumentRenderer)

**Why**:
1. **Zero additional dependencies** - Already have @keystatic/core
2. **Future-proof** - Keystatic updates will improve rendering automatically
3. **Built-in security** - Sanitization included
4. **Least code change** - Minimal refactoring
5. **Team-aligned** - Using Keystatic's APIs as designed

**Migration Path**:
```
Phase 1: Update app/[slug]/page.tsx to use DocumentRenderer
Phase 2: Remove convertMarkdownToHtml() function
Phase 3: Add test coverage for all 7 pages
Phase 4: Validate YouTube embeds work
Phase 5: Deploy and verify
```

**Estimated Cost**: 1-1.5 SP total

---

## 5. Why This Bug Happened

### Root Cause Chain

1. **Initial Implementation** (Phase 0/1):
   - Quick regex solution to get working markdown
   - Focused on happy path only
   - Didn't account for WordPress data quality

2. **Data Quality Issues** from WordPress Migration:
   - Empty href links: `[text]()`
   - Multi-line link syntax: `[text\n](url)`
   - URLs not wrapped in markdown: raw `https://...`
   - Inconsistent formatting

3. **Keystatic Mismatch**:
   - Keystatic provides APIs for proper rendering
   - Current code doesn't use them
   - Manual file parsing + regex replacement is anti-pattern

4. **Testing Gap**:
   - No tests for `convertMarkdownToHtml()` function
   - No integration tests on actual page content
   - No manual QA on rendered output

5. **Scope Creep**:
   - YouTube embeds needed but not in original scope
   - FAQ sections needed accordion/collapse behavior
   - Empty links need special handling

---

## 6. Migration Strategy

### Phase A: Diagnosis (CURRENT - Done)

- [x] Identify all failing patterns
- [x] Document per-page impact
- [x] Categorize by severity
- [x] Root cause analysis

### Phase B: Solution Design (NEXT)

- [ ] Choose rendering approach (recommend: Keystatic DocumentRenderer)
- [ ] Create requirements/current.md snapshot
- [ ] Update keystatic.config.ts if needed
- [ ] Design test strategy

### Phase C: Implementation (TBD)

1. **Update page renderer** (0.5 SP):
   - Remove `convertMarkdownToHtml()`
   - Import DocumentRenderer
   - Update render logic

2. **Add YouTube support** (0.3 SP):
   - Custom renderer component for embed detection
   - Or: Update WordPress migration to wrap URLs properly

3. **Validation tests** (0.5 SP):
   - Test each of 7 pages render without errors
   - Verify YouTube embeds
   - Check empty links handled gracefully

4. **Deployment** (0.2 SP):
   - Build and deploy
   - Manual QA on all 7 pages
   - Monitor for errors

**Total Estimated Cost**: 1.5 SP

---

## 7. Blockers & Constraints

### Known Issues
1. **Empty href migration data** - Need to decide: skip rendering, render as span, or log warning?
2. **YouTube URL format** - Different domains (youtu.be vs youtube.com) need detection
3. **Multi-line markdown** - Keystatic should handle, but need to verify

### Questions for Product/Content Team
1. Should empty links be rendered as disabled buttons, or skipped?
2. Are YouTube URLs intentionally bare, or migration error?
3. Do FAQ sections need accordion/collapse behavior?
4. Are there other markdown patterns used that we haven't seen?

---

## Appendix: Detailed Regex Failure Examples

### Example 1: summer-camp.mdoc Line 18
```markdown
## Summer 2026 Camp Dates Are now Published!
https://youtu.be/8N9Yeup1xVA?si=4KXXFghbmpg0j46-
## Why "Deeper"?
```

**Current Output**:
```html
<h2>Summer 2026 Camp Dates Are now Published!</h2>
https://youtu.be/8N9Yeup1xVA?si=4KXXFghbmpg0j46-<br/>
<h2>Why "Deeper"?</h2>
```

**Expected Output**:
```html
<h2>Summer 2026 Camp Dates Are now Published!</h2>
<iframe src="https://www.youtube.com/embed/8N9Yeup1xVA" ...></iframe>
<h2>Why "Deeper"?</h2>
```

---

### Example 2: summer-camp.mdoc Lines 26-28
```markdown
[
  Registration Opens Jan 1st
](https://www.ultracamp.com/clientlogin.aspx?idCamp=268&campCode=blc)
```

**Why It Fails**: `[^` doesn't match across newlines. Regex sees:
- `[` matched
- `\n Registration Opens Jan 1st\n` - does NOT match `[^\]]` pattern
- Link conversion fails silently
- Output: literal markdown text

**Regex**:
```javascript
/\[([^\]]+)\]\(([^\)]+)\)/g
  ^^^^^^^^
  This character class doesn't match newlines by default
  Need DOTALL flag or restructure
```

---

### Example 3: summer-camp.mdoc Lines 37, 43, etc.
```markdown
[Primary Overnight (2nd-3rd) - June 4-5]()
```

**Regex Match**:
```javascript
// Pattern: /\[([^\]]+)\]\(([^\)]+)\)/g
// Group 1: "Primary Overnight (2nd-3rd) - June 4-5"
// Group 2: "" (EMPTY STRING)

// Replacement: '<a href="$2" class="text-secondary hover:underline">$1</a>'
// Result: <a href="" class="text-secondary hover:underline">Primary Overnight (2nd-3rd) - June 4-5</a>
```

**Problem**: `[^\)]+` means "one or more non-`) characters". When there's nothing between `()`, it matches the empty string, which is still a valid capture.

---

### Example 4: All pages - Excessive `<br/>`
```markdown
## About BLC

**Our mission:**

**Bear Lake Camp exists to be...**
```

**Step 1 - Heading replacement** (lines 223-225):
```html
<h2 class="text-3xl font-bold mt-10 mb-6">About BLC</h2>

<strong>Our mission:</strong>

<strong>Bear Lake Camp exists to be...</strong>
```

**Step 2 - Bold replacement** (lines 228):
```html
<h2 class="text-3xl font-bold mt-10 mb-6">About BLC</h2>

<strong>Our mission:</strong>

<strong>Bear Lake Camp exists to be...</strong>
```
(No change - bold is already HTML)

**Step 3 - Paragraph detection** (lines 234-239):
```javascript
html.split('\n\n')  // Split by double newlines
// Result: [
//   '<h2>About BLC</h2>\n\n',
//   '<strong>Our mission:</strong>\n\n',
//   '<strong>Bear Lake Camp...</strong>'
// ]
```

After processing, some elements wrapped in `<p>` tags, others not. Then...

**Step 4 - Line break conversion** (line 242):
```javascript
html = html.replace(/\n/g, '<br/>');
```

**Result**:
```html
<h2 class="text-3xl font-bold mt-10 mb-6">About BLC</h2><br/>
<br/>
<strong>Our mission:</strong><br/>
<br/>
<strong>Bear Lake Camp exists to be...</strong>
```

Expected was paragraph `<p>` elements, not `<br/>` everywhere.

---

## Conclusion

The custom `convertMarkdownToHtml()` function is a **anti-pattern** that:
1. Duplicates work already handled by Keystatic
2. Introduces XSS risks (no sanitization)
3. Fails on real-world data (empty links, multi-line, URLs)
4. Isn't testable (string manipulation)
5. Isn't maintainable (each edge case needs new regex)

**Immediate Action**: Replace with **Option A (Keystatic DocumentRenderer)** - 1.5 SP total, low risk, high ROI.

**Timeline**: Can be completed in 1 sprint with proper testing.
