# TDD Implementation Plan for Website Redesign

> **Based on**: WEBSITE-REDESIGN-MOCKUPS.md
> **Methodology**: Test-first development with REQ-IDs
> **Total Estimated Effort**: 34 SP

---

## Phase 1: Critical Fixes (P0) - 8 SP

### REQ-SEO-001: Add Meta Tags to All Pages
**Story Points**: 2 SP
**Priority**: P0 (Critical)

**Test First:**
```typescript
// tests/seo/meta-tags.spec.ts
describe('REQ-SEO-001: Meta Tags', () => {
  const pages = ['/', '/summer-camp', '/about', '/contact', '/give'];

  pages.forEach(page => {
    it(`${page} has required meta tags`, async () => {
      const html = await fetchPage(page);

      expect(html).toContain('<meta name="description"');
      expect(html).toContain('<meta property="og:title"');
      expect(html).toContain('<meta property="og:description"');
      expect(html).toContain('<meta property="og:image"');
      expect(html).toContain('<meta name="twitter:card"');
      expect(html).toContain('<link rel="canonical"');
    });
  });
});
```

**Implementation:**
1. Update `generateMetadata()` in each page
2. Create `lib/seo/generatePageMeta.ts` helper
3. Add OG images for key pages

---

### REQ-A11Y-001: Add Main Landmark
**Story Points**: 1 SP
**Priority**: P0 (Critical)

**Test First:**
```typescript
// tests/a11y/landmarks.spec.ts
describe('REQ-A11Y-001: Main Landmark', () => {
  it('has exactly one main landmark', async () => {
    const { page } = await renderPage('/');
    const mains = await page.locator('main').count();
    expect(mains).toBe(1);
  });

  it('main has id for skip link target', async () => {
    const { page } = await renderPage('/');
    const main = await page.locator('main');
    await expect(main).toHaveAttribute('id', 'main-content');
  });
});
```

**Implementation:**
1. Add `<main id="main-content">` wrapper in layout.tsx
2. Update skip link href to match

---

### REQ-SEO-002: Add Schema.org JSON-LD
**Story Points**: 2 SP
**Priority**: P0 (Critical)

**Test First:**
```typescript
// tests/seo/schema.spec.ts
describe('REQ-SEO-002: Schema.org', () => {
  it('homepage has Organization schema', async () => {
    const html = await fetchPage('/');
    const schema = extractJsonLd(html);

    expect(schema['@type']).toBe('Organization');
    expect(schema.name).toBe('Bear Lake Camp');
  });

  it('summer camp pages have Event schema', async () => {
    const html = await fetchPage('/summer-camp-junior-high');
    const schema = extractJsonLd(html);

    expect(schema['@type']).toBe('Event');
    expect(schema.startDate).toBeDefined();
  });
});
```

**Implementation:**
1. Create `lib/seo/schemas/organization.ts`
2. Create `lib/seo/schemas/event.ts`
3. Add to layout.tsx and program pages

---

### REQ-A11Y-002: Fix Heading Hierarchy
**Story Points**: 1 SP
**Priority**: P0 (Critical)

**Test First:**
```typescript
// tests/a11y/headings.spec.ts
describe('REQ-A11Y-002: Heading Hierarchy', () => {
  it('has exactly one h1 per page', async () => {
    const pages = ['/', '/about', '/summer-camp'];

    for (const page of pages) {
      const { page: p } = await renderPage(page);
      const h1Count = await p.locator('h1').count();
      expect(h1Count).toBe(1);
    }
  });
});
```

**Implementation:**
1. Remove h1 from logo (use span or visually-hidden)
2. Ensure hero title is the only h1

---

### REQ-MOBILE-001: Fix Touch Target Sizes
**Story Points**: 2 SP
**Priority**: P0 (Critical)

**Test First:**
```typescript
// tests/mobile/touch-targets.spec.ts
describe('REQ-MOBILE-001: Touch Targets', () => {
  it('all interactive elements are at least 44x44px', async () => {
    const { page } = await renderPage('/', { viewport: { width: 375, height: 667 } });

    const clickables = await page.locator('a, button, input, select').all();

    for (const el of clickables) {
      const box = await el.boundingBox();
      if (box && box.width > 0) {
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });
});
```

**Implementation:**
1. Update Button component with min-h-[44px] min-w-[44px]
2. Update carousel dots with larger touch area
3. Update header hamburger button

---

## Phase 2: High Priority (P1) - 6 SP

> **NOTE**: This phase focuses on UPDATING existing components, not creating new ones.
> Existing components to update:
> - `components/homepage/TrustBar.tsx` (restore from archive)
> - `components/MobileStickyCTA.tsx` (already implemented with 48px targets)
> - `components/homepage/ProgramCard.tsx` (already implemented)
> - `components/homepage/Testimonials.tsx` (already implemented)
> - `components/content/Testimonial.tsx` (already implemented)

