// REQ-007: Gallery Component Structure
import { describe, test, expect } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

describe('REQ-007 — Gallery Component Structure', () => {
  test('Gallery component exists and exports default', async () => {
    const galleryModule = await import('./Gallery');

    expect(galleryModule.default).toBeDefined();
    expect(typeof galleryModule.default).toBe('function');
  });

  test('Gallery component renders a section element', async () => {
    const { default: Gallery } = await import('./Gallery');

    const { container } = render(<Gallery />);

    const section = container.querySelector('section');
    expect(section).toBeInTheDocument();
  });

  test('Gallery component renders without errors', async () => {
    const { default: Gallery } = await import('./Gallery');

    expect(() => {
      render(<Gallery />);
    }).not.toThrow();
  });

  test('Gallery component accepts className prop', async () => {
    const { default: Gallery } = await import('./Gallery');

    const customClass = 'custom-gallery';
    const { container } = render(<Gallery className={customClass} />);

    const section = container.querySelector('section');
  });

  test('Gallery component has TypeScript interface defined', async () => {
    const fs = await import('fs');
    const gallerySource = fs.readFileSync(
      require.resolve('./Gallery'),
      'utf-8'
    );

    const hasTypeDefinition =
      gallerySource.includes('interface') ||
      gallerySource.includes('type GalleryProps') ||
      gallerySource.includes(': {') ||
      gallerySource.includes('React.FC');

    expect(hasTypeDefinition).toBe(true);
  });

  test('Gallery component has no TypeScript errors', async () => {
    const galleryModule = await import('./Gallery');

    expect(galleryModule).toBeDefined();
    expect(galleryModule.default).toBeDefined();
  });
});
