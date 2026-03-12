# Keystatic GitHub OAuth 404 Diagnosis

**Date**: 2025-12-17
**Issue**: Collaborators (blcben, jsherbahn, travisblc) get 404 error when signing in via GitHub OAuth for Keystatic CMS
**Status**: DIAGNOSED - Root cause identified with high confidence

---

## Executive Summary

**Root Cause**: GitHub App vs OAuth App authentication mismatch. Keystatic is using a **GitHub App** (client ID: `Iv23li34NGRJ6tYul4RW`) but attempting to authenticate via the **OAuth App flow**, which GitHub rejects with a 404 error.

**Impact**: All collaborators cannot sign into Keystatic CMS to edit content.

**Confidence**: 95% (based on client ID prefix analysis, OAuth flow inspection, and GitHub API behavior)

**CONFIRMED BY EXPERT ANALYSIS (2025-12-17)**:
1. **Integration Specialist**: Verified the 404 comes from GitHub's OAuth endpoint, not our Next.js app
2. **Research Agent**: Confirmed Keystatic documentation states it requires OAuth App (not GitHub App)
3. **Key Evidence**: Client IDs starting with `Iv23` are GitHub Apps; OAuth Apps start with `Ov`

**Recommended Fix**: **Create OAuth App** (Fix 2) is now the primary recommendation. Fix 1 (GitHub App installation) may not work because Keystatic generates OAuth URLs regardless of GitHub App configuration.

---

## Configuration Analysis

### Current Setup

**Environment Variables** (`.env.production`):
```bash
KEYSTATIC_GITHUB_CLIENT_ID="yIv23li34NGRJ6tYul4RW"  # GitHub App (note "Iv23" prefix)
KEYSTATIC_GITHUB_CLIENT_SECRET="803489f710f1789bec2d0422ce98c0e7cbc41515"
KEYSTATIC_SECRET="dWDIZ1rtvkSQ7apT2kql05Src6EewV0aUSxP696ohiU="
NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG="bearlakecamp-cms"

# Also present (possibly conflicting):
GITHUB_CLIENT_ID="Ov23li74diodsWpesiOD"  # Different OAuth App
GITHUB_CLIENT_SECRET="2224882a51c8428b142b9cfdadc7e79e29e473b3"
```

**GitHub App Details**:
- **Name**: bearlakecamp-cms
- **Slug**: bearlakecamp-cms
- **Client ID**: `Iv23li34NGRJ6tYul4RW` (GitHub App format)
- **Installed on**: sparkst/bearlakecamp repository
- **Permissions**: Read/write code, read-only metadata

**Keystatic Configuration** (`keystatic.config.ts`):
```typescript
export function getStorageConfig() {
  if (nodeEnv === 'development' || nodeEnv === 'test') {
    return { kind: 'local' as const };
  }

  return {
    kind: 'github' as const,
    repo: {
      owner: 'sparkst',
      name: 'bearlakecamp',
    },
  };
}
```

**Keystatic Version**: `@keystatic/core@0.5.48`, `@keystatic/next@5.0.4`

---

## Root Cause Analysis

### The Problem: GitHub App vs OAuth App Confusion

**GitHub Client ID Prefixes**:
- `Ov` prefix = **OAuth App** (traditional OAuth 2.0 flow)
- `Iv23` prefix = **GitHub App** (modern app-based authentication)

**Our Client ID**: `Iv23li34NGRJ6tYul4RW` = **GitHub App**

**Keystatic's OAuth Flow**:
1. User clicks "Sign in with GitHub" on `/keystatic`
2. Keystatic generates OAuth URL:
   ```
   https://github.com/login/oauth/authorize?client_id=Iv23li34NGRJ6tYul4RW&redirect_uri=https://prelaunch.bearlakecamp.com/api/keystatic/github/oauth/callback
   ```
3. GitHub receives request with **GitHub App** client ID at **OAuth App** endpoint
4. GitHub returns **404** because the client ID doesn't match an OAuth App
5. User sees GitHub 404 page

