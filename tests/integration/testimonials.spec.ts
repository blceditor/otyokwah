// REQ-F003: Testimonials Integration Test
import { describe, test, expect } from 'vitest';
import { createReader } from '@keystatic/core/reader';
import keystaticConfig from '../../keystatic.config';
import '@testing-library/jest-dom/vitest';

describe('REQ-F003 — Testimonials Keystatic Integration', () => {
  const reader = createReader(process.cwd(), keystaticConfig);

  test('testimonials collection is accessible via reader API', async () => {
    // Should have testimonials collection
    expect(reader.collections.testimonials).toBeDefined();
  });

  test('can read all testimonials', async () => {
    const testimonials = await reader.collections.testimonials.all();

    // Should return array
    expect(Array.isArray(testimonials)).toBe(true);

    // Should have at least the sample testimonials
    expect(testimonials.length).toBeGreaterThanOrEqual(3);
  });

  test('can read individual testimonial by slug', async () => {
    const testimonial = await reader.collections.testimonials.read('sample-parent');

    // Should return testimonial data
    expect(testimonial).toBeDefined();
    expect(testimonial?.quote).toBeDefined();
    expect(testimonial?.name).toBe('sarah-johnson');
    expect(testimonial?.role).toBe('Parent of Camper');
    expect(testimonial?.tags).toContain('parent');
    expect(testimonial?.tags).toContain('summer-camp');
    expect(testimonial?.published).toBe(true);
  });

  test('testimonial schema has required fields', async () => {
    const testimonials = await reader.collections.testimonials.all();

    for (const testimonial of testimonials) {
      const data = testimonial.entry;

      // Required fields
      expect(data.quote).toBeDefined();
      expect(typeof data.quote).toBe('string');
      expect(data.quote.length).toBeGreaterThan(0);

      expect(data.name).toBeDefined();
      expect(typeof data.name).toBe('string');

      // Optional fields
      if (data.role) {
        expect(typeof data.role).toBe('string');
      }

      if (data.tags) {
        expect(Array.isArray(data.tags)).toBe(true);
      }

      expect(typeof data.published).toBe('boolean');
    }
  });

  test('can filter testimonials by tag', async () => {
    const allTestimonials = await reader.collections.testimonials.all();

    // Filter by 'summer-camp' tag
    const summerCampTestimonials = allTestimonials.filter((t) =>
      t.entry.tags?.includes('summer-camp')
    );

    expect(summerCampTestimonials.length).toBeGreaterThan(0);

    // Filter by 'giving' tag
    const givingTestimonials = allTestimonials.filter((t) =>
      t.entry.tags?.includes('giving')
    );

    expect(givingTestimonials.length).toBeGreaterThan(0);

    // Filter by 'staff' tag
    const staffTestimonials = allTestimonials.filter((t) =>
      t.entry.tags?.includes('staff')
    );

    expect(staffTestimonials.length).toBeGreaterThan(0);
  });

  test('can filter published testimonials', async () => {
    const allTestimonials = await reader.collections.testimonials.all();

    // Sample testimonials are published (used by testimonialWidget)
    const sampleTestimonials = allTestimonials.filter((t) =>
      t.slug.startsWith('sample-')
    );
    const publishedSamples = sampleTestimonials.filter((t) => t.entry.published === true);
    expect(publishedSamples.length).toBeGreaterThanOrEqual(3);
  });

  test('testimonial quotes have reasonable length', async () => {
    const testimonials = await reader.collections.testimonials.all();

    for (const testimonial of testimonials) {
      const quote = testimonial.entry.quote;

      // Quote should not be too short
      expect(quote.length).toBeGreaterThan(10);

      // Quote should not be excessively long (max ~500 chars for rotation)
      expect(quote.length).toBeLessThan(1000);
    }
  });

  test('sample testimonials have correct tags', async () => {
    const parentTestimonial = await reader.collections.testimonials.read('sample-parent');
    expect(parentTestimonial?.tags).toContain('parent');
    expect(parentTestimonial?.tags).toContain('summer-camp');

    const staffTestimonial = await reader.collections.testimonials.read('sample-staff');
    expect(staffTestimonial?.tags).toContain('staff');

    const donorTestimonial = await reader.collections.testimonials.read('sample-donor');
    expect(donorTestimonial?.tags).toContain('giving');

    const camperTestimonial = await reader.collections.testimonials.read('sample-camper');
    expect(camperTestimonial?.tags).toContain('camper');
    expect(camperTestimonial?.tags).toContain('summer-camp');
  });
});
