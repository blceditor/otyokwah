# Keystatic Schema Design Patterns

> Best practices for CMS schema design in Bear Lake Camp

## Basic Collection Structure

### Pattern: Minimal Collection
```typescript
import { config, collection, fields } from '@keystatic/core';

export default config({
  storage: { kind: 'local' }, // or 'github' for production
  collections: {
    pages: collection({
      label: 'Pages',
      slugField: 'title',
      path: 'content/pages/*',
      schema: {
        title: fields.text({ label: 'Title' }),
        content: fields.document({ label: 'Content' }),
      },
    }),
  },
});
```

### Pattern: Full Collection with SEO
```typescript
pages: collection({
  label: 'Pages',
  slugField: 'title',
  path: 'content/pages/*',
  format: { contentField: 'content' },
  schema: {
    // Core fields
    title: fields.text({
      label: 'Title',
      validation: { length: { min: 1, max: 100 } },
    }),
    description: fields.text({
      label: 'Description',
      multiline: true,
    }),

    // SEO fields
    seoTitle: fields.text({
      label: 'SEO Title (optional)',
      description: 'Overrides title for search engines',
    }),
    seoDescription: fields.text({
      label: 'SEO Description',
      multiline: true,
      validation: { length: { max: 160 } },
    }),
    ogImage: fields.image({
      label: 'Open Graph Image',
      directory: 'public/images/og',
      publicPath: '/images/og',
    }),
    noIndex: fields.checkbox({
      label: 'No Index',
      defaultValue: false,
    }),

    // Content
    content: fields.document({
      label: 'Content',
      formatting: true,
      links: true,
      images: true,
    }),
  },
}),
```

## Conditional Fields (Template System)

### Pattern: Page Templates
```typescript
pages: collection({
  schema: {
    title: fields.text({ label: 'Title' }),

    templateFields: fields.conditional(
      fields.select({
        label: 'Template',
        options: [
          { label: 'Standard Page', value: 'standard' },
          { label: 'Homepage', value: 'homepage' },
          { label: 'Program Page', value: 'program' },
          { label: 'Facility Page', value: 'facility' },
        ],
        defaultValue: 'standard',
      }),
      {
        standard: fields.object({
          showSidebar: fields.checkbox({
            label: 'Show Sidebar',
            defaultValue: false,
          }),
        }),

        homepage: fields.object({
          heroImages: fields.array(
            fields.object({
              image: fields.image({
                label: 'Image',
                directory: 'public/images/hero',
                publicPath: '/images/hero',
              }),
              alt: fields.text({ label: 'Alt text' }),
            }),
            {
              label: 'Hero Carousel Images',
              itemLabel: props => props.fields.alt.value || 'Image',
            }
          ),
          galleryImages: fields.array(
            fields.image({ label: 'Gallery Image' }),
            { label: 'Photo Gallery' }
          ),
        }),

        program: fields.object({
          ageRange: fields.text({ label: 'Age Range' }),
          dates: fields.text({ label: 'Session Dates' }),
          pricing: fields.text({ label: 'Pricing' }),
          registrationUrl: fields.text({
            label: 'Registration URL',
            validation: { pattern: /^https?:\/\// },
          }),
        }),

        facility: fields.object({
          capacity: fields.text({ label: 'Capacity' }),
          features: fields.array(
            fields.text({ label: 'Feature' }),
            { label: 'Features List' }
          ),
          photos: fields.array(
            fields.object({
              image: fields.image({ label: 'Photo' }),
              caption: fields.text({ label: 'Caption' }),
            }),
            { label: 'Facility Photos' }
          ),
        }),
      }
    ),

    content: fields.document({ label: 'Content' }),
  },
}),
```

## Singletons

### Pattern: Global Settings
```typescript
export default config({
  singletons: {
    siteSettings: singleton({
      label: 'Site Settings',
      path: 'content/settings/site',
      schema: {
        siteName: fields.text({ label: 'Site Name' }),
        tagline: fields.text({ label: 'Tagline' }),
        contactEmail: fields.text({ label: 'Contact Email' }),
        socialLinks: fields.object({
          facebook: fields.text({ label: 'Facebook URL' }),
          instagram: fields.text({ label: 'Instagram URL' }),
          youtube: fields.text({ label: 'YouTube URL' }),
        }),
      },
    }),

    mission: singleton({
      label: 'Mission Statement',
      path: 'content/settings/mission',
      schema: {
        kicker: fields.text({ label: 'Kicker Text' }),
        statement: fields.text({
          label: 'Mission Statement',
          multiline: true,
        }),
        backgroundImage: fields.image({ label: 'Background Image' }),
      },
    }),

    navigation: singleton({
      label: 'Navigation',
      path: 'content/settings/navigation',
      schema: {
        items: fields.array(
          fields.object({
            label: fields.text({ label: 'Label' }),
            href: fields.text({ label: 'URL' }),
            children: fields.array(
              fields.object({
                label: fields.text({ label: 'Label' }),
                href: fields.text({ label: 'URL' }),
              }),
              { label: 'Dropdown Items' }
            ),
          }),
          { label: 'Navigation Items' }
        ),
        ctaButton: fields.object({
          label: fields.text({ label: 'CTA Label' }),
          href: fields.text({ label: 'CTA URL' }),
        }),
      },
    }),
  },
});
```

