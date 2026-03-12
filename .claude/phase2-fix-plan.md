# Phase 2 Fix Plan - P0 and P1 Issues

**Date:** 2025-11-19
**Total Issues:** 6 P1 issues (0 P0 blockers)
**Estimated Effort:** 0.9 SP

---

## P1 Issues (High Priority - Must Fix)

### P1-001: Unused variable in InstagramFeed error handler (PE-Reviewer)
**Priority:** P1
**File:** `components/homepage/InstagramFeed.tsx:76`
**Story Points:** 0.05 SP

**Issue:** Lint error - variable `err` is caught but never used in catch block.

**Fix:**
```typescript
// BEFORE (line 76)
} catch (err) {
  setError('Unable to load Instagram feed');

// AFTER
} catch (_err) {
  setError('Unable to load Instagram feed');
```

**Tests:** No test changes needed (lint check will verify)

---

### P1-002: Magic number - scroll threshold (code-quality-auditor P1-1)
**Priority:** P1
**File:** `components/MobileStickyCTA.tsx:24`
**Story Points:** 0.1 SP

**Issue:** Hardcoded `50` for scroll percentage threshold. Not configurable or documented.

**Fix:**
```typescript
// Add constant at top of file (after imports)
const SCROLL_THRESHOLD_PERCENT = 50;

// Line 24
const scrollPercentage =
  (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
setIsVisible(scrollPercentage > SCROLL_THRESHOLD_PERCENT);
```

**Tests:** No test changes needed (tests verify behavior, not constant names)

---

### P1-003: Magic number - Intersection Observer threshold (code-quality-auditor P1-2)
**Priority:** P1
**File:** `lib/scroll-animations.ts:34`
**Story Points:** 0.1 SP

**Issue:** Hardcoded `0.2` threshold with no documentation of why 20% visibility chosen.

**Fix:**
```typescript
// Add constants at top of file
/**
 * Trigger animations when element is 20% visible in viewport.
 * Lower values = animations trigger sooner (may animate before user sees).
 * Higher values = animations trigger later (may miss animations on fast scrolls).
 */
const ANIMATION_VISIBILITY_THRESHOLD = 0.2;

// Line 34
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
        observer.unobserve(entry.target); // Cleanup after animation
      }
    });
  },
  {
    threshold: ANIMATION_VISIBILITY_THRESHOLD,
    rootMargin: '0px 0px -100px 0px',
  }
);
```

**Tests:** Update lib/scroll-animations.spec.ts to verify constant is used

---

### P1-004: Missing video load error handling (code-quality-auditor P1-5)
**Priority:** P1
**File:** `components/homepage/Hero.tsx:14-38`
**Story Points:** 0.2 SP

**Issue:** No error boundary if video fails to load. Hero section may appear blank on video load failure.

**Fix:**
Add state tracking for video load failures and ensure fallback image is visible:

```typescript
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { homepageConfig } from '@/lib/config/homepage';

interface HeroProps {
  className?: string;
  videoSources?: {
    webm?: string;
    mp4?: string;
  };
}

export default function Hero({
  className = '',
  videoSources = homepageConfig.heroVideo,
}: HeroProps) {
  const [videoFailed, setVideoFailed] = useState(false);

  return (
    <section className={`relative min-h-screen flex items-center justify-center ${className}`}>
      {/* Video Background (only if sources provided and not failed) */}
      {!videoFailed && videoSources && (videoSources.webm || videoSources.mp4) && (
        <video
          autoPlay
          muted
          loop
          playsInline
          poster={homepageConfig.heroVideo.poster}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ zIndex: 1 }}
          onError={() => setVideoFailed(true)}
        >
          {videoSources.webm && (
            <source src={videoSources.webm} type="video/webm" />
          )}
          {videoSources.mp4 && (
            <source src={videoSources.mp4} type="video/mp4" />
          )}
        </video>
      )}

      {/* Fallback Image - Always render for browsers that block autoplay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero-summer-camp.jpg"
          alt="Campers enjoying summer activities at Bear Lake Camp"
          fill
          sizes="100vw"
          className="object-cover"
          priority
          quality={85}
        />
      </div>

      {/* ... rest of component unchanged ... */}
    </section>
  );
}
```

**Tests:** Add test to Hero.phase2.spec.tsx verifying video error handling

---

### P1-005: InstagramFeed memory leak risk (PE-Reviewer P2-001, code-quality-auditor P2-7)
**Priority:** P1 (elevated from P2 due to combination)
**File:** `components/homepage/InstagramFeed.tsx:64-91`
**Story Points:** 0.15 SP

