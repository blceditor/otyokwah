# Requirements Document - Updates 01

**Version**: 1.0
**Date**: 2025-12-17
**Status**: Planning
**Source**: requirements/Updates-01.md

---

## REQ-U01-001: Hero Video Height Consistency for Work-at-Camp Pages

**Priority**: P1
**Story Points**: 0.3

### Description

Hero videos on work-at-camp-summer-staff and work-at-camp-leaders-in-training pages are cutting off people's heads due to incorrect video container height. Videos must match the homepage hero video height to ensure proper framing.

### Acceptance Criteria

1. Hero video on `/work-at-camp-summer-staff` displays with same minimum height as homepage hero (h-screen min-h-[60vh] md:min-h-[70vh] lg:min-h-[80vh])
2. Hero video on `/work-at-camp-leaders-in-training` displays with same minimum height as homepage hero
3. Video content is not cropped - full vertical frame is visible on all viewport sizes (mobile, tablet, desktop)
4. Visual regression test confirms no head cropping on test videos
5. Playwright test validates computed height matches HeroVideo component specifications

### Technical Details

**Current State**:
- `components/hero/HeroVideo.tsx` line 29: Uses `h-screen min-h-[60vh] md:min-h-[70vh] lg:min-h-[80vh]`
- Both pages use `HeroVideo` component via `StaffTemplate.tsx` line 104-109

**Root Cause**: Investigate if custom CSS or template overrides are reducing hero height

**Implementation**:
- Audit `StaffTemplate.tsx` for height overrides
- Ensure `HeroVideo` component height is not modified by parent containers
- Add responsive breakpoint tests

### Non-Goals

- Changing homepage hero video height
- Modifying video encoding/compression
- Adding video controls or playback options

### Dependencies

- None (isolated CSS/component fix)

### Testing Strategy

```typescript
// tests/e2e/smoke/hero-videos.spec.ts
test('REQ-U01-001: Work-at-camp hero videos have consistent height with homepage', async ({ page }) => {
  // Get homepage hero height
  await page.goto('/');
  const homepageHeight = await page.locator('#hero-video').boundingBox();

  // Compare work-at-camp-summer-staff
  await page.goto('/work-at-camp-summer-staff');
  const summerStaffHeight = await page.locator('#hero-video').boundingBox();
  expect(summerStaffHeight?.height).toBeGreaterThanOrEqual(homepageHeight?.height! * 0.95);

  // Compare work-at-camp-leaders-in-training
  await page.goto('/work-at-camp-leaders-in-training');
  const litHeight = await page.locator('#hero-video').boundingBox();
  expect(litHeight?.height).toBeGreaterThanOrEqual(homepageHeight?.height! * 0.95);
});
```

---

## REQ-U01-002: Camp Sessions Page Redesign

**Priority**: P0
**Story Points**: 5

### Description

Redesign `/summer-camp-sessions` page to match the visual style and layout of `/work-at-camp-leaders-in-training`. Replace current card grid layout with alternating image/content rows, hero video at top, and in-page navigation links for age ranges.

### Acceptance Criteria

1. **Hero Video Section**:
   - Hero video displays at top of page (similar to LIT page)
   - Uses `/videos/hero-camp-sessions.mp4` (already configured in mdoc frontmatter)
   - Tagline reads "Summer 2026 Sessions"
   - Minimum height matches homepage hero standards (REQ-U01-001)

2. **In-Page Navigation**:
   - Four anchor links below hero: "Primary Overnight", "Junior Camp", "Jr. High Camp", "Sr. High Camp"
   - Links scroll smoothly to corresponding sections
   - Sticky navigation on scroll (mobile-friendly)
   - Active section highlighting

