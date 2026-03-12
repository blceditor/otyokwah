# GitHub App Setup for Keystatic

**Problem**: Getting 500 errors when creating/saving pages in Keystatic CMS

**Cause**: Using GitHub OAuth App instead of GitHub App

**Solution**: Create a GitHub App through Keystatic's setup wizard

---

## Quick Fix (Recommended)

### Option 1: Let Keystatic Create the GitHub App (Easiest)

1. **Visit prelaunch.bearlakecamp.com on localhost first**
   ```bash
   cd bearlakecamp-nextjs
   npm run dev
   ```

2. **Go to localhost:3000/keystatic**
   - You should see the Keystatic UI
   - Look for a GitHub authentication or setup prompt

3. **Follow Keystatic's GitHub App Creation Wizard**
   - Click "Connect to GitHub" or similar button
   - Keystatic will walk you through creating a GitHub App
   - Choose a name like: `bearlakecamp-cms`
   - Grant access to the `sparkst/bearlakecamp` repository

4. **Copy the Generated Environment Variables**
   - Keystatic will create a `.env` file with:
     - `KEYSTATIC_GITHUB_CLIENT_ID` (new value - different from OAuth App)
     - `KEYSTATIC_GITHUB_CLIENT_SECRET` (new value)
     - `KEYSTATIC_SECRET` (can reuse existing)
     - `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` (NEW - this is missing!)

5. **Update Vercel Environment Variables**
   ```bash
   # Remove old OAuth App credentials
   npx vercel env rm KEYSTATIC_GITHUB_CLIENT_ID
   npx vercel env rm KEYSTATIC_GITHUB_CLIENT_SECRET

   # Add new GitHub App credentials
   npx vercel env add KEYSTATIC_GITHUB_CLIENT_ID
   # Paste the new Client ID from .env

   npx vercel env add KEYSTATIC_GITHUB_CLIENT_SECRET
   # Paste the new Client Secret from .env

   # Add the missing slug
   npx vercel env add NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG
   # Paste the app slug (e.g., "bearlakecamp-cms")

   # Keep existing KEYSTATIC_SECRET
   # Already set, no need to change
   ```

6. **Redeploy**
   ```bash
   git add .env.local
   git commit -m "chore: update to GitHub App credentials"
   git push
   ```

---

## Option 2: Manually Create GitHub App

If Keystatic doesn't show the setup wizard, create the GitHub App manually:

1. **Go to GitHub Settings**
   - Visit: https://github.com/settings/apps/new

2. **Configure the GitHub App**
   ```
   GitHub App name: bearlakecamp-cms
   Homepage URL: https://prelaunch.bearlakecamp.com
   Callback URL: https://prelaunch.bearlakecamp.com/api/keystatic/github/oauth/callback
   Setup URL: (leave blank)
   Webhook: Uncheck "Active"
   ```

3. **Set Permissions**
   - Repository permissions:
     - Contents: Read and write
     - Metadata: Read-only
   - User permissions: (none needed)

4. **Where can this GitHub App be installed?**
   - Select: "Only on this account"

5. **Click "Create GitHub App"**

6. **Generate Client Secret**
   - On the app page, click "Generate a new client secret"
   - Copy the Client ID and Client Secret

7. **Install the App on Your Repository**
   - Click "Install App" in the left sidebar
   - Select `sparkst/bearlakecamp` repository
   - Click "Install"

8. **Get the App Slug**
   - The app slug is in the URL: `https://github.com/settings/apps/YOUR-APP-SLUG`
   - For example, if you named it "bearlakecamp-cms", the slug is `bearlakecamp-cms`

9. **Update Environment Variables** (see Option 1 step 5)

---

## After Setup

### Test Locally First
```bash
npm run dev
# Visit http://localhost:3000/keystatic
# Try creating a page
# Should work without errors
```

### Then Test on Prelaunch
- Visit https://prelaunch.bearlakecamp.com/keystatic
- Sign in with GitHub (will use new GitHub App)
- Create a test page
- Should save without 500 errors
- Check GitHub for new commit

---

## Differences: OAuth App vs GitHub App

| Feature | OAuth App (Old) | GitHub App (New) |
|---------|----------------|------------------|
| **Permissions** | Coarse-grained | Fine-grained (repo-specific) |
| **Tokens** | Long-lived | Short-lived (more secure) |
| **Identification** | Client ID only | Client ID + App Slug |
| **Keystatic Support** | ❌ Not recommended | ✅ Required |
| **Write Access** | May fail | ✅ Works correctly |

---

## Troubleshooting

### "App already exists with that name"
- Choose a different name: `bearlakecamp-cms-prod`, `bear-lake-camp-cms`, etc.

### "Callback URL mismatch"
- Ensure callback URL exactly matches:
  - Local: `http://localhost:3000/api/keystatic/github/oauth/callback`
  - Prelaunch: `https://prelaunch.bearlakecamp.com/api/keystatic/github/oauth/callback`

### Still getting 500 errors
1. Verify `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` is set
2. Check the slug matches your GitHub App name (URL-friendly)
3. Ensure the GitHub App is installed on `sparkst/bearlakecamp` repo
4. Verify user has write access to the repository

### How to check environment variables are set
```bash
npx vercel env ls
# Should show:
# - KEYSTATIC_GITHUB_CLIENT_ID
# - KEYSTATIC_GITHUB_CLIENT_SECRET
# - KEYSTATIC_SECRET
# - NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG (THIS IS NEW!)
```

---

## Current vs New Setup

**Current (OAuth App):**
```bash
KEYSTATIC_GITHUB_CLIENT_ID=Ov23li74diodsWpesiOD
KEYSTATIC_GITHUB_CLIENT_SECRET=2224882a51c8428b142b9cfdadc7e79e29e473b3
KEYSTATIC_SECRET=dWDIZ1rtvkSQ7apT2kql05Src6EewV0aUSxP696ohiU=
# Missing: NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG
```

**New (GitHub App):**
```bash
KEYSTATIC_GITHUB_CLIENT_ID=Iv1.abc123def456  # Different format
KEYSTATIC_GITHUB_CLIENT_SECRET=ghs_xyz789...  # Different format
KEYSTATIC_SECRET=dWDIZ1rtvkSQ7apT2kql05Src6EewV0aUSxP696ohiU=  # Can keep same
NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG=bearlakecamp-cms  # NEW!
```

---

## Next Steps

1. ✅ Create GitHub App (Option 1 or 2)
2. ✅ Update environment variables in Vercel
3. ✅ Test locally
4. ✅ Deploy and test on prelaunch
5. ✅ Copy mockup files (separate task)
