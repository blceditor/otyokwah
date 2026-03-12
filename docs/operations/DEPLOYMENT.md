# Keystatic CMS Deployment Guide

Deploy bearlakecamp.com with Keystatic CMS for production content editing.

## Prerequisites

- GitHub repository: `sparkst/bearlakecamp` ✅
- GitHub OAuth App credentials (already created)
- Vercel account

## Step 1: Update GitHub OAuth App

1. Go to https://github.com/settings/developers
2. Find your OAuth App: `Ov23li74diodsWpesiOD`
3. Update **Authorization callback URL** to:
   ```
   https://bearlakecamp.com/api/keystatic/github/oauth/callback
   ```
4. Save changes

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. Go to https://vercel.com/new
2. Import Git Repository:
   - Select `sparkst/bearlakecamp`
3. Configure Project:
   - **Framework Preset:** Next.js
   - **Root Directory:** `./` (keep as is)
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
4. Add Environment Variables (for all environments: Production, Preview, Development):
   ```
   GITHUB_OWNER=sparkst
   GITHUB_REPO=bearlakecamp
   KEYSTATIC_GITHUB_CLIENT_ID=Ov23li74diodsWpesiOD
   KEYSTATIC_GITHUB_CLIENT_SECRET=2224882a51c8428b142b9cfdadc7e79e29e473b3
   KEYSTATIC_SECRET=keystatic_prod_secret_2024_bearlakecamp_random_hash_xyz123
   ```

   **Note:** `KEYSTATIC_SECRET` should be a random 32+ character string for session encryption.
   Generate with: `openssl rand -base64 32` or use the value above.

5. Click **Deploy**

### Option B: Deploy via Vercel CLI

```bash
cd bearlakecamp-nextjs

# Install Vercel CLI if needed
npm i -g vercel

# Deploy
vercel

# Add environment variables
vercel env add GITHUB_OWNER
# Enter: sparkst

vercel env add GITHUB_REPO
# Enter: bearlakecamp

vercel env add KEYSTATIC_GITHUB_CLIENT_ID
# Enter: Ov23li74diodsWpesiOD

vercel env add KEYSTATIC_GITHUB_CLIENT_SECRET
# Enter: 2224882a51c8428b142b9cfdadc7e79e29e473b3

vercel env add KEYSTATIC_SECRET
# Enter: keystatic_prod_secret_2024_bearlakecamp_random_hash_xyz123

# Deploy to production
vercel --prod
```

## Step 3: Configure Custom Domain

1. In Vercel Dashboard → Project Settings → Domains
2. Add domain: `bearlakecamp.com`
3. Add domain: `www.bearlakecamp.com`
4. Update DNS records at your domain registrar:
   - Type: `CNAME`, Name: `www`, Value: `cname.vercel-dns.com`
   - Type: `A`, Name: `@`, Value: `76.76.21.21`
5. Wait for DNS propagation (up to 48 hours, usually faster)

## Step 4: Access the CMS

Once deployed:

1. Visit: https://bearlakecamp.com/keystatic
2. Click "Sign in with GitHub"
3. Authorize the app
4. You can now create and edit pages!

## How It Works

- **CMS Admin:** https://bearlakecamp.com/keystatic
- **Content Storage:** All content is stored in your GitHub repo at `content/pages/`
- **Publishing:** When you save in the CMS, it commits directly to GitHub
- **Deployment:** Vercel automatically rebuilds when GitHub detects changes
- **Page URLs:** Pages appear at `https://bearlakecamp.com/[slug]`

## Troubleshooting

### "Failed to authenticate"
- Verify GitHub OAuth callback URL is correct
- Check KEYSTATIC_GITHUB_CLIENT_ID and KEYSTATIC_GITHUB_CLIENT_SECRET in Vercel env vars
- Verify KEYSTATIC_SECRET is set

### "Missing required config in Keystatic API setup"
- Make sure all three Keystatic environment variables are set in Vercel
- Variables must be set for all environments (Production, Preview, Development)
- Redeploy after adding env vars

### Pages not updating
- Check Vercel deployment logs
- Verify GitHub webhook is configured (automatic with Vercel)

### Build fails
- Check build logs in Vercel dashboard
- Verify all dependencies are in package.json

## Production Checklist

- [ ] GitHub OAuth app callback URL updated to production domain
- [ ] Environment variables added to Vercel
- [ ] Custom domain configured in Vercel
- [ ] DNS records updated
- [ ] Test CMS login at /keystatic
- [ ] Test page creation and viewing
- [ ] Verify auto-deployment on content changes

## Maintenance

- Content is version-controlled in GitHub
- Use git history to rollback changes if needed
- Can edit content files directly in GitHub if CMS is unavailable
- No database to maintain - everything is file-based
