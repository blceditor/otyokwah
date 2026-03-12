# Quote System Architecture - Technical Specification

**Feature**: Centralized testimonial quote management with page tagging
**Complexity**: High (5 Story Points)
**Status**: Design Complete

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    QUOTE SYSTEM ARCHITECTURE                     │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│  Content Editor  │
└────────┬─────────┘
         │
         │ 1. Create quote in Keystatic CMS
         ↓
┌────────────────────────────────────────────────────────┐
│  Keystatic Admin (/keystatic)                          │
│                                                         │
│  Collections > Quotes                                  │
│  ┌───────────────────────────────────────┐            │
│  │ Quote Text: "BLC has played a..."     │            │
│  │ Attribution: 1st Time Camper          │            │
│  │ Context: Being here at BLC...         │            │
│  │ Background Image: [Upload]            │            │
│  │ Tagged Pages: ☑ summer-staff         │            │
│  │               ☐ about                 │            │
│  │               ☐ retreats              │            │
│  │ Category: Camper                      │            │
│  │ Featured: ☐                           │            │
│  └───────────────────────────────────────┘            │
└────────────────────────────────────────────────────────┘
         │
         │ 2. Save → Commit to GitHub
         ↓
┌────────────────────────────────────────────────────────┐
│  GitHub Repository                                     │
│  content/quotes/                                       │
│    ├── first-time-camper.mdoc                         │
│    ├── parent-testimonial.mdoc                        │
│    └── alumni-story.mdoc                              │
└────────────────────────────────────────────────────────┘
         │
         │ 3. Trigger Vercel build
         ↓
