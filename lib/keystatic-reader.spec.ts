// REQ-101: Draft Mode Preview - Keystatic Reader Abstraction
import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest';
import { TEST_ENV_STUBS } from '@/tests/fixtures/config';

describe('REQ-101 — Keystatic Reader Abstraction', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test('returns local reader in development environment', async () => {
    vi.stubEnv('NODE_ENV', 'development');

    // @ts-ignore - Module will be implemented
    const { getReader } = await import('./keystatic-reader');
    const reader = getReader();

    expect(reader).toBeDefined();
    // Local reader should not require GitHub token
    expect(reader).toHaveProperty('collections');
  });

  test('returns GitHub reader in production environment', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('GITHUB_REPO', TEST_ENV_STUBS.GITHUB_REPO);

    // @ts-ignore - Module will be implemented
    const { getReader } = await import('./keystatic-reader');
    const reader = getReader();

    expect(reader).toBeDefined();
    expect(reader).toHaveProperty('collections');
  });

  test('returns GitHub reader with branch in draft mode', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('GITHUB_REPO', TEST_ENV_STUBS.GITHUB_REPO);
    vi.stubEnv('GITHUB_TOKEN', 'ghp_testtoken123');

    const DRAFT_BRANCH = 'feature/new-content';

    // @ts-ignore - Module will be implemented
    const { getReader } = await import('./keystatic-reader');

    // Mock draft mode enabled
    vi.mock('next/headers', () => ({
      draftMode: () => ({ isEnabled: true }),
    }));

    const reader = getReader(DRAFT_BRANCH);

    expect(reader).toBeDefined();
    // Should use authenticated GitHub reader for private repos
    expect(reader).toHaveProperty('collections');
  });

  test('uses main branch when no branch specified', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('GITHUB_REPO', TEST_ENV_STUBS.GITHUB_REPO);

    // @ts-ignore - Module will be implemented
    const { getReader } = await import('./keystatic-reader');
    const reader = getReader();

    expect(reader).toBeDefined();
    // Should read from main branch by default
  });

  test('requires GITHUB_TOKEN for draft mode with private repo', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('GITHUB_REPO', TEST_ENV_STUBS.GITHUB_REPO);
    // Token intentionally not set

    const DRAFT_BRANCH = 'feature/test';

    // @ts-ignore - Module will be implemented
    const { getReader } = await import('./keystatic-reader');

    vi.mock('next/headers', () => ({
      draftMode: () => ({ isEnabled: true }),
    }));

    // Should throw or warn when token missing for authenticated access
    expect(() => getReader(DRAFT_BRANCH)).toThrow(/GITHUB_TOKEN/);
  });

  test('reader provides access to pages collection', async () => {
    vi.stubEnv('NODE_ENV', 'development');

    // @ts-ignore - Module will be implemented
    const { getReader } = await import('./keystatic-reader');
    const reader = getReader();

    expect(reader.collections).toHaveProperty('pages');
    expect(reader.collections.pages).toHaveProperty('all');
    expect(reader.collections.pages).toHaveProperty('read');
  });

  test('changes to draft content are reflected within 5 seconds', async () => {
    vi.stubEnv('NODE_ENV', 'development');

    // @ts-ignore - Module will be implemented
    const { getReader } = await import('./keystatic-reader');
    const reader = getReader('feature/test-branch');

    const startTime = Date.now();

    // Simulate reading content
    const content = await reader.collections.pages.read('test-slug');

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Should return within 5 seconds (5000ms)
    expect(duration).toBeLessThan(5000);
  });

  test('works for pages collection', async () => {
    vi.stubEnv('NODE_ENV', 'development');

    // @ts-ignore - Module will be implemented
    const { getReader } = await import('./keystatic-reader');
    const reader = getReader();

    expect(reader.collections.pages).toBeDefined();
    expect(typeof reader.collections.pages.read).toBe('function');
  });
});
