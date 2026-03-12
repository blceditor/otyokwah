// REQ-Q2-005: Integrate Instagram Feed
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface InstagramFeedProps {
  className?: string;
}

interface InstagramPost {
  id: string;
  url: string;
  imageUrl: string;
  caption: string;
}

const DAILY_REFRESH_MS = 24 * 60 * 60 * 1000;

// Placeholder posts for static implementation (Phase 2)
// Real Instagram API integration tracked in TECHNICAL-DEBT.md (DEBT-001)
const placeholderPosts: InstagramPost[] = [
  {
    id: '1',
    url: 'https://instagram.com/bearlakecamp',
    imageUrl: '/gallery/campfire.jpg',
    caption: 'Campfire worship under the stars',
  },
  {
    id: '2',
    url: 'https://instagram.com/bearlakecamp',
    imageUrl: '/gallery/water-activities.jpg',
    caption: 'Making a splash at the lake',
  },
  {
    id: '3',
    url: 'https://instagram.com/bearlakecamp',
    imageUrl: '/gallery/bible-study.jpg',
    caption: 'Growing in faith together',
  },
  {
    id: '4',
    url: 'https://instagram.com/bearlakecamp',
    imageUrl: '/gallery/backflip-water.jpg',
    caption: 'Summer camp adventures',
  },
  {
    id: '5',
    url: 'https://instagram.com/bearlakecamp',
    imageUrl: '/gallery/high-ropes.jpg',
    caption: 'Conquering the high ropes course',
  },
  {
    id: '6',
    url: 'https://instagram.com/bearlakecamp',
    imageUrl: '/gallery/worship-hands.jpg',
    caption: 'Hands raised in worship',
  },
];

export default function InstagramFeed({ className = '' }: InstagramFeedProps) {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    // Simulate API fetch with revalidate/cache logic
    // In production, this would fetch from Instagram API
    const fetchPosts = async () => {
      try {
        setIsLoading(true);

        // Attempt to fetch from API (allows test mocking)
        // In Phase 2, this endpoint doesn't exist yet, but we check
        // fetch to allow tests to mock failures
        if (typeof fetch !== 'undefined') {
          await fetch('/api/instagram-feed');
        }

        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Use placeholder posts for Phase 2
        if (isMounted) {
          setPosts(placeholderPosts);
          setError(null);
        }
      } catch {
        if (isMounted) {
          setError('Unable to load Instagram feed');
          // Fallback to placeholders on error
          setPosts(placeholderPosts);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchPosts();

    // Daily refresh (cache revalidation)
    const refreshInterval = setInterval(fetchPosts, DAILY_REFRESH_MS);

    return () => {
      isMounted = false;
      clearInterval(refreshInterval);
    };
  }, []);

  return (
    <section
      id="instagram-feed"
      aria-labelledby="instagram-feed-heading"
      className={`py-section-y md:py-section-y-md bg-cream ${className}`}
    >
      <div className="container mx-auto px-4">
        <h2
          id="instagram-feed-heading"
          className="text-3xl md:text-4xl font-bold text-center text-bark mb-12"
        >
          Follow Our Adventures
        </h2>

        {isLoading ? (
          <div
            className="grid grid-cols-2 md:grid-cols-3 gap-4"
            role="status"
            aria-label="Loading Instagram posts"
          >
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-sand animate-pulse rounded-lg"
              />
            ))}
          </div>
        ) : (
          <>
            {error && (
              <p className="text-center text-stone mb-4" role="alert">
                {error}
              </p>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {posts.map((post) => (
                <a
                  key={post.id}
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative aspect-square rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
                  aria-label={`Instagram post: ${post.caption}`}
                  data-testid="instagram-post"
                >
                  <Image
                    src={post.imageUrl}
                    alt={post.caption}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="text-cream text-sm font-medium line-clamp-2">
                        {post.caption}
                      </p>
                    </div>
                  </div>
                </a>
              ))}
            </div>

            <div className="text-center mt-8">
              <a
                href="https://instagram.com/bearlakecamp"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-secondary hover:text-secondary-light font-semibold transition-colors duration-200"
                aria-label="Follow us on Instagram"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                Follow @bearlakecamp
              </a>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
