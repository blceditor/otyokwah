# Visual Proof Capture System

REQ-PROC-004: Screenshot capture utility for visual verification

## Overview

The Visual Proof Capture system ensures that visual changes (CSS, layout, design) cannot be deployed without screenshot evidence proving the rendering is correct. This system integrates with Playwright tests and the post-commit validation workflow.

## Components

### 1. Core Utility (`capture-visual-proof.ts`)

Main module providing screenshot capture functionality with requirement-based naming.

**Key Features:**
- Automatic screenshot capture with REQ-ID naming
- Metadata storage (test name, URL, timestamp)
- Manifest generation
- Screenshot cleanup utilities

**Usage in Tests:**

```typescript
import { captureVisualProof, captureVisualProofFromTest } from '@/scripts/validation/capture-visual-proof';

// Option 1: Manual metadata
test('hero section renders', async ({ page }) => {
  await page.goto('/');
  await captureVisualProof(page, {
    requirementId: 'REQ-HERO-001',
    description: 'Hero section with video background',
  });
});

// Option 2: Automatic test info integration
test('navigation renders', async ({ page }, testInfo) => {
  await page.goto('/');
  await captureVisualProofFromTest(
    page,
    testInfo,
    'REQ-NAV-001',
    'Main navigation'
  );
});
```

### 2. Playwright Reporter (`visual-proof-reporter.ts`)

Custom Playwright reporter that tracks all visual proof screenshots and generates reports.

**Configuration:**

Add to `playwright.config.ts`:

```typescript
export default defineConfig({
  reporter: [
    ['./scripts/validation/visual-proof-reporter.ts', {
      outputFile: 'verification-screenshots/visual-proof-report.json',
      logToConsole: true
    }],
    ['html']
  ]
});
```

**Output:**

Generates `verification-screenshots/visual-proof-report.json`:

```json
{
  "generated": "2025-12-23T18:00:00Z",
  "totalTests": 5,
  "totalScreenshots": 12,
  "byRequirement": {
    "REQ-HERO-001": 3,
    "REQ-NAV-001": 2,
    "REQ-SESSIONS-001": 7
  },
  "byStatus": {
    "passed": 10,
    "failed": 2,
    "skipped": 0
  },
  "entries": [...]
}
```

### 3. Post-Commit Integration

The `post-commit-validate.sh` script automatically:

1. Runs Playwright tests with visual proof capture enabled
2. Generates screenshot manifest
3. Validates visual changes before deployment

**Workflow:**

```
QGIT (commit + push)
  ↓
Wait for Vercel deployment
  ↓
Run smoke tests
  ↓
Run Playwright visual tests (with screenshot capture)
  ↓
Generate manifest
  ↓
Deploy only if screenshots prove visual correctness
```

## Directory Structure

```
verification-screenshots/
├── manifest.json                    # Auto-generated manifest
├── visual-proof-report.json         # Reporter output
├── REQ-HERO-001-2025-12-23T18-00-00.png
├── REQ-HERO-001-2025-12-23T18-00-00.meta.json
├── REQ-NAV-001-2025-12-23T18-01-00.png
├── REQ-NAV-001-2025-12-23T18-01-00.meta.json
└── .last-run.json                   # Last test run metadata
```

## Screenshot Naming Convention

Format: `REQ-{ID}-{TIMESTAMP}.png`

**Examples:**
- `REQ-HERO-001-2025-12-23T18-00-00.png`
- `REQ-SESSIONS-001-2025-12-23T18-05-30.png`
- `REQ-RESPONSIVE-001-2025-12-23T18-10-15.png`

## Metadata Files

Each screenshot has an associated `.meta.json` file:

```json
{
  "requirementId": "REQ-HERO-001",
  "timestamp": "2025-12-23T18:00:00Z",
  "filename": "REQ-HERO-001-2025-12-23T18-00-00.png",
  "description": "Hero section with video background",
  "url": "https://prelaunch.bearlakecamp.com/",
  "testName": "hero section renders correctly",
  "metadata": {
    "project": "chromium",
    "file": "tests/e2e/visual/visual-proof-example.spec.ts",
    "line": 10
  }
}
```

## Manifest Generation

Run manually:

```bash
npm run test:e2e -- --reporter=./scripts/validation/visual-proof-reporter.ts
```

Or via post-commit hook (automatic).

**Manifest Schema:**

```typescript
{
  generated: string;           // ISO timestamp
  totalCount: number;          // Total screenshots
  byRequirement: {             // Group by REQ-ID
    "REQ-HERO-001": 3,
    "REQ-NAV-001": 2
  };
  screenshots: [               // All screenshot metadata
    {
      path: string;
      filename: string;
      requirementId: string;
      timestamp: string;
    }
  ]
}
```

