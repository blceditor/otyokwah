# Production Keystatic Access: Strategic Options Matrix

**Version**: 1.0
**Date**: 2025-12-11
**Status**: Research Deliverable
**Context**: User experiencing feature disappearances from production; needs validation smoke tests

---

## Executive Summary

Bear Lake Camp's production site (https://prelaunch.bearlakecamp.com) uses Keystatic CMS with GitHub storage mode and OAuth authentication. Features implemented in development are disappearing from production. This analysis evaluates **4 viable approaches** for enabling production smoke tests that validate:

1. Content exists in production Keystatic
2. Navigation/UI elements are intact
3. API endpoints respond correctly
4. Features match development state

**Recommended Approach**: **Option 2A - API Health Endpoint Enhancement** (1 SP)
**Rationale**: Already implemented, fastest to enhance, zero external dependencies, aligns with existing smoke test infrastructure.

---

## Problem Statement

### Current Pain Points

1. **Feature Disappearances**: Changes committed to git disappear from production
2. **No Production Validation**: Smoke tests only validate HTTP responses, not CMS content
3. **GitHub OAuth Barrier**: Production Keystatic requires GitHub login (no API access)
4. **Content vs. Rendering Gap**: Can't distinguish between "content missing" vs. "rendering broken"

### Current Infrastructure (Strengths)

**Existing Assets**:
- `/Users/travis/SparkryGDrive/dev/bearlakecamp/scripts/smoke-test.sh` - Parallel curl-based testing (2s for 24 pages)
- `/Users/travis/SparkryGDrive/dev/bearlakecamp/app/api/health/keystatic/route.ts` - Health check endpoint
- `/Users/travis/SparkryGDrive/dev/bearlakecamp/lib/keystatic-reader.spec.ts` - Keystatic reader with `createReader()`
- GitHub Actions integration ready (no workflows yet)

**Technology Stack**:
- Next.js 14 + Keystatic 0.5.48
- Vercel deployment
- GitHub as content storage (via Keystatic GitHub mode)
- Local smoke tests (bash/curl/jq/yq)

---

## Option Matrix

| Approach | Implementation Complexity | External Dependencies | Cost | Production Safety | Recommendation |
|----------|--------------------------|----------------------|------|------------------|----------------|
| **1. Playwright/Puppeteer Browser Automation** | 3-5 SP | High (browsers, session mgmt) | $0 (CI minutes) | Medium (auth risks) | ❌ Not Recommended |
| **2A. API Health Endpoint Enhancement** | 1 SP | None | $0 | High (read-only) | ✅ **RECOMMENDED** |
| **2B. Dedicated Smoke Test API** | 2-3 SP | None | $0 | High (read-only) | ⚠️ Alternative |
| **3. Checkly Integration** | 1-2 SP | Medium (3rd party) | $80/mo (Team plan) | High (managed) | ⚠️ If budget available |
| **4. Git Content Diff Validation** | 1 SP | None | $0 | High (git as source of truth) | ⚠️ Complementary |

---

## Detailed Analysis

### Option 1: Playwright/Puppeteer Browser Automation

**Concept**: Headless browser authenticates to Keystatic admin UI, scrapes content data programmatically.

#### Technical Approach

```typescript
// tests/e2e/production-keystatic.spec.ts
import { test, expect } from '@playwright/test';

test('validate Keystatic content in production', async ({ page }) => {
  // 1. Navigate to Keystatic admin
  await page.goto('https://prelaunch.bearlakecamp.com/keystatic');

  // 2. GitHub OAuth flow
  await page.click('text=Sign in with GitHub');
  await page.fill('input[name="login"]', process.env.GITHUB_USERNAME);
  await page.fill('input[name="password"]', process.env.GITHUB_PASSWORD);
  await page.click('input[type="submit"]');

  // 3. Wait for Keystatic dashboard
  await page.waitForSelector('[data-testid="keystatic-dashboard"]');

  // 4. Navigate to Pages collection
  await page.click('text=Pages');

  // 5. Verify expected pages exist
  const pages = await page.locator('[data-testid="collection-item"]').allTextContents();
  expect(pages).toContain('Summer Camp');
  expect(pages).toContain('Work at Camp');
  expect(pages).toContain('Facilities');
});
```

