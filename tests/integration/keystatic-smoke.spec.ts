// REQ-P0, REQ-P1, REQ-P2, REQ-P3: Keystatic CMS Integration Smoke Tests
// Test Guardian: All YAML fixtures use nested hero: object matching actual Keystatic schema
import { describe, test, expect, beforeEach, afterEach } from "vitest";
import { createReader } from "@keystatic/core/reader";
import keystaticConfig from "../../keystatic.config";
import fs from "fs";
import path from "path";

// Correct YAML frontmatter template matching actual Keystatic pages schema
function makePageYaml(opts: {
  title: string;
  heroImage?: string;
  heroTagline?: string;
  heroHeight?: string;
  metaTitle?: string;
  metaDescription?: string;
  noIndex?: boolean;
  template?: string;
  templateValue?: string;
}): string {
  const hero = `hero:
  heroImage: ${opts.heroImage || ""}
  heroVideo: ''
  heroYouTubeId: ''
  heroTagline: ${opts.heroTagline || ""}
  heroHeight: ${opts.heroHeight || "standard"}`;
  const seo = `seo:
  metaTitle: ${opts.metaTitle || ""}
  metaDescription: ${opts.metaDescription || ""}
  ogTitle: ""
  ogDescription: ""
  twitterCard: summary_large_image
  noIndex: ${opts.noIndex ?? false}`;
  const tf = opts.templateValue
    ? `templateFields:\n  discriminant: ${opts.template || "standard"}\n  value:\n${opts.templateValue}`
    : `templateFields:\n  discriminant: ${opts.template || "standard"}`;

  return `---\ntitle: ${opts.title}\n${hero}\n${seo}\n${tf}\n---`;
}

describe("REQ-P0 — List all pages in pages collection", () => {
  const reader = createReader(process.cwd(), keystaticConfig);

  test("pages collection returns array of page slugs", async () => {
    const pages = await reader.collections.pages.list();

    expect(pages).toBeDefined();
    expect(Array.isArray(pages)).toBe(true);
    expect(pages.length).toBeGreaterThan(0);
  });

  test("pages collection contains expected pages", async () => {
    const pages = await reader.collections.pages.list();

    const expectedPages = [
      "index",
      "about",
      "summer-camp",
      "work-at-camp",
      "retreats",
      "give",
      "contact",
    ];

    expectedPages.forEach((expectedPage) => {
      expect(pages).toContain(expectedPage);
    });
  });

  test("can read individual page entry", async () => {
    const pages = await reader.collections.pages.list();
    const firstPageSlug = pages[0];

    const page = await reader.collections.pages.read(firstPageSlug);

    expect(page).toBeDefined();
    expect(page).toHaveProperty("title");
    expect(page).toHaveProperty("body");
    expect(page).toHaveProperty("seo");
  });

  test("page entries have correct schema structure", async () => {
    const page = await reader.collections.pages.read("index");

    expect(page).toHaveProperty("title");
    expect(page).toHaveProperty("hero");
    expect(page?.hero).toHaveProperty("heroImage");
    expect(page?.hero).toHaveProperty("heroTagline");
    expect(page).toHaveProperty("seo");
    expect(page).toHaveProperty("templateFields");
    expect(page).toHaveProperty("body");

    // Verify SEO object structure
    expect(page?.seo).toHaveProperty("metaTitle");
    expect(page?.seo).toHaveProperty("metaDescription");
    expect(page?.seo).toHaveProperty("noIndex");
  });

  test("template fields vary by template type", async () => {
    const homePage = await reader.collections.pages.read("index");
    const aboutPage = await reader.collections.pages.read("about");

    expect(homePage?.templateFields.discriminant).toBe("standard");
    expect(homePage?.templateFields).toBeDefined();

    if (aboutPage) {
      expect(aboutPage.templateFields.discriminant).toBeDefined();
      expect(
        ["standard", "fullbleed"].includes(
          aboutPage.templateFields.discriminant,
        ),
      ).toBe(true);
    }
  });
});

