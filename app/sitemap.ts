import { reader } from '@/lib/keystatic-reader';
import type { MetadataRoute } from 'next';

const SITE_URL = process.env.PRODUCTION_URL || 'https://otyokwah.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = await reader().collections.pages.list();

  const pageEntries = pages.map((slug) => ({
    url: slug === 'index' ? SITE_URL : `${SITE_URL}/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: slug === 'index' ? 1 : 0.8,
  }));

  return pageEntries;
}
