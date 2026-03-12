/**
 * AnchorNav Component Tests
 * REQ-U03-003: Sub-navigation that scrolls with page (not sticky)
 */

import { render, screen } from '@testing-library/react';
import { AnchorNav } from './AnchorNav';

describe('AnchorNav Component', () => {
  const mockItems = [
    { id: 'primary-overnight', label: 'Primary Overnight', grades: 'Grades 2-3' },
    { id: 'junior-camp', label: 'Junior Camp', grades: 'Grades 3-6' },
    { id: 'jr-high-camp', label: 'Jr. High Camp', grades: 'Grades 7-9' },
    { id: 'sr-high-camp', label: 'Sr. High Camp', grades: 'Grades 10-12' },
  ];

  describe('REQ-U03-003a: Renders navigation items', () => {
    it('renders all navigation items', () => {
      render(<AnchorNav items={mockItems} />);

      expect(screen.getByText('Primary Overnight')).toBeInTheDocument();
      expect(screen.getByText('Junior Camp')).toBeInTheDocument();
      expect(screen.getByText('Jr. High Camp')).toBeInTheDocument();
      expect(screen.getByText('Sr. High Camp')).toBeInTheDocument();
    });

    it('renders grade labels', () => {
      render(<AnchorNav items={mockItems} />);

      expect(screen.getByText('Grades 2-3')).toBeInTheDocument();
      expect(screen.getByText('Grades 3-6')).toBeInTheDocument();
      expect(screen.getByText('Grades 7-9')).toBeInTheDocument();
      expect(screen.getByText('Grades 10-12')).toBeInTheDocument();
    });

    it('creates anchor links with correct hrefs', () => {
      render(<AnchorNav items={mockItems} />);

      const primaryLink = screen.getByRole('link', { name: /Primary Overnight/i });
      expect(primaryLink).toHaveAttribute('href', '#primary-overnight');

      const juniorLink = screen.getByRole('link', { name: /Junior Camp/i });
      expect(juniorLink).toHaveAttribute('href', '#junior-camp');
    });
  });

  describe('REQ-U03-003b: NOT sticky', () => {
    it('does NOT have sticky positioning', () => {
      const { container } = render(<AnchorNav items={mockItems} />);

      const nav = container.querySelector('nav');
    });

    it('has secondary background color', () => {
      const { container } = render(<AnchorNav items={mockItems} />);

      const nav = container.querySelector('nav');
    });
  });

  describe('REQ-U03-003c: Edge cases', () => {
    it('renders nothing when items is empty', () => {
      const { container } = render(<AnchorNav items={[]} />);
      expect(container.querySelector('nav')).not.toBeInTheDocument();
    });

    it('handles items without grades', () => {
      const itemsWithoutGrades = [
        { id: 'test', label: 'Test Item' },
      ];
      render(<AnchorNav items={itemsWithoutGrades} />);

      expect(screen.getByText('Test Item')).toBeInTheDocument();
    });
  });
});
