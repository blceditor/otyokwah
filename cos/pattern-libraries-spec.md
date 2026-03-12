# Pattern Libraries Specification

> Curated knowledge base for Next.js + Keystatic + Vercel stack

**Purpose**: Each specialist loads relevant patterns before implementing
**Format**: Markdown files with code examples, antipatterns, and checklists
**Location**: `.claude/patterns/` organized by technology

---

## Directory Structure

```
.claude/
├── patterns/
│   ├── nextjs/
│   │   ├── app-router-patterns.md
│   │   ├── metadata-generation.md
│   │   ├── server-components-best-practices.md
│   │   └── route-handlers.md
│   ├── vercel/
│   │   ├── deployment-patterns.md
│   │   ├── isr-patterns.md
│   │   ├── edge-middleware-patterns.md
│   │   └── environment-variables.md
│   ├── keystatic/
│   │   ├── schema-design-patterns.md
│   │   ├── field-types-reference.md
│   │   ├── collection-relationships.md
│   │   ├── migration-strategies.md
│   │   └── content-components.md
│   ├── react/
│   │   ├── server-client-components.md
│   │   ├── component-composition-patterns.md
│   │   └── hooks-best-practices.md
│   ├── tailwind/
│   │   ├── responsive-design-patterns.md
│   │   ├── utility-first-styling.md
│   │   └── theme-configuration.md
│   └── accessibility/
│       ├── wcag-compliance.md
│       ├── keyboard-navigation.md
│       └── aria-patterns.md
├── examples/
│   ├── nextjs/
│   ├── keystatic/
│   ├── react/
│   └── tailwind/
└── antipatterns/
    ├── nextjs/
    ├── keystatic/
    ├── react/
    └── accessibility/
```

---

## Pattern Library Content Specifications

### Next.js Patterns

#### `.claude/patterns/nextjs/app-router-patterns.md`

**Purpose**: File-based routing conventions, route organization, special files

**Content**:
```markdown
# Next.js App Router Patterns

## Route Organization

### Pattern: Feature-Based Routes
```
app/
├── (marketing)/       # Route group (not in URL)
│   ├── page.tsx      # Homepage
│   ├── about/
│   └── contact/
├── (content)/
│   ├── [slug]/
│   │   └── page.tsx  # Dynamic route
│   └── blog/
└── api/              # API routes
```

### Pattern: Dynamic Routes
- Single param: `[slug]`
- Catch-all: `[...slug]`
- Optional catch-all: `[[...slug]]`

### Pattern: Parallel Routes
- `@modal` - Modal overlay
- `@sidebar` - Sidebar slot

### Pattern: Intercepting Routes
- `(.)folder` - Same level
- `(..)folder` - One level up

## Special Files

- `page.tsx` - Page component (required for route)
- `layout.tsx` - Shared layout
- `loading.tsx` - Loading UI (Suspense boundary)
- `error.tsx` - Error UI (Error boundary)
- `not-found.tsx` - 404 page
- `route.ts` - API route handler

## Checklist
- [ ] Route groups use (parentheses) to organize without affecting URL
- [ ] Dynamic routes use [brackets]
- [ ] Each route has page.tsx
- [ ] Layouts wrap all child routes
```

#### `.claude/patterns/nextjs/metadata-generation.md`

**Content**: Static metadata, dynamic metadata, OpenGraph, file-based metadata (see nextjs-vercel-specialist.md § Metadata Generation for full content)

#### `.claude/patterns/nextjs/server-components-best-practices.md`

**Content**: When to use Server Components, data fetching patterns, composition with Client Components (see nextjs-vercel-specialist.md § Server Components Best Practices)

### Vercel Patterns

#### `.claude/patterns/vercel/deployment-patterns.md`

**Purpose**: Vercel-specific deployment, environment variables, build configuration

**Content**:
```markdown
# Vercel Deployment Patterns

## Environment Variables

### Pattern: Environment-Specific Variables
- **Production**: Set in Vercel Dashboard → Settings → Environment Variables
- **Preview**: Separate preview variables (different API keys)
- **Development**: `.env.local` (gitignored)

### Pattern: Public vs Server Variables
```typescript
// Server-only (accessed in Server Components/API routes)
const SECRET_KEY = process.env.SECRET_KEY;

