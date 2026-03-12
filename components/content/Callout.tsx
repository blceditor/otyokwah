// REQ-201: Callout Content Component
import React from 'react';

interface CalloutProps {
  type?: 'info' | 'warning' | 'success' | 'error' | 'tip';
  title?: string;
  children: React.ReactNode;
}

export function Callout({
  type = 'info',
  title,
  children
}: CalloutProps) {
  const typeStyles = {
    info: 'bg-primary/10 border-primary/30 text-primary-dark',
    warning: 'bg-accent/10 border-accent/30 text-bark',
    success: 'bg-secondary/10 border-secondary/30 text-secondary-dark',
    error: 'bg-red-50 border-red-200 text-red-900',
    tip: 'bg-cream border-accent/30 text-bark',
  };

  const icons = {
    info: '💡',
    warning: '⚠️',
    success: '✅',
    error: '❌',
    tip: '💭',
  };

  return (
    <div
      className={`callout my-6 p-4 border-l-4 rounded-lg ${typeStyles[type]}`}
      role="note"
      aria-label={`${type} callout`}
    >
      <div className="flex items-start">
        <span className="text-2xl mr-3" aria-hidden="true">
          {icons[type]}
        </span>
        <div className="flex-1">
          {title && (
            <h4 className="font-semibold mb-2 text-lg">{title}</h4>
          )}
          <div className="callout-content">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default Callout;