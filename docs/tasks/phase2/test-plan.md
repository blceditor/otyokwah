# Test Plan: Phase 2 - Core Features

> **Story Points**: Test development 5 SP

## Test Coverage Matrix

| REQ-ID | Unit Tests | Integration Tests | Total Tests | Status |
|--------|------------|-------------------|-------------|--------|
| REQ-Q2-001 | 15 tests | - | 15 | ❌ Failing (expected) |
| REQ-Q2-003 | 31 tests | - | 31 | ❌ Failing (expected) |
| REQ-Q2-004 | 23 tests | - | 23 | ❌ Failing (expected) |
| REQ-Q2-005 | 20 tests | - | 20 | ❌ Failing (expected) |
| REQ-Q2-006 | 39 tests | - | 39 | ❌ Failing (expected) |
| REQ-Q2-007 | 21 tests | - | 21 | ❌ Failing (expected) |
| REQ-Q2-008 | - | 25 tests | 25 | ❌ Failing (expected) |
| REQ-Q2-009 | - | 31 tests | 31 | ❌ Failing (expected) |
| **TOTAL** | **149 tests** | **56 tests** | **205 tests** | **All failing (TDD red phase)** |

## Test Files Created

### Unit Tests

#### REQ-Q2-001: Hero Video (15 tests, 0.5 SP)
- **File**: `components/homepage/Hero.phase2.spec.tsx`
- **Tests**:
  - Video background element exists
  - Video autoplays (muted)
  - Video loops seamlessly
  - Modern codecs with WebM + MP4 fallbacks
  - Fallback to static image
  - Lazy loading pattern (preload="none" or "metadata")
  - ARIA attributes (aria-hidden="true")
  - playsInline for iOS
  - Poster image for loading state
  - object-cover for full coverage
  - File size optimization comments
  - Non-goal: No interactive controls
  - Non-goal: Single video only
  - Performance: Lazy load after critical content
  - Layout: Absolute positioning

#### REQ-Q2-003: Mission Section (31 tests, 1 SP)
- **File**: `components/homepage/Mission.spec.tsx` (16 tests)
- **File**: `components/homepage/Mission.phase2.spec.tsx` (15 tests)
- **Tests**:
  - Section element with id="mission"
  - Semantic HTML (h2 heading)
  - ARIA labels (aria-labelledby)
  - "Our Mission" kicker with handwritten font
  - Mission statement: "Faith. Adventure. Transformation."
  - Full description visible
  - Background image with next/image
  - Dark overlay for text readability
  - Renders between Hero and Programs
  - Responsive layout (mobile/desktop)
  - Accessibility: Heading hierarchy, color contrast, alt text
  - Content quality checks
  - Layout: Max-width container, z-index management
  - Performance: Lazy loading, image quality
  - Non-goals: No interactive elements, animations, multiple statements

#### REQ-Q2-004: Video Testimonials (23 tests, 0.8 SP)
- **File**: `components/homepage/Testimonials.phase2.spec.tsx`
- **Tests**:
  - 3 video players displayed
  - Custom thumbnails for each video
  - Lazy-load pattern (no iframes on initial render)
  - Captions enabled (cc_load_policy=1)
  - Descriptive caption text for each
  - Responsive grid (1 col mobile, 3 col desktop)
  - Click-to-load (no autoplay)
  - Video IDs from homepage config
  - Config includes parent/camper/staff videos
  - Accessibility: ARIA labels, alt text, heading hierarchy
  - Performance: next/image thumbnails, lazy iframes
  - Non-goals: No self-hosted videos, upload interface, analytics
  - Alternative: 2 col desktop layout acceptable

#### REQ-Q2-005: Instagram Feed (20 tests, 0.7 SP)
- **File**: `components/homepage/InstagramFeed.phase2.spec.tsx`
- **Tests**:
  - Displays 6 most recent posts
  - Daily refresh mechanism
  - Responsive grid (2 col mobile, 3 col desktop)
  - Clickable posts (opens Instagram in new tab)
  - Hover effects (scale/overlay)
  - Loading state (skeleton/spinner)
  - Error state with fallback
  - Static placeholders if API unavailable
  - Accessibility: ARIA labels, alt text, external link attributes
  - Performance: next/image, lazy loading, client-side fetching
  - Non-goals: No auth, comments/likes, Stories, iframe embed
  - Implementation: Smash Balloon or API approach acceptable

