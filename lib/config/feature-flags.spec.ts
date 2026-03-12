/**
 * REQ-LP-003: Feature Flag Control Tests
 *
 * Feature flag to enable/disable live preview panel.
 * Must support: environment variable, runtime toggle with localStorage, default off.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import {
  isLivePreviewEnabled,
  setLivePreviewEnabled,
  getLivePreviewConfig,
  resetFeatureFlags,
} from './feature-flags';

describe('REQ-LP-003: Feature Flag Control', () => {
  const originalEnv = process.env;

  // Mock localStorage
  const mockLocalStorage = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
    };
  })();

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    mockLocalStorage.clear();
    Object.defineProperty(global, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });
    // Reset any persisted state
    resetFeatureFlags();
  });

  afterEach(() => {
    process.env = originalEnv;
    mockLocalStorage.clear();
  });

  describe('isLivePreviewEnabled', () => {
    it('returns false by default when env var not set', () => {
      delete process.env.NEXT_PUBLIC_ENABLE_LIVE_PREVIEW;
      expect(isLivePreviewEnabled()).toBe(false);
    });

    it('returns true when env var is "true"', () => {
      process.env.NEXT_PUBLIC_ENABLE_LIVE_PREVIEW = 'true';
      expect(isLivePreviewEnabled()).toBe(true);
    });

    it('returns false when env var is "false"', () => {
      process.env.NEXT_PUBLIC_ENABLE_LIVE_PREVIEW = 'false';
      expect(isLivePreviewEnabled()).toBe(false);
    });

    it('returns false for invalid env var values', () => {
      process.env.NEXT_PUBLIC_ENABLE_LIVE_PREVIEW = 'yes';
      expect(isLivePreviewEnabled()).toBe(false);
    });
  });

  describe('setLivePreviewEnabled', () => {
    it('can override env var setting at runtime', () => {
      process.env.NEXT_PUBLIC_ENABLE_LIVE_PREVIEW = 'false';
      setLivePreviewEnabled(true);
      expect(isLivePreviewEnabled()).toBe(true);
    });

    it('runtime override persists in localStorage', () => {
      setLivePreviewEnabled(true);
      expect(isLivePreviewEnabled()).toBe(true);
      expect(mockLocalStorage.getItem('blc-live-preview-enabled')).toBe('true');

      setLivePreviewEnabled(false);
      expect(isLivePreviewEnabled()).toBe(false);
      expect(mockLocalStorage.getItem('blc-live-preview-enabled')).toBe('false');
    });

    it('can reset to env var default with null', () => {
      process.env.NEXT_PUBLIC_ENABLE_LIVE_PREVIEW = 'true';
      setLivePreviewEnabled(false);
      expect(isLivePreviewEnabled()).toBe(false);
      setLivePreviewEnabled(null);
      expect(isLivePreviewEnabled()).toBe(true);
      expect(mockLocalStorage.getItem('blc-live-preview-enabled')).toBeNull();
    });
  });

  describe('getLivePreviewConfig', () => {
    it('returns full config object', () => {
      process.env.NEXT_PUBLIC_ENABLE_LIVE_PREVIEW = 'true';
      const config = getLivePreviewConfig();

      expect(config).toMatchObject({
        enabled: true,
        source: expect.stringMatching(/env|runtime/),
      });
    });

    it('reports runtime source when localStorage override is set', () => {
      setLivePreviewEnabled(true);
      const config = getLivePreviewConfig();

      expect(config.source).toBe('runtime');
    });

    it('reports env source when using env var', () => {
      process.env.NEXT_PUBLIC_ENABLE_LIVE_PREVIEW = 'true';
      const config = getLivePreviewConfig();

      expect(config.source).toBe('env');
    });

    it('includes debounce settings', () => {
      const config = getLivePreviewConfig();

      expect(config.debounceMs).toBeGreaterThan(0);
      expect(config.maxDebounceMs).toBeGreaterThan(config.debounceMs);
    });

    it('includes panel width constraints', () => {
      const config = getLivePreviewConfig();

      expect(config.minPanelWidth).toBeGreaterThan(0);
      expect(config.maxPanelWidth).toBeLessThanOrEqual(100);
      expect(config.defaultPanelWidth).toBeGreaterThanOrEqual(config.minPanelWidth);
      expect(config.defaultPanelWidth).toBeLessThanOrEqual(config.maxPanelWidth);
    });
  });
});
