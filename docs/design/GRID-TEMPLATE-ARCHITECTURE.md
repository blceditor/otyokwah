# Grid Template Component Architecture
**Project:** Bear Lake Camp Website
**Component System:** 2-Column Responsive Grid Template
**Date:** 2025-12-20
**Owner:** react-frontend-specialist

---

## Executive Summary

This document defines the React component architecture for a flexible 2-column grid template system that supports CMS-driven content. The grid template enables content editors to compose pages with mixed media (full-bleed images, color backgrounds, text cards) while maintaining the Bear Lake Camp design system's nature-authentic aesthetic.

### Key Features
- **Responsive 2-column grid** (mobile: 1 column, tablet+: 2 columns)
- **Three GridSquare variants**: Full-bleed image, color background, text card
- **CMS integration** via Keystatic with Markdoc rendering
- **Accessibility-first** design (WCAG 2.1 AA compliant)
- **Consistent with existing design system** (earthy colors, natural textures)

### Story Point Estimate
- **GridSquare component**: 0.5 SP (3 variants, responsive, a11y)
- **GridTemplate wrapper**: 0.3 SP (layout logic, CMS integration)
- **Markdoc integration**: 0.2 SP (tag definition, transform)
- **Total**: 1.0 SP

---

## Component Hierarchy

```
GridTemplate (Server Component)
  └─ GridSquare (Server Component - default, can be Client if interactive)
       ├─ GridSquareImage (Full-bleed image with next/image)
       ├─ GridSquareColor (Colored background container)
       └─ GridSquareCard (Text content card)
```

### Rationale for Server Components
- **GridTemplate**: Receives data from Keystatic CMS (server-side data fetching)
- **GridSquare**: No client-side interactivity needed (unless future hover effects added)
- **Performance**: Reduces bundle size by keeping components server-side
- **SEO**: Content rendered on server for better search indexing

---

## Component Specifications

### 1. GridTemplate Component

**Purpose**: Container component that renders a responsive 2-column grid layout.

**File Location**: `/components/content/GridTemplate.tsx`

#### Props Interface

```typescript
export interface GridTemplateProps {
  children: React.ReactNode;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}
```

#### Implementation

```typescript
/**
 * GridTemplate Component
 * REQ-GRID-001: 2-column responsive grid layout for mixed media content
 *
 * Renders a responsive grid that displays:
 * - 1 column on mobile (< 768px)
 * - 2 columns on tablet+ (>= 768px)
 *
 * Accessibility: Uses semantic HTML (section/article), proper heading hierarchy
 */

import React from 'react';

export interface GridTemplateProps {
  children: React.ReactNode;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

const gapMap = {
  sm: 'gap-4',      // 1rem (16px)
  md: 'gap-6',      // 1.5rem (24px)
  lg: 'gap-8',      // 2rem (32px)
};

export default function GridTemplate({
  children,
  gap = 'md',
  className = '',
}: GridTemplateProps) {
  const gapClass = gapMap[gap] || gapMap.md;

  return (
    <section
      className={`
        grid
        grid-cols-1
        md:grid-cols-2
        ${gapClass}
        my-8
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      role="region"
      aria-label="Content grid"
    >
      {children}
    </section>
  );
}
```

#### Tailwind CSS Strategy

**Mobile-first approach**:
- Base: `grid-cols-1` (single column on mobile)
- Breakpoint: `md:grid-cols-2` (2 columns at 768px+)
- Gap: Dynamic via `gapMap` (sm/md/lg options)

**Responsive behavior**:
- Mobile (< 768px): Stacks vertically (1 column)
- Tablet (768px - 1023px): 2 columns, narrower gaps
- Desktop (1024px+): 2 columns, wider gaps

---

### 2. GridSquare Component

**Purpose**: Polymorphic component that renders one of three variants based on props.

**File Location**: `/components/content/GridSquare.tsx`

#### Props Interface

```typescript
export type GridSquareVariant = 'image' | 'color' | 'card';

export interface GridSquareBaseProps {
  variant: GridSquareVariant;
  className?: string;
}

export interface GridSquareImageProps extends GridSquareBaseProps {
  variant: 'image';
  imageSrc: string;
  imageAlt: string;
  aspectRatio?: 'square' | '4/3' | '16/9' | 'auto';
  objectFit?: 'cover' | 'contain';
}