## Visual Proof Requirements

### When to Capture Visual Proof

Visual proof screenshots are REQUIRED for:

1. **CSS Changes**: Any modification to styles, classes, or Tailwind utilities
2. **Layout Changes**: Grid, flexbox, positioning adjustments
3. **Typography Changes**: Font sizes, weights, line heights
4. **Color Changes**: Background colors, text colors, borders
5. **Responsive Design**: Breakpoint behavior, mobile layouts
6. **Component Styling**: New or modified component visual appearance

### Test Pattern

```typescript
test.describe('REQ-{ID}: {Feature Description}', () => {
  test('{specific visual requirement}', async ({ page }, testInfo) => {
    // 1. Navigate to page
    await page.goto('/path');

    // 2. Wait for visual elements
    await page.waitForSelector('.key-element');

    // 3. CAPTURE VISUAL PROOF (before assertions)
    await captureVisualProofFromTest(
      page,
      testInfo,
      'REQ-{ID}',
      'Description of what screenshot proves'
    );

    // 4. Assert visual properties
    const element = page.locator('.key-element');
    const color = await element.evaluate(el =>
      window.getComputedStyle(el).color
    );
    expect(color).toBe('rgb(255, 0, 0)');
  });
});
```

## Deployment Gate

Visual changes **CANNOT** be deployed without screenshot evidence:

```bash
# Post-commit validation enforces this
./scripts/post-commit-validate.sh
```

**Exit codes:**
- `0`: All tests passed, visual proof captured
- `1`: Tests failed or no visual proof
- `2`: Deployment timeout

## Cleanup

Remove old screenshots (older than 30 days):

```typescript
import { VisualProofCapture } from '@/scripts/validation/capture-visual-proof';

const capture = new VisualProofCapture();
const deletedCount = await capture.cleanOldScreenshots(30);
console.log(`Deleted ${deletedCount} old screenshots`);
```

## Configuration Options

```typescript
const capture = new VisualProofCapture({
  outputDir: 'verification-screenshots',  // Default
  includeTimestamp: true,                 // Default
  organizeByRequirement: false,           // Default (flat structure)
  quality: 90,                            // 0-100
  fullPage: true,                         // Capture full page
});
```

## CI/CD Integration

In GitHub Actions / CI:

```yaml
- name: Run Visual Tests
  run: npm run test:e2e -- --reporter=./scripts/validation/visual-proof-reporter.ts
  env:
    E2E_BASE_URL: https://prelaunch.bearlakecamp.com
    VISUAL_PROOF_ENABLED: true

- name: Upload Screenshots
  uses: actions/upload-artifact@v3
  if: always()
  with:
    name: visual-proofs
    path: verification-screenshots/
```

## Examples

See `/tests/e2e/visual/visual-proof-example.spec.ts` for complete examples including:

- Basic hero section capture
- Navigation capture
- Responsive design testing
- CSS color verification
- Typography verification
- Session header visual verification

## Troubleshooting

### Screenshots Not Captured

1. Check test includes requirement ID in title/suite
2. Verify `captureVisualProof()` or `captureVisualProofFromTest()` is called
3. Check `verification-screenshots/` directory exists and is writable

### Manifest Empty

1. Ensure tests completed successfully
2. Check reporter is configured in `playwright.config.ts`
3. Verify screenshot files match naming convention `REQ-*.png`

### Post-Commit Validation Fails

1. Check Playwright is installed: `npx playwright install`
2. Verify environment variables: `E2E_BASE_URL`, `VISUAL_PROOF_ENABLED`
3. Check logs in `.cache/autofix/`

## Best Practices

1. **Capture Early**: Take screenshots BEFORE assertions
2. **Descriptive Names**: Use clear requirement IDs and descriptions
3. **Multiple Views**: Capture desktop, tablet, mobile for responsive features
4. **Before/After**: Capture before and after state changes
5. **Clean Up**: Regularly remove old screenshots to save space
6. **Review**: Manually review screenshots in PRs to catch visual regressions

## Story Point Estimation (SDE-III Analysis)

### Implementation Complexity: Moderate (5 SP)

**Breakdown:**
1. Core utility (`capture-visual-proof.ts`): 2 SP
2. Playwright reporter (`visual-proof-reporter.ts`): 1.5 SP
3. Post-commit integration: 1 SP
4. Example tests + documentation: 0.5 SP

**Dependencies:**
- `@playwright/test`: Built-in screenshot API
- Node.js `fs` module: File system operations
- Bash utilities: `find`, `jq`, `grep` for manifest generation