3. **Age Range Sections** (Alternating Layout):
   - **Primary Overnight** (image left, content right):
     - Image: Camp-appropriate photo for K-2nd graders
     - Content card styled like LIT SESSIONS section
     - Title: "Primary Overnight"
     - Details: Ages, Date, Fee, Description (per Updates-01.md lines 4-8)

   - **Junior Camp** (image right, content left):
     - Three sessions: Junior 1 (June 14-19), Junior 2 (July 5-10), Junior 3 (July 19-23)
     - Grouped under "Junior Camp (Grades 3-6)" heading
     - Content cards show session-specific dates and fees

   - **Jr. High Camp** (image left, content right):
     - Three sessions: Jr. High 1, 2, 3
     - Grouped under "Jr. High Camp (Grades 7-9)" heading

   - **Sr. High Camp** (image right, content left):
     - Single session
     - "Sr. High Camp (Grades 10-12)" heading

4. **Content Cards**:
   - Match LIT SESSIONS card style (border-2 border-secondary/20, rounded-lg, p-6)
   - Each card includes: Session name, Ages, Date, Fee, Description
   - Early bird pricing displayed: "$390 through 4/14 ($440 after 4/14)"
   - Hover effects consistent with existing ContentCard component

5. **Registration Notes Section**:
   - Below all session sections
   - Two-column layout (desktop), stacked (mobile)
   - Left: Registration notes (grade levels, discounts)
   - Right: Scholarship information + Google Form link

6. **Responsive Design**:
   - Alternating layout collapses to stacked on mobile (<768px)
   - Images maintain aspect ratio
   - Text remains readable at all breakpoints

7. **Accessibility**:
   - Proper heading hierarchy (h1 → h2 → h3)
   - Alt text for all images
   - ARIA labels for navigation links
   - Keyboard navigation support

### Content Data

**Primary Overnight**:
- Ages: Rising 2nd-3rd Graders
- Date: June 4-5, 2026
- Fee: $100
- Description: "A fun first taste of overnight camp just for our youngest campers! Primary Overnight lets our campers experience camp games, cabin time, and community all in an action packed introduction to the Bear Lake Camp experience."

**Junior 1**:
- Ages: Rising 4th-6th Graders
- Date: June 14-19, 2026
- Fee: $390 through 4/14 ($440 after 4/14)
- Description: "Full-week adventure for grades 4–6! Junior Campers enjoy a full schedule of activities — Worship, Bible Study, games (like Mêlée), waterfront fun, crafts, campfires, and more — all while building mentor relationships and friendships."

**Junior 2**:
- Ages: Rising 4th-6th Graders
- Date: July 5-10, 2026
- Fee: $390 through 4/14 ($440 after 4/14)
- Description: "Full-week adventure for grades 4–6! Junior Campers enjoy a full schedule of activities — Worship, Bible Study, games (like Mêlée), waterfront fun, crafts, campfires, and more — all while building mentor relationships and friendships."

**Junior 3**:
- Ages: Rising 3rd-5th Graders
- Date: July 19-23, 2026
- Fee: $390 through 4/14 ($440 after 4/14)
- Description: "Full-week adventure for grades 3-5! Junior Campers enjoy a full schedule of activities — Worship, Bible Study, games (like Mêlée), waterfront fun, crafts, campfires, and more — all while building mentor relationships and friendships."

**Jr. High 1, 2, 3**:
- Ages: Rising 7th-9th Graders
- Dates: June 7-12, June 21-26, July 12-17, 2026
- Fee: $390 through 4/14 ($440 after 4/14)
- Description: "A week of growth and exploration for grades 7–9! Jr. Higher Campers get challenged to grow in their faith through group discussions, Inductive Bible Studies, and Chapel Messages. Add in activities like team games, the giant Slip-n-Slide, and group experiences that help them grow in friendship, faith, and independence."

**Sr. High**:
- Ages: Rising 10th Graders through Grads
- Date: June 28-July 3, 2026
- Fee: $390 through 4/14 ($440 after 4/14)
- Description: "Our oldest summer session for grades 10–12! Sr. High campers dive into rich community, awesome activities like black light dodgeball and a Hoe Down, and are equipped to engage Jesus Christ through Scripture and Worship — all while enjoying the full Bear Lake Camp experience."

