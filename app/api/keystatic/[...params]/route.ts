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

// Enhance GitHub OAuth redirects:
// 1. Add login hint so GitHub pre-selects the correct account (blceditor)
// 2. Add repo scope — Keystatic omits this because it's designed for GitHub
//    Apps (which get permissions from installation). Classic OAuth Apps need
//    explicit scope=repo for content read/write access.
function enhanceOAuthRedirect(response: Response): Response {
  if (response.status >= 300 && response.status < 400) {
    const location = response.headers.get('location');
    if (location?.includes('github.com/login/oauth/authorize')) {
      const url = new URL(location);
      if (!url.searchParams.has('login')) {
        url.searchParams.set('login', DEFAULT_GITHUB_OWNER);
      }
      if (!url.searchParams.has('scope')) {
        url.searchParams.set('scope', 'repo');
      }
      const newHeaders = new Headers(response.headers);
      newHeaders.set('location', url.toString());
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });
    }
  }
  return response;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const isCallback = url.pathname.endsWith('/oauth/callback');

  // Handle OAuth callback for classic OAuth Apps (no expiring tokens).
  // Keystatic's built-in handler expects GitHub App token responses with
  // expires_in/refresh_token fields. Classic OAuth Apps return only
  // access_token/token_type/scope, causing Keystatic's schema validation
  // to throw "Authorization failed". We handle the exchange ourselves
  // and set the cookie Keystatic expects.
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

      if (body.access_token && !body.expires_in) {
        // Classic OAuth App response — set cookie and redirect to Keystatic
        const cookieValue = `keystatic-gh-access-token=${body.access_token}; Path=/; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
        const headers = new Headers();
        headers.append('Set-Cookie', cookieValue);
        headers.set('Location', '/keystatic');
        return new Response(null, { status: 302, headers });
      }

      // If response has expires_in (GitHub App), fall through to Keystatic's handler
      // by NOT returning here — but the code is consumed, so we need to handle errors
      if (body.error) {
        return new Response(`GitHub OAuth error: ${body.error_description || body.error}`, {
          status: 400,
        });
      }
    }
  }

  const { GET: _GET } = getHandler();
  const response = await _GET(rewriteUrl(request));
  return enhanceOAuthRedirect(response);
}

export async function POST(request: Request) {
  const { POST: _POST } = getHandler();
  const response = await _POST(rewriteUrl(request));
  return enhanceOAuthRedirect(response);
}