┌────────────────────────────────────────────────────────┐
│  Build Process (Next.js)                              │
│                                                         │
│  1. Read all quotes from content/quotes/*             │
│  2. Build quote-to-page mapping                       │
│  3. Generate static pages                             │
└────────────────────────────────────────────────────────┘
         │
         │ 4. Deploy to production
         ↓
┌────────────────────────────────────────────────────────┐
│  Production Website                                    │
│                                                         │
│  /summer-staff page                                   │
│  ┌─────────────────────────────────────┐              │
│  │  [Page Content]                     │              │
│  │                                      │              │
│  │  [Quote Card - Testimonial]         │  ← Rendered │
│  │  "BLC has played a very critical    │     here    │
│  │   role in me learning about..."     │              │
│  │                                      │              │
│  │  - 1st Time Camper                  │              │
│  └─────────────────────────────────────┘              │
└────────────────────────────────────────────────────────┘
```

---

## Data Model

### Quote Schema (TypeScript)

```typescript
// types/quote.ts
export interface Quote {
  // Metadata
  id: string; // Auto-generated from slug
  slug: string; // e.g., "first-time-camper"

  // Content
  quote: string; // Main quote text (max 200 chars)
  attribution: string; // Who said it (e.g., "1st Time Camper")
  context?: string; // Optional extended quote
  backgroundImage?: string; // Path to background image

  // Tagging & Display
  taggedPages: string[]; // Array of page slugs
  category: 'camper' | 'parent' | 'staff' | 'alumni';
  featured: boolean; // Show on homepage rotation
  displayOrder: number; // Order within page (0 = first)

  // Timestamps (auto-generated)
  createdAt: string;
  updatedAt: string;
}
```

### File Structure

```
content/quotes/
  ├── first-time-camper.mdoc
  ├── parent-sarah-johnson.mdoc
  ├── alumni-john-smith.mdoc
  └── staff-counselor-2024.mdoc

Each file contains:
---
quote: "BLC has played a very critical role in me learning about Christ."
attribution: 1st Time Camper
context: "Being here at BLC has helped me become closer to God and helped me to become closer with other people and have a new family that I know really loves me!"
backgroundImage: /images/quotes/camper-testimonial-1.jpg
taggedPages:
  - summer-staff
  - about
category: camper
featured: true
displayOrder: 0
---
```

---

## Keystatic Configuration

### Quote Collection Schema

```typescript
// keystatic.config.ts
import { config, fields, collection } from '@keystatic/core';

export default config({
  collections: {
    quotes: collection({
      label: 'Testimonial Quotes',
      slugField: 'attribution',
      path: 'content/quotes/*',
      format: { data: 'yaml' },
      schema: {
        quote: fields.text({
          label: 'Quote Text',
          description: 'Main quote - keep concise and impactful (max 200 characters)',
          multiline: true,
          validation: { length: { max: 200 } },
        }),

        attribution: fields.slug({
          name: {
            label: 'Attribution',
            description: 'Who said this? (e.g., "1st Time Camper", "Parent - Sarah J.")',
          }
        }),

        context: fields.text({
          label: 'Extended Quote (optional)',
          description: 'Longer version of the quote for more context',
          multiline: true,
        }),

        backgroundImage: fields.image({
          label: 'Background Image',
          description: 'Image to display behind quote (recommended: 1920x1080px)',
          directory: 'public/images/quotes',
          publicPath: '/images/quotes/',
        }),

        taggedPages: fields.array(
          fields.select({
            label: 'Page',
            description: 'Select pages where this quote should appear',
            options: [
              // Dynamically populated - see below
              { label: 'Summer Staff', value: 'summer-staff' },
              { label: 'About', value: 'about' },
              { label: 'Retreats', value: 'retreats' },
              { label: 'Give', value: 'give' },
            ],
          }),
          {
            label: 'Tagged Pages',
            description: 'Select all pages where this quote should appear',
            itemLabel: (props) => props.value,
          }
        ),

        category: fields.select({
          label: 'Category',
          description: 'Type of testimonial',
          options: [
            { label: 'Camper Testimonial', value: 'camper' },
            { label: 'Parent Testimonial', value: 'parent' },
            { label: 'Staff Testimonial', value: 'staff' },
            { label: 'Alumni Story', value: 'alumni' },
          ],
          defaultValue: 'camper',
        }),

        featured: fields.checkbox({
          label: 'Featured',
          description: 'Display this quote on the homepage testimonial rotation',
          defaultValue: false,
        }),

        displayOrder: fields.number({
          label: 'Display Order',
          description: 'Order within page (0 = first, 1 = second, etc.)',
          defaultValue: 0,
          validation: { min: 0 },
        }),
      },
    }),
  },
});
```

### Dynamic Page Options

**Option A: Static Configuration** (Simple)
```typescript
// Manually maintain list of pages
const pageOptions = [
  { label: 'Homepage', value: 'index' },
  { label: 'Summer Staff', value: 'summer-staff' },
  { label: 'About', value: 'about' },
  // ... add as pages are created
];
```

**Option B: Dynamic Generation** (Recommended)
```typescript
// scripts/sync-quote-page-options.ts
import { reader } from '@/lib/keystatic-reader';
import fs from 'fs';

async function syncQuotePageOptions() {
  // Read all pages from content
  const pages = await reader.collections.pages.all();

  // Generate options array
  const options = pages.map(page => ({
    label: page.entry.title,
    value: page.slug,
  }));

  // Write to config file
  const configPath = './lib/quote-page-options.json';
  fs.writeFileSync(configPath, JSON.stringify(options, null, 2));

  console.log(`✅ Synced ${options.length} page options`);
}

syncQuotePageOptions();
```

```typescript
// keystatic.config.ts
import quotePageOptions from './lib/quote-page-options.json';

// Use in schema
taggedPages: fields.array(
  fields.select({
    label: 'Page',
    options: quotePageOptions,
  }),
  // ...
)
```

---

## Quote Rendering System

### Server Component Approach

```typescript
// app/[slug]/page.tsx
import { reader } from '@/lib/keystatic-reader';
import QuoteSection from '@/components/content/QuoteSection';

export default async function Page({ params }: { params: { slug: string } }) {
  // Fetch page content
  const page = await reader.collections.pages.read(params.slug);

  // Fetch quotes tagged to this page
  const quotes = await getQuotesForPage(params.slug);

  return (
    <>
      {/* Hero section */}
      <Hero {...page.hero} />

      {/* Main content */}
      <article>
        <Markdoc content={page.body} />
      </article>

      {/* Quotes section (if any quotes tagged) */}
      {quotes.length > 0 && (
        <QuoteSection quotes={quotes} />
      )}

      {/* CTA section */}
      <CTA {...page.cta} />
    </>
  );
}
```

### Query Helper

```typescript
// lib/quotes/getQuotesForPage.ts
import { reader } from '@/lib/keystatic-reader';
import type { Quote } from '@/types/quote';

