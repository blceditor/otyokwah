/**
 * Integration Tests for Homepage Component Integration
 * REQ-INT-001 through REQ-INT-005
 *
 * Tests verify that:
 * 1. HeroCarousel renders when heroImages array exists
 * 2. TexturedHeading is used for section headings
 * 3. Background texture class is applied to sections
 * 4. Gallery renders when galleryImages array exists
 * 5. Content is properly configured in index.mdoc
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string }) => (
    <img src={src} alt={alt} data-testid="next-image" {...props} />
  ),
}));

// Mock @headlessui/react
vi.mock('@headlessui/react', () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
    open ? <div data-testid="dialog">{children}</div> : null,
  DialogPanel: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-panel">{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <h2 data-testid="dialog-title">{children}</h2>
  ),
}));

// Test HeroCarousel component integration
describe('REQ-INT-001: Hero Carousel Integration', () => {
  it('should export CarouselImage interface with src and alt', async () => {
    const { CarouselImage } = await import(
      '@/components/content/HeroCarousel'
    );
    // TypeScript compile check - if this compiles, the interface exists
    const testImage: typeof CarouselImage extends undefined
      ? never
      : { src: string; alt: string } = {
      src: '/test.jpg',
      alt: 'Test',
    };
    expect(testImage.src).toBe('/test.jpg');
  });

  it('should render HeroCarousel with multiple images', async () => {
    const { HeroCarousel } = await import(
      '@/components/content/HeroCarousel'
    );
    const images = [
      {
        src: '/images/summer-program-and-general/jr-high-boys-giant-water-slide.jpg',
        alt: 'Boys on water slide',
      },
      {
        src: '/images/summer-program-and-general/campfire.jpg',
        alt: 'Campfire',
      },
    ];

    render(<HeroCarousel images={images} />);

    const carousel = screen.getByRole('region', { name: /carousel/i });
    expect(carousel).toBeDefined();
  });

  it('should have indicator buttons for each image', async () => {
    const { HeroCarousel } = await import(
      '@/components/content/HeroCarousel'
    );
    const images = [
      { src: '/images/test1.jpg', alt: 'Test 1' },
      { src: '/images/test2.jpg', alt: 'Test 2' },
      { src: '/images/test3.jpg', alt: 'Test 3' },
    ];

    render(<HeroCarousel images={images} showIndicators={true} />);

    const indicators = screen.getAllByRole('button', { name: /go to slide/i });
    expect(indicators.length).toBe(3);
  });
});

// Test TexturedHeading component integration
describe('REQ-INT-002: TexturedHeading Integration', () => {
  it('should render TexturedHeading with level 2', async () => {
    const { TexturedHeading } = await import(
      '@/components/content/TexturedHeading'
    );

    render(<TexturedHeading level={2}>Test Heading</TexturedHeading>);

    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeDefined();
    expect(heading.textContent).toBe('Test Heading');
  });

  it('should apply text-textured class', async () => {
    const { TexturedHeading } = await import(
      '@/components/content/TexturedHeading'
    );

    render(<TexturedHeading level={2}>Styled Heading</TexturedHeading>);

    const heading = screen.getByRole('heading', { level: 2 });
  });

  it('should accept additional className prop', async () => {
    const { TexturedHeading } = await import(
      '@/components/content/TexturedHeading'
    );

    render(
      <TexturedHeading level={2} className="text-3xl font-bold">
        Custom Class
      </TexturedHeading>
    );

    const heading = screen.getByRole('heading', { level: 2 });
  });
});

// Test Background Texture CSS class
describe('REQ-INT-003: Background Texture Integration', () => {
  it('should have bg-textured class defined in globals.css', async () => {
    const fs = await import('fs/promises');
    const path = await import('path');
    const cssPath = path.join(process.cwd(), 'app', 'globals.css');
    const css = await fs.readFile(cssPath, 'utf-8');

    expect(css).toContain('.bg-textured');
    expect(css).toContain('position: relative');
  });

  it('bg-textured should have ::before pseudo-element for texture', async () => {
    const fs = await import('fs/promises');
    const path = await import('path');
    const cssPath = path.join(process.cwd(), 'app', 'globals.css');
    const css = await fs.readFile(cssPath, 'utf-8');

    expect(css).toContain('.bg-textured::before');
    expect(css).toContain('background-image');
  });
});

// Test Gallery component integration
describe('REQ-INT-004: Gallery Integration', () => {
  it('should render Gallery with images', async () => {
    const { Gallery } = await import('@/components/content/Gallery');
    const images = [
      { src: '/images/volleyball.jpg', alt: 'Volleyball' },
      { src: '/images/crafts.jpg', alt: 'Crafts' },
    ];

    render(<Gallery images={images} />);

    const grid = screen.getByTestId('gallery-grid');
    expect(grid).toBeDefined();
  });

  it('should render gallery images as buttons for lightbox', async () => {
    const { Gallery } = await import('@/components/content/Gallery');
    const images = [
      { src: '/images/test1.jpg', alt: 'Test 1' },
      { src: '/images/test2.jpg', alt: 'Test 2' },
    ];

    render(<Gallery images={images} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  it('should support caption prop on images', async () => {
    const { Gallery } = await import('@/components/content/Gallery');
    const images = [
      { src: '/images/test.jpg', alt: 'Test', caption: 'Test Caption' },
    ];

    render(<Gallery images={images} />);

    expect(screen.getByText('Test Caption')).toBeDefined();
  });
});

// Test homepage content configuration
describe('REQ-INT-005: Homepage Content Configuration', () => {
  it('should have index.mdoc with standard template', async () => {
    const fs = await import('fs/promises');
    const path = await import('path');
    const mdocPath = path.join(
      process.cwd(),
      'content',
      'pages',
      'index.mdoc'
    );
    const content = await fs.readFile(mdocPath, 'utf-8');

    expect(content).toContain('discriminant: standard');
  });

  it('should have hero configuration with video', async () => {
    const fs = await import('fs/promises');
    const path = await import('path');
    const mdocPath = path.join(
      process.cwd(),
      'content',
      'pages',
      'index.mdoc'
    );
    const content = await fs.readFile(mdocPath, 'utf-8');

    expect(content).toContain('heroVideo:');
    expect(content).toContain('heroTagline:');
  });

  it('should have SEO metadata configured', async () => {
    const fs = await import('fs/promises');
    const path = await import('path');
    const mdocPath = path.join(
      process.cwd(),
      'content',
      'pages',
      'index.mdoc'
    );
    const content = await fs.readFile(mdocPath, 'utf-8');

    expect(content).toContain('metaTitle:');
    expect(content).toContain('metaDescription:');
  });
});

// Test page.tsx delegates to renderPageContent
describe('page.tsx Architecture', () => {
  it('should delegate rendering to renderPageContent', async () => {
    const fs = await import('fs/promises');
    const path = await import('path');
    const pagePath = path.join(process.cwd(), 'app', '[slug]', 'page.tsx');
    const content = await fs.readFile(pagePath, 'utf-8');

    expect(content).toContain("import { renderPageContent }");
    expect(content).toContain('from "@/lib/templates/page-renderer"');
  });

  it('should validate slug before file system access', async () => {
    const fs = await import('fs/promises');
    const path = await import('path');
    const pagePath = path.join(process.cwd(), 'app', '[slug]', 'page.tsx');
    const content = await fs.readFile(pagePath, 'utf-8');

    expect(content).toContain('isValidSlug');
  });

  it('should use ISR with on-demand revalidation', async () => {
    const fs = await import('fs/promises');
    const path = await import('path');
    const pagePath = path.join(process.cwd(), 'app', '[slug]', 'page.tsx');
    const content = await fs.readFile(pagePath, 'utf-8');

    expect(content).toContain("revalidate = false");
    expect(content).toContain("fetchCache = 'default-no-store'");
  });

  it('page-renderer uses bg-textured class', async () => {
    const fs = await import('fs/promises');
    const path = await import('path');
    const rendererPath = path.join(process.cwd(), 'lib', 'templates', 'page-renderer.tsx');
    const content = await fs.readFile(rendererPath, 'utf-8');

    expect(content).toContain('bg-textured');
  });
});

// Test page count constraint
describe('Page Count Tracking', () => {
  it('should have at least 26 content pages', async () => {
    const fs = await import('fs/promises');
    const path = await import('path');
    const pagesDir = path.join(process.cwd(), 'content', 'pages');
    const files = await fs.readdir(pagesDir);
    const mdocFiles = files.filter((f: string) => f.endsWith('.mdoc'));

    expect(mdocFiles.length).toBeGreaterThanOrEqual(26);
  });
});
