// REQ-Q2-005: Integrate Instagram Feed
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

describe('REQ-Q2-005 — Instagram Feed Display', () => {
  beforeEach(() => {
    // Mock fetch for API tests
    global.fetch = vi.fn();
  });

  test('Instagram feed displays 6 most recent posts', async () => {
    const { default: InstagramFeed } = await import('./InstagramFeed');
    const { container } = render(<InstagramFeed />);

    await waitFor(() => {
      const posts = container.querySelectorAll('[data-testid="instagram-post"], [class*="instagram-post"]');
      expect(posts.length).toBe(6);
    });
  });

  test('Posts update automatically (daily refresh)', async () => {
    const fs = await import('fs');
    const feedSource = fs.readFileSync(
      require.resolve('./InstagramFeed'),
      'utf-8'
    );

    // Should have data fetching logic (fetch, SWR, or similar)
    const hasDataFetching =
      feedSource.includes('fetch') ||
      feedSource.includes('useSWR') ||
      feedSource.includes('useQuery');

    expect(hasDataFetching).toBe(true);
  });

  test('Responsive grid: 2 columns mobile, 3 columns desktop', async () => {
    const { default: InstagramFeed } = await import('./InstagramFeed');
    const { container } = render(<InstagramFeed />);

    const gridContainer = container.querySelector('[class*="grid"]');
    expect(gridContainer).toBeInTheDocument();

    const gridClasses = gridContainer?.className || '';
    expect(gridClasses).toMatch(/grid-cols-2/); // Mobile: 2 columns
    expect(gridClasses).toMatch(/md:grid-cols-3|lg:grid-cols-3/); // Desktop: 3 columns
  });

  test('Each post is clickable and opens Instagram in new tab', async () => {
    const { default: InstagramFeed } = await import('./InstagramFeed');
    const { container } = render(<InstagramFeed />);

    await waitFor(() => {
      const links = container.querySelectorAll('a[href*="instagram"]');
      expect(links.length).toBeGreaterThanOrEqual(6);

      links.forEach(link => {
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      });
    });
  });

  test('Posts have hover effect (scale/overlay)', async () => {
    const { default: InstagramFeed } = await import('./InstagramFeed');
    const { container } = render(<InstagramFeed />);

    await waitFor(() => {
      const posts = container.querySelectorAll('[class*="hover:"]');
      expect(posts.length).toBeGreaterThan(0);
    });
  });

  test('Loading state shown while fetching posts', async () => {
    const { default: InstagramFeed } = await import('./InstagramFeed');
    render(<InstagramFeed />);

    // Should show loading skeleton or spinner initially
    const loading = screen.queryByText(/loading/i) ||
                    screen.queryByRole('status') ||
                    document.querySelector('[class*="animate-pulse"]');

    expect(loading).toBeInTheDocument();
  });

  test('Error state if Instagram API fails', async () => {
    // Mock fetch to fail
    global.fetch = vi.fn().mockRejectedValue(new Error('API Error'));

    const { default: InstagramFeed } = await import('./InstagramFeed');
    render(<InstagramFeed />);

    await waitFor(() => {
      const errorMessage = screen.queryByText(/error|failed|unable/i);
      expect(errorMessage).toBeInTheDocument();
    });
  });

  test('Fallback to static placeholders if API unavailable', async () => {
    // Mock fetch to fail
    global.fetch = vi.fn().mockRejectedValue(new Error('API Error'));

    const { default: InstagramFeed } = await import('./InstagramFeed');
    const { container } = render(<InstagramFeed />);

    await waitFor(() => {
      // Should still show some content (placeholders)
      const posts = container.querySelectorAll('[data-testid="instagram-post"], img');
      expect(posts.length).toBeGreaterThan(0);
    });
  });
});

