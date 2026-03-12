# Consolidation Plan: Clean Up & Fix Deployment
**Date**: 2025-11-14
**Goal**: Establish single source of truth for bearlakecamp.com deployment
**Outcome**: Working Keystatic CMS on prelaunch.bearlakecamp.com

---

## Executive Summary

**Current Situation**: Messy deployment with unclear configuration
**Target State**: One Vercel project, one GitHub App, clear domain routing
**Timeline**: 30-60 minutes
**Risk**: Low (all changes reversible)

---

## Phase 1: Discovery & Inventory (15 min)

### 1.1: Enumerate All Vercel Projects
**Why**: User mentioned "3 Vercel projects" but we only see 1. Need full inventory.

```bash
cd "/Users/travis/Library/CloudStorage/GoogleDrive-travis@sparkry.com/My Drive/dev/blacklinewebsite/requirements/content-hosting/bearlakecamp-nextjs"

# List all projects
npx vercel projects ls > vercel-projects-inventory.txt

# Show output
cat vercel-projects-inventory.txt
```

**Expected Output**:
```
Project Name              Framework    Latest Production URL
bearlakecamp             Next.js      https://bearlakecamp-nextjs.vercel.app
bearlakecamp-tina-backend ?           ?
bearlakecamp-preview      ?           ?
```

**Action**: Record ALL project names, frameworks, and purposes.

---

### 1.2: Map Domain Assignments
**Why**: Need to know which project serves `prelaunch.bearlakecamp.com`.

```bash
# List all domains
npx vercel domains ls > vercel-domains-inventory.txt

# Show output
cat vercel-domains-inventory.txt
```

**Expected Output**:
```
Domain                        Project              Added        Verified
bearlakecamp.com             bearlakecamp         2h ago       Yes
prelaunch.bearlakecamp.com   bearlakecamp         2h ago       Yes
```

**Critical Check**: If `prelaunch.bearlakecamp.com` assigned to DIFFERENT project than `bearlakecamp`, this is the root cause.

---

### 1.3: List All GitHub Apps
**Why**: Verify how many GitHub Apps exist and which are in use.

**Manual Steps** (requires GitHub web access):
1. Visit: `https://github.com/settings/apps`
2. List all apps owned by your account
3. For each app, note:
   - App name
   - Client ID
   - Callback URL(s)
   - Installed repositories

**Expected Apps**:
- `bearlakecamp-cms` (Client ID: yIv23li34NGRJ6tYul4RW)

**Possible Legacy Apps** (from earlier attempts):
- TinaCMS-related apps
- Duplicate Keystatic apps

**Action**: Document all apps, mark which to keep/delete.

---

### 1.4: Verify Environment Variables Per Project
**Why**: Ensure environment variables are in the CORRECT Vercel project.

```bash
# Check current project's env vars (already done)
npx vercel env ls > env-vars-bearlakecamp.txt

# If other projects exist, repeat for each:
npx vercel env ls --scope <project-name> > env-vars-<project-name>.txt
```

**Critical Check**: `KEYSTATIC_GITHUB_CLIENT_ID` and related vars should ONLY be in `bearlakecamp` project.

---

## Phase 2: Root Cause Diagnosis (10 min)

### 2.1: Test GitHub OAuth URL Manually
**Fastest way to confirm if callback URL is configured correctly.**

```bash
# Construct OAuth URL
echo "https://github.com/login/oauth/authorize?client_id=yIv23li34NGRJ6tYul4RW&redirect_uri=https://prelaunch.bearlakecamp.com/api/keystatic/github/oauth/callback&scope=repo"
```

**Action**:
1. Copy URL to browser
2. Press Enter

**Expected Outcomes**:
- ✅ **GitHub authorization screen appears** → Callback URL is configured correctly, issue is elsewhere
- ❌ **Error: "redirect_uri mismatch"** → Callback URL NOT configured for prelaunch.bearlakecamp.com (ROOT CAUSE)

---

### 2.2: Check GitHub App Callback URL
**Manual verification** (requires GitHub web access):

1. Visit: `https://github.com/settings/apps/bearlakecamp-cms`
2. Scroll to "Callback URL" field
3. Verify it contains:
   ```
   https://prelaunch.bearlakecamp.com/api/keystatic/github/oauth/callback
   ```

