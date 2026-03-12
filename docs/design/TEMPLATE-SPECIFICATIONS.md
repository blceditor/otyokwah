# Template Specifications
**Project:** Bear Lake Camp Website Redesign
**Date:** November 20, 2025
**Migration:** WordPress → Next.js + Keystatic CMS

---

## Executive Summary

This document defines the complete template system for the Bear Lake Camp website redesign. Based on analysis of the original WordPress site (31 pages) and competitive research (cho-yeh.org, miraclecamp.com), we have identified **7 core page templates** that will cover all content types while maintaining design consistency and editorial flexibility.

### Template Inventory

| Template | Count | Priority | Complexity | Keystatic Collections |
|----------|-------|----------|------------|---------------------|
| Homepage | 1 | P0 | High | `site-settings`, `programs`, `testimonials` |
| Program Page | 5 | P0 | Medium | `programs`, `dates`, `faqs` |
| Facility Page | 5 | P1 | Low | `facilities`, `media-gallery` |
| Standard Page | 15 | P1 | Low | `pages` |
| Event/Retreat Page | 3 | P1 | Medium | `events`, `programs` |
| Staff/Employment Page | 2 | P1 | Medium | `staff-members`, `job-postings` |
| Contact Page | 1 | P0 | Low | `site-settings` |

**Total Pages:** 31 (+ potential future growth)

---

## Design Principles from Competitive Research

### From Cho-Yeh.org (Professional Camp Standard)
- **Progressive disclosure model**: Homepage segments by audience ("I am a parent/camper/church leader")
- **Categorical program organization**: Reduces cognitive load by grouping similar offerings
- **Trust signals placement**: Accreditation badges in footer, "EST. 1947" heritage markers
- **Mobile-first navigation**: Sticky header with hamburger menu for mobile
- **Photography-forward design**: Hero images emphasizing outdoor settings
- **Dual CTA strategy**: "Register Now" + "Parent Login" for retention

### From MiracleCamp.com (Conversion Optimization)
- **Social proof prominence**: 4.9/5 rating with review count above-the-fold
- **Transparent date ranges**: "Summer Camp: June 14-20, 2026" reduces parent uncertainty
- **Tiered program options**: Pre-designed camps → fully customizable retreats
- **Cascading CTAs**: Register button in header, hero, and section-specific CTAs
- **Testimonial diversity**: Quotes from campers, parents, retreat participants
- **Custom retreat builder**: Increases perceived flexibility for church groups

