# Homepage Mockup Conversion Requirements

> Convert `public/mockup/` HTML/CSS to Next.js components with Keystatic integration.

---

## Scope

**Source:** `public/mockup/index.html` + `styles.css`
**Target:** Next.js App Router pages + reusable components

---

## REQ-200: Design System Setup

### REQ-201: CSS Variables
- Extract CSS custom properties to `app/globals.css` or Tailwind config
- Colors: primary (#4A7A9E), secondary (#2F4F3D), accent (#A07856), neutrals
- Spacing scale: xs/sm/md/lg/xl/xxl
- **Acceptance:** Variables accessible in all components

### REQ-202: Typography
- System font stack for body/headings
- Caveat (Google Font) for `.handwritten` accents
- Mobile-responsive sizes (18px desktop → 16px mobile)
- **Acceptance:** Text renders correctly at all breakpoints

### REQ-203: Tailwind Integration
- Map CSS variables to Tailwind theme extend
- Create utility classes for common patterns (`.cta-primary`, etc.)
- **Acceptance:** `npm run build` succeeds with no style conflicts

---

## REQ-210: Homepage Components

### REQ-211: TrustBar
- Sticky on scroll, horizontal scroll on mobile
- Items: ACA Accredited, 500+ Families, Since 1948, 4.9/5 Rating, 80% Return
- **Keystatic:** Content editable (trust items array)
- **Acceptance:** Sticky behavior works, mobile scroll snaps

### REQ-212: HeroSection
- Full viewport height with background image/video
- Overlay gradient + centered content
- Animated scroll indicator
- **Keystatic:** Heading, tagline, subtitle, CTA text editable
- **Acceptance:** Hero fills viewport, CTA links to #programs

### REQ-213: MissionSection
- Background image with color overlay
- Handwritten kicker + statement + description
- Parallax on desktop (fixed attachment)
- **Keystatic:** All text editable
- **Acceptance:** Overlay readable, parallax disabled on mobile

### REQ-214: ProgramCard
- Reusable card: image, title, age range, features list, CTA
- Hover lift + image zoom effects
- **Keystatic:** Programs collection (title, ages, features[], image, CTA)
- **Acceptance:** Grid responsive (1 col mobile, 2 col tablet+)

### REQ-215: TestimonialSection
- Video placeholders with play button overlay
- Caption + duration display
- **Keystatic:** Testimonials collection (videoUrl, caption, duration)
- **Acceptance:** Play button hover state works

### REQ-216: GalleryGrid
- Responsive image grid (1→3→4 columns)
- Square aspect ratio, hover scale
- **Keystatic:** Gallery collection (image, alt text)
- **Acceptance:** Images lazy load, grid adapts to screen size

### REQ-217: InstagramFeed
- 6-item grid (placeholder for API)
- Hover overlay with "View on Instagram"
- **Keystatic:** Instagram handle editable
- **Non-goal:** Actual API integration (Phase 2)
- **Acceptance:** Placeholder renders, link works

### REQ-218: ContactSection
- Centered heading + subtitle + button row
- **Keystatic:** Heading, subtitle, email editable
- **Acceptance:** Buttons styled consistently

### REQ-219: MobileStickyCTA
- Fixed bottom bar, appears after scrolling past hero
- Two buttons: Register Now + Find Your Week
- Hidden on desktop (≥1024px)
- **Acceptance:** Visibility toggle works, z-index correct

### REQ-220: Footer
- 3-column grid: branding, quick links, social
- Social icon buttons (FB, IG, YT)
- **Keystatic:** Links and text editable
- **Acceptance:** Responsive grid, links work

---

## REQ-230: Accessibility

### REQ-231: Skip Link
- Visually hidden until focused
- Targets `#main-content`
- **Acceptance:** Tab-focusable, jumps to main

### REQ-232: Reduced Motion
- Respect `prefers-reduced-motion`
- Disable scroll animations, parallax, bouncing indicator
- **Acceptance:** No motion when preference set

### REQ-233: Focus States
- Visible outline on all interactive elements
- 3px accent color outline with offset
- **Acceptance:** Keyboard navigation visible

### REQ-234: Touch Targets
- Minimum 48×48px for all buttons/links
- **Acceptance:** Lighthouse accessibility score ≥90

---

## REQ-240: Performance

### REQ-241: Image Optimization
- Use Next.js `<Image>` component
- Lazy loading for below-fold images
- WebP format with fallbacks
- **Acceptance:** LCP <2.5s on mobile 3G

### REQ-242: Font Loading
- Preconnect to Google Fonts
- Font-display: swap for Caveat
- **Acceptance:** No layout shift from font loading

---

## Implementation Order (8 SP Total)

| Priority | Component | SP | Keystatic |
|----------|-----------|-----|-----------|
| P0 | Design system setup | 1 | - |
| P0 | HeroSection | 0.5 | Yes |
| P0 | TrustBar | 0.5 | Yes |
| P0 | ProgramCard + grid | 1 | Yes |
| P1 | MissionSection | 0.5 | Yes |
| P1 | Footer | 0.5 | Yes |
| P1 | GalleryGrid | 0.5 | Yes |
| P1 | MobileStickyCTA | 0.5 | - |
| P2 | TestimonialSection | 0.5 | Yes |
| P2 | InstagramFeed (placeholder) | 0.5 | Partial |
| P2 | ContactSection | 0.5 | Yes |
| P2 | Accessibility polish | 1 | - |

**Total: 8 SP**

---

## Non-Goals

- Video background (image placeholder for now)
- Instagram API integration
- Animation library (CSS only)
- Program detail pages (separate requirement)

---

## Files to Create

```
components/
  home/
    TrustBar.tsx
    HeroSection.tsx
    MissionSection.tsx
    ProgramCard.tsx
    TestimonialSection.tsx
    GalleryGrid.tsx
    InstagramFeed.tsx
    ContactSection.tsx
    MobileStickyCTA.tsx

app/
  page.tsx              # Homepage using above components
  globals.css           # Design system variables

keystatic/
  collections/
    programs.ts         # Jr High, High School
    testimonials.ts     # Video testimonials
    gallery.ts          # Photo gallery
  singletons/
    homepage.ts         # Hero, mission, trust bar content
```

---

## Definition of Done

- [ ] All REQ-2xx requirements pass acceptance criteria
- [ ] Keystatic admin can edit all marked content
- [ ] `npm run typecheck && npm run lint && npm test` pass
- [ ] Lighthouse scores: Performance ≥80, Accessibility ≥90
- [ ] Visual parity with mockup on mobile + desktop
