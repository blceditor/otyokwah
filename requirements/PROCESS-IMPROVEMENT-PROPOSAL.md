# Process Improvement Proposal

**Date**: 2025-12-23
**Based On**: Updates-03 Failure Analysis
**Goal**: Eliminate failures from context switches and improve visual verification

---

## Problem Statement

Our autonomous development workflow has a 29% failure rate (9/14 requirements missed or regressed in Updates-03). The root causes are:

1. **Context Loss**: New AI sessions start without production state knowledge
2. **Visual Verification Gaps**: Tests check class presence, not computed styles
3. **Batch Size Overload**: Too many requirements per iteration
4. **No Regression Prevention**: Fixes break previously working features

---

## Proposed Changes

### Change 1: Mandatory Context Snapshot Before Work

**Rule**: Before ANY implementation begins, capture and document:

```bash
# Required before QPLAN execution
./scripts/capture-context.sh [page-url] [task-name]

# This creates:
# - requirements/context/[task-name]/BEFORE.png (full page screenshot)
# - requirements/context/[task-name]/state.json (computed styles of key elements)
# - requirements/context/[task-name]/git-state.txt (branch, commit, dirty files)
```

**Implementation**: Add to CLAUDE.md Section 3 (TDD Flow):

```markdown
### Pre-Implementation Gate (NEW)

Before writing any code, MUST capture:
1. Screenshot of affected page(s)
2. Computed styles of elements that will change
3. Git state snapshot

Failure to capture baseline = BLOCKER (cannot proceed)
```

---

### Change 2: Computed Style Tests, Not Class Tests

**Rule**: Visual tests MUST verify computed styles, not just CSS classes.

**BAD** (current approach):
```typescript
expect(element).toHaveClass('text-white');
// FAILS: Class present but overridden by higher specificity rule
```

**GOOD** (new approach):
```typescript
const color = await element.evaluate(el =>
  window.getComputedStyle(el).color
);
expect(color).toBe('rgb(255, 255, 255)');
// WORKS: Verifies actual rendered output
```

**Implementation**: Add to `.claude/agents/test-writer.md`:

```markdown
### Visual Test Requirements

For ANY test involving visual output (colors, sizes, positions):

1. Use `window.getComputedStyle()` to get actual rendered values
2. Assert specific RGB/pixel values, not class names
3. Include screenshot comparison for complex layouts

Test structure:
```typescript
test('REQ-XXX: visual requirement', async ({ page }) => {
  // 1. Navigate
  await page.goto('/page');

  // 2. Locate element
  const element = page.locator('[data-testid="target"]');

  // 3. Get computed styles
  const styles = await element.evaluate(el => {
    const cs = window.getComputedStyle(el);
    return {
      color: cs.color,
      fontSize: cs.fontSize,
      textAlign: cs.textAlign,
    };
  });

  // 4. Assert specific values
  expect(styles.color).toBe('rgb(255, 255, 255)');
  expect(styles.fontSize).toBe('48px');
  expect(styles.textAlign).toBe('left');
});
```
```

---

### Change 3: Maximum 3 Visual Requirements Per Batch

**Rule**: Any batch with visual changes is limited to 3 requirements.

**Rationale**:
- Visual changes require more verification time
- CSS specificity conflicts are common
- Screenshots needed before/after each change

**Implementation**: Add to CLAUDE.md Section 5:

```markdown
### Batch Size Limits (MANDATORY)

| Requirement Type | Max Per Batch | Rationale |
|-----------------|---------------|-----------|
| Visual (CSS/layout) | 3 | Requires screenshot verification |
| Logic (JS/TS) | 5 | Can be unit tested quickly |
| Content (mdoc) | 5 | Low risk of regression |
| Infrastructure | 2 | High blast radius |

QPLAN MUST split larger batches automatically.
```

---

### Change 4: Anti-Regression Test Suite

**Rule**: Every QPLAN includes an "Anti-Regression Checklist" that MUST pass before completion.