**Technical Risks:**
- Screenshot file size (mitigated by quality setting)
- Manifest generation performance with large screenshot counts
- Race conditions in concurrent test execution (mitigated by file locking)

**Confidence:** High

---

## Pattern Validation Script (REQ-PROC-006)

Validates design pattern compliance across the production site using Playwright browser automation.

### Overview

The pattern validation script (`validate-patterns.ts`) scans the production website to ensure all UI elements comply with the design patterns defined in `/lib/design-system/patterns/`.

**Purpose:**
- Detect pattern violations before they reach production
- Ensure consistency across the website
- Provide actionable reports for developers
- Enable CI/CD pattern validation gates

### Supported Patterns

1. **SessionHeaderPattern** - Session titles (h2) in colored grid sections
2. **CTAButtonPattern** - Call-to-action buttons (Register Now, etc.)
3. **GridSectionPattern** - 50/50 image/content layout sections
4. **SessionCardPattern** - Translucent white cards with bark headings
5. **AnchorNavPattern** - Sticky navigation for section jumping

### Usage

**Basic Usage:**

```bash
# Validate all patterns across all pages
npx tsx scripts/validation/validate-patterns.ts https://prelaunch.bearlakecamp.com

# Validate specific pattern
npx tsx scripts/validation/validate-patterns.ts https://prelaunch.bearlakecamp.com --pattern=SessionHeaderPattern

# Verbose output
npx tsx scripts/validation/validate-patterns.ts https://prelaunch.bearlakecamp.com --verbose
```

**Exit Codes:**
- `0` - All patterns valid (no violations)
- `1` - Violations found
- `2` - Script error or invalid arguments

### Example Output

```
Pattern Validation Script
REQ-PROC-006: Design pattern compliance check

ℹ Base URL: https://prelaunch.bearlakecamp.com
ℹ Patterns to check: SessionHeaderPattern, CTAButtonPattern, GridSectionPattern, SessionCardPattern, AnchorNavPattern
ℹ Pages to scan: 9

ℹ Scanning https://prelaunch.bearlakecamp.com/...
✓ https://prelaunch.bearlakecamp.com/ - All patterns valid (15 elements checked)

================================================================================
PATTERN VALIDATION REPORT
================================================================================
Timestamp: 2025-12-23T20:00:00Z
Base URL: https://prelaunch.bearlakecamp.com
Pages Scanned: 9
Elements Checked: 127

✓ ALL PATTERNS VALID
  127 elements passed validation

================================================================================
```

**With Violations:**

```
✗ 3 VIOLATIONS FOUND
  Passed: 124
  Failed: 3
  Success Rate: 97.6%

Violations by Pattern:
  CTAButtonPattern: 2
  SessionHeaderPattern: 1

--------------------------------------------------------------------------------
VIOLATION DETAILS:
--------------------------------------------------------------------------------

✗ CTAButtonPattern
  Element: Register Now
  Selector: a[href*="ultracamp"]:nth-child(1)
  URL: https://prelaunch.bearlakecamp.com/summer-camp
  Violations:
    - display: expected inline-flex, got block
    - borderRadius: expected 0.5rem (8px), got 6px
    - fontWeight: expected ≥600 (semibold/bold), got 500

✗ SessionHeaderPattern
  Element: Our Mission
  Selector: .prose h2:nth-child(1)
  URL: https://prelaunch.bearlakecamp.com/about
  Violations:
    - fontSize: expected 48px, got 30px
    - textAlign: expected left, got center
```

### Validation Rules

Each pattern defines validation rules that are checked in-browser using Playwright:

**SessionHeaderPattern:**
- Font size: exactly 48px
- Line height: 48px (leading-none)
- Font weight: 700 (bold)
- Text alignment: left
- Margins: mt-0, mb-2

**CTAButtonPattern:**
- Display: inline-flex
- Alignment: items-center, justify-center
- Border radius: 0.5rem (8px)
- Font weight: ≥600 (semibold/bold)

**GridSectionPattern:**
- Display: flex
- Minimum height: ≥600px on desktop
- Children: exactly 2 (image + content)
- Child widths: 50% each on desktop

**SessionCardPattern:**
- Border radius: 0.5rem (8px)
- Background: white with opacity <1
- Padding: ≥24px (1.5rem)

**AnchorNavPattern:**
- Position: sticky or fixed
- Top: 0px (when sticky)
- Z-index: ≥10
- Visual separation: border or shadow

### CI/CD Integration

Add to GitHub Actions workflow:

