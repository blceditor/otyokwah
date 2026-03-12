# Test Plan: REQ-011 Enhanced Content Components

> **Story Points**: Test development 1.0 SP (60 tests across 8 components)

## Test Coverage Matrix

| REQ-ID | Component | Unit Tests | Status |
|--------|-----------|------------|--------|
| REQ-011 | Hero | 8 tests | Failing (TDD Red) |
| REQ-011 | FeatureGrid | 7 tests | Failing (TDD Red) |
| REQ-011 | StatsCounter | 7 tests | Failing (TDD Red) |
| REQ-011 | Testimonial | 7 tests | Failing (TDD Red) |
| REQ-011 | Accordion | 8 tests | Failing (TDD Red) |
| REQ-011 | SplitContent | 7 tests | Failing (TDD Red) |
| REQ-011 | Timeline | 8 tests | Failing (TDD Red) |
| REQ-011 | PricingTable | 8 tests | Failing (TDD Red) |
| **TOTAL** | **8 components** | **60 tests** | **All Failing (Expected)** |

## Test Files Created

### 1. Hero Section Component (8 tests - 0.15 SP)
**File**: `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/content/Hero.spec.tsx`

**Tests**:
- `renders with background image` - Validates background image display
- `renders heading and subheading` - Checks text content
- `renders primary CTA button` - Tests CTA functionality
- `renders optional secondary CTA` - Tests optional second CTA
- `applies overlay opacity correctly` - Validates overlay styling
- `responsive on mobile, tablet, desktop` - Tests responsive breakpoints
- `accessible (ARIA labels, alt text)` - Accessibility validation
- `validates required props (heading)` - Prop validation

**Coverage**: Background images, CTAs, overlays, responsive design, accessibility, prop validation

---

### 2. Feature Grid Component (7 tests - 0.1 SP)
**File**: `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/content/FeatureGrid.spec.tsx`

**Tests**:
- `renders 2-column layout` - Tests 2-column grid
- `renders 3-column layout` - Tests 3-column grid
- `renders 4-column layout` - Tests 4-column grid
- `renders icon per item` - Validates icon rendering
- `renders heading and description per item` - Tests content display
- `optional links work correctly` - Tests optional linking
- `responsive grid adjusts columns` - Tests responsive behavior

**Coverage**: Grid layouts (2-4 columns), icons, content rendering, optional links, responsive design

---

### 3. Stats Counter Component (7 tests - 0.1 SP)
**File**: `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/content/StatsCounter.spec.tsx`

**Tests**:
- `renders number, label, suffix` - Basic rendering
- `animates count-up on scroll` - Animation functionality
- `handles large numbers (1000+)` - Large number formatting
- `suffix renders correctly (+, %, etc)` - Suffix display
- `animation triggers once per page load` - Animation control
- `accessible (aria-live for screen readers)` - Accessibility
- `works without JavaScript (shows final value)` - Progressive enhancement

**Coverage**: Number display, animation, formatting, accessibility, progressive enhancement

---

### 4. Testimonial Card Component (7 tests - 0.1 SP)
**File**: `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/content/Testimonial.spec.tsx`

**Tests**:
- `renders quote, author, role` - Basic content rendering
- `renders avatar image` - Image display
- `renders optional star rating` - Optional rating display
- `handles long quotes gracefully` - Long text handling
- `validates required props (quote, author)` - Prop validation
- `accessible (semantic HTML, blockquote)` - Semantic HTML
- `responsive on mobile` - Mobile responsiveness

**Coverage**: Quote display, avatars, ratings, text overflow, accessibility, responsive design

---

### 5. Accordion/FAQ Component (8 tests - 0.15 SP)
**File**: `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/content/Accordion.spec.tsx`

**Tests**:
- `renders multiple Q&A pairs` - Multiple items
- `expands item on click` - Expand functionality
- `collapses item on click` - Collapse functionality
- `allows multiple items open simultaneously` - Multi-open mode
- `keyboard navigation (Enter, Space, arrows)` - Keyboard access
- `ARIA attributes correct (expanded, controls)` - ARIA compliance
- `smooth expand/collapse animation` - Animation
- `default state: all collapsed` - Initial state

**Coverage**: Multiple items, expand/collapse, keyboard navigation, ARIA attributes, animations, default state

---

### 6. Split Content Component (7 tests - 0.1 SP)
**File**: `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/content/SplitContent.spec.tsx`

**Tests**:
- `renders image on left, content on right` - Standard layout
- `reverses layout (image right, content left)` - Reversed layout
- `responsive: stacks on mobile` - Mobile stacking
- `Next.js Image component used` - Image optimization
- `content area supports rich text` - Rich text rendering
- `validates required props (image, content)` - Prop validation
- `accessible (semantic HTML)` - Semantic structure

**Coverage**: Layout variations, responsive design, Next.js Image, rich text, accessibility

---

### 7. Timeline Component (8 tests - 0.15 SP)
**File**: `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/content/Timeline.spec.tsx`

**Tests**:
- `renders multiple timeline items` - Multiple items
- `renders date, heading, description per item` - Content display
- `vertical connector line between items` - Visual connector
- `alternating left/right layout (optional)` - Alternating layout
- `responsive: linear on mobile` - Mobile layout
- `accessible (semantic HTML, list)` - Semantic lists
- `supports dates in various formats` - Date flexibility
- `handles single item gracefully` - Edge case handling