describe('REQ-Q2-005 — Instagram Feed Accessibility', () => {
  test('Each post has accessible name', async () => {
    const { default: InstagramFeed } = await import('./InstagramFeed');
    const { container } = render(<InstagramFeed />);

    await waitFor(() => {
      const posts = container.querySelectorAll('a[href*="instagram"]');

      posts.forEach(post => {
        const ariaLabel = post.getAttribute('aria-label');
        expect(ariaLabel).toBeTruthy();
      });
    });
  });

  test('Post images have alt text', async () => {
    const { default: InstagramFeed } = await import('./InstagramFeed');
    const { container } = render(<InstagramFeed />);

    await waitFor(() => {
      const images = container.querySelectorAll('img');

      images.forEach(img => {
        const alt = img.getAttribute('alt');
        expect(alt).toBeTruthy();
      });
    });
  });

  test('External links have proper ARIA for screen readers', async () => {
    const { default: InstagramFeed } = await import('./InstagramFeed');
    const { container } = render(<InstagramFeed />);

    await waitFor(() => {
      const links = container.querySelectorAll('a[target="_blank"]');

      links.forEach(link => {
        // Should have rel="noopener noreferrer" for security
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      });
    });
  });
});

describe('REQ-Q2-005 — Instagram Feed Performance', () => {
  test('Post images use next/image for optimization', async () => {
    const fs = await import('fs');
    const feedSource = fs.readFileSync(
      require.resolve('./InstagramFeed'),
      'utf-8'
    );

    expect(feedSource).toContain('next/image');
  });

  test('Post images use lazy loading', async () => {
    const { default: InstagramFeed } = await import('./InstagramFeed');
    const { container } = render(<InstagramFeed />);

    await waitFor(() => {
      const images = container.querySelectorAll('img');

      images.forEach(img => {
        const loading = img.getAttribute('loading');
        expect(loading).toBe('lazy');
      });
    });
  });

  test('API calls use client-side fetching (not SSR blocking)', async () => {
    const fs = await import('fs');
    const feedSource = fs.readFileSync(
      require.resolve('./InstagramFeed'),
      'utf-8'
    );

    // Should be client component for dynamic data
    expect(feedSource).toContain("'use client'");
  });
});

describe('REQ-Q2-005 — Instagram Feed Non-Goals', () => {
  test('Non-goal: No Instagram authentication for private posts', async () => {
    const fs = await import('fs');
    const feedSource = fs.readFileSync(
      require.resolve('./InstagramFeed'),
      'utf-8'
    );

    // Should not have OAuth or authentication flow
    expect(feedSource).not.toContain('OAuth');
    expect(feedSource).not.toContain('authenticate');
    expect(feedSource).not.toContain('login');
  });

  test('Non-goal: No post comments or likes display', async () => {
    const { default: InstagramFeed } = await import('./InstagramFeed');
    const { container } = render(<InstagramFeed />);

    await waitFor(() => {
      // Should not display comment counts or like buttons
      const comments = screen.queryByText(/comment/i);
      const likes = screen.queryByText(/like/i);

      expect(comments).not.toBeInTheDocument();
      expect(likes).not.toBeInTheDocument();
    });
  });

  test('Non-goal: No Instagram Stories integration', async () => {
    const fs = await import('fs');
    const feedSource = fs.readFileSync(
      require.resolve('./InstagramFeed'),
      'utf-8'
    );

    expect(feedSource).not.toContain('story');
    expect(feedSource).not.toContain('stories');
  });

  test('Non-goal: No full Instagram feed widget embedding', async () => {
    const { default: InstagramFeed } = await import('./InstagramFeed');
    const { container } = render(<InstagramFeed />);

    // Should be custom component, not third-party widget iframe
    const iframes = container.querySelectorAll('iframe');
    expect(iframes.length).toBe(0);
  });
});

describe('REQ-Q2-005 — Instagram Feed Implementation Options', () => {
  test('Accepts Smash Balloon widget approach for Phase 2', async () => {
    const fs = await import('fs');
    const feedSource = fs.readFileSync(
      require.resolve('./InstagramFeed'),
      'utf-8'
    );

    // Either has API integration OR widget/placeholder
    const hasImplementation =
      feedSource.includes('instagram') ||
      feedSource.includes('fetch') ||
      feedSource.includes('widget') ||
      feedSource.includes('placeholder');

    expect(hasImplementation).toBe(true);
  });

  test('Daily refresh mechanism configured', async () => {
    const fs = await import('fs');
    const feedSource = fs.readFileSync(
      require.resolve('./InstagramFeed'),
      'utf-8'
    );

    // Should have cache revalidation or refresh logic
    const hasRefreshLogic =
      feedSource.includes('revalidate') ||
      feedSource.includes('refreshInterval') ||
      feedSource.includes('cache');

    expect(hasRefreshLogic).toBe(true);
  });
});
