# Design Review: UAT Plan Verification Requirements

**Document Version**: 1.0
**Date**: 2026-01-07
**Status**: Ready for Implementation
**Source**: `/requirements/uat-plan-updates-04.md`
**Expert Team**: PE (Principal Engineer), PM (Product Manager), SDE-III (Senior Engineer), Strategic-Advisor

---

## Executive Summary

This document provides a comprehensive design review of the UAT plan for Updates-04. All 47 test cases are currently PENDING verification. The expert team has analyzed each category of requirements, identified potential issues and contributing causes, and defined Chrome extension verification steps using Claude in Chrome MCP.

**Total Story Points**: 31 SP
**Categories**: 6 (Issues, Homepage, Summer Camp, What To Bring, CMS Features, Components)

---

## Expert Team Analysis Protocol

For each requirement category:
1. **PE (Principal Engineer)**: Technical feasibility, root cause analysis, architecture concerns
2. **PM (Product Manager)**: User impact, priority, acceptance criteria validation
3. **SDE-III (Senior Engineer)**: Implementation complexity, edge cases, testing gaps
4. **Strategic-Advisor**: Business impact, risk assessment, deployment considerations

---

## Category 1: Admin Nav Strip Issues

### REQ-UAT-001: Admin Nav Strip Visibility Verification

**UAT Reference**: UAT-ISSUE-001
**Priority**: P0 | **Story Points**: 2 SP

#### Problem Description
The admin nav strip must appear for authenticated GitHub users within 2 seconds and NOT appear for unauthenticated users. Previous issues noted the nav "keeps disappearing."

#### Expert Team Analysis

**PE Assessment**:
- Root cause likely in `/api/auth/check` endpoint not returning correctly
- Cookie handling issue: `keystatic-gh-access-token` may not persist across page loads
- ISR caching could serve stale unauthenticated response
- `isKeystatiAuthenticated` function in `/lib/keystatic/auth.ts` may have timing issues

