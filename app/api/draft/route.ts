import { timingSafeEqual } from 'crypto';

import { draftMode } from 'next/headers';
import { NextRequest } from 'next/server';

function isValidDraftSecret(secret: string | null): boolean {
  const expected = process.env.DRAFT_SECRET;
  if (!secret || !expected) return false;
  if (secret.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(secret), Buffer.from(expected));
}

export async function GET(request: NextRequest): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const branch = searchParams.get('branch');
  const slug = searchParams.get('slug');
  const secret = searchParams.get('secret');

  if (!branch) {
    return new Response('Missing required parameter: branch', { status: 400 });
  }

  if (!slug) {
    return new Response('Missing required parameter: slug', { status: 400 });
  }

  if (!isValidDraftSecret(secret)) {
    return new Response('Invalid secret', { status: 401 });
  }

  const draft = await draftMode();
  draft.enable();

  const sanitizedSlug = slug.replace(/[^a-zA-Z0-9\-_\/]/g, '');
  const redirectUrl = `/${sanitizedSlug}?branch=${encodeURIComponent(branch)}`;

  return new Response(null, {
    status: 307,
    headers: {
      Location: redirectUrl,
      'Set-Cookie': `__prerender_bypass=true; Path=/; HttpOnly; SameSite=None; Secure; Max-Age=3600`,
    },
  });
}