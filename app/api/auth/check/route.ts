/**
 * REQ-ADMIN-002: Auth Check API
 *
 * Returns the current user's authentication status.
 * Used by AdminNavStrip client component to determine visibility.
 * This enables ISR caching for pages while still showing admin UI.
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isKeystatiAuthenticated } from '@/lib/keystatic/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const cookieStore = await cookies();
    const isAdmin = await isKeystatiAuthenticated(cookieStore);

    return NextResponse.json({ isAdmin });
  } catch {
    return NextResponse.json({ isAdmin: false });
  }
}
