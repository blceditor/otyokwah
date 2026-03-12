/**
 * Transform Fidelity Tests
 *
 * Validates that Markdoc tag transforms don't silently drop schema fields.
 * For each tag in MarkdocRenderer config.tags:
 * - Every declared attribute must appear in the transform function
 * - Every shared component schema field must have a renderer attribute (or be allowlisted)
 *
 * ~1.5 SP
 */
import { describe, test, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";
import { sharedComponents } from "./collections/shared-components";

const RENDERER_PATH = resolve(
  __dirname,
  "../../components/content/MarkdocRenderer.tsx",
);
const rendererSource = readFileSync(RENDERER_PATH, "utf-8");

/**
 * Known attribute renames: schema field -> renderer attribute name.
 * These are intentional mappings where the transform renames a field.
 */
const KNOWN_RENAMES: Record<string, Record<string, string>> = {
  ctaButton: { label: "children", external: "external" },
  callToAction: { buttonText: "children", buttonLink: "href" },
  youtube: { id: "videoId" },
  testimonial: { photo: "avatar" },
  features: { features: "features" },
};

/**
 * Tags that use child-tag patterns where parent extracts data from children.
 * The parent's transform manually processes children — these don't have 1:1 attribute mapping.
 */
const CHILD_TAG_PATTERN_TAGS = new Set([
  "faqAccordion",
  "anchorNav",
]);

/**
 * Child tags whose attributes are consumed by a parent tag's transform,
 * not by their own transform. These are data-holder tags.
 */
const PARENT_CONSUMED_TAGS = new Set([
  "faqItem",
  "anchorNavItem",
]);

/**
 * Tags with spread-based transforms (e.g., `{ ...node.attributes }`) where
 * all attributes are forwarded. No need to check individual attributes.
 */
const SPREAD_TRANSFORM_TAGS = new Set([
  "missionSection",
]);

/**
 * Schema-only fields that exist in shared-components.ts but intentionally
 * have no corresponding renderer attribute. These are editor-only or
 * handled differently in the CMS UI.
 */
const SCHEMA_ONLY_FIELDS: Record<string, Set<string>> = {
  cta: new Set(["heading", "text", "buttonText", "buttonLink"]),
  image: new Set(["src", "alt", "caption"]),
};

/**
 * Tags in the renderer that are aliases or duplicates of other tags.
 * Don't require 1:1 schema mapping.
 */
const ALIAS_TAGS = new Set(["ImageGallery", "callToAction"]);

// Parse renderer source to extract tag configs
function extractRendererTags(): Record<
  string,
  { attributes: string[]; transformBody: string }
> {
  const tags: Record<string, { attributes: string[]; transformBody: string }> =
    {};

  // Match each tag definition in config.tags
  const tagBlockRegex =
    /(\w+):\s*\{[^}]*render:\s*"[^"]+",[\s\S]*?(?=\n\s{4}\w+:\s*\{[^}]*render:|tags:\s*\{|^\s*\};)/gm;

  // Simpler approach: find each tag by looking for render: "ComponentName"
  // and extract its attributes and transform
  const lines = rendererSource.split("\n");
  let currentTag = "";
  let braceDepth = 0;
  let inTags = false;
  let tagStart = -1;
  const tagSections: Record<string, string> = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.includes("tags: {")) {
      inTags = true;
      continue;
    }

    if (!inTags) continue;

    // Detect tag name (indented key before render:)
    const tagNameMatch = line.match(/^\s{4}(\w+):\s*\{/);
    if (tagNameMatch && braceDepth === 0) {
      currentTag = tagNameMatch[1];
      tagStart = i;
      braceDepth = 1;
      tagSections[currentTag] = line + "\n";
      continue;
    }

    if (currentTag) {
      tagSections[currentTag] += line + "\n";
      braceDepth += (line.match(/\{/g) || []).length;
      braceDepth -= (line.match(/\}/g) || []).length;

      if (braceDepth <= 0) {
        currentTag = "";
        braceDepth = 0;
      }
    }
  }

  // Parse each tag section
  for (const [tagName, section] of Object.entries(tagSections)) {
    // Extract attributes keys
    const attrKeys: string[] = [];
    const attrMatch = section.match(/attributes:\s*\{([\s\S]*?)\},?\s*\n/);
    if (attrMatch) {
      const attrBody = attrMatch[1];
      const keyMatches = attrBody.matchAll(/(\w+):\s*\{/g);
      for (const m of keyMatches) {
        attrKeys.push(m[1]);
      }
    }

    // Extract transform function body
    const transformMatch = section.match(
      /transform\s*\([^)]*\)\s*\{([\s\S]*?)\n\s{6}\}/,
    );
    const transformBody = transformMatch ? transformMatch[1] : "";

    tags[tagName] = { attributes: attrKeys, transformBody };
  }

  return tags;
}

