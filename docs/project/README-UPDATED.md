# Bear Lake Camp Website

Modern church camp website with Git-based content management system.

**Status**: Production | **Stack**: Next.js 14 + Keystatic CMS | **Updated**: 2025-11-19

---

## Quick Facts

| Attribute | Value |
|-----------|-------|
| **Live URL** | https://prelaunch.bearlakecamp.com |
| **Repository** | https://github.com/sparkst/bearlakecamp |
| **CMS Admin** | https://prelaunch.bearlakecamp.com/keystatic |
| **Deployment** | Vercel (auto-deploy from main branch) |
| **Framework** | Next.js 14.2.0 (App Router) |
| **CMS** | Keystatic 0.5.48 (Git-based) |
| **Node Version** | 20.x |

---

## Quick Start

### Prerequisites
- Node.js 20.x or later
- npm 10.x or later
- Git

### Installation (5 min)

```bash
# Clone repository
git clone https://github.com/sparkst/bearlakecamp.git
cd bearlakecamp

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# Edit .env.local with your values (see Environment Variables below)

# Start development server
npm run dev
```

Visit http://localhost:3000 to see the site.

### Environment Variables

Create `.env.local` with:

```bash
# GitHub OAuth (for Keystatic CMS)
KEYSTATIC_GITHUB_CLIENT_ID=your_github_app_client_id
KEYSTATIC_GITHUB_CLIENT_SECRET=your_github_app_secret
KEYSTATIC_SECRET=random_string_for_sessions

# GitHub Repository
NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG=your-github-app-slug
GITHUB_OWNER=sparkst
GITHUB_REPO=bearlakecamp
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for how to obtain these values.

---

## Project Overview

### What This Is

A modern, performant church camp website with:
- **Static generation** for fast page loads
- **Git-based CMS** for content editing without a database
- **WYSIWYG editing** via Keystatic admin interface
- **Auto-deployment** when content is saved
- **SEO optimization** with structured data and meta tags
- **Search functionality** powered by Pagefind
- **Image optimization** with Next.js Image component

### Architecture

```
┌─────────────┐      ┌──────────┐      ┌─────────┐
│   Editor    │─────▶│ Keystatic│─────▶│ GitHub  │
│  (Browser)  │      │   CMS    │      │   Repo  │
└─────────────┘      └──────────┘      └────┬────┘
                                             │
                                             ▼
                                        ┌─────────┐
                                        │ Vercel  │
                                        │  Build  │
                                        └────┬────┘
                                             ▼
                                        ┌─────────┐
                                        │  Live   │
                                        │  Site   │
                                        └─────────┘
