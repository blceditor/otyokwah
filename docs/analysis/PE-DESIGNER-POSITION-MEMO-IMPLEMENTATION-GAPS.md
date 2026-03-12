# PE-Designer Position Memo: Implementation Gap Analysis

**Date:** 2025-12-23
**Author:** PE-Designer (Principal Engineer - Design)
**Context:** Recurring implementation failures where style/layout requirements are missed despite clear specifications
**Recommendation:** Implement Pattern Library + Component Contract System with automated validation

---

## Executive Summary

### The Core Problem

Requirements like "make headers 3rem font-size" or "left-align headers" are being repeatedly missed across multiple implementation cycles. The root cause is **NOT** lack of clarity in requirements—it's a **missing architectural layer** between requirements and implementation.

### The User's Hypothesis (Validated)

> "We're letting each sub agent go implement how they think without an overarching architecture and design guiding them."

**Status: CONFIRMED.** Analysis of the codebase reveals:

1. **No Pattern Library** - Style decisions are encoded in prose utility classes scattered across components
2. **No Component Contracts** - No single source of truth for "what a session header looks like"
3. **No Validation Layer** - No automated checks preventing style regressions
4. **Inconsistent Implementations** - Same visual component implemented 3 different ways

### Critical Evidence

From `Updates-03.md`:
- **Failure 1:** "Headers still centered" → `GridSquare` has `prose-headings:text-left` but `CampSessionsPage` doesn't
- **Failure 2:** "Font size didn't change" → Hardcoded in `CampSessionsPage` as `text-3xl sm:text-4xl lg:text-5xl` (not 3rem)
- **Failure 3:** "Alternating layout not implemented" → `SquareGrid` component exists but wasn't used

**Root Cause:** Implementers are choosing between competing implementations with no authority hierarchy.

---

## Architecture Options

### Option A: Pattern Library with Component Contracts (RECOMMENDED)

**Implementation:**

```typescript
// /lib/design-system/patterns/SessionHeader.pattern.ts
export const SessionHeaderPattern = {
  typography: {
    fontSize: '3rem',        // REQ-U03-001: Explicit size
    lineHeight: '1',         // REQ-U03-001: Tight leading
    fontWeight: 'bold',
    textAlign: 'left',       // REQ-U03-006: Left-aligned
    color: 'white',          // REQ-U03-001: White on colored backgrounds
  },
  spacing: {
    marginBottom: '0.5rem', // 8px below header
  },
  tailwind: 'text-[3rem] leading-none font-bold text-left text-white mb-2',
} as const;

// Validation contract
export const validateSessionHeader = (element: HTMLElement): boolean => {
  const styles = getComputedStyle(element);
  return (
    styles.fontSize === '48px' &&
    styles.lineHeight === '48px' &&
    styles.textAlign === 'left' &&
    styles.color === 'rgb(255, 255, 255)'
  );
};
```

**Usage in Components:**

```typescript
// components/content/GridSquare.tsx (BEFORE)
<div className="prose prose-lg prose-headings:text-inherit prose-headings:text-left prose-headings:text-[3rem]...">

// components/content/GridSquare.tsx (AFTER)
import { SessionHeaderPattern } from '@/lib/design-system/patterns/SessionHeader.pattern';

<div className={cn(
  'prose prose-lg',
  `[&>h2]:${SessionHeaderPattern.tailwind}`,  // Single source of truth
)}>
```

**Automated Validation:**

```typescript
// scripts/validation/pattern-validator.ts
import { validateSessionHeader } from '@/lib/design-system/patterns/SessionHeader.pattern';

// Runs in CI + pre-commit hooks
export function validatePatternCompliance(page: Page) {
  const headers = page.locator('[data-pattern="session-header"]');
  for (const header of headers) {
    assert(validateSessionHeader(header), 'Session header violates pattern contract');
  }
}
```

**Pros:**
- **Single source of truth** for each visual pattern
- **Type-safe** design system (TypeScript enforces usage)
- **Automated validation** catches regressions in CI
- **Documented rationale** (each pattern references REQ-IDs)
- **Incremental adoption** (add patterns as needed, no big-bang migration)

