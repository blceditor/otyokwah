/**
 * TrustBar Component
 * REQ-TPL-001: CMS-managed trust bar items
 *
 * Displays trust signals that can be managed from CMS.
 */

import { Calendar, Users, Cross, Mountain, Heart, Star, Shield, Award } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { TrustBarItem } from '@/lib/cms/homepage';

// Map icon names to Lucide components
const iconMap: Record<string, LucideIcon> = {
  Calendar,
  Users,
  Cross,
  Mountain,
  Heart,
  Star,
  Shield,
  Award,
};

interface TrustItem {
  Icon: LucideIcon;
  text: string;
}

interface TrustBarProps {
  items?: TrustItem[];
  cmsItems?: TrustBarItem[];
  className?: string;
}

const defaultItems: TrustItem[] = [
  { Icon: Calendar, text: 'Est. 1940' },
  { Icon: Users, text: '1000+ Campers/Year' },
  { Icon: Cross, text: 'Christian Faith' },
  { Icon: Mountain, text: 'Northern Indiana' },
];

export default function TrustBar({ items, cmsItems, className = '' }: TrustBarProps) {
  // Convert CMS items to TrustItem format if provided
  const displayItems: TrustItem[] = cmsItems?.length
    ? cmsItems.map((item) => ({
        Icon: iconMap[item.icon] || Calendar,
        text: item.text,
      }))
    : items || defaultItems;

  return (
    <section
      id="trust-bar"
      role="complementary"
      aria-label="Trust signals and credibility indicators"
      className={`bg-secondary py-4 ${className}`}
    >
      <div className="container mx-auto px-4">
        <ul className="grid grid-cols-2 md:grid-cols-4 gap-4 text-cream text-center">
          {displayItems.map((item, index) => (
            <li
              key={index}
              className="flex flex-col items-center justify-center gap-2 min-h-[48px]"
              data-testid={`trust-item-${index}`}
            >
              <item.Icon className="w-5 h-5 md:w-6 md:h-6" aria-hidden="true" />
              <span className="text-sm md:text-base font-medium">{item.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
