# Keystatic CMS Login Instructions for Ben

## Overview
The Bear Lake Camp CMS has been migrated to a new GitHub account (`blceditor`). Follow these steps to access the CMS and test making content updates.

---

## Step 1: Clear Your Browser Session (Required First Time Only)

Since the CMS was previously connected to a different GitHub account, you need to clear your session:

1. Go to: **https://prelaunch.bearlakecamp.com/keystatic**
2. If you see a "Repo not found" error, click **Tools → Sign Out** in the top menu
3. If Tools menu isn't visible, go directly to: **https://prelaunch.bearlakecamp.com/api/keystatic/logout**

This will clear your old session and redirect you to sign in fresh.

---

## Step 2: Sign In with GitHub

1. Go to: **https://prelaunch.bearlakecamp.com/keystatic**
2. You'll be prompted to authorize with GitHub
3. **Important:** When GitHub asks which account to authorize, select **blceditor**
   - If you're not logged into GitHub as blceditor, you may need to sign out of GitHub first and sign in as blceditor
4. Click "Authorize" to grant the CMS access

---

## Step 3: Verify Access

After signing in, you should see:
- "Hello, blceditor!" on the dashboard
- Repository: `blceditor/bearlakecamp`
- Content sections: Pages, Staff Bios, Testimonials, FAQs

---

## Step 4: Test Making an Edit

1. Click on **Pages** in the left sidebar (or the "33 entries" card)
2. Select any page (e.g., "About Us" or "Summer Camp")
3. Make a small test edit (add a word, fix a typo, etc.)
4. Click **Save** in the top right
5. Verify the save completes successfully (green checkmark or success message)

---

## Troubleshooting

### "Repo not found" Error
- Go to **Tools → Sign Out** and re-authorize with the `blceditor` GitHub account

### Can't See Tools Menu
- Visit: https://prelaunch.bearlakecamp.com/api/keystatic/logout
- This will clear your session and redirect you to re-authorize

### Wrong GitHub Account
1. Sign out of Keystatic (Tools → Sign Out)
2. Go to https://github.com and sign out
3. Sign in to GitHub as `blceditor`
4. Return to https://prelaunch.bearlakecamp.com/keystatic

### Changes Not Saving
- Make sure you're on the `main` branch (shown in top left)
- Check that you have write access to the repository

---

## Quick Links

| Resource | URL |
|----------|-----|
| CMS Dashboard | https://prelaunch.bearlakecamp.com/keystatic |
| Sign Out / Clear Session | https://prelaunch.bearlakecamp.com/api/keystatic/logout |
| Live Site | https://prelaunch.bearlakecamp.com |
| GitHub Repository | https://github.com/blceditor/bearlakecamp |

---

## Need Help?

If you encounter issues not covered here, contact Travis or file a bug report through the CMS (Help → Report Bug).
