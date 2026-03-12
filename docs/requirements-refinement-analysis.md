# Requirements Refinement Analysis
## REQ-201 & REQ-206 Edge Cases & Acceptance Criteria Review

**Date:** 2025-11-20
**Analyst:** Requirements Team
**Status:** Ready for Implementation Planning

---

## Executive Summary

This analysis reviews REQ-201 (Proper Markdown Rendering) and REQ-206 (Content Cleanup) against actual migrated content. **Critical findings:**

- **7 distinct YouTube URL patterns** identified in content (not just 2 formats documented)
- **28 broken markdown links** with empty hrefs across 5 pages
- **4 HTML comments** containing migration notes
- **Multiple markdown hierarchy violations** requiring normalization
- **3 undocumented edge cases** for code blocks, tables, and inline markup

---

## Part 1: REQ-201 Refined - Proper Markdown Rendering

### Current Acceptance Criteria (Status: Incomplete)

**Issues identified:**
- YouTube URL formats incomplete (missing playlist, timestamp, tracking params)
- No mention of video parameters (start time, end time, list)
- Accessibility criteria vague ("title attribute" insufficient)
- Missing edge cases: code blocks, tables, blockquotes, inline HTML
- No performance criteria for embed lazy-loading
- Missing XSS/security considerations

### Refined Acceptance Criteria

#### AC-201.1: YouTube Embed Conversion (Updated)
**Requirement:** All YouTube URLs automatically converted to iframe embeds with proper parameters

**Given:** A markdown document contains YouTube URLs in various formats
**When:** The markdown renderer processes the document
**Then:** URLs are converted to embedded iframes with the following specifications:

**Supported URL Formats:**
```
1. Standard watch URL:
   https://www.youtube.com/watch?v=VIDEO_ID
   https://www.youtube.com/watch?v=VIDEO_ID&t=30s
   https://www.youtube.com/watch?v=VIDEO_ID&start=30&end=60
   https://www.youtube.com/watch?v=VIDEO_ID&list=PLAYLIST_ID

2. Short URL:
   https://youtu.be/VIDEO_ID
   https://youtu.be/VIDEO_ID?t=30

3. With tracking params (stripped):
   https://youtu.be/VIDEO_ID?si=4KXXFghbmpg0j46-
   https://youtu.be/VIDEO_ID?si=tracking123&t=30s

4. Playlist URL:
   https://www.youtube.com/playlist?list=PLAYLIST_ID
   https://www.youtube.com/watch?v=VIDEO_ID&list=PLAYLIST_ID

5. Embedded format (no-op):
   https://www.youtube.com/embed/VIDEO_ID
   (Already embedded, render as-is)

6. Malformed URLs:
   https://youtu.be/
   https://youtube.com/invalidformat
   (Render as plain link text, not embedded)
```

**Iframe Specifications:**
- Responsive 16:9 aspect ratio (width: 100%, height: calculated via padding-bottom: 56.25%)
- Title attribute: `YouTube video: [extracted from page metadata or generic fallback]`
- Allow attribute: `accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share`
- Lazy loading: `loading="lazy"`
- No-referrer: `referrerpolicy="no-referrer"`
- Frameborder: `0`
- `allowFullscreen` attribute present

**Edge Cases Handled:**
- URL with start/end times: preserve in embed URL as `?start=30&end=60`
- URL with playlist: include `?list=PLAYLIST_ID` in embed
- Mixed tracking params and timestamps: strip tracking, preserve timestamps
- Non-YouTube URLs containing "youtube": do NOT embed (safety check)
- Consecutive YouTube URLs: each converts to separate iframe
- YouTube URL inside code block: render as plain text (no embed)

**Test Scenarios:**
1. Standard watch URL: `https://www.youtube.com/watch?v=8N9Yeup1xVA` → embedded
2. Short URL with tracking: `https://youtu.be/8N9Yeup1xVA?si=4KXXFghbmpg0j46-` → embedded (tracking stripped)
3. URL with timestamp: `https://www.youtube.com/watch?v=VIDEO_ID&t=30s` → embedded with `?start=30`
4. Playlist URL: `https://www.youtube.com/watch?v=8N9Yeup1xVA&list=PLxxxxx` → embedded with playlist
5. Malformed URL: `https://youtu.be/` → rendered as plain text link
6. URL in code block: ` ```https://youtu.be/VIDEO``` ` → plain text, NOT embedded
7. Two consecutive URLs: Each becomes separate iframe

---

#### AC-201.2: Markdown Link Handling (Refined)
**Requirement:** All links render correctly; broken/empty links handled gracefully

**Given:** Markdown content with various link formats
**When:** The markdown renderer processes links
**Then:** Links behave as follows:

**Valid Link Behavior:**
```markdown
[Link text](https://example.com) → <a href="https://example.com">Link text</a>
[Email](mailto:test@example.com) → <a href="mailto:test@example.com">Email</a>
[Internal](/page) → <a href="/page">Internal</a>
```

**Empty/Broken Link Handling:**
```markdown
[Text]() → Rendered as plain text: "Text" (no link element)
[Text](undefined) → Rendered as plain text: "Text"
[Text]('') → Rendered as plain text: "Text"
```

**Link Attributes:**
- `rel="noopener noreferrer"` for external URLs (security)
- No `href` attribute if URL is empty or invalid
- `aria-label` for links with only icon content
- Hover states with visual feedback (underline, color change)
- Focus indicators for keyboard navigation (min 2px outline, 4.5:1 contrast)

**Edge Cases:**
- Anchor links: `[Section](#heading)` → valid href preserved
- Data URLs: `[Download](data:application/pdf;...)` → valid but must sanitize
- JavaScript URLs: `[Click](javascript:alert())` → BLOCKED (XSS prevention)
- Very long URLs: rendered with ellipsis, full URL in title attribute
- Links with special characters: properly encoded (e.g., spaces → %20)
- Multiple trailing spaces in URL: trimmed

**Test Scenarios:**
1. Valid link: renders with href
2. Empty href: renders as plain text
3. External link: has `rel="noopener noreferrer"`
4. Anchor link: renders correctly
5. JavaScript URL: blocked/error logged
6. Very long URL: ellipsized with tooltip

---

#### AC-201.3: Paragraph & Line Break Handling (Refined)
**Requirement:** Proper semantic paragraph structure; no excessive `<br/>` tags

**Given:** Markdown content with various newline patterns
**When:** The markdown renderer processes line breaks
**Then:** Output matches semantic HTML structure:

**Paragraph Rules:**
```
Single newline → same paragraph (no <br/> or <p> break)
Example:
  Line 1
  Line 2
  Result: <p>Line 1 Line 2</p>

Double newline → new paragraph <p> element
Example:
  Paragraph 1

  Paragraph 2
  Result: <p>Paragraph 1</p><p>Paragraph 2</p>

Multiple blank lines → single <p> break (collapse)
Example:
  Paragraph 1



  Paragraph 2
  Result: <p>Paragraph 1</p><p>Paragraph 2</p>
  (NOT three <br/> tags)
```

