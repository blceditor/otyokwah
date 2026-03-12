# Production Cutover Plan: www.bearlakecamp.com

> **Status**: Planned
> **DNS Provider**: Cloudflare (proxy mode, orange cloud)
> **Current Production**: WordPress on Dreamhost
> **New Production**: Next.js + Keystatic on Vercel
> **Current Staging**: prelaunch.bearlakecamp.com → Vercel

**Strategy**: Set up and validate everything on Vercel's temporary URL first. The actual cutover is just a DNS flip — the last step.

------------------------------------------------------------------------

## Architecture After Cutover

```
User → Cloudflare (proxy/WAF/CDN) → Vercel (Next.js + Keystatic)

Domains:
  www.bearlakecamp.com     → Production (main branch)
  bearlakecamp.com         → Redirects to www
  prelaunch.bearlakecamp.com → Staging (staging branch)
```

------------------------------------------------------------------------

## Phase 1: Vercel Production Setup (before any DNS changes)

Everything in this phase uses the Vercel temp URL (e.g., `bearlakecamp-xxx.vercel.app`). WordPress on Dreamhost continues serving live traffic — zero impact to the current site.

### 1.1 Record Current DNS for Rollback

-   [ ] Note current Dreamhost server IP from Cloudflare `@` A record: `___.___.___.__`
-   [ ] Note current Dreamhost hostname from Cloudflare `www` CNAME: `_______________`

### 1.2 Add Production Domains to Vercel

In the Vercel dashboard:
1. Go to Project → Settings → Domains
2. Add `www.bearlakecamp.com`
3. Add `bearlakecamp.com` (Vercel will auto-configure apex → www redirect)
4. Vercel will show **"Awaiting DNS configuration"** — this is expected and fine. Leave it.

### 1.3 Configure OAuth & Webhooks for Temp URL

-   [ ] **Keystatic GitHub OAuth app**: Add the Vercel temp URL as an additional authorized callback URL (keep the prelaunch URL too)
-   [ ] **GitHub webhook**: Confirm it fires for the Vercel deployment (same project, so this should already work)
-   [ ] **Environment variables**: Verify all env vars are set in Vercel for the production deployment (not just preview)

### 1.4 Validate on Vercel Temp URL

Test everything against the temp URL (`bearlakecamp-xxx.vercel.app`):

-   [ ] All critical pages render correctly
-   [ ] Images load (check paths)
-   [ ] Keystatic CMS login works
-   [ ] Content updates via Keystatic appear on the site
-   [ ] Admin nav strip appears when logged in
-   [ ] GitHub webhook triggers content revalidation
-   [ ] No hardcoded domain references that would break on the production URL

### 1.5 Pre-Configure Cloudflare (no traffic impact)

These changes can be made now — they won't affect WordPress traffic since DNS still points to Dreamhost.

**SSL/TLS settings:**
1. Go to **SSL/TLS → Overview**
2. Set encryption mode to **Full (Strict)** (required when proxying to Vercel)
3. Go to **SSL/TLS → Edge Certificates**
4. Confirm "Always Use HTTPS" is enabled
5. Confirm "Automatic HTTPS Rewrites" is enabled

