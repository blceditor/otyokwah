# InfoCard Component - ReactMarkdown Syntax

## Overview

The InfoCard component now works seamlessly with ReactMarkdown by detecting a special `info-card-grid` container pattern in markdown files.

## Syntax for Content Authors

Wrap heading + list pairs inside a `<div class="info-card-grid">` container:

```markdown
<div class="info-card-grid">

## Card Title {icon="IconName"}

- First bullet point
- Second bullet point
- Third bullet point

## Another Card {icon="AnotherIcon"}

- More content
- Additional points

</div>
```

## Features

1. **Icon Support**: Add `{icon="IconName"}` after the heading to display a Lucide icon
2. **Responsive Grid**: Automatically displays as 1 column (mobile), 2 columns (tablet), 3 columns (desktop)
3. **Multiple Cards**: Place multiple heading+list pairs in the same container
4. **Optional Icons**: Icons are optional - cards work fine without them
5. **Markdown in Lists**: List items support **bold**, *italic*, and other markdown formatting

## Available Icons

Any Lucide React icon name works. Common examples:
- `Heart` - Love/passion
- `Users` - Community/people
- `Cross` - Faith/Christianity
- `Mountain` - Nature/outdoors
- `DollarSign` - Money/giving
- `Home` - Facilities/buildings
- `Award` - Achievement/excellence
- `Star` - Featured/important

Full list: https://lucide.dev/icons/

## Examples

### Single Card with Icon

```markdown
<div class="info-card-grid">

## Why Work at Camp? {icon="Heart"}

- Ministry experience and leadership development
- Spiritual growth in a faith community
- Lifelong friendships with fellow staff
- Beautiful outdoor setting
- Make an eternal impact

</div>
```

### Multiple Cards (Grid Layout)

```markdown
<div class="info-card-grid">

## Christ-Centered {icon="Cross"}

- Jesus at the center of everything
- Biblical teaching and worship
- Gospel-focused ministry
- Prayer and spiritual growth

## Community {icon="Users"}

- Build lasting friendships
- Support and encouragement
- Authentic relationships
- Serving one another

## Creation {icon="Mountain"}

- Celebrate God's creation
- Beautiful lakeside setting
- Adventure and exploration
- Environmental stewardship

</div>
```

### Cards Without Icons

```markdown
<div class="info-card-grid">

## Program Features

- Expert instruction
- Small group sizes
- Safe environment
- Fun activities

## What's Included

- All meals provided
- Lodging in cabins
- Activities and programs
- T-shirt and materials

</div>
```

## Implementation Details

- **Component**: `/components/content/InfoCard.tsx`
- **Renderer**: `/components/content/MarkdownRenderer.tsx`
- **Pattern Detection**: Automatic - no manual component imports needed
- **Security**: className attributes are sanitized through rehype-sanitize
- **Accessibility**: Proper ARIA roles and semantic HTML structure

## Pages Using InfoCard

1. `/content/pages/work-at-camp.mdoc` - "Why Work at Camp?" section
2. `/content/pages/about.mdoc` - Core values grid (4 cards)
3. `/content/pages/give.mdoc` - "Why Give to Camp?" reasons

## Styling

InfoCards use the site's design system:
- Background: `bg-cream` (warm cream color)
- Border: `border-secondary/20` with hover effect
- Icons: `text-secondary` (teal/blue accent)
- Checkmarks: Green checkmarks for list items
- Shadow: Subtle shadow with hover animation

## Technical Notes

- ReactMarkdown converts markdown to React components
- Custom `div` component handler detects `info-card-grid` class
- Parses heading + list pairs from children
- Extracts icon names from heading text
- Renders InfoCard components in responsive grid
