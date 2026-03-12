# QPLAN: Admin Nav Strip Feature

**Date**: 2025-12-23
**Source**: Updates-03.md (Item #3)
**Total SP**: 3

## Overview

Add a site-wide admin navigation strip that appears when the user is logged into GitHub for the CMS. This provides quick access to admin functions without leaving the current page.

---

## Requirement

### REQ-ADMIN-001: Admin Nav Strip

**When user is logged into GitHub CMS**, display a thin admin strip at the top of the site:

**Visual Design**:
- Black background
- White text
- Same font as BLC nav (system font or site font)
- Thin/compact height (~32-40px)
- Full width, fixed at top

**Navigation Links**:
1. **CMS** - Link to /keystatic
2. **Deployment Status** - Small indicator (green/yellow/red dot + text like "Published" or "Building")
3. **Report Bug** - Opens GitHub issue with current page URL pre-filled
4. **Edit Page** - Opens current page in Keystatic editor

**Behavior**:
- Only visible when authenticated with GitHub OAuth
- Should not appear for regular site visitors
- Persists across page navigation
- Should push main content down (not overlay)

---

## Implementation

### Phase 1: Auth Detection (1 SP)

**File**: `lib/keystatic/auth.ts` (NEW)

```typescript
// Server-side check for Keystatic GitHub auth
export async function isKeystatiAuthenticated(): Promise<boolean> {
  // Check for Keystatic session cookie or GitHub OAuth token
  // Returns true if user has valid CMS access
}
```

**File**: `components/admin/AdminAuthProvider.tsx` (NEW)

```typescript
'use client';

// Client-side auth state provider
// Checks auth status on mount, provides context to children
```

### Phase 2: Admin Nav Component (1.5 SP)

**File**: `components/admin/AdminNavStrip.tsx` (NEW)

```typescript
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function AdminNavStrip() {
  const pathname = usePathname();

  // Convert pathname to Keystatic edit URL
  const editUrl = pathname === '/'
    ? '/keystatic/singletons/homepage'
    : `/keystatic/collection/pages/${pathname.slice(1)}`;

  // Bug report URL with current page context
  const bugReportUrl = `https://github.com/sparkst/bearlakecamp/issues/new?title=Bug%20on%20${encodeURIComponent(pathname)}&body=Found%20on:%20${encodeURIComponent(window.location.href)}`;

  return (
    <div className="bg-black text-white text-sm h-8 flex items-center px-4 gap-6 font-sans">
      <Link href="/keystatic" className="hover:text-gray-300">
        CMS
      </Link>

      <DeploymentStatusIndicator />

      <a
        href={bugReportUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-gray-300"
      >
        Report Bug
      </a>

      <Link href={editUrl} className="hover:text-gray-300">
        Edit Page
      </Link>
    </div>
  );
}
```

**File**: `components/admin/DeploymentStatusIndicator.tsx` (NEW)

```typescript
// Compact deployment status indicator
// Shows: green dot + "Published" or yellow dot + "Building" etc.
// Smaller than the Keystatic dashboard version
```

### Phase 3: Integration (0.5 SP)

**File**: `app/layout.tsx`

```typescript
// Conditionally render AdminNavStrip based on auth state
export default async function RootLayout({ children }) {
  const isAdmin = await isKeystatiAuthenticated();

  return (
    <html>
      <body>
        {isAdmin && <AdminNavStrip />}
        <Header />
        {/* ... rest of layout */}
      </body>
    </html>
  );
}
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `lib/keystatic/auth.ts` | Auth detection utilities |
| `components/admin/AdminAuthProvider.tsx` | Client auth state |
| `components/admin/AdminNavStrip.tsx` | Main nav component |
| `components/admin/DeploymentStatusIndicator.tsx` | Compact status |

## Files to Modify

| File | Changes |
|------|---------|
| `app/layout.tsx` | Add conditional AdminNavStrip |

---

## Acceptance Criteria

- [ ] Admin strip only appears when logged into CMS
- [ ] Black background, white text, compact height
- [ ] CMS link goes to /keystatic
- [ ] Deployment status shows current state (Published/Building/Error)
- [ ] Report Bug opens GitHub issue with current URL
- [ ] Edit Page opens correct page in Keystatic
- [ ] Strip pushes content down (not overlay)
- [ ] Not visible to regular site visitors

---

## Security Considerations

- Auth check must happen server-side to prevent spoofing
- GitHub OAuth token/session must be validated
- Admin nav should not expose sensitive URLs to non-admin users
