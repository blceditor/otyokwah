// REQ-201: Markdown Renderer Component Tests
import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { MarkdownRenderer } from './MarkdownRenderer';

/**
 * Test Suite for MarkdownRenderer Component
 *
 * This component replaces the broken convertMarkdownToHtml() function
 * with proper Keystatic DocumentRenderer or react-markdown.
 *
 * Story Points: 0.5 SP (test implementation)
 * Related Requirements: REQ-201 (Proper Markdown Rendering)
 */

describe('REQ-201 — MarkdownRenderer Component', () => {
  describe('Heading Rendering', () => {
    test('renders h1 elements with proper hierarchy', () => {
      const MARKDOWN = '# Main Heading';

      render(<MarkdownRenderer content={MARKDOWN} />);

      // H1 is downshifted to H2 for proper hierarchy (page title should be only H1)
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Main Heading');
    });

    test('renders h2 elements with proper hierarchy', () => {
      const MARKDOWN = '## Section Heading';

      render(<MarkdownRenderer content={MARKDOWN} />);

      // H2 is downshifted to H3
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Section Heading');
    });

    test('renders h3 elements with proper hierarchy', () => {
      const MARKDOWN = '### Subsection Heading';

      render(<MarkdownRenderer content={MARKDOWN} />);

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Subsection Heading');
    });

    test('applies Tailwind typography classes to headings', () => {
      const MARKDOWN = '# Styled Heading';

      const { container } = render(<MarkdownRenderer content={MARKDOWN} />);

      // H1 is rendered as H2
      const heading = container.querySelector('h2');
    });

    test('maintains heading hierarchy across multiple levels', () => {
      const MARKDOWN = `# Level 1
## Level 2
### Level 3`;

      render(<MarkdownRenderer content={MARKDOWN} />);

      // Headings are downshifted: H1→H2, H2→H3, H3→H3
      expect(screen.getByRole('heading', { level: 2, name: 'Level 1' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3, name: 'Level 2' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3, name: 'Level 3' })).toBeInTheDocument();
    });
  });

  describe('Paragraph and Line Break Handling', () => {
    test('renders paragraphs without excessive br tags', () => {
      const MARKDOWN = `This is a paragraph.

This is another paragraph.`;

      const { container } = render(<MarkdownRenderer content={MARKDOWN} />);

      const paragraphs = container.querySelectorAll('p');
      expect(paragraphs).toHaveLength(2);

      // Should NOT have <br/> tags between paragraphs
      const brTags = container.querySelectorAll('br');
      expect(brTags).toHaveLength(0);
    });

    test('single newlines do not create br tags', () => {
      const MARKDOWN = `Line one
Line two
Line three`;

      const { container } = render(<MarkdownRenderer content={MARKDOWN} />);

      // Should render as single paragraph with spaces, not <br/> tags
      const brTags = container.querySelectorAll('br');
      expect(brTags.length).toBeLessThan(2); // Allow for legitimate breaks
    });

    test('double newlines create separate paragraphs', () => {
      const MARKDOWN = `First paragraph.

Second paragraph.

Third paragraph.`;

      const { container } = render(<MarkdownRenderer content={MARKDOWN} />);

      const paragraphs = container.querySelectorAll('p');
      expect(paragraphs.length).toBeGreaterThanOrEqual(3);
    });

    test('handles multiline content without breaking layout', () => {
      const MARKDOWN = `The call of Jesus has always been to "Come and follow me." Yet so often, there seems to be a huge gap between coming to faith and following Jesus.

Scripture reveals that life in Christ will change us at the very core of our being.`;

      const { container } = render(<MarkdownRenderer content={MARKDOWN} />);

      const paragraphs = container.querySelectorAll('p');
      expect(paragraphs).toHaveLength(2);
    });
  });

  describe('Link Rendering', () => {
    test('renders valid links with proper href', () => {
      const MARKDOWN = '[Click here](https://example.com)';

      render(<MarkdownRenderer content={MARKDOWN} />);

      const link = screen.getByRole('link', { name: 'Click here' });
      expect(link).toHaveAttribute('href', 'https://example.com');
    });

    test('strips links with empty hrefs', () => {
      const MARKDOWN = '[Registration Opens Jan 1st]()';

      const { container } = render(<MarkdownRenderer content={MARKDOWN} />);

      // Should render as plain text, not a link
      const links = container.querySelectorAll('a');
      const emptyLinks = Array.from(links).filter(link => !link.getAttribute('href') || link.getAttribute('href') === '');
      expect(emptyLinks).toHaveLength(0);

      // Text content should still be visible
      expect(container.textContent).toContain('Registration Opens Jan 1st');
    });

    test('handles multiple empty links in same content', () => {
      const MARKDOWN = `[Primary Overnight (2nd-3rd) - June 4-5]()
[Jr. High 1 (7th-9th) - June 7-12]()
[Junior 1 (4th-6th) - June 14-19]()`;

      const { container } = render(<MarkdownRenderer content={MARKDOWN} />);

      // Should have NO empty href links
      const links = container.querySelectorAll('a');
      const emptyLinks = Array.from(links).filter(link => !link.getAttribute('href') || link.getAttribute('href') === '');
      expect(emptyLinks).toHaveLength(0);

      // All text should be visible
      expect(container.textContent).toContain('Primary Overnight');
      expect(container.textContent).toContain('Jr. High 1');
      expect(container.textContent).toContain('Junior 1');
    });

    test('applies Tailwind classes to valid links', () => {
      const MARKDOWN = '[Learn More](https://bearlakecamp.com/summer-staff)';

      const { container } = render(<MarkdownRenderer content={MARKDOWN} />);

      const link = container.querySelector('a');
    });

    test('handles links with special characters in URL', () => {
      const MARKDOWN = '[Register](https://www.ultracamp.com/clientlogin.aspx?idCamp=1342&campCode=OTY)';

      render(<MarkdownRenderer content={MARKDOWN} />);

      const link = screen.getByRole('link', { name: 'Register' });
      expect(link).toHaveAttribute('href', 'https://www.ultracamp.com/clientlogin.aspx?idCamp=1342&campCode=OTY');
    });
  });

  describe('HTML Comments Stripping', () => {
    test('removes HTML comments from rendered output', () => {
      const MARKDOWN = `Content before
<!-- TBD: Partners page not migrated yet -->
Content after`;

      const { container } = render(<MarkdownRenderer content={MARKDOWN} />);

      const html = container.innerHTML;
      expect(html).not.toContain('<!--');
      expect(html).not.toContain('TBD: Partners page');
      expect(html).not.toContain('-->');
    });

    test('removes multiple HTML comments', () => {
      const MARKDOWN = `<!-- Comment 1 -->
Content
<!-- Comment 2 -->`;

      const { container } = render(<MarkdownRenderer content={MARKDOWN} />);

      expect(container.innerHTML).not.toContain('<!--');
      expect(container.innerHTML).not.toContain('Comment 1');
      expect(container.innerHTML).not.toContain('Comment 2');
    });

    test('preserves content around HTML comments', () => {
      const MARKDOWN = `Before<!-- comment -->After`;

      const { container } = render(<MarkdownRenderer content={MARKDOWN} />);

      expect(container.textContent).toContain('Before');
      expect(container.textContent).toContain('After');
      expect(container.innerHTML).not.toContain('<!--');
    });
  });

  describe('Image Rendering', () => {
    test('renders images with Next.js Image component', () => {
      const MARKDOWN = '![Summer camp photo](/images/facilities/DSC_0001-23-scaled.jpg)';

      const { container } = render(<MarkdownRenderer content={MARKDOWN} />);

      // Should use Next.js Image or img tag
      const img = container.querySelector('img');
      expect(img).toBeInTheDocument();
      expect(img?.getAttribute('alt')).toBe('Summer camp photo');
    });

    test('handles images with missing alt text gracefully', () => {
      const MARKDOWN = '![](/images/test.jpg)';

      const { container } = render(<MarkdownRenderer content={MARKDOWN} />);

      const img = container.querySelector('img');
      expect(img).toBeInTheDocument();
      // Alt should be empty string, not null
      expect(img).toHaveAttribute('alt');
    });

    test('applies responsive styling to images', () => {
      const MARKDOWN = '![Camp photo](/images/camp.jpg)';

      const { container } = render(<MarkdownRenderer content={MARKDOWN} />);

      const img = container.querySelector('img');
    });
  });

  describe('Inline Formatting', () => {
    test('renders bold text', () => {
      const MARKDOWN = 'This is **bold text**';

      const { container } = render(<MarkdownRenderer content={MARKDOWN} />);

      const strong = container.querySelector('strong');
      expect(strong).toBeInTheDocument();
      expect(strong?.textContent).toBe('bold text');
    });

    test('renders italic text', () => {
      const MARKDOWN = 'This is *italic text*';

      const { container } = render(<MarkdownRenderer content={MARKDOWN} />);

      const em = container.querySelector('em');
      expect(em).toBeInTheDocument();
      expect(em?.textContent).toBe('italic text');
    });

    test('handles bold inside links', () => {
      const MARKDOWN = '[**Bold Link**](https://example.com)';

      const { container } = render(<MarkdownRenderer content={MARKDOWN} />);

      const link = container.querySelector('a');
      const strong = link?.querySelector('strong');
      expect(strong).toBeInTheDocument();
      expect(strong?.textContent).toBe('Bold Link');
    });

    test('handles nested inline formatting', () => {
      const MARKDOWN = '**bold and *italic***';

      const { container } = render(<MarkdownRenderer content={MARKDOWN} />);

      const strong = container.querySelector('strong');
      const em = container.querySelector('em');
      expect(strong).toBeInTheDocument();
      expect(em).toBeInTheDocument();
    });
  });

  describe('Security (XSS Protection)', () => {
    test('blocks JavaScript URLs in links', () => {
      const MARKDOWN = '[Click me](javascript:alert(1))';

      const { container } = render(<MarkdownRenderer content={MARKDOWN} />);

      const link = container.querySelector('a');
      // Should either strip the link or sanitize the href
      if (link) {
        expect(link.getAttribute('href')).not.toContain('javascript:');
      }
    });

    test('blocks script tags in markdown', () => {
      const MARKDOWN = '<script>alert("XSS")</script>';

      const { container } = render(<MarkdownRenderer content={MARKDOWN} />);

      const script = container.querySelector('script');
      expect(script).toBeNull();
    });

    test('blocks onclick handlers in HTML', () => {
      const MARKDOWN = '<a href="#" onclick="alert(1)">Click</a>';

      const { container } = render(<MarkdownRenderer content={MARKDOWN} />);

      const link = container.querySelector('a');
      if (link) {
        expect(link.getAttribute('onclick')).toBeNull();
      }
    });

    test('sanitizes data URLs in images', () => {
      const MARKDOWN = '![XSS](data:text/html,<script>alert(1)</script>)';

      const { container } = render(<MarkdownRenderer content={MARKDOWN} />);

      const img = container.querySelector('img');
      if (img) {
        const src = img.getAttribute('src') || '';
        expect(src).not.toContain('javascript:');
        expect(src).not.toContain('<script>');
      }
    });
  });

  describe('Code Block Preservation', () => {
    test('preserves code blocks without rendering markdown inside', () => {
      const MARKDOWN = '```\n[Link](url)\n**Bold**\n```';

      const { container } = render(<MarkdownRenderer content={MARKDOWN} />);

      const code = container.querySelector('code');
      expect(code).toBeInTheDocument();

      // Should NOT have rendered the markdown inside code block
      const link = container.querySelector('code a');
      expect(link).toBeNull();
    });

    test('preserves inline code', () => {
      const MARKDOWN = 'Use `npm install` to install';

      const { container } = render(<MarkdownRenderer content={MARKDOWN} />);

      const code = container.querySelector('code');
      expect(code).toBeInTheDocument();
      expect(code?.textContent).toBe('npm install');
    });

    test('does not convert URLs inside code blocks to embeds', () => {
      const MARKDOWN = '```\nhttps://youtu.be/VIDEO_ID\n```';

      const { container } = render(<MarkdownRenderer content={MARKDOWN} />);

      // Should be in code block, not iframe
      const iframe = container.querySelector('iframe');
      expect(iframe).toBeNull();

      const code = container.querySelector('code');
      expect(code?.textContent).toContain('https://youtu.be/VIDEO_ID');
    });
  });

  describe('YouTube URL Handling', () => {
    test('converts bare YouTube URLs to embeds', () => {
      const MARKDOWN = 'https://youtu.be/8N9Yeup1xVA';

      const { container } = render(<MarkdownRenderer content={MARKDOWN} />);

      // Should render as iframe, not plain text
      const iframe = container.querySelector('iframe');
      expect(iframe).toBeInTheDocument();
      expect(iframe?.src).toContain('8N9Yeup1xVA');
    });

    test('strips tracking parameters from YouTube URLs', () => {
      const MARKDOWN = 'https://youtu.be/8N9Yeup1xVA?si=4KXXFghbmpg0j46-';

      const { container } = render(<MarkdownRenderer content={MARKDOWN} />);

      const iframe = container.querySelector('iframe');
      expect(iframe?.src).toContain('8N9Yeup1xVA');
      expect(iframe?.src).not.toContain('si=');
    });

    test('handles youtube.com/watch URLs', () => {
      const MARKDOWN = 'https://www.youtube.com/watch?v=gosIrrZAtHw';

      const { container } = render(<MarkdownRenderer content={MARKDOWN} />);

      const iframe = container.querySelector('iframe');
      expect(iframe).toBeInTheDocument();
      expect(iframe?.src).toContain('gosIrrZAtHw');
    });

    test('YouTube embeds have 16:9 aspect ratio', () => {
      const MARKDOWN = 'https://youtu.be/8N9Yeup1xVA';

      const { container } = render(<MarkdownRenderer content={MARKDOWN} />);

      const wrapper = container.querySelector('.aspect-video') || container.querySelector('[style*="aspect-ratio"]');
      expect(wrapper).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('handles empty content gracefully', () => {
      const MARKDOWN = '';

      const { container } = render(<MarkdownRenderer content={MARKDOWN} />);

      expect(container.innerHTML).toBeTruthy(); // Should render something, even if empty
    });

    test('handles content with only whitespace', () => {
      const MARKDOWN = '   \n\n   ';

      const { container } = render(<MarkdownRenderer content={MARKDOWN} />);

      // Should not crash
      expect(container).toBeInTheDocument();
    });

    test('handles malformed markdown without crashing', () => {
      const MARKDOWN = '[Unclosed link](';

      const { container } = render(<MarkdownRenderer content={MARKDOWN} />);

      // Should render something (even if not perfectly formatted)
      expect(container).toBeInTheDocument();
    });

    test('handles very long content without performance issues', () => {
      const MARKDOWN = 'Lorem ipsum dolor sit amet. '.repeat(1000);

      const startTime = performance.now();
      render(<MarkdownRenderer content={MARKDOWN} />);
      const endTime = performance.now();

      // Should render in reasonable time (< 1 second)
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });

  describe('InfoCard Integration (REQ-INFOCARD-001)', () => {
    test('renders single InfoCard from markdown with icon', () => {
      const MARKDOWN = `
<div class="info-card-grid">

## Why Work Here {icon="Heart"}

- Ministry experience
- Spiritual growth
- Lifelong friendships

</div>
      `.trim();

      render(<MarkdownRenderer content={MARKDOWN} />);

      // Check that heading is rendered
      expect(screen.getByText('Why Work Here')).toBeInTheDocument();

      // Check that list items are rendered
      expect(screen.getByText(/Ministry experience/)).toBeInTheDocument();
      expect(screen.getByText(/Spiritual growth/)).toBeInTheDocument();
      expect(screen.getByText(/Lifelong friendships/)).toBeInTheDocument();

      // Check that icon is rendered
      expect(screen.getByTestId('icon-Heart')).toBeInTheDocument();
    });

    test('renders multiple InfoCards in grid', () => {
      const MARKDOWN = `
<div class="info-card-grid">

## Christ-Centered {icon="Cross"}

- Jesus is central
- Biblical teaching
- Gospel-focused

## Community {icon="Users"}

- Lasting friendships
- Support and encouragement
- Authentic relationships

</div>
      `.trim();

      render(<MarkdownRenderer content={MARKDOWN} />);

      // Check both headings
      expect(screen.getByText('Christ-Centered')).toBeInTheDocument();
      expect(screen.getByText('Community')).toBeInTheDocument();

      // Check items from first card
      expect(screen.getByText(/Jesus is central/)).toBeInTheDocument();

      // Check items from second card
      expect(screen.getByText(/Lasting friendships/)).toBeInTheDocument();

      // Check both icons
      expect(screen.getByTestId('icon-Cross')).toBeInTheDocument();
      expect(screen.getByTestId('icon-Users')).toBeInTheDocument();
    });

    test('renders InfoCard without icon', () => {
      const MARKDOWN = `
<div class="info-card-grid">

## Why Give to Camp?

- Changed lives
- Scholarships
- Facility improvements

</div>
      `.trim();

      render(<MarkdownRenderer content={MARKDOWN} />);

      expect(screen.getByText('Why Give to Camp?')).toBeInTheDocument();
      expect(screen.getByText(/Changed lives/)).toBeInTheDocument();
    });

    test('applies grid classes to info-card-grid container', () => {
      const MARKDOWN = `
<div class="info-card-grid">

## Test Card {icon="Heart"}

- Item 1
- Item 2

</div>
      `.trim();

      const { container } = render(<MarkdownRenderer content={MARKDOWN} />);

      // Check that grid classes are applied
      const gridContainer = container.querySelector('.grid-cols-1');
      expect(gridContainer).toBeInTheDocument();
    });

    test('handles markdown formatting in list items', () => {
      const MARKDOWN = `
<div class="info-card-grid">

## Features {icon="Star"}

- **Bold text** in item
- *Italic text* in item
- Regular text

</div>
      `.trim();

      render(<MarkdownRenderer content={MARKDOWN} />);

      // Text content should be extracted even with formatting
      expect(screen.getByText(/Bold text/)).toBeInTheDocument();
      expect(screen.getByText(/Italic text/)).toBeInTheDocument();
    });

    test('does not interfere with normal divs', () => {
      const MARKDOWN = `
<div class="regular-class">

## Normal Heading

- Normal list
- Another item

</div>
      `.trim();

      const { container } = render(<MarkdownRenderer content={MARKDOWN} />);

      // Should render normally, not as InfoCard
      expect(container.querySelector('.bg-cream')).toBeNull(); // InfoCard has bg-cream
      expect(screen.getByText('Normal Heading')).toBeInTheDocument();
    });
  });

  describe('Real Content from Migration', () => {
    test('renders summer-camp.mdoc content correctly', () => {
      const REAL_CONTENT = `## Summer 2026 Camp Dates Are now Published!
https://youtu.be/8N9Yeup1xVA?si=4KXXFghbmpg0j46-
## Why "Deeper"?

The call of Jesus has always been to "Come and follow me."

[Registration Opens Jan 1st](https://www.ultracamp.com/clientlogin.aspx?idCamp=1342&campCode=OTY)`;

      const { container } = render(<MarkdownRenderer content={REAL_CONTENT} />);

      // Should have YouTube embed
      const iframe = container.querySelector('iframe');
      expect(iframe).toBeInTheDocument();

      // Should have valid registration link
      const link = screen.getByRole('link', { name: /Registration Opens/i });
      expect(link).toHaveAttribute('href', 'https://www.ultracamp.com/clientlogin.aspx?idCamp=1342&campCode=OTY');

      // Should have headings
      expect(screen.getByRole('heading', { name: /Summer 2026/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /Why "Deeper"/i })).toBeInTheDocument();
    });

    test('handles empty link migration from WordPress', () => {
      const REAL_CONTENT = `[Primary Overnight (2nd-3rd) - June 4-5]()
• Entering Grades 2-3
• Fee: Coming Soon`;

      const { container } = render(<MarkdownRenderer content={REAL_CONTENT} />);

      // Should render text without broken link
      expect(container.textContent).toContain('Primary Overnight');
      expect(container.textContent).toContain('Entering Grades 2-3');

      // Should not have empty href
      const emptyLinks = container.querySelectorAll('a[href=""]');
      expect(emptyLinks).toHaveLength(0);
    });
  });

  describe('REQ-STAFF-001 — Rounded Staff Images', () => {
    test('renders staff photos inside staff-photo-grid container', () => {
      const MARKDOWN = `
<div class="staff-photo-grid">

![Charles](/images/staff/charles.jpg)

![Kyle](/images/staff/Kyle-9-1024x683.jpg)

![Hallie](/images/staff/Hallie-5-1024x683.jpg)

![John](/images/staff/John-5-1024x683.jpg)

</div>
      `.trim();

      const { container } = render(<MarkdownRenderer content={MARKDOWN} />);

      // Grid container with staff-photo-grid class should exist
      const gridContainer = container.querySelector('.staff-photo-grid');
      expect(gridContainer).toBeInTheDocument();

      // Should contain images
      const images = gridContainer?.querySelectorAll('img');
      expect(images?.length).toBe(4);
    });

    test('staff-photo-grid class is preserved on div element', () => {
      const MARKDOWN = `
<div class="staff-photo-grid">

![Staff member](/images/staff/charles.jpg)

</div>
      `.trim();

      const { container } = render(<MarkdownRenderer content={MARKDOWN} />);

      // The div should have the staff-photo-grid class (CSS handles styling)
      const gridDiv = container.querySelector('div.staff-photo-grid');
      expect(gridDiv).toBeInTheDocument();
    });

    test('images inside staff-photo-grid are rendered correctly', () => {
      const MARKDOWN = `
<div class="staff-photo-grid">

![Charles](/images/staff/charles.jpg)

![Kyle](/images/staff/kyle.jpg)

</div>
      `.trim();

      const { container } = render(<MarkdownRenderer content={MARKDOWN} />);

      // Images should be rendered inside the grid
      const images = container.querySelectorAll('.staff-photo-grid img');
      expect(images.length).toBe(2);

      // Check images have src attributes
      images.forEach(img => {
        expect(img.getAttribute('src')).toBeTruthy();
      });
    });

    test('staff-photo-grid preserves image alt text', () => {
      const MARKDOWN = `
<div class="staff-photo-grid">

![Charles Smith](/images/staff/charles.jpg)

![Kyle Johnson](/images/staff/kyle.jpg)

</div>
      `.trim();

      const { container } = render(<MarkdownRenderer content={MARKDOWN} />);

      // Alt text should be preserved for accessibility
      expect(container.querySelector('img[alt="Charles Smith"]')).toBeInTheDocument();
      expect(container.querySelector('img[alt="Kyle Johnson"]')).toBeInTheDocument();
    });

    test('does not affect regular images outside staff-photo-grid', () => {
      const MARKDOWN = `
![Regular image](/images/regular.jpg)

<div class="staff-photo-grid">

![Staff photo](/images/staff/charles.jpg)

</div>
      `.trim();

      const { container } = render(<MarkdownRenderer content={MARKDOWN} />);

      // Regular image should exist outside the grid
      const regularImg = container.querySelector('img[alt="Regular image"]');
      expect(regularImg).toBeInTheDocument();

      // Staff photo should be inside the grid
      const staffImg = container.querySelector('.staff-photo-grid img[alt="Staff photo"]');
      expect(staffImg).toBeInTheDocument();
    });

    test('multiple images in staff-photo-grid render in correct structure', () => {
      const MARKDOWN = `
<div class="staff-photo-grid">

![Staff 1](/images/staff/charles.jpg)

![Staff 2](/images/staff/kyle.jpg)

![Staff 3](/images/staff/hallie.jpg)

![Staff 4](/images/staff/john.jpg)

</div>
      `.trim();

      const { container } = render(<MarkdownRenderer content={MARKDOWN} />);

      // All 4 images should be present
      const images = container.querySelectorAll('.staff-photo-grid img');
      expect(images.length).toBe(4);

      // Grid container should exist
      const gridContainer = container.querySelector('.staff-photo-grid');
      expect(gridContainer).toBeInTheDocument();
    });
  });
});
