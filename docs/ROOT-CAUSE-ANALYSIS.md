# Root Cause Analysis: GitHub Login Not Triggering
**Date**: 2025-11-14
**Project**: bearlakecamp-nextjs (Next.js + Keystatic)
**Symptom**: No GitHub login prompt at prelaunch.bearlakecamp.com/keystatic

---

## Problem Statement

User reports:
1. ✅ Can access `https://prelaunch.bearlakecamp.com/keystatic`
2. ❌ No GitHub login prompt appears
3. ❌ Cannot save pages

**Expected Behavior**: Keystatic should detect custom domain and use GitHub storage, prompting for GitHub OAuth login.

**Actual Behavior**: Keystatic appears to be using local storage (read-only mode), no login prompt.

---

## Root Cause Hypotheses (Ranked by Probability)

### Hypothesis 1: GitHub App Callback URL Not Configured (80% likely)

**Issue**: The GitHub App `bearlakecamp-cms` doesn't have `prelaunch.bearlakecamp.com` in its allowed callback URLs.

**How GitHub OAuth Works**:
```
1. User visits /keystatic on custom domain
2. Keystatic detects GitHub storage mode needed
3. Redirects to GitHub OAuth:
   https://github.com/login/oauth/authorize?client_id=...&redirect_uri=https://prelaunch.bearlakecamp.com/api/keystatic/github/oauth/callback
4. GitHub validates redirect_uri against app's allowed callback URLs
5. If NOT FOUND → GitHub silently fails (no redirect, user stuck on /keystatic)
6. If FOUND → GitHub shows login/authorization screen
```

**Why This Is Likely**:
- GitHub App was created 37 minutes ago (recent setup)
- Multiple deployments suggest troubleshooting phase
- Common mistake: Adding .vercel.app domain but forgetting custom domain

**Evidence Needed**:
```bash
# Check GitHub App settings
Visit: https://github.com/settings/apps/bearlakecamp-cms
Look for: Callback URL field

Expected:
- https://prelaunch.bearlakecamp.com/api/keystatic/github/oauth/callback
- https://bearlakecamp-nextjs.vercel.app/api/keystatic/github/oauth/callback
- http://localhost:3000/api/keystatic/github/oauth/callback

If MISSING prelaunch.bearlakecamp.com → ROOT CAUSE CONFIRMED
```

**Fix** (if confirmed):
1. Go to GitHub App settings
2. Edit "Callback URL" field
3. Add: `https://prelaunch.bearlakecamp.com/api/keystatic/github/oauth/callback`
4. Save
5. Test: Visit `https://prelaunch.bearlakecamp.com/keystatic` again

**Confidence**: 80%
**Time to Fix**: 2 minutes

---

### Hypothesis 2: Keystatic Detecting Wrong Storage Mode (70% likely)

**Issue**: `keystatic.config.ts` storage mode detection logic fails to recognize custom domain.

**Current Logic** (`keystatic.config.ts` lines 7-31):
```javascript
function getStorageConfig() {
  // Always local in development
  if (process.env.NODE_ENV === 'development') {
    return { kind: 'local' };
  }

  // Check if custom domain (not *.vercel.app)
  const vercelUrl = process.env.VERCEL_URL || '';
  const isCustomDomain = vercelUrl && !vercelUrl.includes('.vercel.app');

  // Use GitHub only for custom domains with OAuth configured
  if (isCustomDomain && process.env.KEYSTATIC_GITHUB_CLIENT_ID) {
    return { kind: 'github', repo: { owner: 'sparkst', name: 'bearlakecamp' } };
  }

  // Default: local storage
  return { kind: 'local' };
}
```

**Failure Scenarios**:

**Scenario A**: `VERCEL_URL` not set on custom domain deployment
```javascript
vercelUrl = ''  // Empty
isCustomDomain = false  // Fails the check
→ Returns { kind: 'local' }  // Wrong!
```

**Scenario B**: `VERCEL_URL` contains .vercel.app even for custom domain
```javascript
vercelUrl = 'bearlakecamp-nextjs-l1qq4k67s-travis-projects-3a622477.vercel.app'
isCustomDomain = false  // vercelUrl.includes('.vercel.app') is true
→ Returns { kind: 'local' }  // Wrong!
```

**Scenario C**: `KEYSTATIC_GITHUB_CLIENT_ID` not available in production
```javascript
vercelUrl = 'prelaunch.bearlakecamp.com'
isCustomDomain = true
process.env.KEYSTATIC_GITHUB_CLIENT_ID = undefined  // Not exposed
→ Returns { kind: 'local' }  // Wrong!
```

