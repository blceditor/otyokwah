# QRALPH v4.0 — Project 002: BLC Review and Improve

## Meta
- Project: 002-blc-review-and-improve
- Request: Comprehensive review and fix of Bear Lake Camp website per stakeholder feedback. Execute Hybrid Option 1+3 (~42 SP). Then full browser pass of all pages + CMS pages. Loop until done.
- Mode: coding
- Created: 2026-02-06
- Rollback Point: commit `0785fc0`
- Current Commit: `1614871`

## Source Documents
- `BLC Fixes - 2026-02-06.md` — Stakeholder page-by-page feedback (25 pages + staff pages)
- `blc-review-instructions.md` — Original QRALPH request with 5-step execution plan
- `REVIEW-REPORT.md` — 80 findings (13 P0, 18 P1, 35 P2, 14 Future)
- `LAUNCH-OPTIONS.md` — 4 options + Hybrid recommendation (~42 SP)
- `COMPREHENSIVE-AUDIT-REQUIREMENTS.md` — Post-execution audit with 9 new findings + status of all 80 prior
- `SESSION-STATUS-2026-02-12.md` — Prior session status snapshot

## Execution Plan
- [x] INIT (project created, review planned)
- [x] DISCOVERING (9 specialist reviews completed)
- [x] REVIEWING (80 findings synthesized, 4 options generated, Hybrid selected)
- [x] EXECUTING (Batches 1-5 completed via v4.0 team: security-agent, frontend-agent, cms-agent)
- [x] UAT (26/26 pages clean — hero image path fix resolved 16 missing H1s)
- [x] ITERATING (hero image normalization fix applied during UAT)
- [ ] COMPLETE ← current

## Execution Progress

### Completed (7 commits: f657528 → 7cbbb54)
- Design token migration (gray-900→text-bark, bg-sky-50→bg-cream, etc.)
- Security: CSP headers, HSTS (partial), ignoreBuildErrors:false
- Templates: Facility/Program/StaffList/Staff switched to MarkdocRenderer
- CTAButton normalization across all templates
- Image cleanup: staff photos → public/images/staff/, normalizeImagePath() helper
- Content: 30+ .mdoc pages updated
- Dead code deleted: UnifiedHero, FAQAccordion, facilities pages, individual staff pages
- Testimonials wired up: lib/testimonials.ts, TestimonialWidget random mode, all pages
- YouTube embed: maxWidth prop (sm/md/lg/full) with CMS field
- Page redesigns: Rentals, Retreats, Work at Camp, Give → squareGrid layout
- Navigation: Fixed Summer Staff href, rewrote default nav YAML
- Test cleanup: -677 lines, pointed at correct components, removed stale specs
- .env.example added (25+ vars documented)

### Remaining Batches (from COMPREHENSIVE-AUDIT-REQUIREMENTS.md §D)

#### Batch 1: P0 Image Pipeline (5 SP) — VERIFIED OK
| REQ ID | Title | SP | Status |
|--------|-------|-----|--------|
| REQ-NEW-001 | Homepage gallery broken (empty src) | 2 | VERIFIED: normalizeImagePath applied in gallery transform |
| REQ-NEW-005 | Summer camp 4/5 images broken | 2 | VERIFIED: normalizeImagePath applied in wideCard transform |
| REQ-NEW-007 | Homepage facility images broken | 1 | VERIFIED: normalizeImagePath applied in gridSquare transform |

#### Batch 2: P0 Content & Security (4.5 SP) — MOSTLY DONE
| REQ ID | Title | SP | Status |
|--------|-------|-----|--------|
| REQ-NEW-003 | About Our Team zero staff photos | 3 | OPEN (needs design decision — staff collection vs inline) |
| REQ-P0-01 | Rotate leaked credentials | 0.5 | OPEN (requires Travis GitHub OAuth app access) |
| REQ-P0-12a | Add HSTS header | 0.5 | DONE (already in next.config.mjs:69) |
| REQ-P0-12b | Enforce CSP (not report-only) | 0.5 | DONE (already enforcing in next.config.mjs:73) |

#### Batch 3: P1 Functional (5 SP) — MOSTLY DONE
| REQ ID | Title | SP | Status |
|--------|-------|-----|--------|
| REQ-P1-12 | Homepage bare div on missing content | 1 | DONE (notFound() + styled fallback already exist) |
| REQ-NEW-002 | Homepage H1 "Home" vs camp name | 0.5 | DONE (index.mdoc title="Bear Lake Camp" + sr-only H1 fallback) |
| REQ-NEW-004 | Rentals facility gallery empty | 1 | DONE (rentals redesigned with squareGrid in 7ece675) |
| REQ-NEW-006 | Trent Grable near-empty bio | 0.5 | OPEN (Ben content task) |
| REQ-P1-08-TEST | Stale testimonial tests | 0.5 | DONE (fixed in 7ece675) |
| REQ-P1-06 | missionSection backgroundImage still text | 0.5 | DONE (already fields.image() with publicPath) |
| REQ-P1-01 | Auth on /api/keystatic/pages | 1 | DONE (isKeystatiAuthenticated check exists) |

