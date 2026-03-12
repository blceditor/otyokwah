import { describe, test, expect, beforeEach, vi } from 'vitest';
import type { NextRequest } from 'next/server';

vi.mock('@/lib/keystatic/auth', () => ({
  requireKeystatic: vi.fn().mockResolvedValue(null),
}));

import { GET } from './route';

function makeRequest() {
  const url = new URL('http://localhost:3000/api/vercel-status');
  return new Request(url) as NextRequest;
}

describe('REQ-002 — Vercel Status API', () => {
  const MOCK_VERCEL_TOKEN = 'test-vercel-token-xyz';
  const MOCK_PROJECT_ID = 'prj_test123';
  const MOCK_DEPLOYMENT_ID = 'dpl_abc123xyz';
  const MOCK_TIMESTAMP = 1700000000000;

  beforeEach(() => {
    vi.stubEnv('VERCEL_TOKEN', MOCK_VERCEL_TOKEN);
    vi.stubEnv('VERCEL_PROJECT_ID', MOCK_PROJECT_ID);
    global.fetch = vi.fn();
  });

  function mockDeployment(state: string) {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        deployments: [{
          uid: MOCK_DEPLOYMENT_ID,
          state,
          created: MOCK_TIMESTAMP,
          target: 'production',
        }],
      }),
    });
  }

  test('fetches latest deployment from Vercel API', async () => {
    mockDeployment('READY');
    const response = await GET(makeRequest());

    expect(response.status).toBe(200);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('https://api.vercel.com/v6/deployments'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: `Bearer ${MOCK_VERCEL_TOKEN}`,
        }),
      })
    );

    const fetchCall = (global.fetch as any).mock.calls[0][0];
    expect(fetchCall).toContain(`projectId=${MOCK_PROJECT_ID}`);
    expect(fetchCall).toContain('target=production');
    expect(fetchCall).toContain('limit=1');
  });

  test('returns correct status based on deployment state - READY', async () => {
    mockDeployment('READY');
    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe('READY');
    expect(body.state).toBe('Published');
    expect(body.timestamp).toBe(MOCK_TIMESTAMP);
  });

  test('returns correct status based on deployment state - BUILDING', async () => {
    mockDeployment('BUILDING');
    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe('BUILDING');
    expect(body.state).toBe('Deploying');
    expect(body.timestamp).toBe(MOCK_TIMESTAMP);
  });

  test('returns correct status based on deployment state - ERROR', async () => {
    mockDeployment('ERROR');
    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe('ERROR');
    expect(body.state).toBe('Failed');
    expect(body.timestamp).toBe(MOCK_TIMESTAMP);
  });

  test('handles Vercel API errors gracefully', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Vercel API Error'));
    const response = await GET(makeRequest());

    expect(response.status).toBeGreaterThanOrEqual(500);
    const body = await response.json();
    expect(body.error).toBeTruthy();
    expect(body.message).toContain('error');
  });

  test('handles missing environment variables', async () => {
    vi.stubEnv('VERCEL_TOKEN', '');
    vi.stubEnv('VERCEL_PROJECT_ID', '');
    const response = await GET(makeRequest());

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toBeTruthy();
    expect(body.message).toMatch(/environment variable|configuration/i);
  });

  test('handles empty deployments array', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ deployments: [] }),
    });
    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe('DRAFT');
    expect(body.state).toBe('Draft');
    expect(body.timestamp).toBeNull();
  });

  test('filters by production target only', async () => {
    mockDeployment('READY');
    await GET(makeRequest());

    const fetchCall = (global.fetch as any).mock.calls[0][0];
    expect(fetchCall).toContain('target=production');
  });

  test('returns most recent deployment (limit=1)', async () => {
    mockDeployment('READY');
    await GET(makeRequest());

    const fetchCall = (global.fetch as any).mock.calls[0][0];
    expect(fetchCall).toContain('limit=1');
  });

  test('handles Vercel API rate limit (429)', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: async () => ({ error: { code: 'rate_limit_exceeded', message: 'Rate limit exceeded' } }),
    });
    const response = await GET(makeRequest());

    expect(response.status).toBe(429);
    const body = await response.json();
    expect(body.error).toBeTruthy();
    expect(body.message).toMatch(/rate limit/i);
  });

  test('includes proper cache headers to prevent stale data', async () => {
    mockDeployment('READY');
    const response = await GET(makeRequest());

    const cacheControl = response.headers.get('Cache-Control');
    expect(cacheControl).toBeTruthy();
    expect(cacheControl).toMatch(/no-cache|max-age=0|must-revalidate/i);
  });

  test('maps deployment states to user-friendly labels', async () => {
    const testCases = [
      { vercelState: 'READY', expectedState: 'Published' },
      { vercelState: 'BUILDING', expectedState: 'Deploying' },
      { vercelState: 'QUEUED', expectedState: 'Deploying' },
      { vercelState: 'ERROR', expectedState: 'Failed' },
      { vercelState: 'CANCELED', expectedState: 'Failed' },
    ];

    for (const { vercelState, expectedState } of testCases) {
      mockDeployment(vercelState);
      const response = await GET(makeRequest());
      const body = await response.json();
      expect(body.state).toBe(expectedState);
    }
  });
});
