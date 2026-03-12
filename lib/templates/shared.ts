/**
 * Shared template utilities
 * P2-01: Extract parseContentSections (was duplicated in 4 files)
 * P2-02: Extract getSectionBackground (was duplicated in 4 files)
 */

export interface ContentSection {
  heading: string;
  content: string;
}

/**
 * Parse markdown content into sections split by ## headings.
 * Skips h1 headings (already rendered as page title).
 */
export function parseContentSections(content: string): ContentSection[] {
  const sections: ContentSection[] = [];
  const lines = content.split("\n");

  let currentHeading = "";
  let currentContent: string[] = [];

  for (const line of lines) {
    if (line.startsWith("## ")) {
      if (currentHeading || currentContent.length > 0) {
        sections.push({
          heading: currentHeading,
          content: currentContent.join("\n").trim(),
        });
      }
      currentHeading = line.replace(/^## /, "").trim();
      currentContent = [];
    } else if (line.startsWith("# ")) {
      continue;
    } else {
      currentContent.push(line);
    }
  }

  if (currentHeading || currentContent.length > 0) {
    sections.push({
      heading: currentHeading,
      content: currentContent.join("\n").trim(),
    });
  }

  return sections.filter((s) => s.heading || s.content);
}

const SECTION_COLORS = ["bg-white", "bg-cream", "bg-white", "bg-cream"];

/**
 * Map hero height setting to CSS classes.
 * P2-03: Extracted from [slug]/page.tsx for reuse.
 */
const HERO_HEIGHT_CLASSES: Record<string, string> = {
  none: "h-0",
  standard: "h-[480px]",
  medium: "h-[576px]",
  tall: "h-[672px]",
  xtall: "h-[768px]",
  full: "h-screen min-h-[600px]",
};

export function getHeroHeightClass(heroHeight?: string): string {
  return HERO_HEIGHT_CLASSES[heroHeight || "standard"] || "h-96";
}

export interface SectionBackgroundOptions {
  textured?: boolean;
  headingOverrides?: Record<string, string>;
}

/**
 * Get alternating background color for a content section.
 *
 * @param index - Section index for alternating colors
 * @param heading - Optional heading text for keyword-based overrides
 * @param options - Optional config: textured backgrounds, heading keyword overrides
 */
export function getSectionBackground(
  index: number,
  heading?: string,
  options?: SectionBackgroundOptions,
): string {
  if (heading && options?.headingOverrides) {
    const lowerHeading = heading.toLowerCase();
    for (const [keyword, bg] of Object.entries(options.headingOverrides)) {
      if (lowerHeading.includes(keyword)) {
        return bg;
      }
    }
  }

  const base = SECTION_COLORS[index % SECTION_COLORS.length];
  return options?.textured ? `${base} bg-textured` : base;
}