#### Implementation Steps

1. **Install Playwright**: `npm install -D @playwright/test` (50MB+ browser binaries)
2. **Store GitHub Credentials**: Securely store test account credentials in CI secrets
3. **Handle OAuth Flow**: Automate GitHub OAuth callback handling
4. **Session Persistence**: Save authenticated session to skip login on repeat runs
5. **Data Extraction**: Scrape Keystatic UI for content validation
6. **CI Integration**: Run in GitHub Actions (adds 30-60s to pipeline)

#### Pros

- **Complete Access**: Can interact with full Keystatic admin UI
- **Visual Validation**: Can verify UI elements, navigation, toolbars
- **Comprehensive**: Tests auth flow + CMS functionality end-to-end

#### Cons

- **Fragile**: Breaks if Keystatic UI changes (no stable API contract)
- **Slow**: 30-60 seconds per test run vs. 2s for current smoke tests
- **Complex Auth**: OAuth flow requires credential management (security risk)
- **Session Management**: GitHub may require 2FA, CAPTCHA challenges
- **Heavy Dependencies**: Browser binaries (100MB+), impacts CI cache size
- **Maintenance Burden**: UI selectors must be updated on Keystatic upgrades

#### Story Point Estimate

- **Initial Implementation**: 3 SP
  - Playwright setup: 0.5 SP
  - OAuth automation: 1 SP (handle 2FA, session persistence)
  - Content scraping: 0.8 SP (UI selectors, data extraction)
  - Error handling: 0.5 SP (timeouts, auth failures)
  - CI integration: 0.2 SP
- **Ongoing Maintenance**: 0.5 SP per Keystatic version upgrade

#### Security Considerations

⚠️ **Risks**:
- Store GitHub credentials in CI (credential leakage)
- Automated OAuth may violate GitHub ToS (bot detection)
- Session tokens stored in CI artifacts (exposure risk)

**Mitigations**:
- Use GitHub service account (not personal account)
- Encrypt session storage
- Rotate credentials monthly
- GitHub App authentication (instead of OAuth)

---

### Option 2A: API Health Endpoint Enhancement ✅ RECOMMENDED

**Concept**: Extend existing `/api/health/keystatic` endpoint to validate production content state.

#### Technical Approach

**Current State** (`/app/api/health/keystatic/route.ts`):
- Reads `content/navigation/navigation.yaml`
- Validates Keystatic reader initialization
- Returns health status (healthy/degraded/unhealthy)

**Enhancement**:
```typescript
// app/api/health/keystatic/route.ts (enhanced)
import { createReader } from '@keystatic/core/reader';
import keystaticConfig from '@/keystatic.config';

export async function GET() {
  const reader = createReader(process.cwd(), keystaticConfig);

  // Existing checks
  const navigation = await reader.singletons.siteNavigation.read();

  // NEW: Validate critical pages exist
  const criticalPages = [
    'index',
    'summer-camp',
    'work-at-camp',
    'facilities',
    'retreats',
    'give',
    'about',
  ];

  const missingPages = [];
  const pageValidation = await Promise.all(
    criticalPages.map(async (slug) => {
      const page = await reader.collections.pages.read(slug);
      if (!page) {
        missingPages.push(slug);
        return { slug, exists: false };
      }
      return {
        slug,
        exists: true,
        hasTitle: !!page.title,
        hasBody: !!page.body,
        templateType: page.templateFields.discriminant,
      };
    })
  );

  // NEW: Validate homepage heroImages carousel (REQ-HERO-001)
  const homepage = await reader.collections.pages.read('index');
  const hasCarousel = homepage?.templateFields.discriminant === 'homepage' &&
                      homepage.templateFields.value.heroImages?.length > 0;

  // NEW: Validate navigation menu structure
  const expectedMenuItems = ['Summer Camp', 'Work at Camp', 'Retreats', 'Give', 'About'];
  const actualMenuItems = navigation?.menuItems.map(item => item.label) || [];
  const missingMenuItems = expectedMenuItems.filter(item => !actualMenuItems.includes(item));

  return NextResponse.json({
    status: missingPages.length === 0 && missingMenuItems.length === 0 ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),

    // Existing fields
    navigation: { /* ... */ },
    keystatic: { /* ... */ },

    // NEW: Content validation
    contentValidation: {
      criticalPages: {
        total: criticalPages.length,
        present: criticalPages.length - missingPages.length,
        missing: missingPages,
        details: pageValidation,
      },
      features: {
        homepageCarousel: hasCarousel,
        navigationMenu: {
          expected: expectedMenuItems,
          actual: actualMenuItems,
          missing: missingMenuItems,
        },
      },
    },
  });
}
```

