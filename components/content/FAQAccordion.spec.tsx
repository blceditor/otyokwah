// REQ-F004: FAQ Accordion Component (5 SP)
import { describe, test, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FAQAccordion } from './FAQAccordion';
import '@testing-library/jest-dom/vitest';

describe('REQ-F004 — FAQ Accordion Component', () => {
  const MOCK_FAQ_ITEMS = [
    {
      question: 'What ages do you serve?',
      answer: 'We offer programs for kids ages 8-18, divided into age-appropriate groups.',
      category: 'summer-camp',
    },
    {
      question: 'When is the registration deadline?',
      answer: 'Registration typically closes two weeks before each session starts.',
      category: 'registration',
    },
    {
      question: 'What are the staff requirements?',
      answer: 'Staff must be 18+ years old and complete a background check.',
      category: 'staff',
    },
    {
      question: 'What is the LIT program?',
      answer: 'Leadership in Training is for 16-17 year olds preparing for staff positions.',
      category: 'lit',
    },
    {
      question: 'What should I bring to camp?',
      answer: 'Bring comfortable clothing, toiletries, bedding, Bible, and any medications.',
      category: 'summer-camp',
    },
  ];

  describe('Basic Rendering', () => {
    test('renders all FAQ items', () => {
      render(<FAQAccordion items={MOCK_FAQ_ITEMS} />);

      // All questions should be visible
      expect(screen.getByText('What ages do you serve?')).toBeInTheDocument();
      expect(screen.getByText('When is the registration deadline?')).toBeInTheDocument();
      expect(screen.getByText('What are the staff requirements?')).toBeInTheDocument();
      expect(screen.getByText('What is the LIT program?')).toBeInTheDocument();
      expect(screen.getByText('What should I bring to camp?')).toBeInTheDocument();
    });

    test('all items collapsed by default', () => {
      render(<FAQAccordion items={MOCK_FAQ_ITEMS} />);

      // Answers should not be visible by default
      expect(screen.queryByText(/We offer programs for kids ages 8-18/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Registration typically closes/i)).not.toBeInTheDocument();
    });

    test('renders empty state gracefully', () => {
      render(<FAQAccordion items={[]} />);

      // Should not crash
      const container = screen.queryByRole('region');
      expect(container).toBeTruthy();
    });
  });

  describe('Expand/Collapse Behavior', () => {
    test('expands item on click', () => {
      render(<FAQAccordion items={MOCK_FAQ_ITEMS} />);

      const firstQuestion = screen.getByText('What ages do you serve?');
      fireEvent.click(firstQuestion);

      // Answer should be visible
      expect(screen.getByText(/We offer programs for kids ages 8-18/i)).toBeVisible();
    });

    test('collapses item on second click', () => {
      render(<FAQAccordion items={MOCK_FAQ_ITEMS} />);

      const firstQuestion = screen.getByText('What ages do you serve?');

      // Click to expand
      fireEvent.click(firstQuestion);
      expect(screen.getByText(/We offer programs for kids ages 8-18/i)).toBeVisible();

      // Click again to collapse
      fireEvent.click(firstQuestion);
      expect(screen.queryByText(/We offer programs for kids ages 8-18/i)).not.toBeInTheDocument();
    });

    test('only one item open at a time by default', () => {
      render(<FAQAccordion items={MOCK_FAQ_ITEMS} />);

      const firstQuestion = screen.getByText('What ages do you serve?');
      const secondQuestion = screen.getByText('When is the registration deadline?');

      // Open first item
      fireEvent.click(firstQuestion);
      expect(screen.getByText(/We offer programs for kids ages 8-18/i)).toBeVisible();

      // Open second item
      fireEvent.click(secondQuestion);
      expect(screen.getByText(/Registration typically closes/i)).toBeVisible();

      // First should be closed
      expect(screen.queryByText(/We offer programs for kids ages 8-18/i)).not.toBeInTheDocument();
    });

    test('allows multiple items open with allowMultiple prop', () => {
      render(<FAQAccordion items={MOCK_FAQ_ITEMS} allowMultiple={true} />);

      const firstQuestion = screen.getByText('What ages do you serve?');
      const secondQuestion = screen.getByText('When is the registration deadline?');

      // Open first item
      fireEvent.click(firstQuestion);
      expect(screen.getByText(/We offer programs for kids ages 8-18/i)).toBeVisible();

      // Open second item
      fireEvent.click(secondQuestion);
      expect(screen.getByText(/Registration typically closes/i)).toBeVisible();

      // Both should still be open
      expect(screen.getByText(/We offer programs for kids ages 8-18/i)).toBeVisible();
      expect(screen.getByText(/Registration typically closes/i)).toBeVisible();
    });
  });

  describe('Category Support', () => {
    test('groups items by category with headers', () => {
      render(<FAQAccordion items={MOCK_FAQ_ITEMS} />);

      // Should have category headers
      expect(screen.getByText('Summer Camp')).toBeInTheDocument();
      expect(screen.getByText('Registration')).toBeInTheDocument();
      expect(screen.getByText('Staff')).toBeInTheDocument();
      expect(screen.getByText('LIT')).toBeInTheDocument();
    });

    test('handles items without categories', () => {
      const mixedItems = [
        ...MOCK_FAQ_ITEMS,
        {
          question: 'General question?',
          answer: 'General answer.',
        },
      ];

      render(<FAQAccordion items={mixedItems} />);

      // Should render without crashing
      expect(screen.getByText('General question?')).toBeInTheDocument();
      expect(screen.getByText('General')).toBeInTheDocument();
    });

    test('category headers have proper semantic structure', () => {
      const { container } = render(<FAQAccordion items={MOCK_FAQ_ITEMS} />);

      // Category headers should be headings
      const headers = container.querySelectorAll('h3');
      expect(headers.length).toBeGreaterThan(0);
    });
  });

  describe('Keyboard Navigation', () => {
    test('Enter key expands item', () => {
      const { container } = render(<FAQAccordion items={MOCK_FAQ_ITEMS} />);

      const firstButton = container.querySelector('button') as HTMLButtonElement;
      expect(firstButton).toBeInTheDocument();

      firstButton.focus();
      fireEvent.keyDown(firstButton, { key: 'Enter', code: 'Enter' });

      expect(screen.getByText(/We offer programs for kids ages 8-18/i)).toBeVisible();
    });

    test('Space key expands item', () => {
      const { container } = render(<FAQAccordion items={MOCK_FAQ_ITEMS} />);

      const firstButton = container.querySelector('button') as HTMLButtonElement;
      expect(firstButton).toBeInTheDocument();

      firstButton.focus();
      fireEvent.keyDown(firstButton, { key: ' ', code: 'Space' });

      expect(screen.getByText(/We offer programs for kids ages 8-18/i)).toBeVisible();
    });

    test('all accordion buttons are focusable', () => {
      const { container } = render(<FAQAccordion items={MOCK_FAQ_ITEMS} />);

      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBe(MOCK_FAQ_ITEMS.length);

      buttons.forEach((button) => {
        button.focus();
        expect(document.activeElement).toBe(button);
      });
    });
  });

  describe('Accessibility (WCAG 2.1 AA)', () => {
    test('has proper ARIA attributes', () => {
      const { container } = render(<FAQAccordion items={MOCK_FAQ_ITEMS} />);

      const buttons = container.querySelectorAll('button');

      buttons.forEach((button) => {
        // Should have aria-expanded
        expect(button).toHaveAttribute('aria-expanded');

        // Should have aria-controls
        expect(button).toHaveAttribute('aria-controls');
      });
    });

    test('aria-expanded reflects state correctly', () => {
      const { container } = render(<FAQAccordion items={MOCK_FAQ_ITEMS} />);

      const firstButton = container.querySelector('button') as HTMLButtonElement;

      // Should be collapsed initially
      expect(firstButton).toHaveAttribute('aria-expanded', 'false');

      // Click to expand
      fireEvent.click(firstButton);

      // Should be expanded
      expect(firstButton).toHaveAttribute('aria-expanded', 'true');
    });

    test('expanded content has role="region"', () => {
      const { container } = render(<FAQAccordion items={MOCK_FAQ_ITEMS} />);

      const firstButton = container.querySelector('button') as HTMLButtonElement;
      fireEvent.click(firstButton);

      // Find the expanded content
      const answerId = firstButton.getAttribute('aria-controls');
      expect(answerId).toBeTruthy();

      const answerElement = container.querySelector(`#${answerId}`);
      expect(answerElement).toHaveAttribute('role', 'region');
    });

    test('buttons are focusable', () => {
      const { container } = render(<FAQAccordion items={MOCK_FAQ_ITEMS} />);

      const buttons = container.querySelectorAll('button');
      buttons.forEach((button) => {
        button.focus();
        expect(document.activeElement).toBe(button);
      });
    });
  });

  describe('Responsive Design', () => {
    test('renders all questions at any viewport', () => {
      render(<FAQAccordion items={MOCK_FAQ_ITEMS} />);

      MOCK_FAQ_ITEMS.forEach((item) => {
        expect(screen.getByText(item.question)).toBeInTheDocument();
      });
    });
  });

  describe('Animation', () => {
    test('answer content appears when expanded', () => {
      render(<FAQAccordion items={MOCK_FAQ_ITEMS} />);

      const firstQuestion = screen.getByText('What ages do you serve?');
      fireEvent.click(firstQuestion);

      const answerContent = screen.getByTestId('faq-answer-0');
      expect(answerContent).toBeInTheDocument();
    });

    test('chevron icon exists in question buttons', () => {
      const { container } = render(<FAQAccordion items={MOCK_FAQ_ITEMS} />);

      const firstButton = container.querySelector('button') as HTMLButtonElement;
      const chevron = firstButton.querySelector('svg');
      expect(chevron).toBeInTheDocument();
      expect(chevron).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('REQ-U01-004 — Accordion Structure', () => {
    test('renders FAQ items with testid attributes', () => {
      const { container } = render(<FAQAccordion items={MOCK_FAQ_ITEMS} />);

      const items = container.querySelectorAll('[data-testid^="faq-item-"]');
      expect(items.length).toBe(MOCK_FAQ_ITEMS.length);
    });

    test('answer content is accessible when expanded', () => {
      render(<FAQAccordion items={MOCK_FAQ_ITEMS} />);

      const firstQuestion = screen.getByText('What ages do you serve?');
      fireEvent.click(firstQuestion);

      const answerElement = screen.getByTestId('faq-answer-0');
      expect(answerElement).toBeInTheDocument();
      expect(screen.getByText(/We offer programs for kids ages 8-18/i)).toBeVisible();
    });
  });

  describe('Custom className', () => {
    test('accepts and applies custom className', () => {
      const { container } = render(
        <FAQAccordion items={MOCK_FAQ_ITEMS} className="my-custom-class" />
      );

      // Should apply custom class to wrapper
      expect(container.querySelector('.my-custom-class')).toBeInTheDocument();
    });
  });
});
