/**
 * REQ-BUILD-014: Curated Lucide Icon Map
 *
 * This file contains explicit imports for only the icons used across the site.
 * This enables tree-shaking and reduces bundle size compared to barrel imports.
 *
 * Icons are defined in LUCIDE_ICON_OPTIONS in keystatic.config.ts
 */

import type { LucideIcon } from 'lucide-react';

// Import only the icons we actually use
import {
  Award,
  Backpack,
  Ban,
  Bed,
  Book,
  Building,
  Calendar,
  Camera,
  Car,
  Check,
  CheckCircle,
  ClipboardCheck,
  ClipboardList,
  Clock,
  Cross,
  DollarSign,
  Droplet,
  Flower,
  Gamepad2,
  Gift,
  GraduationCap,
  Heart,
  Leaf,
  Lightbulb,
  Link as LinkIcon,
  Mail,
  MessageCircle,
  Mountain,
  Phone,
  Pill,
  Search,
  Shield,
  Shirt,
  Smartphone,
  Star,
  Stethoscope,
  Sun,
  Users,
  Wallet,
} from 'lucide-react';

/**
 * Icon map for string-based lookups (used by CMS components)
 * Keys match the values in LUCIDE_ICON_OPTIONS from keystatic.config.ts
 */
export const iconMap: Record<string, LucideIcon> = {
  Award,
  Backpack,
  Ban,
  Bed,
  Book,
  Building,
  Calendar,
  Camera,
  Car,
  Check,
  CheckCircle,
  ClipboardCheck,
  ClipboardList,
  Clock,
  Cross,
  DollarSign,
  Droplet,
  Flower,
  Gamepad2,
  Gift,
  GraduationCap,
  Heart,
  Leaf,
  Lightbulb,
  Link: LinkIcon,
  Mail,
  MessageCircle,
  Mountain,
  Phone,
  Pill,
  Search,
  Shield,
  Shirt,
  Smartphone,
  Star,
  Stethoscope,
  Sun,
  Users,
  Wallet,
};

/**
 * Get an icon component by name
 * @param name - The icon name (e.g., "Heart", "Calendar")
 * @returns The Lucide icon component or null if not found
 */
export function getIconByName(name: string): LucideIcon | null {
  return iconMap[name] || null;
}

/**
 * Check if an icon name is valid
 * @param name - The icon name to check
 * @returns true if the icon exists in the map
 */
export function isValidIconName(name: string): boolean {
  return name in iconMap;
}

// Re-export commonly used icons for direct imports
export {
  Award,
  Backpack,
  Ban,
  Bed,
  Book,
  Building,
  Calendar,
  Camera,
  Car,
  Check,
  CheckCircle,
  ClipboardCheck,
  ClipboardList,
  Clock,
  Cross,
  DollarSign,
  Droplet,
  Flower,
  Gamepad2,
  Gift,
  GraduationCap,
  Heart,
  Leaf,
  Lightbulb,
  LinkIcon,
  Mail,
  MessageCircle,
  Mountain,
  Phone,
  Pill,
  Search,
  Shield,
  Shirt,
  Smartphone,
  Star,
  Stethoscope,
  Sun,
  Users,
  Wallet,
};

// Export the type for use in other components
export type { LucideIcon };
