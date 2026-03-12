# Server Components Best Practices

> When and how to use React Server Components in Next.js App Router

## Server vs Client Components

### Server Components (Default)
- **Run on**: Server only
- **Can access**: Database, filesystem, environment variables
- **Cannot use**: useState, useEffect, onClick, browser APIs
- **Bundle size**: Zero client-side JavaScript

### Client Components
- **Run on**: Server (SSR) + Browser (hydration)
- **Can use**: All React hooks, event handlers, browser APIs
- **Bundle size**: Added to client bundle
- **Marked with**: `'use client'` directive

## Pattern: Data Fetching in Server Components

```typescript
// app/staff/page.tsx - Server Component (default)
import { reader } from '@/lib/keystatic-reader';

export default async function StaffPage() {
  // Direct server-side data fetching
  const staff = await reader.collections.staff.all();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {staff.map(person => (
        <StaffCard key={person.slug} person={person} />
      ))}
    </div>
  );
}
```

## Pattern: Composition (Server + Client)

```typescript
// Server Component fetches data
// app/staff/page.tsx
import { reader } from '@/lib/keystatic-reader';
import { StaffFilter } from '@/components/StaffFilter';

export default async function StaffPage() {
  const staff = await reader.collections.staff.all();

  return (
    <div>
      {/* Client Component for interactivity */}
      <StaffFilter staff={staff} />
    </div>
  );
}

// Client Component handles interactivity
// components/StaffFilter.tsx
'use client';

import { useState } from 'react';

export function StaffFilter({ staff }) {
  const [filter, setFilter] = useState('');

  const filtered = staff.filter(p =>
    p.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>
      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter staff..."
      />
      {filtered.map(person => (
        <StaffCard key={person.slug} person={person} />
      ))}
    </div>
  );
}
```

## Pattern: Passing Server Components as Children

```typescript
// Server Component
// components/StaffCard.tsx
export function StaffCard({ person }) {
  return (
    <div className="p-4 border rounded-lg">
      <h3>{person.name}</h3>
      <p>{person.role}</p>
    </div>
  );
}

// Client Component accepts Server Component as children
// components/InteractiveWrapper.tsx
'use client';

import { useState } from 'react';

export function InteractiveWrapper({ children }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div>
      <button onClick={() => setIsExpanded(!isExpanded)}>
        {isExpanded ? 'Collapse' : 'Expand'}
      </button>
      {isExpanded && children}
    </div>
  );
}

// Usage in page
// app/staff/page.tsx
export default async function StaffPage() {
  const staff = await reader.collections.staff.all();

  return (
    <InteractiveWrapper>
      {/* Server Components rendered on server, passed as children */}
      {staff.map(person => (
        <StaffCard key={person.slug} person={person} />
      ))}
    </InteractiveWrapper>
  );
}
```

## Pattern: Environment Variables

```typescript
// Server Component - can access all env vars
export default async function Page() {
  const apiKey = process.env.API_SECRET_KEY; // ✓ Works
  const data = await fetchWithKey(apiKey);
  return <div>{/* render */}</div>;
}

// Client Component - only NEXT_PUBLIC_ vars
'use client';

export function Analytics() {
  const trackingId = process.env.NEXT_PUBLIC_GA_ID; // ✓ Works
  const secret = process.env.API_SECRET_KEY; // ✗ undefined
  return <div>{/* analytics */}</div>;
}
```

## Bear Lake Camp Server Component Examples

### Homepage Data Fetching
```typescript
// app/page.tsx
import { reader } from '@/lib/keystatic-reader';
import { HeroCarousel } from '@/components/HeroCarousel';
import { MissionSection } from '@/components/MissionSection';

export default async function HomePage() {
  const [homepageContent, mission] = await Promise.all([
    reader.collections.pages.read('index'),
    reader.singletons.mission.read(),
  ]);

  return (
    <main>
      <HeroCarousel
        images={homepageContent.templateFields.homepage.heroImages}
      />
      <MissionSection mission={mission} />
    </main>
  );
}
```

### Dynamic Page with Template
```typescript
// app/[slug]/page.tsx
import { reader } from '@/lib/keystatic-reader';
import { notFound } from 'next/navigation';
import { StandardTemplate } from '@/components/templates/StandardTemplate';
import { ProgramTemplate } from '@/components/templates/ProgramTemplate';

export default async function DynamicPage({ params }) {
  const page = await reader.collections.pages.read(params.slug);

  if (!page) {
    notFound();
  }

  // Template selection based on Keystatic schema
  switch (page.templateFields.discriminant) {
    case 'program':
      return <ProgramTemplate page={page} />;
    case 'standard':
    default:
      return <StandardTemplate page={page} />;
  }
}
```

## When to Use Client Components

### Use `'use client'` when you need:
1. **State**: `useState`, `useReducer`
2. **Effects**: `useEffect`, `useLayoutEffect`
3. **Event handlers**: `onClick`, `onChange`, `onSubmit`
4. **Browser APIs**: `window`, `document`, `localStorage`
5. **Custom hooks** that use any of the above

### Common Client Component patterns:
- Forms with validation
- Modals and dialogs
- Carousels with navigation
- Search with instant filtering
- Toggle/accordion components
- Animation libraries (Framer Motion)

## Checklist

- [ ] Data fetching happens in Server Components
- [ ] `'use client'` only where hooks/events needed
- [ ] No `useState`/`useEffect` in files without `'use client'`
- [ ] Pass data as props from Server to Client Components
- [ ] Sensitive env vars only in Server Components
- [ ] Heavy components (forms, modals) are Client Components
- [ ] Static content (cards, lists) are Server Components

## Antipatterns to Avoid

### Don't: Use Hooks in Server Components
```typescript
// BAD
export default async function Page() {
  const [count, setCount] = useState(0); // ERROR!
  return <div>{count}</div>;
}

// GOOD - Split into Server + Client
export default async function Page() {
  const data = await fetchData();
  return <ClientCounter initialData={data} />;
}
```

### Don't: Make Everything a Client Component
```typescript
// BAD - Unnecessary 'use client'
'use client';

export function StaticCard({ title }) {
  // No hooks, no events - why is this a Client Component?
  return <div className="p-4">{title}</div>;
}

// GOOD - Server Component by default
export function StaticCard({ title }) {
  return <div className="p-4">{title}</div>;
}
```

### Don't: Pass Functions from Server to Client
```typescript
// BAD - Can't serialize functions
export default async function Page() {
  const handleClick = () => console.log('clicked');
  return <ClientButton onClick={handleClick} />; // ERROR!
}

// GOOD - Define handlers in Client Component
// or use Server Actions
```

### Don't: Fetch Data in Client Components (usually)
```typescript
// BAD - Client-side fetch when server-side would work
'use client';

export function StaffList() {
  const [staff, setStaff] = useState([]);

  useEffect(() => {
    fetch('/api/staff').then(r => r.json()).then(setStaff);
  }, []);

  return <div>{/* render */}</div>;
}

// GOOD - Server Component fetches directly
export default async function StaffList() {
  const staff = await reader.collections.staff.all();
  return <div>{/* render */}</div>;
}
```

---

**Last Updated**: 2025-12-11
**Used By**: nextjs-vercel-specialist, react-frontend-specialist
