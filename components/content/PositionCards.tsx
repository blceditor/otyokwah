/**
 * REQ-641: Position Cards component for Markdoc
 * Displays job positions or roles (great for staff pages)
 */

import React from 'react';
import Image from 'next/image';

interface Position {
  image?: string;
  title: string;
  description: string;
  requirements?: string;
  applyLink?: string;
}

interface PositionCardsProps {
  heading?: string;
  positions: Position[];
}

export function PositionCards({ heading, positions }: PositionCardsProps) {
  return (
    <section className="py-12 my-8" data-testid="position-cards">
      {heading && (
        <h2 className="text-3xl font-bold text-center mb-10 text-bark">
          {heading}
        </h2>
      )}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {positions.map((position, index) => (
          <div
            key={index}
            className="bg-white rounded-lg border border-secondary/20 overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
            data-testid={`position-card-${index}`}
          >
            {position.image && (
              <div className="relative h-48 w-full">
                <Image
                  src={position.image}
                  alt={position.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="p-6">
              <h3 className="text-xl font-semibold text-bark mb-2">
                {position.title}
              </h3>
              <p className="text-bark/80 mb-4">{position.description}</p>
              {position.requirements && (
                <div className="text-sm text-bark/70 mb-4">
                  <strong>Requirements:</strong>
                  <p className="mt-1">{position.requirements}</p>
                </div>
              )}
              {position.applyLink && (
                <a
                  href={position.applyLink}
                  className="inline-block px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  Apply Now
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default PositionCards;
