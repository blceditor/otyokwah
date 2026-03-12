/**
 * REQ-LP-003: Feature Flag Control
 *
 * Feature flags for live preview panel.
 * Supports environment variable and runtime override with localStorage persistence.
 */

export interface LivePreviewConfig {
  enabled: boolean;
  source: 'env' | 'runtime' | 'default';
  debounceMs: number;
  maxDebounceMs: number;
  minPanelWidth: number;
  maxPanelWidth: number;
  defaultPanelWidth: number;
}

const STORAGE_KEY = 'blc-live-preview-enabled';

/**
 * Get persisted override from localStorage
 */
function getPersistedOverride(): boolean | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'true') return true;
    if (stored === 'false') return false;
    return null;
  } catch {
    return null;
  }
}

/**
 * Check if live preview is enabled
 */
export function isLivePreviewEnabled(): boolean {
  // Check localStorage override first (persists across reloads)
  const persisted = getPersistedOverride();
  if (persisted !== null) {
    return persisted;
  }

  // Check environment variable
  const envValue = process.env.NEXT_PUBLIC_ENABLE_LIVE_PREVIEW;
  if (envValue === 'true') {
    return true;
  }

  // Default to disabled
  return false;
}

/**
 * Set runtime override for live preview (persists to localStorage)
 * @param enabled - true/false to override, null to reset to env default
 */
export function setLivePreviewEnabled(enabled: boolean | null): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    if (enabled === null) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, String(enabled));
    }
  } catch {
    // localStorage may be unavailable
  }
}

/**
 * Get full live preview configuration
 */
export function getLivePreviewConfig(): LivePreviewConfig {
  const enabled = isLivePreviewEnabled();
  const persisted = getPersistedOverride();

  let source: LivePreviewConfig['source'] = 'default';
  if (persisted !== null) {
    source = 'runtime';
  } else if (process.env.NEXT_PUBLIC_ENABLE_LIVE_PREVIEW === 'true') {
    source = 'env';
  }

  return {
    enabled,
    source,
    debounceMs: 300,
    maxDebounceMs: 2000,
    minPanelWidth: 30,
    maxPanelWidth: 70,
    defaultPanelWidth: 50,
  };
}

const NAV_HIDDEN_KEY = 'blc-hide-site-nav';

export function isNavHidden(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(NAV_HIDDEN_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setNavHidden(hidden: boolean | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (hidden === null) {
      localStorage.removeItem(NAV_HIDDEN_KEY);
    } else {
      localStorage.setItem(NAV_HIDDEN_KEY, String(hidden));
    }
  } catch {
    // localStorage may be unavailable
  }
}

// Reset function for testing
export function resetFeatureFlags(): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }
}
