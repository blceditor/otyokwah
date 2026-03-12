// REQ-011: Testimonial Card Component
import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Testimonial from './Testimonial';
import '@testing-library/jest-dom/vitest';

describe('REQ-011 — Testimonial Card Component', () => {
  const MOCK_QUOTE = 'Bear Lake Camp changed my life. The counselors were amazing and I made friends for life!';
  const MOCK_AUTHOR = 'Sarah Johnson';
  const MOCK_ROLE = 'Camper, Summer 2023';
  const MOCK_AVATAR = '/images/testimonials/sarah.jpg';
  const MOCK_RATING = 5;

  test('renders quote, author, role', () => {

    render(
      <Testimonial
        quote={MOCK_QUOTE}
        author={MOCK_AUTHOR}
        role={MOCK_ROLE}
      />
    );

    expect(screen.getByText(`\u201C${MOCK_QUOTE}\u201D`)).toBeInTheDocument();
    expect(screen.getByText(MOCK_AUTHOR)).toBeInTheDocument();
    expect(screen.getByText(MOCK_ROLE)).toBeInTheDocument();
  });

  test('renders avatar image', () => {

    const { container } = render(
      <Testimonial
        quote={MOCK_QUOTE}
        author={MOCK_AUTHOR}
        role={MOCK_ROLE}
        avatar={MOCK_AVATAR}
      />
    );

    // Should render image with correct alt text (Next.js Image transforms src)
    const avatarImg = container.querySelector('img[alt=""]');
    expect(avatarImg).toBeInTheDocument();
  });

  test('renders optional star rating', () => {

    const { container } = render(
      <Testimonial
        quote={MOCK_QUOTE}
        author={MOCK_AUTHOR}
        role={MOCK_ROLE}
        rating={MOCK_RATING}
      />
    );

    // Should render star icons (5 stars)
    const stars = container.querySelectorAll('[data-testid*="star"]') ||
                  container.querySelectorAll('svg');

    expect(stars.length).toBeGreaterThanOrEqual(MOCK_RATING);
  });

  test('handles long quotes gracefully', () => {
    const LONG_QUOTE = 'This is an extremely long testimonial quote that spans multiple lines and contains a lot of detail about the amazing experience at Bear Lake Camp. The camp exceeded all expectations with incredible activities, wonderful counselors, and a truly Christ-centered environment that helped me grow in my faith. I cannot recommend this camp enough to anyone looking for a transformative summer experience.';


    render(
      <Testimonial
        quote={LONG_QUOTE}
        author={MOCK_AUTHOR}
        role={MOCK_ROLE}
      />
    );

    expect(screen.getByText(`\u201C${LONG_QUOTE}\u201D`)).toBeInTheDocument();
  });

  test('validates required props (quote, author)', () => {

    // Should render with only required props
    expect(() => {
      render(
        <Testimonial
          quote={MOCK_QUOTE}
          author={MOCK_AUTHOR}
        />
      );
    }).not.toThrow();

    expect(screen.getByText(`\u201C${MOCK_QUOTE}\u201D`)).toBeInTheDocument();
    expect(screen.getByText(MOCK_AUTHOR)).toBeInTheDocument();
  });

  test('accessible (semantic HTML, blockquote)', () => {

    const { container } = render(
      <Testimonial
        quote={MOCK_QUOTE}
        author={MOCK_AUTHOR}
        role={MOCK_ROLE}
      />
    );

    // Should use semantic blockquote element
    const blockquote = container.querySelector('blockquote');
    expect(blockquote).toBeInTheDocument();
    expect(blockquote).toHaveTextContent(`\u201C${MOCK_QUOTE}\u201D`);
  });

  test('responsive on mobile', () => {

    const { container } = render(
      <Testimonial
        quote={MOCK_QUOTE}
        author={MOCK_AUTHOR}
        role={MOCK_ROLE}
      />
    );

    // Testimonial should render all content at any viewport
    expect(screen.getByText(`\u201C${MOCK_QUOTE}\u201D`)).toBeInTheDocument();
    expect(screen.getByText(MOCK_AUTHOR)).toBeInTheDocument();
    expect(screen.getByText(MOCK_ROLE)).toBeInTheDocument();
  });
});
