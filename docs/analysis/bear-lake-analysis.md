# Bear Lake Camp WordPress Site Analysis

**Analysis Date:** October 31, 2025
**Purpose:** Foundation for Astro 
**Current WordPress Version:** 6.8.3
**Current Theme:** Parabola by Cryout Creations

---

## Executive Summary

Bear Lake Camp (bearlakecamp.com) is a Christian camp ministry website with **31 published pages**, **7,386 images**, and content spanning 2014-2025. The site uses WordPress + Elementor with the Parabola theme, targeting families, church groups, and camp staff recruitment.

**Key Characteristics:**
- Mission-driven content ("To Know Christ - Phil. 3:10")
- Multiple program types (summer camp, retreats, rentals)
- Heavy photo/gallery usage (campers, facilities, staff)
- Staff recruitment focus (summer staff, work at camp pages)
- Responsive design with mobile considerations

---

## Site Information

### Basic Details
- **Site Title:** Bear Lake Camp
- **Tagline:** To Know Christ - Phil. 3:10
- **Domain:** bearlakecamp.com
- **WordPress Version:** 6.8.3
- **Active Theme:** Parabola 2.4.2
- **Page Builder:** Elementor

### Content Authors (4 users)
1. **Ben Harlan** (ben@bearlakecamp.com, bnharlan818@gmail.com) - Primary admin
2. **Jennifer Sherbahn** (jennifer@bearlakecamp.com)
3. **John Scheiber** (media@bearlakecamp.com) - Media manager
4. **root** (legacy admin account)

---

## Page Structure & Hierarchy

### Complete Page Inventory (31 Pages)

All pages are root-level (no parent/child hierarchy). Listed alphabetically with WordPress post IDs:

| Page ID | Title | Slug | Purpose |
|---------|-------|------|---------|
| 2894 | About | about | Camp mission, history, leadership |
| 4733 | Activities | activities | Camp activities overview |
| 2730 | Anchored | anchored | Specific program/event |
| 550 | Bear Tracks | bear-tracks | Blog/news section |
| 4162 | BLC Summer Promo Video | promo_video | Marketing video |
| 2562 | Breathe | breathe | Specific program/event |
| 3432 | Cabins | cabins | Facilities - sleeping accommodations |
| 3409 | Chapel | chapel | Facilities - worship space |
| 3245 | Click Me | click-me | Utility page (unknown purpose) |
| 2209 | Contact Us | contact-us | Contact form, address, map |
| 2598 | Current Health Updates | current-health-updates | COVID/health policies |
| 2504 | Defrost | defrost | Specific program/event |
| 2681 | Dining Hall | dininghall | Facilities - food service |
| 3281 | FAQ | faq-2 | Frequently asked questions |
| 2323 | Financial Partnerships | financial-partnerships | Donor information |
| 2217 | Home | home-2 | **Primary homepage** |
| 2926 | Leaders In Training | leaders-in-training | LIT program for older youth |
| 3386 | Ministry Activity Center (GYM) | mac | Facilities - gymnasium |
| 2420 | My account | my-account | User account management |
| 3446 | Outdoor Spaces | outdoor | Facilities - outdoor areas |
| 3214 | Parent Info | __trashed | Trashed page (exclude from migration) |
| 4206 | Partners in Ministry | partners-in-ministry | Donor/partner information |
| 2537 | Recharge | recharge | Specific program/event |
| 2631 | Rentals | rentals | Facility rental information |
| 1106 | Retreats | retreats | Retreat programs (adult, church groups) |
| 2263 | Summer Camp | summer-camp | Main summer camp program page |
| 2807 | Summer Staff | summer-staff | Staff recruitment |
| 3761 | Summer Staff Landing | summer-staff-landing | Staff recruitment landing page |
| 3189 | What To Bring | what-to-bring-2 | Packing lists for campers |
| 2437 | Wish List | wish-list | Donation wish list |
| 3291 | Work at Camp | work-at-camp | Employment opportunities |

### Navigation Menu Structure

