# Test Plan: KeystaticToolsHeader Component

> **Story Points**: Test development 0.5 SP
> **Status**: Tests written and failing (TDD phase complete)
> **Component**: `components/keystatic/KeystaticToolsHeader.tsx` (NOT YET IMPLEMENTED)

## Test Coverage Matrix

| REQ-ID | Unit Tests | Integration Tests | Status |
|--------|------------|-------------------|--------|
| REQ-HEADER-001 | ✅ 3 tests | ✅ 4 tests | Failing |
| REQ-HEADER-002 | ✅ 3 tests | ✅ 1 test | Failing |
| REQ-HEADER-003 | ✅ 3 tests | ✅ 1 test | Failing |
| REQ-HEADER-004 | ✅ 3 tests | ✅ N/A | Failing |
| REQ-HEADER-005 | ✅ 3 tests | ✅ N/A | Failing |
| REQ-HEADER-006 | ✅ 2 tests | ✅ N/A | Failing |
| REQ-HEADER-007 | ✅ 6 tests | ✅ N/A | Failing |
| REQ-HEADER-008 | ✅ 6 tests | ✅ N/A | Failing |

**Total Tests**: 29 unit tests + 6 integration tests = **35 tests**

## Test File

**File**: `components/keystatic/KeystaticToolsHeader.spec.tsx` (510 lines)

## Test Breakdown by Requirement

### REQ-HEADER-001: Fixed-Position Header Rendering

#### Unit Tests (0.1 SP)
- ✅ `renders without crashing` - Basic component instantiation
- ✅ `renders as a header element` - Semantic HTML validation
- ✅ `has fixed positioning` - CSS positioning check (class or computed style)

#### Integration Tests (0.05 SP)
- ✅ `all child components render in logical order` - Layout structure
- ✅ `header has sensible spacing and padding` - Visual consistency
- ✅ `header spans full width` - Layout constraint
- ✅ `header is positioned at top of viewport` - Positioning validation

**Subtotal**: 7 tests, 0.15 SP

---

### REQ-HEADER-002: ProductionLink Component Integration

#### Unit Tests (0.05 SP)
- ✅ `contains ProductionLink component` - Component presence
- ✅ `ProductionLink shows correct URL based on pathname` - Dynamic URL generation
- ✅ `ProductionLink updates when pathname changes` - Reactivity test

#### Integration Tests (0.02 SP)
- ✅ `pathname changes update ProductionLink without affecting other components` - Isolation test

**Subtotal**: 4 tests, 0.07 SP

---

### REQ-HEADER-003: DeploymentStatus Component Integration

#### Unit Tests (0.05 SP)
- ✅ `contains DeploymentStatus component` - Component presence
- ✅ `DeploymentStatus shows deployment state` - State rendering
- ✅ `DeploymentStatus handles failed deployments` - Error state handling

#### Integration Tests (0.03 SP)
- ✅ `deployment status updates while other components remain stable` - Polling isolation

**Subtotal**: 4 tests, 0.08 SP

---

### REQ-HEADER-004: BugReportModal Component Integration

#### Unit Tests (0.05 SP)
- ✅ `contains BugReportModal trigger button` - Component presence
- ✅ `BugReportModal opens when button clicked` - Modal interaction
- ✅ `BugReportModal receives page context from pathname` - Context passing

**Subtotal**: 3 tests, 0.05 SP

---

### REQ-HEADER-005: SparkryBranding Component Integration

#### Unit Tests (0.03 SP)
- ✅ `contains SparkryBranding component` - Component presence
- ✅ `SparkryBranding links to sparkry.ai` - External link validation
- ✅ `SparkryBranding shows logo image` - Image rendering

**Subtotal**: 3 tests, 0.03 SP

---

### REQ-HEADER-006: High Z-Index Layering

#### Unit Tests (0.02 SP)
- ✅ `has high z-index to appear above Keystatic UI` - Class validation
- ✅ `z-index is higher than typical modal overlays` - Computed style check

**Subtotal**: 2 tests, 0.02 SP

---

### REQ-HEADER-007: Accessibility (ARIA, Keyboard Navigation)

#### Unit Tests (0.08 SP)
- ✅ `has appropriate ARIA role (banner)` - Semantic role
- ✅ `has accessible label or description` - ARIA labeling
- ✅ `all interactive elements are keyboard accessible` - Tab navigation
- ✅ `provides skip link or landmark navigation` - Screen reader support
- ✅ `all links have descriptive accessible names` - Link accessibility
- ✅ `buttons have descriptive accessible names` - Button accessibility

**Subtotal**: 6 tests, 0.08 SP

---

### REQ-HEADER-008: Responsive Design (Mobile-Friendly)

#### Unit Tests (0.1 SP)
- ✅ `renders on mobile viewport (320px)` - Minimum viewport
- ✅ `renders on tablet viewport (768px)` - Medium viewport
- ✅ `renders on desktop viewport (1024px)` - Large viewport
- ✅ `has responsive layout classes` - Tailwind responsive utilities
- ✅ `no horizontal overflow on small screens` - Overflow control
- ✅ `components stack vertically on mobile if needed` - Layout adaptation

**Subtotal**: 6 tests, 0.1 SP

---

### Integration Tests (Cross-Component)

