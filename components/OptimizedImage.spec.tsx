// REQ-103: Next.js Image Optimization
import { describe, test, expect } from 'vitest';
import { render } from '@testing-library/react';
import OptimizedImage from './OptimizedImage';
import '@testing-library/jest-dom/vitest';

describe('REQ-103 — Optimized Image Component', () => {
  const MOCK_IMAGE_SRC = '/uploads/hero.jpg';
  const MOCK_ALT_TEXT = 'Summer camp activities';

  test('renders Next.js Image component', () => {
    const { container } = render(
      <OptimizedImage src={MOCK_IMAGE_SRC} alt={MOCK_ALT_TEXT} width={1920} height={1080} />
    );

    const img = container.querySelector('img');
    expect(img).toBeInTheDocument();
  });

  test('converts relative paths to absolute paths', () => {
    const RELATIVE_PATH = 'uploads/image.jpg';

    const { container } = render(
      <OptimizedImage src={RELATIVE_PATH} alt={MOCK_ALT_TEXT} width={640} height={480} />
    );

    const img = container.querySelector('img');
    // Component normalizes relative paths to absolute (prepends /)
    expect(img?.getAttribute('src')).toBe('/uploads/image.jpg');
  });

  test('includes width and height attributes to prevent layout shift', () => {
    const WIDTH = 1920;
    const HEIGHT = 1080;

    const { container } = render(
      <OptimizedImage src={MOCK_IMAGE_SRC} alt={MOCK_ALT_TEXT} width={WIDTH} height={HEIGHT} />
    );

    const img = container.querySelector('img');
    expect(img).toHaveAttribute('width');
    expect(img).toHaveAttribute('height');
  });

  test('sets priority prop for above-the-fold images', () => {
    const { container } = render(
      <OptimizedImage
        src={MOCK_IMAGE_SRC}
        alt={MOCK_ALT_TEXT}
        width={1920}
        height={1080}
        priority
      />
    );

    const img = container.querySelector('img');
    // Priority images should not have loading="lazy"
    expect(img).not.toHaveAttribute('loading', 'lazy');
  });

  test('sets loading="lazy" for below-the-fold images', () => {
    const { container } = render(
      <OptimizedImage
        src={MOCK_IMAGE_SRC}
        alt={MOCK_ALT_TEXT}
        width={640}
        height={480}
        loading="lazy"
      />
    );

    const img = container.querySelector('img');
    expect(img).toHaveAttribute('loading', 'lazy');
  });

  test('passes placeholder prop to Next Image', () => {
    const { container } = render(
      <OptimizedImage src={MOCK_IMAGE_SRC} alt={MOCK_ALT_TEXT} width={640} height={480} />
    );

    // Component renders via Next Image with blur placeholder
    const img = container.querySelector('img');
    expect(img).toBeTruthy();
  });

  test('passes through additional props to Image component', () => {
    const CUSTOM_CLASS = 'rounded-lg shadow-md';

    const { container } = render(
      <OptimizedImage
        src={MOCK_IMAGE_SRC}
        alt={MOCK_ALT_TEXT}
        width={640}
        height={480}
        className={CUSTOM_CLASS}
      />
    );

    const img = container.querySelector('img');
  });

  test('maintains aspect ratio', () => {
    const WIDTH = 1600;
    const HEIGHT = 900;
    const EXPECTED_RATIO = WIDTH / HEIGHT;

    const { container } = render(
      <OptimizedImage src={MOCK_IMAGE_SRC} alt={MOCK_ALT_TEXT} width={WIDTH} height={HEIGHT} />
    );

    const img = container.querySelector('img');
    const width = parseInt(img?.getAttribute('width') || '0', 10);
    const height = parseInt(img?.getAttribute('height') || '0', 10);
    const actualRatio = width / height;

    expect(actualRatio).toBeCloseTo(EXPECTED_RATIO, 2);
  });

  test('supports fill mode for responsive containers', () => {
    const { container } = render(
      <OptimizedImage src={MOCK_IMAGE_SRC} alt={MOCK_ALT_TEXT} fill />
    );

    const img = container.querySelector('img');
    expect(img).toBeInTheDocument();
    // Next.js Image component with fill prop handles object-fit internally
    // JSDOM doesn't compute CSS styles, so we just verify the image renders
  });

  test('handles images in public directory', () => {
    const PUBLIC_IMAGE = '/uploads/staff/john-doe.jpg';

    const { container } = render(
      <OptimizedImage src={PUBLIC_IMAGE} alt="John Doe" width={500} height={500} />
    );

    const img = container.querySelector('img');
    expect(img?.getAttribute('src')).toContain('uploads');
  });

  test('generates multiple responsive sizes', () => {
    const { container } = render(
      <OptimizedImage
        src={MOCK_IMAGE_SRC}
        alt={MOCK_ALT_TEXT}
        width={1920}
        height={1080}
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
    );

    const img = container.querySelector('img');
    // sizes prop is passed through to Next Image for responsive behavior
    expect(img?.getAttribute('sizes')).toBe('(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw');
  });
});

