# Keystatic CMS Enhancement User Guide

Quick reference for testing the new CMS features implemented for Bear Lake Camp.

---

## Accessing the CMS

1. Navigate to `http://localhost:3000/keystatic` (local) or `https://prelaunch.bearlakecamp.com/keystatic` (production)
2. Authenticate with GitHub

---

## Feature Testing Checklist

### 1. Production Link (REQ-001)
**Location**: CMS header (top-right)

**Test**:
- Look for "View Live Page" button with external link icon
- Click button → should open current page in new tab at `prelaunch.bearlakecamp.com/{slug}`
- Test on homepage (should go to `/`)
- Test on nested page (should go to `/about` or similar)

**Expected**: Correct URL opens in new tab

---

### 2. Deployment Status (REQ-002)
**Location**: CMS header (next to Production Link)

**Test**:
- Check for status indicator with icon:
  - ✓ Published (green) — deployment live
  - ⏳ Deploying (blue, spinning) — build in progress
  - ❌ Failed (red) — deployment error
  - 📝 Draft (amber) — unpublished changes
- Edit and save a page
- Wait 45 seconds → status should change to "Deploying"
- Watch for polling (updates every 15 seconds)
- Once deployed → status changes to "Published"

**Expected**: Status updates automatically; timestamp shows "X minutes ago"

---

### 3. SEO Metadata Accordion (REQ-003)
**Location**: Page editor sidebar (below main content)

**Test**:
- Find "SEO & Social Media" accordion (collapsed by default)
- Click to expand → chevron icon rotates
- Fill in fields:
  - **Meta Title**: Type 60+ characters → should prevent exceeding limit
  - **Meta Description**: Type 160+ characters → should prevent exceeding limit
  - **OG Title**: Leave empty → defaults to Meta Title on frontend
  - **Social Image**: Upload image → thumbnail preview appears
  - **Twitter Card Type**: Select option from dropdown
- Save page → reload → fields persist

**Expected**: Character counters update in real-time; validation works

---

### 4. Image Upload Validation (REQ-004)
**Location**: Any image field in CMS

**Test**:
- Try uploading image >5MB → should show error with file size
- Upload valid image (<5MB) → should succeed
- Check for image dimensions display after upload
- Test drag-and-drop and file picker methods

**Expected**: Clear error messages; dimensions shown on success

---

### 5. Sparkry AI Branding (REQ-P1-005)
**Location**: CMS header (top-right corner)

**Test**:
- Look for "Powered by Sparkry AI" with logo
- Logo should be small (24px height)
- Click logo → opens `https://sparkry.ai` in new tab
- Check responsive behavior (logo visible on mobile, text may hide)

**Expected**: Subtle branding; doesn't interfere with CMS UI

---

### 6. Bug Report Modal (REQ-006)
**Location**: CMS header (bug icon button)

**Test**:
- Click "Report Bug" button (bug icon)
- Modal opens with form:
  - **Title**: Required field
  - **Description**: Required textarea
  - **Include page context**: Checkbox (checked by default)
- Try submitting empty → validation prevents submission
- Fill in fields → click Submit
- Check GitHub repository → new issue should appear with:
  - Labels: `bug`, `cms-reported`
  - Context: page slug, browser info, timestamp
- Check for success message in CMS

**Expected**: GitHub issue created with full context; success confirmation shown

---

### 7. Enhanced Content Components (REQ-011)
**Location**: Page content editor (insert component menu)

**Components to Test**:

#### Hero Section
- Insert → configure background image, heading, CTA buttons
- Preview → check overlay opacity control

#### Feature Grid
- Insert → add 2-4 items with icons, headings, descriptions
- Test column layouts (2, 3, or 4 columns)

#### Stats Counter
- Insert → add number, label, suffix (e.g., "100+")
- Preview → scroll to component → count-up animation triggers

#### Testimonial
- Insert → add quote, author, role, avatar
- Optional: star rating

#### Accordion/FAQ
- Insert → add multiple question/answer pairs
- Preview → click to expand/collapse

#### Split Content
- Insert → add image and text content
- Test reverse layout option (image left vs. right)

#### Timeline
- Insert → add multiple timeline items with dates
- Preview → vertical connector line visible

#### Pricing Table
- Insert → add multiple pricing tiers
- Test highlight option for popular tier

**Expected**: All components render correctly in preview and frontend; mobile responsive

---

### 8. AI-Powered SEO Generation (REQ-012)
**Location**: Next to SEO accordion header

**Test**:
- Create/edit page with content (title + body text)
- Expand SEO accordion
- Click "Generate SEO" button (sparkles icon)
- Loading spinner appears
- Wait for generation (~5-10 seconds)
- SEO fields auto-populate:
  - Meta Title (50-60 chars)
  - Meta Description (150-155 chars)
  - OG Title (creative variant)
  - OG Description (longer description)
- Edit generated content before saving
- Test rate limiting: try 10+ generations in quick succession → should show limit message

**Expected**: High-quality, SEO-optimized content generated; user can edit before saving

---

## Environment Setup (Required for Full Testing)

Add to `.env.local`:
```bash
VERCEL_TOKEN=your_vercel_token
VERCEL_PROJECT_ID=your_project_id
GITHUB_TOKEN=your_github_token
```

---

## Troubleshooting

**Deployment Status not updating**:
- Check `VERCEL_TOKEN` and `VERCEL_PROJECT_ID` in environment variables
- Check browser console for API errors

**Bug submission fails**:
- Check `GITHUB_TOKEN` has `repo` permissions (write issues)
- Verify GitHub API rate limits not exceeded

**SEO generation fails**:
- Verify Claude API/MCP connection configured
- Check rate limiting (10 generations/hour)

**Components not rendering**:
- Check browser console for errors
- Verify Markdoc configuration in `keystatic.config.ts`

---

## Success Criteria

✅ All buttons/icons visible in CMS header
✅ Production links open correct URLs
✅ Deployment status updates automatically
✅ SEO accordion expands/collapses smoothly
✅ Image validation prevents oversized uploads
✅ Sparkry branding visible and clickable
✅ Bug reports create GitHub issues
✅ All 8 content components render correctly
✅ AI SEO generation produces quality metadata

---

**Questions?** Report bugs using the "Report Bug" button in the CMS! 🐛
