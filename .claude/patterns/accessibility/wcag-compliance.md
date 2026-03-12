# WCAG 2.1 AA Compliance Patterns

> Accessibility standards for Bear Lake Camp website

## Quick Reference: POUR Principles

- **P**erceivable: Content can be perceived (text alternatives, captions)
- **O**perable: Interface is usable (keyboard, timing, navigation)
- **U**nderstandable: Content is clear (readable, predictable)
- **R**obust: Works with assistive tech (valid markup, ARIA)

## Perceivable

### Pattern: Image Alt Text
```tsx
{/* Informative image - describe the content */}
<img
  src="/chapel.jpg"
  alt="Bear Lake Camp chapel surrounded by pine trees at sunset"
/>

{/* Decorative image - empty alt */}
<img
  src="/divider.svg"
  alt=""
  role="presentation"
/>

{/* Functional image (link/button) - describe the action */}
<a href="/">
  <img src="/logo.png" alt="Go to Bear Lake Camp homepage" />
</a>

{/* Complex image - longer description */}
<figure>
  <img
    src="/campus-map.jpg"
    alt="Campus map showing 12 buildings"
    aria-describedby="map-description"
  />
  <figcaption id="map-description">
    Detailed map showing cabins, dining hall, chapel, rec center,
    lake access, and hiking trails.
  </figcaption>
</figure>
```

### Pattern: Color Contrast
```tsx
{/* WCAG AA requires 4.5:1 for normal text, 3:1 for large text */}

{/* Good contrast combinations */}
<div className="bg-white text-gray-900">         {/* 21:1 ✓ */}
<div className="bg-gray-100 text-gray-700">      {/* 5.9:1 ✓ */}
<div className="bg-blue-600 text-white">         {/* 8.6:1 ✓ */}
<div className="bg-primary text-white">          {/* Check your theme! */}

{/* Bad contrast - avoid */}
<div className="bg-gray-100 text-gray-400">      {/* 2.5:1 ✗ */}
<div className="bg-yellow-400 text-white">       {/* 1.5:1 ✗ */}
```

### Pattern: Focus Indicators
```tsx
{/* Always visible focus state */}
<a
  href="/about"
  className="
    text-blue-600
    underline
    focus:outline-none
    focus:ring-2
    focus:ring-blue-500
    focus:ring-offset-2
    rounded
  "
>
  About Us
</a>

<button className="
  px-4 py-2
  bg-primary text-white
  rounded-lg
  focus:outline-none
  focus:ring-2
  focus:ring-primary
  focus:ring-offset-2
  transition-shadow
">
  Register Now
</button>
```

## Operable

### Pattern: Keyboard Navigation
```tsx
{/* All interactive elements must be keyboard accessible */}

{/* Button - focusable by default */}
<button onClick={handleClick}>Click Me</button>

{/* Custom interactive element - add tabIndex and keyboard handler */}
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
  className="cursor-pointer focus:ring-2"
>
  Custom Button
</div>
```

### Pattern: Skip Link
```tsx
{/* First focusable element - skip to main content */}
<a
  href="#main-content"
  className="
    sr-only
    focus:not-sr-only
    focus:absolute
    focus:top-4
    focus:left-4
    focus:z-50
    focus:px-4
    focus:py-2
    focus:bg-white
    focus:text-primary
    focus:rounded
    focus:shadow-lg
  "
>
  Skip to main content
</a>

{/* Main content target */}
<main id="main-content" tabIndex={-1}>
  Content here
</main>
```

### Pattern: Focus Trap (Modals)
```tsx
'use client';

import { useEffect, useRef } from 'react';

export function Modal({ isOpen, onClose, children }) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const modal = modalRef.current;
    const focusableElements = modal?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements?.[0] as HTMLElement;
    const lastElement = focusableElements?.[focusableElements.length - 1] as HTMLElement;

    // Focus first element
    firstElement?.focus();

    // Trap focus
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
      if (e.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      ref={modalRef}
      className="fixed inset-0 z-50"
    >
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg p-6 max-w-md mx-auto mt-20">
        {children}
      </div>
    </div>
  );
}
```

## Understandable

### Pattern: Form Labels
```tsx
{/* Always associate labels with inputs */}
<div>
  <label
    htmlFor="email"
    className="block text-sm font-medium text-gray-700"
  >
    Email Address
  </label>
  <input
    id="email"
    type="email"
    name="email"
    required
    aria-required="true"
    aria-describedby="email-hint"
    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
  />
  <p id="email-hint" className="mt-1 text-sm text-gray-500">
    We'll never share your email with anyone.
  </p>
</div>
```

### Pattern: Error Messages
```tsx
{/* Link error messages to inputs */}
<div>
  <label htmlFor="phone">Phone Number</label>
  <input
    id="phone"
    type="tel"
    aria-invalid={hasError}
    aria-describedby={hasError ? 'phone-error' : undefined}
    className={hasError ? 'border-red-500' : 'border-gray-300'}
  />
  {hasError && (
    <p
      id="phone-error"
      role="alert"
      className="mt-1 text-sm text-red-600"
    >
      Please enter a valid phone number (e.g., 435-946-3456)
    </p>
  )}
</div>
```

