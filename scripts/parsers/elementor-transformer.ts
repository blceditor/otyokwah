import { existsSync } from "fs";
import { join, resolve } from "path";
import type {
  ElementorSection,
  ElementorElement,
  ElementorWidget,
} from "./wordpress-xml-parser";
import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";

export interface TransformedContent {
  markdown: string;
  images: string[];
  buttons: Array<{ text: string; url: string }>;
  galleries: string[][];
  skippedWidgets: Array<{ type: string; count: number }>;
}

/**
 * P0 Fix: Type guard for ElementorSection validation
 * Validates structure before type casting to prevent runtime errors
 */
function isElementorSection(element: unknown): element is ElementorSection {
  return (
    typeof element === 'object' &&
    element !== null &&
    'elType' in element &&
    (element as ElementorElement).elType === 'section' &&
    'elements' in element &&
    Array.isArray((element as ElementorElement).elements)
  );
}

/**
 * Transform Elementor page builder data into Markdoc-compatible markdown.
 * REQ-CONTENT-003
 */
export function transformElementorToMarkdoc(
  elementorData: ElementorSection[],
): TransformedContent {
  const skippedWidgetCounts = new Map<string, number>();

  const result: TransformedContent = {
    markdown: "",
    images: [],
    buttons: [],
    galleries: [],
    skippedWidgets: [],
  };

  for (const section of elementorData) {
    processSection(section, result, skippedWidgetCounts);
  }

  // Convert skipped widget counts to array
  result.skippedWidgets = Array.from(skippedWidgetCounts.entries()).map(
    ([type, count]) => ({ type, count })
  );

  return result;
}

/**
 * Process a section (can contain columns or nested sections)
 */
function processSection(
  section: ElementorSection,
  result: TransformedContent,
  skippedWidgetCounts: Map<string, number>,
): void {
  if (!section.elements || section.elements.length === 0) {
    return;
  }

  for (const element of section.elements) {
    if (element.elType === "column") {
      processColumn(element, result, skippedWidgetCounts);
    } else if (isElementorSection(element)) {
      // P0 Fix: Use type guard instead of unsafe type assertion
      processSection(element, result, skippedWidgetCounts);
    }
  }
}

/**
 * Process a column (contains widgets)
 */
function processColumn(
  column: ElementorElement,
  result: TransformedContent,
  skippedWidgetCounts: Map<string, number>,
): void {
  if (!column.elements || column.elements.length === 0) {
    return;
  }

  for (const widget of column.elements) {
    if (widget.elType === "widget") {
      processWidget(widget, result, skippedWidgetCounts);
    } else if (isElementorSection(widget)) {
      // P0 Fix: Use type guard instead of unsafe type assertion
      processSection(widget, result, skippedWidgetCounts);
    }
  }
}

/**
 * Process a widget based on its type
 */
function processWidget(
  widget: ElementorWidget,
  result: TransformedContent,
  skippedWidgetCounts: Map<string, number>,
): void {
  const { widgetType, settings } = widget;

  switch (widgetType) {
    case "heading":
      processHeading(settings, result);
      break;
    case "text-editor":
      processTextEditor(settings, result);
      break;
    case "flip-box":
      processFlipBox(settings, result);
      break;
    case "image":
      processImage(settings, result);
      break;
    case "button":
      processButton(settings, result);
      break;
    case "image-gallery":
      processImageGallery(settings, result);
      break;
    case "video":
      processVideo(settings, result);
      break;
    case "divider":
      // Ignore dividers
      break;
    default:
      // P1 Fix: Track skipped widgets for coverage analysis
      const count = skippedWidgetCounts.get(widgetType) || 0;
      skippedWidgetCounts.set(widgetType, count + 1);
      break;
  }
}

/**
 * Process heading widget
 */
function processHeading(
  settings: Record<string, unknown>,
  result: TransformedContent,
): void {
  const title = settings.title as string;
  const size = (settings.size as string) || "h2";

  if (!title) return;

  // Map Elementor heading sizes to markdown
  const headingMap: Record<string, string> = {
    h1: "# ",
    h2: "## ",
    h3: "### ",
    h4: "#### ",
    h5: "##### ",
    h6: "###### ",
  };

  const prefix = headingMap[size] || "## ";
  result.markdown += `${prefix}${title}\n\n`;
}

/**
 * Process text-editor widget (strip HTML)
 */
function processTextEditor(
  settings: Record<string, unknown>,
  result: TransformedContent,
): void {
  const editor = settings.editor as string;

  if (!editor) return;

  // Strip HTML tags but preserve text structure
  const cleanText = stripHtml(editor);

  if (cleanText.trim()) {
    result.markdown += `${cleanText}\n\n`;
  }
}

/**
 * Process flip-box widget
 */
function processFlipBox(
  settings: Record<string, unknown>,
  result: TransformedContent,
): void {
  const titleA = settings.title_text_a as string;
  const descriptionB = settings.description_text_b as string;

  if (titleA) {
    result.markdown += `### ${titleA}\n\n`;
  }

  if (descriptionB) {
    const cleanDesc = stripHtml(descriptionB);
    result.markdown += `${cleanDesc}\n\n`;
  }
}

/**
 * Process image widget
 */
function processImage(
  settings: Record<string, unknown>,
  result: TransformedContent,
): void {
  const image = settings.image as { url?: string };

  if (!image?.url) return;

  const mappedUrl = mapImageUrl(image.url);
  result.images.push(mappedUrl);

  // Also add to markdown
  result.markdown += `![Image](${mappedUrl})\n\n`;
}