**Main Menu Items** (from wp_term "Main Menu", ID: 6):
- Home
- About
- Summer Camp
- Retreats
- Rentals
- Contact Us
- Summer Staff (recruitment focus)
- Financial Partnerships

**Expected Site Architecture for Astro:**
```
/                           → Home
/about                      → About
/summer-camp                → Summer Camp overview
  /what-to-bring           → Packing lists
  /faq                     → FAQ
/programs                   → Program pages (Anchored, Breathe, Defrost, Recharge, LIT)
/retreats                   → Retreats
/rentals                    → Rentals
/facilities                 → Facilities pages (Cabins, Chapel, Dining Hall, MAC, Outdoor)
/summer-staff              → Staff recruitment
/work-at-camp              → Employment
/contact                   → Contact Us
/activities                → Activities
```

---

## Homepage Content Analysis

### Homepage Sections (from `home-2` page)

**1. Hero Section**
- **Logo:** BLC-Logo-compass-whiteletters-no-background-small.png (503×258px)
- **Design:** Compass logo with white letters, no background (transparent PNG)
- **Location:** `/wp-content/uploads/2019/10/`

**2. "Who We Are" Section**
- **Heading:** "Who We Are"
- **Mission Statement:** "Bear Lake Camp exists to be a Christian Ministry Center which challenges individuals toward maturity in Christ and to provide a positive environment through services and facilities."
- **Layout:** Text block with bold mission statement

**3. Photo Gallery**
- **Layout:** 3-column grid
- **Image Dimensions:** 150×150px thumbnails (lightbox on click)
- **Content:** Recent camp activities, campers, staff
- **Recent Photos (2024-2025):**
  - Jr. High camp activities
  - Staff promotional photos (headshots, action shots)
  - Bible study groups
  - Outdoor activities
  - Facility photos

**Expected Homepage Modernization:**
- Larger hero with full-width background image + overlaid logo
- Simplified mission statement with better typography
- Modernized photo gallery (masonry or grid with hover effects)
- Call-to-action buttons (Register, Donate, Contact)
- Upcoming events/dates section
- Testimonials or quick links

---

## Design Tokens & Brand Identity

### Color Palette

**Primary Colors** (extracted from Parabola theme CSS):
- **White:** `#ffffff` (backgrounds, text on dark)
- **Light Gray:** `#eeeeee` (subtle backgrounds)
- **Medium Gray:** `#999999` (secondary text, borders)
- **Dark Gray:** `#333333` (primary text)
- **Black Overlay:** `rgba(0, 0, 0, 0.7)` (image overlays)

**Brand Colors** (from logo and visual inspection):
- **Compass Blue:** Likely primary brand color (needs confirmation from logo analysis)
- **Forest Green:** Secondary (camp/nature theme)
- **Earth Tones:** Browns, greens for nature/outdoor aesthetic

**Recommended Modern Palette** (Nature-inspired for outdoor camp ministry):
```css
/* Primary - Lake Blue (calm, trust, water) */
--color-primary: #2B6DA8;      /* Deep lake blue */
--color-primary-light: #4A8BC2;/* Lighter blue for hover states */
--color-primary-dark: #1A4D7A; /* Darker blue for text on light */

/* Secondary - Forest Green (growth, nature, outdoor) */
--color-secondary: #3D7A5C;    /* Deep forest green */
--color-secondary-light: #5A9B7D; /* Lighter green */

/* Accent - Warm Earth (welcoming, natural) */
--color-accent: #C17F47;       /* Warm terracotta/earth tone */
--color-accent-light: #D99A6A; /* Lighter earth for backgrounds */

/* Neutrals */
--color-text: #1A1A1A;         /* Near-black for readability */
--color-text-muted: #6B6B6B;   /* Muted gray for secondary text */
--color-bg: #FFFFFF;           /* Clean white background */
--color-bg-subtle: #F7F9FA;    /* Subtle cool gray for sections */
--color-border: #E5E7EB;       /* Light gray borders */

/* Semantic */
--color-success: #48A565;      /* Green for success messages */
--color-warning: #F59E0B;      /* Orange for warnings */
--color-info: #2B6DA8;         /* Primary blue for info */
```

