# Tailwind Responsive Design Patterns

> Mobile-first responsive design for Bear Lake Camp

## Breakpoint Reference

| Prefix | Min Width | Typical Devices |
|--------|-----------|-----------------|
| (none) | 0px | Mobile phones |
| `sm:` | 640px | Large phones, small tablets |
| `md:` | 768px | Tablets |
| `lg:` | 1024px | Laptops, small desktops |
| `xl:` | 1280px | Desktops |
| `2xl:` | 1536px | Large desktops |

## Mobile-First Approach

### Pattern: Progressive Enhancement
```tsx
// Start with mobile, add breakpoints for larger screens
<div className="
  p-4           // Mobile: 1rem padding
  sm:p-6        // Tablet+: 1.5rem padding
  lg:p-8        // Desktop+: 2rem padding
">
  Content
</div>
```

### Pattern: Responsive Grid
```tsx
<div className="
  grid
  grid-cols-1       // Mobile: 1 column
  sm:grid-cols-2    // Tablet: 2 columns
  lg:grid-cols-3    // Desktop: 3 columns
  xl:grid-cols-4    // Large: 4 columns
  gap-4
  sm:gap-6
">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>
```

### Pattern: Responsive Typography
```tsx
<h1 className="
  text-2xl          // Mobile: 1.5rem
  sm:text-3xl       // Tablet: 1.875rem
  md:text-4xl       // Laptop: 2.25rem
  lg:text-5xl       // Desktop: 3rem
  xl:text-6xl       // Large: 3.75rem
  font-bold
">
  Bear Lake Camp
</h1>

<p className="
  text-base         // Mobile: 1rem
  md:text-lg        // Tablet+: 1.125rem
  lg:text-xl        // Desktop+: 1.25rem
  leading-relaxed
">
  Description text
</p>
```

## Layout Patterns

### Pattern: Container with Max Width
```tsx
<div className="
  max-w-7xl         // Max width 80rem
  mx-auto           // Center horizontally
  px-4              // Mobile padding
  sm:px-6           // Tablet padding
  lg:px-8           // Desktop padding
">
  Content
</div>
```

### Pattern: Responsive Flex Direction
```tsx
<div className="
  flex
  flex-col          // Mobile: Stack vertically
  md:flex-row       // Tablet+: Side by side
  gap-4
  md:gap-8
">
  <div className="md:w-1/2">Left/Top content</div>
  <div className="md:w-1/2">Right/Bottom content</div>
</div>
```

### Pattern: Show/Hide by Breakpoint
```tsx
{/* Mobile-only element */}
<button className="block md:hidden">
  Mobile Menu
</button>

{/* Desktop-only element */}
<nav className="hidden md:flex md:gap-4">
  <a href="/about">About</a>
  <a href="/contact">Contact</a>
</nav>
```

## Bear Lake Camp Patterns

### Hero Section
```tsx
<section className="
  relative
  min-h-[60vh]      // Mobile: 60% viewport height
  md:min-h-[70vh]   // Tablet+: 70%
  lg:min-h-[80vh]   // Desktop+: 80%
  flex
  items-center
  justify-center
">
  <div className="
    absolute inset-0
    bg-gradient-to-b from-transparent to-black/50
  " />
  <div className="
    relative z-10
    text-center
    px-4
    max-w-4xl
  ">
    <h1 className="
      text-3xl
      sm:text-4xl
      md:text-5xl
      lg:text-6xl
      font-bold
      text-white
    ">
      Bear Lake Camp
    </h1>
    <p className="
      mt-4
      text-lg
      sm:text-xl
      md:text-2xl
      text-white/90
    ">
      Faith, Fun, and Friendship
    </p>
  </div>
</section>
```

### Card Grid
```tsx
<div className="
  grid
  grid-cols-1
  sm:grid-cols-2
  lg:grid-cols-3
  gap-6
  p-4
  sm:p-6
  lg:p-8
">
  {programs.map(program => (
    <div key={program.slug} className="
      bg-white
      rounded-lg
      shadow-md
      overflow-hidden
      transition-shadow
      hover:shadow-lg
    ">
      <img
        src={program.image}
        alt={program.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-4 sm:p-6">
        <h3 className="
          text-lg
          sm:text-xl
          font-bold
        ">
          {program.title}
        </h3>
        <p className="
          mt-2
          text-gray-600
          text-sm
          sm:text-base
        ">
          {program.description}
        </p>
      </div>
    </div>
  ))}
</div>
```

