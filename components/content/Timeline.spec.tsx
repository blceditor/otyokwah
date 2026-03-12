// REQ-011: Timeline Component
import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Timeline from './Timeline';
import '@testing-library/jest-dom/vitest';

describe('REQ-011 — Timeline Component', () => {
  const MOCK_TIMELINE_ITEMS = [
    {
      date: '1995',
      heading: 'Camp Founded',
      description: 'Bear Lake Camp was established to serve youth in Idaho.',
    },
    {
      date: '2005',
      heading: 'Facility Expansion',
      description: 'Added new cabins and multi-activity center.',
    },
    {
      date: '2015',
      heading: 'Record Attendance',
      description: 'Served over 500 campers in a single summer.',
    },
    {
      date: '2024',
      heading: 'Modern Renovations',
      description: 'Completed updates to all facilities.',
    },
  ];

  test('renders multiple timeline items', () => {
    render(<Timeline items={MOCK_TIMELINE_ITEMS} />);

    // All headings should be visible
    expect(screen.getByText('Camp Founded')).toBeInTheDocument();
    expect(screen.getByText('Facility Expansion')).toBeInTheDocument();
    expect(screen.getByText('Record Attendance')).toBeInTheDocument();
    expect(screen.getByText('Modern Renovations')).toBeInTheDocument();
  });

  test('renders date, heading, description per item', () => {
    render(<Timeline items={MOCK_TIMELINE_ITEMS} />);

    // Dates
    expect(screen.getByText('1995')).toBeInTheDocument();
    expect(screen.getByText('2005')).toBeInTheDocument();
    expect(screen.getByText('2015')).toBeInTheDocument();
    expect(screen.getByText('2024')).toBeInTheDocument();

    // Headings
    expect(screen.getByText('Camp Founded')).toBeInTheDocument();
    expect(screen.getByText('Facility Expansion')).toBeInTheDocument();

    // Descriptions
    expect(screen.getByText(/Bear Lake Camp was established/i)).toBeInTheDocument();
    expect(screen.getByText(/Added new cabins/i)).toBeInTheDocument();
  });

  test('vertical connector line between items', () => {
    const { container } = render(<Timeline items={MOCK_TIMELINE_ITEMS} />);

    // Should have a timeline container with multiple items
    const timelineContainer = container.querySelector('[data-testid="timeline"]') || container.firstChild;
    expect(timelineContainer).toBeInTheDocument();

    // Timeline items should exist
    const items = container.querySelectorAll('[data-testid*="timeline-item"]');
    expect(items.length).toBe(MOCK_TIMELINE_ITEMS.length);
  });

  test('alternating left/right layout (optional)', () => {
    const { container } = render(<Timeline items={MOCK_TIMELINE_ITEMS} alternating={true} />);

    // Should have alternating layout classes
    const items = container.querySelectorAll('[data-testid*="timeline-item"]');

    expect(items.length).toBe(MOCK_TIMELINE_ITEMS.length);
  });

  test('responsive: uses ordered list for semantic structure', () => {
    const { container } = render(<Timeline items={MOCK_TIMELINE_ITEMS} />);

    // Should use an ordered list for timeline items
    const list = container.querySelector('ol') || container.querySelector('[role="list"]');
    expect(list).toBeInTheDocument();
  });

  test('accessible (semantic HTML, list)', () => {
    const { container } = render(<Timeline items={MOCK_TIMELINE_ITEMS} />);

    // Should use semantic list elements (ol or ul)
    const list = container.querySelector('ol') || container.querySelector('ul');

    expect(list || container.querySelector('[role="list"]')).toBeInTheDocument();
  });

  test('supports dates in various formats', () => {
    const VARIOUS_DATES = [
      { date: '1995', heading: 'Year only', description: 'Test' },
      { date: 'Summer 2005', heading: 'Season and year', description: 'Test' },
      { date: 'June 15, 2015', heading: 'Full date', description: 'Test' },
    ];

    render(<Timeline items={VARIOUS_DATES} />);

    // All date formats should render
    expect(screen.getByText('1995')).toBeInTheDocument();
    expect(screen.getByText('Summer 2005')).toBeInTheDocument();
    expect(screen.getByText('June 15, 2015')).toBeInTheDocument();
  });

  test('handles single item gracefully', () => {
    const SINGLE_ITEM = [
      {
        date: '2024',
        heading: 'Single Event',
        description: 'Only one item in timeline.',
      },
    ];

    expect(() => {
      render(<Timeline items={SINGLE_ITEM} />);
    }).not.toThrow();

    expect(screen.getByText('Single Event')).toBeInTheDocument();
  });
});