**Logo Colors** (extracted from files):
- Logo is **monochrome** (black compass + white text on transparent)
- Two versions available:
  - `BLC-Logo-compass-whiteletters-no-background-small.png` (white text, for dark backgrounds)
  - `BLC-Logo-compass-nobackground-clear-letters-INVERTED.png` (black text, for light backgrounds)

### Typography

**Current Fonts:**
- **Primary Body:** Open Sans (Google Font)
- **Headings:** Open Sans (same as body)
- **Serif Fallback:** Georgia, "Bitstream Charter", serif
- **Monospace:** Monaco, "Courier New", monospace

**Recommended Modern Stack:**
```css
/* Primary Font - Clean, readable */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Headings - Slightly more character */
font-family: 'Outfit', 'Inter', sans-serif;

/* Monospace (if needed) */
font-family: 'Fira Code', Monaco, monospace;
```

**Typography Scale (Tailwind-inspired):**
- **H1 (Hero):** 48px / 3rem (desktop), 32px / 2rem (mobile)
- **H2 (Section):** 36px / 2.25rem (desktop), 28px / 1.75rem (mobile)
- **H3 (Subsection):** 24px / 1.5rem
- **Body:** 16px / 1rem (line-height: 1.6)
- **Small:** 14px / 0.875rem

### Spacing & Layout

**Current Layout Widths:**
- **Max Width:** ~1200px (standard desktop)
- **Responsive Breakpoints:**
  - Mobile: < 640px
  - Tablet: 768px
  - Desktop: 1024px+

**Modern Spacing System (Tailwind):**
- **Section Padding:** py-16 (64px vertical) on desktop, py-12 (48px) on mobile
- **Container Padding:** px-4 (16px) on mobile, px-8 (32px) on tablet+
- **Element Spacing:** Use 8px base unit (8, 16, 24, 32, 48, 64px)

---

## Image Catalog & Media Analysis

### Total Media Assets
- **Total Images:** 7,386 files (JPG, PNG)
- **Organization:** Organized by year (2014-2025)
- **Upload Folders:**
  - `/wp-content/uploads/2014/` → 2025 (yearly folders)
  - `/wp-content/uploads/elementor/` (Elementor-specific)
  - `/wp-content/uploads/aioseo/` (SEO plugin)

### Key Brand Assets

**Logo Files:**
- **Primary Logo:** `BLC-Logo-compass-whiteletters-no-background-small.png` (503×258px)
  - Location: `/wp-content/uploads/2019/10/`
  - Usage: Header, homepage hero
  - Format: Transparent PNG with white text
- **Favicon:** `cropped-picturelogo-32x32.png`
  - Location: `/wp-content/uploads/2017/04/`

**Camp Sign Photo:**
- **campsign.jpg** (640×427px) - "The Camp Sign welcomes visitors as they arrive on the grounds"
- Location: `/wp-content/uploads/2014/08/`
- Usage: Background, hero images

### Recent Image Uploads (2024-2025)

**2024 November Uploads (Most Recent):**
- **Jr. High Camp Photos:** `Jr.-High-145.jpg`, `Jr.-100.jpg`, `Jr.-78.jpg`, `Jr.-High-69.jpg`
  - Action shots of junior high campers
  - Bible study groups
  - Outdoor activities
- **Staff Promotional Photos:** `Top-staff-promo-*.jpg`
  - Staff headshots and group photos
  - Used for recruitment pages
- **Facility Photos:** `DSC_*.jpg`
  - Chapel, cabins, dining hall
  - Outdoor spaces

**2025 March Uploads (Staff Headshots):**
- **kyle-Headshot-2025.png** (2000×2000px)
- **jared-Headshot-2025.png**
- Professional staff headshots for recruitment/about pages

### Image Usage Patterns

**Homepage Gallery Images (3-column grid):**
- 150×150px thumbnails
- Full-size on lightbox click
- Recent camp activity photos (summer 2024)