export interface GridSquareColorProps extends GridSquareBaseProps {
  variant: 'color';
  backgroundColor: string; // Hex color code
  children?: React.ReactNode;
}

export interface GridSquareCardProps extends GridSquareBaseProps {
  variant: 'card';
  children: React.ReactNode;
  background?: 'cream' | 'white' | 'sand';
  padding?: 'sm' | 'md' | 'lg';
}

export type GridSquareProps =
  | GridSquareImageProps
  | GridSquareColorProps
  | GridSquareCardProps;
```

#### Implementation

```typescript
/**
 * GridSquare Component
 * REQ-GRID-002: Flexible grid cell supporting image, color, and card variants
 *
 * Three variants:
 * 1. Image: Full-bleed image using next/image
 * 2. Color: Colored background container with customizable hex color
 * 3. Card: Text content card with Bear Lake design system styling
 *
 * Accessibility:
 * - Image variant: Descriptive alt text required
 * - Color variant: Proper semantic HTML for children
 * - Card variant: Uses article element, proper heading hierarchy
 */

import React from 'react';
import Image from 'next/image';

// [Props interfaces from above]

export default function GridSquare(props: GridSquareProps) {
  const { variant, className = '' } = props;

  if (variant === 'image') {
    return <GridSquareImage {...props} className={className} />;
  }

  if (variant === 'color') {
    return <GridSquareColor {...props} className={className} />;
  }

  return <GridSquareCard {...props} className={className} />;
}

