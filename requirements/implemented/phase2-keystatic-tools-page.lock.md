# Requirements Lock: Phase 2 - Keystatic Tools Page

**Task ID**: PHASE2-KEYSTATIC-TOOLS
**Date**: 2025-11-22
**Story Points Total**: 5.0 SP
**Status**: Planning Complete
**Context**: CAPA-2025-11-22 identified that Keystatic v0.5.48 does not support `ui.header` customization. Phase 2 implements Option A: Create dedicated `/keystatic-tools` page with all CMS components, accessible via Keystatic navigation.

---

## Requirements

### REQ-TOOLS-001: Create /keystatic-tools Page Component (2.0 SP)
**Priority**: P0
**Type**: Feature Implementation

**Acceptance Criteria**:
- [ ] Page component exists at `app/keystatic-tools/page.tsx`
- [ ] Page renders all 5 CMS components:
  - ProductionLink (view live pages)
  - DeploymentStatus (real-time deployment tracking)
  - BugReportModal (GitHub issue creation)
  - SparkryBranding (Powered by Sparkry.ai)
  - GenerateSEOButton (AI-powered SEO generation)
- [ ] Components organized in logical sections:
  - Production & Deployment (ProductionLink, DeploymentStatus)
  - Content Tools (GenerateSEOButton)
  - Support (BugReportModal, SparkryBranding)
- [ ] Page is responsive (mobile, tablet, desktop)
- [ ] Page meets WCAG 2.1 AA accessibility standards
- [ ] TypeScript compiles with no errors
- [ ] No console errors when page loads

**Non-Goals**:
- Custom Keystatic header integration (blocked by API constraints)
- Automatic page context detection (components designed to work standalone or with context)

**Test Requirements**:
- Unit test: Page renders without crashing
- Unit test: All 5 components are present in DOM
- Unit test: Sections have correct headings
- Integration test: Page accessible at `/keystatic-tools` route
- E2E test: Page loads in browser without errors
- Accessibility test: Keyboard navigation works, aria labels correct

---

### REQ-TOOLS-002: Add Keystatic Navigation Link (1.0 SP)
**Priority**: P0
**Type**: Configuration

**Acceptance Criteria**:
- [ ] `keystatic.config.ts` updated with `ui.navigation` property
- [ ] Navigation link labeled "CMS Tools" or "Tools"
- [ ] Link points to `/keystatic-tools` route
- [ ] Link appears in Keystatic admin sidebar navigation
- [ ] Clicking link navigates user to tools page
- [ ] TypeScript type checking passes for config changes
- [ ] Config change does not break existing collections/pages

**API Constraints** (verified via `@keystatic/core` type definitions):
- `ui.navigation` property IS supported (verified in `config.d.ts`)
- Format: `navigation?: Navigation<Collections, Singletons>`
- Allows custom navigation structure with links to pages

**Test Requirements**:
- Unit test: Config exports valid `ui.navigation` object
- Unit test: Navigation includes "Tools" key
- Integration test: Keystatic config loads without errors
- E2E test: Navigate to `/keystatic`, verify sidebar contains "Tools" link
- E2E test: Click "Tools" link, verify navigation to `/keystatic-tools`

---

### REQ-TOOLS-003: Component Integration with Props (1.0 SP)
**Priority**: P0
**Type**: Integration

**Acceptance Criteria**:
- [ ] All 5 components imported correctly from `@/components/keystatic/`
- [ ] Components receive required props:
  - BugReportModal: `pageContext` with default slug
  - GenerateSEOButton: `pageContent` and `onSEOGenerated` handler
  - ProductionLink: No props required (uses Next.js pathname hook)
  - DeploymentStatus: No props required (fetches from API)
  - SparkryBranding: No props required
- [ ] Prop types match component interfaces (no TypeScript errors)
- [ ] Components render with default/placeholder data when no context available
- [ ] No runtime errors in browser console

**Implementation Notes**:
- BugReportModal: Use default pageContext `{ slug: 'keystatic-tools' }`
- GenerateSEOButton: Use placeholder pageContent or disable if no active page
- ProductionLink: Will show link to `/keystatic-tools` when on that page