**Issue:** If component unmounts during fetch, setState calls on unmounted component cause warnings and potential memory leaks.

**Fix:**
```typescript
useEffect(() => {
  let isMounted = true;

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      if (isMounted) {
        setPosts(placeholderPosts);
        setError(null);
      }
    } catch (_err) {
      if (isMounted) {
        setError('Unable to load Instagram feed');
        setPosts(placeholderPosts); // Fallback to placeholders
      }
    } finally {
      if (isMounted) {
        setIsLoading(false);
      }
    }
  };

  fetchPosts();

  // Refresh every 24 hours
  const refreshInterval = setInterval(fetchPosts, 24 * 60 * 60 * 1000);

  return () => {
    isMounted = false;
    clearInterval(refreshInterval);
  };
}, []);
```

**Tests:** InstagramFeed.phase2.spec.tsx already tests cleanup (REQ-Q2-005 line 82)

---

### P1-006: TODO comment not tracked (code-quality-auditor P1-4)
**Priority:** P1
**File:** `components/homepage/InstagramFeed.tsx:15`
**Story Points:** 0.05 SP

**Issue:** TODO comment "Replace with real Instagram Basic Display API integration" not tracked in technical debt log.

**Fix:**
Create technical debt tracking file if it doesn't exist:

```markdown
# Technical Debt Log

**Last Updated:** 2025-11-19

---

## Active Debt

### DEBT-001: Instagram API Integration
**Component:** InstagramFeed.tsx:15
**Priority:** P2 (Phase 3)
**Story Points:** 3 SP
**Created:** 2025-11-19

**Description:**
Currently using placeholder posts. Need to integrate Instagram Basic Display API for live feed.

**Implementation Options:**
1. Instagram Basic Display API (free, requires app approval)
2. Smash Balloon Social Feed ($49/year, no API setup)
3. Static embed (manual update, no API)

**Acceptance Criteria:**
- Fetch 6 most recent posts from @bearlakecamp
- Daily refresh
- Loading/error states
- Fallback to placeholders on API failure

**References:**
- REQ-Q2-005: Integrate Instagram Feed
- Phase 3 backlog item

**Notes:**
- Defer to Phase 3 per requirements.lock.md
- Current placeholder implementation satisfies Phase 2 acceptance criteria
```

Remove TODO comment from InstagramFeed.tsx:
```typescript
// BEFORE (line 15)
// TODO: Replace with real Instagram Basic Display API integration

// AFTER (remove comment entirely - now tracked in TECHNICAL-DEBT.md)
```

**Tests:** No test changes needed

---

## P1-007: Missing component unit tests (code-quality-auditor P1-3)
**Priority:** P1
**Files:** `components/homepage/Hero.tsx`, `components/homepage/Mission.tsx`, `components/homepage/Testimonials.tsx`
**Story Points:** 0.25 SP

**Issue:** These components have integration tests but lack component-level unit tests for isolated behavior verification.

**Fix:**
Tests already exist in Phase 2 test suite:
- `components/homepage/Hero.phase2.spec.tsx` - 15 tests for video support
- `components/homepage/Mission.spec.tsx` - 16 tests
- `components/homepage/Mission.phase2.spec.tsx` - 15 tests
- `components/homepage/Testimonials.phase2.spec.tsx` - 23 tests

**Action Required:** None - tests already implemented in Phase 2 QCODET step

**Estimated Effort:** 0 SP (already complete)

---

## Fix Implementation Order

1. **P1-001:** Fix unused variable (0.05 SP) - Quick lint fix
2. **P1-002:** Extract scroll threshold constant (0.1 SP)
3. **P1-003:** Extract Intersection Observer threshold (0.1 SP)
4. **P1-005:** Add mounted check to InstagramFeed (0.15 SP)
5. **P1-004:** Add video error handling to Hero (0.2 SP) - Requires 'use client'
6. **P1-006:** Document TODO in technical debt log (0.05 SP)
7. **P1-007:** Verify tests exist (0 SP) - Already complete

**Total Effort:** 0.65 SP (excluding P1-007 which is already complete)

---

## Success Criteria

After all fixes:
- [ ] All P1 issues resolved
- [ ] `npm run lint` passes (P1-001 fixed)
- [ ] `npm run typecheck` passes
- [ ] All Phase 2 tests pass
- [ ] PE-Reviewer finds 0 P0/P1 issues on second check
- [ ] code-quality-auditor finds 0 P0/P1 issues on second check

---

**Estimated Completion Time:** 45-60 minutes
**Ready for Implementation:** ✅
