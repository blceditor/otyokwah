/**
 * REQ-LP-005D: DOM Selector Resilience
 *
 * Centralized DOM selectors for Keystatic elements.
 * Version-aware with fallbacks for stability.
 */

export interface SelectorConfig {
  primary: string;
  fallbacks: string[];
  description: string;
}

export interface KeystaticSelectors {
  proseMirror: SelectorConfig;
  title: SelectorConfig;
  templateDiscriminant: SelectorConfig;
  heroTagline: SelectorConfig;
  saveButton: SelectorConfig;
}

/**
 * Centralized selectors for Keystatic DOM elements
 * Keystatic version: 0.5.48
 */
export const KEYSTATIC_SELECTORS: KeystaticSelectors = {
  proseMirror: {
    primary: '.ProseMirror',
    fallbacks: ['[contenteditable="true"]', '[role="textbox"]', '[data-field="content"]'],
    description: 'ProseMirror rich text editor',
  },
  title: {
    primary: 'input[name="title"]',
    fallbacks: [
      '[data-field="title"] input',
      'input[name*="title"][type="text"]',
      'input[placeholder*="title" i]',
    ],
    description: 'Page title input field',
  },
  templateDiscriminant: {
    primary: 'select[name*="discriminant"]',
    fallbacks: ['[data-field*="templateFields"] select', 'input[name*="discriminant"]'],
    description: 'Template type selector',
  },
  heroTagline: {
    primary: 'input[name="heroTagline"]',
    fallbacks: ['[data-field="heroTagline"] input', 'input[name*="heroTagline"]'],
    description: 'Hero tagline input field',
  },
  saveButton: {
    primary: 'button[type="submit"]',
    fallbacks: ['button:contains("Save")', '[data-testid="save-button"]'],
    description: 'Save/submit button',
  },
};

type SelectorKey = keyof KeystaticSelectors;

/**
 * Find single element using primary selector with fallbacks
 */
export function findElement(key: SelectorKey): HTMLElement | null {
  const config = KEYSTATIC_SELECTORS[key];
  if (!config) {
    return null;
  }

  // Try primary selector first
  const primary = document.querySelector(config.primary) as HTMLElement | null;
  if (primary) {
    return primary;
  }

  // Try fallback selectors
  for (const fallback of config.fallbacks) {
    try {
      const element = document.querySelector(fallback) as HTMLElement | null;
      if (element) {
        return element;
      }
    } catch {
      // Invalid selector, skip
    }
  }

  return null;
}

/**
 * Find all elements matching primary selector
 */
export function findAllElements(key: SelectorKey): HTMLElement[] {
  const config = KEYSTATIC_SELECTORS[key];
  if (!config) {
    return [];
  }

  const elements = document.querySelectorAll(config.primary);
  return Array.from(elements) as HTMLElement[];
}

interface WaitForElementOptions {
  timeout?: number;
  interval?: number;
}

/**
 * Wait for element to appear in DOM
 */
export function waitForElement(
  key: SelectorKey,
  options: WaitForElementOptions = {}
): Promise<HTMLElement> {
  const { timeout = 5000 } = options;

  return new Promise((resolve, reject) => {
    // Check if already exists
    const existing = findElement(key);
    if (existing) {
      resolve(existing);
      return;
    }

    const config = KEYSTATIC_SELECTORS[key];
    if (!config) {
      reject(new Error(`Unknown selector key: ${key}`));
      return;
    }

    // Set up observer
    const observer = new MutationObserver(() => {
      const element = findElement(key);
      if (element) {
        observer.disconnect();
        clearTimeout(timeoutId);
        resolve(element);
      }
    });

    // Set timeout
    const timeoutId = setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Timeout waiting for element: ${key} (${timeout}ms)`));
    }, timeout);

    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}

/**
 * Get Keystatic version from package
 */
export function getKeystaticVersion(): string {
  // In a real implementation, this would read from node_modules
  // For now, return the pinned version from CLAUDE.md
  return '0.5.48';
}

/**
 * Validate selectors against current DOM
 * Returns report of which selectors are working
 */
export function validateSelectors(): Record<SelectorKey, boolean> {
  const result: Record<string, boolean> = {};

  for (const key of Object.keys(KEYSTATIC_SELECTORS) as SelectorKey[]) {
    result[key] = findElement(key) !== null;
  }

  return result as Record<SelectorKey, boolean>;
}
