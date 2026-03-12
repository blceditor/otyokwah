/**
 * Architecture Consistency Tests
 *
 * Validates structural consistency across the Keystatic CMS:
 * - Collection format matches file extensions (.mdoc vs .yaml)
 * - Every schema component has a renderer registration
 * - No orphan content files outside known collections
 * - Slug uniqueness per collection
 * - Navigation references valid collections
 */
import { describe, test, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { collections } from "./collections";
import { sharedComponents } from "./collections/shared-components";

const CONTENT_DIR = path.resolve(__dirname, "../../content");
const RENDERER_PATH = path.resolve(
  __dirname,
  "../../components/content/MarkdocRenderer.tsx",
);

type CollectionEntry = {
  path: string;
  format?: { contentField?: string };
  schema: Record<string, unknown>;
};

describe("Architecture Consistency", () => {
  describe("collection format matches file extensions", () => {
    for (const [name, collection] of Object.entries(collections)) {
      const col = collection as unknown as CollectionEntry;
      const hasContentField = !!col.format?.contentField;
      const expectedExt = hasContentField ? ".mdoc" : ".yaml";

      test(`${name} collection uses ${expectedExt} files`, () => {
        // Extract directory from collection path (e.g., "content/pages/*" -> "content/pages")
        const colPath = col.path.replace("/*", "").replace(/\*$/, "");
        const dir = path.resolve(__dirname, "../..", colPath);
        if (!fs.existsSync(dir)) return;

        const files = fs.readdirSync(dir).filter((f) => !f.startsWith("."));
        const wrongExt = files.filter((f) => {
          const ext = path.extname(f);
          // Skip spec files
          if (f.includes(".spec.")) return false;
          return ext !== expectedExt;
        });

        if (wrongExt.length > 0) {
          throw new Error(
            `${name} collection expects ${expectedExt} but found: ${wrongExt.join(", ")}. ` +
              `Collection ${hasContentField ? "has" : "does not have"} contentField.`,
          );
        }
      });
    }
  });

  describe("component renderer completeness", () => {
    test("renderer file exists", () => {
      expect(fs.existsSync(RENDERER_PATH)).toBe(true);
    });

    test("every shared component USED in content has a Markdoc tag definition in the renderer", () => {
      const rendererSrc = fs.readFileSync(RENDERER_PATH, "utf-8");

      // Extract tag names from the renderer's config.tags object
      const tagsMatch = rendererSrc.match(
        /\btags:\s*\{([\s\S]*?)\n  \},?\n\}/,
      );
      expect(tagsMatch).not.toBeNull();

      const tagsBlock = tagsMatch![1];
      const rendererTags = new Set<string>();
      const tagRegex = /^\s{4}(\w+)\s*:\s*\{/gm;
      let m;
      while ((m = tagRegex.exec(tagsBlock)) !== null) {
        rendererTags.add(m[1]);
      }

      // Scan all .mdoc content to find which tags are actually used
      const pagesDir = path.resolve(__dirname, "../../content/pages");
      const usedTags = new Set<string>();
      const mdocTagRegex = /\{%\s+(\w+)/g;
      for (const file of fs.readdirSync(pagesDir).filter((f) => f.endsWith(".mdoc"))) {
        const content = fs.readFileSync(path.join(pagesDir, file), "utf-8");
        let tagMatch;
        while ((tagMatch = mdocTagRegex.exec(content)) !== null) {
          usedTags.add(tagMatch[1]);
        }
      }

      // Every shared component that is used in content must have a renderer tag
      const schemaNames = Object.keys(sharedComponents);
      const unregistered: string[] = [];

      for (const name of schemaNames) {
        if (usedTags.has(name) && !rendererTags.has(name)) {
          unregistered.push(name);
        }
      }

      if (unregistered.length > 0) {
        throw new Error(
          `Shared components used in content but missing Markdoc tag definition:\n  ${unregistered.join("\n  ")}\n` +
            `Add tag definitions to the 'tags' object in MarkdocRenderer.tsx config`,
        );
      }
    });

    test("every Markdoc tag definition has a React component in the components map", () => {
      const rendererSrc = fs.readFileSync(RENDERER_PATH, "utf-8");

      // Extract tag render names
      const renderNames = new Set<string>();
      const renderRegex = /render:\s*"(\w+)"/g;
      let m;
      while ((m = renderRegex.exec(rendererSrc)) !== null) {
        renderNames.add(m[1]);
      }

      // Extract component map keys
      const mapMatch = rendererSrc.match(
        /\/\/ Component map for rendering\nconst components\s*=\s*\{([\s\S]*?)\};/,
      );
      expect(mapMatch).not.toBeNull();

      const mapBlock = mapMatch![1];
      const componentNames = new Set<string>();
      const nameRegex = /^\s+(\w+)(?:\s*,|\s*:)/gm;
      while ((m = nameRegex.exec(mapBlock)) !== null) {
        componentNames.add(m[1]);
      }

      const missing: string[] = [];
      for (const name of renderNames) {
        if (!componentNames.has(name)) {
          missing.push(name);
        }
      }

      if (missing.length > 0) {
        throw new Error(
          `Markdoc tags render to components not in the components map:\n  ${missing.join("\n  ")}\n` +
            `Add these to the 'components' map in MarkdocRenderer.tsx`,
        );
      }
    });
  });

  describe("no orphan content files", () => {
    test("all content directories map to a collection", () => {
      const knownDirs = new Set<string>();
      for (const col of Object.values(collections)) {
        const colPath = (col as unknown as CollectionEntry).path
          .replace("/*", "")
          .replace(/\*$/, "");
        // Extract just the subdirectory name under content/
        const parts = colPath.split("/");
        const subDir = parts[parts.length - 1];
        knownDirs.add(subDir);
      }

      // Also add known non-collection dirs
      knownDirs.add("navigation"); // singleton
      knownDirs.add("homepage"); // singleton
      knownDirs.add("singletons"); // singleton

      if (!fs.existsSync(CONTENT_DIR)) return;

      const actualDirs = fs
        .readdirSync(CONTENT_DIR, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name);

      const orphans = actualDirs.filter((d) => !knownDirs.has(d));

      if (orphans.length > 0) {
        throw new Error(
          `Content directories not mapped to any collection: ${orphans.join(", ")}. ` +
            `Either add a collection or remove the directory.`,
        );
      }
    });
  });

  describe("slug uniqueness", () => {
    for (const [name] of Object.entries(collections)) {
      test(`${name} collection has unique slugs`, () => {
        const colPath = `content/${name === "pages" ? "pages" : name}`;
        const dir = path.resolve(__dirname, "../..", colPath);
        if (!fs.existsSync(dir)) return;

        const files = fs
          .readdirSync(dir)
          .filter((f) => f.endsWith(".mdoc") || f.endsWith(".yaml"))
          .filter((f) => !f.includes(".spec."));

        const slugs = files.map((f) => f.replace(/\.(mdoc|yaml)$/, ""));
        const seen = new Set<string>();
        const duplicates: string[] = [];

        for (const slug of slugs) {
          if (seen.has(slug)) {
            duplicates.push(slug);
          }
          seen.add(slug);
        }

        expect(duplicates).toEqual([]);
      });
    }
  });

  describe("config navigation references", () => {
    test("all collections in navigation UI are defined", () => {
      // Import config to check navigation
      const configPath = path.resolve(__dirname, "config.ts");
      const configSrc = fs.readFileSync(configPath, "utf-8");

      // Extract collection names from navigation config
      const navMatch = configSrc.match(
        /navigation:\s*\{([\s\S]*?)\}/,
      );
      if (!navMatch) return;

      const referencedCollections = new Set<string>();
      const refRegex = /"(\w+)"/g;
      let m;
      while ((m = refRegex.exec(navMatch[1])) !== null) {
        referencedCollections.add(m[1]);
      }

      const definedCollections = new Set(Object.keys(collections));
      // Singletons are also valid navigation entries
      const knownSingletons = new Set([
        "siteNavigation",
        "siteConfig",
      ]);

      const undefinedRefs: string[] = [];
      for (const ref of referencedCollections) {
        if (!definedCollections.has(ref) && !knownSingletons.has(ref)) {
          undefinedRefs.push(ref);
        }
      }

      if (undefinedRefs.length > 0) {
        throw new Error(
          `Navigation references undefined collections: ${undefinedRefs.join(", ")}`,
        );
      }
    });
  });
});
