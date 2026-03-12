# Keystatic CMS - Domain-Based Modes Explained

**Why different modes?** Keystatic works differently on preview deployments vs. production domains.

---

## Storage Modes by Domain

| Domain Type | Example | Storage Mode | Can Edit? | Requires Auth? |
|-------------|---------|--------------|-----------|----------------|
| **Local Development** | http://localhost:3000 | Local | ✅ Yes | ❌ No |
| **Vercel Preview** | bearlakecamp.vercel.app | Local | ❌ Read-only | ❌ No |
| **Custom Domain** | prelaunch.bearlakecamp.com | GitHub | ✅ Yes | ✅ Yes (GitHub OAuth) |
| **Production** | bearlakecamp.com | GitHub | ✅ Yes | ✅ Yes (GitHub OAuth) |

---

## Mode 1: Local Storage (Development & Previews)

### When It's Used
- Running `npm run dev` locally
- Visiting `bearlakecamp.vercel.app` (Vercel preview deployments)
- Any `*.vercel.app` domain

### How It Works
- Reads content files directly from the repository (`content/pages/`)
- No GitHub authentication required
- **Read-only on deployed sites** - can view content but cannot edit

### What You'll See
**CMS UI Loads:**
- ✅ Can access `/keystatic`
- ✅ Can view collections (Pages)
- ✅ Can view existing pages
- ❌ **Cannot create new pages**
- ❌ **Cannot save edits**

**Why?** Local storage means the CMS reads from files in the repo. On deployed sites, there's no way to write back to those files without GitHub API access.

### Use Cases
- **Development:** Edit content locally, commit to Git
- **Preview/Testing:** View how content will look on production
- **Stakeholder Reviews:** Share `*.vercel.app` URLs for content approval (read-only)

---

## Mode 2: GitHub Storage (Production Domains)

### When It's Used
- Custom domains configured in Vercel:
  - `prelaunch.bearlakecamp.com` (staging)
  - `bearlakecamp.com` (production)

### How It Works
- Connects to GitHub via OAuth
- Reads and writes content through GitHub API
- **Full editing capabilities** - create, edit, delete pages
- Changes are committed directly to your GitHub repository

### What You'll See
**CMS Requires Login:**
1. Visit `/keystatic`
2. Click **"Sign in with GitHub"**
3. Authorize the OAuth app
4. Full CMS access

**Full Functionality:**
- ✅ Can create new pages
- ✅ Can edit existing pages
- ✅ Can delete pages
- ✅ Can upload images
- ✅ Changes auto-commit to GitHub
- ✅ Vercel auto-deploys changes

### Use Cases
- **Content Editing:** Camp staff edits pages directly on prelaunch/production
- **Real-time Updates:** Save in CMS → GitHub commit → Vercel redeploys → Live in 30-60 seconds
- **Team Collaboration:** Multiple editors can work simultaneously (GitHub handles merge conflicts)

---

## Current Errors Explained

### Error: "Unable to load collection"

**What you saw:**
```
Unable to load collection
Unexpected token 'N', "Not Found" is not valid JSON

Console errors:
/api/keystatic/tree:1 Failed to load resource: the server responded with a status of 404 ()
```

**Why it happened:**
You were on `bearlakecamp.vercel.app` (preview deployment), which was trying to use **GitHub storage mode** but:
1. Wasn't on a custom domain
2. Wasn't authenticated with GitHub
3. API routes returned 404 because GitHub mode requires auth

**Fixed by:**
Switching `*.vercel.app` domains to **local storage mode**, which:
- Reads content from files (no API needed)
- Shows content in CMS (read-only)
- No authentication required
- Works for previews and testing

---

## How to Use Each Domain

### Using bearlakecamp.vercel.app (Preview - Read-Only)

**Purpose:** Preview content, test functionality, share with stakeholders

1. Visit https://bearlakecamp.vercel.app/keystatic
2. You'll see the CMS UI with existing content
3. You can **view** pages but **cannot edit**
4. Changes must be made locally or on custom domain

**When to use:**
- "Does this look right?" reviews
- Testing before production
- Sharing with people who shouldn't edit

### Using prelaunch.bearlakecamp.com (Staging - Full Edit)

**Purpose:** Test content editing in production-like environment

**Setup Required (One-Time):**
1. Add DNS record: `prelaunch` → `cname.vercel-dns.com`
2. Add domain in Vercel dashboard
3. Update GitHub OAuth callback URL
4. Wait for DNS + SSL (10-30 minutes)

**Usage:**
1. Visit https://prelaunch.bearlakecamp.com/keystatic
2. Click "Sign in with GitHub"
3. Authorize OAuth app
4. Full CMS access - create, edit, delete pages
5. Changes commit to GitHub automatically
6. Vercel redeploys in 30-60 seconds

