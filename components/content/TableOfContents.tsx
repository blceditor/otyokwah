// REQ-201: Table of Contents Content Component
'use client';

import React, { useEffect, useState } from 'react';

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  selector?: string;
  maxDepth?: number;
  title?: string;
}

export function TableOfContents({
  selector = 'h2, h3',
  maxDepth = 3,
  title = 'Table of Contents'
}: TableOfContentsProps) {
  const [headings, setHeadings] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // Find all headings in the document
    const elements = document.querySelectorAll(selector);
    const items: TOCItem[] = [];

    elements.forEach((element) => {
      const heading = element as HTMLHeadingElement;
      const level = parseInt(heading.tagName.charAt(1));

      if (level <= maxDepth) {
        // Ensure heading has an ID
        if (!heading.id) {
          heading.id = heading.textContent
            ?.toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-') || `heading-${items.length}`;
        }

        items.push({
          id: heading.id,
          text: heading.textContent || '',
          level: level
        });
      }
    });

    setHeadings(items);
  }, [selector, maxDepth]);

  useEffect(() => {
    // Intersection observer to track active section
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '0px 0px -80% 0px',
        threshold: 0
      }
    );

    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      if (observer && typeof observer.unobserve === 'function') {
        headings.forEach(({ id }) => {
          const element = document.getElementById(id);
          if (element) {
            observer.unobserve(element);
          }
        });
      }
    };
  }, [headings]);

  if (headings.length === 0) {
    return null;
  }

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // Account for fixed header
      const top = element.offsetTop - offset;
      window.scrollTo({
        top,
        behavior: 'smooth'
      });
    }
  };

  return (
    <nav className="table-of-contents my-8 p-4 bg-cream rounded-lg" aria-label="Table of contents">
      <h3 className="font-semibold text-lg mb-4">{title}</h3>
      <ol className="space-y-2">
        {headings.map((heading) => (
          <li
            key={heading.id}
            style={{ paddingLeft: `${(heading.level - 2) * 1}rem` }}
          >
            <a
              href={`#${heading.id}`}
              onClick={(e) => {
                e.preventDefault();
                scrollToHeading(heading.id);
              }}
              className={`block py-1 hover:text-primary transition-colors ${
                activeId === heading.id
                  ? 'text-primary font-medium'
                  : 'text-bark/80'
              }`}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default TableOfContents;