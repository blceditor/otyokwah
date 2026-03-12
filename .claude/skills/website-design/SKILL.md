# Website Designer Skill

> **Purpose**: Creative, mobile-first website template generation with performance validation

---

## Skill Overview

A progressive skill that generates professional, conversion-optimized website templates. Specializes in:
- **Camp/Retreat websites** (immediate focus)
- **Non-profit/Ministry sites**
- **Small business landing pages**
- **Event registration sites**

---

## Core Capabilities

### 1. Template Generation
- Mobile-first responsive layouts
- Semantic HTML5 structure
- Tailwind CSS utility-first styling
- Next.js App Router components
- Keystatic CMS integration patterns

### 2. Design Principles (SIMPLE Framework)
- **S**imple: Clean layouts, minimal visual noise
- **I**ntuitive: Clear navigation, obvious CTAs
- **M**obile-first: 60%+ traffic is mobile
- **P**erformant: <2.5s LCP, <0.1 CLS, <200ms INP
- **L**egible: WCAG AA contrast, readable typography
- **E**motional: Strategic imagery, trust signals

### 3. Validation Scripts
- Lighthouse performance audits
- Accessibility compliance checks
- Mobile responsiveness verification
- SEO structure validation
- Core Web Vitals monitoring

---

## Template Categories

### Camp/Retreat Website Templates

**Required Sections:**
1. **Hero** - Video/image with tagline, primary CTA
2. **Programs** - Age-segmented offerings with dates/pricing
3. **Trust Bar** - Accreditation, years, testimonial count
4. **About** - Mission, staff, facilities
5. **Testimonials** - Video + text from parents/campers
6. **FAQ** - Accordion with common questions
7. **Registration CTA** - Sticky mobile bar + prominent buttons
8. **Footer** - Contact, social, quick links

**Key Components:**
```
├── Hero (HeroVideo, HeroCarousel, HeroImage)
├── ProgramCards (age-segmented, date/price display)
├── TrustBar (stats, accreditation badges)
├── TestimonialSection (video + text grid)
├── FAQAccordion (searchable, grouped)
├── CTASection (primary action + urgency)
├── ContactForm (progressive disclosure)
└── Footer (multi-column, newsletter signup)
```

---

## Design Tokens

### Typography Scale (Mobile-First)
```css
--text-hero: clamp(2rem, 5vw, 4rem);
--text-h1: clamp(1.75rem, 4vw, 2.5rem);
--text-h2: clamp(1.5rem, 3vw, 2rem);
--text-h3: clamp(1.25rem, 2.5vw, 1.5rem);
--text-body: clamp(1rem, 2vw, 1.125rem);
--text-small: clamp(0.875rem, 1.5vw, 1rem);
```

### Color Palette Structure
```css
/* Primary: Brand identity (e.g., forest green) */
--color-primary: hsl(150, 25%, 25%);
--color-primary-light: hsl(150, 20%, 40%);
--color-primary-dark: hsl(150, 30%, 15%);

/* Secondary: Accent/CTA (e.g., warm accent) */
--color-secondary: hsl(25, 30%, 50%);

/* Neutral: Backgrounds and text */
--color-cream: hsl(37, 39%, 94%);
--color-bark: hsl(28, 22%, 29%);

/* Semantic: Feedback states */
--color-success: hsl(142, 76%, 36%);
--color-error: hsl(0, 84%, 60%);
```

### Spacing Scale
```css
--space-xs: 0.25rem;   /* 4px */
--space-sm: 0.5rem;    /* 8px */
--space-md: 1rem;      /* 16px */
--space-lg: 1.5rem;    /* 24px */
--space-xl: 2rem;      /* 32px */
--space-2xl: 3rem;     /* 48px */
--space-3xl: 4rem;     /* 64px */
--space-section: 4rem; /* Section padding */
```

---

## Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| LCP | <2.5s | Lighthouse |
| FCP | <1.8s | Lighthouse |
| CLS | <0.1 | Lighthouse |
| INP | <200ms | Lighthouse |
| Total JS | <200kb | Bundle analyzer |
| Time to Interactive | <3.5s | Lighthouse |
| Accessibility Score | >90 | Lighthouse |
| SEO Score | >90 | Lighthouse |

---

## Validation Scripts

### 1. Performance Validator (`scripts/validation/perf-check.ts`)
```typescript
// Runs Lighthouse CI and checks thresholds
// Fails if LCP > 2.5s, CLS > 0.1, or FCP > 1.8s
```

### 2. Accessibility Validator (`scripts/validation/a11y-check.ts`)
```typescript
// axe-core integration
// Checks WCAG 2.2 AA compliance
// Validates color contrast, keyboard nav, ARIA labels
```

### 3. Mobile Responsiveness Validator (`scripts/validation/mobile-check.ts`)
```typescript
// Playwright viewport testing
// Screenshots at 375px, 768px, 1024px, 1440px
// Touch target size validation (44x44px minimum)
```

### 4. SEO Structure Validator (`scripts/validation/seo-check.ts`)
```typescript
// Meta tags presence
// Schema.org JSON-LD validation
// Heading hierarchy (single h1, proper nesting)
// Image alt text coverage
```

### 5. HTML/CSS Quality Validator (`scripts/validation/code-quality-check.ts`)
```typescript
// Semantic HTML validation
// Unused CSS detection
// CSS specificity analysis
// BEM naming convention check
```

---

