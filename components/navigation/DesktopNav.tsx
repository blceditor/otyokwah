'use client';

/**
 * DesktopNav Component
 * REQ-301: Desktop (>=1024px) - Full horizontal nav bar
 * REQ-303: Navigation Menu Items
 */

import Link from 'next/link';
import type { NavigationConfig } from './types';
import NavItem from './NavItem';

interface DesktopNavProps {
  navigation: NavigationConfig;
  onSearchClick?: () => void;
}

export default function DesktopNav({ navigation, onSearchClick }: DesktopNavProps) {
  const { menuItems, primaryCTA } = navigation;

  return (
    <nav className="hidden lg:flex items-center gap-1 text-sm" aria-label="Main navigation">
      {/* All menu items on right */}
      {menuItems.map((item) => (
        <NavItem key={item.label} item={item} />
      ))}

      {/* Search Button */}
      {onSearchClick && (
        <button
          type="button"
          onClick={onSearchClick}
          className="ml-1 p-2 text-cream hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-md"
          aria-label="Search"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      )}

      {/* Primary CTA Button */}
      <Link
        href={primaryCTA.href}
        className="ml-3 px-5 py-2 bg-accent hover:bg-accent-light text-white font-medium rounded-md transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-secondary"
        target={primaryCTA.external ? '_blank' : undefined}
        rel={primaryCTA.external ? 'noopener noreferrer' : undefined}
      >
        {primaryCTA.label}
      </Link>
    </nav>
  );
}
