/**
 * SessionCardGroup Component
 * REQ-GRID-013: Container for inline session cards with grid gap
 *
 * Wraps InlineSessionCard components in a grid layout with proper spacing.
 * Matches the camp sessions page design.
 */

import React from 'react';

export interface SessionCardGroupProps {
  children: React.ReactNode;
}

export function SessionCardGroup({ children }: SessionCardGroupProps): JSX.Element {
  return (
    <div className="grid gap-4 mb-8">
      {children}
    </div>
  );
}

export default SessionCardGroup;