### Pattern: Form Validation Summary
```tsx
{/* Summarize errors at top of form */}
{errors.length > 0 && (
  <div
    role="alert"
    aria-labelledby="error-heading"
    className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
  >
    <h2 id="error-heading" className="text-red-800 font-bold">
      Please correct the following errors:
    </h2>
    <ul className="mt-2 list-disc list-inside text-red-700">
      {errors.map((error, i) => (
        <li key={i}>
          <a href={`#${error.field}`} className="underline">
            {error.message}
          </a>
        </li>
      ))}
    </ul>
  </div>
)}
```

## Robust

### Pattern: Semantic HTML
```tsx
{/* Use semantic elements, not generic divs */}
<header>
  <nav aria-label="Main navigation">
    <ul>
      <li><a href="/about">About</a></li>
      <li><a href="/programs">Programs</a></li>
    </ul>
  </nav>
</header>

<main id="main-content">
  <article>
    <h1>Summer Camp 2025</h1>

    <section aria-labelledby="sessions-heading">
      <h2 id="sessions-heading">Available Sessions</h2>
      <p>Content about sessions...</p>
    </section>

    <section aria-labelledby="pricing-heading">
      <h2 id="pricing-heading">Pricing</h2>
      <p>Content about pricing...</p>
    </section>
  </article>
</main>

<footer>
  <nav aria-label="Footer navigation">
    {/* Footer links */}
  </nav>
</footer>
```

### Pattern: ARIA Landmarks
```tsx
{/* Landmarks help screen reader users navigate */}
<div className="min-h-screen flex flex-col">
  <header role="banner">
    <nav role="navigation" aria-label="Main">
      {/* Primary navigation */}
    </nav>
  </header>

  <main role="main" id="main-content">
    {/* Page content */}
  </main>

  <aside role="complementary" aria-label="Related content">
    {/* Sidebar */}
  </aside>

  <footer role="contentinfo">
    {/* Footer */}
  </footer>
</div>
```

### Pattern: Live Regions
```tsx
{/* Announce dynamic changes to screen readers */}

{/* Polite - waits for user to finish */}
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>

{/* Assertive - interrupts immediately (use sparingly) */}
<div aria-live="assertive" role="alert">
  {errorMessage}
</div>

{/* Status - for non-critical updates */}
<div role="status" aria-live="polite">
  Showing {results.length} results
</div>
```

## Bear Lake Camp Specific

### Registration Form
```tsx
<form onSubmit={handleSubmit} noValidate>
  <h1>Camp Registration</h1>

  {/* Error summary */}
  {errors.length > 0 && (
    <div role="alert" className="bg-red-50 p-4 rounded mb-6">
      <h2 className="font-bold text-red-800">
        Please fix {errors.length} error(s) below
      </h2>
    </div>
  )}

  {/* Camper name */}
  <div>
    <label htmlFor="camper-name">
      Camper Name <span aria-hidden="true">*</span>
    </label>
    <input
      id="camper-name"
      type="text"
      required
      aria-required="true"
      aria-invalid={!!errors.camperName}
      aria-describedby={errors.camperName ? 'name-error' : undefined}
    />
    {errors.camperName && (
      <p id="name-error" role="alert" className="text-red-600">
        {errors.camperName}
      </p>
    )}
  </div>

  {/* Submit */}
  <button type="submit" className="focus:ring-2 focus:ring-offset-2">
    Submit Registration
  </button>
</form>
```

### Image Gallery
```tsx
<section aria-label="Photo Gallery">
  <h2>Camp Photos</h2>

  <div
    role="list"
    className="grid grid-cols-2 md:grid-cols-3 gap-4"
  >
    {images.map((img, index) => (
      <div key={index} role="listitem">
        <button
          onClick={() => openLightbox(index)}
          aria-label={`View larger: ${img.alt}`}
          className="focus:ring-2 focus:ring-offset-2"
        >
          <img
            src={img.src}
            alt={img.alt}
            loading="lazy"
          />
        </button>
      </div>
    ))}
  </div>
</section>
```

## Checklist

### Images
- [ ] All images have alt text
- [ ] Decorative images have `alt=""` and `role="presentation"`
- [ ] Complex images have detailed descriptions

### Color & Contrast
- [ ] Text contrast ≥4.5:1 (≥3:1 for large text)
- [ ] Information not conveyed by color alone
- [ ] Focus indicators visible

### Keyboard
- [ ] All interactive elements focusable
- [ ] Focus order logical
- [ ] Skip link present
- [ ] Modal focus trapped

### Forms
- [ ] All inputs have labels
- [ ] Required fields marked (aria-required)
- [ ] Errors linked to inputs (aria-describedby)
- [ ] Error summary provided

### Structure
- [ ] Semantic HTML elements used
- [ ] Heading hierarchy logical (h1 → h2 → h3)
- [ ] ARIA landmarks for regions
- [ ] Page has unique title

## Testing Tools

1. **Keyboard**: Navigate with Tab, Shift+Tab, Enter, Space, Arrow keys
2. **Screen Reader**: Test with VoiceOver (Mac) or NVDA (Windows)
3. **Browser Extensions**: axe DevTools, WAVE
4. **Automated**: eslint-plugin-jsx-a11y, jest-axe

---

**Last Updated**: 2025-12-11
**Used By**: react-frontend-specialist
**Standard**: WCAG 2.1 Level AA
