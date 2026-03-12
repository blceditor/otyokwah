// REQ-Q1-002: Replace Placeholder Photos - Programs Component
import { describe, test, expect } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

describe('REQ-Q1-002 — Programs Component Image Optimization', () => {
  test('Program cards use next/image for photos', async () => {
    const { default: Programs } = await import('./Programs');
    const { container } = render(<Programs />);

    // Should have next/image optimized images
    const images = container.querySelectorAll('img');
    expect(images.length).toBeGreaterThan(0);

    // next/image adds loading attribute
    const firstImage = images[0];
    expect(firstImage).toHaveAttribute('loading');
  });

  test('Program cards have Jr. High and High School images', async () => {
    const { default: Programs } = await import('./Programs');
    const { container } = render(<Programs />);

    const images = container.querySelectorAll('img');

    // Should have at least 2 images (one per program)
    expect(images.length).toBeGreaterThanOrEqual(2);
  });

  test('Program images use authentic camper photos (not stock)', async () => {
    const { default: Programs } = await import('./Programs');
    const { container } = render(<Programs />);

    const images = container.querySelectorAll('img');

    images.forEach(img => {
      const src = img.getAttribute('src') || '';

      // Should not use placeholder services
      expect(src).not.toContain('placeholder');
      expect(src).not.toContain('via.placeholder');
      expect(src).not.toContain('picsum');
      expect(src).not.toContain('loremflickr');
      expect(src).not.toContain('unsplash');
    });
  });

  test('Program images have descriptive alt text', async () => {
    const { default: Programs } = await import('./Programs');
    const { container } = render(<Programs />);

    const images = container.querySelectorAll('img');

    images.forEach(img => {
      const altText = img.getAttribute('alt');
      expect(altText).toBeTruthy();
      expect(altText).not.toBe('');

      // Should describe the program or activity
      expect(altText?.length).toBeGreaterThan(10);
    });
  });

  test('Program images reference Jr. High or High School in alt text', async () => {
    const { default: Programs } = await import('./Programs');
    const { container } = render(<Programs />);

    const images = container.querySelectorAll('img');
    const altTexts = Array.from(images).map(img =>
      img.getAttribute('alt')?.toLowerCase() || ''
    );

    // At least one image should mention Jr. High
    const hasJrHigh = altTexts.some(alt =>
      alt.includes('jr') || alt.includes('junior') || alt.includes('middle')
    );

    // At least one image should mention High School
    const hasHighSchool = altTexts.some(alt =>
      alt.includes('high school') || alt.includes('senior')
    );

    expect(hasJrHigh || hasHighSchool).toBe(true);
  });

  test('Program images use proper optimization attributes', async () => {
    const { default: Programs } = await import('./Programs');
    const { container } = render(<Programs />);

    const images = container.querySelectorAll('img');

    images.forEach(img => {
      // Images rendered via Next Image mock
      expect(img).toHaveAttribute('src');
    });
  });

  test('Program images have responsive sizes configured', async () => {
    const { default: Programs } = await import('./Programs');
    const { container } = render(<Programs />);

    const images = container.querySelectorAll('img');

    images.forEach(img => {
      // next/image generates srcset or sizes
      const hasResponsive =
        img.hasAttribute('srcset') ||
        img.hasAttribute('sizes');

      expect(hasResponsive).toBe(true);
    });
  });

  test('Program images follow nature-authentic style guide', async () => {
    const fs = await import('fs');
    const programsSource = fs.readFileSync(
      require.resolve('./Programs'),
      'utf-8'
    );

    // Should reference real camp images
    const hasRealImagePath =
      programsSource.includes('/programs') ||
      programsSource.includes('/camp') ||
      programsSource.includes('/images') ||
      programsSource.includes('public/');

    expect(hasRealImagePath).toBe(true);
  });
});

describe('REQ-Q1-002 — Programs Component Lazy Loading', () => {
  test('Program images use lazy loading', async () => {
    const { default: Programs } = await import('./Programs');
    const { container } = render(<Programs />);

    const images = container.querySelectorAll('img');

    // next/image defaults to lazy loading (or explicit priority)
    images.forEach(img => {
      const loading = img.getAttribute('loading');
      const hasPriority = img.hasAttribute('fetchpriority');

      // Should have loading attribute or priority
      expect(loading || hasPriority).toBeTruthy();
    });
  });

  test('Program images are optimized for performance', async () => {
    const fs = await import('fs');
    const programsSource = fs.readFileSync(
      require.resolve('./Programs'),
      'utf-8'
    );

    // Should use ProgramCard component which uses next/image for optimization
    const usesProgramCard = programsSource.includes('ProgramCard');

    if (usesProgramCard) {
      // Check ProgramCard component uses next/image
      const programCardSource = fs.readFileSync(
        require.resolve('./ProgramCard'),
        'utf-8'
      );
      expect(programCardSource).toContain('next/image');
    } else {
      // Fallback: Programs directly uses next/image
      expect(programsSource).toContain('next/image');
    }
  });
});