#### REQ-Q2-006: Mobile Sticky CTA (39 tests, 1 SP)
- **File**: `components/MobileStickyCTA.spec.tsx` (23 tests)
- **File**: `components/MobileStickyCTA.phase2.spec.tsx` (16 tests)
- **Tests**:
  - Sticky/fixed positioning
  - Appears after 50% scroll
  - Visible only on < 1024px viewports
  - 2 buttons: Register Now + Find Your Week
  - 48px minimum tap targets
  - Proper z-index (40-50 range)
  - Smooth slide-in transition
  - Register Now links to UltraCamp
  - Find Your Week scrolls to #programs
  - Does not block critical content
  - Primary/secondary button styling
  - Accessibility: ARIA, accessible names
  - Scroll behavior: Hidden initially, smooth transition
  - Performance: CSS transforms, throttled scroll listener
  - Non-goals: No desktop version, close button, A/B testing
  - Responsive: Visible on mobile/tablet, hidden on desktop

#### REQ-Q2-007: Scroll Animations (21 tests, 0.5 SP)
- **File**: `lib/scroll-animations.spec.ts`
- **Tests**:
  - initScrollAnimations function exists
  - Uses IntersectionObserver API
  - Respects prefers-reduced-motion
  - 20% visibility threshold
  - 300-500ms transition duration
  - Browser compatibility (no experimental APIs)
  - No animation library dependencies
  - Layout stability (opacity/transform, no display changes)
  - GPU acceleration (CSS transforms)
  - Elements maintain space before animation
  - Observer disconnects when complete
  - Passive event listeners
  - Minimal DOM manipulation (class additions)
  - Non-goals: No parallax, video playback, stagger, progress indicators
  - Accessibility: Disabled when reduced motion preferred
  - Integration: Works with any section element

### Integration Tests

#### REQ-Q2-008: Accessibility Audit (25 tests, 1 SP)
- **File**: `tests/integration/phase2/accessibility.spec.tsx`
- **Tests**:
  - All images have descriptive alt text
  - Hero image alt text quality
  - Program images contextual alt text
  - All interactive elements 48px tap targets
  - Mobile sticky CTA tap targets
  - Hero CTA tap target
  - Hero text contrast (WCAG AA)
  - Mission section contrast
  - Button text contrast
  - All elements keyboard accessible
  - Skip to main content link
  - Logical tab order
  - Focus indicators visible
  - Custom focus styles maintain visibility
  - Proper heading hierarchy (h1 > h2 > h3)
  - Sections use landmark elements
  - Lists use proper elements
  - Forms have associated labels
  - Sections have aria-labelledby
  - Navigation elements have ARIA
  - Decorative images have aria-hidden
  - Non-goals: No WCAG AAA, i18n, RTL

#### REQ-Q2-009: Performance Optimization (31 tests, 1.5 SP)
- **File**: `tests/integration/phase2/performance.spec.tsx`
- **Tests**:
  - All images use next/image
  - Hero image uses priority (LCP)
  - Below-fold images lazy load
  - Images have proper sizing
  - Bundle size under 200KB check
  - No large animation libraries
  - Dynamic imports where appropriate
  - Critical CSS inlined (Next.js auto)
  - Fonts preloaded with next/font
  - No external CSS from CDN
  - Scripts deferred/async
  - LCP optimization (priority on Hero)
  - CLS prevention (image dimensions)
  - TBT reduction (server components)
  - FCP optimization (next/font)
  - Hero video lazy loading
  - Testimonial videos click-to-load
  - Videos use optimized codecs
  - Preconnect to external domains
  - DNS prefetch for third-party
  - Static assets cache headers
  - Images from optimized CDN
  - Vercel Analytics integrated
  - Web Vitals tracking
  - Mobile images appropriate sizes
  - Mobile sticky CTA positioning
  - Scroll animations use transforms
  - Non-goals: No edge runtime, manual AVIF config

