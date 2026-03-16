import { reader } from '@/lib/keystatic-reader';
import { FOOTER_CONFIG } from './footer';

export interface SiteConfig {
  siteName: string;
  logoPath: string;
  logoAlt: string;
  contactEmail: string;
  contactPhone: string;
  contactPhoneHref: string;
  contactAddress: string;
  registrationUrl: string;
  donationUrl: string;
  facebookUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  spotifyUrl: string;
  mapsUrl: string;
}

/**
 * Read site config from Keystatic singleton, falling back to FOOTER_CONFIG
 * defaults if the singleton is unavailable or fields are empty.
 *
 * MUST be called from server components only (uses Keystatic reader).
 */
export async function getSiteConfig(): Promise<SiteConfig> {
  try {
    const cms = await reader().singletons.siteConfig.read();

    if (!cms) {
      return buildFromDefaults();
    }

    return {
      siteName: cms.siteName || FOOTER_CONFIG.siteName,
      logoPath: cms.logoPath || '/images/logo/otyokwah-black-logo-forthekingdom.png',
      logoAlt: cms.logoAlt || FOOTER_CONFIG.siteName,
      contactEmail: cms.contactEmail || FOOTER_CONFIG.contactEmail,
      contactPhone: cms.contactPhone || FOOTER_CONFIG.contactPhone,
      contactPhoneHref: FOOTER_CONFIG.contactPhoneHref,
      contactAddress: cms.contactAddress || FOOTER_CONFIG.contactAddress,
      registrationUrl: cms.registrationUrl || FOOTER_CONFIG.registrationUrl,
      donationUrl: cms.donationUrl || FOOTER_CONFIG.donationUrl,
      facebookUrl: cms.facebookUrl || FOOTER_CONFIG.facebookUrl,
      instagramUrl: cms.instagramUrl || FOOTER_CONFIG.instagramUrl,
      youtubeUrl: cms.youtubeUrl || FOOTER_CONFIG.youtubeUrl,
      spotifyUrl: cms.spotifyUrl || FOOTER_CONFIG.spotifyUrl,
      mapsUrl: cms.mapsUrl || FOOTER_CONFIG.mapsUrl,
    };
  } catch (error) {
    console.error('[SiteConfig] Failed to read Keystatic singleton, using defaults:', error);
    return buildFromDefaults();
  }
}

function buildFromDefaults(): SiteConfig {
  return {
    siteName: FOOTER_CONFIG.siteName,
    logoPath: '/images/logo/otyokwah-black-logo-forthekingdom.png',
    logoAlt: FOOTER_CONFIG.siteName,
    contactEmail: FOOTER_CONFIG.contactEmail,
    contactPhone: FOOTER_CONFIG.contactPhone,
    contactPhoneHref: FOOTER_CONFIG.contactPhoneHref,
    contactAddress: FOOTER_CONFIG.contactAddress,
    registrationUrl: FOOTER_CONFIG.registrationUrl,
    donationUrl: FOOTER_CONFIG.donationUrl,
    facebookUrl: FOOTER_CONFIG.facebookUrl,
    instagramUrl: FOOTER_CONFIG.instagramUrl,
    youtubeUrl: FOOTER_CONFIG.youtubeUrl,
    spotifyUrl: FOOTER_CONFIG.spotifyUrl,
    mapsUrl: FOOTER_CONFIG.mapsUrl,
  };
}
