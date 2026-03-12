# Phase 0 Implementation Guide

> **Quick Start**: This guide helps you implement Phase 0 features using TDD
> **Prerequisite**: All tests are written and failing (red phase)
> **Goal**: Make all 111 tests pass (green phase)

---

## Quick Commands

```bash
# Run all tests
npm test

# Run specific test file
npm test -- tailwind.config.spec.ts

# Run in watch mode
npm test -- --watch

# Type check
npm run typecheck

# Lint
npm run lint
```

---

## Implementation Order

### Task 1: P0-001 - Tailwind Config (1 SP)

**File to Edit**: `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/tailwind.config.js`

**Tests to Pass**: 28 tests in `tailwind.config.spec.ts`

**What to Do**:

1. Extend `theme.extend.colors` with:
   ```typescript
   colors: {
     primary: {
       DEFAULT: '#4A7A9E',
       light: '#7A9DB8',
       dark: '#2F5A7A',
     },
     secondary: {
       DEFAULT: '#2F4F3D',
       light: '#5A7A65',
     },
     accent: {
       DEFAULT: '#A07856',
       light: '#C4A882',
     },
     cream: '#F5F0E8',
     sand: '#D4C5B0',
     stone: '#8A8A7A',
     bark: '#5A4A3A',
   }
   ```

2. Extend `theme.extend.fontFamily` with:
   ```typescript
   fontFamily: {
     sans: [
       '-apple-system',
       'BlinkMacSystemFont',
       'Segoe UI',
       'Roboto',
       'Oxygen',
       'Ubuntu',
       'Cantarell',
       'sans-serif',
     ],
     handwritten: ['Caveat', 'cursive'],
   }
   ```

3. Extend `theme.extend.spacing` with:
   ```typescript
   spacing: {
     xs: '0.5rem',
     sm: '1rem',
     md: '1.5rem',
     lg: '2rem',
     xl: '3rem',
     xxl: '4rem',
   }
   ```

**Verify**:
```bash
npm test -- tailwind.config.spec.ts
# Should show 28/28 passing
```

---

### Task 2: P0-002 - Layout Updates (0.5 SP)

**File to Edit**: `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/app/layout.tsx`

**Tests to Pass**: 21 tests in `app/layout.phase0.spec.tsx`

**What to Do**:

1. Import Caveat font:
   ```typescript
   import { Caveat } from 'next/font/google';

   const caveat = Caveat({
     subsets: ['latin'],
     variable: '--font-caveat',
     display: 'swap',
   });
   ```

2. Apply font variable to HTML:
   ```typescript
   <html lang="en" className={caveat.variable}>
   ```

3. Update body classes:
   ```typescript
   <body className={`font-sans text-[1.125rem] text-bark bg-cream`}>
   ```

4. Add skip link (before children):
   ```typescript
   <a
     href="#main-content"
     className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:p-4 focus:bg-primary focus:text-white"
   >
     Skip to main content
   </a>
   ```

5. Update metadata export:
   ```typescript
   export const metadata: Metadata = {
     title: "Bear Lake Camp",
     description: "Methodist Church Youth Camp - Summer programs for kids and teens",
     openGraph: {
       title: "Bear Lake Camp",
       description: "Methodist Church Youth Camp - Summer programs for kids and teens",
     },
   };
   ```

**Note**: You may need to add `sr-only` utility to Tailwind config:
```typescript
// In tailwind.config.js plugins array or theme
plugins: [
  function ({ addUtilities }) {
    addUtilities({
      '.sr-only': {
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: '0',
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        borderWidth: '0',
      },
    });
  },
],
```

**Verify**:
```bash
npm test -- app/layout.phase0.spec.tsx
# Should show 21/21 passing
```

---

### Task 3: P0-003 - Component Templates (0.5 SP)

**Files to Create**: 6 component files in `components/homepage/`

**Tests to Pass**: 38 tests across 6 spec files

**What to Do for Each Component**:

Create these files with this template:

#### Hero.tsx
```typescript
interface HeroProps {
  className?: string;
}

export default function Hero({ className = '' }: HeroProps) {
  return (
    <section className={`hero-section ${className}`}>
      {/* Hero content will be implemented in Phase 1 */}
      <div className="container">
        <h1>Hero Placeholder</h1>
      </div>
    </section>
  );
}
```

#### TrustBar.tsx
```typescript
interface TrustBarProps {
  className?: string;
}

export default function TrustBar({ className = '' }: TrustBarProps) {
  return (
    <section className={`trust-bar-section ${className}`}>
      {/* Trust bar content will be implemented in Phase 1 */}
      <div className="container">
        <p>Trust Bar Placeholder</p>
      </div>
    </section>
  );
}
```

#### Programs.tsx
```typescript
interface ProgramsProps {
  className?: string;
}

export default function Programs({ className = '' }: ProgramsProps) {
  return (
    <section className={`programs-section ${className}`}>
      {/* Programs content will be implemented in Phase 1 */}
      <div className="container">
        <h2>Programs Placeholder</h2>
      </div>
    </section>
  );
}
```

#### Testimonials.tsx
```typescript
interface TestimonialsProps {
  className?: string;
}

export default function Testimonials({ className = '' }: TestimonialsProps) {
  return (
    <section className={`testimonials-section ${className}`}>
      {/* Testimonials content will be implemented in Phase 1 */}
      <div className="container">
        <h2>Testimonials Placeholder</h2>
      </div>
    </section>
  );
}
```

#### Gallery.tsx
```typescript
interface GalleryProps {
  className?: string;
}

export default function Gallery({ className = '' }: GalleryProps) {
  return (
    <section className={`gallery-section ${className}`}>
      {/* Gallery content will be implemented in Phase 1 */}
      <div className="container">
        <h2>Gallery Placeholder</h2>
      </div>
    </section>
  );
}
```