describe("REQ-P1 — Read navigation singleton", () => {
  const reader = createReader(process.cwd(), keystaticConfig);

  test("navigation singleton returns data", async () => {
    const navigation = await reader.singletons.siteNavigation.read();

    expect(navigation).toBeDefined();
  });

  test("navigation has menuItems array", async () => {
    const navigation = await reader.singletons.siteNavigation.read();

    expect(navigation).toHaveProperty("menuItems");
    expect(Array.isArray(navigation?.menuItems)).toBe(true);
    expect(navigation?.menuItems.length).toBeGreaterThan(0);
  });

  test("navigation has primaryCTA object", async () => {
    const navigation = await reader.singletons.siteNavigation.read();

    expect(navigation).toHaveProperty("primaryCTA");
    expect(navigation?.primaryCTA).toHaveProperty("label");
    expect(navigation?.primaryCTA).toHaveProperty("href");
    expect(navigation?.primaryCTA).toHaveProperty("external");
  });

  test("menu items have correct structure", async () => {
    const navigation = await reader.singletons.siteNavigation.read();

    const firstMenuItem = navigation?.menuItems[0];
    expect(firstMenuItem).toHaveProperty("label");
    expect(firstMenuItem).toHaveProperty("href");

    if (firstMenuItem?.children && firstMenuItem.children.length > 0) {
      const firstChild = firstMenuItem.children[0];
      expect(firstChild).toHaveProperty("label");
      expect(firstChild).toHaveProperty("href");
      expect(firstChild).toHaveProperty("external");
    }
  });

  test("navigation contains expected menu items", async () => {
    const navigation = await reader.singletons.siteNavigation.read();

    const menuLabels = navigation?.menuItems.map((item) => item.label) || [];

    expect(menuLabels).toContain("Summer Camp");
    expect(menuLabels).toContain("Work at Camp");
    expect(menuLabels).toContain("Retreats");
    expect(menuLabels).toContain("Give");
    expect(menuLabels).toContain("About");
  });

  test("primaryCTA has valid registration link", async () => {
    const navigation = await reader.singletons.siteNavigation.read();

    expect(navigation?.primaryCTA.label).toBeDefined();
    expect(navigation?.primaryCTA.href).toMatch(/http/);
    expect(navigation?.primaryCTA.external).toBe(true);
  });
});

describe("REQ-P2 — Create sample page and read it back", () => {
  const reader = createReader(process.cwd(), keystaticConfig);
  const TEST_PAGE_SLUG = "test-integration-page";
  const TEST_PAGE_PATH = path.join(
    process.cwd(),
    "content",
    "pages",
    `${TEST_PAGE_SLUG}.mdoc`,
  );

  afterEach(() => {
    if (fs.existsSync(TEST_PAGE_PATH)) {
      fs.unlinkSync(TEST_PAGE_PATH);
    }
  });

  test("create new page file and read it back", async () => {
    const yaml = makePageYaml({
      title: "Test Integration Page",
      heroImage: "/test-hero.jpg",
      heroTagline: "Test tagline for integration testing",
      metaTitle: "Test Page Meta Title",
      metaDescription: "This is a test page for integration testing",
      noIndex: true,
    });

    const testPageContent = `${yaml}

# Test Integration Page

This is a test page created during integration testing.

## Test Section

Content for testing purposes.
`;

    fs.writeFileSync(TEST_PAGE_PATH, testPageContent, "utf-8");
    expect(fs.existsSync(TEST_PAGE_PATH)).toBe(true);

    const page = await reader.collections.pages.read(TEST_PAGE_SLUG);

    expect(page).toBeDefined();
    expect(page?.title).toBe("Test Integration Page");
    expect(page?.hero.heroTagline).toBe("Test tagline for integration testing");
    expect(page?.seo.metaTitle).toBe("Test Page Meta Title");
    expect(page?.seo.noIndex).toBe(true);
    expect(page?.templateFields.discriminant).toBe("standard");
  });

  test("created page appears in pages list", async () => {
    const yaml = makePageYaml({ title: "Test List Page" });
    fs.writeFileSync(TEST_PAGE_PATH, `${yaml}\n\n# Test content\n`, "utf-8");

    const pages = await reader.collections.pages.list();
    expect(pages).toContain(TEST_PAGE_SLUG);
  });

  test("page with fullbleed template", async () => {
    const yaml = makePageYaml({
      title: "Test Fullbleed Page",
      heroImage: "/test-fullbleed.jpg",
      heroTagline: "Test Fullbleed",
      metaTitle: "Test Fullbleed",
      metaDescription: "Test fullbleed description",
      noIndex: true,
      template: "fullbleed",
    });

    fs.writeFileSync(
      TEST_PAGE_PATH,
      `${yaml}\n\n# Test Fullbleed Page\n\nFullbleed content.\n`,
      "utf-8",
    );

    const page = await reader.collections.pages.read(TEST_PAGE_SLUG);

    expect(page?.templateFields.discriminant).toBe("fullbleed");
  });
});

