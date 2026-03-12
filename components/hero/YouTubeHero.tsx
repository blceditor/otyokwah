// REQ-SUMMER-001: YouTube Hero Video Component
"use client";

import { useState } from "react";
import Image from "next/image";

export interface YouTubeHeroProps {
  videoId: string;
  fallbackImage?: string;
  title?: string;
  subtitle?: string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Extracts YouTube video ID from various URL formats
 * Supports:
 * - Just the video ID (e.g., "dQw4w9WgXcQ")
 * - youtu.be/VIDEO_ID
 * - youtube.com/watch?v=VIDEO_ID
 * - youtube.com/embed/VIDEO_ID
 */
export function extractYouTubeId(input: string): string {
  if (!input || typeof input !== "string") {
    return "";
  }

  // If it looks like just an ID (alphanumeric with dashes/underscores, 11 chars typical)
  if (/^[a-zA-Z0-9_-]{10,12}$/.test(input)) {
    return input;
  }

  try {
    // youtu.be/VIDEO_ID format
    const youtuBeMatch = input.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
    if (youtuBeMatch) {
      return youtuBeMatch[1].split(/[?&]/)[0];
    }

    // youtube.com/watch?v=VIDEO_ID format
    const watchMatch = input.match(/[?&]v=([a-zA-Z0-9_-]+)/);
    if (watchMatch) {
      return watchMatch[1].split(/[?&]/)[0];
    }

    // youtube.com/embed/VIDEO_ID format
    const embedMatch = input.match(/\/embed\/([a-zA-Z0-9_-]+)/);
    if (embedMatch) {
      return embedMatch[1].split(/[?&]/)[0];
    }

    return input;
  } catch {
    return input;
  }
}

/**
 * YouTubeHero Component
 * Displays a YouTube video as a full-screen hero background
 * - Auto-plays, muted, loops (like a video hero)
 * - Falls back to image on error or unsupported browsers
 * - Overlays content on top
 */
export default function YouTubeHero({
  videoId,
  fallbackImage,
  title,
  subtitle,
  className = "",
  children,
}: YouTubeHeroProps) {
  const [iframeFailed, setIframeFailed] = useState(false);

  const cleanVideoId = extractYouTubeId(videoId);

  // YouTube embed URL with autoplay, mute, loop, and no controls for hero-style playback
  // Using youtube-nocookie.com for privacy
  // Parameters:
  // - autoplay=1: Auto-start video
  // - mute=1: Muted (required for autoplay)
  // - loop=1: Loop the video
  // - playlist={id}: Required for looping a single video
  // - controls=0: Hide controls
  // - showinfo=0: Hide video title (deprecated but included)
  // - modestbranding=1: Minimal YouTube branding
  // - rel=0: Don't show related videos
  // - playsinline=1: Play inline on mobile
  // - enablejsapi=1: Enable JS API for better control
  const embedUrl = `https://www.youtube-nocookie.com/embed/${cleanVideoId}?autoplay=1&mute=1&loop=1&playlist=${cleanVideoId}&controls=0&showinfo=0&modestbranding=1&rel=0&playsinline=1&enablejsapi=1`;

  const showFallback = iframeFailed || !cleanVideoId;

  return (
    <section
      id="youtube-hero"
      data-component="youtube-hero"
      data-testid="youtube-hero"
      aria-labelledby={title ? "youtube-hero-heading" : undefined}
      className={`relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden ${className}`}
    >
      {/* Background Video/Image */}
      <div className="absolute inset-0 z-0">
        {!showFallback ? (
          <div className="absolute inset-0 w-full h-full">
            {/* Wrapper to scale iframe beyond viewport to hide letterboxing */}
            <div className="absolute inset-0 overflow-hidden">
              <iframe
                src={embedUrl}
                title={title || "Background video"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[177.78vh] min-w-full h-[56.25vw] min-h-full pointer-events-none"
                style={{
                  border: "none",
                }}
                onError={() => setIframeFailed(true)}
                data-testid="youtube-hero-iframe"
              />
            </div>
          </div>
        ) : fallbackImage ? (
          <Image
            src={fallbackImage}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
            quality={85}
            data-testid="youtube-hero-fallback"
          />
        ) : null}

        {/* Dark gradient overlay for text readability */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50"
          aria-hidden="true"
        />
      </div>

      {/* Hero Content Overlay */}
      <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl">
        {children ? (
          children
        ) : (
          <>
            {title && (
              <h1
                id="youtube-hero-heading"
                className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 tracking-tight text-white"
              >
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-xl sm:text-2xl md:text-3xl text-white/90 font-light">
                {subtitle}
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
}

export { YouTubeHero };
