// REQ-CONTENT-004: Generate pages from WordPress XML export with enhanced template support
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { parseWordPressXML, type WordPressPage } from './parsers/wordpress-xml-parser';
import {
  transformElementorToMarkdoc,
  mapImageUrl,
  type TransformedContent,
} from './parsers/elementor-transformer';

const WORDPRESS_XML_PATH = path.join(process.cwd(), 'bearlakecamp-original/bearlakecamp.WordPress.2025-10-31.xml');
const CONTENT_DIR = path.join(process.cwd(), 'content', 'pages');

// REQ-CONTENT-004: Page template types
export interface PageTemplate {
  type: 'standard' | 'homepage' | 'program' | 'facility' | 'staff';
  discriminant: string;
}

// REQ-CONTENT-004: Generated page structure
export interface GeneratedPage {
  filename: string;
  title: string;
  slug: string;
  template: PageTemplate;
  heroImage: string;
  heroTagline: string;
  metaTitle: string;
  metaDescription: string;
  body: string;
  templateFields?: Record<string, unknown>;
}

// REQ-CONTENT-004: WordPress slug to target filename mapping
interface PageMapping {
  wordpressSlug: string;
  targetFilename: string;
}

// Page mappings for WordPress to Markdoc generation
// Based on actual WordPress slugs from the export
const PAGE_MAPPINGS: PageMapping[] = [
  { wordpressSlug: 'home-2', targetFilename: 'index.mdoc' },
  { wordpressSlug: 'about', targetFilename: 'about.mdoc' },
  { wordpressSlug: 'summer-camp', targetFilename: 'summer-camp.mdoc' },
  // Note: Summer camp sessions are now consolidated into summer-camp-sessions.mdoc
  { wordpressSlug: 'work-at-camp', targetFilename: 'work-at-camp.mdoc' },
  { wordpressSlug: 'summer-staff', targetFilename: 'work-at-camp-summer-staff.mdoc' },
  { wordpressSlug: 'retreats', targetFilename: 'retreats.mdoc' },
  { wordpressSlug: 'defrost', targetFilename: 'retreats-defrost.mdoc' },
  { wordpressSlug: 'recharge', targetFilename: 'retreats-recharge.mdoc' },
  { wordpressSlug: 'rentals', targetFilename: 'facilities.mdoc' }, // Use rentals for facilities overview
  { wordpressSlug: 'chapel', targetFilename: 'facilities-chapel.mdoc' },
  { wordpressSlug: 'dininghall', targetFilename: 'facilities-dining-hall.mdoc' },
  { wordpressSlug: 'cabins', targetFilename: 'facilities-cabins.mdoc' },
  { wordpressSlug: 'mac', targetFilename: 'facilities-rec-center.mdoc' },
  { wordpressSlug: 'financial-partnerships', targetFilename: 'give.mdoc' },
];

/**
 * REQ-CONTENT-004: Classify page template based on slug and title
 */
export function classifyPageTemplate(slug: string, wpPageTitle: string): PageTemplate {
  // Homepage patterns
  if (slug === 'home-2' || slug === 'home') {
    return { type: 'homepage', discriminant: 'homepage' };
  }

  // Program patterns (summer camps and retreats)
  const programSlugs = [
    'summer-camp',
    'summer-camp-sessions',
    'defrost',
    'recharge',
    'anchored',
    'breathe',
    'leaders-in-training',
    'retreats-youth-groups',
    'retreats-adult-retreats',
  ];
  if (programSlugs.includes(slug)) {
    return { type: 'program', discriminant: 'program' };
  }

  // Facility patterns
  const facilitySlugs = ['cabins', 'chapel', 'dininghall', 'mac', 'outdoor'];
  if (facilitySlugs.includes(slug)) {
    return { type: 'facility', discriminant: 'facility' };
  }

  // Staff patterns
  const staffSlugs = ['work-at-camp', 'summer-staff', 'summer-staff-landing'];
  if (staffSlugs.includes(slug)) {
    return { type: 'staff', discriminant: 'staff' };
  }

  // Default to standard
  return { type: 'standard', discriminant: 'standard' };
}

/**
 * REQ-CONTENT-004: Extract template-specific fields from WordPress data
 */
export function extractTemplateFields(
  template: PageTemplate,
  elementorData: unknown,
  content: string,
): Record<string, unknown> {
  const fields: Record<string, unknown> = {};

  // Transform Elementor data if available
  let transformed: TransformedContent = {
    markdown: '',
    images: [],
    buttons: [],
    galleries: [],
    skippedWidgets: [],
  };
  if (Array.isArray(elementorData)) {
    transformed = transformElementorToMarkdoc(elementorData);
  }

  switch (template.type) {
    case 'homepage':
      return extractHomepageFields(transformed, content);
    case 'program':
      return extractProgramFields(transformed, content);
    case 'facility':
      return extractFacilityFields(transformed, content);
    case 'staff':
      return extractStaffFields(transformed, content);
    default:
      return fields;
  }
}

