# Bear Lake Camp - Migration Plan

**Objective**: Move bearlakecamp-nextjs to clean, standalone directory at `/Users/travis/dev/bearlakecamp/`

**Date**: 2025-11-19
**Estimated Time**: 30 minutes
**Risk Level**: Low (git history preserved, rollback available)

---

## Pre-Migration Checklist

Before starting, verify:

- [ ] All changes committed to GitHub
- [ ] Vercel deployment working at https://prelaunch.bearlakecamp.com
- [ ] No pending work in current directory
- [ ] Backup of current state taken

**Pre-Migration Commands**:
```bash
cd /Users/travis/Library/CloudStorage/GoogleDrive-travis@sparkry.com/My\ Drive/dev/blacklinewebsite/requirements/content-hosting/bearlakecamp-nextjs

# Verify clean working tree
git status

# Verify remote connection
git remote -v

# Verify latest commit
git log -1 --oneline

# Create backup tag
git tag -a backup-pre-migration-2025-11-19 -m "Backup before migration to ~/dev/bearlakecamp"
git push origin backup-pre-migration-2025-11-19
```

---

## Migration Steps

### Step 1: Clone to New Location (5 min)

**Action**: Clone the GitHub repository to new standalone location

```bash
# Navigate to target parent directory
cd /Users/travis/dev

# Clone from GitHub (preserves full git history)
git clone https://github.com/sparkst/bearlakecamp.git

# Verify clone succeeded
cd bearlakecamp
git log --oneline -5
git remote -v
```

**Expected Output**:
```
Cloning into 'bearlakecamp'...
remote: Enumerating objects: 150, done.
remote: Counting objects: 100% (150/150), done.
remote: Compressing objects: 100% (120/120), done.
Receiving objects: 100% (150/150), done.
```

**Verification**:
- [ ] Directory `/Users/travis/dev/bearlakecamp/` exists
- [ ] Git history intact (check `git log`)
- [ ] Remote points to https://github.com/sparkst/bearlakecamp.git
- [ ] All files present (check `ls -la`)

---

### Step 2: Install Dependencies (3 min)

**Action**: Install npm packages

```bash
cd /Users/travis/dev/bearlakecamp

# Install dependencies
npm install

# Verify installation
npm run typecheck
npm run lint
```

**Expected Output**:
```
added 1234 packages in 45s
✓ Type checking passed
✓ Linting passed
```

**Verification**:
- [ ] `node_modules/` directory exists
- [ ] No type errors
- [ ] No lint errors
- [ ] Build succeeds: `npm run build`

---

### Step 3: Copy Environment Variables (2 min)

**Action**: Copy `.env.local` from old location (if exists)

```bash
# Check if .env.local exists in old location
ls -la /Users/travis/Library/CloudStorage/GoogleDrive-travis@sparkry.com/My\ Drive/dev/blacklinewebsite/requirements/content-hosting/bearlakecamp-nextjs/.env.local

# Copy if exists
cp /Users/travis/Library/CloudStorage/GoogleDrive-travis@sparkry.com/My\ Drive/dev/blacklinewebsite/requirements/content-hosting/bearlakecamp-nextjs/.env.local /Users/travis/dev/bearlakecamp/.env.local

# Verify
cat /Users/travis/dev/bearlakecamp/.env.local
```

**Required Variables** (for local development):
```bash
KEYSTATIC_GITHUB_CLIENT_ID=Iv23li34NGRJ6tYul4RW
KEYSTATIC_GITHUB_CLIENT_SECRET=[from GitHub App]
KEYSTATIC_SECRET=[random string]
NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG=bearlakecamp-cms
GITHUB_OWNER=sparkst
GITHUB_REPO=bearlakecamp
```

**Verification**:
- [ ] `.env.local` exists
- [ ] All required variables present
- [ ] No placeholder values (e.g., "YOUR_SECRET_HERE")

**Note**: Production variables are already in Vercel, no action needed there.

---

### Step 4: Test Local Development (5 min)

**Action**: Verify local development environment works

```bash
cd /Users/travis/dev/bearlakecamp

# Start dev server
npm run dev
```

**Manual Verification** (open browser):
- [ ] Visit http://localhost:3000 → Homepage loads
- [ ] Visit http://localhost:3000/keystatic → CMS admin loads
- [ ] Check browser console → No errors
- [ ] Try navigating pages → Works correctly

**Stop dev server**: Press `Ctrl+C`

---

### Step 5: Update Vercel Deployment Source (OPTIONAL - 5 min)