**Structure**:
```markdown
## Anti-Regression Checklist

These features MUST NOT break (test file references):

- [ ] Hero video height >= 600px (`tests/e2e/smoke/hero-videos.spec.ts`)
- [ ] Session headers WHITE, 3rem (`tests/e2e/production/computed-styles.spec.ts`)
- [ ] CTA buttons have colored text (`tests/e2e/production/cta-button-colors.spec.ts`)
- [ ] All pages HTTP 200 (`scripts/smoke-test.sh`)

Run: `npm run test:anti-regression` before commit
```

**Implementation**: Create new test script:

```json
// package.json
{
  "scripts": {
    "test:anti-regression": "playwright test tests/e2e/production/*.spec.ts --grep @anti-regression"
  }
}
```

---

### Change 5: Context Handoff Protocol

**Rule**: When context window exceeds 70%, create handoff document.

**Template** (`requirements/context/HANDOFF-TEMPLATE.md`):

```markdown
# Context Handoff: [Task Name]

## Session Info
- Started: [timestamp]
- Context usage: [%]
- Branch: [name]
- Last commit: [sha]

## Production State
- Screenshot: [path]
- All pages HTTP 200: [yes/no]

## Requirements Status

| REQ-ID | Status | Evidence |
|--------|--------|----------|
| REQ-001 | ✅ Done | test: xxx.spec.ts |
| REQ-002 | 🔄 In Progress | stuck on: [issue] |
| REQ-003 | ⏳ Not Started | blocked by: REQ-002 |

## Code Context (CRITICAL)

### Files Modified
- `path/to/file.tsx` - [what changed and why]

### Known Issues
- Issue 1: [description] - needs [solution]

### CSS Specificity Notes
- `.prose` overrides custom text colors
- Use `!important` or higher specificity selectors

## Next Session Actions

1. [Specific action with file path and line number]
2. [Specific action]
3. [Specific action]

## Test Commands

```bash
# Run after changes
npm run typecheck
npm run lint
npm test -- tests/e2e/production/[specific-test].spec.ts
./scripts/smoke-test.sh --force prelaunch.bearlakecamp.com
```
```

---

### Change 6: Visual Diff in CI

**Rule**: Every PR with visual changes requires screenshot diff.

**Implementation**: Add GitHub Action:

```yaml
# .github/workflows/visual-diff.yml
name: Visual Diff

on: [pull_request]

jobs:
  visual-diff:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Capture Production Screenshots
        run: |
          npx playwright screenshot https://prelaunch.bearlakecamp.com/summer-camp-sessions \
            --output screenshots/production.png

      - name: Build Preview
        run: npm run build

      - name: Capture Preview Screenshots
        run: |
          npm run preview &
          sleep 5
          npx playwright screenshot http://localhost:3000/summer-camp-sessions \
            --output screenshots/preview.png

      - name: Compare Screenshots
        run: npx pixelmatch screenshots/production.png screenshots/preview.png screenshots/diff.png

      - name: Upload Diff
        uses: actions/upload-artifact@v4
        with:
          name: visual-diff
          path: screenshots/diff.png
```

---

## Implementation Priority

| Change | Priority | Effort | Impact |
|--------|----------|--------|--------|
| Computed Style Tests | P0 | Low | High |
| Max 3 Visual Requirements | P0 | None | High |
| Context Handoff Protocol | P1 | Low | High |
| Anti-Regression Suite | P1 | Medium | High |
| Pre-Implementation Snapshot | P2 | Medium | Medium |
| Visual Diff CI | P2 | Medium | Medium |

---

## Success Metrics

After implementing these changes:

| Metric | Current | Target |
|--------|---------|--------|
| Requirements completion rate | 71% | 95%+ |
| Regression rate | ~15% | <5% |
| Context switch recovery time | 30+ min | <5 min |
| Visual verification coverage | ~20% | 100% |

---

## Appendix: Quick Reference Card

```
┌─────────────────────────────────────────────────┐
│  CONTEXT-SWITCH-PROOF CHECKLIST                │
├─────────────────────────────────────────────────┤
│  □ Screenshot baseline captured                 │
│  □ Computed style tests written                 │
│  □ Max 3 visual requirements in batch           │
│  □ Anti-regression checklist defined            │
│  □ Handoff doc ready (if >70% context)          │
│  □ All tests verify computed styles, not classes│
└─────────────────────────────────────────────────┘
```
