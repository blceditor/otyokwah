# Requirements Lock: Production Gap Fixes (Phase 1 - P0)

**Date**: 2025-12-03
**Objective**: Integrate existing homepage components to close gaps between current production site and mockup design.
**Priority**: P0 (Critical for homepage conversion)
**Parent Document**: `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/docs/tasks/production-audit-and-fixes.md`

---

## Context

Post-migration fixes (REQ-PM-001 to REQ-PM-009) are complete. The homepage currently uses HomepageTemplate for hero/body/gallery/CTA, but is missing key conversion components identified in the mockup. All missing components already exist in `components/homepage/*` and just need Keystatic integration and testing.

**Strategy**: Path A (Component Composition) - Compose standalone components in `app/page.tsx` for maximum flexibility.

---

## REQ-PROD-001: TrustBar Component Integration (P0 - 0.5 SP)

**Description**: Integrate existing TrustBar component into homepage with sticky behavior and Keystatic CMS support.

**Component**: `components/homepage/TrustBar.tsx` (EXISTS)

**Acceptance Criteria**:
1. TrustBar appears at top of homepage (above hero section)
2. Sticky behavior on scroll (remains visible when scrolling down)
3. Horizontal scroll on mobile viewport (< 768px width)
4. All 5 trust signals render from CMS data:
   - ACA Accredited
   - 500+ Families Served
   - Since 1948
   - 4.9/5 Star Rating
   - 80% Return Rate
5. Trust items editable via Keystatic singleton (`content/homepage/trust-bar.yaml`)
6. ARIA labels present for screen readers
7. Z-index ensures sticky bar appears above content but below modals

**Non-Goals**:
- Auto-rotating trust signals
- Click tracking analytics

**Tests Required**: 5 tests
- Renders trust bar with all items
- Sticky position applies on scroll
- Mobile horizontal scroll behavior
- Content loads from CMS
- Accessibility attributes present

---

## REQ-PROD-002: MissionSection Component Integration (P0 - 0.5 SP)

**Description**: Integrate existing Mission component with background image, parallax effect, and handwritten kicker text.

**Component**: `components/homepage/Mission.tsx` (EXISTS)

**Acceptance Criteria**:
1. Mission section displays below TrustBar (after hero in visual flow)
2. Background image renders with `background-attachment: fixed` (parallax on desktop)
3. Black overlay (40% opacity) over background image for text contrast
4. Handwritten kicker text in Caveat font (e.g., "Our Purpose")
5. Mission statement and description text render from CMS
6. Parallax effect disabled on mobile (< 1024px) for performance
7. All content editable via Keystatic singleton (`content/homepage/mission.yaml`)
8. Respects `prefers-reduced-motion: reduce` (disables parallax)

**Non-Goals**:
- Video background
- Animation effects beyond parallax

**Tests Required**: 6 tests
- Renders mission section with background image
- Overlay opacity correct
- Kicker uses Caveat font
- Parallax CSS applied (desktop only)
- Content loads from CMS
- Reduced motion respected

---

## REQ-PROD-003: ProgramCard Grid Integration (P0 - 1.0 SP)

**Description**: Integrate existing Programs and ProgramCard components to display Jr High and Sr High summer camp programs with hover effects.

**Components**:
- `components/homepage/Programs.tsx` (EXISTS)
- `components/homepage/ProgramCard.tsx` (EXISTS)

**Acceptance Criteria**:
1. Programs section displays below Mission section
2. 2-card grid layout (1 col mobile, 2 col tablet+)
3. Each card displays:
   - Program image (from existing program pages)
   - Program title (Jr High / Senior High)
   - Age range
   - Feature bullets (3-4 key highlights)
   - "Learn More" CTA button linking to program detail page
4. Hover effects implemented:
   - Card lifts on hover (`transform: translateY(-8px)`)
   - Image zooms slightly (`transform: scale(1.05)`)
   - Smooth transition (300ms ease-in-out)
5. Program data sourced from existing program pages (jr-high, senior-high)
6. Feature bullets editable via Keystatic (extend program template fields)
7. Responsive grid behavior works on all viewports
8. Touch devices show hover state on tap

**Non-Goals**:
- More than 2 program cards on homepage
- Video thumbnails

**Tests Required**: 8 tests
- Renders 2-card grid
- Card content displays correctly
- Hover lift effect applies
- Image zoom effect applies
- Responsive layout (1/2 columns)
- CTA links to program pages
- Touch tap shows hover state
- Accessibility (keyboard navigation, focus states)

---

## REQ-PROD-004: Homepage Component Integration (P0 - 1.5 SP)

