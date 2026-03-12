# Create GitHub App - Quick Steps

**Why**: Fix the 500 error when creating/saving pages in Keystatic CMS

**Time**: 5 minutes

---

## Step 1: Create the GitHub App

1. **Go to**: https://github.com/settings/apps/new

2. **Fill in the form**:

   ```
   GitHub App name: bearlakecamp-cms

   Homepage URL: https://prelaunch.bearlakecamp.com

   Callback URL: https://prelaunch.bearlakecamp.com/api/keystatic/github/oauth/callback

   Setup URL: (leave blank)

   Webhook: ☐ Uncheck "Active"

   Permissions:
     Repository permissions:
       - Contents: Read and write
       - Metadata: Read-only

     User permissions: (none)

   Where can this GitHub App be installed?
     ● Only on this account
   ```

3. **Click "Create GitHub App"**

---

## Step 2: Generate Client Secret

1. On the app page (you'll be redirected automatically), find the **"Client secrets"** section

2. Click **"Generate a new client secret"**

3. **COPY the Client Secret immediately** - it won't be shown again

4. **COPY the Client ID** from the top of the page

5. **COPY the App Slug** from the URL bar:
   - URL format: `https://github.com/settings/apps/YOUR-APP-SLUG`
   - If you named it `bearlakecamp-cms`, the slug is: `bearlakecamp-cms`
https://github.com/settings/apps/bearlakecamp-cms
---

## Step 3: Install App on Repository

1. In the left sidebar, click **"Install App"**

2. Click **"Install"** next to your account (`sparkst`)

3. Select **"Only select repositories"**

4. Choose: `bearlakecamp`

5. Click **"Install"**

---

## Step 4: Update Vercel Environment Variables

Now update Vercel with the new credentials:

```bash
cd bearlakecamp-nextjs

# Remove old OAuth App credentials
npx vercel env rm KEYSTATIC_GITHUB_CLIENT_ID production
npx vercel env rm KEYSTATIC_GITHUB_CLIENT_ID preview
npx vercel env rm KEYSTATIC_GITHUB_CLIENT_ID development

npx vercel env rm KEYSTATIC_GITHUB_CLIENT_SECRET production
npx vercel env rm KEYSTATIC_GITHUB_CLIENT_SECRET preview
npx vercel env rm KEYSTATIC_GITHUB_CLIENT_SECRET development

# Add new GitHub App Client ID (paste when prompted)
npx vercel env add KEYSTATIC_GITHUB_CLIENT_ID production
npx vercel env add KEYSTATIC_GITHUB_CLIENT_ID preview
npx vercel env add KEYSTATIC_GITHUB_CLIENT_ID development

# Add new GitHub App Client Secret (paste when prompted)
npx vercel env add KEYSTATIC_GITHUB_CLIENT_SECRET production
npx vercel env add KEYSTATIC_GITHUB_CLIENT_SECRET preview
npx vercel env add KEYSTATIC_GITHUB_CLIENT_SECRET development

# Add the App Slug (NEW - this was missing!)
npx vercel env add NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG production
npx vercel env add NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG preview
npx vercel env add NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG development
```

**When prompted, paste**:
- Client ID: (from Step 2)
- Client Secret: (from Step 2)
- App Slug: `bearlakecamp-cms` (or whatever name you used)

---

## Step 5: Update Local Environment

Pull the new environment variables locally:

```bash
npx vercel env pull .env.local
```

---

## Step 6: Trigger Redeploy

Push any small change to trigger a redeploy:

```bash
# Option 1: Empty commit
git commit --allow-empty -m "chore: trigger redeploy with GitHub App credentials"
git push

# Option 2: Via Vercel CLI
npx vercel --prod
```

---

## Step 7: Test

1. Wait 30-60 seconds for deployment

2. Visit: https://prelaunch.bearlakecamp.com/keystatic

3. Click **"Sign in with GitHub"**

4. Authorize the app

5. Try creating a new page

6. Click **Save**

7. Should work without 500 error! ✅

---

## Verify Environment Variables

Check that all 4 required variables are set:

```bash
npx vercel env ls
```

Should show:
- ✅ KEYSTATIC_GITHUB_CLIENT_ID (new GitHub App ID)
- ✅ KEYSTATIC_GITHUB_CLIENT_SECRET (new GitHub App secret)
- ✅ KEYSTATIC_SECRET (can keep existing)
- ✅ NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG (NEW!)

---

## Troubleshooting

### "App name already taken"
Try: `bearlakecamp-cms-prod` or `bear-lake-camp-cms`

### Still getting 500 error
1. Check all 4 env vars are set in Vercel
2. Verify app is installed on `sparkst/bearlakecamp` repo
3. Check app slug matches exactly
4. Try clearing browser cache/cookies

### "Callback URL mismatch"
Ensure callback URL is exactly:
`https://prelaunch.bearlakecamp.com/api/keystatic/github/oauth/callback`

---

## What Gets Fixed

After this setup:
- ✅ Creating new pages works
- ✅ Saving pages works
- ✅ Changes auto-commit to GitHub
- ✅ Vercel auto-deploys changes
- ✅ No more 500 errors
