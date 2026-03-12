/**
 * Keystatic Configuration Constants
 * REQ-KEYSTATIC-001: Modular config structure
 */

import { DEFAULT_GITHUB_OWNER, DEFAULT_GITHUB_REPO } from "@/lib/config";

// REQ-CARD-002: Lucide icons for CMS dropdown selects
// Includes all icons currently used in content + common options
export const LUCIDE_ICON_OPTIONS = [
  { label: "None", value: "" },
  { label: "Award", value: "Award" },
  { label: "Backpack", value: "Backpack" },
  { label: "Ban", value: "Ban" },
  { label: "Bed", value: "Bed" },
  { label: "Book", value: "Book" },
  { label: "Building", value: "Building" },
  { label: "Calendar", value: "Calendar" },
  { label: "Camera", value: "Camera" },
  { label: "Car", value: "Car" },
  { label: "Check", value: "Check" },
  { label: "CheckCircle", value: "CheckCircle" },
  { label: "ClipboardCheck", value: "ClipboardCheck" },
  { label: "ClipboardList", value: "ClipboardList" },
  { label: "Clock", value: "Clock" },
  { label: "Cross", value: "Cross" },
  { label: "DollarSign", value: "DollarSign" },
  { label: "Droplet", value: "Droplet" },
  { label: "Flower", value: "Flower" },
  { label: "Gamepad2", value: "Gamepad2" },
  { label: "Gift", value: "Gift" },
  { label: "GraduationCap", value: "GraduationCap" },
  { label: "Heart", value: "Heart" },
  { label: "Leaf", value: "Leaf" },
  { label: "Lightbulb", value: "Lightbulb" },
  { label: "Mail", value: "Mail" },
  { label: "MessageCircle", value: "MessageCircle" },
  { label: "Mountain", value: "Mountain" },
  { label: "Phone", value: "Phone" },
  { label: "Pill", value: "Pill" },
  { label: "Search", value: "Search" },
  { label: "Shield", value: "Shield" },
  { label: "Shirt", value: "Shirt" },
  { label: "Smartphone", value: "Smartphone" },
  { label: "Star", value: "Star" },
  { label: "Stethoscope", value: "Stethoscope" },
  { label: "Sun", value: "Sun" },
  { label: "Users", value: "Users" },
  { label: "Wallet", value: "Wallet" },
] as const;

// REQ-CARD-003: CTA Button text color options
export const CTA_TEXT_COLOR_OPTIONS = [
  { label: "Default", value: "" },
  { label: "White", value: "white" },
  { label: "Primary Blue", value: "primary" },
  { label: "Secondary Green", value: "secondary" },
  { label: "Accent Brown", value: "accent" },
  { label: "Bark (Dark Brown)", value: "bark" },
] as const;

export function getStorageConfig() {
  if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
    return { kind: "local" as const };
  }

  const branchPrefix = process.env.KEYSTATIC_BRANCH_PREFIX;
  return {
    kind: "github" as const,
    repo: {
      owner: process.env.GITHUB_OWNER || DEFAULT_GITHUB_OWNER,
      name: process.env.GITHUB_REPO || DEFAULT_GITHUB_REPO,
    },
    ...(branchPrefix ? { branchPrefix } : {}),
  };
}

// P2-04: Design token hex values for use in inline styles (where Tailwind classes aren't available)
export const DESIGN_TOKEN_HEX = {
  cream: "#f5f0e8",
  primary: "#4A7A9E",
  secondary: "#2F4F3D",
  accent: "#A07856",
  bark: "#3d2e1f",
} as const;

// P1-05: Standardized background color presets aligned with design tokens
export const BACKGROUND_COLOR_OPTIONS = [
  { label: "None", value: "" },
  { label: "Primary (#4A7A9E)", value: "#4A7A9E" },
  { label: "Secondary (#2F4F3D)", value: "#2F4F3D" },
  { label: "Accent (#A07856)", value: "#A07856" },
  { label: "Cream (#f5f0e8)", value: "#f5f0e8" },
  { label: "White (#ffffff)", value: "#ffffff" },
  { label: "Bark (#3d2e1f)", value: "#3d2e1f" },
  { label: "Dark Blue (#2F5A7A)", value: "#2F5A7A" },
] as const;

// P1-05: Standardized text color presets
export const TEXT_COLOR_OPTIONS = [
  { label: "Dark (for light backgrounds)", value: "dark" },
  { label: "Light (for dark backgrounds)", value: "light" },
  { label: "Primary Blue", value: "primary" },
  { label: "Secondary Green", value: "secondary" },
  { label: "Accent Brown", value: "accent" },
] as const;

export type LucideIconOption = (typeof LUCIDE_ICON_OPTIONS)[number];
export type CtaTextColorOption = (typeof CTA_TEXT_COLOR_OPTIONS)[number];
export type BackgroundColorOption = (typeof BACKGROUND_COLOR_OPTIONS)[number];
export type TextColorOption = (typeof TEXT_COLOR_OPTIONS)[number];