**Hero/Background Images:**
- Typical size: 1920×1080px or larger
- Formats: JPG (photos), PNG (logos with transparency)
- Usage: Page headers, section backgrounds

**Responsive Sizes Generated (WordPress default):**
- **Thumbnail:** 150×150px
- **Medium:** 300×200px
- **Large:** 1024×768px
- **Custom Sizes:**
  - Header: 640×120px
  - Slider: 640×400px
  - Columns: 318×201px

### Recommendation for Astro Migration

**Image Optimization Strategy:**
1. **Audit Active Images:**
   - Only migrate images referenced in published page content
   - Exclude: Unused uploads, draft attachments, plugin-generated thumbnails
   - Estimated: ~500-800 actively used images (vs 7,386 total)

2. **Format Conversion:**
   - Convert JPGs to WebP with JPEG fallback
   - Keep PNGs for logos/transparency needs
   - Target: 80% file size reduction

3. **Responsive Images:**
   - Use Astro's `<Image>` component
   - Generate: 320w, 640w, 1024w, 1920w srcsets
   - Lazy-load below-fold images

4. **Organization:**
   ```
   public/images/
     /logo/              → Brand assets (logo, favicon)
     /hero/              → Full-width hero images
     /gallery/           → Photo galleries (campers, activities)
     /facilities/        → Building/space photos
     /staff/             → Headshots, staff photos
     /programs/          → Program-specific imagery
   ```

---

## Content Types & Functionality

### Page Templates Needed

**1. Homepage Template**
- Hero section with logo + tagline
- Mission statement
- Photo gallery (recent camp photos)
- Call-to-action buttons
- Upcoming events/dates

**2. Standard Page Template**
- Page header with optional hero image
- Single-column content
- Sidebar with quick links (optional)
- Contact call-to-action footer

**3. Facilities Page Template**
- Photo gallery (facility-specific)
- Specifications/capacity info
- Rental information link

**4. Program Page Template**
- Hero with program branding
- Age range, dates, pricing
- Photo gallery
- Registration call-to-action

**5. Staff/Employment Template**
- Job listings or staff bios
- Application process
- Photos of current staff
- Testimonials

### WordPress Plugins & Functionality

**Plugins Detected (from upload folders):**
- **Elementor** - Page builder (visual editor)
- **AIOSEO** - SEO optimization
- **iThemes Security** - Security hardening
- **ExactMetrics** - Google Analytics integration
- **ML Slider** - Image slider/carousel

**Functionality to Replicate in Astro:**
1. **Contact Form** (Contact Us page)
   - Likely using Contact Form 7 or similar
   - **Astro Solution:** Formspree, Netlify Forms, or custom API route

2. **Photo Galleries** (multiple pages)
   - Lightbox functionality
   - **Astro Solution:** PhotoSwipe, GLightbox, or custom component

3. **Image Sliders** (homepage, program pages)
   - **Astro Solution:** Swiper.js, Splide, or Astro component

4. **SEO Meta Tags**
   - **Astro Solution:** Built-in SEO component with meta tags

5. **Social Media Links** (footer)
   - Facebook, Instagram links
   - **Astro Solution:** Static footer component

---

## Navigation & Menu Structure

### Main Navigation Menu

**Top-Level Items:**
1. Home
2. About
3. Summer Camp (with potential dropdown: What To Bring, FAQ)
4. Retreats
5. Rentals
6. Summer Staff
7. Contact Us

**Footer Navigation (Expected):**
- About
- Contact
- Financial Partnerships
- Wish List
- Work at Camp
- Privacy Policy (if exists)

**Mobile Navigation:**
- Hamburger menu for mobile (<768px)
- Slide-out or dropdown menu
- Sticky header (scroll behavior)

---

## Key Pages Deep Dive

### Homepage (`/home-2`)

**Current Content Blocks:**
1. **Hero:** Logo + tagline
2. **Who We Are:** Mission statement
3. **Gallery:** 3×3 grid of recent camp photos
4. **Programs:** Links to Anchored, Breathe, Defrost, Recharge
5. **Footer:** Contact info, social links

