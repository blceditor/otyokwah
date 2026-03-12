# React Server/Client Components

> Definitive guide for RSC boundaries in Bear Lake Camp

## Quick Reference

| Feature | Server Component | Client Component |
|---------|-----------------|------------------|
| Directive | None (default) | `'use client'` |
| useState | No | Yes |
| useEffect | No | Yes |
| onClick | No | Yes |
| async/await | Yes | No |
| Direct DB access | Yes | No |
| Environment vars | All | NEXT_PUBLIC_ only |
| Bundle impact | Zero | Added to bundle |

## Server Components

### When to Use
- Data fetching
- Accessing backend resources
- Keeping sensitive data on server
- Large dependencies (keep off client bundle)
- Static content display

### Pattern: Basic Server Component
```typescript
// components/StaffCard.tsx (NO 'use client')
import { reader } from '@/lib/keystatic-reader';

export async function StaffCard({ slug }: { slug: string }) {
  const staff = await reader.collections.staff.read(slug);

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-xl font-bold">{staff.name}</h3>
      <p className="text-gray-600">{staff.role}</p>
      <p className="mt-2">{staff.bio}</p>
    </div>
  );
}
```

### Pattern: Server Component with Children
```typescript
// components/PageWrapper.tsx
export function PageWrapper({ children }: { children: React.ReactNode }) {
  // Can access server resources
  const config = process.env.SITE_CONFIG;

  return (
    <div className="max-w-4xl mx-auto px-4">
      {children}
    </div>
  );
}
```

## Client Components

### When to Use
- Interactive UI (forms, buttons, toggles)
- State management (useState, useReducer)
- Side effects (useEffect)
- Browser APIs (localStorage, geolocation)
- Event handlers (onClick, onChange)
- Third-party client libraries

### Pattern: Basic Client Component
```typescript
// components/SearchBar.tsx
'use client';

import { useState } from 'react';

export function SearchBar() {
  const [query, setQuery] = useState('');

  return (
    <input
      type="search"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search..."
      className="px-4 py-2 border rounded-lg"
    />
  );
}
```

### Pattern: Client Component with Props
```typescript
// components/StaffFilter.tsx
'use client';

import { useState } from 'react';

interface Staff {
  slug: string;
  name: string;
  role: string;
}

export function StaffFilter({ initialStaff }: { initialStaff: Staff[] }) {
  const [filter, setFilter] = useState('');

  const filtered = initialStaff.filter(s =>
    s.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>
      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter by name..."
      />
      <ul>
        {filtered.map(s => (
          <li key={s.slug}>{s.name} - {s.role}</li>
        ))}
      </ul>
    </div>
  );
}
```

## Composition Patterns

### Pattern: Server Fetches, Client Renders Interactive
```typescript
// app/staff/page.tsx (Server Component)
import { reader } from '@/lib/keystatic-reader';
import { StaffFilter } from '@/components/StaffFilter';

export default async function StaffPage() {
  // Fetch on server
  const staff = await reader.collections.staff.all();

  // Pass serialized data to client
  return <StaffFilter initialStaff={staff} />;
}
```

### Pattern: Server Component Children in Client Component
```typescript
// components/Modal.tsx (Client)
'use client';

import { useState } from 'react';

export function Modal({
  children,
  trigger
}: {
  children: React.ReactNode;
  trigger: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>{trigger}</button>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50">
          <div className="bg-white p-6 rounded-lg">
            {children} {/* Server Component children rendered on server */}
            <button onClick={() => setIsOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </>
  );
}

// app/page.tsx (Server Component)
import { Modal } from '@/components/Modal';
import { StaffCard } from '@/components/StaffCard';

export default async function Page() {
  return (
    <Modal trigger="View Staff">
      {/* StaffCard is a Server Component, rendered on server */}
      <StaffCard slug="john-doe" />
    </Modal>
  );
}
```