/**
 * Extract homepage template fields
 */
function extractHomepageFields(transformed: ReturnType<typeof transformElementorToMarkdoc>, content: string): Record<string, unknown> {
  const fields: Record<string, unknown> = {};

  // Gallery images from first gallery
  if (transformed.galleries && transformed.galleries.length > 0) {
    fields.galleryImages = transformed.galleries[0].map((imgUrl) => ({
      image: imgUrl,
      alt: 'Bear Lake Camp',
      caption: '',
    }));
  } else {
    fields.galleryImages = [];
  }

  // CTA from last button
  if (transformed.buttons && transformed.buttons.length > 0) {
    const lastButton = transformed.buttons[transformed.buttons.length - 1];
    fields.ctaHeading = 'Ready to Register?';
    fields.ctaButtonText = lastButton.text;
    fields.ctaButtonLink = lastButton.url;
  } else {
    fields.ctaHeading = 'Ready to Register?';
    fields.ctaButtonText = 'Register Now';
    fields.ctaButtonLink = '';
  }

  return fields;
}

/**
 * Extract program template fields
 */
function extractProgramFields(transformed: ReturnType<typeof transformElementorToMarkdoc>, content: string): Record<string, unknown> {
  const fields: Record<string, unknown> = {};

  // Use transformed markdown and fallback to original content
  // Ensure searchContent is always a string
  const searchContent = String(transformed.markdown || content || '');

  // Extract dates from content (look for date patterns)
  const datePattern = /(?:Week \d+:|June|July|August)\s*[0-9\-,\s]+/gi;
  const dateMatches = searchContent.match(datePattern);
  fields.dates = dateMatches ? dateMatches[0] : 'TBD';

  // Extract pricing (look for dollar amounts)
  const pricingPattern = /\$\d+(?:\.\d{2})?[^.]*(?:per|\/)[^.]*(?:camper|person|week)?[^.]*(?:\([^)]*\))?/gi;
  const pricingMatches = searchContent.match(pricingPattern);
  fields.pricing = pricingMatches ? pricingMatches[0] : 'Contact for pricing';

  // Extract age range from content
  const agePattern = /(?:grades?|ages?)\s*\d+(?:\s*-\s*\d+)?/gi;
  const ageMatches = searchContent.match(agePattern);
  fields.ageRange = ageMatches ? ageMatches[0] : '';

  // Registration link from buttons containing "register" or "ultracamp"
  const registrationButton = transformed.buttons.find(
    (btn) =>
      btn.url.toLowerCase().includes('register') ||
      btn.url.toLowerCase().includes('ultracamp'),
  );
  fields.registrationLink = registrationButton ? registrationButton.url : '';

  // Gallery images
  if (transformed.galleries.length > 0) {
    fields.galleryImages = transformed.galleries[0].map((imgUrl) => ({
      image: imgUrl,
      alt: 'Program photo',
      caption: '',
    }));
  } else {
    fields.galleryImages = [];
  }

  // CTA fields
  if (transformed.buttons.length > 0) {
    const lastButton = transformed.buttons[transformed.buttons.length - 1];
    fields.ctaHeading = 'Ready to Register?';
    fields.ctaButtonText = lastButton.text;
    fields.ctaButtonLink = lastButton.url;
  }

  return fields;
}

/**
 * Extract facility template fields
 */
function extractFacilityFields(transformed: ReturnType<typeof transformElementorToMarkdoc>, content: string): Record<string, unknown> {
  const fields: Record<string, unknown> = {};

  // Use transformed markdown and fallback to original content
  // Ensure searchContent is always a string
  const searchContent = String(transformed.markdown || content || '');

  // Extract capacity from content
  const capacityPattern = /(?:capacity|seats?|accommodates?)[:\s]*(\d+(?:-\d+)?)/gi;
  const capacityMatch = searchContent.match(capacityPattern);
  fields.capacity = capacityMatch ? capacityMatch[0] : '';

  // Extract amenities (look for bullet points or features)
  const amenitiesList: string[] = [];
  const amenitiesPattern = /(?:amenities?|features?|includes?)[:\s]*([^.]+)/gi;
  const amenitiesMatch = searchContent.match(amenitiesPattern);
  if (amenitiesMatch) {
    fields.amenities = amenitiesMatch[0];
  } else {
    fields.amenities = '';
  }

  // Gallery images
  if (transformed.galleries.length > 0) {
    fields.galleryImages = transformed.galleries[0].map((imgUrl) => ({
      image: imgUrl,
      alt: 'Facility photo',
      caption: '',
    }));
  } else {
    fields.galleryImages = [];
  }

  return fields;
}

