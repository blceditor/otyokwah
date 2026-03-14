"use client";

/**
 * CTA Button Component
 * REQ-F006: Consistent call-to-action buttons
 */

import type { ReactNode } from "react";
import { trackEvent } from "@/lib/analytics/gtag";

const DEFAULT_REGISTRATION_URL =
  "https://www.ultracamp.com/clientlogin.aspx?idCamp=1342&campCode=OTY";

export interface CTAButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void | Promise<void>;
  variant?: "primary" | "secondary" | "inverse" | "outline";
  size?: "sm" | "md" | "lg";
  external?: boolean;
  /** Text color for inverse variant - matches section background */
  textColor?: "primary" | "secondary" | "accent" | "bark" | "white";
}

export function CTAButton({
  children,
  href,
  onClick,
  variant = "primary",
  size = "md",
  external,
  textColor,
}: CTAButtonProps): JSX.Element {
  // REQ-U03-006a: Add no-underline to prevent prose plugin from adding underlines
  const baseClasses =
    "inline-flex items-center justify-center font-semibold rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 no-underline";

  // Text color classes for inverse variant
  const textColorClasses: Record<string, string> = {
    primary: "text-primary",
    secondary: "text-secondary",
    accent: "text-accent",
    bark: "text-bark",
    white: "text-white",
  };

  // Get inverse variant with correct text color
  const getInverseClasses = () => {
    const baseInverse =
      "bg-white hover:bg-cream shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 font-bold";
    const color = textColor ? textColorClasses[textColor] : "text-secondary";
    return `${baseInverse} ${color}`;
  };

  const variantClasses = {
    primary: "bg-secondary text-white hover:bg-secondary-light",
    secondary:
      "border-2 border-secondary text-secondary bg-transparent hover:bg-stone/10",
    inverse: getInverseClasses(),
    outline:
      "border-2 border-white text-white bg-transparent hover:bg-white/10",
  };

  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3",
    lg: "px-8 py-4 text-lg",
  };

  const className = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`;

  const fireTrackEvent = (e: React.MouseEvent<HTMLElement>) => {
    const label = e.currentTarget.textContent || "";
    trackEvent("cta_click", {
      cta_label: label.trim(),
      cta_href: href || "",
      cta_variant: variant,
      is_external: String(!!external),
    });
  };

  // If onClick is provided, render as button (takes priority)
  if (onClick) {
    return (
      <button
        type="button"
        onClick={(e) => {
          fireTrackEvent(e);
          onClick();
        }}
        className={className}
        data-component="cta-button"
      >
        {children}
      </button>
    );
  }

  // If href is provided, render as link
  if (href) {
    // Handle "register" shortcut
    const actualHref = href === "register" ? DEFAULT_REGISTRATION_URL : href;

    // Determine if link should open in new tab
    const shouldOpenExternal =
      external !== undefined ? external : href === "register";

    const externalProps = shouldOpenExternal
      ? { target: "_blank", rel: "noopener noreferrer" }
      : {};

    return (
      <a
        href={actualHref}
        className={className}
        data-component="cta-button"
        onClick={fireTrackEvent}
        {...externalProps}
      >
        {children}
      </a>
    );
  }

  // Fallback: render as disabled button (should not happen with proper types)
  return (
    <button
      type="button"
      disabled
      className={className}
      data-component="cta-button"
    >
      {children}
    </button>
  );
}