**PM Assessment**:
- P0 blocking issue - prevents all admin workflows
- User cannot access CMS, edit pages, or report bugs without this working
- Acceptance: Must appear on ALL pages except /keystatic/* within 2 seconds

**SDE-III Assessment**:
- Implementation uses client-side auth check (correct for ISR compatibility)
- Potential race condition: component renders before auth check completes
- Need timeout fallback if auth check takes > 5s
- Edge case: what if GitHub token expires mid-session?

**Strategic-Advisor Assessment**:
- High business impact - blocks content editing workflow
- Risk: Editor frustration leads to workaround attempts
- Must verify across all 33+ production pages

#### Contributing Causes
1. `/api/auth/check` returns 404 or 500
2. `keystatic-gh-access-token` cookie not being sent (SameSite/Secure issues)
3. GitHub OAuth token expired but not refreshed
4. ISR serving cached page without client-side hydration
5. z-index conflict hiding the nav strip under other elements

#### Proposed Fix Approach
1. Add timeout fallback to auth check (5s max)
2. Add console logging for debugging in development
3. Verify cookie configuration (SameSite=Lax, Secure in production)
4. Add visual loading state during auth check
5. Ensure z-index is highest (z-admin-nav defined in Tailwind config)

#### Chrome Extension Verification Steps
```markdown
**MCP: Claude in Chrome**

1. **Pre-condition Setup**:
   - Navigate to https://prelaunch.bearlakecamp.com/keystatic
   - Authenticate via GitHub OAuth
   - Note: Authentication state in browser cookies

2. **Test Authenticated User**:
   - Navigate to https://prelaunch.bearlakecamp.com/
   - Command: `Wait for selector '[data-testid="admin-nav-strip"]' with timeout 3000ms`
   - Verify: Element is visible with black background
   - Verify: Contains links: CMS, Edit Page, Report Bug, Deployment Status
   - Capture screenshot: `verification-screenshots/REQ-UAT-001-authenticated.png`

3. **Test Nav Persists Across Navigation**:
   - Navigate to https://prelaunch.bearlakecamp.com/summer-camp
   - Command: `Wait for selector '[data-testid="admin-nav-strip"]'`
   - Verify: Admin nav still visible
   - Verify: "Edit Page" link updated to /keystatic/branch/main/collection/pages/item/summer-camp

4. **Test Unauthenticated User (Incognito)**:
   - Open new incognito window
   - Navigate to https://prelaunch.bearlakecamp.com/
   - Command: `Assert selector '[data-testid="admin-nav-strip"]' is NOT visible`
   - Verify: No admin nav appears, no console errors
   - Capture screenshot: `verification-screenshots/REQ-UAT-001-unauthenticated.png`

5. **Test Keystatic Exclusion**:
   - Navigate to https://prelaunch.bearlakecamp.com/keystatic
   - Command: `Assert selector '[data-testid="admin-nav-strip"]' is NOT visible`
   - Verify: Admin nav hidden in CMS (has its own nav)
```

#### Acceptance Criteria
- [ ] Admin nav strip visible within 2s for authenticated users
- [ ] Admin nav strip hidden for unauthenticated users
- [ ] All 4 links functional (CMS, Edit Page, Report Bug, Deployment Status)
- [ ] Nav persists across all non-CMS pages
- [ ] No console errors during auth check failure

---

## Category 2: Homepage Requirements

### REQ-UAT-002: CTA Buttons CMS Editability

**UAT Reference**: UAT-HOME-001
**Priority**: P1 | **Story Points**: 2 SP

#### Problem Description
CTA buttons on homepage should be editable via CMS Page Content, not hardcoded.

#### Expert Team Analysis

**PE Assessment**:
- `ctaButton` component exists in `shared-components.ts`
- Need to verify it's registered in MarkdocComponents.tsx for body rendering
- Schema must support: text, link, variant (primary/secondary), size

**PM Assessment**:
- Content editors need to add/remove/edit CTAs without developer help
- Acceptance: Any CTA change should take effect after CMS save + deploy

**SDE-III Assessment**:
- Component rendering path: Markdoc -> MarkdocComponents -> CTAButton
- Need to verify component is in both pages.ts body schema AND templateFields
- Edge case: What if CTA has invalid URL?

#### Contributing Causes
1. CTA component not registered in Markdoc renderer
2. CTA fields in fixed template position, not body content
3. Missing validation for URL field
4. Preview not showing button styling accurately

#### Chrome Extension Verification Steps
```markdown
**MCP: Claude in Chrome**

1. **Test CTA Visibility**:
   - Navigate to https://prelaunch.bearlakecamp.com/
   - Command: `Find all elements matching '[data-component="cta-button"]'`
   - Verify: At least one CTA button visible
   - Verify: Button has green background (#047857)

2. **Test CTA Link**:
   - Command: `Get href attribute of '[data-component="cta-button"]' first element`
   - Verify: href is valid URL or relative path
   - Click CTA button
   - Verify: Navigation to correct destination

3. **Test CMS Editability**:
   - Navigate to https://prelaunch.bearlakecamp.com/keystatic/collection/pages/item/index
   - Command: `Wait for page to load`
   - Scroll to Page Content section
   - Verify: "Add" button shows CTA Button as option
   - Capture screenshot: `verification-screenshots/REQ-UAT-002-cms-editor.png`
```

#### Acceptance Criteria
- [ ] CTA buttons visible on homepage
- [ ] CTA buttons link to correct destinations
- [ ] CTA button component available in CMS body editor
- [ ] Button styling matches design (green primary, white secondary)

---

### REQ-UAT-003: Gallery Component CMS Integration

**UAT Reference**: UAT-HOME-002
**Priority**: P1 | **Story Points**: 2 SP

#### Problem Description
Gallery component should be insertable in page body and use media browser for images.

#### Expert Team Analysis

**PE Assessment**:
- Gallery component exists in shared-components.ts
- Depends on REQ-CMS-001 (Media Browser)
- Images should open MediaPickerDialog when clicked

**SDE-III Assessment**:
- Gallery rendering: grid layout with configurable columns
- Must handle: 0 images (hidden), 1 image (centered), 3+ images (grid)
- Lazy loading for performance

#### Contributing Causes
1. Gallery not registered in body component list
2. Media browser integration missing
3. Preview not rendering grid layout correctly

#### Chrome Extension Verification Steps
```markdown
**MCP: Claude in Chrome**

1. **Test Gallery Visibility**:
   - Navigate to https://prelaunch.bearlakecamp.com/
   - Command: `Find elements matching '[data-component="gallery"]'`
   - If found: Verify images render in grid layout
   - Verify: Images have alt text

2. **Test CMS Gallery Add**:
   - Navigate to CMS page editor
   - Click "Add" in body section
   - Verify: "Gallery" appears in component list
   - Add Gallery component
   - Verify: Image picker opens media browser
```

---

### REQ-UAT-004: Mission Image Preloading

**UAT Reference**: UAT-HOME-003
**Priority**: P2 | **Story Points**: 1 SP

#### Problem Description
"Faith. Adventure. Transformation." section image loads last or only on scroll.

#### Expert Team Analysis

**PE Assessment**:
- Image likely using `loading="lazy"` attribute
- Should use `loading="eager"` or `<link rel="preload">`
- Check: Is image below-the-fold or above-the-fold?

**SDE-III Assessment**:
- If image is within first viewport, lazy loading is wrong
- Add `priority` prop to Next.js Image component
- Alternative: Add preload link in document head

#### Contributing Causes
1. Image uses `loading="lazy"` when it shouldn't
2. Next.js Image component missing `priority` prop
3. Image not in initial SSR HTML (client-side only)

#### Chrome Extension Verification Steps
```markdown
**MCP: Claude in Chrome**

1. **Test Image Loading Attribute**:
   - Clear browser cache (Ctrl+Shift+Delete)
   - Navigate to https://prelaunch.bearlakecamp.com/
   - Open DevTools Network tab, filter to images
   - Command: `Get 'loading' attribute of '[data-section="mission"] img'`
   - Verify: loading attribute is NOT "lazy"
   - Verify: Image request starts within first 2s of page load
```

---

### REQ-UAT-005: Camp Session Card Component

**UAT Reference**: UAT-HOME-004, UAT-HOME-004-CMS
**Priority**: P0 | **Story Points**: 3 SP

#### Problem Description
New card component for "Which Camp is Right for You?" section must match design mock.

#### Expert Team Analysis

**PE Assessment**:
- Component: CampSessionCard.tsx
- Schema: image, heading, subheading, bulletType, bullets[], ctaLabel, ctaHref
- Styling: rounded-lg, shadow-md hover:shadow-lg, transition-transform hover:scale-102
- CMS integration: Must be in shared-components.ts AND MarkdocComponents.tsx

**PM Assessment**:
- P0 because it's the main conversion point for homepage
- Must match mock exactly: image at top, left-justified text, centered button
- Bullet types: checkmark, bullet, diamond, numbers

**SDE-III Assessment**:
- Hover animation must be subtle (scale 1.02, not 1.1)
- Card grid should use CSS Grid with equal heights
- Edge cases: 0 bullets (hide section), long heading (truncate or wrap)

#### Contributing Causes
1. Component not rendering data-component attribute
2. Hover animation too aggressive or missing
3. Bullet type selector not previewing in CMS
4. CTA button not centered

#### Chrome Extension Verification Steps
```markdown
**MCP: Claude in Chrome**

1. **Test Card Visibility**:
   - Navigate to https://prelaunch.bearlakecamp.com/
   - Command: `Scroll to element '[data-section="which-camp"]'`
   - Command: `Find all '[data-component="camp-session-card"]'`
   - Verify: At least 4 cards visible (Jr High, Sr High, Junior, Primary)
   - Capture screenshot: `verification-screenshots/REQ-UAT-005-cards.png`

2. **Test Card Structure**:
   - Command: `For first camp-session-card, verify: img exists, h3 or h4 exists, ul exists, a or button exists`
   - Verify: All elements present
   - Verify: Text is left-aligned (not centered)

3. **Test Hover Animation**:
   - Command: `Hover over first camp-session-card`
   - Wait 300ms
   - Command: `Get transform style of hovered card`
   - Verify: Transform includes scale or translateY

4. **Test CMS Editing**:
   - Navigate to CMS homepage editor
   - Find Camp Session Card component
   - Verify: All fields editable (image, heading, subheading, bullets, bullet type, CTA)
   - Change bullet type to "diamond"
   - Verify: Preview shows diamond bullets
```

---

### REQ-UAT-006: Work At Camp Section

**UAT Reference**: UAT-HOME-005
**Priority**: P1 | **Story Points**: 2 SP

#### Problem Description
New section linking to 3 work opportunities: Summer Staff, LIT, Year-Round.

#### Expert Team Analysis

**PE Assessment**:
- Section should use different card style than camp session cards
- Links to: /work-at-camp-summer-staff, /work-at-camp-leaders-in-training, /work-at-camp-year-round
- Content pulled from existing pages or CMS configurable

**PM Assessment**:
- User need: Easily discover employment opportunities
- Visual differentiation from "Which Camp" section is important
- Mobile: Should stack to 1 column

#### Chrome Extension Verification Steps
```markdown
**MCP: Claude in Chrome**

1. **Test Section Visibility**:
   - Navigate to https://prelaunch.bearlakecamp.com/
   - Command: `Scroll to '[data-section="work-at-camp"]'`
   - Verify: Section visible with 3 distinct cards/links
   - Capture screenshot

2. **Test Links**:
   - Command: `Get all href attributes in work-at-camp section`
   - Verify: Contains 'summer-staff', 'leaders-in-training', 'year-round'
   - Click each link and verify navigation works
```

---

### REQ-UAT-007: Wide Card Component

**UAT Reference**: UAT-HOME-006
**Priority**: P1 | **Story Points**: 2 SP

#### Problem Description
Full-width card for Retreats and Rentals sections with image, text, and CTA.

#### Expert Team Analysis

**PE Assessment**:
- Layout: 40% image / 60% content (or configurable)
- imagePosition: "left" or "right"
- backgroundColor: hex color picker
- Responsive: stacks on mobile

**SDE-III Assessment**:
- Flexbox with flex-wrap for mobile
- Image should use object-cover for consistent sizing
- Different background colors for Retreats vs Rentals

#### Chrome Extension Verification Steps
```markdown
**MCP: Claude in Chrome**

1. **Test Wide Card Desktop**:
   - Navigate to homepage
   - Set viewport to 1280x800
   - Command: `Find '[data-component="wide-card"]'`
   - Verify: Image and content side-by-side

2. **Test Wide Card Mobile**:
   - Set viewport to 375x667
   - Verify: Image and content stacked vertically
```

---

### REQ-UAT-008: Retreats Section

**UAT Reference**: UAT-HOME-007
**Priority**: P2 | **Story Points**: 1 SP

#### Chrome Extension Verification Steps
```markdown
**MCP: Claude in Chrome**

1. **Test Retreats Section**:
   - Navigate to homepage
   - Command: `Scroll to '[data-section="retreats"]'`
   - Verify: Wide card visible with retreats content
   - Verify: Link to /retreats works
```

---

### REQ-UAT-009: Rentals Section

**UAT Reference**: UAT-HOME-008
**Priority**: P2 | **Story Points**: 1 SP

#### Chrome Extension Verification Steps
```markdown
**MCP: Claude in Chrome**

1. **Test Rentals Section Different Color**:
   - Get background color of retreats section
   - Get background color of rentals section
   - Verify: Colors are different
   - Verify: Link to /rentals works
```

---

## Category 3: Summer Camp Page Requirements

### REQ-UAT-010: YouTube Hero Video

**UAT Reference**: UAT-SUMMER-001
**Priority**: P1 | **Story Points**: 3 SP

#### Problem Description
Hero component needs YouTube video support with fallback to image.

#### Expert Team Analysis

**PE Assessment**:
- Current implementation in HeroYouTube.tsx
- Uses YouTube embed API with muted autoplay
- Fallback chain: YouTube -> local video -> hero image

**SDE-III Assessment**:
- YouTube may be blocked (ad blockers, corporate networks)
- Must test: autoplay works muted, fallback triggers correctly
- Schema: heroVideoType (none/local/youtube), heroYouTubeId

#### Contributing Causes
1. YouTube embed blocked but no fallback showing
2. Autoplay not working due to browser restrictions
3. heroYouTubeId field not saving to content file

#### Chrome Extension Verification Steps
```markdown
**MCP: Claude in Chrome**

1. **Test YouTube Hero**:
   - Navigate to https://prelaunch.bearlakecamp.com/summer-camp
   - Command: `Find 'iframe[src*="youtube"]' or '[data-component="hero-youtube"]'`
   - Verify: YouTube video playing (muted)
   - Capture screenshot

2. **Test YouTube Fallback**:
   - Block youtube.com in browser settings
   - Refresh /summer-camp page
   - Verify: Hero image shows instead of broken iframe
```

---

### REQ-UAT-011: Session Cards on Summer Camp

**UAT Reference**: UAT-SUMMER-003
**Priority**: P0 | **Story Points**: 1 SP

#### Chrome Extension Verification Steps
```markdown
**MCP: Claude in Chrome**

1. **Test Session Cards Consistency**:
   - Navigate to /summer-camp
   - Command: `Find '[data-component="camp-session-card"]'`
   - Compare styling with homepage cards
   - Verify: Same card component used
```

---

### REQ-UAT-012: Prepare For Camp Button Links

**UAT Reference**: UAT-SUMMER-006
**Priority**: P1 | **Story Points**: 2 SP

#### Problem Description
Links at bottom of Prepare For Camp cards should be buttons, centered.

#### Expert Team Analysis

**SDE-III Assessment**:
- Current: Links may be plain text or left-aligned
- Required: Button styling (bg-secondary, text-white, rounded-lg, centered)
- Centering: Use text-center on parent or mx-auto on button

#### Chrome Extension Verification Steps
```markdown
**MCP: Claude in Chrome**

1. **Test Button Styling**:
   - Navigate to /summer-camp
   - Scroll to "Prepare For Camp" section
   - Command: `Find links in prepare-for-camp section`
   - Verify: Links have button styling (padding, background color)
   - Verify: Buttons are horizontally centered in card

2. **Test Button Centering**:
   - Get button bounding box
   - Get section bounding box
   - Calculate: buttonCenter should be near sectionCenter (within 50px tolerance)
```

---

### REQ-UAT-013: Card and Icon Size Adjustments

**UAT Reference**: UAT-SUMMER-002, UAT-SUMMER-004, UAT-SUMMER-005
**Priority**: P2 | **Story Points**: 2 SP

#### Chrome Extension Verification Steps
```markdown
**MCP: Claude in Chrome**

1. **Test Worthy Section Width**:
   - Find Summer 2026 Worthy section
   - Verify: Card is ~75% width (not full width)
   - Verify: Centered on page

2. **Test Prepare Card Width**:
   - Find Prepare For Camp cards
   - Verify: Cards are ~60% of previous width
   - Verify: Centered layout

3. **Test Icon Size**:
   - Find icons in Prepare For Camp section
   - Verify: Icon size is xl (48px) or larger than default
```

---

## Category 4: What To Bring Page

### REQ-UAT-014: Hero Image Height

**UAT Reference**: UAT-BRING-001
**Priority**: P2 | **Story Points**: 1 SP

#### Problem Description
Hero image cuts off people's heads - needs to be taller.

#### Chrome Extension Verification Steps
```markdown
**MCP: Claude in Chrome**

1. **Test Hero Height**:
   - Navigate to https://prelaunch.bearlakecamp.com/summer-camp-what-to-bring
   - Command: `Get bounding box of hero section`
   - Verify: Height >= 400px
   - Verify: Image shows full subjects (no awkward cropping)
   - Capture screenshot
```

---

## Category 5: CMS Feature Requirements

### REQ-UAT-015: Media Browser with Upload

**UAT Reference**: UAT-CMS-001
**Priority**: P0 | **Story Points**: 3 SP

#### Problem Description
All image fields should open media browser with upload capability.

#### Expert Team Analysis

**PE Assessment**:
- MediaPickerDialog.tsx handles media selection
- Upload via MediaUploader.tsx
- Images sorted by date (newest first)
- File size limit: 5MB

**SDE-III Assessment**:
- Upload states: idle, uploading, success, error
- Error handling: file too large, invalid type, network failure
- Drag-and-drop support required

#### Chrome Extension Verification Steps
```markdown
**MCP: Claude in Chrome**

1. **Test Media Browser Opens**:
   - Navigate to CMS page editor
   - Click any image field
   - Verify: Media browser modal opens
   - Capture screenshot

2. **Test Upload Button**:
   - In media browser, find upload button
   - Verify: Button is visible and clickable

3. **Test Image Sorting**:
   - Verify: Images sorted newest first (check dates if available)
```

---

### REQ-UAT-016: Component Deduplication

**UAT Reference**: UAT-CMS-002
**Priority**: P1 | **Story Points**: 2 SP

#### Chrome Extension Verification Steps
```markdown
**MCP: Claude in Chrome**

1. **Test Component List Clean**:
   - Navigate to CMS page editor
   - Click "Add" to see component list
   - Verify: No duplicate component names
   - Verify: Each component has distinct purpose (check descriptions)
```

---

### REQ-UAT-017: Container Options (Width/Height/Background)

**UAT Reference**: UAT-CMS-003
**Priority**: P0 | **Story Points**: 3 SP

#### Chrome Extension Verification Steps
```markdown
**MCP: Claude in Chrome**

1. **Test Width Dropdown**:
   - Add Section component in CMS
   - Find width dropdown
   - Verify: Options include Auto, 25%, 50%, 75%, 100%, Custom

2. **Test Background Color**:
   - Find background color field
   - Select color from preset or enter hex
   - Verify: Preview updates immediately
```

---

### REQ-UAT-018: Icon Size Settings

**UAT Reference**: UAT-CMS-004
**Priority**: P1 | **Story Points**: 1 SP

#### Chrome Extension Verification Steps
```markdown
**MCP: Claude in Chrome**

1. **Test Icon Size Dropdown**:
   - Add component with icon in CMS
   - Find icon size dropdown
   - Verify: Options include Small, Medium, Large, Extra Large
   - Select XL, verify preview shows 48px icon
```

---

### REQ-UAT-019: Color Picker with Presets

**UAT Reference**: UAT-CMS-005
**Priority**: P1 | **Story Points**: 2 SP

#### Chrome Extension Verification Steps
```markdown
**MCP: Claude in Chrome**

1. **Test Theme Presets**:
   - Find color field in CMS
   - Click to open picker
   - Verify: Theme colors shown (Emerald, Sky Blue, Amber, Purple, Cream, Bark)
   - Click theme color, verify hex updates

2. **Test Hex Input**:
   - Enter '#ff0000' in hex field
   - Verify: Preview square turns red
   - Enter 'invalid' - verify error shown
```

---

### REQ-UAT-020: CMS Navigation Updates

**UAT Reference**: UAT-CMS-007
**Priority**: P1 | **Story Points**: 2 SP

#### Chrome Extension Verification Steps
```markdown
**MCP: Claude in Chrome**

1. **Test Nav Styling**:
   - Navigate to https://prelaunch.bearlakecamp.com/keystatic
   - Verify: Top nav has black background, white text

2. **Test Dropdowns**:
   - Find "Content" dropdown, verify it opens
   - Find "Tools" dropdown, verify it contains SEO generator
   - Find "Help" dropdown, verify it contains Report Issue

3. **Test Dark Mode Toggle**:
   - Find dark mode toggle in nav
   - Click it
   - Verify: Theme switches correctly
```

---

### REQ-UAT-021: Light/Dark Mode Fix

**UAT Reference**: UAT-CMS-008
**Priority**: P1 | **Story Points**: 2 SP

#### Problem Description
Light mode not working correctly - some elements stay dark.

#### Expert Team Analysis

**PE Assessment**:
- ThemeProvider uses next-themes
- Issue: Some Keystatic internal components don't respond to theme
- Fix: CSS overrides in keystatic-dark.css / keystatic-light.css
- Component popups may have separate theme context

**SDE-III Assessment**:
- Check all CSS for hardcoded dark colors
- Ensure html.dark selector used consistently
- Test: sidebar, main content, popups, form fields

#### Chrome Extension Verification Steps
```markdown
**MCP: Claude in Chrome**

1. **Test Light Mode Full Application**:
   - Navigate to CMS
   - Toggle to light mode
   - Verify: Sidebar background is light
   - Verify: Main content area is light
   - Verify: Form fields have light backgrounds

2. **Test Popup Theme**:
   - In light mode, click to add component
   - Verify: Popup/modal has light background
   - Verify: No dark text on dark background

3. **Test Persistence**:
   - Set to light mode
   - Refresh page
   - Verify: Light mode persists
   - Navigate to different CMS page
   - Verify: Light mode still active
```

---

## Category 6: Component Requirements

### REQ-UAT-022: Camp Session Card Grid Container

**UAT Reference**: UAT-COMP-001
**Priority**: P0 | **Story Points**: 2 SP

#### Problem Description
Grid container for session cards must be responsive with configurable columns.

#### Chrome Extension Verification Steps
```markdown
**MCP: Claude in Chrome**

1. **Test Desktop Layout**:
   - Navigate to homepage
   - Set viewport to 1280x800
   - Find camp session card grid
   - Command: `Get computed gridTemplateColumns style`
   - Verify: Shows 4 columns

2. **Test Tablet Layout**:
   - Set viewport to 768x1024
   - Verify: Shows 2-3 columns

3. **Test Mobile Layout**:
   - Set viewport to 375x667
   - Verify: Shows 1 column (cards stacked)

4. **Test Equal Heights**:
   - Get heights of first 4 cards
   - Verify: All heights within 5px of each other
```

---

## Implementation Order (Strategic-Advisor Recommendation)

### Phase 1: P0 Blockers (11 SP) - Must Complete First
| Order | REQ-ID | Description | SP | Dependencies |
|-------|--------|-------------|-----|--------------|
| 1 | REQ-UAT-001 | Admin Nav Strip | 2 | None |
| 2 | REQ-UAT-015 | Media Browser | 3 | None |
| 3 | REQ-UAT-005 | Camp Session Card | 3 | Media Browser |
| 4 | REQ-UAT-017 | Container Options | 3 | None |

### Phase 2: P1 Features (15 SP) - Core Functionality
| Order | REQ-ID | Description | SP | Dependencies |
|-------|--------|-------------|-----|--------------|
| 5 | REQ-UAT-002 | CTA Buttons | 2 | None |
| 6 | REQ-UAT-003 | Gallery | 2 | Media Browser |
| 7 | REQ-UAT-006 | Work At Camp | 2 | None |
| 8 | REQ-UAT-007 | Wide Card | 2 | Container Options |
| 9 | REQ-UAT-010 | YouTube Hero | 3 | None |
| 10 | REQ-UAT-012 | Button Links | 2 | None |
| 11 | REQ-UAT-021 | Light/Dark Mode | 2 | None |

### Phase 3: P2 Polish (5 SP) - Nice to Have
| Order | REQ-ID | Description | SP | Dependencies |
|-------|--------|-------------|-----|--------------|
| 12 | REQ-UAT-004 | Image Preload | 1 | None |
| 13 | REQ-UAT-008 | Retreats | 1 | Wide Card |
| 14 | REQ-UAT-009 | Rentals | 1 | Wide Card |
| 15 | REQ-UAT-013 | Size Adjustments | 2 | Container Options |

---

## Cross-Cutting Verification Requirements

All Chrome extension verifications must:
1. Run on production URL: `https://prelaunch.bearlakecamp.com`
2. Capture screenshot evidence in `verification-screenshots/`
3. Log results to `validation-reports/uat-results.json`
4. Report any console errors found during testing

### Common Verification Script Template
```javascript
// Claude in Chrome MCP - Verification Template
async function verifyRequirement(reqId, testSteps) {
  const results = {
    reqId: reqId,
    timestamp: new Date().toISOString(),
    passed: true,
    steps: []
  };

  for (const step of testSteps) {
    try {
      const result = await step.action();
      results.steps.push({
        description: step.description,
        passed: step.verify(result),
        evidence: step.screenshot ? await captureScreenshot() : null
      });
    } catch (error) {
      results.passed = false;
      results.steps.push({
        description: step.description,
        passed: false,
        error: error.message
      });
    }
  }

  return results;
}
```

---

## Dependencies Matrix

```
REQ-UAT-015 (Media Browser)
    |
    +-- REQ-UAT-003 (Gallery)
    |
    +-- REQ-UAT-005 (Camp Session Card)

REQ-UAT-017 (Container Options)
    |
    +-- REQ-UAT-007 (Wide Card)
    |   |
    |   +-- REQ-UAT-008 (Retreats)
    |   |
    |   +-- REQ-UAT-009 (Rentals)
    |
    +-- REQ-UAT-013 (Size Adjustments)

REQ-UAT-005 (Camp Session Card)
    |
    +-- REQ-UAT-011 (Session Cards Summer Camp)
    |
    +-- REQ-UAT-022 (Card Grid)
```

---

## Summary

| Category | Requirements | Total SP | P0 | P1 | P2 |
|----------|--------------|----------|-----|-----|-----|
| Admin Nav | 1 | 2 | 1 | 0 | 0 |
| Homepage | 8 | 14 | 1 | 5 | 2 |
| Summer Camp | 4 | 8 | 1 | 2 | 1 |
| What To Bring | 1 | 1 | 0 | 0 | 1 |
| CMS Features | 7 | 15 | 2 | 4 | 1 |
| Components | 1 | 2 | 1 | 0 | 0 |
| **TOTAL** | **22** | **42** | **6** | **11** | **5** |

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-07 | COS Expert Team | Initial design review with Chrome extension verification |
