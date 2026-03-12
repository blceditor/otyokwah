/**
 * CMS Component Validation Smoke Test
 *
 * Validates that every Markdoc component tag used in content pages
 * has a corresponding definition in the Keystatic schema, and that
 * every attribute used on those tags is allowed by the schema.
 * This prevents "Missing component definition" and "Key not allowed" errors.
 */
import { describe, test, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { sharedComponents } from "./collections/shared-components";

const CONTENT_DIR = path.resolve(__dirname, "../../content/pages");

function getContentFiles(): string[] {
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".mdoc"))
    .map((f) => path.join(CONTENT_DIR, f));
}

function extractComponentTags(content: string): string[] {
  const tagRegex = /\{%\s+(\w+)/g;
  const tags = new Set<string>();
  let match;
  while ((match = tagRegex.exec(content)) !== null) {
    tags.add(match[1]);
  }
  return Array.from(tags);
}

/**
 * Extract component tags with their top-level attributes from Markdoc content.
 * Only extracts attributes at the Markdoc tag level — ignores content inside
 * quoted strings and array literals to avoid false positives from URL params.
 */
function extractComponentAttributes(
  content: string,
): Map<string, Set<string>> {
  const result = new Map<string, Set<string>>();

  const tagBlockRegex = /\{%\s+(\w+)([\s\S]*?)(?:\/%\}|%\})/g;
  let match;
  while ((match = tagBlockRegex.exec(content)) !== null) {
    const tagName = match[1];
    const attrBlock = match[2];

    if (!result.has(tagName)) {
      result.set(tagName, new Set());
    }
    const attrs = result.get(tagName)!;

    // Strip quoted strings and array literals to avoid matching keys inside values
    const stripped = attrBlock
      .replace(/"[^"]*"/g, '""')
      .replace(/'[^']*'/g, "''")
      .replace(/\[[^\]]*\]/g, "[]");

    const attrRegex = /\b(\w+)\s*=/g;
    let attrMatch;
    while ((attrMatch = attrRegex.exec(stripped)) !== null) {
      attrs.add(attrMatch[1]);
    }
  }

  return result;
}

/**
 * Get all component names defined in the Keystatic schema.
 * Uses the actual imported sharedComponents plus page-specific components parsed from pages.ts.
 */
function getKeystatiComponentNames(): Set<string> {
  const names = new Set<string>(Object.keys(sharedComponents));

  // Also extract page-specific component keys from pages.ts
  const pagesPath = path.resolve(__dirname, "collections/pages.ts");
  const pagesSrc = fs.readFileSync(pagesPath, "utf-8");
  const componentsBlock = pagesSrc.match(
    /components:\s*\{[\s\S]*?\.\.\.sharedComponents,\s*([\s\S]*?)\n\s{6}\},\s*\n\s{4}\}\)/,
  );
  if (componentsBlock) {
    const keyRegex = /^\s{8}(\w+)\s*:\s*(?:\{|ctaButtonComponentWithColor)/gm;
    let m;
    while ((m = keyRegex.exec(componentsBlock[1])) !== null) {
      names.add(m[1]);
    }
  }

  return names;
}

/**
 * Get the set of allowed schema field names for each shared component.
 * Uses the actual imported sharedComponents object.
 */
function getComponentSchemaFields(): Map<string, Set<string>> {
  const result = new Map<string, Set<string>>();

  for (const [name, component] of Object.entries(sharedComponents)) {
    const comp = component as { schema?: Record<string, unknown> };
    if (comp.schema) {
      result.set(name, new Set(Object.keys(comp.schema)));
    }
  }

  // Also extract page-specific component schemas from pages.ts
  const pagesPath = path.resolve(__dirname, "collections/pages.ts");
  const pagesSrc = fs.readFileSync(pagesPath, "utf-8");
  const componentsBlock = pagesSrc.match(
    /components:\s*\{[\s\S]*?\.\.\.sharedComponents,\s*([\s\S]*?)\n\s{6}\},\s*\n\s{4}\}\)/,
  );
  if (componentsBlock) {
    // For inline page components, extract schema field names via regex
    const inlineRegex =
      /^\s{8}(\w+)\s*:\s*\{[\s\S]*?schema:\s*\{([\s\S]*?)\n\s{10}\}/gm;
    let m;
    while ((m = inlineRegex.exec(componentsBlock[1])) !== null) {
      const fieldNames = new Set<string>();
      const fieldRegex = /^\s+(\w+)\s*:/gm;
      let fm;
      while ((fm = fieldRegex.exec(m[2])) !== null) {
        fieldNames.add(fm[1]);
      }
      if (fieldNames.size > 0) {
        result.set(m[1], fieldNames);
      }
    }
  }

  return result;
}

