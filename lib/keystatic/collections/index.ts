/**
 * Keystatic Collections Index
 * REQ-KEYSTATIC-001: Modular config structure
 */
export { pages } from "./pages";
export { testimonials } from "./testimonials";
export { faqs } from "./faqs";

// Re-export shared components for potential external use
export * from "./shared-components";

import { pages } from "./pages";
import { testimonials } from "./testimonials";
import { faqs } from "./faqs";

export const collections = {
  pages,
  testimonials,
  faqs,
};
