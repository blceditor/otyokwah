# Requirements Lock - Keystatic UI Integration

**Task ID**: KEYSTATIC-INTEGRATION-2025-11-22
**Snapshot Date**: 2025-11-22
**Status**: BLOCKED - API CONSTRAINTS IDENTIFIED
**Total Story Points**: 0 SP (features not achievable with current Keystatic API)
**Context**: CAPA-2025-11-22 - Fix orphaned components

---

## CRITICAL UPDATE: API Limitation Identified (2025-11-22)

**Status**: BLOCKED BY KEYSTATIC API CONSTRAINTS

**Finding**: Research into Keystatic v0.5.48 type definitions confirms that custom header components are NOT supported by the API.

**Evidence**:
- `ui.header` property does NOT exist in Keystatic config schema
- `makePage()` function does not accept wrapper components or children
- Source: `@keystatic/core/dist/declarations/src/config.d.ts` (lines 48-54)
- Type definition shows ONLY `ui.brand` and `ui.navigation` are supported

**Impact on Requirements**:
- REQ-INTEGRATE-001 (KeystaticWrapper): BLOCKED - wrapper pattern not supported by Keystatic
- REQ-INTEGRATE-002 (ui.header config): BLOCKED - property doesn't exist in Keystatic API
- REQ-INTEGRATE-003 (Component Visibility): BLOCKED - cannot verify components that can't be integrated

**Alternative Approach** (Phase 2 - Future Task):
- Create separate `/keystatic-tools` page with ProductionLink, DeploymentStatus, BugReportModal, SparkryBranding
- Use `ui.brand` for minimal branding customization (ONLY supported option)
- Link from Keystatic admin to tools page
- Estimated: 5 SP for Phase 2 implementation

**Decision**: Stakeholder approval received on 2025-11-22 to:
1. Fix test infrastructure (Phase 1 - 8 SP) - IN PROGRESS
2. Plan alternative approach for Phase 2

**Current Task**: REQ-FIX-001 through REQ-FIX-005 (fix test crashes, align with technical reality)

---

## REQ-INTEGRATE-001: KeystaticWrapper Component

**Status**: BLOCKED - API Limitation
**Story Points**: 0 SP (not achievable with current Keystatic API)

### Description

Create a wrapper component that renders all header components in the Keystatic admin UI. This component acts as the integration layer between individual header components and the Keystatic page layout.

### Blocker

Keystatic does NOT support wrapper components or custom header injection. The `makePage()` function from `@keystatic/next/ui/app` returns a complete, self-contained UI component that cannot be wrapped or customized with header elements.

**Technical Evidence**:
- `makePage()` signature: `function makePage(config: Config): React.ComponentType`
- No parameters for wrapper components, header components, or children
- Returned component is a black box with no customization hooks

### Original Acceptance Criteria (NOT ACHIEVABLE)