**Registration Notes**:
- NOTE: Grade levels shown are based on the grade camper will be going into in the upcoming school year.
- SHARE THE LOVE DISCOUNT: $50 off your week of camp for every first time camper who attends the same week because of your invitation. Applied upon arrival at session check-in.
- Registration Questions: E-mail registrar@bearlakecamp.com or call 260-799-5988

**Scholarship Block**:
- "We want everyone who desires to attend camp to be able to have the opportunity. Please contact your local church for financial assistance*. If additional assistance is needed then contact the BLC office. *Church scholarships are applied to your account only after being confirmed by the church."
- Form link: https://docs.google.com/forms/d/e/1FAIpQLSeS0Bck8_J7hPzgF46f6W_Y3SBADHPnH6rCTP-U1Cht2QHw0w/viewform

### Non-Goals

- Changing session dates or pricing
- Integrating online registration system (use external UltraCamp links)
- Creating new video content
- Modifying other summer camp pages (junior-high, senior-high)

### Dependencies

- REQ-U01-001 (hero video height consistency)
- Existing ContentCard component styling
- Hero video file `/videos/hero-camp-sessions.mp4` already exists

### Testing Strategy

```typescript
// tests/e2e/camp-sessions-redesign.spec.ts
test('REQ-U01-002-01: Hero video section displays correctly', async ({ page }) => {
  await page.goto('/summer-camp-sessions');
  await expect(page.locator('#hero-video')).toBeVisible();
  await expect(page.locator('h1')).toContainText('Summer 2026 Sessions');
});

test('REQ-U01-002-02: In-page navigation links work', async ({ page }) => {
  await page.goto('/summer-camp-sessions');

  await page.click('a[href="#primary-overnight"]');
  await expect(page.locator('#primary-overnight')).toBeInViewport();

  await page.click('a[href="#junior-camp"]');
  await expect(page.locator('#junior-camp')).toBeInViewport();
});

test('REQ-U01-002-03: Session cards display with correct content', async ({ page }) => {
  await page.goto('/summer-camp-sessions');

  // Verify Primary Overnight
  const primaryCard = page.locator('[data-testid="session-primary-overnight"]');
  await expect(primaryCard).toContainText('Primary Overnight');
  await expect(primaryCard).toContainText('June 4-5, 2026');
  await expect(primaryCard).toContainText('$100');
});

test('REQ-U01-002-04: Alternating layout renders on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/summer-camp-sessions');

  // Check image positioning
  const primarySection = page.locator('#primary-overnight');
  const imagePosition = await primarySection.locator('img').evaluate(el => {
    return window.getComputedStyle(el.parentElement!).order;
  });
  expect(imagePosition).toBe('-1'); // Image left
});
```

---

## REQ-U01-003: ContentCard Icon Alignment Fix

**Priority**: P2
**Story Points**: 0.2

### Description

ContentCard component icon should be vertically aligned with the card title text. Icon height must match the title font size (text-xl), and both should align to the same baseline.

### Acceptance Criteria

1. Icon height matches title font size (currently title is text-xl = 1.25rem = 20px)
2. Icon and title align to same baseline (flex items-center)
3. Title font size increases by one size: text-xl → text-2xl (1.5rem = 24px)
4. Icon scales proportionally to new title size (h-10 w-10 for 24px match)
5. Visual regression test confirms alignment across all ContentCard instances

### Technical Details

**Current State** (`components/content/ContentCard.tsx`):
- Line 36: Icon uses `h-8 w-8` (32px)
- Line 55: Title uses `text-xl` (20px = 1.25rem)
- Gap: Icon is 12px taller than title

**Proposed Changes**:
- Title: `text-xl` → `text-2xl` (20px → 24px)
- Icon: `h-8 w-8` → `h-10 w-10` (32px → 40px, maintains ~1.67x ratio)
- Container: Verify `flex items-center` alignment

### Non-Goals

- Changing icon color or style
- Modifying card padding or spacing
- Altering other card component properties

### Dependencies

- None (isolated component change)

### Testing Strategy

