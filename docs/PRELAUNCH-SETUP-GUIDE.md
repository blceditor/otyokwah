# Bear Lake Camp - Prelaunch Setup Guide

**Domain:** prelaunch.bearlakecamp.com
**Purpose:** Staging/testing before production launch
**Target:** 100% automated setup with complete documentation

---

## Complete URL Reference

Once setup is complete, these are all your URLs:

### Production Vercel Deployment
- **Main Site:** https://bearlakecamp.vercel.app
- **CMS Admin:** https://bearlakecamp.vercel.app/keystatic
- **Example Page:** https://bearlakecamp.vercel.app/hello-world

### Prelaunch Staging Domain (After DNS Setup)
- **Main Site:** https://prelaunch.bearlakecamp.com
- **CMS Admin:** https://prelaunch.bearlakecamp.com/keystatic
- **Example Page:** https://prelaunch.bearlakecamp.com/hello-world

### Development/Testing
- **Local Dev:** http://localhost:3000
- **Local CMS:** http://localhost:3000/keystatic

### Current Production (Old Cloudflare Pages)
- **Current Site:** https://bearlakecamp.pages.dev
- **Staging:** https://staging.bearlakecamp.com
- **Production:** https://bearlakecamp.com (DO NOT TOUCH YET)

---

## Part 1: GitHub OAuth Application Setup

### Overview
Keystatic CMS uses GitHub OAuth to authenticate editors. This means:
- Editors click "Sign in with GitHub"
- GitHub asks "Allow Keystatic to access bearlakecamp repo?"
- Once authorized, editors can create/edit content
- Changes are committed directly to your GitHub repository

### Step 1: Create GitHub OAuth App

1. **Go to GitHub Settings**
   - URL: https://github.com/settings/developers
   - Click **"OAuth Apps"** in left sidebar
   - Click **"New OAuth App"** button

2. **Fill Out Application Form**

   ```
   Application name: Bear Lake Camp CMS (Prelaunch)

   Homepage URL: https://prelaunch.bearlakecamp.com

   Application description: Keystatic CMS for Bear Lake Camp website editing (staging environment)

   Authorization callback URL: https://prelaunch.bearlakecamp.com/api/keystatic/github/oauth/callback
   ```

   **Important Notes:**
   - Callback URL MUST match exactly (including `/api/keystatic/github/oauth/callback`)
   - You can add multiple callback URLs by creating separate apps for each environment
   - Keep the "Enable Device Flow" checkbox UNCHECKED

