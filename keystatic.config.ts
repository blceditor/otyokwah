/**
 * Keystatic Configuration Entry Point
 * REQ-KEYSTATIC-001: Modular config structure
 *
 * This file re-exports the modular config from lib/keystatic.
 * Keystatic requires this file to be at the project root.
 */
export { default } from "./lib/keystatic/config";
export * from "./lib/keystatic/constants";