### Bear Lake Camp Differentiation
- **"Faith Grows Wild" positioning**: Balances spiritual depth with outdoor adventure
- **Warm, earthy color palette**: Cream (#F5F0E8) vs. stark white backgrounds
- **Handwritten accent font (Caveat)**: Humanizes digital experience, reinforces authenticity
- **Video-first hero**: 15-30 second loop showing real camp moments (not stock footage)
- **Instagram integration**: #FaithGrowsWild user-generated content feed

---

## 1. Homepage Template

### Purpose
Primary conversion page targeting parents researching summer camps and retreat planners exploring facility rentals. Must establish trust, communicate mission, and direct users to registration within 3 seconds of page load.

### Keystatic Schema

```typescript
// keystatic.config.ts - Site Settings (Singleton)
siteSettings: singleton({
  label: 'Site Settings',
  path: 'content/site-settings',
  schema: {
    heroVideo: fields.url({ label: 'Hero Video URL (MP4)' }),
    heroFallbackImage: fields.image({ label: 'Hero Fallback Image', directory: 'public/images/hero' }),
    tagline: fields.text({ label: 'Hero Tagline', defaultValue: 'Where Faith Grows Wild' }),
    missionStatement: fields.text({ label: 'Mission Statement', multiline: true }),
    trustBarStats: fields.object({
      label: 'Trust Bar Statistics',
      fields: {
        acaAccredited: fields.checkbox({ label: 'ACA Accredited', defaultValue: true }),
        familyCount: fields.number({ label: 'Families Served' }),
        foundingYear: fields.number({ label: 'Founding Year', defaultValue: 1948 }),
        rating: fields.number({ label: 'Google Rating (out of 5)' }),
        reviewCount: fields.number({ label: 'Review Count' }),
        returnRate: fields.number({ label: 'Camper Return Rate (%)' }),
      }
    }),
    socialLinks: fields.object({
      label: 'Social Media Links',
      fields: {
        facebook: fields.url({ label: 'Facebook URL' }),
        instagram: fields.url({ label: 'Instagram URL' }),
        youtube: fields.url({ label: 'YouTube URL' }),
        instagramHashtag: fields.text({ label: 'Primary Instagram Hashtag' }),
      }
    }),
    contactInfo: fields.object({
      label: 'Contact Information',
      fields: {
        email: fields.text({ label: 'Primary Email' }),
        phone: fields.text({ label: 'Phone Number' }),
        address: fields.text({ label: 'Mailing Address', multiline: true }),
        registrationUrl: fields.url({ label: 'UltraCamp Registration URL' }),
      }
    }),
  }
})
```

```typescript
// Programs Collection
programs: collection({
  label: 'Programs',
  path: 'content/programs/*',
  slugField: 'slug',
  schema: {
    title: fields.text({ label: 'Program Name', validation: { isRequired: true } }),
    slug: fields.text({ label: 'URL Slug', validation: { isRequired: true } }),
    ageRange: fields.text({ label: 'Age Range (e.g., "Grades 6-8")' }),
    shortDescription: fields.text({ label: 'Short Description (for cards)', multiline: true, validation: { length: { max: 150 } } }),
    heroImage: fields.image({ label: 'Hero Image', directory: 'public/images/programs' }),
    features: fields.array(
      fields.text({ label: 'Feature' }),
      { label: 'Key Features', itemLabel: (props) => props.value }
    ),
    showOnHomepage: fields.checkbox({ label: 'Show on Homepage', defaultValue: true }),
  }
})
```

### Content Sections (HTML Structure)

1. **Trust Bar** (`<section class="trust-bar">`)
   - Keystatic: `siteSettings.trustBarStats`
   - Sticky on mobile (<768px)
   - Fields: ACA badge, family count, founding year, rating, return rate

2. **Hero Section** (`<section class="hero">`)
   - Keystatic: `siteSettings.heroVideo`, `siteSettings.tagline`
   - Video background (fallback to image)
   - Overlay: Logo + tagline + primary CTA
   - Scroll indicator for mobile UX

3. **Mission Section** (`<section class="mission-section">`)
   - Keystatic: `siteSettings.missionStatement`
   - Background photo with dark overlay
   - Handwritten kicker: "Our Mission"

4. **Program Cards** (`<section class="programs">`)
   - Keystatic: Query `programs` where `showOnHomepage = true`
   - Grid layout (2 columns desktop, 1 column mobile)
   - Each card: Image, title, age range, features list, CTA

5. **Video Testimonials** (`<section class="testimonials">`)
   - Keystatic: `testimonials` collection (future implementation)
   - Placeholder for lite-youtube-embed integration
   - 2-column grid (parent + camper testimonials)

6. **Photo Gallery** (`<section class="gallery-section">`)
   - Keystatic: `mediaGallery` collection filtered by `type: 'homepage'`
   - Masonry grid (3 columns desktop, 2 tablet, 1 mobile)
   - Lightbox on click (PhotoSwipe integration)

7. **Instagram Feed** (`<section class="instagram-feed">`)
   - Keystatic: `siteSettings.socialLinks.instagramHashtag`
   - API integration: Instagram Basic Display API
   - 6-item grid with "View on Instagram" CTAs

8. **Contact Section** (`<section class="contact-section">`)
   - Keystatic: `siteSettings.contactInfo`
   - Dual CTA: "Email Us" + "View Programs"

### Mobile-Specific Features

- **Sticky CTA Bar** (`<div class="sticky-cta-mobile">`)
  - Appears after scrolling 50% past hero
  - Dual buttons: "Register Now" + "Find Your Week"
  - Fixed bottom position, z-index: 1000

### Accessibility Requirements

- WCAG AA minimum (4.5:1 contrast ratios)
- Skip link to main content
- Semantic HTML5 landmarks (`<main>`, `<nav>`, `<section>`)
- ARIA labels for icon-only buttons
- Alt text for all images (stored in Keystatic `image` field)

---

## 2. Program Page Template

### Purpose
Convert interested parents into registrants by answering: "Is this right for my child?" and "What's included?" and "How do I sign up?"

### Example Pages
- `/summer-camp/jr-high`
- `/summer-camp/high-school`
- `/leaders-in-training`
- `/retreats/church-groups`
- `/rentals`

### Keystatic Schema

```typescript
programs: collection({
  label: 'Programs',
  path: 'content/programs/*',
  slugField: 'slug',
  schema: {
    title: fields.text({ label: 'Program Name' }),
    slug: fields.text({ label: 'URL Slug' }),
    ageRange: fields.text({ label: 'Age Range' }),

    // Hero Section
    heroImage: fields.image({ label: 'Hero Image', directory: 'public/images/programs' }),
    heroTagline: fields.text({ label: 'Hero Tagline (optional)' }),

    // Overview
    shortDescription: fields.text({ label: 'Short Description', multiline: true }),
    longDescription: fields.document({
      label: 'Full Description',
      formatting: true,
      links: true,
      images: { directory: 'public/images/programs', publicPath: '/images/programs/' }
    }),

    // Program Details
    features: fields.array(
      fields.object({
        title: fields.text({ label: 'Feature Title' }),
        description: fields.text({ label: 'Feature Description', multiline: true }),
        icon: fields.text({ label: 'Icon Name (optional)' }),
      }),
      { label: 'Key Features' }
    ),

    // Dates & Pricing
    dates: fields.array(
      fields.object({
        sessionName: fields.text({ label: 'Session Name (e.g., "Week 1")' }),
        startDate: fields.date({ label: 'Start Date' }),
        endDate: fields.date({ label: 'End Date' }),
        pricing: fields.number({ label: 'Price ($)' }),
        depositAmount: fields.number({ label: 'Deposit Amount ($)' }),
        status: fields.select({
          label: 'Registration Status',
          options: [
            { label: 'Open', value: 'open' },
            { label: 'Limited Spots', value: 'limited' },
            { label: 'Waitlist', value: 'waitlist' },
            { label: 'Closed', value: 'closed' },
          ],
          defaultValue: 'open',
        }),
      }),
      { label: 'Sessions & Dates' }
    ),

    // What to Bring
    packingList: fields.array(
      fields.object({
        category: fields.text({ label: 'Category (e.g., "Clothing")' }),
        items: fields.array(
          fields.text({ label: 'Item' }),
          { label: 'Items', itemLabel: (props) => props.value }
        ),
      }),
      { label: 'Packing List' }
    ),

    // Photo Gallery
    gallery: fields.array(
      fields.object({
        image: fields.image({ label: 'Image', directory: 'public/images/programs' }),
        alt: fields.text({ label: 'Alt Text' }),
        caption: fields.text({ label: 'Caption (optional)' }),
      }),
      { label: 'Photo Gallery' }
    ),

    // FAQ
    faqs: fields.array(
      fields.object({
        question: fields.text({ label: 'Question' }),
        answer: fields.document({ label: 'Answer', formatting: true }),
      }),
      { label: 'Frequently Asked Questions' }
    ),

    // CTA
    registrationUrl: fields.url({ label: 'Registration URL (UltraCamp link)' }),
    showOnHomepage: fields.checkbox({ label: 'Show on Homepage' }),
  }
})
```

### Content Sections

1. **Hero Section**
   - Full-width background image
   - Overlaid: Program name, age range, tagline
   - Primary CTA: "Register Now"

2. **Overview Section**
   - Short description + long description (rich text)
   - Dual CTA: "See Dates & Pricing" + "Download Packing List"

3. **Key Features Grid**
   - 3-column layout (2 mobile)
   - Icon + title + description per feature
   - Examples: "Identity formation in Christ," "Peer community," "Faith exploration"

4. **Dates & Pricing Table**
   - Responsive table: Session | Dates | Price | Deposit | Status
   - Status badges: "Open" (green), "Limited Spots" (yellow), "Waitlist" (orange), "Closed" (gray)
   - CTA per row: "Register for Week 1"

5. **Photo Gallery**
   - Masonry grid
   - Lightbox on click
   - Captions display in lightbox

6. **What to Bring Section**
   - Collapsible accordion per category
   - Downloadable PDF option (future implementation)

7. **FAQ Section**
   - Collapsible accordion
   - Questions: "What if my child has dietary restrictions?", "Is there cell phone access?", etc.

8. **Final CTA Section**
   - Large, centered CTA: "Ready to Register?"
   - Secondary link: "Have more questions? Contact us"

---

## 3. Facility Page Template

### Purpose
Showcase camp facilities for retreat planners and potential camper parents evaluating safety/quality.

### Example Pages
- `/facilities/cabins`
- `/facilities/chapel`
- `/facilities/dining-hall`
- `/facilities/gym`
- `/facilities/outdoor-spaces`

### Keystatic Schema

```typescript
facilities: collection({
  label: 'Facilities',
  path: 'content/facilities/*',
  slugField: 'slug',
  schema: {
    title: fields.text({ label: 'Facility Name' }),
    slug: fields.text({ label: 'URL Slug' }),

    heroImage: fields.image({ label: 'Hero Image', directory: 'public/images/facilities' }),

    description: fields.document({
      label: 'Description',
      formatting: true,
      links: true,
    }),

    specifications: fields.array(
      fields.object({
        label: fields.text({ label: 'Spec Label (e.g., "Capacity")' }),
        value: fields.text({ label: 'Spec Value (e.g., "120 people")' }),
      }),
      { label: 'Specifications' }
    ),

    gallery: fields.array(
      fields.object({
        image: fields.image({ label: 'Image', directory: 'public/images/facilities' }),
        alt: fields.text({ label: 'Alt Text' }),
        caption: fields.text({ label: 'Caption (optional)' }),
      }),
      { label: 'Photo Gallery' }
    ),

    amenities: fields.array(
      fields.text({ label: 'Amenity' }),
      { label: 'Amenities', itemLabel: (props) => props.value }
    ),

    relatedPages: fields.array(
      fields.relationship({
        label: 'Related Page',
        collection: 'pages',
      }),
      { label: 'Related Pages (e.g., Rentals)' }
    ),
  }
})
```

### Content Sections

1. **Hero Section**
   - Full-width facility image
   - Facility name overlaid

2. **Overview Section**
   - Description paragraph
   - Specifications grid (capacity, dimensions, features)

3. **Photo Gallery**
   - 4-6 images in grid
   - Lightbox on click

4. **Amenities List**
   - Checklist-style display
   - Icons for visual scanning

5. **Related CTAs**
   - "Book this facility for your retreat"
   - "Explore other facilities"

---

## 4. Standard Page Template

### Purpose
Flexible template for static content pages (About, FAQ, Health Updates, Wish List, etc.)

### Example Pages
- `/about`
- `/faq`
- `/what-to-bring`
- `/current-health-updates`
- `/wish-list`
- `/financial-partnerships`

### Keystatic Schema

```typescript
pages: collection({
  label: 'Pages',
  path: 'content/pages/*',
  slugField: 'slug',
  schema: {
    title: fields.text({ label: 'Page Title' }),
    slug: fields.text({ label: 'URL Slug' }),

    heroImage: fields.image({
      label: 'Hero Image (optional)',
      directory: 'public/images/pages',
    }),

    heroTagline: fields.text({ label: 'Hero Tagline (optional)' }),

    showInNav: fields.checkbox({ label: 'Show in Main Navigation', defaultValue: false }),
    navOrder: fields.number({ label: 'Navigation Order (if shown)' }),

    content: fields.document({
      label: 'Page Content',
      formatting: {
        inlineMarks: { bold: true, italic: true, underline: true, strikethrough: true },
        listTypes: { ordered: true, unordered: true },
        headingLevels: [2, 3, 4],
        blockTypes: { blockquote: true },
      },
      links: true,
      images: {
        directory: 'public/images/pages',
        publicPath: '/images/pages/',
      },
      componentBlocks: {
        callToAction: {
          label: 'Call to Action',
          schema: {
            text: fields.text({ label: 'Button Text' }),
            url: fields.url({ label: 'Button URL' }),
            style: fields.select({
              label: 'Button Style',
              options: [
                { label: 'Primary', value: 'primary' },
                { label: 'Secondary', value: 'secondary' },
                { label: 'Tertiary', value: 'tertiary' },
              ],
              defaultValue: 'primary',
            }),
          },
        },
        gallery: {
          label: 'Photo Gallery',
          schema: {
            images: fields.array(
              fields.object({
                image: fields.image({ label: 'Image', directory: 'public/images/pages' }),
                alt: fields.text({ label: 'Alt Text' }),
                caption: fields.text({ label: 'Caption (optional)' }),
              }),
              { label: 'Images' }
            ),
          },
        },
        videoEmbed: {
          label: 'Video Embed',
          schema: {
            youtubeId: fields.text({ label: 'YouTube Video ID' }),
            caption: fields.text({ label: 'Caption (optional)' }),
          },
        },
      },
    }),

    seo: fields.object({
      label: 'SEO Settings',
      fields: {
        metaDescription: fields.text({ label: 'Meta Description', multiline: true, validation: { length: { max: 160 } } }),
        keywords: fields.array(
          fields.text({ label: 'Keyword' }),
          { label: 'Keywords' }
        ),
      }
    }),
  }
})
```

### Content Sections

1. **Hero Section (optional)**
   - If `heroImage` exists: full-width image with title overlay
   - If no image: simple page header with title

2. **Main Content**
   - Rich text content rendered from `content` field
   - Supports embedded component blocks (CTA, gallery, video)

3. **Related Links Section (optional)**
   - Manually defined in page content or auto-generated

---

## 5. Event/Retreat Page Template

### Purpose
Promote special events and retreat packages for church groups, adults, families.

### Example Pages
- `/events/anchored`
- `/events/breathe`
- `/events/defrost`

### Keystatic Schema

```typescript
events: collection({
  label: 'Events',
  path: 'content/events/*',
  slugField: 'slug',
  schema: {
    title: fields.text({ label: 'Event Name' }),
    slug: fields.text({ label: 'URL Slug' }),

    eventType: fields.select({
      label: 'Event Type',
      options: [
        { label: 'Retreat', value: 'retreat' },
        { label: 'Special Event', value: 'special-event' },
        { label: 'Seasonal Program', value: 'seasonal' },
      ],
      defaultValue: 'retreat',
    }),

    heroImage: fields.image({ label: 'Hero Image', directory: 'public/images/events' }),

    description: fields.document({ label: 'Description', formatting: true }),

    date: fields.date({ label: 'Event Date' }),
    registrationDeadline: fields.date({ label: 'Registration Deadline' }),

    pricing: fields.object({
      label: 'Pricing',
      fields: {
        individual: fields.number({ label: 'Individual Price ($)' }),
        group: fields.number({ label: 'Group Price ($ per person)' }),
        deposit: fields.number({ label: 'Deposit Required ($)' }),
      }
    }),

    schedule: fields.array(
      fields.object({
        time: fields.text({ label: 'Time' }),
        activity: fields.text({ label: 'Activity' }),
      }),
      { label: 'Event Schedule' }
    ),

    registrationUrl: fields.url({ label: 'Registration URL' }),
  }
})
```

### Content Sections

1. **Hero Section**
   - Event branding image
   - Event name + date

2. **Overview Section**
   - Description
   - Key details (date, pricing, registration deadline)

3. **Schedule Timeline**
   - Vertical timeline design
   - Time + activity pairs

4. **Gallery Section**
   - Photos from previous year's event

5. **CTA Section**
   - "Register Now" + "Download Info Packet"

---

## 6. Staff/Employment Page Template

### Purpose
Recruit summer staff and year-round employees by showcasing team culture and application process.

### Example Pages
- `/summer-staff`
- `/work-at-camp`

### Keystatic Schema

```typescript
jobPostings: collection({
  label: 'Job Postings',
  path: 'content/jobs/*',
  slugField: 'slug',
  schema: {
    title: fields.text({ label: 'Job Title' }),
    slug: fields.text({ label: 'URL Slug' }),

    jobType: fields.select({
      label: 'Job Type',
      options: [
        { label: 'Summer Staff', value: 'summer' },
        { label: 'Year-Round', value: 'year-round' },
        { label: 'Seasonal', value: 'seasonal' },
      ],
      defaultValue: 'summer',
    }),

    description: fields.document({ label: 'Job Description', formatting: true }),

    requirements: fields.array(
      fields.text({ label: 'Requirement' }),
      { label: 'Requirements', itemLabel: (props) => props.value }
    ),

    benefits: fields.array(
      fields.text({ label: 'Benefit' }),
      { label: 'Benefits', itemLabel: (props) => props.value }
    ),

    applicationUrl: fields.url({ label: 'Application URL' }),

    isActive: fields.checkbox({ label: 'Currently Hiring', defaultValue: true }),
  }
})
```

```typescript
staffMembers: collection({
  label: 'Staff Members',
  path: 'content/staff/*',
  slugField: 'slug',
  schema: {
    name: fields.text({ label: 'Name' }),
    slug: fields.text({ label: 'URL Slug' }),
    role: fields.text({ label: 'Role/Title' }),

    headshot: fields.image({
      label: 'Headshot',
      directory: 'public/images/staff',
    }),

    bio: fields.document({ label: 'Bio', formatting: true }),

    testimonial: fields.text({
      label: 'Staff Testimonial (optional)',
      multiline: true,
    }),

    showOnStaffPage: fields.checkbox({ label: 'Show on Staff Page', defaultValue: true }),
  }
})
```

### Content Sections

1. **Hero Section**
   - Staff group photo
   - Headline: "Join Our Team"

2. **Why Work at Camp Section**
   - Benefits list (stipend, housing, community, faith growth)

3. **Open Positions Grid**
   - Job cards with: Title, type, summary, "Apply Now" CTA

4. **Staff Testimonials**
   - 2-3 quotes from current/former staff
   - Headshots + names + roles

5. **Application Process Timeline**
   - Step-by-step: Apply → Interview → Onboarding → Training → Summer

6. **CTA Section**
   - "Submit Application" + "Questions? Contact Us"

---

## 7. Contact Page Template

### Purpose
Provide multiple contact methods (email, phone, form, map) to reduce barriers to inquiry.

### Keystatic Schema

Uses `siteSettings` singleton for contact info. No separate collection needed.

### Content Sections

1. **Hero Section**
   - Simple header: "Get In Touch"

2. **Contact Methods Grid**
   - Email, phone, mailing address
   - Social media links

3. **Contact Form** (future implementation)
   - Name, email, phone, message fields
   - Subject dropdown: "Summer Camp," "Retreats," "Employment," "General"

4. **Map Section**
   - Embedded Google Map showing camp location
   - Driving directions link

5. **FAQ Callout**
   - "Have a question? Check our FAQ first"

---

## Component Reuse Strategy

### Shared Components (Next.js)

```
src/components/
  layout/
    Header.tsx              → Site header with navigation
    Footer.tsx              → Site footer with links/contact
    MobileStickyCTA.tsx     → Sticky registration CTA (mobile-only)
    TrustBar.tsx            → Trust signals bar (homepage + program pages)

  sections/
    Hero.tsx                → Reusable hero section
    ProgramCard.tsx         → Program card for grids
    PhotoGallery.tsx        → Gallery with lightbox
    TestimonialCard.tsx     → Testimonial display
    FAQ.tsx                 → Collapsible FAQ accordion
    CTA.tsx                 → Call-to-action button/section

  ui/
    Button.tsx              → Styled button component
    Badge.tsx               → Status badges ("Open," "Waitlist")
    Icon.tsx                → Icon wrapper (Lucide icons)
```

### Design Pattern Library

#### Buttons

```css
/* Primary CTA - Forest Green */
.cta-primary {
  background: #2F4F3D;
  color: #F5F0E8;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-weight: 600;
}

/* Secondary CTA - Clay */
.cta-secondary {
  background: #A07856;
  color: #F5F0E8;
}

/* Tertiary CTA - Outline */
.cta-tertiary {
  background: transparent;
  color: #4A7A9E;
  border: 2px solid #4A7A9E;
}
```

#### Cards

```css
.program-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.program-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}
```

#### Typography

```css
/* Headings - Bark color (#5A4A3A) */
h1 { font-size: 3rem; font-weight: 700; }
h2 { font-size: 2.25rem; font-weight: 600; }
h3 { font-size: 1.5rem; font-weight: 600; }

/* Handwritten accent - Caveat font */
.handwritten {
  font-family: 'Caveat', cursive;
  color: #A07856; /* Clay */
  font-size: 1.75rem;
}
```

---

## WordPress to Keystatic Field Mapping

### WordPress Post Meta → Keystatic Fields

| WordPress Field | Keystatic Collection | Keystatic Field | Notes |
|----------------|---------------------|----------------|-------|
| `post_title` | All collections | `title` | Direct mapping |
| `post_name` (slug) | All collections | `slug` | URL-safe slug |
| `post_content` | `pages`, `programs` | `content` or `description` | Rich text document |
| `post_excerpt` | `programs` | `shortDescription` | Card summaries |
| `_thumbnail_id` (featured image) | All collections | `heroImage` | Image field |
| Custom field: `age_range` | `programs` | `ageRange` | Text field |
| Custom field: `event_date` | `events` | `date` | Date field |
| ACF Gallery | `facilities`, `programs` | `gallery` | Array of image objects |

### Example Migration Script (Pseudocode)

```javascript
// migrate-wordpress-to-keystatic.js
import { createReader } from '@keystatic/core/reader';

async function migratePrograms(wordpressPages) {
  const programPages = wordpressPages.filter(p => p.slug.includes('summer-camp'));

  for (const wpPage of programPages) {
    const keystatic Entry = {
      title: wpPage.post_title,
      slug: wpPage.post_name,
      ageRange: wpPage.meta.age_range || '',
      heroImage: await downloadImage(wpPage._thumbnail_id),
      shortDescription: wpPage.post_excerpt,
      longDescription: convertHtmlToMarkdown(wpPage.post_content),
      features: extractFeatures(wpPage.post_content),
      gallery: await migrateGallery(wpPage.meta.gallery_images),
    };

    await saveKeystatic Entry('programs', keystatic Entry);
  }
}
```

---

## Responsive Design Strategy

### Breakpoints

```css
/* Mobile-first approach */
:root {
  --breakpoint-sm: 640px;   /* Small devices */
  --breakpoint-md: 768px;   /* Tablets */
  --breakpoint-lg: 1024px;  /* Desktops */
  --breakpoint-xl: 1280px;  /* Large desktops */
}
```

### Mobile-Specific Patterns

1. **Hamburger Navigation**
   - Visible <768px
   - Slide-out drawer from right
   - Full-screen overlay

2. **Sticky Trust Bar**
   - Fixed top position on mobile
   - Horizontal scroll for overflow items

3. **Single-Column Layouts**
   - Program grids: 2-column desktop → 1-column mobile
   - Gallery: 3-column → 2-column tablet → 1-column mobile

4. **Touch-Friendly CTAs**
   - Minimum 44x44px tap targets
   - Increased padding on mobile

---

## Performance Requirements

### Core Web Vitals Targets

- **Largest Contentful Paint (LCP):** <2.5s
- **First Input Delay (FID):** <100ms
- **Cumulative Layout Shift (CLS):** <0.1

### Image Optimization

```typescript
// next.config.js
module.exports = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
}
```

### Lazy Loading Strategy

- Hero images: `priority` (eager load)
- Above-the-fold content: `priority`
- Below-the-fold images: `loading="lazy"`
- Instagram feed: Intersection Observer trigger

---

## SEO & Metadata Strategy

### Per-Page Metadata

```typescript
// app/[slug]/page.tsx
export async function generateMetadata({ params }) {
  const page = await getPage(params.slug);

  return {
    title: `${page.title} | Bear Lake Camp`,
    description: page.seo.metaDescription || page.shortDescription,
    keywords: page.seo.keywords,
    openGraph: {
      title: page.title,
      description: page.seo.metaDescription,
      images: [page.heroImage],
      url: `https://bearlakecamp.com/${page.slug}`,
    },
  };
}
```

### Structured Data (Schema.org)

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Bear Lake Camp",
  "url": "https://bearlakecamp.com",
  "logo": "https://bearlakecamp.com/images/logo.png",
  "foundingDate": "1948",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "[Address from Keystatic]",
    "addressLocality": "[City]",
    "addressRegion": "[State]",
    "postalCode": "[ZIP]"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "137"
  }
}
```

