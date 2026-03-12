/**
 * REQ-TPL-001: Homepage Data Types
 *
 * Homepage is now managed through content/pages/index.mdoc and Markdoc components.
 * The homepage singleton has been removed (REQ-NEW-008).
 * These types and defaults are retained for component compatibility.
 */

export interface ProgramCard {
  title: string;
  subtitle: string;
  imagePath: string;
  imageAlt: string;
  benefits: string[];
  ctaText: string;
  ctaHref: string;
}

export interface TrustBarItem {
  text: string;
  icon: string;
}

export interface HomepageData {
  programsSectionHeading: string;
  programCards: ProgramCard[];
  trustBarItems: TrustBarItem[];
  gallerySectionHeading: string;
  testimonialsSectionHeading: string;
}

// Default data for fallback when CMS is unavailable
const defaultHomepageData: HomepageData = {
  programsSectionHeading: 'Which Camp Week Is Right for You?',
  programCards: [
    {
      title: 'Primary Overnight',
      subtitle: 'Rising 2nd-3rd Graders',
      imagePath: '/images/summer-program-and-general/primary-overnight.jpg',
      imageAlt: 'Young campers enjoying Primary Overnight activities',
      benefits: ['First taste of overnight camp', 'Camp games & cabin time', 'Action-packed introduction'],
      ctaText: 'See Dates & Pricing',
      ctaHref: '/summer-camp-sessions#primary-overnight',
    },
    {
      title: 'Junior Camp',
      subtitle: 'Rising 3rd-6th Graders',
      imagePath: '/images/summer-program-and-general/junior-camp.jpg',
      imageAlt: 'Junior campers enjoying summer activities',
      benefits: ['Worship & Bible Study', 'Waterfront fun & crafts', 'Mentor relationships'],
      ctaText: 'See Dates & Pricing',
      ctaHref: '/summer-camp-sessions#junior-camp',
    },
    {
      title: 'Jr. High Camp',
      subtitle: 'Rising 7th-9th Graders',
      imagePath: '/images/summer-program-and-general/jr-high-kids-with-banner.jpg',
      imageAlt: 'Jr. High campers at Bear Lake Camp',
      benefits: ['Faith growth & exploration', 'Team games & Slip-n-Slide', 'Friendship & independence'],
      ctaText: 'See Dates & Pricing',
      ctaHref: '/summer-camp-sessions#jr-high-camp',
    },
    {
      title: 'Sr. High Camp',
      subtitle: 'Rising 10th Graders - Grads',
      imagePath: '/images/summer-program-and-general/sr-high-camp.jpg',
      imageAlt: 'Sr. High campers enjoying summer activities',
      benefits: ['Rich community & faith', 'Black light dodgeball', 'Scripture & Worship'],
      ctaText: 'See Dates & Pricing',
      ctaHref: '/summer-camp-sessions#sr-high-camp',
    },
  ],
  trustBarItems: [
    { text: 'Est. 1940', icon: 'Calendar' },
    { text: '1000+ Campers/Year', icon: 'Users' },
    { text: 'Christian Faith', icon: 'Cross' },
    { text: 'Northern Indiana', icon: 'Mountain' },
  ],
  gallerySectionHeading: 'Life at Camp',
  testimonialsSectionHeading: 'Hear From Families',
};

export { defaultHomepageData };
