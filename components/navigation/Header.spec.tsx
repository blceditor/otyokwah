/**
 * Header Component Tests
 * REQ-301: Header Layout Structure
 * REQ-302: Hanging Logo Design
 * REQ-303: Navigation Menu Items
 * REQ-305: Scroll Behavior
 * REQ-306: Mobile Hamburger Menu
 * REQ-308: Accessibility
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import Header from './Header';
import { defaultNavigation } from './config';

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, width, height, ...props }: { src: string; alt: string; width: number; height: number }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} width={width} height={height} {...props} />
  ),
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

// Mock feature flags
vi.mock('@/lib/config/feature-flags', () => ({
  isNavHidden: () => false,
}));

// Mock SearchModal
vi.mock('../SearchModal', () => ({
  SearchModal: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? (
      <div role="dialog" data-testid="search-modal">
        <button onClick={onClose}>Close search</button>
      </div>
    ) : null,
}));

describe('Header Component', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
    // Mock fetch for /api/auth/check
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ isAdmin: false }),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // REQ-301: Header Layout Structure
  describe('REQ-301: Header Layout Structure', () => {
    it('renders the header with banner role', () => {
      render(<Header />);
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('renders fixed at top of page', () => {
      render(<Header />);
      const header = screen.getByRole('banner');
      expect(header.className).toContain('fixed');
    });
  });

  // REQ-302: Hanging Logo Design
  describe('REQ-302: Hanging Logo Design', () => {
    it('renders the logo with correct src', () => {
      render(<Header />);
      const logo = screen.getByAltText('Camp Otyokwah');
      expect(logo).toBeInTheDocument();
      expect(logo).toHaveAttribute('src', defaultNavigation.logo.src);
    });

    it('logo links to homepage', () => {
      render(<Header />);
      const logoLink = screen.getByLabelText('Go to homepage');
      expect(logoLink).toHaveAttribute('href', '/');
    });
  });

  // REQ-303: Navigation Menu Items
  describe('REQ-303: Navigation Menu Items', () => {
    it('renders all 6 main menu items', () => {
      render(<Header />);
      expect(screen.getByText('About')).toBeInTheDocument();
      expect(screen.getByText('Summer Camp')).toBeInTheDocument();
      expect(screen.getByText('Work at Camp')).toBeInTheDocument();
      expect(screen.getByText('Retreats')).toBeInTheDocument();
      expect(screen.getByText('Rentals')).toBeInTheDocument();
      expect(screen.getByText('Give')).toBeInTheDocument();
    });

    it('renders the primary CTA button', () => {
      render(<Header />);
      expect(screen.getByText('Register Now')).toBeInTheDocument();
    });

    it('CTA button links to UltraCamp', () => {
      render(<Header />);
      const ctaLinks = screen.getAllByRole('link', { name: 'Register Now' });
      // Desktop nav has the CTA link
      const ctaButton = ctaLinks[0];
      expect(ctaButton).toHaveAttribute('href', defaultNavigation.primaryCTA.href);
      expect(ctaButton).toHaveAttribute('target', '_blank');
    });
  });

  // REQ-305: Scroll Behavior
  describe('REQ-305: Scroll Behavior', () => {
    it('has solid green background', () => {
      render(<Header />);
      const header = screen.getByRole('banner');
      expect(header.className).toContain('bg-secondary-light');
    });

    it('header responds to scroll events', async () => {
      render(<Header />);

      Object.defineProperty(window, 'scrollY', { value: 150, writable: true });
      fireEvent.scroll(window);

      // Header still renders after scroll
      await waitFor(() => {
        expect(screen.getByRole('banner')).toBeInTheDocument();
      });
    });
  });

  // REQ-306: Mobile Hamburger Menu
  describe('REQ-306: Mobile Hamburger Menu', () => {
    it('renders hamburger button', () => {
      render(<Header />);
      expect(screen.getByLabelText('Open menu')).toBeInTheDocument();
    });

    it('opens mobile menu when hamburger is clicked', async () => {
      render(<Header />);

      const hamburger = screen.getByLabelText('Open menu');
      fireEvent.click(hamburger);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('closes mobile menu when close button is clicked', async () => {
      render(<Header />);

      const hamburger = screen.getByLabelText('Open menu');
      fireEvent.click(hamburger);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const closeButton = screen.getByLabelText('Close menu');
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('closes mobile menu on Escape key', async () => {
      render(<Header />);

      const hamburger = screen.getByLabelText('Open menu');
      fireEvent.click(hamburger);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      fireEvent.keyDown(document, { key: 'Escape' });

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  // REQ-308: Accessibility
  describe('REQ-308: Accessibility', () => {
    it('has proper aria-labels on interactive elements', () => {
      render(<Header />);
      expect(screen.getByLabelText('Open menu')).toBeInTheDocument();
      expect(screen.getByLabelText('Go to homepage')).toBeInTheDocument();
    });

    it('hamburger button has aria-expanded attribute', () => {
      render(<Header />);
      const hamburger = screen.getByLabelText('Open menu');
      expect(hamburger).toHaveAttribute('aria-expanded', 'false');
    });

    it('mobile menu has proper dialog role and aria-modal', async () => {
      render(<Header />);

      const hamburger = screen.getByLabelText('Open menu');
      fireEvent.click(hamburger);

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog).toHaveAttribute('aria-modal', 'true');
      });
    });

    it('main navigation has proper aria-label', () => {
      render(<Header />);
      expect(screen.getByLabelText('Main navigation')).toBeInTheDocument();
    });
  });
});

describe('Navigation Config', () => {
  it('has correct menu structure with 6 items', () => {
    expect(defaultNavigation.menuItems).toHaveLength(6);
    expect(defaultNavigation.menuItems[0].label).toBe('About');
    expect(defaultNavigation.menuItems[1].label).toBe('Summer Camp');
    expect(defaultNavigation.menuItems[2].label).toBe('Work at Camp');
    expect(defaultNavigation.menuItems[3].label).toBe('Retreats');
    expect(defaultNavigation.menuItems[4].label).toBe('Rentals');
    expect(defaultNavigation.menuItems[5].label).toBe('Give');
  });

  it('About has correct children', () => {
    const about = defaultNavigation.menuItems[0];
    expect(about.children).toBeDefined();
    expect(about.children?.length).toBe(4);
    expect(about.children?.[0].label).toBe('Core Values');
    expect(about.children?.[1].label).toBe('Doctrinal Statement');
  });

  it('Summer Camp has correct children', () => {
    const summerCamp = defaultNavigation.menuItems[1];
    expect(summerCamp.children).toBeDefined();
    expect(summerCamp.children?.length).toBe(4);
    expect(summerCamp.children?.[0].label).toBe('Camp Sessions');
    expect(summerCamp.children?.[1].label).toBe('What to Bring');
  });

  it('Rentals has 6 children', () => {
    const rentals = defaultNavigation.menuItems[4];
    expect(rentals.children).toBeDefined();
    expect(rentals.children?.length).toBe(6);
    expect(rentals.children?.[0].label).toBe('Cabins');
  });

  it('Give has no children (direct link)', () => {
    const give = defaultNavigation.menuItems[5];
    expect(give.children).toBeUndefined();
    expect(give.href).toBe('/give');
  });

  it('primaryCTA is configured correctly', () => {
    expect(defaultNavigation.primaryCTA.label).toBe('Register Now');
    expect(defaultNavigation.primaryCTA.external).toBe(true);
  });
});
