import { SITE } from '@/lib/config/site';
import type { SiteConfig } from '@/lib/config/site-config';

interface OrganizationSchema {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  url: string;
  logo: string;
  address: {
    '@type': string;
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  sameAs: string[];
  contactPoint: {
    '@type': string;
    telephone: string;
    contactType: string;
  };
}

interface OrganizationJsonLdProps {
  config: SiteConfig;
}

export function generateOrganizationSchema(
  config: SiteConfig,
): OrganizationSchema {
  const sameAs = [
    config.facebookUrl,
    config.instagramUrl,
  ].filter(Boolean) as string[];

  const addressParts = config.contactAddress.split(',').map((s) => s.trim());
  const street = addressParts[0] ?? '';
  const city = addressParts[1] ?? '';
  const stateZip = (addressParts[2] ?? '').split(' ').filter(Boolean);
  const state = stateZip[0] ?? '';
  const zip = stateZip[1] ?? '';

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: config.siteName,
    description: 'Christian summer camp for Jr. High and High School students in Northern Indiana. Faith. Adventure. Transformation.',
    url: SITE.productionUrl,
    logo: `${SITE.productionUrl}/logo.png`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: street,
      addressLocality: city,
      addressRegion: state,
      postalCode: zip,
      addressCountry: 'US',
    },
    sameAs,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: config.contactPhoneHref.replace('tel:', ''),
      contactType: 'customer service',
    },
  };
}

// JSON-LD content is safe: generated from server-side Keystatic CMS data,
// serialized via JSON.stringify (auto-escapes HTML entities).
export function OrganizationJsonLd({ config }: OrganizationJsonLdProps) {
  const schema = generateOrganizationSchema(config);

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger -- JSON.stringify output is safe
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