describe("REQ-P3 — Update existing page", () => {
  const reader = createReader(process.cwd(), keystaticConfig);
  const TEST_PAGE_SLUG = "test-update-page";
  const TEST_PAGE_PATH = path.join(
    process.cwd(),
    "content",
    "pages",
    `${TEST_PAGE_SLUG}.mdoc`,
  );

  beforeEach(() => {
    const yaml = makePageYaml({
      title: "Initial Title",
      heroImage: "/initial-hero.jpg",
      heroTagline: "Initial tagline",
      metaTitle: "Initial Meta Title",
      metaDescription: "Initial description",
    });
    fs.writeFileSync(
      TEST_PAGE_PATH,
      `${yaml}\n\n# Initial Content\n\nThis is the initial content.\n`,
      "utf-8",
    );
  });

  afterEach(() => {
    if (fs.existsSync(TEST_PAGE_PATH)) {
      fs.unlinkSync(TEST_PAGE_PATH);
    }
  });

  test("update page title and verify change persisted", async () => {
    const initialPage = await reader.collections.pages.read(TEST_PAGE_SLUG);
    expect(initialPage?.title).toBe("Initial Title");

    const yaml = makePageYaml({
      title: "Updated Title",
      heroImage: "/initial-hero.jpg",
      heroTagline: "Initial tagline",
      metaTitle: "Initial Meta Title",
      metaDescription: "Initial description",
    });
    fs.writeFileSync(
      TEST_PAGE_PATH,
      `${yaml}\n\n# Initial Content\n\nThis is the initial content.\n`,
      "utf-8",
    );

    const updatedPage = await reader.collections.pages.read(TEST_PAGE_SLUG);
    expect(updatedPage?.title).toBe("Updated Title");
  });

  test("update SEO fields and verify persistence", async () => {
    const yaml = makePageYaml({
      title: "Initial Title",
      heroImage: "/initial-hero.jpg",
      heroTagline: "Initial tagline",
      metaTitle: "Updated SEO Title",
      metaDescription: "Updated SEO description with more details",
      noIndex: true,
    });
    fs.writeFileSync(
      TEST_PAGE_PATH,
      `${yaml}\n\n# Initial Content\n\nThis is the initial content.\n`,
      "utf-8",
    );

    const updatedPage = await reader.collections.pages.read(TEST_PAGE_SLUG);
    expect(updatedPage?.seo.metaTitle).toBe("Updated SEO Title");
    expect(updatedPage?.seo.metaDescription).toBe(
      "Updated SEO description with more details",
    );
    expect(updatedPage?.seo.noIndex).toBe(true);
  });

  test("update body content and verify persistence", async () => {
    const yaml = makePageYaml({
      title: "Initial Title",
      heroImage: "/initial-hero.jpg",
      heroTagline: "Initial tagline",
      metaTitle: "Initial Meta Title",
      metaDescription: "Initial description",
    });
    fs.writeFileSync(
      TEST_PAGE_PATH,
      `${yaml}\n\n# Updated Content Heading\n\nThis is the **updated** content with *different* formatting.\n\n## New Section\n\nThis section was added in the update.\n`,
      "utf-8",
    );

    const updatedPage = await reader.collections.pages.read(TEST_PAGE_SLUG);
    expect(updatedPage?.body).toBeDefined();

    const rawContent = fs.readFileSync(TEST_PAGE_PATH, "utf-8");
    expect(rawContent).toContain("Updated Content Heading");
    expect(rawContent).toContain("**updated**");
    expect(rawContent).toContain("New Section");
  });

  test("change template type from standard to fullbleed", async () => {
    const yaml = makePageYaml({
      title: "Initial Title",
      heroImage: "/initial-hero.jpg",
      heroTagline: "Initial tagline",
      metaTitle: "Initial Meta Title",
      metaDescription: "Initial description",
      template: "fullbleed",
    });
    fs.writeFileSync(
      TEST_PAGE_PATH,
      `${yaml}\n\n# Updated to Fullbleed Page\n\nThis is now a fullbleed page.\n`,
      "utf-8",
    );

    const updatedPage = await reader.collections.pages.read(TEST_PAGE_SLUG);
    expect(updatedPage?.templateFields.discriminant).toBe("fullbleed");
  });

  test("multiple sequential updates persist correctly", async () => {
    // First update
    let yaml = makePageYaml({
      title: "Update 1",
      heroImage: "/initial-hero.jpg",
      heroTagline: "Tagline 1",
      metaTitle: "Meta 1",
      metaDescription: "Description 1",
    });
    fs.writeFileSync(TEST_PAGE_PATH, `${yaml}\n\n# Content 1\n`, "utf-8");

    let page = await reader.collections.pages.read(TEST_PAGE_SLUG);
    expect(page?.title).toBe("Update 1");

    // Second update
    yaml = makePageYaml({
      title: "Update 2",
      heroImage: "/initial-hero.jpg",
      heroTagline: "Tagline 2",
      metaTitle: "Meta 2",
      metaDescription: "Description 2",
    });
    fs.writeFileSync(TEST_PAGE_PATH, `${yaml}\n\n# Content 2\n`, "utf-8");

    page = await reader.collections.pages.read(TEST_PAGE_SLUG);
    expect(page?.title).toBe("Update 2");
    expect(page?.hero.heroTagline).toBe("Tagline 2");

    // Third update
    yaml = makePageYaml({
      title: "Update 3 Final",
      heroImage: "/initial-hero.jpg",
      heroTagline: "Tagline 3 Final",
      metaTitle: "Meta 3 Final",
      metaDescription: "Description 3 Final",
      noIndex: true,
    });
    fs.writeFileSync(TEST_PAGE_PATH, `${yaml}\n\n# Content 3 Final\n`, "utf-8");

    page = await reader.collections.pages.read(TEST_PAGE_SLUG);
    expect(page?.title).toBe("Update 3 Final");
    expect(page?.hero.heroTagline).toBe("Tagline 3 Final");
    expect(page?.seo.metaTitle).toBe("Meta 3 Final");
    expect(page?.seo.noIndex).toBe(true);
  });
});