**Test Requirements**:
- Unit test: Each component renders with provided props
- Unit test: No prop type mismatches (TypeScript compile check)
- Integration test: Components work together without conflicts
- E2E test: Click BugReportModal button, verify modal opens
- E2E test: Verify ProductionLink shows correct URL

---

### REQ-TOOLS-004: End-to-End User Journey Verification (1.0 SP)
**Priority**: P0
**Type**: Quality Assurance

**Acceptance Criteria**:
- [ ] **Local Verification**:
  - [ ] Run `npm run dev`
  - [ ] Navigate to `http://localhost:3000/keystatic`
  - [ ] Verify "Tools" link in sidebar
  - [ ] Click "Tools" link
  - [ ] Verify all 5 components visible on `/keystatic-tools` page
  - [ ] Test each component interaction (click buttons, verify responses)
  - [ ] Check browser console (zero errors)
- [ ] **Staging Verification**:
  - [ ] Deploy to staging environment
  - [ ] Navigate to `https://prelaunch.bearlakecamp.com/keystatic`
  - [ ] Repeat all local verification steps
  - [ ] Verify API integrations work (DeploymentStatus, BugReportModal, GenerateSEOButton)
- [ ] **Evidence Collection**:
  - [ ] Screenshot: Keystatic sidebar showing "Tools" link
  - [ ] Screenshot: `/keystatic-tools` page showing all components
  - [ ] Video: User clicking through all components (optional)

**Blocker Conditions**:
- If ANY component missing from page → BLOCK deployment
- If ANY component throws console error → BLOCK deployment
- If navigation link missing → BLOCK deployment
- If TypeScript compilation fails → BLOCK deployment

**Test Requirements**:
- E2E test (Playwright): Full user journey from `/keystatic` to `/keystatic-tools`
- E2E test: Verify each component interactive
- Visual regression test: Screenshot diff against baseline
- Manual test: Stakeholder approval required before production deployment

---

## Dependencies

### Existing Components (Already Implemented)
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/keystatic/ProductionLink.tsx`
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/keystatic/DeploymentStatus.tsx`
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/keystatic/BugReportModal.tsx`
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/keystatic/SparkryBranding.tsx`
- `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/keystatic/GenerateSEOButton.tsx`

### API Routes (Already Implemented)
- `/api/vercel-status` (for DeploymentStatus)
- `/api/submit-bug` (for BugReportModal)
- `/api/generate-seo` (for GenerateSEOButton)

### Environment Variables (Required)
- `VERCEL_TOKEN` (for DeploymentStatus)
- `VERCEL_PROJECT_ID` (for DeploymentStatus)
- `GITHUB_TOKEN` (for BugReportModal)
- `UNIVERSAL_LLM_KEY` (optional, for GenerateSEOButton)

### Keystatic API Constraints (Verified)
- `ui.header` → NOT supported (Phase 1 discovery)
- `ui.navigation` → SUPPORTED (verified in `@keystatic/core` types)
- `ui.brand` → SUPPORTED (minimal branding only)

---

## Technical Approach

### File Structure
```
app/
  keystatic-tools/
    page.tsx                    # Main page component (REQ-TOOLS-001)
    layout.tsx                  # Optional: Custom layout for tools page
    __tests__/
      page.test.tsx             # Unit tests (REQ-TOOLS-001, REQ-TOOLS-003)
      page.integration.test.tsx # Integration tests (REQ-TOOLS-001, REQ-TOOLS-003)
      page.e2e.test.ts          # E2E tests (REQ-TOOLS-004)

keystatic.config.ts             # Update with ui.navigation (REQ-TOOLS-002)
```

### Implementation Pattern

