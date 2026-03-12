interface TrustItem {
  icon: string;
  text: string;
}

interface TrustBarProps {
  items?: TrustItem[];
  className?: string;
}

const defaultItems: TrustItem[] = [
  { icon: '🏆', text: 'ACA Accredited' },
  { icon: '👨‍👩‍👧‍👦', text: '500+ Families Served' },
  { icon: '📅', text: 'Since 1948' },
  { icon: '⭐', text: '4.9/5 Star Rating' },
  { icon: '🔄', text: '80% Return Rate' },
];

export default function TrustBar({ items = defaultItems, className = '' }: TrustBarProps) {
  return (
    <section
      id="trust-bar"
      role="complementary"
      aria-label="Trust signals and credibility indicators"
      className={`sticky top-0 z-40 bg-cream border-b border-sand py-3 md:py-4 ${className}`}
    >
      <div className="container mx-auto px-4">
        <div className="flex overflow-x-auto justify-around items-center gap-4 md:gap-6">
          {items.map((item, index) => (
            <div
              key={index}
              className="trust-item flex flex-col items-center min-h-12 min-w-12 p-2"
              data-testid={`trust-item-${index}`}
            >
              <span className="text-xl md:text-2xl mb-1" aria-hidden="true">
                {item.icon}
              </span>
              <span className="text-xs md:text-sm font-medium text-bark text-center">
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
