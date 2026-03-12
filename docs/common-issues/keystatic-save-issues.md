# Keystatic GitHub Mode Save Issues

> **Status**: RESOLVED 2025-12-10
> **Error**: `[GraphQL] A path was requested for deletion which does not exist as of commit oid <sha>`
> **Resolution**: Convert `fields.image()` to `fields.text()` for existing content paths

---

## TL;DR - The Actual Fix

**If you see this error**, check the Network tab for the `deletions` array in the GraphQL request. The malformed path will tell you which image field is causing the problem.

**Root Cause**: Keystatic's `fields.image()` creates slug-based subdirectories (e.g., `public/images/contact/heroImage.jpg`). When content has manually-set paths like `/images/summer-program-and-general/photo.jpg`, Keystatic concatenates them incorrectly:

```
Expected by Keystatic: public/images/contact/heroImage.jpg
Actual in content:     /images/summer-program-and-general/cross.jpg
Keystatic generates:   public/images/contact/rogram-and-general/cross.jpg  ← MALFORMED
```

**The Fix**: Convert collection-level image fields from `fields.image()` to `fields.text()`:

```typescript
// BEFORE (broken with existing content)
heroImage: fields.image({
  label: 'Hero Image',
  directory: 'public/images',
  publicPath: '/images/',
}),

// AFTER (works with any path)
heroImage: fields.text({
  label: 'Hero Image Path',
  description: 'Path to image (e.g., /images/facilities/photo.jpg)',
  defaultValue: '',
}),
```

---

## Quick Diagnosis Checklist

When you see `[GraphQL] A path was requested for deletion which does not exist`:

1. **Open Browser DevTools → Network tab**
2. **Filter for "graphql"**
3. **Reproduce the error** (try saving)
4. **Find the POST to `api.github.com/graphql`**
5. **Check Response for the `deletions` array**:
   ```json
   {
     "path": "public/images/contact/rogram-and-general/cross.jpg"
   }
   ```
6. **The malformed path tells you**:
   - Which page slug is involved (`contact`)
   - Which image path is problematic (`/images/summer-program-and-general/...`)

---

## Understanding Keystatic's Image Field Behavior

### How `fields.image()` Works

Keystatic's image field:
1. Stores uploaded images in `{directory}/{entry-slug}/{field-name}.{ext}`
2. Expects to manage the full lifecycle (upload, rename, delete)
3. On save, tries to delete old paths when images change

### The Problem with Existing Content

If content was created outside Keystatic (or migrated) with paths like:
```yaml
heroImage: /images/summer-program-and-general/cross-with-lake.jpg
```

Keystatic sees this and:
1. Thinks the image is at `public/images/{slug}/images/summer-program-and-general/...`
2. Tries to delete the "old" path on any save
3. GraphQL fails because the malformed path doesn't exist

### The Solution

Use `fields.text()` instead of `fields.image()` for:
- Any image field with existing content paths
- Content migrated from another CMS
- Content created by hand-editing files

Keep `fields.image()` for:
- New fields that will only have Keystatic-uploaded images
- Markdoc/MDX component images (embedded in content)
- Singletons with no existing content

---

## Fields to Convert (Bear Lake Camp)

These fields were converted from `fields.image()` to `fields.text()`:

| Collection | Field | Reason |
|------------|-------|--------|
| pages | `heroImage` | Existing paths like `/images/facilities/...` |
| pages | `galleryImages[].image` | Existing paths in galleries |
| pages (homepage) | `heroImages[].src` | Carousel images |
| staff | `photo` | Existing paths like `/staff/...` and `/images/staff/...` |

Fields that remain as `fields.image()`:
- `seo.ogImage` - No existing content, new uploads only
- `mission.backgroundImage` - Singleton, new uploads only
- Markdoc component images - Embedded content, new uploads only

---

## Other Issues Found (Not The Root Cause)

### Singleton Path Mismatch (Partial Fix)

The `siteNavigation` singleton had a path mismatch:
```typescript
// WRONG - expects content/navigation.yaml
path: 'content/navigation'

// CORRECT - matches content/navigation/navigation.yaml
path: 'content/navigation/navigation'
```

**This was fixed but did NOT resolve the image issue.**

### What Did NOT Fix The Issue