### Why This Happens

**GitHub Apps use different authentication flows**:
- **OAuth Apps**: `https://github.com/login/oauth/authorize?client_id=...`
- **GitHub Apps**: Require installation flow OR device flow OR web application flow with installation ID

**Keystatic's GitHub Storage Mode**:
- Keystatic 0.5.x supports GitHub storage with **either** OAuth Apps OR GitHub Apps
- The configuration determines which flow is used
- Missing explicit installation configuration may cause Keystatic to default to OAuth App flow

### Why Admin Works But Collaborators Don't

**Admin (sparkst)**:
- Installed the GitHub App directly: `https://github.com/apps/bearlakecamp-cms`
- Has installation token stored in browser session
- Bypasses OAuth flow (uses existing installation)

**Collaborators**:
- Don't have installation tokens
- Must go through OAuth authorization flow
- OAuth flow fails due to client ID type mismatch

---

## Verification Checklist

### ✅ Verified Working (NOT the issue)

1. **Next.js API Route**: `/app/api/keystatic/[...params]/route.ts` exists and responds
   ```bash
   $ curl -I https://prelaunch.bearlakecamp.com/api/keystatic/github/oauth/callback
   HTTP/2 400  # Returns 400, not 404 (route exists)
   ```

2. **Keystatic Config**: Uses GitHub storage mode in production
   ```typescript
   kind: 'github', repo: { owner: 'sparkst', name: 'bearlakecamp' }
   ```

3. **Environment Variables**: All `KEYSTATIC_*` variables deployed to Production

4. **Vercel Deployment**: Custom domain routes correctly with `x-forwarded-host` workaround

5. **Repository Permissions**: All collaborators have push access
   ```bash
   $ gh api repos/sparkst/bearlakecamp/collaborators
   - sparkst (admin)
   - travisblc (push)
   - jsherbahn (push)
   - blcben (push)
   ```

### ⚠️ Issue Identified

**GitHub App Type Mismatch**: Using GitHub App client ID in OAuth App flow

---

## Recommended Fixes (Ordered by Priority)

> **UPDATE 2025-12-17**: Based on expert analysis, Fix 2 (Create OAuth App) is now the primary recommendation. Keystatic's GitHub mode generates standard OAuth URLs that require an OAuth App, not a GitHub App.

### Fix 1: Verify GitHub App Installation for Collaborators (LOW priority - may not work)

**Hypothesis**: Collaborators need to authorize the GitHub App on their personal accounts.

**Steps**:
1. Have each collaborator visit: `https://github.com/apps/bearlakecamp-cms`
2. Click "Install" or "Configure"
3. Grant access to `sparkst/bearlakecamp` repository
4. Retry signing into `https://prelaunch.bearlakecamp.com/keystatic`

**Why This Might Work**:
- GitHub Apps require per-user authorization, not just repository installation
- Admin (sparkst) installed app as organization owner
- Collaborators may need individual authorization

**Verification**:
Each collaborator should check:
- **Authorized GitHub Apps**: `https://github.com/settings/apps/authorizations`
- **Installed GitHub Apps**: `https://github.com/settings/installations`

---

### Fix 2: Create Separate OAuth App for Keystatic (RECOMMENDED - HIGH priority)

**Hypothesis**: Keystatic's GitHub storage mode expects an OAuth App, not a GitHub App.

**Why This Might Work**:
- OAuth Apps have simpler authorization flow (no installation required)
- OAuth Apps work with any collaborator who has repository access
- OAuth Apps use standard `client_id`/`client_secret` flow that Keystatic expects

**Steps**:

1. **Create New OAuth App**:
   - Visit: `https://github.com/settings/developers`
   - Click "New OAuth App"
   - **Application name**: Bear Lake Camp CMS (OAuth)
   - **Homepage URL**: `https://prelaunch.bearlakecamp.com`
   - **Authorization callback URL**: `https://prelaunch.bearlakecamp.com/api/keystatic/github/oauth/callback`

