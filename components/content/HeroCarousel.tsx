"use client";

/**
 * Hero Carousel Component
 * REQ-HERO-001: Hero Image Carousel Component
 *
 * Auto-rotating carousel with accessibility features
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { isSafeImageUrl } from "@/lib/security/validate-url";

export interface CarouselImage {
  src: string;
  alt: string;
}

export interface HeroCarouselProps {
  images: CarouselImage[];
  interval?: number;
  showIndicators?: boolean;
}

export function HeroCarousel({
  images,
  interval = 5000,
  showIndicators = true,
}: HeroCarouselProps): JSX.Element {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Filter out unsafe images
  const safeImages = images.filter((img) => isSafeImageUrl(img.src));

  // Check for prefers-reduced-motion
  useEffect(() => {
    // Handle SSR and test environments
    if (typeof window === "undefined" || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!mediaQuery) {
      return;
    }

    setReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Auto-rotation
  useEffect(() => {
    if (
      safeImages.length <= 1 ||
      isPaused ||
      reducedMotion
    ) {
      return;
    }

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % safeImages.length);
    }, interval);

    return () => clearInterval(timer);
  }, [safeImages.length, interval, isPaused, reducedMotion]);

  const goToSlide = useCallback(
    (index: number) => {
      setCurrentIndex(index);
    },
    []
  );

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) =>
      prev === 0 ? safeImages.length - 1 : prev - 1
    );
  }, [safeImages.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % safeImages.length);
  }, [safeImages.length]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        goToPrevious();
      } else if (e.key === "ArrowRight") {
        goToNext();
      }
    },
    [goToPrevious, goToNext]
  );

  // Touch/swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const swipeThreshold = 50;
    const swipeDistance = touchStartX.current - touchEndX.current;

    if (Math.abs(swipeDistance) > swipeThreshold) {
      if (swipeDistance > 0) {
        // Swiped left - go to next
        goToNext();
      } else {
        // Swiped right - go to previous
        goToPrevious();
      }
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  // Pause/resume handlers
  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);
  const handleFocus = () => setIsPaused(true);
  const handleBlur = () => setIsPaused(false);

  if (safeImages.length === 0) {
    return (
      <div
        role="region"
        aria-label="Hero carousel"
        className="relative w-full h-full"
      >
        {/* Empty state */}
      </div>
    );
  }

  return (
    <div
      ref={carouselRef}
      role="region"
      aria-label="Hero carousel"
      tabIndex={0}
      className="relative w-full h-full overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Images */}
      <div className="relative w-full h-full">
        {safeImages.map((image, index) => (
          <div
            key={`${image.src}-${index}`}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
            style={{
              backgroundImage: `url(${image.src})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            role="img"
            aria-label={image.alt}
          />
        ))}
      </div>

      {/* Indicators - REQ-MOBILE-001: 44px touch targets */}
      {showIndicators && safeImages.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1 z-10">
          {safeImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === currentIndex}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <span
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "bg-white scale-125"
                    : "bg-white/50 hover:bg-white/75"
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
