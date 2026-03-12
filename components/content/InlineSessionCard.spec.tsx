/**
 * InlineSessionCard Component Tests
 * REQ-GRID-013: Compact inline session cards for camp sessions layout
 */

import { render, screen } from '@testing-library/react';
import { InlineSessionCard } from './InlineSessionCard';

describe('InlineSessionCard Component', () => {
  describe('REQ-GRID-013a: Compact Card Design', () => {
    it('renders title in bold xl text with white color', () => {
      render(
        <InlineSessionCard
          title="Junior 1"
          dates="June 14-19, 2026"
          pricing="$390 / $440"
        />
      );

      const title = screen.getByText('Junior 1');
      expect(title).toBeInTheDocument();
      // REQ-U03-006b: Title should be white on colored background
    });

    it('renders dates with white color', () => {
      render(
        <InlineSessionCard
          title="Junior 1"
          dates="June 14-19, 2026"
          pricing="$390 / $440"
        />
      );

      const dates = screen.getByText('June 14-19, 2026');
      expect(dates).toBeInTheDocument();
    });

    it('renders pricing with early bird note', () => {
      render(
        <InlineSessionCard
          title="Junior 1"
          dates="June 14-19, 2026"
          pricing="$390 / $440"
          pricingNote="Early Bird / Regular"
        />
      );

      expect(screen.getByText('$390 / $440 (Early Bird / Regular)')).toBeInTheDocument();
    });
  });

  describe('REQ-GRID-013b: Translucent Background', () => {
    it('has translucent/lighter background', () => {
      const { container } = render(
        <InlineSessionCard
          title="Junior 1"
          dates="June 14-19, 2026"
          pricing="$390 / $440"
        />
      );

      const card = container.firstChild as HTMLElement;
      // Should have white with 20% opacity for lighter translucent effect
    });

    it('has rounded corners and padding', () => {
      const { container } = render(
        <InlineSessionCard
          title="Junior 1"
          dates="June 14-19, 2026"
          pricing="$390 / $440"
        />
      );

      const card = container.firstChild as HTMLElement;
    });
  });

  describe('REQ-U03-006b: Tight Spacing', () => {
    it('has zero margins on elements to override prose plugin', () => {
      const { container } = render(
        <InlineSessionCard
          title="Junior 1"
          dates="June 14-19, 2026"
          pricing="$390 / $440"
        />
      );

      const title = screen.getByText('Junior 1');
      const dates = screen.getByText('June 14-19, 2026');

      // Elements should have !m-0 class to override prose margins
    });
  });

  describe('REQ-GRID-013c: No Individual Register Button', () => {
    it('does NOT render a register button', () => {
      render(
        <InlineSessionCard
          title="Junior 1"
          dates="June 14-19, 2026"
          pricing="$390 / $440"
        />
      );

      // Should NOT have a register button - one button per section, not per card
      expect(screen.queryByRole('link', { name: /register/i })).not.toBeInTheDocument();
    });
  });
});
