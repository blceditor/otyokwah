# Website Redesign Mockups

> **Purpose**: Design improvement recommendations for all 35 pages of prelaunch.bearlakecamp.com
> **Date**: December 2025
> **Based on**: SIMPLE design principles, validator results, UX best practices

---

## Executive Summary

### Current State
- **SEO Score**: 38/100 (critical issues)
- **Accessibility**: 1 serious issue (missing `<main>` landmark)
- **Mobile**: Touch targets too small, font sizes below 16px

### Priority Improvements
1. **P0 - Critical**: Fix SEO meta tags, add `<main>` landmark, add schema.org
2. **P1 - High**: Increase touch targets to 44px, fix font sizes
3. **P2 - Medium**: Add sticky mobile CTA, improve trust signals
4. **P3 - Nice to have**: Visual polish, animations

---

## Global Issues & Fixes

### Issue 1: Missing SEO Meta Tags (All Pages)
```
CURRENT: Only title tag present
NEEDED: description, og:title, og:description, og:image, twitter:card, canonical
```

**Mockup - Meta Tags Pattern:**
```html
<head>
  <title>{pageTitle} | Bear Lake Camp</title>
  <meta name="description" content="{150 char description}" />
  <link rel="canonical" href="https://bearlakecamp.org/{slug}" />

  <!-- Open Graph -->
  <meta property="og:title" content="{pageTitle}" />
  <meta property="og:description" content="{description}" />
  <meta property="og:image" content="/og-image-{page}.jpg" />
  <meta property="og:url" content="https://bearlakecamp.org/{slug}" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="{pageTitle}" />
  <meta name="twitter:description" content="{description}" />
</head>
```

**Implementation**: Update `app/layout.tsx` and each page's `generateMetadata()`

---

### Issue 2: Missing `<main>` Landmark (All Pages)
```
CURRENT: Content in <div> without semantic landmark
NEEDED: <main id="main-content"> wrapper
```

**Mockup:**
```tsx
// app/layout.tsx
<body>
  <a href="#main-content" className="skip-link">Skip to content</a>
  <Header />
  <main id="main-content" tabIndex={-1}>
    {children}
  </main>
  <Footer />
</body>
```

---

### Issue 3: Missing Schema.org JSON-LD (All Pages)
**Mockup - Organization Schema:**
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Bear Lake Camp",
  "description": "Christian summer camp for Jr. High and High School students",
  "url": "https://bearlakecamp.org",
  "logo": "https://bearlakecamp.org/logo.png",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Montpelier",
    "addressRegion": "ID",
    "addressCountry": "US"
  },
  "sameAs": [
    "https://www.facebook.com/bearlakecamp",
    "https://www.instagram.com/bearlakecamp"
  ]
}
```

---

### Issue 4: Touch Targets Too Small (Mobile)
```
CURRENT: Buttons 40px, carousel dots 12-15px
NEEDED: Minimum 44x44px for WCAG 2.2 AA
```

**Mockup - Button Sizes:**
```css
/* Current */
.button { padding: 8px 16px; } /* ~40px height */

/* Fixed */
.button {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 24px;
}