export async function getQuotesForPage(pageSlug: string): Promise<Quote[]> {
  // Fetch all quotes
  const allQuotes = await reader.collections.quotes.all();

  // Filter quotes tagged to this page
  const pageQuotes = allQuotes.filter(quote =>
    quote.entry.taggedPages.includes(pageSlug)
  );

  // Sort by display order
  const sortedQuotes = pageQuotes.sort(
    (a, b) => a.entry.displayOrder - b.entry.displayOrder
  );

  // Map to Quote type
  return sortedQuotes.map(quote => ({
    id: quote.slug,
    slug: quote.slug,
    quote: quote.entry.quote,
    attribution: quote.entry.attribution,
    context: quote.entry.context,
    backgroundImage: quote.entry.backgroundImage,
    taggedPages: quote.entry.taggedPages,
    category: quote.entry.category,
    featured: quote.entry.featured,
    displayOrder: quote.entry.displayOrder,
    createdAt: '', // Not tracked yet
    updatedAt: '',
  }));
}
```

### Caching Strategy (Optional Optimization)

```typescript
// lib/quotes/quote-cache.ts
import fs from 'fs';
import path from 'path';

interface QuoteIndex {
  [pageSlug: string]: string[]; // Map of page → quote IDs
}

export function buildQuoteIndex(): QuoteIndex {
  const quotes = reader.collections.quotes.all();
  const index: QuoteIndex = {};

  quotes.forEach(quote => {
    quote.entry.taggedPages.forEach(pageSlug => {
      if (!index[pageSlug]) {
        index[pageSlug] = [];
      }
      index[pageSlug].push(quote.slug);
    });
  });

  return index;
}

// Generate at build time
export function saveQuoteIndex() {
  const index = buildQuoteIndex();
  const outputPath = path.join(process.cwd(), 'public/quotes-index.json');
  fs.writeFileSync(outputPath, JSON.stringify(index, null, 2));
}

// Use in app
export async function getQuotesForPageFast(pageSlug: string): Promise<Quote[]> {
  // Load index
  const indexPath = path.join(process.cwd(), 'public/quotes-index.json');
  const index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));

  // Get quote IDs for this page
  const quoteIds = index[pageSlug] || [];

  // Fetch quotes by ID
  const quotes = await Promise.all(
    quoteIds.map(id => reader.collections.quotes.read(id))
  );

  return quotes;
}
```

---

## Quote Display Components

### QuoteSection Component

```typescript
// components/content/QuoteSection.tsx
import QuoteCard from './QuoteCard';
import type { Quote } from '@/types/quote';

interface QuoteSectionProps {
  quotes: Quote[];
  layout?: 'stacked' | 'grid' | 'carousel';
}

export default function QuoteSection({
  quotes,
  layout = 'stacked'
}: QuoteSectionProps) {
  if (quotes.length === 0) return null;

  return (
    <section
      className="py-16 bg-gray-50"
      aria-labelledby="quotes-heading"
    >
      <div className="container">
        <h2
          id="quotes-heading"
          className="text-3xl font-heading text-center mb-12"
        >
          What Others Are Saying
        </h2>

        {layout === 'stacked' && (
          <div className="space-y-8">
            {quotes.map(quote => (
              <QuoteCard key={quote.id} {...quote} variant="overlay" />
            ))}
          </div>
        )}

        {layout === 'grid' && (
          <div className="grid md:grid-cols-2 gap-8">
            {quotes.map(quote => (
              <QuoteCard key={quote.id} {...quote} variant="card" />
            ))}
          </div>
        )}

        {/* Carousel layout - future enhancement */}
      </div>
    </section>
  );
}
```

### QuoteCard Component (Three Variants)

```typescript
// components/content/QuoteCard.tsx
import Image from 'next/image';
import type { Quote } from '@/types/quote';

interface QuoteCardProps extends Quote {
  variant?: 'overlay' | 'card' | 'inline';
}

