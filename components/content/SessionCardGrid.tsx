/**
 * REQ-F005: Session Card Grid Component
 * Story Points: 3 SP
 *
 * Reusable split-layout component with image on one side and session cards on colored background.
 * Follows Miracle Camp design pattern with responsive behavior.
 */

import React from "react";
import Image from "next/image";
import Link from "next/link";

export interface SessionCard {
  title: string;
  subtitle?: string;
  dates?: string;
  price?: string;
  description?: string;
  ctaText?: string;
  ctaHref?: string;
}

export interface SessionCardGridProps {
  heading: string;
  image: string;
  imageAlt: string;
  cards: SessionCard[];
  backgroundColor?: string;
  imagePosition?: "left" | "right";
  className?: string;
}

/**
 * SessionCardGrid - Split layout with image and session cards
 *
 * Server Component (no 'use client' needed - purely presentational)
 *
 * @param heading - Main heading for the card section
 * @param image - Image URL for the split layout side
 * @param imageAlt - Descriptive alt text for image
 * @param cards - Array of session/position cards to display
 * @param backgroundColor - Background color class (default: bg-secondary)
 * @param imagePosition - Position of image: 'left' or 'right' (default: 'left')
 * @param className - Additional CSS classes
 */
export function SessionCardGrid({
  heading,
  image,
  imageAlt,
  cards,
  backgroundColor = "bg-secondary",
  imagePosition = "left",
  className = "",
}: SessionCardGridProps) {
  // Determine flex direction based on image position
  const flexDirection =
    imagePosition === "left" ? "lg:flex-row" : "lg:flex-row-reverse";

  return (
    <section
      className={`flex flex-col ${flexDirection} min-h-[600px] ${className}`}
      aria-labelledby="session-grid-heading"
    >
      {/* Image Side - 50% on desktop */}
      <div className="relative w-full lg:w-1/2 min-h-[400px] lg:min-h-full">
        <Image
          src={image}
          alt={imageAlt}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
          priority={false}
        />
      </div>

      {/* Content Side - 50% on desktop */}
      <div
        className={`w-full lg:w-1/2 ${backgroundColor} p-6 sm:p-8 lg:p-12 flex flex-col justify-center`}
      >
        <h2
          id="session-grid-heading"
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-cream mb-8"
        >
          {heading}
        </h2>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 gap-6">
          {cards.map((card, index) => (
            <SessionCardItem key={`${card.title}-${index}`} card={card} />
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * SessionCardItem - Individual session card component
 * Separated for better organization and readability
 */
function SessionCardItem({ card }: { card: SessionCard }) {
  const CardContent = (
    <>
      {/* Title and Subtitle */}
      <div className="mb-3">
        <h3 className="text-xl sm:text-2xl font-bold text-bark">
          {card.title}
        </h3>
        {card.subtitle && (
          <p className="text-xs sm:text-sm font-semibold text-stone mt-1 uppercase tracking-wide">
            {card.subtitle}
          </p>
        )}
      </div>

      {/* Dates and Price Row */}
      {(card.dates || card.price) && (
        <div className="flex flex-wrap gap-4 mb-3 text-sm sm:text-base text-bark">
          {card.dates && (
            <div className="flex items-center">
              <span className="font-semibold">{card.dates}</span>
            </div>
          )}
          {card.price && (
            <div className="flex items-center">
              <span className="font-bold text-secondary text-lg">
                {card.price}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Description */}
      {card.description && (
        <p className="text-bark/80 text-sm sm:text-base mb-4">
          {card.description}
        </p>
      )}

      {/* CTA */}
      {card.ctaText && card.ctaHref && (
        <div className="mt-auto pt-2">
          <span
            className="inline-flex items-center text-secondary font-semibold hover:text-secondary-light transition-colors"
            aria-label={`${card.ctaText} for ${card.title}`}
          >
            {card.ctaText}
            <svg
              className="ml-2 w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </span>
        </div>
      )}
    </>
  );

  // If CTA exists (both text and href required), wrap entire card in link
  if (card.ctaHref && card.ctaText) {
    return (
      <Link
        href={card.ctaHref}
        className="block bg-cream rounded-lg shadow-sm hover:shadow-lg p-6 transition-all duration-200 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        {CardContent}
      </Link>
    );
  }

  // Otherwise, render as article
  return (
    <article className="bg-cream rounded-lg shadow-sm p-6">
      {CardContent}
    </article>
  );
}

export default SessionCardGrid;