**Description**: Refactor `app/page.tsx` to compose all P0 components with HomepageTemplate sections.

**File**: `app/page.tsx`

**Acceptance Criteria**:
1. Homepage renders components in this order:
   - TrustBar (sticky at top)
   - HomepageTemplate (hero section only - extract hero from template)
   - Mission section
   - Programs grid
   - HomepageTemplate (body content section)
   - HomepageTemplate (gallery section)
   - HomepageTemplate (CTA section)
2. Keystatic singletons created:
   - `content/homepage/trust-bar.yaml`
   - `content/homepage/mission.yaml`
3. Reader logic fetches all required data:
   - Page content from `index.mdoc`
   - TrustBar from singleton
   - Mission from singleton
   - Program data from program pages
4. Proper spacing between sections (consistent with design system)
5. No layout shifts or content overlap
6. Smooth scroll behavior between sections
7. All content editable in Keystatic admin
8. Performance: LCP < 2.5s on production

**Integration Pattern**:
```tsx
export default async function Home() {
  const page = await reader.collections.pages.read('index');
  const trustBar = await reader.singletons.trustBar.read();
  const mission = await reader.singletons.mission.read();
  const programs = await Promise.all([
    reader.collections.pages.read('summer-camp-junior-high'),
    reader.collections.pages.read('summer-camp-senior-high'),
  ]);

  return (
    <>
      <TrustBar items={trustBar.items} />
      {/* Hero from HomepageTemplate or separate Hero component */}
      <Mission {...mission} />
      <Programs programs={programs} />
      {/* Body content, gallery, CTA from HomepageTemplate or separate components */}
    </>
  );
}
```

**Non-Goals**:
- Refactoring HomepageTemplate itself (keep as-is)
- Adding P1 or P2 components in this phase

**Tests Required**: 10 integration tests
- Homepage renders all P0 components
- Components render in correct order
- TrustBar sticky behavior works
- Mission section displays with parallax
- Programs grid displays with 2 cards
- Gallery section renders
- CTA section renders
- All data loads from CMS
- No layout shifts (CLS < 0.1)
- Performance acceptable (LCP < 2.5s)

---

## Test Coverage Matrix

| REQ-ID | Component | Test File | Tests | Status |
|--------|-----------|-----------|-------|--------|
| REQ-PROD-001 | TrustBar | `components/homepage/TrustBar.integration.spec.tsx` | 5 | ❌ Pending |
| REQ-PROD-002 | Mission | `components/homepage/Mission.integration.spec.tsx` | 6 | ❌ Pending |
| REQ-PROD-003 | Programs | `components/homepage/Programs.integration.spec.tsx` | 8 | ❌ Pending |
| REQ-PROD-004 | Homepage | `app/page.production.spec.tsx` | 10 | ❌ Pending |

**Total**: 29 new integration tests (all must FAIL before implementation)

---

## Keystatic Schema Additions

### New Singletons

**1. Trust Bar** (`content/homepage/trust-bar.yaml`):
```yaml
items:
  - icon: "🏆"
    text: "ACA Accredited"
  - icon: "👨‍👩‍👧‍👦"
    text: "500+ Families Served"
  - icon: "📅"
    text: "Since 1948"
  - icon: "⭐"
    text: "4.9/5 Star Rating"
  - icon: "🔄"
    text: "80% Return Rate"
```

**2. Mission Section** (`content/homepage/mission.yaml`):
```yaml
kicker: "Our Purpose"
statement: "To Know Christ - Phil. 3:10"
description: "Bear Lake Camp is a Christ-centered ministry..."
backgroundImage: "/images/homepage/mission-background.jpg"
```

### Schema Updates in `keystatic.config.ts`:
```typescript
singletons: {
  trustBar: singleton({
    label: 'Trust Bar',
    path: 'content/homepage/trust-bar',
    schema: {
      items: fields.array(
        fields.object({
          icon: fields.text({ label: 'Icon (emoji)' }),
          text: fields.text({ label: 'Text' }),
        }),
        { label: 'Trust Items', itemLabel: props => props.fields.text.value }
      ),
    },
  }),

  mission: singleton({
    label: 'Mission Section',
    path: 'content/homepage/mission',
    schema: {
      kicker: fields.text({ label: 'Kicker (handwritten accent)' }),
      statement: fields.text({ label: 'Mission Statement' }),
      description: fields.text({ label: 'Description', multiline: true }),
      backgroundImage: fields.image({
        label: 'Background Image',
        directory: 'public/images/homepage',
        publicPath: '/images/homepage/',
      }),
    },
  }),
}
```

