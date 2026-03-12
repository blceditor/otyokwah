// REQ-Q2-006: Add Mobile Sticky CTA
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface MobileStickyCTAProps {
  registrationUrl: string;
  className?: string;
}

// Scroll percentage threshold to show sticky CTA
const SCROLL_THRESHOLD_PERCENT = 50;

export default function MobileStickyCTA({ registrationUrl, className = '' }: MobileStickyCTAProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Throttle scroll events using requestAnimationFrame for performance
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // Show CTA after scrolling past threshold
          const scrollPercentage =
            (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
          setIsVisible(scrollPercentage > SCROLL_THRESHOLD_PERCENT);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 lg:hidden transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      } ${className}`}
    >
      <div className="bg-secondary/95 backdrop-blur-sm px-4 py-3 shadow-2xl border-t border-secondary-light">
        <div className="flex gap-3">
          {/* Register Now - Primary CTA */}
          <Link
            href={registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-accent hover:bg-accent-light text-cream font-semibold px-4 py-3 min-h-[48px] rounded-lg transition-colors duration-200 text-center flex items-center justify-center"
            aria-label="Register for camp now"
          >
            Register Now
          </Link>

          {/* Find Your Week - Secondary CTA */}
          <Link
            href="#programs"
            scroll={true}
            className="flex-1 bg-transparent hover:bg-secondary-light text-cream font-semibold px-4 py-3 min-h-[48px] rounded-lg border-2 border-cream/50 hover:border-cream transition-all duration-200 text-center flex items-center justify-center"
            aria-label="Scroll to programs section"
          >
            Find Your Week
          </Link>
        </div>
      </div>
    </div>
  );
}
