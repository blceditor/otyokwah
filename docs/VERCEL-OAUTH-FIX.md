# Keystatic OAuth Fix for Vercel Deployment

**Date**: 2025-11-16
**Status**: ✅ FIXED
**Deployment**: https://prelaunch.bearlakecamp.com

---

## The Problem

Keystatic CMS was loading correctly but GitHub authentication was failing:
- `/keystatic` UI loaded but showed no GitHub login button
- `/api/keystatic/tree` returned 404 errors
- OAuth flow never initiated

**Environment**:
- Next.js 14.2.33 with App Router
- Keystatic 0.5.48 with GitHub storage mode
- Deployed on Vercel
- All environment variables correctly configured
- GitHub App properly set up with correct callback URLs

---

## Root Cause

Keystatic constructs the OAuth `redirect_uri` from the request's origin hostname. On Vercel (and other proxied/clustered infrastructure), the internal request hostname differs from the public domain.

**Example**:
- Public domain: `prelaunch.bearlakecamp.com`
- Internal Vercel hostname: `*.vercel.app` or internal cluster hostname
- Keystatic uses internal hostname → redirect_uri mismatch → OAuth fails

This is a **known issue** in Keystatic:
- GitHub Issue: https://github.com/Thinkmill/keystatic/issues/1022
- Affects: Vercel, fly.io, Kubernetes, any reverse proxy setup
- Status: Open (no official fix as of Nov 2025)

---

## The Solution

Implemented the community workaround that rewrites request URLs to use Vercel's forwarded headers (`x-forwarded-host` and `x-forwarded-proto`) before passing them to Keystatic's route handlers.

**File**: `app/api/keystatic/[...params]/route.ts`

```typescript
import { makeRouteHandler } from '@keystatic/next/route-handler';
import keystaticConfig from '../../../../keystatic.config';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const { GET: _GET, POST: _POST } = makeRouteHandler({
  config: keystaticConfig
});

// Workaround for Vercel/proxied environments
// See: https://github.com/Thinkmill/keystatic/issues/1022
function rewriteUrl(request: Request) {
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto');

  if (forwardedHost && forwardedProto) {
    const url = new URL(request.url);
    url.hostname = forwardedHost;
    url.protocol = forwardedProto;
    url.port = '';
    return new Request(url, request);
  }

  return request;
}

export function GET(request: Request) {
  return _GET(rewriteUrl(request));
}

export function POST(request: Request) {
  return _POST(rewriteUrl(request));
}
```

---

## Testing

Visit: https://prelaunch.bearlakecamp.com/keystatic

**Expected behavior**:
1. ✅ GitHub "Sign in" button appears OR automatic redirect to GitHub
2. ✅ GitHub authorization screen shows "Bear Lake Camp CMS"
3. ✅ After authorizing, Keystatic dashboard loads
4. ✅ Can create/edit/save pages
5. ✅ Changes commit to GitHub repository

---

## Configuration Reference

### Environment Variables (Vercel Production)

```bash
# GitHub OAuth App (for general GitHub integration)
GITHUB_CLIENT_ID="Ov23li74diodsWpesiOD"
GITHUB_CLIENT_SECRET="2224882a51c8428b142b9cfdadc7e79e29e473b3"
GITHUB_OWNER="sparkst"
GITHUB_REPO="bearlakecamp"

# Keystatic GitHub App (for CMS authentication)
KEYSTATIC_GITHUB_CLIENT_ID="yIv23li34NGRJ6tYul4RW"
KEYSTATIC_GITHUB_CLIENT_SECRET="803489f710f1789bec2d0422ce98c0e7cbc41515"
KEYSTATIC_SECRET="dWDIZ1rtvkSQ7apT2kql05Src6EewV0aUSxP696ohiU="
NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG="bearlakecamp-cms"
```

### GitHub App Settings

**App**: https://github.com/settings/apps/bearlakecamp-cms

**Callback URL**:
```
https://prelaunch.bearlakecamp.com/api/keystatic/github/oauth/callback
```

**Homepage URL**:
```
https://prelaunch.bearlakecamp.com
```

**Permissions**:
- Repository Contents: Read & Write
- Repository Metadata: Read-only

**Installation**: Installed on `sparkst/bearlakecamp` repository

---

## Commit History

1. **c66c204** - `fix: implement x-forwarded-host workaround for keystatic oauth on vercel`
2. **194c44e** - `debug: add runtime logging to diagnose keystatic storage mode issue`
3. **049029f** - `chore: trigger redeploy after fixing NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`

---

## Related Documentation

- Original issue discovery: `ISSUE-RESOLVED.md` (incorrect GitHub App slug)
- Architecture overview: `EXECUTIVE-SUMMARY.md`
- Configuration reference: `FINAL-CONFIGURATION.md`

---

## Future Considerations

**When this workaround can be removed**:
- Monitor https://github.com/Thinkmill/keystatic/issues/1022
- If/when Keystatic merges native support for explicit redirect_uri configuration
- Or when Keystatic adds first-class Vercel adapter

**Alternative solutions**:
- Keystatic Cloud (handles authentication without GitHub App setup)
- Self-host with custom domain pointed directly to app (no proxy)

---

**Status**: ✅ RESOLVED
**Production URL**: https://prelaunch.bearlakecamp.com/keystatic