### Navigation
```tsx
<header className="
  sticky top-0
  z-50
  bg-white
  shadow-sm
">
  <div className="
    max-w-7xl
    mx-auto
    px-4
    sm:px-6
    lg:px-8
  ">
    <div className="
      flex
      items-center
      justify-between
      h-16
      sm:h-20
    ">
      {/* Logo */}
      <a href="/" className="flex items-center">
        <img
          src="/logo.png"
          alt="Bear Lake Camp"
          className="h-8 sm:h-10"
        />
      </a>

      {/* Desktop Nav */}
      <nav className="hidden md:flex md:gap-6">
        <a href="/about" className="text-gray-700 hover:text-primary">
          About
        </a>
        <a href="/programs" className="text-gray-700 hover:text-primary">
          Programs
        </a>
      </nav>

      {/* Mobile Menu Button */}
      <button className="md:hidden p-2">
        <MenuIcon className="w-6 h-6" />
      </button>
    </div>
  </div>
</header>
```

### Footer
```tsx
<footer className="bg-gray-900 text-white">
  <div className="
    max-w-7xl
    mx-auto
    px-4 sm:px-6 lg:px-8
    py-12 sm:py-16
  ">
    <div className="
      grid
      grid-cols-1
      sm:grid-cols-2
      lg:grid-cols-4
      gap-8
    ">
      {/* Column 1 */}
      <div>
        <h3 className="text-lg font-bold mb-4">About</h3>
        <p className="text-gray-400 text-sm">
          Bear Lake Camp has been serving families since 1965.
        </p>
      </div>

      {/* Column 2 */}
      <div>
        <h3 className="text-lg font-bold mb-4">Programs</h3>
        <ul className="space-y-2 text-sm text-gray-400">
          <li><a href="/summer-camp">Summer Camp</a></li>
          <li><a href="/retreats">Retreats</a></li>
        </ul>
      </div>

      {/* Column 3 */}
      <div>
        <h3 className="text-lg font-bold mb-4">Contact</h3>
        <ul className="space-y-2 text-sm text-gray-400">
          <li>info@bearlakecamp.com</li>
          <li>(435) 946-3456</li>
        </ul>
      </div>

      {/* Column 4 */}
      <div>
        <h3 className="text-lg font-bold mb-4">Follow Us</h3>
        <div className="flex gap-4">
          <a href="#" className="text-gray-400 hover:text-white">
            <FacebookIcon />
          </a>
          <a href="#" className="text-gray-400 hover:text-white">
            <InstagramIcon />
          </a>
        </div>
      </div>
    </div>

    <div className="
      mt-8 pt-8
      border-t border-gray-800
      text-center text-sm text-gray-400
    ">
      &copy; 2025 Bear Lake Camp. All rights reserved.
    </div>
  </div>
</footer>
```

## Touch Target Sizing

### Pattern: Accessible Buttons
```tsx
{/* Minimum 44x44px touch target */}
<button className="
  min-h-[44px]
  min-w-[44px]
  px-4
  py-2
  sm:px-6
  sm:py-3
  text-sm
  sm:text-base
">
  Click Me
</button>
```

### Pattern: Link Lists
```tsx
<ul className="space-y-2">
  {links.map(link => (
    <li key={link.href}>
      <a
        href={link.href}
        className="
          block
          py-3          // Taller touch target on mobile
          sm:py-2       // Can be smaller on desktop
          px-4
          hover:bg-gray-100
          rounded
        "
      >
        {link.label}
      </a>
    </li>
  ))}
</ul>
```

## Checklist

- [ ] Base styles work at 320px width
- [ ] Breakpoints progress small → large (mobile-first)
- [ ] Touch targets ≥44px on mobile
- [ ] Text remains readable at all sizes
- [ ] Images scale appropriately
- [ ] Navigation adapts (hamburger on mobile)
- [ ] Tested at: 375px, 768px, 1024px, 1440px
- [ ] No horizontal scroll on any breakpoint

## Antipatterns to Avoid

### Don't: Desktop-First
```tsx
// BAD - Desktop first, overriding down
<div className="
  grid-cols-4           // Start with desktop
  lg:grid-cols-3        // Override for smaller?? Wrong!
  md:grid-cols-2
  sm:grid-cols-1
">

// GOOD - Mobile first, adding for larger
<div className="
  grid-cols-1           // Mobile base
  sm:grid-cols-2        // Add for tablet
  lg:grid-cols-3        // Add for laptop
  xl:grid-cols-4        // Add for desktop
">
```

### Don't: Fixed Pixel Widths
```tsx
// BAD - Fixed width breaks on mobile
<div className="w-[600px]">Content</div>

// GOOD - Responsive width
<div className="w-full max-w-lg mx-auto">Content</div>
```

### Don't: Tiny Touch Targets
```tsx
// BAD - Too small for touch
<button className="p-1 text-xs">X</button>

// GOOD - Accessible size
<button className="p-2 min-w-[44px] min-h-[44px]">
  <XIcon className="w-5 h-5" />
</button>
```

---

**Last Updated**: 2025-12-11
**Used By**: react-frontend-specialist