```typescript
// components/content/ContentCard.spec.tsx
test('REQ-U01-003: Icon height matches title font size', () => {
  render(<ContentCard title="Test Card" icon="Star" />);

  const icon = screen.getByTestId('icon-Star');
  const title = screen.getByText('Test Card');

  const iconHeight = icon.getBoundingClientRect().height;
  const titleFontSize = window.getComputedStyle(title).fontSize;

  // Icon should be proportional to title size (within 10px tolerance)
  expect(iconHeight).toBeGreaterThanOrEqual(parseFloat(titleFontSize) - 5);
  expect(iconHeight).toBeLessThanOrEqual(parseFloat(titleFontSize) + 15);
});

test('REQ-U01-003: Icon and title vertically align', () => {
  render(<ContentCard title="Test Card" icon="Star" />);

  const iconContainer = screen.getByTestId('icon-Star').parentElement;
  const title = screen.getByText('Test Card');

  const iconY = iconContainer.getBoundingClientRect().y;
  const titleY = title.getBoundingClientRect().y;

  // Should be within 2px (accounting for line-height)
  expect(Math.abs(iconY - titleY)).toBeLessThan(2);
});
```

---

## REQ-U01-004: Accordion Styling Improvements

**Priority**: P2
**Story Points**: 0.5

### Description

Accordion components (FAQAccordion and Accordion) need improved padding symmetry and color scheme updates. Answer content padding must match collapse/expand area padding, and border colors should use brown theme instead of gray/black.

### Acceptance Criteria

1. **Padding Symmetry**:
   - Answer content top padding matches bottom padding (currently `p-4 pt-0` creates asymmetry)
   - Change to `p-4 pt-4` for equal spacing
   - Mobile and desktop padding remain consistent

2. **Color Scheme Update**:
   - Border color changes from `border-gray-200` to brown theme color
   - Use `border-bark/20` (20% opacity of primary brown color)
   - Hover state uses `border-bark/40` (darker on hover)
   - Background remains `bg-white`
   - Text colors unchanged (title: gray-900, answer: gray-700)

3. **Visual Consistency**:
   - Both `Accordion.tsx` and `FAQAccordion.tsx` use identical styling
   - All accordion instances across site render with new styles
   - Focus states remain WCAG 2.1 AA compliant (2px ring, adequate contrast)

4. **Component Updates**:
   - `components/content/Accordion.tsx` line 49, 76
   - `components/content/FAQAccordion.tsx` line 118, 149

### Technical Details

**Current State**:
- `Accordion.tsx` line 49: `border border-gray-200 bg-white`
- `Accordion.tsx` line 76: `p-4 pt-0` (asymmetric padding)
- `FAQAccordion.tsx` line 118: `border border-gray-200 bg-white`
- `FAQAccordion.tsx` line 149: `p-4 pt-0` (asymmetric padding)

**Proposed Changes**:
```typescript
// Before
className="rounded-lg border border-gray-200 bg-white"
<div className="p-4 pt-0 text-gray-700 sm:p-6 sm:pt-0">

// After
className="rounded-lg border-2 border-bark/20 bg-white hover:border-bark/40 transition-colors"
<div className="p-4 text-gray-700 sm:p-6">
```

### Color Reference

**Bark Theme Colors** (from tailwind.config.ts):
- `bark`: Primary brown color (defined in theme)
- `bark/20`: 20% opacity for subtle borders
- `bark/40`: 40% opacity for hover states

### Non-Goals

- Changing accordion open/close animations
- Modifying ChevronDown icon styling
- Adding new accordion features (categories, search, etc.)
- Changing font sizes or weights

### Dependencies

- tailwind.config.ts must have `bark` color defined in theme
- CSS transition class must support border-color changes

### Testing Strategy

