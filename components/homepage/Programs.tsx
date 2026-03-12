/**
 * Programs Component
 * REQ-HP-001: Homepage Camp Sessions Display
 * REQ-TPL-001: CMS-managed program cards
 *
 * Displays 4 session category cards linking to summer-camp-sessions page anchors.
 * Data can come from CMS or use defaults.
 */

import ProgramCard from './ProgramCard';
import type { ProgramCard as ProgramCardData } from '@/lib/cms/homepage';

interface ProgramsProps {
  className?: string;
  heading?: string;
  programCards?: ProgramCardData[];
}

// Default data for when CMS data is not available
const defaultPrograms = [
  {
    title: 'Primary Overnight',
    subtitle: 'Rising 2nd-3rd Graders',
    imagePath: '/images/summer-program-and-general/primary-overnight.jpg',
    imageAlt: 'Young campers enjoying Primary Overnight activities',
    benefits: [
      'First taste of overnight camp',
      'Camp games & cabin time',
      'Action-packed introduction',
    ],
    ctaText: 'See Dates & Pricing',
    ctaHref: '/summer-camp-sessions#primary-overnight',
  },
  {
    title: 'Junior Camp',
    subtitle: 'Rising 3rd-6th Graders',
    imagePath: '/images/summer-program-and-general/junior-camp.jpg',
    imageAlt: 'Junior campers enjoying summer activities',
    benefits: [
      'Worship & Bible Study',
      'Waterfront fun & crafts',
      'Mentor relationships',
    ],
    ctaText: 'See Dates & Pricing',
    ctaHref: '/summer-camp-sessions#junior-camp',
  },
  {
    title: 'Jr. High Camp',
    subtitle: 'Rising 7th-9th Graders',
    imagePath: '/images/summer-program-and-general/jr-high-kids-with-banner.jpg',
    imageAlt: 'Jr. High campers posing with banner',
    benefits: [
      'Faith growth & exploration',
      'Team games & Slip-n-Slide',
      'Friendship & independence',
    ],
    ctaText: 'See Dates & Pricing',
    ctaHref: '/summer-camp-sessions#jr-high-camp',
  },
  {
    title: 'Sr. High Camp',
    subtitle: 'Rising 10th Graders - Grads',
    imagePath: '/images/summer-program-and-general/sr-high-camp.jpg',
    imageAlt: 'Sr. High campers enjoying summer activities',
    benefits: [
      'Rich community & faith',
      'Black light dodgeball',
      'Scripture & Worship',
    ],
    ctaText: 'See Dates & Pricing',
    ctaHref: '/summer-camp-sessions#sr-high-camp',
  },
];

export default function Programs({
  className = '',
  heading = 'Which Camp Week Is Right for You?',
  programCards,
}: ProgramsProps) {
  // Use CMS data if provided, otherwise use defaults
  const programs = programCards?.length ? programCards : defaultPrograms;

  return (
    <section
      id="programs"
      aria-labelledby="programs-heading"
      className={`py-section-y md:py-section-y-md bg-sand ${className}`}
    >
      <div className="container mx-auto px-4">
        <h2 id="programs-heading" className="text-3xl md:text-4xl font-tradesmith uppercase text-center text-textured mb-12">
          {heading}
        </h2>

        {/* REQ-Q1-002: Program Cards with authentic photos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {programs.map((program) => (
            <ProgramCard
              key={program.title}
              title={program.title}
              subtitle={program.subtitle}
              imageSrc={program.imagePath}
              imageAlt={program.imageAlt}
              benefits={program.benefits}
              ctaText={program.ctaText}
              ctaHref={program.ctaHref}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