### Pattern: Interleaving Server and Client
```typescript
// Page structure
<ServerLayout>           {/* Server */}
  <ClientNavbar />       {/* Client - has onClick */}
  <ServerContent>        {/* Server - fetches data */}
    <ClientCarousel>     {/* Client - has state */}
      <ServerImage />    {/* Server - optimized */}
    </ClientCarousel>
  </ServerContent>
  <ServerFooter />       {/* Server */}
</ServerLayout>
```

## Bear Lake Camp Examples

### Homepage Pattern
```typescript
// app/page.tsx (Server Component)
import { reader } from '@/lib/keystatic-reader';
import { HeroCarousel } from '@/components/HeroCarousel';  // Client
import { MissionSection } from '@/components/MissionSection';  // Server

export default async function HomePage() {
  const homepage = await reader.collections.pages.read('index');
  const mission = await reader.singletons.mission.read();

  return (
    <main>
      {/* Client Component - has carousel state */}
      <HeroCarousel
        images={homepage.templateFields.homepage.heroImages}
      />

      {/* Server Component - just renders */}
      <MissionSection mission={mission} />
    </main>
  );
}
```

### Dynamic Page Pattern
```typescript
// app/[slug]/page.tsx (Server Component)
import { reader } from '@/lib/keystatic-reader';
import { notFound } from 'next/navigation';

export default async function DynamicPage({
  params
}: {
  params: { slug: string }
}) {
  const page = await reader.collections.pages.read(params.slug);

  if (!page) {
    notFound();
  }

  // Select template based on schema
  const Template = getTemplate(page.templateFields.discriminant);

  return <Template page={page} />;
}
```

## Checklist

### Server Component
- [ ] NO `'use client'` directive
- [ ] Data fetching with async/await
- [ ] Direct Keystatic reader access
- [ ] Can access all environment variables
- [ ] NO hooks (useState, useEffect, etc.)
- [ ] NO event handlers (onClick, onChange, etc.)

### Client Component
- [ ] Has `'use client'` at top of file
- [ ] Uses hooks for interactivity
- [ ] Event handlers for user interaction
- [ ] Only NEXT_PUBLIC_ env vars accessible
- [ ] Receives data as props (not fetching)
- [ ] Kept small (impacts bundle size)

## Antipatterns

### Don't: Forget 'use client'
```typescript
// BAD - Missing directive causes runtime error
import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0); // ERROR!
  return <button onClick={() => setCount(c + 1)}>{count}</button>;
}

// GOOD
'use client';

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c + 1)}>{count}</button>;
}
```

### Don't: Add 'use client' Unnecessarily
```typescript
// BAD - Unnecessary client component
'use client';

export function Card({ title, description }) {
  // No hooks, no events - why is this a client component?
  return (
    <div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

// GOOD - Server component by default
export function Card({ title, description }) {
  return (
    <div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
```

### Don't: Pass Functions Server → Client
```typescript
// BAD - Functions can't be serialized
// app/page.tsx (Server)
export default function Page() {
  const handleClick = () => console.log('clicked');
  return <ClientButton onClick={handleClick} />; // ERROR!
}

// GOOD - Define handler in Client Component
// components/ClientButton.tsx
'use client';

export function ClientButton() {
  const handleClick = () => console.log('clicked');
  return <button onClick={handleClick}>Click</button>;
}
```

### Don't: Fetch in Client Components (usually)
```typescript
// BAD - Client-side fetch when server would work
'use client';

export function StaffList() {
  const [staff, setStaff] = useState([]);

  useEffect(() => {
    fetch('/api/staff').then(r => r.json()).then(setStaff);
  }, []);

  return <div>{/* render */}</div>;
}

// GOOD - Fetch in Server Component, pass to Client
// app/staff/page.tsx (Server)
export default async function StaffPage() {
  const staff = await reader.collections.staff.all();
  return <StaffList staff={staff} />;
}
```

---

**Last Updated**: 2025-12-11
**Used By**: react-frontend-specialist, nextjs-vercel-specialist
