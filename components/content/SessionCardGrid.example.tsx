/**
 * REQ-F005: SessionCardGrid Usage Examples
 *
 * Example usage patterns for the SessionCardGrid component
 */

import { SessionCardGrid } from './SessionCardGrid';

// Example 1: Summer Camp Grade School Sessions
export function GradeSchoolSessions() {
  return (
    <SessionCardGrid
      heading="Grade School"
      image="/images/camp-kids.jpg"
      imageAlt="Elementary school children participating in outdoor camp activities"
      cards={[
        {
          title: 'Grade School 1',
          subtitle: 'GOING INTO 2ND – 4TH GRADE',
          dates: 'June 14-20, 2026',
          price: '$655',
          description: 'A week of adventure, faith building, and making lifelong friends.',
          ctaText: 'Learn More',
          ctaHref: '/summer-camp/grade-school-1',
        },
        {
          title: 'Grade School 2',
          dates: 'June 14-17, 2026',
          price: '$450',
          description: 'Extended weekend camp experience for younger campers.',
          ctaText: 'Register Now',
          ctaHref: '/summer-camp/grade-school-2',
        },
      ]}
    />
  );
}

// Example 2: Staff Positions with Image on Right
export function StaffPositions() {
  return (
    <SessionCardGrid
      heading="Join Our Team"
      image="/images/staff-working.jpg"
      imageAlt="Camp counselors leading activities with campers"
      imagePosition="right"
      backgroundColor="bg-primary"
      cards={[
        {
          title: 'Camp Counselor',
          subtitle: 'SEASONAL POSITION',
          dates: 'June - August 2026',
          price: '$2,500 + room/board',
          description: 'Lead activities, mentor campers, and make a lasting impact.',
          ctaText: 'Apply Now',
          ctaHref: '/work-at-camp/counselor',
        },
        {
          title: 'Kitchen Staff',
          subtitle: 'SEASONAL POSITION',
          dates: 'June - August 2026',
          price: '$2,200 + room/board',
          description: 'Prepare nutritious meals for campers and staff.',
          ctaText: 'Apply Now',
          ctaHref: '/work-at-camp/kitchen',
        },
        {
          title: 'Maintenance Worker',
          subtitle: 'FULL-TIME POSITION',
          dates: 'Year-round',
          price: '$40,000/year',
          description: 'Keep our facilities in top condition for campers and guests.',
          ctaText: 'Apply Now',
          ctaHref: '/work-at-camp/maintenance',
        },
      ]}
    />
  );
}

// Example 3: Retreat Options (No Prices)
export function RetreatOptions() {
  return (
    <SessionCardGrid
      heading="Retreat Packages"
      image="/images/retreat-group.jpg"
      imageAlt="Church group gathered in chapel for worship service"
      backgroundColor="bg-accent"
      cards={[
        {
          title: 'Weekend Retreat',
          subtitle: 'YOUTH GROUPS',
          dates: 'Friday - Sunday',
          description: 'Perfect for youth groups seeking spiritual renewal and team building.',
          ctaText: 'Get Details',
          ctaHref: '/retreats/weekend',
        },
        {
          title: 'Midweek Retreat',
          subtitle: 'ADULT GROUPS',
          dates: 'Monday - Thursday',
          description: 'Ideal for adult groups wanting extended time for reflection.',
          ctaText: 'Get Details',
          ctaHref: '/retreats/midweek',
        },
      ]}
    />
  );
}

// Example 4: Simple Cards without CTAs (Information Only)
export function ProgramOverview() {
  return (
    <SessionCardGrid
      heading="What to Expect"
      image="/images/camp-activities.jpg"
      imageAlt="Collage of various camp activities including swimming, hiking, and worship"
      cards={[
        {
          title: 'Spiritual Growth',
          description: 'Daily devotions, chapel services, and small group discussions.',
        },
        {
          title: 'Outdoor Adventure',
          description: 'Hiking, swimming, canoeing, rock climbing, and more.',
        },
        {
          title: 'Community Building',
          description: 'Team games, cabin time, and lifelong friendships.',
        },
      ]}
    />
  );
}

// Example 5: Custom Styling
export function HighlightedEvent() {
  return (
    <SessionCardGrid
      heading="Special Event"
      image="/images/special-event.jpg"
      imageAlt="Campers gathered for special outdoor worship service"
      backgroundColor="bg-secondary-light"
      className="my-16 shadow-2xl"
      cards={[
        {
          title: 'Family Camp 2026',
          subtitle: 'ALL AGES WELCOME',
          dates: 'July 15-20, 2026',
          price: '$450/family',
          description:
            'Join us for our annual family camp where parents and children experience camp together.',
          ctaText: 'Register Your Family',
          ctaHref: '/family-camp',
        },
      ]}
    />
  );
}