```typescript
// components/content/Accordion.spec.tsx
test('REQ-U01-004-01: Answer padding is symmetric', () => {
  const items = [{ question: 'Q1', answer: 'A1' }];
  render(<Accordion items={items} />);

  fireEvent.click(screen.getByText('Q1'));

  const answer = screen.getByTestId('accordion-answer-0');
  const styles = window.getComputedStyle(answer.firstChild as Element);

  expect(styles.paddingTop).toBe(styles.paddingBottom);
});

test('REQ-U01-004-02: Border uses bark theme color', () => {
  const items = [{ question: 'Q1', answer: 'A1' }];
  render(<Accordion items={items} />);

  const item = screen.getByTestId('accordion-item-0');
  const borderClass = item.className;

  expect(borderClass).toContain('border-bark');
  expect(borderClass).not.toContain('border-gray');
});

// Visual regression test
test('REQ-U01-004-03: Accordion visual regression', async ({ page }) => {
  await page.goto('/summer-camp-faq'); // Page with FAQAccordion

  // Expand first item
  await page.click('button[aria-expanded="false"]');
  await page.waitForSelector('[data-testid="faq-answer-0"]');

  // Screenshot comparison
  expect(await page.screenshot()).toMatchSnapshot('accordion-expanded.png');
});
```

---

## REQ-U01-005: GitHub OAuth Keystatic 404 Fix

**Priority**: P0
**Story Points**: 2

### Description

GitHub collaborators (blcben, jsherbahn, travisblc) receive 404 errors when accessing Keystatic CMS via OAuth callback: `https://prelaunch.bearlakecamp.com/api/keystatic/github/oauth/callback`. Investigation required to identify missing configuration on project side (not GitHub account settings).

### Acceptance Criteria

1. **Root Cause Identified**:
   - Diagnostic script identifies missing configuration
   - All necessary API routes exist and return correct status codes
   - GitHub OAuth app settings validated against Next.js requirements

2. **OAuth Callback Route Functional**:
   - Route `/api/keystatic/github/oauth/callback` returns 200 (not 404)
   - Route accepts `code` and `state` query parameters
   - Route exchanges code for access token successfully

3. **Keystatic Admin Access Restored**:
   - All three collaborators can sign in via GitHub OAuth
   - After sign-in, users land on Keystatic dashboard (not 404)
   - Users can view and edit content collections

4. **Configuration Documented**:
   - Missing configuration items listed in implementation docs
   - GitHub OAuth app settings documented (client ID, callback URL, scopes)
   - Troubleshooting guide created for future issues

5. **Health Check**:
   - `/api/health/keystatic` endpoint validates OAuth route exists
   - Smoke test verifies OAuth callback responds correctly

### Investigation Steps

1. **Verify API Routes Exist**:
   - Check `app/api/keystatic/github/oauth/callback/route.ts` exists
   - Check Keystatic package provides route handler
   - Verify Next.js App Router conventions followed

2. **Validate GitHub OAuth App Configuration**:
   - Client ID matches `KEYSTATIC_GITHUB_CLIENT_ID` env var
   - Client Secret matches `KEYSTATIC_GITHUB_CLIENT_SECRET`
   - Authorization callback URL: `https://prelaunch.bearlakecamp.com/api/keystatic/github/oauth/callback`
   - Scopes include: `repo` (or `public_repo` for public repos only)

3. **Check Keystatic Config**:
   - `keystatic.config.ts` line 22-28: GitHub storage mode configured
   - Repo owner/name correct: `sparkst/bearlakecamp`
   - Storage mode is `github` in production (not `local`)

4. **Verify Vercel Environment Variables**:
   - `KEYSTATIC_GITHUB_CLIENT_ID` set in Vercel project settings
   - `KEYSTATIC_GITHUB_CLIENT_SECRET` set (encrypted)
   - `GITHUB_OWNER` and `GITHUB_REPO` set (if used)
   - Env vars available in production environment (not just preview)

5. **Test OAuth Flow Manually**:
   - Navigate to `https://prelaunch.bearlakecamp.com/keystatic`
   - Click "Sign in with GitHub"
   - Observe redirect URL and error message
   - Check browser Network tab for 404 response details

6. **Review Keystatic Documentation**:
   - Compare setup against https://keystatic.com/docs/github-mode
   - Verify all required steps completed
   - Check for version-specific issues (Keystatic 0.5.48)

### Common Root Causes

