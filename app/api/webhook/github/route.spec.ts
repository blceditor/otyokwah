// REQ-BUILD-010: Wire ISR to Keystatic saves — webhook revalidation
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { createHmac } from 'crypto';
import { revalidatePath } from 'next/cache';
import { POST } from './route';

const TEST_SECRET = 'test-webhook-secret-256';

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

const mockRevalidatePath = vi.mocked(revalidatePath);

function sign(body: string, secret = TEST_SECRET): string {
  const hmac = createHmac('sha256', secret).update(body).digest('hex');
  return `sha256=${hmac}`;
}

function makePayload(
  files: { added?: string[]; modified?: string[]; removed?: string[] }[],
  ref = 'refs/heads/main',
) {
  return JSON.stringify({
    ref,
    commits: files.map((f) => ({
      added: f.added ?? [],
      modified: f.modified ?? [],
      removed: f.removed ?? [],
    })),
  });
}

function makeRequest(
  body: string,
  signature: string | null,
  event = 'push',
): NextRequest {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (event) headers['x-github-event'] = event;
  if (signature !== null) headers['x-hub-signature-256'] = signature;
  return new NextRequest('http://localhost:3000/api/webhook/github', {
    method: 'POST',
    headers,
    body,
  });
}

describe('REQ-BUILD-010 — GitHub webhook ISR revalidation', () => {
  beforeEach(() => {
    mockRevalidatePath.mockReset();
    vi.stubEnv('REVALIDATE_SECRET', TEST_SECRET);
    vi.stubEnv('KEYSTATIC_DEFAULT_BRANCH', 'main');
  });

  // --- Signature verification ---

  test('rejects request with missing signature (401)', async () => {
    const body = makePayload([{ modified: ['content/pages/about.mdoc'] }]);
    const res = await POST(makeRequest(body, null));
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe('Invalid signature');
  });

  test('rejects request with invalid signature (401)', async () => {
    const body = makePayload([{ modified: ['content/pages/about.mdoc'] }]);
    const res = await POST(makeRequest(body, 'sha256=deadbeef'));
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe('Invalid signature');
  });

  test('rejects request with malformed signature format (401)', async () => {
    const body = makePayload([{ modified: ['content/pages/about.mdoc'] }]);
    const res = await POST(makeRequest(body, 'not-a-valid-format'));
    expect(res.status).toBe(401);
  });

  test('returns 500 when REVALIDATE_SECRET is not set', async () => {
    vi.stubEnv('REVALIDATE_SECRET', '');
    const body = makePayload([{ modified: ['content/pages/about.mdoc'] }]);
    const res = await POST(makeRequest(body, sign(body)));
    expect(res.status).toBe(500);
  });

  test('accepts request with valid HMAC signature (200)', async () => {
    const body = makePayload([{ modified: ['content/pages/about.mdoc'] }]);
    const res = await POST(makeRequest(body, sign(body)));
    expect(res.status).toBe(200);
  });

  // --- Branch filtering ---

  test('ignores pushes to non-main branches', async () => {
    const body = makePayload(
      [{ modified: ['content/pages/about.mdoc'] }],
      'refs/heads/staging',
    );
    const res = await POST(makeRequest(body, sign(body)));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.message).toContain('Ignored');
    expect(json.revalidated).toEqual([]);
    expect(mockRevalidatePath).not.toHaveBeenCalled();
  });

  test('ignores non-push events', async () => {
    const body = makePayload([{ modified: ['content/pages/about.mdoc'] }]);
    const res = await POST(makeRequest(body, sign(body), 'ping'));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.message).toContain('Ignored non-push');
    expect(mockRevalidatePath).not.toHaveBeenCalled();
  });

  // --- Layout revalidation via singleton/shared content prefixes ---

  test('content/singletons/ prefix triggers layout revalidation', async () => {
    const body = makePayload([
      { modified: ['content/singletons/site-config/site-config.yaml'] },
    ]);
    const res = await POST(makeRequest(body, sign(body)));
    expect(res.status).toBe(200);
    expect(mockRevalidatePath).toHaveBeenCalledWith('/', 'layout');
    const json = await res.json();
    expect(json.revalidated).toEqual(
      expect.arrayContaining([expect.stringContaining('layout')]),
    );
  });

  test('content/navigation/ prefix triggers layout revalidation', async () => {
    const body = makePayload([
      { modified: ['content/navigation/main/main.yaml'] },
    ]);
    const res = await POST(makeRequest(body, sign(body)));
    expect(res.status).toBe(200);
    expect(mockRevalidatePath).toHaveBeenCalledWith('/', 'layout');
  });

  test('content/testimonials/ prefix triggers layout revalidation', async () => {
    const body = makePayload([
      { added: ['content/testimonials/new-testimonial.yaml'] },
    ]);
    const res = await POST(makeRequest(body, sign(body)));
    expect(res.status).toBe(200);
    expect(mockRevalidatePath).toHaveBeenCalledWith('/', 'layout');
  });

  test('content/staff/ prefix triggers layout revalidation', async () => {
    const body = makePayload([
      { removed: ['content/staff/old-staff.yaml'] },
    ]);
    const res = await POST(makeRequest(body, sign(body)));
    expect(res.status).toBe(200);
    expect(mockRevalidatePath).toHaveBeenCalledWith('/', 'layout');
  });

  test('content/faqs/ prefix triggers layout revalidation', async () => {
    const body = makePayload([{ modified: ['content/faqs/general.yaml'] }]);
    const res = await POST(makeRequest(body, sign(body)));
    expect(res.status).toBe(200);
    expect(mockRevalidatePath).toHaveBeenCalledWith('/', 'layout');
  });

  // --- Page-specific revalidation ---

  test('content/pages/about.mdoc triggers /about revalidation', async () => {
    const body = makePayload([{ modified: ['content/pages/about.mdoc'] }]);
    const res = await POST(makeRequest(body, sign(body)));
    expect(res.status).toBe(200);
    expect(mockRevalidatePath).toHaveBeenCalledWith('/about');
    const json = await res.json();
    expect(json.revalidated).toContain('/about');
  });

  test('content/pages/index.mdoc triggers / revalidation', async () => {
    const body = makePayload([{ modified: ['content/pages/index.mdoc'] }]);
    const res = await POST(makeRequest(body, sign(body)));
    expect(res.status).toBe(200);
    expect(mockRevalidatePath).toHaveBeenCalledWith('/');
    const json = await res.json();
    expect(json.revalidated).toContain('/');
  });

  test('multiple page changes trigger multiple revalidations', async () => {
    const body = makePayload([
      {
        modified: ['content/pages/about.mdoc', 'content/pages/contact.mdoc'],
      },
    ]);
    const res = await POST(makeRequest(body, sign(body)));
    expect(res.status).toBe(200);
    expect(mockRevalidatePath).toHaveBeenCalledWith('/about');
    expect(mockRevalidatePath).toHaveBeenCalledWith('/contact');
  });

  // --- Mixed content changes ---

  test('mixed layout + page changes trigger both revalidation types', async () => {
    const body = makePayload([
      {
        modified: [
          'content/singletons/homepage/homepage.yaml',
          'content/pages/about.mdoc',
        ],
      },
    ]);
    const res = await POST(makeRequest(body, sign(body)));
    expect(res.status).toBe(200);
    expect(mockRevalidatePath).toHaveBeenCalledWith('/', 'layout');
    expect(mockRevalidatePath).toHaveBeenCalledWith('/about');
  });

  test('layout revalidation happens only once for multiple layout-prefix files', async () => {
    const body = makePayload([
      {
        modified: [
          'content/navigation/main/main.yaml',
          'content/singletons/homepage/homepage.yaml',
        ],
      },
    ]);
    const res = await POST(makeRequest(body, sign(body)));
    expect(res.status).toBe(200);
    const layoutCalls = mockRevalidatePath.mock.calls.filter(
      (call) => call[0] === '/' && call[1] === 'layout',
    );
    expect(layoutCalls).toHaveLength(1);
  });

  // --- Edge cases ---

  test('files outside content/ do not trigger revalidation', async () => {
    const body = makePayload([
      { modified: ['package.json', 'lib/utils.ts'] },
    ]);
    const res = await POST(makeRequest(body, sign(body)));
    expect(res.status).toBe(200);
    expect(mockRevalidatePath).not.toHaveBeenCalled();
    const json = await res.json();
    expect(json.revalidated).toEqual([]);
  });

  test('handles payload with no commits gracefully', async () => {
    const body = JSON.stringify({ ref: 'refs/heads/main', commits: [] });
    const res = await POST(makeRequest(body, sign(body)));
    expect(res.status).toBe(200);
    expect(mockRevalidatePath).not.toHaveBeenCalled();
  });

  test('deduplicates same page across added and modified', async () => {
    const body = makePayload([
      { added: ['content/pages/about.mdoc'] },
      { modified: ['content/pages/about.mdoc'] },
    ]);
    const res = await POST(makeRequest(body, sign(body)));
    expect(res.status).toBe(200);
    const aboutCalls = mockRevalidatePath.mock.calls.filter(
      (call) => call[0] === '/about',
    );
    expect(aboutCalls).toHaveLength(1);
  });

  test('returns 400 for invalid JSON body', async () => {
    const body = 'not-json{{{';
    const res = await POST(makeRequest(body, sign(body)));
    expect(res.status).toBe(400);
  });
});