**Modernization Recommendations:**
1. **Hero:**
   - Full-width background image (kids at camp, outdoor activity)
   - Overlaid logo (larger, centered)
   - Tagline: "To Know Christ - Phil. 3:10"
   - CTA Buttons: "Summer Camp 2026" | "Plan Your Retreat"

2. **Welcome Section:**
   - 2-column layout: Mission statement (left) + photo (right)
   - Heading: "Welcome to Bear Lake Camp"
   - Subheading: Mission statement
   - Body: 2-3 paragraphs about camp history, values

3. **Programs Grid:**
   - 4-column grid (mobile: 1-column)
   - Cards: Summer Camp, Retreats, Rentals, LIT
   - Each card: Photo, title, 1-sentence description, "Learn More" link

4. **Photo Gallery:**
   - Masonry layout (3-4 columns)
   - 8-12 recent photos
   - Heading: "Life at Camp"
   - Lightbox on click

5. **Upcoming Events/Dates:**
   - Section: "Summer 2026 Dates"
   - List: Week 1 (June 14-20), Week 2 (June 21-27), etc.
   - CTA: "Register Now"

6. **Testimonials:**
   - 2-3 parent/camper testimonials
   - Quote + name + year

7. **Footer:**
   - Contact info, address, phone, email
   - Social media icons
   - Quick links navigation

### About Page (`/about`)

**Expected Content:**
- Camp history (founding, mission)
- Leadership team (photos + bios)
- Core values/beliefs
- Accreditations/affiliations

**Template Needs:**
- Staff bio cards (photo + name + title + bio)
- Timeline or history section
- Photo gallery (historical + current)

### Summer Camp Page (`/summer-camp`)

**Expected Content:**
- Age ranges (Jr. High, High School, etc.)
- Dates and pricing
- What's included (meals, activities, lodging)
- Registration link
- FAQ link

**Sub-Pages:**
- What To Bring
- FAQ
- Leaders In Training (LIT)

### Retreats Page (`/retreats`)

**Expected Content:**
- Types of retreats (church, youth, adult)
- Group sizes
- Pricing packages
- Facilities overview
- Booking process

### Facilities Pages

**Individual Pages:**
- **Cabins:** Sleeping accommodations, capacity
- **Chapel:** Worship space, seating capacity
- **Dining Hall:** Meals, dietary accommodations
- **Ministry Activity Center (GYM):** Indoor activities, sports
- **Outdoor Spaces:** Lake, trails, sports fields

**Template:**
- Hero image (facility exterior/interior)
- Description paragraph
- Photo gallery (4-6 images)
- Specifications (capacity, amenities)
- Related pages (e.g., Rentals for bookings)

### Summer Staff Page (`/summer-staff`)

**Expected Content:**
- Job descriptions (counselors, lifeguards, kitchen staff)
- Requirements (age, faith commitment, skills)
- Benefits (stipend, housing, experience)
- Application process
- Staff testimonials

**Call-to-Action:**
- "Apply Now" button → Application form or external link

---

## Technical Recommendations for Astro Migration

### 1. Content Collections

```typescript
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const pages = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    heroImage: z.string().optional(),
    heroTagline: z.string().optional(),
    template: z.enum(['default', 'homepage', 'facility', 'program', 'staff']),
    showInNav: z.boolean().default(false),
    navOrder: z.number().optional(),
  }),
});

const programs = defineCollection({
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    ageRange: z.string(),
    dates: z.array(z.object({
      start: z.string(),
      end: z.string(),
    })),
    pricing: z.number(),
    heroImage: z.string(),
    description: z.string(),
  }),
});

export const collections = { pages, programs };
```

### 2. TinaCMS Schema

