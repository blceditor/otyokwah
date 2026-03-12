// Vitest setup file
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import fs from 'fs';
import { Module } from 'module';

type NodeModuleWithResolve = NodeModule & {
  _resolveFilename(
    request: string,
    parent: NodeModule | null | undefined,
    isMain: boolean,
    options?: Record<string, unknown>
  ): string;
};

type GlobalWithRequire = typeof globalThis & {
  require: NodeRequire;
};

// Create CommonJS require in ESM context
const originalRequire = createRequire(import.meta.url);

// Cache for transformed modules
const transformedModules = new Map<string, unknown>();

// Create a patched require that can handle .tsx files through esbuild transform
async function transformTsxFile(filePath: string): Promise<unknown> {
  // Use dynamic import which goes through vitest's transformation
  const module = await import(filePath);
  return module;
}

// Create a synchronous wrapper using deasync pattern (not ideal but necessary for require)
function patchedRequire(request: string): unknown {
  // For TypeScript files, we'll pre-load them synchronously using Node's VM
  if (request.startsWith('./') || request.startsWith('../')) {
    const callerFile = new Error().stack
      ?.split('\n')[2]
      ?.match(/\((.+?):\d+:\d+\)/)?.[1] || '';
    const callerDir = callerFile ? path.dirname(callerFile) : process.cwd();

    const extensions = ['', '.tsx', '.ts', '.jsx', '.js'];
    for (const ext of extensions) {
      const fullPath = path.resolve(callerDir, request + ext);
      if (fs.existsSync(fullPath)) {
        // For .tsx/.ts files, read and compile inline using esbuild-like transform
        if (ext === '.tsx' || ext === '.jsx') {
          // Check cache
          if (transformedModules.has(fullPath)) {
            return transformedModules.get(fullPath);
          }

          // Read the file
          const source = fs.readFileSync(fullPath, 'utf-8');

          // Simple transform: convert export to module.exports
          //  This is a hack but should work for simple cases
          const transformed = source
            .replace(/^export\s+interface\s+/gm, '// interface ')
            .replace(/^export\s+type\s+/gm, '// type ')
            .replace(/import\s+Image\s+from\s+['"]next\/image['"]/g, "const Image = require('next/image').default || require('next/image')")
            .replace(/import\s+Link\s+from\s+['"]next\/link['"]/g, "const Link = require('next/link').default || require('next/link')")
            .replace(/^export\s+function\s+(\w+)/gm, 'exports.$1 = function $1')
            .replace(/^export\s+{([^}]+)}/gm, '// exports');

          // Use require cache mechanism
          const Module = require('module');
          const m = new Module(fullPath, module);
          m.filename = fullPath;
          m.paths = (Module as typeof Module & {_nodeModulePaths: (dir: string) => string[]})._nodeModulePaths(path.dirname(fullPath));

          try {
            m._compile(transformed, fullPath);
            transformedModules.set(fullPath, m.exports);
            return m.exports;
          } catch (e) {
            console.error(`Error compiling ${fullPath}:`, e);
            throw e;
          }
        }
      }
    }
  }

  // Fall back to original require for other cases
  return originalRequire(request);
}

// Extend Module._resolveFilename to handle .tsx files
const originalResolveFilename = (Module as unknown as NodeModuleWithResolve)._resolveFilename;
(Module as unknown as NodeModuleWithResolve)._resolveFilename = function (
  request: string,
  parent: NodeModule | null | undefined,
  isMain: boolean,
  options?: Record<string, unknown>
): string {
  // Try original resolution first
  try {
    return originalResolveFilename.call(this, request, parent, isMain, options);
  } catch (err: unknown) {
    // If it's a relative path and fails, try adding .tsx
    if (request.startsWith('./') || request.startsWith('../')) {
      const extensions = ['.tsx', '.ts', '.jsx', '.js'];
      const parentDir = parent?.filename ? path.dirname(parent.filename) : process.cwd();

      for (const ext of extensions) {
        const fullPath = path.resolve(parentDir, request + ext);
        if (fs.existsSync(fullPath)) {
          return fullPath;
        }
      }
    }
    throw err;
  }
};

// Make require available globally for tests
(globalThis as unknown as GlobalWithRequire).require = patchedRequire as NodeRequire;

// Mock window.matchMedia for tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver for tests
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  root: null,
  rootMargin: '',
  thresholds: [],
  takeRecords: vi.fn().mockReturnValue([]),
})) as unknown as typeof IntersectionObserver;

// Mock FileReader for image validation tests
class MockFileReader {
  result: string | ArrayBuffer | null = null;
  error: DOMException | null = null;
  readyState: number = 0;
  onload: ((event: ProgressEvent<FileReader>) => void) | null = null;
  onerror: ((event: ProgressEvent<FileReader>) => void) | null = null;
  onloadend: ((event: ProgressEvent<FileReader>) => void) | null = null;

  readAsDataURL(_blob: Blob) {
    // Simulate async file read
    setTimeout(() => {
      this.readyState = 2;
      if (this.onload) {
        this.onload({} as ProgressEvent<FileReader>);
      }
      if (this.onloadend) {
        this.onloadend({} as ProgressEvent<FileReader>);
      }
    }, 0);
  }

  readAsArrayBuffer(_blob: Blob) {
    setTimeout(() => {
      this.readyState = 2;
      if (this.onload) {
        this.onload({} as ProgressEvent<FileReader>);
      }
      if (this.onloadend) {
        this.onloadend({} as ProgressEvent<FileReader>);
      }
    }, 0);
  }

  abort() {
    this.readyState = 0;
  }

  addEventListener(_type: string, _listener: EventListener) {}
  removeEventListener(_type: string, _listener: EventListener) {}
  dispatchEvent(_event: Event): boolean { return true; }
}

global.FileReader = MockFileReader as unknown as typeof FileReader;

// Mock Next.js navigation hooks for all tests
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/keystatic/pages/test',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

// Mock localStorage for all tests
class LocalStorageMock {
  private store: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.store[key] || null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }

  key(index: number): string | null {
    const keys = Object.keys(this.store);
    return keys[index] || null;
  }

  get length(): number {
    return Object.keys(this.store).length;
  }
}

global.localStorage = new LocalStorageMock() as Storage;

// Mock fetch API for all tests
global.fetch = vi.fn().mockImplementation((url: string) => {
  // Default mock for deployment status
  if (url.includes('/api/vercel-status')) {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          status: 'READY',
          state: 'Published',
          timestamp: Date.now() - 120000, // 2 minutes ago
        }),
    });
  }

  // Default 404 for unknown endpoints
  return Promise.resolve({
    ok: false,
    status: 404,
    json: () => Promise.resolve({ error: 'Not found' }),
  });
}) as typeof fetch;