**Cons:**
- **Upfront cost:** 2-3 SP to build pattern library infrastructure
- **Learning curve:** Team must learn new abstraction layer
- **Maintenance:** Patterns need updates when designs change

---

### Option B: Centralized Style Guide with Lint Rules

**Implementation:**

```typescript
// .eslintrc.js
module.exports = {
  rules: {
    'design-system/no-hardcoded-headings': [
      'error',
      {
        patterns: {
          'session-header': {
            allowedClasses: ['text-[3rem]', 'leading-none', 'text-left', 'text-white'],
            forbiddenClasses: ['text-center', 'justify-center', 'text-3xl'],
          },
        },
      },
    ],
  },
};
```

**Style Guide Document:**

```markdown
# Session Header Pattern (REQ-U03-001)

## Specification
- Font Size: `text-[3rem]` (48px) - NEVER use `text-3xl` (1.875rem/30px)
- Alignment: `text-left` - NEVER use `text-center` or omit
- Color: `text-white` on colored backgrounds
- Leading: `leading-none` (line-height: 1)

## Examples
✅ CORRECT: `className="text-[3rem] leading-none text-left text-white"`
❌ WRONG: `className="text-3xl text-center"`
```

**Pros:**
- **Fast setup:** 0.5 SP for lint rules + style guide
- **Familiar workflow:** Developers already know linters
- **Low maintenance:** Update rules when patterns change

**Cons:**
- **Documentation drift:** Style guide can fall out of sync with code
- **Manual enforcement:** Lint warnings can be ignored
- **No runtime validation:** Only catches issues at build time
- **Limited expressiveness:** Hard to encode complex patterns in lint rules

---

### Option C: Component Library with Strict Contracts

**Implementation:**

```typescript
// components/design-system/SessionHeader.tsx
export interface SessionHeaderProps {
  children: React.ReactNode;
  id?: string;
}

/**
 * SessionHeader Component
 * REQ-U03-001: 3rem font size, white color, left-aligned, line-height 1
 *
 * This is the ONLY way to render session headers. Do NOT use:
 * - <h2> with manual classes
 * - prose-headings utilities
 * - TexturedHeading component (different pattern)
 */
export function SessionHeader({ children, id }: SessionHeaderProps) {
  return (
    <h2
      id={id}
      className="text-[3rem] leading-none font-bold text-left text-white mb-2"
      data-pattern="session-header"
    >
      {children}
    </h2>
  );
}
```

**Usage:**

```typescript
// Before
<h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 text-white">
  Primary Overnight
</h2>

// After
<SessionHeader>Primary Overnight</SessionHeader>
```

**Pros:**
- **Enforced consistency:** Can't render headers wrong if you use the component
- **Easy to change:** Update component, all instances update
- **Type-safe:** TypeScript ensures correct prop usage
- **Self-documenting:** Component is the documentation

**Cons:**
- **Verbose:** Need dedicated component for each pattern
- **Component explosion:** Could end up with 50+ design system components
- **Migration cost:** Must refactor all existing instances
- **Flexibility trade-off:** Harder to handle edge cases

---

## Scalability Assessment

### Expected Load
- **Pattern Library Items:** 15-20 core patterns (headers, buttons, cards, sections)
- **Components Using Patterns:** 40-50 components
- **Validation Checks:** 100-200 assertions in test suite

### Bottlenecks

**Current State:**
1. **No shared vocabulary** - "Session header" means different things in different files
2. **No validation pipeline** - Regressions only caught by manual QA
3. **Competing implementations** - `CampSessionsPage.tsx` vs `GridSquare.tsx` vs Markdoc renderer

**Option A (Pattern Library) Bottlenecks:**
- **Initial pattern creation:** 0.3 SP per pattern × 15 patterns = 4.5 SP
- **Migration:** Must update existing components (one-time 3 SP)
- **CI performance:** +30 seconds for pattern validation (acceptable)