## Template Generation Workflow

### Phase 1: Discovery
1. Collect brand colors (primary, secondary, accent)
2. Identify target audience (parents/kids/both)
3. Define primary CTA (register, contact, learn more)
4. Gather content requirements (programs, staff, facilities)

### Phase 2: Structure
1. Generate information architecture
2. Create component hierarchy
3. Define page templates
4. Map user flows (discovery → registration)

### Phase 3: Implementation
1. Generate Tailwind config with design tokens
2. Create base components (Button, Card, Section)
3. Build page templates
4. Implement responsive breakpoints

### Phase 4: Validation
1. Run all validation scripts
2. Generate Lighthouse reports
3. Cross-browser testing (Chrome, Safari, Firefox)
4. Mobile device testing (iOS Safari, Android Chrome)

---

## Component Patterns

### Hero Component Options
```
1. HeroVideo - Autoplay muted video background
2. HeroCarousel - Rotating images with content
3. HeroImage - Single impactful image
4. HeroSplit - Image + text side by side
```

### Card Patterns
```
1. ProgramCard - Title, dates, price, CTA
2. TestimonialCard - Quote, author, photo
3. StaffCard - Photo, name, role, bio snippet
4. FeatureCard - Icon, title, description
```

### Navigation Patterns
```
1. StickyHeader - Fixed on scroll with CTA
2. MobileDrawer - Slide-out menu on mobile
3. MegaMenu - Expanded dropdown with sections
4. BreadcrumbNav - Location awareness
```

### CTA Patterns
```
1. StickyMobileCTA - Fixed bottom bar on mobile
2. FloatingCTA - Scroll-triggered button
3. InlineCTA - Within content sections
4. ExitIntentCTA - Popup on exit intent
```

---

## Anti-Patterns to Avoid

### Performance
- ❌ Large unoptimized images (use Next/Image)
- ❌ Third-party scripts in <head> (use next/script lazyOnload)
- ❌ CSS-in-JS at runtime (use Tailwind static)
- ❌ Client-side data fetching for static content

### UX
- ❌ Carousel for critical content (users don't scroll)
- ❌ Hidden navigation on desktop (hamburger only on mobile)
- ❌ Auto-playing video with sound
- ❌ Popup modals on page load
- ❌ Infinite scroll for camp content

### Accessibility
- ❌ Text over images without overlay (contrast issues)
- ❌ Color-only indicators (add icons/text)
- ❌ Small touch targets (<44px)
- ❌ Missing skip links

### SEO
- ❌ Multiple h1 tags
- ❌ Missing alt text on images
- ❌ Thin content pages (<300 words)
- ❌ Duplicate meta descriptions

---

## Integration Points

### CMS Integration (Keystatic)
- Component schemas in `keystatic.config.ts`
- Markdoc components for rich content
- Image handling via `fields.image()`

### Analytics Integration
- Vercel Analytics (automatic)
- Google Analytics 4 (optional)
- Conversion tracking for CTAs

### Form Integration
- Contact forms → Edge API routes
- Registration → UltraCamp/CampMinder
- Newsletter → Mailchimp/ConvertKit

---

## File Structure

```
.claude/skills/website-design/
├── SKILL.md                    # This file
├── templates/
│   ├── camp-website/           # Summer camp template
│   ├── retreat-center/         # Retreat/conference center
│   ├── nonprofit/              # Ministry/nonprofit
│   └── small-business/         # Local business landing
├── components/
│   ├── hero/                   # Hero section variants
│   ├── cards/                  # Card component variants
│   ├── navigation/             # Nav patterns
│   └── cta/                    # CTA patterns
├── tokens/
│   ├── colors.json             # Color palette definitions
│   ├── typography.json         # Type scale definitions
│   └── spacing.json            # Spacing scale
└── validation/
    ├── perf-check.ts           # Performance validation
    ├── a11y-check.ts           # Accessibility validation
    ├── mobile-check.ts         # Responsive validation
    ├── seo-check.ts            # SEO structure validation
    └── code-quality-check.ts   # HTML/CSS quality
```

---

## Usage Examples

### Generate Camp Website Template
```
QSKILL website-design camp-website \
  --brand-color="#2F4F3D" \
  --accent-color="#A07856" \
  --programs="jr-high,sr-high,family-retreat" \
  --cta="Register Now"
```

### Validate Existing Site
```
QSKILL website-design validate \
  --url="https://prelaunch.bearlakecamp.com" \
  --checks="perf,a11y,mobile,seo"
```

### Generate Component
```
QSKILL website-design component \
  --type="hero-video" \
  --responsive=true \
  --a11y=true
```

---

## Success Metrics

### Design Quality
- Lighthouse Performance: 90+
- Lighthouse Accessibility: 90+
- Lighthouse SEO: 90+
- Mobile Usability: 100%

### Conversion Optimization
- Clear primary CTA above fold
- Trust signals visible on load
- Registration flow <5 clicks
- Mobile-optimized forms

### Code Quality
- Semantic HTML5 structure
- <200kb total JavaScript
- WCAG 2.2 AA compliant
- No unused CSS

---

## Research Sources

- UX Best Practices: `/docs/design/UX-SUMMER-CAMP-BEST-PRACTICES.md`
- Market Research: PM Position Memo (competitive analysis)
- Technical Architecture: PE-Designer Position Memo
- Industry Benchmarks: Tavily search results (2024-2025)
