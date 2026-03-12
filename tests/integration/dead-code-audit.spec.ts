/**
 * Dead Code Audit
 *
 * Detects orphaned files, unused exports, and stale content.
 * Uses static import analysis — no running server needed.
 *
 * Known gaps are documented with ceiling counts — the test passes as long as
 * gaps don't increase. When dead code is cleaned up, reduce the ceilings.
 *
 * ~1 SP
 */
import { describe, test, expect } from "vitest";
import { readFileSync, readdirSync, existsSync, statSync } from "fs";
import { join, resolve, extname } from "path";

const ROOT = process.cwd();

/**
 * Recursively collect all source files (.ts, .tsx) under a directory.
 */
function collectSourceFiles(dir: string): string[] {
  const results: string[] = [];
  if (!existsSync(dir)) return results;

  const entries = readdirSync(dir);
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    if (entry.startsWith(".") || entry === "node_modules") continue;

    if (statSync(fullPath).isDirectory()) {
      results.push(...collectSourceFiles(fullPath));
    } else if (/\.(ts|tsx)$/.test(entry) && !entry.includes(".spec.") && !entry.includes(".test.")) {
      results.push(fullPath);
    }
  }

  return results;
}

/**
 * Check if any file outside a directory imports from it.
 */
function hasExternalImports(
  dirRelative: string,
  allSourceFiles: string[],
): string[] {
  const dirAbsolute = resolve(ROOT, dirRelative);
  const importers: string[] = [];

  for (const file of allSourceFiles) {
    if (file.startsWith(dirAbsolute)) continue;
    if (file.includes(".spec.") || file.includes(".test.")) continue;

    const source = readFileSync(file, "utf-8");

    if (
      source.includes(`from '${dirRelative}`) ||
      source.includes(`from "${dirRelative}`) ||
      source.includes(`from './${dirRelative}`) ||
      source.includes(`from "./${dirRelative}`) ||
      source.includes(`from '@/${dirRelative}`) ||
      source.includes(`from "@/${dirRelative}`) ||
      source.includes(`require('${dirRelative}`) ||
      source.includes(`require("${dirRelative}`) ||
      source.includes(`require('./${dirRelative}`) ||
      source.includes(`require("./${dirRelative}`)
    ) {
      importers.push(file);
    }
  }

  return importers;
}

/**
 * Check if an exported function/const is imported anywhere.
 */
function isExportUsed(
  exportName: string,
  sourceFile: string,
  allSourceFiles: string[],
): boolean {
  for (const file of allSourceFiles) {
    if (file === sourceFile) continue;

    const source = readFileSync(file, "utf-8");

    if (
      source.includes(exportName) &&
      (source.includes(`import`) || source.includes(`require`))
    ) {
      return true;
    }
  }
  return false;
}