```typescript
// tina/config.ts
export default defineConfig({
  schema: {
    collections: [
      {
        name: 'page',
        label: 'Pages',
        path: 'src/content/pages',
        format: 'mdx',
        fields: [
          { type: 'string', name: 'title', label: 'Page Title', required: true },
          { type: 'image', name: 'heroImage', label: 'Hero Image' },
          { type: 'string', name: 'heroTagline', label: 'Hero Tagline' },
          {
            type: 'rich-text',
            name: 'body',
            label: 'Page Content',
            isBody: true,
            templates: [
              {
                name: 'Gallery',
                label: 'Photo Gallery',
                fields: [
                  { type: 'string', name: 'heading', label: 'Gallery Heading' },
                  {
                    type: 'object',
                    name: 'images',
                    label: 'Images',
                    list: true,
                    fields: [
                      { type: 'image', name: 'src', label: 'Image' },
                      { type: 'string', name: 'alt', label: 'Alt Text' },
                      { type: 'string', name: 'caption', label: 'Caption (optional)' },
                    ],
                  },
                ],
              },
              {
                name: 'CallToAction',
                label: 'Call to Action',
                fields: [
                  { type: 'string', name: 'heading', label: 'Heading' },
                  { type: 'string', name: 'text', label: 'Button Text' },
                  { type: 'string', name: 'link', label: 'Button Link' },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
});
```

### 3. Astro Component Architecture

```
src/
  components/
    base/
      BaseLayout.astro         → Head, nav, footer wrapper
      Header.astro             → Site header with navigation
      Footer.astro             → Site footer with links/contact
    sections/
      Hero.astro               → Full-width hero with image + text
      WelcomeSection.astro     → Mission statement section
      ProgramsGrid.astro       → 4-column program cards
      PhotoGallery.astro       → Masonry photo gallery with lightbox
      UpcomingDates.astro      → Summer dates list
      Testimonials.astro       → Testimonial cards
      CallToAction.astro       → CTA button section
    ui/
      Button.astro             → Reusable button component
      Card.astro               → Content card component
      LightboxImage.astro      → Image with lightbox functionality
  layouts/
    DefaultPage.astro          → Standard page layout
    Homepage.astro             → Homepage-specific layout
    FacilityPage.astro         → Facility page layout
  pages/
    index.astro                → Homepage
    about.astro                → About page
    summer-camp.astro          → Summer camp page
    [...slug].astro            → Dynamic page routing
```

### 4. Performance Optimizations

**Image Handling:**
```astro
---
import { Image } from 'astro:assets';
import campPhoto from '../assets/images/jr-high-145.jpg';
---

<Image
  src={campPhoto}
  alt="Junior High campers during Bible study"
  width={1920}
  height={1080}
  format="webp"
  quality={80}
  loading="lazy"
/>
```

**Critical CSS Inlining:**
- Inline critical above-the-fold CSS in `<head>`
- Load full CSS asynchronously

