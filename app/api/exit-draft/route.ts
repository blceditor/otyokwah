// REQ-101: Exit Draft Mode
import { cookies, draftMode } from 'next/headers';
import { isKeystatiAuthenticated } from '@/lib/keystatic/auth';

export async function GET() {
  const cookieStore = await cookies();
  const isAdmin = await isKeystatiAuthenticated(cookieStore);
  if (!isAdmin) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Disable draft mode
  const draft = await draftMode();
  draft.disable();

  // Create redirect response with cleared cookie
  return new Response(null, {
    status: 307,
    headers: {
      Location: '/',
      'Set-Cookie': `__prerender_bypass=; Path=/; HttpOnly; SameSite=None; Secure; Max-Age=0; Expires=${new Date(0).toUTCString()}`,
    },
  });
}