| Approach | Why It Failed |
|----------|---------------|
| Add `publicPath` to image fields | Doesn't change slug-based directory behavior |
| Remove `publicPath` from image fields | Same reason |
| Add `defaultValue: ''` to fields | Not related to path generation |
| Remove orphaned image files | The problem is path generation, not orphaned files |
| Remove empty arrays from frontmatter | Not related |
| Clear browser cache/incognito mode | Server-side issue |

---

## Complete Fix History

### Commits That Fixed The Issue

| Commit | Change | Status |
|--------|--------|--------|
| `9080672` | Fix siteNavigation singleton path | Partial fix |
| `6032f73` | Align image directories with content paths | Partial fix |
| `96b44b1` | **Convert image fields to text fields** | **RESOLVED** |

### Key Insight

The Network tab debugging revealed the actual malformed path:
```
public/images/contact/rogram-and-general/cross-with-lake-in-background.jpg
```

This showed:
1. `public/images/contact/` = directory + slug
2. `rogram-and-general/` = truncated from `/images/summer-p**rogram-and-general**/`
3. The path concatenation was creating nonsense paths

---

## Browser Debugging

### Network Tab Method

1. Open DevTools → Network tab
2. Filter: `graphql`
3. Save any page in Keystatic
4. Find POST to `api.github.com/graphql`
5. Check **Response** tab for error details:

```json
{
  "errors": [{
    "message": "A path was requested for deletion which does not exist as of commit oid `abc123`"
  }]
}
```

6. Check **Request Payload** → `variables.input.fileChanges.deletions`:
```json
{
  "deletions": [
    { "path": "public/images/contact/rogram-and-general/cross.jpg" }
  ]
}
```

### Console Logging (Optional)

Paste in browser console before reproducing:
```javascript
const originalFetch = window.fetch;
window.fetch = function(...args) {
  if (args[0]?.includes?.('api.github.com/graphql')) {
    console.log('🔍 Request:', JSON.parse(args[1]?.body || '{}'));
  }
  return originalFetch.apply(this, args).then(response => {
    if (args[0]?.includes?.('api.github.com/graphql')) {
      response.clone().json().then(data => {
        if (data.errors) console.log('❌ Error:', data.errors);
      });
    }
    return response;
  });
};
```

---

## Prevention Checklist

When adding new image fields to Keystatic:

1. **Will this field have existing/migrated content?**
   - YES → Use `fields.text()` with path description
   - NO → `fields.image()` is fine

2. **Is this in a collection (pages, staff) or singleton?**
   - Collection → Higher risk, consider `fields.text()`
   - Singleton → Usually safe for `fields.image()`

3. **Is this inside a Markdoc/MDX component?**
   - YES → `fields.image()` is fine (embedded content)
   - NO → Evaluate based on above

4. **Test BEFORE deploying**:
   - Create a test entry
   - Add an image with the field
   - Save and verify no errors
   - Edit and save again (triggers deletion logic)

---

## Reference: Working vs Broken Config

### Working Config (after fix)
```typescript
// Collection-level field with existing content
heroImage: fields.text({
  label: 'Hero Image Path',
  description: 'Path to image (e.g., /images/facilities/photo.jpg)',
  defaultValue: '',
}),

// Embedded component image (for new content only)
image: {
  label: 'Image',
  schema: {
    src: fields.image({
      label: 'Image',
      directory: 'public/uploads/content',
      publicPath: '/uploads/content/',
    }),
  },
},
```

### Broken Config (before fix)
```typescript
// This FAILS with existing content paths
heroImage: fields.image({
  label: 'Hero Image',
  directory: 'public/images',
  publicPath: '/images/',
}),
```

---

## GitHub Issue Reference

**Keystatic Issue #1269**: Same error pattern
- URL: https://github.com/Thinkmill/keystatic/issues/1269
- Their cause: Case sensitivity mismatch
- Our cause: Slug-based directory concatenation with existing paths
- Status: Closed (different root cause)

---

## Useful Commands

```bash
# Find all image paths in content
grep -rh "heroImage:\|image:" content/pages/*.mdoc | sort -u

# Check for mismatched paths
grep -r "fields.image" keystatic.config.ts

# Find all successful Keystatic saves in git history
git log --oneline --all | grep -i "Update content"

# Compare config between commits
git diff <working-commit> HEAD -- keystatic.config.ts
```
