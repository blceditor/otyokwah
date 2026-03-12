'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionItem {
  question: string;
  answer: string;
}

interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
}

export function Accordion({ items, allowMultiple = false }: AccordionProps) {
  const [openIndexes, setOpenIndexes] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    if (allowMultiple) {
      setOpenIndexes((prev) =>
        prev.includes(index)
          ? prev.filter((i) => i !== index)
          : [...prev, index]
      );
    } else {
      setOpenIndexes((prev) =>
        prev.includes(index) ? [] : [index]
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleItem(index);
    }
  };

  return (
    <div className="space-y-4">
      {items.map((item, index) => {
        const isOpen = openIndexes.includes(index);
        const answerId = `accordion-answer-${index}`;

        return (
          <div
            key={index}
            className="rounded-lg border-2 border-secondary/20 bg-white hover:border-secondary/30 transition-colors"
            data-testid={`accordion-item-${index}`}
          >
            <button
              type="button"
              className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-cream sm:p-6"
              onClick={() => toggleItem(index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              aria-expanded={isOpen}
              aria-controls={answerId}
            >
              <span className="text-base font-semibold text-bark sm:text-lg">
                {item.question}
              </span>
              <ChevronDown
                aria-hidden="true"
                className={`h-5 w-5 flex-shrink-0 text-stone transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isOpen && (
              <div
                id={answerId}
                className="overflow-hidden transition-all duration-200"
                data-testid={`accordion-answer-${index}`}
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
  );
}

export default Accordion;
