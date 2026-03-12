/**
 * REQ-597: Value Cards component for Markdoc
 * Displays value propositions or key features with icons/images
 */

import React from 'react';
import Image from 'next/image';

interface ValueCard {
  image?: string;
  icon?: string;
  title: string;
  description: string;
}

interface ValueCardsProps {
  heading?: string;
  cards: ValueCard[];
  columns?: 'two' | 'three';
}

const columnsMap: Record<string, string> = {
  two: 'grid-cols-1 sm:grid-cols-2',
  three: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
};

export function ValueCards({
  heading,
  cards,
  columns = 'three',
}: ValueCardsProps) {
  const gridClass = columnsMap[columns] || columnsMap.three;

  return (
    <section className="py-12 my-8" data-testid="value-cards">
      {heading && (
        <h2 className="text-3xl font-bold text-center mb-10 text-bark">
          {heading}
        </h2>
      )}
      <div className={`grid gap-6 ${gridClass}`}>
        {cards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-lg border border-secondary/20 overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
            data-testid={`value-card-${index}`}
          >
            {card.image && (
              <div className="relative h-48 w-full">
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="p-6">
              {card.icon && !card.image && (
                <div className="text-4xl mb-4">{card.icon}</div>
              )}
              <h3 className="text-xl font-semibold text-bark mb-2">
                {card.title}
              </h3>
              <p className="text-bark/80">{card.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ValueCards;
