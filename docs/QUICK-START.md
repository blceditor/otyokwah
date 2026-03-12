# Quick Start: Fix Keystatic Login Issue

**Problem**: Cannot save pages at https://prelaunch.bearlakecamp.com/keystatic
**Estimated Fix Time**: 10-30 minutes
**Confidence**: 95%

---

## Option 1: Fastest Diagnosis (5 min)

### Step 1: Run Diagnostic Script
```bash
cd "/Users/travis/Library/CloudStorage/GoogleDrive-travis@sparkry.com/My Drive/dev/blacklinewebsite/requirements/content-hosting/bearlakecamp-nextjs"

./diagnose.sh > diagnostic-output.txt

# Review output
cat diagnostic-output.txt
```

### Step 2: Check GitHub App Callback URL
1. Open: https://github.com/settings/apps/bearlakecamp-cms
2. Scroll to "Callback URL"
3. Verify it includes:
   ```
   https://prelaunch.bearlakecamp.com/api/keystatic/github/oauth/callback
   ```
4. **If MISSING**: Click Edit, add the URL, save
5. **Test**: Visit https://prelaunch.bearlakecamp.com/keystatic

**If this fixes it**: You're done! ✅

**If not**: Continue to Option 2

---

## Option 2: Manual Diagnosis (15 min)

### Command 1: Check Projects
```bash
npx vercel projects ls
```
**Look for**: How many projects exist? Should only see "bearlakecamp"

### Command 2: Check Domains
```bash
npx vercel domains ls
```
**Look for**: Is `prelaunch.bearlakecamp.com` assigned to `bearlakecamp` project?

### Command 3: Check Production Env Vars
```bash
npx vercel env pull .env.production --environment production
grep KEYSTATIC_GITHUB_CLIENT_ID .env.production
```
**Look for**: Variable should exist. If empty → Variables not in Production environment.

### Command 4: Test OAuth URL Manually
```
Open in browser:
https://github.com/login/oauth/authorize?client_id=yIv23li34NGRJ6tYul4RW&redirect_uri=https://prelaunch.bearlakecamp.com/api/keystatic/github/oauth/callback&scope=repo
```
**Expected**: GitHub authorization screen appears
**If Error**: "redirect_uri mismatch" → Callback URL is the issue

---

## Common Fixes

### Fix A: Add Callback URL to GitHub App
```
1. Visit: https://github.com/settings/apps/bearlakecamp-cms
2. Click "Edit"
3. In "Callback URL" field, add:
   https://prelaunch.bearlakecamp.com/api/keystatic/github/oauth/callback
4. Save
5. Test: Visit /keystatic again
```

### Fix B: Re-add Env Vars to Production
```bash
npx vercel env add KEYSTATIC_GITHUB_CLIENT_ID production
# Paste: yIv23li34NGRJ6tYul4RW

npx vercel env add KEYSTATIC_GITHUB_CLIENT_SECRET production
# Paste: 803489f710f1789bec2d0422ce98c0e7cbc41515

npx vercel env add KEYSTATIC_SECRET production
# Paste: dWDIZ1rtvkSQ7apT2kql05Src6EewV0aUSxP696ohiU=

npx vercel --prod  # Redeploy
```

### Fix C: Force GitHub Storage Mode
Edit `keystatic.config.ts`:
```typescript
function getStorageConfig() {
  if (process.env.NODE_ENV === 'development') {
    return { kind: 'local' as const };
  }

  // Simplified: Just use GitHub if OAuth configured
  if (process.env.KEYSTATIC_GITHUB_CLIENT_ID) {
    return {
      kind: 'github' as const,
      repo: { owner: 'sparkst', name: 'bearlakecamp' },
    };
  }

  return { kind: 'local' as const };
}
```

Save, commit, push:
```bash
git add keystatic.config.ts
git commit -m "fix: simplify storage mode detection"
git push
```

---

## Test After Fix

```
1. Visit: https://prelaunch.bearlakecamp.com/keystatic
2. Click "Login with GitHub"
3. Authorize app
4. Should land in Keystatic admin (logged in)
5. Edit a page
6. Click "Save"
7. Check GitHub: https://github.com/sparkst/bearlakecamp/commits/main
   → Should see new commit
```

**If all steps pass**: Fixed! ✅

---

## Workaround (While Debugging)

Use the .vercel.app URL instead:
```
https://bearlakecamp-nextjs.vercel.app/keystatic
```

If this works but custom domain doesn't → Confirms issue is custom domain specific.

---

## Full Documentation

For complete analysis and step-by-step plans, see:

- **EXECUTIVE-SUMMARY.md** - Overview and recommended approach
- **ROOT-CAUSE-ANALYSIS.md** - All possible issues with diagnostic workflows
- **CONSOLIDATION-PLAN.md** - Complete cleanup and consolidation plan
- **FINAL-CONFIGURATION.md** - Final target state documentation
- **CURRENT-STATE-AUDIT.md** - Inventory of current resources

---

## Need Help?

1. Run `./diagnose.sh` and share output
2. Share what you see when visiting `/keystatic` (screenshot helpful)
3. Share output of GitHub App callback URL verification
4. Indicate which fix you tried and what happened

---

**Most likely fix**: Add callback URL to GitHub App (2 minutes)

**Expected resolution**: 10-30 minutes

**Good luck!** 🚀