---

## Implementation Phases

### Phase 1: P0 Templates (Weeks 1-2)
- Homepage
- Program Page (Jr. High, High School)
- Contact Page

**Deliverables:** 3 functional pages with Keystatic integration

### Phase 2: P1 Templates (Weeks 3-4)
- Standard Page (About, FAQ, What to Bring)
- Facility Page (5 facility pages)
- Event/Retreat Page (Anchored, Breathe, Defrost)

**Deliverables:** +13 pages migrated

### Phase 3: P1 Templates (Week 5)
- Staff/Employment Pages
- Remaining Standard Pages

**Deliverables:** All 31 pages migrated

### Phase 4: Enhancements (Week 6+)
- Contact form integration
- Instagram API integration
- Video testimonial embedding
- Admin training

---

## Success Metrics

### Content Management
- **Ease of editing:** Non-technical staff can update content without developer assistance
- **Publish speed:** <5 minutes from edit to live (Keystatic + Vercel deploy)

### Performance
- **PageSpeed score:** 90+ mobile, 95+ desktop
- **Load time:** <2.5s LCP on 3G connection

### Conversion
- **Registration click-through:** Baseline + track improvement
- **Contact form submissions:** Baseline + track improvement

---

## Appendix: Keystatic Configuration Files

### Complete keystatic.config.ts