**Cache Rules** (optional, configure now so they're ready):

| Rule | Setting | Purpose |
|---|---|---|
| `www.bearlakecamp.com/keystatic/*` | Cache Level: Bypass | CMS always hits Vercel |
| `www.bearlakecamp.com/api/*` | Cache Level: Bypass | API routes not cached by Cloudflare |
| `www.bearlakecamp.com/*` | Browser Cache TTL: 4 hours | Cloudflare caches static pages |

**Alternative**: Use Cloudflare Cache Rules (newer, more flexible than Page Rules) — create a rule to bypass cache for paths matching `/keystatic/*` and `/api/*`.

------------------------------------------------------------------------

## Phase 2: Domain Cutover (the DNS flip)

At this point everything is already validated on the temp URL. This phase is just routing traffic.

### 2.1 Update DNS Records in Cloudflare

Change the following records (keep proxy status **ON** — orange cloud):

| Type  | Name  | Content                | Proxy            | TTL  |
|-------|-------|------------------------|------------------|------|
| A     | `@`   | `76.76.21.21`          | Proxied (orange) | Auto |
| CNAME | `www` | `cname.vercel-dns.com` | Proxied (orange) | Auto |

Delete or update any existing A/CNAME records for `@` and `www` that point to Dreamhost.

**Note**: Keep all other DNS records (MX, TXT, etc.) unchanged — those are for email and domain verification.

### 2.2 Wait for Vercel SSL Provisioning (5-10 min)

1. Vercel will automatically provision an SSL certificate for the new domains
2. Check Vercel dashboard → Domains — status should change from "Awaiting" to "Valid"
3. If Vercel can't verify (Cloudflare proxy hides the origin), temporarily set the proxy to **DNS-only (gray cloud)**, let Vercel verify, then re-enable proxy

**Troubleshooting Vercel SSL behind Cloudflare proxy:**
- If Vercel SSL verification fails with orange cloud, gray-cloud the record temporarily
- Once Vercel shows "Valid Configuration", switch back to orange cloud
- This is a one-time step; renewals work automatically after initial provisioning

### 2.3 Verify Production

-   [ ] `https://www.bearlakecamp.com` loads the new site
-   [ ] `https://bearlakecamp.com` redirects to `https://www.bearlakecamp.com`
-   [ ] All pages render correctly
-   [ ] Images load (check paths)
-   [ ] Keystatic CMS works at `www.bearlakecamp.com/keystatic`
-   [ ] Content updates via Keystatic appear on the site
-   [ ] Admin nav strip appears when logged in

### 2.4 Update OAuth Callback URLs

-   [ ] **Keystatic GitHub OAuth app**: Replace the temp URL callback with `www.bearlakecamp.com` (can keep prelaunch too)

------------------------------------------------------------------------

## Phase 3: Post-Cutover

### 3.1 Configure Staging Domain

Repurpose `prelaunch.bearlakecamp.com` as a staging environment:

**Option A — Branch tracking (recommended):**
1. In Vercel → Project Settings → Git → Production Branch: keep as `main`
2. Create a `staging` branch in GitHub
3. In Vercel → Project Settings → Domains → assign `prelaunch.bearlakecamp.com` to the `staging` branch
4. Code changes go to `staging` first, preview at prelaunch, then merge to `main` for production

**Option B — Keep as production alias:**
- Leave as-is; `prelaunch.bearlakecamp.com` continues to serve the same production deployment
- Use Vercel's automatic preview URLs for PR-based testing instead

------------------------------------------------------------------------

## Rollback Plan

If anything goes wrong after cutover:

1.  Open Cloudflare DNS for bearlakecamp.com
2.  Change `@` A record back to the Dreamhost IP (recorded in Phase 1.1)
3.  Change `www` CNAME back to the Dreamhost hostname (recorded in Phase 1.1)
4.  Cloudflare propagates immediately since it's the authoritative nameserver
5.  WordPress site will be back within 1-2 minutes

**Keep Dreamhost/WordPress running for 2-4 weeks after cutover as a safety net.**

------------------------------------------------------------------------

## Post-Cutover Cleanup

After 2-4 weeks with no issues:

-   [ ] Cancel Dreamhost hosting (or downgrade to cheapest plan as backup)
-   [ ] Remove old WordPress DNS records if any remain
-   [ ] Update any external links/references that point to prelaunch.bearlakecamp.com
-   [ ] Update GitHub webhook URL if it references prelaunch domain
-   [ ] Update `GITHUB_REPO` or any hardcoded URLs in the codebase
-   [ ] Search codebase for `prelaunch.bearlakecamp.com` and update to `www.bearlakecamp.com`

------------------------------------------------------------------------

## Key Reference

-   **Vercel docs — Custom domains**: https://vercel.com/docs/projects/domains
-   **Vercel docs — Cloudflare proxy**: https://vercel.com/docs/projects/domains/cloudflare
-   **Cloudflare SSL modes**: https://developers.cloudflare.com/ssl/origin-configuration/ssl-modes/