**If MISSING**:
- Click "Edit"
- Add callback URL
- Save
- **Proceed to Phase 4 (Test & Verify)**

**If PRESENT**:
- Callback URL is correct
- **Proceed to 2.3**

---

### 2.3: Verify Production Environment Variables
**Ensure KEYSTATIC_* variables are exposed to production deployments.**

```bash
# Pull production environment variables
npx vercel env pull .env.production --environment production

# Check for required variables
grep -E "KEYSTATIC_GITHUB_CLIENT_ID|KEYSTATIC_GITHUB_CLIENT_SECRET|KEYSTATIC_SECRET" .env.production
```

**Expected Output**:
```
KEYSTATIC_GITHUB_CLIENT_ID="yIv23li34NGRJ6tYul4RW"
KEYSTATIC_GITHUB_CLIENT_SECRET="803489f710f1789bec2d0422ce98c0e7cbc41515"
KEYSTATIC_SECRET="dWDIZ1rtvkSQ7apT2kql05Src6EewV0aUSxP696ohiU="
```

**If ANY MISSING**:
- Variables not exposed to Production environment
- **Proceed to Phase 3 (Fix Configuration)**

**If ALL PRESENT**:
- Environment variables are correct
- **Proceed to 2.4**

---

### 2.4: Add Temporary Logging to Keystatic Config
**Debug storage mode detection logic.**

Edit `keystatic.config.ts`:
```typescript
function getStorageConfig() {
  // Temporary diagnostic logging
  if (typeof window === 'undefined') {  // Server-side only
    console.log('=== KEYSTATIC STORAGE DETECTION ===');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('VERCEL_URL:', process.env.VERCEL_URL);
    console.log('VERCEL_ENV:', process.env.VERCEL_ENV);
    console.log('KEYSTATIC_GITHUB_CLIENT_ID:', process.env.KEYSTATIC_GITHUB_CLIENT_ID ? 'SET' : 'UNSET');
  }

  // Always use local in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Storage mode: local (development)');
    return { kind: 'local' as const };
  }

  // Check if we're on a custom domain (not *.vercel.app)
  const vercelUrl = process.env.VERCEL_URL || '';
  const isCustomDomain = vercelUrl && !vercelUrl.includes('.vercel.app');

  console.log('isCustomDomain:', isCustomDomain, '(vercelUrl:', vercelUrl, ')');

  // Use GitHub storage only for custom domains with proper OAuth setup
  if (isCustomDomain && process.env.KEYSTATIC_GITHUB_CLIENT_ID) {
    console.log('Storage mode: github');
    return {
      kind: 'github' as const,
      repo: {
        owner: process.env.GITHUB_OWNER || 'sparkst',
        name: process.env.GITHUB_REPO || 'bearlakecamp',
      },
    };
  }

  // Default to local storage for preview deployments and builds
  console.log('Storage mode: local (fallback)');
  return { kind: 'local' as const };
}
```

**Deploy and check logs**:
```bash
git add keystatic.config.ts
git commit -m "feat: add diagnostic logging for storage mode detection"
git push

# Wait for deployment (1-2 min)

# Check logs
npx vercel logs prelaunch.bearlakecamp.com --follow
```

**Look for**:
```
=== KEYSTATIC STORAGE DETECTION ===
NODE_ENV: production
VERCEL_URL: prelaunch.bearlakecamp.com
KEYSTATIC_GITHUB_CLIENT_ID: SET
isCustomDomain: true
Storage mode: github  ← CORRECT
```

**OR** (if wrong):
```
=== KEYSTATIC STORAGE DETECTION ===
NODE_ENV: production
VERCEL_URL: bearlakecamp-nextjs-<hash>.vercel.app
KEYSTATIC_GITHUB_CLIENT_ID: SET
isCustomDomain: false  ← PROBLEM
Storage mode: local  ← WRONG
```

**If VERCEL_URL is wrong**:
- Custom domain not setting VERCEL_URL correctly
- **Proceed to Phase 3 (Fix: Force GitHub Mode)**

---

## Phase 3: Fix Configuration (15 min)

