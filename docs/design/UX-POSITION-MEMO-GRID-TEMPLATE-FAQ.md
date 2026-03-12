## UX Designer Position Memo: Grid Template & FAQ Inline Editing

**Date:** 2025-12-20
**Recommendation:** Implement flexible grid component with visual content options and inline FAQ editing for improved CMS editor experience

---

## Executive Summary

The current Keystatic CMS implementation requires three UX enhancements to improve the editor experience for Bear Lake Camp content managers:

1. **Summer Camp Sessions Grid Template**: A 2-column responsive grid allowing editors to mix images, color blocks, and text content
2. **FAQ Inline Editing**: Display actual question/answer text in CMS instead of generic "faqItem" blocks
3. **Work at Camp Template**: Same grid approach as Summer Camp Sessions

**Current Pain Points:**
- Editors cannot create visual grid layouts without diving into custom components
- FAQ editing requires clicking into each item to see content (slow, poor scanability)
- No color picker for background customization (limited to preset select options)
- Template flexibility is constrained by predefined conditional fields

---

## User Flow: CMS Editor Journey

### Current Flow (FAQ Editing)
```
Editor opens page in Keystatic
  ↓
Sees faqAccordion component wrapper
  ↓
Clicks "Add FAQ Item"
  ↓
Modal opens with question/answer fields
  ↓
Types question: "What should campers bring?"
  ↓
Types answer: "Sleeping bag, toiletries..."
  ↓
Saves and closes modal
  ↓
PROBLEM: CMS shows "faqItem" block (not the actual question text)
  ↓
To edit: Must click into each faqItem to see what it contains
```

**Issues:**
- No visual scanning of FAQ content
- Cognitive overhead: "Which faqItem was the packing list question?"
- Slow editing workflow (click → read → close → repeat)

### Improved Flow (Inline FAQ Editing)
```
Editor opens page in Keystatic
  ↓
Sees faqAccordion component
  ↓
Sees list of FAQ items with visible questions:
  - "What should campers bring?" (editable inline)
  - "What is your refund policy?" (editable inline)
  - "Is financial assistance available?" (editable inline)
  ↓
Editor clicks on question text → edits directly
  ↓
Editor clicks "expand" icon → sees answer text → edits directly
  ↓
Saves once (auto-save on blur)
```

**Benefits:**
- Visual scanability: See all questions at a glance
- Faster editing: No modal clicks required
- Better organization: Can reorder by dragging visible questions
- Reduced errors: Editors can see what they're editing

---

## User Flow: Grid Template Editor Experience

### Desired Editor Flow (Summer Camp Sessions Page)
```
Editor opens "Summer Camp" page
  ↓
Selects template: "Grid Layout"
  ↓
Clicks "Add Grid Item"
  ↓
Modal opens with options:
  [ ] Image (full-bleed)
  [ ] Color Block (with hex picker)
  [ ] Text Card (with content editor)
  ↓
Option 1: Image
  - Upload image → Drag to reposition crop
  - Alt text field (required for accessibility)
  ↓
Option 2: Color Block
  - Hex color picker: #4d8401 (forest green)
  - Preview shows actual color
  - Optional: Overlay text (centered)
  ↓
Option 3: Text Card
  - Rich text editor (headings, lists, links)
  - Background color: White / Light Gray / Transparent
  - Padding: Small / Medium / Large
  ↓
Saves grid item
  ↓
CMS shows visual preview in 2-column grid
  ↓
Editor can drag-and-drop to reorder items
```

**Activation Metric:**
Editor is activated when they successfully create a grid layout with ≥4 items (2 images, 1 color block, 1 text card) within first 10 minutes of using the template.

---

## Key UX Principles

### 1. Progressive Disclosure
**Principle:** Show complexity only when needed.

**Application:**
- Grid template starts with empty state: "Add Your First Grid Item"
- Item type selection (Image/Color/Text) appears in simple modal
- Advanced options (crop, overlay text) hidden in expandable "Advanced" section

