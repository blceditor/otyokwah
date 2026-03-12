/**
 * REQ-BUILD-001, REQ-BUILD-002, REQ-BUILD-003, REQ-BUILD-004
 * Build Optimization Tests
 *
 * Tests that verify build optimization configurations are properly set
 */

import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Build Optimization Configuration', () => {
  let nextConfigContent: string;

  beforeAll(() => {
    const configPath = path.join(process.cwd(), 'next.config.mjs');
    nextConfigContent = fs.readFileSync(configPath, 'utf-8');
  });

  describe('REQ-BUILD-002: Parallel Build Workers', () => {
    it('should have experimental section defined', () => {
      expect(nextConfigContent).toContain('experimental');
    });

    it('should enable webpackBuildWorker', () => {
      expect(nextConfigContent).toContain('webpackBuildWorker: true');
    });

    it('should enable parallelServerCompiles', () => {
      expect(nextConfigContent).toContain('parallelServerCompiles: true');
    });

    it('should enable parallelServerBuildTraces', () => {
      expect(nextConfigContent).toContain('parallelServerBuildTraces: true');
    });
  });

  describe('REQ-BUILD-003: Package Import Optimization', () => {
    it('should have optimizePackageImports configured', () => {
      expect(nextConfigContent).toContain('optimizePackageImports');
    });

    it('should optimize lucide-react imports', () => {
      expect(nextConfigContent).toContain("'lucide-react'");
    });

    it('should optimize @headlessui/react imports', () => {
      expect(nextConfigContent).toContain("'@headlessui/react'");
    });
  });
});

describe('REQ-BUILD-001: ISR Revalidation API', () => {
  it('should have revalidate API route file', () => {
    const routePath = path.join(process.cwd(), 'app/api/revalidate/route.ts');
    expect(fs.existsSync(routePath)).toBe(true);
  });

  it('should export POST handler', async () => {
    // Dynamic import to check exports
    const routePath = path.join(process.cwd(), 'app/api/revalidate/route.ts');
    if (fs.existsSync(routePath)) {
      const content = fs.readFileSync(routePath, 'utf-8');
      expect(content).toContain('export async function POST');
    }
  });

  it('should require secret header for security', async () => {
    const routePath = path.join(process.cwd(), 'app/api/revalidate/route.ts');
    if (fs.existsSync(routePath)) {
      const content = fs.readFileSync(routePath, 'utf-8');
      expect(content).toContain('x-revalidate-secret');
      expect(content).toContain('REVALIDATE_SECRET');
    }
  });

  it('should use revalidatePath from next/cache', async () => {
    const routePath = path.join(process.cwd(), 'app/api/revalidate/route.ts');
    if (fs.existsSync(routePath)) {
      const content = fs.readFileSync(routePath, 'utf-8');
      expect(content).toContain("from 'next/cache'");
      expect(content).toContain('revalidatePath');
    }
  });
});

describe('ISR with On-Demand Revalidation', () => {
  it('should have ISR config in [slug]/page.tsx', () => {
    const pagePath = path.join(process.cwd(), 'app/[slug]/page.tsx');
    const content = fs.readFileSync(pagePath, 'utf-8');
    // Pages use ISR: static by default, revalidated on-demand via webhook
    expect(content).toContain("revalidate = false");
    expect(content).toContain("fetchCache = 'default-no-store'");
  });
});
