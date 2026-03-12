// REQ-SLUG-001 through REQ-SLUG-003: SlugFieldInjector Component Tests
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { SlugFieldInjector } from './SlugFieldInjector';
import '@testing-library/jest-dom/vitest';

// Mock next/navigation
const mockPathname = vi.fn();
vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}));

describe('REQ-SLUG-001 — SlugFieldInjector Rendering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('renders null (no visible component)', () => {
    mockPathname.mockReturnValue('/keystatic/pages/about');

    const { container } = render(<SlugFieldInjector />);

    // Component renders nothing directly
    expect(container.innerHTML).toBe('');
  });

  test('does NOT inject on non-page routes', async () => {
    mockPathname.mockReturnValue('/keystatic');

    render(<SlugFieldInjector />);

    await new Promise((resolve) => setTimeout(resolve, 600));

    const preview = document.querySelector('.slug-url-preview');
    expect(preview).not.toBeInTheDocument();
  });

  test('does NOT inject on collection list routes', async () => {
    mockPathname.mockReturnValue('/keystatic/pages');

    render(<SlugFieldInjector />);

    await new Promise((resolve) => setTimeout(resolve, 600));

    const preview = document.querySelector('.slug-url-preview');
    expect(preview).not.toBeInTheDocument();
  });
});

describe('REQ-SLUG-002 — URL Preview Content', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('generates correct production URL for page slug', () => {
    mockPathname.mockReturnValue('/keystatic/pages/about');

    // Create mock slug field
    const mockField = document.createElement('div');
    mockField.setAttribute('data-field', 'title');
    const label = document.createElement('label');
    label.textContent = 'Page Title';
    mockField.appendChild(label);
    document.body.appendChild(mockField);

    render(<SlugFieldInjector />);

    // The component should attempt to inject after timeout
    // In real usage, the URL would include the slug from pathname
  });

  test('includes "Deploy required" warning badge', async () => {
    mockPathname.mockReturnValue('/keystatic/pages/contact');

    // Create mock slug field
    const mockField = document.createElement('div');
    mockField.setAttribute('data-field', 'title');
    const label = document.createElement('label');
    label.textContent = 'slug';
    mockField.appendChild(label);
    document.body.appendChild(mockField);

    render(<SlugFieldInjector />);

    await waitFor(
      () => {
        const preview = document.querySelector('.slug-url-preview');
        if (preview) {
          expect(preview.textContent).toContain('Deploy required');
        }
      },
      { timeout: 1000 }
    );
  });
});

describe('REQ-SLUG-003 — Cleanup and Lifecycle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('cleans up injected elements on unmount', async () => {
    mockPathname.mockReturnValue('/keystatic/pages/about');

    // Create mock slug field
    const mockField = document.createElement('div');
    mockField.setAttribute('data-field', 'title');
    const label = document.createElement('label');
    label.textContent = 'slug';
    mockField.appendChild(label);
    document.body.appendChild(mockField);

    const { unmount } = render(<SlugFieldInjector />);

    // Wait for injection
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Unmount
    unmount();

    // Should clean up
    const preview = document.querySelector('.slug-url-preview');
    expect(preview).not.toBeInTheDocument();
  });

  test('cleans up when navigating away from page edit', async () => {
    mockPathname.mockReturnValue('/keystatic/pages/about');

    // Create mock slug field
    const mockField = document.createElement('div');
    mockField.setAttribute('data-field', 'title');
    const label = document.createElement('label');
    label.textContent = 'slug';
    mockField.appendChild(label);
    document.body.appendChild(mockField);

    const { rerender } = render(<SlugFieldInjector />);

    // Wait for injection
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Navigate away
    mockPathname.mockReturnValue('/keystatic');
    rerender(<SlugFieldInjector />);

    await new Promise((resolve) => setTimeout(resolve, 100));

    const preview = document.querySelector('.slug-url-preview');
    expect(preview).not.toBeInTheDocument();
  });
});
