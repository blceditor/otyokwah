/**
 * WorkAtCampSection Component
 * REQ-HOME-005: Work At Camp section for homepage
 * Story Points: 3 SP
 *
 * Displays 3 work programs (Summer Staff, Leaders in Training, Year-Round)
 * in a responsive 3-column grid with icons, titles, descriptions, and link buttons.
 *
 * Visual treatment differs from CampSessionCard:
 * - No image, uses icon instead
 * - Centered layout with icon above title
 * - Secondary/outline button style (not primary green)
 * - Cream background with subtle border
 */

import React from "react";
import Link from "next/link";
import { getIconByName } from "@/lib/icons";

export interface WorkAtCampItem {
  icon: string;
  title: string;
  description: string;
  linkHref: string;
  linkLabel: string;
}

export interface WorkAtCampSectionProps {
  /** Section heading (optional) */
  heading?: string;
  /** Subheading text (optional) */
  subheading?: string;
  /** Array of work program items */
  items: WorkAtCampItem[];
}

/**
 * WorkAtCampSection - Homepage section highlighting work opportunities
 *
 * Responsive behavior:
 * - Mobile (< 640px): 1 column
 * - Tablet/Desktop: 3 columns
 */
export function WorkAtCampSection({
  heading = "Work at Camp",
  subheading,
  items,
}: WorkAtCampSectionProps): JSX.Element {
  return (
    <section
      data-component="work-at-camp-section"
      className="py-16 px-4 bg-cream"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        {(heading || subheading) && (
          <div className="text-center mb-12">
            {heading && (
              <h2 className="text-3xl sm:text-4xl font-bold text-bark mb-4 font-heading">
                {heading}
              </h2>
            )}
            {subheading && (
              <p className="text-lg text-bark/80 max-w-2xl mx-auto">
                {subheading}
              </p>
            )}
          </div>
        )}

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {items.map((item, index) => (
            <WorkAtCampCard key={index} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Individual work program card
 */
function WorkAtCampCard({
  icon,
  title,
  description,
  linkHref,
  linkLabel,
}: WorkAtCampItem): JSX.Element {
  const IconComponent = icon ? getIconByName(icon) : null;

  return (
    <article className="bg-white rounded-xl border-2 border-secondary/20 p-8 text-center transition-all duration-300 hover:shadow-lg hover:border-secondary/40 flex flex-col">
      {/* Icon */}
      {IconComponent && (
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center">
            <IconComponent className="w-8 h-8 text-secondary" />
          </div>
        </div>
      )}

      {/* Title */}
      <h3 className="text-xl font-bold text-bark mb-4">{title}</h3>

      {/* Description */}
      <p className="text-bark/80 mb-6 flex-grow">{description}</p>

      {/* Link Button */}
      <Link
        href={linkHref}
        className="inline-block w-full bg-secondary hover:bg-secondary/90 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        {linkLabel}
      </Link>
    </article>
  );
}

export default WorkAtCampSection;