### 3.1: Fix GitHub App Callback URL (if needed)
**Only if Phase 2.1 or 2.2 revealed missing callback URL.**

1. Visit: `https://github.com/settings/apps/bearlakecamp-cms`
2. Click "Edit"
3. In "Callback URL" field, ensure it contains:
   ```
   https://prelaunch.bearlakecamp.com/api/keystatic/github/oauth/callback
   ```
4. If multiple URLs needed (for preview deployments):
   ```
   https://prelaunch.bearlakecamp.com/api/keystatic/github/oauth/callback
   https://bearlakecamp-nextjs.vercel.app/api/keystatic/github/oauth/callback
   http://localhost:3000/api/keystatic/github/oauth/callback
   ```
5. Save changes

**Time**: 2 minutes

---

### 3.2: Re-Add Environment Variables to Production (if needed)
**Only if Phase 2.3 revealed missing production variables.**

```bash
# Add each variable to Production environment
npx vercel env add KEYSTATIC_GITHUB_CLIENT_ID production
# Paste value when prompted: yIv23li34NGRJ6tYul4RW

npx vercel env add KEYSTATIC_GITHUB_CLIENT_SECRET production
# Paste value: 803489f710f1789bec2d0422ce98c0e7cbc41515

npx vercel env add KEYSTATIC_SECRET production
# Paste value: dWDIZ1rtvkSQ7apT2kql05Src6EewV0aUSxP696ohiU=

npx vercel env add NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG production
# Paste value: https://github.com/settings/apps/bearlakecamp-cms

# Redeploy to apply new env vars
npx vercel --prod
```

**Time**: 5 minutes

---

### 3.3: Force GitHub Storage Mode (if VERCEL_URL unreliable)
**Only if Phase 2.4 revealed `VERCEL_URL` is wrong for custom domain.**

Edit `keystatic.config.ts`:
```typescript
function getStorageConfig() {
  // Development: Always local
  if (process.env.NODE_ENV === 'development') {
    return { kind: 'local' as const };
  }

  // Production: Use GitHub storage if OAuth configured
  // (Remove VERCEL_URL detection, just check for GitHub credentials)
  if (process.env.KEYSTATIC_GITHUB_CLIENT_ID) {
    return {
      kind: 'github' as const,
      repo: {
        owner: process.env.GITHUB_OWNER || 'sparkst',
        name: process.env.GITHUB_REPO || 'bearlakecamp',
      },
    };
  }

  // Fallback to local (for preview deployments without GitHub OAuth)
  return { kind: 'local' as const };
}
```

**Explanation**: Simplified logic - if GitHub OAuth is configured, use GitHub storage. Removes fragile `VERCEL_URL` detection.

```bash
git add keystatic.config.ts
git commit -m "fix: use GitHub storage for all production deployments"
git push
```

**Time**: 5 minutes

---

### 3.4: Reassign Domain (if routed to wrong project)
**Only if Phase 1.2 revealed domain assigned to different project.**

```bash
# Remove domain from wrong project
npx vercel domains rm prelaunch.bearlakecamp.com --yes

# Switch to correct project directory
cd "/Users/travis/Library/CloudStorage/GoogleDrive-travis@sparkry.com/My Drive/dev/blacklinewebsite/requirements/content-hosting/bearlakecamp-nextjs"

# Add domain to correct project
npx vercel domains add prelaunch.bearlakecamp.com

# Redeploy
npx vercel --prod
```

**Time**: 5 minutes

---

## Phase 4: Test & Verify (10 min)

### 4.1: Test Keystatic Admin Access
```bash
# Open in browser
https://prelaunch.bearlakecamp.com/keystatic
```

**Expected Behavior**:
1. ✅ Keystatic UI loads
2. ✅ "Login with GitHub" button appears OR immediate redirect to GitHub
3. ✅ Click login → GitHub authorization screen appears
4. ✅ Authorize → Redirected back to Keystatic (logged in)

**If ANY step fails**:
- Check browser console for errors
- Check Vercel logs: `npx vercel logs prelaunch.bearlakecamp.com`
- Review diagnostic logs from Phase 2.4

---

### 4.2: Test Content Editing
Once logged in:

1. Navigate to "Pages" collection
2. Click existing page (e.g., "Home")
3. Edit title or content
4. Click "Save"

