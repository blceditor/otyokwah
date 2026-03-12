# Phase 1 Fix Plan - P0 and P1 Issues

**Date:** 2025-11-19
**Total Issues:** 10 (3 P0 + 7 P1)
**Estimated Effort:** 1.4 SP

---

## P0 Issues (Blockers - Must Fix)

### P0-001: Gallery uses array index as React key (PE-Reviewer + code-quality-auditor)
**Priority:** P0
**File:** `components/homepage/Gallery.tsx:48`
**Story Points:** 0.05 SP

**Issue:** Using `key={index}` in Gallery image map breaks React reconciliation.

**Fix:**
```typescript
// BEFORE (line 48)
{galleryImages.map((image, index) => (
  <div key={index} ...>

// AFTER
{galleryImages.map((image) => (
  <div key={image.src} ...>
```

**Tests:** No test changes needed (tests only verify rendering, not keys)

---

### P0-002: TrustBar tap target size not validated at runtime (PE-Reviewer)
**Priority:** P0
**File:** `components/homepage/TrustBar.tsx:18, 42, 48, 53, 59`
**Story Points:** 0.1 SP

**Issue:** Trust items have `min-h-12` (48px) but flex-col layout means horizontal width depends on text content, which may be <48px on mobile.

**Fix:**
```typescript
// Add min-w-12 to all 5 trust-item divs
// Lines 18, 42, 48, 53, 59
<div className="trust-item flex flex-col items-center min-h-12 min-w-12 p-2" ...>
```

**Tests:** TrustBar.phase1.spec.tsx already tests for min-h-12 class; update to also check min-w-12

---

### P0-003: Testimonials component unnecessarily uses Client Component (PE-Reviewer)
**Priority:** P0
**File:** `components/homepage/Testimonials.tsx:1`
**Story Points:** 0.3 SP

**Issue:** Entire component marked 'use client' when only video player needs interactivity. Reduces SSR benefits and increases bundle size.

**Fix:**
Split into two components:

1. **Testimonials.tsx** (Server Component - default):
```tsx
import TestimonialsVideoPlayer from './TestimonialsVideoPlayer';

export default function Testimonials({ className = '' }: { className?: string }) {
  return (
    <section className={`py-16 md:py-20 bg-sand ${className}`} ...>
      <div className="container mx-auto px-4">
        <h2 className="section-heading text-3xl md:text-4xl font-bold text-center text-bark mb-12">
          Hear From Families
        </h2>

        <TestimonialsVideoPlayer
          videoId="dQw4w9WgXcQ"
          caption="Parent: &quot;Our son came home with a deeper faith&quot;"
        />
      </div>
    </section>
  );
}
```

2. **TestimonialsVideoPlayer.tsx** (Client Component):
```tsx
'use client';

import { useState } from 'react';

interface TestimonialsVideoPlayerProps {
  videoId: string;
  caption: string;
}

export default function TestimonialsVideoPlayer({ videoId, caption }: TestimonialsVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayClick = () => {
    setIsPlaying(true);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="relative aspect-video bg-stone rounded-lg overflow-hidden shadow-lg">
        {!isPlaying ? (
          <div className="relative w-full h-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center cursor-pointer group" onClick={handlePlayClick}>
            <button className="w-20 h-20 min-w-[48px] min-h-[48px] bg-secondary/90 hover:bg-secondary rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 group-focus-within:ring-4 group-focus-within:ring-accent" aria-label="Play testimonial video">
              <svg className="w-10 h-10 text-cream ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          </div>
        ) : (
          <iframe src={`https://www.youtube.com/embed/${videoId}?cc_load_policy=1&rel=0&modestbranding=1`} title="Parent testimonial about Bear Lake Camp experience" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full" />
        )}
      </div>
      <p className="text-center text-bark mt-4 italic">{caption}</p>
    </div>
  );
}
```

**Tests:** Update Testimonials.phase1.spec.tsx to test both components

---

## P1 Issues (High Priority - Should Fix)

### P1-001: Hero image priority vs Gallery lazy loading (PE-Reviewer)
**Priority:** P1
**File:** `components/homepage/Gallery.tsx:59`
**Story Points:** 0.2 SP

**Issue:** All 6 gallery images use lazy loading, but gallery may be above fold on larger viewports, delaying LCP.

**Fix:**
Load first 3 images eagerly, last 3 lazy:
```tsx
{galleryImages.map((image, idx) => (
  <div key={image.src} ...>
    <Image
      src={image.src}
      alt={image.alt}
      fill
      sizes="(max-width: 768px) 50vw, 33vw"
      className="object-cover"
      loading={idx < 3 ? 'eager' : 'lazy'}  // First 3 eager, rest lazy
      width={600}
      height={600}  // Add for aspect ratio hint
    />
  </div>
))}
```

**Tests:** Update Gallery.phase1.spec.tsx to verify first 3 images are eager, last 3 lazy

---

### P1-002: Programs uses anchor tags instead of next/link (PE-Reviewer)
**Priority:** P1
**File:** `components/homepage/Programs.tsx:50, 88`
**Story Points:** 0.1 SP

**Issue:** Using `<a href="/jr-high">` causes full page reload instead of client-side navigation.

**Fix:**
```tsx
import Link from 'next/link';

