/**
 * SessionCard Component
 * REQ-UI-005: Session card styling for camp dates
 *
 * Lightweight card for displaying session information
 * Similar to ProgramCard but without images
 */

import { Calendar, Users, DollarSign } from 'lucide-react';

export interface SessionCardProps {
  title: string;
  dates: string;
  grades: string;
  pricing: string;
  earlyBird?: string;
  registrationLink?: string;
}

export function SessionCard({
  title,
  dates,
  grades,
  pricing,
  earlyBird,
  registrationLink = 'https://www.ultracamp.com/clientlogin.aspx?idCamp=1342&campcode=OTY',
}: SessionCardProps): JSX.Element {
  return (
    <article className="bg-cream rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow border-l-4 border-secondary">
      <h3 className="text-xl font-bold text-bark mb-4 text-left">{title}</h3>

      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-secondary flex-shrink-0" aria-hidden="true" />
          <span className="text-bark font-semibold">{dates}</span>
        </div>

        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-secondary flex-shrink-0" aria-hidden="true" />
          <span className="text-bark">{grades}</span>
        </div>

        <div className="flex items-center gap-3">
          <DollarSign className="w-5 h-5 text-secondary flex-shrink-0" aria-hidden="true" />
          <div>
            <span className="text-bark font-semibold">{pricing}</span>
            {earlyBird && (
              <span className="text-accent text-sm ml-2">({earlyBird})</span>
            )}
          </div>
        </div>
      </div>

      <a
        href={registrationLink}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block w-full text-center bg-secondary text-white font-semibold px-6 py-3 min-h-[44px] rounded-lg hover:bg-secondary-light transition-colors duration-200"
      >
        Register for {title}
      </a>
    </article>
  );
}

export default SessionCard;