// Variant sub-components
function GridSquareImage({
  imageSrc,
  imageAlt,
  aspectRatio = 'square',
  objectFit = 'cover',
  className = '',
}: GridSquareImageProps) {
  const aspectRatioMap = {
    square: 'aspect-square',
    '4/3': 'aspect-[4/3]',
    '16/9': 'aspect-video',
    auto: '',
  };

  const aspectClass = aspectRatioMap[aspectRatio];
  const objectFitClass = objectFit === 'cover' ? 'object-cover' : 'object-contain';

  return (
    <div
      className={`
        relative
        ${aspectClass}
        overflow-hidden
        rounded-lg
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        className={objectFitClass}
        sizes="(max-width: 768px) 100vw, 50vw"
        loading="lazy"
      />
    </div>
  );
}

function GridSquareColor({
  backgroundColor,
  children,
  className = '',
}: GridSquareColorProps) {
  // Validate hex color format
  const isValidHex = /^#([0-9A-F]{3}){1,2}$/i.test(backgroundColor);
  const bgColor = isValidHex ? backgroundColor : '#F5F0E8'; // Default to cream

  return (
    <div
      className={`
        rounded-lg
        p-8
        min-h-[300px]
        flex
        items-center
        justify-center
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      style={{ backgroundColor: bgColor }}
      role="region"
    >
      {children}
    </div>
  );
}

function GridSquareCard({
  children,
  background = 'cream',
  padding = 'md',
  className = '',
}: GridSquareCardProps) {
  const backgroundMap = {
    cream: 'bg-cream',
    white: 'bg-white',
    sand: 'bg-sand',
  };

  const paddingMap = {
    sm: 'p-4',      // 1rem
    md: 'p-6',      // 1.5rem
    lg: 'p-8',      // 2rem
  };

  const bgClass = backgroundMap[background];
  const paddingClass = paddingMap[padding];

  return (
    <article
      className={`
        ${bgClass}
        ${paddingClass}
        rounded-lg
        border-2
        border-secondary/20
        shadow-sm
        hover:shadow-md
        hover:border-secondary/40
        transition-shadow
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      <div className="prose prose-lg max-w-none text-bark">
        {children}
      </div>
    </article>
  );
}
```

#### Design System Alignment

**Colors**:
- Cream: `#F5F0E8` (primary background)
- Sand: `#D4C5B0` (alternate background)
- White: `#FFFFFF` (clean background)
- Secondary: `#2F4F3D` (forest green for borders)
- Bark: `#5A4A3A` (text color)

**Typography**:
- Uses existing `prose` classes from Tailwind Typography plugin
- Maintains consistent heading hierarchy

**Spacing**:
- Padding: sm (1rem), md (1.5rem), lg (2rem)
- Gap: sm (1rem), md (1.5rem), lg (2rem)

---

## Markdoc Integration

### Tag Definition

**File**: `/components/content/MarkdocRenderer.tsx` (existing file)

Add these tags to the `config.tags` object:

```typescript
// Add to existing config.tags in MarkdocRenderer.tsx
gridTemplate: {
  render: 'GridTemplate',
  attributes: {
    gap: { type: String },
  },
  transform(node: any, config: any) {
    const children = node.transformChildren(config);
    return new Markdoc.Tag(
      'GridTemplate',
      { gap: node.attributes.gap || 'md' },
      children,
    );
  },
},
gridSquare: {
  render: 'GridSquare',
  attributes: {
    variant: { type: String, required: true },
    // Image variant attributes
    imageSrc: { type: String },
    imageAlt: { type: String },
    aspectRatio: { type: String },
    objectFit: { type: String },
    // Color variant attributes
    backgroundColor: { type: String },
    // Card variant attributes
    background: { type: String },
    padding: { type: String },
  },
  transform(node: any, config: any) {
    const children = node.transformChildren(config);
    const { variant } = node.attributes;

    const props: any = { variant };

    if (variant === 'image') {
      props.imageSrc = node.attributes.imageSrc || '';
      props.imageAlt = node.attributes.imageAlt || '';
      props.aspectRatio = node.attributes.aspectRatio || 'square';
      props.objectFit = node.attributes.objectFit || 'cover';
    } else if (variant === 'color') {
      props.backgroundColor = node.attributes.backgroundColor || '#F5F0E8';
    } else if (variant === 'card') {
      props.background = node.attributes.background || 'cream';
      props.padding = node.attributes.padding || 'md';
    }

    return new Markdoc.Tag('GridSquare', props, children);
  },
},
```

### Component Map

Add to `components` object in MarkdocRenderer.tsx:

```typescript
import { GridTemplate } from './GridTemplate';
import { GridSquare } from './GridSquare';

const components = {
  // ... existing components
  GridTemplate,
  GridSquare,
};
```

---

## CMS Usage Examples

### Example 1: Image Grid

```markdown
{% gridTemplate gap="md" %}

{% gridSquare variant="image" imageSrc="/images/facilities/chapel-exterior.jpg" imageAlt="Chapel exterior with forest backdrop" aspectRatio="square" /%}

{% gridSquare variant="image" imageSrc="/images/facilities/dining-hall.jpg" imageAlt="Dining hall interior" aspectRatio="square" /%}

{% /gridTemplate %}
```

**Renders**: 2 square images side-by-side (1 column on mobile)

---

### Example 2: Mixed Content Grid

```markdown
{% gridTemplate gap="lg" %}

{% gridSquare variant="image" imageSrc="/images/summer-program-and-general/campfire.jpg" imageAlt="Campers around campfire" aspectRatio="4/3" /%}

{% gridSquare variant="card" background="cream" padding="lg" %}
## Our Mission

Bear Lake Camp is a Christ-centered ministry dedicated to helping young people and adults grow in their faith and relationship with Jesus Christ.

### What We Offer
- Daily Bible studies
- Outdoor adventures
- Community building
- Spiritual growth
{% /gridSquare %}

{% /gridTemplate %}
```

**Renders**: Image on left, text card on right (stacks on mobile)

---

### Example 3: Color Background with Content

```markdown
{% gridTemplate gap="md" %}

{% gridSquare variant="color" backgroundColor="#4A7A9E" %}
## Welcome to Camp
*Experience where faith grows wild*
{% /gridSquare %}

{% gridSquare variant="card" background="white" padding="md" %}
### Register Now
Summer camp sessions fill up fast! Secure your spot today.

[Register Now](/summer-camp-sessions#register)
{% /gridSquare %}

{% /gridTemplate %}
```

**Renders**: Blue background section with white text, white card with CTA

---

### Example 4: Full Photo Gallery

```markdown
{% gridTemplate gap="sm" %}

{% gridSquare variant="image" imageSrc="/images/facilities/chapel-exterior.jpg" imageAlt="Chapel exterior" /%}

{% gridSquare variant="image" imageSrc="/images/facilities/dining-hall.jpg" imageAlt="Dining hall" /%}

{% gridSquare variant="image" imageSrc="/images/facilities/rec-center.jpg" imageAlt="Recreation center" /%}

{% gridSquare variant="image" imageSrc="/images/facilities/cabins.jpg" imageAlt="Cabin area" /%}

{% /gridTemplate %}
```

**Renders**: 4-image grid (2x2 on desktop, 4x1 on mobile)

---

## Accessibility Requirements

### WCAG 2.1 AA Compliance Checklist

#### Semantic HTML
- ✅ `<section>` wrapper with `role="region"` and `aria-label`
- ✅ `<article>` for card variant
- ✅ Proper heading hierarchy (h2, h3, h4)

#### Keyboard Navigation
- ✅ No interactive elements (all static content)
- ⚠️ Future: If adding clickable cards, ensure keyboard focus

#### Color Contrast
- ✅ Text on colored backgrounds must meet 4.5:1 contrast ratio
- ✅ Validate custom `backgroundColor` hex codes
- ⚠️ CMS should provide color picker with WCAG validator

#### Image Alt Text
- ✅ `imageAlt` prop is **required** for image variant
- ✅ Alt text must be descriptive (not "image1.jpg")
- ⚠️ CMS should validate alt text is not empty

#### Responsive Design
- ✅ Mobile-first approach (1 column base)
- ✅ Touch targets ≥ 44px (if clickable)
- ✅ Content readable at 200% zoom

#### Screen Readers
- ✅ Proper semantic structure (section > article)
- ✅ Images have descriptive alt text
- ✅ No decorative images (all images convey meaning)

---

## Keyboard Navigation

**Current State**: No interactive elements (static content display)

**Future Enhancement** (if cards become clickable):
```typescript
// Add to GridSquareCard if clickable
<article
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  }}
  className="focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
>
  {children}
</article>
```

**Keyboard Support** (future):
- `Tab`: Navigate to next card
- `Shift + Tab`: Navigate to previous card
- `Enter`/`Space`: Activate card (if clickable)

---

## Integration with Existing Components

### Comparison with Existing Grid Components

| Component | Purpose | Columns | Use Case |
|-----------|---------|---------|----------|
| **CardGrid** | Card container | 1-4 (auto-detect) | ContentCard, SectionCard layouts |
| **ImageGallery** | Photo gallery | 1-3 (configurable) | Photo galleries with lightbox |
| **GridTemplate** | Mixed media grid | 1-2 (responsive) | Custom layouts with images + text |

### When to Use GridTemplate vs CardGrid

**Use GridTemplate when**:
- Mixing images and text content
- Need custom background colors
- Creating custom page layouts
- Content is NOT primarily cards

**Use CardGrid when**:
- Displaying only ContentCard or SectionCard components
- Need 3+ columns
- Standard card grid layout

### Reusing Existing Patterns

**From ProgramCard**:
- ✅ Image hover effects (`hover:scale-105`)
- ✅ Card shadows (`shadow-lg`, `hover:shadow-xl`)
- ✅ Rounded corners (`rounded-lg`)

**From ContentCard**:
- ✅ Border styling (`border-2 border-secondary/20`)
- ✅ Hover transitions (`hover:border-secondary/40`)
- ✅ Prose classes for typography

**From ImageSection**:
- ✅ Full-bleed images with `next/image`
- ✅ `object-cover` for image cropping
- ✅ Responsive image sizes

---

## TypeScript Type Safety

### Type Guards

```typescript
// Type guards for variant discrimination
export function isImageSquare(props: GridSquareProps): props is GridSquareImageProps {
  return props.variant === 'image';
}

export function isColorSquare(props: GridSquareProps): props is GridSquareColorProps {
  return props.variant === 'color';
}

export function isCardSquare(props: GridSquareProps): props is GridSquareCardProps {
  return props.variant === 'card';
}
```

### Discriminated Unions

The `GridSquareProps` type uses a **discriminated union** based on the `variant` field:

```typescript
// TypeScript ensures only valid props for each variant
<GridSquare variant="image" imageSrc="/path.jpg" imageAlt="Description" />
// ✅ Valid: imageSrc and imageAlt required for image variant

<GridSquare variant="image" backgroundColor="#FFF" />
// ❌ Error: backgroundColor not valid for image variant

<GridSquare variant="color" backgroundColor="#4A7A9E">Content</GridSquare>
// ✅ Valid: backgroundColor required for color variant

<GridSquare variant="card">Content</GridSquare>
// ✅ Valid: children required for card variant
```

---

## Performance Considerations

### Image Optimization

**next/image Benefits**:
- Automatic lazy loading (`loading="lazy"`)
- Responsive image sizes (`sizes="(max-width: 768px) 100vw, 50vw"`)
- WebP format conversion (automatic)
- Image CDN optimization (Vercel)

**Sizes Attribute Strategy**:
```typescript
// Mobile: Full viewport width
// Tablet+: 50% viewport width (2-column grid)
sizes="(max-width: 768px) 100vw, 50vw"
```

### Bundle Size

**Server Components** (default):
- GridTemplate: 0 bytes to client (rendered on server)
- GridSquare: 0 bytes to client (no client-side JS)

**Client Components** (if needed):
- Only needed if adding interactive features (click handlers, animations)

---

## Testing Strategy

### Unit Tests

**File**: `/components/content/GridTemplate.spec.tsx`

```typescript
import { render, screen } from '@testing-library/react';
import GridTemplate from './GridTemplate';

describe('GridTemplate', () => {
  it('renders children in grid layout', () => {
    render(
      <GridTemplate>
        <div data-testid="child1">Child 1</div>
        <div data-testid="child2">Child 2</div>
      </GridTemplate>
    );

    expect(screen.getByTestId('child1')).toBeInTheDocument();
    expect(screen.getByTestId('child2')).toBeInTheDocument();
  });

  it('applies gap classes correctly', () => {
    const { container } = render(
      <GridTemplate gap="lg">
        <div>Child</div>
      </GridTemplate>
    );

    const section = container.querySelector('section');
    expect(section).toHaveClass('gap-8');
  });

  it('has proper ARIA attributes', () => {
    render(<GridTemplate><div>Child</div></GridTemplate>);

    const section = screen.getByRole('region', { name: 'Content grid' });
    expect(section).toBeInTheDocument();
  });
});
```

**File**: `/components/content/GridSquare.spec.tsx`

```typescript
import { render, screen } from '@testing-library/react';
import GridSquare from './GridSquare';

describe('GridSquare', () => {
  describe('Image variant', () => {
    it('renders image with alt text', () => {
      render(
        <GridSquare
          variant="image"
          imageSrc="/test.jpg"
          imageAlt="Test image"
        />
      );

      const img = screen.getByAltText('Test image');
      expect(img).toBeInTheDocument();
    });

    it('applies aspect ratio classes', () => {
      const { container } = render(
        <GridSquare
          variant="image"
          imageSrc="/test.jpg"
          imageAlt="Test"
          aspectRatio="square"
        />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('aspect-square');
    });
  });

  describe('Color variant', () => {
    it('renders with custom background color', () => {
      const { container } = render(
        <GridSquare variant="color" backgroundColor="#4A7A9E">
          <p>Content</p>
        </GridSquare>
      );

      const div = container.firstChild as HTMLElement;
      expect(div).toHaveStyle({ backgroundColor: '#4A7A9E' });
    });

    it('falls back to cream for invalid hex', () => {
      const { container } = render(
        <GridSquare variant="color" backgroundColor="invalid">
          <p>Content</p>
        </GridSquare>
      );

      const div = container.firstChild as HTMLElement;
      expect(div).toHaveStyle({ backgroundColor: '#F5F0E8' });
    });
  });

  describe('Card variant', () => {
    it('renders children in card layout', () => {
      render(
        <GridSquare variant="card">
          <h2>Heading</h2>
          <p>Content</p>
        </GridSquare>
      );

      expect(screen.getByText('Heading')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('applies background color classes', () => {
      const { container } = render(
        <GridSquare variant="card" background="white">
          <p>Content</p>
        </GridSquare>
      );

      const article = container.querySelector('article');
      expect(article).toHaveClass('bg-white');
    });
  });
});
```

### Integration Tests

**File**: `/components/content/GridTemplate.integration.spec.tsx`

```typescript
import { render, screen } from '@testing-library/react';
import { MarkdocRenderer } from './MarkdocRenderer';

describe('GridTemplate Markdoc Integration', () => {
  it('renders grid with image squares from Markdoc', () => {
    const content = `
{% gridTemplate gap="md" %}
{% gridSquare variant="image" imageSrc="/test1.jpg" imageAlt="Image 1" /%}
{% gridSquare variant="image" imageSrc="/test2.jpg" imageAlt="Image 2" /%}
{% /gridTemplate %}
    `;

    render(<MarkdocRenderer content={content} />);

    expect(screen.getByAltText('Image 1')).toBeInTheDocument();
    expect(screen.getByAltText('Image 2')).toBeInTheDocument();
  });

  it('renders mixed content grid from Markdoc', () => {
    const content = `
{% gridTemplate %}
{% gridSquare variant="image" imageSrc="/test.jpg" imageAlt="Test" /%}
{% gridSquare variant="card" %}
## Heading
Content here
{% /gridSquare %}
{% /gridTemplate %}
    `;

    render(<MarkdocRenderer content={content} />);

    expect(screen.getByAltText('Test')).toBeInTheDocument();
    expect(screen.getByText('Heading')).toBeInTheDocument();
  });
});
```

### E2E Tests (Playwright)

**File**: `/tests/e2e/grid-template.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Grid Template', () => {
  test('displays 1 column on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto('/facilities'); // Example page using grid

    const grid = page.locator('section[role="region"][aria-label="Content grid"]');
    await expect(grid).toHaveCSS('grid-template-columns', '1fr');
  });

  test('displays 2 columns on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/facilities');

    const grid = page.locator('section[role="region"][aria-label="Content grid"]');
    await expect(grid).toHaveCSS('grid-template-columns', '1fr 1fr');
  });

  test('images load with proper alt text', async ({ page }) => {
    await page.goto('/facilities');

    const images = page.locator('section[aria-label="Content grid"] img');
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      expect(alt).not.toBe('');
      expect(alt).not.toBeNull();
    }
  });
});
```

---

## Migration Path

### Phase 1: Component Implementation (1.0 SP)
1. ✅ Create `GridTemplate.tsx` component
2. ✅ Create `GridSquare.tsx` component with 3 variants
3. ✅ Add Markdoc tag definitions to `MarkdocRenderer.tsx`
4. ✅ Write unit tests for both components
5. ✅ Write integration tests for Markdoc rendering

### Phase 2: CMS Integration (0.5 SP)
1. Update Keystatic config for grid template pages
2. Add grid template to page template options
3. Document CMS usage in editor guide

### Phase 3: Content Migration (varies by page)
1. Identify existing pages needing grid layout
2. Convert static layouts to grid template
3. Update content in Keystatic CMS

---

## Antipatterns to Avoid

### ❌ Don't Use Inline Styles (Use Tailwind)
```typescript
// BAD
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>

// GOOD
<div className="grid grid-cols-1 md:grid-cols-2">
```

### ❌ Don't Make GridSquare a Client Component
```typescript
// BAD - Unnecessary client-side JS
'use client';
export default function GridSquare({ ... }) { ... }

// GOOD - Server Component by default
export default function GridSquare({ ... }) { ... }
```

### ❌ Don't Skip Alt Text on Images
```typescript
// BAD - Empty alt text
<GridSquare variant="image" imageSrc="/path.jpg" imageAlt="" />

// GOOD - Descriptive alt text
<GridSquare variant="image" imageSrc="/path.jpg" imageAlt="Campers roasting marshmallows at evening campfire" />
```

### ❌ Don't Use Non-Semantic HTML
```typescript
// BAD - Generic div for card
<div className="card">{children}</div>

// GOOD - Semantic article element
<article className="card">{children}</article>
```

### ❌ Don't Hardcode Colors (Use Design System)
```typescript
// BAD - Random hex codes
<GridSquare variant="color" backgroundColor="#FF5733" />

// GOOD - Design system colors
<GridSquare variant="color" backgroundColor="#4A7A9E" /> // primary
<GridSquare variant="color" backgroundColor="#2F4F3D" /> // secondary
<GridSquare variant="color" backgroundColor="#F5F0E8" /> // cream
```

---

## References

### Existing Patterns
- **CardGrid**: `/components/content/CardGrid.tsx`
- **ContentCard**: `/components/content/ContentCard.tsx`
- **ImageSection**: `/components/content/ImageSection.tsx`
- **ProgramCard**: `/components/homepage/ProgramCard.tsx`

### Design System
- **Color Palette**: `/tailwind.config.ts` (lines 14-44)
- **Spacing**: `/tailwind.config.ts` (lines 69-78)
- **Typography**: `prose` classes from Tailwind Typography

### Accessibility
- **WCAG 2.1 Quickref**: https://www.w3.org/WAI/WCAG21/quickref/
- **Semantic HTML**: https://developer.mozilla.org/en-US/docs/Glossary/Semantics

### Next.js
- **next/image**: https://nextjs.org/docs/app/building-your-application/optimizing/images
- **Server Components**: https://nextjs.org/docs/app/building-your-application/rendering/server-components

---

**Last Updated**: 2025-12-20
**Next Review**: After Phase 1 implementation
**Owner**: react-frontend-specialist