#### 1. Page Component (`app/keystatic-tools/page.tsx`)
```typescript
'use client';

import { useState } from 'react';
import { ProductionLink } from '@/components/keystatic/ProductionLink';
import { DeploymentStatus } from '@/components/keystatic/DeploymentStatus';
import { BugReportModal } from '@/components/keystatic/BugReportModal';
import { SparkryBranding } from '@/components/keystatic/SparkryBranding';
import { GenerateSEOButton } from '@/components/keystatic/GenerateSEOButton';

export default function KeystaticToolsPage() {
  // Default page context for bug reports
  const defaultPageContext = {
    slug: 'keystatic-tools',
    timestamp: new Date().toISOString(),
  };

  // Placeholder page content for SEO button
  const [pageContent] = useState({
    title: 'CMS Tools',
    body: 'Keystatic CMS tools and utilities page',
  });

  const handleSEOGenerated = (seoData: any) => {
    console.log('Generated SEO:', seoData);
    // Could show notification or copy to clipboard
  };

  return (
    <div className="container mx-auto p-8 space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">CMS Tools</h1>
        <p className="text-gray-600 mt-2">
          Utilities and tools for managing your content
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">
          Production & Deployment
        </h2>
        <div className="flex flex-wrap gap-4">
          <ProductionLink />
          <DeploymentStatus />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">
          Content Tools
        </h2>
        <GenerateSEOButton
          pageContent={pageContent}
          onSEOGenerated={handleSEOGenerated}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Support</h2>
        <div className="flex flex-wrap gap-4 items-center">
          <BugReportModal pageContext={defaultPageContext} />
          <SparkryBranding />
        </div>
      </section>
    </div>
  );
}
```

#### 2. Keystatic Config Update (`keystatic.config.ts`)
```typescript
// Add after line 34 (before collections)
export default config({
  storage: storageConfig,

  ui: {
    navigation: {
      'Content': ['pages', 'staff'],  // Group existing collections
      'Tools': ['/keystatic-tools'],   // Add tools page link
    },
  },

  collections: {
    // ... existing collections
  },
});
```

**Note**: Verify `ui.navigation` syntax with Keystatic docs. May need to use different format based on actual API.

---

## Story Point Breakdown

| REQ-ID | Task | SP | Justification |
|--------|------|-----|---------------|
| REQ-TOOLS-001 | Create page component | 2.0 | New page, 5 component integrations, responsive layout, accessibility |
| REQ-TOOLS-002 | Add navigation link | 1.0 | Config update, verify API syntax, test integration |
| REQ-TOOLS-003 | Component integration | 1.0 | Props handling, TypeScript types, error handling |
| REQ-TOOLS-004 | E2E verification | 1.0 | Manual testing, screenshot evidence, staging deployment |
| **Total** | **Phase 2** | **5.0 SP** | |

**Baseline**: 1 SP = Simple authenticated API endpoint (key→value, secured, tested, deployed, documented)

**Complexity Factors**:
- REQ-TOOLS-001: Higher SP due to multiple component integrations, layout design, accessibility requirements
- REQ-TOOLS-002: Moderate SP due to API verification step (learned from Phase 1 CAPA)
- REQ-TOOLS-003: Moderate SP due to prop type verification and integration testing
- REQ-TOOLS-004: Moderate SP due to comprehensive E2E testing and manual verification

---

## TDD Workflow Execution Order

### Phase 1: Test-Driven Development (QCODET)
**Owner**: test-writer agent
**Output**: Failing tests for all 4 REQs

1. Write unit tests for `app/keystatic-tools/page.tsx`:
   - Page renders without crashing
   - All 5 components present in DOM
   - Sections have correct structure
   - Props passed correctly to components

2. Write integration tests for navigation:
   - Config exports valid `ui.navigation`
   - Navigation includes tools page link
   - Route `/keystatic-tools` is accessible

3. Write E2E tests:
   - Navigate to `/keystatic` → see "Tools" link
   - Click "Tools" → navigate to `/keystatic-tools`
   - All components visible and interactive

**Verification**: All tests MUST fail initially (no implementation yet)

---

### Phase 2: Implementation (QCODE)
**Owner**: sde-iii agent
**Output**: Code that makes tests pass

1. Create `app/keystatic-tools/page.tsx` (REQ-TOOLS-001)
2. Update `keystatic.config.ts` with navigation (REQ-TOOLS-002)
3. Verify component imports and props (REQ-TOOLS-003)
4. Run tests, fix any failures

**Verification**: All tests pass, TypeScript compiles, no console errors

---

### Phase 3: Quality Review (QCHECK)
**Owner**: pe-reviewer, code-quality-auditor
**Output**: Code review feedback, P0/P1 recommendations