**Line Break Prohibition:**
- No `<br/>` tags generated from newlines
- Only explicit `\` (backslash-space at EOL) or `<br/>` in raw HTML generates breaks
- Trailing whitespace (2+ spaces) not converted to breaks in rendered output

**Markdown Structures Preserved:**
```markdown
Unordered lists:
- Item 1
- Item 2
→ <ul><li>Item 1</li><li>Item 2</li></ul>

Ordered lists:
1. Item 1
2. Item 2
→ <ol><li>Item 1</li><li>Item 2</li></ol>

Nested lists:
- Item
  - Nested
→ <ul><li>Item<ul><li>Nested</li></ul></li></ul>

Block quotes:
> Quote text
→ <blockquote><p>Quote text</p></blockquote>

Code blocks:
```
code here
```
→ <pre><code>code here</code></pre>
```

**Edge Cases:**
- Inline markup + line breaks: preserve inline formatting across line breaks
- List items spanning multiple lines: treated as single item
- Blockquote with multiple paragraphs: each paragraph within `<blockquote>`
- Code blocks with language syntax highlighting: preserve indentation

**Test Scenarios:**
1. Single newline: remains same paragraph
2. Double newline: creates paragraph break
3. Multiple blank lines: collapsed to single break
4. No excessive `<br/>` in output
5. Lists preserve structure across newlines
6. Blockquotes handle multiple paragraphs

---

#### AC-201.4: Image Rendering & Optimization (Refined)
**Requirement:** Images render with optimization, accessibility, and responsive sizing

**Given:** Markdown with image syntax
**When:** The markdown renderer processes images
**Then:** Images render with these specifications:

**Image HTML Structure:**
```jsx
<Image
  src={imageSrc}
  alt={altText}
  width={originalWidth}
  height={originalHeight}
  loading="lazy"
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1024px"
  className="responsive-image"
/>
```

**Next.js Image Component Requirements:**
- Use Next.js `next/image` Image component (not `<img>`)
- `loading="lazy"` for all images below fold
- `priority={true}` only for hero/LCP images (max 2 per page)
- `sizes` prop for responsive sizing
- Width/height props to prevent layout shift
- Alt text required and descriptive (min 5 characters)

**Markdown Image Syntax Support:**
```markdown
![alt text](image.jpg)
![alt text](image.jpg "title text")
![](/path/to/image.png)
```

**Image URL Handling:**
- Relative paths: `/images/...` → resolved from public directory
- Absolute URLs: converted to next/image compatible format
- WordPress image URLs with parameters: cleaned (e.g., `-896x1024` dimensions stripped from alt)
- Missing images: logged as warning, render placeholder with alt text

**Responsive Sizing Rules:**
```
Mobile (< 640px): 100% of viewport width
Tablet (640px - 1024px): 80% of viewport width
Desktop (> 1024px): max 1024px
```

**Aspect Ratio Preservation:**
- If width/height in markdown metadata: use for aspect ratio calculation
- If missing: allow browser to calculate (not ideal, but acceptable)
- CSS aspect-ratio: auto prevents CLS

**Accessibility Requirements:**
- Alt text always present and descriptive
- Title attribute optional (provides tooltip)
- Parent figure/caption for context (optional)
- No decorative images without empty alt: `![](decorative.png)` → hidden from a11y tree

**Edge Cases:**
- Image with only `![]()`: render with empty src warning
- Very large images: no client-side resizing (relies on CDN optimization)
- AVIF/WebP support: use `<picture>` element with fallbacks
- Animated GIFs: use Image component with `unoptimized={true}`
- SVG images: pass through as-is (no optimization)

**Test Scenarios:**
1. Standard image: renders with Next.js Image component
2. Image with alt text: alt attribute present
3. Missing dimensions: no layout shift
4. Lazy loading: `loading="lazy"` present
5. Responsive sizing: `sizes` prop correct
6. Missing image: warning logged, placeholder rendered

---

#### AC-201.5: Heading Hierarchy & Semantics (Refined)
**Requirement:** Proper h1-h6 hierarchy; semantic structure; consistent styling

**Given:** Markdown with headings
**When:** The markdown renderer processes headings
**Then:** Headings follow these rules:

**Hierarchy Rules:**
```
# Main Title (h1) → <h1> - ONE per page, at top of content
## Section (h2) → <h2> - Major sections
### Subsection (h3) → <h3> - Sub-sections
#### Detail (h4) → <h4> - Details (avoid if possible)
##### Not recommended (h5) → minimal use
###### Rarely used (h6) → avoid
```

**Semantic Structure Requirements:**
- Each page has exactly ONE `<h1>` (page title from frontmatter)
- Content headings use `<h2>` as starting level
- No skipping levels: h2 → h4 is invalid, must go h2 → h3
- Headings must be sequential within sections

**Valid Example:**
```
<h1>Page Title</h1>
<h2>Section 1</h2>
  <h3>Subsection 1.1</h3>
  <h3>Subsection 1.2</h3>
<h2>Section 2</h2>
  <h3>Subsection 2.1</h3>
```

**Invalid Example (SHOULD BE FIXED):**
```
<h1>Page Title</h1>
<h3>Section 1</h3>  <!-- Should be h2, skips h2 -->
<h4>Subsection</h4> <!-- Should be h3, skips h3 -->
```

**Tailwind Typography Classes:**
```
h1 → text-4xl font-bold leading-tight tracking-tight
h2 → text-3xl font-bold leading-snug mt-8 mb-4
h3 → text-2xl font-semibold leading-snug mt-6 mb-3
h4 → text-xl font-semibold mt-4 mb-2
h5, h6 → text-lg font-semibold (avoid)
```

**Spacing Requirements:**
- Top margin: 1.5x standard spacing for h2, 1x for h3
- Bottom margin: 1x standard spacing
- First heading on page: no top margin
- Consistent vertical rhythm

**Heading Attributes:**
- ID generated from heading text (kebab-case) for anchor links
- Example: "## Why Deeper?" → id="why-deeper"
- Title attribute optional (not needed for accessibility)

**Edge Cases:**
- Empty heading: `## ` → skipped or rendered as comment
- Heading with markdown inline: `## **Bold** text` → preserve inline formatting
- Very long heading: rendered on multiple lines (no truncation)
- Heading with special characters: escaped properly (e.g., `&` → `&amp;`)
- Heading with code: `` ## `function()` `` → inline code styling preserved

**Test Scenarios:**
1. Single h1 per page: exactly one
2. h2 starts content: no h3 before h2
3. Hierarchy sequential: no level skips
4. IDs generated correctly: kebab-case from text
5. Tailwind classes applied: correct size/spacing
6. Inline formatting preserved: bold, italic within headings

---

#### AC-201.6: HTML Comment Stripping (New)
**Requirement:** All HTML comments removed from rendered output

