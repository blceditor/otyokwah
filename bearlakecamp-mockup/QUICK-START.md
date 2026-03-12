# Bear Lake Camp Mockup - Quick Start Guide

**🎯 Goal:** See the new design direction in 5 minutes

---

## Step 1: Open the Mockup

### Mac Users:
1. Open Finder
2. Navigate to: `bearlakecamp-mockup/`
3. Double-click `index.html`
4. Your browser will open the mockup

### Windows Users:
1. Open File Explorer
2. Navigate to the `bearlakecamp-mockup/` folder
3. Double-click `index.html`
4. Your browser will open the mockup

---

## Step 2: Test Responsive Design

### Desktop View (Current)
- You should see the full-width layout
- Trust bar at the top
- Large hero section
- Two-column program cards side-by-side

### Mobile View (Test This!)
**Chrome/Edge:**
1. Press `F12` to open DevTools
2. Click the "Toggle Device Toolbar" icon (phone/tablet icon)
3. Select "iPhone 12 Pro" from dropdown
4. Refresh page

**Safari:**
1. Go to Develop → Enter Responsive Design Mode
2. Select "iPhone 12 Pro"
3. Refresh page

**What to Look For:**
- ✅ Trust bar becomes scrollable (swipe horizontally)
- ✅ Sticky CTA bar appears at bottom after scrolling
- ✅ Program cards stack vertically
- ✅ All buttons are thumb-sized (48px × 48px)

---

## Step 3: Test Scroll Behavior

Scroll down the page slowly and watch for:

1. **Scroll Indicator** (hero section)
   - Animated arrow that bounces up/down

2. **Sticky CTA Bar** (mobile only)
   - Appears after scrolling past hero
   - Two buttons: "Register Now" + "Find Your Week"

3. **Fade-In Animations**
   - Sections fade in as you scroll
   - Subtle 30px upward slide
   - Smooth 0.6s transition

4. **Hover States** (desktop)
   - Hover over program cards → lifts 5px
   - Hover over buttons → lifts 2px + shadow
   - Hover over gallery images → scales 5%

---

## Step 4: Compare Before/After

### Current Site
Open: https://bearlakecamp.com (or existing demo site)

**Notice:**
- White background
- Bright blue buttons
- Black text
- Minimal trust signals
- Static imagery

### New Mockup
Open: `index.html`

**Notice:**
- Cream background (warm, inviting)
- Forest green buttons (nature-aligned)
- Bark-colored text (softer)
- Trust bar above fold (500+ families, ACA badge)
- "Nature-authentic" photo treatment (desaturated, warm tones)

---

## Step 5: Key Features to Review

### ✅ Must-See Elements

1. **Trust Bar** (top of page)
   - Do the stats feel accurate?
   - Is "ACA Accredited" prominently displayed?

2. **Hero Tagline** (handwritten font)
   - Does "Where Faith Grows Wild" feel authentic?
   - Is the Caveat font readable?

3. **Mission Section** (campfire background)
   - Does the forest green overlay work?
   - Is the text readable over the photo?

4. **Program Cards**
   - Do the photos show real camp life?
   - Are the descriptions (identity, leadership) accurate?

5. **Video Testimonials** (placeholders)
   - Imagine these as real videos
   - Would you trust a parent testimonial here?

6. **Instagram Feed** (placeholders)
   - Would live Instagram posts add social proof?
   - Is #FaithGrowsWild the right hashtag?

---

## Step 6: Provide Feedback

### What to Look For

**Colors:**
- Too warm? Too muted?
- Does forest green feel "camp-like"?
- Is cream background too yellow?

**Typography:**
- Headings too large/small?
- Handwritten font too casual?
- Body text readable?

**Layout:**
- Too much/little spacing?
- Sections flow well?
- Mobile layout comfortable?

**Photography:**
- Do existing photos work?
- Need professional shoot?
- Color treatment too desaturated?

### How to Give Feedback

**Option 1: Screenshots**
1. Take screenshots of specific sections
2. Annotate with arrows/text (Preview.app on Mac)
3. Email to: travis@sparkry.com

**Option 2: List**
1. Open Notes.app or Word
2. Write: "Section X: [feedback]"
3. Example: "Hero Section: Tagline font feels too casual, prefer cleaner look"
4. Email list to: travis@sparkry.com

---

## Common Questions

### Q: Why are some images placeholders?
**A:** Video testimonials need to be filmed. Instagram feed needs API integration. This mockup shows *layout* only.

### Q: Why does the hero use a static image?
**A:** The styleguide recommends a 15-30 sec video loop. Filming that video is Phase 2. For now, chapel exterior shows the *concept*.

### Q: Can we change colors?
**A:** Yes! All colors use CSS variables. Easy to adjust. Try it:
1. Open `styles.css`
2. Find `:root { --color-primary: #4A7A9E; }`
3. Change to any hex color
4. Refresh browser

### Q: How do I test on my phone?
**A:** If using local server (see README), find your computer's IP address (System Preferences → Network), then open `http://YOUR_IP:8000` on phone.

### Q: What if I don't like the handwritten font?
**A:** Easy fix. Remove Google Fonts link in `index.html` and update CSS to use system fonts only.

---

## Next Steps

### If You Approve This Direction:
1. ✅ Confirm approval via email
2. We'll move to **Phase 1: Quick Wins** (1-2 weeks)
   - Update live site colors
   - Add trust bar
   - Replace photos with color-treated versions
3. Film first video testimonial

### If You Want Changes:
1. Provide specific feedback (screenshots preferred)
2. We'll iterate on mockup
3. Schedule follow-up review call

---

## Need Help?

**Can't open the mockup?**
- Make sure you're double-clicking `index.html` (not `styles.css`)
- Try different browser (Chrome recommended)

**Images not loading?**
- Check that `bearlakecamp/public/` folder exists in parent directory
- Or: use local server (see README)

**Animations not working?**
- Try scrolling slower
- Check browser console for errors (F12)

**Still stuck?**
- Email: travis@sparkry.com
- Subject: "Mockup Help Needed"

---

## Timeline Reminder

**Phase 1 (Quick Wins):** 1-2 weeks
**Phase 2 (Core Features):** 3-4 weeks
**Phase 3 (Enhancements):** 2-3 weeks

**Total:** ~6-9 weeks from approval to launch

---

**🎯 Your Mission:** Spend 10 minutes exploring the mockup, then send feedback!
