'use client';

import { usePathname } from 'next/navigation';
import {
  Facebook,
  Instagram,
  Youtube,
  Music,
  Heart,
  MapPin,
  Mail,
  Phone,
} from 'lucide-react';
import type { SiteConfig } from '@/lib/config/site-config';

interface FooterProps {
  config: SiteConfig;
}

export function Footer({ config }: FooterProps) {
  const pathname = usePathname();

  if (pathname?.startsWith('/keystatic') || pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer
      className="bg-secondary text-cream py-12 px-4 mt-16"
      role="contentinfo"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Social Media Links */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-4">Connect With Us</h3>
            <div className="flex flex-wrap gap-4">
              {config.facebookUrl && (
                <a
                  href={config.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Visit us on Facebook"
                  className="flex items-center gap-2 hover:text-accent transition-colors"
                >
                  <Facebook size={24} />
                  <span className="sr-only sm:not-sr-only">Facebook</span>
                </a>
              )}
              {config.instagramUrl && (
                <a
                  href={config.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow us on Instagram"
                  className="flex items-center gap-2 hover:text-accent transition-colors"
                >
                  <Instagram size={24} />
                  <span className="sr-only sm:not-sr-only">Instagram</span>
                </a>
              )}
              {config.youtubeUrl && (
                <a
                  href={config.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Subscribe to our YouTube channel"
                  className="flex items-center gap-2 hover:text-accent transition-colors"
                >
                  <Youtube size={24} />
                  <span className="sr-only sm:not-sr-only">YouTube</span>
                </a>
              )}
              {config.spotifyUrl && (
                <a
                  href={config.spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Listen to our Spotify playlist"
                  className="flex items-center gap-2 hover:text-accent transition-colors"
                >
                  <Music size={24} />
                  <span className="sr-only sm:not-sr-only">Spotify</span>
                </a>
              )}
              {config.donationUrl && (
                <a
                  href={config.donationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Donate to ${config.siteName}`}
                  className="flex items-center gap-2 hover:text-accent transition-colors"
                >
                  <Heart size={24} />
                  <span className="sr-only sm:not-sr-only">Donate</span>
                </a>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3">
              {config.mapsUrl && config.contactAddress && (
                <a
                  href={config.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`View our location: ${config.contactAddress}`}
                  className="flex items-start gap-2 hover:text-accent transition-colors"
                >
                  <MapPin size={20} className="mt-1 flex-shrink-0" />
                  <span>{config.contactAddress}</span>
                </a>
              )}
              {config.contactEmail && (
                <a
                  href={`mailto:${config.contactEmail}`}
                  aria-label={`Email us at ${config.contactEmail}`}
                  className="flex items-center gap-2 hover:text-accent transition-colors"
                >
                  <Mail size={20} className="flex-shrink-0" />
                  <span>{config.contactEmail}</span>
                </a>
              )}
              {config.contactPhone && (
                <a
                  href={config.contactPhoneHref}
                  aria-label={`Call us at ${config.contactPhone}`}
                  className="flex items-center gap-2 hover:text-accent transition-colors"
                >
                  <Phone size={20} className="flex-shrink-0" />
                  <span>{config.contactPhone}</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-cream/20 text-center text-sm space-y-2">
          <p>&copy; {new Date().getFullYear()} {config.siteName}. All rights reserved.</p>
          <p className="text-cream/50">
            Built &amp; Powered by{' '}
            <a
              href="https://sparkry.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cream/80 transition-colors underline underline-offset-2"
            >
              Sparkry.AI
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
