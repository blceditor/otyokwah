/**
 * Navigation Type Definitions
 * REQ-301: Header Layout Structure
 * REQ-303: Navigation Menu Items
 */

export interface NavLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface NavMenuItem {
  label: string;
  href?: string;
  children?: NavLink[];
}

export interface NavigationConfig {
  logo: {
    src: string;
    alt: string;
    href: string;
  };
  menuItems: NavMenuItem[];
  primaryCTA: NavLink;
  secondaryCTA?: NavLink;
}

export interface HeaderProps {
  navigation?: NavigationConfig;
  transparent?: boolean;
  // REQ-ADMIN-002: isAdmin now determined client-side via /api/auth/check
}

export interface DropdownMenuProps {
  items: NavLink[];
  isOpen: boolean;
  onClose: () => void;
}

export interface NavItemProps {
  item: NavMenuItem;
  isActive?: boolean;
}

export interface MobileNavProps {
  navigation: NavigationConfig;
  isOpen: boolean;
  onClose: () => void;
}

export interface LogoProps {
  src: string;
  alt: string;
  href: string;
  isScrolled?: boolean;
}