**Option B (Lint Rules) Bottlenecks:**
- **Rule expressiveness:** Hard to encode "headers in cards should be left-aligned" in ESLint
- **False positives:** May flag legitimate pattern variations

**Option C (Component Library) Bottlenecks:**
- **Component explosion:** Need wrapper component for every pattern
- **Import overhead:** `import { SessionHeader } from '@/design-system'` × 50 files

### Mitigation Strategies

**For Option A (Recommended):**
1. **Incremental rollout:** Start with 5 highest-impact patterns (headers, buttons, sections)
2. **Pattern generator:** CLI tool to scaffold new patterns (`pnpm generate:pattern SessionCard`)
3. **Visual regression testing:** Percy/Chromatic integration for pattern validation
4. **Pattern documentation:** Auto-generate Storybook from pattern contracts

---

## Hardest Problems

### 1. Prose Utility Hell

**Problem:** Tailwind's `prose` plugin uses broad selectors like `prose-headings:*` which conflict with explicit classes.

**Example from `GridSquare.tsx`:**
```typescript
className="prose prose-lg prose-headings:text-inherit prose-headings:text-left prose-headings:text-[3rem]..."
```

**Why This Fails:**
- `prose` defaults headings to `text-center` on mobile
- `prose-headings:text-left` has **lower specificity** than `prose`'s responsive classes
- Result: Headers centered on mobile, left-aligned on desktop

**Solution (Pattern Library Approach):**
```typescript
// Pattern defines explicit classes that override prose
export const SessionHeaderPattern = {
  tailwind: 'text-[3rem] leading-none font-bold !text-left text-white mb-2',
  //                                              ^^^^^^^^^^^ Important modifier
};

// Usage
<div className="prose prose-lg [&>h2]:!text-left [&>h2]:text-[3rem]">
```

**Alternative:** Disable `prose` entirely in grid sections, use manual typography.

---

### 2. Component Hierarchy Conflicts

**Problem:** Three different implementations of "session header" with no authority hierarchy.

**Competing Implementations:**

1. **CampSessionsPage.tsx (Static Reference):**
   ```typescript
   <TexturedHeading className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 text-white">
   ```

2. **GridSquare.tsx (Markdoc Prose):**
   ```typescript
   <div className="prose prose-headings:text-[3rem] prose-headings:leading-none">
   ```

3. **MarkdocRenderer.tsx (Implicit via children):**
   ```typescript
   // Renders raw markdown headings with no explicit classes
   {children}
   ```

**Why This Causes Failures:**
- Implementers don't know which is "correct"
- No tests comparing implementations
- QA catches differences only after deployment