**Most Likely** (based on codebase analysis):
1. **Missing API Route Handler**: Keystatic may require explicit route file (not auto-generated)
2. **Incorrect Callback URL**: Mismatch between GitHub app settings and actual Next.js route
3. **Missing Middleware**: Next.js middleware may be blocking `/api/keystatic/*` routes
4. **Environment Variables**: `KEYSTATIC_GITHUB_CLIENT_ID` not set in Vercel production

**Less Likely** (but worth checking):
1. **Vercel Routing Configuration**: `vercel.json` may override API routes
2. **Next.js Version**: App Router API route conventions changed in Next.js 14
3. **Keystatic Version**: Bug in 0.5.48 (check changelog)

### Technical Details

**Expected File Structure**:
```
app/
  api/
    keystatic/
      [...params]/
        route.ts  (or route.js)
```

**Expected Route Handler** (if manual setup required):
```typescript
// app/api/keystatic/[...params]/route.ts
import { makeRouteHandler } from '@keystatic/next/route-handler';
import keystaticConfig from '@/keystatic.config';

export const { GET, POST } = makeRouteHandler({
  config: keystaticConfig,
});
```

**GitHub OAuth App Settings** (to verify with user):
- **Application name**: Bear Lake Camp Keystatic
- **Homepage URL**: `https://prelaunch.bearlakecamp.com`
- **Authorization callback URL**: `https://prelaunch.bearlakecamp.com/api/keystatic/github/oauth/callback`
- **Webhook URL**: (optional, leave blank)

### Non-Goals

- Fixing GitHub account-level permission issues (assume accounts configured correctly)
- Implementing alternative authentication methods (local mode, other OAuth providers)
- Upgrading Keystatic to newer version (unless bug identified)

### Dependencies

- Vercel environment variables access (user must provide or configure)
- GitHub OAuth app access (user must verify settings)

### Testing Strategy

```bash
# Diagnostic script: scripts/diagnose-keystatic-oauth.sh

#!/bin/bash
set -e

DOMAIN="prelaunch.bearlakecamp.com"

echo "=== Keystatic OAuth Diagnostics ==="

# Test 1: Check if Keystatic admin loads
echo "1. Testing Keystatic admin page..."
ADMIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://${DOMAIN}/keystatic")
if [[ "$ADMIN_STATUS" == "200" ]]; then
  echo "✅ Keystatic admin page loads (200)"
else
  echo "❌ Keystatic admin page failed (${ADMIN_STATUS})"
fi

# Test 2: Check OAuth callback route exists
echo "2. Testing OAuth callback route..."
CALLBACK_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://${DOMAIN}/api/keystatic/github/oauth/callback")
if [[ "$CALLBACK_STATUS" != "404" ]]; then
  echo "✅ OAuth callback route exists (${CALLBACK_STATUS})"
else
  echo "❌ OAuth callback route returns 404"
  echo "   Expected route: /api/keystatic/github/oauth/callback"
  echo "   Possible cause: Missing API route handler"
fi

# Test 3: Check if Keystatic API routes exist
echo "3. Testing Keystatic API routes..."
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://${DOMAIN}/api/keystatic")
if [[ "$API_STATUS" != "404" ]]; then
  echo "✅ Keystatic API base route exists (${API_STATUS})"
else
  echo "❌ Keystatic API routes not found"
fi

# Test 4: Check health endpoint for config validation
echo "4. Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s "https://${DOMAIN}/api/health/keystatic")
STORAGE_MODE=$(echo "$HEALTH_RESPONSE" | jq -r '.keystatic.storage')
if [[ "$STORAGE_MODE" == "github" ]]; then
  echo "✅ Keystatic configured for GitHub storage"
else
  echo "⚠️  Keystatic storage mode: ${STORAGE_MODE}"
fi

# Output summary
echo ""
echo "=== Required GitHub OAuth App Settings ==="
echo "Authorization callback URL: https://${DOMAIN}/api/keystatic/github/oauth/callback"
echo "Scopes: repo (or public_repo)"
echo ""
echo "=== Required Vercel Environment Variables ==="
echo "KEYSTATIC_GITHUB_CLIENT_ID=<from GitHub OAuth app>"
echo "KEYSTATIC_GITHUB_CLIENT_SECRET=<from GitHub OAuth app>"
echo "GITHUB_OWNER=sparkst"
echo "GITHUB_REPO=bearlakecamp"
```

