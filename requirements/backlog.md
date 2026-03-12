# Requirements Backlog — Deferred Features

**Date**: 2026-03-06
**Status**: Deferred — no scope additions until current quality bar is met
**Source**: Split from `requirements/current.md` during Project 017 verification audit

---

## Summary

| REQ-ID | Title | Priority | SP |
|--------|-------|----------|----|
| REQ-CMS-004 | Global SEO Generation Refactor | P1 | 8.0 |
| REQ-CMS-006 | Component Duplication Feature | P1 | 5.0 |
| REQ-TPL-001 | Homepage Template — move hardcoded content to CMS | P1 | 5.0 |
| REQ-CARD-002 | Convert Icon Fields to Dropdown Select | P1 | 2.0 |
| REQ-CARD-003 | Convert CTA Button Text Color to Dropdown | P2 | 1.0 |
| REQ-CARD-004 | Visual Icon Picker Enhancement | P2 | 3.0 |
| REQ-BUILD-007 | Build Monitoring and Alerting | P2 | 3.0 |
| REQ-BUILD-008 | Content Preview Workflow | P2 | 5.0 |
| REQ-BUILD-015 | Optimistic Save Toast | P2 | 0.3 |
| **Total** | | | **32.3** |

---

## REQ-CMS-004: Global SEO Generation Refactor

**Priority**: P1 | **Story Points**: 8.0

### Problem
Current SEO generation only works on individual pages. Need a global "Generate All SEO" button in the Keystatic header.

### Scope
- API endpoint `/api/generate-seo` for batch processing
- `GlobalSEOGenerator.tsx` component with progress modal
- Keystatic header integration
- Rate-limited sequential processing (2s delay between pages)

### Acceptance Criteria
1. "Generate All SEO" button in Keystatic header
2. Modal shows list of all pages without SEO
3. Progress indicator shows current page being processed
4. Success/error status for each page
5. Option to skip pages that already have SEO
6. Respects API rate limits

---

## REQ-CMS-006: Component Duplication Feature

**Priority**: P1 | **Story Points**: 5.0

### Problem
When copying Markdoc component syntax, content doesn't render on the site due to missing wrapper tags, attribute mismatches, case-sensitive icons, and required attributes missing.

### Scope
- `ComponentDuplicator.tsx` — inject "Duplicate" button next to each Markdoc component
- Markdoc validation helper in `MarkdocRenderer.tsx`

### Acceptance Criteria
1. Components can be duplicated with one click
2. Duplicated content renders correctly
3. Validation errors shown for malformed components
4. Copy/paste from external sources validates before saving

---

## REQ-TPL-001: Homepage Template Hardcoded Content

**Priority**: P1 | **Story Points**: 5.0

### Problem
Multiple homepage components have hardcoded text/images that should be CMS-editable: Programs section, TrustBar, Gallery heading, Testimonials heading, Instagram section.

### Scope
- Create homepage singleton in `keystatic.config.ts`
- Refactor `Programs.tsx`, `TrustBar.tsx`, `Gallery.tsx`, `Testimonials.tsx` to accept props from CMS

### Acceptance Criteria
1. All homepage section headings editable in Keystatic
2. Program cards fully editable (title, subtitle, image, benefits, link)
3. Trust bar items editable
4. Gallery and Testimonials headings editable
5. No hardcoded customer-facing text remains

---

## REQ-CARD-002: Convert Icon Fields to Dropdown Select

**Priority**: P1 | **Story Points**: 2.0

### Problem
CMS uses free-text input for icon names. Users must type exact Lucide icon names or risk the icon not rendering.

### Scope
- Create `LUCIDE_ICON_OPTIONS` constant in `keystatic.config.ts`
- Convert `contentCard.icon`, `infoCard.icon`, `donateButton.icon`, `trustBarItems.icon` from `fields.text()` to `fields.select()`

### Acceptance Criteria
1. All 4 icon fields render as dropdown selects in CMS
2. "None" option available for optional icons
3. Existing content with valid icon names continues to work
4. No icon field accepts free-text input

---

## REQ-CARD-003: Convert CTA Button Text Color to Dropdown

**Priority**: P2 | **Story Points**: 1.0

### Problem
CTA Button's `textColor` field accepts free text. Only specific Tailwind color names work.

### Scope
- Convert `textColor` in `keystatic.config.ts` from `fields.text()` to `fields.select()` with curated color options

### Acceptance Criteria
1. Text color field renders as dropdown select
2. All valid color options available
3. Existing content continues to work

---

## REQ-CARD-004: Visual Icon Picker Enhancement

**Priority**: P2 | **Story Points**: 3.0 | **Depends on**: REQ-CARD-002

### Problem
Icon dropdown shows text-only options. Editors must remember icon names without visual reference.

### Scope
- `IconFieldEnhancer.tsx` — inject visual icon preview next to dropdown
- Follow `MediaFieldEnhancer.tsx` pattern (MutationObserver + DOM injection)

### Acceptance Criteria
1. Icon preview displays next to icon dropdown fields
2. Preview updates when dropdown selection changes
3. Preview shows actual Lucide icon, not text
4. Works in both light and dark modes

---

## REQ-BUILD-007: Build Monitoring and Alerting

**Priority**: P2 | **Story Points**: 3.0

### Problem
No build metrics tracking, no Vercel deployment webhook to Slack/Discord, no build-time threshold alerting.

### Scope
- Build metrics script
- Vercel deployment webhook integration
- Build-time threshold alerting

### Acceptance Criteria
1. Build time tracked per deployment
2. Alert when build exceeds threshold
3. Historical build time data accessible

---

## REQ-BUILD-008: Content Preview Workflow

**Priority**: P2 | **Story Points**: 5.0

### Problem
No draft mode API routes exist. Keystatic uses GitHub mode with PR-based workflow, but no explicit preview mode.

### Scope
- Draft mode API routes (`app/api/draft/`)
- Leverage Vercel preview deployments

### Acceptance Criteria
1. Content editors can preview changes before publishing
2. Preview mode shows draft content
3. Clear indicator when in preview mode

---

## REQ-BUILD-015: Optimistic Save Toast

**Priority**: P2 | **Story Points**: 0.3

### Problem
`SaveMonitor.tsx` exists but no optimistic toast UI or CSS animations.

### Scope
- Add toast notification on content save
- CSS animations (`animate-fade-in`, `animate-fade-out`)

### Acceptance Criteria
1. Toast appears on successful save
2. Toast auto-dismisses after 3 seconds
3. Animations are smooth
