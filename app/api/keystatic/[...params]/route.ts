import { makeRouteHandler } from '@keystatic/next/route-handler';
import keystaticConfig from '../../../../keystatic.config';
import { DEFAULT_GITHUB_OWNER } from '@/lib/config';

// Force dynamic rendering to evaluate environment variables at runtime
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Lazy initialization to avoid build-time env var validation in production
// Keystatic checks for GitHub OAuth credentials during makeRouteHandler() call,
// but env vars aren't available during Next.js static analysis phase
let _handler: ReturnType<typeof makeRouteHandler> | null = null;

function getHandler() {
  if (!_handler) {
    _handler = makeRouteHandler({ config: keystaticConfig });
  }
  return _handler;
}

const ALLOWED_HOSTS = [
  'prelaunch.otyokwah.org',
  'www.otyokwah.org',
  'otyokwah.org',
  'localhost',
];

function rewriteUrl(request: Request) {
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto');

  if (forwardedHost && forwardedProto) {
    const hostWithoutPort = forwardedHost.split(':')[0];
    if (!ALLOWED_HOSTS.includes(hostWithoutPort) && !hostWithoutPort.endsWith('.vercel.app')) {
      return request;
    }

    const url = new URL(request.url);
    url.hostname = forwardedHost;
    url.protocol = forwardedProto;
    url.port = '';

    return new Request(url, request);
  }

  return request;
}

// REQ-CMS-AUTH: Add login hint to GitHub OAuth redirects so GitHub
// pre-selects the correct account (blceditor) instead of whichever
// account happens to be active in the browser session.
function addLoginHint(response: Response): Response {
  if (response.status >= 300 && response.status < 400) {
    const location = response.headers.get('location');
    if (location?.includes('github.com/login/oauth/authorize')) {
      const url = new URL(location);
      if (!url.searchParams.has('login')) {
        url.searchParams.set('login', DEFAULT_GITHUB_OWNER);
        const newHeaders = new Headers(response.headers);
        newHeaders.set('location', url.toString());
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders,
        });
      }
    }
  }
  return response;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const isCallback = url.pathname.endsWith('/oauth/callback');

  // TEMPORARY: Intercept ALL OAuth callbacks to diagnose token exchange
  if (isCallback && url.searchParams.has('code')) {
    const code = url.searchParams.get('code');
    const clientId = process.env.KEYSTATIC_GITHUB_CLIENT_ID;
    const clientSecret = process.env.KEYSTATIC_GITHUB_CLIENT_SECRET;
    if (code && clientId && clientSecret) {
      const tokenUrl = new URL('https://github.com/login/oauth/access_token');
      tokenUrl.searchParams.set('client_id', clientId);
      tokenUrl.searchParams.set('client_secret', clientSecret);
      tokenUrl.searchParams.set('code', code);
      const res = await fetch(tokenUrl, {
        method: 'POST',
        headers: { Accept: 'application/json' },
      });
      const body = await res.json();
      const safeBody = { ...body };
      if (safeBody.access_token) safeBody.access_token = safeBody.access_token.slice(0, 8) + '...';
      if (safeBody.refresh_token) safeBody.refresh_token = safeBody.refresh_token.slice(0, 8) + '...';
      return new Response(JSON.stringify({
        note: 'TEMPORARY DEBUG - intercepted before Keystatic. Remove after diagnosis.',
        httpStatus: res.status,
        body: safeBody,
      }, null, 2), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  const { GET: _GET } = getHandler();
  const response = await _GET(rewriteUrl(request));
  return addLoginHint(response);
}

export async function POST(request: Request) {
  const { POST: _POST } = getHandler();
  const response = await _POST(rewriteUrl(request));
  return addLoginHint(response);
}