**Solution (Pattern Library):**
```typescript
// /lib/design-system/patterns/HIERARCHY.md
# Pattern Authority Hierarchy

When conflicts arise, use this priority order:

1. **Pattern Library** (`/lib/design-system/patterns/*.pattern.ts`) - SOURCE OF TRUTH
2. **Component Library** (`/components/design-system/*`) - Implements patterns
3. **Page Components** - Use pattern library, never hardcode
4. **Static Reference Pages** - For visual QA only, NOT implementation reference

## Example: Session Headers

✅ CORRECT: Import `SessionHeaderPattern` from pattern library
❌ WRONG: Copy classes from `CampSessionsPage.tsx`
❌ WRONG: Use `prose-headings` without explicit overrides
```

---

### 3. Tailwind Class Ordering and Specificity

**Problem:** Tailwind class order doesn't affect specificity, but developer intent gets lost.

**Example of Ambiguous Intent:**
```typescript
// What does this mean? Is text-center a mistake or intentional override?
className="text-[3rem] text-center text-left"
```

**Solution (Pattern with Validation):**
```typescript
// Pattern enforces single truth
export const SessionHeaderPattern = {
  tailwind: 'text-[3rem] leading-none font-bold text-left text-white mb-2',
  validation: {
    forbiddenClasses: ['text-center', 'justify-center'], // CI fails if found
    requiredClasses: ['text-left', 'text-[3rem]'],
  },
};

// Validator catches conflicts
if (element.classList.contains('text-center') && element.classList.contains('text-left')) {
  throw new Error('Conflicting text alignment classes');
}
```

---

## Dependencies

### External
- **Tailwind CSS:** Already in use (no new dependencies)
- **TypeScript:** Already in use (pattern contracts use TS)
- **Playwright:** Already in use (for runtime validation)

### Internal
- **Design System Package:** New package under `/lib/design-system/`
  - `/patterns/` - Pattern contracts (TypeScript objects)
  - `/validators/` - Runtime validation functions
  - `/documentation/` - Auto-generated docs from patterns

### CI/CD Integration
```yaml
# .github/workflows/pattern-validation.yml
name: Pattern Validation
on: [pull_request]
jobs:
  validate-patterns:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: pnpm install
      - run: pnpm validate:patterns  # Runs Playwright against pattern contracts
      - run: pnpm lint:design-system # ESLint rules for pattern usage
```

---

## Specific Recommendations for Design-Level Guardrails

### 1. Pattern Library (Immediate - 3 SP)

**Create 5 Core Patterns:**

```typescript
// /lib/design-system/patterns/index.ts
export { SessionHeaderPattern } from './SessionHeader.pattern';
export { SessionCardPattern } from './SessionCard.pattern';
export { CTAButtonPattern } from './CTAButton.pattern';
export { GridSectionPattern } from './GridSection.pattern';
export { AnchorNavPattern } from './AnchorNav.pattern';
```

**Each Pattern Includes:**
- TypeScript contract (allowed values, required props)
- Tailwind class string (single source of truth)
- Validation function (for CI/E2E tests)
- REQ-ID references (traceability)
- Usage examples (code snippets)

---

### 2. Component Audit Tool (Immediate - 1 SP)

```typescript
// scripts/audit-components.ts
/**
 * Scans codebase for pattern violations
 *
 * Example output:
 * ❌ components/pages/CampSessionsPage.tsx:199
 *    Found: text-3xl sm:text-4xl lg:text-5xl
 *    Expected: text-[3rem] leading-none (SessionHeaderPattern)
 *
 * ❌ components/content/GridSquare.tsx:81
 *    Found: prose-headings:text-left
 *    Expected: [&>h2]:text-left (explicit selector with ! modifier)
 */
```

**Integration:**
```bash
# Pre-commit hook
pnpm audit:components --fix  # Auto-fixes simple violations
pnpm audit:components --report  # Generates violation report for review
```

---

### 3. Visual Regression Tests (Short-term - 2 SP)

```typescript
// tests/visual/session-headers.spec.ts
import { test, expect } from '@playwright/test';
import { SessionHeaderPattern } from '@/lib/design-system/patterns';

test('session headers match pattern contract', async ({ page }) => {
  await page.goto('/summer-camp-sessions');

  const headers = page.locator('[data-pattern="session-header"]');

  for (const header of await headers.all()) {
    const fontSize = await header.evaluate(el => getComputedStyle(el).fontSize);
    const textAlign = await header.evaluate(el => getComputedStyle(el).textAlign);
    const color = await header.evaluate(el => getComputedStyle(el).color);

    expect(fontSize).toBe('48px');  // 3rem
    expect(textAlign).toBe('left');
    expect(color).toBe('rgb(255, 255, 255)');
  }
});
```

**Screenshot Comparison:**
```typescript
// Take baseline screenshot of reference implementation
await page.screenshot({ path: 'baselines/session-header.png' });

// Compare all instances against baseline
const diff = await compareImages(baseline, current);
expect(diff.percentageDifference).toBeLessThan(0.05); // 5% tolerance
```

---

### 4. Pattern Documentation Generator (Short-term - 1 SP)

```typescript
// scripts/generate-pattern-docs.ts
/**
 * Auto-generates Storybook stories from pattern contracts
 *
 * Input: SessionHeaderPattern.ts
 * Output: SessionHeader.stories.tsx
 *
 * Shows all valid states, contrast checks, responsive behavior
 */