**Given:** Markdown with HTML comments
**When:** The markdown renderer processes the document
**Then:** Comments are stripped and not visible in HTML output:

**Comment Formats Handled:**
```
<!-- Single line comment -->
<!-- Multi-line
     comment -->
<!-- Nested <!-- comment --> (if supported by parser) -->
<!-- With special chars: @#$%^&*() -->
```

**Stripping Behavior:**
- Comments completely removed from rendered HTML (no placeholder)
- Comments in raw markdown: logged as debug info (for migration tracking)
- Comments in code blocks: preserved as part of code
- Comments with editor notes: migrated to separate `.notes.md` file (P2)

**Test Scenarios:**
1. HTML comment: completely removed
2. Comment in code block: preserved
3. Multiple comments: all removed
4. Comment with special chars: handled correctly

---

#### AC-201.7: Code Block Rendering (New Edge Case)
**Requirement:** Code blocks render correctly with syntax highlighting and no YouTube embed conversion

**Given:** Markdown with code blocks
**When:** The markdown renderer processes code blocks
**Then:** Code is rendered as-is with proper formatting:

**Code Block Formats:**
```markdown
Inline code: `code here`
Code block:
```
code here
```
Code block with language:
```javascript
console.log('hello');
```
```

**Code Block Behavior:**
- Syntax highlighting applied based on language tag
- No markdown processing inside code blocks
- URLs in code: NOT converted to links or embeds
- Tabs/spaces preserved (2-space indent typical)
- Line numbers optional (not required)
- Copy button optional but recommended

**Fenced Code Block Spec:**
```
Opening: ```language
Content: exactly as-is
Closing: ```
(No smart quotes, no entity encoding inside code)
```

**Test Scenarios:**
1. Inline code: rendered with monospace font
2. Code block: preserves formatting and indentation
3. Language tag: syntax highlighting applied
4. URL in code: rendered as plain text, not linked
5. Indentation: preserved correctly

---

#### AC-201.8: Table Rendering (New Edge Case)
**Requirement:** Markdown tables render with proper structure and accessibility

**Given:** Markdown with GFM tables
**When:** The markdown renderer processes tables
**Then:** Tables render with proper HTML structure:

**Table Format (GFM):**
```markdown
| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |
```

**HTML Output:**
```html
<table>
  <thead>
    <tr>
      <th>Header 1</th>
      <th>Header 2</th>
      <th>Header 3</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Cell 1</td>
      <td>Cell 2</td>
      <td>Cell 3</td>
    </tr>
    <tr>
      <td>Cell 4</td>
      <td>Cell 5</td>
      <td>Cell 6</td>
    </tr>
  </tbody>
</table>
```

**Table Styling:**
- Responsive wrapper for mobile (horizontal scroll)
- Border-collapse, proper spacing
- Header row: bold, darker background
- Alternating row colors optional
- Tailwind table styles applied

**Accessibility:**
- `<thead>` and `<tbody>` elements
- `scope="col"` for header cells
- Description for complex tables (optional)

**Edge Cases:**
- Pipes in cell content: escaped with backslash `\|`
- Multi-line cell content: not supported in GFM, split into multiple rows
- Merged cells: not supported, render separate cells
- No tables in current content, but prepare for future use

**Test Scenarios:**
1. Simple table: renders with correct structure
2. Headers: bold and in `<thead>`
3. Responsive: scrollable on mobile
4. Pipes in content: escaped properly

---

#### AC-201.9: Blockquote Rendering (New Edge Case)
**Requirement:** Block quotes render with proper styling and semantics

**Given:** Markdown with blockquotes
**When:** The markdown renderer processes blockquotes
**Then:** Quotes render correctly:

**Blockquote Format:**
```markdown
> This is a quote
> It can span multiple lines
> Or be multiple paragraphs

> First paragraph
>
> Second paragraph
```

**HTML Output:**
```html
<blockquote>
  <p>This is a quote
  It can span multiple lines
  Or be multiple paragraphs</p>
</blockquote>

<blockquote>
  <p>First paragraph</p>
  <p>Second paragraph</p>
</blockquote>
```

**Blockquote Styling:**
- Left border (4-6px, brand color)
- Left padding (1rem)
- Italic or lighter text (optional)
- Muted color (gray-600 or similar)

**Edge Cases:**
- Nested blockquotes: supported (>>) with indentation
- Blockquote with inline markdown: formatting preserved
- Attribution line: optional (can be plain text below)

**Test Scenarios:**
1. Simple blockquote: renders with left border
2. Multiple paragraphs: each in separate `<p>`
3. Inline formatting: preserved within quote
4. Nested quotes: proper indentation

---

#### AC-201.10: Inline Markup Preservation (Refined)
**Requirement:** Bold, italic, strikethrough, and other inline formatting preserved

**Given:** Markdown with inline formatting
**When:** The markdown renderer processes inline markup
**Then:** Formatting is preserved across all contexts:

**Inline Markdown:**
```markdown
**bold** or __bold__ → <strong>bold</strong>
*italic* or _italic_ → <em>italic</em>
***bold italic*** → <strong><em>bold italic</em></strong>
~~strikethrough~~ → <del>strikethrough</del> (if GFM enabled)
`inline code` → <code>inline code</code>
[link](url) → <a href="url">link</a>
![image](url) → <Image src="url" alt="image" />
```

**Combination Rules:**
```markdown
[**bold link**](url) → <a href="url"><strong>bold link</strong></a>
**text with `code`** → <strong>text with <code>code</code></strong>
***[bold link](url)*** → <strong><em><a>bold link</a></em></strong>
```

**Edge Cases:**
- Incomplete markup: `**text` (no closing) → rendered as-is or as literal text
- Escaped characters: `\**` → displays as `**` (literal)
- Mixed delimiters: `**text__` (mismatched) → handled gracefully or error logged

**Test Scenarios:**
1. Bold text: renders as `<strong>`
2. Italic text: renders as `<em>`
3. Code: renders as `<code>`
4. Combined: all formatting applied correctly
5. Links with formatting: formatting within link preserved

---

### New Security Requirement: XSS Prevention (AC-201.11)

**Requirement:** Sanitize markdown output to prevent XSS attacks

**Given:** Markdown with potentially malicious content
**When:** The markdown renderer processes the document
**Then:** Output is sanitized to prevent XSS:

**Sanitization Rules:**
- HTML tags not in allowed list: stripped or escaped
- Script tags: completely removed
- Event handlers (onclick, onerror, etc.): removed
- Data URLs in src attributes: blocked unless specifically allowed
- JavaScript protocol URLs: blocked
- CSS in style attributes: sanitized (no expressions)

**Allowed HTML Elements (if raw HTML in markdown):**
- `<a>` (links), `<img>` (images), `<br>`, `<hr>`
- `<p>`, `<div>`, `<span>` (basic structure)
- `<strong>`, `<em>`, `<del>` (emphasis)
- `<ul>`, `<ol>`, `<li>` (lists)
- `<blockquote>`, `<pre>`, `<code>` (quotes/code)
- `<h1>` - `<h6>` (headings)
- `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>` (tables)

