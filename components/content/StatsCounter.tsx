'use client';

import { useEffect, useRef, useState } from 'react';

interface Stat {
  number: number;
  label: string;
  suffix?: string;
}

interface StatsCounterProps {
  stats: Stat[];
}

export function StatsCounter({ stats }: StatsCounterProps) {
  const [hasAnimated, setHasAnimated] = useState(false);
  const [counters, setCounters] = useState<number[]>(stats.map(() => 0));
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);

            stats.forEach((stat, index) => {
              const duration = 2000;
              const steps = 60;
              const increment = stat.number / steps;
              let current = 0;
              let step = 0;

              const timer = setInterval(() => {
                step++;
                current = Math.min(Math.round(increment * step), stat.number);

                setCounters((prev) => {
                  const newCounters = [...prev];
                  newCounters[index] = current;
                  return newCounters;
                });

                if (step >= steps) {
                  clearInterval(timer);
                }
              }, duration / steps);
            });
          }
        });
      },
      { threshold: 0.3 }
    );

    const node = containerRef.current;
    if (node) {
      observer.observe(node);
    }

    return () => {
      if (node) {
        observer.unobserve(node);
      }
    };
  }, [hasAnimated, stats]);

  return (
    <div
      ref={containerRef}
      className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3"
      data-testid="stats-counter"
    >
      {stats.map((stat, index) => (
        <div
          key={index}
          className="text-center"
          data-testid={`stat-${index}`}
        >
          <div
            className="mb-2 text-4xl font-bold text-primary md:text-5xl"
            aria-live="polite"
            aria-atomic="true"
          >
            {counters[index].toLocaleString()}
            {stat.suffix}
          </div>
          <div className="text-lg font-medium text-bark/80">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}

export default StatsCounter;
