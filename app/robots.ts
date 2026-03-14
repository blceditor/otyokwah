import type { MetadataRoute } from 'next';

const SITE_URL = process.env.PRODUCTION_URL || 'https://otyokwah.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/', '/keystatic/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
