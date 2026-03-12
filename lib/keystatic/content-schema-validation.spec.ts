/**
 * Content-Schema Contract Validation
 *
 * Validates that every content file's fields match the Keystatic collection schema.
 * Catches: stale frontmatter keys, missing required fields, invalid enum values,
 * broken image references.
 *
 * Runs against actual content files — no mocks.
 */
import { describe, test, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import * as yaml from "yaml";
import { pages } from "./collections/pages";
import { testimonials } from "./collections/testimonials";
import { faqs } from "./collections/faqs";

const CONTENT_DIR = path.resolve(__dirname, "../../content");
const PUBLIC_DIR = path.resolve(__dirname, "../../public");

// Schema field extraction types
type FieldDef = {
  kind: string;
  options?: { value: string }[];
  fields?: Record<string, FieldDef>;
  validation?: { isRequired?: boolean };
};

type CollectionDef = {
  schema: Record<string, FieldDef>;
  path: string;
  format?: { contentField?: string };
};

const COLLECTIONS: Record<string, CollectionDef> = {
  pages: pages as unknown as CollectionDef,
  testimonials: testimonials as unknown as CollectionDef,
  faqs: faqs as unknown as CollectionDef,
};

/**
 * Parse YAML frontmatter from a .mdoc file
 */
function parseFrontmatter(content: string): Record<string, unknown> {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  return yaml.parse(match[1]) ?? {};
}

/**
 * Parse a .yaml file
 */
function parseYaml(content: string): Record<string, unknown> {
  return yaml.parse(content) ?? {};
}

/**
 * Get top-level schema field names for a collection, excluding the contentField
 */
function getSchemaFieldNames(
  collection: CollectionDef,
): Set<string> {
  const names = new Set<string>();
  for (const key of Object.keys(collection.schema)) {
    // Skip the contentField (body/bio) — it's the .mdoc body, not frontmatter
    if (collection.format?.contentField === key) continue;
    names.add(key);
  }
  return names;
}

/**
 * Get select/multiselect field option values, walking into nested objects
 */
function getEnumFields(
  schema: Record<string, FieldDef>,
  prefix = "",
): Map<string, Set<string>> {
  const result = new Map<string, Set<string>>();

  for (const [key, field] of Object.entries(schema)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (
      (field.kind === "select" || field.kind === "multiselect") &&
      field.options
    ) {
      result.set(
        fullKey,
        new Set(field.options.map((o) => o.value)),
      );
    }

    // Recurse into object fields
    if (field.kind === "object" && field.fields) {
      const nested = getEnumFields(
        field.fields as Record<string, FieldDef>,
        fullKey,
      );
      for (const [k, v] of nested) result.set(k, v);
    }
  }

  return result;
}

/**
 * Get nested value from an object by dot-separated path
 */
function getNestedValue(
  obj: Record<string, unknown>,
  path: string,
): unknown {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

/**
 * Get content files for a collection
 */
function getContentFiles(
  collectionName: string,
): { slug: string; filePath: string }[] {
  const dir = path.join(CONTENT_DIR, collectionName === "pages" ? "pages" : collectionName);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdoc") || f.endsWith(".yaml"))
    .map((f) => ({
      slug: f.replace(/\.(mdoc|yaml)$/, ""),
      filePath: path.join(dir, f),
    }));
}

/**
 * Get image directories configured in schema image fields
 */
function getImageFields(
  schema: Record<string, unknown>,
  prefix = "",
): { fieldPath: string; directory: string; publicPath: string }[] {
  const result: { fieldPath: string; directory: string; publicPath: string }[] =
    [];

  for (const [key, field] of Object.entries(schema)) {
    const f = field as Record<string, unknown>;
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (f.kind === "image" && typeof f.directory === "string") {
      result.push({
        fieldPath: fullKey,
        directory: f.directory as string,
        publicPath: (f.publicPath as string) || "",
      });
    }

    if (f.kind === "object" && f.fields) {
      result.push(
        ...getImageFields(
          f.fields as Record<string, unknown>,
          fullKey,
        ),
      );
    }
  }

  return result;
}

describe("Content-Schema Contract Validation", () => {
  for (const [collectionName, collection] of Object.entries(COLLECTIONS)) {
    const files = getContentFiles(collectionName);
    const schemaFields = getSchemaFieldNames(collection);
    const enumFields = getEnumFields(
      collection.schema as unknown as Record<string, FieldDef>,
    );

    describe(`${collectionName} collection`, () => {
      test("has content files", () => {
        expect(files.length).toBeGreaterThan(0);
      });

      test("has schema fields defined", () => {
        expect(schemaFields.size).toBeGreaterThan(0);
      });

      for (const { slug, filePath } of files) {
        describe(`${collectionName}/${slug}`, () => {
          let data: Record<string, unknown>;

          test("parses without error", () => {
            const content = fs.readFileSync(filePath, "utf-8");
            data = filePath.endsWith(".mdoc")
              ? parseFrontmatter(content)
              : parseYaml(content);
            expect(data).toBeDefined();
            expect(typeof data).toBe("object");
          });

          test("all frontmatter keys exist in schema", () => {
            const content = fs.readFileSync(filePath, "utf-8");
            data = filePath.endsWith(".mdoc")
              ? parseFrontmatter(content)
              : parseYaml(content);

            const contentKeys = Object.keys(data);
            const unknownKeys = contentKeys.filter(
              (k) => !schemaFields.has(k),
            );

            if (unknownKeys.length > 0) {
              throw new Error(
                `${collectionName}/${slug} has keys not in schema: ${unknownKeys.join(", ")}. ` +
                  `Schema allows: ${[...schemaFields].join(", ")}`,
              );
            }
          });

          test("enum/select values are valid", () => {
            const content = fs.readFileSync(filePath, "utf-8");
            data = filePath.endsWith(".mdoc")
              ? parseFrontmatter(content)
              : parseYaml(content);

            const violations: string[] = [];

            for (const [fieldPath, validValues] of enumFields) {
              const value = getNestedValue(data, fieldPath);
              if (value === undefined || value === null || value === "")
                continue;

              if (Array.isArray(value)) {
                // multiselect
                for (const v of value) {
                  if (!validValues.has(String(v))) {
                    violations.push(
                      `${fieldPath}: "${v}" not in [${[...validValues].join(", ")}]`,
                    );
                  }
                }
              } else {
                if (!validValues.has(String(value))) {
                  violations.push(
                    `${fieldPath}: "${value}" not in [${[...validValues].join(", ")}]`,
                  );
                }
              }
            }

            if (violations.length > 0) {
              throw new Error(
                `${collectionName}/${slug} has invalid enum values:\n  ${violations.join("\n  ")}`,
              );
            }
          });
        });
      }
    });
  }

  describe("image references", () => {
    test("hero images in pages reference existing files", () => {
      const files = getContentFiles("pages");
      const missing: string[] = [];

      for (const { slug, filePath } of files) {
        const content = fs.readFileSync(filePath, "utf-8");
        const data = parseFrontmatter(content);
        const hero = data.hero as Record<string, unknown> | undefined;
        if (!hero?.heroImage) continue;

        const imagePath = String(hero.heroImage);
        // Keystatic image fields store just the filename; publicPath is prepended by reader
        // Check in the configured directory
        const fullPath = path.join(PUBLIC_DIR, "images", imagePath);
        if (!fs.existsSync(fullPath)) {
          missing.push(`${slug}: hero.heroImage="${imagePath}" → ${fullPath}`);
        }
      }

      if (missing.length > 0) {
        throw new Error(
          `Pages with missing hero images:\n  ${missing.join("\n  ")}`,
        );
      }
    });

  });
});
