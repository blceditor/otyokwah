"use client";

/**
 * Full Bleed Template
 * Renders content with full-width sections - no section wrappers
 * Use for pages with squareGrid/gridSquare components that need edge-to-edge layout
 * REQ-SUMMER-001: Added YouTube Hero support
 */

import Image from "next/image";
import HeroVideo from "@/components/hero/HeroVideo";
import YouTubeHero from "@/components/hero/YouTubeHero";
import { MarkdocRenderer } from "@/components/content/MarkdocRenderer";
import { isSafeImageUrl } from "@/lib/security/validate-url";
import type { TestimonialData } from "@/components/content/TestimonialWidget";
import type { UltraCampSession } from "@/lib/ultracamp/sessions";

export interface FullBleedTemplateProps {
  title: string;
  bodyContent: string;
  heroImage?: string;
  heroVideo?: string;
  heroYouTubeId?: string;
  heroTagline?: string;
  testimonials?: TestimonialData[];
  ultracampSessions?: UltraCampSession[];
}

export function FullBleedTemplate({
  title,
  bodyContent,
  heroImage,
  heroVideo,
  heroYouTubeId,
  heroTagline,
  testimonials,
  ultracampSessions,
}: FullBleedTemplateProps) {
  return (
    <div className="min-h-screen">
      {/* Hero Section - REQ-SUMMER-001: YouTube takes priority, then video, then image */}
      {heroYouTubeId ? (
        <YouTubeHero
          videoId={heroYouTubeId}
          fallbackImage={heroImage}
          title={title}
          subtitle={heroTagline}
        />
      ) : heroVideo ? (
        <HeroVideo
          src={heroVideo}
          poster={heroImage}
          title={title}
          subtitle={heroTagline}
        />
      ) : heroImage && isSafeImageUrl(heroImage) ? (
        <section
          className="relative h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden"
        >
          <Image
            src={heroImage}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 text-center text-white px-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
              {title}
            </h1>
            {heroTagline && (
              <p className="text-xl sm:text-2xl text-white/90">{heroTagline}</p>
            )}
          </div>
        </section>
      ) : (
        <section className="py-16 bg-secondary">
          <div className="max-w-4xl mx-auto px-6 text-center text-white">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">{title}</h1>
            {heroTagline && (
              <p className="text-xl text-white/90">{heroTagline}</p>
            )}
          </div>
        </section>
      )}

      {/* Full-bleed content - no section wrappers */}
      <MarkdocRenderer content={bodyContent} testimonials={testimonials} ultracampSessions={ultracampSessions} />
    </div>
  );
}

export default FullBleedTemplate;