export function generateStory(pattern: Pattern): Story {
  return {
    title: pattern.name,
    component: pattern.component,
    argTypes: deriveArgTypesFromContract(pattern.contract),
    parameters: {
      docs: {
        description: pattern.documentation,
        source: pattern.usageExamples,
      },
      a11y: {
        config: {
          rules: deriveA11yRulesFromContract(pattern.contract),
        },
      },
    },
  };
}
```

**Output:** Live pattern library at `/design-system` route showing all patterns with interactive examples.

---

### 5. QPLAN Workflow Enhancement (Medium-term - 2 SP)

**Add Pattern Selection Phase:**

```markdown
## QPLAN Enhanced Workflow

### Phase 0: Pattern Identification (NEW)
Before coding, identify which design patterns apply:

**Questions:**
1. Does this feature use existing patterns? (check pattern library)
2. Are there competing implementations? (run component audit)
3. Do we need a new pattern? (requires PE-Designer approval)

**Output:**
- Pattern manifest: `patterns-used.json`
  ```json
  {
    "session-header": "SessionHeaderPattern v1.0",
    "cta-button": "CTAButtonPattern v2.1",
    "grid-section": "GridSectionPattern v1.5"
  }
  ```

**Validation:**
- QCODET uses pattern contracts to generate tests
- QCODE implements using pattern library (not free-styling)
- QCHECK validates against pattern contracts
```

**Benefit:** Prevents implementers from "going rogue" by making pattern selection explicit upfront.

---

## Comparison: Current vs. Proposed Architecture

### Current Architecture (No Pattern Layer)

```
Requirements (Updates-03.md)
       ↓
    [CHAOS - No shared understanding]
       ↓
Multiple Competing Implementations
  - CampSessionsPage.tsx (text-3xl sm:text-4xl)
  - GridSquare.tsx (prose-headings:text-[3rem])
  - MarkdocRenderer (implicit markdown)
       ↓
Manual QA catches differences
       ↓
Bug reports in Updates-04.md
```

**Failure Mode:** Implementers choose different approaches, no way to detect until production.

---

### Proposed Architecture (Pattern Library Layer)

```
Requirements (Updates-03.md)
       ↓
Pattern Library (Single Source of Truth)
  - SessionHeaderPattern.ts (text-[3rem] leading-none text-left)
  - CTAButtonPattern.ts
  - GridSectionPattern.ts
       ↓
Components Import Patterns
  - CampSessionsPage uses SessionHeaderPattern
  - GridSquare uses SessionHeaderPattern
  - MarkdocRenderer uses SessionHeaderPattern
       ↓
Automated Validation (CI + E2E)
  - Pattern validator checks compliance
  - Visual regression catches drift
       ↓
