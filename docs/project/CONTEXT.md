# Bear Lake Camp - Session Context

**Last Updated**: 2025-11-19
**Status**: Production - Live at https://prelaunch.bearlakecamp.com
**Current Phase**: Stable operation, monitoring performance

---

## Quick Facts (15-second scan)

| Attribute | Value |
|-----------|-------|
| **Project** | Bear Lake Camp website |
| **Stack** | Next.js 14 + Keystatic CMS |
| **Deployment** | Vercel Edge Network |
| **Repository** | https://github.com/sparkst/bearlakecamp |
| **Live URL** | https://prelaunch.bearlakecamp.com |
| **CMS Admin** | https://prelaunch.bearlakecamp.com/keystatic |
| **Vercel Project** | bearlakecamp (prj_pnIfeE7qPLbSzVKrqZKdxVfQ3Fnx) |
| **Branch** | main |
| **Node Version** | 20.x |
| **Package Manager** | npm |

---

## Technology Stack

### Core Framework
- **Next.js**: 14.2.0 (App Router, React Server Components)
- **React**: 18.3.0
- **TypeScript**: 5.x

### CMS & Content
- **Keystatic**: 0.5.48 (Git-based CMS)
- **@keystatic/next**: 5.0.4 (Next.js integration)
- **Markdoc**: 0.5.4 (Content rendering)

### Styling & UI
- **Tailwind CSS**: 3.4.1
- **PostCSS**: 8.x
- **Autoprefixer**: 10.x

### Features
- **Vercel Analytics**: 1.5.0
- **Vercel OG**: 0.8.5 (Dynamic social images)
- **Pagefind**: 1.4.0 (Static search)

### Testing
- **Vitest**: 2.1.5
- **Testing Library**: React 16.3.0, Jest-DOM 6.9.1

---

## Key Resources

### GitHub
- **Repository**: https://github.com/sparkst/bearlakecamp
- **Owner**: sparkst
- **Branch**: main
- **GitHub App**: bearlakecamp-cms
- **App Client ID**: Iv23li34NGRJ6tYul4RW

### Vercel
- **Dashboard**: https://vercel.com/travis-projects-3a622477/bearlakecamp
- **Project ID**: prj_pnIfeE7qPLbSzVKrqZKdxVfQ3Fnx
- **Team**: travis-projects-3a622477
- **Domain**: prelaunch.bearlakecamp.com

### Environment Variables (Vercel)
All set for Production, Preview, Development:
- `KEYSTATIC_GITHUB_CLIENT_ID`
- `KEYSTATIC_GITHUB_CLIENT_SECRET`
- `KEYSTATIC_SECRET`
- `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`
- `GITHUB_OWNER`
- `GITHUB_REPO`

### Local Development
Location: `/Users/travis/dev/bearlakecamp/` (after migration)

---

## Project Architecture

### Directory Structure
```
bearlakecamp/
├── app/                               # Next.js App Router
│   ├── api/
│   │   ├── draft/route.ts            # Draft preview
│   │   ├── exit-draft/route.ts       # Exit draft
│   │   ├── og/route.tsx              # OG image generation
│   │   └── keystatic/[...params]/    # CMS API
│   ├── [slug]/page.tsx               # Dynamic pages
│   ├── layout.tsx                    # Root layout
│   └── page.tsx                      # Homepage
├── components/
│   ├── content/                      # Content components
│   │   ├── Button.tsx
│   │   ├── Callout.tsx
│   │   ├── ImageGallery.tsx
│   │   ├── TableOfContents.tsx
│   │   └── YouTubeEmbed.tsx
│   ├── DraftModeBanner.tsx          # Draft mode indicator
│   ├── OptimizedImage.tsx           # Image optimization
│   └── SearchModal.tsx               # Search UI
├── lib/
│   ├── search/pagefind.ts           # Search integration
│   ├── og/                          # OG utilities
│   └── keystatic-reader.ts          # Content reader
├── content/                          # Markdown content (Git)
├── public/                           # Static assets
├── keystatic.config.ts               # CMS configuration
├── next.config.mjs                   # Next.js config
└── package.json                      # Dependencies
```

### Content Flow
```
Editor → /keystatic → GitHub OAuth → Edit content → Save
   ↓
Commit to GitHub
   ↓
Vercel Webhook
   ↓
Build & Deploy
   ↓
Live in ~2 minutes
```

### Features Implemented (19 SP Total)

**P0 Core (9 SP)**:
- ✅ Draft Mode Preview (3 SP) - Branch-based preview
- ✅ SEO Schema (3 SP) - Structured data, meta tags
- ✅ Image Optimization (2 SP) - Next.js Image, AVIF/WebP
- ✅ Analytics (1 SP) - Vercel Analytics

**P1 Enhanced (10 SP)**:
- ✅ Content Components (5 SP) - YouTube, Callout, Gallery, TOC, Button
- ✅ Static Search (2 SP) - Pagefind with modal UI
- ✅ Social Previews (3 SP) - Dynamic OG image generation

---

## Recent Changes

### Session 2025-11-19 (This Session)
**Focus**: Context management and project reorganization

**Actions Taken**:
- Created MIGRATION-PLAN.md for moving to `/Users/travis/dev/bearlakecamp/`
- Created this CONTEXT.md for cross-session continuity
- Created DOCUMENTATION-STANDARDS.md
- Created PROCESS-IMPROVEMENTS.md
- Planning migration from Google Drive subfolder to standalone directory

**Outcome**: Comprehensive strategic plan for better project organization

---

### Session 2025-11-14
**Focus**: CMS authentication troubleshooting

**Actions Taken**:
- Diagnosed Keystatic OAuth redirect issues
- Created diagnostic scripts
- Documented GitHub App configuration
- Updated environment variables