**Why This Is Likely**:
- `VERCEL_URL` behavior varies between preview/production deployments
- Custom domains may use internal Vercel URLs for routing
- Environment variable exposure can differ by deployment type

**Diagnostic Test**:
Add temporary logging to `keystatic.config.ts`:
```javascript
function getStorageConfig() {
  console.log('[Keystatic Storage Detection]');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('VERCEL_URL:', process.env.VERCEL_URL);
  console.log('KEYSTATIC_GITHUB_CLIENT_ID:', process.env.KEYSTATIC_GITHUB_CLIENT_ID ? 'SET' : 'NOT SET');

  const vercelUrl = process.env.VERCEL_URL || '';
  const isCustomDomain = vercelUrl && !vercelUrl.includes('.vercel.app');
  console.log('isCustomDomain:', isCustomDomain);

  // ... rest of logic

  const config = { /* storage config */ };
  console.log('Storage mode:', config.kind);
  return config;
}
```

Then check Vercel logs:
```bash
npx vercel logs prelaunch.bearlakecamp.com
```

**Expected Output** (correct):
```
[Keystatic Storage Detection]
NODE_ENV: production
VERCEL_URL: prelaunch.bearlakecamp.com
KEYSTATIC_GITHUB_CLIENT_ID: SET
isCustomDomain: true
Storage mode: github
```

**If Seeing** (incorrect):
```
[Keystatic Storage Detection]
NODE_ENV: production
VERCEL_URL: bearlakecamp-nextjs-<hash>.vercel.app
KEYSTATIC_GITHUB_CLIENT_ID: SET
isCustomDomain: false
Storage mode: local  ← PROBLEM
```

**Fix** (if `VERCEL_URL` is wrong):
Use `req.headers.host` instead:
```javascript
// In keystatic.config.ts or API route
const host = req?.headers?.host || process.env.VERCEL_URL || '';
const isCustomDomain = host && !host.includes('.vercel.app');
```

**Confidence**: 70%
**Time to Diagnose**: 5 minutes
**Time to Fix**: 15 minutes

---

### Hypothesis 3: Environment Variables Not Exposed to Production (50% likely)

**Issue**: `KEYSTATIC_GITHUB_CLIENT_ID` is configured in Vercel but not exposed to custom domain deployments.

**Vercel Environment Variable Scoping**:
- Variables can be scoped to: Production, Preview, Development
- **BUT**: Custom domain deployments may use different scope than .vercel.app

**Why This Is Possible**:
- Variables were added 34-37 minutes ago (recent)
- May have been added to "Preview" environment instead of "Production"
- Custom domains use "Production" scope

**Evidence Needed**:
```bash
# Pull production environment variables
npx vercel env pull .env.production --environment production

# Compare to development variables
diff .env.local .env.production

# Expected: All KEYSTATIC_* variables in both
# If MISSING in .env.production → ROOT CAUSE CONFIRMED
```

**Alternative Check** (via Vercel dashboard):
1. Go to Project Settings → Environment Variables
2. For each `KEYSTATIC_*` variable, verify checkboxes:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

**Fix** (if missing from Production):
```bash
# Re-add variables to Production environment
npx vercel env add KEYSTATIC_GITHUB_CLIENT_ID production
npx vercel env add KEYSTATIC_GITHUB_CLIENT_SECRET production
npx vercel env add KEYSTATIC_SECRET production
npx vercel env add NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG production

# Redeploy
npx vercel --prod
```

**Confidence**: 50%
**Time to Diagnose**: 3 minutes
**Time to Fix**: 10 minutes

---

### Hypothesis 4: Custom Domain Routed to Wrong Vercel Project (40% likely)

**Issue**: User mentioned "3 Vercel projects exist". If `prelaunch.bearlakecamp.com` is assigned to a DIFFERENT project (without Keystatic), it would serve wrong deployment.

**How This Happens**:
1. User creates multiple Vercel projects during experimentation
2. Custom domain gets assigned to Project A
3. User configures Project B (bearlakecamp) with Keystatic
4. Domain still points to Project A → Serves wrong app

**Evidence Needed**:
```bash
# List all Vercel projects
npx vercel projects ls

# Expected output:
# Project Name         Framework    Latest Deployment
# bearlakecamp        Next.js      https://...
# project-2           ?            ?
# project-3           ?            ?

# Check which project owns prelaunch.bearlakecamp.com
npx vercel domains ls

# Expected output:
# Domain                        Project          Added
# bearlakecamp.com             bearlakecamp     2h ago
# prelaunch.bearlakecamp.com   bearlakecamp     2h ago ← VERIFY THIS

# If showing different project → ROOT CAUSE CONFIRMED
```

