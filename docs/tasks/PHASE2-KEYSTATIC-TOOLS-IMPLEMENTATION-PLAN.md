# Phase 2 Implementation Plan: Keystatic Tools Page

**Task ID**: PHASE2-KEYSTATIC-TOOLS
**Date**: 2025-11-22
**Status**: Ready for Implementation
**Total Story Points**: 5.0 SP
**Requirements Lock**: `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/requirements/phase2-keystatic-tools-page.lock.md`

---

## Executive Summary

Create a dedicated `/keystatic-tools` page containing all 5 CMS enhancement components (ProductionLink, DeploymentStatus, BugReportModal, SparkryBranding, GenerateSEOButton) and make it accessible via Keystatic's navigation system.

**Context**: CAPA-2025-11-22 identified that Keystatic v0.5.48 does not support custom header integration via `ui.header`. This implementation uses the supported `ui.navigation` API to provide access to tools via a dedicated page.

**Approach**: Option A from decision matrix - separate page with all components, accessible via Keystatic navigation link.

---

## Implementation Workflow

### QCODET → QCHECKT → QCODE → QCHECK → QDOC → QGIT

Each phase has specific deliverables, acceptance criteria, and verification steps.

---

## Phase 1: Test Writing (QCODET)

**Owner**: skills/testing/test-writer
**Story Points**: Included in REQ SP estimates
**Duration Estimate**: N/A (no time estimates per CLAUDE.md)
**Blockers**: None

### Deliverables

#### 1.1 Unit Tests: Page Component
**File**: `app/keystatic-tools/__tests__/page.test.tsx`

**Test Cases**:

```typescript
// REQ-TOOLS-001: Page Component Rendering
describe('REQ-TOOLS-001: KeystaticToolsPage Component', () => {
  test('renders without crashing', () => {
    render(<KeystaticToolsPage />);
    expect(screen.getByRole('heading', { name: /CMS Tools/i })).toBeInTheDocument();
  });

  test('renders all 5 components', () => {
    render(<KeystaticToolsPage />);

    // ProductionLink
    expect(screen.getByLabelText(/View live page/i)).toBeInTheDocument();

    // DeploymentStatus - may be async, use findBy
    // Mock API response for deterministic test
    expect(screen.getByText(/Published|Deploying|Failed|Draft/i)).toBeInTheDocument();

    // BugReportModal
    expect(screen.getByRole('button', { name: /Report Bug/i })).toBeInTheDocument();

    // GenerateSEOButton
    expect(screen.getByRole('button', { name: /Generate SEO/i })).toBeInTheDocument();

    // SparkryBranding
    expect(screen.getByAltText(/Sparkry AI/i)).toBeInTheDocument();
  });

  test('organizes components into correct sections', () => {
    render(<KeystaticToolsPage />);

    const sections = screen.getAllByRole('heading', { level: 2 });
    expect(sections).toHaveLength(3);
    expect(sections[0]).toHaveTextContent(/Production & Deployment/i);
    expect(sections[1]).toHaveTextContent(/Content Tools/i);
    expect(sections[2]).toHaveTextContent(/Support/i);
  });

  test('is accessible with proper heading hierarchy', () => {
    const { container } = render(<KeystaticToolsPage />);

    // Should have one h1
    const h1s = container.querySelectorAll('h1');
    expect(h1s).toHaveLength(1);

    // Should have multiple h2s for sections
    const h2s = container.querySelectorAll('h2');
    expect(h2s.length).toBeGreaterThan(0);
  });
});

// REQ-TOOLS-003: Component Integration with Props
describe('REQ-TOOLS-003: Component Props Integration', () => {
  test('BugReportModal receives correct pageContext', () => {
    render(<KeystaticToolsPage />);

    const bugButton = screen.getByRole('button', { name: /Report Bug/i });
    fireEvent.click(bugButton);

    // Modal should open with correct context
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  test('GenerateSEOButton receives pageContent and handler', () => {
    const { container } = render(<KeystaticToolsPage />);

    const seoButton = screen.getByRole('button', { name: /Generate SEO/i });
    expect(seoButton).not.toBeDisabled();
  });

  test('components render with no TypeScript errors', () => {
    // This test passes if TypeScript compilation succeeds
    // Actual test: verify no runtime errors
    const { container } = render(<KeystaticToolsPage />);
    expect(container.querySelector('[data-error]')).not.toBeInTheDocument();
  });
});

// Accessibility Tests
describe('REQ-TOOLS-001: Accessibility', () => {
  test('passes axe accessibility tests', async () => {
    const { container } = render(<KeystaticToolsPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('supports keyboard navigation', () => {
    render(<KeystaticToolsPage />);

    const productionLink = screen.getByLabelText(/View live page/i);
    productionLink.focus();
    expect(productionLink).toHaveFocus();

    // Tab to next interactive element
    userEvent.tab();
    const bugButton = screen.getByRole('button', { name: /Report Bug/i });
    expect(bugButton).toHaveFocus();
  });
});
```

**Mock Data**:
```typescript
// Mock API responses for DeploymentStatus
jest.mock('@/api/vercel-status', () => ({
  fetch: jest.fn(() => Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      status: 'Published',
      state: 'Published',
      timestamp: Date.now() - 60000, // 1 minute ago
    }),
  })),
}));
```

**Verification**: Run tests, all MUST FAIL (no implementation yet)

---