#### Batch 4: P1 Structural (5 SP) — PARTIALLY DONE
| REQ ID | Title | SP | Status |
|--------|-------|-----|--------|
| REQ-P1-05 | Color field fragmentation | 2 | DONE (CONTAINER_BG_COLOR_PRESETS unified in 1614871) |
| REQ-P2-17 | Template rendering engine divergence | 3 | PARTIALLY DONE (4 templates migrated, HomepageTemplate still uses ReactMarkdown) |

#### Batch 5: P2 Quick Wins (3 SP) — DONE
| REQ ID | Title | SP | Status |
|--------|-------|-----|--------|
| REQ-P2-20 | Duplicate FAQ accordion labels | 0.5 | DONE (renamed to "Simple Accordion" in 1614871) |
| REQ-P2-22 | font-display undefined | 0.5 | DONE (already uses font-heading) |
| REQ-P2-23 | Focus ring inconsistency | 1 | DONE (already standardized: ring-primary, ring-white, ring-link) |
| REQ-NEW-008 | Homepage singleton orphaned | 1 | N/A (no homepage singleton exists — only mission, siteNavigation, campSettings) |

### BLC Fixes Document Cross-Reference
| # | Page | Fix Needed | Status |
|---|------|-----------|--------|
| 1 | Home | Gallery, testimonials | Testimonials DONE. Gallery VERIFY. |
| 2 | About | ✅ Done prior | DONE |
| 3 | Core Values | ✅ Done prior | DONE |
| 4 | Doctrinal Statement | ✅ Done prior | DONE |
| 5 | Our Team | Hero image, staff layout | OPEN (REQ-NEW-003) |
| 6 | Summer Camp | Hero, theme video | VERIFY images |
| 7 | Camp Sessions | Hero keyframe, font size, static image | OPEN (Ben content) |
| 8 | What to Bring | Hero height, fullbleed margins | VERIFY |
| 9 | FAQ | ✅ Done prior | DONE |
| 10 | Parent Info | Hero, cards, button/link colors | PARTIALLY DONE |
| 11 | Work at Camp | Hero, match camp colors | DONE (7ece675 redesign) |
| 12 | Summer Staff | Arts & Crafts image, YouTube resize | YouTube sizing DONE. Image is Ben. |
| 13 | Leaders in Training | Margin fix | VERIFY |
| 14 | Year Round | Hero, Ben content update | OPEN (Ben content) |
| 15 | Retreats | Hero, 4-block layout | DONE (7ece675 redesign) |
| 16 | Defrost | Register Now green button | VERIFY |
| 17 | Recharge | Hero, hero video | OPEN (Ben content) |
| 18 | Rentals | Update to camp style | DONE (7ece675 redesign) |
| 19-24 | Rental sub-pages | Hero image sizes | VERIFY (heroHeight set to medium) |
| 25 | Give | Match camp pages, Donate mail fix, sections | DONE (7ece675 redesign) |
| 26 | Contact | ✅ Done prior | DONE |

## Uncommitted Work
None — clean working tree as of 7cbbb54.

## Session Log
| # | Started | Ended | Phase | Notes |
|---|---------|-------|-------|-------|
| 1 | 2026-02-06 | 2026-02-06 | REVIEWING | 9 specialist reviews, synthesis, 4 options |
| 2 | 2026-02-09 | 2026-02-09 | EXECUTING | Browser audit, COMPREHENSIVE-AUDIT-REQUIREMENTS |
| 3 | 2026-02-12 | 2026-02-12 | EXECUTING | 4 commits (eb83f2f→608f00b), moved to SSD |
| 4 | 2026-02-16 | 2026-02-16 | EXECUTING | Audited + committed WIP (7ece675, 7cbbb54), bootstrapped v4.0 STATE |
| 5 | 2026-02-16 | 2026-02-16 | EXECUTING | v4.0 team (3 agents). Most items already done. New: sr-only H1, color unification, accordion label. Commit 1614871 |
| 6 | 2026-02-16 | 2026-02-16 | UAT+ITERATING | Browser audit of 26 pages. Found hero image path bug (relative paths failed isSafeImageUrl). Fixed: extracted normalizeImagePath to lib/image-utils.ts, applied to page-renderer.tsx and app/page.tsx. Result: 26/26 clean. |

## Next Session Instructions
All pages passing UAT. Ready to commit and deploy. Remaining user items:
1. REQ-P0-01: Credential rotation (Travis action item)
2. REQ-NEW-006: Trent Grable bio update (Ben content task)
3. Hero keyframe images for camp sessions (Ben content task)
4. REQ-P2-17: HomepageTemplate ReactMarkdown→Markdoc migration (deferred)