---

## Implementation Tracks (Parallel Execution)

### Track A: TrustBar Integration (REQ-PROD-001)
**Agent**: sde-iii
**SP**: 0.5
1. Create TrustBar singleton schema in keystatic.config.ts
2. Create content/homepage/trust-bar.yaml with default data
3. Update app/page.tsx to fetch and render TrustBar
4. Verify sticky behavior CSS
5. Test mobile horizontal scroll

### Track B: Mission Integration (REQ-PROD-002)
**Agent**: sde-iii
**SP**: 0.5
1. Create Mission singleton schema in keystatic.config.ts
2. Create content/homepage/mission.yaml with default data
3. Update app/page.tsx to fetch and render Mission
4. Verify parallax CSS (desktop only)
5. Test reduced motion support

### Track C: Programs Integration (REQ-PROD-003)
**Agent**: sde-iii
**SP**: 1.0
1. Read existing program pages (jr-high, senior-high)
2. Extract program data (title, age, image, features)
3. Update app/page.tsx to fetch and render Programs grid
4. Verify hover effects (lift + zoom)
5. Test responsive grid behavior

### Track D: Homepage Composition (REQ-PROD-004)
**Agent**: implementation-coordinator
**SP**: 1.5
**Dependencies**: Tracks A, B, C
1. Refactor app/page.tsx to compose all components
2. Ensure proper section ordering
3. Add spacing between sections
4. Create integration tests
5. Verify performance (LCP, CLS)

---

## Story Points Summary

| Track | Component | SP | Dependencies |
|-------|-----------|-----|--------------|
| A | TrustBar | 0.5 | None |
| B | Mission | 0.5 | None |
| C | Programs | 1.0 | None |
| D | Homepage | 1.5 | A, B, C |
| **Total** | | **3.5 SP** | |

**Additional Overhead**:
- Test Writing (QCODET): 0.8 SP
- Test Review (QCHECKT): 0.2 SP
- Code Review (QCHECK): 0.5 SP
- Fixes Loop: 0.5 SP
- **Grand Total: 5.5 SP**

---

## Success Criteria

### Pre-Deployment Gates
- [ ] All 29 integration tests passing
- [ ] `npm run typecheck` passes
- [ ] `npm test` passes
- [ ] `npm run lint` passes
- [ ] No P0 or P1 issues from code review
- [ ] Lighthouse Performance ≥ 80
- [ ] Lighthouse Accessibility ≥ 90

### Production Verification (prelaunch.bearlakecamp.com)
- [ ] TrustBar appears at top and stays sticky on scroll
- [ ] Mission section displays with parallax effect (desktop)
- [ ] Programs grid shows 2 cards with hover effects
- [ ] All components render in correct order
- [ ] Gallery and CTA sections still work
- [ ] All content editable in Keystatic
- [ ] Mobile responsive on all screen sizes
- [ ] LCP < 2.5s on mobile 3G
- [ ] CLS < 0.1
- [ ] No console errors

---

## Related Requirements

**Completed**:
- REQ-PM-001 to REQ-PM-009: Post-migration fixes

**Current (This Phase)**:
- REQ-PROD-001: TrustBar Integration
- REQ-PROD-002: Mission Integration
- REQ-PROD-003: Programs Integration
- REQ-PROD-004: Homepage Composition

**Future (P1 Phase 2)**:
- REQ-PROD-005: Testimonials
- REQ-PROD-006: Instagram Feed
- REQ-PROD-007: Contact Section Enhancement
- REQ-PROD-008: Mobile Sticky CTA
- REQ-PROD-009: Footer Enhancement

**Future (P2 Phase 3)**:
- REQ-PROD-010: Handwritten Font Accents
- REQ-PROD-011: Scroll Animations
- REQ-PROD-012: Accessibility Audit

---

## Non-Goals (Explicitly Out of Scope)

- Video backgrounds for hero or mission sections
- P1 or P2 components (separate phases)
- Refactoring existing HomepageTemplate component
- Animation library integration
- Instagram API integration
- Advanced analytics tracking
- A/B testing framework
- Content versioning

---

## Document Metadata

**Status**: Lock Snapshot
**Phase**: Phase 1 - P0 Critical Components
**Total Requirements**: 4 (REQ-PROD-001 to REQ-PROD-004)
**Total Tests**: 29 integration tests
**Total Story Points**: 5.5 SP (includes overhead)
**Parent Document**: `docs/tasks/production-audit-and-fixes.md`
**Date**: 2025-12-03