// Public (accessed in Client Components)
const PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;
```

## Build Configuration

### Pattern: vercel.json Configuration
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "installCommand": "npm install",
  "redirects": [
    { "source": "/old", "destination": "/new", "permanent": true }
  ]
}
```

### Pattern: next.config.mjs for Build Optimization
```javascript
export default {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};
```

## Deployment Workflow

1. Push to GitHub → Vercel webhook triggered
2. Vercel builds (npm run build)
3. Deploys to edge network
4. x-vercel-id header contains deployment ID
5. Check deployment status via Vercel API or dashboard

## Checklist
- [ ] Environment variables set in Vercel Dashboard (not committed)
- [ ] NEXT_PUBLIC_ prefix for client-side variables
- [ ] vercel.json exists with framework: nextjs
- [ ] Redirects configured in vercel.json (not in code)
```

#### `.claude/patterns/vercel/isr-patterns.md`

**Purpose**: Incremental Static Regeneration, revalidation strategies

**Content**:
```markdown
# Vercel ISR Patterns

## Pattern: Time-Based Revalidation
```typescript
// app/blog/page.tsx
export const revalidate = 3600; // Revalidate every hour

export default async function BlogPage() {
  const posts = await fetchPosts();
  return <PostList posts={posts} />;
}
```

## Pattern: On-Demand Revalidation
```typescript
// app/api/revalidate/route.ts
import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');

  if (secret !== process.env.REVALIDATE_SECRET) {
    return Response.json({ message: 'Invalid secret' }, { status: 401 });
  }

  const path = request.nextUrl.searchParams.get('path');
  if (path) {
    revalidatePath(path);
    return Response.json({ revalidated: true, path });
  }

  return Response.json({ message: 'Missing path' }, { status: 400 });
}
```

## Pattern: Cache Tags for Granular Revalidation
```typescript
// Fetch with cache tags
export default async function Page() {
  const data = await fetch('https://api.example.com/posts', {
    next: { tags: ['posts'] }
  });

  return <div>{/* render */}</div>;
}

// Revalidate by tag
import { revalidateTag } from 'next/cache';
revalidateTag('posts'); // Revalidates all fetches with 'posts' tag
```

## Checklist
- [ ] Use revalidate export for time-based ISR
- [ ] Use revalidatePath for on-demand path revalidation
- [ ] Use revalidateTag for granular cache invalidation
- [ ] Protect revalidation endpoints with secret
```

### Keystatic Patterns

#### `.claude/patterns/keystatic/schema-design-patterns.md`

**Purpose**: Collection design, field organization, best practices

**Content**:
```markdown
# Keystatic Schema Design Patterns

## Pattern: Basic Collection
```typescript
pages: collection({
  label: 'Pages',
  slugField: 'title',
  path: 'content/pages/*',
  schema: {
    title: fields.text({ label: 'Title' }),
    content: fields.document({ label: 'Content' }),
  },
}),
```

## Pattern: Conditional Fields (Template System)
```typescript
pages: collection({
  schema: {
    title: fields.text({ label: 'Title' }),
    templateFields: fields.conditional(
      fields.select({
        label: 'Template',
        options: [
          { label: 'Homepage', value: 'homepage' },
          { label: 'Standard', value: 'standard' },
        ],
        defaultValue: 'standard',
      }),
      {
        homepage: fields.object({
          heroImages: fields.array(fields.image({ label: 'Image' })),
          featuredPosts: fields.array(
            fields.relationship({ collection: 'posts' })
          ),
        }),
        standard: fields.object({
          showSidebar: fields.checkbox({ label: 'Show sidebar' }),
        }),
      }
    ),
  },
}),
```

## Pattern: SEO Fields
```typescript
pages: collection({
  schema: {
    title: fields.text({ label: 'Title' }),
    content: fields.document({ label: 'Content' }),
    // SEO fields
    seoTitle: fields.text({
      label: 'SEO Title (optional)',
      description: 'Overrides title for search engines',
    }),
    seoDescription: fields.text({
      label: 'SEO Description',
      multiline: true,
      description: 'Shown in search results',
    }),
    ogImage: fields.image({
      label: 'Open Graph Image (optional)',
      description: 'Used for social media previews',
    }),
  },
}),
```