## Test Execution Strategy

### Phase 1: Unit Tests (Parallel)
Run all domain unit tests concurrently:
```bash
npm test -- components/homepage/Hero.phase2.spec.tsx &
npm test -- components/homepage/Mission.spec.tsx &
npm test -- components/homepage/Testimonials.phase2.spec.tsx &
npm test -- components/homepage/InstagramFeed.phase2.spec.tsx &
npm test -- components/MobileStickyCTA.spec.tsx &
npm test -- lib/scroll-animations.spec.ts &
wait
```

### Phase 2: Integration Tests (Sequential)
After units pass, run integration tests:
```bash
npm test -- tests/integration/phase2/accessibility.spec.tsx
npm test -- tests/integration/phase2/performance.spec.tsx
```

### Phase 3: Full Test Suite
```bash
npm test
```

## Test Failure Analysis (TDD Red Phase)

### Expected Failures

All 205 tests are currently failing as expected. This confirms proper TDD workflow:

#### REQ-Q2-001: Hero Video (15 failures)
- **Root Cause**: `Hero.tsx` does not contain video element yet
- **Error**: `expect(received).toBeInTheDocument()` - video element is null
- **Next Step**: Implement video background with WebM/MP4 sources

#### REQ-Q2-003: Mission Section (31 failures)
- **Root Cause**: `Mission.tsx` component does not exist
- **Error**: `Failed to resolve import "./Mission"`
- **Next Step**: Create Mission component with background image, kicker, statement

#### REQ-Q2-004: Video Testimonials (23 failures)
- **Root Cause**: `Testimonials.tsx` only supports 1 video, not 3
- **Error**: Grid layout and multiple videos not implemented
- **Next Step**: Extend to 3 videos with grid layout, update config

#### REQ-Q2-005: Instagram Feed (20 failures)
- **Root Cause**: `InstagramFeed.tsx` is placeholder, no API integration
- **Error**: No posts displayed, no data fetching
- **Next Step**: Implement Instagram API or Smash Balloon widget integration

#### REQ-Q2-006: Mobile Sticky CTA (39 failures)
- **Root Cause**: `MobileStickyCTA.tsx` component does not exist
- **Error**: `Failed to resolve import "./MobileStickyCTA"`
- **Next Step**: Create sticky CTA with scroll detection, responsive visibility

#### REQ-Q2-007: Scroll Animations (21 failures)
- **Root Cause**: `lib/scroll-animations.ts` module does not exist
- **Error**: `Failed to resolve import "./scroll-animations"`
- **Next Step**: Create scroll animation utility with IntersectionObserver

#### REQ-Q2-008: Accessibility Audit (25 failures)
- **Root Cause**: Missing components, incomplete ARIA labels, tap targets
- **Error**: Various accessibility violations
- **Next Step**: Implement accessibility features as components are built

#### REQ-Q2-009: Performance Optimization (31 failures)
- **Root Cause**: Missing optimizations, videos not lazy loaded
- **Error**: Performance targets not met
- **Next Step**: Apply performance optimizations during implementation

## Success Criteria

**Phase 2 test suite passes when**:
- ✅ All 205 tests pass
- ✅ 100% of REQ-IDs have test coverage
- ✅ All acceptance criteria validated by tests
- ✅ All non-goals validated (negative tests pass)

## Implementation Guidance

### Priority Order (Based on Dependencies)

1. **lib/scroll-animations.ts** (0.5 SP)
   - No dependencies
   - Utility used by all sections
   - 21 tests to satisfy

2. **components/homepage/Mission.tsx** (1.5 SP)
   - Uses scroll-animations
   - 31 tests to satisfy
   - Add to homepage between Hero and Programs

3. **components/homepage/Hero.tsx** (video support) (2 SP)
   - Extend existing Hero component
   - 15 new tests to satisfy
   - Keep backward compatibility with static image

4. **components/homepage/Testimonials.tsx** (extend to 3 videos) (2 SP)
   - Extend existing component
   - 23 tests to satisfy
   - Update lib/config/homepage.ts

