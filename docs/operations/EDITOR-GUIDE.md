# Bear Lake Camp - Content Editor Guide

**Quick Start**: Visit https://prelaunch.bearlakecamp.com/keystatic and sign in with GitHub

---

## 📄 Creating a New Page

1. Click **"Pages"** in the sidebar
2. Click **"Create Page"**
3. Enter a **Page Title** (this becomes the URL, e.g., "Summer Camp" → `/summer-camp`)
4. Choose a **Page Template** from the dropdown

---

## 📋 Page Templates

### 1. **Standard Page**
**Best for**: General information pages (About, Contact, FAQ, etc.)

**Fields**:
- **Page Title** - The main heading
- **Hero Image** - Full-width background image (optional)
- **Hero Tagline** - Short text on the hero image (optional)
- **Page Content** - Main text with formatting

**Example pages**: About, FAQ, Contact Us

---

### 2. **Homepage**
**Best for**: Your main landing page

**Fields**:
- All Standard Page fields +
- Use **Content Components** (see below) to add:
  - Photo Gallery (camper photos)
  - Call-to-Action buttons
  - Info boxes

**Example**: The main bearlakecamp.com homepage

---

### 3. **Program Page**
**Best for**: Summer camp programs, retreats, specific events

**Fields**:
- **Page Title** - Program name (e.g., "Junior High Summer Camp")
- **Hero Image** - Program-specific image
- **Age Range** - Who can attend (e.g., "Grades 6-8")
- **Program Dates** - When it runs (e.g., "Week 1: June 14-20")
- **Pricing** - Cost (e.g., "$350 per camper")
- **Registration Link** - Link to UltraCamp registration
- **Page Content** - Description, activities, what's included

**Example pages**: Summer Camp, Retreats, Leaders In Training

---

### 4. **Facility Page**
**Best for**: Buildings and spaces (Cabins, Chapel, Dining Hall, etc.)

**Fields**:
- **Page Title** - Facility name
- **Hero Image** - Photo of the facility
- **Capacity** - How many people it holds (e.g., "Sleeps 40 campers")
- **Amenities** - Features/equipment (e.g., "Bunk beds, restrooms, heating")
- **Page Content** - Description + **Photo Gallery** component

**Example pages**: Cabins, Chapel, Dining Hall, Ministry Activity Center

---

### 5. **Staff/Employment Page**
**Best for**: Job listings, work opportunities

**Fields**:
- **Page Title** - (e.g., "Work at Camp")
- **Hero Image** - Staff action photo
- **Page Content** - Job descriptions + **Call-to-Action** buttons for applications

**Example pages**: Summer Staff, Work at Camp

---

## 🧩 Content Components

**What are these?** Reusable building blocks you can insert anywhere in your page content.

### How to Add a Component:
1. While editing **Page Content**, click the **"+"** button
2. Choose a component from the menu
3. Fill in the fields
4. Click **"Insert"**

---

### 📸 **Photo Gallery**

**Best for**: Multiple photos in a grid (camper photos, facilities, activities)

**Fields**:
- **Gallery Heading** - Title above the gallery
- **Number of Columns** - 2, 3, or 4 columns
- **Images** - Click "Add Image" to add each photo:
  - Upload the image
  - Add **Alt Text** (describes the photo - required for accessibility)
  - Add **Caption** (optional description shown below photo)

**Tip**: For best results, use photos that are roughly the same size/orientation

---

### 🎯 **Call-to-Action Button**

**Best for**: Registration links, donation buttons, important actions

**Fields**:
- **Heading** - Text above the button (e.g., "Ready to register?")
- **Description** - Supporting text
- **Button Text** - What the button says (e.g., "Register Now")
- **Button Link** - Where it goes (usually UltraCamp URL)
- **Button Style** - Primary (Blue), Secondary (Green), or Accent (Orange)

**Example**: "Register Now" button linking to UltraCamp

---

### 🎥 **Video Embed**

**Best for**: YouTube videos (promo videos, testimonials)

**Fields**:
- **YouTube Video URL** - Full URL (e.g., https://youtube.com/watch?v=...)
- **Caption** - Text below the video (optional)

**Tip**: The video will be responsive and fit any screen size

---

### 💡 **Info Box**

**Best for**: Important announcements, highlighted information, tips

**Fields**:
- **Heading** - Title of the box
- **Content** - Message text
- **Style** - Info (Blue), Success (Green), or Warning (Orange)

**Example**: "Important: Registration opens March 1st"

---

## 👥 Managing Staff Bios

**Location**: Click **"Staff Bios"** in the sidebar

**Use this for**: Camp director, summer staff, leadership team

**Fields**:
- **Staff Name** - Full name
- **Job Title** - Position (e.g., "Camp Director")
- **Headshot Photo** - Square photo works best (500x500px)
- **Email Address** - Contact email (optional)
- **Display Order** - Number to control the order (lower numbers first)
- **Biography** - Short bio with formatting

**Tip**: Staff bios can be displayed on the "About" or "Staff" pages

---

## 💾 Saving Your Work

1. Click **"Create"** or **"Save"** (top right)
2. Your changes are automatically committed to GitHub
3. The website will rebuild and deploy (takes ~30 seconds)
4. Refresh the live site to see your changes

---

## 📸 Image Tips

### Upload Locations:
- **Hero Images** → Saved to `/public/uploads/heroes/`
- **Gallery Photos** → Saved to `/public/uploads/gallery/`
- **Staff Photos** → Saved to `/public/uploads/staff/`

### Recommended Sizes:
- **Hero Images**: 1920x1080px (landscape)
- **Gallery Photos**: 1200x800px or larger
- **Staff Headshots**: 500x500px (square)

### Best Practices:
- ✅ Use descriptive file names (e.g., `jr-high-camp-2025.jpg`)
- ✅ Always add Alt Text (describes the photo for screen readers)
- ✅ Compress images before uploading (use tinypng.com)
- ✅ Use JPG for photos, PNG for logos/graphics

---

## 🆘 Common Questions

**Q: How do I add a new program page?**
A: Click "Pages" → "Create Page" → Choose "Program Page" template → Fill in age range, dates, pricing → Save

**Q: How do I add photos to a page?**
A: While editing content, click "+" → Choose "Photo Gallery" → Add images → Insert

**Q: Can I preview before publishing?**
A: Not yet - changes go live immediately. Double-check before clicking "Save"

**Q: How do I change the main navigation menu?**
A: Contact your developer - navigation is managed in code

**Q: I made a mistake - can I undo?**
A: Yes! Every change is saved in GitHub. Contact your developer to restore a previous version.

---

## 📞 Need Help?

Contact: ben@bearlakecamp.com or your website administrator

---

**Last Updated**: November 2025
