import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  const clientId = process.env.KEYSTATIC_GITHUB_CLIENT_ID;
  const clientSecret = process.env.KEYSTATIC_GITHUB_CLIENT_SECRET;
  const secret = process.env.KEYSTATIC_SECRET;

  const info: Record<string, unknown> = {
    hasClientId: !!clientId,
    clientIdPrefix: clientId?.slice(0, 8),
    hasClientSecret: !!clientSecret,
    secretLength: clientSecret?.length,
    hasKeystaticSecret: !!secret,
  };

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
    info.tokenExchange = {
      httpStatus: res.status,
      httpOk: res.ok,
      responseKeys: Object.keys(body),
      error: body.error,
      errorDescription: body.error_description,
      hasAccessToken: !!body.access_token,
      tokenType: body.token_type,
      scope: body.scope,
      hasExpiresIn: 'expires_in' in body,
      hasRefreshToken: 'refresh_token' in body,
    };
  } else {
    info.note = 'Add ?code=YOUR_CODE to test token exchange. Get code from a failed callback URL.';
  }

  return NextResponse.json(info);
}