**Current Pattern (Existing):**
```typescript
// keystatic.config.ts:299 - Conditional template fields
templateFields: fields.conditional(
  fields.select({
    label: 'Page Template',
    options: [
      { label: 'Standard Page', value: 'standard' },
      { label: 'Homepage', value: 'homepage' },
      // ...
    ],
  }),
  { /* fields appear based on selection */ }
)
```

**New Pattern (Grid Template):**
```typescript
gridItems: fields.array(
  fields.conditional(
    fields.select({
      label: 'Item Type',
      options: [
        { label: 'Image', value: 'image' },
        { label: 'Color Block', value: 'color' },
        { label: 'Text Card', value: 'text' },
      ],
    }),
    {
      image: fields.object({ /* image fields */ }),
      color: fields.object({ /* color picker + overlay */ }),
      text: fields.object({ /* rich text editor */ }),
    }
  )
)
```

### 2. Recognition Over Recall
**Principle:** Users should recognize options rather than remember syntax.

**Application:**
- **FAQ Editing:** Show actual question text, not "faqItem #3"
- **Color Picker:** Visual color preview, not just hex code
- **Grid Preview:** Live preview of 2-column layout in CMS

**Example (FAQ Recognition):**
```
Current (Recall):
  - faqItem
  - faqItem
  - faqItem

Improved (Recognition):
  - "What should campers bring?" [edit] [delete]
  - "What is your refund policy?" [edit] [delete]
  - "Is financial assistance available?" [edit] [delete]
```

### 3. Consistency
**Principle:** Reuse existing patterns from the codebase.

**Existing Patterns to Leverage:**
- **Array Fields with itemLabel:** Already used in navigation menu (line 100), program cards (line 145), gallery images (line 344)
- **Image Fields:** Existing pattern for gallery images (line 543-556)
- **Select Fields:** Existing color selection for `section` component (line 618-627)

**Proposed Enhancement:**
- Replace `fields.select` for colors with `fields.text` + custom UI for hex picker
- Leverage existing `itemLabel` pattern for FAQ inline display

### 4. Simplicity
**Principle:** Default to the most common use case.

