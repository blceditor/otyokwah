# Test Summary: PageEditingToolbar Text Format Change

**Date**: 2025-12-02
**Story Points**: 0.2 SP (test development)
**Status**: ✅ RED Phase Complete (TDD)

---

## Overview

Created comprehensive failing tests for the PageEditingToolbar text format change requirement. All new tests are failing as expected, validating that the current implementation shows formatted page names instead of path formats.

---

## Test Files

### Extended File
- **Path**: `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/keystatic/PageEditingToolbar.spec.tsx`
- **Previous Tests**: 14 tests (all passing)
- **New Tests**: 7 tests (all failing as expected)
- **Total Tests**: 21 tests

---

## New Test Suites

### REQ-TOOLBAR-006: Display Path Format in Link Text (5 tests)

1. **shows path format for regular pages (NOT formatted page name)** ❌
   - **Expected**: "View /contact Live"
   - **Actual**: "View Contact Live"
   - **Status**: FAILING (as expected)

2. **shows path format for multi-word slugs (NOT title case)** ❌
   - **Expected**: "View /summer-camp Live"
   - **Actual**: "View Summer Camp Live"
   - **Status**: FAILING (as expected)

3. **shows "/" for home/index pages (NOT "Home")** ❌
   - **Expected**: "View / Live"
   - **Actual**: "View Home Live"
   - **Status**: FAILING (as expected)

4. **link href still correct for production URL** ❌
   - **Expected Text**: "View /about Live"
   - **Actual Text**: "View About Live"
   - **Expected href**: `https://prelaunch.bearlakecamp.com/about` (CORRECT)
   - **Status**: FAILING (text format incorrect, href correct)

5. **shows path format for nested routes** ❌
   - **Expected**: "View /retreats-youth-groups Live"
   - **Actual**: "View Retreats Youth Groups Live"
   - **Status**: FAILING (as expected)

### REQ-TOOLBAR-007: Maintain Accessibility with New Format (2 tests)

6. **aria-label reflects path format for regular pages** ❌
   - **Expected**: aria-label contains "/contact"
   - **Actual**: "View Contact page on production site"
   - **Status**: FAILING (as expected)

7. **aria-label reflects "/" for index pages** ❌
   - **Expected**: aria-label matches `/\/(.*)?page on production/i`
   - **Actual**: "View Home page on production site"
   - **Status**: FAILING (as expected)

---

## Test Coverage Matrix

| REQ-ID | Unit Tests | Status | Coverage |
|--------|------------|--------|----------|
| REQ-TOOLBAR-006 | 5 tests | ❌ All Failing | 100% |
| REQ-TOOLBAR-007 | 2 tests | ❌ All Failing | 100% |

**Total New Coverage**: 7 tests, 100% of new requirements covered

---

## Test Execution Results

### Run Command
```bash
npx vitest run components/keystatic/PageEditingToolbar.spec.tsx
```

### Results Summary
- **Total Tests**: 25 tests
- **Passing**: 14 tests (existing tests)
- **Failing**: 11 tests (7 new + 4 existing with path issues)
- **Duration**: 673ms

### Key Findings

#### Expected Failures (7 tests)
All 7 new tests in REQ-TOOLBAR-006 and REQ-TOOLBAR-007 are failing as expected, confirming:
1. Component currently uses `{pageName}` format (title case)
2. Component needs to switch to `/{slug}` format (path)
3. Aria-labels need corresponding updates
4. Production URLs are already correct (no changes needed)

#### Unexpected Failures (4 tests)
Some existing REQ-TOOLBAR-003 tests are failing due to incorrect pathname patterns:
- Tests use `/keystatic/pages/{slug}`
- Should be `/keystatic/collection/pages/{slug}`

These test path issues are separate from the text format requirement and should be fixed.

---

## Requirements Lock Reference

**File**: `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/requirements/toolbar-text-format.lock.md`

### REQ-TOOLBAR-006: Display Path Format in Link Text
- Link text shows "View /slug Live" format
- Multi-word slugs preserved with hyphens
- Home/index shows "View / Live"
- Production URL unchanged

### REQ-TOOLBAR-007: Maintain Accessibility with New Format
- Aria-label reflects path format
- Screen reader compatibility maintained

---

## Implementation Notes

### Current Code (Line 62)
```typescript
View {pageName} Live
```

### Required Change
```typescript
View /{slug === 'index' ? '' : slug} Live
```

### Current Aria-label (Line 60)
```typescript
aria-label={`View ${pageName} page on production site`}
```

### Required Change
```typescript
aria-label={`View /${slug === 'index' ? '' : slug} page on production site`}
```

---

## Next Steps (TDD Flow)

1. ✅ **RED Phase Complete**: All 7 new tests failing as expected
2. ⏳ **GREEN Phase**: Implement code changes to make tests pass
   - Update link text from `{pageName}` to `/{slug}`
   - Update aria-label to match new format
   - Handle index/home special case
3. ⏳ **REFACTOR Phase**: Clean up if needed
4. ⏳ **Validation**: Run full test suite to ensure no regressions

---

## Test Quality Checklist

✅ **MUST parameterize inputs**: Tests use named constants (pathname mocks)
✅ **MUST ensure tests can fail**: All tests catching real implementation differences
✅ **MUST align description with assertion**: Test names match what's being verified
✅ **MUST compare to independent expectations**: Using explicit expected strings
✅ **MUST follow quality rules**: Prettier, ESLint, strict types applied
✅ **SHOULD group tests by function**: Organized by REQ-ID and functionality
✅ **SHOULD test edge cases**: Regular pages, multi-word slugs, index pages, nested routes

---

## Artifacts Created

1. **Requirements Lock**: `requirements/toolbar-text-format.lock.md`
2. **Test Extensions**: `components/keystatic/PageEditingToolbar.spec.tsx` (+7 tests)
3. **Test Summary**: `docs/tasks/toolbar-text-format-test-summary.md` (this file)

---

## Story Point Breakdown

**Test Development**: 0.2 SP
- Requirements analysis: 0.05 SP
- Test scaffolding: 0.05 SP
- Test implementation: 0.08 SP
- Test validation: 0.02 SP

**Total**: 0.2 SP

---

## References

- **Component**: `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/keystatic/PageEditingToolbar.tsx`
- **Tests**: `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/keystatic/PageEditingToolbar.spec.tsx`
- **Requirements**: `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/requirements/toolbar-text-format.lock.md`
- **TDD Guidelines**: `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/.claude/agents/test-writer.md`
