/**
 * WideCard Component
 * REQ-HOME-006: Wide Card Component for homepage Retreats and Rentals sections
 * Story Points: 3 SP
 *
 * - Full-width card with image on left/right, content on opposite side
 * - Heading, description text, CTA button
 * - Background color configurable for visual distinction
 * - Responsive: stacks vertically on mobile
 * - Hover animation effects
 */

"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { DESIGN_TOKEN_HEX } from "@/lib/keystatic/constants";

export type ImagePosition = "left" | "right";

export interface WideCardProps {
  image: string;
  imageAlt: string;
  imagePosition?: ImagePosition;
  heading: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
  backgroundColor?: string;
}

export function WideCard({
  image,
  imageAlt,
  imagePosition = "left",
  heading,
  description,
  ctaLabel = "Learn More",
  ctaHref = "#",
  backgroundColor = DESIGN_TOKEN_HEX.cream,
}: WideCardProps): JSX.Element {
  const isImageLeft = imagePosition === "left";

  return (
    <article
      data-component="wide-card"
      className="rounded-xl overflow-hidden shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300 flex flex-col md:flex-row"
      style={{ backgroundColor }}
    >
      {/* Image Section */}
      <div
        className={`relative w-full md:w-1/2 aspect-[4/3] md:aspect-auto md:min-h-[300px] overflow-hidden ${
          isImageLeft ? "md:order-1" : "md:order-2"
        }`}
      >
        <Image
          src={image}
          alt={imageAlt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      {/* Content Section */}
      <div
        className={`w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-center ${
          isImageLeft ? "md:order-2" : "md:order-1"
        }`}
      >
        {/* Heading */}
        <h3 className="text-2xl md:text-3xl font-bold text-bark mb-4">
          {heading}
        </h3>

        {/* Description */}
        <p className="text-bark/80 text-base md:text-lg mb-6 leading-relaxed">
          {description}
        </p>

        {/* CTA Button */}
        <Link
          href={ctaHref}
          className="inline-block w-fit text-center bg-secondary hover:bg-secondary-light text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200"
        >
          {ctaLabel}
        </Link>
      </div>
    </article>
  );
}

export default WideCard;