**When to use:**
- Testing CMS workflow before production
- Training content editors
- Final content approval before going live

### Using bearlakecamp.com (Production - Full Edit)

**Purpose:** Live website content management

**Setup:** Same as prelaunch, but with production domain

**When to use:**
- After prelaunch testing is complete
- Ongoing content updates
- Regular camp updates (events, photos, announcements)

---

## Quick Reference

### "I want to edit content locally"

```bash
cd bearlakecamp-nextjs
npm run dev
# Visit http://localhost:3000/keystatic
# Edit files in content/pages/
# Commit to Git when done
```

### "I want to preview content on Vercel"

1. Push changes to GitHub
2. Visit https://bearlakecamp.vercel.app/keystatic
3. View content (read-only)
4. Share URL with stakeholders

### "I want to edit content on prelaunch"

1. Ensure prelaunch.bearlakecamp.com is configured
2. Visit https://prelaunch.bearlakecamp.com/keystatic
3. Sign in with GitHub
4. Edit content
5. Changes auto-deploy

### "I want to edit content on production"

1. Ensure bearlakecamp.com is configured
2. Visit https://bearlakecamp.com/keystatic
3. Sign in with GitHub
4. Edit content
5. Changes go live in 30-60 seconds

---

## Technical Details

### Storage Mode Logic (keystatic.config.ts)

```typescript
function getStorageConfig() {
  // 1. Development: Always local
  if (process.env.NODE_ENV === 'development') {
    return { kind: 'local' };
  }

  // 2. Check if on custom domain (not *.vercel.app)
  const vercelUrl = process.env.VERCEL_URL || '';
  const isCustomDomain = vercelUrl && !vercelUrl.includes('.vercel.app');

  // 3. Custom domain with OAuth = GitHub storage
  if (isCustomDomain && process.env.KEYSTATIC_GITHUB_CLIENT_ID) {
    return {
      kind: 'github',
      repo: { owner: 'sparkst', name: 'bearlakecamp' }
    };
  }

  // 4. Default: Local storage (preview deployments)
  return { kind: 'local' };
}
```

### Environment Detection

| Environment Variable | Local Dev | Vercel Preview | Custom Domain |
|---------------------|-----------|----------------|---------------|
| `NODE_ENV` | development | production | production |
| `VERCEL_URL` | undefined | bearlakecamp.vercel.app | prelaunch.bearlakecamp.com |
| `KEYSTATIC_GITHUB_CLIENT_ID` | ❌ Not set | ✅ Set | ✅ Set |

---

## Troubleshooting

### "Cannot create pages on bearlakecamp.vercel.app"

**Expected behavior.** Preview deployments are read-only. Use custom domain for editing.

**Solution:**
- Edit locally (`npm run dev`)
- OR use prelaunch.bearlakecamp.com (after setup)

### "404 errors in console on *.vercel.app"

**Fixed!** Updated to use local storage mode on preview deployments.

**If still seeing:**
1. Clear browser cache (Cmd+Shift+R)
2. Wait for latest deployment (check `npx vercel ls`)
3. Verify on latest URL

### "Sign in with GitHub doesn't work"

**Check:**
1. Are you on a custom domain? (GitHub auth only works on custom domains)
2. Is OAuth callback URL correct?
   - https://prelaunch.bearlakecamp.com/api/keystatic/github/oauth/callback
3. Did you authorize the app in GitHub settings?

**Verify OAuth Setup:**
- Go to https://github.com/settings/applications
- Find "Bear Lake Camp CMS"
- Check callback URLs include your domain
- Verify you granted access to `sparkst/bearlakecamp` repo

### "Changes don't appear after saving"

**On custom domains:**
1. Save in CMS
2. Check GitHub for new commit (https://github.com/sparkst/bearlakecamp/commits/main)
3. Wait 30-60 seconds for Vercel deployment
4. Refresh page

**On *.vercel.app:**
- Changes won't save (read-only mode)
- Use custom domain or local development

---

## Summary

**Three Ways to Work with Content:**

| Method | Where | Can Edit? | Best For |
|--------|-------|-----------|----------|
| **Local Development** | localhost:3000 | ✅ Yes | Development, major changes |
| **Vercel Preview** | *.vercel.app | ❌ No | Previews, testing, stakeholder review |
| **Custom Domain** | prelaunch/production | ✅ Yes | Content editing by camp staff |

**Current Status:**
- ✅ bearlakecamp.vercel.app - Working (read-only)
- ✅ prelaunch.bearlakecamp.com - Ready (needs DNS configured)
- ⏳ bearlakecamp.com - Pending (future production)

**Next Steps:**
1. Configure prelaunch.bearlakecamp.com DNS
2. Test CMS editing on prelaunch
3. Verify full workflow works
4. Plan production launch
