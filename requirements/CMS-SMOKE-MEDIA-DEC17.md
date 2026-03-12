# Requirements: CMS & Smoke Test Improvements - December 17, 2024

> **Created**: 2024-12-17
> **Total Story Points**: 12 SP
> **Priority**: User-requested improvements

---

## Overview

Four improvement areas:
1. Smoke test updates for HeroVideo support
2. Homepage title customization
3. Remove unused Video Clips collection (cleanup)
4. Media page fix and media selector/uploader for CMS image fields

---

## REQ-SMOKE-010: Update Smoke Tests for HeroVideo Support

### Context
The homepage now uses HeroVideo instead of HeroCarousel. The smoke-test.sh (lines 272-300) checks for HeroCarousel presence and fails when HeroVideo is used instead.

### Current Behavior
```bash
# Line 274 in smoke-test.sh
if ! grep -q 'role="region".*carousel\|aria-label.*carousel\|data-testid="hero-carousel"' "$temp_response"
```

### Acceptance Criteria
- [ ] Smoke test accepts either HeroCarousel OR HeroVideo as valid homepage hero
- [ ] HeroVideo detection checks for `id="hero-video"` element (from HeroVideo.tsx:27)
- [ ] Test passes when homepage has video hero (current state)
- [ ] Test passes when homepage has carousel hero (backward compatible)
- [ ] Appropriate debug hints when neither is present

### Non-Goals
- Not modifying HeroVideo component attributes
- Not adding new test cases for individual video pages

### Technical Notes
- HeroVideo renders with `id="hero-video"` and `<video>` element
- HeroCarousel renders with `role="region"` and carousel attributes
- Modify lines 272-300 in smoke-test.sh to support both patterns

### Story Points: 1 SP

---

## REQ-HOME-001: Homepage Title Customization

### Context
The homepage currently displays "Home" over the hero video. It should display "WELCOME TO BEAR LAKE CAMP" instead.

### Current State
- `content/pages/index.mdoc` has `title: Home`
- HeroVideo component displays the title prop directly
- SEO metaTitle already has proper title for browser tab

### Options Evaluated

**Option A: Change title field directly** (RECOMMENDED)
- Pros: Simple one-line change
- Cons: Changes CMS list display (acceptable)

**Option B: Add separate heroTitle field**
- Pros: Decouples display title from page title
- Cons: Schema change, migration needed

### Recommendation
Option A - Change the title to "Welcome to Bear Lake Camp" since:
- The SEO metaTitle provides the proper page title for browsers
- The hero title should match visitor expectations
- CMS list showing "Welcome to Bear Lake Camp" is acceptable

### Acceptance Criteria
- [ ] Homepage hero displays "Welcome to Bear Lake Camp"
- [ ] SEO/metadata remains unchanged
- [ ] No functional regression

### Story Points: 0.5 SP

---

## REQ-MEDIA-001: Remove Video Clips Collection (Cleanup)

### Context
The Video Clips collection is defined in keystatic.config.ts (lines 1414-1478) but:
- No content files exist in `content/video-clips/`
- Collection shows as empty at `/keystatic/branch/main/collection/videoClips`
- Hero videos work fine with direct paths in `heroVideo` field
- Collection adds unnecessary complexity without current use

### Decision
**Remove the unused collection** - clean up after ourselves rather than keeping dead code.

If video metadata management is needed in the future, we can re-add it then with proper requirements.

### Files to Remove/Modify
1. `keystatic.config.ts` - Remove videoClips collection definition (lines 1414-1478)
2. `keystatic.config.ts` - Remove 'videoClips' from ui.navigation.Content array (line 39)
3. `content/video-clips/` - Directory doesn't exist (no cleanup needed)

### Acceptance Criteria
- [ ] videoClips collection removed from keystatic.config.ts
- [ ] videoClips removed from UI navigation
- [ ] No references to videoClips remain in codebase
- [ ] Keystatic CMS loads without errors
- [ ] Existing hero videos still work

### Story Points: 0.5 SP

---

## REQ-MEDIA-002: Media Page "Not Found" Bug Fix

### Root Cause Analysis
The `/keystatic/media` route exists at `app/keystatic/media/page.tsx` but shows "Not found" because:

1. `app/keystatic/layout.tsx` renders `<KeystaticApp />` directly (line 39)
2. The layout does NOT use `{children}` prop
3. Therefore, the MediaPage content is never rendered
4. KeystaticApp (the Keystatic UI) doesn't recognize `/keystatic/media` as a valid route

### Solution
Modify the layout to render children for custom routes like `/keystatic/media`.

### Acceptance Criteria
- [ ] `/keystatic/media` displays the MediaLibrary component
- [ ] MediaLibrary can browse images in `public/images/`
- [ ] Upload functionality works
- [ ] Delete functionality works
- [ ] Maintains Keystatic header/navigation for consistent UX

### Technical Approach

**Option A: Fix layout to support children** (RECOMMENDED)
```tsx
// app/keystatic/layout.tsx
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <div className="flex flex-col h-screen...">
        ...
        <div className="flex-1 overflow-auto pb-20">
          {children}
        </div>
        ...
      </div>
    </ThemeProvider>
  );
}
```

