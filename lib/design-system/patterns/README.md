# Design Pattern Library

**REQ-PROC-005: Core Design Patterns**

Single source of truth for design patterns used across the Bear Lake Camp website.

## Overview

This pattern library provides TypeScript definitions for core design patterns, ensuring consistency across components, enabling pattern validation in CI/CD, and preventing implementation drift.

## Patterns

### 1. SessionHeaderPattern

Session titles for camp programs (Primary Overnight, Junior Camp, etc.)

**Location:** `session-header.pattern.ts`

**Key Requirements:**
- Font size: 3rem (48px)
- Line height: none (tight)
- Text align: left
- Color: inherit from parent
- Font weight: bold

**Usage:**
```typescript
import { SessionHeaderPattern } from '@/lib/design-system/patterns';

// In component
<div className={SessionHeaderPattern.proseOverride}>
  <h2>Primary Overnight</h2>
</div>

// In test
const result = await header.evaluate((el) => {
  return SessionHeaderPattern.testHelper(el);
});
expect(result.isValid).toBe(true);
```

### 2. CTAButtonPattern

Call-to-action buttons with section-specific colors

**Location:** `cta-button.pattern.ts`

**Variants:**
- `primary` - Solid secondary color
- `secondary` - Outlined
- `inverse` - White background with colored text
- `outline` - Transparent with white border

**Section Colors:**
- `sky` (#0284c7) - Primary Overnight
- `amber` (#d97706) - Junior Camp
- `emerald` (#047857) - Jr. High
- `purple` (#7e22ce) - Sr. High

**Usage:**
```typescript
import { CTAButtonPattern } from '@/lib/design-system/patterns';

const className = CTAButtonPattern.getClassName('inverse', 'lg', 'sky');
// Returns: "inline-flex items-center ... bg-white ... text-sky-600 px-8 py-4 text-lg"
```

### 3. GridSectionPattern

Alternating image/content layout for camp sessions

**Location:** `grid-section.pattern.ts`

**Key Requirements:**
- 50/50 split on desktop
- Alternating image position (left/right)
- Full-bleed images
- Minimum heights (400px mobile, 600px desktop)
- Mobile-first responsive

**Usage:**
```typescript
import { GridSectionPattern } from '@/lib/design-system/patterns';

// Container
<div className={GridSectionPattern.container.tailwind}>
  // Section
  <section className={GridSectionPattern.section.tailwind}>
    // Columns
    <div className={GridSectionPattern.column.tailwind}>
      {/* image or content */}
    </div>
  </section>
</div>
```

## Pattern Structure

Each pattern exports:

```typescript
export const PatternName = {
  name: 'PatternName',
  tailwind: 'class string',
  validation: {
    requiredClasses: string[],
    forbiddenClasses: string[],
    requiredStyles?: Record<string, string>,
  },
  testHelper: (element: HTMLElement) => ValidationResult,
  // ... additional helpers
} as const;
```

## Validation

### In Components

Patterns are used directly in component implementations:

- **SessionHeaderPattern** → `GridSquare.tsx` (prose overrides)
- **CTAButtonPattern** → `CTAButton.tsx` (className generation)
- **GridSectionPattern** → `SquareGrid.tsx` + `GridSquare.tsx`

### In Tests

Patterns provide test helpers for Playwright assertions:

```typescript
import { SessionHeaderPattern } from '@/lib/design-system/patterns';

test('session header follows pattern', async ({ page }) => {
  await page.goto('/summer-camp-sessions');
  const header = page.locator('.prose h2').first();

  const result = await header.evaluate((el) => {
    return SessionHeaderPattern.testHelper(el);
  });

  expect(result.isValid).toBe(true);
  if (!result.isValid) {
    console.log('Violations:', result.violations);
  }
});
```

### In CI/CD

Pattern validation can be automated:

```bash
# Future: Pattern validation script
python scripts/implementation/pattern-validator.py \
  --pattern SessionHeaderPattern \
  --component components/content/GridSquare.tsx
```

## Benefits

1. **Consistency** - Single source of truth prevents implementation drift
2. **Testability** - Built-in test helpers for automated validation
3. **Documentation** - Clear requirements and usage examples
4. **Maintainability** - Changes propagate from one place
5. **Confidence** - Pattern violations caught in CI before deployment

## Files

```
lib/design-system/patterns/
├── README.md                    # This file
├── index.ts                     # Exports all patterns
├── session-header.pattern.ts    # Session title styling
├── cta-button.pattern.ts        # Call-to-action buttons
└── grid-section.pattern.ts      # Alternating layout system
```

## Related

- **Components:** `/components/content/GridSquare.tsx`, `/components/ui/CTAButton.tsx`
- **Tests:** `/tests/e2e/visual/session-header-styles.spec.ts`
- **Requirements:** `/requirements/QPLAN-DEV-PROCESS-IMPROVEMENT.md` (REQ-PROC-005)
- **Design Docs:** `/requirements/UNIFIED-DESIGN-PLAN.md`

## Version

**1.0.0** - Initial release (2025-12-23)

## Future Patterns

Potential additions:
- SessionCardPattern (bg-white/20 with bark titles)
- AnchorNavPattern (section jump navigation)
- TestimonialPattern (quote cards)
- FAQPattern (accordion items)
