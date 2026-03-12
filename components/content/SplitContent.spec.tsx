// REQ-011: Split Content Component
import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SplitContent from './SplitContent';
import '@testing-library/jest-dom/vitest';

describe('REQ-011 — Split Content Component', () => {
  const MOCK_IMAGE = '/images/facilities/cabin.jpg';
  const MOCK_HEADING = 'Modern Facilities';
  const MOCK_CONTENT = 'Our newly renovated cabins provide comfortable accommodations with modern amenities while maintaining the rustic camp experience.';

  test('renders heading and content with image', () => {
    const { container } = render(
      <SplitContent
        image={MOCK_IMAGE}
        heading={MOCK_HEADING}
        content={MOCK_CONTENT}
        imagePosition="left"
      />
    );

    expect(container.querySelector('[data-testid="split-content"]')).toBeInTheDocument();
    expect(screen.getByText(MOCK_HEADING)).toBeInTheDocument();
    expect(screen.getByText(MOCK_CONTENT)).toBeInTheDocument();
    expect(container.querySelector('img')).toBeInTheDocument();
  });

  test('image position right renders without error', () => {
    const { container } = render(
      <SplitContent
        image={MOCK_IMAGE}
        heading={MOCK_HEADING}
        content={MOCK_CONTENT}
        imagePosition="right"
      />
    );

    expect(container.querySelector('[data-testid="split-content"]')).toBeInTheDocument();
    expect(screen.getByText(MOCK_HEADING)).toBeInTheDocument();
  });

  test('default image position renders without error', () => {
    render(
      <SplitContent
        image={MOCK_IMAGE}
        heading={MOCK_HEADING}
        content={MOCK_CONTENT}
      />
    );

    expect(screen.getByText(MOCK_HEADING)).toBeInTheDocument();
    expect(screen.getByText(MOCK_CONTENT)).toBeInTheDocument();
  });

  test('Next.js Image component used', () => {

    const { container } = render(
      <SplitContent
        image={MOCK_IMAGE}
        heading={MOCK_HEADING}
        content={MOCK_CONTENT}
        imagePosition="left"
      />
    );

    // Next.js Image adds specific attributes
    const img = container.querySelector('img');
    expect(img).toBeInTheDocument();

    // Next.js Image should have src or srcset
    const hasSrc = img?.hasAttribute('src') || img?.hasAttribute('srcset');
    expect(hasSrc).toBe(true);
  });

  test('content area supports rich text', () => {
    const RICH_CONTENT = '<p>First paragraph.</p><p>Second paragraph with <strong>bold text</strong>.</p>';


    render(
      <SplitContent
        image={MOCK_IMAGE}
        heading={MOCK_HEADING}
        content={RICH_CONTENT}
        imagePosition="left"
      />
    );

    // Should render HTML content
    expect(screen.getByText(/First paragraph/i)).toBeInTheDocument();
  });

  test('validates required props (image, content)', () => {

    // Should render with required props
    expect(() => {
      render(
        <SplitContent
          image={MOCK_IMAGE}
          heading={MOCK_HEADING}
          content={MOCK_CONTENT}
        />
      );
    }).not.toThrow();

    expect(screen.getByText(MOCK_HEADING)).toBeInTheDocument();
  });

  test('accessible (semantic HTML)', () => {

    const { container } = render(
      <SplitContent
        image={MOCK_IMAGE}
        heading={MOCK_HEADING}
        content={MOCK_CONTENT}
        imagePosition="left"
      />
    );

    // Should use semantic elements (section, article, or div with proper structure)
    const heading = screen.getByRole('heading', { name: MOCK_HEADING });
    expect(heading).toBeInTheDocument();

    // Image should have alt text
    const img = container.querySelector('img');
    expect(img).toHaveAttribute('alt');
  });
});

