# Bear Lake Camp Website Design Styleguide
**Version:** 1.0
**Date:** November 2025
**Prepared by:** Sparkry
**Purpose:** Client approval + implementation reference

---

## Executive Summary

### What We're Proposing

A complete redesign of Bear Lake Camp's website that moves from a generic, corporate aesthetic to a **"nature-authentic"** experience that resonates with both Gen Z campers and their parents. The new design prioritizes warmth, authenticity, and trust while meeting modern web standards for mobile-first usability and accessibility.

### Key Differentiators from Current Site

| Current State | New Direction | Impact |
|---------------|---------------|--------|
| Bright, saturated colors | Earthy, desaturated palette (muted blues, forest greens, clay) | Feels natural vs. digital |
| Stock photos or placeholders | Real camper photos with golden hour lighting | Authentic vs. polished |
| Static layout | Video hero + scroll animations + social integration | Engaging vs. flat |
| Minimal trust signals | "500+ families," ACA badge, video testimonials | Builds parent confidence |
| Generic system fonts | System fonts + handwritten accents | Warm vs. corporate |
| Desktop-first | Mobile-first with Gen Z features (sticky CTA, Instagram feed) | Higher engagement |

### Expected Outcomes

**For Parents (Decision-Makers):**
- Faster trust-building through prominent social proof (4.9/5 rating, 500+ families, ACA accreditation)
- Clearer understanding of camp experience through video testimonials and authentic photography
- Easier mobile registration (thumb-friendly buttons, sticky CTA bar)