**Checklist**:
- [ ] All components imported correctly
- [ ] No prop type mismatches
- [ ] Accessibility: proper heading hierarchy (h1 → h2)
- [ ] Accessibility: keyboard navigation works
- [ ] Responsive design: mobile, tablet, desktop
- [ ] Integration verification: Components actually integrated (not orphaned)
- [ ] Config verification: `ui.navigation` syntax correct per Keystatic docs
- [ ] Screenshot evidence: Tools page visible in UI

**Integration Verification** (CRITICAL per CAPA-2025-11-22):
- [ ] Component imported in `keystatic.config.ts`? YES/NO
- [ ] Navigation link exists in config? YES/NO
- [ ] Page accessible at `/keystatic-tools`? YES/NO
- [ ] Screenshot shows components in UI? YES/NO

---

### Phase 4: Fix P0/P1 Issues (QPLAN + QCODE + QCHECK)
**Owner**: planner → sde-iii → pe-reviewer
**Output**: All critical issues resolved

1. Planner creates fix plan for P0/P1 recommendations
2. SDE-III implements fixes
3. PE-Reviewer verifies fixes

**Verification**: Zero P0 issues, P1 issues resolved or deferred with justification

---

### Phase 5: E2E Verification (REQ-TOOLS-004)
**Owner**: QA team, stakeholder
**Output**: Manual verification evidence

**Local Verification**:
1. Run `npm run dev`
2. Navigate to `http://localhost:3000/keystatic`
3. Verify "Tools" link in sidebar
4. Click link, verify navigation to `/keystatic-tools`
5. Verify all 5 components visible
6. Test each component:
   - ProductionLink: Click, verify new tab opens to prelaunch.bearlakecamp.com
   - DeploymentStatus: Verify shows Published/Deploying/Failed/Draft
   - BugReportModal: Click, verify modal opens, test form submission
   - GenerateSEOButton: Click, verify generates SEO (or shows error if no API key)
   - SparkryBranding: Verify logo and link to sparkry.ai
7. Check browser console: zero errors
8. Take screenshots

**Staging Verification**:
1. Deploy to `https://prelaunch.bearlakecamp.com`
2. Repeat all local verification steps
3. Verify environment variables set correctly (API integrations work)
4. Stakeholder review and approval

**Evidence**:
- Screenshot: Keystatic sidebar showing "Tools" link
- Screenshot: `/keystatic-tools` page showing all components
- Browser console log (zero errors)
- Stakeholder sign-off: "I can see and use all features"

---

### Phase 6: Documentation (QDOC)
**Owner**: docs-writer
**Output**: User documentation

**Files to Update**:
- `docs/operations/KEYSTATIC-ADMIN-GUIDE.md` (if exists)
  - Add section: "CMS Tools Page"
  - Document each tool's purpose and usage
- `docs/technical/KEYSTATIC-CUSTOM-UI-INTEGRATION.md`
  - Update with Phase 2 implementation details
  - Document why `/keystatic-tools` page approach was chosen
  - Reference CAPA-2025-11-22 for context

**Content**:
```markdown
## CMS Tools Page

### Accessing Tools
1. Navigate to Keystatic admin: `https://prelaunch.bearlakecamp.com/keystatic`
2. Click "Tools" in sidebar navigation
3. Access all CMS utilities on one page

### Available Tools
- **ProductionLink**: View live pages on production site
- **DeploymentStatus**: Real-time deployment tracking
- **BugReportModal**: Submit bugs directly to GitHub
- **GenerateSEOButton**: AI-powered SEO metadata generation
- **SparkryBranding**: Credits and link to Sparkry.ai
```

---

### Phase 7: Commit and Deploy (QGIT)
**Owner**: release-manager
**Output**: Git commit and production deployment

**Pre-Deployment Checklist** (MUST pass):
- [ ] `npm run typecheck` → green
- [ ] `npm run lint` → green
- [ ] `npm run test` → green
- [ ] All integration tests pass
- [ ] All E2E tests pass
- [ ] Screenshots attached to PR
- [ ] Stakeholder approval received
- [ ] Verified in staging environment

**Git Commands**:
```bash
git add app/keystatic-tools/
git add keystatic.config.ts
git add requirements/phase2-keystatic-tools-page.lock.md
git commit -m "feat: implement /keystatic-tools page with CMS components (5 SP)