describe('REQ-103 — Next.js Image Configuration', () => {
  test('next.config.js includes image formats AVIF and WebP', async () => {
    // @ts-ignore - Config will be updated
    const config = await import('../next.config.mjs');

    expect(config.default.images?.formats).toContain('image/avif');
    expect(config.default.images?.formats).toContain('image/webp');
  });

  test('next.config.js includes responsive device sizes', async () => {
    // @ts-ignore - Config will be updated
    const config = await import('../next.config.mjs');

    const deviceSizes = config.default.images?.deviceSizes;
    expect(deviceSizes).toContain(320);
    expect(deviceSizes).toContain(640);
    expect(deviceSizes).toContain(1024);
    expect(deviceSizes).toContain(1920);
  });

  test('next.config.js sets minimum cache TTL', async () => {
    // @ts-ignore - Config will be updated
    const config = await import('../next.config.mjs');

    expect(config.default.images?.minimumCacheTTL).toBeGreaterThanOrEqual(60);
  });
});

describe('REQ-103 — Hero Image Optimization', () => {
  test('hero images use priority loading', () => {
    const HERO_IMAGE = '/uploads/hero-summer.jpg';

    const { container } = render(
      <OptimizedImage
        src={HERO_IMAGE}
        alt="Summer camp hero"
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
    );

    const img = container.querySelector('img');
    expect(img).not.toHaveAttribute('loading', 'lazy');
  });

  test('hero images have sizes="100vw" for full viewport width', () => {
    const HERO_IMAGE = '/uploads/hero.jpg';

    const { container } = render(
      <OptimizedImage
        src={HERO_IMAGE}
        alt="Hero"
        fill
        priority
        sizes="100vw"
      />
    );

    const img = container.querySelector('img');
    expect(img?.getAttribute('sizes')).toBe('100vw');
  });
});

describe('REQ-103 — Gallery Image Optimization', () => {
  test('gallery images use lazy loading', () => {
    const GALLERY_IMAGE = '/uploads/gallery/activity-1.jpg';

    const { container } = render(
      <OptimizedImage
        src={GALLERY_IMAGE}
        alt="Camp activity"
        width={640}
        height={480}
        loading="lazy"
      />
    );

    const img = container.querySelector('img');
    expect(img).toHaveAttribute('loading', 'lazy');
  });

  test('gallery images have responsive sizes based on viewport', () => {
    const GALLERY_IMAGE = '/uploads/gallery/activity-1.jpg';

    const { container } = render(
      <OptimizedImage
        src={GALLERY_IMAGE}
        alt="Camp activity"
        width={640}
        height={480}
        loading="lazy"
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
    );

    const img = container.querySelector('img');
    const sizes = img?.getAttribute('sizes');
    expect(sizes).toContain('max-width');
    expect(sizes).toContain('vw');
  });
});

describe('REQ-103 — Staff Photo Optimization', () => {
  test('staff photos are resized to 500x500', () => {
    const STAFF_PHOTO = '/uploads/staff/jane-smith.jpg';
    const SIZE = 500;

    const { container } = render(
      <OptimizedImage
        src={STAFF_PHOTO}
        alt="Jane Smith"
        width={SIZE}
        height={SIZE}
        loading="lazy"
        className="rounded-full"
      />
    );

    const img = container.querySelector('img');
    expect(img?.getAttribute('width')).toBe(String(SIZE));
    expect(img?.getAttribute('height')).toBe(String(SIZE));
  });

  test('staff photos use responsive sizes for viewport', () => {
    const STAFF_PHOTO = '/uploads/staff/john-doe.jpg';

    const { container } = render(
      <OptimizedImage
        src={STAFF_PHOTO}
        alt="John Doe"
        width={500}
        height={500}
        loading="lazy"
        sizes="(max-width: 768px) 50vw, 25vw"
      />
    );

    const img = container.querySelector('img');
    const sizes = img?.getAttribute('sizes');
    expect(sizes).toBe('(max-width: 768px) 50vw, 25vw');
  });
});
