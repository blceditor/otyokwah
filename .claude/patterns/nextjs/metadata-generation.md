# Next.js Metadata Generation Patterns

> SEO, OpenGraph, and structured data for Bear Lake Camp

## Static Metadata

### Pattern: Basic Static Metadata
```typescript
// app/about/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | Bear Lake Camp',
  description: 'Learn about Bear Lake Camp, a Christian summer camp in Utah',
};

export default function AboutPage() {
  return <div>About content</div>;
}
```

### Pattern: Full Static Metadata
```typescript
export const metadata: Metadata = {
  title: 'Bear Lake Camp - Christian Summer Camp in Utah',
  description: 'Experience faith, fun, and friendship at Bear Lake Camp.',
  keywords: ['summer camp', 'christian camp', 'utah', 'bear lake'],
  authors: [{ name: 'Bear Lake Camp' }],
  creator: 'Bear Lake Camp',
  publisher: 'Bear Lake Camp',
  openGraph: {
    title: 'Bear Lake Camp',
    description: 'Christian summer camp in beautiful Bear Lake, Utah',
    url: 'https://bearlakecamp.com',
    siteName: 'Bear Lake Camp',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Bear Lake Camp aerial view',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bear Lake Camp',
    description: 'Christian summer camp in Utah',
    images: ['/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
};
```

## Dynamic Metadata

### Pattern: generateMetadata Function
```typescript
// app/[slug]/page.tsx
import { Metadata } from 'next';
import { reader } from '@/lib/keystatic-reader';

export async function generateMetadata({
  params
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const page = await reader.collections.pages.read(params.slug);

  if (!page) {
    return {
      title: 'Page Not Found | Bear Lake Camp',
    };
  }

  return {
    title: `${page.title} | Bear Lake Camp`,
    description: page.description,
    openGraph: {
      title: page.seoTitle || page.title,
      description: page.seoDescription || page.description,
      images: page.ogImage ? [page.ogImage] : ['/og-default.jpg'],
    },
  };
}
```

### Pattern: Blog Post Metadata with Article Type
```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const post = await reader.collections.posts.read(params.slug);

  return {
    title: `${post.title} | Bear Lake Camp Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedDate,
      modifiedTime: post.updatedDate,
      authors: [post.author],
      images: post.featuredImage ? [post.featuredImage] : [],
    },
  };
}
```

## File-Based Metadata

### Pattern: File Conventions
```
app/
├── favicon.ico          # Favicon
├── icon.png             # App icon
├── apple-icon.png       # Apple touch icon
├── opengraph-image.jpg  # Default OG image
├── twitter-image.jpg    # Default Twitter image
├── manifest.ts          # Web app manifest (dynamic)
└── robots.ts            # Robots.txt (dynamic)
```

### Pattern: Dynamic Manifest
```typescript
// app/manifest.ts
import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Bear Lake Camp',
    short_name: 'BLC',
    description: 'Christian summer camp in Utah',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#2563eb',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
```

### Pattern: Dynamic Robots
```typescript
// app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/keystatic/', '/api/'],
    },
    sitemap: 'https://bearlakecamp.com/sitemap.xml',
  };
}
```

## JSON-LD Structured Data

### Pattern: Organization Schema
```typescript
// components/JsonLd.tsx
export function OrganizationJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Bear Lake Camp',
    url: 'https://bearlakecamp.com',
    logo: 'https://bearlakecamp.com/logo.png',
    sameAs: [
      'https://facebook.com/bearlakecamp',
      'https://instagram.com/bearlakecamp',
    ],
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Garden City',
      addressRegion: 'UT',
      addressCountry: 'US',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
```

### Pattern: Event Schema for Camp Sessions
```typescript
export function CampSessionJsonLd({ session }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: session.name,
    description: session.description,
    startDate: session.startDate,
    endDate: session.endDate,
    location: {
      '@type': 'Place',
      name: 'Bear Lake Camp',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Garden City',
        addressRegion: 'UT',
      },
    },
    organizer: {
      '@type': 'Organization',
      name: 'Bear Lake Camp',
    },
    offers: {
      '@type': 'Offer',
      price: session.price,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: session.registrationUrl,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
```

## Bear Lake Camp SEO Fields (Keystatic)

```typescript
// Keystatic schema SEO fields
seoTitle: fields.text({
  label: 'SEO Title (optional)',
  description: 'Overrides title for search engines',
}),
seoDescription: fields.text({
  label: 'SEO Description',
  multiline: true,
  description: 'Shown in search results (150-160 chars)',
}),
ogImage: fields.image({
  label: 'Open Graph Image',
  directory: 'public/images/og',
  publicPath: '/images/og',
}),
noIndex: fields.checkbox({
  label: 'No Index',
  description: 'Prevent search engines from indexing this page',
  defaultValue: false,
}),
```

## Checklist

- [ ] Every page has title and description
- [ ] Dynamic pages use generateMetadata
- [ ] OpenGraph images are 1200x630px
- [ ] Twitter card is summary_large_image
- [ ] JSON-LD schema for organization on homepage
- [ ] robots.ts excludes admin routes
- [ ] sitemap.xml generated dynamically
- [ ] Fallback metadata for missing content

## Antipatterns to Avoid

### Don't: Export Metadata from Client Components
```typescript
// BAD - Client components can't export metadata
'use client';

export const metadata = { title: 'About' }; // Won't work!
```

### Don't: Hardcode URLs
```typescript
// BAD - Hardcoded production URL in dev
openGraph: {
  url: 'https://bearlakecamp.com/about',
}

// GOOD - Use environment variable
openGraph: {
  url: `${process.env.NEXT_PUBLIC_SITE_URL}/about`,
}
```

### Don't: Forget Fallbacks
```typescript
// BAD - No fallback for missing data
export async function generateMetadata({ params }) {
  const page = await reader.collections.pages.read(params.slug);
  return { title: page.title }; // Crashes if page is null!
}

// GOOD - Handle missing data
export async function generateMetadata({ params }) {
  const page = await reader.collections.pages.read(params.slug);
  if (!page) return { title: 'Not Found' };
  return { title: page.title };
}
```

---

**Last Updated**: 2025-12-11
**Used By**: nextjs-vercel-specialist