```

**Content Flow**:
1. Editor logs into `/keystatic` admin
2. Edits content in WYSIWYG interface
3. Saves → Commits to GitHub repository
4. Vercel webhook triggers automatic build
5. Changes live in ~2 minutes

---

## Technology Stack

### Core
- **Next.js 14.2.0** - React framework with App Router
- **React 18.3.0** - UI library
- **TypeScript 5.x** - Type safety

### Content Management
- **Keystatic 0.5.48** - Git-based CMS
- **Markdoc 0.5.4** - Content rendering

### Styling
- **Tailwind CSS 3.4.1** - Utility-first CSS
- **PostCSS** - CSS processing

### Features
- **Vercel Analytics** - Traffic analytics
- **Vercel OG** - Dynamic social preview images
- **Pagefind** - Client-side static search

### Testing
- **Vitest** - Unit testing
- **Testing Library** - React component testing

---

## Project Structure

```
bearlakecamp/
├── app/                           # Next.js App Router
│   ├── api/
│   │   ├── draft/                # Draft preview API
│   │   ├── og/                   # OG image generation
│   │   └── keystatic/            # CMS API routes
│   ├── keystatic/                # CMS admin UI
│   ├── [slug]/                   # Dynamic page routes
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Homepage
│
├── components/
│   ├── content/                  # Content components
│   │   ├── Button.tsx           # CTA buttons
│   │   ├── Callout.tsx          # Info/warning boxes
│   │   ├── ImageGallery.tsx     # Photo galleries
│   │   ├── TableOfContents.tsx  # Auto-generated TOC
│   │   └── YouTubeEmbed.tsx     # Embedded videos
│   ├── DraftModeBanner.tsx      # Draft mode indicator
│   ├── OptimizedImage.tsx       # Optimized images
│   └── SearchModal.tsx          # Search UI
│
├── lib/
│   ├── search/                   # Search utilities
│   ├── og/                       # OG image utilities
│   └── keystatic-reader.ts      # Content reading
│
├── content/                       # Markdown content files
│   └── pages/                    # Page content (Git-managed)
│
├── public/                        # Static assets
│   └── uploads/                  # Media uploads
│
├── keystatic.config.ts            # CMS configuration
├── next.config.mjs                # Next.js configuration
├── tailwind.config.ts             # Tailwind configuration
└── package.json                   # Dependencies
```

---

## Features Implemented

### P0 Core Features (9 Story Points)
- ✅ **Draft Mode Preview** (3 SP) - Preview unpublished content
- ✅ **SEO Schema** (3 SP) - Structured data, meta tags, sitemap
- ✅ **Image Optimization** (2 SP) - AVIF/WebP formats, responsive images
- ✅ **Analytics** (1 SP) - Vercel Analytics integration

### P1 Enhanced Features (10 Story Points)
- ✅ **Content Components** (5 SP) - YouTube, Callout, Gallery, TOC, Button
- ✅ **Static Search** (2 SP) - Pagefind-powered search with modal UI
- ✅ **Social Previews** (3 SP) - Dynamic OG image generation

**Total**: 19 Story Points implemented

---

## Development

### Available Commands

```bash
# Development
npm run dev          # Start dev server (http://localhost:3000)

# Building
npm run build        # Build for production
npm run start        # Start production server

# Quality
npm run typecheck    # TypeScript type checking
npm run lint         # ESLint code linting
npm run test         # Run tests with Vitest

# Search
npm run postbuild    # Generate Pagefind index (auto-runs after build)
```

### Common Development Tasks

**Add a new page**:
1. Visit http://localhost:3000/keystatic
2. Create new page in CMS
3. Save → Auto-commits to Git

**Add a new component**:
1. Create in `components/content/YourComponent.tsx`
2. Add to Markdoc config in `keystatic.config.ts`
3. Use in content via `{% yourcomponent /%}`

**Update styles**:
1. Edit `app/globals.css` for global styles
2. Use Tailwind classes in components
3. Extend Tailwind in `tailwind.config.ts` if needed

---

## Deployment

### Automatic Deployment

**Trigger**: Push to `main` branch or merge PR

**Process**:
1. Push code to GitHub
2. Vercel webhook triggered
3. Build runs (~2 minutes)
4. Deploy to production
5. Live at https://prelaunch.bearlakecamp.com

**Verification**:
```bash
# Check latest deployment
npx vercel ls

# Check build logs
npx vercel logs
```

### Manual Deployment

If needed:
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
npx vercel --prod
```

### Environment Variables

Set in Vercel dashboard for **Production**, **Preview**, and **Development**:
- `KEYSTATIC_GITHUB_CLIENT_ID`
- `KEYSTATIC_GITHUB_CLIENT_SECRET`
- `KEYSTATIC_SECRET`
- `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`
- `GITHUB_OWNER`
- `GITHUB_REPO`

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed setup.

---

## Content Management

### Accessing CMS Admin

**Local**: http://localhost:3000/keystatic
**Production**: https://prelaunch.bearlakecamp.com/keystatic

### Editing Content

1. **Login** - Authenticate via GitHub OAuth
2. **Edit** - Use WYSIWYG editor to modify content
3. **Save** - Changes commit to GitHub
4. **Deploy** - Vercel auto-builds and deploys

### Content Structure

Content stored in `content/pages/` as Markdown files with frontmatter:

