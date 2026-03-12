# Keystatic UI Debug Report

**Date**: 2025-12-03
**Requirements**: REQ-PM-005, REQ-PM-006
**Status**: Root causes identified, fixes proposed

---

## Issue 1: Navigation Singleton Not Appearing (REQ-PM-005)

### Root Cause
**Path mismatch between Keystatic config and actual file location.**

**Details**:
- `keystatic.config.ts` line 47: `path: 'content/navigation'`
- Actual file location: `/content/navigation.yaml` (in content root)
- Expected location: `/content/navigation/` directory OR file matching singleton name

Keystatic singletons expect the path to point to either:
1. A directory containing the data file
2. A file matching the singleton name pattern

The current config points to `content/navigation` but no such directory exists.

### Evidence
```bash
$ ls -la /content/
drwxr-xr-x@ 21 travis  staff   672 Dec  3 11:02 pages
-rw-------@  1 travis  staff  1388 Dec  2 20:25 navigation.yaml  # <-- File exists here
drwxr-xr-x@  3 travis  staff    96 Nov 20 09:06 migrated-pages

$ ls -la /content/navigation/
ls: /content/navigation/: No such file or directory  # <-- Directory does not exist
```

### Proposed Fix (Option A - Recommended)
**Create navigation directory and move file:**

1. Create `/content/navigation/` directory
2. Move `/content/navigation.yaml` to `/content/navigation/navigation.yaml` or `/content/navigation/index.yaml`
3. Keep config as-is: `path: 'content/navigation'`

**Pros**:
- Matches Keystatic singleton pattern
- Consistent with other singleton structures
- No config changes needed
- Clear separation of concerns

**Cons**:
- Requires file system changes
- Need to update git tracking

### Proposed Fix (Option B - Alternative)
**Update config to match current file location:**

Change line 47 in `keystatic.config.ts`:
```typescript
// Before
path: 'content/navigation',

// After
path: 'content/navigation.yaml',
```

**Pros**:
- Minimal changes
- Works with existing file

**Cons**:
- Less conventional structure
- May not match Keystatic best practices

### Recommended Solution
**Option A** - Create the directory structure. This follows Keystatic conventions and provides better organization.

**Files to modify**:
- Create: `/content/navigation/` directory
- Move: `/content/navigation.yaml` → `/content/navigation/navigation.yaml`
- Update: `.gitignore` if needed

**Estimated Fix SP**: 0.1

---

## Issue 2: Cannot Scroll to Bottom of Edit Pages (REQ-PM-006)

### Root Cause
**Fixed toolbar overlaps bottom content without compensating padding.**

**Details**:
- `PageEditingToolbar` uses `fixed bottom-4 right-4 z-50` positioning
- Toolbar floats over content (not in document flow)
- No padding-bottom on scrollable container to account for toolbar height
- Toolbar height: approximately 56px (2px border + 8px padding + 24px content + 8px padding + variable deployment status)

When a user scrolls to the bottom of a long form, the last ~60-80px of content is hidden behind the fixed toolbar, making the Save button inaccessible.

### Evidence
**Current Layout Structure** (`app/keystatic/layout.tsx`):
```tsx
<div className="flex flex-col h-screen">
  <div className="sticky top-0 z-10 bg-white flex-shrink-0">
    <KeystaticToolsHeader />
  </div>
  <div className="flex-1 overflow-auto">  {/* <-- No bottom padding */}
    <KeystaticApp />
  </div>
  <PageEditingToolbar />  {/* <-- Fixed position, overlaps content */}
</div>
```

**Current Toolbar** (`components/keystatic/PageEditingToolbar.tsx` line 51-55):
```tsx
<div
  className="fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-2 bg-white rounded-lg shadow-lg border border-gray-200"
>
```

### Proposed Fix
**Add bottom padding to scrollable container to account for fixed toolbar.**

**Solution**: Add padding-bottom to the scroll container equal to toolbar height + gap.

**Calculation**:
- Toolbar height: ~56px (padding + content)
- Bottom offset: 16px (bottom-4)
- Safe clearance: 80px total (gives breathing room)