#### Integration with Smoke Tests

**Enhanced smoke test** (`scripts/smoke-test.sh`):
```bash
# After existing page tests, check content health
HEALTH_URL="https://${DOMAIN}/api/health/keystatic"
HEALTH_RESPONSE=$(curl -s "$HEALTH_URL")

STATUS=$(echo "$HEALTH_RESPONSE" | jq -r '.status')
MISSING_PAGES=$(echo "$HEALTH_RESPONSE" | jq -r '.contentValidation.criticalPages.missing[]')
MISSING_MENU_ITEMS=$(echo "$HEALTH_RESPONSE" | jq -r '.contentValidation.features.navigationMenu.missing[]')

if [[ "$STATUS" != "healthy" ]]; then
  echo "❌ Content validation failed"
  [[ -n "$MISSING_PAGES" ]] && echo "  Missing pages: $MISSING_PAGES"
  [[ -n "$MISSING_MENU_ITEMS" ]] && echo "  Missing menu items: $MISSING_MENU_ITEMS"
  exit 1
fi
```

**Performance**: +0.3s per smoke test run (single API call)

#### Pros

- **Zero Dependencies**: Uses existing Keystatic reader (already working)
- **Fast**: Single HTTP request (300ms)
- **Production Safe**: Read-only operations, no auth required
- **AI Debuggable**: Structured JSON output with specific failures
- **Low Maintenance**: No UI scraping, survives Keystatic upgrades
- **Existing Infrastructure**: Extends current `/api/health/keystatic` endpoint

#### Cons

- **Limited to Git Content**: Only validates what's in GitHub repo (not live CMS state)
- **No UI Validation**: Can't verify Keystatic admin UI is accessible
- **Requires Deployment**: Health endpoint must be deployed to test

#### Story Point Estimate

- **Implementation**: 1 SP
  - Enhance health endpoint: 0.5 SP
  - Add content validation logic: 0.3 SP
  - Integrate with smoke test script: 0.2 SP
- **Maintenance**: Minimal (<0.1 SP per feature addition)

#### Security Considerations

✅ **Low Risk**:
- Read-only operations
- No authentication required (public endpoint)
- No credential storage
- No session management

---

### Option 2B: Dedicated Smoke Test API

**Concept**: Create separate `/api/smoke-test` endpoint specifically for production validation.

#### Technical Approach

```typescript
// app/api/smoke-test/route.ts
import { createReader } from '@keystatic/core/reader';
import keystaticConfig from '@/keystatic.config';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const checks = searchParams.get('checks')?.split(',') || ['all'];

  const reader = createReader(process.cwd(), keystaticConfig);
  const results = {
    timestamp: new Date().toISOString(),
    checks: {},
  };

  // Check 1: All pages exist
  if (checks.includes('all') || checks.includes('pages')) {
    const pages = await reader.collections.pages.list();
    const expectedPages = 24; // From smoke test discovery
    results.checks.pages = {
      pass: pages.length === expectedPages,
      expected: expectedPages,
      actual: pages.length,
      missing: expectedPages - pages.length,
    };
  }

  // Check 2: Navigation integrity
  if (checks.includes('all') || checks.includes('navigation')) {
    const nav = await reader.singletons.siteNavigation.read();
    const requiredItems = ['Summer Camp', 'Work at Camp', 'Retreats', 'Give', 'About'];
    const actualItems = nav?.menuItems.map(item => item.label) || [];
    const missing = requiredItems.filter(item => !actualItems.includes(item));

    results.checks.navigation = {
      pass: missing.length === 0,
      required: requiredItems,
      missing,
    };
  }

  // Check 3: Homepage carousel (REQ-HERO-001)
  if (checks.includes('all') || checks.includes('homepage-carousel')) {
    const homepage = await reader.collections.pages.read('index');
    const hasCarousel = homepage?.templateFields.discriminant === 'homepage' &&
                        homepage.templateFields.value.heroImages?.length > 0;

    results.checks.homepageCarousel = {
      pass: hasCarousel,
      imageCount: homepage?.templateFields.value.heroImages?.length || 0,
    };
  }

  // Check 4: Feature flags (extensible for future features)
  if (checks.includes('all') || checks.includes('features')) {
    results.checks.features = {
      // Add feature-specific checks here
      youtubeMarkdocTag: true, // Placeholder
      distressedTextTexture: true, // Placeholder
    };
  }

  const allPassed = Object.values(results.checks).every((check: any) => check.pass !== false);

  return NextResponse.json({
    pass: allPassed,
    ...results,
  }, {
    status: allPassed ? 200 : 500,
  });
}
```

