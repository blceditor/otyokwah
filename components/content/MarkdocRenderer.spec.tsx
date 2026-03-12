/**
 * MarkdocRenderer Tests
 *
 * REQ-MARKDOC-001: Parse and render Markdoc content with custom components
 * Tests that Markdoc syntax ({% %}) is properly transformed to React components
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MarkdocRenderer } from './MarkdocRenderer';

describe('MarkdocRenderer', () => {
  describe('REQ-MARKDOC-001: Markdoc tag parsing', () => {
    it('should render contentCard tag as ContentCard component', () => {
      const content = `
{% contentCard icon="Phone" title="Contact Us" %}
Call us at (123) 456-7890
{% /contentCard %}
      `;

      render(<MarkdocRenderer content={content} />);

      // Should render the title
      expect(screen.getByText('Contact Us')).toBeInTheDocument();

      // Should render the content
      expect(screen.getByText(/Call us at/i)).toBeInTheDocument();

      // Should NOT render the raw Markdoc syntax
      expect(screen.queryByText(/{% contentCard/)).not.toBeInTheDocument();
    });

    it('should render multiple contentCard tags', () => {
      const content = `
{% contentCard icon="Mail" title="Email" %}
info@example.com
{% /contentCard %}

{% contentCard icon="Phone" title="Phone" %}
(123) 456-7890
{% /contentCard %}
      `;

      render(<MarkdocRenderer content={content} />);

      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Phone')).toBeInTheDocument();
      expect(screen.getByText('info@example.com')).toBeInTheDocument();
      expect(screen.getByText('(123) 456-7890')).toBeInTheDocument();
    });

    it('should render sectionCard tag as SectionCard component', () => {
      const content = `
{% sectionCard variant="elevated" %}
This is section content
{% /sectionCard %}
      `;

      render(<MarkdocRenderer content={content} />);

      expect(screen.getByText('This is section content')).toBeInTheDocument();
      expect(screen.queryByText(/{% sectionCard/)).not.toBeInTheDocument();
    });
  });

  describe('REQ-MARKDOC-002: External link handling', () => {
    it('should add target="_blank" and rel="noopener noreferrer" to external links', () => {
      const content = `
[External Link](https://example.com)
      `;

      render(<MarkdocRenderer content={content} />);

      const link = screen.getByRole('link', { name: /External Link/i });
      expect(link).toHaveAttribute('href', 'https://example.com');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should NOT add target="_blank" to internal links', () => {
      const content = `
[Internal Link](/about)
      `;

      render(<MarkdocRenderer content={content} />);

      const link = screen.getByRole('link', { name: /Internal Link/i });
      expect(link).toHaveAttribute('href', '/about');
      expect(link).not.toHaveAttribute('target');
      expect(link).not.toHaveAttribute('rel');
    });

    it('should handle http:// links as external', () => {
      const content = `
[HTTP Link](http://example.com)
      `;

      render(<MarkdocRenderer content={content} />);

      const link = screen.getByRole('link', { name: /HTTP Link/i });
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('REQ-MARKDOC-003: Markdown content within Markdoc', () => {
    it('should render markdown outside of Markdoc tags', () => {
      const content = `
## Contact Information

{% contentCard icon="Mail" title="Email" %}
Send us an email
{% /contentCard %}

Visit our office during business hours.
      `;

      render(<MarkdocRenderer content={content} />);

      // Markdown heading
      expect(screen.getByText('Contact Information')).toBeInTheDocument();

      // Markdoc component
      expect(screen.getByText('Email')).toBeInTheDocument();

      // Regular markdown paragraph
      expect(screen.getByText(/Visit our office/i)).toBeInTheDocument();
    });

    it('should automatically add attributes to external links in contentCard', () => {
      const content = `
{% contentCard icon="Link" title="Website" %}
[Visit our site](https://example.com)
{% /contentCard %}
      `;

      render(<MarkdocRenderer content={content} />);

      const link = screen.getByRole('link', { name: /Visit our site/i });
      expect(link).toHaveAttribute('href', 'https://example.com');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('REQ-MARKDOC-003: CardGrid tag', () => {
    it('should render cardGrid tag with responsive grid layout', () => {
      const content = `
{% cardGrid cols="2" %}

{% contentCard icon="One" title="First" %}
Content 1
{% /contentCard %}

{% contentCard icon="Two" title="Second" %}
Content 2
{% /contentCard %}

{% /cardGrid %}
      `;

      render(<MarkdocRenderer content={content} />);

      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();

      // Check that the div with grid classes was rendered
      const gridDiv = screen.getByText('First').closest('div[class*="grid"]');
      expect(gridDiv).toBeInTheDocument();
    });

    it('should auto-detect grid columns based on child count', () => {
      const content = `
{% cardGrid %}

{% contentCard icon="One" title="First" %}
Content 1
{% /contentCard %}

{% contentCard icon="Two" title="Second" %}
Content 2
{% /contentCard %}

{% contentCard icon="Three" title="Third" %}
Content 3
{% /contentCard %}

{% contentCard icon="Four" title="Fourth" %}
Content 4
{% /contentCard %}

{% /cardGrid %}
      `;

      render(<MarkdocRenderer content={content} />);

      // Should render all cards
      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
      expect(screen.getByText('Third')).toBeInTheDocument();
      expect(screen.getByText('Fourth')).toBeInTheDocument();

      // Should have grid layout
      const gridDiv = screen.getByText('First').closest('div[class*="grid"]');
      expect(gridDiv).toBeInTheDocument();
    });
  });

  describe('REQ-WEB-004 — YouTube Embed Fix', () => {
    const SUMMER_STAFF_VIDEO_ID = 'gosIrrZAtHw';

    it('REQ-WEB-004 — renders youtube tag with videoId', () => {
      const content = `{% youtube id="${SUMMER_STAFF_VIDEO_ID}" %}`;

      render(<MarkdocRenderer content={content} />);

      const iframe = document.querySelector('iframe');
      expect(iframe).toBeInTheDocument();
      expect(iframe?.src).toContain(SUMMER_STAFF_VIDEO_ID);
    });

    it('REQ-WEB-004 — passes title prop to YouTubeEmbed component', () => {
      const VIDEO_TITLE = 'Summer Staff Video';
      const content = `{% youtube id="${SUMMER_STAFF_VIDEO_ID}" title="${VIDEO_TITLE}" %}`;

      render(<MarkdocRenderer content={content} />);

      const iframe = document.querySelector('iframe');
      expect(iframe).toHaveAttribute('title', VIDEO_TITLE);
    });

    it('REQ-WEB-004 — passes caption prop to YouTubeEmbed component', () => {
      const VIDEO_CAPTION = 'Join our summer staff team!';
      const content = `{% youtube id="${SUMMER_STAFF_VIDEO_ID}" caption="${VIDEO_CAPTION}" %}`;

      render(<MarkdocRenderer content={content} />);

      expect(screen.getByText(VIDEO_CAPTION)).toBeInTheDocument();
    });

    it('REQ-WEB-004 — passes startTime prop to YouTubeEmbed component', () => {
      const START_TIME = 30;
      const content = `{% youtube id="${SUMMER_STAFF_VIDEO_ID}" startTime=${START_TIME} %}`;

      render(<MarkdocRenderer content={content} />);

      const iframe = document.querySelector('iframe');
      expect(iframe?.src).toContain(`start=${START_TIME}`);
    });

    it('REQ-WEB-004 — video is responsive (16:9 aspect ratio)', () => {
      const content = `{% youtube id="${SUMMER_STAFF_VIDEO_ID}" %}`;

      const { container } = render(<MarkdocRenderer content={content} />);

      const aspectVideoDiv = container.querySelector('.aspect-video');
      expect(aspectVideoDiv).toBeInTheDocument();
    });

    it('REQ-WEB-004 — uses youtube-nocookie.com for privacy', () => {
      const content = `{% youtube id="${SUMMER_STAFF_VIDEO_ID}" %}`;

      render(<MarkdocRenderer content={content} />);

      const iframe = document.querySelector('iframe');
      expect(iframe?.src).toContain('youtube-nocookie.com');
    });

    it('REQ-WEB-004 — works with real summer-staff.mdoc syntax', () => {
      // Exact syntax from content/pages/summer-staff.mdoc line 41
      const content = `{% youtube id="${SUMMER_STAFF_VIDEO_ID}" %}`;

      render(<MarkdocRenderer content={content} />);

      const iframe = document.querySelector('iframe');
      expect(iframe).toBeInTheDocument();
      expect(iframe?.src).toContain('gosIrrZAtHw');
    });

    it('REQ-WEB-004 — no console errors during youtube render', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error');
      const content = `{% youtube id="${SUMMER_STAFF_VIDEO_ID}" %}`;

      render(<MarkdocRenderer content={content} />);

      expect(consoleErrorSpy).not.toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    it('REQ-WEB-004 — iframe has title attribute for accessibility', () => {
      const content = `{% youtube id="${SUMMER_STAFF_VIDEO_ID}" title="Summer Staff Intro" %}`;

      render(<MarkdocRenderer content={content} />);

      const iframe = document.querySelector('iframe');
      expect(iframe).toHaveAttribute('title', 'Summer Staff Intro');
    });

    it('REQ-WEB-004 — iframe has default title when not provided', () => {
      const content = `{% youtube id="${SUMMER_STAFF_VIDEO_ID}" %}`;

      render(<MarkdocRenderer content={content} />);

      const iframe = document.querySelector('iframe');
      expect(iframe).toHaveAttribute('title');
      expect(iframe?.getAttribute('title')).toMatch(/video|youtube/i);
    });
  });

  describe('REQ-MARKDOC-004: Edge cases', () => {
    it('should handle empty contentCard gracefully', () => {
      const content = `
{% contentCard icon="Empty" title="Empty Card" %}
{% /contentCard %}
      `;

      render(<MarkdocRenderer content={content} />);

      expect(screen.getByText('Empty Card')).toBeInTheDocument();
    });

    it('should handle plain text content', () => {
      const content = 'Just plain text without any Markdoc tags.';

      render(<MarkdocRenderer content={content} />);

      expect(screen.getByText('Just plain text without any Markdoc tags.')).toBeInTheDocument();
    });

    it('should handle empty content', () => {
      const content = '';

      const { container } = render(<MarkdocRenderer content={content} />);

      // Should render without crashing
      expect(container).toBeInTheDocument();
    });
  });
});
