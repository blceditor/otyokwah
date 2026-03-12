/**
 * CMS-to-Site Pipeline Validation
 *
 * Validates the data pipeline from content files through to rendering:
 * - Navigation links resolve to existing pages
 * - Markdoc content transforms without errors
 * - All pages have required frontmatter structure
 */
import { describe, test, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import * as yaml from "yaml";
import Markdoc from "@markdoc/markdoc";
import { sharedComponents } from "./collections/shared-components";

const CONTENT_DIR = path.resolve(__dirname, "../../content");
const PAGES_DIR = path.join(CONTENT_DIR, "pages");
const NAV_FILE = path.join(CONTENT_DIR, "navigation", "navigation.yaml");

/**
 * Get all page slugs from content/pages/
 */
function getPageSlugs(): Set<string> {
  return new Set(
    fs
      .readdirSync(PAGES_DIR)
      .filter((f) => f.endsWith(".mdoc"))
      .map((f) => f.replace(".mdoc", "")),
  );
}

/**
 * Extract all hrefs from navigation.yaml (flattened, including children)
 */
function getNavigationHrefs(): { label: string; href: string }[] {
  if (!fs.existsSync(NAV_FILE)) return [];

  const content = fs.readFileSync(NAV_FILE, "utf-8");
  const nav = yaml.parse(content) as {
    menuItems?: { label: string; href: string; children?: { label: string; href: string; external?: boolean }[] }[];
    primaryCTA?: { label: string; href: string; external?: boolean };
  };

  const hrefs: { label: string; href: string }[] = [];

  for (const item of nav.menuItems ?? []) {
    hrefs.push({ label: item.label, href: item.href });
    for (const child of item.children ?? []) {
      if (!child.external) {
        hrefs.push({ label: child.label, href: child.href });
      }
    }
  }

  return hrefs;
}

/**
 * Parse Markdoc body from a .mdoc file (everything after frontmatter)
 */
function getMarkdocBody(filePath: string): string {
  const content = fs.readFileSync(filePath, "utf-8");
  const match = content.match(/^---\n[\s\S]*?\n---\n?([\s\S]*)$/);
  return match ? match[1] : content;
}

/**
 * Build Markdoc tag schema from shared components AND page-specific components.
 * Extracts all tag names from the renderer config and from Keystatic schema,
 * creating permissive schemas so validate does not flag known tags.
 */
function buildMarkdocConfig(): Record<string, Markdoc.Schema> {
  const tags: Record<string, Markdoc.Schema> = {};

  // Include shared components
  for (const [name, component] of Object.entries(sharedComponents)) {
    const comp = component as { schema?: Record<string, unknown>; selfClosing?: boolean };
    const attributes: Record<string, Markdoc.SchemaAttribute> = {};

    if (comp.schema) {
      for (const attrName of Object.keys(comp.schema)) {
        attributes[attrName] = { type: String, required: false };
      }
    }

    tags[name] = {
      render: name.charAt(0).toUpperCase() + name.slice(1),
      attributes,
      selfClosing: comp.selfClosing ?? false,
    };
  }

  // Include page-specific tags from the renderer Markdoc config
  // (squareGrid, gridSquare, ctaButton, imageSection, table, etc.)
  const rendererPath = path.resolve(
    __dirname,
    "../../components/content/MarkdocRenderer.tsx",
  );
  const rendererSrc = fs.readFileSync(rendererPath, "utf-8");
  const tagRegex = /^\s{4}(\w+)\s*:\s*\{/gm;
  let m;
  while ((m = tagRegex.exec(rendererSrc)) !== null) {
    const tagName = m[1];
    if (!tags[tagName]) {
      tags[tagName] = {
        render: tagName.charAt(0).toUpperCase() + tagName.slice(1),
        attributes: {},
      };
    }
  }

  return tags;
}

describe("CMS Pipeline Validation", () => {
  describe("navigation links resolve to pages", () => {
    const pageSlugs = getPageSlugs();
    const navHrefs = getNavigationHrefs();

    test("navigation file exists", () => {
      expect(fs.existsSync(NAV_FILE)).toBe(true);
    });

    test("navigation has menu items", () => {
      expect(navHrefs.length).toBeGreaterThan(0);
    });

    test("all internal navigation links point to existing pages", () => {
      const broken: string[] = [];

      for (const { label, href } of navHrefs) {
        // Internal links start with /
        if (!href.startsWith("/")) continue;

        // Convert href to slug: "/about-core-values" -> "about-core-values"
        const slug = href.replace(/^\//, "");
        if (slug === "") continue; // skip root

        // Check if index page exists for root
        if (slug === "" && pageSlugs.has("index")) continue;

        if (!pageSlugs.has(slug)) {
          broken.push(`"${label}" -> ${href} (no ${slug}.mdoc)`);
        }
      }

      if (broken.length > 0) {
        throw new Error(
          `Navigation links to non-existent pages:\n  ${broken.join("\n  ")}`,
        );
      }
    });
  });

  describe("Markdoc content transforms without errors", () => {
    const pageFiles = fs
      .readdirSync(PAGES_DIR)
      .filter((f) => f.endsWith(".mdoc"))
      .filter((f) => !f.includes(".spec."));

    const markdocConfig = buildMarkdocConfig();

    test("should have page files to validate", () => {
      expect(pageFiles.length).toBeGreaterThan(10);
    });

    for (const file of pageFiles) {
      const slug = file.replace(".mdoc", "");

      test(`${slug}: Markdoc parses without syntax errors`, () => {
        const body = getMarkdocBody(path.join(PAGES_DIR, file));
        if (!body.trim()) return; // Empty body is OK

        const ast = Markdoc.parse(body);
        // Check for parse-level errors (malformed syntax)
        const errors = ast.children.filter(
          (node) => node.type === "error",
        );

        if (errors.length > 0) {
          throw new Error(
            `${slug}: Markdoc parse errors: ${errors.map((e) => JSON.stringify(e)).join(", ")}`,
          );
        }
      });

      test(`${slug}: Markdoc validates without schema errors`, () => {
        const body = getMarkdocBody(path.join(PAGES_DIR, file));
        if (!body.trim()) return;

        const ast = Markdoc.parse(body);
        const errors = Markdoc.validate(ast, { tags: markdocConfig });

        // Filter to only real errors (not warnings about unknown tags from page-specific components)
        const realErrors = errors.filter((e) => e.error.level === "critical");

        if (realErrors.length > 0) {
          const errorMessages = realErrors
            .slice(0, 5) // Limit output
            .map(
              (e) =>
                `Line ${e.lines?.[0] ?? "?"}: ${e.error.message}`,
            );
          throw new Error(
            `${slug}: Markdoc validation errors:\n  ${errorMessages.join("\n  ")}`,
          );
        }
      });
    }
  });

  describe("page frontmatter structure", () => {
    const pageFiles = fs
      .readdirSync(PAGES_DIR)
      .filter((f) => f.endsWith(".mdoc"))
      .filter((f) => !f.includes(".spec."));

    for (const file of pageFiles) {
      const slug = file.replace(".mdoc", "");

      test(`${slug}: has required frontmatter fields`, () => {
        const content = fs.readFileSync(
          path.join(PAGES_DIR, file),
          "utf-8",
        );
        const match = content.match(/^---\n([\s\S]*?)\n---/);
        expect(match).not.toBeNull();

        const frontmatter = yaml.parse(match![1]);

        // All pages must have title
        expect(frontmatter).toHaveProperty("title");
        expect(typeof frontmatter.title).toBe("string");
        expect(frontmatter.title.length).toBeGreaterThan(0);
      });
    }
  });
});