**Font Loading:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
```

**PageSpeed Targets:**
- **Mobile:** 90+ (currently 30-50 on WordPress)
- **Desktop:** 95+ (currently 40-60 on WordPress)
- **Largest Contentful Paint (LCP):** < 2.5s
- **Total Blocking Time (TBT):** < 200ms

---

## Migration Checklist

### Week 1: Analysis & Design ✓ (Current Phase)

- [x] WordPress export received
- [x] MySQL database dump analyzed
- [x] Page inventory completed (31 pages)
- [x] Image catalog created (7,386 files)
- [x] Design tokens extracted
- [ ] Modern homepage mockups (2 variations)
- [ ] About page mockup
- [ ] Summer Camp page mockup

### Week 2: Build 3-Page Demo

- [ ] Astro project initialized
- [ ] TinaCMS configured
- [ ] Homepage built (hero, mission, programs, gallery, footer)
- [ ] About page built (mission, leadership, donate CTA)
- [ ] Summer Camp page built (overview, gallery, register CTA)
- [ ] Deploy to Cloudflare Pages staging
- [ ] Training video created (5 minutes)
- [ ] Client validation session

### Full Migration (Post-Approval)

- [ ] Migrate all 31 pages to Astro/TinaCMS
- [ ] Audit and migrate actively used images (~500-800 images)
- [ ] Implement contact form (Formspree or API route)
- [ ] Configure photo galleries with lightbox
- [ ] Set up Cloudflare DNS
- [ ] SSL certificate configured
- [ ] 301 redirects from old URLs (if structure changes)
- [ ] Train 2-3 admin users
- [ ] Monitor first week of usage

---

## Next Steps

1. **Create Modern Mockups** (Week 1, Days 3-5) ← **NEXT STEP**:
   - Homepage (2 variations)
   - About page
   - Summer Camp page
   - Mobile responsive views

2. **Client Feedback on Mockups:**
   - Approve design direction
   - Select preferred homepage variation
   - Greenlight for development phase

3. **Build 3-Page Demo** (Week 2):
   - Homepage (hero, mission, programs grid, photo gallery, footer)
   - About page (mission, leadership, donate CTA)
   - Summer Camp page (program overview, gallery, register CTA)
   - Astro + TinaCMS implementation
   - Deploy to Cloudflare Pages staging
   - Client validation checkpoint

---

## Questions Answered ✓

1. **Sub-Page Priority:** ✓ Build **3 pages total** (Homepage + About + Summer Camp)
   - Homepage (hero, mission, programs grid, photo gallery)
   - About page (mission, leadership bios, history)
   - Summer Camp page (program details, dates, registration links)

2. **Contact Form:** ✓ **ben@bearlakecamp.com**

3. **Social Media:** ✓ **Confirmed active accounts:**
   - **Facebook:** https://www.facebook.com/blc.bear.lake.camp/
   - **Instagram:** https://www.instagram.com/bearlakecamp/
   - **YouTube:** https://www.youtube.com/channel/UCiw_MKtM5hN83IghEjydmGw?view_as=subscriber
   - **Spotify Playlist:** https://open.spotify.com/playlist/1Dw4cfs5pj7p95uy2f3b0k?si=eZ6NDfybSsGG14DjJ-wXKA
   - **Donate Link:** https://www.ultracamp.com/donation.aspx?idCamp=268&campCode=blc

4. **Brand Colors:** ✓ Logo is **monochrome** (black/white) - created nature-inspired palette:
   - Lake Blue (#2B6DA8), Forest Green (#3D7A5C), Warm Earth (#C17F47)

5. **Registration System:** ✓ **UltraCamp**
   - Donation page: https://www.ultracamp.com/donation.aspx?idCamp=268&campCode=blc
   - Camp Code: `blc`, Camp ID: `268`
   - Registration likely at: https://www.ultracamp.com/clientlogin.aspx?idCamp=268

6. **Urgent Content:** ✓ No time-sensitive content requiring immediate migration

### Remaining Open Questions

1. **Analytics:** Continue with Google Analytics or switch to Cloudflare Analytics?
   - **Recommendation:** Cloudflare Analytics (privacy-friendly, no cookie banner needed, simpler compliance)

2. **Contact Form Service:** Formspree (free: 50/month) or Cloudflare Pages Functions (custom)?
   - **Recommendation:** Start with Formspree for MVP, migrate to Cloudflare Functions later if needed

---

## Files Referenced

**WordPress Export:**
- `requirements/content-hosting/bearlakecamp-original/bearlakecamp.WordPress.2025-10-31.xml`
- `requirements/content-hosting/bearlakecamp-original/bearlakecamp_com.sql`

**Site Files:**
- `/Users/travis/bearlakecamp.com/` (full WordPress installation)
- `/Users/travis/bearlakecamp.com/wp-content/uploads/` (7,386 images)
- `/Users/travis/bearlakecamp.com/wp-content/themes/parabola/` (active theme)

**Key Assets:**
- Logo: `/wp-content/uploads/2019/10/BLC-Logo-compass-whiteletters-no-background-small.png`
- Favicon: `/wp-content/uploads/2017/04/cropped-picturelogo-32x32.png`

---

**Analysis Status:** Complete (Week 1, Days 1-2 | 5 SP)
**Next Phase:** Design Mockups (Week 1, Days 3-5 | 8 SP)
