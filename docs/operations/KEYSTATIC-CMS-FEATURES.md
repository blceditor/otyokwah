# Keystatic CMS Features Guide

This guide explains how to use the 5 new CMS enhancements in the Keystatic admin interface.

## Accessing Keystatic Admin

Navigate to: **https://prelaunch.bearlakecamp.com/keystatic**

Sign in with your GitHub account to access the CMS.

---

## 1. Dark Mode Toggle (REQ-FUTURE-020)

### Location
Top-right corner of the Keystatic header, next to the Sparkry branding.

### How to Use
- **Click the sun icon** to switch to dark mode
- **Click the moon icon** to switch back to light mode
- Your preference is saved automatically and persists across sessions

### Features
- Respects your system preference by default
- All CMS components are styled for both light and dark modes
- Reduces eye strain during extended editing sessions

---

## 2. Recent Pages Sort (REQ-FUTURE-013)

### Location
In the Keystatic tools header, visible **only when viewing the Pages collection**.

### How to Use
1. Navigate to **Pages** in the sidebar
2. Click the **"Recent" button** (with clock icon) in the header
3. The page list will reorder to show your most recently edited pages first
4. Click the **X button** next to Recent to clear the sort and refresh

### Features
- Automatically tracks which pages you edit
- Stores up to 20 recent pages in your browser
- Page visits are tracked when you open a page for editing
- Helpful for quickly finding pages you were just working on

---

## 3. Link Validator (REQ-FUTURE-017)

### Location
In the page editing toolbar (bottom-right floating panel), when editing any page.

### How to Use
1. Open any page for editing
2. Click **"Validate Links"** in the toolbar
3. A modal will appear showing validation results

### What Gets Validated
- **Internal links** (e.g., `/about`, `/summer-camp`): Checks if the page exists
- **External links** (e.g., `https://example.com`): Checks if the URL responds
- **Email links** (`mailto:`): Validates email format
- **Phone links** (`tel:`): Validates phone number format

### Results Display
- ✅ **Valid links** shown in green
- ❌ **Invalid links** shown in red with error message
- Summary count of valid vs invalid links

---

## 4. AI Alt Text Suggestions (REQ-FUTURE-019)

### Location
On image fields with alt text inputs, when editing a page.

### How to Use
1. Open a page that has an image field
2. Upload or select an image
3. Look for the **"Suggest" button** (purple) next to the alt text field
4. Click **Suggest** to generate AI-powered alt text
5. Review and edit the suggestion as needed

### Features
- Uses AI vision to analyze the image content
- Generates descriptive, accessible alt text
- One-click to fill the alt text field
- You can edit the suggestion before saving

### Note
The AI suggestion is a starting point. Always review and adjust the alt text to ensure it accurately describes the image in your specific context.

---

## 5. Media Library Manager (REQ-FUTURE-007)

### Location
Accessible via the **"Media" button** (folder icon) in the Keystatic header.

Direct URL: **https://prelaunch.bearlakecamp.com/keystatic/media**

### How to Use

#### Browsing Media
- **Grid view**: See thumbnails of all media files
- **List view**: See files in a detailed list format
- **Toggle views** using the Grid/List buttons

#### Filtering
- **Search**: Type in the search box to filter by filename
- **Type filter**: Click "Images" or "Videos" to filter by media type
- **All**: Click "All" to see all media

#### Uploading
1. Click the **"Upload" button** (blue, top-right)
2. Select files from your computer
3. Or **drag and drop** files onto the library

#### Deleting
1. Click on files to select them (checkbox appears)
2. Click **"Delete"** button to remove selected files
3. **Warning**: Check if files are used in pages before deleting

### File Information Displayed
- Filename
- File size
- Dimensions (for images)
- Date added
- Usage indicator (shows which pages use the file)

### Supported File Types
- **Images**: JPG, PNG, GIF, WebP, SVG, AVIF
- **Videos**: MP4, WebM

### Size Limit
Maximum file size: **10MB per file**

---

## Tips for Editors

### Keyboard Shortcuts
- Most features work with standard keyboard navigation
- Tab through controls, Enter to activate buttons

### Best Practices
1. **Use descriptive alt text** for all images for accessibility
2. **Validate links** before publishing to avoid broken links
3. **Check media usage** before deleting files
4. **Use Recent sort** to quickly find pages you're actively editing

### Troubleshooting

**Dark mode not switching?**
- Try refreshing the page
- Clear browser localStorage if issues persist

**Recent sort not working?**
- You need to edit at least one page first to build history
- The sort only appears on the Pages collection view

**Link validation taking long?**
- External links require network requests, which may take time
- Large pages with many links take longer to validate

**Alt text suggestion not appearing?**
- Make sure an image is uploaded first
- The button appears near alt text input fields

**Media library empty?**
- Check if images exist in `public/images/` directory
- Try refreshing the page

---

## Technical Details

For developers, see the implementation details in:
- `components/keystatic/` - UI components
- `lib/keystatic/` - Utility functions
- `app/api/` - API routes for validation and suggestions

Report bugs using the **Bug Report** button in the Keystatic header.
