import { getIconByName } from '@/lib/icons';
import { getGridClasses, type GridColumns } from '@/lib/design-system/grid-classes';

interface Feature {
  icon: string;
  heading: string;
  description: string;
  link?: string;
}

interface FeatureGridProps {
  features: Feature[];
  columns?: GridColumns;
}

export function FeatureGrid({ features, columns = 3 }: FeatureGridProps) {
  return (
    <div className={getGridClasses(columns, 'md')} data-testid="feature-grid">
      {features.map((feature, index) => {
        const Icon = getIconByName(feature.icon);
        const content = (
          <>
            <div className="mb-4 text-primary">
              {Icon ? <Icon className="h-8 w-8" data-testid={`icon-${feature.icon}`} /> : null}
            </div>
            <h3 className="mb-2 text-xl font-semibold">{feature.heading}</h3>
            <p className="text-stone">{feature.description}</p>
          </>
        );

        if (feature.link) {
          return (
            <a
              key={index}
              href={feature.link}
              className="block rounded-lg border border-stone/20 p-6 transition-shadow hover:shadow-lg"
              data-testid={`feature-${index}`}
            >
              {content}
            </a>
          );
        }

        return (
          <div
            key={index}
            className="rounded-lg border border-stone/20 p-6"
            data-testid={`feature-${index}`}
          >
            {content}
          </div>
        );
      })}
    </div>
  );
}

export default FeatureGrid;