## Checklist
- [ ] Collection has descriptive label
- [ ] Slug field configured (or using default title)
- [ ] Path matches content directory structure
- [ ] Required fields clearly marked
- [ ] SEO fields included for public pages
```

#### `.claude/patterns/keystatic/field-types-reference.md`

**Purpose**: Comprehensive reference for all Keystatic field types

**Content**:
```markdown
# Keystatic Field Types Reference

## Text Fields

### fields.text()
```typescript
title: fields.text({
  label: 'Title',
  description: 'Page title shown in navigation',
  validation: { length: { min: 1, max: 100 } },
})
```

### fields.text() with multiline
```typescript
description: fields.text({
  label: 'Description',
  multiline: true,
  description: 'Short description (2-3 sentences)',
})
```

## Media Fields

### fields.image()
```typescript
photo: fields.image({
  label: 'Staff Photo',
  directory: 'public/images/staff',
  publicPath: '/images/staff',
  validation: {
    isRequired: true,
  },
})
```

## Content Fields

### fields.document()
```typescript
content: fields.document({
  label: 'Page Content',
  formatting: true, // Bold, italic, etc.
  links: true,      // Link insertion
  images: true,     // Image insertion
  dividers: true,   // Horizontal rules
  layouts: [        // Column layouts
    [1, 1],         // 2 columns
    [1, 1, 1],      // 3 columns
  ],
})
```

## Relationship Fields

### fields.relationship()
```typescript
category: fields.relationship({
  label: 'Category',
  collection: 'categories',
  validation: { isRequired: true },
})
```

## Structured Fields

### fields.array()
```typescript
tags: fields.array(
  fields.text({ label: 'Tag' }),
  {
    label: 'Tags',
    itemLabel: props => props.value,
  }
)
```

### fields.object()
```typescript
author: fields.object({
  name: fields.text({ label: 'Name' }),
  email: fields.text({ label: 'Email' }),
  bio: fields.text({ label: 'Bio', multiline: true }),
})
```

## Utility Fields

### fields.checkbox()
```typescript
published: fields.checkbox({
  label: 'Published',
  defaultValue: false,
})
```

### fields.select()
```typescript
status: fields.select({
  label: 'Status',
  options: [
    { label: 'Draft', value: 'draft' },
    { label: 'Published', value: 'published' },
  ],
  defaultValue: 'draft',
})
```

### fields.date()
```typescript
publishedDate: fields.date({
  label: 'Published Date',
  defaultValue: { kind: 'today' },
})
```

## Checklist
- [ ] All fields have descriptive labels
- [ ] Validation specified for required fields
- [ ] Default values set where appropriate
- [ ] Description provided for complex fields
```

### React Patterns

#### `.claude/patterns/react/server-client-components.md`

**Purpose**: When to use Server vs Client Components, composition patterns

**Content**: (See react-frontend-specialist.md § Server Components, Client Components)

### Tailwind Patterns

#### `.claude/patterns/tailwind/responsive-design-patterns.md`

**Purpose**: Mobile-first responsive design, breakpoint usage

**Content**:
```markdown
# Tailwind Responsive Design Patterns

## Mobile-First Approach

### Pattern: Progressive Enhancement
```tsx
// Start with mobile styles, add breakpoints for larger screens
<div className="
  grid
  grid-cols-1        // Mobile: 1 column
  sm:grid-cols-2     // Tablet: 2 columns (640px+)
  lg:grid-cols-3     // Desktop: 3 columns (1024px+)
  gap-4
">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>
```

## Breakpoint Reference

- **sm**: 640px (small tablets)
- **md**: 768px (tablets)
- **lg**: 1024px (laptops)
- **xl**: 1280px (desktops)
- **2xl**: 1536px (large desktops)

## Common Responsive Patterns

### Pattern: Responsive Typography
```tsx
<h1 className="
  text-2xl          // Mobile: 1.5rem
  md:text-4xl       // Tablet: 2.25rem
  lg:text-6xl       // Desktop: 3.75rem
  font-bold
">
  Heading
</h1>
```