Early Detection (pre-merge)
```

**Success Mode:** Single source of truth + automated validation prevents divergence.

---

## Migration Path (Recommended: Option A)

### Phase 1: Infrastructure (3 SP - Week 1)
- [ ] Create `/lib/design-system/patterns/` structure
- [ ] Implement 5 core patterns (SessionHeader, CTAButton, GridSection, AnchorNav, SessionCard)
- [ ] Build pattern validator script
- [ ] Add CI workflow for pattern validation

### Phase 2: Component Migration (5 SP - Week 2-3)
- [ ] Audit existing components (`pnpm audit:components`)
- [ ] Migrate `GridSquare.tsx` to use SessionHeaderPattern
- [ ] Migrate `CampSessionsPage.tsx` to use patterns
- [ ] Update `MarkdocRenderer.tsx` to inject pattern classes
- [ ] Add visual regression tests for all patterns

### Phase 3: Workflow Integration (2 SP - Week 3)
- [ ] Update QPLAN to include Pattern Selection phase
- [ ] Train team on pattern library usage
- [ ] Generate Storybook documentation
- [ ] Add pre-commit hooks for pattern validation

### Phase 4: Monitoring (Ongoing - 0.5 SP/month)
- [ ] Review pattern usage in PRs
- [ ] Quarterly pattern library audit
- [ ] Deprecate old patterns as designs evolve

---

## Success Metrics

### Quantitative (3 Months After Implementation)

| Metric | Baseline (Current) | Target (3 Months) |
|--------|-------------------|-------------------|
| **Style Bug Reports** | 5 per release | < 1 per release |
| **Implementation Consistency** | 60% (3 different approaches) | > 95% (single pattern) |
| **CI Catch Rate** | 0% (manual QA only) | > 90% (automated) |
| **Time to Fix Style Bugs** | 2-3 hours (find all instances) | < 15 min (update pattern) |

### Qualitative

- [ ] **Clarity:** Team can answer "How should session headers look?" by referencing pattern library
- [ ] **Confidence:** Implementers know their code will pass review because it uses patterns
- [ ] **Velocity:** Fewer back-and-forth iterations on style implementation

---

## Confidence: High

### Why High Confidence

1. **Root Cause Identified:** Analysis of actual failures (Updates-03.md) confirms pattern divergence
2. **Proven Solution:** Pattern libraries are industry standard (Material UI, Chakra, Tailwind UI)
3. **Incremental Path:** Can start with 5 patterns, expand over time
4. **Existing Infrastructure:** TypeScript + Playwright already in place

### Risks

1. **Adoption Resistance:** Team may prefer "just writing Tailwind classes"
   - **Mitigation:** Show time savings (1 pattern update vs. 10 component updates)

2. **Pattern Library Bloat:** Could end up with 100+ micro-patterns
   - **Mitigation:** Only create patterns for elements used ≥3 times

3. **Over-Engineering:** Small projects don't need this complexity
   - **Mitigation:** Bear Lake Camp has 40+ components, crosses complexity threshold

---

## Alternatives Considered (and Rejected)

### Alternative 1: "Just Write Better Requirements"

**Approach:** Make requirements more explicit (include Tailwind classes)

**Example:**
```markdown
## REQ-U03-001: Session Headers
Headers MUST use: `className="text-[3rem] leading-none text-left text-white mb-2"`
```

**Why Rejected:**
- Requirements become implementation details (couples design to tech)
- No protection against copy-paste errors
- Can't validate automatically
- Doesn't solve "which implementation is correct?" problem

---

### Alternative 2: "Visual QA Only" (Status Quo)

**Approach:** Rely on manual QA to catch style differences

**Why Rejected:**
- Already failing (5+ bugs in Updates-03.md)
- Scales poorly (more components = more surface area)
- Wastes QA time on automatable checks
- Late detection (post-implementation)

---

### Alternative 3: "CSS-in-JS with Theme Provider"

**Approach:** Use styled-components or Emotion with central theme

**Example:**
```typescript
const SessionHeader = styled.h2`
  font-size: ${props => props.theme.typography.sessionHeader.fontSize};
  color: ${props => props.theme.colors.white};
`;
```

**Why Rejected:**
- Abandons Tailwind (major refactor, 20+ SP)
- Runtime cost (CSS-in-JS adds bundle size)
- Team already familiar with Tailwind
- Doesn't solve validation problem (still need tests)

---

## Final Recommendation

**Implement Option A: Pattern Library with Component Contracts**

**Timeline:** 10 SP total (3-4 weeks)
- Week 1: Infrastructure + 5 core patterns
- Week 2: Migrate existing components
- Week 3: Workflow integration + training
- Week 4: Buffer + documentation

**Immediate Actions:**
1. Create `/lib/design-system/patterns/SessionHeader.pattern.ts` (0.3 SP)
2. Build pattern validator script (0.5 SP)
3. Migrate `GridSquare.tsx` to use pattern (0.2 SP)
4. Add CI workflow (0.3 SP)

**Expected ROI:**
- **Time Saved:** 2-3 hours per style bug × 5 bugs per release = 10-15 hours/release
- **Quality Improvement:** 90% reduction in style bugs
- **Velocity Increase:** Faster implementation (copy pattern vs. invent from scratch)

---

## Appendix A: Example Pattern Contracts

### SessionHeaderPattern

```typescript
// /lib/design-system/patterns/SessionHeader.pattern.ts