**Current State**: Vercel already deploys from https://github.com/sparkst/bearlakecamp

**Action**: No changes needed to Vercel, but verify settings

```bash
# Install Vercel CLI if not already
npm install -g vercel

# Login
vercel login

# Check project settings
vercel project ls
vercel env ls
```

**Verification**:
- [ ] Vercel project `bearlakecamp` exists
- [ ] Connected to GitHub repo `sparkst/bearlakecamp`
- [ ] Environment variables set for Production/Preview/Development
- [ ] Latest deployment successful

**Note**: Since we cloned from GitHub, Vercel deployment is unchanged. It will continue deploying from GitHub repo.

---

### Step 6: Archive Old Attempts (3 min)

**Action**: Move failed attempts to archive directory

```bash
# Create archive directory
mkdir -p /Users/travis/Library/CloudStorage/GoogleDrive-travis@sparkry.com/My\ Drive/dev/blacklinewebsite/requirements/content-hosting/archive

# Move old attempts
mv /Users/travis/Library/CloudStorage/GoogleDrive-travis@sparkry.com/My\ Drive/dev/blacklinewebsite/requirements/content-hosting/bearlakecamp /Users/travis/Library/CloudStorage/GoogleDrive-travis@sparkry.com/My\ Drive/dev/blacklinewebsite/requirements/content-hosting/archive/bearlakecamp-astro-tinacms

mv /Users/travis/Library/CloudStorage/GoogleDrive-travis@sparkry.com/My\ Drive/dev/blacklinewebsite/requirements/content-hosting/bearlakecamp-mockup /Users/travis/Library/CloudStorage/GoogleDrive-travis@sparkry.com/My\ Drive/dev/blacklinewebsite/requirements/content-hosting/archive/bearlakecamp-mockup

mv /Users/travis/Library/CloudStorage/GoogleDrive-travis@sparkry.com/My\ Drive/dev/blacklinewebsite/requirements/content-hosting/bearlakecamp-tina-backend /Users/travis/Library/CloudStorage/GoogleDrive-travis@sparkry.com/My\ Drive/dev/blacklinewebsite/requirements/content-hosting/archive/bearlakecamp-tina-backend

# Verify archive
ls -la /Users/travis/Library/CloudStorage/GoogleDrive-travis@sparkry.com/My\ Drive/dev/blacklinewebsite/requirements/content-hosting/archive/
```

**Verification**:
- [ ] Archive directory exists
- [ ] Old attempts moved to archive
- [ ] Original content-hosting directory cleaner
- [ ] No accidental deletion of working code

---

### Step 7: Create ARCHIVE.md Documentation (2 min)

**Action**: Document what's in the archive

```bash
cd /Users/travis/Library/CloudStorage/GoogleDrive-travis@sparkry.com/My\ Drive/dev/blacklinewebsite/requirements/content-hosting/archive
```

Create `ARCHIVE.md`:
```markdown
# Bear Lake Camp - Archived Attempts

This directory contains previous implementation attempts that were superseded by the successful Next.js + Keystatic solution.

## bearlakecamp-astro-tinacms (FAILED)
- **Dates**: October 2025
- **Stack**: Astro + TinaCMS
- **Status**: Failed - TinaCMS OAuth issues
- **Reason Archived**: Could not resolve Vercel OAuth flow
- **Lessons Learned**: TinaCMS requires complex backend configuration

## bearlakecamp-mockup (OBSOLETE)
- **Dates**: September 2025
- **Stack**: Static mockups
- **Status**: Research phase only
- **Reason Archived**: Superseded by working implementation

## bearlakecamp-tina-backend (FAILED)
- **Dates**: October 2025
- **Stack**: Separate TinaCMS backend attempt
- **Status**: Failed - same OAuth issues
- **Reason Archived**: Could not resolve separate backend approach

---

## Working Solution
Location: `/Users/travis/dev/bearlakecamp/`
Stack: Next.js 14 + Keystatic CMS
Status: Production (https://prelaunch.bearlakecamp.com)
```

---

### Step 8: Update Documentation References (5 min)

**Action**: Update any documentation that references old paths

**Files to Update**:
1. Project README.md
2. CLAUDE.md (if project-specific)
3. Any scripts that reference old path

**Search for Old Paths**:
```bash
# Search for old path references in docs
cd /Users/travis/dev/bearlakecamp
grep -r "blacklinewebsite/requirements/content-hosting" . --include="*.md" || echo "No references found"
```

