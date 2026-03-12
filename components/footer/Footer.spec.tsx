/**
 * REQ-UI-003: Site-Wide Footer Component
 *
 * Acceptance Criteria:
 * - Footer includes Social Media Links and Contact Information
 * - Social media: Facebook, Instagram, YouTube, Spotify, Donate
 * - Contact: Address with MapPin icon, Email with Mail icon, Phone with Phone icon
 * - All external links open in new tab with rel="noopener noreferrer"
 * - Icons styled to match camp theme
 * - Responsive layout: stack vertically on mobile, side-by-side on desktop
 * - Screen reader accessible with ARIA labels
 * - All URLs sourced from SiteConfig (no hardcoded site-specific values)
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { Footer } from './Footer';
import type { SiteConfig } from '@/lib/config/site-config';

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

const TEST_CONFIG: SiteConfig = {
  siteName: 'Test Camp',
  logoPath: '/images/logo/test.png',
  logoAlt: 'Test Camp',
  contactEmail: 'test@testcamp.org',
  contactPhone: '(555) 123-4567',
  contactPhoneHref: 'tel:+15551234567',
  contactAddress: '123 Test St, Testville, TS 12345',
  registrationUrl: 'https://register.test.com',
  donationUrl: 'https://donate.test.com',
  facebookUrl: 'https://facebook.com/testcamp',
  instagramUrl: 'https://instagram.com/testcamp',
  youtubeUrl: 'https://youtube.com/testcamp',
  spotifyUrl: 'https://spotify.com/testcamp',
  mapsUrl: 'https://maps.google.com/testcamp',
};

describe('REQ-UI-003: Footer Component', () => {
  it('should render footer element with config values', () => {
    render(<Footer config={TEST_CONFIG} />);
    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
  });

  describe('Social Media Links from SiteConfig', () => {
    it('should render Facebook link from config', () => {
      render(<Footer config={TEST_CONFIG} />);
      const link = screen.getByRole('link', { name: /facebook/i });
      expect(link).toHaveAttribute('href', TEST_CONFIG.facebookUrl);
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should render Instagram link from config', () => {
      render(<Footer config={TEST_CONFIG} />);
      const link = screen.getByRole('link', { name: /instagram/i });
      expect(link).toHaveAttribute('href', TEST_CONFIG.instagramUrl);
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should render YouTube link from config', () => {
      render(<Footer config={TEST_CONFIG} />);
      const link = screen.getByRole('link', { name: /youtube/i });
      expect(link).toHaveAttribute('href', TEST_CONFIG.youtubeUrl);
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should render Spotify link from config', () => {
      render(<Footer config={TEST_CONFIG} />);
      const link = screen.getByRole('link', { name: /spotify/i });
      expect(link).toHaveAttribute('href', TEST_CONFIG.spotifyUrl);
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should render Donate link from config', () => {
      render(<Footer config={TEST_CONFIG} />);
      const link = screen.getByRole('link', { name: /donate/i });
      expect(link).toHaveAttribute('href', TEST_CONFIG.donationUrl);
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should hide social links when URLs are empty', () => {
      const emptyConfig = { ...TEST_CONFIG, facebookUrl: '', instagramUrl: '' };
      render(<Footer config={emptyConfig} />);
      expect(screen.queryByRole('link', { name: /facebook/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /instagram/i })).not.toBeInTheDocument();
    });
  });

  describe('Contact Information from SiteConfig', () => {
    it('should render address with maps link from config', () => {
      render(<Footer config={TEST_CONFIG} />);
      const link = screen.getByRole('link', {
        name: new RegExp(escapeRegex(TEST_CONFIG.contactAddress), 'i'),
      });
      expect(link).toHaveAttribute('href', TEST_CONFIG.mapsUrl);
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should render email with mailto link from config', () => {
      render(<Footer config={TEST_CONFIG} />);
      const link = screen.getByRole('link', {
        name: new RegExp(escapeRegex(TEST_CONFIG.contactEmail), 'i'),
      });
      expect(link).toHaveAttribute('href', `mailto:${TEST_CONFIG.contactEmail}`);
    });

    it('should render phone with tel link from config', () => {
      render(<Footer config={TEST_CONFIG} />);
      const link = screen.getByRole('link', {
        name: new RegExp(escapeRegex(TEST_CONFIG.contactPhone), 'i'),
      });
      expect(link).toHaveAttribute('href', TEST_CONFIG.contactPhoneHref);
    });

    it('should display siteName in copyright', () => {
      render(<Footer config={TEST_CONFIG} />);
      expect(screen.getByText(new RegExp(TEST_CONFIG.siteName))).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have descriptive aria-labels for icon-only links', () => {
      render(<Footer config={TEST_CONFIG} />);
      const socialLinks = screen.getAllByRole('link', {
        name: /facebook|instagram|youtube|spotify|donate/i,
      });
      expect(socialLinks.length).toBeGreaterThan(0);
      socialLinks.forEach((link) => {
        expect(link).toHaveAttribute('aria-label');
      });
    });
  });
});