**Blocked HTML Elements:**
- `<script>`, `<iframe>` (except YouTube embeds)
- `<object>`, `<embed>`, `<link>`, `<style>`
- `<input>`, `<form>`, `<button>` (interactive elements)
- Any element with event handlers

**Test Scenarios:**
1. Script tag: completely removed
2. Event handler: removed from element
3. JavaScript URL: blocked
4. Allowed HTML: preserved
5. XSS payload: fails sanitization, logged as security event

---

### Edge Cases Summary for REQ-201

| Edge Case | Current Handling | Refined Handling | Risk Level |
|-----------|------------------|------------------|-----------|
| YouTube URL with tracking params | Not handled | Strip params, preserve video ID | Medium |
| YouTube URL with timestamps | Not handled | Extract time, add to embed | Medium |
| Playlist URLs | Not handled | Include list param in embed | Low |
| Empty links `[text]()` | Unknown | Render as plain text | High |
| HTML comments | Unknown | Strip completely | High |
| Code blocks with URLs | Unknown | No embed conversion | Medium |
| XSS in markdown | Not mentioned | Sanitize with allowlist | Critical |
| Multiple newlines | Excessive `<br/>` | Collapse to single break | High |
| h3 before h2 | Unknown | Report hierarchy error | Medium |
| Missing alt text on images | Unknown | Require alt, warn if missing | High |

---

## Part 2: REQ-206 Refined - Content Cleanup

### Actual Content Issues Found (Analysis of 5 .mdoc files)

#### Summer Camp (summer-camp.mdoc)

**Issues Found:**
1. Line 18: YouTube URL with tracking param: `https://youtu.be/8N9Yeup1xVA?si=4KXXFghbmpg0j46-`
2. Lines 26-28, 37-87: **28 broken markdown links with empty hrefs:**
   ```markdown
   [Primary Overnight (2nd-3rd) - June 4-5]()
   [Jr. High 1 (7th-9th) - June 7-12]()
   [Junior 1 (4th-6th) - June 14-19]()
   ... and 25 more
   ```
3. Line 85: Image with WordPress dimensions in filename: `/images/facilities/DSC_0001-23-scaled-e1732560501258-896x1024.jpg`
4. Line 33: Markdown formatting inconsistency: `the**grade camper will be going into**in` (no space before "in")
5. Lines 105-112: Malformed heading/link structure with nested brackets and broken formatting

**Required Fixes:**
- Clean YouTube URL to remove tracking params: `https://youtu.be/8N9Yeup1xVA`
- Convert 28 empty links to either:
  - Add proper registration link (check with Monty/team)
  - OR convert to plain text
- Clean image filename to remove WordPress artifacts
- Fix markdown formatting inconsistencies
- Flatten heading/link structure

---

#### Cabins (cabins.mdoc)

**Issues Found:**
1. Lines 32-37: **3 broken links with empty hrefs:**
   ```markdown
   [How many heated cabins do you have?]()
   [Can my family rent a cabin?]()
   [Is there WIFI?]()
   ```
2. Image filenames with WordPress artifacts: `DSC_0452-scaled.jpg`, `DSC_0448-600x400.jpg`
3. Line 19: Missing heading structure before "Features" section

**Required Fixes:**
- Convert empty FAQ links to proper accordion structure OR plain text
- Simplify image filenames (remove scale/size indicators)
- Add proper h3 heading for Features section

---

#### Summer Staff (summer-staff.mdoc)

**Issues Found:**
1. Line 15: YouTube URL with platform: `https://www.youtube.com/watch?v=gosIrrZAtHw` (lacks tracking param but lacks newline before link)
2. Lines 48-84: **9 broken links with "Click Here" text and empty hrefs:**
   ```markdown
   [Click Here]()
   ```
3. Line 90, 92, 96, 100, 102, 104, 106, 108: **8 FAQ links with empty hrefs**
4. Lines 23-27: Image filenames with WordPress artifacts and tiny dimensions: `150x150.jpg`
5. Heading structure inconsistency: mixture of `##` and `###` with no clear pattern
6. Line 43: Paragraph with no clear section heading

**Required Fixes:**
- Convert YouTube URL to standard format
- Convert 9 + 8 = 17 empty links to proper content
- Clean image filenames
- Normalize heading hierarchy
- Add missing section headings for clarity

---

#### Home (Home.mdoc)

**Issues Found:**
1. Line 31: **Embedded YouTube URL without proper markdown:** `https://www.youtube.com/watch?v=or5jNI9GBDI&list=PLBi2OytDye_rt_miY7SAbherTxK4iCOwM&index=4` (this is a playlist URL, not parsed)
2. Lines 49-55: **4 links with HTML comment artifacts:**
   ```markdown
   [Financial Partnerships](/partners  <!-- TBD: Partners page not migrated yet -->/#giving)
   [Prayer Needs](/partners  <!-- TBD: Partners page not migrated yet -->/#prayerneeds)
   [Volunteer](/partners  <!-- TBD: Partners page not migrated yet -->/#volunteer)
   [BLC Wishlist](/partners  <!-- TBD: Partners page not migrated yet -->/#wishlist)
   ```
3. Image filenames with WordPress artifacts: `e1731002421710-150x150.jpg`

**Required Fixes:**
- Convert playlist URL to proper format (or leave as reference?)
- Remove HTML comments from link URLs (CRITICAL - breaks URL parsing)
- Clean image filenames
- Update /partners links to actual route once available

---

#### About (about.mdoc)

**Issues Found:**
1. Lines 64-90: **6 broken links (mailto and regular) with empty hrefs:**
   ```markdown
   [Executive Director]()
   [Director of Camping Ministry]()
   [Facilities Manager]()
   [Food Service Director/Guest Group Coordinator​]()
   [Communications Manager]()
   [Program Intern]()
   ```