### REQ-UI-001: Restore TrustBar from Archive
**Story Points**: 1 SP
**Priority**: P1 (High)
**Status**: Restore `archive/components/homepage/TrustBar.tsx` to active

**Test First (existing):**
```typescript
// components/homepage/TrustBar.spec.tsx - ALREADY EXISTS
```

**Implementation:**
1. Move TrustBar.tsx from archive to components/homepage/
2. Verify tests pass
3. Add to homepage layout

---

### REQ-UI-002: Mobile Sticky CTA - ALREADY IMPLEMENTED ✓
**Story Points**: 0 SP (no work needed)
**Priority**: P1 (High)
**Status**: COMPLETE - `components/MobileStickyCTA.tsx` already exists with:
- 48px min-height (exceeds 44px requirement)
- Fixed bottom positioning
- Hidden on lg: screens
- Proper scroll visibility logic

---

### REQ-UI-003: Program Cards - ALREADY IMPLEMENTED ✓
**Story Points**: 0 SP (no work needed)
**Priority**: P1 (High)
**Status**: COMPLETE - `components/homepage/ProgramCard.tsx` already exists with:
- Image with lazy loading
- Title, subtitle, benefits list
- CTA link with hover states

---

### REQ-UI-004: Testimonials - UPDATE EXISTING
**Story Points**: 2 SP
**Priority**: P1 (High)
**Status**: UPDATE `components/homepage/Testimonials.tsx` and `components/content/Testimonial.tsx`

**Current Implementation:**
- `Testimonials.tsx`: Video testimonials grid (3 videos)
- `Testimonial.tsx`: Individual card with blockquote, avatar, rating

**Updates Needed:**
1. Add semantic `<figure>` / `<figcaption>` to Testimonial.tsx
2. Ensure consistent styling with design system

**Test Updates:**
```typescript
// components/content/Testimonial.spec.tsx
describe('REQ-UI-004: Testimonial Semantic Markup', () => {
  it('uses semantic figure/figcaption', () => {
    const { container } = render(<Testimonial {...mockTestimonial} />);
    expect(container.querySelector('figure')).toBeInTheDocument();
    expect(container.querySelector('figcaption')).toBeInTheDocument();
  });
});
```

---

### REQ-UI-011: Timeline - ALREADY IMPLEMENTED ✓
**Story Points**: 0 SP (no work needed)
**Priority**: P1 (High)
**Status**: COMPLETE - `components/content/Timeline.tsx` already exists with:
- Alternating layout option
- Accessible markup
- Date, heading, description per item

---

## Phase 3: Medium Priority (P2) - 10 SP

### REQ-UI-005: Session Picker Component
**Story Points**: 5 SP
**Priority**: P2 (Medium)

**Test First:**
```typescript
// components/content/SessionPicker.spec.tsx
describe('REQ-UI-005: SessionPicker', () => {
  it('renders all available sessions', () => {
    render(<SessionPicker sessions={mockSessions} />);
    expect(screen.getAllByTestId('session-card')).toHaveLength(4);
  });

  it('shows availability status', () => {
    render(<SessionPicker sessions={mockSessions} />);
    expect(screen.getByText('5 spots left')).toBeInTheDocument();
    expect(screen.getByText('SOLD OUT')).toBeInTheDocument();
  });

  it('disables sold out sessions', () => {
    render(<SessionPicker sessions={mockSessions} />);
    const soldOutButton = screen.getByRole('button', { name: /waitlist/i });
    expect(soldOutButton).toHaveClass('cursor-not-allowed');
  });

  it('calls onSelect with session', async () => {
    const onSelect = jest.fn();
    render(<SessionPicker sessions={mockSessions} onSelect={onSelect} />);
    await userEvent.click(screen.getAllByRole('button', { name: /select/i })[0]);
    expect(onSelect).toHaveBeenCalledWith(mockSessions[0]);
  });
});
```

---

### REQ-UI-006: Virtual Tour CTA
**Story Points**: 2 SP
**Priority**: P2 (Medium)

**Test First:**
```typescript
// components/content/VirtualTourCTA.spec.tsx
describe('REQ-UI-006: VirtualTourCTA', () => {
  it('renders tour button', () => {
    render(<VirtualTourCTA />);
    expect(screen.getByRole('button', { name: /start tour/i })).toBeInTheDocument();
  });

  it('opens tour modal on click', async () => {
    render(<VirtualTourCTA />);
    await userEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
```

---

### REQ-UI-007: Application Timeline
**Story Points**: 3 SP
**Priority**: P2 (Medium)