### Pattern: Responsive Spacing
```tsx
<div className="
  p-4              // Mobile: 1rem padding
  md:p-6           // Tablet: 1.5rem
  lg:p-8           // Desktop: 2rem
">
  Content
</div>
```

### Pattern: Show/Hide on Breakpoints
```tsx
<nav>
  {/* Mobile menu button (hidden on desktop) */}
  <button className="lg:hidden">Menu</button>

  {/* Desktop nav (hidden on mobile) */}
  <div className="hidden lg:flex lg:gap-4">
    <a href="/about">About</a>
    <a href="/contact">Contact</a>
  </div>
</nav>
```

## Checklist
- [ ] Base styles work on mobile (320px width)
- [ ] Breakpoints progress from small to large (mobile-first)
- [ ] Test at all breakpoints (sm, md, lg, xl)
- [ ] Touch targets ≥44px on mobile (for buttons, links)
```

### Accessibility Patterns

#### `.claude/patterns/accessibility/wcag-compliance.md`

**Purpose**: WCAG 2.1 AA compliance checklist, common patterns

**Content**:
```markdown
# WCAG 2.1 AA Compliance Patterns

## Perceivable

### Pattern: Text Alternatives
```tsx
// Images
<img src="/photo.jpg" alt="John Smith speaking at camp chapel" />

// Decorative images
<img src="/decoration.svg" alt="" role="presentation" />

// Icon buttons
<button aria-label="Close menu">
  <XIcon aria-hidden="true" />
</button>
```

### Pattern: Color Contrast
```tsx
// Use Tailwind colors that meet 4.5:1 contrast ratio
<div className="bg-white text-gray-900">    // ✓ Pass: 21:1
<div className="bg-gray-100 text-gray-700"> // ✓ Pass: 5.9:1
<div className="bg-blue-600 text-white">    // ✓ Pass: 8.6:1

// Avoid insufficient contrast
<div className="bg-gray-100 text-gray-400"> // ✗ Fail: 2.5:1
```

## Operable

### Pattern: Keyboard Navigation
```tsx
// Interactive elements must be keyboard accessible
<button
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
  className="focus:outline-none focus:ring-2 focus:ring-blue-500"
>
  Click me
</button>

// Skip to main content link
<a href="#main" className="sr-only focus:not-sr-only">
  Skip to main content
</a>
```

### Pattern: Focus Visible
```tsx
// Always show focus indicator
<a href="/about" className="
  focus:outline-none
  focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
  transition-shadow
">
  About
</a>
```

## Understandable

### Pattern: Form Labels
```tsx
// Always associate labels with inputs
<label htmlFor="email" className="block text-sm font-medium">
  Email Address
</label>
<input
  id="email"
  type="email"
  aria-required="true"
  aria-describedby="email-help"
  className="mt-1 block w-full"
/>
<p id="email-help" className="text-sm text-gray-500">
  We'll never share your email
</p>
```

### Pattern: Error Messages
```tsx
// Associate error messages with inputs
<input
  id="email"
  type="email"
  aria-invalid={hasError}
  aria-describedby="email-error"
/>
{hasError && (
  <p id="email-error" className="text-red-600" role="alert">
    Please enter a valid email address
  </p>
)}
```

## Robust

### Pattern: Semantic HTML
```tsx
// Use semantic elements
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/about">About</a></li>
  </ul>
</nav>

<main id="main">
  <article>
    <h1>Page Title</h1>
    <section>
      <h2>Section Title</h2>
    </section>
  </article>
</main>

<footer>
  <p>&copy; 2025 Bear Lake Camp</p>
</footer>
```

## Checklist
- [ ] All images have alt text (descriptive or empty if decorative)
- [ ] Color contrast ≥4.5:1 for text, ≥3:1 for large text
- [ ] All interactive elements keyboard accessible (Tab, Enter, Space)
- [ ] Focus indicators visible (focus:ring)
- [ ] Form inputs have associated labels
- [ ] Error messages linked to inputs (aria-describedby)
- [ ] Semantic HTML (nav, main, article, section, footer)
- [ ] ARIA attributes used correctly (role, aria-label, aria-labelledby)
```

---

## Antipatterns Documentation

### `.claude/antipatterns/nextjs/dont-mix-server-client-components.md`

```markdown
# Antipattern: Mixing Server and Client Component APIs