describe('REQ-SEC-001 — XSS Protection in SplitContent', () => {
  const MOCK_IMAGE = '/images/facilities/cabin.jpg';
  const MOCK_HEADING = 'Test Heading';

  test('strips script tags from content', () => {
    const MALICIOUS_CONTENT = '<p>Safe content</p><script>alert("XSS")</script><p>More content</p>';

    const { container } = render(
      <SplitContent
        image={MOCK_IMAGE}
        heading={MOCK_HEADING}
        content={MALICIOUS_CONTENT}
        imagePosition="left"
      />
    );

    // Script tags should be removed
    const scriptElements = container.querySelectorAll('script');
    expect(scriptElements).toHaveLength(0);

    // Safe content should remain
    expect(screen.getByText(/Safe content/i)).toBeInTheDocument();
    expect(screen.getByText(/More content/i)).toBeInTheDocument();
  });

  test('removes inline event handlers from content', () => {
    const MALICIOUS_CONTENT = '<p onclick="alert(\'XSS\')">Click me</p><img src="x" onerror="alert(\'XSS\')" /><a href="#" onmouseover="alert(\'XSS\')">Hover me</a>';

    const { container } = render(
      <SplitContent
        image={MOCK_IMAGE}
        heading={MOCK_HEADING}
        content={MALICIOUS_CONTENT}
        imagePosition="left"
      />
    );

    // Check that no elements have event handler attributes
    const allElements = container.querySelectorAll('*');
    allElements.forEach((element) => {
      const attributes = Array.from(element.attributes);
      const hasEventHandler = attributes.some((attr) =>
        attr.name.toLowerCase().startsWith('on')
      );
      expect(hasEventHandler).toBe(false);
    });

    // Safe text content should remain
    expect(screen.getByText(/Click me/i)).toBeInTheDocument();
  });

  test('preserves safe HTML elements (paragraphs, headings, links)', () => {
    const SAFE_HTML = '<h3>Subheading</h3><p>Paragraph with <strong>bold</strong> and <em>italic</em> text.</p><a href="/safe-link">Safe link</a><ul><li>List item</li></ul>';

    render(
      <SplitContent
        image={MOCK_IMAGE}
        heading={MOCK_HEADING}
        content={SAFE_HTML}
        imagePosition="left"
      />
    );

    // All safe elements should be preserved
    expect(screen.getByText('Subheading')).toBeInTheDocument();
    expect(screen.getByText(/bold/i)).toBeInTheDocument();
    expect(screen.getByText(/italic/i)).toBeInTheDocument();

    const link = screen.getByRole('link', { name: /Safe link/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/safe-link');

    expect(screen.getByText('List item')).toBeInTheDocument();
  });

  test('removes malicious iframe tags', () => {
    const MALICIOUS_CONTENT = '<p>Safe content</p><iframe src="https://evil.com/malware"></iframe><p>More content</p>';

    const { container } = render(
      <SplitContent
        image={MOCK_IMAGE}
        heading={MOCK_HEADING}
        content={MALICIOUS_CONTENT}
        imagePosition="left"
      />
    );

    // Iframe should be removed
    const iframeElements = container.querySelectorAll('iframe');
    expect(iframeElements).toHaveLength(0);

    // Safe content should remain
    expect(screen.getByText(/Safe content/i)).toBeInTheDocument();
  });

  test('removes malicious object and embed tags', () => {
    const MALICIOUS_CONTENT = '<p>Safe content</p><object data="https://evil.com/malware"></object><embed src="malware.swf"><p>More content</p>';

    const { container } = render(
      <SplitContent
        image={MOCK_IMAGE}
        heading={MOCK_HEADING}
        content={MALICIOUS_CONTENT}
        imagePosition="left"
      />
    );

    // Object and embed tags should be removed
    const objectElements = container.querySelectorAll('object');
    const embedElements = container.querySelectorAll('embed');
    expect(objectElements).toHaveLength(0);
    expect(embedElements).toHaveLength(0);

    // Safe content should remain
    expect(screen.getByText(/Safe content/i)).toBeInTheDocument();
  });

  test('neutralizes javascript: protocol in links', () => {
    const MALICIOUS_CONTENT = '<a href="javascript:alert(\'XSS\')">Click me</a><a href="https://safe.com">Safe link</a>';

    const { container } = render(
      <SplitContent
        image={MOCK_IMAGE}
        heading={MOCK_HEADING}
        content={MALICIOUS_CONTENT}
        imagePosition="left"
      />
    );

    const links = container.querySelectorAll('a');
    links.forEach((link) => {
      const href = link.getAttribute('href') || '';
      // Should not contain javascript: protocol
      expect(href.toLowerCase()).not.toContain('javascript:');
    });

    // Safe link should be preserved
    const safeLink = screen.getByRole('link', { name: /Safe link/i });
    expect(safeLink).toHaveAttribute('href', 'https://safe.com');
  });

  test('removes data: URIs that could contain malicious content', () => {
    const MALICIOUS_CONTENT = '<img src="data:text/html,<script>alert(\'XSS\')</script>" /><a href="data:text/html,<script>alert(\'XSS\')</script>">Click</a>';

    const { container } = render(
      <SplitContent
        image={MOCK_IMAGE}
        heading={MOCK_HEADING}
        content={MALICIOUS_CONTENT}
        imagePosition="left"
      />
    );

    // Check all img and a elements
    const images = container.querySelectorAll('img[src^="data:"]');
    const dataLinks = container.querySelectorAll('a[href^="data:"]');

    // Data URIs with HTML content should be removed
    images.forEach((img) => {
      const src = img.getAttribute('src') || '';
      expect(src).not.toContain('text/html');
    });

    dataLinks.forEach((link) => {
      const href = link.getAttribute('href') || '';
      expect(href).not.toContain('text/html');
    });
  });

  test('handles SVG with embedded scripts', () => {
    const MALICIOUS_CONTENT = '<svg onload="alert(\'XSS\')"><script>alert("XSS")</script></svg>';

    const { container } = render(
      <SplitContent
        image={MOCK_IMAGE}
        heading={MOCK_HEADING}
        content={MALICIOUS_CONTENT}
        imagePosition="left"
      />
    );

    // SVG should not have onload handler
    const svgElements = container.querySelectorAll('svg');
    svgElements.forEach((svg) => {
      expect(svg.hasAttribute('onload')).toBe(false);
    });

    // Script inside SVG should be removed
    const scriptElements = container.querySelectorAll('script');
    expect(scriptElements).toHaveLength(0);
  });

  test('prevents DOM clobbering attacks', () => {
    const MALICIOUS_CONTENT = '<form name="createElement"><input name="innerHTML"></form><img name="body" />';

    const { container } = render(
      <SplitContent
        image={MOCK_IMAGE}
        heading={MOCK_HEADING}
        content={MALICIOUS_CONTENT}
        imagePosition="left"
      />
    );

    // Elements with problematic name attributes should have them removed
    const namedElements = container.querySelectorAll('[name="createElement"], [name="innerHTML"], [name="body"]');

    namedElements.forEach((element) => {
      const name = element.getAttribute('name');
      const dangerousNames = ['createElement', 'innerHTML', 'body', 'write', 'writeln'];
      expect(dangerousNames.includes(name || '')).toBe(false);
    });
  });

  test('sanitizes multiple XSS vectors in single content string', () => {
    const MULTI_VECTOR_CONTENT = `
      <p>Safe paragraph</p>
      <script>alert('XSS1')</script>
      <img src="x" onerror="alert('XSS2')" />
      <a href="javascript:alert('XSS3')">Link</a>
      <iframe src="evil.com"></iframe>
      <div onclick="alert('XSS4')">Click</div>
      <svg onload="alert('XSS5')"></svg>
    `;

    const { container } = render(
      <SplitContent
        image={MOCK_IMAGE}
        heading={MOCK_HEADING}
        content={MULTI_VECTOR_CONTENT}
        imagePosition="left"
      />
    );

    // None of the XSS vectors should be present
    expect(container.querySelectorAll('script')).toHaveLength(0);
    expect(container.querySelectorAll('iframe')).toHaveLength(0);

    const allElements = container.querySelectorAll('*');
    allElements.forEach((element) => {
      const attributes = Array.from(element.attributes);
      const hasEventHandler = attributes.some((attr) =>
        attr.name.toLowerCase().startsWith('on')
      );
      expect(hasEventHandler).toBe(false);

      const href = element.getAttribute('href');
      if (href) {
        expect(href.toLowerCase()).not.toContain('javascript:');
      }
    });

    // Safe content should remain
    expect(screen.getByText(/Safe paragraph/i)).toBeInTheDocument();
  });

  test('handles empty content string safely', () => {
    const EMPTY_CONTENT = '';

    expect(() => {
      render(
        <SplitContent
          image={MOCK_IMAGE}
          heading={MOCK_HEADING}
          content={EMPTY_CONTENT}
          imagePosition="left"
        />
      );
    }).not.toThrow();
  });

  test('handles malformed HTML gracefully', () => {
    const MALFORMED_HTML = '<p>Unclosed paragraph<div>Nested incorrectly<strong>Bold</div>';

    expect(() => {
      render(
        <SplitContent
          image={MOCK_IMAGE}
          heading={MOCK_HEADING}
          content={MALFORMED_HTML}
          imagePosition="left"
        />
      );
    }).not.toThrow();

    // Content should still be visible
    expect(screen.getByText(/Unclosed paragraph/i)).toBeInTheDocument();
  });

  test('preserves safe HTML5 elements (article, section, aside)', () => {
    const SAFE_HTML5 = '<article><section><h4>Section heading</h4><p>Content</p></section><aside>Sidebar</aside></article>';

    render(
      <SplitContent
        image={MOCK_IMAGE}
        heading={MOCK_HEADING}
        content={SAFE_HTML5}
        imagePosition="left"
      />
    );

    expect(screen.getByText('Section heading')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByText('Sidebar')).toBeInTheDocument();
  });

  test('removes style tags that could contain expression-based XSS', () => {
    const MALICIOUS_CONTENT = '<p>Content</p><style>body { background: expression(alert("XSS")); }</style>';

    const { container } = render(
      <SplitContent
        image={MOCK_IMAGE}
        heading={MOCK_HEADING}
        content={MALICIOUS_CONTENT}
        imagePosition="left"
      />
    );

    // Style tags should be removed
    const styleElements = container.querySelectorAll('style');
    expect(styleElements).toHaveLength(0);

    // Safe content should remain
    expect(screen.getByText(/Content/i)).toBeInTheDocument();
  });

  test('prevents mutation XSS (mXSS) attacks', () => {
    const MXSS_CONTENT = '<noscript><p>Content</p></noscript><form><math><mtext></form><form><mglyph><style></math><img src onerror=alert(1)>';

    const { container } = render(
      <SplitContent
        image={MOCK_IMAGE}
        heading={MOCK_HEADING}
        content={MXSS_CONTENT}
        imagePosition="left"
      />
    );

    // No event handlers should be present after mutation
    const allElements = container.querySelectorAll('*');
    allElements.forEach((element) => {
      const attributes = Array.from(element.attributes);
      const hasEventHandler = attributes.some((attr) =>
        attr.name.toLowerCase().startsWith('on')
      );
      expect(hasEventHandler).toBe(false);
    });
  });
});
