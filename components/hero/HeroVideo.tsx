// REQ-F002: Hero Video Component
"use client";

import { useState } from "react";
import Image from "next/image";

export interface HeroVideoProps {
  src: string;
  poster?: string;
  title?: string;
  subtitle?: string;
  className?: string;
  children?: React.ReactNode;
}

export default function HeroVideo({
  src,
  poster,
  title,
  subtitle,
  className = "",
  children,
}: HeroVideoProps) {
  const [videoFailed, setVideoFailed] = useState(false);

  return (
    <section
      id="hero-video"
      data-testid="hero-section"
      aria-labelledby={title ? "hero-video-heading" : undefined}
      className={`relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden ${className}`}
    >
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        {!videoFailed ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={poster}
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => setVideoFailed(true)}
          >
            <source src={src} type="video/mp4" />
            {/* Fallback text for browsers that don't support video */}
            Your browser does not support the video tag.
          </video>
        ) : (
          poster && (
            <Image
              src={poster}
              alt=""
              fill
              sizes="100vw"
              className="object-cover"
            />
          )
        )}

        {/* Dark gradient overlay for text readability */}
        <div data-testid="hero-overlay" className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
      </div>

      {/* Hero Content Overlay */}
      <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl">
        {children ? (
          children
        ) : (
          <>
            {title && (
              <h1
                id="hero-video-heading"
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