**Fix** (if domain assigned to wrong project):
```bash
# Remove domain from wrong project
npx vercel domains rm prelaunch.bearlakecamp.com --yes

# Add to correct project
cd /path/to/bearlakecamp-nextjs
npx vercel domains add prelaunch.bearlakecamp.com
```

**Confidence**: 40%
**Time to Diagnose**: 5 minutes
**Time to Fix**: 10 minutes

---

### Hypothesis 5: GitHub App Permissions Insufficient (30% likely)

**Issue**: GitHub App `bearlakecamp-cms` doesn't have required repository permissions.

**Required Permissions** (for Keystatic GitHub mode):
- **Repository Contents**: Read & Write
- **Metadata**: Read
- (Optional) **Pull Requests**: Read & Write (if using PR workflow)

**Why This Is Less Likely**:
- Usually GitHub shows an error message if permissions are missing
- Silent failure is more typical of callback URL issues

**Evidence Needed**:
```bash
# Visit GitHub App page
https://github.com/settings/apps/bearlakecamp-cms

# Check "Permissions" section:
Expected:
- Repository permissions → Contents: Read & write ✅
- Repository permissions → Metadata: Read-only ✅
```

**Fix** (if permissions missing):
1. Edit app permissions
2. Set "Contents" to "Read & write"
3. Re-install app on sparkst/bearlakecamp repository

**Confidence**: 30%
**Time to Fix**: 5 minutes

---

### Hypothesis 6: Multiple GitHub Apps Conflicting (20% likely)

**Issue**: Two sets of GitHub OAuth credentials suggest two GitHub Apps exist.

**Evidence** (from .env.local):
```bash
# Set 1 (Created 14 hours ago)
GITHUB_CLIENT_ID="Ov23li74diodsWpesiOD"
GITHUB_CLIENT_SECRET="2224882a51c8428b142b9cfdadc7e79e29e473b3"

# Set 2 (Created 37 minutes ago)
KEYSTATIC_GITHUB_CLIENT_ID="yIv23li34NGRJ6tYul4RW"
KEYSTATIC_GITHUB_CLIENT_SECRET="803489f710f1789bec2d0422ce98c0e7cbc41515"
```

**Potential Scenario**:
- Earlier attempt created GitHub OAuth App (GITHUB_CLIENT_ID)
- Later attempt created GitHub App for Keystatic (KEYSTATIC_GITHUB_CLIENT_ID)
- Keystatic config using wrong credentials

**Why This Is Less Likely**:
- Keystatic code explicitly uses `KEYSTATIC_GITHUB_CLIENT_ID`
- Multiple apps shouldn't interfere (different client IDs)

**Evidence Needed**:
```bash
# List all GitHub Apps
https://github.com/settings/apps

# List all GitHub OAuth Apps
https://github.com/settings/developers

# Verify which app is bearlakecamp-cms
# Check if others exist for same purpose
```

**Fix** (if conflicting apps exist):
1. Delete unnecessary GitHub Apps/OAuth Apps
2. Keep only `bearlakecamp-cms` GitHub App
3. Remove obsolete environment variables (GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET)

**Confidence**: 20%
**Time to Fix**: 10 minutes

---

## Diagnostic Workflow (Ordered by Efficiency)

### Step 1: Verify GitHub App Callback URL (2 min)
```bash
# Visit app settings
https://github.com/settings/apps/bearlakecamp-cms

# Check Callback URL includes:
https://prelaunch.bearlakecamp.com/api/keystatic/github/oauth/callback

# If MISSING → Add it → DONE (80% chance this is the fix)
```

### Step 2: Check Environment Variable Exposure (3 min)
```bash
# Pull production env vars
npx vercel env pull .env.production --environment production

# Verify KEYSTATIC_GITHUB_CLIENT_ID is present
grep KEYSTATIC_GITHUB_CLIENT_ID .env.production

# If MISSING → Re-add to Production environment → Redeploy
```

### Step 3: Verify Domain Assignment (5 min)
```bash
# List all projects
npx vercel projects ls

# List domain assignments
npx vercel domains ls

# If prelaunch.bearlakecamp.com assigned to DIFFERENT project:
#   → Remove from wrong project
#   → Add to bearlakecamp project
```