## What NOT to Do

### ❌ Using Client-Side Hooks in Server Components
```typescript
// BAD - Server Component using useState
export default async function Page() {
  const [count, setCount] = useState(0); // ERROR
  const data = await fetchData();
  return <div>{count}</div>;
}
```

### ❌ Using Server-Side APIs in Client Components
```typescript
// BAD - Client Component trying to read filesystem
'use client';
import fs from 'fs';

export default function Component() {
  const data = fs.readFileSync('./data.json'); // ERROR: fs not available in browser
  return <div>{data}</div>;
}
```

## Correct Patterns

### ✓ Composition: Server Component wraps Client Component
```typescript
// Server Component (default)
export default async function Page() {
  const data = await fetchData(); // Server-side
  return <ClientCounter initialData={data} />;
}

// Client Component
'use client';
export function ClientCounter({ initialData }) {
  const [count, setCount] = useState(initialData);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

## Why This Matters

- **Server Components**: Run on server, can access databases/filesystems, no client-side bundle
- **Client Components**: Run in browser, can use hooks/events, added to bundle

Mixing their APIs causes build errors and runtime failures.

## Detection

Run: `python scripts/implementation/server-client-boundary-checker.py`

This script catches:
- useState/useEffect in Server Components
- Node.js APIs (fs, path) in Client Components
- Missing 'use client' directive
```

---

## Examples Directory

### `.claude/examples/nextjs/dynamic-route-with-metadata.tsx`

```typescript
// app/blog/[slug]/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { reader } from '@/lib/keystatic-reader';

export async function generateStaticParams() {
  const posts = await reader.collections.posts.all();
  return posts.map(post => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await reader.collections.posts.read(params.slug);

  if (!post) {
    return { title: 'Not Found' };
  }

  return {
    title: `${post.title} | Bear Lake Camp Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.featuredImage ? [post.featuredImage] : [],
      type: 'article',
      publishedTime: post.publishedDate,
    },
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await reader.collections.posts.read(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <article>
      <h1>{post.title}</h1>
      <time dateTime={post.publishedDate}>{post.publishedDate}</time>
      <div>{post.content}</div>
    </article>
  );
}
```

### `.claude/examples/keystatic/schema-with-conditional-fields.ts`

```typescript
// keystatic.config.ts
import { config, collection, fields } from '@keystatic/core';