- Component file exists at `app/keystatic/KeystaticWrapper.tsx` - BLOCKED
- Wrapper renders all header components - BLOCKED (no wrapper pattern possible)
- Wrapper accepts `children` prop - BLOCKED (makePage doesn't accept children)
- Header has fixed positioning - BLOCKED (cannot customize Keystatic's UI)
- Component is a Client Component - BLOCKED (component cannot exist)

### Non-Goals

- GenerateSEOButton integration (separate requirement, context-dependent)
- Custom styling beyond header/content layout
- State management (components manage their own state)

### Notes

- This component is the missing integration layer identified in CAPA-2025-11-22
- Must verify components are VISIBLE in rendered output, not just imported

---

## REQ-INTEGRATE-002: Page Integration

**Status**: BLOCKED - API Limitation
**Story Points**: 0 SP (not achievable with current Keystatic API)

### Description

~~Update the Keystatic configuration to render custom header components in the Keystatic admin UI using the `ui.header` option.~~

**BLOCKED**: The `ui.header` property does NOT exist in Keystatic's config API.

### Blocker

Keystatic config does NOT support `ui.header` property. Type definition shows ONLY these properties are supported:

```typescript
type UserInterface = {
  brand?: { mark?: BrandMark; name: string };
  navigation?: Navigation<...>;
};
```

No `ui.header` property exists in Keystatic v0.5.48.

### Original Acceptance Criteria (NOT ACHIEVABLE)

- `keystatic.config.ts` includes `ui.header` - BLOCKED (property doesn't exist)
- Header renders all 4 components - BLOCKED (cannot add custom header)
- Pattern: `config({ ui: { header: <CustomHeader /> } })` - BLOCKED (invalid TypeScript)
- Page still uses dynamic import - ACHIEVABLE (page works as-is)
- TypeScript compiles - ACHIEVABLE (after removing invalid ui.header references)
- No console errors - ACHIEVABLE (Keystatic works as designed)

### Non-Goals

- Changing KeystaticApp loading behavior
- Adding additional pages
- Creating wrapper components (use Keystatic's built-in UI customization)

### ~~Integration Pattern~~ (INVALID - DOES NOT WORK)

```tsx
// keystatic.config.ts
// ❌ THIS PATTERN DOES NOT WORK - ui.header doesn't exist
export default config({
  storage: storageConfig,
  ui: {
    header: <CustomHeader />, // ❌ Type error: Property 'header' does not exist
  },
  collections: {
    // ...
  },
});
```

### Actual Supported Pattern (Brand Customization Only)

```tsx
// keystatic.config.ts
// ✅ THIS IS THE ONLY CUSTOMIZATION SUPPORTED
export default config({
  storage: storageConfig,
  ui: {
    brand: {
      name: "Bear Lake Camp CMS",
      mark: OptionalLogoComponent, // optional custom logo
    },
    navigation: {
      // optional nav structure customization
    },
  },
  collections: {
    // ...
  },
});
```

---

## REQ-INTEGRATE-003: Component Visibility Verification

**Status**: BLOCKED - Depends on REQ-INTEGRATE-001 and REQ-INTEGRATE-002
**Story Points**: 0 SP (cannot verify components that can't be integrated)

### Description

Verify that all header components are actually visible and accessible in the integrated Keystatic UI, not just rendered in the React tree.

### Acceptance Criteria

- [ ] DeploymentStatus component is in the document
- [ ] ProductionLink component is in the document
- [ ] BugReportModal trigger button is in the document
- [ ] SparkryBranding component is in the document
- [ ] All components have proper ARIA labels for accessibility
- [ ] Components can be found by screen readers
- [ ] Components respond to user interactions (click, keyboard)
- [ ] Header layout doesn't cause layout shift (CLS = 0)

### Test Requirements

**Unit Tests**: Verify wrapper renders components
**Integration Tests**: Verify page uses wrapper
**Visual Tests**: Verify components visible in DOM

### Non-Goals

- E2E browser tests (covered by manual verification)
- Performance benchmarking
- Cross-browser compatibility testing (assumes modern browsers)

---

## Cross-Cutting Requirements

### Accessibility

- All interactive elements have ARIA labels
- Keyboard navigation works for all components
- Focus indicators visible
- Screen reader announces component presence

### Performance

- No hydration mismatches (client/server rendering)
- Header rendering < 100ms
- No layout shift from header positioning

### Browser Compatibility

- Chrome (desktop + mobile)
- Safari (desktop + iOS)
- Firefox (desktop)
- Edge (desktop)

---

## Test Strategy

### Unit Tests (REQ-INTEGRATE-001)

**File**: `app/keystatic/__tests__/KeystaticWrapper.test.tsx`

- Wrapper renders all 4 header components
- Wrapper renders children prop
- Header has fixed positioning
- Components have proper z-index

**Expected Failures Before Implementation**:

- "Cannot find module './KeystaticWrapper'" - component doesn't exist
- "Expected component to be in document" - integration not done

### Integration Tests (REQ-INTEGRATE-002)

**File**: `app/keystatic/[[...params]]/__tests__/page.integration.test.tsx`

- Page imports KeystaticWrapper
- Page wraps KeystaticApp with wrapper
- Full integration renders all components

**Expected Failures Before Implementation**:

- "KeystaticWrapper is not imported" - import missing
- "KeystaticApp not wrapped" - integration incomplete

### Component Visibility Tests (REQ-INTEGRATE-003)

**File**: `app/keystatic/__tests__/KeystaticWrapper.test.tsx` (extended)

- DeploymentStatus found by screen reader
- ProductionLink accessible by keyboard
- BugReportModal trigger has ARIA label
- SparkryBranding visible in DOM tree

**Expected Failures Before Implementation**:

- "Unable to find element" - components not in DOM
- "Component not visible" - wrapper not rendering components

---

## Success Metrics

### Completion Criteria

- [ ] All 3 REQ-IDs have passing tests
- [ ] All components visible at http://localhost:3000/keystatic
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Screenshot evidence of integrated UI

### Verification Checklist

- [ ] Run `npm run dev`
- [ ] Navigate to http://localhost:3000/keystatic
- [ ] Verify all 4 components visible in header
- [ ] Click each component, verify functionality
- [ ] Run `npm test` - all integration tests pass
- [ ] Run `npm run typecheck` - no errors

---

## Dependencies & Blockers

### Dependencies

- Existing components: ProductionLink, DeploymentStatus, BugReportModal, SparkryBranding (✅ Complete)
- Testing infrastructure: Vitest, @testing-library/react (✅ Available)
- Next.js dynamic imports (✅ Available)

### Blockers

- None (all dependencies satisfied)

---

## Story Point Breakdown

| Requirement       | Development | Testing    | Total      |
| ----------------- | ----------- | ---------- | ---------- |
| REQ-INTEGRATE-001 | 1.0 SP      | 1.0 SP     | 2.0 SP     |
| REQ-INTEGRATE-002 | 0.5 SP      | 0.5 SP     | 1.0 SP     |
| REQ-INTEGRATE-003 | 1.0 SP      | 1.0 SP     | 2.0 SP     |
| **TOTAL**         | **2.5 SP**  | **2.5 SP** | **5.0 SP** |

---

## Related Documents

- **CAPA Report**: `docs/project/CAPA-2025-11-22-KEYSTATIC-INTEGRATION-FAILURE.md`
- **Existing Components**: `components/keystatic/*.tsx`
- **Existing Unit Tests**: `components/keystatic/*.spec.tsx`
- **Current Page**: `app/keystatic/[[...params]]/page.tsx`

---

**Document Version**: 1.0
**Last Updated**: 2025-11-22
