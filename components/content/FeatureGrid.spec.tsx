// REQ-011: Feature Grid Component
import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import FeatureGrid from './FeatureGrid';
import '@testing-library/jest-dom/vitest';

describe('REQ-011 — Feature Grid Component', () => {
  const MOCK_FEATURES_2COL = [
    { icon: 'Heart', heading: 'Faith-Based', description: 'Christ-centered programs' },
    { icon: 'Users', heading: 'Community', description: 'Lifelong friendships' },
  ];

  const MOCK_FEATURES_3COL = [
    { icon: 'Heart', heading: 'Faith-Based', description: 'Christ-centered programs' },
    { icon: 'Users', heading: 'Community', description: 'Lifelong friendships' },
    { icon: 'Mountain', heading: 'Nature', description: 'Beautiful Idaho setting' },
  ];

  const MOCK_FEATURES_4COL = [
    { icon: 'Heart', heading: 'Faith-Based', description: 'Christ-centered programs' },
    { icon: 'Users', heading: 'Community', description: 'Lifelong friendships' },
    { icon: 'Mountain', heading: 'Nature', description: 'Beautiful Idaho setting' },
    { icon: 'Activity', heading: 'Activities', description: 'Exciting adventures' },
  ];

  const MOCK_FEATURES_WITH_LINKS = [
    { icon: 'Heart', heading: 'Faith-Based', description: 'Christ-centered programs', link: '/faith' },
    { icon: 'Users', heading: 'Community', description: 'Lifelong friendships', link: '/community' },
  ];

  test('renders correct number of items for 2-column config', () => {
    const { container } = render(
      <FeatureGrid features={MOCK_FEATURES_2COL} columns={2} />
    );

    const grid = container.querySelector('[data-testid="feature-grid"]');
    expect(grid).toBeInTheDocument();
    expect(grid?.children).toHaveLength(2);
  });

  test('renders correct number of items for 3-column config', () => {
    const { container } = render(
      <FeatureGrid features={MOCK_FEATURES_3COL} columns={3} />
    );

    const grid = container.querySelector('[data-testid="feature-grid"]');
    expect(grid).toBeInTheDocument();
    expect(grid?.children).toHaveLength(3);
  });

  test('renders correct number of items for 4-column config', () => {
    const { container } = render(
      <FeatureGrid features={MOCK_FEATURES_4COL} columns={4} />
    );

    const grid = container.querySelector('[data-testid="feature-grid"]');
    expect(grid).toBeInTheDocument();
    expect(grid?.children).toHaveLength(4);
  });

  test('renders icon per item', () => {

    const { container } = render(
      <FeatureGrid features={MOCK_FEATURES_3COL} columns={3} />
    );

    // Should render icon elements (svg or data-icon attributes)
    const icons = container.querySelectorAll('[data-testid*="icon"]') ||
                  container.querySelectorAll('svg');

    expect(icons.length).toBeGreaterThan(0);
  });

  test('renders heading and description per item', () => {

    render(
      <FeatureGrid features={MOCK_FEATURES_3COL} columns={3} />
    );

    // All headings should be present
    expect(screen.getByText('Faith-Based')).toBeInTheDocument();
    expect(screen.getByText('Community')).toBeInTheDocument();
    expect(screen.getByText('Nature')).toBeInTheDocument();

    // All descriptions should be present
    expect(screen.getByText('Christ-centered programs')).toBeInTheDocument();
    expect(screen.getByText('Lifelong friendships')).toBeInTheDocument();
    expect(screen.getByText('Beautiful Idaho setting')).toBeInTheDocument();
  });

  test('optional links work correctly', () => {

    render(
      <FeatureGrid features={MOCK_FEATURES_WITH_LINKS} columns={2} />
    );

    // Links should be rendered
    const faithLink = screen.getByRole('link', { name: /Faith-Based/i });
    const communityLink = screen.getByRole('link', { name: /Community/i });

    expect(faithLink).toHaveAttribute('href', '/faith');
    expect(communityLink).toHaveAttribute('href', '/community');
  });

  test('grid container has data-testid for each feature item', () => {
    const { container } = render(
      <FeatureGrid features={MOCK_FEATURES_4COL} columns={4} />
    );

    for (let i = 0; i < MOCK_FEATURES_4COL.length; i++) {
      expect(container.querySelector(`[data-testid="feature-${i}"]`)).toBeInTheDocument();
    }
  });
});