**Grid Template Defaults:**
- Default layout: 2 columns (most common for camp websites)
- Default item type: Image (most visual)
- Default color: Forest green (#4d8401 from theme)
- Default text card: White background, medium padding

**Rationale:** 80% of editors will use 2-column image grids. Make this the path of least resistance.

---

## Activation Metric: Editor Success

**Definition:** Editor is activated when they successfully create and publish content using new templates within first editing session.

**Measurement:**
```
Activated Editor = {
  (created ≥1 grid item OR edited ≥1 FAQ inline) AND
  (saved changes) AND
  (viewed preview) AND
  (session duration < 15 minutes)
}
```

**Target:** 80% of editors activated on first use (high bar, but these are simple templates).

**Current (Estimated):** Unknown (no CMS usage analytics in place).

---

## Accessibility Considerations

### Color Picker (WCAG 2.1 AA Compliance)

**Requirement:** Color contrast must meet 4.5:1 for text on colored backgrounds.

**Implementation:**
```typescript
// Hex color field with validation
backgroundColor: fields.text({
  label: 'Background Color (Hex)',
  description: 'E.g., #4d8401 for forest green',
  validation: {
    pattern: /^#[0-9A-Fa-f]{6}$/,
    message: 'Must be valid hex color (e.g., #4d8401)',
  },
  defaultValue: '#4d8401', // Forest green from theme
})
```

**Editor Warning (Future Enhancement):**
- Calculate contrast ratio when overlay text is added
- Show warning if contrast < 4.5:1
- Suggest text color adjustment (white vs. dark)

**Existing Pattern:** Currently uses preset colors (line 618-627), which are pre-validated for contrast. Moving to hex picker requires contrast validation.

---

### FAQ Inline Editing (Keyboard Navigation)

**Requirement:** All editing actions must be keyboard-accessible (WCAG 2.1.1 - Keyboard).

**Implementation:**
- Tab order: Question field → Answer field → Expand/Collapse button → Reorder drag handle
- Enter key: Expand/collapse answer
- Arrow keys: Navigate between FAQ items
- Space + Arrow: Drag to reorder

**Existing Pattern:** Current `faqItem` (line 990-1009) is inline (`kind: 'inline'`), which doesn't support visual nesting. Needs upgrade to wrapper-style for better UX.

**Proposed Change:**
```typescript
faqItem: {
  label: 'FAQ Item',
  kind: 'wrapper', // Changed from 'inline'
  schema: {
    question: fields.text({
      label: 'Question',
      description: 'Displayed as accordion trigger',
    }),
    answer: fields.markdoc({ // Support rich text answers
      label: 'Answer',
      components: {}, // Allow inline formatting
    }),
  },
}
```

**Benefit:** Wrapper mode allows answer to be rich text (bold, links, lists) instead of plain multiline text.

---

## Visual Hierarchy: Grid Template Design

### Desktop Layout (2-Column Grid)
```
┌─────────────┬─────────────┐
│   Image 1   │  Color Blk  │  Row 1
│  (full)     │   #4d8401   │
├─────────────┼─────────────┤
│  Text Card  │   Image 2   │  Row 2
│  (white bg) │  (full)     │
├─────────────┴─────────────┤
│      Image 3 (full-width) │  Row 3 (1 item spans 2 cols)
└───────────────────────────┘
```

**Grid Behavior:**
- 2 items per row (default)
- Single item spans full width
- Responsive: 1 column on mobile (<768px)

### Mobile Layout (1-Column Stack)
```
┌─────────────┐
│   Image 1   │
├─────────────┤
│  Color Blk  │
├─────────────┤
│  Text Card  │
├─────────────┤
│   Image 2   │
└─────────────┘
```

**Touch Targets:**
- Drag handles: 48px × 48px (exceeds 44px WCAG minimum)
- Edit buttons: 44px × 44px
- Color picker swatches: 56px × 56px (comfortable tap area)

**Existing Pattern:** `CardGrid` component (line 34) already implements responsive 2-column grid:
```tsx
<div className={`grid grid-cols-1 ${gridColsClass} gap-6 my-8`}>
```

**Reuse Strategy:** Extend `CardGrid` to accept mixed content types (not just cards).

---

## Mobile Responsiveness Approach

### Breakpoint Strategy (Consistent with Existing Codebase)

**Current Breakpoints (from Tailwind config):**
- `sm`: 640px (small tablets)
- `md`: 768px (tablets, 2-column grid starts here)
- `lg`: 1024px (desktop navigation shows here)
- `xl`: 1280px (wide layouts)

**Grid Template Breakpoints:**
```tsx
// Mobile: 1 column, full-width images
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">

// Color blocks: Larger padding on mobile for readability
<div className="p-8 md:p-12 min-h-[300px] md:min-h-[400px]">

// Text cards: Compact on mobile
<div className="p-6 md:p-8 text-base md:text-lg">
```

**Rationale:** Mobile users should see larger, simpler blocks. Desktop users can handle denser 2-column layouts.

---

### Image Handling (Performance)

**Current Pattern (from codebase):**
```tsx
// components/OptimizedImage.tsx - Next.js Image with lazy loading
<Image
  src={src}
  alt={alt}
  width={800}
  height={600}
  className="object-cover"
  loading="lazy"
  sizes="(max-width: 768px) 100vw, 50vw" // Responsive sizing
/>
```

**Grid Template Image Optimization:**
- Mobile: Load 800px width (full viewport)
- Desktop: Load 1200px width (half viewport in 2-column grid)
- Aspect ratio: 4:3 default (can be customized per image)
- Format: WebP with JPEG fallback (Next.js automatic)

**Existing Implementation:** `OptimizedImage` component already handles this (lines 1-39 in components/OptimizedImage.tsx).

---

## Editor Experience: Color Picker Design

### Option 1: Native HTML Color Input (Simplest)
```tsx
backgroundColor: fields.text({
  label: 'Background Color',
  description: 'Choose a color or enter hex code',
  defaultValue: '#4d8401',
})
```

**Pros:**
- Native browser color picker (works on all devices)
- Fallback to hex text input (power users can type)
- Zero dependencies

**Cons:**
- Limited palette (no preset brand colors)
- Inconsistent UI across browsers
- No contrast validation built-in

---

### Option 2: Preset Palette + Hex Override (Recommended)
```tsx
colorOption: fields.conditional(
  fields.select({
    label: 'Background Color',
    options: [
      { label: '🌲 Forest Green', value: 'preset-forest' },
      { label: '🏔️ Lake Blue', value: 'preset-lake' },
      { label: '🏕️ Clay Brown', value: 'preset-clay' },
      { label: '⚪ White', value: 'preset-white' },
      { label: '🎨 Custom Hex', value: 'custom' },
    ],
    defaultValue: 'preset-forest',
  }),
  {
    'preset-forest': fields.empty(), // Uses #4d8401
    'preset-lake': fields.empty(),   // Uses #3b82f6
    'preset-clay': fields.empty(),   // Uses #d97706
    'preset-white': fields.empty(),  // Uses #ffffff
    'custom': fields.text({
      label: 'Hex Color Code',
      validation: { pattern: /^#[0-9A-Fa-f]{6}$/ },
    }),
  }
)
```

**Pros:**
- Guided: 80% of editors use presets (brand consistency)
- Flexible: Advanced users can enter custom hex
- Accessible: Preset colors pre-validated for contrast

**Cons:**
- More complex schema (conditional field)
- Requires color mapping in component

**Recommendation:** Option 2 (Preset + Custom) balances simplicity with flexibility.

---

### Option 3: Full Color Picker Component (Future Enhancement)
```tsx
// Custom React component in Keystatic
backgroundColor: fields.custom({
  label: 'Background Color',
  Component: ColorPickerField, // Custom UI with swatches + hex input
  defaultValue: '#4d8401',
})
```

**Pros:**
- Best UX (visual swatches, live preview)
- Can include contrast checker
- Custom validation

**Cons:**
- Requires Keystatic custom field development
- Heavier implementation (3-5 SP vs. 0.5 SP for Option 2)

**Confidence:** Low (Keystatic custom fields are experimental, may have limitations).

**Decision:** Start with Option 2, upgrade to Option 3 if editors request it.

---

## FAQ Inline Editing: Technical Approach

### Current Implementation (Problematic)
```typescript
// keystatic.config.ts:990
faqItem: {
  label: 'FAQ Item',
  kind: 'inline', // PROBLEM: No nested content visible
  schema: {
    question: fields.text({ label: 'Question' }),
    answer: fields.text({ label: 'Answer', multiline: true }),
  },
}
```

**CMS Display:**
```
faqAccordion
  ├─ faqItem (no preview of question)
  ├─ faqItem (no preview of question)
  └─ faqItem (no preview of question)
```

---

### Improved Implementation (Inline Preview)
```typescript
faqItem: {
  label: 'FAQ Item',
  kind: 'wrapper', // Changed to wrapper for rich content
  schema: {
    question: fields.text({
      label: 'Question',
      description: 'The question displayed in the accordion trigger',
    }),
    answer: fields.markdoc({
      label: 'Answer',
      description: 'The answer content (supports formatting)',
      components: {
        // Allow basic formatting in answers
        // No complex components (keep it simple)
      },
    }),
  },
}

// In faqAccordion array configuration
items: fields.array(
  fields.object({
    question: fields.text({ label: 'Question' }),
    answer: fields.text({ label: 'Answer', multiline: true }),
  }),
  {
    label: 'FAQ Items',
    itemLabel: (props) => props.fields.question.value || 'New FAQ', // KEY CHANGE
  }
)
```

**CMS Display (Improved):**
```
FAQ Items
  ├─ "What should campers bring?" [edit] [delete] [↕️ drag]
  ├─ "What is your refund policy?" [edit] [delete] [↕️ drag]
  └─ "Is financial assistance available?" [edit] [delete] [↕️ drag]
```

**Technical Change:** The `itemLabel` function already exists in the codebase (line 604, 930). We just need to apply it to FAQ items.

**Current FAQ Collection (lines 1588-1626):**
- Uses separate FAQ collection (not inline in pages)
- Has `itemLabel` on line 1604: `itemLabel: (props) => props.fields.question.value || 'FAQ Item'`
- **Already works correctly in FAQ collection!**

**Problem:** Inline `faqItem` in page body doesn't use this pattern. Need to align page component with collection pattern.

---

### Recommended Fix: Align Inline FAQ with Collection Pattern

**Option A: Use FAQ Collection (Simpler)**
- Editor creates FAQs in centralized collection
- Page embeds FAQs by category: `{% faqList category="summer-camp" %}`
- Pros: DRY (reuse FAQs across pages), centralized editing
- Cons: Less flexible (can't have page-specific FAQs)

**Option B: Improve Inline FAQ (More Flexible)**
- Keep inline `faqAccordion` component
- Change `faqItem` from `kind: 'inline'` to wrapper
- Add `itemLabel` to array configuration
- Pros: Page-specific FAQs, editor sees questions inline
- Cons: Duplication if same FAQ used on multiple pages

**Recommendation:** Option B (Improve Inline FAQ) for page-specific content. Keep collection for global FAQs.

**Implementation:**
```typescript
// keystatic.config.ts - Update accordion component
accordion: {
  label: 'FAQ Accordion',
  description: 'Add a collapsible FAQ accordion',
  kind: 'wrapper',
  schema: {
    items: fields.array(
      fields.object({
        question: fields.text({ label: 'Question' }),
        answer: fields.text({ label: 'Answer', multiline: true }),
      }),
      {
        label: 'FAQ Items',
        itemLabel: (props) => props.fields.question.value || 'New FAQ', // Shows question text
      }
    ),
  },
},
```

**Confidence:** High (existing pattern, proven to work in FAQ collection).

---

## Risks & Mitigations

### Risk 1: Color Picker Complexity
**Problem:** Custom hex input allows invalid colors or poor contrast.

**Impact:**
- Editors create unreadable text on colored backgrounds
- Accessibility failures (WCAG 2.1 AA violation)
- Brand inconsistency (random colors instead of theme palette)

**Mitigation:**
1. Default to preset palette (80% use case)
2. Add hex validation regex: `/^#[0-9A-Fa-f]{6}$/`
3. Future: Add contrast checker (compare text color to background)
4. Documentation: "Use forest green (#4d8401) or lake blue (#3b82f6) for brand consistency"

**Confidence:** Medium (validation prevents invalid input, but not poor UX choices).

---

### Risk 2: Grid Layout Mobile Performance
**Problem:** Large images in 2-column grid cause slow mobile load.

**Impact:**
- Slow page load → higher bounce rate
- Poor Core Web Vitals (LCP, CLS)
- Data usage concerns for users on cellular

**Mitigation:**
1. Use existing `OptimizedImage` component (already handles responsive sizing)
2. Lazy load grid items below fold: `loading="lazy"`
3. Image compression validation: Warn editor if upload >500KB
4. Responsive sizes attribute: `sizes="(max-width: 768px) 100vw, 50vw"`

**Confidence:** High (existing infrastructure supports this).

---

### Risk 3: Editor Confusion (Too Many Options)
**Problem:** Grid template offers 3 item types × multiple options per type = decision paralysis.

**Impact:**
- Editors spend 10+ minutes creating first grid item (slow activation)
- Editors stick with defaults (underutilize flexibility)
- Editors request simpler template

**Mitigation:**
1. Progressive disclosure: Start with item type selection only
2. Smart defaults: Image (most common), 2-column grid, forest green color
3. Example content: Seed new templates with placeholder grid
4. Documentation: "Grid Template Quick Start" guide with screenshots

**Confidence:** Medium (requires user testing with actual editors).

---

## Implementation Plan: Phased Approach

### Phase 1: FAQ Inline Editing (Quick Win, 2 SP)
**Goal:** Improve editor experience with minimal code changes.

**Tasks:**
1. Update `accordion` component schema to use `itemLabel` (0.5 SP)
2. Test inline question display in Keystatic CMS (0.5 SP)
3. Update documentation with editor workflow (0.5 SP)
4. Validate accessibility (keyboard navigation) (0.5 SP)

**Confidence:** High (existing pattern, low risk).

---

### Phase 2: Grid Template (Foundation, 8 SP)
**Goal:** Implement basic 2-column grid with image support.

**Tasks:**
1. Create `GridTemplate` component (2 SP)
   - Extends existing `CardGrid` component
   - Accepts mixed content types (image, color, text)
2. Add Keystatic schema for grid items (2 SP)
   - Conditional field for item type
   - Image upload + alt text
3. Implement responsive layout (2 SP)
   - 1 column mobile, 2 column desktop
   - Gap spacing, aspect ratios
4. Test with sample content (1 SP)
   - Create "Summer Camp Sessions" demo page
5. Accessibility validation (1 SP)
   - Touch targets, keyboard navigation, ARIA labels

**Confidence:** High (leverages existing components).

---

### Phase 3: Color Block + Text Card (Enhancement, 5 SP)
**Goal:** Add color block and text card options to grid.

**Tasks:**
1. Implement color picker (Option 2: Preset + Custom) (2 SP)
   - Conditional field: Preset vs. hex input
   - Color mapping in component
   - Preview in CMS
2. Add text card variant (2 SP)
   - Rich text editor (Markdoc)
   - Background color options
   - Padding options (small/medium/large)
3. Integration testing (1 SP)
   - Mix all 3 item types in grid
   - Mobile responsive behavior
   - Editor workflow validation

**Confidence:** Medium (color picker UX needs testing).

---

### Phase 4: Editor Documentation + Refinement (3 SP)
**Goal:** Ensure editors can use new templates independently.

**Tasks:**
1. Create "Grid Template Quick Start" guide (1 SP)
   - Screenshots of CMS workflow
   - Example layouts (2 images + 1 color block)
   - Common use cases (program pages, staff pages)
2. Record video tutorial (content creation, not dev) (1 SP)
   - "How to create a visual grid layout in 2 minutes"
3. Gather editor feedback (1 SP)
   - Observe first-time use
   - Iterate on pain points
   - Measure activation rate

**Confidence:** Medium (requires editor availability for testing).

---

## Total Story Points: 18 SP
**Breakdown:**
- Phase 1 (FAQ): 2 SP
- Phase 2 (Grid Foundation): 8 SP
- Phase 3 (Color + Text): 5 SP
- Phase 4 (Docs): 3 SP

**Timeline Estimate:** 3 weeks (assuming 1 SP = 1-2 hours of focused dev work).

**Break Strategy:**
- Sprint 1 (8 SP): Phase 1 + Phase 2 (foundation)
- Sprint 2 (10 SP): Phase 3 + Phase 4 (enhancements + docs)

---

## Success Criteria

### Editor Activation (Primary Metric)
**Target:** 80% of editors successfully create grid layout within 10 minutes of first use.

**Measurement:**
```
Success = {
  (created ≥2 grid items) AND
  (published page with grid) AND
  (session duration < 10 minutes)
}
```

### Content Quality (Secondary Metric)
**Target:** 90% of published grids meet accessibility standards.

**Checklist:**
- All images have alt text
- Color contrast ≥4.5:1 (if text on colored background)
- Grid items have semantic HTML (not generic divs)

### Editor Satisfaction (Qualitative)
**Target:** Editors report "easy" or "very easy" on post-use survey.

**Questions:**
1. How easy was it to create your first grid layout? (1-5 scale)
2. Did you find the color picker intuitive? (yes/no + feedback)
3. Would you use this template again? (yes/no + why)

---

## Appendix: Existing Component Patterns to Leverage

### 1. Array Fields with itemLabel (FAQ Preview)
**Location:** `keystatic.config.ts:100, 145, 344, 604, 930`

**Pattern:**
```typescript
items: fields.array(
  fields.object({ /* fields */ }),
  {
    label: 'Items',
    itemLabel: (props) => props.fields.name.value || 'Item', // Shows preview
  }
)
```

**Usage in FAQ:** Apply to `accordion.items` to show question text.

---

### 2. Conditional Fields (Template Selection)
**Location:** `keystatic.config.ts:299-481`

**Pattern:**
```typescript
templateFields: fields.conditional(
  fields.select({ /* template options */ }),
  {
    standard: fields.empty(),
    homepage: fields.object({ /* homepage fields */ }),
    // ...
  }
)
```

**Usage in Grid:** Apply to grid item type selection (image/color/text).

---

### 3. Image Fields (Gallery Pattern)
**Location:** `keystatic.config.ts:543-556`

**Pattern:**
```typescript
images: fields.array(
  fields.object({
    image: fields.image({
      label: 'Image',
      directory: 'public/images',
      publicPath: '/images/',
    }),
    alt: fields.text({ label: 'Alt Text' }),
    caption: fields.text({ label: 'Caption', defaultValue: '' }),
  })
)
```

**Usage in Grid:** Reuse for grid image items.

---

### 4. Color Selection (Preset Options)
**Location:** `keystatic.config.ts:618-627`

**Pattern:**
```typescript
backgroundColor: fields.select({
  label: 'Background Color',
  options: [
    { label: 'White', value: 'white' },
    { label: 'Light Gray', value: 'gray' },
    { label: 'Light Green', value: 'green' },
    // ...
  ],
  defaultValue: 'white',
})
```

**Usage in Grid:** Extend with custom hex option (conditional field).

---

### 5. Responsive Grid (CardGrid Component)
**Location:** `components/content/CardGrid.tsx:34`

**Pattern:**
```tsx
<div className={`grid grid-cols-1 ${gridColsClass} gap-6 my-8`}>
  {children}
</div>
```

**Usage in Grid Template:** Extend to accept mixed content (not just cards).

---

## Conclusion

The proposed grid template and FAQ inline editing improvements align with existing patterns in the Bear Lake Camp codebase while significantly enhancing the editor experience. By leveraging proven patterns (array itemLabel, conditional fields, responsive grids) and adding targeted enhancements (color picker, inline preview), we can achieve high editor activation rates (80%) with moderate implementation effort (18 SP).

**Key Recommendations:**
1. **FAQ Inline Editing (Phase 1):** Quick win with immediate editor satisfaction boost
2. **Grid Template Foundation (Phase 2):** Core functionality with image support
3. **Color Picker (Phase 3):** Use preset + custom hex approach (balances simplicity with flexibility)
4. **Mobile Responsiveness:** Leverage existing OptimizedImage and responsive grid patterns

**Confidence:** High on technical feasibility (proven patterns), Medium on editor activation rate (requires user testing to validate 80% target).

---

**Author:** UX Designer Agent
**Review Status:** Ready for implementation planning
**Next Steps:** Validate with stakeholders, proceed to QPLAN for technical breakdown