**Test First:**
```typescript
// components/content/ApplicationTimeline.spec.tsx
describe('REQ-UI-007: ApplicationTimeline', () => {
  it('renders all steps', () => {
    render(<ApplicationTimeline steps={mockSteps} currentStep={1} />);
    expect(screen.getAllByTestId('timeline-step')).toHaveLength(5);
  });

  it('highlights current step', () => {
    render(<ApplicationTimeline steps={mockSteps} currentStep={2} />);
    expect(screen.getByTestId('step-2')).toHaveClass('bg-secondary');
  });

  it('is accessible with aria-current', () => {
    render(<ApplicationTimeline steps={mockSteps} currentStep={2} />);
    expect(screen.getByTestId('step-2')).toHaveAttribute('aria-current', 'step');
  });
});
```

---

## Phase 4: Nice to Have (P3) - 6 SP

### REQ-UI-008: Pricing Calculator
**Story Points**: 3 SP
**Priority**: P3

### REQ-UI-009: Impact Stats (Give Page)
**Story Points**: 2 SP
**Priority**: P3

### REQ-UI-010: Staff Testimonials
**Story Points**: 1 SP
**Priority**: P3

---

## Sprint Breakdown

### Sprint 1 (Week 1-2): P0 Critical Fixes
| REQ-ID | Task | SP | Owner |
|--------|------|----|----|
| REQ-SEO-001 | Meta tags | 2 | - |
| REQ-A11Y-001 | Main landmark | 1 | - |
| REQ-SEO-002 | Schema.org | 2 | - |
| REQ-A11Y-002 | Heading hierarchy | 1 | - |
| REQ-MOBILE-001 | Touch targets | 2 | - |
| **Total** | | **8 SP** | |

### Sprint 2 (Week 3-4): P1 High Priority
| REQ-ID | Task | SP | Owner |
|--------|------|----|----|
| REQ-UI-001 | Trust Bar | 2 | - |
| REQ-UI-002 | Sticky Mobile CTA | 2 | - |
| REQ-UI-003 | Program Cards | 3 | - |
| REQ-UI-004 | Testimonial | 3 | - |
| **Total** | | **10 SP** | |

### Sprint 3 (Week 5-6): P2 Medium Priority
| REQ-ID | Task | SP | Owner |
|--------|------|----|----|
| REQ-UI-005 | Session Picker | 5 | - |
| REQ-UI-006 | Virtual Tour CTA | 2 | - |
| REQ-UI-007 | Application Timeline | 3 | - |
| **Total** | | **10 SP** | |

### Sprint 4 (Week 7): P3 Nice to Have
| REQ-ID | Task | SP | Owner |
|--------|------|----|----|
| REQ-UI-008 | Pricing Calculator | 3 | - |
| REQ-UI-009 | Impact Stats | 2 | - |
| REQ-UI-010 | Staff Testimonials | 1 | - |
| **Total** | | **6 SP** | |

---

## Validation Checklist

After each sprint, run:
```bash
# SEO
npx ts-node scripts/validation/seo-check.ts https://prelaunch.bearlakecamp.com

# Accessibility
npx ts-node scripts/validation/a11y-check.ts https://prelaunch.bearlakecamp.com

# Mobile
npx ts-node scripts/validation/mobile-check.ts https://prelaunch.bearlakecamp.com

# Performance
npx ts-node scripts/validation/perf-check.ts https://prelaunch.bearlakecamp.com
```

**Target Scores:**
- SEO: 90+ (currently 38)
- Accessibility: 0 violations (currently 1)
- Mobile: All viewports pass
- Performance: Lighthouse 90+

---

## File Structure

```
components/
├── homepage/
│   ├── TrustBar.tsx           # REQ-UI-001
│   ├── TrustBar.spec.tsx
│   ├── ProgramCards.tsx       # REQ-UI-003
│   └── ProgramCards.spec.tsx
├── content/
│   ├── Testimonial.tsx        # REQ-UI-004
│   ├── Testimonial.spec.tsx
│   ├── SessionPicker.tsx      # REQ-UI-005
│   ├── SessionPicker.spec.tsx
│   ├── VirtualTourCTA.tsx     # REQ-UI-006
│   ├── VirtualTourCTA.spec.tsx
│   ├── ApplicationTimeline.tsx # REQ-UI-007
│   └── ApplicationTimeline.spec.tsx
├── ui/
│   ├── StickyMobileCTA.tsx    # REQ-UI-002
│   └── StickyMobileCTA.spec.tsx
└── give/
    ├── ImpactStats.tsx        # REQ-UI-009
    └── ImpactStats.spec.tsx

lib/
└── seo/
    ├── generatePageMeta.ts    # REQ-SEO-001
    └── schemas/
        ├── organization.ts    # REQ-SEO-002
        └── event.ts
```