describe("REQ-P3 — Delete test page", () => {
  const reader = createReader(process.cwd(), keystaticConfig);
  const TEST_PAGE_SLUG = "test-delete-page";
  const TEST_PAGE_PATH = path.join(
    process.cwd(),
    "content",
    "pages",
    `${TEST_PAGE_SLUG}.mdoc`,
  );

  beforeEach(() => {
    const yaml = makePageYaml({ title: "Page to Delete" });
    fs.writeFileSync(
      TEST_PAGE_PATH,
      `${yaml}\n\n# This page will be deleted\n`,
      "utf-8",
    );
  });

  afterEach(() => {
    if (fs.existsSync(TEST_PAGE_PATH)) {
      fs.unlinkSync(TEST_PAGE_PATH);
    }
  });

  test("delete page and verify removal from filesystem", async () => {
    expect(fs.existsSync(TEST_PAGE_PATH)).toBe(true);

    const page = await reader.collections.pages.read(TEST_PAGE_SLUG);
    expect(page).toBeDefined();

    fs.unlinkSync(TEST_PAGE_PATH);
    expect(fs.existsSync(TEST_PAGE_PATH)).toBe(false);
  });

  test("deleted page no longer appears in pages list", async () => {
    let pages = await reader.collections.pages.list();
    expect(pages).toContain(TEST_PAGE_SLUG);

    fs.unlinkSync(TEST_PAGE_PATH);

    pages = await reader.collections.pages.list();
    expect(pages).not.toContain(TEST_PAGE_SLUG);
  });

  test("reading deleted page returns null or throws error", async () => {
    fs.unlinkSync(TEST_PAGE_PATH);

    try {
      const page = await reader.collections.pages.read(TEST_PAGE_SLUG);
      expect(page).toBeNull();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  test("delete and recreate page with different content", async () => {
    const original = await reader.collections.pages.read(TEST_PAGE_SLUG);
    expect(original?.title).toBe("Page to Delete");

    fs.unlinkSync(TEST_PAGE_PATH);
    expect(fs.existsSync(TEST_PAGE_PATH)).toBe(false);

    const yaml = makePageYaml({
      title: "Recreated Page",
      heroImage: "/new-hero.jpg",
      heroTagline: "New tagline",
      metaTitle: "Recreated Meta",
      metaDescription: "Recreated description",
      template: "fullbleed",
    });
    fs.writeFileSync(
      TEST_PAGE_PATH,
      `${yaml}\n\n# Recreated page with new content\n`,
      "utf-8",
    );

    const recreated = await reader.collections.pages.read(TEST_PAGE_SLUG);
    expect(recreated?.title).toBe("Recreated Page");
    expect(recreated?.templateFields.discriminant).toBe("fullbleed");
  });

  test("bulk delete multiple test pages and verify cleanup", async () => {
    const testSlugs = ["test-bulk-1", "test-bulk-2", "test-bulk-3"];
    const testPaths = testSlugs.map((slug) =>
      path.join(process.cwd(), "content", "pages", `${slug}.mdoc`),
    );

    testSlugs.forEach((slug, index) => {
      const yaml = makePageYaml({ title: `Bulk Test ${index + 1}` });
      fs.writeFileSync(
        testPaths[index],
        `${yaml}\n\n# Bulk test page ${index + 1}\n`,
        "utf-8",
      );
    });

    testPaths.forEach((p) => {
      expect(fs.existsSync(p)).toBe(true);
    });

    testPaths.forEach((p) => {
      if (fs.existsSync(p)) {
        fs.unlinkSync(p);
      }
    });

    testPaths.forEach((p) => {
      expect(fs.existsSync(p)).toBe(false);
    });

    const pages = await reader.collections.pages.list();
    testSlugs.forEach((slug) => {
      expect(pages).not.toContain(slug);
    });
  });
});
