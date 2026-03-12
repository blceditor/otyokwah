/**
 * REQ-FUTURE-017: Link Parser
 *
 * Extracts links from Markdoc/markdown content for validation.
 */

export type LinkType = 'internal' | 'external' | 'anchor' | 'email' | 'tel';

export interface ParsedLink {
  url: string;
  type: LinkType;
  text: string;
  position: number; // Character position in content
}

/**
 * Parse content and extract all links
 */
export function parseLinks(content: string): ParsedLink[] {
  const links: ParsedLink[] = [];

  // Markdown link pattern: [text](url)
  const markdownLinkRegex = /\[([^\]]*)\]\(([^)]+)\)/g;
  let match;

  while ((match = markdownLinkRegex.exec(content)) !== null) {
    const text = match[1];
    const url = match[2].trim();
    const position = match.index;

    links.push({
      url,
      type: getLinkType(url),
      text: text || url,
      position,
    });
  }

  // HTML href pattern: href="url" or href='url'
  const hrefRegex = /href=["']([^"']+)["']/g;

  while ((match = hrefRegex.exec(content)) !== null) {
    const url = match[1].trim();
    const position = match.index;

    // Skip if already found as markdown link at similar position
    const isDuplicate = links.some(
      (l) => l.url === url && Math.abs(l.position - position) < 50
    );

    if (!isDuplicate) {
      links.push({
        url,
        type: getLinkType(url),
        text: url,
        position,
      });
    }
  }

  // Markdoc link component: {% link href="url" %}
  const markdocLinkRegex = /\{%\s*link\s+href=["']([^"']+)["'][^%]*%\}/g;

  while ((match = markdocLinkRegex.exec(content)) !== null) {
    const url = match[1].trim();
    const position = match.index;

    const isDuplicate = links.some(
      (l) => l.url === url && Math.abs(l.position - position) < 50
    );

    if (!isDuplicate) {
      links.push({
        url,
        type: getLinkType(url),
        text: url,
        position,
      });
    }
  }

  // Standalone URLs (not in markdown format)
  const standaloneUrlRegex =
    /(?<![[(])(https?:\/\/[^\s<>\]\)]+)/g;

  while ((match = standaloneUrlRegex.exec(content)) !== null) {
    const url = match[1].trim();
    const position = match.index;

    const isDuplicate = links.some(
      (l) => l.url === url && Math.abs(l.position - position) < 10
    );

    if (!isDuplicate) {
      links.push({
        url,
        type: 'external',
        text: url,
        position,
      });
    }
  }

  // Sort by position
  return links.sort((a, b) => a.position - b.position);
}

/**
 * Determine the type of link based on URL
 */
function getLinkType(url: string): LinkType {
  if (url.startsWith('mailto:')) {
    return 'email';
  }
  if (url.startsWith('tel:')) {
    return 'tel';
  }
  if (url.startsWith('#')) {
    return 'anchor';
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return 'external';
  }
  // Relative URLs are internal
  return 'internal';
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const address = email.replace('mailto:', '');
  return emailRegex.test(address);
}

/**
 * Validate phone number format
 */
export function validatePhoneNumber(tel: string): boolean {
  // Allow various formats: +1234567890, (123) 456-7890, 123-456-7890, etc.
  const phoneRegex = /^tel:\+?[\d\s\-().]+$/;
  return phoneRegex.test(tel);
}

/**
 * Get context around a link position
 */
export function getLinkContext(
  content: string,
  position: number,
  contextChars: number = 30
): string {
  const start = Math.max(0, position - contextChars);
  const end = Math.min(content.length, position + contextChars);
  let context = content.slice(start, end);

  if (start > 0) context = '...' + context;
  if (end < content.length) context = context + '...';

  return context;
}