```yaml
- name: Validate Design Patterns
  run: |
    npx tsx scripts/validation/validate-patterns.ts https://prelaunch.bearlakecamp.com
  env:
    NODE_ENV: production

- name: Upload Pattern Report
  if: failure()
  uses: actions/upload-artifact@v3
  with:
    name: pattern-violations
    path: |
      validation-reports/
      verification-screenshots/
```

**Deployment Gate:**

The pattern validation script can block deployments if violations are found:

```bash
#!/bin/bash
# In deployment script

npx tsx scripts/validation/validate-patterns.ts $DEPLOY_URL

if [ $? -ne 0 ]; then
  echo "❌ Pattern violations detected. Deployment blocked."
  exit 1
fi

echo "✅ All patterns valid. Proceeding with deployment."
```

### Pages Scanned

The script automatically scans these pages:

1. `/` (Home)
2. `/summer-camp`
3. `/summer-camp-sessions`
4. `/work-at-camp`
5. `/work-at-camp-counselors`
6. `/work-at-camp-kitchen-staff`
7. `/facilities`
8. `/about`

To add more pages, edit the `PAGES_TO_SCAN` array in `validate-patterns.ts`.

### Pattern Selectors

The script uses these CSS selectors to find elements:

```typescript
SessionHeaderPattern: '.prose h2'
CTAButtonPattern: 'a[href*="ultracamp"], a[href*="register"], a.cta-button'
GridSectionPattern: 'section[role="region"]'
SessionCardPattern: '.bg-white\\/20, [class*="bg-white/20"]'
AnchorNavPattern: 'nav[aria-label*="Section"], nav[aria-label*="navigation"]'
```

### Extending Patterns

To add a new pattern:

1. **Create pattern definition** in `/lib/design-system/patterns/{pattern-name}.pattern.ts`

```typescript
export const NewPattern = {
  name: 'NewPattern',
  tailwind: 'your-classes-here',
  validation: {
    requiredClasses: ['class1', 'class2'],
    forbiddenClasses: ['bad-class'],
    requiredStyles: {
      property: 'value',
    },
  },
} as const;
```

2. **Add to pattern library** in `/lib/design-system/patterns/index.ts`

```typescript
export { NewPattern, default as newPattern } from './new.pattern';
```

3. **Add selector** to `validate-patterns.ts`:

```typescript
const PATTERN_SELECTORS = {
  // ...existing patterns
  NewPattern: {
    selector: '.your-selector',
    description: 'Your pattern description',
  },
};
```

4. **Add validation function** in `validate-patterns.ts`:

```typescript
async function validateNewPattern(
  page: Page,
  url: string
): Promise<PatternViolation[]> {
  const violations: PatternViolation[] = [];
  const selector = PATTERN_SELECTORS.NewPattern.selector;
  const elements = await page.locator(selector).all();

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    const result = await element.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      const violations: string[] = [];

      // Your validation logic here

      return {
        isValid: violations.length === 0,
        violations,
      };
    });

    if (!result.isValid) {
      violations.push({
        pattern: 'NewPattern',
        element: `Element ${i + 1}`,
        selector: `${selector}:nth-of-type(${i + 1})`,
        url,
        violations: result.violations,
      });
    }
  }

  return violations;
}
```

5. **Add to scanPage function**:

```typescript
case 'NewPattern':
  patternViolations = await validateNewPattern(page, url);
  break;
```

### Troubleshooting

**Script Times Out:**
- Increase timeout in `page.goto()` call
- Check network connectivity to target URL
- Verify URL is accessible

**No Elements Found:**
- Check selector matches actual DOM structure
- Verify page loaded completely
- Use `--verbose` flag to see element counts

**False Positives:**
- Review computed styles vs. expected values
- Check for CSS inheritance issues
- Verify pattern definitions match implementation

### Performance

**Scan Time:**
- ~10-15 seconds per page
- ~2-3 minutes for full site (9 pages)
- Runs in parallel where possible

**Optimization Tips:**
- Use `--pattern=` flag to check specific patterns
- Reduce `PAGES_TO_SCAN` for quick checks
- Run in headless mode (default)

### Story Point Estimation (SDE-III Analysis)

**Implementation Complexity: Moderate (3 SP)**

**Breakdown:**
1. Pattern validation script core: 1.5 SP
2. Pattern definitions (SessionCard, AnchorNav): 1 SP
3. Documentation and examples: 0.5 SP

**Dependencies:**
- `@playwright/test`: Browser automation
- Pattern definitions in `/lib/design-system/patterns/`
- Production deployment for validation

**Technical Risks:**
- Dynamic content may not be fully loaded (mitigated by `waitUntil`)
- CSS computed values may vary across browsers (using Chrome only)
- Selector brittleness (mitigated by semantic selectors)

**Confidence:** High
