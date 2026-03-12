/**
 * Keystatic Configuration
 * REQ-KEYSTATIC-001: Modular config structure
 *
 * This is the main Keystatic configuration that assembles
 * all singletons and collections into the final config.
 */
import { config } from "@keystatic/core";
import { getStorageConfig } from "./constants";
import { singletons } from "./singletons";
import { collections } from "./collections";

const storageConfig = getStorageConfig();

export default config({
  storage: storageConfig,

  ui: {
    navigation: {
      Content: ["pages", "testimonials", "faqs"],
      Settings: ["siteNavigation", "siteConfig"],
    },
  },

  singletons,
  collections,
});
