// ProgramCard Component Tests
import { describe, test, expect } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import ProgramCard from './ProgramCard';

describe('ProgramCard Component', () => {
  const mockProps = {
    title: 'Jr. High Week',
    subtitle: 'Grades 6-8 (Ages 11-14)',
    imageSrc: '/programs/jr-high-group.jpg',
    imageAlt: 'Jr. High campers participating in group activities',
    benefits: [
      'Identity formation in Christ',
      'Peer community & belonging',
      'Foundational faith exploration',
    ],
    ctaText: 'See Dates & Pricing',
    ctaHref: '/jr-high',
  };

  test('renders program card with all props', () => {
    const { getByText, container } = render(<ProgramCard {...mockProps} />);

    expect(getByText('Jr. High Week')).toBeInTheDocument();
    expect(getByText('Grades 6-8 (Ages 11-14)')).toBeInTheDocument();
    expect(getByText('See Dates & Pricing')).toBeInTheDocument();
  });

  test('renders all benefits', () => {
    const { getByText } = render(<ProgramCard {...mockProps} />);

    mockProps.benefits.forEach(benefit => {
      expect(getByText(benefit)).toBeInTheDocument();
    });
  });

  test('renders image with correct props', () => {
    const { container } = render(<ProgramCard {...mockProps} />);

    const img = container.querySelector('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('alt', mockProps.imageAlt);
  });

  test('CTA link has correct href', () => {
    const { container } = render(<ProgramCard {...mockProps} />);

    const link = container.querySelector('a');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/jr-high');
  });

  test('uses Next.js Link component for navigation', () => {
    const fs = require('fs');
    const source = fs.readFileSync(require.resolve('./ProgramCard'), 'utf-8');

    expect(source).toContain("from 'next/link'");
    expect(source).toContain('<Link');
  });

  test('uses Next.js Image component for optimization', () => {
    const fs = require('fs');
    const source = fs.readFileSync(require.resolve('./ProgramCard'), 'utf-8');

    expect(source).toContain("from 'next/image'");
    expect(source).toContain('<Image');
  });

  test('has accessible structure with proper headings', () => {
    const { container } = render(<ProgramCard {...mockProps} />);

    const heading = container.querySelector('h3');
    expect(heading).toBeInTheDocument();
    expect(heading?.textContent).toBe('Jr. High Week');
  });

  test('benefits use list structure for semantics', () => {
    const { container } = render(<ProgramCard {...mockProps} />);

    const list = container.querySelector('ul');
    expect(list).toBeInTheDocument();

    const listItems = container.querySelectorAll('li');
    expect(listItems.length).toBe(mockProps.benefits.length);
  });
});
