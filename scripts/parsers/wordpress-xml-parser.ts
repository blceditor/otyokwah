import { XMLParser } from 'fast-xml-parser';

export interface WordPressPage {
  postId: number;
  title: string;
  slug: string;
  postType: string;
  status: string;
  content: string;
  hasElementor: boolean;
  elementorData?: ElementorSection[];
}

export interface ElementorSection {
  id: string;
  elType: string;
  settings: Record<string, unknown>;
  elements: ElementorElement[];
}

export interface ElementorElement {
  id: string;
  elType: string;
  settings: Record<string, unknown>;
  elements?: ElementorWidget[];
  widgetType?: string;
}

export interface ElementorWidget {
  id: string;
  elType: string;
  settings: Record<string, unknown>;
  widgetType: string;
}

export async function parseWordPressXML(xmlContent: string): Promise<WordPressPage[]> {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    textNodeName: '#text',
    cdataPropName: '__cdata',
  });

  const result = parser.parse(xmlContent);

  // WordPress export structure: rss > channel > item[]
  const items = result.rss?.channel?.item || [];

  const pages: WordPressPage[] = [];

  for (const item of items) {
    // Extract basic metadata
    const postId = parseInt(item['wp:post_id']?.__cdata || item['wp:post_id'] || '0');
    const title = item.title?.__cdata || item.title || '';
    const slug = item['wp:post_name']?.__cdata || item['wp:post_name'] || '';
    const postType = item['wp:post_type']?.__cdata || item['wp:post_type'] || '';
    const status = item['wp:status']?.__cdata || item['wp:status'] || '';
    const content = item['content:encoded']?.__cdata || item['content:encoded'] || '';

    // Only process published pages (not posts, attachments, or drafts)
    if (postType !== 'page' || status !== 'publish') {
      continue;
    }

    // Skip trashed pages
    if (slug === '__trashed' || slug.includes('trashed')) {
      continue;
    }

    // Extract Elementor data if present
    let hasElementor = false;
    let elementorData: ElementorSection[] | undefined;

    // Post meta is an array of objects with wp:meta_key and wp:meta_value
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
            // Elementor data is JSON stored as string
            elementorData = JSON.parse(metaValue);
            hasElementor = true;
          } catch (e) {
            // If parsing fails, Elementor data is invalid
            console.error(`Failed to parse Elementor data for page ${slug}:`, e);
          }
        }
        break;
      }
    }

    pages.push({
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

  return pages;
}