/* Carousel dots */
.dot {
  width: 12px;   /* Current */
  width: 44px;   /* Fixed - with visual indicator smaller */
  height: 44px;
}
```

---

### Issue 5: Font Sizes Below 16px
```
CURRENT: 16 elements with font < 16px
NEEDED: Minimum 16px for body text on mobile
```

**Affected Elements:**
- Footer links
- Caption text
- Form labels
- Small navigation items

---

### Issue 6: Two H1 Tags (Homepage)
```
CURRENT: Logo text + Hero title both as H1
NEEDED: Single H1 per page (hero title only)
```

**Fix**: Change logo to `<span>` or remove text, keep only hero H1

---

## Page-by-Page Mockups

---

## 1. Homepage (/)

### Current Layout
```
┌─────────────────────────────────────────┐
│ [Logo]    Nav Items    [Register Now]   │ <- Header
├─────────────────────────────────────────┤
│                                         │
│          HERO CAROUSEL                  │ <- 5 images, 500px min-height
│      "HOME" / "To Know Christ"          │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│         MARKDOWN CONTENT                │ <- Body content
│         (Mission, etc.)                 │
│                                         │
├─────────────────────────────────────────┤
│         PHOTO GALLERY                   │ <- 4-col grid
├─────────────────────────────────────────┤
│         CTA SECTION                     │ <- Register button
├─────────────────────────────────────────┤
│         FOOTER                          │
└─────────────────────────────────────────┘
```

### Issues Found
1. ❌ No trust bar (years, accreditation, stats)
2. ❌ Hero text "HOME" not descriptive
3. ❌ No testimonials section
4. ❌ No program overview cards
5. ❌ Missing sticky mobile CTA

### Proposed Layout
```
┌─────────────────────────────────────────┐
│ [Logo]    Nav Items    [Register Now]   │
├─────────────────────────────────────────┤
│                                         │
│          HERO VIDEO/CAROUSEL            │ <- Keep carousel
│   "Where Faith Grows Wild"              │ <- Better tagline
│   [Watch Video] [Register Now]          │ <- Dual CTAs
│                                         │
├─────────────────────────────────────────┤
│  ⭐ EST. 1940  |  ⭐ 1000+ CAMPERS/YR   │ <- NEW: Trust bar
│  ⭐ CHRISTIAN  |  ⭐ IDAHO MOUNTAINS    │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐   │ <- NEW: Program cards
│  │JR HIGH  │ │SR HIGH  │ │RETREATS │   │
│  │Gr 6-8   │ │Gr 9-12  │ │All Ages │   │
│  │$XXX     │ │$XXX     │ │Custom   │   │
│  └─────────┘ └─────────┘ └─────────┘   │
│                                         │
├─────────────────────────────────────────┤
│         "OUR MISSION"                   │ <- Existing content
│         Mission statement...            │
├─────────────────────────────────────────┤
│         TESTIMONIAL                     │ <- NEW: Parent quote
│  "Bear Lake changed my child's life"   │
│         - Sarah M., Parent              │
├─────────────────────────────────────────┤
│         PHOTO GALLERY                   │ <- Keep existing
├─────────────────────────────────────────┤
│         CTA SECTION                     │
│   "Ready for an Adventure?"             │
│        [Register Now]                   │
├─────────────────────────────────────────┤
│         FOOTER                          │
└─────────────────────────────────────────┘

MOBILE: Sticky bottom CTA bar
┌─────────────────────────────────────────┐
│     [Register Now - $XXX/week]          │ <- Fixed bottom
└─────────────────────────────────────────┘
```

### Component Specifications

**Trust Bar Component:**
```tsx
<TrustBar
  items={[
    { icon: "calendar", text: "Est. 1940" },
    { icon: "users", text: "1000+ Campers/Year" },
    { icon: "cross", text: "Christian Faith" },
    { icon: "mountain", text: "Idaho Mountains" },
  ]}
/>
```

**Program Card Component:**
```tsx
<ProgramCard
  title="Junior High Camp"
  ageRange="Grades 6-8"
  price="$XXX"
  dates="June 14-20, 21-27, ..."
  href="/summer-camp-junior-high"
  image="/images/jr-high.jpg"
