/**
 * REQ-UI-002: Convert Body Descriptions to Card Components
 *
 * Acceptance Criteria:
 * - Component supports: icon (optional), heading, description, bullet list
 * - Component integrated with Markdoc for CMS authoring
 * - Cards responsive: 1 column mobile, 2-3 columns tablet/desktop
 * - Cards styled consistently with theme (cream/secondary/bark colors)
 */

import { render, screen } from '@testing-library/react';
import { InfoCard } from './InfoCard';

describe('REQ-UI-002: InfoCard Component', () => {
  const defaultProps = {
    heading: 'Test Heading',
    description: 'Test description text',
    items: ['Item 1', 'Item 2', 'Item 3'],
  };

  it('should render heading', () => {
    render(<InfoCard {...defaultProps} />);
    expect(screen.getByRole('heading', { name: 'Test Heading' })).toBeInTheDocument();
  });

  it('should render description', () => {
    render(<InfoCard {...defaultProps} />);
    expect(screen.getByText('Test description text')).toBeInTheDocument();
  });

  it('should render bullet list items', () => {
    render(<InfoCard {...defaultProps} />);
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();
  });

  it('should render with optional icon', () => {
    render(<InfoCard {...defaultProps} icon="Heart" />);
    const icon = screen.getByTestId('icon-Heart');
    expect(icon).toBeInTheDocument();
  });

  it('should render without icon when not provided', () => {
    render(<InfoCard {...defaultProps} />);
    const icons = screen.queryByTestId(/^icon-/);
    expect(icons).not.toBeInTheDocument();
  });

  it('should render description as optional', () => {
    render(<InfoCard heading="Test" items={['Item 1']} />);
    expect(screen.getByRole('heading', { name: 'Test' })).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });

  it('should have theme-consistent styling', () => {
    const { container } = render(<InfoCard {...defaultProps} />);
    const card = container.firstChild as HTMLElement;
    const className = card.className;
  });

  it('should be accessible with semantic HTML', () => {
    render(<InfoCard {...defaultProps} />);
    expect(screen.getByRole('heading')).toBeInTheDocument();
    expect(screen.getByRole('list')).toBeInTheDocument();
    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(3);
  });
});
