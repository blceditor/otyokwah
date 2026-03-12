/**
 * REQ-CMS-004: API endpoint to list all pages with their SEO status
 *
 * Used by GlobalSEOGenerator to determine which pages need SEO generation.
 * REQ-P1-01: Requires Keystatic session (authenticated CMS users only).
 */
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { reader } from '@/lib/keystatic-reader';
import { isKeystatiAuthenticated } from '@/lib/keystatic/auth';

export async function GET() {
  const cookieStore = await cookies();
  const isAuthenticated = await isKeystatiAuthenticated(cookieStore);
  if (!isAuthenticated) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    const pages = await reader().collections.pages.all();

    const pagesWithSEO = pages.map(page => ({
      slug: page.slug,
      title: page.entry.title || page.slug,
      seo: page.entry.seo ? {
        metaTitle: page.entry.seo.metaTitle || '',
        metaDescription: page.entry.seo.metaDescription || ''
      } : {}
    }));

    return NextResponse.json(pagesWithSEO);
  } catch {
    return NextResponse.json(
      { error: 'Failed to list pages' },
      { status: 500 }
    );
  }
}