- REQ-TOOLS-001: Create page component with all 5 CMS tools
- REQ-TOOLS-002: Add navigation link to Keystatic config
- REQ-TOOLS-003: Integrate components with proper props
- REQ-TOOLS-004: E2E verification complete

Closes CAPA-2025-11-22 Phase 2
Story Points: 5.0 SP"

git push origin main
```

**Deployment**:
- Vercel auto-deploys on push to main
- Verify deployment completes successfully
- Test on production URL: `https://prelaunch.bearlakecamp.com/keystatic-tools`

---

## Risk Assessment

### Technical Risks

**Risk 1: Keystatic `ui.navigation` API Mismatch**
- **Probability**: Medium (learned from Phase 1 API constraint discovery)
- **Impact**: High (blocks navigation integration)
- **Mitigation**:
  - Verify `ui.navigation` syntax in `@keystatic/core` type definitions BEFORE writing tests
  - Create minimal spike to test navigation config
  - If API doesn't support custom links, use alternative: browser bookmark or separate admin panel

**Risk 2: Component Props Incompatibility**
- **Probability**: Low (components already implemented and tested)
- **Impact**: Medium (components may not work on tools page)
- **Mitigation**:
  - Review component prop interfaces before integration
  - Provide sensible defaults for optional props
  - Test with placeholder data

**Risk 3: Environment Variables Missing**
- **Probability**: Low (already set for production)
- **Impact**: Medium (some components won't work)
- **Mitigation**:
  - Verify all env vars set in Vercel dashboard
  - Add graceful error handling for missing API keys
  - Display helpful error messages to users

### Process Risks

**Risk 4: Integration Verification Failure (Repeat of CAPA-2025-11-22)**
- **Probability**: Low (explicit integration verification gate added)
- **Impact**: Critical (wasted effort, zero user value)
- **Mitigation**:
  - MANDATORY screenshot evidence before marking complete
  - MANDATORY E2E test verifying navigation works
  - MANDATORY stakeholder approval
  - Cannot mark task complete without visual verification

**Risk 5: Test Failures Due to Async Component Behavior**
- **Probability**: Medium (DeploymentStatus, GenerateSEOButton use async API calls)
- **Impact**: Low (tests flaky, not production issue)
- **Mitigation**:
  - Use proper async test patterns (`waitFor`, `findBy` queries)
  - Mock API responses for unit tests
  - Use real API calls for E2E tests with retry logic

---

## Success Criteria

### Functional Success
- [ ] User can navigate from `/keystatic` to `/keystatic-tools` via sidebar link
- [ ] All 5 components visible and interactive on tools page
- [ ] No console errors when loading page
- [ ] All API integrations work (DeploymentStatus, BugReportModal, GenerateSEOButton)

### Technical Success
- [ ] TypeScript compiles with zero errors
- [ ] All tests pass (unit, integration, E2E)
- [ ] Test coverage ≥80% for new code
- [ ] Lighthouse accessibility score ≥90

### Process Success
- [ ] Integration verification completed BEFORE marking done
- [ ] Screenshot evidence provided
- [ ] Stakeholder approved
- [ ] No CAPA-2025-11-22 repeat (components actually integrated, not orphaned)

---

## Related Documents

- **CAPA Report**: `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/docs/project/CAPA-2025-11-22-KEYSTATIC-INTEGRATION-FAILURE.md`
- **Component Specs**:
  - `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/keystatic/ProductionLink.spec.tsx`
  - `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/keystatic/DeploymentStatus.spec.tsx`
  - `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/keystatic/BugReportModal.spec.tsx`
  - `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/keystatic/SparkryBranding.spec.tsx`
  - `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/keystatic/GenerateSEOButton.spec.tsx`
- **Keystatic Config**: `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/keystatic.config.ts`

---

## Sign-Off

**Planning Approved**:
- [ ] Engineering Lead
- [ ] Product Owner

**Implementation Ready**:
- [ ] Requirements clear and testable
- [ ] API constraints verified
- [ ] Story points estimated
- [ ] Risks identified and mitigated

**Date**: 2025-11-22
**Next Step**: Execute QCODET (write failing tests)