export default function QuoteCard({
  quote,
  attribution,
  context,
  backgroundImage,
  variant = 'overlay'
}: QuoteCardProps) {
  // Variant 1: Overlay (matches reference image)
  if (variant === 'overlay') {
    return (
      <div className="relative h-96 flex items-center justify-center overflow-hidden rounded-lg">
        {/* Background image */}
        {backgroundImage && (
          <Image
            src={backgroundImage}
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
          />
        )}

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Quote content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
          <blockquote className="text-2xl md:text-3xl text-white font-light mb-4">
            "{quote}"
          </blockquote>

          {context && (
            <p className="text-white/90 text-lg mb-6 max-w-2xl mx-auto">
              {context}
            </p>
          )}

          <cite className="text-white/80 text-sm uppercase tracking-wider not-italic">
            {attribution}
          </cite>
        </div>
      </div>
    );
  }

  // Variant 2: Card (for grid layout)
  if (variant === 'card') {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md">
        <blockquote className="text-xl text-gray-800 mb-4">
          "{quote}"
        </blockquote>

        {context && (
          <p className="text-gray-600 mb-4">{context}</p>
        )}

        <cite className="text-gray-500 text-sm uppercase tracking-wide not-italic">
          — {attribution}
        </cite>
      </div>
    );
  }

  // Variant 3: Inline (within content flow)
  if (variant === 'inline') {
    return (
      <blockquote className="border-l-4 border-primary pl-6 py-4 my-8">
        <p className="text-lg italic text-gray-700">{quote}</p>
        <cite className="text-gray-500 text-sm not-italic mt-2 block">
          — {attribution}
        </cite>
      </blockquote>
    );
  }

  return null;
}
```

---

## Build Process Integration

### package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "npm run sync-quotes && next build",
    "sync-quotes": "tsx scripts/sync-quote-page-options.ts",
    "postbuild": "npm run build-quote-index",
    "build-quote-index": "tsx scripts/build-quote-index.ts"
  }
}
```

### Build Scripts

```typescript
// scripts/build-quote-index.ts
import { saveQuoteIndex } from '@/lib/quotes/quote-cache';

console.log('Building quote index...');
saveQuoteIndex();
console.log('✅ Quote index built successfully');
```

---

## Performance Considerations

### Build-Time Optimization

- **Quote index generation**: Pre-compute page-to-quote mapping
- **Caching**: Store in `public/quotes-index.json`
- **Incremental builds**: Only rebuild changed pages

**Expected Impact**:
- Build time increase: <5 seconds for 50 quotes
- Runtime query cost: Zero (pre-computed)

### Runtime Optimization

- **Server components**: No client-side JS for static quotes
- **Image optimization**: Use Next.js Image component
- **Lazy loading**: Background images below fold
- **Preloading**: Critical background images

### Scalability Limits

- **Max quotes**: 100 (recommended)
- **Max quotes per page**: 5 (recommended)
- **Build time at 100 quotes**: ~10 seconds
- **Page weight per quote**: ~100KB (image) + ~500 bytes (data)

---

## Editor Experience

### Creating a New Quote

**Step 1**: Navigate to Keystatic admin
```
https://prelaunch.bearlakecamp.com/keystatic
```

**Step 2**: Go to Collections > Quotes > Create Entry

**Step 3**: Fill in fields:
- Quote Text: "Your testimonial here..."
- Attribution: 1st Time Camper
- Context (optional): Extended quote
- Background Image: Upload or select
- Tagged Pages: ☑ summer-staff, ☑ about
- Category: Camper
- Featured: ☐
- Display Order: 0

**Step 4**: Save → Commit to GitHub

**Step 5**: Wait for deployment (~2 minutes)

**Step 6**: Verify quote appears on tagged pages

### Editing an Existing Quote

- Navigate to Collections > Quotes
- Click quote to edit
- Make changes
- Save → Commit
- Deployment automatic

### Reordering Quotes

- Edit quote's "Display Order" field
- 0 = first, 1 = second, etc.
- Quotes sort automatically on page

---

## Testing Strategy

### Unit Tests

```typescript
// lib/quotes/__tests__/getQuotesForPage.test.ts
import { describe, it, expect } from 'vitest';
import { getQuotesForPage } from '../getQuotesForPage';

describe('getQuotesForPage', () => {
  it('returns quotes tagged to page', async () => {
    const quotes = await getQuotesForPage('summer-staff');
    expect(quotes.length).toBeGreaterThan(0);
    expect(quotes[0]).toHaveProperty('quote');
    expect(quotes[0]).toHaveProperty('attribution');
  });

  it('returns empty array for page with no quotes', async () => {
    const quotes = await getQuotesForPage('page-without-quotes');
    expect(quotes).toEqual([]);
  });

  it('sorts quotes by displayOrder', async () => {
    const quotes = await getQuotesForPage('about');
    const orders = quotes.map(q => q.displayOrder);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
  });
});
```

### Component Tests

