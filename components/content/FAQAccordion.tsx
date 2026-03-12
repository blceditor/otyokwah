// REQ-F004: FAQ Accordion Component (5 SP)
'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * FAQ item with optional category for grouping
 */
export interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

/**
 * Props for FAQAccordion component
 */
export interface FAQAccordionProps {
  items: FAQItem[];
  title?: string;
  titleAlign?: 'left' | 'center' | 'right';
  allowMultiple?: boolean;
  className?: string;
}

/**
 * Category label mapping for display
 */
const CATEGORY_LABELS: Record<string, string> = {
  'summer-camp': 'Summer Camp',
  'summer-staff': 'Summer Staff',
  registration: 'Registration',
  staff: 'Staff',
  lit: 'LIT',
  general: 'General',
};

/**
 * Accessible FAQ accordion component with category support.
 *
 * Features:
 * - Expandable/collapsible sections
 * - Category grouping with headers
 * - Keyboard navigation (Enter/Space)
 * - ARIA attributes for accessibility
 * - Mobile responsive design
 * - Smooth animations
 * - Single or multiple open items
 *
 * @param items - Array of FAQ items with questions, answers, and optional categories
 * @param allowMultiple - Allow multiple items to be open simultaneously (default: false)
 * @param className - Additional CSS classes for the wrapper
 *
 * @example
 * ```tsx
 * <FAQAccordion
 *   items={[
 *     { question: "What to bring?", answer: "...", category: "summer-camp" }
 *   ]}
 *   allowMultiple={false}
 * />
 * ```
 */
export function FAQAccordion({
  items,
  title = 'Frequently Asked Questions',
  titleAlign = 'left',
  allowMultiple = false,
  className = '',
}: FAQAccordionProps) {
  const [openIndexes, setOpenIndexes] = useState<number[]>([]);

  // Group items by category
  const groupedItems = items.reduce((acc, item, index) => {
    const category = item.category || 'general';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push({ ...item, originalIndex: index });
    return acc;
  }, {} as Record<string, Array<FAQItem & { originalIndex: number }>>);

  const toggleItem = (index: number) => {
    if (allowMultiple) {
      setOpenIndexes((prev) =>
        prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
      );
    } else {
      setOpenIndexes((prev) => (prev.includes(index) ? [] : [index]));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleItem(index);
    }
  };

  const categoryKeys = Object.keys(groupedItems);
  const isSingleCategory = categoryKeys.length === 1;

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <div className={`mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 ${className}`} role="region" aria-label={title}>
      <h2 className={`text-2xl font-bold text-bark sm:text-3xl ${alignClasses[titleAlign]}`}>{title}</h2>
      {Object.entries(groupedItems).map(([category, categoryItems]) => (
        <div key={category} className="space-y-4">
          {!isSingleCategory && (
            <h3
              id={`faq-category-${category}`}
              className="text-lg font-bold text-bark sm:text-xl"
            >
              {CATEGORY_LABELS[category] || category}
            </h3>
          )}

          {/* Category Items */}
          <div className="space-y-4" role="group" aria-labelledby={isSingleCategory ? undefined : `faq-category-${category}`}>
            {categoryItems.map((item) => {
              const index = item.originalIndex;
              const isOpen = openIndexes.includes(index);
              const answerId = `faq-answer-${index}`;

              return (
                <div
                  key={index}
                  className="rounded-lg border-2 border-secondary/20 bg-white hover:border-secondary/30 transition-colors"
                  data-testid={`faq-item-${index}`}
                >
                  {/* Question Button */}
                  <button
                    type="button"
                    className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:p-6"
                    onClick={() => toggleItem(index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    aria-expanded={isOpen}
                    aria-controls={answerId}
                  >
                    <span className="pr-4 text-base font-semibold text-bark sm:text-lg">
                      {item.question}
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 flex-shrink-0 text-stone transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                      aria-hidden="true"
                    />
                  </button>

                  {/* Answer Content */}
                  {isOpen && (
                    <div
                      id={answerId}
                      role="region"
                      className="overflow-hidden transition-all duration-200"
                      data-testid={`faq-answer-${index}`}
                    >
                      <div className="px-4 pb-4 pt-2 text-bark/80 sm:px-6 sm:pb-6 sm:pt-3">
                        {item.answer}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default FAQAccordion;