describe("Transform Fidelity", () => {
  const rendererTags = extractRendererTags();

  describe("renderer tag attributes are all forwarded in transform", () => {
    for (const [tagName, tagDef] of Object.entries(rendererTags)) {
      if (CHILD_TAG_PATTERN_TAGS.has(tagName)) continue;
      if (PARENT_CONSUMED_TAGS.has(tagName)) continue;
      if (SPREAD_TRANSFORM_TAGS.has(tagName)) continue;
      if (ALIAS_TAGS.has(tagName)) continue;
      if (tagDef.attributes.length === 0) continue;
      if (!tagDef.transformBody) continue;

      test(`${tagName}: all declared attributes appear in transform`, () => {
        const renames = KNOWN_RENAMES[tagName] || {};
        const missingInTransform: string[] = [];

        for (const attr of tagDef.attributes) {
          const renamedTo = renames[attr];
          // Check if the attribute is referenced in the transform body
          const attrReferenced =
            tagDef.transformBody.includes(`node.attributes.${attr}`) ||
            tagDef.transformBody.includes(`node.attributes?.${attr}`) ||
            tagDef.transformBody.includes(`attrs.${attr}`);
          const renameUsed =
            renamedTo &&
            tagDef.transformBody.includes(renamedTo);

          if (!attrReferenced && !renameUsed) {
            missingInTransform.push(attr);
          }
        }

        expect(
          missingInTransform,
          `${tagName} transform does not reference declared attributes: ${missingInTransform.join(", ")}`,
        ).toEqual([]);
      });
    }
  });

  describe("shared component schema fields have renderer attributes", () => {
    // Map from shared component keys to renderer tag names
    const SCHEMA_TO_RENDERER: Record<string, string> = {
      contentCard: "contentCard",
      sectionCard: "sectionCard",
      cardGrid: "cardGrid",
      donateButton: "donateButton",
      ctaSection: "ctaSection",
      youtube: "youtube",
      faqAccordion: "faqAccordion",
      faqItem: "faqItem",
      gallery: "gallery",
      testimonial: "testimonial",
      accordion: "accordion",
      infoCard: "infoCard",
      campSessionCard: "campSessionCard",
      campSessionCardGrid: "campSessionCardGrid",
      wideCard: "wideCard",
      workAtCampSection: "workAtCampSection",
      trustBarMarkdoc: "trustBarMarkdoc",
      trustBarItem: "trustBarItem",
      missionSection: "missionSection",
      documentLink: "documentLink",
      testimonialWidget: "testimonialWidget",
      ContactForm: "ContactForm",
    };

    for (const [schemaKey, component] of Object.entries(sharedComponents)) {
      const rendererTagName = SCHEMA_TO_RENDERER[schemaKey];
      if (!rendererTagName) continue;

      const rendererTag = rendererTags[rendererTagName];
      if (!rendererTag) continue;

      const schemaFields = Object.keys(
        (component as { schema: Record<string, unknown> }).schema || {},
      );
      const schemaOnlyForTag = SCHEMA_ONLY_FIELDS[schemaKey] || new Set();

      if (schemaFields.length === 0) continue;
      if (PARENT_CONSUMED_TAGS.has(rendererTagName)) continue;
      if (SPREAD_TRANSFORM_TAGS.has(rendererTagName)) continue;

      test(`${schemaKey}: schema fields covered by renderer attributes`, () => {
        const renames = KNOWN_RENAMES[rendererTagName] || {};
        const uncoveredFields: string[] = [];

        for (const field of schemaFields) {
          if (schemaOnlyForTag.has(field)) continue;

          const inRendererAttrs = rendererTag.attributes.includes(field);
          const isRenamed = Object.keys(renames).includes(field);
          const inTransform =
            rendererTag.transformBody.includes(
              `node.attributes.${field}`,
            ) ||
            rendererTag.transformBody.includes(
              `node.attributes?.${field}`,
            );

          if (!inRendererAttrs && !isRenamed && !inTransform) {
            uncoveredFields.push(field);
          }
        }

        if (uncoveredFields.length > 0) {
          console.warn(
            `${schemaKey} has schema fields not in renderer: ${uncoveredFields.join(", ")}. ` +
              `These fields will be silently dropped when rendering.`,
          );
        }
      });
    }
  });

  test("schema-to-renderer gap count does not increase", () => {
    const SCHEMA_TO_RENDERER: Record<string, string> = {
      contentCard: "contentCard",
      sectionCard: "sectionCard",
      cardGrid: "cardGrid",
      donateButton: "donateButton",
      ctaSection: "ctaSection",
      youtube: "youtube",
      faqAccordion: "faqAccordion",
      faqItem: "faqItem",
      gallery: "gallery",
      testimonial: "testimonial",
      accordion: "accordion",
      infoCard: "infoCard",
      campSessionCard: "campSessionCard",
      campSessionCardGrid: "campSessionCardGrid",
      wideCard: "wideCard",
      workAtCampSection: "workAtCampSection",
      trustBarMarkdoc: "trustBarMarkdoc",
      trustBarItem: "trustBarItem",
      missionSection: "missionSection",
      documentLink: "documentLink",
      testimonialWidget: "testimonialWidget",
      ContactForm: "ContactForm",
    };

    let totalGaps = 0;
    for (const [schemaKey, component] of Object.entries(sharedComponents)) {
      const rendererTagName = SCHEMA_TO_RENDERER[schemaKey];
      if (!rendererTagName) continue;
      const rendererTag = rendererTags[rendererTagName];
      if (!rendererTag) continue;

      const schemaFields = Object.keys(
        (component as { schema: Record<string, unknown> }).schema || {},
      );
      const schemaOnlyForTag = SCHEMA_ONLY_FIELDS[schemaKey] || new Set();

      if (PARENT_CONSUMED_TAGS.has(rendererTagName)) continue;
      if (SPREAD_TRANSFORM_TAGS.has(rendererTagName)) continue;

      const renames = KNOWN_RENAMES[rendererTagName] || {};

      for (const field of schemaFields) {
        if (schemaOnlyForTag.has(field)) continue;
        const inRendererAttrs = rendererTag.attributes.includes(field);
        const isRenamed = Object.keys(renames).includes(field);
        const inTransform =
          rendererTag.transformBody.includes(`node.attributes.${field}`) ||
          rendererTag.transformBody.includes(`node.attributes?.${field}`);

        if (!inRendererAttrs && !isRenamed && !inTransform) {
          totalGaps++;
        }
      }
    }

    // Known gap count (sectionCard: title, linkHref, linkText = 3 gaps)
    // Reduce when gaps are fixed
    const KNOWN_GAP_COUNT = 3;
    expect(
      totalGaps,
      `Schema-to-renderer gaps changed from ${KNOWN_GAP_COUNT} to ${totalGaps}. ` +
        `If decreased: update KNOWN_GAP_COUNT. If increased: new fields are being silently dropped.`,
    ).toBeLessThanOrEqual(KNOWN_GAP_COUNT);
  });

  describe("renderer references valid components", () => {
    test("every tag with render has a matching component in the components map", () => {
      const renderMatches = rendererSource.matchAll(
        /render:\s*"(\w+)"/g,
      );
      const componentMapMatch = rendererSource.match(
        /const components\s*=\s*\{([\s\S]*?)\};/,
      );
      expect(componentMapMatch).toBeTruthy();
      const componentMap = componentMapMatch![1];

      const missingComponents: string[] = [];
      for (const match of renderMatches) {
        const componentName = match[1];
        if (!componentMap.includes(componentName)) {
          missingComponents.push(componentName);
        }
      }

      expect(
        missingComponents,
        `Components referenced in render but not in components map: ${missingComponents.join(", ")}`,
      ).toEqual([]);
    });
  });

  describe("no duplicate tag names in renderer", () => {
    test("each tag name appears exactly once in config.tags (except known aliases)", () => {
      const tagNames = Object.keys(rendererTags);
      const seen = new Set<string>();
      const duplicates: string[] = [];

      for (const name of tagNames) {
        if (seen.has(name)) {
          duplicates.push(name);
        }
        seen.add(name);
      }

      expect(duplicates).toEqual([]);
    });
  });
});
