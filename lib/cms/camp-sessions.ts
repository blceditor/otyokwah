/**
 * REQ-TPL-002: Camp Sessions Data
 *
 * Provides camp sessions types and default settings.
 * Camp session data is managed through page content using Markdoc components.
 */

export interface CampSession {
  slug: string;
  title: string;
  subtitle: string;
  dates: string;
  gradeRange: string;
  description: string;
  earlyBirdPrice: string;
  regularPrice: string;
  sessionType: 'primary' | 'junior' | 'jr-high' | 'sr-high';
  sectionImage: string;
  displayOrder: number;
}

export interface CampSettings {
  heroTitle: string;
  heroSubtitle: string;
  heroVideo: string;
  heroPoster: string;
  registrationUrl: string;
  scholarshipFormUrl: string;
  earlyBirdDeadline: string;
  earlyBirdNote: string;
  contactEmail: string;
  contactPhone: string;
  scholarshipInfo: string;
}

export interface SessionsByType {
  primary: CampSession[];
  junior: CampSession[];
  'jr-high': CampSession[];
  'sr-high': CampSession[];
}

// Default camp settings for fallback
const defaultCampSettings: CampSettings = {
  heroTitle: 'Summer Camp Sessions 2026',
  heroSubtitle: 'Find your week at Bear Lake Camp',
  heroVideo: '/videos/hero-camp-sessions.mp4',
  heroPoster: '/images/summer-program-and-general/jr-high-kids-with-banner.jpg',
  registrationUrl: 'https://www.ultracamp.com/clientlogin.aspx?idCamp=1342&campcode=OTY',
  scholarshipFormUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSeS0Bck8_J7hPzgF46f6W_Y3SBADHPnH6rCTP-U1Cht2QHw0w/viewform',
  earlyBirdDeadline: 'April 14, 2026',
  earlyBirdNote: 'Primary Overnight: $100 | All Other Sessions: $390 through 4/14, $440 after 4/14',
  contactEmail: 'info@otyokwah.org',
  contactPhone: '419-883-3854',
  scholarshipInfo: 'We want everyone who desires to attend camp to have the opportunity. Please contact your local church for financial assistance.',
};

/**
 * Get camp settings (hardcoded defaults — CMS singleton removed)
 */
export async function getCampSettings(): Promise<CampSettings> {
  return defaultCampSettings;
}

/**
 * Fetch all camp sessions from Keystatic CMS
 *
 * NOTE: The campSessions collection has been disabled (REQ-CMS-F).
 * This function returns an empty array. Camp session data is now
 * managed through page content using sessionCard components.
 */
export async function getCampSessions(): Promise<CampSession[]> {
  // Collection disabled - return empty array
  // Session data is now managed through page content
  return [];
}

/**
 * Get sessions organized by type
 */
export async function getSessionsByType(): Promise<SessionsByType> {
  const sessions = await getCampSessions();

  const grouped: SessionsByType = {
    primary: [],
    junior: [],
    'jr-high': [],
    'sr-high': [],
  };

  sessions.forEach((session) => {
    if (grouped[session.sessionType]) {
      grouped[session.sessionType].push(session);
    }
  });

  // Sort each group by displayOrder
  Object.keys(grouped).forEach((type) => {
    grouped[type as keyof SessionsByType].sort((a, b) => a.displayOrder - b.displayOrder);
  });

  return grouped;
}

export { defaultCampSettings };
