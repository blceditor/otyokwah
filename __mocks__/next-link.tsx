import React from 'react';

interface LinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  [key: string]: unknown;
}

export default function Link({ href, children, className, ...props }: LinkProps) {
  return <a href={href} className={className} {...props}>{children}</a>;
}
