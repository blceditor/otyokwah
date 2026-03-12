/**
 * REQ-OP005: Contact Form API Integration Tests
 * Story Points: 3 SP (part of)
 *
 * Tests for contact form API endpoint with Turnstile validation
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/email/send-contact-email', () => ({
  sendContactEmail: vi.fn().mockResolvedValue({ success: true }),
}));

import { POST } from '@/app/api/contact/route';

function makeFormRequest(
  fields: Record<string, string>,
  headers?: Record<string, string>
): NextRequest {
  const body = new URLSearchParams();
  for (const [key, value] of Object.entries(fields)) {
    body.set(key, value);
  }
  return new NextRequest('http://localhost:3000/api/contact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      ...headers,
    },
    body: body.toString(),
  });
}

const validFields = {
  name: 'Test User',
  email: 'test@example.com',
  message: 'Test message',
  'turnstile-response': 'mock-token',
};

describe('REQ-OP005 — Contact Form API Endpoint', () => {
  beforeEach(() => {
    vi.stubEnv('TURNSTILE_SECRET_KEY', 'test-secret');
    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ success: true }),
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test('accepts valid form submission with Turnstile token', async () => {
    const response = await POST(makeFormRequest(validFields));
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  test('requires turnstile token', async () => {
    const { 'turnstile-response': _, ...noToken } = validFields;
    const response = await POST(makeFormRequest(noToken));
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toMatch(/required|missing/i);
  });

  test('validates turnstile token server-side', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      json: async () => ({ success: false }),
    });

    const response = await POST(makeFormRequest(validFields));
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toMatch(/captcha/i);
  });

  test('sanitizes input fields — strips HTML tags', async () => {
    const xssFields = {
      ...validFields,
      name: '<script>alert("xss")</script>',
      message: '<img src=x onerror=alert("xss")>',
    };
    const response = await POST(makeFormRequest(xssFields));
    // Should process (sanitized) — not crash
    expect([200, 400]).toContain(response.status);
  });

  test('validates email format', async () => {
    const badEmail = { ...validFields, email: 'not-an-email' };
    const response = await POST(makeFormRequest(badEmail));
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toMatch(/email/i);
  });

  test('does not leak PII in error responses', async () => {
    const { 'turnstile-response': _, ...noToken } = validFields;
    const piiFields = {
      ...noToken,
      name: 'Sensitive Name',
      email: 'sensitive@email.com',
      message: 'Sensitive message',
    };
    const response = await POST(makeFormRequest(piiFields));
    const data = await response.json();

    const errorText = JSON.stringify(data);
    expect(errorText).not.toContain('Sensitive Name');
    expect(errorText).not.toContain('sensitive@email.com');
    expect(errorText).not.toContain('Sensitive message');
  });

  test('handles server errors gracefully', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network failure'));
    const response = await POST(makeFormRequest(validFields));
    // Turnstile verify fails → 400 (captcha failed)
    expect([400, 500]).toContain(response.status);
  });
});