export default config({
  storage: { kind: 'github', repo: 'sparkst/bearlakecamp' },
  collections: {
    pages: collection({
      label: 'Pages',
      slugField: 'title',
      path: 'content/pages/*',
      schema: {
        title: fields.text({ label: 'Title' }),
        description: fields.text({ label: 'Description', multiline: true }),

        // Conditional template fields
        templateFields: fields.conditional(
          fields.select({
            label: 'Page Template',
            options: [
              { label: 'Homepage', value: 'homepage' },
              { label: 'Standard Page', value: 'standard' },
              { label: 'Contact Page', value: 'contact' },
            ],
            defaultValue: 'standard',
          }),
          {
            homepage: fields.object({
              heroImages: fields.array(
                fields.object({
                  image: fields.image({ label: 'Image' }),
                  alt: fields.text({ label: 'Alt text' }),
                  caption: fields.text({ label: 'Caption', multiline: true }),
                }),
                { label: 'Hero Carousel Images', itemLabel: props => props.fields.alt.value }
              ),
              galleryImages: fields.array(
                fields.image({ label: 'Gallery Image' }),
                { label: 'Photo Gallery' }
              ),
              featuredPosts: fields.array(
                fields.relationship({ collection: 'posts', label: 'Post' }),
                { label: 'Featured Blog Posts' }
              ),
            }),
            standard: fields.object({
              showSidebar: fields.checkbox({ label: 'Show sidebar' }),
              sidebarContent: fields.document({ label: 'Sidebar content' }),
            }),
            contact: fields.object({
              contactEmail: fields.text({ label: 'Contact email' }),
              contactPhone: fields.text({ label: 'Contact phone' }),
              officeHours: fields.text({ label: 'Office hours', multiline: true }),
            }),
          }
        ),

        content: fields.document({
          label: 'Page Content',
          formatting: true,
          links: true,
          images: true,
        }),
      },
    }),
  },
});
```

---

## Implementation Priority

### Phase 1 (Week 1): Core Patterns
1. `.claude/patterns/nextjs/app-router-patterns.md`
2. `.claude/patterns/nextjs/metadata-generation.md`
3. `.claude/patterns/nextjs/server-components-best-practices.md`
4. `.claude/patterns/keystatic/schema-design-patterns.md`
5. `.claude/patterns/keystatic/field-types-reference.md`
6. `.claude/patterns/react/server-client-components.md`
7. `.claude/patterns/tailwind/responsive-design-patterns.md`
8. `.claude/patterns/accessibility/wcag-compliance.md`

**Deliverable**: 8 core pattern libraries

### Phase 2 (Week 2): Advanced Patterns
9. `.claude/patterns/vercel/deployment-patterns.md`
10. `.claude/patterns/vercel/isr-patterns.md`
11. `.claude/patterns/keystatic/collection-relationships.md`
12. `.claude/patterns/keystatic/migration-strategies.md`
13. `.claude/patterns/react/component-composition-patterns.md`
14. `.claude/patterns/tailwind/utility-first-styling.md`
15. `.claude/patterns/accessibility/keyboard-navigation.md`

**Deliverable**: 7 advanced pattern libraries

### Phase 3 (Week 3): Examples & Antipatterns
16-20. Example implementations (5 examples)
21-25. Antipattern documentation (5 antipatterns)

**Deliverable**: 10 examples + antipatterns

---

## Usage by Agents

### nextjs-vercel-specialist Loads:
```markdown
## Required Reading (Load Before EVERY Task)

1. **Read**: `.claude/patterns/nextjs/app-router-patterns.md`
2. **Read**: `.claude/patterns/nextjs/metadata-generation.md`
3. **Read**: `.claude/patterns/nextjs/server-components-best-practices.md`
4. **Read**: `.claude/patterns/vercel/deployment-patterns.md`
5. **Grep**: `.claude/examples/nextjs/` for similar patterns
6. **Grep**: `.claude/antipatterns/nextjs/` to avoid known mistakes
```

### keystatic-specialist Loads:
```markdown
## Required Reading (Load Before EVERY Task)

1. **Read**: `.claude/patterns/keystatic/schema-design-patterns.md`
2. **Read**: `.claude/patterns/keystatic/field-types-reference.md`
3. **Read**: `.claude/patterns/keystatic/collection-relationships.md`
4. **Read**: `.claude/patterns/keystatic/migration-strategies.md`
5. **Grep**: `.claude/examples/keystatic/` for similar patterns
6. **Grep**: `.claude/antipatterns/keystatic/` to avoid known mistakes
```

### react-frontend-specialist Loads:
```markdown
## Required Reading (Load Before EVERY Task)

1. **Read**: `.claude/patterns/react/server-client-components.md`
2. **Read**: `.claude/patterns/react/component-composition-patterns.md`
3. **Read**: `.claude/patterns/tailwind/responsive-design-patterns.md`
4. **Read**: `.claude/patterns/accessibility/wcag-compliance.md`
5. **Grep**: `.claude/examples/react/` for similar patterns
6. **Grep**: `.claude/antipatterns/react/` to avoid known mistakes
```

---

## Maintenance Strategy

### Weekly Review
- Update patterns based on real implementation failures
- Add new examples from successful implementations
- Document new antipatterns discovered

### Monthly Audit
- Ensure all patterns are current with latest Next.js/Keystatic versions
- Verify examples still compile and run
- Update for new features or deprecated APIs

### Pattern Contribution Process
1. Specialist discovers new pattern or antipattern
2. Document in appropriate `.claude/patterns/` or `.claude/antipatterns/` file
3. Add example to `.claude/examples/`
4. Notify other specialists via commit message
5. Update specialist agent markdown "Required Reading" section

---

**Document Status**: Ready for Implementation
**Next Step**: Create pattern library files (8 core patterns first)
