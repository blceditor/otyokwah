# Test Plan: Phase 2 Template Components

> **Story Points**: Test development 3.5 SP

**Date**: 2025-11-20
**Phase**: Phase 2 - Template Components
**Status**: RED (All tests failing - awaiting implementation)

---

## Test Coverage Matrix

| REQ-ID | Component | Unit Tests | Status | Test File |
|--------|-----------|------------|--------|-----------|
| REQ-202 | ProgramTemplate | 45 tests | FAILING | components/templates/ProgramTemplate.spec.tsx |
| REQ-203 | FacilityTemplate | 37 tests | FAILING | components/templates/FacilityTemplate.spec.tsx |
| REQ-204 | StaffTemplate | 40 tests | FAILING | components/templates/StaffTemplate.spec.tsx |
| REQ-207 | FAQAccordion | 52 tests | FAILING | components/ui/FAQAccordion.spec.tsx |
| **Total** | **4 components** | **174 tests** | **FAILING** | |

---

## Test Development Story Points

### REQ-202: ProgramTemplate Tests (1 SP)
**File**: `components/templates/ProgramTemplate.spec.tsx`
**Tests**: 45 tests covering:
- Component rendering (3 tests)
- Hero section (4 tests)
- Camp sessions grid (7 tests)
- Registration CTA (5 tests)
- Responsive design (3 tests)
- Semantic HTML & accessibility (5 tests)
- Tailwind custom colors (3 tests)
- Edge cases (8 tests)
- MarkdownRenderer integration (3 tests)
- TypeScript type safety (3 tests)