#### 1.2 Integration Tests: Keystatic Config
**File**: `keystatic.config.test.ts` (create if doesn't exist)

**Test Cases**:

```typescript
// REQ-TOOLS-002: Navigation Configuration
describe('REQ-TOOLS-002: Keystatic Navigation Config', () => {
  test('config exports valid ui.navigation property', () => {
    const config = require('./keystatic.config').default;

    expect(config.ui).toBeDefined();
    expect(config.ui.navigation).toBeDefined();
  });

  test('navigation includes Tools section with /keystatic-tools link', () => {
    const config = require('./keystatic.config').default;

    // Verify Tools section exists
    expect(config.ui.navigation).toHaveProperty('Tools');

    // Verify link to tools page
    // Note: Actual structure depends on Keystatic API
    // This test may need adjustment based on API verification
    const toolsNav = config.ui.navigation.Tools;
    expect(toolsNav).toContain('/keystatic-tools');
  });

  test('navigation does not break existing collections', () => {
    const config = require('./keystatic.config').default;

    expect(config.collections.pages).toBeDefined();
    expect(config.collections.staff).toBeDefined();
  });

  test('config is valid TypeScript (compilation check)', () => {
    // This test passes if TypeScript compilation succeeds
    // Ensures no type errors in config file
    expect(true).toBe(true);
  });
});
```

**API Verification Step** (CRITICAL):
Before writing these tests, verify the actual `ui.navigation` API structure in Keystatic docs or type definitions.

**File to Check**: `node_modules/@keystatic/core/dist/declarations/src/config.d.ts`

**Action**:
1. Read type definition for `navigation` property
2. Identify correct structure (object with string keys? array of nav items?)
3. Write tests matching actual API
4. If API doesn't support custom page links, STOP and reassess requirements

---

#### 1.3 Integration Tests: Page Routing
**File**: `app/keystatic-tools/__tests__/page.integration.test.tsx`

**Test Cases**:

```typescript
// REQ-TOOLS-001, REQ-TOOLS-003: Page Integration
describe('REQ-TOOLS-001, REQ-TOOLS-003: Page Routing Integration', () => {
  test('page is accessible at /keystatic-tools route', async () => {
    // Using Next.js testing utilities
    const { res } = await fetch('http://localhost:3000/keystatic-tools');
    expect(res.status).toBe(200);
  });

  test('page renders in Next.js app context', async () => {
    // Render page with Next.js providers
    render(
      <NextRouter>
        <KeystaticToolsPage />
      </NextRouter>
    );

    expect(screen.getByRole('heading', { name: /CMS Tools/i })).toBeInTheDocument();
  });

  test('components work with Next.js navigation', async () => {
    render(
      <NextRouter>
        <KeystaticToolsPage />
      </NextRouter>
    );

    // ProductionLink uses usePathname hook
    const productionLink = screen.getByLabelText(/View live page/i);
    expect(productionLink).toHaveAttribute('href');
  });
});
```

---

#### 1.4 E2E Tests: User Journey
**File**: `app/keystatic-tools/__tests__/page.e2e.test.ts` (Playwright)

**Test Cases**:

```typescript
// REQ-TOOLS-004: End-to-End User Journey
import { test, expect } from '@playwright/test';

test.describe('REQ-TOOLS-004: Keystatic Tools Page E2E', () => {
  test('user can navigate from Keystatic admin to tools page', async ({ page }) => {
    // Navigate to Keystatic admin
    await page.goto('http://localhost:3000/keystatic');

    // Wait for Keystatic to load
    await page.waitForSelector('[data-keystatic-admin]', { timeout: 10000 });

    // Look for Tools navigation link
    const toolsLink = page.locator('text=Tools').or(page.locator('text=CMS Tools'));
    await expect(toolsLink).toBeVisible();

    // Click tools link
    await toolsLink.click();

    // Verify navigation to tools page
    await expect(page).toHaveURL(/\/keystatic-tools/);
  });

  test('all components are visible on tools page', async ({ page }) => {
    await page.goto('http://localhost:3000/keystatic-tools');

    // Wait for page to load
    await page.waitForSelector('h1:has-text("CMS Tools")');

    // Verify ProductionLink
    await expect(page.locator('a:has-text("View Live")')).toBeVisible();

    // Verify DeploymentStatus (may take time to load)
    await expect(page.locator('text=/Published|Deploying|Failed|Draft/')).toBeVisible({ timeout: 5000 });

    // Verify BugReportModal trigger
    await expect(page.locator('button:has-text("Report Bug")')).toBeVisible();

    // Verify GenerateSEOButton
    await expect(page.locator('button:has-text("Generate SEO")')).toBeVisible();

    // Verify SparkryBranding
    await expect(page.locator('img[alt*="Sparkry"]')).toBeVisible();
  });

  test('components are interactive', async ({ page }) => {
    await page.goto('http://localhost:3000/keystatic-tools');

    // Test BugReportModal
    await page.click('button:has-text("Report Bug")');
    await expect(page.locator('role=dialog')).toBeVisible();
    await page.click('button:has-text("Cancel")'); // Close modal

    // Test ProductionLink opens new tab
    const [newPage] = await Promise.all([
      page.context().waitForEvent('page'),
      page.click('a:has-text("View Live")'),
    ]);
    await expect(newPage).toHaveURL(/prelaunch\.bearlakecamp\.com/);
    await newPage.close();
  });

  test('page has no console errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('http://localhost:3000/keystatic-tools');
    await page.waitForTimeout(2000); // Wait for async components

    expect(consoleErrors).toHaveLength(0);
  });
});
```

**Setup Required**:
- Playwright installed: `npm install -D @playwright/test`
- Playwright config: `playwright.config.ts`
- Run tests: `npx playwright test`

---

### Verification Checklist (QCODET Complete)

- [ ] All unit tests written and FAIL (no implementation)
- [ ] All integration tests written and FAIL
- [ ] All E2E tests written and FAIL
- [ ] Test files follow naming convention: `*.test.tsx` or `*.spec.tsx`
- [ ] Tests cite REQ-IDs in describe blocks
- [ ] Mock data defined for async components
- [ ] Accessibility tests included (axe)
- [ ] TypeScript compilation passes for test files

**Blocker**: Cannot proceed to QCHECKT until all tests written and failing.

---

## Phase 2: Test Review (QCHECKT)

**Owner**: skills/quality/pe-reviewer + skills/testing/test-writer
**Story Points**: Included in REQ SP estimates
**Blockers**: QCODET must be complete

### Review Checklist

#### Test Quality
- [ ] Tests follow AAA pattern (Arrange, Act, Assert)
- [ ] Tests are independent (no shared state)
- [ ] Tests use appropriate matchers (`toBeInTheDocument`, `toHaveTextContent`, etc.)
- [ ] Async tests use proper patterns (`waitFor`, `findBy`, `async/await`)
- [ ] Mock data is realistic and representative

#### Coverage
- [ ] Unit tests cover all components in page
- [ ] Integration tests verify actual API integration (not mocked Keystatic config)
- [ ] E2E tests cover full user journey
- [ ] Edge cases tested (missing props, API errors, etc.)
- [ ] Accessibility tests included

#### REQ Traceability
- [ ] REQ-TOOLS-001: Page rendering tests exist
- [ ] REQ-TOOLS-002: Navigation config tests exist
- [ ] REQ-TOOLS-003: Component props tests exist
- [ ] REQ-TOOLS-004: E2E journey tests exist
- [ ] All tests cite REQ-IDs in describe blocks

#### Integration Verification (NEW - Per CAPA-2025-11-22)
- [ ] Tests verify component INTEGRATION, not just component existence
- [ ] E2E tests navigate to actual page in browser
- [ ] Tests check for elements in actual DOM (not mocked)
- [ ] API verification step completed for `ui.navigation` structure
- [ ] If API doesn't match assumptions, tests updated or requirements revised

### P0 Recommendations
If any critical issues found, create fix plan before proceeding to implementation.

**Example P0 Issues**:
- Tests don't verify actual integration (only component rendering in isolation)
- API verification step skipped (risk of Phase 1 repeat)
- E2E tests missing
- Accessibility tests missing

### Sign-Off

- [ ] PE-Reviewer approves test quality
- [ ] Test-Writer confirms all REQs covered
- [ ] Ready to proceed to QCODE

---

## Phase 3: Implementation (QCODE)

**Owner**: sde-iii + implementation-coordinator
**Story Points**: 5.0 SP (distributed across REQs)
**Blockers**: QCHECKT must be complete

### Implementation Steps

#### Step 1: Create Page Component (REQ-TOOLS-001)
**File**: `app/keystatic-tools/page.tsx`

**Code**:
```typescript
'use client';

import { useState } from 'react';
import { ProductionLink } from '@/components/keystatic/ProductionLink';
import { DeploymentStatus } from '@/components/keystatic/DeploymentStatus';
import { BugReportModal } from '@/components/keystatic/BugReportModal';
import { SparkryBranding } from '@/components/keystatic/SparkryBranding';
import { GenerateSEOButton } from '@/components/keystatic/GenerateSEOButton';

export default function KeystaticToolsPage() {
  // Default page context for BugReportModal
  const defaultPageContext = {
    slug: 'keystatic-tools',
    timestamp: new Date().toISOString(),
  };

  // Placeholder page content for GenerateSEOButton
  const [pageContent] = useState({
    title: 'CMS Tools',
    body: 'Keystatic CMS tools and utilities for content management.',
  });

  const handleSEOGenerated = (seoData: {
    metaTitle: string;
    metaDescription: string;
    ogTitle: string;
    ogDescription: string;
  }) => {
    console.log('Generated SEO:', seoData);
    // Future: Show notification or copy to clipboard
  };

  return (
    <main className="container mx-auto p-8 space-y-8">
      {/* Page Header */}
      <header className="border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-900">CMS Tools</h1>
        <p className="text-gray-600 mt-2">
          Utilities and tools for managing your content
        </p>
      </header>

      {/* Production & Deployment Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">
          Production & Deployment
        </h2>
        <div className="flex flex-wrap gap-4 items-center">
          <ProductionLink />
          <DeploymentStatus />
        </div>
        <p className="text-sm text-gray-600">
          View live pages and track deployment status in real-time.
        </p>
      </section>

      {/* Content Tools Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">
          Content Tools
        </h2>
        <GenerateSEOButton
          pageContent={pageContent}
          onSEOGenerated={handleSEOGenerated}
        />
        <p className="text-sm text-gray-600">
          Generate optimized SEO metadata using AI.
        </p>
      </section>

      {/* Support Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Support</h2>
        <div className="flex flex-wrap gap-4 items-center">
          <BugReportModal pageContext={defaultPageContext} />
          <SparkryBranding />
        </div>
        <p className="text-sm text-gray-600">
          Report issues or learn more about the tools powering this CMS.
        </p>
      </section>
    </main>
  );
}
```

**Verification**:
- [ ] TypeScript compiles with no errors
- [ ] File saved at correct location: `app/keystatic-tools/page.tsx`
- [ ] All imports resolve correctly
- [ ] No ESLint warnings

---

#### Step 2: Verify Keystatic Navigation API (REQ-TOOLS-002)
**CRITICAL**: Before modifying config, verify API structure.

**Action**:
1. Read Keystatic type definitions:
   ```typescript
   // node_modules/@keystatic/core/dist/declarations/src/config.d.ts
   type UserInterface<Collections, Singletons> = {
     brand?: { ... };
     navigation?: Navigation<Collections, Singletons>;
   };
   ```

2. Identify `Navigation` type structure:
   ```typescript
   // Expected format (verify in actual types)
   type Navigation = {
     [key: string]: string[] | string;
   };
   ```

3. Check Keystatic documentation:
   - https://keystatic.com/docs/configuration
   - Search for "custom navigation" or "ui.navigation"

4. Create minimal spike to test:
   ```typescript
   // Test in keystatic.config.ts temporarily
   ui: {
     navigation: {
       'Test': '/test-page',
     },
   }
   // Run dev server, verify navigation appears
   ```

5. Document findings:
   - If navigation supports custom page links → proceed with implementation
   - If navigation ONLY supports collection references → update requirements

**Blocker**: If API doesn't support custom page links, STOP and create alternative approach.

---

#### Step 3: Update Keystatic Config (REQ-TOOLS-002)
**File**: `keystatic.config.ts`

**Implementation** (pending API verification):

```typescript
// After line 32 (storageConfig definition)
export default config({
  storage: storageConfig,

  // Add UI customization
  ui: {
    brand: {
      name: 'Bear Lake Camp CMS',
    },
    navigation: {
      // Group existing collections
      'Content': ['pages', 'staff'],

      // Add tools page link
      // NOTE: Syntax depends on API verification
      // Option A: If navigation supports URLs
      'Tools': '/keystatic-tools',

      // Option B: If navigation only supports collections
      // May need alternative approach (bookmark, separate link, etc.)
    },
  },

  collections: {
    // ... existing collections unchanged
  },
});
```

**Alternative Approach** (if `ui.navigation` doesn't support custom URLs):

```typescript
// Use ui.brand for minimal customization only
ui: {
  brand: {
    name: 'Bear Lake Camp CMS',
    mark: () => <Link href="/keystatic-tools">Tools</Link>, // Test if supported
  },
},

// Fallback: Document bookmark approach
// Users manually bookmark https://prelaunch.bearlakecamp.com/keystatic-tools
```

**Verification**:
- [ ] TypeScript compiles with no errors
- [ ] Run `npm run dev`
- [ ] Navigate to `http://localhost:3000/keystatic`
- [ ] Verify navigation link appears in sidebar (or brand area)
- [ ] Click link, verify navigation to `/keystatic-tools`

**Blocker**: If navigation link doesn't appear, API verification failed. Reassess approach.

---

#### Step 4: Verify Component Props (REQ-TOOLS-003)
**File**: `app/keystatic-tools/page.tsx` (already created in Step 1)

**Checklist**:
- [ ] BugReportModal:
  - Prop: `pageContext` of type `{ slug: string; fieldValues?: Record<string, unknown>; timestamp?: string }`
  - Provided: `{ slug: 'keystatic-tools', timestamp: new Date().toISOString() }`
  - TypeScript check: No type errors

- [ ] GenerateSEOButton:
  - Prop: `pageContent` of type `{ title: string; body: string }`
  - Prop: `onSEOGenerated` of type `(seoData: SEOData) => void`
  - Provided: Both props with correct types
  - TypeScript check: No type errors

- [ ] ProductionLink:
  - Props: None required (uses Next.js `usePathname` hook)
  - No prop passing needed

- [ ] DeploymentStatus:
  - Props: None required (fetches from API internally)
  - No prop passing needed

- [ ] SparkryBranding:
  - Props: None required
  - No prop passing needed

**Verification**:
- [ ] Run `npm run typecheck` → zero errors
- [ ] Run page in browser → no console warnings about prop types

---

#### Step 5: Run Tests and Fix Failures
**Command**: `npm run test`

**Expected Outcome**:
- All unit tests pass
- All integration tests pass
- E2E tests may need manual verification (Playwright requires running server)

**Common Failures and Fixes**:

1. **DeploymentStatus async rendering**:
   - Problem: Test can't find deployment status text
   - Fix: Use `await screen.findByText(/Published|Deploying/)` instead of `getByText`

2. **ProductionLink pathname**:
   - Problem: `usePathname` returns null in tests
   - Fix: Mock Next.js navigation in test setup

3. **API mocks not working**:
   - Problem: Components make real API calls during tests
   - Fix: Use `jest.mock` or MSW to intercept fetch calls

**Iteration**:
- Fix failing tests
- Re-run tests
- Repeat until all green

---

### Implementation Verification Checklist

- [ ] All files created in correct locations
- [ ] TypeScript compiles: `npm run typecheck` → green
- [ ] Linting passes: `npm run lint` → green
- [ ] All tests pass: `npm run test` → green
- [ ] Page loads in browser: `http://localhost:3000/keystatic-tools` → no errors
- [ ] Navigation works: Click "Tools" in Keystatic admin → navigate to tools page
- [ ] All 5 components visible on page
- [ ] No console errors in browser

**Blocker**: If ANY verification fails, fix before proceeding to QCHECK.

---

## Phase 4: Code Review (QCHECK)

**Owner**: skills/quality/pe-reviewer + code-quality-auditor
**Story Points**: Included in REQ SP estimates
**Blockers**: QCODE must be complete (all tests passing)

### Review Checklist

#### Code Quality
- [ ] Follows React best practices (hooks rules, component structure)
- [ ] TypeScript types are explicit (no `any`, proper interfaces)
- [ ] Component composition is logical (sections, headings)
- [ ] Error boundaries in place for async components
- [ ] Loading states handled gracefully

#### Integration Verification (CRITICAL - Per CAPA-2025-11-22)
- [ ] **Component Integration**: All 5 components imported and rendered in page.tsx
- [ ] **Navigation Integration**: `keystatic.config.ts` includes `ui.navigation` (or documented alternative)
- [ ] **Route Integration**: Page accessible at `/keystatic-tools` (verified in browser)
- [ ] **Props Integration**: All required props passed with correct types
- [ ] **Screenshot Evidence**: Screenshots showing tools page in UI (MANDATORY)

**Integration Red Flags** (REJECT if found):
- ❌ Components imported but not rendered in JSX
- ❌ Navigation config added but link doesn't appear in Keystatic
- ❌ Page file exists but route returns 404
- ❌ No screenshot evidence provided
- ❌ Tests only verify isolated components (not integration)

#### Accessibility
- [ ] Heading hierarchy correct (single h1, logical h2s)
- [ ] All interactive elements keyboard accessible
- [ ] Focus indicators visible
- [ ] ARIA labels where needed (ProductionLink, BugReportModal)
- [ ] Color contrast meets WCAG 2.1 AA standards
- [ ] Screen reader friendly (test with VoiceOver/NVDA)

#### Responsive Design
- [ ] Layout works on mobile (320px width)
- [ ] Layout works on tablet (768px width)
- [ ] Layout works on desktop (1920px width)
- [ ] Components stack vertically on narrow screens
- [ ] No horizontal overflow

#### Performance
- [ ] No unnecessary re-renders (React DevTools profiler)
- [ ] Async components don't block page render
- [ ] Images optimized (Next.js Image component used in SparkryBranding)
- [ ] No memory leaks (cleanup in useEffect hooks)

#### Security
- [ ] No sensitive data in client-side code
- [ ] Environment variables properly scoped (server-only vars not exposed)
- [ ] External links use `rel="noopener noreferrer"`
- [ ] XSS protection (user input sanitized in BugReportModal)

### P0/P1 Recommendations

**P0 (Blocking)**: Must fix before deployment
- Critical accessibility violations
- Security vulnerabilities
- TypeScript compilation errors
- Integration verification failures

**P1 (High Priority)**: Should fix before deployment
- Performance issues (slow loading)
- Responsive design issues
- Minor accessibility improvements
- Code quality improvements

**P2 (Nice to Have)**: Can defer to future iteration
- Additional features (tooltips, help text)
- Advanced error handling
- Visual polish

### Review Sign-Off

- [ ] PE-Reviewer approves implementation
- [ ] Code-Quality-Auditor approves
- [ ] All P0 issues resolved
- [ ] P1 issues resolved or documented for follow-up
- [ ] Integration verification complete (screenshot evidence provided)
- [ ] Ready to proceed to fix phase (if needed) or documentation

---

## Phase 5: Fix P0/P1 Issues (QPLAN + QCODE + QCHECK)

**Owner**: planner → sde-iii → pe-reviewer
**Story Points**: TBD based on issues found
**Trigger**: Only if P0/P1 recommendations exist from Phase 4

### Process

1. **Planner**: Create fix plan for each P0/P1 issue
   - Estimate story points
   - Prioritize fixes
   - Identify dependencies

2. **SDE-III**: Implement fixes
   - Address P0 issues first
   - Run tests after each fix
   - Verify in browser

3. **PE-Reviewer**: Verify fixes
   - Check each P0/P1 issue resolved
   - Re-run integration verification
   - Approve or request additional fixes

### Verification

- [ ] All P0 issues resolved
- [ ] P1 issues resolved or explicitly deferred
- [ ] Tests still passing after fixes
- [ ] No new issues introduced
- [ ] Ready to proceed to documentation

---

## Phase 6: Documentation (QDOC)

**Owner**: docs-writer
**Story Points**: Included in overall 5.0 SP estimate
**Blockers**: QCHECK complete (all P0 issues resolved)

### Documentation Updates

#### 6.1 User Documentation
**File**: `docs/operations/KEYSTATIC-ADMIN-GUIDE.md` (create if missing)

**Content to Add**:

```markdown
## CMS Tools Page

### Accessing the Tools Page

1. Navigate to the Keystatic admin interface:
   - Local: http://localhost:3000/keystatic
   - Production: https://prelaunch.bearlakecamp.com/keystatic

2. In the sidebar navigation, click "Tools" (or "CMS Tools")

3. You'll be redirected to the tools page with all available utilities

### Available Tools

#### Production Link
View your live pages on the production website.

**How to use**:
- The link automatically updates based on your current page
- Click "View Live" to open the production version in a new tab
- Useful for verifying published content

#### Deployment Status
Track real-time deployment status of your changes.

**Status indicators**:
- **Published** (green): Changes are live on production
- **Deploying** (blue, animated): Changes are being deployed
- **Failed** (red): Deployment encountered an error
- **Draft** (amber): Changes saved but not deployed

**How it works**:
- Automatically checks deployment status when you save content
- Updates every 15 seconds during active deployments

#### Bug Report Modal
Submit bugs directly to the GitHub issue tracker.

**How to use**:
1. Click "Report Bug" button
2. Fill in title and description
3. Optionally include page context (recommended)
4. Click "Submit"
5. Issue will be created in GitHub repository

**Tips**:
- Be specific in your description
- Include steps to reproduce the bug
- Enable "Include page context" for faster troubleshooting

#### Generate SEO Button
AI-powered SEO metadata generation for your pages.

**How to use**:
1. Click "Generate SEO" button
2. Wait for AI to analyze your page content
3. Review generated metadata
4. Copy and paste into SEO fields

**Rate limits**:
- 10 generations per hour per user
- Resets automatically after 1 hour

**Note**: Requires `UNIVERSAL_LLM_KEY` environment variable. Contact admin if button is disabled.

#### Sparkry Branding
Credits and link to Sparkry.ai, the platform powering these tools.

**How it helps**:
- Learn more about the AI platform
- Access additional tools and resources
- Support the development of this CMS

### Troubleshooting

**"Tools" link not visible**:
- Refresh the page
- Clear browser cache
- Contact admin if issue persists

**Components not loading**:
- Check browser console for errors
- Verify environment variables are set (admin only)
- Try in different browser

**API errors (Deployment Status, SEO Generation)**:
- Verify internet connection
- Check API rate limits
- Contact admin if errors persist
```

---

#### 6.2 Technical Documentation
**File**: `docs/technical/KEYSTATIC-CUSTOM-UI-INTEGRATION.md`

**Content to Add** (append to existing content):

```markdown
## Phase 2: Dedicated Tools Page Implementation

### Context
After Phase 1 testing revealed that Keystatic v0.5.48 does not support `ui.header` customization, we implemented a dedicated tools page approach.

### Implementation Details

**Route**: `/keystatic-tools`

**File Structure**:
```
app/
  keystatic-tools/
    page.tsx                    # Main page component
    __tests__/
      page.test.tsx             # Unit tests
      page.integration.test.tsx # Integration tests
      page.e2e.test.ts          # E2E tests (Playwright)
```

**Navigation Integration**:
```typescript
// keystatic.config.ts
ui: {
  navigation: {
    'Content': ['pages', 'staff'],
    'Tools': '/keystatic-tools',  // Custom page link
  },
}
```

**Components Included**:
1. ProductionLink - View live pages
2. DeploymentStatus - Real-time deployment tracking
3. BugReportModal - GitHub issue creation
4. SparkryBranding - Powered by Sparkry.ai
5. GenerateSEOButton - AI SEO generation

### Lessons Learned

**API Verification is Critical**:
- Always verify third-party library APIs before implementation
- Check type definitions, not just documentation
- Create minimal spikes to test integration patterns

**Integration Testing is Mandatory**:
- Unit tests alone don't verify feature delivery
- E2E tests must verify actual user journey
- Screenshot evidence required for UI features

**Definition of Done Must Include Visual Verification**:
- "Tests pass" ≠ "Feature shipped"
- Must see feature in browser before marking complete
- Stakeholder approval required for UI changes

### Maintenance

**Adding New Tools**:
1. Create component in `components/keystatic/`
2. Import in `app/keystatic-tools/page.tsx`
3. Add to appropriate section (Production/Content/Support)
4. Update tests
5. Update documentation

**Removing Tools**:
1. Remove import from page.tsx
2. Remove from JSX
3. Update tests
4. Update documentation
5. Deprecate but don't delete component (may be used elsewhere)

### References
- CAPA-2025-11-22: Integration failure analysis
- Requirements Lock: `requirements/phase2-keystatic-tools-page.lock.md`
- Implementation Plan: `docs/tasks/PHASE2-KEYSTATIC-TOOLS-IMPLEMENTATION-PLAN.md`
```

---

#### 6.3 Update CAPA Document
**File**: `docs/project/CAPA-2025-11-22-KEYSTATIC-INTEGRATION-FAILURE.md`

**Add to § 8 (Action Items Summary)**:

```markdown
| PA-7 | Implement Phase 2: /keystatic-tools page | SDE-III | P0 | 2025-11-23 | Complete |
```

**Add to § 10 (Sign-Off)**:

```markdown
**Phase 2 Implementation Verified**:
- [x] All components integrated into dedicated page
- [x] Navigation link functional
- [x] Screenshot evidence provided
- [x] E2E tests passing
- [x] Deployed to production
- [x] Stakeholder approved

**Date of Phase 2 Completion**: 2025-11-22
```

---

### Documentation Verification Checklist

- [ ] User documentation added to operations guide
- [ ] Technical documentation updated
- [ ] CAPA document updated with Phase 2 completion
- [ ] Code comments added for complex logic
- [ ] README updated if needed (unlikely)
- [ ] Inline documentation in code (TypeScript docstrings)

---

## Phase 7: Manual Verification (REQ-TOOLS-004)

**Owner**: QA team + Product Owner
**Story Points**: 1.0 SP (REQ-TOOLS-004)
**Blockers**: QDOC complete

### Local Verification

**Checklist**:
1. [ ] Run development server:
   ```bash
   npm run dev
   ```

2. [ ] Navigate to Keystatic admin:
   ```
   http://localhost:3000/keystatic
   ```

3. [ ] Verify navigation:
   - [ ] "Tools" link visible in sidebar
   - [ ] Click link → navigate to `/keystatic-tools`
   - [ ] URL shows `http://localhost:3000/keystatic-tools`

4. [ ] Verify components:
   - [ ] **ProductionLink**: Visible, correct URL, opens in new tab
   - [ ] **DeploymentStatus**: Visible, shows status (Published/Deploying/etc.)
   - [ ] **BugReportModal**: Button visible, click opens modal
   - [ ] **GenerateSEOButton**: Button visible, click generates SEO
   - [ ] **SparkryBranding**: Logo visible, link works

5. [ ] Test interactions:
   - [ ] Click "View Live" → new tab opens to prelaunch.bearlakecamp.com
   - [ ] Click "Report Bug" → modal opens → fill form → submit (test mode)
   - [ ] Click "Generate SEO" → loading state → SEO generated (or error if no API key)
   - [ ] Click Sparkry logo → new tab opens to sparkry.ai

6. [ ] Check browser console:
   - [ ] Open DevTools (F12)
   - [ ] Check Console tab
   - [ ] Verify ZERO errors (warnings acceptable if documented)

7. [ ] Test responsive design:
   - [ ] Resize browser to 320px width (mobile)
   - [ ] Verify components stack vertically
   - [ ] Resize to 768px (tablet)
   - [ ] Resize to 1920px (desktop)
   - [ ] Verify no horizontal overflow at any size

8. [ ] Test accessibility:
   - [ ] Tab through all interactive elements
   - [ ] Verify focus indicators visible
   - [ ] Test with screen reader (VoiceOver on Mac, NVDA on Windows)
   - [ ] Verify all elements announced correctly

9. [ ] Take screenshots:
   - [ ] Keystatic sidebar showing "Tools" link
   - [ ] Tools page full view (all components)
   - [ ] Each component in action (modals, generated SEO, etc.)
   - [ ] Save to `docs/project/phase2-evidence/`

**Evidence Required**:
- [ ] Screenshot: Keystatic sidebar with "Tools" link
- [ ] Screenshot: Tools page showing all 5 components
- [ ] Screenshot: BugReportModal open
- [ ] Screenshot: Generated SEO results (if API key available)
- [ ] Browser console log (zero errors)

---

### Staging Verification

**Prerequisites**:
- [ ] Code merged to main branch
- [ ] Vercel deployment triggered automatically
- [ ] Deployment completed successfully
- [ ] Environment variables set in Vercel:
  - VERCEL_TOKEN
  - VERCEL_PROJECT_ID
  - GITHUB_TOKEN
  - UNIVERSAL_LLM_KEY (optional)

**Checklist**:
1. [ ] Navigate to staging:
   ```
   https://prelaunch.bearlakecamp.com/keystatic
   ```

2. [ ] Authenticate (if required)

3. [ ] Repeat all local verification steps (navigation, components, interactions, etc.)

4. [ ] Verify API integrations work:
   - [ ] DeploymentStatus shows actual deployment data (not mock)
   - [ ] BugReportModal creates real GitHub issue (use test label)
   - [ ] GenerateSEOButton calls real AI API (if key available)

5. [ ] Test with stakeholder:
   - [ ] Walk through tools page
   - [ ] Get sign-off: "I can see and use all features"

6. [ ] Take staging screenshots:
   - [ ] Same screenshots as local verification
   - [ ] Save to `docs/project/phase2-evidence/staging/`

**Evidence Required**:
- [ ] Staging screenshots (same as local)
- [ ] Stakeholder approval email/Slack message
- [ ] GitHub issue created via BugReportModal (with "test" label)

---

### Verification Sign-Off

**Blockers** (Cannot deploy to production if ANY fail):
- ❌ Any component missing from page
- ❌ Any component throws console error
- ❌ Navigation link missing or broken
- ❌ API integrations don't work in staging
- ❌ TypeScript compilation errors
- ❌ Tests failing
- ❌ No screenshot evidence
- ❌ Stakeholder has not approved

**Sign-Off Required**:
- [ ] QA Lead: All tests passed
- [ ] Engineering Lead: Code quality approved
- [ ] Product Owner: Features work as expected
- [ ] Stakeholder: "I can see and use this"

**Date**: _____________

---

## Phase 8: Deployment (QGIT)

**Owner**: release-manager
**Story Points**: Included in overall 5.0 SP estimate
**Blockers**: Manual verification complete and signed off

### Pre-Deployment Gates

**Automated Checks**:
```bash
# Run all checks locally before committing
npm run typecheck  # MUST pass
npm run lint       # MUST pass
npm run test       # MUST pass
npm run build      # MUST pass (verify production build works)
```

**Manual Checks**:
- [ ] All P0 issues resolved
- [ ] Screenshot evidence attached
- [ ] Stakeholder approval received
- [ ] Verified in staging environment
- [ ] Environment variables confirmed in Vercel
- [ ] No known blockers

---

### Git Workflow

**Branch Strategy**:
- Feature branch: `feature/phase2-keystatic-tools` (optional, if using branches)
- Target branch: `main`

**Commit Commands**:

```bash
# Stage changes
git add app/keystatic-tools/
git add keystatic.config.ts
git add requirements/phase2-keystatic-tools-page.lock.md
git add docs/tasks/PHASE2-KEYSTATIC-TOOLS-IMPLEMENTATION-PLAN.md
git add docs/operations/KEYSTATIC-ADMIN-GUIDE.md
git add docs/technical/KEYSTATIC-CUSTOM-UI-INTEGRATION.md
git add docs/project/CAPA-2025-11-22-KEYSTATIC-INTEGRATION-FAILURE.md
git add docs/project/phase2-evidence/  # Screenshots

# Verify staged changes
git status

# Commit with Conventional Commits format
git commit -m "feat: implement /keystatic-tools page with CMS components (5 SP)

- REQ-TOOLS-001: Create page component with all 5 CMS tools
  - ProductionLink for viewing live pages
  - DeploymentStatus for real-time deployment tracking
  - BugReportModal for GitHub issue creation
  - SparkryBranding for Sparkry.ai credits
  - GenerateSEOButton for AI-powered SEO generation

- REQ-TOOLS-002: Add navigation link to Keystatic config
  - Updated ui.navigation with Tools section
  - Link appears in Keystatic admin sidebar

- REQ-TOOLS-003: Integrate components with proper props
  - BugReportModal receives pageContext
  - GenerateSEOButton receives pageContent and handler
  - All TypeScript types verified

- REQ-TOOLS-004: E2E verification complete
  - Manual testing in local and staging
  - Screenshot evidence provided
  - Stakeholder approval received

Closes CAPA-2025-11-22 Phase 2 Implementation
Story Points: 5.0 SP
Test Coverage: 87 existing tests + new integration tests

Breaking Changes: None
Migrations: None required

Evidence: docs/project/phase2-evidence/
Documentation: docs/operations/KEYSTATIC-ADMIN-GUIDE.md"

# Push to remote
git push origin main

# If using feature branch
# git push origin feature/phase2-keystatic-tools
# Then create PR and merge after approval
```

---

### Deployment Monitoring

**Automatic Deployment** (Vercel):
1. Push to main triggers automatic deployment
2. Vercel builds and deploys to production
3. Monitor deployment in Vercel dashboard

**Verification Steps**:
1. [ ] Deployment completes successfully (check Vercel dashboard)
2. [ ] Navigate to production:
   ```
   https://prelaunch.bearlakecamp.com/keystatic-tools
   ```
3. [ ] Verify all components visible and functional
4. [ ] Check for errors in Vercel logs
5. [ ] Monitor for first 24 hours (error tracking)

**Rollback Plan** (if deployment fails):
```bash
# Revert commit
git revert HEAD
git push origin main

# Or revert to previous deployment in Vercel dashboard
```

---

### Post-Deployment Verification

**Checklist**:
- [ ] Production URL accessible: `https://prelaunch.bearlakecamp.com/keystatic-tools`
- [ ] All 5 components visible
- [ ] Navigation works from Keystatic admin
- [ ] API integrations work (DeploymentStatus, BugReportModal, GenerateSEOButton)
- [ ] No console errors
- [ ] Lighthouse scores:
  - Performance: ≥90
  - Accessibility: ≥90
  - Best Practices: ≥90
  - SEO: ≥90

**Monitor for Issues**:
- Check error tracking (Sentry, LogRocket, or Vercel Analytics)
- Monitor user feedback
- Track API usage (Vercel/GitHub API rate limits)

---

### Deployment Sign-Off

- [ ] Deployment successful
- [ ] Production verification complete
- [ ] No critical errors in first 24 hours
- [ ] Stakeholder confirmed feature live
- [ ] Documentation published
- [ ] CAPA-2025-11-22 Phase 2 marked complete

**Date of Production Deployment**: _____________

---

## Success Metrics

### Functional Metrics
- [ ] All 5 components accessible via `/keystatic-tools` page
- [ ] Navigation link functional in Keystatic admin
- [ ] 100% of components interactive (no broken features)
- [ ] Zero console errors on page load
- [ ] Zero deployment failures

### Quality Metrics
- [ ] Test coverage: ≥80% for new code
- [ ] TypeScript strict mode: Zero errors
- [ ] Lighthouse accessibility score: ≥90
- [ ] Zero P0 issues in code review
- [ ] All P1 issues resolved or documented

### Process Metrics
- [ ] Integration verification completed before deployment
- [ ] Screenshot evidence provided
- [ ] E2E tests included
- [ ] No repeat of CAPA-2025-11-22 issues
- [ ] Stakeholder approval received

### User Impact Metrics (Post-Deployment)
- Track usage of each component:
  - ProductionLink clicks
  - DeploymentStatus views
  - Bug reports submitted
  - SEO generations requested
  - Sparkry link clicks

---

## Risk Mitigation Summary

| Risk | Mitigation | Status |
|------|------------|--------|
| Keystatic API doesn't support navigation links | API verification step before implementation | Pending verification |
| Components not integrated (repeat CAPA-2025-11-22) | Mandatory integration tests + screenshot evidence | Built into workflow |
| Environment variables missing in production | Pre-deployment verification checklist | Documented |
| Tests don't verify actual integration | E2E tests with Playwright + manual verification | Included in QCODET |
| Navigation link doesn't appear | Test in browser during implementation | Included in QCODE |

---

## Timeline Estimates

**Note**: Per CLAUDE.md, we do NOT provide time estimates, only story points.

**Story Point Breakdown**:
- QCODET (test writing): Included in REQ SP
- QCHECKT (test review): Included in REQ SP
- QCODE (implementation): 5.0 SP total
- QCHECK (code review): Included in REQ SP
- QDOC (documentation): Included in REQ SP
- QGIT (deployment): Included in REQ SP

**Execution Order**:
1. QCODET → Write all tests
2. QCHECKT → Review tests
3. QCODE → Implement page, config, integration
4. QCHECK → Code review
5. Fix P0/P1 issues (if any)
6. QDOC → Update documentation
7. Manual verification → REQ-TOOLS-004
8. QGIT → Commit and deploy

---

## Related Documents

**Requirements**:
- Requirements Lock: `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/requirements/phase2-keystatic-tools-page.lock.md`

**Implementation**:
- This document: `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/docs/tasks/PHASE2-KEYSTATIC-TOOLS-IMPLEMENTATION-PLAN.md`

**Context**:
- CAPA Report: `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/docs/project/CAPA-2025-11-22-KEYSTATIC-INTEGRATION-FAILURE.md`

**Components**:
- ProductionLink: `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/keystatic/ProductionLink.tsx`
- DeploymentStatus: `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/keystatic/DeploymentStatus.tsx`
- BugReportModal: `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/keystatic/BugReportModal.tsx`
- SparkryBranding: `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/keystatic/SparkryBranding.tsx`
- GenerateSEOButton: `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/components/keystatic/GenerateSEOButton.tsx`

**Guidelines**:
- CLAUDE.md: `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/CLAUDE.md`
- Planning Poker: `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/docs/project/PLANNING-POKER.md`

---

## Final Checklist (Before Marking Phase 2 Complete)

### Implementation
- [ ] Page component created: `app/keystatic-tools/page.tsx`
- [ ] Keystatic config updated: `keystatic.config.ts`
- [ ] All imports correct
- [ ] All props passed with correct types
- [ ] TypeScript compiles
- [ ] Linting passes
- [ ] Build succeeds

### Testing
- [ ] Unit tests written and passing
- [ ] Integration tests written and passing
- [ ] E2E tests written and passing
- [ ] Accessibility tests included
- [ ] Test coverage ≥80%
- [ ] All tests cite REQ-IDs

### Integration Verification (CRITICAL)
- [ ] Components imported into page
- [ ] Components rendered in JSX
- [ ] Navigation link added to config
- [ ] Page accessible at `/keystatic-tools`
- [ ] All components visible in browser
- [ ] Screenshot evidence provided
- [ ] Stakeholder approved

### Quality
- [ ] Code review complete
- [ ] All P0 issues resolved
- [ ] P1 issues resolved or deferred
- [ ] No console errors
- [ ] Lighthouse scores ≥90
- [ ] Responsive design verified

### Documentation
- [ ] User guide updated
- [ ] Technical docs updated
- [ ] CAPA document updated
- [ ] Inline code comments added
- [ ] README updated (if needed)

### Deployment
- [ ] Pre-deployment gates passed
- [ ] Committed to Git
- [ ] Pushed to main
- [ ] Deployment successful
- [ ] Production verification complete
- [ ] No errors in first 24 hours

### Sign-Off
- [ ] QA Lead approved
- [ ] Engineering Lead approved
- [ ] Product Owner approved
- [ ] Stakeholder confirmed working

---

**Plan Status**: Ready for Execution
**Next Step**: Execute QCODET (write failing tests)
**Estimated Completion**: After 5.0 SP of work completed

**Ready to begin implementation? Y/N**: ___________
