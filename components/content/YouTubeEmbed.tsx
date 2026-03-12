/**
 * YouTube Embed Component
 * REQ-201: Proper YouTube video embedding with privacy controls
 *
 * Features:
 * - Extracts video ID from multiple URL formats
 * - Uses youtube-nocookie.com for privacy
 * - Strips tracking parameters
 * - Supports timestamps
 * - 16:9 aspect ratio
 * - Lazy loading
 * - Accessibility support
 */

export type YouTubeMaxWidth = 'sm' | 'md' | 'lg' | 'full';

const MAX_WIDTH_CLASSES: Record<YouTubeMaxWidth, string> = {
  sm: 'max-w-xl',
  md: 'max-w-3xl',
  lg: 'max-w-5xl',
  full: 'max-w-none',
};

export interface YouTubeEmbedProps {
  videoId: string;
  title?: string;
  caption?: string;
  startTime?: number;
  maxWidth?: YouTubeMaxWidth;
}

/**
 * Extracts YouTube video ID from various URL formats
 * Supports:
 * - youtu.be/VIDEO_ID
 * - youtube.com/watch?v=VIDEO_ID
 * - youtube.com/embed/VIDEO_ID
 * - youtube.com/v/VIDEO_ID
 * - m.youtube.com URLs
 */
export function extractVideoId(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') {
    return null;
  }

  try {
    // youtu.be/VIDEO_ID format
    const youtuBeMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
    if (youtuBeMatch) {
      return youtuBeMatch[1].split(/[?&]/)[0];
    }

    // youtube.com/watch?v=VIDEO_ID format (including m.youtube.com)
    const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
    if (watchMatch) {
      return watchMatch[1].split(/[?&]/)[0];
    }

    // youtube.com/embed/VIDEO_ID format
    const embedMatch = url.match(/\/embed\/([a-zA-Z0-9_-]+)/);
    if (embedMatch) {
      return embedMatch[1].split(/[?&]/)[0];
    }

    // youtube.com/v/VIDEO_ID format
    const vMatch = url.match(/\/v\/([a-zA-Z0-9_-]+)/);
    if (vMatch) {
      return vMatch[1].split(/[?&]/)[0];
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Strips tracking parameters from YouTube URLs
 */
export function cleanUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    // Remove tracking parameters
    urlObj.searchParams.delete('si');
    urlObj.searchParams.delete('feature');
    return urlObj.toString();
  } catch {
    return url;
  }
}

/**
 * Extracts start time from YouTube URL
 * Supports both ?t=30 and &start=30 formats
 */
export function extractStartTime(url: string): number | null {
  try {
    const urlObj = new URL(url);

    // Check for t parameter (e.g., ?t=30)
    const tParam = urlObj.searchParams.get('t');
    if (tParam) {
      return parseInt(tParam, 10);
    }

    // Check for start parameter (e.g., &start=30)
    const startParam = urlObj.searchParams.get('start');
    if (startParam) {
      return parseInt(startParam, 10);
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * YouTube Embed Component
 * Renders an embedded YouTube video with privacy and accessibility features
 */
export function YouTubeEmbed({
  videoId: rawVideoId,
  title,
  caption,
  startTime,
  maxWidth = 'md',
}: YouTubeEmbedProps): JSX.Element {
  // Bug 7 fix: Extract video ID from full URLs, fall back to raw value for bare IDs
  const videoId = extractVideoId(rawVideoId) || rawVideoId;

  // Build embed URL with youtube-nocookie.com for privacy
  const baseUrl = `https://www.youtube-nocookie.com/embed/${videoId}`;
  const embedUrl = startTime
    ? `${baseUrl}?start=${startTime}`
    : baseUrl;

  // Default title for accessibility
  const videoTitle = title || 'YouTube video';

  const widthClass = MAX_WIDTH_CLASSES[maxWidth];

  return (
    <figure className={`my-8 ${widthClass} mx-auto`}>
      <div className="aspect-video w-full">
        <iframe
          src={embedUrl}
          title={videoTitle}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
          className="w-full h-full rounded-lg shadow-md"
        />
      </div>
      {caption && (
        <figcaption className="text-sm text-stone mt-2 text-center">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}