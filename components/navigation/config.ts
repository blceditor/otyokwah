/**
 * Default Navigation Configuration
 * Matches website-notes4.md structure
 */

import type { NavigationConfig } from './types';
import { FOOTER_CONFIG } from '@/lib/config/footer';

export const defaultNavigation: NavigationConfig = {
  logo: {
    src: '/images/logo/otyokwah-black-logo-forthekingdom.png',
    alt: FOOTER_CONFIG.siteName,
    href: '/',
  },
  menuItems: [
    {
      label: 'About',
      href: '/about',
      children: [
        { label: 'Core Values', href: '/about-core-values' },
        { label: 'Doctrinal Statement', href: '/about-doctrinal-statement' },
        { label: 'Our Team', href: '/about-our-team' },
      ],
    },
    {
      label: 'Summer Camp',
      href: '/summer-camp',
      children: [
        { label: 'Camp Sessions', href: '/summer-camp-sessions' },
        { label: 'What to Bring', href: '/summer-camp-what-to-bring' },
        { label: 'Parent Info', href: '/summer-camp-parent-info' },
        { label: 'FAQ', href: '/summer-camp-faq' },
      ],
    },
    {
      label: 'Join Our Team',
      href: '/work-at-camp',
      children: [
        { label: 'Summer Staff', href: '/summer-staff' },
        { label: 'Leaders in Training', href: '/work-at-camp-leaders-in-training' },
      ],
    },
    {
      label: 'Ignite Retreat',
      href: '/retreats-ignite',
    },
    {
      label: 'Rentals',
      href: '/rentals',
      children: [
        { label: 'Cabins & Lodging', href: '/rentals-cabins' },
        { label: 'Dining Hall', href: '/rentals-dining-hall' },
        { label: 'Outdoor Spaces', href: '/rentals-outdoor-spaces' },
      ],
    },
    {
      label: 'Give',
      href: '/give',
    },
    {
      label: 'Contact',
      href: '/contact',
    },
  ],
  primaryCTA: {
    label: 'Register Now',
    href: FOOTER_CONFIG.registrationUrl,
    external: true,
  },
};
