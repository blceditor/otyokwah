# Cutover Verification Options

## What Already Exists

### A. Playwright Smoke Tests
- **10 spec files** in `tests/e2e/smoke/`: navigation, components, hero videos, contact form, fonts, FAQ, rentals, give page
- **Run**: `bash scripts/smoke-test.sh https://www.bearlakecamp.com`
- **Speed**: ~30s
- **Coverage**: Public pages, nav, components, forms

### B. Health Endpoint
- **Endpoint**: `GET /api/health`
- **Run**: `curl https://www.bearlakecamp.com/api/health`
- **Speed**: ~2s
- **Coverage**: CMS reader, navigation singleton, page list, GitHub API connectivity

### C. Full E2E Suite
- **60+ spec files** in `tests/e2e/`: smoke, UAT, production, Keystatic editor, visual
- **Run**: `PRODUCTION_URL=https://www.bearlakecamp.com npx playwright test`
- **Speed**: ~5min
- **Coverage**: Comprehensive including Keystatic editor tests (needs OAuth auth)

## Recommended: Option D — Cutover Verification Script

A purpose-built script that combines all checks into one command:

```bash
bash scripts/cutover-verify.sh https://www.bearlakecamp.com
```

### What it checks:

1. **Health endpoint** (`/api/health`) — backend/data pipeline checks
2. **Every page returns 200** — fetches all page slugs from CMS, hits each one
3. **Existing smoke tests** — component rendering, navigation, forms
4. **Keystatic OAuth flow** — verifies `/keystatic` redirects to GitHub OAuth (not 500)
5. **Redirects work** — validates all `next.config.mjs` redirects return 301/302
6. **API endpoints respond** — `/api/search-index`, `/api/webhook/github` (GET returns method not allowed = healthy)
7. **Security headers present** — CSP, HSTS, X-Frame-Options on every page

### Output:
- Pass/fail summary with timing
- List of any failed checks with HTTP status codes
- Exit code 0 (all pass) or 1 (any failures)

### When to run:
- After merging PR to main (production deploy)
- After DNS cutover to www.bearlakecamp.com
- After any Vercel env var changes
- As part of ongoing monitoring (cron or Better Stack)
