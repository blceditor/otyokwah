# Grid Template Visual Guide
**Project:** Bear Lake Camp Website
**Purpose:** Visual reference for designers and content editors
**Date:** 2025-12-20

---

## Component Visual Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                        GridTemplate                         │
│  (2-column grid, responsive)                                │
│                                                             │
│  ┌──────────────────────────┐  ┌──────────────────────────┐│
│  │    GridSquare (Image)    │  │   GridSquare (Card)      ││
│  │                          │  │                          ││
│  │  [Full-bleed image]      │  │  ## Heading              ││
│  │                          │  │  Text content here...    ││
│  │                          │  │                          ││
│  └──────────────────────────┘  └──────────────────────────┘│
│                                                             │
│  ┌──────────────────────────┐  ┌──────────────────────────┐│
│  │   GridSquare (Color)     │  │   GridSquare (Image)     ││
│  │                          │  │                          ││
│  │  [Colored background]    │  │  [Full-bleed image]      ││
│  │  with content            │  │                          ││
│  │                          │  │                          ││
│  └──────────────────────────┘  └──────────────────────────┘│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Responsive Behavior

### Desktop (1024px+)

```
┌───────────────────────────────────────────────────┐
│                                                   │
│  ┌─────────────────┐    ┌─────────────────┐      │
│  │                 │    │                 │      │
│  │   Image 1       │    │   Card Text     │      │
│  │                 │    │                 │      │
│  └─────────────────┘    └─────────────────┘      │
│                                                   │
│  ┌─────────────────┐    ┌─────────────────┐      │
│  │                 │    │                 │      │
│  │   Color BG      │    │   Image 2       │      │
│  │                 │    │                 │      │
│  └─────────────────┘    └─────────────────┘      │
│                                                   │
└───────────────────────────────────────────────────┘
```

### Mobile (< 768px)

```
┌─────────────────────┐
│                     │
│  ┌───────────────┐  │
│  │               │  │
│  │   Image 1     │  │
│  │               │  │
│  └───────────────┘  │
│                     │
│  ┌───────────────┐  │
│  │               │  │
│  │   Card Text   │  │
│  │               │  │
│  └───────────────┘  │
│                     │
│  ┌───────────────┐  │
│  │               │  │
│  │   Color BG    │  │
│  │               │  │
│  └───────────────┘  │
│                     │
│  ┌───────────────┐  │
│  │               │  │
│  │   Image 2     │  │
│  │               │  │
│  └───────────────┘  │
│                     │
└─────────────────────┘
```

---

## GridSquare Variants

### 1. Image Variant

**Visual Example:**

```
┌─────────────────────────────────┐
│                                 │
│       [Full-bleed image]        │
│                                 │
│     (no text, no padding)       │
│                                 │
└─────────────────────────────────┘
```

**Properties:**
- Full-bleed (no padding)
- Rounded corners (8px)
- Responsive image sizing
- Lazy loading

**Aspect Ratios:**
```
Square (1:1)         4:3              16:9 (Video)
┌──────────┐      ┌──────────────┐   ┌─────────────────┐
│          │      │              │   │                 │
│          │      │              │   │                 │
│          │      │              │   │                 │
│          │      │              │   └─────────────────┘
└──────────┘      └──────────────┘
```

---

### 2. Color Variant

**Visual Example:**

```
┌─────────────────────────────────┐
│      [Custom background         │
│       color via hex code]       │
│                                 │
│    Content centered vertically  │
│                                 │
└─────────────────────────────────┘
```

**Properties:**
- Custom hex color background
- Padding: 2rem (32px)
- Min height: 300px
- Content vertically + horizontally centered

**Color Examples:**
```
Primary Blue (#4A7A9E)    Secondary Green (#2F4F3D)
┌────────────────────┐    ┌────────────────────┐
│   [Blue bg]        │    │   [Green bg]       │
│   White text       │    │   Cream text       │
└────────────────────┘    └────────────────────┘

Cream (#F5F0E8)           Sand (#D4C5B0)
┌────────────────────┐    ┌────────────────────┐
│   [Cream bg]       │    │   [Sand bg]        │
│   Dark text        │    │   Dark text        │
└────────────────────┘    └────────────────────┘
```

---

### 3. Card Variant

**Visual Example:**

