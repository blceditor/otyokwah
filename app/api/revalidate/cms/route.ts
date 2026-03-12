import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { requireKeystatic } from '@/lib/keystatic/auth';

export async function POST(request: NextRequest) {
  const authError = await requireKeystatic();
  if (authError) return authError;

  try {
    const body = await request.json();
    const { slug, type } = body;

    if (type === 'page' && slug) {
      revalidatePath(`/${slug}`);
      return NextResponse.json({ revalidated: true, slug });
    }

    if (type === 'homepage') {
      revalidatePath('/');
      return NextResponse.json({ revalidated: true, type: 'homepage' });
    }

    if (type === 'all') {
      revalidateTag('pages');
      revalidatePath('/', 'layout');
      return NextResponse.json({ revalidated: true, type: 'all' });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Failed to revalidate' }, { status: 500 });
  }
}
