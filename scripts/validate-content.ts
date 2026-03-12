/**
 * Content Validation Script
 *
 * Validates content files (pages, testimonials, FAQs, navigation) for:
 * - Valid YAML frontmatter
 * - Required fields present
 * - Markdoc tags match registered components
 * - No broken component references
 *
 * Usage: npx tsx scripts/validate-content.ts [--changed-only <file1> <file2> ...]
 *
 * Exit code 0 = all valid, 1 = errors found
 */

import * as fs from "fs";
import * as path from "path";
import * as yaml from "yaml";

const CONTENT_DIR = path.join(process.cwd(), "content");

// Registered Markdoc tags — must match MarkdocRenderer.tsx config.tags keys
const VALID_MARKDOC_TAGS = new Set([
  "contentCard",
  "sessionCard",
  "sectionCard",
  "cardGrid",
  "donateButton",
  "ctaSection",
  "cta",
  "youtube",
  "faqAccordion",
  "faqItem",
  "features",
  "gallery",
  "testimonial",
  "accordion",
  "image",
  "infoCard",
  "section",
  "contentBox",
  "twoColumn",
  "stats",
  "valueCards",
  "positionCards",
  "imageSection",
  "gridSquare",
  "squareGrid",
  "inlineSessionCard",
  "sessionCardGroup",
  "anchorNav",
  "campSessionCard",
  "campSessionCardGrid",
  "wideCard",
  "workAtCampSection",
  "trustBarMarkdoc",
  "trustBarItem",
  "missionSection",
  "testimonialWidget",
  "documentLink",
  "textAlign",
  "sectionHeading",
  "ContactForm",
  "ctaButton",
  "twoColumns",
  "anchorNavItem",
  "table",
]);

interface ValidationError {
  file: string;
  error: string;
}

function validatePageFile(filePath: string): ValidationError[] {
  const errors: ValidationError[] = [];
  const relative = path.relative(process.cwd(), filePath);
  const content = fs.readFileSync(filePath, "utf-8");

  // Check frontmatter exists
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!fmMatch) {
    errors.push({ file: relative, error: "Missing or malformed YAML frontmatter (must start and end with ---)" });
    return errors;
  }

  // Parse YAML
  let frontmatter: Record<string, unknown>;
  try {
    frontmatter = yaml.parse(fmMatch[1]);
  } catch (e) {
    errors.push({ file: relative, error: `Invalid YAML: ${e instanceof Error ? e.message : String(e)}` });
    return errors;
  }

  if (!frontmatter || typeof frontmatter !== "object") {
    errors.push({ file: relative, error: "Frontmatter must be a YAML object" });
    return errors;
  }

  // Required fields
  if (!frontmatter.title) {
    errors.push({ file: relative, error: "Missing required field: title" });
  }

  // Validate hero if present
  if (frontmatter.hero && typeof frontmatter.hero === "object") {
    const hero = frontmatter.hero as Record<string, unknown>;
    const validHeights = ["none", "standard", "medium", "tall", "xtall", "full"];
    if (hero.heroHeight && !validHeights.includes(hero.heroHeight as string)) {
      errors.push({ file: relative, error: `Invalid heroHeight "${hero.heroHeight}". Must be one of: ${validHeights.join(", ")}` });
    }
  }

  // Validate templateFields if present
  if (frontmatter.templateFields && typeof frontmatter.templateFields === "object") {
    const tf = frontmatter.templateFields as Record<string, unknown>;
    const validTemplates = ["standard", "fullbleed", "homepage", "program", "facility", "staff"];
    if (tf.discriminant && !validTemplates.includes(tf.discriminant as string)) {
      errors.push({ file: relative, error: `Invalid template "${tf.discriminant}". Must be one of: ${validTemplates.join(", ")}` });
    }
  }

  // Validate Markdoc body — check for unknown tags
  const body = fmMatch[2];
  const tagPattern = /\{%\s*(\w+)/g;
  let match;
  while ((match = tagPattern.exec(body)) !== null) {
    const tagName = match[1];
    // Skip control flow tags (if, else, endif, for, etc.)
    if (["if", "else", "endif", "for", "endfor", "unless", "endunless"].includes(tagName)) continue;
    if (!VALID_MARKDOC_TAGS.has(tagName)) {
      errors.push({ file: relative, error: `Unknown Markdoc tag: {% ${tagName} %}` });
    }
  }

  return errors;
}