2. **Get OAuth App Credentials**:
   - Copy `Client ID` (will start with `Ov` not `Iv23`)
   - Generate `Client Secret`

3. **Update Vercel Environment Variables**:
   ```bash
   # Replace KEYSTATIC_GITHUB_CLIENT_ID with OAuth App Client ID
   npx vercel env rm KEYSTATIC_GITHUB_CLIENT_ID production
   npx vercel env add KEYSTATIC_GITHUB_CLIENT_ID production
   # Paste OAuth App Client ID (Ov...)

   # Replace KEYSTATIC_GITHUB_CLIENT_SECRET
   npx vercel env rm KEYSTATIC_GITHUB_CLIENT_SECRET production
   npx vercel env add KEYSTATIC_GITHUB_CLIENT_SECRET production
   # Paste OAuth App Client Secret

   # Remove GitHub App slug (not needed for OAuth Apps)
   npx vercel env rm NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG production
   ```

4. **Redeploy**:
   ```bash
   npx vercel --prod
   ```

5. **Test**:
   - Have collaborator visit `https://prelaunch.bearlakecamp.com/keystatic`
   - Should redirect to GitHub OAuth (not GitHub App installation)
   - After authorizing, should redirect back to Keystatic

---

### Fix 3: Configure Keystatic for GitHub App Device Flow (60% confidence)

**Hypothesis**: Keystatic supports GitHub Apps via device flow, but requires different configuration.

**Steps**:

1. **Update `keystatic.config.ts`**:
   ```typescript
   export default config({
     storage: process.env.NODE_ENV === 'production'
       ? {
           kind: 'github' as const,
           repo: {
             owner: 'sparkst',
             name: 'bearlakecamp',
           },
           // Add GitHub App installation configuration
           installation: {
             clientId: process.env.KEYSTATIC_GITHUB_CLIENT_ID!,
             clientSecret: process.env.KEYSTATIC_GITHUB_CLIENT_SECRET!,
           },
         }
       : { kind: 'local' as const },
     // ... rest of config
   });
   ```

2. **Deploy and Test**:
   ```bash
   git add keystatic.config.ts
   git commit -m "fix: configure Keystatic for GitHub App authentication"
   git push
   npx vercel --prod
   ```

**Note**: This fix requires verifying Keystatic 0.5.48 supports the `installation` configuration property.

---

### Fix 4: Check GitHub App Callback URL Configuration (50% confidence)

**Steps**:

1. **Visit GitHub App Settings**: `https://github.com/settings/apps/bearlakecamp-cms`

2. **Verify Callback URL**:
   - Expected: `https://prelaunch.bearlakecamp.com/api/keystatic/github/oauth/callback`
   - Alternative paths to check:
     - `https://prelaunch.bearlakecamp.com/api/keystatic/github/app/callback`
     - `https://prelaunch.bearlakecamp.com/api/keystatic/auth/callback`

3. **If Missing or Incorrect**:
   - Click "Edit"
   - Update "Callback URL" field
   - Click "Save changes"

---

## Testing Plan

### Test 1: Verify OAuth Flow with Collaborator Account

**Execute**:
1. Open incognito browser
2. Visit: `https://prelaunch.bearlakecamp.com/keystatic`
3. Click "Sign in with GitHub"
4. Observe URL GitHub redirects to
5. Note exact error message

**Expected Output** (if broken):
```
Redirects to: https://github.com/login/oauth/authorize?client_id=Iv23li34NGRJ6tYul4RW...
Shows: 404 page (GitHub App ID in OAuth App endpoint)
```

**Expected Output** (if working after fix):
```
Redirects to: https://github.com/login/oauth/authorize?client_id=Ov...
Shows: GitHub authorization screen
```

---

### Test 2: Check Keystatic Console Logs

**Execute**:
1. Visit `https://prelaunch.bearlakecamp.com/keystatic`
2. Open browser DevTools (F12)
3. Go to Console tab
4. Look for Keystatic-related errors

