"use client";

/**
 * Logo Component
 * Left-aligned logo in header with hanging effect
 * REQ-WEB-002: Logo 2X Larger + Hanging Effect + Scroll Behavior
 */

import Link from "next/link";
import Image from "next/image";
import type { LogoProps } from "./types";

export default function Logo({
  src,
  alt,
  href,
  isScrolled = false,
}: LogoProps) {
  return (
    <Link
      href={href}
      className="relative flex-shrink-0 z-50 -mb-8 lg:-mb-12"
      aria-label="Go to homepage"
    >
      <Image
        src={src}
        alt={alt}
        width={isScrolled ? 120 : 160}
        height={isScrolled ? 61 : 82}
        className={`h-auto transition-all duration-300 ${
          isScrolled ? "w-[100px] lg:w-[120px]" : "w-[120px] lg:w-[160px]"
        }`}
        priority
      />
    </Link>
  );
}
