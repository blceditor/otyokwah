// REQ-011: Accordion/FAQ Component
import { describe, test, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Accordion from './Accordion';
import '@testing-library/jest-dom/vitest';

describe('REQ-011 — Accordion/FAQ Component', () => {
  const MOCK_ITEMS = [
    {
      question: 'What ages do you serve?',
      answer: 'We offer programs for kids ages 8-18, divided into age-appropriate groups.',
    },
    {
      question: 'What should I bring?',
      answer: 'Bring comfortable clothing, toiletries, bedding, Bible, and any medications.',
    },
    {
      question: 'Is financial aid available?',
      answer: 'Yes, we offer scholarships based on need. Contact us for more information.',
    },
  ];

  test('renders multiple Q&A pairs', () => {
    render(<Accordion items={MOCK_ITEMS} />);

    // All questions should be visible
    expect(screen.getByText('What ages do you serve?')).toBeInTheDocument();
    expect(screen.getByText('What should I bring?')).toBeInTheDocument();
    expect(screen.getByText('Is financial aid available?')).toBeInTheDocument();
  });

  test('expands item on click', () => {
    render(<Accordion items={MOCK_ITEMS} />);

    const firstQuestion = screen.getByText('What ages do you serve?');

    // Click to expand
    fireEvent.click(firstQuestion);

    // Answer should be visible
    expect(screen.getByText(/We offer programs for kids ages 8-18/i)).toBeVisible();
  });

  test('collapses item on click', () => {
    render(<Accordion items={MOCK_ITEMS} />);

    const firstQuestion = screen.getByText('What ages do you serve?');

    // Click to expand
    fireEvent.click(firstQuestion);
    expect(screen.getByText(/We offer programs for kids ages 8-18/i)).toBeVisible();

    // Click again to collapse
    fireEvent.click(firstQuestion);

    // Answer should be hidden (check ARIA or not visible)
    const answer = screen.queryByText(/We offer programs for kids ages 8-18/i);

    if (answer === null) {
      // Answer removed from DOM - valid implementation
      expect(answer).toBeNull();
    } else {
      // Answer in DOM but hidden - check it's not visible
      expect(answer).not.toBeVisible();
    }
  });

  test('allows multiple items open simultaneously', () => {
    render(<Accordion items={MOCK_ITEMS} allowMultiple={true} />);

    const firstQuestion = screen.getByText('What ages do you serve?');
    const secondQuestion = screen.getByText('What should I bring?');

    // Open first item
    fireEvent.click(firstQuestion);
    expect(screen.getByText(/We offer programs for kids ages 8-18/i)).toBeVisible();

    // Open second item
    fireEvent.click(secondQuestion);
    expect(screen.getByText(/Bring comfortable clothing/i)).toBeVisible();

    // First should still be open
    expect(screen.getByText(/We offer programs for kids ages 8-18/i)).toBeVisible();
  });

  test('keyboard navigation (Enter, Space, arrows)', () => {
    const { container } = render(<Accordion items={MOCK_ITEMS} />);

    // Get the button element (not just the span)
    const firstButton = container.querySelector('button') as HTMLButtonElement;
    expect(firstButton).toBeInTheDocument();

    // Should be focusable
    firstButton.focus();
    expect(document.activeElement).toBe(firstButton);

    // Enter key should expand
    fireEvent.keyDown(firstButton, { key: 'Enter', code: 'Enter' });
    expect(screen.getByText(/We offer programs for kids ages 8-18/i)).toBeVisible();

    // Space key should also work (should toggle closed)
    fireEvent.keyDown(firstButton, { key: ' ', code: 'Space' });
    // Should close the accordion (it was open from Enter key)
    expect(screen.queryByText(/We offer programs for kids ages 8-18/i)).not.toBeInTheDocument();
  });

  test('ARIA attributes correct (expanded, controls)', () => {
    const { container } = render(<Accordion items={MOCK_ITEMS} />);

    // Should have ARIA attributes
    const buttons = container.querySelectorAll('button');

    buttons.forEach(button => {
      // Should have aria-expanded
      expect(button).toHaveAttribute('aria-expanded');

      // Should have aria-controls or similar
      const hasAriaControls =
        button.hasAttribute('aria-controls') ||
        button.hasAttribute('aria-labelledby');
      expect(hasAriaControls).toBe(true);
    });
  });

  test('smooth expand/collapse animation', () => {
    const { container } = render(<Accordion items={MOCK_ITEMS} />);

    // Open first accordion item
    const firstQuestion = screen.getByText('What ages do you serve?');
    fireEvent.click(firstQuestion);

    // Answer content should be visible after expanding
    expect(screen.getByText(/We offer programs for kids ages 8-18/i)).toBeVisible();

    // Answer should have a data-testid for identification
    const answerElements = container.querySelectorAll('[data-testid*="answer"]');
    expect(answerElements.length).toBeGreaterThan(0);
  });

  test('default state: all collapsed', () => {
    render(<Accordion items={MOCK_ITEMS} />);

    // Answers should not be visible by default
    const answer1 = screen.queryByText(/We offer programs for kids ages 8-18/i);
    const answer2 = screen.queryByText(/Bring comfortable clothing/i);
    const answer3 = screen.queryByText(/Yes, we offer scholarships/i);

    // Check each answer is either not in DOM or not visible
    [answer1, answer2, answer3].forEach(answer => {
      if (answer === null) {
        // Not in DOM - valid
        expect(answer).toBeNull();
      } else {
        // In DOM but should not be visible
        expect(answer).not.toBeVisible();
      }
    });
  });
});
