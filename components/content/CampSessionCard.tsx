/**
 * CampSessionCard Component
 * REQ-HOME-004: Camp Session Card with image, heading, subheading, bullet list, and CTA button
 * Story Points: 5 SP
 *
 * Design reference: requirements/image-12.png (Jr. High Camp card)
 * - Card with image at top
 * - Left-justified text
 * - Configurable bullet types (checkmark, bullet, diamond, numbers)
 * - CTA button centered at bottom (secondary green)
 * - Subtle hover animation (scale or shadow)
 */

"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";

export type BulletType = "checkmark" | "bullet" | "diamond" | "numbers";

export interface CampSessionCardProps {
  image: string;
  imageAlt: string;
  heading: string;
  subheading?: string;
  bulletType?: BulletType;
  bullets: string[];
  ctaLabel?: string;
  ctaHref?: string;
}

function renderBulletIcon(type: BulletType, index: number): React.ReactNode {
  switch (type) {
    case "checkmark":
      return (
        <Check
          className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5"
          aria-hidden="true"
        />
      );
    case "bullet":
      return (
        <span
          className="w-2 h-2 bg-secondary rounded-full flex-shrink-0 mt-2"
          aria-hidden="true"
        />
      );
    case "diamond":
      return (
        <span
          className="w-2 h-2 bg-secondary rotate-45 flex-shrink-0 mt-2"
          aria-hidden="true"
        />
      );
    case "numbers":
      return (
        <span className="text-secondary font-semibold flex-shrink-0 min-w-[1.5rem]">
          {index + 1}.
        </span>
      );
    default:
      return null;
  }
}

export function CampSessionCard({
  image,
  imageAlt,
  heading,
  subheading,
  bulletType = "checkmark",
  bullets,
  ctaLabel = "See Dates & Pricing",
  ctaHref = "#",
}: CampSessionCardProps): JSX.Element {
  return (
    <article
      data-component="camp-session-card"
      className="bg-cream rounded-xl overflow-hidden shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300 flex flex-col"
    >
      {/* Image Section */}
      <div className="relative w-full aspect-[4/3] overflow-hidden">
        <Image
          src={image}
          alt={imageAlt}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
      </div>

      {/* Content Section */}
      <div className="p-6 flex flex-col flex-grow">
        {/* Heading */}
        <h3 className="text-xl font-bold text-bark mb-1 text-left">
          {heading}
        </h3>

        {/* Subheading */}
        {subheading && (
          <p className="text-stone text-sm mb-4 text-left">{subheading}</p>
        )}

        {/* Bullet List */}
        {bullets.length > 0 && (
          <ul
            className="space-y-2 mb-6 flex-grow"
            data-bullet-type={bulletType}
          >
            {bullets.map((item, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-bark text-left"
              >
                {renderBulletIcon(bulletType, index)}
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}

        {/* CTA Button */}
        <Link
          href={ctaHref}
          className="block w-full text-center bg-secondary hover:bg-secondary-light text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200 mt-auto"
        >
          {ctaLabel}
        </Link>
      </div>
    </article>
  );
}

export default CampSessionCard;
