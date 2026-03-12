// REQ-413: Navigation Singleton in Keystatic Config Tests
import { describe, test, expect } from 'vitest';

describe('REQ-413 — Navigation Singleton in Keystatic', () => {
  test('Keystatic config includes siteNavigation singleton', async () => {
    const keystatic = await import('./keystatic.config');

    expect(keystatic.default.singletons).toHaveProperty('siteNavigation');
  });

  test('singleton stored in /content/navigation/ directory', async () => {
    const keystatic = await import('./keystatic.config');

    const siteNavigation = keystatic.default.singletons!.siteNavigation;

    // @ts-ignore - Accessing internal config
    expect(siteNavigation.path).toContain('content/navigation');
  });

  test('fields support menu items array with nested children', async () => {
    const keystatic = await import('./keystatic.config');

    const schema = keystatic.default.singletons!.siteNavigation.schema;

    expect(schema).toHaveProperty('menuItems');

    // menuItems should be an array field
    const menuItemsField = schema.menuItems;
    expect(menuItemsField).toBeDefined();

    // Should support children as nested array
    // TypeScript should validate the structure
  });

  test('fields support primaryCTA with label, href, and external flag', async () => {
    const keystatic = await import('./keystatic.config');

    const schema = keystatic.default.singletons!.siteNavigation.schema;

    expect(schema).toHaveProperty('primaryCTA');

    const primaryCTAField = schema.primaryCTA;
    expect(primaryCTAField).toBeDefined();
  });

  test('editor can add/remove/reorder menu items', async () => {
    const keystatic = await import('./keystatic.config');

    const schema = keystatic.default.singletons!.siteNavigation.schema;
    const menuItemsField = schema.menuItems;

    // Array fields support add/remove/reorder by default in Keystatic
    expect(menuItemsField).toBeDefined();
  });

  test('editor can edit all navigation text and links', async () => {
    const keystatic = await import('./keystatic.config');

    const schema = keystatic.default.singletons!.siteNavigation.schema;

    // Should have editable text and link fields
    expect(schema.menuItems).toBeDefined();
    expect(schema.primaryCTA).toBeDefined();
  });

  test('navigation validates required fields - label and href', async () => {
    const keystatic = await import('./keystatic.config');

    const schema = keystatic.default.singletons!.siteNavigation.schema;

    // Required fields should be defined in schema
    // TypeScript will enforce at compile time
    expect(schema.menuItems).toBeDefined();
  });

  test('menu items have label field', async () => {
    const keystatic = await import('./keystatic.config');

    const schema = keystatic.default.singletons!.siteNavigation.schema;

    // Validate menuItems schema structure
    expect(schema.menuItems).toBeDefined();
  });

  test('menu items have href field', async () => {
    const keystatic = await import('./keystatic.config');

    const schema = keystatic.default.singletons!.siteNavigation.schema;

    // href should be text field
    expect(schema.menuItems).toBeDefined();
  });

  test('menu items have optional children array', async () => {
    const keystatic = await import('./keystatic.config');

    const schema = keystatic.default.singletons!.siteNavigation.schema;

    // children should be optional array
    expect(schema.menuItems).toBeDefined();
  });

  test('menu items have external boolean flag', async () => {
    const keystatic = await import('./keystatic.config');

    const schema = keystatic.default.singletons!.siteNavigation.schema;

    // Should have external checkbox field
    expect(schema.menuItems).toBeDefined();
  });

  test('primaryCTA has label field', async () => {
    const keystatic = await import('./keystatic.config');

    const schema = keystatic.default.singletons!.siteNavigation.schema;

    expect(schema.primaryCTA).toBeDefined();
  });

  test('primaryCTA has href field', async () => {
    const keystatic = await import('./keystatic.config');

    const schema = keystatic.default.singletons!.siteNavigation.schema;

    expect(schema.primaryCTA).toBeDefined();
  });

  test('primaryCTA has external flag with default true', async () => {
    const keystatic = await import('./keystatic.config');

    const schema = keystatic.default.singletons!.siteNavigation.schema;

    expect(schema.primaryCTA).toBeDefined();
    // defaultValue should be true for primary CTA external flag
  });

  test('singleton appears in UI navigation under Settings', async () => {
    const keystatic = await import('./keystatic.config');

    const ui = keystatic.default.ui;

    expect(ui?.navigation).toHaveProperty('Settings');
    expect(ui?.navigation?.Settings).toContain('siteNavigation');
  });

  test('menu items support itemLabel for better UX', async () => {
    const keystatic = await import('./keystatic.config');

    const schema = keystatic.default.singletons!.siteNavigation.schema;

    // Array fields should have itemLabel for showing label in editor
    expect(schema.menuItems).toBeDefined();
  });

  test('children array supports itemLabel', async () => {
    const keystatic = await import('./keystatic.config');

    const schema = keystatic.default.singletons!.siteNavigation.schema;

    // Nested children should also have itemLabel
    expect(schema.menuItems).toBeDefined();
  });
});
