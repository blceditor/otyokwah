# Camp Otyokwah — Remaining Setup Checklist

Last updated: 2026-03-14

---

## Summary

| # | Item | Status | Who |
|---|------|--------|-----|
| 1 | [UltraCamp API Key](#1-ultracamp-api-key) | Needs key from Travis | Travis provides key, Claude sets env var |
| 2 | [GitHub OAuth App](#2-github-oauth-app) | Needs verification | Travis verifies in GitHub |
| 3 | [GitHub Webhook (ISR)](#3-github-webhook-isr-revalidation) | Needs creation | Claude creates if Travis provides access |
| 4 | [GitHub Token](#4-github-token) | Needs Vercel env var | Travis provides, Claude sets |
| 5 | [SMTP / Contact Form Email](#5-smtp--contact-form-email) | Needs credentials | Travis provides SMTP creds |
| 6 | [Cloudflare Turnstile (CAPTCHA)](#6-cloudflare-turnstile-captcha) | Needs creation | Travis creates Turnstile site |
| 7 | [Google Analytics (GA4)](#7-google-analytics-ga4) | Needs GA4 property | Travis creates in Google Analytics |
| 8 | [Domain / DNS](#8-domain--dns) | Needs Vercel config | Travis configures in Vercel dashboard |
| 9 | [Download Images from otyokwah.org](#9-download-images-from-otyokwahorg) | Claude can do this | Claude downloads and commits |
| 10 | [Replace BLC Placeholder Images](#10-replace-blc-placeholder-images) | Claude can do this | Claude replaces after #9 |
| 11 | [Add Hero Images to New Pages](#11-add-hero-images-to-new-pages) | Claude can do this | Claude assigns after #9 |
| 12 | [Vercel Deployment Status Widget](#12-vercel-deployment-status-widget) | Nice-to-have | Travis provides Vercel token |
| 13 | [Sparkry AI (CMS SEO Generator)](#13-sparkry-ai-cms-seo-generator) | Nice-to-have | Travis provides API key |
| 14 | [Sitemap & Robots.txt](#14-sitemap--robotstxt) | Claude can do this | Claude creates files |
| 15 | [Clean Up .env.example](#15-clean-up-envexample) | Claude can do this | Claude fixes |
| 16 | [Testimonial Video](#16-testimonial-video) | Needs YouTube ID | Travis provides Otyokwah video ID |
| 17 | [Remove Dead BLC Files](#17-remove-dead-blc-files) | Claude can do this | Claude deletes |

---

## Detailed Instructions

### 1. UltraCamp API Key

**What:** Live session enrollment data (capacity bars, spots left, waitlist status). Without this, the site shows mock data.

**You provide:** The API key for camp ID 1342 (Otyokwah's UltraCamp account).

**Where to get it:** Log into UltraCamp admin → Settings → API Access, or contact UltraCamp support and request a REST API key for camp ID 1342.

**I'll set:** `ULTRACAMP_API_KEY` in Vercel environment variables for both Preview and Production.

---

### 2. GitHub OAuth App

**What:** Allows CMS login at otyokwah.org/keystatic via GitHub.

**You verify:** Go to [github.com/settings/developers](https://github.com/settings/developers) while logged in as `blceditor`. Confirm an OAuth App named `otyokwah-keystatic` exists with:
- **Homepage URL:** `https://prelaunch.otyokwah.org`
- **Authorization callback URL:** `https://prelaunch.otyokwah.org/api/keystatic/github/oauth/callback`

If it doesn't exist, create a new Classic OAuth App with those settings. Once production is live, add `https://otyokwah.org/api/keystatic/github/oauth/callback` as the callback URL.

**You provide:** Client ID and Client Secret from the OAuth App.

**I'll set:** `KEYSTATIC_GITHUB_CLIENT_ID` and `KEYSTATIC_GITHUB_CLIENT_SECRET` in Vercel.

---

### 3. GitHub Webhook (ISR Revalidation)

**What:** When content is edited in the CMS and pushed to GitHub, this webhook tells Vercel to regenerate the affected pages instantly (instead of waiting for a full rebuild).

**You provide:** Access to create a webhook on `blceditor/otyokwah` repo, OR I can do it via `gh` CLI.

**Setup:**
1. Go to `github.com/blceditor/otyokwah/settings/hooks`
2. Click "Add webhook"
3. **Payload URL:** `https://prelaunch.otyokwah.org/api/webhook/github`
4. **Content type:** `application/json`
5. **Secret:** Generate a strong random string (I'll provide one)
6. **Events:** Just the `push` event

**I'll set:** `REVALIDATE_SECRET` in Vercel (must match the webhook secret exactly — use `printf`, not `echo`).

---

### 4. GitHub Token

**What:** A GitHub Personal Access Token for the Keystatic reader to fetch content from the `blceditor/otyokwah` repo.

**You provide:** A `ghp_` token with `repo` scope, generated from the `blceditor` account.

**Where to get it:** [github.com/settings/tokens](https://github.com/settings/tokens) → Generate new token (classic) → scope: `repo` → set expiration as desired.

**I'll set:** `GITHUB_TOKEN` in Vercel. Also set `KEYSTATIC_DEFAULT_BRANCH=staging` for the Preview environment and `KEYSTATIC_DEFAULT_BRANCH=main` for Production.

---

### 5. SMTP / Contact Form Email

**What:** The contact form at /contact sends email notifications to `info@otyokwah.org`.

**You provide:** SMTP credentials for sending email. If using Gmail/Google Workspace:
- `SMTP_HOST=smtp.gmail.com`
- `SMTP_PORT=587`
- `SMTP_USER=` (the sending email address)
- `SMTP_PASS=` (a Gmail App Password — NOT the account password)

**Where to get Gmail App Password:** [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) → select "Mail" and "Other (custom name)" → generate.

**I'll set:** All SMTP env vars in Vercel plus `CONTACT_FORM_TO=info@otyokwah.org`.

---

### 6. Cloudflare Turnstile (CAPTCHA)

**What:** Prevents spam on the contact form. Without this, the form rejects ALL submissions.

**You create:** A Turnstile widget at [dash.cloudflare.com](https://dash.cloudflare.com) → Turnstile → Add Site.
- **Site name:** Camp Otyokwah
- **Domains:** `otyokwah.org`, `prelaunch.otyokwah.org`, `otyokwah.vercel.app`, `localhost`
- **Widget type:** Managed

**You provide:** Site Key and Secret Key.

**I'll set:** `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` in Vercel.

---

### 7. Google Analytics (GA4)

**What:** Tracks page views and CTA clicks. Without this, the site works fine but has no analytics.

**You create:** A GA4 property at [analytics.google.com](https://analytics.google.com):
1. Create a new property for "Camp Otyokwah"
2. Create a Web data stream for `otyokwah.org`
3. Copy the Measurement ID (starts with `G-`)

**You provide:** The `G-XXXXXXXX` Measurement ID.

**I'll set:** `NEXT_PUBLIC_GA_ID` in Vercel.

**Optional (for admin analytics dashboard):** Also provide `GA4_PROPERTY_ID` (numeric, found in Admin → Property Settings) and Google OAuth credentials for the Data API. This powers the `/admin/analytics` dashboard but is not required for basic tracking.

---

### 8. Domain / DNS

**What:** Point `otyokwah.org` and `prelaunch.otyokwah.org` to Vercel.

**You configure:**
1. In Vercel Dashboard → Otyokwah project → Settings → Domains
2. Add `otyokwah.org` and `www.otyokwah.org`
3. Vercel will show DNS records to add at your registrar
4. `prelaunch.otyokwah.org` should already be configured

**I'll set:** `PRODUCTION_URL=https://otyokwah.org` and `PRODUCTION_DOMAIN=otyokwah.org` in Vercel once DNS is verified.

---

### 9. Download Images from otyokwah.org

**What:** The current site uses BLC placeholder images. We need to download Otyokwah's actual photos from their current website.

**I can do this.** Images to download from `otyokwah.org/uploads/1/1/0/7/110788137/`:

**Rental facilities (~18 images):**
- Delaware Lodge: exterior, 2 interiors, floor plan
- Mingo Lodge: exterior, kitchen
- 3-Season Cabins: 2 exterior views
- Summer Cabins: exterior, interior
- Shower House: exterior, stalls, showers
- Hopewell Hall: alternate exterior, dining interior, meeting room
- Delaware Commons interior

**Outdoor/activity images (~5):**
- Vesper Hill, Quiet Hour Ledge, recreation areas

**Staff photos (3):** Monty & Janette Harlan, Connor & Rebekah Miller, Jennifer Sherbahn

**Homepage slideshow images (16):** `screenshot-63.png` through `screenshot-78.png`

**Camp map:** `campomap4_20_18.jpg`

**Tell me to proceed** and I'll download all of these into the appropriate `public/images/` directories and update the content pages to reference them.

---

### 10. Replace BLC Placeholder Images

**What:** These BLC images are still in the Otyokwah repo and should be deleted or replaced:

| File | Status |
|------|--------|
| `public/mission-background.jpg` | **ACTIVE** — used on homepage. Replace with Otyokwah lakeside/campus photo |
| `public/hero-about.jpg` | Dead — not referenced. Delete |
| `public/hero-home.jpg` | Dead — not referenced. Delete |
| `public/hero-summer-camp.jpg` | Dead — not referenced. Delete |
| `public/chapel-exterior.jpg` | Dead — not referenced. Delete |
| `public/images/logo/BLC-Logo-compass-whiteletters-no-background-small.png` | Dead — not referenced. Delete |

**I can do this** after downloading Otyokwah images (#9).

---

### 11. Add Hero Images to New Pages

**What:** Three new rental pages have empty hero images:
- `rentals-mingo.mdoc` — needs Mingo Lodge exterior photo
- `rentals-seasonal-cabins.mdoc` — needs 3-season cabin photo
- `rentals-maps.mdoc` — needs aerial/campus overview photo

**I can do this** after downloading images (#9).

---

### 12. Vercel Deployment Status Widget

**What:** Shows deployment status in the CMS editor header. Nice-to-have, not critical.

**You provide:**
- `VERCEL_TOKEN` — Vercel Personal Access Token from [vercel.com/account/tokens](https://vercel.com/account/tokens)
- `VERCEL_PROJECT_ID` — Found in Vercel Dashboard → Otyokwah project → Settings → General

**I'll set:** Both env vars in Vercel.

---

### 13. Sparkry AI (CMS SEO Generator)

**What:** AI-powered SEO metadata generation and image alt-text suggestions in the CMS editor. Nice-to-have.

**You provide:** `UNIVERSAL_LLM_KEY` — the Sparkry.AI API key.

**I'll set:** In Vercel.

---

### 14. Sitemap & Robots.txt

**What:** Helps search engines discover and index all pages. Currently missing.

**I can do this.** I'll create:
- `app/sitemap.ts` — auto-generates sitemap from all content pages
- `app/robots.ts` — standard robots.txt allowing all crawlers

---

### 15. Clean Up .env.example

**What:** Template env file still has BLC references and unused variables.

**I can do this.** Changes:
- Lines 36/38: `bearlakecamp.org` → `otyokwah.org`
- Remove `BLC_KV_REST_API_URL`, `BLC_KV_REST_API_TOKEN` (unused)
- Remove `NEXTAUTH_SECRET` (unused)
- Add `ULTRACAMP_API_KEY` with comment

---

### 16. Testimonial Video

**What:** The homepage testimonial section has a video player. Currently uses a Rick Roll placeholder (`dQw4w9WgXcQ`).

**You provide:** A YouTube video ID for an Otyokwah testimonial or promotional video.

**I'll set:** `NEXT_PUBLIC_TESTIMONIAL_VIDEO_ID` in Vercel, or update the CMS singleton.

---

### 17. Remove Dead BLC Files

**What:** Leftover BLC files that aren't referenced anywhere.

**I can do this.** Files to delete:
- `public/hero-about.jpg`
- `public/hero-home.jpg`
- `public/hero-summer-camp.jpg`
- `public/chapel-exterior.jpg`
- `public/images/logo/BLC-Logo-compass-whiteletters-no-background-small.png`
- `content/about.mdx` (legacy, superseded by `content/pages/about.mdoc`)
- `content/summer-camp.mdx` (legacy, superseded by `content/pages/summer-camp.mdoc`)

---

## Quick Reference: What I Need From You

| Data | Where to Get It |
|------|-----------------|
| UltraCamp API key | UltraCamp admin panel or support (camp ID 1342) |
| GitHub OAuth App Client ID + Secret | github.com/settings/developers (blceditor account) |
| GitHub Personal Access Token | github.com/settings/tokens (blceditor, repo scope) |
| SMTP credentials | Google Workspace admin or Gmail App Password |
| Cloudflare Turnstile keys | dash.cloudflare.com → Turnstile |
| GA4 Measurement ID | analytics.google.com → new property |
| Otyokwah YouTube video ID | YouTube — pick a camp promo/testimonial video |
| DNS verification | Your domain registrar for otyokwah.org |

## What I Can Do Right Now (no data needed)

- Download all images from otyokwah.org (#9)
- Replace BLC placeholders (#10)
- Add hero images to new pages (#11)
- Create sitemap.ts and robots.ts (#14)
- Clean up .env.example (#15)
- Delete dead BLC files (#17)

**Say the word and I'll execute items 9-11, 14-15, and 17.**
