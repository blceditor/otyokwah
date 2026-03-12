# FIX: Reassign Domain to Correct Project

## The Problem (Confirmed)

**Your directory structure:**
- Local folder: `/bearlakecamp-nextjs/`
- Linked to Vercel project: `bearlakecamp` ✅ (has all env vars)

**Your custom domain:**
- Domain: `prelaunch.bearlakecamp.com`
- Currently points to: `bearlakecamp-nextjs` ❌ (no env vars)
- Should point to: `bearlakecamp` ✅

**Result:** CMS loads but can't authenticate because it's using the wrong project (without credentials).

---

## The Fix (5 Minutes)

### Option 1: Vercel Dashboard (Easiest)

1. **Go to Vercel dashboard**: https://vercel.com/

2. **Find the WRONG project** (`bearlakecamp-nextjs`):
   - Click on `bearlakecamp-nextjs` project
   - Go to **Settings** → **Domains**
   - Find `prelaunch.bearlakecamp.com`
   - Click **Remove** (or **X** button)

3. **Add domain to CORRECT project** (`bearlakecamp`):
   - Click on `bearlakecamp` project
   - Go to **Settings** → **Domains**
   - Click **Add Domain**
   - Enter: `prelaunch.bearlakecamp.com`
   - Click **Add**

4. **Wait 1-2 minutes** for DNS propagation

5. **Test**: Visit https://prelaunch.bearlakecamp.com/keystatic

### Option 2: Vercel CLI (Faster)

```bash
cd "/Users/travis/Library/CloudStorage/GoogleDrive-travis@sparkry.com/My Drive/dev/blacklinewebsite/requirements/content-hosting/bearlakecamp-nextjs"

# Remove domain from wrong project (bearlakecamp-nextjs)
npx vercel domains rm prelaunch.bearlakecamp.com --scope bearlakecamp-nextjs

# Add domain to correct project (bearlakecamp) - already linked to this directory
npx vercel domains add prelaunch.bearlakecamp.com

# Wait 1-2 minutes, then test
```

---

## After the Fix

### Expected Behavior

1. Visit: https://prelaunch.bearlakecamp.com/keystatic
2. **GitHub login button appears** (or automatic redirect)
3. Click login → GitHub authorization screen
4. Authorize → Redirected back to Keystatic (logged in)
5. Edit/create page → **Save works** ✅
6. Check GitHub → Commit appears
7. Wait 30-60 sec → Changes live on site

### Verify It Worked

```bash
# Check which project the domain points to
npx vercel domains ls

# Should show:
# prelaunch.bearlakecamp.com → bearlakecamp (not bearlakecamp-nextjs)
```

---

## Cleanup (Optional - After Fix Works)

### Delete Extra Vercel Projects

You have 3 projects:
1. **`bearlakecamp`** ✅ KEEP (current, has all env vars)
2. **`bearlakecamp-nextjs`** ❌ DELETE (duplicate, no env vars)
3. **`bearlakecamp-tina-backend`** ❌ DELETE (old TinaCMS, not used)

**Delete via Dashboard:**
1. Go to each project → Settings → Advanced → Delete Project

**Delete via CLI:**
```bash
npx vercel remove bearlakecamp-nextjs --yes
npx vercel remove bearlakecamp-tina-backend --yes
```

---

## Summary

**Root Cause**: Domain pointed to wrong Vercel project (one without environment variables)

**Fix**: Reassign `prelaunch.bearlakecamp.com` from `bearlakecamp-nextjs` → `bearlakecamp`

**Time**: 5 minutes

**Expected Result**: CMS works perfectly, can save pages, GitHub authentication functional

---

## Test Checklist

After reassigning domain:

- [ ] Visit https://prelaunch.bearlakecamp.com/keystatic
- [ ] GitHub login button appears
- [ ] Click login → GitHub authorization screen shows
- [ ] Authorize → Redirected back (logged in)
- [ ] Create new test page
- [ ] Save page
- [ ] Check GitHub for new commit
- [ ] Visit page on site (changes appear within 60 sec)

**When all checked**: Issue fully resolved ✅
