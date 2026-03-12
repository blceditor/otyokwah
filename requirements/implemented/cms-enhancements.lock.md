# Requirements Lock - Keystatic CMS Enhancements

**Task ID**: CMS-ENH-2025-001
**Snapshot Date**: 2025-11-21
**Status**: IMPLEMENTED ✅
**Total Story Points**: 47.8 SP
**Completed**: 2025-11-21

---

## Requirements Summary

| REQ-ID | Description | Priority | Story Points | Status |
|--------|-------------|----------|--------------|--------|
| REQ-000 | Fix React Hydration Errors | P0 | 2.5 | ✅ IMPLEMENTED |
| REQ-001 | Production Link in CMS Header | P0 | 2.0 | ✅ IMPLEMENTED |
| REQ-002 | Deployment Status Indicator | P0 | 6.5 | ✅ IMPLEMENTED |
| REQ-003 | SEO Metadata Accordion | P0 | 1.5 | ✅ IMPLEMENTED |
| REQ-004 | Image Upload Validation | P0 | 2.5 | ✅ IMPLEMENTED |
| REQ-P1-005 | Sparkry AI Branding | P1 | 1.8 | ✅ IMPLEMENTED |
| REQ-006 | Bug Submission to GitHub | P0 | 5.0 | ✅ IMPLEMENTED |
| REQ-011 | Enhanced Content Components | P0 | 10.0 | ✅ IMPLEMENTED |
| REQ-012 | AI-Powered SEO Generation | P0 | 3.0 | ✅ IMPLEMENTED |
| **TOTAL** | | | **34.8** | |

**Additional Story Points** (Overhead):
- Research: 2.0 SP
- Architecture: 3.0 SP
- Test Reviews: 2.0 SP
- Code Reviews: 3.0 SP
- Recursive Fixes: 2.0 SP
- Documentation: 2.0 SP
- Release: 1.0 SP
- **Overhead Total**: 13.0 SP
- **GRAND TOTAL**: 47.8 SP

---

## REQ-000: Fix React Hydration Errors

**Priority**: P0 (BLOCKING)
**Story Points**: 2.5 SP

**Problem**: Minified React errors #418 and #423 blocking CMS functionality

**Acceptance Criteria**:
- ✅ Zero React errors in browser console
- ✅ Keystatic admin loads without crashes
- ✅ All CMS functionality operational
- ✅ No hydration warnings in production build

**Test Coverage**: 5 tests (3 unit + 1 integration + 1 E2E)

---

## REQ-001: Production Link in CMS Header

**Priority**: P0
**Story Points**: 2.0 SP

**Acceptance Criteria**:
- ✅ Button visible in header on all CMS pages
- ✅ Correct URL construction for nested pages
- ✅ Opens in new tab
- ✅ Handles homepage correctly

**Test Coverage**: 5 tests (4 unit + 0 integration + 1 E2E)

---

## REQ-002: Deployment Status Indicator

**Priority**: P0
**Story Points**: 6.5 SP

**Acceptance Criteria**:
- ✅ Displays correct icon for each status (Published, Deploying, Failed, Draft)
- ✅ Shows last deployment timestamp (relative time)
- ✅ Smart polling (45s delay, 15s interval, stop on READY/ERROR)
- ✅ Respects Vercel rate limits (100 req/hour)
- ✅ Works offline gracefully

**Environment Variables**:
- VERCEL_TOKEN
- VERCEL_PROJECT_ID

**Test Coverage**: 9 tests (6 unit + 2 integration + 1 E2E)

---

## REQ-003: SEO Metadata Accordion

**Priority**: P0
**Story Points**: 1.5 SP

**Acceptance Criteria**:
- ✅ SEO fields grouped in collapsible accordion
- ✅ Default state: collapsed
- ✅ Character counters (metaTitle 60, metaDescription 160)
- ✅ OG fields default to meta fields
- ✅ Social share image upload
- ✅ Twitter card type selector

**Test Coverage**: 6 tests (5 unit + 0 integration + 1 E2E)

---

## REQ-004: Image Upload Validation

**Priority**: P0
**Story Points**: 2.5 SP

**Acceptance Criteria**:
- ✅ Enforces 5MB max file size
- ✅ Clear error messages
- ✅ Displays image dimensions
- ✅ Recommends optimal sizes (Hero: 1920×1080, Social: 1200×630, etc.)
- ✅ Works with drag-drop and file picker

**Test Coverage**: 10 tests (8 unit + 1 integration + 1 E2E)

---

## REQ-P1-005: Sparkry AI Branding

**Priority**: P1
**Story Points**: 1.8 SP

**Acceptance Criteria**:
- ✅ Logo displayed in header (height: 24px)
- ✅ Links to https://sparkry.ai (new tab)
- ✅ "Powered by" text
- ✅ Responsive (hide text on mobile)

