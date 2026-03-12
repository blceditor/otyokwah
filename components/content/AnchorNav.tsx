/**
 * AnchorNav Component
 * REQ-U03-003: Sub-navigation for camp sessions page
 *
 * Displays anchor links to page sections. NOT sticky - scrolls with content.
 * Used within summer-camp-sessions page to navigate to each camp type.
 */

import React from 'react';

export interface AnchorNavItemData {
  id: string;
  label: string;
  grades?: string;
}

export interface AnchorNavProps {
  items: AnchorNavItemData[];
}

export function AnchorNav({ items }: AnchorNavProps): JSX.Element {
  if (!items || items.length === 0) {
    return <></>;
  }

  return (
    <nav
      className="bg-secondary py-4"
      aria-label="Page section navigation"
    >
      <div className="max-w-6xl mx-auto px-4">
        <ul className="list-none flex flex-wrap justify-center gap-4 md:gap-8">
          {items.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className="text-white hover:text-white/80 transition-colors font-medium text-sm md:text-base flex flex-col items-center"
              >
                <span>{item.label}</span>
                {item.grades && (
                  <span className="text-xs text-white/70">{item.grades}</span>
                )}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

export default AnchorNav;
