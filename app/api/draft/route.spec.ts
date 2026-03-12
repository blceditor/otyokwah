import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('next/headers', () => ({
  draftMode: vi.fn(),
}));

import { GET } from './route';
import { draftMode } from 'next/headers';
import { NextRequest } from 'next/server';

function makeRequest(params: Record<string, string> = {}): NextRequest {
  const url = new URL('http://localhost/api/draft');
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  return new NextRequest(url);
}

describe('REQ-101 — Draft Mode Preview API (SEC-02 timing-safe)', () => {
  const DRAFT_SECRET = 'test-draft-secret-value';

  beforeEach(() => {
    vi.stubEnv('DRAFT_SECRET', DRAFT_SECRET);
    vi.mocked(draftMode).mockResolvedValue({
      enable: vi.fn(),
      disable: vi.fn(),
      isEnabled: false,
    } as never);
  });

  it('returns 401 when secret is missing', async () => {
    const res = await GET(makeRequest({ branch: 'main', slug: 'about' }));
    expect(res.status).toBe(401);
    expect(await res.text()).toBe('Invalid secret');
  });

  it('returns 401 when secret is wrong', async () => {
    const res = await GET(
      makeRequest({ branch: 'main', slug: 'about', secret: 'wrong-secret' })
    );
    expect(res.status).toBe(401);
    expect(await res.text()).toBe('Invalid secret');
  });

  it('returns 401 when secret has different length', async () => {
    const res = await GET(
      makeRequest({ branch: 'main', slug: 'about', secret: 'short' })
    );
    expect(res.status).toBe(401);
    expect(await res.text()).toBe('Invalid secret');
  });

  it('returns 400 when branch is missing', async () => {
    const res = await GET(
      makeRequest({ slug: 'about', secret: DRAFT_SECRET })
    );
    expect(res.status).toBe(400);
  });

  it('returns 400 when slug is missing', async () => {
    const res = await GET(
      makeRequest({ branch: 'main', secret: DRAFT_SECRET })
    );
    expect(res.status).toBe(400);
  });

  it('returns 307 redirect with draft mode enabled on correct secret', async () => {
    const enableFn = vi.fn();
    vi.mocked(draftMode).mockResolvedValue({
      enable: enableFn,
      disable: vi.fn(),
      isEnabled: false,
    } as never);

    const res = await GET(
      makeRequest({ branch: 'staging', slug: 'about', secret: DRAFT_SECRET })
    );

    expect(res.status).toBe(307);
    expect(res.headers.get('Location')).toBe('/about?branch=staging');
    expect(enableFn).toHaveBeenCalled();
  });
});
