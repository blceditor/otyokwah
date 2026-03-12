/**
 * Markdown Renderer Component (LEGACY — prefer MarkdocRenderer)
 * REQ-201: Proper markdown rendering with YouTube auto-embed and XSS protection
 *
 * This uses ReactMarkdown for plain markdown. The canonical renderer is
 * MarkdocRenderer (components/content/MarkdocRenderer.tsx), which supports
 * Markdoc's custom component syntax ({% %}) and all 38+ CMS components.
 *
 * MarkdownRenderer is still used for staff bio pages (app/staff/[slug]/page.tsx)
 * where content is plain markdown without Markdoc tags. Future plan: migrate
 * remaining usages to MarkdocRenderer so we have a single rendering path.
 *
 * Features:
 * - Renders markdown with proper HTML structure
 * - Auto-detects and embeds YouTube URLs
 * - Strips HTML comments
 * - Handles empty links gracefully
 * - XSS protection (blocks javascript: URLs, sanitizes HTML)
 * - Uses Next.js Image component for images
 * - Applies Tailwind typography classes
 */

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeRaw from 'rehype-raw';
import { YouTubeEmbed, extractVideoId } from './YouTubeEmbed';
import { InfoCard } from './InfoCard';

export interface MarkdownRendererProps {
  content: string;
}

/**
 * Custom sanitize schema to allow class attribute on divs for info-card-grid
 * Note: rehype-sanitize uses hast property names, which is 'className' for the class attribute
 */
const customSanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    '*': [
      ...(defaultSchema.attributes?.['*'] || []),
      ['className']
    ]
  }
};

/**
 * Strips HTML comments from markdown content
 */
function stripHtmlComments(content: string): string {
  return content.replace(/<!--[\s\S]*?-->/g, '');
}

/**
 * Detects if a line contains a bare YouTube URL
 */
function isYouTubeUrl(text: string): boolean {
  const trimmed = text.trim();
  return (
    (trimmed.startsWith('https://youtu.be/') ||
      trimmed.startsWith('https://www.youtube.com/watch') ||
      trimmed.startsWith('https://m.youtube.com/watch') ||
      trimmed.startsWith('https://youtube.com/watch')) &&
    !trimmed.includes('```') // Not in code block
  );
}

/**
 * Converts Markdoc YouTube tags to marker format
 * REQ-YT-001: Support {% youtube id="..." /%} syntax
 */
function convertMarkdocYouTubeTags(content: string): string {
  // Match {% youtube id="VIDEO_ID" /%} or {% youtube id="VIDEO_ID" title="..." /%}
  return content.replace(
    /\{%\s*youtube\s+id="([^"]+)"(?:\s+title="[^"]*")?\s*\/%\}/g,
    (_match, videoId) => `[YOUTUBE:${videoId}]`
  );
}

/**
 * Processes markdown content to prepare for rendering
 * - Strips HTML comments
 * - Converts Markdoc YouTube tags to marker format
 * - Converts bare YouTube URLs to placeholder for custom rendering
 */
