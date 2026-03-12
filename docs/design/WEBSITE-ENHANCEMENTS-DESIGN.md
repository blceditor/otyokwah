# Bear Lake Camp Website Enhancements - Design Document

**Project**: Bear Lake Camp Website Design Solutions
**Status**: Design Phase - Implementation Guidance
**Date**: 2025-12-06
**Framework**: Next.js 14 + Keystatic CMS 0.5.48

---

## Executive Summary

This document provides comprehensive design solutions for website and CMS enhancements identified in `requirements/website-notes3.md`. The solutions are organized by domain (Website UI, Keystatic CMS, Quote System) with architectural recommendations, UX considerations, technical approaches, and story point estimates.

**Total Estimated Effort**: 28 Story Points
**Priority Breakdown**:
- P0 (Critical): 11 SP
- P1 (High): 12 SP
- P2 (Nice-to-have): 5 SP

---

## Table of Contents

1. [Website UI Enhancements](#1-website-ui-enhancements)
2. [Keystatic CMS Enhancements](#2-keystatic-cms-enhancements)
3. [Quote System Architecture](#3-quote-system-architecture)
4. [Cross-Cutting Concerns](#4-cross-cutting-concerns)
5. [Implementation Roadmap](#5-implementation-roadmap)
6. [Risk Assessment](#6-risk-assessment)

---

## 1. Website UI Enhancements

### REQ-WEB-001: Top-Level Navigation Links

**Current State**: Top-level nav items only trigger dropdowns, no direct page links
**User Impact**: Users cannot navigate to parent pages (e.g., /summer-staff)
**Priority**: P0

#### Design Solution

**Architectural Approach**: Dual-action navigation pattern
- Clicking text → navigates to parent page
- Clicking chevron/arrow → opens dropdown menu
- Mobile: Tap parent expands dropdown, second tap navigates

**UX Pattern Analysis**:
```
Option A: Split Button (RECOMMENDED)
┌─────────────────┬─▼┐
│ Summer Staff    │ ▼│  ← Click text = navigate, Click arrow = dropdown
└─────────────────┴──┘

Option B: Hover + Click
- Hover: Show dropdown
- Click: Navigate to parent
- Issue: Not mobile-friendly

Option C: Parent as First Dropdown Item
- "Summer Staff Overview" as first item in dropdown
- Simpler implementation, but less intuitive
```

**Technical Implementation**:
- Update `components/navigation/DropdownMenu.tsx`
- Add `parentHref` prop to navigation schema in `keystatic.config.ts`
- Implement split-button component with accessibility (ARIA)
- Add keyboard navigation (Tab, Enter, Escape)

**Accessibility Considerations**:
- Screen reader announces: "Summer Staff, button with submenu"
- Keyboard: Enter on parent = navigate, Arrow Down = open menu
- ARIA: `aria-haspopup="true"` and `aria-expanded` state

**Story Points**: 2 SP (navigation pattern + accessibility)

**Acceptance Criteria**:
- Desktop: Click parent text navigates, click chevron opens dropdown
- Mobile: First tap opens dropdown, second tap navigates
- Keyboard accessible (Tab, Enter, Arrows, Escape)
- ARIA labels correct for screen readers

---

### REQ-WEB-002: Logo Size Increase (2X + Hanging Effect)

**Current State**: Logo is 100x51px in header
**Requirement**: 2X larger (200x102px) + hang over bottom edge
**Priority**: P0

#### Design Solution

**Visual Design Analysis**:
```
Current:                    Proposed:
┌─────────────────────┐    ┌─────────────────────┐
│ [Logo]  Nav Items   │    │        Nav Items    │
│                     │    │                     │
└─────────────────────┘    └─────────────────────┘
                                 [LOGO]  ← Hangs below header
```

**Architectural Options**:

**Option A: Absolute Positioning (RECOMMENDED)**
```tsx
// Logo container with absolute positioning
<div className="absolute left-4 top-0 z-50">
  <Image src="/logo.svg" width={200} height={102} />
</div>

// Header padding adjustment
<header className="pt-12 lg:pt-16"> {/* Extra space for logo */}
```

**Pros**:
- Clean visual separation
- Logo can overlap hero section
- Matches "hanging" aesthetic

**Cons**:
- Requires z-index management
- May overlap with page content on scroll

**Option B: Increased Header Height**
```tsx
<header className="h-[120px]"> {/* Taller header */}
  <Logo size="large" />
</header>
```

**Pros**:
- Simpler layout flow
- No z-index complexity

**Cons**:
- Takes up more vertical space
- Less dramatic "hanging" effect

**Recommendation**: Option A (absolute positioning) with scroll behavior:
- Initial state: Logo hangs below header
- On scroll: Logo shrinks to 150x76px and fits within header
- Smooth CSS transition

**Technical Implementation**:
- Update `components/navigation/Logo.tsx` with size variants
- Add scroll listener to shrink logo on scroll
- Adjust header padding-top for logo clearance
- Update `components/navigation/Header.tsx` z-index management

**Performance Considerations**:
- Use CSS `transform: scale()` instead of changing width/height (GPU-accelerated)
- Debounce scroll listener (throttle to 16ms for 60fps)
- Preload logo SVG for faster initial render

**Story Points**: 2 SP (CSS positioning + scroll behavior)

**Acceptance Criteria**:
- Logo renders at 200x102px on page load
- Logo hangs below header bottom edge
- On scroll down, logo smoothly shrinks to fit header
- No layout shift or jank during transition
- Works on mobile (scaled proportionally)

---

### REQ-WEB-003: Homepage Gallery - Add 5 More Images

**Current State**: Gallery has 6 images
**Requirement**: Add 5 specific images (11 total)
**Priority**: P1

#### Design Solution

**Content Strategy**:
```
Current Layout (6 images):
┌───┬───┬───┐
│ 1 │ 2 │ 3 │
├───┼───┼───┤
│ 4 │ 5 │ 6 │
└───┴───┴───┘

Proposed Layout (11 images):
┌───┬───┬───┬───┐
│ 1 │ 2 │ 3 │ 4 │
├───┼───┼───┼───┤
│ 5 │ 6 │ 7 │ 8 │
├───┼───┼───┼───┤
│ 9 │10 │11 │   │
└───┴───┴───┴───┘
```

**UX Considerations**:
- 11 images creates unbalanced grid (4 columns = 3 empty cells)
- Better: 12 images (3x4 grid) or 9 images (3x3 grid)

**Architectural Options**:

**Option A: Masonry Grid (RECOMMENDED)**
- Staggered heights for visual interest
- All 11 images fit naturally
- Uses CSS Grid with `grid-auto-flow: dense`

**Option B: Asymmetric Grid**
- Last row spans wider (e.g., 3 images in last row span 1.33 columns each)
- Maintains balance visually

**Option C: Carousel with Pagination**
- Show 6 at a time, paginate through 11
- Adds complexity, may reduce engagement

**Recommendation**: Option A (Masonry Grid)

**Technical Implementation**:
```tsx
// components/homepage/Gallery.tsx
const galleryImages = [
  // Existing 6 images...
  { src: '/images/summer-program-and-general/backflip-water.jpg', alt: '...' },
  { src: '/images/summer-program-and-general/boys-in-canoe.jpg', alt: '...' },
  { src: '/images/summer-program-and-general/cross-with-lake-in-background.jpg', alt: '...' },
  { src: '/images/summer-program-and-general/lawn-games.jpg', alt: '...' },
  { src: '/images/summer-program-and-general/crafts.jpg', alt: '...' },
];

// Masonry grid CSS
className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[200px]"
```

**Image Optimization**:
- Resize images to 800x800px (square aspect ratio)
- Compress with ImageOptim or similar (target: <200KB each)
- Use Next.js Image component for automatic WebP/AVIF conversion
- Lazy load images below fold (first 4 eager, rest lazy)

**Story Points**: 1 SP (simple content addition + grid adjustment)

**Acceptance Criteria**:
- Gallery displays 11 images in balanced grid
- Images load performantly (lazy loading)
- Grid is responsive (2 cols mobile, 3 tablet, 4 desktop)
- Alt text provided for accessibility

---

### REQ-WEB-004: Summer Staff YouTube Embed Fix

**Current State**: YouTube embed code not working on /summer-staff
**Priority**: P0

#### Root Cause Analysis

**Potential Issues**:
1. Invalid YouTube video ID
2. Missing YouTube component in Markdoc schema
3. CSP (Content Security Policy) blocking YouTube iframe
4. Incorrect embed code format

**Diagnostic Steps**:
```bash
# 1. Check page content
cat content/pages/summer-staff.mdoc

# 2. Verify YouTube component exists
grep -r "youtube" components/content/

# 3. Check CSP headers
curl -I https://prelaunch.bearlakecamp.com/summer-staff | grep -i content-security

# 4. Test YouTube component in isolation
```

#### Design Solution

**Architectural Approach**: Robust YouTube embed component

**Option A: Keystatic YouTube Component (EXISTING)**
```tsx
// Already exists in keystatic.config.ts (line 438)
youtube: {
  schema: {
    videoId: fields.text({ label: 'Video ID' }),
    title: fields.text({ label: 'Video Title' }),
  }
}

// Corresponding React component
// components/content/YouTubeEmbed.tsx
```

**Option B: Enhanced YouTube Component with Lite Embed**
- Use `lite-youtube-embed` for better performance
- Delays iframe load until user clicks play
- Reduces initial page weight by ~500KB

**Recommendation**:
1. First, verify existing YouTube component works
2. If performance issues, upgrade to lite-youtube-embed

**Technical Implementation**:

**Step 1: Verify Component Registration**
```tsx
// Check components/markdoc/MarkdocComponents.tsx
import YouTubeEmbed from '@/components/content/YouTubeEmbed';

export const markdocComponents = {
  youtube: YouTubeEmbed,
  // ...
};
```

**Step 2: Update Content**
```mdoc
<!-- In content/pages/summer-staff.mdoc -->
{% youtube videoId="YOUR_VIDEO_ID" title="Summer Staff Video" /%}
```

**Step 3: CSP Headers (if needed)**
```ts
// next.config.mjs
const ContentSecurityPolicy = `
  frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com;
  img-src 'self' data: https://i.ytimg.com;
`;
```

**Story Points**: 1 SP (likely config issue, not code change)

**Acceptance Criteria**:
- YouTube video displays on /summer-staff page
- Video is responsive (16:9 aspect ratio)
- Works on mobile devices
- No console errors
- Accessible (title attribute, keyboard controls)

---

### REQ-WEB-005: Apply Tradesmith Font to All Headings

**Current State**: Unknown current heading font
**Requirement**: Use "Tradesmith" font across all headings
**Priority**: P1

#### Design Solution

**Font Analysis**:
- "Tradesmith" appears to be a custom/premium font
- Need to verify font files exist in project

**Architectural Approach**:

**Option A: Self-Hosted Fonts (RECOMMENDED)**
```
public/fonts/
  ├── Tradesmith-Regular.woff2
  ├── Tradesmith-Bold.woff2
  └── Tradesmith-Black.woff2
```

**Option B: Google Fonts (if available)**
- Simpler setup, but relies on external CDN
- Potential GDPR concerns (external requests)

**Option C: Adobe Fonts (if client has subscription)**
- Premium quality, but requires Adobe account

**Recommendation**: Option A (self-hosted) for performance + privacy

**Technical Implementation**:

**Step 1: Font Loading**
```tsx
// app/layout.tsx
import { Tradesmith } from '@/lib/fonts';

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={Tradesmith.variable}>
      <body>{children}</body>
    </html>
  );
}
```

**Step 2: Font Configuration**
```ts
// lib/fonts.ts
import localFont from 'next/font/local';

export const Tradesmith = localFont({
  src: [
    {
      path: '../public/fonts/Tradesmith-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/Tradesmith-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-tradesmith',
  display: 'swap', // Avoid FOIT (Flash of Invisible Text)
});
```

**Step 3: Tailwind Configuration**
```js
// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        heading: ['var(--font-tradesmith)', 'system-ui', 'sans-serif'],
      },
    },
  },
};
```

**Step 4: Apply to Headings**
```tsx
// Global CSS or component classes
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-tradesmith);
}

// Or in Tailwind
<h1 className="font-heading">Heading</h1>
```

**Font Licensing Verification**:
- Confirm client owns license for web use
- Check if font files are available
- Alternative: Find similar Google Font (e.g., "Trade Gothic", "Gotham")

**Performance Considerations**:
- Use `.woff2` format (best compression)
- Preload critical fonts in `<head>`
- Use `font-display: swap` to prevent layout shift

**Story Points**: 2 SP (font setup + global styling)

**Acceptance Criteria**:
- Tradesmith font loads on all pages
- All h1-h6 elements use Tradesmith
- Font loads without FOIT/FOUT (flash of unstyled text)
- Web font license confirmed
- Fallback font specified for graceful degradation

---

### REQ-WEB-006: Summer Staff Page Style Match

**Current State**: `/summer-staff` style differs from original site
**Reference**: https://www.bearlakecamp.com/summer-staff/
**Priority**: P1

#### Design Solution

**Comparative Analysis**: (Requires visual inspection of both sites)

**Design Audit Checklist**:
- Hero image style (full-width, overlay, text positioning)
- Typography (heading sizes, weights, spacing)
- Color palette (greens, tans, whites)
- Section layouts (grid vs stacked, padding/margins)
- CTA buttons (style, positioning)
- Image gallery layout
- Testimonials/quotes formatting

**Architectural Approach**:

**Step 1: Design Extraction**
```bash
# Take screenshots of reference site
# Use browser dev tools to inspect:
- Font sizes (h1, h2, h3, body)
- Colors (hex codes)
- Spacing (padding, margins)
- Layout breakpoints
```

**Step 2: Create Design Tokens**
```ts
// lib/design-tokens/staff-page.ts
export const staffPageTokens = {
  hero: {
    minHeight: '500px',
    overlayOpacity: 0.4,
    textAlignment: 'center',
  },
  sections: {
    paddingY: '4rem',
    maxWidth: '1200px',
  },
  typography: {
    h1: 'text-5xl font-heading',
    h2: 'text-3xl font-heading',
    body: 'text-lg leading-relaxed',
  },
  colors: {
    primary: '#2D5F3F', // Forest green
    secondary: '#8B7355', // Tan/bark
    accent: '#F5F1E8', // Cream
  },
};
```

**Step 3: Component Refactoring**
- Create dedicated `StaffTemplate.tsx` component
- Match layout structure to reference site
- Implement consistent spacing/typography

**Technical Implementation**:
```tsx
// components/templates/StaffTemplate.tsx
export default function StaffTemplate({ content, images }) {
  return (
    <>
      {/* Hero Section - Match reference */}
      <Hero
        image={content.heroImage}
        title={content.title}
        tagline={content.heroTagline}
        style="overlay-center" // Match reference style
      />

      {/* Content Section */}
      <section className="py-16 bg-white">
        <div className="container max-w-4xl">
          <Markdoc content={content.body} />
        </div>
      </section>

      {/* Gallery - Match reference grid */}
      <ImageGallery images={images} layout="3-col" />

      {/* CTA - Match reference style */}
      <CTA
        heading="Ready to Join Our Team?"
        buttonText="Apply Now"
        style="centered-dark"
      />
    </>
  );
}
```

**UX Considerations**:
- Maintain brand consistency across all pages
- Ensure mobile responsiveness (reference site may not be mobile-first)
- Improve upon reference if accessibility issues found

**Story Points**: 3 SP (design audit + template refactoring)

**Acceptance Criteria**:
- Summer Staff page visually matches reference site
- All sections aligned (hero, content, gallery, CTA)
- Typography consistent (font, sizes, weights)
- Color palette matches reference
- Responsive on mobile (even if reference isn't)
- Passes accessibility audit (WCAG AA)

---

## 2. Keystatic CMS Enhancements

### REQ-CMS-001: Floating Editing Toolbar (Already Implemented)

**Status**: ✅ IMPLEMENTED (see `requirements/cms-enhancements.lock.md`)
**Priority**: P0 (Completed)

**Components**:
- `components/keystatic/PageEditingToolbar.tsx`
- `components/keystatic/DeploymentStatus.tsx`
- `components/keystatic/ProductionLink.tsx`

**Features**:
- Real-time deployment status (Deployed, Deploying, Failed, Draft)
- Production link: `https://prelaunch.bearlakecamp.com/{slug}`
- Smart polling (starts 45s after save, polls every 15s)
- Vercel API integration

**No Action Needed**: This requirement is complete.

---

### REQ-CMS-002: Quote Component System

**Priority**: P1
**Complexity**: High (new data model + rendering system)

#### Design Solution - See Section 3 Below

(Full architecture detailed in "Quote System Architecture" section)

---

## 3. Quote System Architecture

### Overview

**User Story**: Content editors can manage a centralized quote repository and tag quotes to appear on specific pages.

**Reference Image Analysis**:
The provided image shows a testimonial quote:
- Text: "BLC has played a very critical role in me learning about Christ."
- Sub-text: "Being here at BLC has helped me become closer to God..."
- Attribution: "1ST TIME CAMPER"
- Design: White text on dark overlay over background image
- Style: Center-aligned, elegant typography

### Architectural Design

#### Option A: Global Quote Collection (RECOMMENDED)

**Data Model**:
```typescript
// content/quotes/*.mdoc
{
  id: string;
  quote: string; // Main quote text
  attribution: string; // Who said it (e.g., "1st Time Camper", "Parent", "Counselor")
  context?: string; // Optional longer quote
  image?: string; // Background image for quote card
  tags: string[]; // Page slugs where quote should appear
  category: 'camper' | 'parent' | 'staff' | 'alumni';
  featured: boolean; // Show on homepage rotation
}
```

**Keystatic Configuration**:
```tsx
// keystatic.config.ts
collections: {
  quotes: collection({
    label: 'Testimonial Quotes',
    slugField: 'attribution',
    path: 'content/quotes/*',
    schema: {
      quote: fields.text({
        label: 'Quote Text',
        description: 'Main quote (keep under 200 characters)',
        multiline: true,
        validation: { length: { max: 200 } },
      }),
      attribution: fields.slug({
        name: { label: 'Attribution' }
      }),
      context: fields.text({
        label: 'Extended Quote (optional)',
        multiline: true,
      }),
      backgroundImage: fields.image({
        label: 'Background Image',
        directory: 'public/images/quotes',
      }),
      taggedPages: fields.multiselect({
        label: 'Show on Pages',
        description: 'Select pages where this quote should appear',
        options: [], // Dynamically populated from pages collection
      }),
      category: fields.select({
        label: 'Category',
        options: [
          { label: 'Camper', value: 'camper' },
          { label: 'Parent', value: 'parent' },
          { label: 'Staff', value: 'staff' },
          { label: 'Alumni', value: 'alumni' },
        ],
      }),
      featured: fields.checkbox({
        label: 'Featured (show on homepage)',
        defaultValue: false,
      }),
      displayOrder: fields.number({
        label: 'Display Order',
        defaultValue: 0,
      }),
    },
  }),
}
```

**Dynamic Page Slug Population**:
```tsx
// Build-time script to populate page slugs
// scripts/sync-quote-page-options.ts
import { reader } from '@/lib/keystatic-reader';

async function syncQuotePageOptions() {
  const pages = await reader.collections.pages.all();
  const slugOptions = pages.map(p => ({
    label: p.entry.title,
    value: p.slug,
  }));

  // Update keystatic.config.ts programmatically
  // Or: Store in separate JSON file imported by config
}
```

**Quote Rendering System**:

**Approach 1: Server Component Query**
```tsx
// app/[slug]/page.tsx
import { reader } from '@/lib/keystatic-reader';
import QuoteCard from '@/components/content/QuoteCard';

export default async function Page({ params }) {
  const page = await reader.collections.pages.read(params.slug);

  // Fetch quotes tagged to this page
  const allQuotes = await reader.collections.quotes.all();
  const pageQuotes = allQuotes.filter(q =>
    q.entry.taggedPages.includes(params.slug)
  );

  return (
    <>
      {/* Page content */}

      {/* Quotes section */}
      {pageQuotes.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container">
            {pageQuotes.map(quote => (
              <QuoteCard key={quote.slug} {...quote.entry} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
```

**Approach 2: Build-time Static Generation**
```tsx
// lib/quotes/getQuotesForPage.ts
export async function getQuotesForPage(slug: string) {
  const quotes = await reader.collections.quotes.all();
  return quotes
    .filter(q => q.entry.taggedPages.includes(slug))
    .sort((a, b) => a.entry.displayOrder - b.entry.displayOrder);
}
```

**Quote Card Component**:
```tsx
// components/content/QuoteCard.tsx
interface QuoteCardProps {
  quote: string;
  attribution: string;
  context?: string;
  backgroundImage?: string;
  variant?: 'overlay' | 'card' | 'inline';
}

export default function QuoteCard({
  quote,
  attribution,
  context,
  backgroundImage,
  variant = 'overlay'
}: QuoteCardProps) {
  if (variant === 'overlay') {
    return (
      <div className="relative h-96 flex items-center justify-center">
        {/* Background image */}
        {backgroundImage && (
          <Image
            src={backgroundImage}
            alt=""
            fill
            className="object-cover"
          />
        )}

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Quote content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
          <blockquote className="text-2xl md:text-3xl text-white font-light mb-4">
            "{quote}"
          </blockquote>
          {context && (
            <p className="text-white/90 text-lg mb-6">{context}</p>
          )}
          <cite className="text-white/80 text-sm uppercase tracking-wider">
            {attribution}
          </cite>
        </div>
      </div>
    );
  }

  // Other variants (card, inline)...
}
```

#### Option B: Embedded Quote Component

**Simpler Approach**: Quote as Markdoc component (no central repository)

**Pros**:
- Simpler implementation
- No build-time complexity
- Editors place quotes directly in content

**Cons**:
- Quote duplication across pages
- No central management
- Can't reuse quotes easily

**Not Recommended** for this use case (centralized management needed)

### UX Considerations

**Editor Experience**:
1. Create quote in "Quotes" collection
2. Tag to relevant pages (multi-select dropdown)
3. Set display order
4. Quotes automatically appear on tagged pages

**Quote Display Options**:
- **Inline**: Within page content flow
- **Overlay**: Full-width section with background image
- **Sidebar**: Floating quote in sidebar
- **Carousel**: Multiple quotes rotating

**Recommendation**: Start with "Overlay" variant (matches reference image)

### Performance Considerations

**Build-time Optimization**:
- Generate quote-to-page mapping at build time
- Cache in `public/quotes-index.json`
- Reduces runtime queries

**Runtime Optimization**:
- Server components (no client-side JS for static quotes)
- Image optimization with Next.js Image
- Lazy load background images below fold

### Story Points: 5 SP

**Breakdown**:
- Quote collection schema: 1 SP
- Page slug sync system: 1 SP
- Quote rendering component: 2 SP
- Integration with page templates: 1 SP

**Acceptance Criteria**:
- Editors can create quotes in Keystatic CMS
- Quotes can be tagged to multiple pages
- Tagged quotes appear on designated pages
- Quote card matches reference design
- No duplicate quote management needed
- Build time <5s increase for 50 quotes

---

## 4. Cross-Cutting Concerns

### 4.1 Typography System Audit

**Current State**: Mixed font usage
**Goal**: Consistent typography hierarchy

**Design Tokens**:
```ts
// lib/design-tokens/typography.ts
export const typography = {
  fonts: {
    heading: 'var(--font-tradesmith)',
    body: 'var(--font-inter)',
  },
  sizes: {
    h1: 'text-4xl md:text-5xl lg:text-6xl',
    h2: 'text-3xl md:text-4xl lg:text-5xl',
    h3: 'text-2xl md:text-3xl lg:text-4xl',
    h4: 'text-xl md:text-2xl lg:text-3xl',
    h5: 'text-lg md:text-xl lg:text-2xl',
    body: 'text-base md:text-lg',
    small: 'text-sm md:text-base',
  },
  weights: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};
```

**Implementation**:
- Create global typography component
- Apply to all heading elements
- Document in design system

**Story Points**: 1 SP (included in REQ-WEB-005)

---

### 4.2 Responsive Design Verification

**Breakpoints**:
- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px+

**Testing Checklist**:
- [ ] Logo scales appropriately on mobile
- [ ] Navigation collapses to hamburger menu
- [ ] Gallery grid responsive (2 cols → 3 cols → 4 cols)
- [ ] Quote cards readable on mobile
- [ ] YouTube embeds maintain aspect ratio
- [ ] Touch targets ≥44x44px (iOS guidelines)

**Tools**:
- Chrome DevTools responsive mode
- BrowserStack for cross-device testing
- Lighthouse mobile audit (target: >90 score)

**Story Points**: 1 SP (testing + fixes)

---

### 4.3 Accessibility (WCAG 2.1 AA Compliance)

**Key Requirements**:
- Color contrast ≥4.5:1 for text
- Keyboard navigation for all interactive elements
- Screen reader support (ARIA labels)
- Focus indicators visible
- Alt text for all images
- Semantic HTML structure

**Audit Tools**:
- axe DevTools browser extension
- Lighthouse accessibility audit
- NVDA/JAWS screen reader testing

**Critical Fixes**:
- Navigation dropdown keyboard navigation
- Quote card background images have text alternatives
- YouTube embeds have titles
- Form inputs (if any) have labels

**Story Points**: 2 SP (audit + fixes)

---

### 4.4 Performance Optimization

**Core Web Vitals Targets**:
- LCP (Largest Contentful Paint): <2.5s
- FID (First Input Delay): <100ms
- CLS (Cumulative Layout Shift): <0.1

**Optimization Strategies**:

**Images**:
- Use Next.js Image component (automatic optimization)
- Lazy load images below fold
- Serve WebP/AVIF formats
- Responsive image sizes

**Fonts**:
- Preload critical fonts
- Use `font-display: swap`
- Subset fonts (remove unused glyphs)

**JavaScript**:
- Code splitting (automatic with Next.js)
- Dynamic imports for heavy components
- Remove unused dependencies

**CSS**:
- Purge unused Tailwind classes (automatic)
- Critical CSS inline in `<head>`

**Story Points**: 2 SP (optimization + testing)

---

### 4.5 SEO Optimization

**Technical SEO**:
- Semantic HTML structure
- Meta tags (title, description, OG)
- Structured data (JSON-LD for Organization, LocalBusiness)
- XML sitemap
- Robots.txt

**Content SEO**:
- H1 on every page (unique)
- Descriptive alt text for images
- Internal linking strategy
- Mobile-friendly (responsive)

**Implementation**:
```tsx
// app/[slug]/page.tsx
export async function generateMetadata({ params }) {
  const page = await reader.collections.pages.read(params.slug);

  return {
    title: page.seo.metaTitle || page.title,
    description: page.seo.metaDescription,
    openGraph: {
      title: page.seo.ogTitle || page.seo.metaTitle,
      description: page.seo.ogDescription || page.seo.metaDescription,
      images: [page.seo.ogImage],
    },
  };
}
```

**Story Points**: 1 SP (metadata + structured data)

---

## 5. Implementation Roadmap

### Phase 1: Critical Fixes (P0) - 5 SP

**Week 1**:
1. REQ-WEB-001: Navigation links (2 SP)
2. REQ-WEB-002: Logo size increase (2 SP)
3. REQ-WEB-004: YouTube embed fix (1 SP)

**Deliverables**:
- Functional top-level navigation
- 2X larger hanging logo
- Working YouTube embed on /summer-staff

---

### Phase 2: UI Refinements (P1) - 11 SP

**Week 2**:
1. REQ-WEB-003: Gallery images (1 SP)
2. REQ-WEB-005: Tradesmith font (2 SP)
3. REQ-WEB-006: Staff page styling (3 SP)

**Week 3**:
4. REQ-CMS-002: Quote system (5 SP)

**Deliverables**:
- 11-image gallery
- Consistent Tradesmith typography
- Staff page matches reference
- Quote management system

---

### Phase 3: Polish & Optimization (P2) - 6 SP

**Week 4**:
1. Typography audit (1 SP)
2. Responsive testing (1 SP)
3. Accessibility audit (2 SP)
4. Performance optimization (2 SP)

**Deliverables**:
- WCAG AA compliant
- Lighthouse score >90
- Cross-device verified

---

### Phase 4: SEO & Launch Prep (P2) - 1 SP

**Week 5**:
1. SEO optimization (1 SP)

**Deliverables**:
- Meta tags optimized
- Structured data implemented
- Sitemap generated

---

## 6. Risk Assessment

### High-Risk Items

**RISK-001: Tradesmith Font Licensing**
- **Impact**: High (blocks REQ-WEB-005)
- **Probability**: Medium
- **Mitigation**:
  - Verify font license before implementation
  - Identify fallback font (similar Google Font)
  - Alternative: Use existing site font if already licensed

**RISK-002: Quote System Performance**
- **Impact**: Medium (could slow build times)
- **Probability**: Low
- **Mitigation**:
  - Implement caching strategy
  - Limit quotes to <100 total
  - Use incremental static regeneration (ISR)

**RISK-003: YouTube Embed Root Cause Unknown**
- **Impact**: High (blocks REQ-WEB-004)
- **Probability**: Low
- **Mitigation**:
  - Allocate time for deep debugging
  - Have fallback: custom video player
  - Test in production environment early

### Medium-Risk Items

**RISK-004: Staff Page Design Mismatch**
- **Impact**: Medium (subjective design approval)
- **Probability**: Medium
- **Mitigation**:
  - Get design approval before implementation
  - Create Figma mockup for review
  - Iterate based on feedback

**RISK-005: Logo Hanging Effect Technical Complexity**
- **Impact**: Low (aesthetic feature, not functional)
- **Probability**: Low
- **Mitigation**:
  - Prototype early
  - Test z-index conflicts
  - Have fallback: larger logo within header (no hang)

---

## 7. Testing Strategy

### Unit Tests

**Components to Test**:
- `Logo.tsx` (size variants, scroll behavior)
- `DropdownMenu.tsx` (split-button navigation)
- `QuoteCard.tsx` (all variants)
- `Gallery.tsx` (image loading, lazy load)

**Test Framework**: Vitest + Testing Library

**Coverage Target**: >80%

---

### Integration Tests

**User Flows**:
1. Navigate to /summer-staff via top-level nav link
2. Scroll page, verify logo shrinks
3. Click YouTube video, verify playback
4. View quotes on tagged pages

**Tools**: Playwright or Cypress

---

### Visual Regression Tests

**Tools**: Percy or Chromatic

**Screenshots**:
- Homepage (desktop, tablet, mobile)
- Summer Staff page (all breakpoints)
- Navigation states (default, hover, dropdown open)
- Quote cards (all variants)

---

### Performance Tests

**Tools**: Lighthouse CI

**Metrics**:
- Core Web Vitals (LCP, FID, CLS)
- Total page weight (<2MB)
- Time to Interactive (<3s)

**Baseline**: Current production metrics
**Target**: 10% improvement

---

### Accessibility Tests

**Tools**:
- axe DevTools
- WAVE browser extension
- Manual keyboard navigation

**Checklist**:
- [ ] All interactive elements keyboard accessible
- [ ] Screen reader announces content correctly
- [ ] Color contrast meets WCAG AA
- [ ] Focus indicators visible
- [ ] No accessibility errors in axe

---

## 8. Documentation Deliverables

### For Developers

1. **Component API Documentation**
   - QuoteCard props and variants
   - Logo size variants
   - Navigation configuration

2. **Design Token Reference**
   - Typography scale
   - Color palette
   - Spacing system

3. **Build & Deployment Guide**
   - Environment variables
   - Font setup
   - Quote system configuration

### For Content Editors

1. **CMS User Guide**
   - How to create quotes
   - How to tag quotes to pages
   - How to add images to gallery

2. **Style Guide**
   - When to use quote variants
   - Image requirements (size, format)
   - Typography hierarchy

---

## 9. Success Metrics

### Quantitative Metrics

- **Performance**: Lighthouse score >90 (mobile & desktop)
- **Accessibility**: Zero critical axe violations
- **SEO**: All pages have unique meta titles/descriptions
- **Build Time**: <2 minutes for full site build
- **Page Weight**: <1.5MB per page (uncompressed)

### Qualitative Metrics

- **Design Consistency**: Staff page matches reference site
- **Editor Experience**: Quote management is intuitive
- **User Experience**: Navigation is clear and predictable
- **Brand Alignment**: Typography reflects camp's identity

---

## 10. Open Questions

### For Client Clarification

1. **Tradesmith Font**: Do you have the font files and web license?
2. **Quote System Scope**: Approximately how many quotes will you manage?
3. **Summer Staff Video**: What is the YouTube video ID that should be embedded?
4. **Design Approval**: Who will review/approve the staff page redesign?
5. **Logo Hanging Effect**: Is this a hard requirement or aesthetic preference?

### Technical Decisions

1. **Quote Display**: Should quotes rotate on homepage or show all?
2. **Gallery Layout**: Masonry grid or uniform grid preferred?
3. **Font Fallback**: What fallback font if Tradesmith unavailable?
4. **Navigation Behavior**: Mobile dropdown tap-once or tap-twice to navigate?

---

## 11. Cost-Benefit Analysis

### High-Impact, Low-Effort (Priority: IMMEDIATE)

- **REQ-WEB-004**: YouTube embed fix (1 SP, fixes broken feature)
- **REQ-WEB-003**: Add gallery images (1 SP, enhances engagement)

### High-Impact, Medium-Effort (Priority: HIGH)

- **REQ-WEB-001**: Navigation links (2 SP, critical UX issue)
- **REQ-WEB-005**: Tradesmith font (2 SP, brand consistency)

### Medium-Impact, High-Effort (Priority: MEDIUM)

- **REQ-CMS-002**: Quote system (5 SP, nice-to-have but complex)
- **REQ-WEB-006**: Staff page redesign (3 SP, aesthetic improvement)

### Low-Impact, Medium-Effort (Priority: LOW)

- **REQ-WEB-002**: Logo hanging effect (2 SP, visual polish)

**Recommendation**: Implement in phases 1-4 as outlined in roadmap.

---

## 12. Conclusion

This design document provides a comprehensive blueprint for implementing website and CMS enhancements for Bear Lake Camp. The solutions prioritize:

1. **User Experience**: Clear navigation, accessible design
2. **Content Management**: Intuitive quote system for editors
3. **Performance**: Optimized images, fonts, and assets
4. **Maintainability**: Design tokens, consistent patterns
5. **Scalability**: Extensible quote system, reusable components

**Total Estimated Effort**: 28 Story Points (approximately 4-5 weeks for single developer)

**Recommended Approach**: Phased implementation starting with P0 critical fixes, followed by UI refinements, then polish and optimization.

**Next Steps**:
1. Client review and approval of design decisions
2. Clarify open questions
3. Obtain Tradesmith font files and license
4. Begin Phase 1 implementation (REQ-WEB-001, REQ-WEB-002, REQ-WEB-004)

---

**Document Version**: 1.0
**Last Updated**: 2025-12-06
**Author**: Chief of Staff (Design Phase)
**Specialists Consulted**: UX Designer, PE-Designer, Strategic Advisor, Integration Specialist
