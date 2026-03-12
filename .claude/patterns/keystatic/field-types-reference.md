# Keystatic Field Types Reference

> Complete reference for all Keystatic field types

## Text Fields

### fields.text()
```typescript
// Basic text
title: fields.text({ label: 'Title' })

// With validation
title: fields.text({
  label: 'Title',
  description: 'Page title shown in navigation',
  validation: {
    length: { min: 1, max: 100 }
  },
})

// Multiline text
description: fields.text({
  label: 'Description',
  multiline: true,
  validation: { length: { max: 500 } },
})
```

### fields.slug()
```typescript
// URL-safe identifier
slug: fields.slug({
  name: {
    label: 'Slug',
    description: 'URL-friendly identifier',
  },
})
```

## Selection Fields

### fields.select()
```typescript
// Single selection
status: fields.select({
  label: 'Status',
  options: [
    { label: 'Draft', value: 'draft' },
    { label: 'Published', value: 'published' },
    { label: 'Archived', value: 'archived' },
  ],
  defaultValue: 'draft',
})

// With description
template: fields.select({
  label: 'Page Template',
  description: 'Choose the layout for this page',
  options: [
    { label: 'Standard Page', value: 'standard' },
    { label: 'Homepage', value: 'homepage' },
  ],
  defaultValue: 'standard',
})
```

### fields.checkbox()
```typescript
// Boolean toggle
published: fields.checkbox({
  label: 'Published',
  description: 'Make this page visible on the site',
  defaultValue: false,
})

// Feature flag
showSidebar: fields.checkbox({
  label: 'Show Sidebar',
  defaultValue: true,
})
```

### fields.multiselect()
```typescript
// Multiple selections
tags: fields.multiselect({
  label: 'Tags',
  options: [
    { label: 'Summer Camp', value: 'summer-camp' },
    { label: 'Youth Group', value: 'youth-group' },
    { label: 'Retreat', value: 'retreat' },
  ],
})
```

## Media Fields

### fields.image()
```typescript
// Basic image
photo: fields.image({ label: 'Photo' })

// With directory configuration
heroImage: fields.image({
  label: 'Hero Image',
  directory: 'public/images/hero',
  publicPath: '/images/hero',
})

// With validation
staffPhoto: fields.image({
  label: 'Staff Photo',
  directory: 'public/images/staff',
  publicPath: '/images/staff',
  validation: {
    isRequired: true,
  },
})
```

### fields.file()
```typescript
// File upload
document: fields.file({
  label: 'Document',
  directory: 'public/files',
  publicPath: '/files',
})
```

## Content Fields

### fields.document()
```typescript
// Basic rich text
content: fields.document({
  label: 'Content',
})

// Full-featured editor
content: fields.document({
  label: 'Content',
  formatting: true,      // Bold, italic, etc.
  links: true,          // Link insertion
  images: true,         // Inline images
  dividers: true,       // Horizontal rules
  tables: true,         // Tables
  layouts: [            // Column layouts
    [1, 1],             // 2 equal columns
    [1, 1, 1],          // 3 equal columns
    [2, 1],             // 2:1 ratio
  ],
})

// With component blocks
content: fields.document({
  label: 'Content',
  componentBlocks: {
    cta: component({...}),
    youtube: component({...}),
  },
})
```

### fields.markdoc()
```typescript
// Markdoc content (advanced)
content: fields.markdoc({
  label: 'Content',
  options: {
    image: {
      directory: 'public/images/content',
      publicPath: '/images/content',
    },
  },
})
```

## Structured Fields

### fields.array()
```typescript
// Simple array
tags: fields.array(
  fields.text({ label: 'Tag' }),
  { label: 'Tags' }
)

// Array of objects
testimonials: fields.array(
  fields.object({
    quote: fields.text({ label: 'Quote', multiline: true }),
    author: fields.text({ label: 'Author' }),
    role: fields.text({ label: 'Role' }),
  }),
  {
    label: 'Testimonials',
    itemLabel: props => props.fields.author.value || 'Testimonial',
  }
)

// Array of images
gallery: fields.array(
  fields.object({
    image: fields.image({ label: 'Image' }),
    alt: fields.text({ label: 'Alt text' }),
    caption: fields.text({ label: 'Caption', multiline: true }),
  }),
  {
    label: 'Gallery Images',
    itemLabel: props => props.fields.alt.value || 'Image',
  }
)
```

