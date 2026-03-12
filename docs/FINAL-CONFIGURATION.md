# Final Configuration Documentation
**Project**: Bear Lake Camp Website
**CMS**: Keystatic
**Hosting**: Vercel + GitHub
**Date**: 2025-11-14

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      PRODUCTION ARCHITECTURE                 │
└─────────────────────────────────────────────────────────────┘

   ┌──────────────────────────┐
   │   End Users (Visitors)   │
   └────────────┬─────────────┘
                │
                │ HTTPS
                ↓
   ┌──────────────────────────────────────┐
   │  prelaunch.bearlakecamp.com          │
   │  (Custom Domain)                     │
   └────────────┬─────────────────────────┘
                │
                │ DNS CNAME
                ↓
   ┌──────────────────────────────────────┐
   │  Vercel Edge Network                 │
   │  (Global CDN)                        │
   └────────────┬─────────────────────────┘
                │
                │ Routes to
                ↓
   ┌──────────────────────────────────────┐
   │  Vercel Project: bearlakecamp        │
   │  ID: prj_pnIfeE7qPLbSzVKrqZKdxVfQ3Fnx│
   │                                      │
   │  ┌────────────────────────────────┐ │
   │  │  Next.js 14 App Router         │ │
   │  │  - Static pages (/page.tsx)    │ │
   │  │  - API routes (/api/*)         │ │
   │  │  - Keystatic admin UI          │ │
   │  └────────────────────────────────┘ │
   └────────────┬─────────────────────────┘
                │
                │ On content save
                ↓
   ┌──────────────────────────────────────┐
   │  GitHub App: bearlakecamp-cms        │
   │  (OAuth Authentication)              │
   └────────────┬─────────────────────────┘
                │
                │ Commits content
                ↓
   ┌──────────────────────────────────────┐
   │  GitHub Repository                   │
   │  sparkst/bearlakecamp                │
   │                                      │
   │  ┌────────────────────────────────┐ │
   │  │  /content/pages/*.mdoc         │ │
   │  │  /public/uploads/*             │ │
   │  └────────────────────────────────┘ │
   └────────────┬─────────────────────────┘
                │
                │ Webhook triggers
                ↓
   ┌──────────────────────────────────────┐
   │  Vercel Auto-Deploy                  │
   │  (Rebuilds site on commit)           │
   └──────────────────────────────────────┘


   ┌──────────────────────────────────────┐
   │  Content Editors (Staff)             │
   │  Visit: /keystatic                   │
   │  Login via GitHub OAuth              │
   │  Edit content in visual UI           │
   │  Save → Commits to GitHub            │
   └──────────────────────────────────────┘
```

---

## 2. Vercel Configuration

### Project Details
```yaml
Name: bearlakecamp
Project ID: prj_pnIfeE7qPLbSzVKrqZKdxVfQ3Fnx
Organization: travis-projects-3a622477 (team_VJ8ItYXfMYEeQRTSPvVVriBf)
Plan: Hobby (Free Tier)
Framework: Next.js
Build Command: npm run build
Output Directory: .next
Install Command: npm install
Node Version: 20.x (default)
```

### Git Integration
```yaml
Repository: sparkst/bearlakecamp
Branch: main
Auto-Deploy: Enabled
Deploy on Commit: Yes
Deploy on Pull Request: Yes (Preview deployments)
```

### Domains
```yaml
Production Domain: prelaunch.bearlakecamp.com
Auto-generated Aliases:
  - bearlakecamp-nextjs.vercel.app
  - bearlakecamp-nextjs-travis-projects-3a622477.vercel.app
  - bearlakecamp-nextjs-git-main-travis-projects-3a622477.vercel.app
```

### Environment Variables (Production)

| Variable Name | Value (Encrypted) | Scope | Purpose |
|---------------|-------------------|-------|---------|
| `KEYSTATIC_GITHUB_CLIENT_ID` | `yIv23li34...` | Production, Preview, Development | GitHub App OAuth Client ID |
| `KEYSTATIC_GITHUB_CLIENT_SECRET` | `80348...` | Production, Preview, Development | GitHub App OAuth Secret |
| `KEYSTATIC_SECRET` | `dWDIZ...` | Production, Preview, Development | Keystatic session secret |
| `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` | `https://github.com/settings/apps/bearlakecamp-cms` | Production, Preview, Development | GitHub App URL (public) |
| `GITHUB_OWNER` | `sparkst` | Production, Preview, Development | GitHub repository owner |
| `GITHUB_REPO` | `bearlakecamp` | Production, Preview, Development | GitHub repository name |

**Note**: All variables must be set for **Production**, **Preview**, and **Development** environments.

---

## 3. GitHub Configuration

### Repository
```yaml
URL: https://github.com/sparkst/bearlakecamp
Owner: sparkst
Name: bearlakecamp
Branch: main
Visibility: Private (assumed)
```

### GitHub App: bearlakecamp-cms
```yaml
App Name: bearlakecamp-cms
App URL: https://github.com/settings/apps/bearlakecamp-cms
Client ID: yIv23li34NGRJ6tYul4RW
Client Secret: 803489f710f1789bec2d0422ce98c0e7cbc41515

Callback URLs:
  - https://prelaunch.bearlakecamp.com/api/keystatic/github/oauth/callback
  - https://bearlakecamp-nextjs.vercel.app/api/keystatic/github/oauth/callback
  - http://localhost:3000/api/keystatic/github/oauth/callback

Permissions:
  Repository Permissions:
    - Contents: Read & Write (for committing content)
    - Metadata: Read-only (for repo info)

Installed On:
  - sparkst/bearlakecamp

Webhook URL: (Optional) https://prelaunch.bearlakecamp.com/api/webhooks/github
```

**CRITICAL**: Callback URLs must include ALL domains where Keystatic admin will be accessed:
- Production domain (prelaunch.bearlakecamp.com)
- Vercel preview domains (bearlakecamp-nextjs.vercel.app)
- Local development (localhost:3000)

---

## 4. Next.js Project Configuration

### package.json Dependencies
```json
{
  "dependencies": {
    "@keystatic/core": "^0.5.48",
    "@keystatic/next": "^5.0.4",
    "@markdoc/markdoc": "^0.5.4",
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0"
  },
  "devDependencies": {
    "@types/jsdom": "^27.0.0",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.0.1",
    "eslint": "^8",
    "eslint-config-next": "^14.2.0",
    "jsdom": "^27.1.0",
    "postcss": "^8",
    "tailwindcss": "^3.4.1",
    "typescript": "^5",
    "vitest": "^2.1.5"
  },
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest",
    "typecheck": "tsc --noEmit"
  }
}
```

### File Structure
```
bearlakecamp-nextjs/
├── app/
│   ├── api/
│   │   ├── health/
│   │   │   └── route.ts                    # Health check endpoint
│   │   └── keystatic/
│   │       └── [...params]/
│   │           └── route.ts                # Keystatic API routes
│   ├── keystatic/
│   │   ├── [[...params]]/
│   │   │   └── page.tsx                    # Keystatic admin UI
│   │   ├── keystatic.tsx                   # Keystatic client component
│   │   └── layout.tsx                      # Admin layout
│   ├── layout.tsx                          # Root layout
│   └── page.tsx                            # Homepage
├── content/
│   └── pages/
│       └── *.mdoc                          # Content files (Git-managed)
├── public/
│   └── uploads/                            # Media files
├── keystatic.config.ts                     # Keystatic configuration
├── next.config.mjs                         # Next.js configuration
├── tailwind.config.ts                      # Tailwind CSS config
├── tsconfig.json                           # TypeScript config
├── .env.local                              # Local environment variables (not committed)
└── package.json                            # Dependencies
```

---

## 5. Keystatic Configuration (keystatic.config.ts)

### Storage Mode Logic
```typescript
function getStorageConfig() {
  // Development: Always use local storage
  if (process.env.NODE_ENV === 'development') {
    return { kind: 'local' as const };
  }

  // Production: Use GitHub storage if OAuth configured
  // Simplified logic - no VERCEL_URL detection needed
  if (process.env.KEYSTATIC_GITHUB_CLIENT_ID) {
    return {
      kind: 'github' as const,
      repo: {
        owner: process.env.GITHUB_OWNER || 'sparkst',
        name: process.env.GITHUB_REPO || 'bearlakecamp',
      },
    };
  }

  // Fallback: Local storage (read-only)
  return { kind: 'local' as const };
}
```

**Behavior**:
- **Local development** (`npm run dev`): Uses local filesystem, no GitHub authentication needed
- **Production** (prelaunch.bearlakecamp.com): Uses GitHub storage, requires GitHub OAuth login
- **Preview deployments** (*.vercel.app): Uses GitHub storage if `KEYSTATIC_GITHUB_CLIENT_ID` is set

### Collections Schema
```typescript
export default config({
  storage: getStorageConfig(),

  collections: {
    pages: collection({
      label: 'Pages',
      slugField: 'title',
      path: 'content/pages/*',
      format: { contentField: 'body' },
      schema: {
        title: fields.slug({ name: { label: 'Page Title' } }),
        heroImage: fields.image({
          label: 'Hero Image',
          directory: 'public/uploads',
          publicPath: '/uploads/',
        }),
        heroTagline: fields.text({ label: 'Hero Tagline' }),
        body: fields.markdoc({ label: 'Page Content' }),
      },
    }),
  },
});
```

---

## 6. Content Workflow

### For Content Editors

**Step 1: Access Admin**
```
1. Visit: https://prelaunch.bearlakecamp.com/keystatic
2. Click "Login with GitHub"
3. Authorize bearlakecamp-cms app (first time only)
4. Redirected to Keystatic admin dashboard
```

**Step 2: Edit Content**
```
1. Navigate to "Pages" collection
2. Click page to edit (e.g., "Home")
3. Edit content in visual editor:
   - Update title
   - Change hero image
   - Edit body content
4. Click "Save"
```

**Step 3: Content Saved**
```
1. Keystatic commits changes to GitHub
2. Commit message: "Update content/pages/<slug>.mdoc"
3. GitHub webhook triggers Vercel rebuild
4. New deployment goes live in 1-2 minutes
```

**Step 4: Verify Changes**
```
1. Visit: https://prelaunch.bearlakecamp.com
2. Verify changes are live
3. Check GitHub commit: https://github.com/sparkst/bearlakecamp/commits/main
```

---

## 7. Deployment Workflow

### Automatic Deployments (Git Push)
```
1. Developer pushes to main branch
   $ git push origin main

2. GitHub webhook notifies Vercel

3. Vercel starts build:
   - Installs dependencies (npm install)
   - Builds Next.js app (npm run build)
   - Generates static pages
   - Deploys to edge network

4. Deployment completes (1-2 minutes)

5. New deployment auto-promoted to production
   URL: https://prelaunch.bearlakecamp.com
```

### Manual Deployments (Vercel CLI)
```bash
# Deploy to preview
npx vercel

# Deploy to production
npx vercel --prod

# Check deployment status
npx vercel ls

# View deployment logs
npx vercel logs prelaunch.bearlakecamp.com
```

---

## 8. Local Development Setup

### Initial Setup
```bash
# Clone repository
git clone https://github.com/sparkst/bearlakecamp.git
cd bearlakecamp

# Install dependencies
npm install

# Pull environment variables from Vercel (first time)
npx vercel env pull .env.local

# Start dev server
npm run dev

# Visit admin UI
http://localhost:3000/keystatic
```

### Development Mode
```
- Storage: Local filesystem (content/pages/*.mdoc)
- No GitHub authentication required
- Changes save instantly
- No rebuild needed (hot reload)
```

### Production Mode Testing
```bash
# Build production bundle
npm run build

# Start production server
npm start

# Test at http://localhost:3000
```

---

## 9. DNS Configuration (For Custom Domain)

### Required DNS Records

**For prelaunch.bearlakecamp.com:**
```
Type: CNAME
Name: prelaunch
Value: cname.vercel-dns.com
TTL: 3600 (or auto)
```

**Verification**:
```bash
# Check DNS propagation
dig prelaunch.bearlakecamp.com CNAME

# Expected output:
prelaunch.bearlakecamp.com. 3600 IN CNAME cname.vercel-dns.com.
```

**Alternative (A Record)**:
```
Type: A
Name: prelaunch
Value: 76.76.21.21 (Vercel IP)
TTL: 3600
```

---

## 10. Security Considerations

### Environment Variables
- ✅ Never commit `.env.local` or `.env.production` to Git
- ✅ Use Vercel's encrypted environment variable storage
- ✅ Rotate `KEYSTATIC_SECRET` periodically (every 6-12 months)
- ✅ Rotate GitHub App client secret if compromised

### GitHub App Permissions
- ✅ Grant only necessary permissions (Contents: Read & Write)
- ✅ Limit installed repositories to sparkst/bearlakecamp only
- ✅ Review app access logs periodically

### Vercel Security
- ✅ Enable Vercel Authentication Protection (optional, for staging)
- ✅ Use Vercel's automatic HTTPS (TLS 1.3)
- ✅ Enable Vercel's DDoS protection (included)

---

## 11. Monitoring & Maintenance

### Health Checks
```bash
# Check API health
curl https://prelaunch.bearlakecamp.com/api/health

# Expected response:
{"status":"ok","timestamp":"2025-11-14T18:00:00.000Z"}
```

### Deployment Monitoring
```bash
# View recent deployments
npx vercel ls

# View deployment logs
npx vercel logs prelaunch.bearlakecamp.com --follow

# Check build errors
npx vercel inspect <deployment-url>
```

### Content Monitoring
```bash
# Verify latest commit
git log -1

# View GitHub commit history
https://github.com/sparkst/bearlakecamp/commits/main
```

---

## 12. Troubleshooting Guide

### Issue: "Cannot save pages" in Keystatic

**Diagnosis**:
1. Check storage mode in browser console:
   ```javascript
   // Should see: Storage mode: github
   ```
2. Check if logged in (GitHub avatar in top right)

**Fix**:
1. If not logged in → Click "Login with GitHub"
2. If login fails → Verify GitHub App callback URL includes current domain
3. If storage mode is "local" → Check `KEYSTATIC_GITHUB_CLIENT_ID` env var

---

### Issue: "No GitHub login prompt appears"

**Diagnosis**:
```bash
# Check environment variables
npx vercel env ls | grep KEYSTATIC

# Check GitHub App callback URLs
Visit: https://github.com/settings/apps/bearlakecamp-cms
```

**Fix**:
1. Add missing callback URL to GitHub App
2. Ensure `KEYSTATIC_GITHUB_CLIENT_ID` is set in Production environment
3. Redeploy: `npx vercel --prod`

---

### Issue: "Build fails on Vercel"

**Diagnosis**:
```bash
# Check build logs
npx vercel logs <deployment-url>

# Common issues:
# - TypeScript errors
# - Missing dependencies
# - Environment variable not set
```

**Fix**:
```bash
# Fix locally first
npm run typecheck
npm run lint
npm run build

# If successful, push to GitHub
git push
```

---

### Issue: "Custom domain not working"

**Diagnosis**:
```bash
# Check DNS
dig prelaunch.bearlakecamp.com

# Check domain assignment
npx vercel domains ls
```

**Fix**:
1. Verify DNS CNAME points to `cname.vercel-dns.com`
2. Verify domain assigned to correct Vercel project
3. Wait for DNS propagation (up to 48 hours, usually 5-10 minutes)

---

## 13. Backup & Disaster Recovery

### Content Backup
```bash
# Content is backed up in Git automatically
# Every save creates a new commit

# To restore previous version:
git log content/pages/<slug>.mdoc  # Find commit hash
git checkout <commit-hash> content/pages/<slug>.mdoc
git commit -m "Restore previous version"
git push
```

### Configuration Backup
```bash
# Backup environment variables
npx vercel env pull .env.backup

# Store securely (1Password, encrypted vault, etc.)
# DO NOT commit to Git
```

### Full Restore
```bash
# Clone repository
git clone https://github.com/sparkst/bearlakecamp.git

# Restore environment variables
npx vercel env add KEYSTATIC_GITHUB_CLIENT_ID production
# ... (repeat for all variables)

# Link to Vercel project
npx vercel link

# Deploy
npx vercel --prod
```

---

## 14. Performance Optimization

### Current Performance
- **Lighthouse Score**: TBD (run audit after launch)
- **First Contentful Paint**: Target < 1.5s
- **Time to Interactive**: Target < 3.5s

### Optimizations Applied
- ✅ Next.js automatic code splitting
- ✅ Image optimization via Next.js `<Image>`
- ✅ Tailwind CSS purging (unused styles removed)
- ✅ Vercel Edge Network CDN (global caching)

### Future Optimizations (Optional)
- [ ] Enable Next.js Incremental Static Regeneration
- [ ] Add image compression pipeline
- [ ] Implement lazy loading for below-fold content
- [ ] Add service worker for offline support

---

## 15. Cost Breakdown (Estimated)

### Current Costs (Hobby Plan)
```
Vercel Hobby Plan:          $0/month (free tier)
- 100 GB bandwidth/month
- Unlimited deployments
- Automatic HTTPS
- Edge Network

GitHub:                     $0/month (free for public repos)
                            $4/month (if private repo on paid plan)

Total:                      $0-4/month
```

### If Scaling Needed (Pro Plan)
```
Vercel Pro Plan:            $20/month/user
- 1 TB bandwidth/month
- Advanced analytics
- Password protection
- Team collaboration

Total:                      $20-24/month
```

---

## 16. Support & Resources

### Documentation
- **Next.js Docs**: https://nextjs.org/docs
- **Keystatic Docs**: https://keystatic.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Markdoc Docs**: https://markdoc.dev/docs

### Community Support
- **Next.js Discord**: https://discord.com/invite/nextjs
- **Keystatic Discord**: https://keystatic.com/discord
- **Vercel Community**: https://github.com/vercel/next.js/discussions

### Emergency Contacts
- **Vercel Support**: support@vercel.com (Pro plan only)
- **GitHub Support**: https://support.github.com

---

## 17. Change Log

| Date | Change | Author | Commit |
|------|--------|--------|--------|
| 2025-11-14 | Initial deployment configuration | travis-2205 | - |
| 2025-11-14 | Added Keystatic CMS integration | travis-2205 | - |
| 2025-11-14 | Configured GitHub OAuth | travis-2205 | - |
| 2025-11-14 | Deployed to prelaunch.bearlakecamp.com | travis-2205 | - |

---

**Document Version**: 1.0
**Last Updated**: 2025-11-14
**Status**: CURRENT
**Next Review**: 2025-12-14 (30 days)
