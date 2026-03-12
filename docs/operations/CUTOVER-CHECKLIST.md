# Production Cutover Checklist

> **From**: WordPress on Dreamhost → **To**: Next.js + Keystatic on Vercel
> **DNS**: Cloudflare (authoritative)
> **Rollback DNS**: `docs/operations/DNS-BACKUP-2026-03-02.txt`

---

## Pre-Cutover

### 1. Vercel: Add production domains
- [ ] Project → Settings → Domains → add `www.bearlakecamp.com`
- [ ] Project → Settings → Domains → add `bearlakecamp.com` (auto-redirects apex → www)
- [ ] Both will show "Awaiting DNS" — expected

### 2. Vercel: Environment variables (Production scope)
- [ ] `NEXT_PUBLIC_SITE_URL` = `https://www.bearlakecamp.com`
- [ ] `KEYSTATIC_DEFAULT_BRANCH` = `main`
- [ ] `REVALIDATE_SECRET` — same value as GitHub webhook
- [ ] All other env vars match what's working on prelaunch

### 3. GitHub OAuth app
- [ ] Add callback URL: `https://www.bearlakecamp.com/api/keystatic/github/callback`
- [ ] Keep prelaunch callback URL (still needed for staging)

### 4. Cloudflare: Pre-configure (no traffic impact yet)
- [ ] SSL/TLS → Overview → **Full (Strict)**
- [ ] SSL/TLS → Edge Certificates → "Always Use HTTPS" ON
- [ ] SSL/TLS → Edge Certificates → "Automatic HTTPS Rewrites" ON
- [ ] Cache Rules → bypass cache for `/keystatic/*` and `/api/*`

---

## Cutover (the DNS flip)

### 5. Cloudflare: Update DNS records

**Change these two records** (keep orange cloud ON):

| Type | Name | Old Value | New Value |
|------|------|-----------|-----------|
| A | `@` | `173.236.245.156` (Dreamhost) | `76.76.21.21` (Vercel) |
| CNAME | `www` | `173.236.245.156` (Dreamhost) | `cname.vercel-dns.com` |

**Do NOT touch**: MX, TXT, DKIM, `pay`, `prelaunch`, `autodiscover`, `ftp`, `mysql`, `ssh` records

### 6. Vercel SSL (5-10 min)
- [ ] Check Vercel dashboard → Domains → status changes to "Valid"
- [ ] If stuck: temporarily gray-cloud the DNS record, let Vercel verify, re-enable orange cloud

---

## Verify

### 7. Quick checks
- [ ] `https://www.bearlakecamp.com` — loads new site
- [ ] `https://bearlakecamp.com` — redirects to www
- [ ] `https://www.bearlakecamp.com/keystatic` — CMS loads or redirects to OAuth
- [ ] `https://www.bearlakecamp.com/api/health` — returns `{"status":"ok"}`

### 8. Run verification script
```bash
bash scripts/cutover-verify.sh www
```

### 9. Test CMS round-trip
- [ ] Log into Keystatic at `www.bearlakecamp.com/keystatic`
- [ ] Make a trivial content edit, save
- [ ] Verify change appears on the live page within seconds

---

## Post-Cutover

### 10. GitHub webhook
- [ ] Confirm webhook fires on push to `main`
- [ ] Verify `www.bearlakecamp.com/api/webhook/github` returns 200 on POST

### 11. Keep Dreamhost running 2-4 weeks
- [ ] Do NOT cancel Dreamhost yet — it's the rollback path
- [ ] After 2-4 weeks with no issues, cancel hosting

---

## Rollback (if needed)

In Cloudflare, revert two records:

| Type | Name | Revert To |
|------|------|-----------|
| A | `@` | `173.236.245.156` |
| CNAME | `www` | `173.236.245.156` |

WordPress comes back within 1-2 minutes (Cloudflare is authoritative NS).