### fields.object()
```typescript
// Grouped fields
author: fields.object({
  name: fields.text({ label: 'Name' }),
  email: fields.text({ label: 'Email' }),
  bio: fields.text({ label: 'Bio', multiline: true }),
  photo: fields.image({ label: 'Photo' }),
})

// Nested objects
socialLinks: fields.object({
  facebook: fields.text({ label: 'Facebook URL' }),
  instagram: fields.text({ label: 'Instagram URL' }),
  twitter: fields.text({ label: 'Twitter URL' }),
  youtube: fields.text({ label: 'YouTube URL' }),
})
```

## Relationship Fields

### fields.relationship()
```typescript
// Single relationship
category: fields.relationship({
  label: 'Category',
  collection: 'categories',
})

// With validation
author: fields.relationship({
  label: 'Author',
  collection: 'staff',
  validation: { isRequired: true },
})
```

## Conditional Fields

### fields.conditional()
```typescript
// Template system
templateFields: fields.conditional(
  fields.select({
    label: 'Template',
    options: [
      { label: 'Standard', value: 'standard' },
      { label: 'Homepage', value: 'homepage' },
    ],
    defaultValue: 'standard',
  }),
  {
    standard: fields.object({
      showSidebar: fields.checkbox({ label: 'Show Sidebar' }),
    }),
    homepage: fields.object({
      heroImages: fields.array(
        fields.image({ label: 'Hero Image' }),
        { label: 'Hero Carousel' }
      ),
    }),
  }
)
```

## Date & Time Fields

### fields.date()
```typescript
// Date picker
publishedDate: fields.date({
  label: 'Published Date',
})

// With default
eventDate: fields.date({
  label: 'Event Date',
  defaultValue: { kind: 'today' },
})
```

### fields.datetime()
```typescript
// Date and time
eventDateTime: fields.datetime({
  label: 'Event Date & Time',
})
```

## Utility Fields

### fields.integer()
```typescript
// Whole numbers
order: fields.integer({
  label: 'Sort Order',
  defaultValue: 0,
})

capacity: fields.integer({
  label: 'Capacity',
  validation: { min: 1, max: 500 },
})
```

### fields.number()
```typescript
// Decimal numbers
price: fields.number({
  label: 'Price',
  validation: { min: 0 },
})
```

### fields.url()
```typescript
// URL with validation
website: fields.url({
  label: 'Website URL',
})

registrationLink: fields.url({
  label: 'Registration URL',
  validation: { isRequired: true },
})
```

### fields.pathReference()
```typescript
// Reference to file path
linkedPage: fields.pathReference({
  label: 'Linked Page',
  pattern: 'content/pages/*',
})
```

## Bear Lake Camp Field Patterns

### SEO Fields Group
```typescript
// Standard SEO fields for all pages
seoTitle: fields.text({
  label: 'SEO Title',
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
```

### CTA Button Fields
```typescript
// Reusable CTA pattern
ctaButton: fields.object({
  text: fields.text({ label: 'Button Text' }),
  href: fields.text({ label: 'Button URL' }),
  variant: fields.select({
    label: 'Style',
    options: [
      { label: 'Primary', value: 'primary' },
      { label: 'Secondary', value: 'secondary' },
      { label: 'Outline', value: 'outline' },
    ],
    defaultValue: 'primary',
  }),
  newTab: fields.checkbox({
    label: 'Open in new tab',
    defaultValue: false,
  }),
}),
```

## Checklist

- [ ] All fields have descriptive labels
- [ ] Validation specified for required fields
- [ ] Default values set where appropriate
- [ ] Description provided for complex fields
- [ ] Images have directory and publicPath
- [ ] Arrays have itemLabel for better UX
- [ ] Select options have clear labels

---

**Last Updated**: 2025-12-11
**Used By**: keystatic-specialist