5. **components/MobileStickyCTA.tsx** (1 SP)
   - Uses scroll detection
   - 39 tests to satisfy
   - Add to layout for global visibility

6. **components/homepage/InstagramFeed.tsx** (API integration) (2 SP)
   - Extend placeholder
   - 20 tests to satisfy
   - Implement Smash Balloon or API approach

7. **Accessibility Fixes** (1 SP)
   - Applied across all components
   - 25 integration tests to satisfy
   - Run Lighthouse audit to verify ≥90 score

8. **Performance Optimizations** (1.5 SP)
   - Applied across all components
   - 31 integration tests to satisfy
   - Run Lighthouse to verify ≥90 score, LCP <2.5s

### Configuration Updates Required

**lib/config/homepage.ts**:
```typescript
export const homepageConfig = {
  // Existing
  testimonialVideoId: process.env.NEXT_PUBLIC_TESTIMONIAL_VIDEO_ID || 'dQw4w9WgXcQ',
  testimonialCaption: "Parent: \"Our son came home with a deeper faith\"",

  // NEW: Phase 2 additions
  testimonialVideos: [
    {
      id: process.env.NEXT_PUBLIC_TESTIMONIAL_PARENT_VIDEO_ID || 'dQw4w9WgXcQ',
      caption: "Parent: \"Our son came home with a deeper faith\"",
      thumbnail: '/testimonials/parent-thumb.jpg'
    },
    {
      id: process.env.NEXT_PUBLIC_TESTIMONIAL_CAMPER_VIDEO_ID || 'dQw4w9WgXcQ',
      caption: "Camper: \"Best week of my summer!\"",
      thumbnail: '/testimonials/camper-thumb.jpg'
    },
    {
      id: process.env.NEXT_PUBLIC_TESTIMONIAL_STAFF_VIDEO_ID || 'dQw4w9WgXcQ',
      caption: "Staff: \"Watching campers grow in faith is incredible\"",
      thumbnail: '/testimonials/staff-thumb.jpg'
    }
  ],

  heroVideo: {
    enabled: process.env.NEXT_PUBLIC_HERO_VIDEO_ENABLED === 'true',
    webm: '/videos/hero-camp.webm',
    mp4: '/videos/hero-camp.mp4',
    poster: '/hero-summer-camp.jpg'
  },

  instagramFeed: {
    enabled: process.env.NEXT_PUBLIC_INSTAGRAM_ENABLED === 'true',
    username: 'bearlakecamp',
    count: 6
  }
} as const;
```

### Asset Placeholders Needed

Create placeholder assets for development:

- `/public/videos/hero-camp.webm` (placeholder video)
- `/public/videos/hero-camp.mp4` (placeholder video)
- `/public/testimonials/parent-thumb.jpg`
- `/public/testimonials/camper-thumb.jpg`
- `/public/testimonials/staff-thumb.jpg`
- `/public/mission-background.jpg`

### TypeScript Interfaces

**types/homepage.ts** (new file):
```typescript
export interface TestimonialVideo {
  id: string;
  caption: string;
  thumbnail: string;
}

export interface HeroVideoConfig {
  enabled: boolean;
  webm: string;
  mp4: string;
  poster: string;
}

export interface InstagramConfig {
  enabled: boolean;
  username: string;
  count: number;
}
```

## Test Coverage by Story Points

| Component/Feature | Tests | Story Points |
|-------------------|-------|--------------|
| Scroll Animations | 21 | 0.5 SP |
| Mission Section | 31 | 1 SP |
| Hero Video | 15 | 0.5 SP |
| Video Testimonials | 23 | 0.8 SP |
| Instagram Feed | 20 | 0.7 SP |
| Mobile Sticky CTA | 39 | 1 SP |
| Accessibility Audit | 25 | 1 SP |
| Performance Optimization | 31 | 1.5 SP |
| **TOTAL** | **205** | **5 SP** |

## References

- **Requirements**: `requirements/requirements.lock.md`
- **Phase 1 Tests**: `components/homepage/*.phase1.spec.tsx`
- **Test Guidelines**: `.claude/agents/test-writer.md`
- **Story Points**: `docs/project/PLANNING-POKER.md`