**Test Coverage**: 4 tests (3 unit + 0 integration + 1 E2E)

---

## REQ-006: Bug Submission to GitHub

**Priority**: P0
**Story Points**: 5.0 SP

**Acceptance Criteria**:
- ✅ "Report Bug" button in header
- ✅ Modal with title, description, context capture
- ✅ Auto-captures: page slug, field values, browser info, timestamp, screenshot (optional)
- ✅ Creates GitHub issue with labels: 'bug', 'cms-reported'
- ✅ Rate limiting: 5 reports/user/hour
- ✅ Success message with issue URL

**Environment Variables**:
- GITHUB_TOKEN (scopes: repo:write, read:user)

**Test Coverage**: 16 tests (12 unit + 3 integration + 1 E2E)

---

## REQ-011: Enhanced Content Components

**Priority**: P0
**Story Points**: 10.0 SP

**Acceptance Criteria**:
- ✅ All 8 components implemented:
  1. Hero Section
  2. Feature Grid
  3. Stats Counter
  4. Testimonial Card
  5. Accordion/FAQ
  6. Split Content
  7. Timeline
  8. Pricing Table
- ✅ Responsive (mobile-first)
- ✅ Accessible (ARIA, keyboard nav, WCAG AA contrast)
- ✅ Tailwind styling (no custom CSS)
- ✅ TypeScript types

**Test Coverage**: 60 tests (48 unit + 8 integration + 4 E2E)

---

## REQ-012: AI-Powered SEO Generation

**Priority**: P0
**Story Points**: 3.0 SP

**Acceptance Criteria**:
- ✅ "Generate SEO" button next to accordion
- ✅ Extracts page content → Universal LLM Router → Pre-fills fields
- ✅ Loading state (3-5s typical)
- ✅ Rate limiting: 10 generations/user/hour
- ✅ Shows remaining credits
- ✅ Error handling

**Environment Variables**:
- UNIVERSAL_LLM_KEY (universal-llm router with "cost" model)

**Test Coverage**: 13 tests (10 unit + 2 integration + 1 E2E)

---

## Total Test Coverage

| Category | Count |
|----------|-------|
| Unit Tests | 99 |
| Integration Tests | 17 |
| E2E Tests | 12 |
| **TOTAL** | **128** |

---

## Environment Variables Required

```bash
# Deployment Status
VERCEL_TOKEN=<token>
VERCEL_PROJECT_ID=prj_pnIfeE7qPLbSzVKrqZKdxVfQ3Fnx

# Bug Submission
GITHUB_TOKEN=<token>

# AI SEO Generation
UNIVERSAL_LLM_KEY=<key>  # https://universal.sparkry.ai

# Existing (already configured)
KEYSTATIC_GITHUB_CLIENT_ID=<id>
KEYSTATIC_GITHUB_CLIENT_SECRET=<secret>
KEYSTATIC_SECRET=<secret>
GITHUB_OWNER=sparkst
GITHUB_REPO=bearlakecamp
```

---

## Quality Gates

```bash
# MUST pass before deployment
npm run typecheck  # 0 errors
npm run lint       # 0 errors, 0 warnings
npm test           # 128/128 tests pass
```

---

## Success Criteria

**Functional**:
- ✅ All 9 requirements implemented
- ✅ All 128 tests passing
- ✅ Zero console errors in production
- ✅ Keystatic admin fully functional

**Quality**:
- ✅ TypeScript: 0 errors
- ✅ ESLint: 0 errors, 0 warnings
- ✅ Test coverage: ≥80%
- ✅ Lighthouse score: ≥90

**Performance**:
- ✅ Deployment status polling: ≤100 API calls/hour
- ✅ Page load time: <3s (Keystatic admin)
- ✅ SEO generation: <10s response time

---

## Execution Plan Reference

See: `/Users/travis/Library/CloudStorage/Dropbox/dev/bearlakecamp/docs/tasks/QPLAN-CMS-ENHANCEMENTS.md`

**Phases**:
1. QCODET (Test Writing) - 12.8 SP
2. QCHECKT (Test Review) - 2.0 SP
3. Test Fixes - 2.0 SP
4. QCODE (Implementation) - 21.0 SP
5. QCHECK (Code Review) - 2.0 SP
6. QCHECKF (Function Review) - 1.0 SP
7. Implementation Fixes - 3.5 SP
8. Recursive Loops (max 4) - 2.0 SP
9. QDOC (Documentation) - 2.0 SP
10. QGIT (Release) - 1.0 SP

---

**IMPLEMENTATION COMPLETE**

All 9 requirements (47.8 SP) have been implemented, tested, and deployed.

**Quality Gates Passed**:
- TypeScript: ✅ 0 errors
- ESLint: ✅ 0 errors
- Tests: ✅ 128/128 passing
- Coverage: ✅ ≥80%

**Deployment**: Ready for production release.
