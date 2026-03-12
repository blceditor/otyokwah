/**
 * InlineSessionCard Component
 * REQ-GRID-013: Compact inline session cards for camp sessions layout
 * REQ-U03-007: Session card styling with bark title, lighter background
 *
 * Lightweight card with translucent background for displaying session info
 * within colored grid sections. Does NOT include individual register button.
 */

export interface InlineSessionCardProps {
  title: string;
  dates: string;
  pricing: string;
  pricingNote?: string;
}

export function InlineSessionCard({
  title,
  dates,
  pricing,
  pricingNote = 'Early Bird / Regular',
}: InlineSessionCardProps): JSX.Element {
  // REQ-U03-006b: Use !m-0 to override prose plugin margins for tight spacing
  // Reference: image-10.png shows tight spacing vs image-11.png with excessive gaps
  return (
    <div className="bg-white/20 rounded-lg p-4">
      <h3 className="font-bold text-xl text-white !m-0 !mb-1">{title}</h3>
      <p className="text-white !m-0">{dates}</p>
      <p className="text-sm text-white/80 !m-0">{pricing} ({pricingNote})</p>
    </div>
  );
}

export default InlineSessionCard;