```typescript
// components/content/__tests__/QuoteCard.test.tsx
import { render, screen } from '@testing-library/react';
import QuoteCard from '../QuoteCard';

describe('QuoteCard', () => {
  const mockQuote = {
    id: 'test-quote',
    slug: 'test-quote',
    quote: 'Test quote text',
    attribution: 'Test Author',
    category: 'camper' as const,
    taggedPages: ['test-page'],
    featured: false,
    displayOrder: 0,
  };

  it('renders quote text', () => {
    render(<QuoteCard {...mockQuote} variant="card" />);
    expect(screen.getByText('"Test quote text"')).toBeInTheDocument();
  });

  it('renders attribution', () => {
    render(<QuoteCard {...mockQuote} variant="card" />);
    expect(screen.getByText(/Test Author/i)).toBeInTheDocument();
  });

  it('renders overlay variant with background image', () => {
    render(
      <QuoteCard
        {...mockQuote}
        variant="overlay"
        backgroundImage="/test-image.jpg"
      />
    );
    expect(screen.getByRole('img')).toHaveAttribute('src');
  });
});
```

### Integration Tests

```typescript
// app/[slug]/__tests__/page.integration.test.tsx
import { render, screen } from '@testing-library/react';
import Page from '../page';

describe('Page with quotes', () => {
  it('displays quotes tagged to page', async () => {
    const PageComponent = await Page({ params: { slug: 'summer-staff' } });
    render(PageComponent);

    // Verify quote section appears
    expect(screen.getByLabelText(/quotes/i)).toBeInTheDocument();

    // Verify at least one quote
    expect(screen.getByRole('blockquote')).toBeInTheDocument();
  });
});
```

---

## Migration Path (If Existing Quotes)

If quotes currently exist in page content:

**Step 1**: Export existing quotes
```typescript
// scripts/migrate-quotes.ts
import { reader } from '@/lib/keystatic-reader';
import fs from 'fs';

async function migrateQuotes() {
  const pages = await reader.collections.pages.all();
  const quotes = [];

  pages.forEach(page => {
    // Parse page content for quote blocks
    // Extract quote, attribution, page slug
    // Add to quotes array
  });

  // Write to content/quotes/
  quotes.forEach((quote, index) => {
    const filename = `migrated-quote-${index}.mdoc`;
    // Write file...
  });
}
```

**Step 2**: Remove quotes from page content

**Step 3**: Tag migrated quotes to pages

**Step 4**: Verify quotes appear correctly

---

## Future Enhancements

### Phase 2 Features

1. **Quote Carousel**: Rotating testimonials on homepage
2. **Video Quotes**: Support YouTube/Vimeo embeds
3. **Quote Filtering**: Filter by category on quotes page
4. **Analytics**: Track quote engagement (impressions, clicks)
5. **A/B Testing**: Test different quotes on same page

### Phase 3 Features

1. **Quote Submission Form**: Public form for testimonial submissions
2. **Moderation Workflow**: Approve/reject submitted quotes
3. **Quote Search**: Full-text search across all quotes
4. **Export**: Download quotes as CSV/PDF

---

## Acceptance Criteria

### Functional Requirements

- [ ] Editors can create quotes in Keystatic CMS
- [ ] Editors can tag quotes to multiple pages
- [ ] Editors can set display order per page
- [ ] Quotes appear on all tagged pages
- [ ] Quotes sort by display order
- [ ] Quote card matches reference design (overlay variant)
- [ ] Background images display correctly
- [ ] Attribution displays prominently

### Non-Functional Requirements

- [ ] Build time increase <10 seconds for 50 quotes
- [ ] Page load time <500ms for quotes section
- [ ] Quotes are server-rendered (no client JS)
- [ ] Images lazy load below fold
- [ ] Accessible (ARIA labels, semantic HTML)
- [ ] Responsive on all screen sizes
- [ ] Works with JavaScript disabled

### Quality Requirements

- [ ] Unit tests pass (>80% coverage)
- [ ] Integration tests pass
- [ ] Lighthouse score remains >90
- [ ] No TypeScript errors
- [ ] No accessibility violations (axe)

---

## Conclusion

The Quote System architecture provides a scalable, maintainable solution for managing testimonial quotes across the Bear Lake Camp website. The centralized collection approach with page tagging offers:

1. **Editor Efficiency**: Create once, use everywhere
2. **Consistency**: Uniform quote display across pages
3. **Flexibility**: Multiple display variants (overlay, card, inline)
4. **Performance**: Server-rendered, optimized images
5. **Scalability**: Supports up to 100 quotes without performance degradation

**Estimated Effort**: 5 Story Points
**Implementation Timeline**: 1 week (single developer)

---

**Document Version**: 1.0
**Last Updated**: 2025-12-06
**Status**: Ready for Implementation