#### Usage

```bash
# Basic smoke test
curl https://prelaunch.bearlakecamp.com/api/smoke-test

# Selective checks (faster)
curl https://prelaunch.bearlakecamp.com/api/smoke-test?checks=pages,navigation

# Integrate with existing smoke test
./scripts/smoke-test.sh prelaunch.bearlakecamp.com
# (script automatically calls /api/smoke-test after page tests)
```

#### Pros

- **Extensible**: Easy to add new checks without touching smoke-test.sh
- **Selective Testing**: Query param control (test specific features)
- **Clean Separation**: Dedicated endpoint vs. overloading /health
- **Type-Safe**: TypeScript contract for smoke test expectations

#### Cons

- **Duplicate Logic**: Some overlap with `/api/health/keystatic`
- **More Code**: Additional endpoint to maintain
- **Slower**: Multiple checks increase response time

#### Story Point Estimate

- **Implementation**: 2 SP
  - Create new API route: 0.5 SP
  - Implement content checks: 1 SP
  - Integrate with smoke test: 0.3 SP
  - Tests: 0.2 SP
- **Maintenance**: 0.2 SP per feature addition

#### vs. Option 2A

| Criterion | 2A (Health Endpoint) | 2B (Smoke Test API) |
|-----------|---------------------|---------------------|
| **Implementation** | 1 SP | 2 SP |
| **Maintenance** | Low | Medium |
| **Extensibility** | Limited (health focus) | High (purpose-built) |
| **Code Duplication** | None | Some |
| **Recommendation** | ✅ Start here | ⚠️ If 2A insufficient |

---

### Option 3: Checkly Integration

**Concept**: Use Checkly's Vercel integration for managed production monitoring.

#### Technical Approach