**Coverage**: Multiple items, content display, visual connectors, layouts, responsive design, date formats, edge cases

---

### 8. Pricing Table Component (8 tests - 0.15 SP)
**File**: `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/content/PricingTable.spec.tsx`

**Tests**:
- `renders multiple pricing tiers` - Multiple tiers
- `highlights popular tier` - Popular tier styling
- `renders features list per tier` - Feature lists
- `renders CTA button per tier` - CTA buttons
- `responsive: stacks on mobile` - Mobile stacking
- `accessible (table semantics or cards)` - Semantic structure
- `validates required props (tiers array)` - Prop validation
- `handles 2-5 tiers gracefully` - Flexible tier count

**Coverage**: Multiple tiers, popular highlighting, features, CTAs, responsive design, accessibility, flexible tier counts

---

## Test Execution Strategy

### Phase 1: Verify All Tests Fail (COMPLETED)
All 60 tests are failing as expected. Components do not exist yet (TDD red phase).

**Verification Command**:
```bash
npm test -- components/content/Hero.spec.tsx \
  components/content/FeatureGrid.spec.tsx \
  components/content/StatsCounter.spec.tsx \
  components/content/Testimonial.spec.tsx \
  components/content/Accordion.spec.tsx \
  components/content/SplitContent.spec.tsx \
  components/content/Timeline.spec.tsx \
  components/content/PricingTable.spec.tsx
```

**Result**: All 60 tests failing with "Cannot find module" errors (expected for TDD)

### Phase 2: Implementation (NEXT)
Implement components in parallel per domain:

1. **Simple Components** (0.3 SP total):
   - FeatureGrid
   - Testimonial
   - StatsCounter

2. **Medium Components** (0.5 SP total):
   - Hero
   - SplitContent
   - Timeline

3. **Complex Components** (0.5 SP total):
   - Accordion (interaction heavy)
   - PricingTable (layout complex)

**Total Implementation**: 1.3 SP

### Phase 3: Test Green (Goal)
All 60 tests passing after implementation.

---

## Test Best Practices Applied

### Mandatory Rules (MUST)

1. **Parameterized inputs** - All tests use named constants (MOCK_HEADING, MOCK_IMAGE, etc.)
2. **Tests can fail for real defects** - Each test validates specific functionality
3. **Test description aligns with assertion** - Names match what tests verify
4. **Independent expectations** - Pre-computed values, not circular logic
5. **Same quality rules as production** - TypeScript strict mode, proper formatting

### Recommended Practices (SHOULD)

6. **Grouped tests by component** - Each file tests one component
7. **Strong assertions over weak** - `toBeInTheDocument()` over `toBeTruthy()`
8. **Edge cases tested** - Long quotes, single items, 2-5 tiers, various date formats
9. **Accessibility tested** - ARIA attributes, semantic HTML, keyboard navigation
10. **Responsive behavior tested** - Mobile, tablet, desktop breakpoints

---

## Success Criteria

- **100% REQ-011 coverage**: All 8 components have comprehensive tests
- **60 tests total**: 7-8 tests per component
- **All tests failing**: TDD red phase confirmed
- **Test quality**: Following CLAUDE.md § Writing Tests Best Practices
- **Ready for implementation**: Clear acceptance criteria in each test

---

## Story Point Breakdown

### Test Development (1.0 SP total)

| Component | Tests | Complexity | SP |
|-----------|-------|------------|-----|
| Hero | 8 | Medium (image, overlays, CTAs) | 0.15 |
| FeatureGrid | 7 | Simple (grid layouts) | 0.1 |
| StatsCounter | 7 | Simple (numbers, animation) | 0.1 |
| Testimonial | 7 | Simple (text, avatar) | 0.1 |
| Accordion | 8 | Medium (interaction, ARIA) | 0.15 |
| SplitContent | 7 | Simple (layout) | 0.1 |
| Timeline | 8 | Medium (connectors, layouts) | 0.15 |
| PricingTable | 8 | Medium (multi-tier, features) | 0.15 |
| **TOTAL** | **60** | - | **1.0** |

### Implementation Estimate (1.3 SP)
- Simple components: 0.3 SP
- Medium components: 0.5 SP
- Complex components: 0.5 SP

**Total Project**: 2.3 SP (tests + implementation)

---

## Next Steps

1. **QCODE**: Implement 8 components to pass all 60 tests
2. **QCHECK**: Review component quality (PE-Reviewer, code-quality-auditor)
3. **QDOC**: Update documentation with component usage examples
4. **QGIT**: Commit passing tests and implementations

---

## References

- **Requirements**: `requirements/new-features.md` (REQ-011)
- **Test Best Practices**: `CLAUDE.md` § 7 (Writing Tests Best Practices)
- **Story Point Estimation**: `docs/project/PLANNING-POKER.md`
- **TDD Flow**: `CLAUDE.md` § 3 (TDD Enforcement Flow)

---

## Test Failure Tracking

No entries yet - all failures are expected TDD red phase (components not implemented).

When implementation bugs are found:
- Log to `.claude/metrics/test-failures.md`
- Schema: Date | Test File | Test Name | REQ-ID | Bug Description | Fix SP | Fix Commit

---

**Document Version**: 1.0
**Created**: 2025-11-21
**Last Updated**: 2025-11-21
**Status**: Tests Complete - Awaiting Implementation
