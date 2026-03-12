"use client";

import { usePathname } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { SITE_URL } from "@/lib/site-url";

export function ProductionLink() {
  const pathname = usePathname() ?? "";

  // Extract slug from Keystatic path
  // Patterns: /keystatic/pages/SLUG or /keystatic/pages/nested/SLUG
  const extractSlug = (path: string) => {
    // Remove trailing slashes if present
    const cleanPath = path.replace(/\/+$/, "");

    // Extract everything after /keystatic/pages/
    const match = cleanPath.match(/\/keystatic\/pages\/(.+)/);
    if (!match) return "/";

    // Clean the slug: remove leading/trailing slashes
    const slug = match[1].replace(/^\/+|\/+$/g, "");

    // Handle special cases
    if (slug === "index" || slug === "home" || slug === "") {
      return "/";
    }

    // Return slug with leading slash
    return `/${slug}`;
  };

  const slug = pathname ? extractSlug(pathname) : "/";
  const origin =
    typeof window !== "undefined" ? window.location.origin : undefined;
  const baseUrl =
    origin && !origin.includes("localhost") ? origin : SITE_URL;
  const productionUrl = `${baseUrl}${slug}`;

  return (
    <a
      href={productionUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 text-sm hover:underline transition-colors"
      aria-label="View live page on production site"
    >
      View Live
      <ExternalLink size={14} />
    </a>
  );
}

export default ProductionLink;
