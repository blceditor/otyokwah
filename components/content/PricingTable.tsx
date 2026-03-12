import { Check } from 'lucide-react';

interface PricingTier {
  name: string;
  price: number;
  period: string;
  features: string[];
  cta: {
    text: string;
    url: string;
  };
  popular?: boolean;
}

interface PricingTableProps {
  tiers: PricingTier[];
}

export function PricingTable({ tiers }: PricingTableProps) {
  return (
    <div
      className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
      data-testid="pricing-table"
    >
      {tiers.map((tier, index) => (
        <div
          key={index}
          className={`relative flex flex-col rounded-lg border-2 bg-white p-6 shadow-sm transition-shadow hover:shadow-lg sm:p-8 ${
            tier.popular
              ? 'border-primary ring-2 ring-primary ring-offset-2'
              : 'border-stone/20'
          }`}
          data-testid={`pricing-tier-${index}`}
        >
          {tier.popular && (
            <div
              className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-sm font-semibold text-white"
              data-testid="popular-badge"
            >
              Most Popular
            </div>
          )}

          <div className="mb-6">
            <h3 className="mb-2 text-2xl font-bold text-bark">
              {tier.name}
            </h3>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-bark">
                ${tier.price}
              </span>
              <span className="text-sm text-stone">
                {tier.period}
              </span>
            </div>
          </div>

          <ul className="mb-8 flex-1 space-y-3">
            {tier.features.map((feature, featureIndex) => (
              <li
                key={featureIndex}
                className="flex items-start gap-3 text-bark/80"
              >
                <Check className="h-5 w-5 flex-shrink-0 text-secondary" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <a
            href={tier.cta.url}
            className={`block w-full rounded-lg py-3 text-center font-semibold transition-colors ${
              tier.popular
                ? 'bg-primary text-white hover:bg-primary-dark'
                : 'bg-cream text-bark hover:bg-cream'
            }`}
          >
            {tier.cta.text}
          </a>
        </div>
      ))}
    </div>
  );
}

export default PricingTable;