### Step 4: Add Logging to Keystatic Config (5 min)
```javascript
// Add to keystatic.config.ts
function getStorageConfig() {
  console.log('[Keystatic] VERCEL_URL:', process.env.VERCEL_URL);
  console.log('[Keystatic] KEYSTATIC_GITHUB_CLIENT_ID:', process.env.KEYSTATIC_GITHUB_CLIENT_ID ? 'SET' : 'UNSET');
  // ... rest of logic
}

// Commit, push, deploy
git add keystatic.config.ts
git commit -m "Add Keystatic storage detection logging"
git push

# Wait for deployment
# Check logs:
npx vercel logs prelaunch.bearlakecamp.com

# Look for [Keystatic] log lines
# Confirms which storage mode is being used and why
```

### Step 5: Test GitHub OAuth Flow Manually (5 min)
```bash
# Construct OAuth URL manually
https://github.com/login/oauth/authorize?client_id=yIv23li34NGRJ6tYul4RW&redirect_uri=https://prelaunch.bearlakecamp.com/api/keystatic/github/oauth/callback&scope=repo

# Open in browser
# If GitHub shows error "redirect_uri mismatch" → Callback URL is the issue
# If GitHub shows authorization screen → Callback URL is correct, problem is elsewhere
```

---

## Combined Probability Assessment

| Hypothesis | Probability | Time to Diagnose | Time to Fix | Effort |
|------------|-------------|------------------|-------------|--------|
| 1. GitHub App Callback URL | 80% | 2 min | 2 min | Trivial |
| 2. Storage Mode Detection | 70% | 5 min | 15 min | Low |
| 3. Env Vars Not Exposed | 50% | 3 min | 10 min | Low |
| 4. Domain Routed Wrong | 40% | 5 min | 10 min | Low |
| 5. App Permissions | 30% | 2 min | 5 min | Trivial |
| 6. Multiple Apps Conflict | 20% | 10 min | 10 min | Low |

**Most Likely Root Cause** (Combined Probabilities):
- **95% chance**: GitHub App callback URL is missing OR environment variables not exposed to production
- **5% chance**: Other issues (storage mode detection, domain routing, permissions)

**Recommended Diagnostic Order**:
1. Check GitHub App callback URL (2 min) - 80% chance of fixing
2. Verify production env vars (3 min) - 50% chance of fixing
3. Check domain assignment (5 min) - 40% chance of fixing
4. Add logging to config (5 min) - Confirms root cause for debugging

**Expected Total Diagnosis Time**: 10-15 minutes
**Expected Total Fix Time**: 2-30 minutes (depending on which hypothesis is correct)

---

## Success Criteria (How to Confirm Fix)

After applying fix:

1. **Visit**: `https://prelaunch.bearlakecamp.com/keystatic`
2. **Expected**: GitHub login button or redirect to GitHub OAuth
3. **Click** "Login with GitHub" (or allow redirect)
4. **Expected**: GitHub authorization screen appears
5. **Authorize** app
6. **Expected**: Redirect back to Keystatic admin UI (logged in)
7. **Test**: Edit a page, save
8. **Expected**: Changes commit to GitHub repository
9. **Verify**: Check `https://github.com/sparkst/bearlakecamp/commits/main` for new commit

**If All Steps Pass** → Issue resolved ✅

---

## Fallback Plan (If All Hypotheses Wrong)

If none of the above hypotheses resolve the issue:

### Nuclear Option 1: Explicitly Set Storage Mode
```javascript
// keystatic.config.ts - Force GitHub mode for production
export default config({
  storage: process.env.NODE_ENV === 'production'
    ? { kind: 'github', repo: { owner: 'sparkst', name: 'bearlakecamp' } }
    : { kind: 'local' },
  // ... rest of config
});
```

### Nuclear Option 2: Use Vercel Preview Deployment
```bash
# Instead of custom domain, use .vercel.app alias
https://bearlakecamp-nextjs.vercel.app/keystatic

# If this WORKS → Confirms issue is custom domain specific
# If this FAILS → Confirms issue is in Keystatic config/GitHub App
```

### Nuclear Option 3: Enable Keystatic Cloud (Temporary Workaround)
```bash
# Sign up for Keystatic Cloud (free tier available)
# Migrate to cloud mode temporarily to unblock editing
# Debug self-hosted setup in parallel
```

---

**Document Status**: COMPLETE
**Next Action**: Execute diagnostic workflow (Steps 1-5)
**Expected Resolution Time**: 15-30 minutes
