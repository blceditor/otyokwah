# Bear Lake Camp - Next.js + Keystatic CMS

**Project**: bearlakecamp-nextjs (Next.js 14 + Keystatic CMS)
**Current Status**: All P0 and P1 Features Implemented (19 SP Total)
**Implementation Date**: November 19, 2025

---
 
## Implementation Summary

### Features Completed (19 Story Points Total)

#### P0 Core Features (9 SP) ✅
1. **Draft Mode Preview (3 SP)** - Complete with branch-based preview
2. **SEO Schema (3 SP)** - Keystatic fields and metadata generation
3. **Image Optimization (2 SP)** - Next.js Image component with AVIF/WebP
4. **Analytics (1 SP)** - Vercel Analytics integrated

#### P1 Enhanced Features (10 SP) ✅
5. **Content Components (5 SP)** - YouTube, Callout, Gallery, TOC, Button
6. **Static Search (2 SP)** - Pagefind integration with modal UI
7. **Social Previews (3 SP)** - Dynamic OG image generation

---

## Project Structure

```
bearlakecamp/
├── app/                               # Next.js app directory
│   ├── api/
│   │   ├── draft/route.ts            # Draft mode endpoint
│   │   ├── exit-draft/route.ts       # Exit draft endpoint
│   │   ├── og/route.tsx              # OG image generation
│   │   └── keystatic/                # CMS API routes
│   ├── [slug]/page.tsx               # Dynamic pages with SEO
│   └── layout.tsx                    # Root layout with Analytics
├── components/
│   ├── content/                      # Content components
│   │   ├── Button.tsx
│   │   ├── Callout.tsx
│   │   ├── ImageGallery.tsx
│   │   ├── TableOfContents.tsx
│   │   └── YouTubeEmbed.tsx
│   ├── DraftModeBanner.tsx          # Draft mode indicator
│   ├── OptimizedImage.tsx           # Image optimization wrapper
│   └── SearchModal.tsx               # Search UI
├── lib/
│   ├── search/pagefind.ts           # Search integration
│   ├── og/                          # OG utilities
│   │   ├── generateOGImage.ts
│   │   └── og-templates.tsx
│   └── keystatic-reader.ts          # Content reader
├── content/                          # Markdown content
├── public/                           # Static assets
├── keystatic.config.ts               # CMS configuration with SEO fields
├── next.config.mjs                   # Image optimization config
└── package.json                      # With postbuild for Pagefind
```

---

## Current Architecture

```
┌──────────────────────────────────────────────────────────┐
│                   DEPLOYMENT FLOW                         │
└──────────────────────────────────────────────────────────┘

Developer pushes to GitHub
        ↓
    sparkst/bearlakecamp (main branch)
        ↓
    Vercel Webhook
        ↓
    Builds Next.js app
        ↓
    Deploys to Edge Network
        ↓
    Live at: prelaunch.bearlakecamp.com
```

```
┌──────────────────────────────────────────────────────────┐
│                   CONTENT EDITING FLOW                    │
└──────────────────────────────────────────────────────────┘

Editor visits /keystatic
        ↓
    [CURRENTLY BROKEN HERE]
    Should: Redirect to GitHub OAuth
    Actually: No redirect happens
        ↓
    EXPECTED: Login via GitHub App (bearlakecamp-cms)
        ↓
    EXPECTED: Edit content in Keystatic UI
        ↓
    EXPECTED: Save → Commits to GitHub
        ↓
    EXPECTED: Auto-redeploy → Changes live
```

---

## Key Resources

### Vercel
- **Project**: bearlakecamp (prj_pnIfeE7qPLbSzVKrqZKdxVfQ3Fnx)
- **Domain**: prelaunch.bearlakecamp.com
- **Account**: travis-2205 (travis-projects-3a622477)

### GitHub
- **Repo**: https://github.com/sparkst/bearlakecamp
- **App**: bearlakecamp-cms (Client ID: yIv23li34NGRJ6tYul4RW)
- **Branch**: main

### Centralized Configuration
Repository and domain settings are centralized in `config/repository.yaml`:
```yaml
github:
  owner: sparkst        # GitHub owner (edit for transfer)
  repo: bearlakecamp    # Repository name
site:
  production_domain: prelaunch.bearlakecamp.com  # Production domain
```
After editing, run `npm run generate:config` to update all generated files.
See `requirements/GITHUB-REPO-TRANSFER-PLAN.md` for transfer instructions.

### Technology Stack
- **Framework**: Next.js 14.2.0 (App Router)
- **CMS**: Keystatic 0.5.48
- **Styling**: Tailwind CSS 3.4.1
- **Content**: Markdoc 0.5.4

---

## Recommended Workflow

### Step 1: Quick Diagnosis (5 min)
```bash
# Run diagnostic script
./diagnose.sh > diagnostic-output.txt

# Check GitHub App callback URL manually
# Visit: https://github.com/settings/apps/bearlakecamp-cms
```

### Step 2: Apply Most Likely Fix (2 min)
Add callback URL to GitHub App (if missing)

### Step 3: Test (5 min)
Visit `/keystatic`, verify login works, test save

### Step 4: If Still Broken (15 min)
Follow systematic diagnosis in ROOT-CAUSE-ANALYSIS.md

### Step 5: Cleanup (Optional, 30 min)
Follow CONSOLIDATION-PLAN.md to clean up resources

