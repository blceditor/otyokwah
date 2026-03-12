// REQ-FIX-005: Homepage Body Content Must Use MarkdocRenderer
// This test ensures the homepage renders markdown content properly instead of raw text

import { describe, test, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('REQ-FIX-005 — Homepage Body Content Rendering', () => {
  test('app/page.tsx imports MarkdocRenderer', async () => {
    const pagePath = path.join(process.cwd(), 'app', 'page.tsx');
    const pageContent = fs.readFileSync(pagePath, 'utf-8');

    // Should import MarkdocRenderer
    expect(pageContent).toMatch(/import.*MarkdocRenderer.*from/);
  });

  test('app/page.tsx uses MarkdocRenderer for body content, not raw <p> tag', async () => {
    const pagePath = path.join(process.cwd(), 'app', 'page.tsx');
    const pageContent = fs.readFileSync(pagePath, 'utf-8');

    // Should NOT have raw bodyContent in a <p> tag (the bug)
    expect(pageContent).not.toMatch(/<p>\{bodyContent\}<\/p>/);

    // Should use MarkdocRenderer component
    expect(pageContent).toMatch(/<MarkdocRenderer\s+content=\{bodyContent\}/);
  });

  test('homepage markdown content has headings that need rendering', async () => {
    const contentPath = path.join(process.cwd(), 'content', 'pages', 'index.mdoc');
    const content = fs.readFileSync(contentPath, 'utf-8');

    // Extract body content (after frontmatter)
    const bodyMatch = content.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);
    const bodyContent = bodyMatch ? bodyMatch[1].trim() : '';

    // Content should have Markdoc components or markdown headings
    expect(bodyContent).toMatch(/^##\s+/m); // h2 headings
    expect(bodyContent).toContain('{%'); // Markdoc components
  });
});