/**
 * Process button widget
 */
function processButton(
  settings: Record<string, unknown>,
  result: TransformedContent,
): void {
  const text = settings.text as string;
  const link = settings.link as { url?: string };

  if (!text || !link?.url) return;

  result.buttons.push({
    text,
    url: link.url,
  });
}

/**
 * Process image-gallery widget
 */
function processImageGallery(
  settings: Record<string, unknown>,
  result: TransformedContent,
): void {
  const wpGallery = settings.wp_gallery as Array<{ url?: string }>;

  if (!Array.isArray(wpGallery) || wpGallery.length === 0) return;

  const galleryUrls = wpGallery
    .filter((item) => item.url)
    .map((item) => mapImageUrl(item.url!));

  if (galleryUrls.length > 0) {
    result.galleries.push(galleryUrls);
  }
}

/**
 * Process video widget
 */
function processVideo(
  settings: Record<string, unknown>,
  result: TransformedContent,
): void {
  const youtubeUrl = settings.youtube_url as string;
  const vimeoUrl = settings.vimeo_url as string;

  let videoId = "";
  let platform = "";

  if (youtubeUrl) {
    // Extract YouTube video ID (exclude query params and fragments)
    const match = youtubeUrl.match(
      /(?:v=|\/embed\/|\/watch\?v=|youtu\.be\/)([^&\s?#]+)/,
    );
    videoId = match ? match[1] : "";
    platform = "youtube";
  } else if (vimeoUrl) {
    // Extract Vimeo video ID
    const match = vimeoUrl.match(/(?:vimeo\.com\/)(\d+)/);
    videoId = match ? match[1] : "";
    platform = "vimeo";
  }

  if (videoId && platform === "youtube") {
    result.markdown += `{% youtube id="${videoId}" %}\n\n`;
  } else if (videoId && platform === "vimeo") {
    result.markdown += `{% vimeo id="${videoId}" %}\n\n`;
  }
}

/**
 * P1 Fix: Strip HTML tags using DOMPurify to prevent XSS vulnerabilities
 * Preserves safe formatting and converts to markdown
 */
function stripHtml(html: string): string {
  // Create a JSDOM window for server-side DOMPurify
  const window = new JSDOM('').window;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const purify = DOMPurify(window as any);

  // Sanitize HTML allowing only safe formatting tags
  const sanitized = purify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'b', 'em', 'i'],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  });

  let text = sanitized;

  // Convert HTML formatting to markdown
  text = text.replace(/<strong>(.*?)<\/strong>/gi, "**$1**");
  text = text.replace(/<b>(.*?)<\/b>/gi, "**$1**");
  text = text.replace(/<em>(.*?)<\/em>/gi, "*$1*");
  text = text.replace(/<i>(.*?)<\/i>/gi, "*$1*");

  // Replace <br> and </p> with newlines
  text = text.replace(/<br\s*\/?>/gi, "\n");
  text = text.replace(/<\/p>/gi, "\n");

  // Remove all other HTML tags
  text = text.replace(/<[^>]+>/g, "");

  // Decode common HTML entities
  text = text.replace(/&nbsp;/g, " ");
  text = text.replace(/&amp;/g, "&");
  text = text.replace(/&lt;/g, "<");
  text = text.replace(/&gt;/g, ">");
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#039;/g, "'");

  // Clean up extra whitespace
  text = text.replace(/\n\s*\n\s*\n/g, "\n\n"); // Max 2 newlines
  text = text.trim();

  return text;
}

/**
 * P1 Fix: Image existence cache to avoid repeated synchronous I/O calls
 */
const imageExistenceCache = new Map<string, boolean>();

/**
 * Clear the image existence cache (for testing purposes)
 */
export function clearImageCache(): void {
  imageExistenceCache.clear();
}

/**
 * Map WordPress image URL to local path if file exists.
 * REQ-CONTENT-003
 *
 * P1 Fix: Uses relative path from project root instead of hardcoded absolute path
 * P1 Fix: Memoizes file existence checks to reduce synchronous I/O
 *
 * Checks directories in order:
 * 1. /images/summer-program-and-general/
 * 2. /images/staff/
 * 3. /images/facilities/
 *
 * Returns local path if found, otherwise returns original WordPress URL.
 */
export function mapImageUrl(
  wpUrl: string,
  localImagesDir: string = resolve(process.cwd(), 'public/images'),
): string {
  // Strip query parameters from URL
  const urlWithoutQuery = wpUrl.split("?")[0];

  // Extract filename from WordPress URL
  const filename = urlWithoutQuery.split("/").pop();

  if (!filename) {
    return urlWithoutQuery;
  }

  // Directories to check in order
  const directories = ["summer-program-and-general", "staff", "facilities"];

  for (const dir of directories) {
    const localPath = join(localImagesDir, dir, filename);

    // P1 Fix: Check cache before performing synchronous I/O
    let exists = imageExistenceCache.get(localPath);
    if (exists === undefined) {
      exists = existsSync(localPath);
      imageExistenceCache.set(localPath, exists);
    }

    if (exists) {
      // Return web-accessible path
      return `/images/${dir}/${filename}`;
    }
  }

  // Fallback to original WordPress URL (without query params)
  return urlWithoutQuery;
}