2. Line 78: Email link has wrong address: `mailto:timt@bearlakecamp.com` (should be jared's email)
3. Line 90: Same email wrong address: `mailto:karli@bearlakecamp.com` (should be john's email)
4. Line 96: Same email wrong address: `mailto:karli@bearlakecamp.com` (should be kyle's email)
5. Image filenames with WordPress artifacts: various png files with IDs

**Required Fixes:**
- Add proper mailto links with correct email addresses
- Or convert staff names to plain text if email not available
- Clean image filenames
- Verify email addresses against Keystatic schema

---

### Updated Acceptance Criteria for REQ-206

#### AC-206.1: YouTube URL Cleanup (Refined)
**Requirement:** All YouTube URLs converted to clean, standardized format

**Given:** 5 .mdoc files with YouTube URLs
**When:** Running content cleanup script
**Then:** URLs are standardized as follows:

**Detected URLs & Fixes:**
```
1. summer-camp.mdoc:18
   Current: https://youtu.be/8N9Yeup1xVA?si=4KXXFghbmpg0j46-
   Fixed: https://youtu.be/8N9Yeup1xVA

2. summer-staff.mdoc:15
   Current: https://www.youtube.com/watch?v=gosIrrZAtHw
   Fixed: https://youtu.be/gosIrrZAtHw (or left as-is, both valid)

3. Home.mdoc:31
   Current: https://www.youtube.com/watch?v=or5jNI9GBDI&list=PLBi2OytDye_rt_miY7SAbherTxK4iCOwM&index=4
   Handling: This is a playlist URL
   Options:
     a) Convert to playlist embed: https://www.youtube.com/embed/videoseries?list=PLBi2OytDye_rt_miY7SAbherTxK4iCOwM
     b) Create custom playlist component
     c) Document as P2 feature, leave as-is with note
   Recommendation: Option (c) - leave as-is, note for future enhancement
```

**Cleanup Rules:**
1. Strip tracking parameters: `?si=`, `?utm_*`, `&v=`
2. Preserve timestamps: `?t=30`, `&start=30`
3. Preserve playlist IDs: `&list=`, `?list=`
4. Standardize format: prefer `youtu.be/ID` for simplicity (shorter)
5. Validate URLs after cleanup (must be valid format)

**Script Behavior:**
- Find all lines matching YouTube URL pattern
- Extract video ID and parameters
- Reconstruct clean URL
- Report changes to console
- Option to dry-run before apply

**Test Scenarios:**
1. URL with tracking: tracking params removed
2. URL with timestamp: timestamp preserved
3. Playlist URL: documented as P2, left as-is
4. Malformed URL: logged as error, manual review required

---

#### AC-206.2: Broken Link Repair (Refined)
**Requirement:** All broken markdown links fixed or converted

**Given:** 28+ broken links with empty hrefs across 5 files
**When:** Running content cleanup script & manual review
**Then:** Links are handled as follows:

**Broken Links Found (Total: 28)**

**Summer Camp (28 links - session registration):**
```markdown
Lines 26-28, 37, 43, 49, 55, 61, 67, 73, 79, 85-87, 101-116, 127-129, 141-142:
[Primary Overnight (2nd-3rd) - June 4-5]()
[Junior 1 (4th-6th) - June 14-19]()
... (24 more similar session links)
[Registration Opens Jan 1st]() (appears 4 times)
[Printable Form - Available Jan 1st]()
[Online Campership Form]()

Analysis: These should link to registration URL from frontmatter or Keystatic schema
Current: registrationLink: '' (empty in schema)
Fix: Either:
  a) Update schema field with actual URL
  b) Remove links, convert to plain text
  c) Add placeholder with note
```

**Cabins (3 links - FAQ accordion):**
```markdown
Lines 32-37:
[How many heated cabins do you have?]()
[Can my family rent a cabin?]()
[Is there WIFI?]()

Analysis: These are FAQ questions that should link to answers (accordion behavior)
Current: Empty hrefs, no answer content
Fix: Convert to proper FAQ accordion component (REQ-207 dependency)
```

**Summer Staff (17 links - positions & FAQs):**
```markdown
Lines 48-84: [Click Here]() - Job position details (9 links)
Lines 90-109: [Why Should I work at camp?]() etc - FAQ questions (8 links)

Analysis: These should link to detailed content or FAQs
Current: Empty hrefs
Fix: Convert to accordion/expandable components
```

**Home (4 links - partners page):**
```markdown
Lines 49-55:
[Financial Partnerships](/partners  <!-- TBD: Partners page not migrated yet -->/#giving)
[Prayer Needs](/partners  <!-- TBD: Partners page not migrated yet -->/#prayerneeds)
[Volunteer](/partners  <!-- TBD: Partners page not migrated yet -->/#volunteer)
[BLC Wishlist](/partners  <!-- TBD: Partners page not migrated yet -->/#wishlist)
[Donate](https://donorbox.org/donate-to-blc)

Analysis: Links to /partners page not yet created
Current: Links embedded with HTML comments in URL
Fix: MUST remove HTML comments immediately (breaks URL parsing)
      Then either:
      a) Create /partners page with these sections
      b) Update links to alternate pages
      c) Remove links with note for future implementation
```

**About (6 links - staff emails):**
```markdown
Lines 64, 70, 78, 84, 90, 96:
[Executive Director]()
[Monty Harlan](mailto:monty@bearlakecamp.com) - has email
[Ben Harlan](mailto:ben@bearlakecamp.com) - has email
[Jared Yorke](mailto:timt@bearlakecamp.com) - WRONG email
[Karli Harlan](mailto:karli@bearlakecamp.com) - has email
[John Scheiber](mailto:karli@bearlakecamp.com) - WRONG email
[Kyle Campbell](mailto:karli@bearlakecamp.com) - WRONG email

Analysis: Staff names formatted as links but missing hrefs or have wrong emails
Current: Titles formatted as empty links
Fix: Add correct mailto links, verify against Keystatic staff schema
```

**Cleanup Strategy:**

1. **Immediate fixes (BLOCKING):**
   - Remove HTML comments from /partners links in Home.mdoc
   - Fix email addresses in About.mdoc (verify correct addresses)
   - Convert session registration links to use frontmatter URL or remove

2. **Component-driven fixes (depends on REQ-207):**
   - FAQ accordion links: convert to accordion component (no href needed)
   - Position detail links: convert to expandable cards

3. **Content page dependencies:**
   - /partners page: create page or update links
   - Confirm registration URLs with Monty/business team

**Test Scenarios:**
1. Empty href: converted to plain text or proper link
2. HTML comment in URL: removed (breaks URL)
3. Wrong email: corrected against schema
4. Registration links: updated with actual URL
5. FAQ links: converted to accordion (no href)

---

#### AC-206.3: HTML Comment Removal (Critical)
**Requirement:** All HTML comments removed from content

**Given:** 4 HTML comments found in Home.mdoc
**When:** Running content cleanup script
**Then:** Comments are completely removed:

**Comments Found:**
```markdown
Home.mdoc Lines 49-55:
<!-- TBD: Partners page not migrated yet --> (appears 4 times)

Current effect: Breaks URL parsing, appears in rendered output
Example broken URL: /partners  <!-- comment -->/#section
```

**Removal Strategy:**
1. Find all `<!-- ... -->` patterns in markdown
2. Remove completely (no placeholder text)
3. Report removed comments to console
4. Option: migrate comments to separate `.notes.md` file for future reference

**Test Scenarios:**
1. Single-line comment: removed
2. Multi-line comment: removed
3. Comment in URL: removed (fixes URL)
4. Nested comments: handled correctly

---

#### AC-206.4: Image Filename Cleaning (Refined)
**Requirement:** Remove WordPress artifacts from image filenames

**Given:** Images with WordPress-generated filenames
**When:** Running content cleanup script
**Then:** Filenames are simplified:

**Filename Patterns Found:**

| File | Current | Issue | Fixed |
|------|---------|-------|-------|
| summer-camp.mdoc:85 | `DSC_0001-23-scaled-e1732560501258-896x1024.jpg` | WordPress scale suffix, timestamp, dimensions | `DSC_0001.jpg` |
| cabins.mdoc:18 | `DSC_0452-scaled.jpg` | WordPress scale suffix | `DSC_0452.jpg` |
| cabins.mdoc:28 | `DSC_0448-600x400.jpg` | WordPress dimensions suffix | `DSC_0448.jpg` |
| cabins.mdoc:28 | `DSC_0457-600x400.jpg` | WordPress dimensions suffix | `DSC_0457.jpg` |
| summer-staff.mdoc:22-27 | `Other-promo-5-150x150.jpg` | WordPress thumbnail suffix | `Other-promo-5.jpg` |
| summer-staff.mdoc:22-27 | Various `150x150.jpg` files | WordPress thumbnail suffix | Keep base name only |
| Home.mdoc:17-22 | `e1731002421710-150x150.jpg` | WordPress timestamp and thumbnail | Keep base name only |
| Home.mdoc:31-43 | Multiple with timestamp-qwnt... | WordPress artifacts | Clean to base name |
| about.mdoc:63-96 | PNG files with IDs | WordPress optimization IDs | Keep base name only |

**Cleaning Rules:**
1. Remove `-scaled` suffix
2. Remove `-{TIMESTAMP}` suffixes (WordPress uploads add these)
3. Remove dimension suffixes like `-600x400`, `-150x150`, `-896x1024`
4. Remove query strings: `?param=value`
5. Keep only: base filename + extension

**Tool Implementation:**
- Script scans all .mdoc files
- Finds image paths matching `![...](/...)`
- Identifies WordPress artifacts using regex patterns
- Suggests replacements (confirm before applying)
- Updates image paths in place

**Edge Cases:**
- Some WordPress naming might be intentional (e.g., `-hero` suffix) → verify before removal
- Missing image files after cleanup → log warning, investigate
- Relative vs absolute paths: preserve as-is

**Test Scenarios:**
1. Scaled suffix: removed
2. Timestamp suffix: removed
3. Dimension suffix: removed
4. Clean filename: left unchanged
5. Missing file after cleanup: logged as warning

---

#### AC-206.5: Markdown Formatting Consistency (Refined)
**Requirement:** Consistent heading hierarchy, spacing, and formatting

**Given:** 5 .mdoc files with inconsistent formatting
**When:** Running content analysis & cleanup
**Then:** Formatting is standardized:

**Issues Found:**

| File | Issue | Example | Fix |
|------|-------|---------|-----|
| summer-camp.mdoc:33 | Missing space in markdown | `the**grade camper will be going into**in` | Add space: `the **grade camper will be going into** in` |
| summer-camp.mdoc:21 | Inline emphasis inconsistency | `we_want_to be` | Use asterisks: `we *want* to be` |
| summer-camp.mdoc:105-112 | Malformed heading/link nesting | `## [[ [text]() ]]` | Flatten to: `## Text` with link on separate line |
| cabins.mdoc:19 | Missing heading before section | Content starts without h3 | Add h3 heading |
| summer-staff.mdoc:47 | Empty heading | `### \n[text]()` | Move content to proper heading |
| Home.mdoc:29-31 | Inconsistent link placement | Link on same line as text | Separate or reformat |
| about.mdoc:65 | Staff role without heading | Title as link without h4 | Convert to proper h4 heading |

**Formatting Rules to Apply:**
1. Consistent heading levels: max one `#` per page (reserved for title)
2. Section headings: use `##`, subsections: use `###` (no deeper)
3. Bold/italic: use `**bold**` and `*italic*` (not underscores)
4. Links on separate lines: if link is primary element, not inline
5. Proper spacing: blank line before/after major elements
6. No nested markup confusion: `** [ text ]() **` → fix to `[**text**](url)`

**Spacing Standards:**
```markdown
# Title (from frontmatter)

## Section Heading

Paragraph content here.

- List item 1
- List item 2

## Another Section

More content.
```

**Test Scenarios:**
1. Inconsistent emphasis: standardized
2. Missing spaces in markup: fixed
3. Nested/malformed markup: flattened
4. Heading hierarchy: corrected
5. Section spacing: normalized

---

#### AC-206.6: Content Validation Script (New)
**Requirement:** Automated script to detect and report content issues

**Given:** All 5 .mdoc files in content/pages
**When:** Running `npm run validate-content` or as pre-commit hook
**Then:** Script outputs report of issues:

**Script Location:** `scripts/validate-content.ts`

**Validation Checks Performed:**

```typescript
interface ContentIssue {
  file: string;
  line: number;
  type: 'broken-link' | 'empty-href' | 'html-comment' | 'image-issue' | 'heading-hierarchy' | 'youtube-url' | 'xss-risk';
  severity: 'error' | 'warning' | 'info';
  message: string;
  suggestion?: string;
}
```

**Checks Implemented:**

1. **Broken Links (ERROR)**
   - Pattern: `\[([^\]]+)\]\(\s*\)` (empty parentheses)
   - Output: Line number, link text, suggestion to fix
   - Example: `[ERROR] summer-camp.mdoc:37 - Empty link [Primary Overnight (2nd-3rd) - June 4-5]() → Add URL or convert to plain text`

2. **HTML Comments (ERROR)**
   - Pattern: `<!--.*?-->`
   - Output: Line number, comment content (first 50 chars)
   - Example: `[ERROR] Home.mdoc:49 - HTML comment found: "TBD: Partners page..." → Remove comment`

3. **YouTube URLs (WARNING)**
   - Pattern: `youtube.com|youtu.be`
   - Check: Tracking params, timestamp format
   - Output: Suggestions for cleanup
   - Example: `[WARNING] summer-camp.mdoc:18 - YouTube URL has tracking params: "?si=..." → Use clean format`

4. **Image Issues (WARNING)**
   - Pattern: `!\[.*?\]\((.*?)\)`
   - Check: Alt text present, WordPress artifacts in filename, missing files
   - Output: Line number, image path, issue details
   - Example: `[WARNING] summer-camp.mdoc:85 - Image filename has WordPress artifacts: "scaled-e1732560501258" → Rename to DSC_0001.jpg`

5. **Heading Hierarchy (WARNING)**
   - Pattern: `^#+\s`
   - Check: Sequence, skipped levels, multiple h1s
   - Output: Line number, current/expected level
   - Example: `[WARNING] summer-camp.mdoc:26 - Heading hierarchy issue: h3 found before h2 → Normalize to h2`

6. **Link URL Issues (INFO)**
   - Pattern: `\[([^\]]+)\]\(([^)]+)\)`
   - Check: Absolute URLs where relative expected, malformed URLs
   - Output: Line number, URL, recommendation
   - Example: `[INFO] Home.mdoc:49 - Link contains HTML comment in URL → Remove comment`

7. **Code Quality Issues (INFO)**
   - Missing metadata in frontmatter
   - Incorrect field types
   - Missing required frontmatter

**Script Output Format:**

```
=== Content Validation Report ===
Generated: 2025-11-20 14:30:00

Files Scanned: 5
Total Issues Found: 47
  Errors (must fix): 13
  Warnings (should fix): 18
  Info (nice to have): 16

=== ERRORS ===
[summer-camp.mdoc] Line 37: Empty link [Primary Overnight (2nd-3rd) - June 4-5]()
  Suggestion: Add URL like https://www.ultracamp.com/... or convert to plain text

[Home.mdoc] Line 49: HTML comment in URL
  Current: /partners  <!-- TBD: Partners page not migrated yet -->/#giving
  Fixed: /partners/#giving (comment removed)

... (11 more errors)

=== WARNINGS ===
[summer-camp.mdoc] Line 18: YouTube URL with tracking params
  Current: https://youtu.be/8N9Yeup1xVA?si=4KXXFghbmpg0j46-
  Suggestion: https://youtu.be/8N9Yeup1xVA

... (17 more warnings)

=== INFO ===
[cabins.mdoc] Line 19: No heading before "Features" section
  Suggestion: Add ### heading for better structure

... (15 more info messages)

Exit Code:
  0: All errors fixed (only warnings/info remain)
  1: Errors found (must fix before deploy)
  2: Critical issues (content might not render)
```

**Script Usage:**

```bash
# Full report
npm run validate-content

# Specific file
npm run validate-content -- content/pages/summer-camp.mdoc

# With auto-fix for safe issues
npm run validate-content -- --fix

# Dry-run (show changes but don't apply)
npm run validate-content -- --dry-run

# Export report as JSON
npm run validate-content -- --json > report.json
```

**Auto-Fix Capabilities:**
- Remove HTML comments
- Fix YouTube URLs (strip tracking params)
- Add missing spaces in markdown
- Normalize emphasis markers
- Format heading hierarchy
- NOT: Fix broken links (must be manual)

**Pre-Commit Hook:**
```bash
# .husky/pre-commit
npm run validate-content || exit 1
```

**Test Scenarios:**
1. Script finds all broken links
2. Script detects HTML comments
3. Script reports image issues
4. Script suggests fixes
5. Script respects --fix flag
6. Exit code indicates severity
7. JSON export available for CI/CD

---

#### AC-206.7: Content Standards Documentation (New)
**Requirement:** Clear documentation for future content migrations

**Given:** Migration complete
**When:** New content added to site
**Then:** Contributors follow standards in documented style guide

**Document Location:** `docs/CONTENT-STANDARDS.md`

**Content Includes:**

1. **Markdown Style Guide**
   - Preferred markup (** over __, * over _)
   - Heading hierarchy rules
   - Link formatting best practices
   - Image alt text requirements
   - Code block syntax

2. **Keystatic Schema Requirements**
   - Required frontmatter fields
   - Valid template types (program, facility, staff, standard, homepage)
   - Field format examples
   - SEO metadata requirements

3. **Content Migration Checklist**
   - Validate URLs
   - Check links
   - Remove HTML comments
   - Clean image filenames
   - Verify heading hierarchy
   - Test rendering

4. **Common Pitfalls**
   - Empty link hrefs
   - HTML comments in content
   - WordPress artifacts in filenames
   - Inconsistent heading levels
   - Missing alt text on images

5. **Examples**
   - Good example page: properly formatted
   - Bad example page: common errors
   - Before/after comparisons

6. **Tools & Scripts**
   - How to run content validator
   - How to auto-fix safe issues
   - How to report bugs

**Test Scenarios:**
1. Documentation exists and is accessible
2. Examples are clear and accurate
3. Checklist covers all major issues
4. Tools referenced are documented

---

### Cross-Page Content Analysis

**Interconnected Issues:**
- 3 pages have broken registration links (need single unified approach)
- 2 pages have FAQ accordion links (should use same component)
- 4 pages have image filename artifacts (systematic cleanup needed)
- All 5 pages have some YouTube handling (need consistent approach)

**Recommended Cleanup Order:**
1. **Phase 1 (Critical - Blocking Rendering):**
   - Remove HTML comments from Home.mdoc (blocks URL parsing)
   - Fix email addresses in About.mdoc
   - Remove/fix broken links in Home.mdoc

2. **Phase 2 (High - Breaking Content):**
   - Clean YouTube URLs (all files)
   - Fix image filenames (all files)
   - Normalize heading hierarchy (all files)

3. **Phase 3 (Medium - Enhancement):**
   - Convert FAQ/position links to components (depends on REQ-207)
   - Add missing section headings
   - Standardize spacing and formatting

---

## Part 3: New Requirements Discovered

### REQ-208: Content Validation & Sanitization
**Story Points:** 1 SP (coding), 0.5 SP (testing)
**Priority:** P0 (Blocking)
**Status:** NEW

**Description:** Automated content validation script and XSS sanitization for markdown rendering

**Acceptance Criteria:**
- [ ] Content validator script detects all issue types
- [ ] Script runs as pre-commit hook
- [ ] Auto-fix mode for safe issues (comments, URLs, formatting)
- [ ] Manual-review mode for unsafe issues (broken links, hierarchy)
- [ ] JSON export for CI/CD integration
- [ ] Exit codes indicate severity
- [ ] All content passes validation before deploy

**Dependencies:**
- Depends on: REQ-206 (content cleanup)
- Supports: REQ-201 (markdown rendering security)
- Blocks: Deployment until validation passes

---

### REQ-209: Content Standards Documentation
**Story Points:** 0.5 SP (coding)
**Priority:** P1 (High)
**Status:** NEW

**Description:** Living documentation for content style, migration checklist, and common pitfalls

**Acceptance Criteria:**
- [ ] Style guide covers all markdown features
- [ ] Keystatic schema requirements documented
- [ ] Migration checklist available and actionable
- [ ] Common pitfalls listed with solutions
- [ ] Good/bad examples provided
- [ ] Tool usage documented
- [ ] Version controlled in git
- [ ] Accessible in project wiki/docs

---

### REQ-210: Email Address Verification
**Story Points:** 0.2 SP (coding)
**Priority:** P0 (Critical)
**Status:** NEW

**Description:** Verify and fix incorrect email addresses in staff bios

**Issues Found:**
- About.mdoc Lines 78, 90, 96: Wrong email addresses assigned to Jared, John, Kyle

**Acceptance Criteria:**
- [ ] All staff emails correct and verified
- [ ] Emails match Keystatic staff schema
- [ ] Mailto links functional and tested
- [ ] Staff verified updates are correct

---

## Part 4: Summary of Edge Cases & New Test Scenarios

### REQ-201 New Test Suite (7 new scenario categories)

**YouTube Embed Tests:**
1. URL with tracking params stripped
2. URL with timestamp preserved
3. Playlist URL handling
4. Malformed URL gracefully rejected
5. URL inside code block not embedded
6. Two consecutive URLs converted separately
7. YouTube URL with start/end time range

**Link Tests:**
1. Empty href rendered as plain text
2. JavaScript URL blocked
3. External link has rel="noopener noreferrer"
4. Anchor link preserved
5. Very long URL ellipsized with tooltip
6. Special characters in URL encoded

**Markdown Structure Tests:**
1. Code block preserves formatting, no YouTube embed
2. Table with headers renders with scope attributes
3. Blockquote with multiple paragraphs each in separate `<p>`
4. Nested blockquotes with indentation
5. Heading hierarchy validated, no h3 before h2
6. Inline markup combined (bold + link)

**Security Tests:**
1. Script tags removed
2. Event handlers stripped
3. Data URL in src blocked
4. JavaScript protocol blocked
5. CSS expressions sanitized
6. XSS payload fails validation

---

### REQ-206 New Test Suite (6 new scenario categories)

**YouTube URL Cleanup Tests:**
1. Tracking param stripped: `?si=...` removed
2. Timestamp preserved: `?t=30` kept
3. Playlist ID preserved: `&list=...` kept
4. Format standardized: youtu.be/ID preferred
5. URL validated after cleanup
6. Playlist URL documented as P2

**Broken Link Fixing Tests:**
1. Empty href detected
2. HTML comment in URL removed
3. Session registration links updated with actual URL
4. FAQ links converted to component (no href)
5. Email links verified against schema
6. /partners links handled (P2 for page creation)

**HTML Comment Removal Tests:**
1. Single-line comment removed
2. Multi-line comment removed
3. Comment in URL removed (fixes URL)
4. Comment count reported
5. Removed comments logged to console
6. Option to export comments to .notes file

**Image Filename Cleanup Tests:**
1. `-scaled` suffix removed
2. `-{TIMESTAMP}` suffix removed
3. `-600x400` dimension suffix removed
4. Clean filename unchanged
5. Report of all changes provided
6. Dry-run mode available

**Content Validator Script Tests:**
1. Script finds all broken links
2. Script detects all HTML comments
3. Script reports image issues
4. Script validates heading hierarchy
5. Script exits with correct code (0, 1, or 2)
6. JSON export available
7. --fix flag applies safe changes only

**Content Standards Tests:**
1. Documentation exists and is accurate
2. Examples are clear and helpful
3. Checklist covers all common issues
4. Style guide is prescriptive not descriptive
5. Tools are properly documented

---

## Part 5: Updated Story Point Estimates

| Requirement | Old SP | New SP | Reason |
|-------------|--------|--------|--------|
| REQ-201: Markdown Rendering | 5 SP | 6 SP | +1 SP for security/sanitization, edge cases |
| REQ-206: Content Cleanup | 2 SP | 3 SP | +1 SP for validation script, documentation |
| **Phase 1 Total** | **8 SP** | **10 SP** | Additional scope for quality gates |

**New Requirements:**
- REQ-208: Content Validation Script: 1.5 SP
- REQ-209: Content Standards Doc: 0.5 SP
- REQ-210: Email Address Fix: 0.2 SP

**Total Additional:** 2.2 SP → Phase 1 extends to 12.2 SP (recommend 13 SP rounded)

---

## Part 6: Risk Mitigation for Discovered Issues

### Risk: HTML Comments Break URL Parsing
**Severity:** Critical
**Found:** Home.mdoc lines 49-55
**Impact:** Links to /partners page won't work
**Mitigation:**
- Immediate fix: Remove all HTML comments
- Add pre-commit validation to prevent
- Lint rule: forbid HTML comments in content

### Risk: 28 Broken Registration Links
**Severity:** High
**Found:** summer-camp.mdoc
**Impact:** Users can't register for camp
**Mitigation:**
- Verify actual registration URL with stakeholder
- Update all registration links atomically
- Add unit test to verify URLs are valid
- Automate URL updates in future (env var?)

### Risk: Incorrect Staff Email Addresses
**Severity:** High
**Found:** about.mdoc, staff schema mismatch
**Impact:** Contact information is wrong
**Mitigation:**
- Verify emails against canonical staff list
- Add schema validation for email format
- Add test to validate all emails are functional
- Add process: review staff changes before deploy

### Risk: Keystatic DocumentRenderer Limitations
**Severity:** Medium
**Impact:** May need fallback to react-markdown
**Mitigation:**
- Phase 1 Wave 1A: Research DocumentRenderer thoroughly
- Have react-markdown ready as backup
- Test with actual content early
- Pin decision before Phase 1B starts

### Risk: Content Cleanup Requires Manual Review
**Severity:** Medium
**Impact:** Auto-fix insufficient, manual work needed
**Mitigation:**
- Create clear prioritization (critical/high/medium)
- Implement dry-run/review mode first
- Start with critical issues only
- Review with stakeholder before applying changes

---

## Part 7: Implementation Timeline

### Phase 1A: Analysis & Research (1 day)
- Finalize markdown rendering library choice
- Research Keystatic DocumentRenderer API
- Complete content validation script design
- Verify YouTube embed best practices

### Phase 1B: Test Writing (1 day)
- Write 50+ test cases for REQ-201
- Write 30+ test cases for REQ-206
- Write validation script unit tests
- All tests RED at end of day

### Phase 1C: Implementation (2 days)
- Implement DocumentRenderer with YouTube support
- Implement content validation script
- Fix all content issues (manual + script)
- Make all tests GREEN

### Phase 1D: Review & Documentation (0.5 day)
- PE review of markdown implementation
- Code quality audit
- Write content standards documentation
- Pre-deployment validation

**Total Phase 1: 4.5 days (realistic with context switches)**

---

## Conclusion

**Key Findings:**

1. **REQ-201 is substantially more complex** than estimated:
   - 7 YouTube URL formats (vs 2 documented)
   - Multiple markdown edge cases (code, tables, blockquotes)
   - XSS/sanitization requirements critical
   - Estimate: 6 SP (was 5 SP)

2. **REQ-206 has significant hidden scope:**
   - 28+ broken links to fix
   - 4 HTML comments breaking URLs
   - 3 incorrect email addresses
   - 15+ image filename cleanups
   - Validation script needed
   - Documentation required
   - Estimate: 3 SP (was 2 SP)

3. **New requirements discovered:**
   - REQ-208: Content validation script (1.5 SP)
   - REQ-209: Content standards doc (0.5 SP)
   - REQ-210: Email address verification (0.2 SP)

4. **Phase 1 revised total: 13 SP** (was 8 SP, +5 SP increase)

**Recommendation:**
- Proceed with Phase 1A (research) immediately
- Refine delivery timeline based on analysis results
- Consider splitting content cleanup (REQ-206) into separate stories if timeline tight
- Prioritize HTML comment removal (blocking issue)
- Get stakeholder confirmation on registration links before implementation

---

**Document Status:** Ready for Requirements Sign-Off
**Next Step:** QPLAN to schedule execution, refine timeline estimates