describe("CMS Component Validation", () => {
  const definedComponents = getKeystatiComponentNames();
  const contentFiles = getContentFiles();
  const componentSchemas = getComponentSchemaFields();

  test("should have discovered Keystatic component definitions", () => {
    expect(definedComponents.size).toBeGreaterThan(20);
  });

  test("should have content files to validate", () => {
    expect(contentFiles.length).toBeGreaterThan(10);
  });

  test("should have discovered component schemas with fields", () => {
    expect(componentSchemas.size).toBeGreaterThan(10);
  });

  for (const filePath of contentFiles) {
    const slug = path.basename(filePath, ".mdoc");

    test(`${slug}: all component tags have Keystatic definitions`, () => {
      const content = fs.readFileSync(filePath, "utf-8");
      const usedTags = extractComponentTags(content);
      if (usedTags.length === 0) return;

      const missing = usedTags.filter((tag) => !definedComponents.has(tag));
      if (missing.length > 0) {
        throw new Error(
          `Page "${slug}" uses component tags missing from Keystatic schema: ${missing.join(", ")}. ` +
            `Add definitions to shared-components.ts or pages.ts.`,
        );
      }
    });

    test(`${slug}: all component attributes are allowed by schema`, () => {
      const content = fs.readFileSync(filePath, "utf-8");
      const tagAttrs = extractComponentAttributes(content);
      const violations: string[] = [];

      for (const [tagName, usedAttrs] of tagAttrs) {
        const schemaFields = componentSchemas.get(tagName);
        if (!schemaFields) continue;

        for (const attr of usedAttrs) {
          if (!schemaFields.has(attr)) {
            violations.push(`${tagName}.${attr}`);
          }
        }
      }

      if (violations.length > 0) {
        throw new Error(
          `Page "${slug}" uses attributes not defined in Keystatic schema: ${violations.join(", ")}. ` +
            `Add field definitions to the component schema in shared-components.ts or pages.ts.`,
        );
      }
    });
  }

  test("summary: all pages pass component and attribute validation", () => {
    const allMissing: Record<string, string[]> = {};
    const allBadAttrs: Record<string, string[]> = {};

    for (const filePath of contentFiles) {
      const slug = path.basename(filePath, ".mdoc");
      const content = fs.readFileSync(filePath, "utf-8");

      const usedTags = extractComponentTags(content);
      const missing = usedTags.filter((tag) => !definedComponents.has(tag));
      if (missing.length > 0) allMissing[slug] = missing;

      const tagAttrs = extractComponentAttributes(content);
      const violations: string[] = [];
      for (const [tagName, usedAttrs] of tagAttrs) {
        const schemaFields = componentSchemas.get(tagName);
        if (!schemaFields) continue;
        for (const attr of usedAttrs) {
          if (!schemaFields.has(attr)) violations.push(`${tagName}.${attr}`);
        }
      }
      if (violations.length > 0) allBadAttrs[slug] = violations;
    }

    const errors: string[] = [];
    if (Object.keys(allMissing).length > 0) {
      const report = Object.entries(allMissing)
        .map(([slug, tags]) => `  ${slug}: ${tags.join(", ")}`)
        .join("\n");
      errors.push(`Missing component definitions:\n${report}`);
    }
    if (Object.keys(allBadAttrs).length > 0) {
      const report = Object.entries(allBadAttrs)
        .map(([slug, attrs]) => `  ${slug}: ${attrs.join(", ")}`)
        .join("\n");
      errors.push(`Disallowed attributes:\n${report}`);
    }

    if (errors.length > 0) {
      throw new Error(errors.join("\n\n"));
    }
  });
});
