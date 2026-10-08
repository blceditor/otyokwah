# Requirements — Delivered & Verified

**Version**: 3.0
**Date**: 2026-03-06
**Status**: All items PASS — verified by Project 017 audit
**Audit Results**: `requirements/verification-audit-results.md`
**Deferred Features**: `requirements/backlog.md` (32.3 SP)

---

## Summary

| REQ-ID | Title | Status | SP |
|--------|-------|--------|----|
| REQ-CMS-003 | Deployment Status Widget Fix | PASS | 5.0 |
| REQ-CMS-005 | Remove Blank Component Above SEO | PASS | 1.0 |
| REQ-TPL-002 | CampSessionsPage Hardcoded Content | PASS (superseded) | 8.0 |
| REQ-CARD-001 | Center ContentCard Icon and Heading | PASS | 0.5 |
| REQ-BUILD-001 | On-Demand ISR for Content Updates | PASS | 5.0 |
| REQ-BUILD-002 | Parallel Build Workers | PASS | 3.0 |
| REQ-BUILD-003 | Optimize Package Imports (Tree Shaking) | PASS | 2.0 |
| REQ-BUILD-004 | Target Build Time Reduction | PASS | 3.0 |
| REQ-BUILD-005 | Incremental Content Updates | PASS | 3.0 |
| REQ-BUILD-006 | Dependency Optimization | PASS | 1.0 |
| REQ-BUILD-009 | Switch to pnpm Package Manager | PASS | 2.0 |
| REQ-BUILD-010 | Wire ISR to Keystatic Saves | PASS | 3.0 |
| REQ-BUILD-011 | Dynamic Import html2canvas | PASS | 0.5 |
| REQ-BUILD-012 | Move fast-xml-parser to devDependencies | PASS | 0.5 |
| REQ-BUILD-013 | Confirm dompurify Usage (Corrected) | PASS | 0.5 |
| REQ-BUILD-014 | Create Lucide Icon Map | PASS | 1.0 |

### Quality Items (NOT IMPLEMENTED — bug fixes, not features)

| REQ-ID | Title | SP | Notes |
|--------|-------|----|-------|
| REQ-CMS-001 | Dark Mode CSS contrast gaps | 3.0 | CMS editor functional, cosmetic only |
| REQ-CMS-002 | Light Mode rendering issues | 2.0 | CMS editor functional, cosmetic only |
| REQ-TPL-003 | Hardcoded strings audit | 5.0 | Partial fix in Project 017 T-003; findings documented in audit results |

---

## Delivered Requirements Detail

### REQ-CMS-003: Deployment Status Widget Fix — PASS

- `components/keystatic/DeploymentStatus.tsx` — polling logic with `setIsPolling(false)` on error
- `app/api/vercel-deployment-status/route.ts` — Vercel deployments API proxy
- Lint fix in commit `e3ac6ab`

### REQ-CMS-005: Remove Blank Component Above SEO — PASS

- `components/keystatic/SEOFieldsetEnhancer.tsx:294-316` — `hideEmptyFieldsets()` hides fieldsets without meaningful content
- Active in production via `app/keystatic/layout.tsx:258`

### REQ-TPL-002: CampSessionsPage Hardcoded Content — PASS (superseded)

- `components/pages/CampSessionsPage.tsx` deleted as dead code in Project 017 T-003
- Camp sessions now render via Markdoc templates through `[slug]` dynamic route with CMS `.mdoc` content

### REQ-CARD-001: Center ContentCard Icon and Heading — PASS

- `components/content/ContentCard.tsx:109` — `flex flex-col items-center text-center mb-1`

### REQ-BUILD-001: On-Demand ISR — PASS

- `app/[slug]/page.tsx` + `app/page.tsx`: `revalidate = false`, `fetchCache = 'default-no-store'`
- Webhook revalidation at `app/api/webhook/github/route.ts` (21 tests)

### REQ-BUILD-002: Parallel Build Workers — PASS