---

## Environment Variables Required

**Production Environment** (Vercel):
```
KEYSTATIC_GITHUB_CLIENT_ID          # GitHub App Client ID
KEYSTATIC_GITHUB_CLIENT_SECRET      # GitHub App Secret
KEYSTATIC_SECRET                    # Session secret
NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG # GitHub App URL
GITHUB_OWNER                        # From config/repository.yaml (currently: sparkst)
GITHUB_REPO                         # From config/repository.yaml (currently: bearlakecamp)
```

All must be set for **Production**, **Preview**, and **Development** environments.

---

## Success Criteria

When issue is resolved:
- ✅ Visit `/keystatic` → GitHub login button appears
- ✅ Click login → GitHub authorization screen
- ✅ Authorize → Logged into Keystatic admin
- ✅ Edit page → Save → Success message
- ✅ Check GitHub → New commit appears
- ✅ Visit site → Changes live within 2 min

---

## Support

### Running Diagnostics
```bash
# Full diagnostic report
./diagnose.sh

# Check specific components
npx vercel projects ls
npx vercel domains ls
npx vercel env ls
```

### Manual Verification
- **GitHub App**: https://github.com/settings/apps/bearlakecamp-cms
- **Vercel Dashboard**: https://vercel.com/travis-projects-3a622477/bearlakecamp
- **GitHub Repo**: https://github.com/sparkst/bearlakecamp

### Test URLs
- **Production**: https://prelaunch.bearlakecamp.com/keystatic
- **Preview**: https://bearlakecamp-nextjs.vercel.app/keystatic
- **Local**: http://localhost:3000/keystatic (after `npm run dev`)

---

## Timeline Estimate

| Task | Time | Cumulative |
|------|------|------------|
| Read QUICK-START.md | 2 min | 2 min |
| Check GitHub App callback URL | 2 min | 4 min |
| Apply fix (if needed) | 2 min | 6 min |
| Test | 5 min | 11 min |
| **Total (if quick fix works)** | | **11 min** |
| Additional diagnosis (if needed) | 15 min | 26 min |
| **Total (if systematic diagnosis needed)** | | **26 min** |
| Optional cleanup | 30 min | 56 min |
| **Total (with cleanup)** | | **56 min** |

**Most likely**: 10-15 minutes to working system

---

## Documentation

All project documentation is organized in the `docs/` folder:

- **[docs/project/](docs/project/)** — Planning, strategy, migration docs
- **[docs/technical/](docs/technical/)** — Architecture, system design
- **[docs/operations/](docs/operations/)** — Deployment, editor guides
- **[docs/analysis/](docs/analysis/)** — Audits, research reports
- **[docs/design/](docs/design/)** — UI/UX, style guides
- **[docs/tasks/](docs/tasks/)** — Phase plans, implementation tracking

## Project Structure

```
bearlakecamp/
├── README.md                          # This file - Project overview
├── CLAUDE.md                          # Development guidelines
│
├── app/                               # Next.js app directory
│   ├── api/
│   │   ├── draft/route.ts            # Draft mode endpoint
│   │   ├── exit-draft/route.ts       # Exit draft endpoint
│   │   ├── og/route.tsx              # OG image generation
│   │   └── keystatic/                # CMS API routes
│   ├── [slug]/page.tsx               # Dynamic pages with SEO
│   └── layout.tsx                    # Root layout with Analytics
│
├── components/
│   ├── content/                      # Content components
│   ├── DraftModeBanner.tsx          # Draft mode indicator
│   ├── OptimizedImage.tsx           # Image optimization wrapper
│   └── SearchModal.tsx               # Search UI
│
├── lib/
│   ├── search/pagefind.ts           # Search integration
│   ├── og/                          # OG utilities
│   └── keystatic-reader.ts          # Content reader
│
├── content/pages/                     # Markdown content
├── public/                           # Static assets
├── docs/                             # Project documentation
├── keystatic.config.ts               # CMS configuration
└── package.json
```

---

## Additional Context

### Important Note: This is NOT the TinaCMS project

Earlier documentation (EXECUTIVE-SUMMARY.md in parent folder) references a TinaCMS + Astro project. **This is a DIFFERENT project** using:
- **Next.js** (not Astro)
- **Keystatic** (not TinaCMS)

The issues are different, though some patterns are similar (GitHub OAuth, custom domains, etc.).

### Migration History

Based on the primer document in parent folder, this appears to be:
1. Original: WordPress + Elementor
2. Attempted: Astro + TinaCMS (see earlier docs)
3. Current: Next.js + Keystatic (this deployment)

---

## Key Contacts & URLs

### GitHub
- **Settings**: https://github.com/settings
- **Apps**: https://github.com/settings/apps
- **Repo**: https://github.com/sparkst/bearlakecamp

### Vercel
- **Dashboard**: https://vercel.com
- **Projects**: https://vercel.com/travis-projects-3a622477
- **Domains**: https://vercel.com/travis-projects-3a622477/domains

### Documentation
- **Next.js**: https://nextjs.org/docs
- **Keystatic**: https://keystatic.com/docs
- **Vercel**: https://vercel.com/docs

---

## Next Steps

---

**Last Updated**: 2025-11-14
**Status**: Awaiting user action
**Expected Resolution**: 10-30 minutes
