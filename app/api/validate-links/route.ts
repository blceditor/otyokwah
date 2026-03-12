/**
 * REQ-FUTURE-017: Link Validation API
 *
 * Validates links from page content:
 * - Internal links: Check if page exists in content folder
 * - External links: HEAD request with timeout
 * - Email: Format validation
 * - Phone: Format validation
 * - Anchor: Parse content for matching ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { cookies } from 'next/headers';
import { isKeystatiAuthenticated } from '@/lib/keystatic/auth';
import { isSsrfSafeUrl } from '@/lib/security/validate-ssrf';
import {
  parseLinks,
  validateEmail,
  validatePhoneNumber,
  type ParsedLink,
} from '@/lib/keystatic/linkParser';

export type ValidationStatus = 'valid' | 'warning' | 'broken' | 'skipped';

export interface LinkValidationResult {
  url: string;
  type: ParsedLink['type'];
  status: ValidationStatus;
  statusCode?: number;
  message?: string;
  text: string;
  position: number;
}

interface ValidateLinksRequest {
  content: string;
  currentSlug?: string; // For anchor link validation
}

interface ValidateLinksResponse {
  results: LinkValidationResult[];
  summary: {
    total: number;
    valid: number;
    warning: number;
    broken: number;
    skipped: number;
  };
}

const EXTERNAL_TIMEOUT_MS = 5000;
const CONTENT_DIR = path.join(process.cwd(), 'content', 'pages');

async function checkInternalLink(url: string): Promise<LinkValidationResult> {
  // Remove leading slash and .mdoc extension handling
  let pagePath = url.replace(/^\//, '').replace(/\/$/, '');

  // Handle index/home
  if (pagePath === '' || pagePath === '/') {
    pagePath = 'index';
  }

  // Check if file exists
  const mdocPath = path.join(CONTENT_DIR, `${pagePath}.mdoc`);

  try {
    await fs.access(mdocPath);
    return {
      url,
      type: 'internal',
      status: 'valid',
      message: 'Page exists',
      text: '',
      position: 0,
    };
  } catch {
    return {
      url,
      type: 'internal',
      status: 'broken',
      message: 'Page not found',
      text: '',
      position: 0,
    };
  }
}

async function checkExternalLink(
  url: string
): Promise<LinkValidationResult> {
  // REQ-SEC-004: SSRF check for external links
  // Round 7 fix: Return complete LinkValidationResult with all required fields
  if (!isSsrfSafeUrl(url)) {
    return {
      url,
      type: 'external',
      status: 'broken',
      statusCode: 0,
      message: 'URL blocked for security',
      text: '',
      position: 0,
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), EXTERNAL_TIMEOUT_MS);

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LinkValidator/1.0)',
      },
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      return {
        url,
        type: 'external',
        status: 'valid',
        statusCode: response.status,
        message: 'Link accessible',
        text: '',
        position: 0,
      };
    } else if (response.status >= 400 && response.status < 500) {
      return {
        url,
        type: 'external',
        status: 'broken',
        statusCode: response.status,
        message: `HTTP ${response.status}`,
        text: '',
        position: 0,
      };
    } else {
      return {
        url,
        type: 'external',
        status: 'warning',
        statusCode: response.status,
        message: `HTTP ${response.status}`,
        text: '',
        position: 0,
      };
    }
  } catch (error) {
    const message =
      error instanceof Error
        ? error.name === 'AbortError'
          ? 'Request timeout'
          : error.message
        : 'Failed to fetch';

    return {
      url,
      type: 'external',
      status: 'warning',
      message,
      text: '',
      position: 0,
    };
  }
}

function checkEmailLink(url: string): LinkValidationResult {
  const isValid = validateEmail(url);
  return {
    url,
    type: 'email',
    status: isValid ? 'valid' : 'warning',
    message: isValid ? 'Valid email format' : 'Invalid email format',
    text: '',
    position: 0,
  };
}

function checkPhoneLink(url: string): LinkValidationResult {
  const isValid = validatePhoneNumber(url);
  return {
    url,
    type: 'tel',
    status: isValid ? 'valid' : 'warning',
    message: isValid ? 'Valid phone format' : 'Invalid phone format',
    text: '',
    position: 0,
  };
}

function checkAnchorLink(
  url: string,
  content: string
): LinkValidationResult {
  const anchorId = url.replace('#', '');

  // Check if anchor exists in content
  // Look for: id="anchorId", {#anchorId}, or markdown headers
  const anchorPatterns = [
    new RegExp(`id=["']${anchorId}["']`, 'i'),
    new RegExp(`\\{#${anchorId}\\}`, 'i'),
    // Markdoc slug generation from headers
  ];

  const exists = anchorPatterns.some((pattern) => pattern.test(content));

  return {
    url,
    type: 'anchor',
    status: exists ? 'valid' : 'warning',
    message: exists ? 'Anchor found' : 'Anchor ID not found in content',
    text: '',
    position: 0,
  };
}

export async function POST(request: NextRequest) {
  try {
    // REQ-SEC-004: Auth check - validate-links was unauthenticated before Round 5
    const cookieStore = await cookies();
    const isAdmin = await isKeystatiAuthenticated(cookieStore);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: ValidateLinksRequest = await request.json();

    if (!body.content || typeof body.content !== 'string') {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    const links = parseLinks(body.content);
    const results: LinkValidationResult[] = [];

    // Process links with concurrency limit
    const CONCURRENCY = 5;
    const chunks: ParsedLink[][] = [];

    for (let i = 0; i < links.length; i += CONCURRENCY) {
      chunks.push(links.slice(i, i + CONCURRENCY));
    }

    for (const chunk of chunks) {
      const chunkResults = await Promise.all(
        chunk.map(async (link) => {
          let result: LinkValidationResult;

          switch (link.type) {
            case 'internal':
              result = await checkInternalLink(link.url);
              break;
            case 'external':
              result = await checkExternalLink(link.url);
              break;
            case 'email':
              result = checkEmailLink(link.url);
              break;
            case 'tel':
              result = checkPhoneLink(link.url);
              break;
            case 'anchor':
              result = checkAnchorLink(link.url, body.content);
              break;
            default:
              result = {
                url: link.url,
                type: link.type,
                status: 'skipped',
                message: 'Unknown link type',
                text: link.text,
                position: link.position,
              };
          }

          // Preserve original link text and position
          result.text = link.text;
          result.position = link.position;

          return result;
        })
      );

      results.push(...chunkResults);
    }

    // Calculate summary
    const summary = {
      total: results.length,
      valid: results.filter((r) => r.status === 'valid').length,
      warning: results.filter((r) => r.status === 'warning').length,
      broken: results.filter((r) => r.status === 'broken').length,
      skipped: results.filter((r) => r.status === 'skipped').length,
    };

    const response: ValidateLinksResponse = {
      results,
      summary,
    };

    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