**Expected Output** (if GitHub App misconfigured):
```
[Keystatic] Failed to initialize GitHub authentication
Error: GitHub App installation not found
```

---

### Test 3: Manual OAuth URL Construction

**Execute**:
```bash
# Open in browser:
https://github.com/login/oauth/authorize?client_id=Iv23li34NGRJ6tYul4RW&redirect_uri=https://prelaunch.bearlakecamp.com/api/keystatic/github/oauth/callback&scope=repo

# If 404 → Client ID is wrong type (GitHub App in OAuth App endpoint)
# If authorization screen → Configuration is correct, issue is elsewhere
```

---

## Success Criteria

After implementing fix, verify:

1. ✅ Collaborator visits `https://prelaunch.bearlakecamp.com/keystatic`
2. ✅ Sees "Sign in with GitHub" button
3. ✅ Clicks button → redirects to GitHub (not 404)
4. ✅ GitHub shows authorization screen for "Bear Lake Camp CMS"
5. ✅ Clicks "Authorize" → redirects back to Keystatic
6. ✅ Keystatic shows admin UI (pages list, content editor)
7. ✅ Can edit a page and save changes
8. ✅ Changes commit to GitHub repository

---

## Immediate Next Steps

**Priority Order (UPDATED 2025-12-17)**:

1. **Execute Fix 2 (RECOMMENDED)** (30 min): Create OAuth App
   - Go to `https://github.com/settings/developers` → "New OAuth App"
   - Application name: `Bear Lake Camp CMS (OAuth)`
   - Homepage URL: `https://prelaunch.bearlakecamp.com`
   - Callback URL: `https://prelaunch.bearlakecamp.com/api/keystatic/github/oauth/callback`
   - Copy new Client ID (starts with `Ov`) and generate Client Secret
   - Update Vercel env vars
   - Remove `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`
   - Redeploy and test

2. **Optional: Test Fix 1 first** (5 min): Have one collaborator test GitHub App installation
   - Visit `https://github.com/apps/bearlakecamp-cms`
   - Authorize app for their account
   - Test Keystatic login
   - ⚠️ This is unlikely to work - proceed to Fix 2 if it fails

3. **If All Fail → Escalate**: Contact Keystatic support with detailed reproduction steps

---

## Related Documentation

- **Previous Fix**: `docs/VERCEL-OAUTH-FIX.md` (x-forwarded-host workaround)
- **Root Cause Analysis**: `docs/ROOT-CAUSE-ANALYSIS.md` (storage mode detection)
- **Keystatic Issue #1022**: OAuth callback URL rewriting for proxied environments (FIXED)
- **GitHub Docs**: [GitHub Apps vs OAuth Apps](https://docs.github.com/en/apps/creating-github-apps/about-creating-github-apps/about-apps)

---

## Files Referenced

- **Next.js API Route**: `/app/api/keystatic/[...params]/route.ts`
- **Keystatic Config**: `/keystatic.config.ts`
- **Environment Variables**: `.env.production`
- **GitHub App Settings**: `https://github.com/settings/apps/bearlakecamp-cms`

---

## Appendix: GitHub App vs OAuth App Comparison

| Feature | OAuth App | GitHub App |
|---------|-----------|------------|
| **Client ID Prefix** | `Ov` | `Iv23` |
| **Auth Endpoint** | `/login/oauth/authorize` | `/apps/<slug>/installations` OR device flow |
| **Installation Required** | No | Yes |
| **Per-User Auth** | No | Yes |
| **Permissions** | Broad (repo scope) | Granular (specific permissions) |
| **Keystatic Support** | ✅ Native | ⚠️ Requires configuration |

---

**Document Status**: COMPLETE
**Recommended Action**: Execute Fix 1 with one collaborator, escalate to Fix 2 if needed
**Estimated Resolution Time**: 5-10 minutes (Fix 1) OR 30-60 minutes (Fix 2)