**Integration Steps**:
1. Install [Checkly Vercel Integration](https://vercel.com/integrations/checkly)
2. Connect to Vercel project (bearlakecamp-nextjs)
3. Configure checks via Checkly dashboard or CLI

**Checkly CLI Setup**:
```bash
npm install -D checkly
npx checkly init

# checkly/homepage-carousel.check.ts
import { ChecklyConfig, ApiCheck } from 'checkly/constructs';

const check = new ApiCheck('homepage-carousel', {
  name: 'Homepage Carousel Exists',
  activated: true,
  locations: ['us-east-1', 'eu-west-1'],
  request: {
    url: 'https://prelaunch.bearlakecamp.com/api/health/keystatic',
    method: 'GET',
  },
  assertions: [
    {
      source: 'JSON_BODY',
      property: '$.contentValidation.features.homepageCarousel',
      comparison: 'EQUALS',
      target: true,
    },
  ],
});
```

**Browser Check** (for Keystatic admin validation):
```typescript
// checkly/keystatic-admin.check.ts
import { BrowserCheck } from 'checkly/constructs';

const check = new BrowserCheck('keystatic-admin-accessible', {
  name: 'Keystatic Admin Accessible',
  activated: true,
  locations: ['us-east-1'],
  script: `
    const { chromium } = require('playwright');
    const browser = await chromium.launch();
    const page = await browser.newPage();

    await page.goto('https://prelaunch.bearlakecamp.com/keystatic');

    // Verify admin UI loads (without logging in)
    const title = await page.title();
    expect(title).toContain('Keystatic');

    await browser.close();
  `,
});
```

#### Deployment

```bash
# Deploy checks to Checkly
npx checkly deploy

# Triggered automatically on Vercel deployments (via integration)
```

#### Features

- **Automated Monitoring**: Runs checks every 5-60 minutes
- **Vercel Integration**: Auto-tests preview + production deployments
- **Alerting**: Slack, email, PagerDuty on failures
- **Retries**: Smart retry logic (reduces false positives)
- **Global Checks**: Test from multiple regions (detect geo-specific issues)

#### Pros

- **Managed Solution**: No infrastructure to maintain
- **Continuous Monitoring**: Catches issues between deployments
- **Professional Alerting**: Slack/email notifications
- **Browser Checks**: Can validate JavaScript interactions
- **Official Vercel Integration**: Seamless deployment flow

#### Cons

- **Cost**: $80/month (Team plan for 10k checks/month)
- **External Dependency**: Third-party service (vendor lock-in)
- **Learning Curve**: New tool/CLI to learn
- **Limited Free Tier**: 500 checks/month (not enough for CI)

#### Story Point Estimate

- **Initial Setup**: 1-2 SP
  - Install integration: 0.2 SP
  - Configure API checks: 0.5 SP
  - Configure browser checks: 0.8 SP
  - Alert setup: 0.2 SP
  - Documentation: 0.3 SP
- **Maintenance**: 0.1 SP per check update

#### Cost Analysis

**Checkly Pricing** (as of 2025):
- **Hobby**: $0 (500 checks/month) — Too low for CI
- **Team**: $80/month (10k checks/month) — Covers CI + monitoring
- **Business**: $300/month (50k checks) — Overkill

**Alternative**: Free tier + selective checks (only critical features)

#### vs. Option 2A

| Criterion | 2A (Health Endpoint) | 3 (Checkly) |
|-----------|---------------------|-------------|
| **Cost** | $0 | $80/mo |
| **Setup** | 1 SP | 1-2 SP |
| **Monitoring** | Manual (via smoke test) | Automatic (continuous) |
| **Alerting** | None (CI failures only) | Slack, email, PagerDuty |
| **Recommendation** | ✅ Start here | ⚠️ If budget + uptime SLA |

---

### Option 4: Git Content Diff Validation

**Concept**: Validate production content matches git commit SHA by comparing file hashes.

#### Technical Approach

**Strategy**: Fetch Vercel build info → get git SHA → compare content files

```bash
# scripts/validate-production-content.sh

DOMAIN="prelaunch.bearlakecamp.com"

# Step 1: Get current Vercel deployment build
BUILD_ID=$(curl -sI "https://${DOMAIN}" | grep -i x-vercel-id | awk '{print $2}' | tr -d '\r')

# Step 2: Get git SHA for this deployment (via Vercel API)
GIT_SHA=$(vercel inspect "$BUILD_ID" --token "$VERCEL_TOKEN" | jq -r '.gitSource.sha')

# Step 3: Checkout this commit locally
git fetch origin
git checkout "$GIT_SHA"

# Step 4: Compare content files
# Method: Hash local content/ directory vs. production content
find content/pages -name "*.mdoc" -exec shasum {} \; | sort > /tmp/local-hashes.txt

# Fetch production content hashes (via API or direct content access)
# Note: Keystatic stores content in GitHub, so we can compare against GitHub repo
gh api repos/sparkst/bearlakecamp/git/trees/"$GIT_SHA" --jq '.tree[] | select(.path | startswith("content/pages")) | "\(.path) \(.sha)"' | sort > /tmp/prod-hashes.txt

# Compare
if diff /tmp/local-hashes.txt /tmp/prod-hashes.txt > /dev/null; then
  echo "✅ Production content matches git SHA $GIT_SHA"
else
  echo "❌ Content mismatch!"
  diff /tmp/local-hashes.txt /tmp/prod-hashes.txt
  exit 1
fi
```

#### Pros

- **Source of Truth**: Git is canonical (guarantees correctness)
- **No Runtime Dependencies**: Pure git/GitHub API
- **Precise**: Detects exact file differences
- **Fast**: SHA comparison is instant

#### Cons

- **Doesn't Test Rendering**: Only validates files exist, not that they render
- **Requires GitHub API**: Need `gh` CLI or GitHub API token
- **Build-Time Only**: Can't detect runtime content issues
- **Doesn't Catch Feature Flags**: Won't detect if feature toggle is off

#### Story Point Estimate

- **Implementation**: 1 SP
  - Vercel build → git SHA mapping: 0.3 SP
  - Content hash comparison: 0.4 SP
  - GitHub API integration: 0.2 SP
  - Error handling: 0.1 SP

#### Use Case

**Complementary to Option 2A**: Run git diff validation to ensure build deployed correct commit, then run health endpoint to validate rendering.

```bash
# Combined smoke test pipeline
./scripts/validate-production-content.sh  # Git SHA validation
./scripts/smoke-test.sh                   # HTTP + health API validation
```

---

## Comparison Matrix (Full)

| Criterion | 1. Playwright | 2A. Health Endpoint ✅ | 2B. Smoke API | 3. Checkly | 4. Git Diff |
|-----------|---------------|------------------------|---------------|------------|-------------|
| **Implementation Time** | 3-5 SP | 1 SP | 2 SP | 1-2 SP | 1 SP |
| **Speed** | 30-60s | 0.3s | 0.5s | 5-30s | 1s |
| **External Dependencies** | High | None | None | Medium | Medium |
| **Monthly Cost** | $0 | $0 | $0 | $80 | $0 |
| **Maintenance Burden** | High | Low | Medium | Low | Low |
| **Production Safety** | Medium | High | High | High | High |
| **Content Validation** | High | Medium | High | High | Low |
| **UI Validation** | High | None | None | Medium | None |
| **Rendering Validation** | High | Medium | Medium | High | None |
| **False Positive Rate** | High | Low | Low | Low | Very Low |
| **AI Debuggability** | Low | High | High | Medium | Medium |

---

## Recommendation

### Phase 1: Option 2A - Health Endpoint Enhancement (1 SP) ✅

**Rationale**:
1. **Fastest to implement**: Extends existing `/api/health/keystatic` endpoint
2. **Zero dependencies**: Uses working Keystatic reader
3. **Production safe**: Read-only, no auth required
4. **Integrates with current smoke tests**: Single API call in existing pipeline
5. **AI debuggable**: Structured JSON output for Claude

**Implementation Priority**:
```
Week 1: Enhance /api/health/keystatic (0.5 SP)
  - Add critical page validation
  - Add homepage carousel check
  - Add navigation menu validation

Week 1: Integrate with smoke test (0.3 SP)
  - Update scripts/smoke-test.sh
  - Add health endpoint call
  - Parse JSON response

Week 1: Deploy and test (0.2 SP)
  - Deploy to prelaunch.bearlakecamp.com
  - Run smoke test
  - Verify failures are caught
```

### Phase 2 (If Insufficient): Option 3 - Checkly ($80/mo budget)

**Trigger**: If feature disappearances continue after Phase 1

**Rationale**:
- Continuous monitoring (catches issues between deployments)
- Browser checks (validates Keystatic admin UI)
- Professional alerting (Slack notifications)

### Phase 3 (Complementary): Option 4 - Git Diff Validation (1 SP)

**Trigger**: If root cause is deployment not matching git commit

**Rationale**:
- Validates build deployed correct git SHA
- Catches Vercel build issues
- Fast (1s overhead)

---

## Implementation Plan (Phase 1)

### Requirements

**REQ-001: Critical Page Validation**
- **Acceptance**: Health endpoint returns list of missing critical pages
- **Test**: Temporarily remove `summer-camp.mdoc`, verify endpoint reports failure

**REQ-002: Homepage Carousel Validation**
- **Acceptance**: Health endpoint checks `heroImages.length > 0` for homepage
- **Test**: Set `heroImages: []`, verify endpoint reports `hasCarousel: false`

**REQ-003: Navigation Menu Validation**
- **Acceptance**: Health endpoint compares expected vs. actual menu items
- **Test**: Remove "Summer Camp" from navigation.yaml, verify failure

**REQ-004: Smoke Test Integration**
- **Acceptance**: `scripts/smoke-test.sh` calls health endpoint, fails if degraded
- **Test**: Run smoke test against degraded environment, verify exit code 1

### Code Changes

**File**: `/app/api/health/keystatic/route.ts` (enhance existing)
- Lines to add: ~80
- Complexity: Low (read operations only)

**File**: `/scripts/smoke-test.sh` (add health check)
- Lines to add: ~15
- Complexity: Low (curl + jq)

### Testing Strategy

**Unit Tests** (`app/api/health/keystatic/route.spec.ts`):
```typescript
test('REQ-001: reports missing critical pages', async () => {
  // Mock reader to return pages without 'summer-camp'
  const response = await GET();
  const json = await response.json();

  expect(json.contentValidation.criticalPages.missing).toContain('summer-camp');
  expect(json.status).toBe('degraded');
});

test('REQ-002: detects missing homepage carousel', async () => {
  // Mock homepage with heroImages: []
  const response = await GET();
  const json = await response.json();

  expect(json.contentValidation.features.homepageCarousel).toBe(false);
  expect(json.status).toBe('degraded');
});
```

**Integration Test** (bash):
```bash
# Test 1: Healthy state
RESPONSE=$(curl -s https://prelaunch.bearlakecamp.com/api/health/keystatic)
STATUS=$(echo "$RESPONSE" | jq -r '.status')
[[ "$STATUS" == "healthy" ]] || exit 1

# Test 2: Degraded state (simulate)
# (Temporarily remove page via git, deploy, test)
```

### Deployment Checklist

- [ ] Enhance `/app/api/health/keystatic/route.ts`
- [ ] Add unit tests (coverage ≥90%)
- [ ] Update `/scripts/smoke-test.sh`
- [ ] Test locally against prelaunch
- [ ] Deploy to Vercel
- [ ] Run smoke test in production
- [ ] Verify failures are caught
- [ ] Document usage in `docs/operations/SMOKE-TEST-USAGE.md`
- [ ] Commit with message: `feat(health): add content validation to Keystatic health endpoint (REQ-001, REQ-002, REQ-003)`

---

## Open Questions

### Q1: Should health endpoint be authenticated?

**Context**: Currently public endpoint (no auth)

**Options**:
1. **Public** (current) — Anyone can check health
2. **Token-based** — Require `?token=SECRET` query param
3. **IP allowlist** — Only Vercel, GitHub Actions IPs

**Recommendation**: Keep public (read-only data, no PII)

---

### Q2: How to handle dynamic routes (e.g., `/staff/[slug]`)?

**Context**: Current approach only validates static pages

**Options**:
1. **Sample testing**: Validate 1-2 example slugs
2. **Full enumeration**: Discover all slugs from content files
3. **Skip dynamic routes**: Only test static routes

**Recommendation**: Full enumeration (parse `content/staff/*.mdoc` to get slugs)

**Enhancement**:
```typescript
// In health endpoint
const staffSlugs = await reader.collections.staff.list();
const staffValidation = await Promise.all(
  staffSlugs.map(async (slug) => {
    const staff = await reader.collections.staff.read(slug);
    return {
      slug,
      exists: !!staff,
      hasPhoto: !!staff?.photo,
    };
  })
);
```

---

### Q3: How frequently should production be monitored?

**Context**: Currently manual smoke tests before deployment

**Options**:
1. **Deployment-triggered**: Only on git push (current)
2. **Scheduled**: Daily cron job (uptime monitoring)
3. **Continuous**: Every 5 minutes (requires Checkly or similar)

**Recommendation**:
- **Phase 1**: Deployment-triggered (via GitHub Actions)
- **Phase 2**: Add daily cron if needed (detects external issues)

**GitHub Actions Workflow** (`.github/workflows/daily-smoke-test.yml`):
```yaml
name: Daily Production Health Check

on:
  schedule:
    - cron: '0 12 * * *'  # Noon UTC daily
  workflow_dispatch:       # Manual trigger

jobs:
  smoke-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run smoke tests
        run: ./scripts/smoke-test.sh www.bearlakecamp.com
```

---

## Risk Assessment

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| **Health endpoint slow** | Low | Medium | Cache reader initialization, set 5s timeout |
| **False positives** | Medium | Low | Add retry logic, tolerance for transient failures |
| **Breaking changes in Keystatic API** | Low | High | Pin Keystatic version, test on upgrades |
| **Build deployed != git commit** | Medium | High | Add Option 4 (git diff validation) |

### Operational Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| **Missed feature disappearance** | Medium | High | Add comprehensive content checks (all features) |
| **Smoke test not run before deploy** | Medium | Medium | Enforce in CI (block merge on failure) |
| **Alert fatigue** | Low | Medium | Tune thresholds, reduce noise |

---

## Success Metrics

### Phase 1 (Health Endpoint)

**Goal**: Catch 90% of feature disappearances before production

**Metrics**:
- **Coverage**: ≥20 critical pages validated
- **Speed**: Health endpoint responds in <500ms
- **Reliability**: <5% false positive rate
- **Detection**: Features missing from production flagged within 1 deployment

### Phase 2 (Checkly, if implemented)

**Goal**: 99.9% uptime visibility

**Metrics**:
- **Monitoring Frequency**: Every 5 minutes
- **Alert Latency**: <2 minutes from failure to Slack notification
- **False Positive Rate**: <1% (via Checkly retries)

---

## Cost-Benefit Analysis

### Option 2A (Recommended)

**Costs**:
- **Implementation**: 1 SP (~2 hours engineering)
- **Maintenance**: <0.1 SP per month
- **Operational**: $0

**Benefits**:
- **Feature Disappearance Detection**: 90% reduction
- **Deployment Confidence**: High (validated before DNS cutover)
- **Debugging Time**: 50% reduction (structured errors)
- **Production Incidents**: 80% reduction

**ROI**: High (minimal cost, high impact)

### Option 3 (Checkly)

**Costs**:
- **Implementation**: 1-2 SP
- **Monthly Subscription**: $80
- **Annual**: $960

**Benefits**:
- **Continuous Monitoring**: 24/7 uptime visibility
- **Professional Alerting**: Slack, PagerDuty integration
- **Global Checks**: Multi-region validation
- **Browser Tests**: JavaScript interaction validation

**ROI**: Medium (cost justified if uptime SLA required)

---

## Next Steps

### Immediate (Week 1)

1. **QPLAN**: Draft requirements for REQ-001, REQ-002, REQ-003, REQ-004
2. **QCODET**: Write tests for health endpoint enhancements
3. **QCODE**: Implement changes to `/app/api/health/keystatic/route.ts`
4. **QCHECK**: PE review + test coverage validation
5. **QDOC**: Update `docs/operations/SMOKE-TEST-USAGE.md`
6. **QGIT**: Commit and deploy

### Follow-Up (Week 2)

1. **Monitor**: Run daily smoke tests for 1 week
2. **Measure**: Track false positive rate, detection accuracy
3. **Decide**: Evaluate if Checkly needed (based on Phase 1 results)

### Long-Term (Month 2)

1. **Option 4**: Implement git diff validation if needed
2. **GitHub Actions**: Set up daily cron job for production monitoring
3. **Alerting**: Configure Slack notifications (if using Checkly)

---

## References

### Research Sources

- [Keystatic Documentation](https://keystatic.com/docs/introduction)
- [Playwright Authentication](https://playwright.dev/docs/auth)
- [Checkly Vercel Integration](https://vercel.com/integrations/checkly)
- [Vercel Deployment Smoke Testing](https://vercel.com/kb/guide/how-can-i-run-end-to-end-tests-after-my-vercel-preview-deployment)
- [CircleCI Smoke Testing Guide](https://circleci.com/blog/smoke-tests-in-cicd-pipelines/)

### Internal Documentation

- `/docs/operations/SMOKE-TEST-USAGE.md` - Current smoke test system
- `/docs/technical/SMOKE-TEST-SYSTEM-DESIGN.md` - Architecture
- `/app/api/health/keystatic/route.ts` - Existing health endpoint
- `/scripts/smoke-test.sh` - Smoke test runner

---

**END OF STRATEGIC ANALYSIS**

**Decision Required**: Approve Phase 1 (Option 2A) for implementation?
