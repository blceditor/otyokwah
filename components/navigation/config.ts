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
        { label: 'Contact Us', href: '/contact' },
      ],
    },
    {
      label: 'Summer Camp',
      href: '/summer-camp',
      children: [
        { label: 'Camp Sessions', href: '/summer-camp-sessions' },
        { label: 'What to Bring', href: '/summer-camp-what-to-bring' },
        { label: 'FAQ', href: '/summer-camp-faq' },
        { label: 'Parent Info', href: '/summer-camp-parent-info' },
      ],
    },
    {
      label: 'Work at Camp',
      href: '/work-at-camp',
      children: [
        { label: 'Summer Staff', href: '/summer-staff' },
        { label: 'Leaders in Training', href: '/work-at-camp-leaders-in-training' },
        { label: 'Year Round Positions', href: '/work-at-camp-year-round' },
      ],
    },
    {
      label: 'Retreats',
      href: '/retreats',
      children: [
        { label: 'Ignite', href: '/retreats-ignite' },
      ],
    },
    {
      label: 'Rentals',
      href: '/rentals',
      children: [
        { label: 'Hopewell Hall', href: '/rentals-dining-hall' },
        { label: 'Delaware Lodge', href: '/rentals-cabins' },
        { label: 'Mingo Cabin', href: '/rentals-mingo' },
        { label: 'Seasonal Cabins', href: '/rentals-seasonal-cabins' },
        { label: 'Outdoor Spaces', href: '/rentals-outdoor-spaces' },
        { label: 'Recreation', href: '/rentals-recreation' },
        { label: 'Maps', href: '/rentals-maps' },
      ],
    },
    {
      label: 'Give',
      href: '/give',
    },
  ],
  primaryCTA: {
    label: 'Register Now',
    href: FOOTER_CONFIG.registrationUrl,
    external: true,
  },
};
