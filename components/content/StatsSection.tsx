/**
 * REQ-555: Stats Section component for Markdoc
 * Displays statistics/metrics with heading and configurable layout
 * Unlike StatsCounter, this handles string-based stats from Keystatic
 */

import React from 'react';

interface StatItem {
  number: string;
  label: string;
  description?: string;
}

interface StatsSectionProps {
  heading?: string;
  items: StatItem[];
  layout?: 'two' | 'three' | 'four';
}

const layoutMap: Record<string, string> = {
  two: 'grid-cols-1 sm:grid-cols-2',
  three: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
  four: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4',
};

export function StatsSection({
  heading,
  items,
  layout = 'three',
}: StatsSectionProps) {
  const gridClass = layoutMap[layout] || layoutMap.three;

  return (
    <section className="py-12 my-8" data-testid="stats-section">
      {heading && (
        <h2 className="text-3xl font-bold text-center mb-10 text-bark">
          {heading}
        </h2>
      )}
      <div className={`grid gap-8 ${gridClass}`}>
        {items.map((stat, index) => (
          <div
            key={index}
            className="text-center p-6 bg-cream rounded-lg"
            data-testid={`stat-item-${index}`}
          >
            <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
              {stat.number}
            </div>
            <div className="text-lg font-semibold text-bark mb-1">
              {stat.label}
            </div>
            {stat.description && (
              <div className="text-sm text-bark/70">{stat.description}</div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default StatsSection;