3. **Save and Get Credentials**
   - Click **"Register application"**
   - You'll see your **Client ID** (starts with `Ov23...`)
   - Click **"Generate a new client secret"**
   - Copy the **Client Secret** IMMEDIATELY (you can't see it again)

4. **Store Credentials Securely**
   ```
   KEYSTATIC_GITHUB_CLIENT_ID=Ov23li... (20 characters)
   KEYSTATIC_GITHUB_CLIENT_SECRET=40-character-hex-string
   ```

### Step 2: Configure Multiple Environments (Optional)

If you want separate OAuth apps for each environment:

#### Local Development OAuth App
```
Application name: Bear Lake Camp CMS (Local Dev)
Homepage URL: http://localhost:3000
Authorization callback URL: http://localhost:3000/api/keystatic/github/oauth/callback
```

#### Prelaunch/Staging OAuth App
```
Application name: Bear Lake Camp CMS (Prelaunch)
Homepage URL: https://prelaunch.bearlakecamp.com
Authorization callback URL: https://prelaunch.bearlakecamp.com/api/keystatic/github/oauth/callback
```

#### Production OAuth App (Future)
```
Application name: Bear Lake Camp CMS (Production)
Homepage URL: https://bearlakecamp.com
Authorization callback URL: https://bearlakecamp.com/api/keystatic/github/oauth/callback
```

**OR** you can use ONE OAuth app with multiple callback URLs:

1. In your OAuth app settings, click **"Add callback URL"**
2. Add all three:
   - `http://localhost:3000/api/keystatic/github/oauth/callback`
   - `https://prelaunch.bearlakecamp.com/api/keystatic/github/oauth/callback`
   - `https://bearlakecamp.com/api/keystatic/github/oauth/callback`

---

## Part 2: Vercel Configuration

### Step 1: Add Prelaunch Domain to Vercel

#### Option A: Via Vercel Dashboard (Recommended - Visual)

1. Go to https://vercel.com/travis-projects-3a622477/bearlakecamp
2. Click **Settings** → **Domains**
3. Click **"Add"**
4. Enter: `prelaunch.bearlakecamp.com`
5. Click **"Add"**

Vercel will show you the DNS records to configure (see Part 3 below).

#### Option B: Via Vercel CLI (Automated)

```bash
cd /path/to/bearlakecamp-nextjs
npx vercel domains add prelaunch.bearlakecamp.com
```

### Step 2: Update Environment Variables

You already have these set, but verify they're correct:

```bash
# Check current env vars
npx vercel env ls

# Should show:
# KEYSTATIC_GITHUB_CLIENT_ID
# KEYSTATIC_GITHUB_CLIENT_SECRET
# KEYSTATIC_SECRET
# GITHUB_OWNER
# GITHUB_REPO
```

If you created separate OAuth apps for different environments, update the Vercel env vars to use the prelaunch credentials.

---

## Part 3: DNS Configuration

### Overview
You need to point `prelaunch.bearlakecamp.com` to Vercel's servers.

### DNS Records to Add

Go to your DNS provider (likely Cloudflare, GoDaddy, or Namecheap) and add:

#### Method 1: CNAME Record (Recommended)

```
Type: CNAME
Name: prelaunch
Value: cname.vercel-dns.com
TTL: Auto or 3600
Proxy Status: DNS only (if using Cloudflare - disable orange cloud)
```

**Why CNAME?**
- Easier to manage
- Automatic SSL certificate
- Vercel handles IP changes
- Recommended by Vercel

#### Method 2: A Record (Alternative)

```
Type: A
Name: prelaunch
Value: 76.76.21.21
TTL: Auto or 3600
```

**Note:** A records require manual updates if Vercel changes IPs.

### Cloudflare-Specific Steps (If Using Cloudflare DNS)

1. Log in to https://dash.cloudflare.com
2. Select your domain: `bearlakecamp.com`
3. Click **DNS** in the left sidebar
4. Click **"Add record"**
5. Fill in:
   ```
   Type: CNAME
   Name: prelaunch
   Target: cname.vercel-dns.com
   Proxy status: DNS only (gray cloud, NOT orange)
   TTL: Auto
   ```
6. Click **"Save"**

**Critical:** Make sure **Proxy status is "DNS only"** (gray cloud icon). Orange cloud will break SSL certificate verification.

### Verification

After adding DNS records:

1. Wait 5-15 minutes for DNS propagation
2. Run: `dig prelaunch.bearlakecamp.com` or `nslookup prelaunch.bearlakecamp.com`
3. Should show: `cname.vercel-dns.com` or `76.76.21.21`

Or check online:
- https://dnschecker.org/#CNAME/prelaunch.bearlakecamp.com

---

## Part 4: SSL Certificate Setup (Automatic)

Vercel automatically provisions SSL certificates via Let's Encrypt.

### Expected Timeline

1. **Add domain to Vercel** → Immediate
2. **Configure DNS records** → 5-15 minutes
3. **SSL certificate issued** → 5-30 minutes after DNS propagates
4. **HTTPS available** → Immediately after certificate issued

### How to Check SSL Status

#### Via Vercel Dashboard
1. Go to Project → Settings → Domains
2. Find `prelaunch.bearlakecamp.com`
3. Status will show:
   - **"Invalid Configuration"** → DNS not configured yet
   - **"Valid Configuration"** → DNS working, waiting for SSL
   - **"Ready"** → ✅ SSL certificate active, site live

#### Via Command Line
```bash
# Check SSL certificate
curl -I https://prelaunch.bearlakecamp.com

# Should return: HTTP/2 200 (or 301/302 redirect)
```

---

## Part 5: Complete Setup Checklist

Use this checklist to track your progress:

### GitHub OAuth Setup
- [ ] Create GitHub OAuth app at https://github.com/settings/developers
- [ ] Set Homepage URL: `https://prelaunch.bearlakecamp.com`
- [ ] Set Callback URL: `https://prelaunch.bearlakecamp.com/api/keystatic/github/oauth/callback`
- [ ] Copy Client ID (starts with `Ov23...`)
- [ ] Generate and copy Client Secret
- [ ] Store credentials securely

### Vercel Configuration
- [ ] Add `prelaunch.bearlakecamp.com` domain in Vercel dashboard
- [ ] Verify environment variables are set (7 total)
- [ ] Note DNS records provided by Vercel

### DNS Setup
- [ ] Add CNAME record: `prelaunch` → `cname.vercel-dns.com`
- [ ] Set Proxy status to "DNS only" (if Cloudflare)
- [ ] Wait 5-15 minutes for DNS propagation
- [ ] Verify DNS with `dig prelaunch.bearlakecamp.com`

### SSL & Verification
- [ ] Wait for Vercel SSL certificate (5-30 minutes)
- [ ] Check Vercel dashboard shows "Ready"
- [ ] Visit `https://prelaunch.bearlakecamp.com` (should load)
- [ ] Test CMS login at `https://prelaunch.bearlakecamp.com/keystatic`

### Testing
- [ ] Login to Keystatic CMS
- [ ] Edit the hello-world page
- [ ] Verify changes appear on site
- [ ] Check GitHub commits show your edits
- [ ] Test creating a new page

---

## Part 6: Troubleshooting

### Issue: "DNS Record Not Found"

**Symptoms:**
- `dig prelaunch.bearlakecamp.com` returns nothing
- Site shows "DNS_PROBE_FINISHED_NXDOMAIN"

**Solutions:**
1. Wait 15-30 minutes (DNS propagation takes time)
2. Clear your DNS cache: `sudo dscacheutil -flushcache` (Mac)
3. Try a different DNS server: `dig @8.8.8.8 prelaunch.bearlakecamp.com`
4. Verify you added the record to the ROOT domain (`bearlakecamp.com`), not a subdomain

### Issue: "SSL Certificate Error"

**Symptoms:**
- Browser shows "Your connection is not private"
- Certificate is for wrong domain

**Solutions:**
1. Wait 30-60 minutes (certificate provisioning takes time)
2. If using Cloudflare, ensure Proxy Status is "DNS only" (gray cloud)
3. Check Vercel dashboard → Domains → shows "Ready"
4. Try incognito/private browsing (clears browser cache)

### Issue: "Missing Client ID" in Keystatic

**Symptoms:**
- CMS shows "Missing client ID" error
- GitHub login button doesn't work

**Solutions:**
1. Verify GitHub OAuth app callback URL EXACTLY matches:
   `https://prelaunch.bearlakecamp.com/api/keystatic/github/oauth/callback`
2. Check Vercel environment variables include:
   - `KEYSTATIC_GITHUB_CLIENT_ID`
   - `KEYSTATIC_GITHUB_CLIENT_SECRET`
   - `KEYSTATIC_SECRET`
3. Redeploy after changing env vars: `npx vercel --prod`

### Issue: "Not Authorized" After GitHub Login

**Symptoms:**
- GitHub OAuth succeeds
- Redirected back to site
- Shows "not authorized" or "access denied"

**Solutions:**
1. Check you're logged into GitHub as `sparkst` (the repo owner)
2. Verify repo is `sparkst/bearlakecamp` (not a fork)
3. Check GitHub app permissions granted access to `sparkst/bearlakecamp`
4. Try revoking access and re-authorizing:
   - Go to https://github.com/settings/applications
   - Find "Bear Lake Camp CMS"
   - Click "Revoke access"
   - Try logging in again

### Issue: Site Shows Old Version

**Symptoms:**
- Made changes but don't see them on prelaunch site
- Still seeing old content

**Solutions:**
1. Check Git commit was successful (look at https://github.com/sparkst/bearlakecamp/commits/main)
2. Check Vercel deployment succeeded (https://vercel.com/travis-projects-3a622477/bearlakecamp)
3. Clear browser cache (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
4. Wait 30-60 seconds for deployment to complete

---

## Part 7: Complete Automated Setup Script

Save this as `setup-prelaunch.sh` and run it:

```bash
#!/bin/bash
set -e

echo "🚀 Bear Lake Camp - Prelaunch Setup Automation"
echo "=============================================="
echo ""

# Check if we're in the right directory
if [ ! -f "keystatic.config.ts" ]; then
  echo "❌ Error: Run this from the bearlakecamp-nextjs directory"
  exit 1
fi

# Step 1: Verify Vercel authentication
echo "📋 Step 1: Verifying Vercel CLI authentication..."
npx vercel whoami || {
  echo "❌ Not logged into Vercel. Run: npx vercel login"
  exit 1
}
echo "✅ Vercel authenticated"
echo ""

# Step 2: Link to project (if not already linked)
echo "📋 Step 2: Linking to Vercel project..."
if [ ! -d ".vercel" ]; then
  npx vercel link --yes --project bearlakecamp
fi
echo "✅ Project linked"
echo ""

# Step 3: Check environment variables
echo "📋 Step 3: Verifying environment variables..."
echo "Required variables:"
npx vercel env ls | grep -E "(KEYSTATIC_GITHUB_CLIENT_ID|KEYSTATIC_GITHUB_CLIENT_SECRET|KEYSTATIC_SECRET|GITHUB_OWNER|GITHUB_REPO)"
echo "✅ Environment variables configured"
echo ""

# Step 4: Add prelaunch domain
echo "📋 Step 4: Adding prelaunch.bearlakecamp.com domain..."
echo ""
echo "⚠️  MANUAL STEP REQUIRED:"
echo "1. Go to: https://vercel.com/travis-projects-3a622477/bearlakecamp/settings/domains"
echo "2. Click 'Add'"
echo "3. Enter: prelaunch.bearlakecamp.com"
echo "4. Click 'Add'"
echo ""
read -p "Press ENTER when domain is added in Vercel dashboard..."
echo ""

# Step 5: DNS instructions
echo "📋 Step 5: DNS Configuration"
echo "=============================================="
echo ""
echo "Add this DNS record in Cloudflare (or your DNS provider):"
echo ""
echo "  Type: CNAME"
echo "  Name: prelaunch"
echo "  Value: cname.vercel-dns.com"
echo "  TTL: Auto"
echo "  Proxy Status: DNS only (gray cloud)"
echo ""
echo "OR use A record:"
echo ""
echo "  Type: A"
echo "  Name: prelaunch"
echo "  Value: 76.76.21.21"
echo "  TTL: Auto"
echo ""
read -p "Press ENTER when DNS record is added..."
echo ""

# Step 6: Wait for DNS propagation
echo "📋 Step 6: Waiting for DNS propagation..."
echo "Checking DNS every 15 seconds (max 5 minutes)..."
echo ""

for i in {1..20}; do
  if dig +short prelaunch.bearlakecamp.com | grep -q "76.76.21.21\|cname.vercel-dns.com"; then
    echo "✅ DNS propagated successfully!"
    break
  else
    echo "⏳ Attempt $i/20: DNS not ready yet..."
    sleep 15
  fi

  if [ $i -eq 20 ]; then
    echo "⚠️  DNS not propagated after 5 minutes. Check your DNS settings."
    echo "You can continue manually by visiting https://prelaunch.bearlakecamp.com in 15-30 minutes"
  fi
done
echo ""

# Step 7: GitHub OAuth instructions
echo "📋 Step 7: GitHub OAuth Application Setup"
echo "=============================================="
echo ""
echo "⚠️  MANUAL STEP REQUIRED:"
echo ""
echo "1. Go to: https://github.com/settings/developers"
echo "2. Click 'OAuth Apps' → 'New OAuth App'"
echo "3. Fill in:"
echo ""
echo "   Application name: Bear Lake Camp CMS (Prelaunch)"
echo "   Homepage URL: https://prelaunch.bearlakecamp.com"
echo "   Authorization callback URL: https://prelaunch.bearlakecamp.com/api/keystatic/github/oauth/callback"
echo ""
echo "4. Click 'Register application'"
echo "5. Copy the Client ID (starts with Ov23...)"
echo "6. Click 'Generate a new client secret'"
echo "7. Copy the Client Secret"
echo ""
read -p "Press ENTER when OAuth app is created..."
echo ""

# Step 8: Update environment variables
echo "📋 Step 8: Update Environment Variables (if needed)"
echo "=============================================="
echo ""
echo "If you created a NEW OAuth app for prelaunch, update Vercel env vars:"
echo ""
echo "  npx vercel env rm KEYSTATIC_GITHUB_CLIENT_ID"
echo "  npx vercel env add KEYSTATIC_GITHUB_CLIENT_ID"
echo "  # Enter your new Client ID from GitHub"
echo ""
echo "  npx vercel env rm KEYSTATIC_GITHUB_CLIENT_SECRET"
echo "  npx vercel env add KEYSTATIC_GITHUB_CLIENT_SECRET"
echo "  # Enter your new Client Secret from GitHub"
echo ""
echo "If you're using the SAME OAuth app and just added a new callback URL,"
echo "you can skip this step."
echo ""
read -p "Press ENTER to continue..."
echo ""

# Step 9: Trigger deployment
echo "📋 Step 9: Triggering production deployment..."
npx vercel --prod
echo "✅ Deployment triggered"
echo ""

# Step 10: Final verification
echo "📋 Step 10: Final Verification"
echo "=============================================="
echo ""
echo "Wait 2-3 minutes for deployment and SSL certificate..."
echo ""
sleep 120
echo ""
echo "Testing site..."
HTTP_CODE=$(curl -o /dev/null -s -w "%{http_code}" https://prelaunch.bearlakecamp.com || echo "000")

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
  echo "✅ Site is live!"
else
  echo "⚠️  Site returned HTTP $HTTP_CODE (may need more time for SSL)"
fi
echo ""

# Summary
echo "🎉 Setup Complete!"
echo "=============================================="
echo ""
echo "Your URLs:"
echo "  Main Site: https://prelaunch.bearlakecamp.com"
echo "  CMS Admin: https://prelaunch.bearlakecamp.com/keystatic"
echo "  Example: https://prelaunch.bearlakecamp.com/hello-world"
echo ""
echo "Next Steps:"
echo "1. Visit https://prelaunch.bearlakecamp.com/keystatic"
echo "2. Click 'Sign in with GitHub'"
echo "3. Authorize the app"
echo "4. Start editing content!"
echo ""
echo "Troubleshooting:"
echo "- If login fails, verify OAuth callback URL in GitHub app settings"
echo "- If SSL error, wait 30 more minutes for certificate"
echo "- If DNS error, wait 30 more minutes for propagation"
echo ""
echo "Full docs: See PRELAUNCH-SETUP-GUIDE.md"
echo ""
```

Make it executable and run:
```bash
chmod +x setup-prelaunch.sh
./setup-prelaunch.sh
```

---

## Part 8: Post-Launch Verification Checklist

After everything is set up, verify it works:

### Basic Site Checks
- [ ] https://prelaunch.bearlakecamp.com loads without errors
- [ ] SSL certificate shows (padlock icon in browser)
- [ ] Page loads in under 2 seconds
- [ ] Images load correctly
- [ ] No console errors (F12 → Console tab)

### CMS Checks
- [ ] https://prelaunch.bearlakecamp.com/keystatic loads
- [ ] "Sign in with GitHub" button appears
- [ ] Click button → redirects to GitHub
- [ ] GitHub asks for authorization
- [ ] After authorizing → redirects back to Keystatic
- [ ] CMS dashboard appears (shows collections)
- [ ] Can click "Pages" → see hello-world
- [ ] Can edit hello-world page
- [ ] Save button works
- [ ] Check GitHub repo shows new commit

### Content Checks
- [ ] https://prelaunch.bearlakecamp.com/hello-world shows page
- [ ] Hero image displays
- [ ] Hero tagline displays
- [ ] Body content displays
- [ ] Edit in CMS → refresh page → changes appear

### Performance Checks
- [ ] Run Google PageSpeed: https://pagespeed.web.dev/
- [ ] Score should be 90-100
- [ ] Run GTmetrix: https://gtmetrix.com/
- [ ] Grade should be A or B

---

## Part 9: Future Production Launch

When ready to go live with bearlakecamp.com:

1. **Add Production Domain**
   - In Vercel: Add `bearlakecamp.com` and `www.bearlakecamp.com`

2. **Update DNS**
   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

3. **Update GitHub OAuth**
   - Add callback: `https://bearlakecamp.com/api/keystatic/github/oauth/callback`

4. **Test Everything**
   - Same checklist as Part 8, but with bearlakecamp.com URLs

5. **Sunset Old Site**
   - Archive WordPress/Cloudflare Pages
   - Update any external links
   - Set up redirects if needed

---

## Part 10: Emergency Rollback Plan

If something goes wrong:

### Quick Rollback (Keep Old Site Running)
1. DON'T change DNS for bearlakecamp.com (stays on Cloudflare Pages)
2. Fix issues on prelaunch.bearlakecamp.com
3. Test thoroughly
4. Only switch production DNS when 100% confident

### Revert Prelaunch Domain
1. Remove DNS record for `prelaunch` subdomain
2. Remove domain from Vercel dashboard
3. Site goes offline within 5-15 minutes

### Full Disaster Recovery
- Your code is in GitHub: https://github.com/sparkst/bearlakecamp
- Your content is in GitHub: https://github.com/sparkst/bearlakecamp/tree/main/content
- Your Vercel project can be redeployed anytime
- No data loss - everything version controlled

---

## Support & Resources

### Documentation
- Keystatic Docs: https://keystatic.com/docs
- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs

### Your Repositories
- Code: https://github.com/sparkst/bearlakecamp
- Vercel Project: https://vercel.com/travis-projects-3a622477/bearlakecamp

### Quick Commands Reference
```bash
# Check Vercel auth
npx vercel whoami

# List deployments
npx vercel ls

# Check domains
npx vercel domains ls

# Check environment variables
npx vercel env ls

# Pull latest env vars to local
npx vercel env pull .env.local

# Deploy to production
npx vercel --prod

# Check DNS
dig prelaunch.bearlakecamp.com

# Test SSL
curl -I https://prelaunch.bearlakecamp.com

# View build logs
npx vercel logs https://bearlakecamp-xxx.vercel.app
```

---

## Estimated Timeline

| Task | Time Required |
|------|---------------|
| GitHub OAuth setup | 5 minutes |
| Vercel domain configuration | 2 minutes |
| DNS record creation | 3 minutes |
| DNS propagation wait | 5-30 minutes |
| SSL certificate issuance | 5-30 minutes |
| Testing and verification | 10 minutes |
| **Total** | **30 minutes - 1.5 hours** |

Most of the time is waiting for DNS/SSL. Actual work is ~20 minutes.

---

## Final Notes

- **DO NOT** change DNS for bearlakecamp.com yet
- Test everything on prelaunch.bearlakecamp.com first
- Once confident, production launch takes same steps
- You own everything - no vendor lock-in
- Can leave us anytime and keep your site running
- All accounts (GitHub, Vercel, Cloudflare) in your name

**Questions?** Reference this guide or the main strategic documents in:
- `BEAR-LAKE-CAMP-ARCHITECTURE-STRATEGY.md`
- `IMPLEMENTATION-CHECKLIST.md`
- `EXECUTIVE-DECISION-SUMMARY.md`