- `next.config.mjs`: `webpackBuildWorker: true`, `parallelServerCompiles: true`, `parallelServerBuildTraces: true`

### REQ-BUILD-003: Package Imports Optimization — PASS

- `next.config.mjs`: `optimizePackageImports` array configured

### REQ-BUILD-004: Build Time Reduction — PASS

- ISR, parallel workers, optimized imports, pnpm
- Content-only build skip (`scripts/ignore-build.sh`) is disabled by REQ-OTY-17-001 until on-demand revalidation publishes CMS saves

### REQ-BUILD-005: Incremental Content Updates — PASS

- `/api/revalidate` endpoint with `timingSafeEqual` secret comparison (4 tests)
- GitHub webhook for on-demand revalidation (21 tests)

### REQ-BUILD-006: Dependency Optimization — PASS

- `fast-xml-parser` in devDependencies
- `dompurify` actively used by `SplitContent.tsx` → `lib/security/sanitize.ts`

### REQ-BUILD-009: pnpm Package Manager — PASS

- `package.json`: `"packageManager": "pnpm@10.26.2"`, `pnpm-lock.yaml` lockfile

### REQ-BUILD-010: Wire ISR to Keystatic Saves — PASS

- GitHub webhook fires `revalidatePath()` on content commits
- `SaveMonitor.tsx` for client-side save detection
- 21 webhook tests verify revalidation by prefix and per-page

### REQ-BUILD-011: Dynamic Import html2canvas — PASS

- `components/keystatic/BugReportModal.tsx:69`: `const html2canvas = (await import("html2canvas")).default`

### REQ-BUILD-012: fast-xml-parser in devDependencies — PASS

- `package.json:65`: `"fast-xml-parser": "^5.3.3"` in `devDependencies`

### REQ-BUILD-013: dompurify Usage Confirmed — PASS

- `lib/security/sanitize.ts:1` imports DOMPurify
- Used by `SplitContent.tsx` for client-side HTML sanitization

### REQ-BUILD-014: Lucide Icon Map — PASS

- `lib/icons.ts` with curated icon map and named imports
- Only barrel import in disabled `IconFieldEnhancer.tsx` — zero runtime impact

---

## Security Fixes (Project 017 T-004)

| Fix | Status | File | Tests |
|-----|--------|------|-------|
| GA4 analytics auth | PASS | `app/api/analytics/ga4/route.ts` | 2 |
| Vitals GET auth | PASS | `app/api/vitals/route.ts` | — |
| Revalidate timingSafeEqual | PASS | `app/api/revalidate/route.ts` | 4 |
| Contact form newline sanitization | PASS | `app/api/contact/route.ts` | 3 |
| Health endpoint auth gate | PASS | `app/api/health/keystatic/route.ts` | 1 |

---

## QRALPH Project Verification

| Project | Tasks | All PASS |
|---------|-------|----------|
| 011 — ISR Migration | T-001 through T-004 | Yes |
| 013 — Deploy Fixes, Contact Form, Config | T-001 through T-008 | Yes |
| 014 — Lint Fixes, Staging Monitoring | T-001 through T-004 | Yes |
| 015 — Skip Redundant Vercel Builds | T-001 through T-003 | Yes |
| 017 — Verification Audit | T-001 through T-004 | Yes |

Full evidence in `requirements/verification-audit-results.md`.

## Otyokwah content fixes — 2 SP

Approach: edit the existing navigation and rental frontmatter, then copy the Ignite page for HS Fall Retreat. Reuse existing rendering and images; this keeps the change small, with temporary interior photos and TBD event details as the tradeoffs. No production deployment, merge, or Vercel settings changes.

### REQ-OTY-CONTENT-001: Navigation href integrity
- Acceptance: every href has no surrounding whitespace; internal hrefs start with `/` and resolve to a page.

### REQ-OTY-CONTENT-002: Rental hero images
- Acceptance: Delaware Lodge, Mingo Cabin, and Seasonal Cabins use the requested existing interior/common-area images. Real exterior photos remain a camp follow-up.

