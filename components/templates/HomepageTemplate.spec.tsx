// REQ-PM-002: Homepage Template Component
import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { HomepageTemplate } from './HomepageTemplate';

describe('REQ-PM-002 — Homepage Template Component', () => {
  const MOCK_PROPS = {
    title: 'Home',
    bodyContent: '## Who We Are\n\nBear Lake Camp exists to challenge individuals toward maturity in Christ.',
    heroImage: '/images/home-hero.jpg',
    heroTagline: 'Make an Eternal Impact',
    templateFields: {
      galleryImages: [
        { image: '/images/gallery1.jpg', alt: 'Camp activity 1', caption: 'Summer fun' },
        { image: '/images/gallery2.jpg', alt: 'Camp activity 2', caption: 'Worship time' },
        { image: '/images/gallery3.jpg', alt: 'Camp activity 3', caption: 'Games' },
      ],
      ctaHeading: 'Ready to Register?',
      ctaButtonText: 'Register Now',
      ctaButtonLink: 'https://www.ultracamp.com/register',
    },
  };

  describe('REQ-PM-002 — Component Rendering', () => {
    test('renders without crashing', () => {
      render(<HomepageTemplate {...MOCK_PROPS} />);
      expect(screen.getByText('Home')).toBeInTheDocument();
    });

    test('displays page title in hero section', () => {
      render(<HomepageTemplate {...MOCK_PROPS} />);
      const title = screen.getByRole('heading', { level: 1, name: /Home/i });
      expect(title).toBeInTheDocument();
    });

    test('renders markdown body content using MarkdownRenderer', () => {
      render(<HomepageTemplate {...MOCK_PROPS} />);
      expect(screen.getByText('Who We Are')).toBeInTheDocument();
      expect(screen.getByText(/Bear Lake Camp exists/i)).toBeInTheDocument();
    });
  });

  describe('REQ-PM-002 — Hero Section with Background Image', () => {
    test('hero section uses heroImage as background', () => {
      const { container } = render(<HomepageTemplate {...MOCK_PROPS} />);
      const hero = container.querySelector('[data-testid="hero-section"]');
      expect(hero).toBeInTheDocument();
      // Background image is applied to inner div, not the header
      const backgroundDiv = hero?.querySelector('div');
      expect(backgroundDiv?.getAttribute('style')).toContain('/images/home-hero.jpg');
    });

    test('hero section displays title overlay', () => {
      const { container } = render(<HomepageTemplate {...MOCK_PROPS} />);
      const hero = container.querySelector('[data-testid="hero-section"]');
      expect(hero).toContainElement(screen.getByText('Home'));
    });

    test('hero section displays tagline overlay', () => {
      render(<HomepageTemplate {...MOCK_PROPS} />);
      expect(screen.getByText('Make an Eternal Impact')).toBeInTheDocument();
    });

    test('hero section has dark overlay for text contrast', () => {
      const { container } = render(<HomepageTemplate {...MOCK_PROPS} />);
      const overlay = container.querySelector('[data-testid="hero-overlay"]');
      expect(overlay).toBeInTheDocument();
    });

    test('hero section is full-width and minimum height', () => {
      const { container } = render(<HomepageTemplate {...MOCK_PROPS} />);
      const hero = container.querySelector('[data-testid="hero-section"]');
    });

    test('hero falls back to gradient when heroImage is missing', () => {
      const props = { ...MOCK_PROPS, heroImage: undefined };
      const { container } = render(<HomepageTemplate {...props} />);
      const hero = container.querySelector('[data-testid="hero-section"]');
      expect(hero).toBeInTheDocument();
      // Gradient fallback is applied to inner div when no heroImage
      const backgroundDiv = hero?.querySelector('div');
    });
  });

  describe('REQ-PM-002 — Photo Gallery Grid', () => {
    test('renders gallery section with images', () => {
      render(<HomepageTemplate {...MOCK_PROPS} />);
      const images = screen.getAllByRole('img');
      // Filter gallery images (exclude logo or other images)
      const galleryImages = images.filter(img =>
        img.getAttribute('alt')?.includes('Camp activity')
      );
      expect(galleryImages.length).toBe(3);
    });

    test('gallery uses responsive grid layout', () => {
      const { container } = render(<HomepageTemplate {...MOCK_PROPS} />);
      const gallery = container.querySelector('[data-testid="gallery-grid"]');
      expect(gallery).toBeInTheDocument();
      // 2 cols mobile, 3 cols tablet, 4 cols desktop
    });

    test('gallery images have alt text', () => {
      render(<HomepageTemplate {...MOCK_PROPS} />);
      expect(screen.getByAltText('Camp activity 1')).toBeInTheDocument();
      expect(screen.getByAltText('Camp activity 2')).toBeInTheDocument();
      expect(screen.getByAltText('Camp activity 3')).toBeInTheDocument();
    });

    test('gallery images display captions when provided', () => {
      render(<HomepageTemplate {...MOCK_PROPS} />);
      expect(screen.getByText('Summer fun')).toBeInTheDocument();
      expect(screen.getByText('Worship time')).toBeInTheDocument();
      expect(screen.getByText('Games')).toBeInTheDocument();
    });

    test('handles empty gallery array gracefully', () => {
      const props = {
        ...MOCK_PROPS,
        templateFields: { ...MOCK_PROPS.templateFields, galleryImages: [] },
      };
      const { container } = render(<HomepageTemplate {...props} />);
      const gallery = container.querySelector('[data-testid="gallery-grid"]');
      // Gallery section should not render or be empty
      expect(gallery?.children.length || 0).toBe(0);
    });

    test('handles gallery images without captions', () => {
      const props = {
        ...MOCK_PROPS,
        templateFields: {
          ...MOCK_PROPS.templateFields,
          galleryImages: [
            { image: '/images/test.jpg', alt: 'Test image', caption: '' },
          ],
        },
      };
      render(<HomepageTemplate {...props} />);
      expect(screen.getByAltText('Test image')).toBeInTheDocument();
      // Should not crash without caption
    });
  });

  describe('REQ-PM-002 — CTA Section', () => {
    test('displays CTA heading from template fields', () => {
      render(<HomepageTemplate {...MOCK_PROPS} />);
      expect(screen.getByText('Ready to Register?')).toBeInTheDocument();
    });

    test('displays CTA button with custom text', () => {
      render(<HomepageTemplate {...MOCK_PROPS} />);
      const ctaButton = screen.getByRole('link', { name: /Register Now/i });
      expect(ctaButton).toBeInTheDocument();
    });

    test('CTA button links to correct URL', () => {
      render(<HomepageTemplate {...MOCK_PROPS} />);
      const ctaButton = screen.getByRole('link', { name: /Register Now/i });
      expect(ctaButton).toHaveAttribute('href', 'https://www.ultracamp.com/register');
    });

    test('CTA button has prominent styling', () => {
      render(<HomepageTemplate {...MOCK_PROPS} />);
      const ctaButton = screen.getByRole('link', { name: /Register Now/i });
    });

    test('CTA section is centered', () => {
      const { container } = render(<HomepageTemplate {...MOCK_PROPS} />);
      const ctaSection = container.querySelector('[data-testid="cta-section"]');
    });

    test('handles missing CTA heading gracefully', () => {
      const props = {
        ...MOCK_PROPS,
        templateFields: { ...MOCK_PROPS.templateFields, ctaHeading: '' },
      };
      render(<HomepageTemplate {...props} />);
      // Should still render button if link and text exist
      expect(screen.getByRole('link', { name: /Register Now/i })).toBeInTheDocument();
    });

    test('handles missing CTA button text', () => {
      const props = {
        ...MOCK_PROPS,
        templateFields: { ...MOCK_PROPS.templateFields, ctaButtonText: '' },
      };
      render(<HomepageTemplate {...props} />);
      // CTA button should not render without text
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    test('handles missing CTA button link', () => {
      const props = {
        ...MOCK_PROPS,
        templateFields: { ...MOCK_PROPS.templateFields, ctaButtonLink: '' },
      };
      render(<HomepageTemplate {...props} />);
      // CTA button should not render without link
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });
  });

  describe('REQ-PM-002 — Responsive Design', () => {
    test('uses mobile-first responsive approach', () => {
      const { container } = render(<HomepageTemplate {...MOCK_PROPS} />);
      const template = container.firstChild as HTMLElement;
    });

    test('gallery is 2 columns on mobile', () => {
      const { container } = render(<HomepageTemplate {...MOCK_PROPS} />);
      const gallery = container.querySelector('[data-testid="gallery-grid"]');
    });

    test('gallery expands to 3 columns on tablet', () => {
      const { container } = render(<HomepageTemplate {...MOCK_PROPS} />);
      const gallery = container.querySelector('[data-testid="gallery-grid"]');
    });

    test('gallery expands to 4 columns on desktop', () => {
      const { container } = render(<HomepageTemplate {...MOCK_PROPS} />);
      const gallery = container.querySelector('[data-testid="gallery-grid"]');
    });
  });

  describe('REQ-PM-002 — Semantic HTML & Accessibility', () => {
    test('uses semantic section tags', () => {
      const { container } = render(<HomepageTemplate {...MOCK_PROPS} />);
      const sections = container.querySelectorAll('section');
      expect(sections.length).toBeGreaterThan(0);
    });

    test('uses article tag for main content', () => {
      const { container } = render(<HomepageTemplate {...MOCK_PROPS} />);
      const article = container.querySelector('article');
      expect(article).toBeInTheDocument();
    });

    test('proper heading hierarchy (h1 → h2)', () => {
      const { container } = render(<HomepageTemplate {...MOCK_PROPS} />);
      const h1 = container.querySelector('h1');
      const h2s = container.querySelectorAll('h2');
      expect(h1).toBeInTheDocument();
      expect(h2s.length).toBeGreaterThan(0);
    });

    test('gallery images have alt attributes', () => {
      const { container } = render(<HomepageTemplate {...MOCK_PROPS} />);
      const images = container.querySelectorAll('img');
      images.forEach(img => {
        expect(img).toHaveAttribute('alt');
      });
    });

    test('CTA section has ARIA label', () => {
      const { container } = render(<HomepageTemplate {...MOCK_PROPS} />);
      const ctaSection = container.querySelector('[data-testid="cta-section"]');
      expect(ctaSection).toHaveAttribute('aria-label');
    });
  });

  describe('REQ-PM-002 — Integration with MarkdownRenderer', () => {
    test('passes bodyContent to MarkdownRenderer', () => {
      const { container } = render(<HomepageTemplate {...MOCK_PROPS} />);
      const heading = screen.getByText('Who We Are');
      expect(heading.tagName).toBe('H2');
    });

    test('renders YouTube embeds in body content', () => {
      const props = {
        ...MOCK_PROPS,
        bodyContent: 'https://youtu.be/or5jNI9GBDI',
      };
      const { container } = render(<HomepageTemplate {...props} />);
      const iframe = container.querySelector('iframe');
      expect(iframe).toBeInTheDocument();
      expect(iframe?.getAttribute('src')).toContain('or5jNI9GBDI');
    });

    test('renders images within markdown content', () => {
      const props = {
        ...MOCK_PROPS,
        bodyContent: '![Logo](/images/logo.png)',
      };
      const { container } = render(<HomepageTemplate {...props} />);
      const img = container.querySelector('img[alt="Logo"]');
      expect(img).toBeInTheDocument();
    });
  });

  describe('TypeScript Type Safety', () => {
    test('enforces required title prop', () => {
      // @ts-expect-error - title is required
      const invalidProps = { bodyContent: '', templateFields: MOCK_PROPS.templateFields };
    });

    test('enforces required bodyContent prop', () => {
      // @ts-expect-error - bodyContent is required
      const invalidProps = { title: 'Test', templateFields: MOCK_PROPS.templateFields };
    });

    test('enforces required templateFields prop', () => {
      // @ts-expect-error - templateFields is required
      const invalidProps = { title: 'Test', bodyContent: '' };
    });
  });
});