// Line 50 and 88
<Link
  href="/jr-high"  // or "/high-school"
  className="inline-block w-full text-center bg-secondary hover:bg-secondary-light text-cream font-semibold px-6 py-3 rounded-lg transition-colors duration-200"
>
  See Dates & Pricing
</Link>
```

**Tests:** No test changes needed (tests verify className, not tag type)

---

### P1-003: Hero CTA uses anchor tag instead of Link (PE-Reviewer)
**Priority:** P1
**File:** `components/homepage/Hero.tsx:40`
**Story Points:** 0.1 SP

**Issue:** Using `<a href="#programs">` for anchor navigation doesn't leverage Next.js router.

**Fix:**
```tsx
import Link from 'next/link';

// Line 40
<Link
  href="#programs"
  scroll={true}
  className="cta-primary bg-secondary hover:bg-secondary-light text-cream font-bold px-8 py-4 rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg inline-flex items-center"
>
  Find Your Week ↓
</Link>
```

**Tests:** No test changes needed

---

### P1-004: Testimonials video autoplay violates WCAG (PE-Reviewer)
**Priority:** P1
**File:** `components/homepage/TestimonialsVideoPlayer.tsx` (after P0-003 split)
**Story Points:** 0.05 SP

**Issue:** iframe includes `autoplay=1` which violates WCAG 2.1 SC 2.2.2 (user control over media).

**Fix:**
```tsx
// Remove autoplay=1 from iframe URL
<iframe
  src={`https://www.youtube.com/embed/${videoId}?cc_load_policy=1&rel=0&modestbranding=1`}
  // autoplay=1 removed - user clicks YouTube's play button for explicit consent
  ...
/>
```

**Tests:** No test changes needed (tests don't check URL parameters)

---

### P1-005: Repeated section padding pattern (code-quality-auditor P1-001)
**Priority:** P1
**Files:** `Programs.tsx:12, Gallery.tsx:39, Testimonials.tsx:23`
**Story Points:** 0.1 SP

**Issue:** `py-16 md:py-20` repeated in 3 components. DRY violation.

**Fix:**
Update Tailwind config:
```typescript
// tailwind.config.ts
theme: {
  extend: {
    spacing: {
      'section-y': '4rem',      // 64px (16 * 4)
      'section-y-md': '5rem',   // 80px (20 * 4)
    }
  }
}
```

Then update components:
```tsx
// Programs.tsx:12, Gallery.tsx:39, Testimonials.tsx:23
className={`py-section-y md:py-section-y-md bg-sand ${className}`}
```

**Tests:** No test changes needed (tests don't verify spacing values)

---

### P1-006: Repeated program card structure (code-quality-auditor P1-002)
**Priority:** P1
**File:** `components/homepage/Programs.tsx:22-95`
**Story Points:** 0.3 SP

**Issue:** 73 lines of duplicated JSX for Jr. High and High School cards.

**Fix:**
Extract to shared component:

1. **Create `components/homepage/ProgramCard.tsx`:**
```tsx
import Image from 'next/image';
import Link from 'next/link';

interface ProgramCardProps {
  title: string;
  subtitle: string;
  imageSrc: string;
  imageAlt: string;
  benefits: string[];
  ctaText: string;
  ctaHref: string;
}

export default function ProgramCard({
  title,
  subtitle,
  imageSrc,
  imageAlt,
  benefits,
  ctaText,
  ctaHref,
}: ProgramCardProps) {
  return (
    <div className="program-card bg-cream rounded-xl overflow-hidden shadow-lg transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-64">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
          loading="lazy"
        />
      </div>
      <div className="p-6">
        <h3 className="text-2xl font-bold text-bark mb-2">{title}</h3>
        <p className="text-sm text-stone mb-4">{subtitle}</p>
        <ul className="space-y-2 mb-6">
          {benefits.map((benefit) => (
            <li key={benefit} className="flex items-start">
              <span className="text-secondary font-bold mr-2">✓</span>
              <span className="text-bark">{benefit}</span>
            </li>
          ))}
        </ul>
        <Link
          href={ctaHref}
          className="inline-block w-full text-center bg-secondary hover:bg-secondary-light text-cream font-semibold px-6 py-3 rounded-lg transition-colors duration-200"
        >
          {ctaText}
        </Link>
      </div>
    </div>
  );
}
```

2. **Update `Programs.tsx`:**
```tsx
import ProgramCard from './ProgramCard';