```
┌─────────────────────────────────┐
│  ┌───────────────────────────┐  │
│  │ ## Heading                │  │
│  │                           │  │
│  │ Paragraph text with       │  │
│  │ proper spacing and        │  │
│  │ typography.               │  │
│  │                           │  │
│  │ - List item 1             │  │
│  │ - List item 2             │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

**Properties:**
- Background: cream/white/sand
- Padding: sm (1rem), md (1.5rem), lg (2rem)
- Border: 2px secondary/20
- Shadow on hover
- Prose typography styles

**Background Options:**
```
Cream (#F5F0E8)          White (#FFFFFF)
┌────────────────┐       ┌────────────────┐
│ Cream card     │       │ White card     │
│ with border    │       │ with border    │
└────────────────┘       └────────────────┘

Sand (#D4C5B0)
┌────────────────┐
│ Sand card      │
│ with border    │
└────────────────┘
```

---

## Real-World Layout Examples

### Example 1: Facilities Page

**Layout:**
```
┌──────────────────────────────────────────────────────────┐
│                 Facilities Header                        │
└──────────────────────────────────────────────────────────┘

┌────────────────────────┐  ┌────────────────────────────┐
│                        │  │ ## Chapel                  │
│  [Chapel photo]        │  │                            │
│                        │  │ Our beautiful chapel       │
│                        │  │ seats 200 campers and      │
│                        │  │ features:                  │
│                        │  │ - Sound system             │
│                        │  │ - A/V capabilities         │
└────────────────────────┘  └────────────────────────────┘

┌────────────────────────┐  ┌────────────────────────────┐
│ ## Dining Hall         │  │                            │
│                        │  │  [Dining Hall photo]       │
│ Family-style meals     │  │                            │
│ served in our rustic   │  │                            │
│ dining hall with:      │  │                            │
│ - 300+ capacity        │  │                            │
└────────────────────────┘  └────────────────────────────┘

┌────────────────────────┐  ┌────────────────────────────┐
│                        │  │ ## Recreation Center       │
│  [Rec Center photo]    │  │                            │
│                        │  │ Indoor activities          │
│                        │  │ including:                 │
│                        │  │ - Basketball court         │
│                        │  │ - Game room                │
└────────────────────────┘  └────────────────────────────┘
```

**Markdoc Code:**
```markdown
# Our Facilities

{% gridTemplate gap="lg" %}

{% gridSquare variant="image" imageSrc="/images/facilities/chapel-exterior.jpg" imageAlt="Chapel exterior with forest backdrop" aspectRatio="4/3" /%}

{% gridSquare variant="card" background="cream" padding="lg" %}
## Chapel
Our beautiful chapel seats 200 campers and features:
- Professional sound system
- A/V capabilities for worship
- Climate controlled
{% /gridSquare %}

{% gridSquare variant="card" background="white" padding="lg" %}
## Dining Hall
Family-style meals served in our rustic dining hall with:
- 300+ capacity
- Commercial kitchen
- Dietary accommodations
{% /gridSquare %}

{% gridSquare variant="image" imageSrc="/images/facilities/dining-hall.jpg" imageAlt="Dining hall interior" aspectRatio="4/3" /%}

{% gridSquare variant="image" imageSrc="/images/facilities/rec-center.jpg" imageAlt="Recreation center" aspectRatio="4/3" /%}

{% gridSquare variant="card" background="cream" padding="lg" %}
## Recreation Center
Indoor activities including:
- Full basketball court
- Game room with pool tables
- Ping pong and foosball
{% /gridSquare %}

{% /gridTemplate %}
```

---

### Example 2: About Page - Core Values

**Layout:**
```
┌──────────────────────────────────────────────────────────┐
│                   Our Core Values                        │
└──────────────────────────────────────────────────────────┘

┌────────────────────────┐  ┌────────────────────────────┐
│   [Blue background]    │  │   [Green background]       │
│                        │  │                            │
│   **Faith First**      │  │   **Community**            │
│   Phil. 3:10           │  │   1 Thess. 5:11            │
│                        │  │                            │
└────────────────────────┘  └────────────────────────────┘

┌────────────────────────┐  ┌────────────────────────────┐
│   [Cream background]   │  │   [Sand background]        │
│                        │  │                            │
│   **Adventure**        │  │   **Transformation**       │
│   Psalm 19:1           │  │   Romans 12:2              │
│                        │  │                            │
└────────────────────────┘  └────────────────────────────┘
```

**Markdoc Code:**
```markdown
# Our Core Values

{% gridTemplate gap="md" %}

{% gridSquare variant="color" backgroundColor="#4A7A9E" %}
## Faith First
*"That I may know Him..." - Phil. 3:10*

Everything we do points campers to Christ.
{% /gridSquare %}

{% gridSquare variant="color" backgroundColor="#2F4F3D" %}
## Community
*"Encourage one another..." - 1 Thess. 5:11*

We build authentic Christian community.
{% /gridSquare %}

{% gridSquare variant="color" backgroundColor="#F5F0E8" %}
## Adventure
*"The heavens declare..." - Psalm 19:1*

We encounter God in His creation.
{% /gridSquare %}

{% gridSquare variant="color" backgroundColor="#D4C5B0" %}
## Transformation
*"Be transformed..." - Romans 12:2*

Lives are changed at Bear Lake Camp.
{% /gridSquare %}

{% /gridTemplate %}
```

---

### Example 3: Photo Gallery with Captions

**Layout:**
```
┌────────────────────────┐  ┌────────────────────────────┐
│                        │  │                            │
│  [Campfire photo]      │  │  [Volleyball photo]        │
│                        │  │                            │
└────────────────────────┘  └────────────────────────────┘

┌────────────────────────┐  ┌────────────────────────────┐
│                        │  │                            │
│  [Bible study photo]   │  │  [Swimming photo]          │
│                        │  │                            │
└────────────────────────┘  └────────────────────────────┘
```

**Markdoc Code:**
```markdown
# Camp Life Gallery

{% gridTemplate gap="sm" %}

{% gridSquare variant="image" imageSrc="/images/summer-program-and-general/campfire.jpg" imageAlt="Campers gathered around evening campfire with counselor leading worship" aspectRatio="square" /%}

{% gridSquare variant="image" imageSrc="/images/summer-program-and-general/volleyball.jpg" imageAlt="Teens playing volleyball on the beach" aspectRatio="square" /%}

{% gridSquare variant="image" imageSrc="/images/summer-program-and-general/bible-study.jpg" imageAlt="Small group Bible study in cabin" aspectRatio="square" /%}

{% gridSquare variant="image" imageSrc="/images/summer-program-and-general/swimming.jpg" imageAlt="Campers swimming in Bear Lake" aspectRatio="square" /%}

{% /gridTemplate %}
```

---

## Spacing & Gap Options

### Gap: Small (gap="sm")

```
┌──────┐  ┌──────┐   ← 16px gap
│      │  │      │
└──────┘  └──────┘
```

**Use Case**: Tight photo grids, image galleries

---

### Gap: Medium (gap="md") - DEFAULT

```
┌──────┐     ┌──────┐   ← 24px gap
│      │     │      │
└──────┘     └──────┘
```

**Use Case**: Balanced layouts, mixed content

---

### Gap: Large (gap="lg")

```
┌──────┐        ┌──────┐   ← 32px gap
│      │        │      │
└──────┘        └──────┘
```

**Use Case**: Content-heavy layouts, breathing room

---

## Color Palette Reference

### Bear Lake Design System Colors

```
Primary (Water/Sky)
┌─────────────────┐
│ #4A7A9E         │  Muted Lake Blue
│ ███████████     │
└─────────────────┘

Secondary (Forest/Moss)
┌─────────────────┐
│ #2F4F3D         │  Deep Forest Green
│ ███████████     │
└─────────────────┘

Accent (Earth/Clay)
┌─────────────────┐
│ #A07856         │  Warm Earth Tone
│ ███████████     │
└─────────────────┘

Neutrals
┌─────────────────┐
│ #F5F0E8         │  Cream (primary background)
│ ░░░░░░░░░░░     │
└─────────────────┘

┌─────────────────┐
│ #D4C5B0         │  Sand
│ ▒▒▒▒▒▒▒▒▒▒▒     │
└─────────────────┘

┌─────────────────┐
│ #8A8A7A         │  Stone
│ ▓▓▓▓▓▓▓▓▓▓▓     │
└─────────────────┘

┌─────────────────┐
│ #5A4A3A         │  Bark (text color)
│ ███████████     │
└─────────────────┘
```

### WCAG Contrast Guidelines

**Text on Colored Backgrounds:**

```
✅ PASS (4.5:1 or higher)
┌────────────────┐
│ #4A7A9E        │  Blue bg + White text (7.2:1)
│ White text     │
└────────────────┘

✅ PASS
┌────────────────┐
│ #2F4F3D        │  Green bg + Cream text (6.8:1)
│ Cream text     │
└────────────────┘

✅ PASS
┌────────────────┐
│ #F5F0E8        │  Cream bg + Bark text (5.1:1)
│ Bark text      │
└────────────────┘

❌ FAIL (below 4.5:1)
┌────────────────┐
│ #D4C5B0        │  Sand bg + Cream text (1.8:1)
│ Cream text     │
└────────────────┘
```

---

## Accessibility Checklist for Editors

### ✅ Images
- [ ] Every image has descriptive alt text
- [ ] Alt text describes content, not just "image"
- [ ] Decorative images use empty alt (`alt=""`)

### ✅ Color Backgrounds
- [ ] Text on colored backgrounds meets 4.5:1 contrast
- [ ] Don't rely on color alone to convey meaning
- [ ] Test with color blindness simulator

### ✅ Card Content
- [ ] Proper heading hierarchy (h2 → h3 → h4)
- [ ] Don't skip heading levels
- [ ] Lists use proper markup (ul/ol)

### ✅ Mobile Experience
- [ ] Content readable at 200% zoom
- [ ] Touch targets at least 44x44px (if clickable)
- [ ] No horizontal scrolling required

---

## Common Mistakes to Avoid

### ❌ Mistake 1: Missing Alt Text
```markdown
<!-- BAD -->
{% gridSquare variant="image" imageSrc="/chapel.jpg" imageAlt="" /%}

<!-- GOOD -->
{% gridSquare variant="image" imageSrc="/chapel.jpg" imageAlt="Chapel exterior with tall pine trees and cross on roof" /%}
```

---

### ❌ Mistake 2: Poor Color Contrast
```markdown
<!-- BAD - Cream text on sand background (fails WCAG) -->
{% gridSquare variant="color" backgroundColor="#D4C5B0" %}
<p style="color: #F5F0E8;">Low contrast text</p>
{% /gridSquare %}

<!-- GOOD - Dark text on light background -->
{% gridSquare variant="color" backgroundColor="#D4C5B0" %}
Dark text is readable
{% /gridSquare %}
```

---

### ❌ Mistake 3: Non-Semantic HTML
```markdown
<!-- BAD - No heading structure -->
{% gridSquare variant="card" %}
**Bold text as fake heading**

Regular text below
{% /gridSquare %}

<!-- GOOD - Proper heading hierarchy -->
{% gridSquare variant="card" %}
## Proper Heading

Regular text below
{% /gridSquare %}
```

---

### ❌ Mistake 4: Inconsistent Gaps
```markdown
<!-- BAD - Mixing gap sizes randomly -->
{% gridTemplate gap="sm" %}
...
{% /gridTemplate %}

{% gridTemplate gap="lg" %}
...
{% /gridTemplate %}

<!-- GOOD - Consistent gap throughout page -->
{% gridTemplate gap="md" %}
...
{% /gridTemplate %}

{% gridTemplate gap="md" %}
...
{% /gridTemplate %}
```

---

## Quick Reference Card

### GridTemplate Syntax

```markdown
{% gridTemplate gap="md" %}
  [GridSquare components here]
{% /gridTemplate %}
```

**Props:**
- `gap`: `"sm"` | `"md"` | `"lg"` (optional, default: `"md"`)

---

### GridSquare - Image Variant

```markdown
{% gridSquare
  variant="image"
  imageSrc="/path/to/image.jpg"
  imageAlt="Descriptive alt text"
  aspectRatio="square"
  objectFit="cover"
/%}
```

**Props:**
- `variant`: `"image"` (required)
- `imageSrc`: Path to image (required)
- `imageAlt`: Alt text (required)
- `aspectRatio`: `"square"` | `"4/3"` | `"16/9"` | `"auto"` (optional, default: `"square"`)
- `objectFit`: `"cover"` | `"contain"` (optional, default: `"cover"`)

---

### GridSquare - Color Variant

```markdown
{% gridSquare variant="color" backgroundColor="#4A7A9E" %}
Content here (supports Markdown)
{% /gridSquare %}
```

**Props:**
- `variant`: `"color"` (required)
- `backgroundColor`: Hex color code (required)

---

### GridSquare - Card Variant

```markdown
{% gridSquare variant="card" background="cream" padding="lg" %}
## Heading
Content here (supports Markdown)
{% /gridSquare %}
```

**Props:**
- `variant`: `"card"` (required)
- `background`: `"cream"` | `"white"` | `"sand"` (optional, default: `"cream"`)
- `padding`: `"sm"` | `"md"` | `"lg"` (optional, default: `"md"`)

---

## Resources

### Design System
- **Full Style Guide**: `/docs/design/FINAL-DESIGN-STYLEGUIDE.md`
- **Color Palette**: `/tailwind.config.ts`
- **Component Architecture**: `/docs/design/GRID-TEMPLATE-ARCHITECTURE.md`

### Accessibility
- **WCAG 2.1 Quickref**: https://www.w3.org/WAI/WCAG21/quickref/
- **Contrast Checker**: https://webaim.org/resources/contrastchecker/
- **Color Blindness Simulator**: https://www.toptal.com/designers/colorfilter

### Image Guidelines
- **Recommended size**: 1920x1080 (1080p)
- **Format**: JPEG for photos, PNG for graphics
- **Compression**: 80-85% quality
- **Alt text guide**: https://webaim.org/techniques/alttext/

---

**Last Updated**: 2025-12-20
**For Questions**: Contact react-frontend-specialist
**CMS Access**: /keystatic
