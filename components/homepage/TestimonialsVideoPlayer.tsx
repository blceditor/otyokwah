'use client';

import { useState } from 'react';
import Image from 'next/image';

interface TestimonialsVideoPlayerProps {
  videoId: string;
  caption: string;
  thumbnail?: string; // REQ-Q2-004: Custom thumbnail support
}

export default function TestimonialsVideoPlayer({
  videoId,
  caption,
  thumbnail
}: TestimonialsVideoPlayerProps) {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  const handlePlayClick = () => {
    setIsVideoLoaded(true);
  };

  return (
    <div>
      <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg bg-stone">
        {!isVideoLoaded ? (
          <div
            className="relative w-full h-full cursor-pointer group"
            onClick={handlePlayClick}
            data-testid="video-embed"
            aria-label={`Play video: ${caption}`}
          >
            {/* REQ-Q2-004: Custom Thumbnail with next/image */}
            {thumbnail ? (
              <div className="absolute inset-0" data-testid="video-thumbnail">
                <Image
                  src={thumbnail}
                  alt={`Video thumbnail: ${caption}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                  loading="lazy"
                />
                {/* Dark overlay for play button visibility */}
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-200" />
              </div>
            ) : (
              <div
                className="absolute inset-0 bg-gradient-to-br from-secondary to-secondary-light flex items-center justify-center"
                data-testid="video-thumbnail"
              >
                <div className="text-cream text-center">
                  <div className="text-6xl mb-4">▶</div>
                  <p className="text-xl font-semibold">Video Testimonial</p>
                </div>
              </div>
            )}

            <div className="absolute inset-0 flex items-center justify-center">
              <button
                type="button"
                className="w-20 h-20 min-w-[48px] min-h-[48px] bg-secondary/90 hover:bg-secondary rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 group-hover:scale-110"
                aria-label={`Play video: ${caption}`}
              >
                <svg
                  className="w-10 h-10 text-cream ml-1"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?cc_load_policy=1&rel=0&modestbranding=1`}
            title={caption}
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
            loading="lazy"
          />
        )}
      </div>

      <div className="mt-4 text-center" data-testid="video-caption">
        <p className="text-base text-bark">{caption}</p>
      </div>
    </div>
  );
}
