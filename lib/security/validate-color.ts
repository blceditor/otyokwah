/**
 * Color Validation Utilities
 * REQ-SEC-001: Prevent CSS injection via color fields
 */

const ALLOWED_TAILWIND_COLORS = [
  'cream', 'cream/90', 'accent-light', 'white', 'black',
  'gray-900', 'gray-700', 'gray-500', 'secondary', 'primary',
  'bark', 'forest', 'transparent'
] as const;

export function isValidHexColor(color: string): boolean {
  return /^#([0-9A-Fa-f]{3}){1,2}$/.test(color);
}

export function isAllowedTailwindColor(color: string): boolean {
  return ALLOWED_TAILWIND_COLORS.includes(color as typeof ALLOWED_TAILWIND_COLORS[number]);
}

export type SanitizedColor =
  | { type: 'hex'; value: string }
  | { type: 'class'; value: string }
  | { type: 'none'; value: '' };

export function sanitizeColorValue(color: string | undefined): SanitizedColor {
  if (!color) return { type: 'none', value: '' };
  if (isValidHexColor(color)) return { type: 'hex', value: color };
  if (isAllowedTailwindColor(color)) return { type: 'class', value: color };
  console.warn(`Invalid color value rejected: ${color}`);
  return { type: 'none', value: '' };
}