function validateYamlFile(filePath: string, requiredFields: string[]): ValidationError[] {
  const errors: ValidationError[] = [];
  const relative = path.relative(process.cwd(), filePath);
  const content = fs.readFileSync(filePath, "utf-8");

  let data: Record<string, unknown>;
  try {
    data = yaml.parse(content);
  } catch (e) {
    errors.push({ file: relative, error: `Invalid YAML: ${e instanceof Error ? e.message : String(e)}` });
    return errors;
  }

  if (!data || typeof data !== "object") {
    errors.push({ file: relative, error: "File must contain a YAML object" });
    return errors;
  }

  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null || data[field] === "") {
      errors.push({ file: relative, error: `Missing required field: ${field}` });
    }
  }

  return errors;
}

function getContentFiles(changedFiles?: string[]): string[] {
  if (changedFiles && changedFiles.length > 0) {
    return changedFiles
      .filter((f) => f.startsWith("content/"))
      .map((f) => path.join(process.cwd(), f));
  }

  // All content files
  const files: string[] = [];

  const pagesDir = path.join(CONTENT_DIR, "pages");
  if (fs.existsSync(pagesDir)) {
    for (const f of fs.readdirSync(pagesDir)) {
      if (f.endsWith(".mdoc")) files.push(path.join(pagesDir, f));
    }
  }

  const testimonialsDir = path.join(CONTENT_DIR, "testimonials");
  if (fs.existsSync(testimonialsDir)) {
    for (const f of fs.readdirSync(testimonialsDir)) {
      if (f.endsWith(".yaml")) files.push(path.join(testimonialsDir, f));
    }
  }

  const faqsDir = path.join(CONTENT_DIR, "faqs");
  if (fs.existsSync(faqsDir)) {
    for (const f of fs.readdirSync(faqsDir)) {
      if (f.endsWith(".yaml")) files.push(path.join(faqsDir, f));
    }
  }

  const navFile = path.join(CONTENT_DIR, "navigation", "navigation.yaml");
  if (fs.existsSync(navFile)) files.push(navFile);

  return files;
}

function run() {
  const args = process.argv.slice(2);
  const changedOnly = args[0] === "--changed-only";
  const changedFiles = changedOnly ? args.slice(1) : undefined;

  const files = getContentFiles(changedFiles);

  if (files.length === 0) {
    console.log("No content files to validate.");
    process.exit(0);
  }

  const allErrors: ValidationError[] = [];

  for (const filePath of files) {
    if (!fs.existsSync(filePath)) continue;

    const relative = path.relative(process.cwd(), filePath);

    if (relative.startsWith("content/pages/") && filePath.endsWith(".mdoc")) {
      allErrors.push(...validatePageFile(filePath));
    } else if (relative.startsWith("content/testimonials/") && filePath.endsWith(".yaml")) {
      allErrors.push(...validateYamlFile(filePath, ["quote", "name"]));
    } else if (relative.startsWith("content/faqs/") && filePath.endsWith(".yaml")) {
      allErrors.push(...validateYamlFile(filePath, ["question", "answer"]));
    } else if (relative.includes("navigation/navigation.yaml")) {
      allErrors.push(...validateYamlFile(filePath, ["menuItems"]));
    }
  }

  // Output
  if (allErrors.length === 0) {
    console.log(`Validated ${files.length} content file(s) — all passed.`);
    process.exit(0);
  }

  console.error(`Content validation failed with ${allErrors.length} error(s):\n`);
  for (const err of allErrors) {
    console.error(`  ${err.file}: ${err.error}`);
  }
  console.error("");
  process.exit(1);
}

run();
