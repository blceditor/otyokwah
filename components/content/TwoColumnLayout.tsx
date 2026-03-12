/**
 * REQ-723: Two Column Layout wrapper for Markdoc
 * Splits content into two side-by-side columns
 */

import React from 'react';

interface TwoColumnLayoutProps {
  reverseOnMobile?: boolean;
  children: React.ReactNode;
}

export function TwoColumnLayout({
  reverseOnMobile = false,
  children,
}: TwoColumnLayoutProps) {
  const reverseClass = reverseOnMobile ? 'flex-col-reverse' : 'flex-col';

  // Split children into left and right columns
  const childArray = React.Children.toArray(children);
  const midpoint = Math.ceil(childArray.length / 2);
  const leftContent = childArray.slice(0, midpoint);
  const rightContent = childArray.slice(midpoint);

  return (
    <div
      className={`flex ${reverseClass} md:flex-row gap-8 my-8`}
      data-testid="two-column-layout"
    >
      <div className="flex-1">{leftContent}</div>
      <div className="flex-1">{rightContent}</div>
    </div>
  );
}

export default TwoColumnLayout;
