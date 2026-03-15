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
  siteName: process.env.NEXT_PUBLIC_SITE_NAME ?? "Camp Otyokwah",

  /** Facebook page URL */
  facebookUrl:
    process.env.NEXT_PUBLIC_FACEBOOK_URL ??
    "https://www.facebook.com/campoty",

  /** Instagram profile URL */
  instagramUrl:
    process.env.NEXT_PUBLIC_INSTAGRAM_URL ??
    "https://www.instagram.com/campotyokwah/",

  /** YouTube channel URL */
  youtubeUrl:
    process.env.NEXT_PUBLIC_YOUTUBE_URL ??
    "https://www.youtube.com/user/CampOtyokwah",

  /** Spotify playlist URL */
  spotifyUrl: process.env.NEXT_PUBLIC_SPOTIFY_URL ?? "",

  /** UltraCamp donation page URL */
  donationUrl:
    process.env.NEXT_PUBLIC_DONATION_URL ??
    "https://www.ultracamp.com/donations/donationintention.aspx?idCamp=1342&campCode=OTY",

  /** Physical address for display */
  contactAddress:
    process.env.NEXT_PUBLIC_CONTACT_ADDRESS ?? "3380 Tugend Rd, Butler, OH 44822",

  /** Contact email address */
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? EMAIL.contact,

  /** Contact phone number for display */
  contactPhone: process.env.NEXT_PUBLIC_CONTACT_PHONE ?? "(419) 883-3854",

  /** Contact phone number in tel: href format */
  contactPhoneHref: process.env.NEXT_PUBLIC_CONTACT_PHONE_HREF ?? "tel:+14198833854",

  /** Google Maps link to camp location */
  mapsUrl:
    process.env.NEXT_PUBLIC_MAPS_URL ??
    "https://www.google.com/maps/search/?api=1&query=Camp+Otyokwah+3380+Tugend+Rd+Butler+OH+44822",

  /** UltraCamp registration page URL */
  registrationUrl:
    process.env.NEXT_PUBLIC_REGISTRATION_URL ??
    "https://www.ultracamp.com/clientlogin.aspx?idCamp=1342&campCode=OTY",

  /** Production URL used in copyright/metadata */
  siteUrl: SITE.productionUrl,
} as const;
