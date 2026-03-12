# Quick Start: Prelaunch Setup (5 Minutes)

**Goal:** Get prelaunch.bearlakecamp.com live with working CMS

---

## Your URLs (After Setup)

| Environment | Main Site | CMS Admin | Example Page |
|------------|-----------|-----------|--------------|
| **Prelaunch** | https://prelaunch.bearlakecamp.com | https://prelaunch.bearlakecamp.com/keystatic | https://prelaunch.bearlakecamp.com/hello-world |
| **Current Vercel** | https://bearlakecamp.vercel.app | https://bearlakecamp.vercel.app/keystatic | https://bearlakecamp.vercel.app/hello-world |
| **Local Dev** | http://localhost:3000 | http://localhost:3000/keystatic | http://localhost:3000/hello-world |

---

## Step 1: DNS Records (3 minutes)

Go to your DNS provider (Cloudflare, GoDaddy, etc.) and add:

### Recommended: CNAME Record
```
Type: CNAME
Name: prelaunch
Value: cname.vercel-dns.com
TTL: Auto
Proxy: DNS only (gray cloud if Cloudflare)
```

### Alternative: A Record
```
Type: A
Name: prelaunch
Value: 76.76.21.21
TTL: Auto
```

**Verify:** `dig prelaunch.bearlakecamp.com` (wait 5-15 min)

---

## Step 2: Add Domain to Vercel (2 minutes)

### Via Dashboard (Easier)
1. Go to https://vercel.com/travis-projects-3a622477/bearlakecamp/settings/domains
2. Click **"Add"**
3. Enter: `prelaunch.bearlakecamp.com`
4. Click **"Add"**

### Via CLI (Automated)
```bash
cd bearlakecamp-nextjs
npx vercel domains add prelaunch.bearlakecamp.com
```

---

## Step 3: GitHub OAuth Setup (5 minutes)

### Option A: Add Callback to Existing App (Easiest)

Your existing OAuth app: https://github.com/settings/applications/2584663

1. Click **"Update application"**
2. Find **"Authorization callback URLs"** section
3. Click **"Add callback URL"**
4. Enter: `https://prelaunch.bearlakecamp.com/api/keystatic/github/oauth/callback`
5. Click **"Update application"**

**Done!** Your existing Client ID/Secret work for prelaunch too.

### Option B: Create New OAuth App (Separate)

1. Go to https://github.com/settings/developers
2. Click **"New OAuth App"**
3. Fill in:
   ```
   Name: Bear Lake Camp CMS (Prelaunch)
   Homepage: https://prelaunch.bearlakecamp.com
   Callback: https://prelaunch.bearlakecamp.com/api/keystatic/github/oauth/callback
   ```
4. Click **"Register application"**
5. Copy Client ID and generate/copy Client Secret
6. Update Vercel env vars (see below)

### If You Created New OAuth App:
```bash
# Update Vercel environment variables
npx vercel env rm KEYSTATIC_GITHUB_CLIENT_ID
npx vercel env add KEYSTATIC_GITHUB_CLIENT_ID
# Paste new Client ID

npx vercel env rm KEYSTATIC_GITHUB_CLIENT_SECRET
npx vercel env add KEYSTATIC_GITHUB_CLIENT_SECRET
# Paste new Client Secret

# Redeploy
npx vercel --prod
```

---

## Step 4: Wait & Test (10-30 minutes)

### DNS Propagation (5-15 min)
```bash
dig prelaunch.bearlakecamp.com
# Should show: cname.vercel-dns.com or 76.76.21.21
```

### SSL Certificate (5-30 min)
Check Vercel dashboard:
- **Invalid** → DNS not ready
- **Valid** → DNS working, SSL pending
- **Ready** → ✅ Everything live

### Test Site
1. Visit https://prelaunch.bearlakecamp.com
2. Should load without SSL errors
3. Visit https://prelaunch.bearlakecamp.com/keystatic
4. Click "Sign in with GitHub"
5. Authorize app
6. Edit hello-world page
7. Save and view changes

---

## Complete Setup Summary

### What's Already Done ✅
- Vercel project deployed
- Environment variables set
- GitHub repo connected
- Automatic deployments configured

### What You Need to Do 🔧
1. ✅ Add DNS record for prelaunch subdomain
2. ✅ Add domain in Vercel dashboard
3. ✅ Update GitHub OAuth callback URL
4. ⏳ Wait for DNS + SSL (10-30 min)
5. ✅ Test CMS login and editing

### Troubleshooting

**DNS not working?**
- Wait 15-30 minutes
- Clear DNS cache: `sudo dscacheutil -flushcache`
- Check with: `dig @8.8.8.8 prelaunch.bearlakecamp.com`

**SSL error?**
- Wait 30-60 minutes
- If using Cloudflare, ensure "DNS only" mode (gray cloud)
- Check Vercel dashboard shows "Ready"

**CMS login fails?**
- Verify callback URL exactly matches:
  `https://prelaunch.bearlakecamp.com/api/keystatic/github/oauth/callback`
- Check you're logged into GitHub as `sparkst`
- Try revoking and re-authorizing at https://github.com/settings/applications

---

## Next Steps

Once prelaunch.bearlakecamp.com is working:

1. **Test thoroughly** - edit pages, create content, verify changes
2. **Get stakeholder approval** - show to team/board
3. **Plan production launch** - same steps but for bearlakecamp.com
4. **Document any issues** - track what needs fixing before prod

---

## Full Documentation

For detailed step-by-step instructions, see:
- `PRELAUNCH-SETUP-GUIDE.md` - Complete guide
- `BEAR-LAKE-CAMP-ARCHITECTURE-STRATEGY.md` - Strategic overview
- `IMPLEMENTATION-CHECKLIST.md` - Task-by-task checklist