## Content Components (Markdoc)

### Pattern: Custom Blocks
```typescript
content: fields.document({
  label: 'Content',
  formatting: true,
  links: true,
  images: true,
  componentBlocks: {
    cta: component({
      label: 'Call to Action',
      schema: {
        text: fields.text({ label: 'Button Text' }),
        href: fields.text({ label: 'URL' }),
        variant: fields.select({
          label: 'Style',
          options: [
            { label: 'Primary', value: 'primary' },
            { label: 'Secondary', value: 'secondary' },
          ],
          defaultValue: 'primary',
        }),
      },
      preview: (props) => (
        <button className={`btn-${props.fields.variant.value}`}>
          {props.fields.text.value}
        </button>
      ),
    }),

    youtube: component({
      label: 'YouTube Video',
      schema: {
        videoId: fields.text({
          label: 'Video ID',
          description: 'The ID from youtube.com/watch?v=VIDEO_ID',
        }),
        title: fields.text({ label: 'Video Title' }),
      },
      preview: (props) => (
        <div className="aspect-video bg-gray-200">
          YouTube: {props.fields.videoId.value}
        </div>
      ),
    }),

    gallery: component({
      label: 'Image Gallery',
      schema: {
        images: fields.array(
          fields.object({
            src: fields.image({ label: 'Image' }),
            alt: fields.text({ label: 'Alt text' }),
          }),
          { label: 'Images' }
        ),
        columns: fields.select({
          label: 'Columns',
          options: [
            { label: '2 Columns', value: '2' },
            { label: '3 Columns', value: '3' },
            { label: '4 Columns', value: '4' },
          ],
          defaultValue: '3',
        }),
      },
    }),
  },
}),
```

## Bear Lake Camp Schema Patterns

### Current Collections
```typescript
// keystatic.config.ts structure
collections: {
  pages: collection({
    // Dynamic pages with 5 template types
    // Uses conditional templateFields
  }),
  staff: collection({
    // Staff directory
    // name, role, bio, photo
  }),
},

singletons: {
  mission: singleton({
    // Homepage mission section
  }),
  siteNavigation: singleton({
    // Main navigation structure
  }),
},
```

### Reader API Usage
```typescript
// lib/keystatic-reader.ts
import { createReader } from '@keystatic/core/reader';
import keystaticConfig from '../keystatic.config';

export const reader = createReader(process.cwd(), keystaticConfig);

// Usage in Server Components
const pages = await reader.collections.pages.all();
const page = await reader.collections.pages.read('about');
const mission = await reader.singletons.mission.read();
```

## Checklist

- [ ] Collections have descriptive labels
- [ ] Slug field configured (or using default title)
- [ ] Path matches content directory structure
- [ ] Required fields have validation
- [ ] SEO fields included for public pages
- [ ] Images specify directory and publicPath
- [ ] Conditional fields use fields.conditional()
- [ ] Arrays have itemLabel for better UX

## Antipatterns to Avoid

### Don't: Deep Nesting
```typescript
// BAD - Too deeply nested
schema: {
  level1: fields.object({
    level2: fields.object({
      level3: fields.object({
        level4: fields.object({
          value: fields.text({}), // Hard to access
        }),
      }),
    }),
  }),
}

// GOOD - Flat structure
schema: {
  section1Value: fields.text({}),
  section2Value: fields.text({}),
}
```

### Don't: Forget Image Paths
```typescript
// BAD - No directory/publicPath
heroImage: fields.image({ label: 'Hero' })

// GOOD - Explicit paths
heroImage: fields.image({
  label: 'Hero',
  directory: 'public/images/hero',
  publicPath: '/images/hero',
})
```

### Don't: Inconsistent Naming
```typescript
// BAD - Mixed conventions
schema: {
  page_title: fields.text({}),
  PageDescription: fields.text({}),
  'content-body': fields.document({}),
}

// GOOD - Consistent camelCase
schema: {
  pageTitle: fields.text({}),
  pageDescription: fields.text({}),
  contentBody: fields.document({}),
}
```

---

**Last Updated**: 2025-12-11
**Used By**: keystatic-specialist
