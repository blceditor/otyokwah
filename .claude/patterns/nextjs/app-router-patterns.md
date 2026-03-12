# Next.js App Router Patterns

> Source of truth for file-based routing in Bear Lake Camp website

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
- Single param: `[slug]` - Matches `/about`, `/contact`
- Catch-all: `[...slug]` - Matches `/a/b/c`
- Optional catch-all: `[[...slug]]` - Matches `/` and `/a/b/c`

### Pattern: Route Groups
```
app/
├── (pages)/          # Grouped pages (URL: /about, not /pages/about)
│   ├── about/
│   └── contact/
└── (admin)/          # Admin section with different layout
    └── dashboard/
```

### Pattern: Parallel Routes (Advanced)
```
app/
├── @modal/           # Modal slot
│   └── login/
└── page.tsx          # Main content
```

### Pattern: Intercepting Routes (Advanced)
```
app/
├── photo/
│   └── [id]/
│       └── page.tsx  # Full page
└── @modal/
    └── (.)photo/     # Intercepts photo route for modal
        └── [id]/
```

## Special Files

| File | Purpose |
|------|---------|
| `page.tsx` | Page component (required for route) |
| `layout.tsx` | Shared layout, wraps children |
| `loading.tsx` | Loading UI (Suspense boundary) |
| `error.tsx` | Error UI (Error boundary) |
| `not-found.tsx` | 404 page |
| `route.ts` | API route handler |
| `template.tsx` | Re-renders on navigation |

## Bear Lake Camp Route Structure

```typescript
// Current app/ structure
app/
├── (pages)/
│   ├── page.tsx              // Homepage (template: homepage)
│   ├── [slug]/
│   │   └── page.tsx          // Dynamic pages from Keystatic
│   ├── staff/
│   │   ├── page.tsx          // Staff list
│   │   └── [slug]/
│   │       └── page.tsx      // Individual staff
│   └── facilities/
│       └── page.tsx
├── api/
│   ├── draft/route.ts        // Draft mode toggle
│   ├── exit-draft/route.ts
│   ├── og/route.tsx          // OG image generation
│   └── health/route.ts
├── keystatic/
│   └── [[...params]]/        // Keystatic CMS admin
└── layout.tsx                // Root layout with fonts
```

## Code Examples

### Dynamic Page Route
```typescript
// app/[slug]/page.tsx
import { reader } from '@/lib/keystatic-reader';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  const pages = await reader.collections.pages.all();
  return pages.map(page => ({ slug: page.slug }));
}

export default async function Page({ params }: { params: { slug: string } }) {
  const page = await reader.collections.pages.read(params.slug);

  if (!page) {
    notFound();
  }

  return <PageTemplate page={page} />;
}
```

### Route Handler (API Route)
```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
}
```

### Layout with Fonts
```typescript
// app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

## Checklist

- [ ] Route groups use (parentheses) to organize without affecting URL
- [ ] Dynamic routes use [brackets]
- [ ] Each route has page.tsx
- [ ] Layouts wrap all child routes
- [ ] API routes use route.ts with HTTP method exports
- [ ] Loading states use loading.tsx (not manual Suspense)
- [ ] Error boundaries use error.tsx (not manual ErrorBoundary)

## Antipatterns to Avoid

### Don't: Create Routes Without page.tsx
```
app/
└── about/
    └── AboutComponent.tsx  # This is NOT a route!
```

### Don't: Mix Pages and API Routes
```typescript
// BAD: page.tsx with API logic
export default async function Page() {
  await db.insert(...); // Side effects in page!
}
```

### Don't: Nest Route Handlers
```
// BAD: Nested route.ts files
app/api/users/route.ts
app/api/users/[id]/route.ts  // This works
app/api/users/[id]/posts/route.ts  // But goes too deep
```

---

**Last Updated**: 2025-12-11
**Used By**: nextjs-vercel-specialist
