/**
 * REQ-LP-005D: DOM Selector Resilience Tests
 *
 * Centralized DOM selectors for Keystatic elements.
 * Must be version-aware and provide fallbacks.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

// Will be implemented
import {
  KEYSTATIC_SELECTORS,
  findElement,
  findAllElements,
  waitForElement,
  getKeystaticVersion,
} from './dom-selectors';

describe('REQ-LP-005D: DOM Selector Resilience', () => {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  afterEach(() => {
    document.body.replaceChildren();
  });

  describe('KEYSTATIC_SELECTORS', () => {
    it('exports selectors for ProseMirror editor', () => {
      expect(KEYSTATIC_SELECTORS.proseMirror).toBeDefined();
      expect(KEYSTATIC_SELECTORS.proseMirror.primary).toBe('.ProseMirror');
    });

    it('exports selectors for title field', () => {
      expect(KEYSTATIC_SELECTORS.title).toBeDefined();
      expect(KEYSTATIC_SELECTORS.title.primary).toContain('title');
    });

    it('exports selectors for template discriminant', () => {
      expect(KEYSTATIC_SELECTORS.templateDiscriminant).toBeDefined();
    });

    it('provides fallback selectors for each element type', () => {
      expect(KEYSTATIC_SELECTORS.proseMirror.fallbacks).toBeInstanceOf(Array);
      expect(KEYSTATIC_SELECTORS.proseMirror.fallbacks.length).toBeGreaterThan(0);
    });
  });

  describe('findElement', () => {
    it('returns element when primary selector matches', () => {
      const div = document.createElement('div');
      div.className = 'ProseMirror';
      document.body.appendChild(div);

      const result = findElement('proseMirror');
      expect(result).toBe(div);
    });

    it('tries fallback selectors when primary fails', () => {
      const div = document.createElement('div');
      div.setAttribute('contenteditable', 'true');
      document.body.appendChild(div);

      const result = findElement('proseMirror');
      expect(result).toBe(div);
    });

    it('returns null when no selectors match', () => {
      const result = findElement('proseMirror');
      expect(result).toBeNull();
    });

    it('accepts custom selector key', () => {
      const input = document.createElement('input');
      input.name = 'title';
      document.body.appendChild(input);

      const result = findElement('title');
      expect(result).toBe(input);
    });
  });

  describe('findAllElements', () => {
    it('returns all matching elements', () => {
      const div1 = document.createElement('div');
      div1.className = 'ProseMirror';
      const div2 = document.createElement('div');
      div2.className = 'ProseMirror';
      document.body.appendChild(div1);
      document.body.appendChild(div2);

      const results = findAllElements('proseMirror');
      expect(results).toHaveLength(2);
    });

    it('returns empty array when none match', () => {
      const results = findAllElements('proseMirror');
      expect(results).toEqual([]);
    });
  });

  describe('waitForElement', () => {
    it('resolves immediately if element exists', async () => {
      const div = document.createElement('div');
      div.className = 'ProseMirror';
      document.body.appendChild(div);

      const result = await waitForElement('proseMirror', { timeout: 100 });
      expect(result).toBe(div);
    });

    it('waits for element to appear via MutationObserver', async () => {
      const promise = waitForElement('proseMirror', { timeout: 1000 });

      // Add element after short delay
      setTimeout(() => {
        const div = document.createElement('div');
        div.className = 'ProseMirror';
        document.body.appendChild(div);
      }, 50);

      const result = await promise;
      expect(result).toBeInstanceOf(HTMLElement);
    });

    it('rejects after timeout if element never appears', async () => {
      await expect(waitForElement('proseMirror', { timeout: 50 })).rejects.toThrow(/timeout/i);
    });
  });

  describe('getKeystaticVersion', () => {
    it('returns version string from package', () => {
      const version = getKeystaticVersion();
      expect(version).toMatch(/^\d+\.\d+\.\d+$/);
    });
  });
});
