/**
 * CtaSection Component
 * REQ-U03-FIX-008: Full-width CTA section for camp sessions bottom template
 *
 * Full-width colored section with centered heading, description, and button.
 * Used for Scholarships Available (green) and Ready to Register (brown) sections.
 */

import Link from 'next/link';

export interface CtaSectionProps {
  heading: string;
  description: string;
  buttonLabel?: string;
  buttonHref?: string;
  variant: 'green' | 'brown';
  external?: boolean;
}

const variantStyles = {
  green: {
    bg: 'bg-secondary',
    buttonText: 'text-secondary',
  },
  brown: {
    bg: 'bg-bark',
    buttonText: 'text-bark',
  },
};

export function CtaSection({
  heading,
  description,
  buttonLabel,
  buttonHref,
  variant,
  external = false,
}: CtaSectionProps): JSX.Element {
  const styles = variantStyles[variant];

  // REQ-U03-006a: Add no-underline to prevent prose plugin from adding underlines
  const buttonClasses = `inline-block bg-white ${styles.buttonText} font-bold text-xl px-8 py-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2`;

  return (
    <section className={`py-16 ${styles.bg}`}>
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 font-heading">
          {heading}
        </h2>
        <p className="text-white/80 mb-8 text-lg">{description}</p>
        {buttonLabel && buttonHref && (
          external ? (
            <a
              href={buttonHref}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClasses}
            >
              {buttonLabel}
            </a>
          ) : (
            <Link href={buttonHref} className={buttonClasses}>
              {buttonLabel}
            </Link>
          )
        )}
      </div>
    </section>
  );
}

export default CtaSection;