/>
```

---

## 2. Summer Camp Pages (/summer-camp/*)

### Current Layout
```
┌─────────────────────────────────────────┐
│ HERO with title                         │
├─────────────────────────────────────────┤
│ Program Details (Age/Dates/Price)       │ <- 3-col cards
├─────────────────────────────────────────┤
│ Content sections (alternating bg)       │
├─────────────────────────────────────────┤
│ Gallery                                 │
├─────────────────────────────────────────┤
│ Registration CTA                        │
└─────────────────────────────────────────┘
```

### Issues Found
1. ❌ No session picker/calendar view
2. ❌ No availability indicators
3. ❌ FAQ not prominent enough
4. ❌ Parent info scattered

### Proposed Changes

**Add Session Picker:**
```
┌─────────────────────────────────────────┐
│  CHOOSE YOUR WEEK                       │
├─────────────────────────────────────────┤
│ ┌───────────────┐ ┌───────────────┐    │
│ │ Week 1        │ │ Week 2        │    │
│ │ June 14-20    │ │ June 21-27    │    │
│ │ ● 5 spots left│ │ ✓ Available   │    │
│ │ [Select]      │ │ [Select]      │    │
│ └───────────────┘ └───────────────┘    │
│ ┌───────────────┐ ┌───────────────┐    │
│ │ Week 3        │ │ Week 4        │    │
│ │ June 28-Jul 4 │ │ July 5-11     │    │
│ │ ✓ Available   │ │ SOLD OUT      │    │
│ │ [Select]      │ │ [Waitlist]    │    │
│ └───────────────┘ └───────────────┘    │
└─────────────────────────────────────────┘
```

**Parent Info Sidebar (Desktop):**
```
┌──────────────────────┬─────────┐
│ Main Content         │ SIDEBAR │
│                      ├─────────┤
│                      │ Quick   │
│                      │ Links:  │
│                      │ - FAQ   │
│                      │ - Pack  │
│                      │ - Forms │
│                      │ - Drop  │
│                      │   off   │
└──────────────────────┴─────────┘
```

---

## 3. About Pages (/about/*)

### Current State
- Basic content pages
- Good hierarchy
- Missing team photos on some pages

### Proposed Changes

**About Main Page - Add Team Preview:**
```
┌─────────────────────────────────────────┐
│         MEET OUR TEAM                   │
├─────────────────────────────────────────┤
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐        │
│ │Photo│ │Photo│ │Photo│ │Photo│        │
│ │Name │ │Name │ │Name │ │Name │        │
│ │Role │ │Role │ │Role │ │Role │        │
│ └─────┘ └─────┘ └─────┘ └─────┘        │
│         [Meet the Full Team →]          │
└─────────────────────────────────────────┘
```

---

## 4. Facilities Pages (/facilities/*)

### Current State
- FacilityTemplate with features grid
- Gallery section
- Booking CTA

### Proposed Changes

**Add Virtual Tour CTA:**
```
┌─────────────────────────────────────────┐
│  🎥 TAKE A VIRTUAL TOUR                 │
│  Explore our facilities from home       │
│  [Start Tour]                           │
└─────────────────────────────────────────┘
```

**Add Capacity/Specs Table:**
```
┌─────────────────────────────────────────┐
│  FACILITY SPECS                         │
├───────────────┬─────────────────────────┤
│ Capacity      │ 150 people              │
│ Square Feet   │ 5,000 sq ft             │
│ A/V Equipment │ Projector, sound system │
│ Accessibility │ Wheelchair accessible   │
└───────────────┴─────────────────────────┘
```

---

## 5. Rentals Pages (/rentals/*)

### Current State
- Basic facility info
- Pricing info
- Contact CTA

### Proposed Changes

**Add Pricing Calculator:**
```
┌─────────────────────────────────────────┐
│  ESTIMATE YOUR RENTAL                   │
├─────────────────────────────────────────┤
│  Facility: [Dropdown]                   │
│  Dates: [Date Picker]                   │
│  Group Size: [Number]                   │
│  Meals: [Yes/No]                        │
├─────────────────────────────────────────┤
│  Estimated Total: $X,XXX                │
│  [Request Quote]                        │
└─────────────────────────────────────────┘
```

---

## 6. Work at Camp Pages (/work-at-camp/*)

### Current State
- Job descriptions
- Application info
- Basic layout

### Proposed Changes

**Add Staff Testimonials:**
```
┌─────────────────────────────────────────┐
│  "BEST SUMMER OF MY LIFE"               │
├─────────────────────────────────────────┤
│  ┌─────┐                                │
│  │Photo│  "Working at Bear Lake was     │
│  │     │   transformative. I grew in    │
│  └─────┘   my faith and leadership."    │
│            - Alex, Summer 2024          │
└─────────────────────────────────────────┘
```

**Add Application Timeline:**
```
┌─────────────────────────────────────────┐
│  APPLICATION TIMELINE                   │
├─────────────────────────────────────────┤
│  ○───────●───────○───────○───────○      │
│  Apply   Interview  Offer  Training     │
│  Jan-Mar   March    April   May         │
└─────────────────────────────────────────┘
```

---

## 7. Contact Page (/contact)

### Current State
- Contact form
- Basic info

### Proposed Changes

**Add Map + Quick Contact:**
```
┌──────────────────────┬──────────────────┐
│   CONTACT FORM       │   QUICK CONTACT  │
│   [Form fields...]   │   📞 555-123-4567│
│                      │   ✉️ info@blc.org│
│                      │   📍 Idaho       │
│                      ├──────────────────┤
│                      │   [MAP]          │
│                      │                  │
└──────────────────────┴──────────────────┘
```

---

## 8. Give Page (/give)

### Current State
- Donation info
- Basic content

### Proposed Changes

**Add Impact Stats:**
```
┌─────────────────────────────────────────┐
│         YOUR IMPACT                     │
├─────────────────────────────────────────┤
│  $50 = 1 camper's meals for a week     │
│  $100 = Scholarship contribution        │
│  $500 = Sponsor a full camper week     │
└─────────────────────────────────────────┘
```

**Add Recurring Option Visual:**
```
┌─────────────────────────────────────────┐
│  ○ One-Time   ● Monthly   ○ Annual     │
├─────────────────────────────────────────┤
│  [$25] [$50] [$100] [$___]             │
├─────────────────────────────────────────┤
│  [Give Now]                             │
└─────────────────────────────────────────┘
```

---

## Mobile-Specific Mockups

### Sticky CTA Bar (All Pages)
```
┌─────────────────────────────────────────┐
│ Content scrolls above...                │
│                                         │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │ <- Fixed bottom
│ │     [Register Now - From $XXX]      │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Mobile Navigation Enhancement
```
Current:
┌─────────────────────────────────────────┐
│ [Logo]                    [Hamburger]   │
└─────────────────────────────────────────┘

Enhanced:
┌─────────────────────────────────────────┐
│ [Logo]        [Phone Icon] [Hamburger]  │ <- Add quick call
└─────────────────────────────────────────┘
```