Then update `app/keystatic/[[...params]]/page.tsx` to render KeystaticApp.

**Option B: Move media route outside /keystatic**
Move to `/admin/media` to avoid layout conflict (less ideal UX).

### Story Points: 2 SP

---

## REQ-MEDIA-003: Media Selector/Uploader for CMS Image Fields

### Context
Currently, image fields in the CMS use `fields.text()` requiring manual path entry:
- `heroImage` field: "Path to hero image (e.g., /images/facilities/chapel-exterior.jpg)"
- `heroVideo` field: "Path to hero video (e.g., /videos/hero-home.mp4)"

This is error-prone and requires users to know exact file paths.

### Requirements

#### 3.1 Media Browser Component (3 SP)
- [ ] Display all media files from `public/` directory
- [ ] Flat view with folder filtering
- [ ] Thumbnail preview for images
- [ ] Icon indicators for videos
- [ ] File metadata: name, size, dimensions (images), duration (videos)

#### 3.2 Search & Filter (1 SP)
- [ ] Type-ahead search by filename
- [ ] Filter by file type (images, videos, all)
- [ ] Simple sorting: Recent, Name A-Z, Size
- [ ] Optional: Filter by directory

#### 3.3 File Selection (1 SP)
- [ ] Click to select file
- [ ] Returns path string for field value
- [ ] Preview selected file before confirming
- [ ] Clear selection option

#### 3.4 Upload Capability (1 SP)
- [ ] Drag-and-drop upload zone
- [ ] File browser upload button
- [ ] Upload destination: `public/images/uploads/`
- [ ] File validation: type, size limits
- [ ] Progress indicator during upload

#### 3.5 Keystatic Field Integration (2 SP)
- [ ] Custom field component for use in keystatic.config.ts
- [ ] Replace `fields.text()` with media picker field
- [ ] Maintain backward compatibility with existing path strings
- [ ] Works for both image and video selection

### Technical Design

#### Component Architecture
```
MediaPickerField (Keystatic field wrapper)
├── MediaBrowser (modal dialog)
│   ├── MediaToolbar (search, filters, view toggle)
│   ├── MediaGrid (thumbnail grid view)
│   └── UploadZone (drag-drop upload)
└── MediaPreview (selected file preview)
```

#### API Endpoints (already exist)
- `GET /api/media` - List files with pagination, search, filter
- `POST /api/media` - Upload files
- `DELETE /api/media` - Delete files

#### Keystatic Field Definition
```typescript
// lib/keystatic/fields/mediaField.ts
export function mediaField(options: {
  label: string;
  description?: string;
  accept?: 'image' | 'video' | 'all';
}) {
  // Custom component wrapping text field with picker UI
}
```

### Acceptance Criteria
- [ ] CMS editors can browse existing media visually
- [ ] CMS editors can upload new media without leaving page editor
- [ ] CMS editors can search/filter to find files quickly
- [ ] Selected path is correctly saved to content file
- [ ] Existing path values continue to work (backward compatible)

### Non-Goals (Future Enhancements)
- Image cropping/editing
- Bulk upload with progress
- Image optimization on upload
- Integration with external DAMs

### Story Points: 8 SP total

---

## Story Point Summary

| REQ ID | Task | Estimate (SP) |
|--------|------|---------------|
| REQ-SMOKE-010 | Update smoke tests for HeroVideo | 1 |
| REQ-HOME-001 | Homepage title change | 0.5 |
| REQ-MEDIA-001 | Remove Video Clips collection | 0.5 |
| REQ-MEDIA-002 | Media page routing fix | 2 |
| REQ-MEDIA-003 | Media selector/uploader | 8 |

**Total: 12 SP**

---

## Implementation Priority

### Phase 1: Quick Fixes (2 SP)
1. REQ-SMOKE-010 - Smoke test update (1 SP)
2. REQ-HOME-001 - Homepage title (0.5 SP)
3. REQ-MEDIA-001 - Remove Video Clips collection (0.5 SP)

### Phase 2: Media Page Fix (2 SP)
4. REQ-MEDIA-002 - Fix /keystatic/media routing

### Phase 3: Media Selector (8 SP)
5. REQ-MEDIA-003 - Full media picker implementation

---

## Files to Modify

### REQ-SMOKE-010
- `scripts/smoke-test.sh` (lines 272-300)

### REQ-HOME-001
- `content/pages/index.mdoc` (line 2: title field)

### REQ-MEDIA-001
- `keystatic.config.ts` (remove videoClips collection and nav entry)

### REQ-MEDIA-002
- `app/keystatic/layout.tsx` (support children prop)
- `app/keystatic/[[...params]]/page.tsx` (render KeystaticApp)

### REQ-MEDIA-003
- `components/keystatic/MediaPicker.tsx` (new)
- `components/keystatic/MediaBrowser.tsx` (new or extend MediaLibrary)
- `lib/keystatic/fields/mediaField.ts` (new)
- `keystatic.config.ts` (update heroImage, heroVideo fields)