```typescript
// tests/integration/keystatic-oauth.spec.ts
test('REQ-U01-005-01: OAuth callback route exists', async ({ request }) => {
  const response = await request.get('/api/keystatic/github/oauth/callback');

  // Should not return 404 (may return 400 for missing params, which is OK)
  expect(response.status()).not.toBe(404);
});

test('REQ-U01-005-02: OAuth callback accepts code parameter', async ({ request }) => {
  const response = await request.get('/api/keystatic/github/oauth/callback?code=test123&state=abc');

  // Should process request (may fail auth, but route should exist)
  expect(response.status()).not.toBe(404);
});

test('REQ-U01-005-03: Keystatic admin page loads', async ({ page }) => {
  await page.goto('/keystatic');

  await expect(page).toHaveTitle(/Keystatic/);
  await expect(page.locator('text=Sign in with GitHub')).toBeVisible();
});
```

### Expected Output

**Diagnostic Script Output** (if issue found):
```
=== Keystatic OAuth Diagnostics ===
1. Testing Keystatic admin page...
✅ Keystatic admin page loads (200)

2. Testing OAuth callback route...
❌ OAuth callback route returns 404
   Expected route: /api/keystatic/github/oauth/callback
   Possible cause: Missing API route handler

=== Required GitHub OAuth App Settings ===
Authorization callback URL: https://prelaunch.bearlakecamp.com/api/keystatic/github/oauth/callback
Scopes: repo (or public_repo)

=== Required Vercel Environment Variables ===
KEYSTATIC_GITHUB_CLIENT_ID=<from GitHub OAuth app>
KEYSTATIC_GITHUB_CLIENT_SECRET=<from GitHub OAuth app>
```

**Resolution Checklist**:
- [ ] Create `app/api/keystatic/[...params]/route.ts` with `makeRouteHandler`
- [ ] Verify GitHub OAuth app callback URL matches exactly
- [ ] Set Vercel environment variables for production
- [ ] Redeploy to Vercel
- [ ] Test OAuth flow with collaborator account
- [ ] Document final configuration

---

## Summary

| REQ-ID | Title | Priority | Story Points |
|--------|-------|----------|--------------|
| REQ-U01-001 | Hero Video Height Consistency | P1 | 0.3 |
| REQ-U01-002 | Camp Sessions Page Redesign | P0 | 5.0 |
| REQ-U01-003 | ContentCard Icon Alignment Fix | P2 | 0.2 |
| REQ-U01-004 | Accordion Styling Improvements | P2 | 0.5 |
| REQ-U01-005 | GitHub OAuth Keystatic 404 Fix | P0 | 2.0 |
| **TOTAL** | | | **8.0 SP** |

**Planning Poker Baseline**: 1 SP = simple authenticated API (key→value, secured, tested, deployed, documented)

**Estimation Rationale**:
- **REQ-U01-001** (0.3 SP): CSS/component audit + single property fix + responsive tests
- **REQ-U01-002** (5 SP): Page redesign with new components, content migration, responsive layout, tests (equivalent to 5 simple APIs in complexity)
- **REQ-U01-003** (0.2 SP): Two property changes + alignment test (< half baseline)
- **REQ-U01-004** (0.5 SP): Two-component update, padding/color changes, regression tests (half baseline)
- **REQ-U01-005** (2 SP): Investigation + route creation + config validation + testing (2x baseline complexity)

**Recommended Implementation Order**:
1. REQ-U01-005 (P0, blocker for CMS access)
2. REQ-U01-001 (P1, dependency for REQ-U01-002)
3. REQ-U01-002 (P0, major feature)
4. REQ-U01-003 (P2, quick win)
5. REQ-U01-004 (P2, polish)
