import { revalidatePath, revalidateTag } from 'next/cache';
import { timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isKeystatiAuthenticated } from '@/lib/keystatic/auth';

function isValidSecret(secret: string | null): boolean {
  const expected = process.env.REVALIDATE_SECRET;
  if (!secret || !expected) return false;
  if (secret.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(secret), Buffer.from(expected));
}

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-revalidate-secret');
  const hasValidSecret = isValidSecret(secret);

  let hasValidSession = false;
  if (!hasValidSecret) {
    try {
      const cookieStore = await cookies();
      hasValidSession = await isKeystatiAuthenticated(cookieStore);
    } catch {
      hasValidSession = false;
    }
  }

  if (!hasValidSecret && !hasValidSession) {
    return NextResponse.json(
      { error: 'Unauthorized', revalidated: false },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { slug, type, tag } = body;

    if (type === 'page' && slug) {
      revalidatePath(`/${slug}`);
      return NextResponse.json({
        revalidated: true,
        slug,
        timestamp: new Date().toISOString(),
      });
    }

    if (type === 'tag' && tag) {
      revalidateTag(tag);
      return NextResponse.json({
        revalidated: true,
        tag,
        timestamp: new Date().toISOString(),
      });
    }

    if (type === 'all') {
      revalidateTag('pages');
      revalidatePath('/', 'layout');
      return NextResponse.json({
        revalidated: true,
        type: 'all',
        timestamp: new Date().toISOString(),
      });
    }

    if (type === 'homepage') {
      revalidatePath('/');
      return NextResponse.json({
        revalidated: true,
        type: 'homepage',
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      { error: 'Invalid request. Provide type and slug/tag.' },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      { error: 'Failed to revalidate', revalidated: false },
      { status: 500 }
    );
  }
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'revalidate',
    usage: {
      method: 'POST',
      auth: 'x-revalidate-secret header OR Keystatic session cookie',
      body: {
        type: 'page | tag | all | homepage',
        slug: 'optional - page slug for type=page',
        tag: 'optional - cache tag for type=tag',
      },
    },
  });
}