/**
 * Session Header Pattern
 * REQ-U03-001: Session headings must be 3rem, white, left-aligned, line-height 1
 *
 * Used in: CampSessionsPage, GridSquare (colored sections), LITPage
 *
 * Visual Reference: /static-sessions (Primary Overnight header)
 */

export const SessionHeaderPattern = {
  name: 'SessionHeader',
  version: '1.0.0',
  reqIds: ['REQ-U03-001', 'REQ-U03-006'],

  typography: {
    fontSize: '3rem',        // 48px
    lineHeight: '1',         // 48px (tight)
    fontWeight: 'bold',      // 700
    textAlign: 'left',
    color: 'white',          // Always white on colored backgrounds
  },

  spacing: {
    marginBottom: '0.5rem', // 8px space below header
  },

  tailwind: 'text-[3rem] leading-none font-bold text-left text-white mb-2',

  // Data attribute for E2E testing
  dataAttribute: 'data-pattern="session-header"',

  validation: {
    requiredClasses: ['text-[3rem]', 'text-left', 'text-white', 'leading-none'],
    forbiddenClasses: ['text-center', 'justify-center', 'text-3xl', 'text-4xl'],

    runtime: (element: HTMLElement): boolean => {
      const styles = getComputedStyle(element);
      return (
        styles.fontSize === '48px' &&
        styles.lineHeight === '48px' &&
        styles.textAlign === 'left' &&
        styles.color === 'rgb(255, 255, 255)' &&
        styles.fontWeight === '700'
      );
    },
  },

  usageExamples: [
    {
      name: 'In GridSquare component',
      code: `
        <div className="prose prose-lg [&>h2]:${SessionHeaderPattern.tailwind}">
          <h2 data-pattern="session-header">Primary Overnight</h2>
        </div>
      `,
    },
    {
      name: 'Direct usage',
      code: `
        <h2 className="${SessionHeaderPattern.tailwind}" data-pattern="session-header">
          Junior Camp
        </h2>
      `,
    },
  ],

  visualRegression: {
    baseline: '/visual-baselines/session-header.png',
    tolerance: 0.05, // 5% difference allowed
  },
} as const;

// Type-safe pattern usage
export type SessionHeaderPattern = typeof SessionHeaderPattern;
```

---

## Appendix B: Validation Script Example

```typescript
// scripts/validation/validate-patterns.ts

import { test, expect } from '@playwright/test';
import { SessionHeaderPattern } from '@/lib/design-system/patterns';

test.describe('Pattern Validation', () => {
  test('all session headers match SessionHeaderPattern', async ({ page }) => {
    await page.goto('/summer-camp-sessions');

    const headers = page.locator('[data-pattern="session-header"]');
    const count = await headers.count();

    console.log(`Found ${count} session headers to validate`);

    for (let i = 0; i < count; i++) {
      const header = headers.nth(i);
      const text = await header.textContent();

      // Runtime validation using pattern contract
      const isValid = await header.evaluate((el) => {
        const styles = getComputedStyle(el);
        return (
          styles.fontSize === '48px' &&
          styles.lineHeight === '48px' &&
          styles.textAlign === 'left' &&
          styles.color === 'rgb(255, 255, 255)'
        );
      });

      expect(isValid, `Header "${text}" violates SessionHeaderPattern`).toBe(true);
    }
  });

  test('no components use forbidden header classes', async ({ page }) => {
    await page.goto('/summer-camp-sessions');

    // Check for forbidden classes
    const centeredHeaders = page.locator('h2.text-center');
    expect(await centeredHeaders.count()).toBe(0);

    const wrongSizeHeaders = page.locator('h2.text-3xl, h2.text-4xl');
    expect(await wrongSizeHeaders.count()).toBe(0);
  });
});
```

---

**Last Updated:** 2025-12-23
**Next Review:** After Phase 1 implementation (Week 1)
**Owner:** PE-Designer