/**
 * Extract staff template fields
 */
function extractStaffFields(transformed: ReturnType<typeof transformElementorToMarkdoc>, content: string): Record<string, unknown> {
  const fields: Record<string, unknown> = {};

  // Gallery images
  if (transformed.galleries.length > 0) {
    fields.galleryImages = transformed.galleries[0].map((imgUrl) => ({
      image: imgUrl,
      alt: 'Staff photo',
      caption: '',
    }));
  } else {
    fields.galleryImages = [];
  }

  // CTA from buttons
  if (transformed.buttons.length > 0) {
    const lastButton = transformed.buttons[transformed.buttons.length - 1];
    fields.ctaHeading = 'Ready to Apply?';
    fields.ctaButtonText = lastButton.text;
    fields.ctaButtonLink = lastButton.url;
  } else {
    fields.ctaHeading = 'Ready to Apply?';
    fields.ctaButtonText = 'Apply Now';
    fields.ctaButtonLink = '';
  }

  return fields;
}

/**
 * REQ-CONTENT-004: Extract hero image from WordPress page
 */
function extractHeroImage(page: WordPressPage): string {
  if (!page.elementorData || page.elementorData.length === 0) {
    return '/images/placeholder.jpg';
  }

  // Look for background image in first section
  const firstSection = page.elementorData[0];
  if (firstSection.settings.background_image) {
    const bgImage = firstSection.settings.background_image as { url: string };
    return mapImageUrl(bgImage.url);
  }

  return '/images/summer-program-and-general/Top-promo-7-scaled-e1731002368158.jpg';
}

/**
 * REQ-CONTENT-004: Generate complete page with proper YAML quoting
 */
function generatePage(wpPage: WordPressPage, targetFilename: string): GeneratedPage {
  // P1 FIX: Validate WordPress page data
  if (!wpPage.title || !wpPage.slug) {
    throw new Error(`Invalid WordPress page: missing title or slug (slug: ${wpPage.slug || 'undefined'})`);
  }

  const template = classifyPageTemplate(wpPage.slug, wpPage.title);
  const templateFields = extractTemplateFields(
    template,
    wpPage.elementorData,
    wpPage.content,
  );

  // Transform Elementor to markdown
  let body = '';
  if (wpPage.elementorData) {
    const transformed = transformElementorToMarkdoc(wpPage.elementorData);
    body = transformed.markdown;
  } else {
    body = wpPage.content;
  }

  const heroImage = extractHeroImage(wpPage);
  const heroTagline = 'Make an Eternal Impact';
  const metaTitle = `${wpPage.title} - Bear Lake Camp`;
  const metaDescription = `${wpPage.title} at Bear Lake Camp. A Christ-centered ministry experience in Northern Utah.`;

  return {
    filename: targetFilename,
    title: wpPage.title,
    slug: wpPage.slug,
    template,
    heroImage,
    heroTagline,
    metaTitle,
    metaDescription,
    body,
    templateFields,
  };
}

/**
 * REQ-CONTENT-004: Convert GeneratedPage to YAML frontmatter + markdown
 */
function serializePageToMarkdoc(page: GeneratedPage): string {
  // Build frontmatter object
  const frontmatter: Record<string, unknown> = {
    title: page.title,
    heroImage: page.heroImage,
    heroTagline: page.heroTagline,
    seo: {
      metaTitle: page.metaTitle,
      metaDescription: page.metaDescription,
      ogTitle: '',
      ogDescription: '',
      twitterCard: 'summary_large_image',
      noIndex: false,
    },
    templateFields: {
      discriminant: page.template.discriminant,
    },
  };

  // Add template-specific fields
  if (page.templateFields && Object.keys(page.templateFields).length > 0) {
    frontmatter.templateFields = {
      discriminant: page.template.discriminant,
      value: page.templateFields,
    };
  }

  // P1 FIX: Use js-yaml to serialize with proper quoting for all edge cases
  const yamlStr = yaml.dump(frontmatter, {
    indent: 2,
    lineWidth: -1, // Don't wrap long lines
    quotingType: '"',
    forceQuotes: true, // Always quote to prevent YAML reserved words (yes, no, true, false, null)
  });

  // Combine frontmatter and body
  return `---\n${yamlStr}---\n\n${page.body}`;
}

