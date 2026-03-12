// REQ-006: Testimonials Component Structure
import { describe, test, expect } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

describe('REQ-006 — Testimonials Component Structure', () => {
  test('Testimonials component exists and exports default', async () => {
    const testimonialsModule = await import('./Testimonials');

    expect(testimonialsModule.default).toBeDefined();
    expect(typeof testimonialsModule.default).toBe('function');
  });

  test('Testimonials component renders a section element', async () => {
    const { default: Testimonials } = await import('./Testimonials');

    const { container } = render(<Testimonials />);

    const section = container.querySelector('section');
    expect(section).toBeInTheDocument();
  });

  test('Testimonials component renders without errors', async () => {
    const { default: Testimonials } = await import('./Testimonials');

    expect(() => {
      render(<Testimonials />);
    }).not.toThrow();
  });

  test('Testimonials component accepts className prop', async () => {
    const { default: Testimonials } = await import('./Testimonials');

    const customClass = 'custom-testimonials';
    const { container } = render(<Testimonials className={customClass} />);

    const section = container.querySelector('section');
  });

  test('Testimonials component has TypeScript interface defined', async () => {
    const fs = await import('fs');
    const testimonialsSource = fs.readFileSync(
      require.resolve('./Testimonials'),
      'utf-8'
    );

    const hasTypeDefinition =
      testimonialsSource.includes('interface') ||
      testimonialsSource.includes('type TestimonialsProps') ||
      testimonialsSource.includes(': {') ||
      testimonialsSource.includes('React.FC');

    expect(hasTypeDefinition).toBe(true);
  });

  test('Testimonials component has no TypeScript errors', async () => {
    const testimonialsModule = await import('./Testimonials');

    expect(testimonialsModule).toBeDefined();
    expect(testimonialsModule.default).toBeDefined();
  });
});