**Update Strategy**:
- Replace old paths with new: `/Users/travis/dev/bearlakecamp/`
- Update relative paths to be relative from new location
- Remove references to archived attempts

---

### Step 9: Create Symlink (OPTIONAL - 1 min)

**Action**: Create symlink from old location to new for temporary compatibility

```bash
# Remove old directory
rm -rf /Users/travis/Library/CloudStorage/GoogleDrive-travis@sparkry.com/My\ Drive/dev/blacklinewebsite/requirements/content-hosting/bearlakecamp-nextjs

# Create symlink
ln -s /Users/travis/dev/bearlakecamp /Users/travis/Library/CloudStorage/GoogleDrive-travis@sparkry.com/My\ Drive/dev/blacklinewebsite/requirements/content-hosting/bearlakecamp-nextjs

# Verify symlink
ls -la /Users/travis/Library/CloudStorage/GoogleDrive-travis@sparkry.com/My\ Drive/dev/blacklinewebsite/requirements/content-hosting/bearlakecamp-nextjs
```

**Verification**:
- [ ] Symlink points to new location
- [ ] Symlink works (cd to it)
- [ ] Git commands work through symlink

**Note**: This allows gradual transition for any scripts/tools that reference old path.

---

### Step 10: Final Verification (4 min)

**Action**: Comprehensive verification of migration success

```bash
cd /Users/travis/dev/bearlakecamp

# Verify git
git status
git remote -v
git log -1

# Verify build
npm run typecheck
npm run lint
npm run build

# Verify dev server
npm run dev
# (Open browser to http://localhost:3000, verify site works, then Ctrl+C)

# Verify deployment
curl -I https://prelaunch.bearlakecamp.com
```

**Final Checklist**:
- [ ] New location at `/Users/travis/dev/bearlakecamp/` works
- [ ] Git history intact
- [ ] All tests pass
- [ ] Local dev server works
- [ ] Vercel deployment unchanged
- [ ] Old attempts archived
- [ ] Documentation updated

---

## Rollback Plan

If something goes wrong, rollback using:

### Option A: Restore from Backup Tag
```bash
cd /Users/travis/dev/bearlakecamp
git fetch --tags
git checkout backup-pre-migration-2025-11-19
```

### Option B: Re-Clone from GitHub
```bash
rm -rf /Users/travis/dev/bearlakecamp
git clone https://github.com/sparkst/bearlakecamp.git /Users/travis/dev/bearlakecamp
```

### Option C: Restore Old Location
```bash
# Remove symlink if created
rm /Users/travis/Library/CloudStorage/GoogleDrive-travis@sparkry.com/My\ Drive/dev/blacklinewebsite/requirements/content-hosting/bearlakecamp-nextjs

# Re-clone to old location
git clone https://github.com/sparkst/bearlakecamp.git /Users/travis/Library/CloudStorage/GoogleDrive-travis@sparkry.com/My\ Drive/dev/blacklinewebsite/requirements/content-hosting/bearlakecamp-nextjs
```

---

## Post-Migration Cleanup (OPTIONAL)

After 30 days of successful operation in new location:

### Remove Symlink
```bash
rm /Users/travis/Library/CloudStorage/GoogleDrive-travis@sparkry.com/My\ Drive/dev/blacklinewebsite/requirements/content-hosting/bearlakecamp-nextjs
```

### Delete Archive (if desired)
```bash
# Only if confident you'll never need old attempts
rm -rf /Users/travis/Library/CloudStorage/GoogleDrive-travis@sparkry.com/My\ Drive/dev/blacklinewebsite/requirements/content-hosting/archive
```

---

## Summary

**What Changed**:
- Working code moved from Google Drive subfolder → `/Users/travis/dev/bearlakecamp/`
- Old failed attempts → archived
- Documentation updated
- Symlink created for compatibility

**What Stayed Same**:
- Git history (fully preserved)
- GitHub repo (unchanged)
- Vercel deployment (unchanged)
- Production URL (unchanged)
- All functionality (unchanged)

**Benefits**:
- Clean separation from blackline project
- Faster filesystem access (out of Google Drive)
- Clearer project organization
- No confusion with old attempts

**Next Steps**:
1. Update your AI assistant's context with new path
2. Update any personal notes/bookmarks
3. Test thoroughly for 1 week
4. Remove symlink after confidence established
5. (Optional) Delete archive after 30 days

---

**Migration Completed**: _______________ (Date)
**Verified By**: _______________
**Issues Encountered**: None / [List any issues]