/**
 * REQ-CONTENT-004: Main generation function (synchronous for test compatibility)
 */
export function generateFromWordPress(xmlPath: string): GeneratedPage[] {
  // P0 FIX: Add error handling for file I/O
  let xmlContent: string;
  try {
    xmlContent = fs.readFileSync(xmlPath, 'utf-8');
  } catch (err) {
    const error = err as NodeJS.ErrnoException;
    throw new Error(`Failed to read WordPress XML from ${xmlPath}: ${error.message}`);
  }

  // Parse WordPress XML (parseWordPressXML is async but returns Promise that resolves immediately)
  // We'll handle this synchronously by using a wrapper
  let wordpressPages: Awaited<ReturnType<typeof parseWordPressXML>> = [];

  // Since parseWordPressXML doesn't actually do async work, we can use a sync approach
  const parser = new (require('fast-xml-parser').XMLParser)({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    textNodeName: '#text',
    cdataPropName: '__cdata',
  });

  const result = parser.parse(xmlContent);
  const items = result.rss?.channel?.item || [];

  for (const item of items) {
    const postId = parseInt(item['wp:post_id']?.__cdata || item['wp:post_id'] || '0');
    const title = item.title?.__cdata || item.title || '';
    const slug = item['wp:post_name']?.__cdata || item['wp:post_name'] || '';
    const postType = item['wp:post_type']?.__cdata || item['wp:post_type'] || '';
    const status = item['wp:status']?.__cdata || item['wp:status'] || '';
    const content = item['content:encoded']?.__cdata || item['content:encoded'] || '';

    if (postType !== 'page' || status !== 'publish') {
      continue;
    }

    if (slug === '__trashed' || slug.includes('trashed')) {
      continue;
    }

    let hasElementor = false;
    let elementorData: any[] | undefined;

    const postmeta = Array.isArray(item['wp:postmeta'])
      ? item['wp:postmeta']
      : item['wp:postmeta']
      ? [item['wp:postmeta']]
      : [];

    for (const meta of postmeta) {
      const metaKey = meta['wp:meta_key']?.__cdata || meta['wp:meta_key'];

      if (metaKey === '_elementor_data') {
        const metaValue = meta['wp:meta_value']?.__cdata || meta['wp:meta_value'];

        if (metaValue && metaValue.trim() !== '') {
          try {
            elementorData = JSON.parse(metaValue);
            hasElementor = true;
          } catch (e) {
            // Skip invalid elementor data
          }
        }
        break;
      }
    }

    wordpressPages.push({
      postId,
      title,
      slug,
      postType,
      status,
      content,
      hasElementor,
      elementorData,
    });
  }

  const generatedPages: GeneratedPage[] = [];

  for (const mapping of PAGE_MAPPINGS) {
    const wpPage = wordpressPages.find((p) => p.slug === mapping.wordpressSlug);

    if (!wpPage) {
      console.warn(`Warning: WordPress page "${mapping.wordpressSlug}" not found`);
      continue;
    }

    const generatedPage = generatePage(wpPage, mapping.targetFilename);
    generatedPages.push(generatedPage);
  }

  return generatedPages;
}

/**
 * REQ-CONTENT-004: Write generated pages to disk
 */
export async function writeGeneratedPages(xmlPath: string = WORDPRESS_XML_PATH): Promise<void> {
  console.log('Reading WordPress XML export...');
  const pages = generateFromWordPress(xmlPath);
  console.log(`Generated ${pages.length} pages`);

  // Ensure content directory exists
  if (!fs.existsSync(CONTENT_DIR)) {
    fs.mkdirSync(CONTENT_DIR, { recursive: true });
  }

  // Write each page
  for (const page of pages) {
    // P0 FIX: Prevent path traversal attacks
    const sanitizedFilename = path.basename(page.filename);
    const filePath = path.join(CONTENT_DIR, sanitizedFilename);
    if (!filePath.startsWith(CONTENT_DIR)) {
      throw new Error(`Security: Invalid filename attempted: ${page.filename}`);
    }

    const content = serializePageToMarkdoc(page);

    try {
      fs.writeFileSync(filePath, content, 'utf-8');
    } catch (err) {
      const error = err as NodeJS.ErrnoException;
      console.error(`Failed to write ${page.filename}: ${error.message}`);
      throw error;
    }
    console.log(`✓ Generated: ${page.filename} (${page.template.type})`);
  }

  console.log(`\nSuccessfully generated ${pages.length} pages`);
}

// Allow running as script
if (require.main === module) {
  writeGeneratedPages()
    .then(() => {
      console.log('Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error generating pages:', error);
      process.exit(1);
    });
}