**Expected Behavior**:
- ✅ Save button shows "Saving..."
- ✅ Success message appears
- ✅ New commit appears in GitHub: `https://github.com/sparkst/bearlakecamp/commits/main`

**If save fails**:
- Check browser console for API errors
- Check Vercel logs for `/api/keystatic` errors
- Verify GitHub App permissions (needs write access to repository contents)

---

### 4.3: Verify Deployment Pipeline
```bash
# Make a trivial change locally
echo "# Test" >> README.md
git add README.md
git commit -m "test: verify deployment pipeline"
git push

# Wait 1-2 minutes for Vercel auto-deploy

# Check deployment status
npx vercel ls
```

**Expected**:
- ✅ New deployment appears in list
- ✅ Status: Ready
- ✅ prelaunch.bearlakecamp.com serves new deployment

---

## Phase 5: Cleanup & Consolidation (10 min)

### 5.1: Delete Unnecessary Vercel Projects
**Only if Phase 1.1 revealed extra projects.**

```bash
# For each unnecessary project:
npx vercel remove <project-name> --yes

# Example:
# npx vercel remove bearlakecamp-tina-backend --yes
# npx vercel remove bearlakecamp-preview --yes
```

**Keep**:
- `bearlakecamp` (production project)

**Delete**:
- Any projects related to earlier TinaCMS attempts
- Any duplicate/test projects

**Time**: 3 minutes per project

---

### 5.2: Delete Unnecessary GitHub Apps
**Only if Phase 1.3 revealed multiple apps.**

1. Visit: `https://github.com/settings/apps`
2. For each app NOT named `bearlakecamp-cms`:
   - Click app name
   - Scroll to "Danger Zone"
   - Click "Delete GitHub App"
   - Confirm deletion

**Keep**:
- `bearlakecamp-cms` (Client ID: yIv23li34NGRJ6tYul4RW)

**Delete**:
- Any TinaCMS-related apps
- Any duplicate Keystatic apps

**Time**: 2 minutes per app

---

### 5.3: Remove Obsolete Environment Variables
**Clean up any variables from earlier attempts.**

```bash
# List all environment variables
npx vercel env ls

# Remove obsolete variables (if any)
# Example: Old GitHub OAuth credentials
npx vercel env rm GITHUB_CLIENT_ID
npx vercel env rm GITHUB_CLIENT_SECRET

# Keep only:
# - KEYSTATIC_GITHUB_CLIENT_ID
# - KEYSTATIC_GITHUB_CLIENT_SECRET
# - KEYSTATIC_SECRET
# - NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG
# - GITHUB_OWNER
# - GITHUB_REPO
```

**Note**: Only remove if you're CERTAIN they're not used. If unsure, leave them.

**Time**: 5 minutes

---

### 5.4: Remove Diagnostic Logging
**Clean up temporary logging added in Phase 2.4.**

Edit `keystatic.config.ts`:
```typescript
function getStorageConfig() {
  // Remove all console.log statements

  // Development: Always local
  if (process.env.NODE_ENV === 'development') {
    return { kind: 'local' as const };
  }

  // Production: Use GitHub storage if OAuth configured
  if (process.env.KEYSTATIC_GITHUB_CLIENT_ID) {
    return {
      kind: 'github' as const,
      repo: {
        owner: process.env.GITHUB_OWNER || 'sparkst',
        name: process.env.GITHUB_REPO || 'bearlakecamp',
      },
    };
  }

  // Fallback to local
  return { kind: 'local' as const };
}
```

```bash
git add keystatic.config.ts
git commit -m "chore: remove diagnostic logging"
git push
```

**Time**: 2 minutes

---

## Phase 6: Documentation (5 min)

### 6.1: Document Final Configuration
Create `DEPLOYMENT-CONFIG.md`:

