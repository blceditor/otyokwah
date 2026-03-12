import { reader } from "./keystatic-reader";

export interface TestimonialData {
  quote: string;
  name: string;
  role: string;
}

function formatSlugAsName(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export async function getPublishedTestimonials(): Promise<TestimonialData[]> {
  try {
    const slugs = await reader().collections.testimonials.list();
    const testimonials: TestimonialData[] = [];

    for (const slug of slugs) {
      const entry = await reader().collections.testimonials.read(slug);
      if (entry?.published) {
        testimonials.push({
          quote: entry.quote,
          name: formatSlugAsName(entry.name),
          role: entry.role,
        });
      }
    }

    return testimonials;
  } catch {
    return [];
  }
}
