"use client";

/**
 * DropdownMenu Component
 * REQ-307: Dropdown Menus (Desktop) - hover/click, fade-in animation, keyboard accessible
 */

import Link from "next/link";
import type { DropdownMenuProps } from "./types";

export default function DropdownMenu({
  items,
  isOpen,
  onClose,
}: DropdownMenuProps) {
  if (!isOpen) return null;

  return (
    <div
      className="absolute top-full left-0 mt-1 min-w-[200px] bg-secondary-light rounded-md shadow-lg py-2 z-dropdown animate-fade-in text-sm"
      role="menu"
      aria-orientation="vertical"
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="block px-4 py-2 text-cream hover:bg-secondary hover:text-white transition-colors focus-visible:outline-none focus-visible:bg-secondary focus-visible:text-white focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white"
          onClick={onClose}
          target={item.external ? "_blank" : undefined}
          rel={item.external ? "noopener noreferrer" : undefined}
        >
          {item.label}
          {item.external && (
            <span className="ml-1 text-xs" aria-hidden="true">
              ↗
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}