function preprocessMarkdown(content: string): string {
  // Strip HTML comments first
  let processed = stripHtmlComments(content);

  // Convert Markdoc YouTube tags before processing URLs
  // REQ-YT-001: Support {% youtube id="..." /%} syntax
  processed = convertMarkdocYouTubeTags(processed);

  // Split by code blocks to avoid processing URLs inside them
  const parts = processed.split(/(```[\s\S]*?```|`[^`]+`)/);

  processed = parts.map((part, index) => {
    // Skip code blocks (odd indices)
    if (index % 2 === 1) {
      return part;
    }

    // Process regular text (even indices)
    const lines = part.split('\n');
    return lines.map(line => {
      if (isYouTubeUrl(line)) {
        // Convert to a special marker that will be handled by custom renderer
        const videoId = extractVideoId(line);
        if (videoId) {
          return `[YOUTUBE:${videoId}]`;
        }
      }
      return line;
    }).join('\n');
  }).join('');

  return processed;
}

/**
 * Parses InfoCard data from div children
 * Looks for pattern: h2/h3 followed by ul with optional icon attribute
 */
function parseInfoCardFromChildren(children: React.ReactNode): Array<{
  heading: string;
  icon?: string;
  items: string[];
}> {
  const cards: Array<{ heading: string; icon?: string; items: string[] }> = [];
  const childArray = React.Children.toArray(children);

  let i = 0;
  while (i < childArray.length) {
    const child = childArray[i];

    // Check if this is a heading - type can be string, component, or ReactMarkdown custom component
    const isHeading = React.isValidElement(child) &&
      (child.type === 'h2' || child.type === 'h3' ||
       (typeof child.type === 'function' && (child.type.name === 'h2' || child.type.name === 'h3')) ||
       ((child.props as Record<string, unknown>)?.node as Record<string, unknown>)?.tagName === 'h2' ||
       ((child.props as Record<string, unknown>)?.node as Record<string, unknown>)?.tagName === 'h3');

    if (isHeading) {
      const heading = extractTextFromReactNode((child as React.ReactElement).props.children);

      // Extract icon from heading text if present (e.g., "Why Work Here {icon=Heart}")
      const iconMatch = heading.match(/\{icon="?([^}"]+)"?\}/);
      const cleanHeading = iconMatch ? heading.replace(/\s*\{icon="?[^}"]*"?\}/, '') : heading;
      const icon = iconMatch?.[1];

      // Look for the next non-whitespace element - should be a ul
      let nextIdx = i + 1;
      while (nextIdx < childArray.length) {
        const candidate = childArray[nextIdx];
        if (typeof candidate === 'string' && candidate.trim() === '') {
          nextIdx++;
          continue;
        }
        break;
      }
      const nextChild = childArray[nextIdx];
      const isList = React.isValidElement(nextChild) &&
        (nextChild.type === 'ul' ||
         (typeof nextChild.type === 'function' && nextChild.type.name === 'ul') ||
         ((nextChild.props as Record<string, unknown>)?.node as Record<string, unknown>)?.tagName === 'ul');

      if (isList) {
        const items = extractListItems((nextChild as React.ReactElement).props.children);
        cards.push({ heading: cleanHeading, icon, items });
        i = nextIdx + 1; // Skip heading, whitespace, and list
        continue;
      }
    }
    i++;
  }

  return cards;
}

/**
 * Extracts text from React node recursively
 */
function extractTextFromReactNode(node: React.ReactNode): string {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractTextFromReactNode).join('');
  if (React.isValidElement(node)) {
    return extractTextFromReactNode(node.props.children);
  }
  return '';
}

/**
 * Extracts list items from ul children
 */
function extractListItems(children: React.ReactNode): string[] {
  const items: string[] = [];
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child) &&
      (child.type === 'li' ||
       (typeof child.type === 'function' && child.type.name === 'li') ||
       ((child.props as Record<string, unknown>)?.node as Record<string, unknown>)?.tagName === 'li')) {
      items.push(extractTextFromReactNode(child.props.children));
    }
  });
  return items;
}

/**
 * MarkdownRenderer Component
 */
export function MarkdownRenderer({ content }: MarkdownRendererProps): JSX.Element {
  const processedContent = preprocessMarkdown(content);

  return (
    <div className="prose prose-lg max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, customSanitizeSchema]]}
        components={{
          // Headings with Tailwind classes - downshift H1 to H2 for proper hierarchy
          h1: ({ ...props }) => (
            <h2 className="text-4xl font-bold mt-12 mb-8 text-bark" {...props} />
          ),
          h2: ({ ...props }) => (
            <h3 className="text-3xl font-bold mt-10 mb-6 text-bark" {...props} />
          ),
          h3: ({ ...props }) => (
            <h3 className="text-2xl font-bold mt-8 mb-4 text-bark" {...props} />
          ),

          // Paragraphs
          p: ({ children, ...props }) => {
            // Check if this paragraph contains a YouTube marker
            const childText = String(children);
            if (childText.startsWith('[YOUTUBE:') && childText.endsWith(']')) {
              const videoId = childText.slice(9, -1);
              return <YouTubeEmbed videoId={videoId} />;
            }

            return <p className="mb-4 leading-relaxed" {...props}>{children}</p>;
          },

          // Links - handle empty hrefs
          // REQ-DESIGN-002: Use accessible link color system
          a: ({ href, children, ...props }) => {
            // Block javascript: URLs for XSS protection
            if (href?.startsWith('javascript:') || href?.startsWith('data:')) {
              return <span>{children}</span>;
            }

            // Handle empty links - render as plain text
            if (!href || href === '' || href === '()') {
              return <span>{children}</span>;
            }

            return (
              <a
                href={href}
                className="text-link hover:text-link-light hover:underline font-medium visited:text-link-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2 transition-colors duration-200"
                {...props}
              >
                {children}
              </a>
            );
          },

          // Images with Next.js Image component
          img: ({ src, alt, ...props }) => {
            if (!src) return null;

            return (
              // eslint-disable-next-line @next/next/no-img-element -- CMS markdown images lack width/height
              <img
                src={src}
                alt={alt || ''}
                loading="lazy"
                className="rounded-lg shadow-md my-4 w-full h-auto"
                {...props}
              />
            );
          },

          // Code blocks - preserve without processing
          code: ({ inline, className, children, ...props }: { inline?: boolean; className?: string; children?: React.ReactNode }) => {
            if (inline) {
              return (
                <code className="bg-cream rounded px-1 py-0.5 text-sm font-mono" {...props}>
                  {children}
                </code>
              );
            }

            return (
              <code
                className={`block bg-cream rounded p-4 text-sm font-mono overflow-x-auto ${className || ''}`}
                {...props}
              >
                {children}
              </code>
            );
          },

          // Lists
          ul: ({ ...props }) => (
            <ul className="list-disc list-inside mb-4 space-y-2" {...props} />
          ),
          ol: ({ ...props }) => (
            <ol className="list-decimal list-inside mb-4 space-y-2" {...props} />
          ),
          li: ({ ...props }) => (
            <li className="leading-relaxed" {...props} />
          ),

          // Strong and emphasis
          strong: ({ ...props }) => (
            <strong className="font-bold text-bark" {...props} />
          ),
          em: ({ ...props }) => (
            <em className="italic" {...props} />
          ),

          // Blockquotes
          blockquote: ({ ...props }) => (
            <blockquote className="border-l-4 border-secondary pl-4 italic my-4 text-bark/80" {...props} />
          ),

          // Divs - special handling for info-card-grid (staff-photo-grid handled via CSS)
          div: (props: React.HTMLAttributes<HTMLDivElement> & { node?: unknown }) => {
            const { className, children, ...restProps } = props;

            // Check className for special grid types
            const classNames = className || '';

            // REQ-STAFF-001: Staff photo grid - CSS handles styling via globals.css
            // The staff-photo-grid class applies grid layout and rounded-full to images

            if (classNames.includes('info-card-grid')) {
              const cards = parseInfoCardFromChildren(children);
              if (cards.length > 0) {
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-8 not-prose">
                    {cards.map((card, index) => (
                      <InfoCard
                        key={index}
                        heading={card.heading}
                        icon={card.icon}
                        items={card.items}
                      />
                    ))}
                  </div>
                );
              }
            }
            // Return regular div, filtering out 'node' prop
            return <div className={className} {...restProps}>{children}</div>;
          },
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}