**Files to modify**:
- `/app/keystatic/layout.tsx` - Add `pb-20` (80px) to scrollable container

**Implementation**:
```tsx
// Before
<div className="flex-1 overflow-auto">
  <KeystaticApp />
</div>

// After
<div className="flex-1 overflow-auto pb-20">
  <KeystaticApp />
</div>
```

**Alternative approach** (if Keystatic app has its own scroll container):
Add padding to the Keystatic app wrapper or use CSS custom property:
```tsx
<div className="flex-1 overflow-auto" style={{ paddingBottom: 'var(--toolbar-height, 80px)' }}>
  <KeystaticApp />
</div>
```

**Estimated Fix SP**: 0.05

---

## Testing Plan

### Pre-Implementation Verification
1. Start dev server: `npm run dev`
2. Navigate to `/keystatic`
3. **Issue 1 Test**: Check if "Settings > Site Navigation" appears in sidebar
   - Expected: NOT visible (confirms bug)
4. **Issue 2 Test**: Edit any page with long content
   - Scroll to bottom
   - Try to click Save button
   - Expected: Save button partially/fully hidden behind toolbar

### Post-Implementation Verification

**Issue 1 (Navigation Singleton)**:
1. Create `/content/navigation/` directory
2. Move navigation.yaml file
3. Restart dev server (clear Next.js cache)
4. Navigate to `/keystatic`
5. Verify "Settings" group appears in left sidebar
6. Verify "Site Navigation" link visible under Settings
7. Click link - should open navigation editor
8. Verify can edit menu items, dropdown children, and primary CTA
9. Save changes and verify they persist

**Issue 2 (Scroll)**:
1. Navigate to `/keystatic/collection/pages/about`
2. Scroll to bottom of form
3. Verify Save button fully visible
4. Verify 20-30px clearance between button and toolbar
5. Repeat test on pages with very long forms
6. Test on different viewport sizes (1280px, 1920px)

---

## Implementation Order

### Phase 1: Fix Navigation Singleton (REQ-PM-005)
**Priority**: P0
**SP**: 0.1

1. Create directory structure
2. Move navigation file
3. Verify in Keystatic UI
4. Test CRUD operations

### Phase 2: Fix Scroll Issue (REQ-PM-006)
**Priority**: P1
**SP**: 0.05

1. Update layout.tsx with padding
2. Test scrolling behavior
3. Verify toolbar doesn't block content

**Total SP**: 0.15

---

## Success Criteria

**REQ-PM-005 Acceptance**:
- [ ] "Settings" group appears in Keystatic sidebar
- [ ] "Site Navigation" link visible under Settings
- [ ] Clicking link opens navigation editor
- [ ] Can add/edit/delete menu items
- [ ] Can add/edit dropdown children
- [ ] Can edit primary CTA button
- [ ] Changes persist after save

**REQ-PM-006 Acceptance**:
- [ ] Full page content scrollable in Keystatic editor
- [ ] Can reach "Save" button at bottom of long forms
- [ ] Toolbar does not block content
- [ ] Works on desktop viewports (1280px+)
- [ ] Minimum 20px clearance between button and toolbar

---

## Related Files

**Navigation Singleton Issue**:
- `/keystatic.config.ts` (line 45-89)
- `/content/navigation.yaml` (current location)
- `/content/navigation/` (to be created)

**Scroll Issue**:
- `/app/keystatic/layout.tsx` (line 19)
- `/components/keystatic/PageEditingToolbar.tsx` (visual reference)

---

## Risk Assessment

**Navigation Singleton Fix**:
- Risk: Low
- Impact: Moving file might break existing navigation display
- Mitigation: Test navigation menu rendering on frontend after fix
- Rollback: Git revert file move

**Scroll Fix**:
- Risk: Very Low
- Impact: Adding padding won't break functionality
- Mitigation: Visual testing on multiple page types
- Rollback: Remove padding class

---

## Notes

- Both fixes are surgical and low-risk
- No TypeScript changes needed
- No test suite changes needed (UI-only fixes)
- Manual QA required (visual verification)
- Total estimated time: 10-15 minutes implementation + testing
