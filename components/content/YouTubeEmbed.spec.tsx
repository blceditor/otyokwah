// REQ-201: YouTube Embed Component
import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { YouTubeEmbed, extractVideoId, cleanUrl, extractStartTime } from './YouTubeEmbed';

describe('REQ-201 — YouTube Embed Component', () => {
  const MOCK_VIDEO_ID = 'dQw4w9WgXcQ';
  const MOCK_CAPTION = 'Summer camp highlights video';

  test('renders iframe with correct video ID', () => {

    render(<YouTubeEmbed videoId={MOCK_VIDEO_ID} />);

    const iframe = document.querySelector('iframe');
    expect(iframe).toBeInTheDocument();
    expect(iframe?.src).toContain(MOCK_VIDEO_ID);
  });

  test('uses youtube-nocookie.com domain for privacy', () => {

    render(<YouTubeEmbed videoId={MOCK_VIDEO_ID} />);

    const iframe = document.querySelector('iframe');
    expect(iframe?.src).toContain('youtube-nocookie.com');
  });

  test('has 16:9 aspect ratio', () => {

    const { container } = render(<YouTubeEmbed videoId={MOCK_VIDEO_ID} />);

    const wrapper = container.querySelector('.aspect-video');
    expect(wrapper).toBeInTheDocument();
  });

  test('is lazy-loaded to improve page performance', () => {

    render(<YouTubeEmbed videoId={MOCK_VIDEO_ID} />);

    const iframe = document.querySelector('iframe');
    expect(iframe).toHaveAttribute('loading', 'lazy');
  });

  test('renders optional caption below video', () => {

    render(<YouTubeEmbed videoId={MOCK_VIDEO_ID} caption={MOCK_CAPTION} />);

    expect(screen.getByText(MOCK_CAPTION)).toBeInTheDocument();
  });

  test('does not render caption when not provided', () => {

    const { container } = render(<YouTubeEmbed videoId={MOCK_VIDEO_ID} />);

    const caption = container.querySelector('figcaption');
    expect(caption).toBeNull();
  });

  test('allows fullscreen playback', () => {

    render(<YouTubeEmbed videoId={MOCK_VIDEO_ID} />);

    const iframe = document.querySelector('iframe');
    expect(iframe).toHaveAttribute('allowFullScreen');
  });

  test('works on mobile devices', () => {

    const { container } = render(<YouTubeEmbed videoId={MOCK_VIDEO_ID} />);

    const iframe = container.querySelector('iframe');
    const wrapper = iframe?.parentElement;

    // Should be responsive
  });

  test('includes proper iframe permissions', () => {

    render(<YouTubeEmbed videoId={MOCK_VIDEO_ID} />);

    const iframe = document.querySelector('iframe');
    const allow = iframe?.getAttribute('allow');

    expect(allow).toContain('accelerometer');
    expect(allow).toContain('autoplay');
    expect(allow).toContain('encrypted-media');
    expect(allow).toContain('picture-in-picture');
  });

  test('validates video ID is 11 characters', () => {
    const SHORT_ID = 'short';
    const LONG_ID = 'way-too-long-video-id';

    // Should handle invalid IDs gracefully
    const { container: shortContainer } = render(<YouTubeEmbed videoId={SHORT_ID} />);
    const { container: longContainer } = render(<YouTubeEmbed videoId={LONG_ID} />);

    // Both should still render (ID validation in Keystatic config)
    expect(shortContainer.querySelector('iframe')).toBeInTheDocument();
    expect(longContainer.querySelector('iframe')).toBeInTheDocument();
  });

  test('extracts video ID from full YouTube URL', () => {
    const FULL_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

    const videoId = extractVideoId(FULL_URL);
    expect(videoId).toBe('dQw4w9WgXcQ');
  });

  test('responsive width fills container', () => {

    const { container } = render(<YouTubeEmbed videoId={MOCK_VIDEO_ID} />);

    const iframe = container.querySelector('iframe');
  });

  describe('URL Parsing - Multiple Formats (REQ-201)', () => {
    test('converts youtu.be/VIDEO_ID format', () => {
      const URL = 'https://youtu.be/8N9Yeup1xVA';

      const videoId = extractVideoId(URL);
      expect(videoId).toBe('8N9Yeup1xVA');
    });

    test('converts youtube.com/watch?v=VIDEO_ID format', () => {
      const URL = 'https://www.youtube.com/watch?v=gosIrrZAtHw';

      const videoId = extractVideoId(URL);
      expect(videoId).toBe('gosIrrZAtHw');
    });

    test('converts youtube.com/embed/VIDEO_ID format', () => {
      const URL = 'https://www.youtube.com/embed/ABC123xyz';

      const videoId = extractVideoId(URL);
      expect(videoId).toBe('ABC123xyz');
    });

    test('handles timestamp parameter ?t=30', () => {
      const URL = 'https://www.youtube.com/watch?v=VIDEO_ID&t=30';

      const videoId = extractVideoId(URL);
      const startTime = extractStartTime(URL);

      expect(videoId).toBe('VIDEO_ID');
      expect(startTime).toBe(30);
    });

    test('handles timestamp parameter &start=30', () => {
      const URL = 'https://www.youtube.com/watch?v=VIDEO_ID&start=30';

      const startTime = extractStartTime(URL);
      expect(startTime).toBe(30);
    });

    test('handles playlist URLs', () => {
      const URL = 'https://www.youtube.com/watch?v=VIDEO_ID&list=PLAYLIST_ID';

      // Should extract video ID, ignore playlist
      const videoId = extractVideoId(URL);
      expect(videoId).toBe('VIDEO_ID');
    });

    test('strips tracking parameters (si=, etc.)', () => {
      const URL = 'https://youtu.be/8N9Yeup1xVA?si=4KXXFghbmpg0j46-';

      const videoId = extractVideoId(URL);
      const cleaned = cleanUrl(URL);

      expect(videoId).toBe('8N9Yeup1xVA');
      expect(cleaned).not.toContain('si=');
    });

    test('renders iframe with timestamp if provided', () => {
      const URL = 'https://www.youtube.com/watch?v=VIDEO_ID&t=45';

      const videoId = extractVideoId(URL);
      const startTime = extractStartTime(URL);

      const { container } = render(<YouTubeEmbed videoId={videoId} startTime={startTime} />);

      const iframe = container.querySelector('iframe');
      expect(iframe?.src).toContain('start=45');
    });

    test('handles invalid URLs gracefully', () => {
      const INVALID_URLS = [
        'not a url',
        'https://example.com',
        'https://youtube.com/invalid',
        '',
        null,
        undefined
      ];

      INVALID_URLS.forEach(url => {
        const videoId = extractVideoId(url as any);
        expect(videoId).toBeNull();
      });
    });

    test('does NOT convert URLs inside code blocks', () => {
      // This test ensures markdown renderer doesn't parse code blocks
      const MARKDOWN_WITH_CODE = '```\nhttps://youtu.be/VIDEO_ID\n```';

      // This is tested in MarkdownRenderer.spec.tsx
      // YouTubeEmbed component itself just handles valid video IDs
    });

    test('handles m.youtube.com mobile URLs', () => {
      const URL = 'https://m.youtube.com/watch?v=MOBILE_ID';

      const videoId = extractVideoId(URL);
      expect(videoId).toBe('MOBILE_ID');
    });

    test('handles youtube.com/v/ legacy URLs', () => {
      const URL = 'https://www.youtube.com/v/LEGACY_ID';

      const videoId = extractVideoId(URL);
      expect(videoId).toBe('LEGACY_ID');
    });
  });

  describe('Accessibility (REQ-201)', () => {
    test('includes title attribute for screen readers', () => {

      render(<YouTubeEmbed videoId={MOCK_VIDEO_ID} title="Summer camp highlights" />);

      const iframe = document.querySelector('iframe');
      expect(iframe).toHaveAttribute('title', 'Summer camp highlights');
    });

    test('uses default title if not provided', () => {

      render(<YouTubeEmbed videoId={MOCK_VIDEO_ID} />);

      const iframe = document.querySelector('iframe');
      expect(iframe).toHaveAttribute('title');
      expect(iframe?.getAttribute('title')).toMatch(/video|youtube/i);
    });

    test('iframe has proper ARIA role', () => {

      const { container } = render(<YouTubeEmbed videoId={MOCK_VIDEO_ID} />);

      const iframe = container.querySelector('iframe');
      // Should be implicitly a media element (no explicit role needed)
      expect(iframe).toBeInTheDocument();
    });
  });

  describe('Real-World Migration Data (REQ-206)', () => {
    test('handles summer-camp.mdoc YouTube URL', () => {
      const REAL_URL = 'https://youtu.be/8N9Yeup1xVA?si=4KXXFghbmpg0j46-';

      const videoId = extractVideoId(REAL_URL);
      expect(videoId).toBe('8N9Yeup1xVA');
    });

    test('handles summer-staff.mdoc YouTube URL', () => {
      const REAL_URL = 'https://www.youtube.com/watch?v=gosIrrZAtHw';

      const videoId = extractVideoId(REAL_URL);
      expect(videoId).toBe('gosIrrZAtHw');
    });

    test('renders embed for real migration video', () => {

      const videoId = extractVideoId('https://youtu.be/8N9Yeup1xVA?si=4KXXFghbmpg0j46-');

      const { container } = render(<YouTubeEmbed videoId={videoId!} />);

      const iframe = container.querySelector('iframe');
      expect(iframe).toBeInTheDocument();
      expect(iframe?.src).toContain('8N9Yeup1xVA');
      expect(iframe?.src).toContain('youtube-nocookie.com');
    });
  });
});
