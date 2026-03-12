/**
 * REQ-GRID-001: Grid Utility Tests
 */

import { describe, it, expect } from 'vitest';
import { getGridClasses, type GridColumns, type GridGap } from './grid-classes';

describe('getGridClasses', () => {
  describe('column variations', () => {
    it('returns 2-column classes for columns=2', () => {
      const result = getGridClasses(2);
      expect(result).toContain('md:grid-cols-2');
      expect(result).not.toContain('md:grid-cols-3');
    });

    it('returns 3-column classes for columns=3', () => {
      const result = getGridClasses(3);
      expect(result).toContain('md:grid-cols-3');
    });

    it('returns 4-column classes with lg breakpoint for columns=4', () => {
      const result = getGridClasses(4);
      expect(result).toContain('md:grid-cols-3');
      expect(result).toContain('lg:grid-cols-4');
    });

    it('defaults to 3 columns when not specified', () => {
      const result = getGridClasses();
      expect(result).toContain('md:grid-cols-3');
    });
  });

  describe('gap variations', () => {
    it('returns gap-4 for sm gap', () => {
      const result = getGridClasses(3, 'sm');
      expect(result).toContain('gap-4');
    });

    it('returns gap-6 for md gap', () => {
      const result = getGridClasses(3, 'md');
      expect(result).toContain('gap-6');
    });

    it('returns gap-8 for lg gap', () => {
      const result = getGridClasses(3, 'lg');
      expect(result).toContain('gap-8');
    });

    it('defaults to md gap when not specified', () => {
      const result = getGridClasses(3);
      expect(result).toContain('gap-6');
    });
  });

  describe('base classes', () => {
    it('always includes grid class', () => {
      const result = getGridClasses();
      expect(result).toContain('grid');
    });

    it('always includes mobile single column', () => {
      const result = getGridClasses();
      expect(result).toContain('grid-cols-1');
    });

    it('always includes sm:grid-cols-2 breakpoint', () => {
      const result = getGridClasses();
      expect(result).toContain('sm:grid-cols-2');
    });
  });

  describe('type safety', () => {
    it('accepts all valid column values', () => {
      const columns: GridColumns[] = [2, 3, 4];
      columns.forEach((col) => {
        expect(() => getGridClasses(col)).not.toThrow();
      });
    });

    it('accepts all valid gap values', () => {
      const gaps: GridGap[] = ['sm', 'md', 'lg'];
      gaps.forEach((gap) => {
        expect(() => getGridClasses(3, gap)).not.toThrow();
      });
    });
  });
});