const programs = [
  {
    title: 'Jr. High Week',
    subtitle: 'Grades 6-8 (Ages 11-14)',
    imageSrc: '/programs/jr-high-group.jpg',
    imageAlt: 'Jr. High campers participating in group activities and team building exercises',
    benefits: [
      'Identity formation in Christ',
      'Peer community & belonging',
      'Foundational faith exploration',
    ],
    ctaText: 'See Dates & Pricing',
    ctaHref: '/jr-high',
  },
  {
    title: 'High School Week',
    subtitle: 'Grades 9-12 (Ages 15-18)',
    imageSrc: '/programs/high-school-activity.jpg',
    imageAlt: 'High school campers engaged in deep conversation during outdoor adventure activity',
    benefits: [
      'Leadership development',
      'Christian worldview formation',
      'Vocation & calling discernment',
    ],
    ctaText: 'See Dates & Pricing',
    ctaHref: '/high-school',
  },
];

export default function Programs({ className = '' }: { className?: string }) {
  return (
    <section className={`py-section-y md:py-section-y-md bg-sand ${className}`} ...>
      <div className="container mx-auto px-4">
        <h2 className="section-heading text-3xl md:text-4xl font-bold text-center text-bark mb-12">
          Which Camp Week Is Right for You?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {programs.map((program) => (
            <ProgramCard key={program.title} {...program} />
          ))}
        </div>
      </div>
    </section>
  );
}
```

**Tests:** Create ProgramCard.spec.tsx to test component in isolation

---

### P1-007: Hardcoded YouTube video ID (code-quality-auditor P1-003)
**Priority:** P1
**File:** `components/homepage/Testimonials.tsx` (after P0-003 split)
**Story Points:** 0.1 SP

**Issue:** Placeholder video ID `dQw4w9WgXcQ` is hardcoded with no config abstraction.

**Fix:**
Create config file:
```typescript
// lib/config/homepage.ts
export const homepageConfig = {
  testimonialVideoId: process.env.NEXT_PUBLIC_TESTIMONIAL_VIDEO_ID || 'dQw4w9WgXcQ',
  testimonialCaption: "Parent: \"Our son came home with a deeper faith\"",
} as const;
```

Update Testimonials.tsx:
```tsx
import { homepageConfig } from '@/lib/config/homepage';

export default function Testimonials({ className = '' }: { className?: string }) {
  return (
    <section ...>
      <TestimonialsVideoPlayer
        videoId={homepageConfig.testimonialVideoId}
        caption={homepageConfig.testimonialCaption}
      />
    </section>
  );
}
```

**Tests:** No test changes needed

---

## Fix Implementation Order

1. **P0-001:** Gallery React key (0.05 SP) - Quick win, no dependencies
2. **P0-002:** TrustBar tap targets (0.1 SP) - Quick win, no dependencies
3. **P1-005:** Tailwind spacing tokens (0.1 SP) - Prerequisite for other components
4. **P1-007:** Config file for video ID (0.1 SP) - Prerequisite for P0-003
5. **P0-003:** Split Testimonials component (0.3 SP) - Uses P1-007 config
6. **P1-004:** Remove autoplay from video (0.05 SP) - Depends on P0-003
7. **P1-002:** Replace anchor tags with Link in Programs (0.1 SP)
8. **P1-003:** Replace anchor tag with Link in Hero (0.1 SP)
9. **P1-006:** Extract ProgramCard component (0.3 SP) - Uses P1-002 Link changes
10. **P1-001:** Optimize Gallery loading (0.2 SP) - Final optimization

**Total Effort:** 1.4 SP

---

## Success Criteria

After all fixes:
- [ ] All P0 issues resolved
- [ ] All P1 issues resolved
- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] All Phase 1 tests pass (including updated tests)
- [ ] PE-Reviewer finds 0 P0/P1 issues
- [ ] code-quality-auditor finds 0 P0/P1 issues

---

## Test Updates Required

1. **TrustBar.phase1.spec.tsx:** Add test for `min-w-12` class
2. **Testimonials.phase1.spec.tsx:** Update to test both Testimonials and TestimonialsVideoPlayer
3. **Gallery.phase1.spec.tsx:** Verify first 3 images eager, last 3 lazy
4. **ProgramCard.spec.tsx:** Create new test file for extracted component

---

**Estimated Completion Time:** 90-120 minutes
**Ready for Implementation:** ✅