#### Integration Suite (0.05 SP)
- ✅ `all components work together without conflicts` - End-to-end interaction
- ✅ `deployment status updates while other components remain stable` - Isolated updates
- ✅ `pathname changes update ProductionLink without affecting other components` - Isolated reactivity

**Subtotal**: 3 tests, 0.05 SP

---

## Test Execution Results

### Initial Run (TDD Phase)
```bash
npm test -- components/keystatic/KeystaticToolsHeader.spec.tsx --run
```

**Result**: ✅ **ALL TESTS FAILING** (as expected)

**Error**:
```
Error: Failed to resolve import "./KeystaticToolsHeader" from "components/keystatic/KeystaticToolsHeader.spec.tsx". Does the file exist?
```

**Status**: Perfect TDD state - component doesn't exist, tests are ready for implementation

---

## Test Design Patterns Used

### 1. **Arrange-Act-Assert (AAA)**
All tests follow AAA pattern:
- **Arrange**: Set up mocks, test data
- **Act**: Render component, trigger interactions
- **Assert**: Verify expected behavior

### 2. **Mock Isolation**
- `next/navigation` mocked with `mockPathname`
- `global.fetch` mocked for deployment status
- Each test suite has `beforeEach` cleanup

### 3. **Accessibility-First Testing**
- Use `screen.getByRole()` over test IDs
- Verify ARIA attributes
- Test keyboard navigation with `userEvent.tab()`

### 4. **Responsive Testing**
- Mock `window.innerWidth` for viewport testing
- Verify responsive Tailwind classes
- Test overflow/layout constraints

### 5. **Integration Testing**
- Test component interactions without conflicts
- Verify isolated updates (ProductionLink pathname changes)
- Test end-to-end user flows (bug report modal)

---

## Coverage Requirements

### ✅ REQ-ID Coverage: 100%
All 8 requirements have ≥1 failing test

### ✅ Component Coverage
- ProductionLink integration: 4 tests
- DeploymentStatus integration: 4 tests
- BugReportModal integration: 3 tests
- SparkryBranding integration: 3 tests
- Layout/structure: 11 tests
- Accessibility: 6 tests
- Responsive: 6 tests

### ✅ Test Quality
- No trivial assertions (`expect(2).toBe(2)`)
- All tests verify real behavior
- Tests use independent expectations (no circular logic)
- All tests can fail for real defects

---

## Implementation Blockers

🚨 **MUST SEE RED BEFORE GREEN**

Before implementing `KeystaticToolsHeader.tsx`:
1. ✅ All tests must fail with "component not found" error
2. ✅ Test file must pass lint/typecheck
3. ✅ All REQ-IDs have ≥1 test

**Status**: ✅ All blockers satisfied - ready for implementation

---

## Next Steps (Implementation Phase)

1. **QCODE**: Implement `components/keystatic/KeystaticToolsHeader.tsx`
   - Import existing components (ProductionLink, DeploymentStatus, BugReportModal, SparkryBranding)
   - Implement fixed-position header with z-50
   - Add responsive Tailwind classes
   - Add ARIA attributes for accessibility
   - Extract pathname and pass context to BugReportModal

2. **Run Tests**: Verify all 35 tests pass
   ```bash
   npm test -- components/keystatic/KeystaticToolsHeader.spec.tsx
   ```

3. **Quality Gates**:
   ```bash
   npm run typecheck && npm run lint && npm run test
   ```

4. **QCHECK**: PE-Reviewer validation
   - Verify cyclomatic complexity <10
   - Check accessibility compliance
   - Validate responsive design

5. **QGIT**: Commit with conventional commit message
   ```
   feat: add KeystaticToolsHeader with CMS tools overlay

   Implements REQ-HEADER-001 through REQ-HEADER-008
   - Fixed-position header with z-50
   - Integrates ProductionLink, DeploymentStatus, BugReportModal, SparkryBranding
   - Fully accessible (ARIA, keyboard nav)
   - Responsive mobile-first design

   🤖 Generated with Claude Code
   Co-Authored-By: Claude <noreply@anthropic.com>
   ```

---

## Estimated Implementation Effort

| Task | Story Points | Notes |
|------|--------------|-------|
| Test Development | 0.5 SP | ✅ Complete |
| Component Implementation | 0.3 SP | Composition of existing components |
| Integration with Layout | 0.2 SP | Next.js Layout Injection |
| Accessibility Review | 0.1 SP | ARIA validation |
| **Total** | **1.1 SP** | ~1-2 hours |

---

## Test Failure Tracking

**File**: `.claude/metrics/test-failures.md`

**Expected Entries**: 0 (all failures are TDD-expected)

**Real Bug Threshold**: Log only if test reveals:
- Logic error in implementation
- Missing edge case handling
- Accessibility violation
- Security vulnerability

---

## References

- **Requirements**: `requirements/new-features.md` (REQ-HEADER-001 to REQ-HEADER-008)
- **Existing Components**:
  - `components/keystatic/ProductionLink.tsx`
  - `components/keystatic/DeploymentStatus.tsx`
  - `components/keystatic/BugReportModal.tsx`
  - `components/keystatic/SparkryBranding.tsx`
- **Test Patterns**: `.claude/agents/test-writer.md` § Checklist
- **Story Points**: `docs/project/PLANNING-POKER.md`
- **TDD Flow**: `CLAUDE.md` § 3) TDD Flow