```markdown
# Deployment Configuration

## Vercel Project
- **Name**: bearlakecamp
- **ID**: prj_pnIfeE7qPLbSzVKrqZKdxVfQ3Fnx
- **Framework**: Next.js 14.2.0
- **Organization**: travis-projects-3a622477

## Domains
- **Production**: prelaunch.bearlakecamp.com
- **Auto-generated**: bearlakecamp-nextjs.vercel.app

## GitHub Repository
- **URL**: https://github.com/sparkst/bearlakecamp
- **Branch**: main
- **Auto-deploy**: Enabled

## GitHub App
- **Name**: bearlakecamp-cms
- **Client ID**: yIv23li34NGRJ6tYul4RW
- **Callback URLs**:
  - https://prelaunch.bearlakecamp.com/api/keystatic/github/oauth/callback
  - https://bearlakecamp-nextjs.vercel.app/api/keystatic/github/oauth/callback
  - http://localhost:3000/api/keystatic/github/oauth/callback

## Environment Variables (Production)
- KEYSTATIC_GITHUB_CLIENT_ID
- KEYSTATIC_GITHUB_CLIENT_SECRET
- KEYSTATIC_SECRET
- NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG
- GITHUB_OWNER (sparkst)
- GITHUB_REPO (bearlakecamp)

## CMS Access
- **Admin URL**: https://prelaunch.bearlakecamp.com/keystatic
- **Authentication**: GitHub OAuth
- **Storage**: GitHub (sparkst/bearlakecamp repository)
```

**Time**: 5 minutes

---

## Success Checklist

After completing all phases, verify:

- [ ] **Single Vercel Project**: Only `bearlakecamp` project exists
- [ ] **Domain Assignment**: `prelaunch.bearlakecamp.com` assigned to `bearlakecamp` project
- [ ] **GitHub App**: Only `bearlakecamp-cms` app exists
- [ ] **Callback URL**: Includes `https://prelaunch.bearlakecamp.com/api/keystatic/github/oauth/callback`
- [ ] **Environment Variables**: All KEYSTATIC_* vars in Production environment
- [ ] **Keystatic Login**: GitHub login works at `https://prelaunch.bearlakecamp.com/keystatic`
- [ ] **Content Editing**: Can save pages and commits appear in GitHub
- [ ] **Deployment Pipeline**: Git push → Auto-deploy → Changes live within 2 min
- [ ] **No Errors**: Vercel logs show no errors
- [ ] **Documentation**: `DEPLOYMENT-CONFIG.md` created

---

## Rollback Plan (If Something Breaks)

### Emergency Rollback to Previous Deployment
```bash
# List recent deployments
npx vercel ls

# Promote previous deployment to production
npx vercel promote <previous-deployment-url> --yes

# Example:
# npx vercel promote bearlakecamp-oak7h95j7-travis-projects-3a622477.vercel.app --yes
```

### Restore Environment Variables
```bash
# If you accidentally deleted variables, restore from .env.local
npx vercel env add KEYSTATIC_GITHUB_CLIENT_ID production
# ... (paste values from .env.local)
```

### Revert Code Changes
```bash
# Revert last commit
git revert HEAD
git push

# Or hard reset to previous commit (destructive)
git reset --hard HEAD~1
git push --force
```

---

## Timeline & Effort

| Phase | Description | Time | Risk |
|-------|-------------|------|------|
| 1 | Discovery & Inventory | 15 min | Low |
| 2 | Root Cause Diagnosis | 10 min | Low |
| 3 | Fix Configuration | 15 min | Medium |
| 4 | Test & Verify | 10 min | Low |
| 5 | Cleanup & Consolidation | 10 min | Low |
| 6 | Documentation | 5 min | Low |
| **TOTAL** | | **60 min** | **Low** |

**Buffer**: Add 30 minutes for unexpected issues

**Total Estimated Time**: 60-90 minutes

---

## Next Steps

1. **Execute Phase 1**: Run discovery commands, document findings
2. **Execute Phase 2**: Diagnose root cause (likely GitHub App callback URL)
3. **Execute Phase 3**: Apply fix
4. **Execute Phase 4**: Test thoroughly
5. **Execute Phase 5**: Clean up unnecessary resources
6. **Execute Phase 6**: Document final configuration

**Start Now**: Begin with Phase 1.1 (enumerate Vercel projects)

---

**Document Status**: READY TO EXECUTE
**Owner**: User
**Support**: Available via this analysis + Claude assistance
**Expected Outcome**: Working Keystatic CMS on prelaunch.bearlakecamp.com within 1 hour
