'use client';

/**
 * MobileNav Component
 * REQ-306: Mobile Hamburger Menu - slide in from right, full-screen overlay
 * Bug 11 fix: Added scroll support and clickable parent items
 */

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { MobileNavProps } from './types';

export default function MobileNav({ navigation, isOpen, onClose }: MobileNavProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (label: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  };

  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 bg-black/50 z-mobile-menu lg:hidden animate-fade-in"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation menu"
    >
      <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-secondary-light shadow-xl animate-slide-in-right flex flex-col">
        {/* Close button */}
        <div className="flex justify-end p-4 flex-shrink-0">
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="p-3 text-cream hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white touch-target-44"
            aria-label="Close menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation items - Bug 11 fix: overflow-y-auto for scroll */}
        <nav className="px-4 py-2 overflow-y-auto flex-1" aria-label="Mobile navigation">
          {navigation.menuItems.map((item) => (
            <div key={item.label} className="border-b border-secondary-light last:border-0">
              {item.href && !item.children?.length ? (
                <Link
                  href={item.href}
                  className="block py-4 text-cream hover:text-white font-medium transition-colors focus-visible:outline-none focus-visible:bg-secondary focus-visible:text-white min-h-[44px] flex items-center"
                  onClick={onClose}
                >
                  {item.label}
                </Link>
              ) : (
                <>
                  {/* Bug 11 fix: Parent items with children are now clickable links with separate expand chevron */}
                  <div className="flex items-center min-h-[44px]">
                    {item.href ? (
                      <Link
                        href={item.href}
                        className="flex-1 py-4 text-white hover:text-cream font-medium transition-colors focus-visible:outline-none focus-visible:bg-secondary focus-visible:text-white flex items-center"
                        onClick={onClose}
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <span className="flex-1 py-4 text-white font-medium flex items-center">
                        {item.label}
                      </span>
                    )}
                    {item.children && item.children.length > 0 && (
                      <button
                        type="button"
                        onClick={() => toggleExpanded(item.label)}
                        className="p-3 text-cream/70 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded touch-target-44"
                        aria-expanded={expandedItems.has(item.label)}
                        aria-label={`${expandedItems.has(item.label) ? 'Collapse' : 'Expand'} ${item.label} submenu`}
                      >
                        <svg
                          className={`w-4 h-4 transition-transform duration-200 ${expandedItems.has(item.label) ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    )}
                  </div>
                  {item.children && expandedItems.has(item.label) && (
                    <div className="pl-4 pb-2">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block py-3 text-cream/80 hover:text-white text-sm transition-colors focus-visible:outline-none focus-visible:bg-secondary focus-visible:text-white min-h-[44px] flex items-center"
                          onClick={onClose}
                          target={child.external ? '_blank' : undefined}
                          rel={child.external ? 'noopener noreferrer' : undefined}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}

          {/* Primary CTA */}
          <div className="mt-6 px-2 pb-4">
            <Link
              href={navigation.primaryCTA.href}
              className="block w-full py-3 bg-accent hover:bg-accent-light text-white font-medium text-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white min-h-[44px] flex items-center justify-center"
              onClick={onClose}
              target={navigation.primaryCTA.external ? '_blank' : undefined}
              rel={navigation.primaryCTA.external ? 'noopener noreferrer' : undefined}
            >
              {navigation.primaryCTA.label}
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
}