**Success Criteria**:
- All tests FAIL before implementation (component doesn't exist)
- All tests PASS after implementation
- 100% coverage of REQ-202 acceptance criteria

---

### REQ-203: FacilityTemplate Tests (1 SP)
**File**: `components/templates/FacilityTemplate.spec.tsx`
**Tests**: 37 tests covering:
- Component rendering (3 tests)
- Hero section (4 tests)
- Capacity information display (3 tests)
- Features/amenities grid (4 tests)
- Responsive grid layout (3 tests)
- Image support (3 tests)
- Semantic HTML & accessibility (4 tests)
- Edge cases (7 tests)
- MarkdownRenderer integration (3 tests)
- TypeScript type safety (3 tests)

**Success Criteria**:
- All tests FAIL before implementation
- All tests PASS after implementation
- 100% coverage of REQ-203 acceptance criteria

---

### REQ-204: StaffTemplate Tests (1 SP)
**File**: `components/templates/StaffTemplate.spec.tsx`
**Tests**: 40 tests covering:
- Component rendering (3 tests)
- Hero section (4 tests)
- Application CTA section (7 tests)
- Content sections (3 tests)
- Responsive design (3 tests)
- Semantic HTML & accessibility (5 tests)
- Edge cases (8 tests)
- MarkdownRenderer integration (3 tests)
- TypeScript type safety (3 tests)
- Tailwind custom colors (1 test)

**Success Criteria**:
- All tests FAIL before implementation
- All tests PASS after implementation
- 100% coverage of REQ-204 acceptance criteria

---

### REQ-207: FAQAccordion Tests (0.5 SP)
**File**: `components/ui/FAQAccordion.spec.tsx`
**Tests**: 52 tests covering:
- Component rendering (4 tests)
- Expand/collapse functionality (5 tests)
- Keyboard accessibility (4 tests)
- ARIA attributes (6 tests)
- Smooth animations (2 tests)
- Mobile-friendly touch targets (2 tests)
- Edge cases (8 tests)
- Styling & design (3 tests)
- TypeScript type safety (2 tests)

**Success Criteria**:
- All tests FAIL before implementation
- All tests PASS after implementation
- WCAG AA compliance for keyboard navigation
- Screen reader compatibility

---

## Test Execution Strategy

### Phase 1: Verify RED State (COMPLETE)
- [x] All test files created
- [x] All tests fail with "Cannot resolve import" errors
- [x] Confirmed RED phase of TDD

### Phase 2: Implementation (Next Step)
1. Implement `ProgramTemplate.tsx` component
2. Implement `FacilityTemplate.tsx` component
3. Implement `StaffTemplate.tsx` component
4. Implement `FAQAccordion.tsx` component
5. Make all tests GREEN

### Phase 3: Integration Testing
1. Test template components with real Keystatic data
2. Test responsive breakpoints on multiple devices
3. Test accessibility with screen readers
4. Test performance (bundle size, LCP)

---

## Test Structure & Patterns

### Naming Convention
All tests follow REQ-ID citation pattern:
```typescript
test('REQ-202 — displays age range in sessions grid', () => {
  // Test implementation
});
```

### Test Organization
Tests are organized into logical describe blocks:
- Component Rendering (basic functionality)
- REQ-specific sections (hero, sessions grid, CTA, etc.)
- Responsive Design
- Semantic HTML & Accessibility
- Edge Cases
- Integration with other components
- TypeScript Type Safety

### Assertions
Tests use strong assertions:
- `toBeInTheDocument()` for presence checks
- `toHaveAttribute()` for ARIA and accessibility
- `toMatch()` for class name pattern matching
- `toContainElement()` for DOM hierarchy
- `not.toBeVisible()` for conditional rendering

---

## Dependencies

### Already Installed
- [x] `vitest` - Test runner
- [x] `@testing-library/react` - React component testing
- [x] `@testing-library/jest-dom` - DOM matchers
- [x] `@testing-library/user-event` - User interaction simulation
- [x] `jsdom` - DOM environment

### No Additional Dependencies Needed
All required testing libraries are already installed and configured.

---

## TypeScript Interfaces (Test Guidance)

### ProgramTemplateProps
```typescript
interface ProgramTemplateProps {
  title: string;
  bodyContent: string; // Markdown content
  templateFields: {
    ageRange: string;
    dates: string;
    pricing: string;
    registrationLink: string;
  };
}
```

### FacilityTemplateProps
```typescript
interface FacilityTemplateProps {
  title: string;
  bodyContent: string;
  templateFields: {
    capacity: string;
    amenities: string;
  };
}
```

### StaffTemplateProps
```typescript
interface StaffTemplateProps {
  title: string;
  bodyContent: string;
  templateFields: {
    ctaHeading: string;
    ctaButtonText: string;
    ctaButtonLink: string;
  };
}
```

### FAQAccordionProps
```typescript
interface FAQAccordionProps {
  items: Array<{
    question: string;
    answer: string;
  }>;
}
```

---

## Test-Driven Implementation Guide

### For Each Component
1. **Run tests** - Confirm all tests fail (RED)
2. **Implement component** - Make tests pass one by one
3. **Refactor** - Clean up code while keeping tests GREEN
4. **Type safety** - Ensure no TypeScript errors
5. **Accessibility** - Verify ARIA attributes and keyboard navigation
6. **Performance** - Check bundle size and rendering performance

### Implementation Checklist Per Component
- [ ] Component file created with proper TypeScript types
- [ ] All test sections passing (render, hero, content, CTA, etc.)
- [ ] Semantic HTML tags used (section, article, header)
- [ ] ARIA attributes present (aria-expanded, aria-controls, etc.)
- [ ] Responsive classes applied (sm:, md:, lg:, xl:)
- [ ] Tailwind custom colors used (bark, cream, secondary)
- [ ] MarkdownRenderer integration working
- [ ] Edge cases handled (empty strings, missing fields)
- [ ] No TypeScript errors
- [ ] No console errors or warnings

---

## Accessibility Requirements

### WCAG AA Compliance
- [ ] Color contrast ratio ≥ 4.5:1 for text
- [ ] Focus indicators visible on all interactive elements
- [ ] Keyboard navigation works (Tab, Enter, Space, Escape)
- [ ] Screen reader labels present (aria-label, aria-labelledby)
- [ ] Heading hierarchy logical (h1 → h2 → h3)
- [ ] Touch targets ≥ 48px on mobile

### Screen Reader Testing
- [ ] VoiceOver (macOS/iOS) compatibility
- [ ] NVDA (Windows) compatibility
- [ ] Accordion announces expanded/collapsed state
- [ ] CTA buttons have descriptive labels

---

## Performance Targets

### Bundle Size
- Each template component: < 5 KB (gzipped)
- FAQAccordion component: < 3 KB (gzipped)
- Total Phase 2 increase: < 15 KB (gzipped)

### Rendering Performance
- First paint: < 500ms
- LCP: < 2.5s
- No layout shifts (CLS = 0)

---

## Running Tests

### All Phase 2 Tests
```bash
npm test -- components/templates components/ui/FAQAccordion
```

### Individual Component Tests
```bash
npm test -- components/templates/ProgramTemplate.spec.tsx
npm test -- components/templates/FacilityTemplate.spec.tsx
npm test -- components/templates/StaffTemplate.spec.tsx
npm test -- components/ui/FAQAccordion.spec.tsx
```

### Watch Mode (During Development)
```bash
npm test -- --watch components/templates/ProgramTemplate.spec.tsx
```

### Coverage Report
```bash
npm test -- --coverage components/templates components/ui/FAQAccordion
```

---

## Test Failure Tracking

Tests that reveal real bugs (not expected TDD failures) will be logged to:
`.claude/metrics/test-failures.md`

**Current Status**: No test failures logged (all failures are expected RED phase)

---

## Success Metrics

### Test Quality
- [x] 174 tests written following TDD principles
- [x] All tests cite REQ-IDs in descriptions
- [x] Tests cover happy paths, edge cases, and accessibility
- [ ] All tests GREEN after implementation (pending)
- [ ] 100% of REQ acceptance criteria have test coverage

### Code Quality
- [ ] No TypeScript errors (`npm run typecheck`)
- [ ] No linting errors (`npm run lint`)
- [ ] No console errors in test output
- [ ] Components follow React best practices
- [ ] DRY principle maintained (no duplicate code)

### Accessibility
- [ ] Lighthouse Accessibility score ≥ 90
- [ ] axe DevTools: 0 violations
- [ ] Manual keyboard navigation: 100% functional
- [ ] Screen reader testing: All content accessible

---

## Next Steps (Implementation Phase)

1. **QCODE**: sde-iii agent implements components to pass tests
2. **QCHECK**: PE-reviewer and code-quality-auditor review implementations
3. **QCHECKF**: Function-level reviews for each component
4. **Integration Testing**: Test with real Keystatic data
5. **Accessibility Audit**: Manual testing with screen readers
6. **Performance Audit**: Bundle size and Core Web Vitals

---

## References

- **Requirements**: `requirements/wordpress-migration-fix.lock.md`
- **Test Best Practices**: `.claude/agents/test-writer.md`
- **Planning Poker**: `docs/project/PLANNING-POKER.md`
- **Interface Contracts**: `docs/tasks/INTERFACE-CONTRACT-SCHEMA.md`
- **Existing Patterns**: `components/content/YouTubeEmbed.spec.tsx`