---

## Component Library Additions

### New Components Needed

1. **TrustBar** - Stats/accreditation display
2. **ProgramCard** - Clickable program overview
3. **SessionPicker** - Week selection UI
4. **TestimonialCard** - Parent/camper quotes
5. **StickyMobileCTA** - Fixed bottom bar
6. **VirtualTourCTA** - 360° tour launcher
7. **PricingCalculator** - Rental estimator
8. **ImpactStats** - Donation impact display
9. **TimelineProgress** - Application steps

### Updated Components

1. **Header** - Add mobile phone icon
2. **Button** - Ensure 44px min height
3. **CarouselDot** - Increase touch area
4. **Footer** - Increase font sizes

---

## Typography Scale Updates

```css
/* Current (approximate) */
--text-body: 16px;
--text-small: 14px;  /* ❌ Too small */
--text-xs: 12px;     /* ❌ Too small */

/* Proposed */
--text-body: clamp(16px, 4vw, 18px);
--text-small: 16px;  /* Minimum for mobile */
--text-xs: 14px;     /* Only for non-essential UI */
```

---

## Color Usage Audit

### Current Palette
- Primary: #4A7A9E (Lake Blue)
- Secondary: #2F4F3D (Forest Green)
- Accent: #A07856 (Warm Brown)
- Cream: #F5F0E8
- Bark: #5A4A3A

### Recommendations
- ✅ Good contrast ratios
- ⚠️ Add more variation for states (hover, active, focus)
- ⚠️ Consider higher contrast for text on images

---

## Next Steps: TDD Implementation Plan

See `docs/design/TDD-IMPLEMENTATION-PLAN.md` for:
1. Test-first approach for each component
2. REQ-IDs for tracking
3. Story point estimates
4. Sprint breakdown