```typescript
import { config, collection, singleton, fields } from '@keystatic/core';

export default config({
  storage: {
    kind: 'github',
    repo: 'bearlakecamp/website',
  },

  singletons: {
    siteSettings: singleton({
      label: 'Site Settings',
      path: 'content/site-settings',
      schema: {
        // [Full schema from Section 1]
      }
    }),
  },

  collections: {
    pages: collection({
      label: 'Pages',
      path: 'content/pages/*',
      slugField: 'slug',
      schema: {
        // [Full schema from Section 4]
      }
    }),

    programs: collection({
      label: 'Programs',
      path: 'content/programs/*',
      slugField: 'slug',
      schema: {
        // [Full schema from Section 2]
      }
    }),

    facilities: collection({
      label: 'Facilities',
      path: 'content/facilities/*',
      slugField: 'slug',
      schema: {
        // [Full schema from Section 3]
      }
    }),

    events: collection({
      label: 'Events',
      path: 'content/events/*',
      slugField: 'slug',
      schema: {
        // [Full schema from Section 5]
      }
    }),

    jobPostings: collection({
      label: 'Job Postings',
      path: 'content/jobs/*',
      slugField: 'slug',
      schema: {
        // [Full schema from Section 6]
      }
    }),

    staffMembers: collection({
      label: 'Staff Members',
      path: 'content/staff/*',
      slugField: 'slug',
      schema: {
        // [Full schema from Section 6]
      }
    }),
  },
});
```

---

**Document Status:** Draft for client review
**Next Steps:** Create HTML mockups for each template type
**Estimated Implementation:** 6 weeks (3 developers, P0-P1-P2 phasing)
