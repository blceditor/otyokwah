/**
 * REQ-SEC-004: SSRF Protection Tests
 */
import { describe, test, expect } from 'vitest';
import { isSsrfSafeUrl } from './validate-ssrf';

describe('REQ-SEC-004: SSRF Protection', () => {
  test('allows relative URLs', () => {
    expect(isSsrfSafeUrl('/images/photo.jpg')).toBe(true);
    expect(isSsrfSafeUrl('/api/data')).toBe(true);
  });

  test('allows valid HTTPS URLs', () => {
    expect(isSsrfSafeUrl('https://example.com/image.jpg')).toBe(true);
    expect(isSsrfSafeUrl('https://cdn.example.com/assets/photo.png')).toBe(true);
  });

  test('blocks HTTP URLs', () => {
    expect(isSsrfSafeUrl('http://example.com/image.jpg')).toBe(false);
  });

  test('blocks AWS metadata endpoint', () => {
    expect(isSsrfSafeUrl('https://169.254.169.254/latest/meta-data/')).toBe(false);
  });

  test('blocks localhost', () => {
    expect(isSsrfSafeUrl('https://localhost/admin')).toBe(false);
    expect(isSsrfSafeUrl('https://127.0.0.1/admin')).toBe(false);
    expect(isSsrfSafeUrl('https://127.0.0.2/admin')).toBe(false);
    expect(isSsrfSafeUrl('https://127.255.255.255/')).toBe(false);
  });

  test('blocks private IPs (10.x.x.x)', () => {
    expect(isSsrfSafeUrl('https://10.0.0.1/internal')).toBe(false);
    expect(isSsrfSafeUrl('https://10.255.255.255/')).toBe(false);
  });

  test('blocks private IPs (172.16-31.x.x)', () => {
    expect(isSsrfSafeUrl('https://172.16.0.1/internal')).toBe(false);
    expect(isSsrfSafeUrl('https://172.31.255.255/internal')).toBe(false);
    // Should NOT block 172.15.x.x or 172.32.x.x
    expect(isSsrfSafeUrl('https://172.15.0.1/')).toBe(true);
    expect(isSsrfSafeUrl('https://172.32.0.1/')).toBe(true);
  });

  test('blocks private IPs (192.168.x.x)', () => {
    expect(isSsrfSafeUrl('https://192.168.1.1/internal')).toBe(false);
    expect(isSsrfSafeUrl('https://192.168.0.1/')).toBe(false);
  });

  test('blocks CGNAT range (100.64.0.0/10)', () => {
    expect(isSsrfSafeUrl('https://100.64.0.1/')).toBe(false);
    expect(isSsrfSafeUrl('https://100.127.255.255/')).toBe(false);
    // Should NOT block outside CGNAT range
    expect(isSsrfSafeUrl('https://100.63.255.255/')).toBe(true);
    expect(isSsrfSafeUrl('https://100.128.0.1/')).toBe(true);
  });

  test('blocks IPv6 loopback', () => {
    expect(isSsrfSafeUrl('https://[::1]/admin')).toBe(false);
  });

  test('blocks IPv6 link-local', () => {
    expect(isSsrfSafeUrl('https://[fe80::1]/')).toBe(false);
    expect(isSsrfSafeUrl('https://[fe80::1234:5678]/')).toBe(false);
  });

  test('blocks IPv6 unique local', () => {
    expect(isSsrfSafeUrl('https://[fc00::1]/')).toBe(false);
    expect(isSsrfSafeUrl('https://[fd00::1]/')).toBe(false);
  });

  test('blocks IPv4-mapped IPv6 (decimal format)', () => {
    expect(isSsrfSafeUrl('https://[::ffff:127.0.0.1]/')).toBe(false);
    expect(isSsrfSafeUrl('https://[::ffff:169.254.169.254]/')).toBe(false);
    expect(isSsrfSafeUrl('https://[::ffff:192.168.1.1]/')).toBe(false);
    expect(isSsrfSafeUrl('https://[::ffff:10.0.0.1]/')).toBe(false);
  });

  // Round 6 additions: IPv4-mapped IPv6 hex notation
  test('blocks IPv4-mapped IPv6 loopback (hex)', () => {
    expect(isSsrfSafeUrl('https://[::ffff:7f00:0001]/')).toBe(false); // 127.0.0.1
    expect(isSsrfSafeUrl('https://[::ffff:7f00:1]/')).toBe(false); // 127.0.0.1 (short form)
  });

  test('blocks IPv4-mapped IPv6 AWS metadata (hex)', () => {
    expect(isSsrfSafeUrl('https://[::ffff:a9fe:a9fe]/')).toBe(false); // 169.254.169.254
  });

  test('blocks IPv4-mapped IPv6 private (hex)', () => {
    expect(isSsrfSafeUrl('https://[::ffff:c0a8:0101]/')).toBe(false); // 192.168.1.1
    expect(isSsrfSafeUrl('https://[::ffff:0a00:0001]/')).toBe(false); // 10.0.0.1
    expect(isSsrfSafeUrl('https://[::ffff:ac10:0001]/')).toBe(false); // 172.16.0.1
  });

  test('blocks .local domains', () => {
    expect(isSsrfSafeUrl('https://server.local/api')).toBe(false);
    expect(isSsrfSafeUrl('https://my.server.local/')).toBe(false);
  });

  test('blocks .internal domains', () => {
    expect(isSsrfSafeUrl('https://api.internal/data')).toBe(false);
    expect(isSsrfSafeUrl('https://service.internal/')).toBe(false);
  });

  test('blocks invalid URLs', () => {
    expect(isSsrfSafeUrl('not-a-url')).toBe(false);
    expect(isSsrfSafeUrl('')).toBe(false);
    expect(isSsrfSafeUrl('ftp://example.com/')).toBe(false);
    expect(isSsrfSafeUrl('file:///etc/passwd')).toBe(false);
  });
});
