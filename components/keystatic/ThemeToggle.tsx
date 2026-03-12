'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ThemeToggleProps {
  compact?: boolean; // REQ-CMS-007: Compact mode for nav bar
}

/**
 * ThemeToggle - REQ-FUTURE-020, REQ-CMS-007
 *
 * Dark mode toggle for Keystatic CMS admin interface.
 * - Respects system preference on first visit
 * - Persists user choice in localStorage
 * - Smooth transition animation (<300ms)
 * - Compact mode for nav bar integration
 */
export function ThemeToggle({ compact = false }: ThemeToggleProps) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch - only render after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return placeholder with same dimensions to prevent layout shift
    return (
      <div
        className={`${compact ? 'w-7 h-7' : 'w-9 h-9'} rounded-lg bg-gray-100 dark:bg-dark-surface animate-pulse`}
        aria-hidden="true"
      />
    );
  }

  const isDark = resolvedTheme === 'dark';

  // REQ-CMS-007: Compact mode styling for black nav bar
  if (compact) {
    return (
      <button
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-gray-300 hover:text-white transition-colors"
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        title="Switch between light and dark mode"
      >
        {isDark ? (
          <>
            <Moon size={14} className="text-blue-400" />
            <span>Dark</span>
          </>
        ) : (
          <>
            <Sun size={14} className="text-yellow-400" />
            <span>Light</span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title="Switch between light and dark mode"
    >
      <Sun
        className={`h-5 w-5 transition-all duration-200 ${
          isDark
            ? 'rotate-90 scale-0 opacity-0 absolute'
            : 'rotate-0 scale-100 opacity-100'
        }`}
        aria-hidden="true"
      />
      <Moon
        className={`h-5 w-5 transition-all duration-200 ${
          isDark
            ? 'rotate-0 scale-100 opacity-100'
            : '-rotate-90 scale-0 opacity-0 absolute'
        }`}
        aria-hidden="true"
      />
    </button>
  );
}

export default ThemeToggle;