#### InstagramFeed.tsx
```typescript
interface InstagramFeedProps {
  className?: string;
}

export default function InstagramFeed({ className = '' }: InstagramFeedProps) {
  return (
    <section className={`instagram-feed-section ${className}`}>
      {/* Instagram feed will be implemented in Phase 2 */}
      <div className="container">
        <h2>Instagram Feed Placeholder</h2>
      </div>
    </section>
  );
}
```

**Verify**:
```bash
npm test -- components/homepage/Hero.spec.tsx
npm test -- components/homepage/TrustBar.spec.tsx
npm test -- components/homepage/Programs.spec.tsx
npm test -- components/homepage/Testimonials.spec.tsx
npm test -- components/homepage/Gallery.spec.tsx
npm test -- components/homepage/InstagramFeed.spec.tsx
# All should pass
```

---

### Task 4: P0-004 - Page Compositions (0.5 SP)

**Files to Update/Create**:
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/app/page.tsx`
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/app/about/page.tsx` (create directory + file)

**Tests to Pass**: 24 tests across 2 spec files

#### Homepage (app/page.tsx)

Replace existing content with:

```typescript
import Hero from '@/components/homepage/Hero';
import TrustBar from '@/components/homepage/TrustBar';
import Programs from '@/components/homepage/Programs';
import Testimonials from '@/components/homepage/Testimonials';
import Gallery from '@/components/homepage/Gallery';
import InstagramFeed from '@/components/homepage/InstagramFeed';

export default function Home() {
  return (
    <main id="main-content">
      <Hero />
      <TrustBar />
      <Programs />
      <Testimonials />
      <Gallery />
      <InstagramFeed />
    </main>
  );
}
```

#### About Page (app/about/page.tsx)

Create directory first:
```bash
mkdir -p app/about
```

Then create file:

```typescript
export default function AboutPage() {
  return (
    <main className="font-sans text-bark">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-6">About Bear Lake Camp</h1>

        <p className="mb-4">
          Bear Lake Camp is a Methodist Church Youth Camp dedicated to providing
          meaningful summer experiences for children and teens.
        </p>

        <p className="mb-4">
          Our camp offers a safe, nurturing environment where young people can
          grow in faith, build lasting friendships, and create unforgettable
          memories surrounded by nature.
        </p>

        <p>
          With experienced staff, engaging programs, and beautiful lakeside
          facilities, Bear Lake Camp has been serving families for generations.
        </p>
      </div>
    </main>
  );
}
```

**Verify**:
```bash
npm test -- app/page.phase0.spec.tsx
npm test -- app/about/page.spec.tsx
# All should pass
```

---

## Final Verification

After completing all 4 tasks:

```bash
# Run all tests
npm test

# Should show:
# ✓ 111 tests passing

# Type check
npm run typecheck
# Should show: No errors

# Lint
npm run lint
# Should show: No errors

# Build
npm run build
# Should succeed
```

---

## Integration Tests

After all unit tests pass, run integration tests:

```bash
npm test -- tests/integration/phase0/design-system.spec.ts
# Should show 14/14 passing
```

---

## Troubleshooting

### Tailwind classes not working

**Issue**: Classes like `text-bark` or `bg-cream` not applying

**Fix**: Make sure Tailwind config is saved and build is running:
```bash
npm run dev
```

### Font not loading

**Issue**: Caveat font not displaying

**Fix**: Check that:
1. Font is imported correctly
2. `.variable` is applied to HTML element
3. Font is in `next/font/google` (not external link)

### Components not found

**Issue**: `Cannot find module './Hero'`

**Fix**: Make sure files are created in exact paths:
- `components/homepage/Hero.tsx` (not `Hero.jsx`)
- Check file extensions are `.tsx`

### Skip link not working

**Issue**: Skip link not visible on focus

**Fix**: Add `focus:not-sr-only` to remove sr-only on focus:
```typescript
className="sr-only focus:not-sr-only ..."
```

### Tests still failing after implementation

**Issue**: Some tests fail even after implementing

**Fix**:
1. Check exact color hex codes (case-sensitive)
2. Check spacing values (must be `0.5rem` not `8px`)
3. Check font array order matches exactly
4. Run `npm run typecheck` to catch type errors

---

## Time Estimates

- **P0-001**: 30-45 minutes (Tailwind config)
- **P0-002**: 20-30 minutes (Layout updates)
- **P0-003**: 30-40 minutes (6 components)
- **P0-004**: 20-30 minutes (2 pages)

**Total**: 2-2.5 hours (matches 2.5 SP estimate at 1 SP/hour)

---

## Success Criteria Checklist

- [ ] All 111 tests passing
- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] `npm run build` succeeds
- [ ] Homepage renders all 6 sections
- [ ] About page renders with correct typography
- [ ] Skip link is keyboard accessible
- [ ] Caveat font loads correctly
- [ ] All design system colors available
- [ ] No console errors on render

---

## Next Phase

Once Phase 0 is complete:

1. **QCHECK**: Code review by PE-Reviewer and code-quality-auditor
2. **QDOC**: Update documentation
3. **QGIT**: Commit and push changes
4. **Phase 1**: Begin implementing actual content (hero video, trust bar, etc.)

---

**Ready to Start**: ✅ All tests written and failing
**Implementation Team**: sde-iii, implementation-coordinator
**Estimated Completion**: 2-2.5 hours

---

**Maintained By**: test-writer agent
**For Questions**: See test-plan.md or test-summary.md
**Last Updated**: 2025-11-19
