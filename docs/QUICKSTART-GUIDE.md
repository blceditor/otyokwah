# Bear Lake Camp - Quickstart Guide

**Your site is live!** 🎉

## 🔗 Important Links

### Public Site
- **Production**: https://bearlakecamp.vercel.app
- **Custom Domain** (once DNS configured): https://prelaunch.bearlakecamp.com

### Admin & Tools
- **Content Editor (Keystatic)**: https://bearlakecamp.vercel.app/keystatic
- **Health Check**: https://bearlakecamp.vercel.app/api/health
- **Vercel Dashboard**: https://vercel.com/travis-projects-3a622477/bearlakecamp

---

## 🚀 Quick Start (5 Minutes)

### Step 1: View Your Live Site
1. Open: **https://bearlakecamp.vercel.app**
2. You should see your homepage
3. Try navigating to different pages

### Step 2: Access Content Editor
1. Go to: **https://bearlakecamp.vercel.app/keystatic**
2. Click **"Sign in with GitHub"**
3. Authorize the Bear Lake Camp CMS app
4. You're now in the admin panel!

### Step 3: Edit Your First Page
1. In Keystatic, click **"Pages"** in sidebar
2. Click on any existing page (or create new)
3. Edit the content:
   - Change the title
   - Update body text
   - Add SEO metadata
4. Click **"Save"** (creates a git commit)
5. Vercel auto-deploys in ~60 seconds
6. Refresh your site to see changes!

---

## 📚 Feature Guides

### 🎨 Content Components (P1 Feature)

Add rich content blocks to any page:

#### YouTube Video
```markdown
In the Keystatic editor, click the "+" button and select "YouTube Embed"

Fields:
- Video ID: dQw4w9WgXcQ (from youtube.com/watch?v=...)
- Title: Optional title
- Autoplay: true/false
```

#### Callout Box
```markdown
Click "+" → "Callout"

Types:
- Info (blue)
- Warning (yellow)
- Success (green)
- Error (red)

Enter your message text
```

#### Image Gallery
```markdown
Click "+" → "Image Gallery"

Upload multiple images
Each image gets a caption
Click any image for lightbox view
```

#### Table of Contents
```markdown
Click "+" → "Table of Contents"

Automatically extracts all headings from your page
Creates clickable navigation
Updates as you scroll (highlight active section)
```

#### Call-to-Action Button
```markdown
Click "+" → "Button"

Fields:
- Text: "Register Now"
- URL: /register
- Style: Primary or Secondary
- Open in New Tab: true/false
```

---

### 🔍 SEO Schema (P0 Feature)

Every page has SEO fields:

1. **Meta Title** (max 60 chars)
   - Appears in Google search results
   - Shows in browser tab
   - Has character counter

2. **Meta Description** (max 160 chars)
   - Shows under title in Google
   - Entices clicks from search
   - Has character counter

3. **Social Share Image**
   - Upload custom image (1200x630px recommended)
   - Or auto-generate with `/api/og?title=Your+Title`
   - Shows on Facebook, Twitter, LinkedIn when shared

4. **No Index**
   - Check this to hide from Google
   - Use for draft/private pages
   - Default: unchecked (pages are indexed)

**How to use:**
1. Edit any page in Keystatic
2. Scroll to "SEO" section
3. Fill in fields
4. Save → deploys automatically

---

### 🖼️ Image Optimization (P0 Feature)

**Automatic!** All images are optimized:

- Converted to WebP/AVIF (70% smaller)
- Lazy loaded (faster page loads)
- Responsive sizes (right size for device)
- No configuration needed!

**Upload images:**
1. In Keystatic, click image field
2. Upload or select from media library
3. Images auto-saved to `/public/uploads/`
4. Optimization happens automatically on display

---

### 📊 Analytics (P0 Feature)

**Vercel Analytics is active!**

**View stats:**
1. Go to: https://vercel.com/travis-projects-3a622477/bearlakecamp/analytics
2. See:
   - Page views
   - Unique visitors
   - Top pages
   - Countries
   - Devices
   - Web Vitals (performance)

**Privacy:**
- No cookies
- No tracking scripts
- GDPR compliant
- Lightweight (<1KB)

---

### 🎬 Draft Mode Preview (P0 Feature)

Preview content changes BEFORE publishing!

**How to use:**

