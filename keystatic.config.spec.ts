// REQ-102: SEO Schema Fields in Keystatic
import { describe, test, expect } from 'vitest';

describe('REQ-102 — SEO Schema Fields in Keystatic Config', () => {
  test('pages collection includes seo object field', async () => {
    // @ts-ignore - Config will be updated
    const config = await import('./keystatic.config');

    const pagesSchema = config.default.collections?.pages?.schema;
    expect(pagesSchema).toHaveProperty('seo');
  });

  test('seo field includes metaTitle', async () => {
    // @ts-ignore - Config will be updated
    const config = await import('./keystatic.config');

    const seoField = config.default.collections?.pages?.schema?.seo;
    expect(seoField.fields).toHaveProperty('metaTitle');

    const metaTitleField = seoField.fields.metaTitle;
    expect(metaTitleField.label).toBe('Meta Title');
  });

  test('seo field includes metaDescription', async () => {
    // @ts-ignore - Config will be updated
    const config = await import('./keystatic.config');

    const seoField = config.default.collections?.pages?.schema?.seo;
    expect(seoField.fields).toHaveProperty('metaDescription');

    const metaDescField = seoField.fields.metaDescription;
    expect(metaDescField.label).toBe('Meta Description');
  });

  test('seo field includes optional ogTitle', async () => {
    // @ts-ignore - Config will be updated
    const config = await import('./keystatic.config');

    const seoField = config.default.collections?.pages?.schema?.seo;
    expect(seoField.fields).toHaveProperty('ogTitle');

    // Should be optional (defaults to metaTitle)
    const ogTitleField = seoField.fields.ogTitle;
    expect(ogTitleField).toBeDefined();
  });

  test('seo field includes optional ogDescription', async () => {
    // @ts-ignore - Config will be updated
    const config = await import('./keystatic.config');

    const seoField = config.default.collections?.pages?.schema?.seo;
    expect(seoField.fields).toHaveProperty('ogDescription');

    const ogDescField = seoField.fields.ogDescription;
    expect(ogDescField.label).toBe('Open Graph Description');
  });

  test('seo field includes ogImage as text field', async () => {
    // @ts-ignore - Config will be updated
    const config = await import('./keystatic.config');

    const seoField = config.default.collections?.pages?.schema?.seo;
    expect(seoField.fields).toHaveProperty('ogImage');
  });

  test('seo field includes twitterCard select field', async () => {
    // @ts-ignore - Config will be updated
    const config = await import('./keystatic.config');

    const seoField = config.default.collections?.pages?.schema?.seo;
    expect(seoField.fields).toHaveProperty('twitterCard');

    const twitterCardField = seoField.fields.twitterCard;
    expect(twitterCardField.options).toContainEqual(
      expect.objectContaining({ value: 'summary' })
    );
    expect(twitterCardField.options).toContainEqual(
      expect.objectContaining({ value: 'summary_large_image' })
    );
    expect(twitterCardField.defaultValue()).toBe('summary_large_image');
  });

  test('seo field includes noIndex checkbox', async () => {
    // @ts-ignore - Config will be updated
    const config = await import('./keystatic.config');

    const seoField = config.default.collections?.pages?.schema?.seo;
    expect(seoField.fields).toHaveProperty('noIndex');

    const noIndexField = seoField.fields.noIndex;
    expect(noIndexField.defaultValue()).toBe(false);
  });

  test('SEO fields have helpful labels', async () => {
    // @ts-ignore - Config will be updated
    const config = await import('./keystatic.config');

    const seoField = config.default.collections?.pages?.schema?.seo;
    const metaTitleField = seoField.fields.metaTitle;

    expect(metaTitleField.label).toBe('Meta Title');
  });

  test('image field has proper label', async () => {
    // @ts-ignore - Config will be updated
    const config = await import('./keystatic.config');

    const seoField = config.default.collections?.pages?.schema?.seo;
    const ogImageField = seoField.fields.ogImage;

    expect(ogImageField.label).toBe('Social Share Image Path');
  });

  test('SEO fields exist with proper configuration', async () => {
    // @ts-ignore - Config will be updated
    const config = await import('./keystatic.config');

    const seoField = config.default.collections?.pages?.schema?.seo;

    // Fields should exist
    expect(seoField.fields.metaTitle).toBeDefined();
    expect(seoField.fields.metaDescription).toBeDefined();
  });
});

describe('REQ-003 — SEO Metadata Accordion', () => {
  test('SEO fields grouped in collapsible object', async () => {
    // @ts-ignore - Testing schema structure
    const config = await import('./keystatic.config');

    const pagesSchema = config.default.collections?.pages?.schema;
    const seoField = pagesSchema?.seo;

    // Verify seo is a fields.object (which enables accordion behavior in Keystatic UI)
    expect(seoField).toBeDefined();
    expect(seoField.kind).toBe('object');
    expect(seoField.fields).toBeDefined();

    // Verify nested fields exist within the object
    expect(seoField.fields).toHaveProperty('metaTitle');
    expect(seoField.fields).toHaveProperty('metaDescription');
    expect(seoField.fields).toHaveProperty('ogTitle');
    expect(seoField.fields).toHaveProperty('ogDescription');
    expect(seoField.fields).toHaveProperty('ogImage');
  });

});


describe('REQ-CM001 — Testimonials Collection (existing)', () => {
  test('testimonials collection exists', async () => {
    const config = await import('./keystatic.config');
    expect(config.default.collections).toHaveProperty('testimonials');
  });

  test('testimonials has required fields', async () => {
    const config = await import('./keystatic.config');
    const schema = config.default.collections?.testimonials?.schema;
    expect(schema).toHaveProperty('quote');
    expect(schema).toHaveProperty('name');
    expect(schema).toHaveProperty('role');
    expect(schema).toHaveProperty('tags');
    expect(schema).toHaveProperty('published');
  });
});