```markdown
---
title: About Us
description: Learn about Bear Lake Camp
---

# About Us

Content here with Markdoc components:

{% callout type="info" %}
Important information
{% /callout %}

{% youtube id="dQw4w9WgXcQ" /%}
```

---

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test
npm test src/components/Button.spec.tsx
```

### Test Structure

Tests co-located with components:
```
components/
├── Button.tsx
└── Button.spec.tsx
```

---

## Documentation

### Available Documentation

| Document | Purpose |
|----------|---------|
| **README.md** (this file) | Project overview, quick start |
| **CONTEXT.md** | Session context for cross-session continuity |
| **/docs/MIGRATION-PLAN.md** | Plan for moving to new directory |
| **DOCUMENTATION-STANDARDS.md** | Documentation best practices |
| **/docs/PROCESS-IMPROVEMENTS.md** | Workflow and efficiency improvements |
| **DEPLOYMENT.md** | Detailed deployment guide |
| **ARCHITECTURE.md** | System architecture and decisions |

### Documentation Philosophy

- **README.md** - Your starting point, navigation hub
- **CONTEXT.md** - For quick session orientation (<2 min)
- **Specialized docs** - Deep dives on specific topics

---

## Current Status

### What's Working
- ✅ Production deployment at https://prelaunch.bearlakecamp.com
- ✅ All P0 and P1 features implemented (19 SP)
- ✅ Automatic deployment from GitHub
- ✅ Content components (YouTube, Callout, Gallery, etc.)
- ✅ Static search with Pagefind
- ✅ SEO optimization
- ✅ Image optimization

### Known Issues
- ⏳ OAuth login for Keystatic CMS (under investigation)
  - See CONTEXT.md Issue #1 for details
  - Fix in progress

### Next Steps
- [ ] Fix Keystatic OAuth login
- [ ] Execute migration to `/Users/travis/dev/bearlakecamp/`
- [ ] Content editor onboarding
- [ ] Custom domain migration (if planned)

---

## Support & Resources

### Key Contacts
- **Project Owner**: Travis (travis@sparkry.com)
- **Repository**: https://github.com/sparkst/bearlakecamp

### External Resources
- **Next.js Docs**: https://nextjs.org/docs
- **Keystatic Docs**: https://keystatic.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Tailwind Docs**: https://tailwindcss.com/docs

### Troubleshooting

**Build fails**:
```bash
npm run typecheck  # Check for type errors
npm run lint       # Check for lint errors
rm -rf .next && npm run build  # Clear cache and rebuild
```

**CMS not accessible**:
1. Check environment variables in Vercel
2. Verify GitHub App OAuth settings
3. Check browser console for errors
4. See CONTEXT.md for known issues

**Search not working**:
```bash
npm run build  # Ensure Pagefind index generated
# Check public/pagefind/ directory exists
```

---

## Contributing

### Development Workflow

1. **Create branch**: `git checkout -b feature/your-feature`
2. **Make changes**: Edit code, write tests
3. **Test**: Run `npm run typecheck && npm run lint && npm test`
4. **Commit**: Use conventional commits (e.g., `feat: add new component`)
5. **Push**: `git push origin feature/your-feature`
6. **PR**: Create pull request on GitHub

### Code Standards

- **TypeScript**: Strict mode, no `any` types
- **Testing**: Co-locate tests with components
- **Linting**: ESLint rules enforced
- **Formatting**: Prettier (auto-format on save)
- **Commits**: Conventional Commits format

---

## License

[Add license information]

---

## Acknowledgments

- Built with Next.js and Keystatic
- Deployed on Vercel
- Styling with Tailwind CSS

---

**For detailed session context and recent changes, see [CONTEXT.md](./CONTEXT.md)**

**For comprehensive documentation standards, see [DOCUMENTATION-STANDARDS.md](./DOCUMENTATION-STANDARDS.md)**

**For migration plan, see [MIGRATION-PLAN.md](./MIGRATION-PLAN.md)**