**Outcome**: Identified OAuth callback URL as likely issue, prepared fix

---

### Session 2025-11-12
**Focus**: Feature implementation completion

**Actions Taken**:
- Implemented all P0 and P1 features (19 SP)
- Deployed to production
- Verified all features working

**Outcome**: Full feature set live, ready for content editing

---

## Current Issues

### Issue #1: Project Organization (P1)
**Status**: In progress (this session)
**Problem**: Project buried in blacklinewebsite/requirements/content-hosting/
**Impact**: Context confusion, slow filesystem (Google Drive)
**Next Step**: Execute migration plan

---

## Common Operations

### Start Local Development
```bash
cd /Users/travis/dev/bearlakecamp
npm run dev
# Visit: http://localhost:3000
```

### Run Tests
```bash
npm run typecheck   # Type checking
npm run lint        # Linting
npm run test        # Unit tests
npm run build       # Production build
```

### Deploy to Production
```bash
git add .
git commit -m "feat: description"
git push origin main
# Vercel auto-deploys in ~2 minutes
```

### Check Deployment Status
```bash
npx vercel ls
npx vercel inspect [deployment-url]
```

### Access CMS Admin
**Local**: http://localhost:3000/keystatic
**Production**: https://prelaunch.bearlakecamp.com/keystatic

---

## Troubleshooting

### Build Failures
```bash
# Check types
npm run typecheck

# Check dependencies
npm install

# Clear cache
rm -rf .next
npm run build
```

### OAuth Issues
1. Check GitHub App settings: https://github.com/settings/apps/bearlakecamp-cms
2. Verify callback URL: `https://prelaunch.bearlakecamp.com/api/keystatic/github/oauth/callback`
3. Check environment variables in Vercel
4. Test locally first

### Deployment Issues
1. Check Vercel dashboard: https://vercel.com/travis-projects-3a622477/bearlakecamp
2. Check build logs in Vercel
3. Verify environment variables set
4. Check domain DNS settings

---

## Documentation

### Available Documents
- **README.md** - Project overview, navigation hub
- **MIGRATION-PLAN.md** - Step-by-step migration to new location
- **CONTEXT.md** - This file, session continuity
- **DOCUMENTATION-STANDARDS.md** - Documentation guidelines
- **PROCESS-IMPROVEMENTS.md** - Best practices and workflow
- **EXECUTIVE-SUMMARY.md** - High-level project overview
- **ROOT-CAUSE-ANALYSIS.md** - OAuth issue diagnosis

### Documentation Standards
- Update CONTEXT.md at end of each session
- Keep README.md under 300 lines
- Use YYYY-MM-DD date format
- Include verification checklists
- Link to related documents

---

## Next Session TODO

### Immediate (Next Session)
- [ ] Execute migration plan (MIGRATION-PLAN.md)
- [ ] Verify new location works
- [ ] Update AI assistant context with new path
- [ ] Test OAuth fix (if not done)

### Short-term 
- [ ] Remove migration symlink after confidence
- [ ] Clean up archived attempts
- [ ] Update all bookmarks/notes with new path
- [ ] Verify all documentation updated

### Long-term 
- [ ] Monitor production for any issues
- [ ] Plan content editor onboarding
- [ ] Consider custom domain migration
- [ ] Archive old attempts (if confident)

---

## Session Startup Checklist

When starting a new session:

1. **Orient** (30 sec):
   - Read "Quick Facts" section above
   - Check "Current Issues"
   - Review "Recent Changes"

2. **Verify** (1 min):
   - Check deployment status: `npx vercel ls`
   - Check git status: `git status`
   - Check branch: `git branch`

3. **Context** (1 min):
   - What was done last session? (see "Recent Changes")
   - What's the current status? (see "Current Issues")
   - What's the goal for this session?

4. **Execute**:
   - Work on tasks
   - Update CONTEXT.md at end
   - Commit changes
   - Document decisions

---

## Session Shutdown Checklist

Before ending session:

1. **Commit Changes**:
   ```bash
   git add .
   git commit -m "descriptive message"
   git push origin main
   ```

2. **Update Context**:
   - Add entry to "Recent Changes" section
   - Update "Current Issues" if resolved
   - Update "Next Session TODO"
   - Update "Last Updated" date at top

3. **Document Decisions**:
   - Create ADR (Architecture Decision Record) if needed
   - Update README.md if significant changes
   - Update other docs if affected

4. **Verify**:
   - All changes committed
   - CONTEXT.md updated
   - No uncommitted files
   - Deployment successful (if pushed)

---

## Success Metrics

### Deployment Health
- ✅ Build time: <2 minutes
- ✅ Uptime: 99.9%+
- ✅ Lighthouse score: 90+ (all categories)
- ✅ No console errors

### Content Management
- ⏳ CMS login works (pending OAuth fix)
- ⏳ Content saves successfully (pending OAuth fix)
- ⏳ Changes deploy automatically (pending OAuth fix)
- ✅ Draft preview works

### Developer Experience
- ✅ Local dev starts in <5 seconds
- ✅ Type checking passes
- ✅ Lint passes
- ✅ Tests pass

---

## Contact & Support

### Project Owner
- **Name**: Travis
- **Email**: travis@sparkry.com

### Resources
- **Keystatic Docs**: https://keystatic.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Vercel Docs**: https://vercel.com/docs
- **Vercel Support**: https://vercel.com/support

### Emergency Rollback
If production breaks:
```bash
# Revert last commit
git revert HEAD
git push origin main

# Or rollback to specific commit
git revert <commit-hash>
git push origin main
```

Vercel auto-deploys rollback in ~2 minutes.

---

**End of Context Document**

This document should be updated at the end of every session to maintain cross-session continuity.
