# Phase 0 Requirements Lock
> **Task:** Bear Lake Camp Redesign - Phase 0: Design System Foundation
> **Created:** 2025-11-19
> **Story Points:** 5 SP (implementation + tests)

## REQ-001: CSS Variables in Tailwind Config
**Acceptance Criteria:**
- Tailwind config extends theme with exact color values from mockup CSS variables
- Colors: primary (#4A7A9E), primary-light (#7A9DB8), primary-dark (#2F5A7A)
- Colors: secondary (#2F4F3D), secondary-light (#5A7A65)
- Colors: accent (#A07856), accent-light (#C4A882)
- Colors: cream (#F5F0E8), sand (#D4C5B0), stone (#8A8A7A), bark (#5A4A3A)
- Font families: sans (system fonts), handwritten (Caveat)
- Spacing scale: xs (0.5rem), sm (1rem), md (1.5rem), lg (2rem), xl (3rem), xxl (4rem)
- Generated CSS includes all custom classes
- Config structure is typed correctly (TypeScript)

**Non-Goals:**
- Custom animations or transitions
- Plugin configuration beyond theme extension

---

## REQ-002: Layout with Optimized Fonts and Meta Tags
**Acceptance Criteria:**
- app/layout.tsx imports Caveat font via next/font/google
- Caveat font variable applied to html element as CSS variable
- Body has classes: font-sans, text-[1.125rem], text-bark, bg-cream
- Meta tags include title, description, OpenGraph tags
- Skip link for accessibility (href="#main-content")
- Skip link is visually hidden but keyboard accessible
- Layout renders without TypeScript errors
- Layout accepts children prop correctly

**Non-Goals:**
- Custom fonts beyond Caveat
- Navigation components (deferred to Phase 1)

---

## REQ-003: Hero Component Structure
**Acceptance Criteria:**
- components/homepage/Hero.tsx exists and exports default React component
- Component renders a section element
- Component has basic TypeScript interface (even if empty)
- Component renders without errors
- Component accepts optional className prop for styling

**Non-Goals:**
- Hero content implementation (video, CTA buttons)
- Hero styling/animations

---

## REQ-004: TrustBar Component Structure
**Acceptance Criteria:**
- components/homepage/TrustBar.tsx exists and exports default React component
- Component renders a section element
- Component has basic TypeScript interface
- Component renders without errors
- Component accepts optional className prop

**Non-Goals:**
- Trust bar content (ACA badge, stats)
- Trust bar styling

---

## REQ-005: Programs Component Structure
**Acceptance Criteria:**
- components/homepage/Programs.tsx exists and exports default React component
- Component renders a section element
- Component has basic TypeScript interface
- Component renders without errors
- Component accepts optional className prop

**Non-Goals:**
- Program cards implementation
- Program data fetching

---

## REQ-006: Testimonials Component Structure
**Acceptance Criteria:**
- components/homepage/Testimonials.tsx exists and exports default React component
- Component renders a section element
- Component has basic TypeScript interface
- Component renders without errors
- Component accepts optional className prop

**Non-Goals:**
- Video testimonials implementation
- Testimonial data fetching

---

## REQ-007: Gallery Component Structure
**Acceptance Criteria:**
- components/homepage/Gallery.tsx exists and exports default React component
- Component renders a section element
- Component has basic TypeScript interface
- Component renders without errors
- Component accepts optional className prop

**Non-Goals:**
- Gallery lightbox implementation
- Image optimization

---

## REQ-008: InstagramFeed Component Structure
**Acceptance Criteria:**
- components/homepage/InstagramFeed.tsx exists and exports default React component
- Component renders a section element
- Component has basic TypeScript interface
- Component renders without errors
- Component accepts optional className prop

**Non-Goals:**
- Instagram API integration
- Feed styling/grid layout

---

## REQ-009: Homepage Composition
**Acceptance Criteria:**
- app/page.tsx imports and renders all 6 homepage sections in order:
  1. Hero
  2. TrustBar
  3. Programs
  4. Testimonials
  5. Gallery
  6. InstagramFeed
- Each section renders without errors
- Homepage has semantic main element with id="main-content" for skip link
- No TypeScript errors in page.tsx

**Non-Goals:**
- Section styling/spacing
- Section content implementation

---

## REQ-010: Content Page Template
**Acceptance Criteria:**
- app/about/page.tsx exists and renders successfully
- About page uses correct typography classes (text-bark, font-sans)
- About page has semantic structure (h1, paragraphs)
- About page has main element for accessibility
- No TypeScript errors in about/page.tsx

**Non-Goals:**
- About page content (real copy)
- About page images/media
- Markdown rendering