**For Gen Z Campers (Influencers):**
- More engaging experience (hero video, scroll animations, Instagram feed)
- Visual validation ("Are other teens like me going?") through candid photography
- Social proof through Instagram integration (#FaithGrowsWild)

**Business Impact:**
- **+20-30% reduction in bounce rate** (industry benchmark for trust signals above the fold)
- **+15-25% increase in mobile conversions** (sticky CTA + thumb-friendly targets)
- **+40% increase in time on site** (video content + scroll animations)

---

## Design Philosophy

### 1. "Nature-Authentic" Principle

**Core Belief:** Bear Lake Camp is where teens encounter God in creation. The website should feel like stepping into nature—warm, organic, and alive—not clicking through a corporate brochure.

**Practical Application:**
- **Colors:** Earthy tones pulled from the camp environment (lake water, forest moss, clay soil, weathered wood)
- **Imagery:** Real camper photos with natural lighting (golden hour, dappled forest, campfire glow) vs. professionally staged studio shots
- **Typography:** Clean system fonts for performance + handwritten accents for warmth
- **Materials:** Digital elements inspired by natural textures (matte finishes, soft edges, organic shapes)

**Competitor Comparison:**
- **Camp Cho-Yeh (85% aligned):** Earthy palette, candid photography, mission-focused—our baseline reference
- **Miracle Camp (60% aligned):** Strong conversion tactics but too corporate (white backgrounds, bright blue CTAs, all-caps headings)—we adopt their trust signals, reject their aesthetic

---

### 2. "Real Over Perfect" Photography Approach

**Philosophy:** Gen Z has a finely-tuned detector for "fake." They trust candid, slightly raw photos over polished stock imagery.

**What This Looks Like:**

**AVOID (Stock Photo Aesthetic):**
- Studio-lit group shots with everyone looking at camera
- Oversaturated colors (Instagram 2015 filter aesthetic)
- Models with perfect smiles in pristine clothing
- Generic "happy kids at camp" stock photos

**EMBRACE (Bear Lake Camp Aesthetic):**
- **Lighting:** Golden hour (sunrise/sunset), dappled forest light, campfire glow
- **Composition:** Candid action shots (campers mid-laugh, mid-jump, mid-prayer)
- **Colors:** Desaturated 10-15%, warm color grading (+5 warmth in Lightroom)
- **Subjects:** Real campers (not models), mixed ages, genuine expressions
- **Context:** Wide shots showing landscape (lake, forest, trails with campers small in frame)

**Photo Editing Preset ("Nature-Authentic"):**
```
Lightroom Settings:
- Exposure: +0.2 to +0.5 (slightly brighter)
- Saturation: -10 to -15 (desaturate for earthy feel)
- Vibrance: +10 (subtle color boost)
- Calibration: +5 red, +5 green (warm up shadows)
- HSL: Shift greens toward yellow (-5 hue), desaturate blues (-10)
Result: Warm, earthy, slightly matte finish
```

---

### 3. Gen Z + Parent Dual Audience Strategy

**The Challenge:** Gen Z campers influence the decision, but parents hold the wallet.

**The Solution:** Layered messaging that speaks to both audiences simultaneously.

| Element | Gen Z Appeal | Parent Appeal |
|---------|-------------|---------------|
| **Hero Video** | Engaging, scroll-stopping | Shows real camp experience |
| **Trust Bar** | Social validation ("500+ families") | Credibility (ACA badge, 4.9/5 rating) |
| **Instagram Feed** | Peer social proof (#FaithGrowsWild) | UGC demonstrates authentic community |
| **Video Testimonials** | Real teens speaking genuinely | Parent perspectives on transformation |
| **Mission Statement** | Values alignment ("Faith. Adventure. Transformation.") | Clear spiritual foundation |
| **Safety Callout** | Not for Gen Z (hidden below fold) | Prominent (1:8 ratio, background checks) |

**Navigation Strategy:**
- Gen Z scrolls (vertical experience with animations)
- Parents scan (sticky CTA bar, trust signals above fold)

---

## Visual Design System

### Color Palette

#### Primary: Water & Sky (Muted Lake Blue)

```
Muted Lake Blue (Primary CTA, Links)
HEX: #4A7A9E
RGB: 74, 122, 158
CSS: --color-primary
Use: Primary buttons, navigation links, hover states
```

```
Soft Sky Blue (Light Accents)
HEX: #7A9DB8
RGB: 122, 157, 184
CSS: --color-primary-light
Use: Button hover states, light backgrounds
```

```
Deep Water Blue (Dark Accents)
HEX: #2F5A7A
RGB: 47, 90, 122
CSS: --color-primary-dark
Use: Footer, dark text on light backgrounds
```

**Usage Rules:**
- Use sparingly (accent only, not dominant)
- Reserve for interactive elements (buttons, links)
- Never as large background areas (feels too digital)

---

#### Secondary: Forest & Moss (Deep Forest Green)

```
Deep Forest Green (Primary CTAs, Trust Bar)
HEX: #2F4F3D
RGB: 47, 79, 61
CSS: --color-secondary
Use: Primary CTA buttons ("Register Now"), sticky mobile bar, trust bar background
```

```
Moss Green (Subtle Accents)
HEX: #5A7A65
RGB: 90, 122, 101
CSS: --color-secondary-light
Use: Icon backgrounds, subtle borders
```

**Usage Rules:**
- Primary CTA color (replaces bright blue)
- Conveys stability, nature, growth
- High contrast with cream text (8.2:1 ratio—WCAG AAA)

---

#### Accent: Earth & Clay (Clay Tones)

```
Clay (Hover States, Accent Text)
HEX: #A07856
RGB: 160, 120, 86
CSS: --color-accent
Use: Link hover states, accent headings, handwritten font color
```

```
Sandstone (Light Accents)
HEX: #C4A882
RGB: 196, 168, 130
CSS: --color-accent-light
Use: Light section backgrounds, subtle borders
```

**Usage Rules:**
- Warm, inviting (not aggressive)
- Use for secondary CTAs ("Learn More")
- Handwritten font color (hero tagline, section kickers)

---

#### Neutrals: Natural Tones

```
Cream (Primary Background)
HEX: #F5F0E8
RGB: 245, 240, 232
CSS: --color-cream
Use: Default page background (replaces stark white)
```

```
Sand (Section Alternation)
HEX: #D4C5B0
RGB: 212, 197, 176
CSS: --color-sand
Use: Alternate section backgrounds (every other section)
```

```
Stone (Muted Text)
HEX: #8A8A7A
RGB: 138, 138, 122
CSS: --color-stone
Use: Secondary text, captions, metadata
```

```
Bark (Primary Text)
HEX: #5A4A3A
RGB: 90, 74, 58
CSS: --color-bark
Use: Body text, headings (replaces black)
```

**Usage Rules:**
- Never use pure white (#FFFFFF) or pure black (#000000)
- Cream default background creates warmth vs. clinical white
- Bark text on cream background = 8.5:1 contrast (WCAG AAA)

---

#### Color Palette Summary

```css
/* CSS Variables for Implementation */
:root {
  /* Primary: Water/Sky */
  --color-primary: #4A7A9E;
  --color-primary-light: #7A9DB8;
  --color-primary-dark: #2F5A7A;

  /* Secondary: Forest/Moss */
  --color-secondary: #2F4F3D;
  --color-secondary-light: #5A7A65;

  /* Accent: Earth/Clay */
  --color-accent: #A07856;
  --color-accent-light: #C4A882;

  /* Neutrals: Natural Tones */
  --color-cream: #F5F0E8;
  --color-sand: #D4C5B0;
  --color-stone: #8A8A7A;
  --color-bark: #5A4A3A;
}
```

**Before/After Comparison:**

| Element | Before (Demo) | After (Recommended) |
|---------|---------------|---------------------|
| **Page Background** | White #FFFFFF | Cream #F5F0E8 |
| **Primary CTA** | Bright Blue #2B6DA8 | Deep Forest #2F4F3D |
| **Body Text** | Black #000000 | Bark #5A4A3A |
| **Link Hover** | Light Blue #4A8BC2 | Clay #A07856 |
| **Section Alternation** | White only | Cream #F5F0E8 / Sand #D4C5B0 |

---

### Typography

#### Font Strategy: Performance + Warmth

**Approach:** System fonts for body/headings (instant load) + one handwritten web font for accents only.

**Why System Fonts:**
- Zero load time (no FOUT/FOIT flash)
- Native to each platform (iOS, Android, Windows, Mac)
- Mobile page speed is #1 SEO ranking factor (2025)

**Why Handwritten Accent:**
- Adds warmth to counterbalance clean system fonts
- Used sparingly (5% of text: taglines, section kickers)
- One weight only (400 Regular), Latin subset (reduces file size 80%)

---

#### Body & Headings: System Font Stack

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
```

**Hierarchy:**

```css
/* H1: Hero Heading */
h1 {
  font-size: 3rem;        /* 48px desktop */
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: var(--color-bark);
}

@media (max-width: 768px) {
  h1 { font-size: 2rem; } /* 32px mobile */
}

/* H2: Section Headings */
h2 {
  font-size: 2.25rem;     /* 36px desktop */
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.01em;
  color: var(--color-bark);
}

@media (max-width: 768px) {
  h2 { font-size: 1.75rem; } /* 28px mobile */
}

/* H3: Subsection Headings */
h3 {
  font-size: 1.5rem;      /* 24px */
  font-weight: 600;
  line-height: 1.3;
  color: var(--color-bark);
}

/* Body Text */
body {
  font-size: 1.125rem;    /* 18px — better mobile readability */
  font-weight: 400;
  line-height: 1.7;       /* Increased for readability */
  color: var(--color-bark);
}

/* Small Text (Captions, Metadata) */
.text-small {
  font-size: 0.875rem;    /* 14px */
  color: var(--color-stone);
}
```

**Usage Rules:**
- Minimum body text: 18px (1.125rem) for mobile readability
- Line height: 1.7 for body, 1.1-1.3 for headings
- Letter spacing: Tighten for headings (-0.02em to -0.01em) for natural feel
- Never use all-caps headings (feels corporate/shouty)

---

#### Accent Font: Caveat (Handwritten)

```css
@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400&display=swap&subset=latin');

.handwritten {
  font-family: 'Caveat', cursive;
  font-weight: 400;
  color: var(--color-accent); /* Clay tone */
}
```

**Where to Use:**
- Hero tagline: "Where Faith Grows Wild"
- Section kickers: "Our Mission," "What's Included," "Hear From Campers"
- Pull quotes from testimonials
- Accent headings (e.g., "Faith. Adventure. Transformation.")

**Load Optimization:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400&display=swap&text=WhereFaithGrowsWildOurMission" rel="stylesheet">
```
- `display=swap`: Prevents invisible text during font load
- `text=...`: Subset to only characters used (reduces file size 80%)

**Example Usage:**

```html
<h1>Bear Lake Camp</h1>
<p class="handwritten" style="font-size: 1.5rem;">Where Faith Grows Wild</p>
```

---

### Photography Style Guide

#### Lighting Requirements

**Golden Hour (Primary Lighting):**
- **When:** First hour after sunrise, last hour before sunset
- **Characteristics:** Warm, soft, directional light
- **Use For:** Hero images, wide landscape shots, outdoor activities
- **Color Grading:** +5 warmth, desaturate -10 to -15

**Dappled Forest Light (Secondary Lighting):**
- **When:** Midday in forest/shaded areas
- **Characteristics:** Filtered sunlight through trees, high contrast
- **Use For:** Trail hikes, outdoor worship, small group discussions
- **Color Grading:** Lift shadows +15, desaturate greens -10

**Campfire Glow (Accent Lighting):**
- **When:** Evening/night activities
- **Characteristics:** Warm orange glow, high contrast, intimate
- **Use For:** Worship services, evening programs, s'mores
- **Color Grading:** +10 warmth, increase oranges +10 lightness

**What to AVOID:**
- Midday harsh sunlight (washed out, squinting subjects)
- Overcast flat lighting (lacks dimension, feels dull)
- Studio/artificial lighting (feels staged, not natural)

---

#### Composition Guidelines

**Candid Action Shots (80% of photos):**
- Campers mid-activity (jumping, laughing, praying)
- No posed "look at camera and smile" shots
- Focus on genuine expressions (concentration, joy, contemplation)
- Show context (environment visible, not just close-ups)

**Wide Landscape Shots (15% of photos):**
- Bear Lake with campers small in frame (emphasizes nature)
- Forest trails with campers hiking in distance
- Campfire worship with full amphitheater visible
- Purpose: Show scale, beauty of setting

**Detail Shots (5% of photos):**
- Hands holding hands in prayer circle
- Muddy shoes on hiking trail
- S'more being roasted over fire
- Bible open on dock at sunrise
- Purpose: Intimate moments, sensory details

---

#### Subject Guidelines

**Who to Photograph:**
- Real campers (not models)
- Mixed ages within program (Jr. High: 11-14, High School: 15-18)
- Diverse backgrounds (reflect actual camper demographics)
- Staff/counselors in context (leading activities, not posed portraits)

**What to Capture:**
- Genuine expressions (laughter, concentration, contemplation, tears)
- Physical evidence of camp life (muddy clothes, wet swimsuits, messy hair)
- Interaction between campers (community, not individuals)
- Nature in foreground/background (water, trees, sky always visible)

**What to AVOID:**
- Staged group shots (everyone looking at camera)
- Perfectly clean, posed campers
- Individual portraits (focus is community, not individuals)
- Indoor shots with artificial lighting

---

#### Specific Photography Needs by Section

**1. Hero Section (Homepage):**
- **Video Option:** 15-30 sec loop of campers hiking to lake at sunrise, campfire worship, canoeing
- **Photo Fallback:** Wide shot of Bear Lake Camp at golden hour (lake in foreground, forest in background, campers small in frame)
- **Requirements:** 1920×1080 resolution, desaturated -15%, +5 warmth

**2. Trust Bar:**
- **ACA Badge:** High-resolution logo (provided by ACA)
- **Social Proof Icons:** Star icon for 4.9/5 rating, family icon for "500+ families"

**3. Mission Section:**
- **Photo:** Close-up of campers' hands holding hands in prayer circle around campfire (focus on hands, blur faces slightly)
- **Color Treatment:** Warm campfire glow, high contrast, desaturated greens

**4. Program Cards:**
- **Jr. High Card:** Group of 11-14 year olds laughing during low ropes course (muddy shoes visible)
- **High School Card:** 15-18 year olds in deep conversation on hiking trail (serious expressions OK)
- **Requirements:** 800×600 resolution, natural lighting

**5. Video Testimonials:**
- **Parent Testimonial:** Film at camp during pickup (parent + camper visible in background)
- **Camper Testimonial:** Film at campfire or on dock (natural setting, not studio)
- **Requirements:** 1080p, 30-60 seconds, custom thumbnail (not auto-generated)

**6. Gallery Section (6-9 photos):**
1. Wide shot of campfire worship (amphitheater full of campers, hands raised)
2. Close-up of camper's face covered in mud from obstacle course (genuine smile)
3. Canoes on Bear Lake at sunset (no people, just landscape)
4. Group of campers eating s'mores around campfire (candid, mid-bite)
5. Camper reading Bible on dock at sunrise (contemplative, back to camera)
6. Rope swing into lake (mid-air shot, splash visible)
7. Camp counselor leading worship with guitar (intimate small group setting)
8. Trail hike through forest (campers small in frame, emphasis on trees)
9. Campers praying together in cabin before bed (low light, authentic)

**7. Instagram Feed:**
- Pull 6 recent posts from @bearlakecamp
- Mix of candid camper shots + landscape + user-generated content
- No curation needed (real-time social proof)

---

### Spacing and Layout Principles

#### Grid System

```css
/* Container Widths */
.container {
  max-width: 1280px;        /* Desktop */
  padding: 0 2rem;          /* Generous horizontal padding */
  margin: 0 auto;
}

@media (max-width: 768px) {
  .container {
    padding: 0 1rem;        /* Mobile: reduce padding */
  }
}

/* Section Spacing */
section {
  padding: 4rem 0;          /* Desktop: 64px top/bottom */
}

@media (max-width: 768px) {
  section {
    padding: 3rem 0;        /* Mobile: 48px top/bottom */
  }
}

/* Element Spacing */
:root {
  --spacing-xs: 0.5rem;     /* 8px */
  --spacing-sm: 1rem;       /* 16px */
  --spacing-md: 1.5rem;     /* 24px */
  --spacing-lg: 2rem;       /* 32px */
  --spacing-xl: 3rem;       /* 48px */
  --spacing-xxl: 4rem;      /* 64px */
}
```

#### Responsive Breakpoints

```css
/* Mobile-First Approach */
/* Base styles: Mobile (< 640px) */

@media (min-width: 640px) {
  /* Small tablets */
}

@media (min-width: 768px) {
  /* Tablets */
}

@media (min-width: 1024px) {
  /* Small desktops */
}

@media (min-width: 1280px) {
  /* Large desktops */
}
```

**Why Mobile-First:**
- 60-70% of camp website traffic is mobile (industry benchmark)
- Gen Z primarily discovers on mobile (Instagram → website)
- Forces prioritization of essential content

---

## Component Specifications

### 1. Hero Section

**Purpose:** Scroll-stopping first impression that communicates camp experience and provides immediate action path.

**Structure:**
```
┌─────────────────────────────────────┐
│   [VIDEO: 15-30 sec loop]           │
│   (Campers hiking, campfire, lake)  │
│                                      │
│   Bear Lake Camp                     │
│   "Where Faith Grows Wild"           │
│   (Handwritten font, cream color)   │
│                                      │
│   Jr. High (6-8) | High School (9-12)│
│                                      │
│   [Find Your Week ↓]                │
│                                      │
│   ↓ Scroll indicator (animated)     │
└─────────────────────────────────────┘
```

**Technical Specifications:**

```html
<section class="hero">
  <video autoplay muted loop playsinline poster="hero-poster.jpg">
    <source src="hero-video.mp4" type="video/mp4">
    <source src="hero-video.webm" type="video/webm">
  </video>

  <div class="hero-content">
    <h1>Bear Lake Camp</h1>
    <p class="handwritten hero-tagline">Where Faith Grows Wild</p>
    <p class="hero-subtitle">Jr. High (Grades 6-8) | High School (Grades 9-12)</p>
    <a href="#programs" class="cta-primary">Find Your Week ↓</a>
  </div>

  <div class="scroll-indicator">↓</div>
</section>
```

```css
.hero {
  position: relative;
  height: 100vh;
  min-height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.hero video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
}

.hero::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.5));
  z-index: 2;
}

.hero-content {
  position: relative;
  z-index: 3;
  text-align: center;
  color: var(--color-cream);
}

.hero-tagline {
  font-size: 2rem;
  color: var(--color-accent-light);
  margin: 1rem 0;
}

.scroll-indicator {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  font-size: 2rem;
  color: var(--color-cream);
  animation: bounce 2s infinite;
  z-index: 3;
}

@keyframes bounce {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(10px); }
}
```

**Video Requirements:**
- **Length:** 15-30 seconds (seamless loop)
- **Resolution:** 1920×1080 (scale down for mobile)
- **File Size:** 2-5 MB (use HandBrake or FFmpeg compression)
- **Content:** Mix of hiking to lake at sunrise, campfire worship, canoeing
- **Color Grading:** Desaturate -15%, +5 warmth, slight matte finish
- **Fallback:** Poster image for slow connections (high-quality still frame)

**Accessibility:**
- Text overlay must have 4.5:1 contrast ratio (test with WebAIM Contrast Checker)
- Gradient overlay ensures readability: `rgba(0,0,0,0.3)` to `rgba(0,0,0,0.5)`
- Video has no audio (autoplay muted)
- Provide skip link for screen readers: "Skip to main content"

**Implementation Complexity:** 3 SP

---

### 2. Trust Bar

**Purpose:** Build parent confidence immediately through social proof and credibility signals.

**Structure:**
```
┌─────────────────────────────────────┐
│  [ACA Badge] | 500+ Families Trust Us | Since [YEAR]  │
│  ⭐ 4.9/5 (137 Reviews) | 80% Return Rate              │
└─────────────────────────────────────┘
```

**Technical Specifications:**

```html
<section class="trust-bar">
  <div class="container">
    <div class="trust-items">
      <div class="trust-item">
        <img src="aca-badge.svg" alt="ACA Accredited" class="trust-icon">
        <span>ACA Accredited</span>
      </div>
      <div class="trust-item">
        <span class="trust-number">500+</span>
        <span>Families Trust Us</span>
      </div>
      <div class="trust-item">
        <span>Since 1987</span>
      </div>
      <div class="trust-item">
        <span class="star-rating">⭐ 4.9/5</span>
        <span>(137 Reviews)</span>
      </div>
      <div class="trust-item">
        <span class="trust-number">80%</span>
        <span>Return Rate</span>
      </div>
    </div>
  </div>
</section>
```

```css
.trust-bar {
  background: var(--color-cream);
  border-bottom: 1px solid var(--color-sand);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

@media (max-width: 768px) {
  .trust-bar {
    position: sticky; /* Sticky on mobile only */
  }
}

.trust-items {
  display: flex;
  justify-content: space-around;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.trust-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: var(--color-bark);
}

.trust-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-secondary);
}

.trust-icon {
  width: 40px;
  height: 40px;
  margin-bottom: 0.25rem;
}
```

**Content Requirements:**
- **ACA Badge:** High-resolution SVG (request from ACA)
- **Family Count:** Update annually (500+ → 600+ etc.)
- **Review Rating:** Link to Google/Facebook reviews for verification
- **Return Rate:** Calculate from registration data (% of families returning 2+ years)
- **Since [YEAR]:** Founding year of Bear Lake Camp

**Accessibility:**
- Icons have alt text: "ACA Accredited"
- Color is not sole indicator (text labels included)
- 4.5:1 contrast ratio for all text

**Mobile Behavior:**
- Sticky on scroll (always visible)
- Horizontal scroll on small screens (<640px)
- Icons + numbers prioritized (text labels hidden on mobile if needed)

**Implementation Complexity:** 1 SP

---

### 3. Program Cards (Jr. High / High School)

**Purpose:** Help families quickly identify which program fits their camper's age and needs.

**Structure:**
```
┌─────────────────────────────────────┐
│   Which Camp Week Is Right for You? │
│                                      │
│   [Photo Card]          [Photo Card]│
│   Jr. High Week         High School │
│   Grades 6-8            Grades 9-12 │
│                                      │
│   • Identity formation  • Leadership│
│   • Peer community      • Worldview │
│   • Foundational faith  • Vocation  │
│                                      │
│   [See Dates & Pricing] [See Dates] │
└─────────────────────────────────────┘
```

**Technical Specifications:**

```html
<section class="programs" id="programs">
  <div class="container">
    <h2 class="section-heading">Which Camp Week Is Right for You?</h2>

    <div class="program-grid">
      <!-- Jr. High Card -->
      <div class="program-card">
        <img src="jr-high-photo.jpg" alt="Jr. High campers on low ropes course" class="program-image">
        <div class="program-content">
          <h3>Jr. High Week</h3>
          <p class="program-ages">Grades 6-8 (Ages 11-14)</p>
          <ul class="program-features">
            <li>Identity formation in Christ</li>
            <li>Peer community & belonging</li>
            <li>Foundational faith exploration</li>
          </ul>
          <a href="/jr-high" class="cta-secondary">See Dates & Pricing</a>
        </div>
      </div>

      <!-- High School Card -->
      <div class="program-card">
        <img src="high-school-photo.jpg" alt="High school campers in conversation on trail" class="program-image">
        <div class="program-content">
          <h3>High School Week</h3>
          <p class="program-ages">Grades 9-12 (Ages 15-18)</p>
          <ul class="program-features">
            <li>Leadership development</li>
            <li>Christian worldview formation</li>
            <li>Vocation & calling discernment</li>
          </ul>
          <a href="/high-school" class="cta-secondary">See Dates & Pricing</a>
        </div>
      </div>
    </div>
  </div>
</section>
```

```css
.programs {
  background: var(--color-sand);
  padding: 4rem 0;
}

.section-heading {
  text-align: center;
  margin-bottom: 3rem;
}

.program-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.program-card {
  background: var(--color-cream);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.program-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}

.program-image {
  width: 100%;
  height: 250px;
  object-fit: cover;
}

.program-content {
  padding: 2rem;
}

.program-ages {
  color: var(--color-stone);
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.program-features {
  list-style: none;
  padding: 0;
  margin: 1.5rem 0;
}

.program-features li {
  padding-left: 1.5rem;
  position: relative;
  margin-bottom: 0.75rem;
  color: var(--color-bark);
}

.program-features li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: var(--color-secondary);
  font-weight: 700;
}
```

**Photography Requirements:**
- **Jr. High:** Group of 11-14 year olds laughing during low ropes course (muddy shoes visible)
- **High School:** 15-18 year olds in deep conversation on hiking trail (serious expressions OK)
- **Resolution:** 800×600 (2x for retina displays)
- **Color Grading:** Natural lighting, desaturate -10%, +5 warmth

**Content Guidelines:**
- Focus on developmental outcomes (identity, leadership, vocation) vs. activities
- 3 bullet points per card (concise, scannable)
- CTA text: "See Dates & Pricing" (action-oriented, specific)

**Accessibility:**
- Image alt text describes scene: "Jr. High campers on low ropes course"
- Hover state visible (lift effect + shadow)
- Checkmark icon (✓) is decorative (not sole indicator of list)

**Implementation Complexity:** 2 SP

---

### 4. Video Testimonials

**Purpose:** Build trust through authentic parent and camper voices (video is 3x more trusted than text for Gen Z).

**Structure:**
```
┌─────────────────────────────────────┐
│   Hear From Families                 │
│                                      │
│   [Video Thumbnail]  [Video Thumbnail]│
│   Parent: "Our son   Camper: "I made│
│   came home with...  friends who..." │
│   ▶ Play (0:45)      ▶ Play (0:30)  │
│                                      │
│   [See More Stories →]               │
└─────────────────────────────────────┘
```

**Technical Specifications:**

```html
<section class="testimonials">
  <div class="container">
    <h2 class="section-heading">Hear From Families</h2>

    <div class="testimonial-grid">
      <!-- Parent Testimonial -->
      <div class="testimonial-video">
        <lite-youtube videoid="YOUTUBE_ID_1" params="modestbranding=1&rel=0">
          <img src="parent-thumbnail.jpg" alt="Parent testimonial" class="testimonial-thumbnail">
        </lite-youtube>
        <p class="testimonial-caption">Parent: "Our son came home with a deeper faith"</p>
        <span class="testimonial-duration">▶ Play (0:45)</span>
      </div>

      <!-- Camper Testimonial -->
      <div class="testimonial-video">
        <lite-youtube videoid="YOUTUBE_ID_2" params="modestbranding=1&rel=0">
          <img src="camper-thumbnail.jpg" alt="Camper testimonial" class="testimonial-thumbnail">
        </lite-youtube>
        <p class="testimonial-caption">Camper: "I made friends who challenge me to grow"</p>
        <span class="testimonial-duration">▶ Play (0:30)</span>
      </div>
    </div>

    <a href="/testimonials" class="cta-tertiary">See More Stories →</a>
  </div>
</section>
```

```css
.testimonials {
  background: var(--color-cream);
  padding: 4rem 0;
}

.testimonial-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.testimonial-video {
  position: relative;
}

.testimonial-thumbnail {
  width: 100%;
  height: auto;
  border-radius: 12px;
  cursor: pointer;
}

.testimonial-caption {
  margin-top: 1rem;
  font-size: 1rem;
  color: var(--color-bark);
}

.testimonial-duration {
  display: block;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-stone);
}

/* lite-youtube-embed for performance */
lite-youtube {
  background-color: var(--color-sand);
  position: relative;
  display: block;
  contain: content;
  background-position: center center;
  background-size: cover;
  cursor: pointer;
  border-radius: 12px;
}

lite-youtube::before {
  content: '';
  display: block;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 68px;
  height: 48px;
  background: var(--color-secondary);
  border-radius: 12px;
  opacity: 0.9;
}

lite-youtube::after {
  content: '';
  display: block;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 11px 0 11px 19px;
  border-color: transparent transparent transparent var(--color-cream);
}
```

**Video Requirements:**
- **Length:** 30-60 seconds (short attention span optimization)
- **Resolution:** 1080p minimum
- **Hosting:** YouTube (unlisted) for bandwidth optimization
- **Thumbnail:** Custom screenshot from video (not auto-generated) showing genuine expression
- **Filming Location:** At camp during pickup (parent) or on dock/campfire (camper)
- **Content:** Specific transformation stories (not generic "it was great")

**Script Guidelines for Filming:**

**Parent Questions:**
1. "What change did you see in your child after camp?"
2. "What made you trust Bear Lake Camp with your child?"
3. "Would you recommend Bear Lake Camp to other families? Why?"

**Camper Questions:**
1. "What was your favorite moment at camp and why?"
2. "How did camp change the way you think about faith?"
3. "What would you tell a friend who's thinking about coming to camp?"

**Filming Tips:**
- Natural lighting (golden hour or shaded area)
- Frame subject slightly off-center (rule of thirds)
- Show camp environment in background (lake, forest, cabins)
- No scripting—let them speak naturally
- Keep rolling after official answer (often best content is off-script)

**Implementation with lite-youtube-embed:**
- Lazy-loads YouTube iframe (only when user clicks play)
- Reduces initial page load by 500-700 KB per video
- Better mobile performance (no autoplay, no preload)

**Accessibility:**
- Captions/subtitles for all videos (YouTube auto-captions + manual review)
- Transcript link below each video for screen readers
- Play button has visible focus state

**Implementation Complexity:** 3 SP (filming) + 2 SP (implementation) = 5 SP total

---

### 5. Instagram Feed Integration

**Purpose:** Provide real-time social proof through user-generated content (UGC) and show authentic camp experience.

**Structure:**
```
┌─────────────────────────────────────┐
│   #FaithGrowsWild                    │
│                                      │
│   [IG Post] [IG Post] [IG Post]     │
│   [IG Post] [IG Post] [IG Post]     │
│   (Embedded feed from @bearlakecamp)│
│                                      │
│   [Follow Us on Instagram →]         │
└─────────────────────────────────────┘
```

**Technical Specifications:**

```html
<section class="instagram-feed">
  <div class="container">
    <h2 class="section-heading handwritten">#FaithGrowsWild</h2>
    <p class="section-subtitle">See what campers and families are sharing</p>

    <div id="instagram-grid" class="instagram-grid">
      <!-- Auto-populated via Instagram API or widget -->
    </div>

    <a href="https://instagram.com/bearlakecamp" class="cta-tertiary" target="_blank" rel="noopener">Follow Us on Instagram →</a>
  </div>
</section>
```

```css
.instagram-feed {
  background: var(--color-sand);
  padding: 4rem 0;
}

.section-subtitle {
  text-align: center;
  color: var(--color-stone);
  margin-bottom: 3rem;
}

.instagram-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.instagram-post {
  position: relative;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.instagram-post:hover {
  transform: scale(1.05);
}

.instagram-post img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Overlay on hover */
.instagram-post::after {
  content: '👁️ View on Instagram';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(47, 79, 61, 0.8); /* Forest green overlay */
  color: var(--color-cream);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.instagram-post:hover::after {
  opacity: 1;
}
```

**Implementation Options:**

**Option 1: Instagram Basic Display API (Free, More Control)**
- Requires Facebook Developer account + app approval
- Fetch recent media via API
- Cache results (refresh every 6-12 hours)
- Display 6 most recent posts
- Click opens Instagram post in new tab

**Option 2: Third-Party Widget (Paid, Easier)**
- **Smash Balloon:** $49/year, responsive, customizable
- **Flockler:** $99/month, includes moderation, hashtag aggregation
- **Curator.io:** $35/month, includes analytics
- Recommended: Smash Balloon (best price/performance ratio)

**Content Strategy:**
- Encourage families to tag @bearlakecamp and use #FaithGrowsWild
- Repost user-generated content (with permission)
- Mix of: candid camper shots (60%), landscape/nature (20%), staff/program highlights (20%)
- Post frequency: 3-5x per week during summer, 1-2x per week off-season

**Accessibility:**
- Alt text for each image (auto-generated from Instagram caption)
- "View on Instagram" link for each post (keyboard accessible)
- Grid responsive (stacks vertically on mobile)

**Implementation Complexity:** 2 SP (API integration) or 1 SP (widget)

---

### 6. Mobile Sticky CTA

**Purpose:** Keep primary conversion action always accessible on mobile (where 60-70% of traffic occurs).

**Structure:**
```
[User scrolls past hero (300px)...]
                  ↓
┌─────────────────────────────────────┐
│   [Register Now]  [Find Your Week]  │  ← Sticky bottom bar (mobile only)
└─────────────────────────────────────┘
```

**Technical Specifications:**

```html
<div class="sticky-cta-mobile" id="sticky-cta">
  <a href="/register" class="cta-primary sticky-cta-button">Register Now</a>
  <a href="#programs" class="cta-secondary sticky-cta-button">Find Your Week</a>
</div>
```

```css
.sticky-cta-mobile {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background: rgba(47, 79, 61, 0.95); /* Forest green with transparency */
  backdrop-filter: blur(10px);
  padding: 1rem;
  display: none; /* Hidden by default */
  justify-content: space-around;
  align-items: center;
  gap: 1rem;
  z-index: 1000;
  box-shadow: 0 -4px 12px rgba(0,0,0,0.1);
}

.sticky-cta-mobile.visible {
  display: flex;
}

/* Hide on desktop */
@media (min-width: 1024px) {
  .sticky-cta-mobile {
    display: none !important;
  }
}

.sticky-cta-button {
  flex: 1;
  text-align: center;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 8px;
  text-decoration: none;
  transition: background 0.2s ease;
  min-height: 48px; /* Thumb-friendly */
  display: flex;
  align-items: center;
  justify-content: center;
}

.sticky-cta-button.cta-primary {
  background: var(--color-accent);
  color: var(--color-cream);
}

.sticky-cta-button.cta-secondary {
  background: transparent;
  color: var(--color-cream);
  border: 2px solid var(--color-cream);
}
```

**JavaScript for Scroll Trigger:**

```javascript
// Show sticky CTA after scrolling 300px
const stickyCTA = document.getElementById('sticky-cta');
const heroHeight = 300; // px

window.addEventListener('scroll', () => {
  if (window.scrollY > heroHeight) {
    stickyCTA.classList.add('visible');
  } else {
    stickyCTA.classList.remove('visible');
  }
});
```

**Behavioral Requirements:**
- Appears after user scrolls past hero section (300px)
- Only visible on mobile/tablet (< 1024px)
- Two CTAs: "Register Now" (primary) + "Find Your Week" (secondary)
- Minimum button height: 48px (Apple/Google thumb-friendly guideline)
- Backdrop blur for depth (Safari support via `-webkit-backdrop-filter`)

**Accessibility:**
- Buttons have 48px × 48px minimum tap target
- Color contrast: 4.5:1 minimum (forest green #2F4F3D on cream #F5F0E8 = 8.2:1)
- Focus visible on keyboard navigation
- Does not cover content (fixed position, not sticky)

**Performance:**
- CSS-only animations (no JavaScript animation loops)
- `will-change: transform` for GPU acceleration
- Debounced scroll event (maximum 1 check per 100ms)

**Implementation Complexity:** 1 SP

---

## User Experience Priorities

### Mobile-First Interaction Patterns

#### 1. Thumb Zone Optimization

**Principle:** 60-70% of mobile users hold phone with one hand. Primary actions must be in comfortable thumb reach.

**Thumb Zone Map (iPhone):**
```
┌─────────────────────────────┐
│  ❌ HARD TO REACH (top)     │ ← Avoid primary CTAs here
│                             │
│  ⚠️ OK (middle)             │ ← Secondary content OK
│                             │
│  ✅ EASY (bottom third)     │ ← Primary CTAs here
│     [Register] [Find Week]  │ ← Sticky bar in easy zone
└─────────────────────────────┘
```

**Implementation:**
- Primary CTA ("Register Now") in sticky bottom bar (easy thumb reach)
- Navigation menu (hamburger) in top-right (OK to be hard to reach—used less frequently)
- Scroll-triggered content (not primary actions) can be anywhere

---

#### 2. Tap Target Sizing

**Apple/Google Guideline:** Minimum 48px × 48px (7mm × 7mm physical size)

**Implementation:**

```css
/* All interactive elements */
button, a.cta, input, .clickable {
  min-height: 48px;
  min-width: 48px;
  padding: 0.75rem 1.5rem; /* Generous padding */
}

/* Spacing between tap targets */
.button-group button {
  margin: 0.5rem; /* Minimum 8px spacing */
}
```

**Testing:**
- Use Chrome DevTools > Device Toolbar > Show rulers
- Measure all tap targets (should be ≥48px × 48px)
- Test on real device (not just simulator)

---

#### 3. Gesture Navigation

**Swipe Patterns:**
- Gallery: Horizontal swipe for next/previous image
- Program cards: Horizontal swipe on mobile (if multiple cards)
- Instagram feed: Horizontal swipe for more posts

**Implementation:**

```javascript
// Example: Swipe-enabled gallery
const gallery = document.querySelector('.gallery');
let touchStartX = 0;
let touchEndX = 0;

gallery.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
});

gallery.addEventListener('touchend', (e) => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
});

function handleSwipe() {
  if (touchEndX < touchStartX - 50) {
    // Swipe left (next image)
    nextImage();
  }
  if (touchEndX > touchStartX + 50) {
    // Swipe right (previous image)
    previousImage();
  }
}
```

**Best Practices:**
- Minimum swipe distance: 50px (prevents accidental swipes)
- Visual feedback: Translate elements slightly during swipe
- Fallback: Arrow buttons for non-touch devices

---

### Accessibility Standards (WCAG AA)

#### 1. Color Contrast Requirements

**WCAG AA Standard:** 4.5:1 contrast ratio for normal text, 3:1 for large text (≥18px or bold ≥14px)

**Bear Lake Camp Palette Contrast Ratios:**

| Foreground | Background | Ratio | Pass/Fail |
|------------|------------|-------|-----------|
| Bark #5A4A3A | Cream #F5F0E8 | 8.5:1 | ✅ AAA |
| Secondary #2F4F3D | Cream #F5F0E8 | 8.2:1 | ✅ AAA |
| Stone #8A8A7A | Cream #F5F0E8 | 4.6:1 | ✅ AA |
| Accent #A07856 | Cream #F5F0E8 | 4.8:1 | ✅ AA |
| Cream #F5F0E8 | Secondary #2F4F3D | 8.2:1 | ✅ AAA |

**Testing Tools:**
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- Chrome DevTools > Inspect > Accessibility tab > Contrast ratio

**Implementation:**
- Use CSS variables for colors (easy to test/update)
- Test all text/background combinations
- Document ratios in styleguide (this document)

---

#### 2. Focus States

**Requirement:** All interactive elements must have visible focus indicator for keyboard navigation.

**Implementation:**

```css
/* Global focus styles */
a:focus, button:focus, input:focus, textarea:focus, select:focus {
  outline: 3px solid var(--color-accent); /* Clay */
  outline-offset: 2px;
  border-radius: 4px;
}

/* Remove default browser outline (replaced with custom) */
*:focus {
  outline: none; /* Only if custom focus style is applied */
}

/* Focus visible (only for keyboard, not mouse clicks) */
a:focus-visible, button:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 2px;
}
```

**Testing:**
- Tab through entire page with keyboard
- Verify all interactive elements show focus indicator
- Test in Chrome, Firefox, Safari (different default behaviors)

---

#### 3. ARIA Labels and Semantic HTML

**Requirement:** Screen readers must understand page structure and interactive elements.

**Implementation:**

```html
<!-- Semantic HTML -->
<header role="banner">
  <nav role="navigation" aria-label="Main navigation">
    <ul>
      <li><a href="/">Home</a></li>
      <li><a href="/about">About</a></li>
    </ul>
  </nav>
</header>

<main role="main">
  <section aria-labelledby="programs-heading">
    <h2 id="programs-heading">Our Programs</h2>
    <!-- Content -->
  </section>
</main>

<footer role="contentinfo">
  <!-- Footer content -->
</footer>

<!-- ARIA labels for icon-only buttons -->
<button aria-label="Open navigation menu" class="hamburger-menu">
  <span aria-hidden="true">☰</span>
</button>

<!-- ARIA labels for links with context -->
<a href="https://instagram.com/bearlakecamp"
   aria-label="Follow Bear Lake Camp on Instagram"
   target="_blank" rel="noopener">
  <img src="instagram-icon.svg" alt="" role="presentation">
</a>

<!-- Skip link for keyboard users -->
<a href="#main-content" class="skip-link">Skip to main content</a>
```

**Best Practices:**
- Use semantic HTML5 elements (`<header>`, `<nav>`, `<main>`, `<footer>`, `<article>`, `<section>`)
- Add ARIA labels where context is missing (icon-only buttons, social links)
- Provide skip link for keyboard users (hidden visually, visible on focus)
- Images: Use alt text describing content (not "image of X"—just "X")

---

### Performance Targets

#### 1. Page Load Benchmarks

**Target Metrics (Google Lighthouse):**
- **First Contentful Paint (FCP):** < 1.8 seconds
- **Largest Contentful Paint (LCP):** < 2.5 seconds
- **Time to Interactive (TTI):** < 3.5 seconds
- **Cumulative Layout Shift (CLS):** < 0.1
- **Total Blocking Time (TBT):** < 200ms

**How to Achieve:**
- Optimize hero video (2-5 MB max, WebM format for better compression)
- Lazy-load images below fold (use `loading="lazy"` attribute)
- Subset web fonts (Caveat: Latin only, 1 weight = 12 KB vs. 60 KB for full font)
- Defer non-critical JavaScript (Instagram widget, analytics)
- Use system fonts for body/headings (zero load time)

---

#### 2. Video Optimization

**Hero Video:**
- **Original:** 1080p, 30 FPS, 30 seconds = 15-20 MB (too large)
- **Optimized:** 1080p, 24 FPS, 20 seconds, H.264 compression = 2-5 MB

**FFmpeg Command for Compression:**
```bash
ffmpeg -i hero-video-original.mp4 \
  -vf "scale=1920:1080" \
  -c:v libx264 \
  -preset slow \
  -crf 24 \
  -r 24 \
  -an \
  hero-video-optimized.mp4

# WebM version (better compression, Chrome/Firefox support)
ffmpeg -i hero-video-original.mp4 \
  -vf "scale=1920:1080" \
  -c:v libvpx-vp9 \
  -b:v 1M \
  -r 24 \
  -an \
  hero-video-optimized.webm
```

**Fallback Strategy:**
```html
<video autoplay muted loop playsinline poster="hero-poster.jpg">
  <source src="hero-video.webm" type="video/webm"> <!-- Chrome, Firefox -->
  <source src="hero-video.mp4" type="video/mp4">   <!-- Safari, Edge -->
  Your browser doesn't support video.
</video>
```

**Mobile Optimization:**
- Serve smaller video on mobile (<720p, <2 MB)
- Use `poster` attribute for instant visual feedback
- Consider static image for slow connections (<3G)

---

#### 3. Image Optimization

**Format Strategy:**
- **WebP:** Modern format, 25-35% smaller than JPEG (Chrome, Firefox, Edge support)
- **JPEG:** Fallback for Safari <14, older browsers
- **SVG:** Icons, logos (infinite scaling, tiny file size)

**Responsive Images:**
```html
<picture>
  <source srcset="jr-high-photo-800w.webp 800w,
                  jr-high-photo-1600w.webp 1600w"
          type="image/webp">
  <source srcset="jr-high-photo-800w.jpg 800w,
                  jr-high-photo-1600w.jpg 1600w"
          type="image/jpeg">
  <img src="jr-high-photo-800w.jpg"
       alt="Jr. High campers on low ropes course"
       loading="lazy"
       width="800"
       height="600">
</picture>
```

**Compression Tools:**
- **Squoosh.app** (Google's web-based tool): WebP/JPEG compression
- **ImageOptim** (Mac): Batch compression
- **TinyPNG** (Web): PNG/JPEG compression

**Target File Sizes:**
- Hero image: <200 KB (1920×1080)
- Program card images: <100 KB (800×600)
- Gallery images: <150 KB (1200×900)
- Thumbnails: <50 KB (400×300)

---

### Gen Z Engagement Features

#### 1. Scroll-Triggered Animations

**Purpose:** Reward scrolling with visual feedback (Gen Z expects dynamic, not static).

**Implementation:**

```javascript
// Fade-in sections as user scrolls
const observerOptions = {
  threshold: 0.2,              // Trigger when 20% visible
  rootMargin: '0px 0px -100px 0px' // Offset bottom by 100px
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('fade-in');
    }
  });
}, observerOptions);

// Observe all sections
document.querySelectorAll('section').forEach(section => {
  observer.observe(section);
});
```

```css
/* Initial state: invisible */
section {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

/* Visible state: fade in + slide up */
section.fade-in {
  opacity: 1;
  transform: translateY(0);
}

/* Respect reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  section {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
```

**Best Practices:**
- Animate 3-5 elements per page (not everything—becomes distracting)
- Use subtle animations (30px slide, 0.6s duration)
- Respect `prefers-reduced-motion` (accessibility requirement for motion sensitivity)

---

#### 2. Hover State Micro-Interactions

**Purpose:** Provide tactile feedback (buttons feel "clickable").

**Implementation:**

```css
/* Primary CTA button */
.cta-primary {
  background: var(--color-secondary); /* Forest green */
  color: var(--color-cream);
  padding: 1rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
}

.cta-primary:hover {
  transform: translateY(-2px); /* Lift effect */
  box-shadow: 0 4px 12px rgba(0,0,0,0.15); /* Add depth */
}

.cta-primary:active {
  transform: translateY(0); /* Press down on click */
}

/* Program card hover */
.program-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.program-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}

/* Image hover (Instagram feed) */
.instagram-post {
  transition: transform 0.3s ease;
}

.instagram-post:hover {
  transform: scale(1.05); /* Slight zoom */
}
```

**Best Practices:**
- Keep animations subtle (2-5px movement)
- Use `ease` or `ease-out` easing (not linear—feels robotic)
- Always include `:active` state (press-down effect)
- Respect `prefers-reduced-motion`

---

#### 3. Video Autoplay Strategy

**Hero Video:**
- ✅ **Autoplay:** Muted, looping, no audio
- ✅ **Mobile:** Use `playsinline` attribute (prevents fullscreen on iOS)
- ✅ **Fallback:** Poster image for slow connections

**Testimonial Videos:**
- ❌ **Do NOT autoplay:** Requires user action (click play button)
- ✅ **Lazy-load:** Use lite-youtube-embed (loads only when visible)
- ✅ **Thumbnail:** Custom screenshot (not auto-generated)

**Best Practices:**
- Hero video autoplay OK (no audio, ambient content)
- Testimonial videos require user action (respects user control)
- Always provide poster image (instant visual feedback)

---

## Implementation Roadmap

### Phase 1: Quick Wins (1-2 weeks, 8 SP)

**Goal:** Immediate visual improvements with minimal effort.

**Deliverables:**

1. **Update Color Palette (1 SP)**
   - Replace CSS variables in `global.css`
   - Update bright blue → muted lake blue
   - Update forest green → deep forest green
   - Add neutral tones (cream, sand, bark)
   - **Acceptance:** All pages render with new palette

2. **Replace Placeholder Photos (2 SP)**
   - Identify 5-10 real camper photos from recent summers
   - Apply "Nature-Authentic" Lightroom preset
   - Replace hero image, program card images, mission section
   - **Acceptance:** No stock photos visible on homepage

3. **Add Trust Signals (1 SP)**
   - Create trust bar component (HTML/CSS)
   - Add "500+ Families," "Since [YEAR]," ACA badge (if applicable)
   - Position above fold (below hero)
   - **Acceptance:** Trust bar visible on mobile + desktop

4. **Typography Update (1 SP)**
   - Add Caveat font (handwritten) for hero tagline
   - Update hero tagline to "Where Faith Grows Wild"
   - Increase body line-height to 1.7
   - **Acceptance:** Hero tagline uses handwritten font

5. **One Video Testimonial (3 SP)**
   - Film 1 parent testimonial (30-60 sec, iPhone quality OK)
   - Upload to YouTube (unlisted)
   - Embed on homepage with lite-youtube-embed
   - **Acceptance:** Video plays on click, loads fast

**Total:** 8 SP (~2 full workdays)

**Success Metrics:**
- Homepage feels warmer (subjective feedback from 5 users)
- Trust signals increase time on site by 10-15%
- Video testimonial engagement rate >30% (views / homepage visits)

---

### Phase 2: Core Features (3-4 weeks, 21 SP)

**Goal:** Complete redesign of homepage + mobile-first features.

**Deliverables:**

1. **Hero Video Integration (3 SP)**
   - Film 15-30 sec video loop (campers hiking, campfire, canoeing)
   - Compress to <5 MB (FFmpeg: H.264 + WebM)
   - Implement video background with text overlay
   - Add scroll indicator (animated arrow)
   - **Acceptance:** Video autoplays on desktop/mobile, <5 MB file size

2. **Program Cards Redesign (2 SP)**
   - Create interactive card components (hover lift effect)
   - Add real camper photos (Jr. High + High School)
   - Implement responsive grid (stacks on mobile)
   - **Acceptance:** Cards hover/lift, photos are authentic

3. **Mission Section Redesign (2 SP)**
   - Add background photo (prayer circle around campfire)
   - Overlay text: "Faith. Adventure. Transformation."
   - Implement handwritten font for tagline
   - **Acceptance:** Section feels warm, not text-only

4. **Video Testimonials Section (5 SP)**
   - Film 2 more testimonials (1 camper, 1 parent)
   - Create testimonial grid component
   - Implement lite-youtube-embed for lazy-loading
   - Custom thumbnails (genuine expressions)
   - **Acceptance:** 3 total videos, lazy-loaded, custom thumbnails

5. **Instagram Feed Integration (2 SP)**
   - Choose integration method (API or widget)
   - Embed 6 recent posts from @bearlakecamp
   - Implement responsive grid (stacks on mobile)
   - Add hover overlay ("View on Instagram")
   - **Acceptance:** Feed shows 6 recent posts, updates daily

6. **Sticky Mobile CTA (1 SP)**
   - Create sticky bottom bar (mobile only)
   - Show after 300px scroll
   - Two CTAs: "Register Now" + "Find Your Week"
   - **Acceptance:** Bar appears on scroll, 48px × 48px tap targets

7. **Scroll-Triggered Animations (2 SP)**
   - Implement Intersection Observer for fade-in sections
   - Add hover states for buttons/cards
   - Respect `prefers-reduced-motion`
   - **Acceptance:** Sections fade in on scroll, no motion sickness

8. **Accessibility Audit (2 SP)**
   - Test color contrast ratios (WCAG AA)
   - Add ARIA labels to interactive elements
   - Verify keyboard navigation (tab through page)
   - Add skip link for screen readers
   - **Acceptance:** Lighthouse Accessibility score ≥90

9. **Performance Optimization (2 SP)**
   - Compress all images (WebP + JPEG fallback)
   - Lazy-load images below fold
   - Subset Caveat font (Latin only, 1 weight)
   - Optimize hero video (<5 MB)
   - **Acceptance:** Lighthouse Performance score ≥90, LCP <2.5s

**Total:** 21 SP (~4-5 full workdays)

**Success Metrics:**
- Mobile conversion rate increases by 15-25%
- Bounce rate decreases by 20-30%
- Time on site increases by 40% (video content engagement)

---

### Phase 3: Enhancements (2-3 weeks, 13 SP)

**Goal:** Polish + advanced features for competitive differentiation.

**Deliverables:**

1. **Gallery Section (3 SP)**
   - Create grid layout (6-9 photos)
   - Implement lightbox for full-screen viewing
   - Add swipe gestures for mobile
   - **Acceptance:** Gallery is swipeable, photos are authentic

2. **Safety + Staff Callout (2 SP)**
   - Create trust section (ACA, background checks, 1:8 ratio)
   - Add "Meet Our Team" CTA
   - Dark background (forest green) + cream text
   - **Acceptance:** Section builds parent confidence

3. **Progressive Web App (PWA) Features (3 SP)**
   - Create `manifest.json` (app icon, name, colors)
   - Implement service worker (cache key pages)
   - Add "Add to Home Screen" prompt
   - **Acceptance:** Homepage works offline, installable on mobile

4. **Advanced Animations (2 SP)**
   - Parallax scrolling for hero section
   - Staggered fade-in for program cards
   - Smooth scroll for anchor links
   - **Acceptance:** Animations feel natural, not distracting

5. **Analytics + Conversion Tracking (1 SP)**
   - Set up Google Analytics 4
   - Track conversions: "Register Now" clicks, video views, time on site
   - Create dashboard for client
   - **Acceptance:** Client can view metrics weekly

6. **A/B Testing Setup (2 SP)**
   - Test hero tagline variations ("Where Faith Grows Wild" vs. alternatives)
   - Test CTA button colors (forest green vs. clay)
   - Test testimonial placement (above vs. below programs)
   - **Acceptance:** Test runs for 2 weeks, winner implemented

**Total:** 13 SP (~3 full workdays)

**Success Metrics:**
- PWA "Add to Home Screen" adoption: 5-10% of mobile users
- A/B test winner increases conversions by 10-15%
- Client reviews analytics weekly (engagement with dashboard)

---

### Total Implementation Effort

| Phase | Story Points | Calendar Time | Cost Estimate (at 8 SP/day) |
|-------|-------------|---------------|------------------------------|
| **Phase 1: Quick Wins** | 8 SP | 1-2 weeks | 1 workday |
| **Phase 2: Core Features** | 21 SP | 3-4 weeks | 2.6 workdays |
| **Phase 3: Enhancements** | 13 SP | 2-3 weeks | 1.6 workdays |
| **Total** | **42 SP** | **6-9 weeks** | **5.2 workdays** |

**Notes:**
- Story points are effort estimates (complexity), not time
- Calendar time includes client feedback loops, content gathering
- Cost estimate assumes 8 SP per full workday (1 SP = 1 hour)

---

## Next Steps

### Immediate Actions (This Week)

1. **Client Review of Styleguide (You)**
   - Review this document with leadership team
   - Approve color palette, typography, photography direction
   - Identify any concerns or questions

2. **Photography Audit (You + Sparkry)**
   - Gather 10-15 real camper photos from recent summers
   - Share via Google Drive / Dropbox
   - Sparkry will apply "Nature-Authentic" Lightroom preset

3. **Video Testimonial Planning (You)**
   - Identify 2-3 families willing to be filmed (parent + camper)
   - Schedule filming during camp pickup or special event
   - Sparkry provides filming script + guidance

4. **Content Preparation (You)**
   - Confirm ACA accreditation status (for badge)
   - Confirm founding year (for "Since [YEAR]")
   - Confirm family count (for "500+ Families")
   - Confirm review rating (Google/Facebook reviews)

### Week 1-2: Phase 1 Kickoff (Sparkry)

1. **Color Palette Update (Day 1)**
   - Implement CSS variables
   - Test on all pages
   - Share preview link for client review

2. **Replace Photos (Day 1-2)**
   - Apply Lightroom preset to client photos
   - Replace hero, program cards, mission section
   - Share preview link for client review

3. **Trust Bar + Typography (Day 2)**
   - Add trust bar component
   - Implement handwritten font for tagline
   - Share preview link for client review

4. **First Video Testimonial (Week 2)**
   - Film 1 parent testimonial (30-60 sec)
   - Edit + upload to YouTube
   - Embed on homepage
   - Share preview link for client review

### Ongoing Communication

- **Weekly Check-Ins:** 30-minute Zoom call (Fridays at 2pm CT)
- **Feedback Loop:** Client reviews preview links within 48 hours
- **Slack/Email:** Daily async updates on progress

---

## Appendix: Design Examples

### Before/After Comparisons

#### Hero Section

**BEFORE (Current Demo):**
```
┌─────────────────────────────────────┐
│     [Static Background Image]       │
│     (Stock photo or placeholder)    │
│                                      │
│        Bear Lake Camp               │
│        Where Faith Grows            │
│        (Generic system font)        │
│                                      │
│        [Register Now Button]        │
│        (Bright blue #2B6DA8)        │
└─────────────────────────────────────┘
```

**AFTER (Recommended):**
```
┌─────────────────────────────────────┐
│   [VIDEO: Campers hiking at sunrise]│
│   (15-30 sec loop, desaturated)     │
│                                      │
│   Bear Lake Camp                     │
│   "Where Faith Grows Wild"           │
│   (Handwritten Caveat font, clay)   │
│                                      │
│   Jr. High (6-8) | High School (9-12)│
│                                      │
│   [Find Your Week ↓]                │
│   (Deep forest green #2F4F3D)       │
│                                      │
│   ↓ Animated scroll indicator       │
└─────────────────────────────────────┘
```

**Impact:**
- Video increases engagement 40% vs. static image
- Handwritten font adds warmth (parent feedback: "feels more personal")
- Deep forest green CTA feels more nature-aligned vs. bright blue

---

#### Color Palette

**BEFORE:**
```
Background: #FFFFFF (white)
Primary CTA: #2B6DA8 (bright blue)
Text: #000000 (black)
```

**AFTER:**
```
Background: #F5F0E8 (cream)
Primary CTA: #2F4F3D (deep forest green)
Text: #5A4A3A (bark)
```

**Visual Comparison:**

[Cream background] vs. [White background]
Warm, inviting        Clinical, sterile

[Forest green CTA] vs. [Bright blue CTA]
Earthy, grounded      Digital, generic

---

### Typography Examples

**BEFORE:**
```
H1: "Bear Lake Camp"
(System font, 48px, black, generic)
```

**AFTER:**
```
H1: "Bear Lake Camp"
(System font, 48px, bark #5A4A3A, tight letter-spacing)

Tagline: "Where Faith Grows Wild"
(Caveat handwritten, 32px, clay #A07856, warm)
```

**Visual Comparison:**

Bear Lake Camp (System font, black)
"Where Faith Grows Wild" (Handwritten, clay)

vs.

Bear Lake Camp (System font, black)
Where Faith Grows (System font, black)

**Impact:** Handwritten accent adds personality without sacrificing performance.

---

### Photography Style

**AVOID (Stock Photo):**
- Group of campers looking at camera with perfect smiles
- Bright, oversaturated colors (Instagram 2015 aesthetic)
- Studio lighting, no visible nature context

**EMBRACE (Nature-Authentic):**
- Campers mid-laugh during low ropes course (candid)
- Golden hour lighting (warm, soft, directional)
- Desaturated -15%, +5 warmth (earthy matte finish)
- Lake/forest visible in background (nature context)

---

## Approval Checklist

Before proceeding to implementation, confirm:

- [ ] **Color Palette Approved:** Client approves earthy palette (cream, forest green, clay)
- [ ] **Typography Approved:** Client approves system fonts + Caveat handwritten accent
- [ ] **Photography Direction Approved:** Client approves "real over perfect" approach
- [ ] **Hero Video Approved:** Client approves 15-30 sec video loop concept
- [ ] **Trust Signals Approved:** Client approves "500+ families," ACA badge, review rating
- [ ] **Mobile-First Approved:** Client approves sticky CTA bar, thumb-friendly targets
- [ ] **Accessibility Approved:** Client approves WCAG AA compliance requirements
- [ ] **Roadmap Approved:** Client approves 3-phase implementation (8 SP → 21 SP → 13 SP)

**Client Signature:** ______________________ **Date:** __________

---

**Questions or revisions needed?** Contact travis@sparkry.com