describe("Dead Code Audit", () => {
  const productionFiles = [
    ...collectSourceFiles(join(ROOT, "app")),
    ...collectSourceFiles(join(ROOT, "components")),
    ...collectSourceFiles(join(ROOT, "lib")),
  ];

  describe("orphaned component directories", () => {
    test("check suspect directories for external imports", () => {
      const SUSPECT_DIRS = [
        { path: "components/markdoc", reason: "Old Markdoc components replaced by content/" },
      ];

      const orphans: string[] = [];
      for (const { path: dirPath } of SUSPECT_DIRS) {
        if (!existsSync(join(ROOT, dirPath))) continue;
        const importers = hasExternalImports(dirPath, productionFiles);
        if (importers.length === 0) {
          orphans.push(dirPath);
        }
      }

      // Known orphan count — reduce when directories are cleaned up
      const KNOWN_ORPHAN_COUNT = 1;
      expect(
        orphans.length,
        `Orphaned directories changed. Current: ${orphans.join(", ")}`,
      ).toBeLessThanOrEqual(KNOWN_ORPHAN_COUNT);

      if (orphans.length > 0) {
        console.warn(`Dead Code: orphaned directories: ${orphans.join(", ")}`);
      }
    });
  });

  describe("key utility exports are used", () => {
    const UTILITY_FILES = [
      {
        file: "lib/templates/shared.ts",
        exports: ["getHeroHeight", "getTemplateConfig"],
      },
      {
        file: "lib/security/validate-slug.ts",
        exports: ["validateSlug", "sanitizeSlug"],
      },
    ];

    test("tracked utility exports are imported somewhere", () => {
      const unusedExports: string[] = [];

      for (const { file, exports: exportNames } of UTILITY_FILES) {
        const fullPath = join(ROOT, file);
        if (!existsSync(fullPath)) continue;

        const source = readFileSync(fullPath, "utf-8");

        for (const exportName of exportNames) {
          if (!source.includes(exportName)) continue;

          const used = isExportUsed(exportName, fullPath, productionFiles);
          if (!used) {
            unusedExports.push(`${file}:${exportName}`);
          }
        }
      }

      // Known unused exports — reduce when cleaned up
      const KNOWN_UNUSED_COUNT = 2;
      expect(
        unusedExports.length,
        `Unused exports changed. Current: ${unusedExports.join(", ")}`,
      ).toBeLessThanOrEqual(KNOWN_UNUSED_COUNT);

      if (unusedExports.length > 0) {
        console.warn(`Dead Code: unused exports: ${unusedExports.join(", ")}`);
      }
    });
  });

  describe("stale content files", () => {
    test("stale content count does not increase", () => {
      const staleFiles: string[] = [];

      function findStaleFiles(dir: string) {
        if (!existsSync(dir)) return;
        const entries = readdirSync(dir);
        for (const entry of entries) {
          const fullPath = join(dir, entry);
          if (statSync(fullPath).isDirectory()) {
            findStaleFiles(fullPath);
          } else if (entry.endsWith(".bak") || extname(entry) === ".mdx") {
            staleFiles.push(fullPath.replace(ROOT + "/", ""));
          }
        }
      }

      findStaleFiles(join(ROOT, "content"));

      // Known stale file count — reduce when files are cleaned up
      const KNOWN_STALE_COUNT = 3; // 1 .bak + 2 .mdx
      expect(
        staleFiles.length,
        `Stale content files changed. Current: ${staleFiles.join(", ")}. ` +
          `Delete .bak files and convert .mdx to .mdoc.`,
      ).toBeLessThanOrEqual(KNOWN_STALE_COUNT);

      if (staleFiles.length > 0) {
        console.warn(`Dead Code: stale content files: ${staleFiles.join(", ")}`);
      }
    });
  });

  describe("no test/dev pages in production app directory", () => {
    test("no test pages in app directory", () => {
      const appDir = join(ROOT, "app");
      const testPagePatterns = [
        /testing-/,
        /test-page/,
        /debug\//,
        /dev-only/,
      ];

      const suspectPages: string[] = [];

      function findTestPages(dir: string) {
        if (!existsSync(dir)) return;
        const entries = readdirSync(dir);
        for (const entry of entries) {
          const fullPath = join(dir, entry);
          if (entry === "node_modules" || entry.startsWith(".")) continue;

          if (statSync(fullPath).isDirectory()) {
            const relativePath = fullPath.replace(ROOT + "/", "");
            for (const pattern of testPagePatterns) {
              if (pattern.test(relativePath)) {
                suspectPages.push(relativePath);
              }
            }
            findTestPages(fullPath);
          }
        }
      }

      findTestPages(appDir);
      expect(suspectPages).toEqual([]);
    });
  });

  describe("homepage component usage", () => {
    test("unused homepage components do not increase", () => {
      const HOMEPAGE_DIR = join(ROOT, "components/homepage");
      if (!existsSync(HOMEPAGE_DIR)) return;

      const homepageComponents = readdirSync(HOMEPAGE_DIR)
        .filter(
          (f) =>
            f.endsWith(".tsx") &&
            !f.includes(".spec.") &&
            !f.includes(".test."),
        );

      const unusedComponents: string[] = [];

      for (const component of homepageComponents) {
        const componentName = component.replace(".tsx", "");
        const importers = productionFiles.filter((file) => {
          if (file.includes("components/homepage/")) return false;
          const source = readFileSync(file, "utf-8");
          return source.includes(componentName);
        });

        if (importers.length === 0) {
          unusedComponents.push(component);
        }
      }

      // Known unused homepage components — reduce when cleaned up
      const KNOWN_UNUSED_HOMEPAGE = 2;
      expect(
        unusedComponents.length,
        `Unused homepage components changed. Current: ${unusedComponents.join(", ")}`,
      ).toBeLessThanOrEqual(KNOWN_UNUSED_HOMEPAGE);

      if (unusedComponents.length > 0) {
        console.warn(
          `Dead Code: unused homepage components: ${unusedComponents.join(", ")}`,
        );
      }
    });
  });
});
