/**
 * Footer Configuration
 *
 * Central source of truth for social links, contact info, and donation URL
 * used by the Footer component. These values mirror the Keystatic siteConfig
 * singleton defaults. Environment variables can override them.
 *
 * For server components, prefer reading directly from the Keystatic siteConfig
 * singleton via the reader. This file provides build-time constants for the
 * client-side Footer component.
 */

import { EMAIL } from "./email";
import { SITE } from "./site";

export const FOOTER_CONFIG = {
  /** Camp display name shown in copyright line */
  siteName: process.env.NEXT_PUBLIC_SITE_NAME ?? "Bear Lake Camp",

  /** Facebook page URL */
  facebookUrl:
    process.env.NEXT_PUBLIC_FACEBOOK_URL ??
    "https://www.facebook.com/search/top?q=bear%20lake%20camp",

  /** Instagram profile URL */
  instagramUrl:
    process.env.NEXT_PUBLIC_INSTAGRAM_URL ??
    "https://www.instagram.com/bearlakecamp/",

  /** YouTube channel URL */
  youtubeUrl:
    process.env.NEXT_PUBLIC_YOUTUBE_URL ??
    "https://www.youtube.com/channel/UCiw_MKtM5hN83IghEjydmGw?view_as=subscriber",

  /** Spotify playlist URL */
  spotifyUrl:
    process.env.NEXT_PUBLIC_SPOTIFY_URL ??
    "https://open.spotify.com/playlist/1Dw4cfs5pj7p95uy2f3b0k?si=eZ6NDfybSsGG14DjJ-wXKA",

  /** UltraCamp donation page URL */
  donationUrl:
    process.env.NEXT_PUBLIC_DONATION_URL ??
    "https://www.ultracamp.com/donation.aspx?idCamp=268&campCode=blc",

  /** Physical address for display */
  contactAddress:
    process.env.NEXT_PUBLIC_CONTACT_ADDRESS ?? "1805 S 16th St, Albion, IN 46701",

  /** Contact email address */
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? EMAIL.contact,

  /** Contact phone number for display */
  contactPhone: process.env.NEXT_PUBLIC_CONTACT_PHONE ?? "(260) 799 5988",

  /** Contact phone number in tel: href format */
  contactPhoneHref: process.env.NEXT_PUBLIC_CONTACT_PHONE_HREF ?? "tel:+12607995988",

  /** Google Maps link to camp location */
  mapsUrl:
    process.env.NEXT_PUBLIC_MAPS_URL ??
    "https://maps.app.goo.gl/E6QLKhbminUxho1c8",

  /** UltraCamp registration page URL */
  registrationUrl:
    process.env.NEXT_PUBLIC_REGISTRATION_URL ??
    "https://www.ultracamp.com/clientlogin.aspx?idCamp=268",

  /** Production URL used in copyright/metadata */
  siteUrl: SITE.productionUrl,
} as const;
