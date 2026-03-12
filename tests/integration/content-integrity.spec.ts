import { describe, test, expect } from "vitest";
import { readFileSync, existsSync, readdirSync } from "fs";

describe("REQ-CONTENT-REGRESS-001: Fullbleed pages have hero images", () => {
  const fullbleedPages = [
    "summer-camp",
    "summer-staff",
    "summer-camp-sessions",
    "summer-staff-landing",
    "about",
    "retreats",
    "retreats-defrost",
    "rentals",
    "work-at-camp",
    "work-at-camp-summer-staff",
    "work-at-camp-leaders-in-training",
  ];

  for (const slug of fullbleedPages) {
    const filePath = `content/pages/${slug}.mdoc`;
    if (!existsSync(filePath)) continue;

    test(`${slug} has heroImage in frontmatter`, () => {
      const content = readFileSync(filePath, "utf-8");
      expect(content).toMatch(/heroImage:\s+\S+/);
    });
  }
});

describe("REQ-CONTENT-REGRESS-002: Image gridSquares have image prop", () => {
  const pagesWithGridImages = ["summer-camp", "summer-staff", "retreats"];

  for (const slug of pagesWithGridImages) {
    const filePath = `content/pages/${slug}.mdoc`;
    if (!existsSync(filePath)) continue;

    test(`${slug} gridSquare image components have image= prop`, () => {
      const content = readFileSync(filePath, "utf-8");
      const imageGridSquares =
        content.match(/gridSquare[\s\S]*?contentType="image"[\s\S]*?\/%\}/g) ||
        [];
      for (const block of imageGridSquares) {
        expect(block, `gridSquare missing image= prop in ${slug}`).toMatch(
          /image="/,
        );
      }
    });
  }
});

describe("REQ-CONTENT-REGRESS-003: Referenced images exist", () => {
  test("all hero images referenced in .mdoc files exist in public/images/", () => {
    const pages = readdirSync("content/pages")
      .filter((f) => f.endsWith(".mdoc"))
      .map((f) => `content/pages/${f}`);
    for (const pagePath of pages) {
      const content = readFileSync(pagePath, "utf-8");
      const heroMatch = content.match(/heroImage:\s+(\S+)/);
      if (
        heroMatch &&
        heroMatch[1] &&
        heroMatch[1] !== "''" &&
        /\.\w+$/.test(heroMatch[1])
      ) {
        const imgPath = `public/images/${heroMatch[1]}`;
        expect(
          existsSync(imgPath),
          `${pagePath} references missing hero: ${imgPath}`,
        ).toBe(true);
      }
    }
  });

  test("all gridSquare image= paths exist in public/", () => {
    const pages = readdirSync("content/pages")
      .filter((f) => f.endsWith(".mdoc"))
      .map((f) => `content/pages/${f}`);
    for (const pagePath of pages) {
      const content = readFileSync(pagePath, "utf-8");
      const imageRefs = content.matchAll(/image="(\/images\/[^"]+)"/g);
      for (const match of imageRefs) {
        const imgPath = `public${match[1]}`;
        expect(
          existsSync(imgPath),
          `${pagePath} references missing: ${imgPath}`,
        ).toBe(true);
      }
    }
  });
});

describe("REQ-CONTENT-REGRESS-004: Summer-staff FAQ section", () => {
  test("summer-staff.mdoc contains faqAccordion with faqItems", () => {
    const content = readFileSync("content/pages/summer-staff.mdoc", "utf-8");
    expect(content).toMatch(/faqAccordion/);
    expect(content).toMatch(/faqItem/);
    const faqCount = (content.match(/faqItem/g) || []).length;
    expect(faqCount).toBeGreaterThanOrEqual(3);
  });
});

describe("REQ-CONTENT-REGRESS-005: FAQ accordions have title attribute", () => {
  const pagesWithFaq = ["summer-staff", "summer-camp-faq", "work-at-camp-leaders-in-training"];

  for (const slug of pagesWithFaq) {
    test(`${slug}.mdoc faqAccordion has title= attribute`, () => {
      const content = readFileSync(`content/pages/${slug}.mdoc`, "utf-8");
      const faqTag = content.match(/faqAccordion[^%]*/);
      expect(faqTag, `${slug} missing faqAccordion`).toBeTruthy();
      expect(faqTag![0]).toMatch(/title="/);
    });
  }
});
