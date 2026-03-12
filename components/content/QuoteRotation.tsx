'use client';

import { useState, useEffect, useCallback } from 'react';
import { Quote } from 'lucide-react';

export interface QuoteData {
  quote: string;
  name: string;
  role: string;
}

interface QuoteRotationProps {
  quotes: QuoteData[];
  interval?: number;
  className?: string;
}

export function QuoteRotation({
  quotes,
  interval = 5000,
  className = '',
}: QuoteRotationProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goToNext = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % quotes.length);
      setIsTransitioning(false);
    }, 300);
  }, [quotes.length]);

  const goToPrevious = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + quotes.length) % quotes.length);
      setIsTransitioning(false);
    }, 300);
  }, [quotes.length]);

  const goToIndex = useCallback((index: number) => {
    if (index === currentIndex) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsTransitioning(false);
    }, 300);
  }, [currentIndex]);

  useEffect(() => {
    if (isPaused || quotes.length <= 1) return;

    const timer = setInterval(goToNext, interval);
    return () => clearInterval(timer);
  }, [isPaused, quotes.length, interval, goToNext]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      goToPrevious();
    } else if (e.key === 'ArrowRight') {
      goToNext();
    }
  };

  if (quotes.length === 0) {
    return null;
  }

  const currentQuote = quotes[currentIndex];

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="Testimonial quote rotation"
      aria-live="polite"
      aria-atomic="true"
    >
      <div
        className={`transition-opacity duration-300 ${
          isTransitioning ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <div className="rounded-lg bg-white p-6 shadow-sm sm:p-8 md:p-10">
          <Quote className="mb-4 h-8 w-8 text-forest opacity-30" aria-hidden="true" />

          <blockquote className="mb-6 text-base text-bark/80 sm:text-lg md:text-xl">
            {currentQuote.quote}
          </blockquote>

          <div className="flex flex-col gap-1">
            <div className="font-semibold text-bark">{currentQuote.name}</div>
            <div className="text-sm text-stone">{currentQuote.role}</div>
          </div>
        </div>
      </div>

      {quotes.length > 1 && (
        <>
          {/* Navigation dots */}
          <div className="mt-4 flex justify-center gap-2" role="group" aria-label="Quote navigation">
            {quotes.map((_, index) => (
              <button
                key={index}
                onClick={() => goToIndex(index)}
                className={`h-2 w-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'w-6 bg-forest'
                    : 'bg-stone/50 hover:bg-stone/70'
                }`}
                aria-label={`Go to quote ${index + 1}`}
                aria-current={index === currentIndex ? 'true' : 'false'}
              />
            ))}
          </div>

          {/* Screen reader announcement */}
          <div className="sr-only" aria-live="polite" aria-atomic="true">
            Quote {currentIndex + 1} of {quotes.length}
          </div>
        </>
      )}
    </div>
  );
}

export default QuoteRotation;