### REQ-OTY-CONTENT-003: HS Fall Retreat — WITHDRAWN
- Withdrawn 2026-10-08: the client removed the page (eec2053) and its navigation entry (2039da3) in favor of Rooted; do not restore it (issue #17). Its tests are retired.
- Original acceptance: copy `retreats-ignite.mdoc` to `retreats-hs-fall.mdoc`; title HS Fall Retreat, grades 9th-12th, October 9-11, 2026, $125 before the early-bird deadline. Remove or mark TBD unsupported event details and list each in the PR body. Add navigation after Rooted.

### REQ-OTY-CONTENT-004: Verification and preview
- Acceptance: record full-suite before/after counts; the three reported failures pass; full suite, typecheck, lint, and build pass. Verify changed content with Playwright and screenshots, then open one PR against main and verify Vercel preview URLs. Leave merging to Travis.

## Issue #17: CMS saves reach production — 0.3 SP

### REQ-OTY-17-001: Every deployment builds
- Acceptance: `vercel.json` `ignoreCommand` exits 1, overriding the Vercel project setting `bash scripts/ignore-build.sh`; a content-only CMS save produces a READY production build, not CANCELED.
- Non-Goals: changing the Vercel project setting; deleting `scripts/ignore-build.sh` (kept inert until revalidation is proven live).

## Session Pricing Toggle (issue #18), 2 SP

Approach: template push of blceditor/bearlakecamp PR #30 (landed 2026-10-01). Same REQ IDs as bearlakecamp. Otyokwah differences: the `SessionCard` default registration link, the Camp Sessions page session names, and no content change (the page ships with pricing shown; camp staff flip the switch in the CMS).

### REQ-PRICE-001: CMS "Show pricing" checkbox on Session Capacity
- Acceptance: the `sessionCapacity` component in `lib/keystatic/collections/pages.ts` has a checkbox field `showPricing`, label "Show pricing", defaultValue true, with a description saying unchecking hides prices and keeps dates.

### REQ-PRICE-002: Hidden pricing keeps the rest of the session bar
- Acceptance: with showPricing=false no price text renders in any session bar of that block; session name, dates, status pill and capacity bars still render.

### REQ-PRICE-003: Absent attribute shows pricing
- Acceptance: a `sessionCapacity` tag without `showPricing` renders the same markup as before this change.

### REQ-PRICE-004: Markdoc attribute passes through the transform
- Acceptance: Markdoc attribute `showPricing` (Boolean, default true) on `sessionCapacity` reaches `SessionCapacityLive` and each `SessionCapacityBar`.

### REQ-PRICE-005: Every price component can hide its price
- Acceptance: `SessionCard`, `InlineSessionCard`, `SessionCardGrid`, `PricingTable`, `SessionCapacityCard`, `SessionCapacityCardGrid` and `SessionCapacityBar` accept `showPricing`; when false the price element is not rendered at all (not CSS-hidden) and names and dates still render.

### REQ-PRICE-006: Default on leaves markup unchanged
- Acceptance: each price component renders identical markup with `showPricing` absent and true.

### REQ-PRICE-007: Page switch reaches every Markdoc price component
- Acceptance: `MarkdocRenderer` prop `showPricing=false` removes the price from `sessionCard`, `inlineSessionCard` and `sessionCapacity`; a price shows only when the page switch and the per-block `showPricing` are both on.

### REQ-PRICE-008: Camp Sessions page follows the page switch
- Acceptance: rendering the `content/pages/summer-camp-sessions.mdoc` body with the page switch off yields zero currency matches in all 6 session bars (dates kept); with the switch on, or absent, every bar shows a price.
- Non-Goals: changing `content/**`; rewriting free-text price copy in the page body ("Pricing & Early Bird" card).

### REQ-PRICE-009: Page-level CMS "Show pricing" checkbox
- Acceptance: the pages collection has a top-level checkbox `showPricing`, label "Show pricing", defaultValue true, description "Uncheck to hide all prices on this page; dates stay".
