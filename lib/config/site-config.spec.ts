/**
 * REQ-CFG-001: SiteConfig data pipeline
 *
 * Acceptance:
 * - getSiteConfig() reads from CMS singleton and returns SiteConfig
 * - getSiteConfig() falls back to FOOTER_CONFIG defaults when reader() throws
 * - getSiteConfig() falls back to FOOTER_CONFIG defaults when CMS returns null
 * - FOOTER_CONFIG is not imported directly by any component file
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FOOTER_CONFIG } from './footer';

const mockRead = vi.fn();

vi.mock('@/lib/keystatic-reader', () => ({
  reader: () => ({
    singletons: {
      siteConfig: {
        read: mockRead,
      },
    },
  }),
}));

describe('REQ-CFG-001: getSiteConfig() data pipeline', () => {
  beforeEach(() => {
    mockRead.mockReset();
  });

  it('returns CMS values when singleton read succeeds', async () => {
    const cmsData = {
      siteName: 'CMS Camp Name',
      logoPath: '/images/logo/cms-logo.png',
      logoAlt: 'CMS Logo Alt',
      contactEmail: 'cms@example.org',
      contactPhone: '(999) 888-7777',
      contactAddress: '999 CMS Blvd, CMSville, CM 99999',
      registrationUrl: 'https://register.cms.example',
      donationUrl: 'https://donate.cms.example',
      facebookUrl: 'https://facebook.com/cmsCamp',
      instagramUrl: 'https://instagram.com/cmsCamp',
      youtubeUrl: 'https://youtube.com/cmsCamp',
      spotifyUrl: 'https://spotify.com/cmsCamp',
      mapsUrl: 'https://maps.google.com/cmsCamp',
    };
    mockRead.mockResolvedValue(cmsData);

    const { getSiteConfig } = await import('./site-config');
    const config = await getSiteConfig();

    expect(config.siteName).toBe('CMS Camp Name');
    expect(config.contactEmail).toBe('cms@example.org');
    expect(config.contactPhone).toBe('(999) 888-7777');
    expect(config.contactAddress).toBe('999 CMS Blvd, CMSville, CM 99999');
    expect(config.registrationUrl).toBe('https://register.cms.example');
    expect(config.donationUrl).toBe('https://donate.cms.example');
    expect(config.facebookUrl).toBe('https://facebook.com/cmsCamp');
    expect(config.instagramUrl).toBe('https://instagram.com/cmsCamp');
    expect(config.youtubeUrl).toBe('https://youtube.com/cmsCamp');
    expect(config.spotifyUrl).toBe('https://spotify.com/cmsCamp');
    expect(config.mapsUrl).toBe('https://maps.google.com/cmsCamp');
  });

  it('falls back to FOOTER_CONFIG defaults when reader() throws', async () => {
    mockRead.mockRejectedValue(new Error('CMS unavailable'));

    const { getSiteConfig } = await import('./site-config');
    const config = await getSiteConfig();

    expect(config.siteName).toBe(FOOTER_CONFIG.siteName);
    expect(config.contactEmail).toBe(FOOTER_CONFIG.contactEmail);
    expect(config.contactPhone).toBe(FOOTER_CONFIG.contactPhone);
    expect(config.contactPhoneHref).toBe(FOOTER_CONFIG.contactPhoneHref);
    expect(config.contactAddress).toBe(FOOTER_CONFIG.contactAddress);
    expect(config.registrationUrl).toBe(FOOTER_CONFIG.registrationUrl);
    expect(config.donationUrl).toBe(FOOTER_CONFIG.donationUrl);
    expect(config.facebookUrl).toBe(FOOTER_CONFIG.facebookUrl);
    expect(config.instagramUrl).toBe(FOOTER_CONFIG.instagramUrl);
    expect(config.youtubeUrl).toBe(FOOTER_CONFIG.youtubeUrl);
    expect(config.spotifyUrl).toBe(FOOTER_CONFIG.spotifyUrl);
    expect(config.mapsUrl).toBe(FOOTER_CONFIG.mapsUrl);
  });

  it('falls back to FOOTER_CONFIG defaults when CMS returns null', async () => {
    mockRead.mockResolvedValue(null);

    const { getSiteConfig } = await import('./site-config');
    const config = await getSiteConfig();

    expect(config.siteName).toBe(FOOTER_CONFIG.siteName);
    expect(config.contactEmail).toBe(FOOTER_CONFIG.contactEmail);
    expect(config.contactPhone).toBe(FOOTER_CONFIG.contactPhone);
    expect(config.contactPhoneHref).toBe(FOOTER_CONFIG.contactPhoneHref);
    expect(config.contactAddress).toBe(FOOTER_CONFIG.contactAddress);
    expect(config.registrationUrl).toBe(FOOTER_CONFIG.registrationUrl);
    expect(config.donationUrl).toBe(FOOTER_CONFIG.donationUrl);
    expect(config.facebookUrl).toBe(FOOTER_CONFIG.facebookUrl);
    expect(config.instagramUrl).toBe(FOOTER_CONFIG.instagramUrl);
    expect(config.youtubeUrl).toBe(FOOTER_CONFIG.youtubeUrl);
    expect(config.spotifyUrl).toBe(FOOTER_CONFIG.spotifyUrl);
    expect(config.mapsUrl).toBe(FOOTER_CONFIG.mapsUrl);
  });

  it('uses FOOTER_CONFIG defaults for empty CMS string fields', async () => {
    const emptyCmsData = {
      siteName: '',
      logoPath: '',
      logoAlt: '',
      contactEmail: '',
      contactPhone: '',
      contactAddress: '',
      registrationUrl: '',
      donationUrl: '',
      facebookUrl: '',
      instagramUrl: '',
      youtubeUrl: '',
      spotifyUrl: '',
      mapsUrl: '',
    };
    mockRead.mockResolvedValue(emptyCmsData);

    const { getSiteConfig } = await import('./site-config');
    const config = await getSiteConfig();

    expect(config.siteName).toBe(FOOTER_CONFIG.siteName);
    expect(config.contactEmail).toBe(FOOTER_CONFIG.contactEmail);
    expect(config.contactPhone).toBe(FOOTER_CONFIG.contactPhone);
    expect(config.donationUrl).toBe(FOOTER_CONFIG.donationUrl);
  });

  it('contactPhoneHref always comes from FOOTER_CONFIG (not CMS)', async () => {
    const cmsData = {
      siteName: 'Test',
      logoPath: '',
      logoAlt: '',
      contactEmail: '',
      contactPhone: '',
      contactAddress: '',
      registrationUrl: '',
      donationUrl: '',
      facebookUrl: '',
      instagramUrl: '',
      youtubeUrl: '',
      spotifyUrl: '',
      mapsUrl: '',
    };
    mockRead.mockResolvedValue(cmsData);

    const { getSiteConfig } = await import('./site-config');
    const config = await getSiteConfig();

    expect(config.contactPhoneHref).toBe(FOOTER_CONFIG.contactPhoneHref);
  });
});

describe('REQ-CFG-001: FOOTER_CONFIG encapsulation', () => {
  it('no component file imports FOOTER_CONFIG directly (except navigation/config.ts)', async () => {
    const { execFileSync } = await import('child_process');
    const projectRoot = process.cwd();

    let grepOutput = '';
    try {
      grepOutput = execFileSync(
        'grep',
        ['-r', 'FOOTER_CONFIG', 'components/', '--include=*.tsx', '--include=*.ts', '-l'],
        { cwd: projectRoot, encoding: 'utf-8' },
      );
    } catch {
      grepOutput = '';
    }

    const files = grepOutput
      .trim()
      .split('\n')
      .filter(Boolean)
      .filter((f) => !f.includes('navigation/config.ts'));

    expect(files).toEqual([]);
  });

  it('FOOTER_CONFIG in lib/ is only referenced in allowed files', async () => {
    const { execFileSync } = await import('child_process');
    const projectRoot = process.cwd();

    let grepOutput = '';
    try {
      grepOutput = execFileSync(
        'grep',
        ['-r', 'FOOTER_CONFIG', 'lib/', '--include=*.tsx', '--include=*.ts', '-l'],
        { cwd: projectRoot, encoding: 'utf-8' },
      );
    } catch {
      grepOutput = '';
    }

    const allowedFiles = [
      'lib/config/footer.ts',
      'lib/config/footer.spec.ts',
      'lib/config/site-config.ts',
      'lib/config/site-config.spec.ts',
    ];

    const files = grepOutput.trim().split('\n').filter(Boolean);
    const disallowed = files.filter(
      (f) => !allowedFiles.some((allowed) => f.endsWith(allowed)),
    );

    expect(disallowed).toEqual([]);
  });
});