1. **Make changes** in Keystatic (don't save yet)
2. **Enable draft mode:**
   ```
   https://bearlakecamp.vercel.app/api/draft?secret=YOUR_SECRET&slug=/your-page
   ```
   Replace:
   - `YOUR_SECRET` with value from `.env` (DRAFT_SECRET)
   - `/your-page` with page you're editing

3. **Preview changes** - site shows draft content
4. **Exit draft mode:**
   ```
   https://bearlakecamp.vercel.app/api/exit-draft
   ```

**Visual indicator:**
- Draft mode shows yellow banner at top
- Click "Exit Draft Mode" to return to published

---

### 🔎 Search (P1 Feature)

**Pagefind Search** - lightning fast, client-side

**How it works:**
1. Build creates search index automatically
2. Index includes all page content
3. Searches happen in browser (no server)
4. Results in <100ms

**To use:**
1. Add search box to your header/nav
2. Type query
3. See instant results
4. Keyboard navigation:
   - Arrow keys to move
   - Enter to select
   - Escape to close

**Respects privacy:**
- Pages with "No Index" excluded from search
- No tracking of search queries
- Works offline after first load

---

### 📱 Social Previews (P1 Feature)

Generate custom images for social sharing:

**Automatic OG Images:**
Every page auto-generates based on title:
```
https://bearlakecamp.vercel.app/api/og?title=Summer+Camp+2025
```

**Custom OG Images:**
Upload your own in page SEO settings

**Templates available:**
1. **Default** - Title + tagline + logo
2. **Article** - Title + date + author
3. **Event** - Title + date + location

**Test your images:**
1. Generate: `/api/og?title=Test`
2. Check dimensions: 1200x630px
3. Preview: Paste URL in Facebook Debugger or Twitter Card Validator

**What shows where:**
- **Facebook**: Uses og:image
- **Twitter**: Uses twitter:image (falls back to og:image)
- **LinkedIn**: Uses og:image
- **Slack/Discord**: Uses og:image

---

## 🔧 Advanced Features

### Custom Domain Setup

Point **prelaunch.bearlakecamp.com** to Vercel:

1. **Add domain in Vercel:**
   ```bash
   npx vercel domains add prelaunch.bearlakecamp.com
   ```

2. **Get DNS records** from Vercel dashboard

3. **Update DNS** at your registrar (GoDaddy, Namecheap, etc.):
   ```
   Type: CNAME
   Name: prelaunch
   Value: cname.vercel-dns.com
   ```

4. **Wait for propagation** (5-60 minutes)

5. **SSL auto-issued** by Vercel (Let's Encrypt)

---

### Environment Variables

Configure in Vercel dashboard:

**Required for GitHub editing:**
- `GITHUB_OWNER`: sparkst
- `GITHUB_REPO`: bearlakecamp
- `KEYSTATIC_GITHUB_CLIENT_ID`: (your GitHub app ID)
- `KEYSTATIC_GITHUB_CLIENT_SECRET`: (your secret)

**Optional:**
- `DRAFT_SECRET`: Random string for draft mode security
- `NEXTAUTH_SECRET`: For NextAuth.js sessions

**How to add:**
1. Go to: https://vercel.com/travis-projects-3a622477/bearlakecamp/settings/environment-variables
2. Add variable name + value
3. Select environments (Production, Preview, Development)
4. Save
5. Redeploy to apply

---

## 🐛 Troubleshooting

### Can't login to Keystatic?
- Check GitHub OAuth app is installed: https://github.com/settings/installations
- Verify callback URL: `https://bearlakecamp.vercel.app/api/keystatic/github/oauth/callback`
- Check env vars are set in Vercel

### Images not optimizing?
- Check `next.config.js` has image config
- Verify using `<OptimizedImage>` component (not `<img>`)
- Images must be in `/public/` directory

### Search not working?
- Build creates index at build time
- Check `npm run build` completes successfully
- Pagefind requires static content (add pages first)

### Draft mode not activating?
- Verify DRAFT_SECRET matches in URL and .env
- Check `/api/draft` endpoint returns redirect (not 401)
- Clear cookies if stuck in draft mode

### SEO not showing?
- Check page has metadata fields filled
- View page source: look for `<meta property="og:title">`
- Test with: https://metatags.io or Facebook Debugger

---

## 📞 Support

### Documentation
- Next.js: https://nextjs.org/docs
- Keystatic: https://keystatic.com/docs
- Vercel: https://vercel.com/docs

### Quick Commands
```bash
# Local development
npm run dev              # Start dev server (http://localhost:3000)

# Testing
npm run typecheck       # Check TypeScript
npm run lint            # Check code quality
npm test                # Run tests
npm run build           # Production build

# Deployment
npx vercel              # Deploy to preview
npx vercel --prod       # Deploy to production
```

### File Locations
- **Content**: `/src/content/pages/*.mdx`
- **Images**: `/public/uploads/`
- **Config**: `/keystatic.config.ts`
- **Styles**: `/app/globals.css`

---

## 🎯 Common Workflows

### Adding a New Page
1. Keystatic → Pages → "+ Create Page"
2. Fill in title, slug, content
3. Add SEO metadata (title, description, image)
4. Save → auto-deploys
5. Visit: `https://bearlakecamp.vercel.app/your-slug`

### Updating Homepage
1. Keystatic → Pages → "home"
2. Edit hero image, tagline, or content
3. Add content components (YouTube, Gallery, etc.)
4. Save → deploys in ~60 seconds

### Creating Gallery Page
1. Create new page: "Summer 2024"
2. Add Image Gallery component
3. Upload 10-20 photos
4. Add captions
5. Save → visitors can click images for lightbox view

### Testing Before Publishing
1. Make changes in Keystatic (don't save)
2. Enable draft mode with secret link
3. Preview on production URL
4. Exit draft mode
5. Save when ready to publish

---

## 🚀 Next Steps

### Week 1: Content Migration
- [ ] Create all main pages (About, Programs, Contact, etc.)
- [ ] Upload all images to media library
- [ ] Set SEO for each page
- [ ] Test all pages on mobile

### Week 2: Enhanced Features
- [ ] Add YouTube videos to program pages
- [ ] Create photo galleries for past summers
- [ ] Set up call-to-action buttons (Register, Donate, etc.)
- [ ] Test social sharing on Facebook/Twitter

### Week 3: Polish & Launch
- [ ] Point custom domain (prelaunch.bearlakecamp.com)
- [ ] Test all features with team
- [ ] Get feedback from content editors
- [ ] Launch to public!

---

**Need help?** Check the implementation summary at `/IMPLEMENTATION-SUMMARY.md` or ask questions!
