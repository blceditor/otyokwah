interface TimelineItem {
  date: string;
  heading: string;
  description: string;
}

interface TimelineProps {
  items: TimelineItem[];
  alternating?: boolean;
}

export function Timeline({ items, alternating = false }: TimelineProps) {
  return (
    <div className="relative" data-testid="timeline">
      {items.length > 1 && (
        <div
          className="absolute left-4 top-0 h-full w-0.5 bg-primary-light md:left-1/2"
          data-testid="timeline-line"
        />
      )}

      <ol className="relative space-y-8 md:space-y-12">
        {items.map((item, index) => {
          const isEven = index % 2 === 0;
          const alignRight = alternating && !isEven;

          return (
            <li
              key={index}
              className={`relative flex flex-col ${
                alternating
                  ? 'md:flex-row md:items-center md:justify-between'
                  : ''
              }`}
              data-testid={`timeline-item-${index}`}
            >
              <div
                className={`flex-1 pl-12 md:pl-0 ${
                  alignRight ? 'md:order-2 md:pl-12 md:text-left' : 'md:pr-12 md:text-right'
                }`}
              >
                <div className="mb-1 text-sm font-semibold text-primary sm:text-base">
                  {item.date}
                </div>
                <h3 className="mb-2 text-xl font-bold text-bark sm:text-2xl">
                  {item.heading}
                </h3>
                <p className="text-base text-bark/80 sm:text-lg">
                  {item.description}
                </p>
              </div>

              <div
                className={`absolute left-4 top-0 h-4 w-4 rounded-full border-4 border-primary bg-white md:left-1/2 md:-translate-x-1/2 ${
                  alternating ? 'md:order-1' : ''
                }`}
              />

              {alternating && (
                <div className={`flex-1 ${alignRight ? 'md:order-1' : 'md:order-2'}`} />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default Timeline;
