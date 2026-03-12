/**
 * Shared SEO data types for REQ-CMS-003 and REQ-CMS-012
 * REQ-CMS-019: Rate limit functionality removed
 */

export interface SEOData {
  metaTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
}

export interface PageContent {
  title: string;
  slug: string;
  heroTagline: string;
  templateType: string;
  templateFields: {
    ageRange?: string;
    dates?: string;
    pricing?: string;
    capacity?: string;
    amenities?: string;
  };
  body: string;
}

export const SEO_LIMITS = {
  META_TITLE_MAX: 60,
  META_DESCRIPTION_MIN: 120,
  META_DESCRIPTION_MAX: 155,
} as const;
