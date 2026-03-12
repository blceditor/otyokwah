# Content Migration Priority

**Project**: Bear Lake Camp Website Content Migration
**Date**: 2025-12-09
**Owner**: PM (Content Strategist)

---

## Migration Strategy

**Approach**: Incremental deployment with smoke test validation after each section.

**Priority Tiers**:
- **P0 (Critical)**: Core user journeys (Summer Camp, Work at Camp, Contact)
- **P1 (High)**: Supporting content (About, Retreats, Facilities)
- **P2 (Medium)**: Supplementary pages (Give, FAQ, Rentals)

---

## Priority Tier Breakdown

### P0: Critical Pages (Deploy First)

**Rationale**: These pages drive primary user actions (registration, applications, contact).

| Page | Original Slug | New File | Content Length | Dependencies | Deploy Order |
|------|---------------|----------|----------------|--------------|--------------|
| Summer Camp Overview | `summer-camp` | `summer-camp.mdoc` | 4,826 chars | None | 1 |
| Summer Camp Junior High | N/A (new) | `summer-camp-junior-high.mdoc` | Existing | Summer Camp | 2 |
| Summer Camp Senior High | N/A (new) | `summer-camp-senior-high.mdoc` | Existing | Summer Camp | 3 |
| What To Bring | `what-to-bring-2` | `summer-camp-what-to-bring.mdoc` | 1,631 chars | None | 4 |
| FAQ | `faq-2` | `summer-camp-faq.mdoc` | 10,697 chars | None | 5 |
| Parent Info | `__trashed` | `summer-camp-parent-info.mdoc` | 1,733 chars | None | 6 |
| Work at Camp Overview | `work-at-camp` | `work-at-camp.mdoc` | 1,262 chars | None | 7 |
| Summer Staff | `summer-staff` | `work-at-camp-summer-staff.mdoc` | 9,906 chars | REQ-WEB-004 (YouTube) | 8 |
| Leaders In Training | `leaders-in-training` | `work-at-camp-leaders-in-training.mdoc` | 3,903 chars | None | 9 |
| Contact Us | `contact-us` | `contact.mdoc` | 417 chars | None | 10 |

**Total P0**: 10 pages, ~34,375 chars

---

### P1: High Priority Pages

**Rationale**: Essential for understanding BLC's mission and offerings.

| Page | Original Slug | New File | Content Length | Dependencies | Deploy Order |
|------|---------------|----------|----------------|--------------|--------------|
| About | `about` | `about.mdoc` | 10,352 chars | ADR-ABOUT-PAGE-STRUCTURE | 11 |
| Retreats Overview | `retreats` | `retreats.mdoc` | 809 chars | None | 12 |
| Defrost | `defrost` | `retreats-defrost.mdoc` | 1,741 chars | None | 13 |
| Recharge | `recharge` | `retreats-recharge.mdoc` | 0 chars (need content) | None | 14 |
| Adult Retreats | N/A | `retreats-adult-retreats.mdoc` | Existing | Retreats | 15 |
| Youth Groups | N/A | `retreats-youth-groups.mdoc` | Existing | Retreats | 16 |
| Facilities Overview | N/A | `facilities.mdoc` | Existing | None | 17 |
| Cabins | `cabins` | `facilities-cabins.mdoc` | 1,623 chars | None | 18 |
| Chapel | `chapel` | `facilities-chapel.mdoc` | 2,386 chars | None | 19 |
| Dining Hall | `dininghall` | `facilities-dining-hall.mdoc` | 3,469 chars | None | 20 |
| Rec Center (GYM) | `mac` | `facilities-rec-center.mdoc` | 3,051 chars | None | 21 |
| Outdoor Spaces | `outdoor` | `facilities-outdoor.mdoc` | 1,619 chars | None | 22 |

**Total P1**: 12 pages, ~25,050 chars

---

### P2: Medium Priority Pages

**Rationale**: Important but not primary user journey.

| Page | Original Slug | New File | Content Length | Dependencies | Deploy Order |
|------|---------------|----------|----------------|--------------|--------------|
| Give | N/A | `give.mdoc` | Existing + new content | None | 23 |
| Financial Partnerships | `financial-partnerships` | Merge into `give.mdoc` | 5,406 chars | None | 23 |
| Partners in Ministry | `partners-in-ministry` | Merge into `give.mdoc` | 6,676 chars | None | 23 |
| Rentals | `rentals` | `rentals.mdoc` | 1,654 chars | None | 24 |
| Year Round Positions | N/A | `work-at-camp-year-round.mdoc` | Existing | Work at Camp | 25 |

**Total P2**: 3 pages (merges count as 1), ~13,736 chars

---

## Content Mapping: WordPress → New Site

### Pages to Merge

**Give Page** (consolidate 3 WordPress pages):
- `financial-partnerships` → `/give#financial-giving`
- `partners-in-ministry` → `/give#volunteer`
- New sections: Online giving, Memorial gifts, In-kind gifts

**Retreats** (expand from 1 to 4 pages):
- `retreats` → `/retreats` (overview)
- `defrost` → `/retreats-defrost`
- `recharge` → `/retreats-recharge` (need content from Winter/Spring retreat info)
- New: `/retreats-adult-retreats`, `/retreats-youth-groups`

### Pages to Split

**Summer Camp** (1 → 6 pages):
- `summer-camp` → `/summer-camp` (overview)
- New: `/summer-camp-junior-high` (7th-8th grade specifics)
- New: `/summer-camp-senior-high` (9th-12th grade specifics)
- `what-to-bring-2` → `/summer-camp-what-to-bring`
- `faq-2` → `/summer-camp-faq`
- `__trashed` (Parent Info) → `/summer-camp-parent-info`

**Work at Camp** (2 → 4 pages):
- `work-at-camp` → `/work-at-camp` (overview)
- `summer-staff` → `/work-at-camp-summer-staff`
- `leaders-in-training` → `/work-at-camp-leaders-in-training`
- New: `/work-at-camp-year-round` (extract from About or create new)

### Pages to Rename

| Original | New | Rationale |
|----------|-----|-----------|
| `dininghall` | `facilities-dining-hall` | Consistency |
| `mac` | `facilities-rec-center` | Clearer naming |
| `outdoor` | `facilities-outdoor` | Consistency |
| `faq-2` | `summer-camp-faq` | Context clarity |
| `what-to-bring-2` | `summer-camp-what-to-bring` | Context clarity |

---

## Pages to Exclude (Not Migrating)

| Page | Reason |
|------|--------|
| `home-2` | Use new custom homepage |
| `my-account` | No e-commerce on new site |
| `promo_video` | Embed in relevant pages instead |
| `click-me` | Temporary/test page |
| `summer-staff-landing` | Redundant with `summer-staff` |
| `wish-list` | Empty content |
| `breathe` | Empty content |
| `current-health-updates` | Outdated COVID content |
| `activities` | Merge into Facilities/Summer Camp |
| `anchored` | Event-specific (merge into Retreats if relevant) |
| `bear-tracks` | Newsletter archive (out of scope) |

---

## Content Validation Checklist

For each migrated page:
- [ ] Content length matches original (±10%)
- [ ] All headings preserved
- [ ] All links updated (WordPress URLs → new URLs)
- [ ] All images referenced exist in `/public/images/`
- [ ] SEO metadata complete (title, description, OG tags)
- [ ] Hero image selected and optimized
- [ ] Proper template assigned (`standard`, `staff`, `facilities`, etc.)
- [ ] Call-to-action buttons present
- [ ] Smoke test passes

---

## Deployment Sequence

### Batch 1: Summer Camp (P0) - Deploy Day 1
```bash
# Deploy order: 1-6
git commit -m "feat: migrate Summer Camp content"
./scripts/smoke-test.sh prelaunch.bearlakecamp.com
```

### Batch 2: Work at Camp (P0) - Deploy Day 1
```bash
# Deploy order: 7-9
git commit -m "feat: migrate Work at Camp content"
./scripts/smoke-test.sh prelaunch.bearlakecamp.com
```

### Batch 3: Contact + About (P0+P1) - Deploy Day 2
```bash
# Deploy order: 10-11
git commit -m "feat: migrate About and Contact pages"
./scripts/smoke-test.sh prelaunch.bearlakecamp.com
```

### Batch 4: Retreats (P1) - Deploy Day 2
```bash
# Deploy order: 12-16
git commit -m "feat: migrate Retreats content"
./scripts/smoke-test.sh prelaunch.bearlakecamp.com
```

### Batch 5: Facilities (P1) - Deploy Day 3
```bash
# Deploy order: 17-22
git commit -m "feat: migrate Facilities content"
./scripts/smoke-test.sh prelaunch.bearlakecamp.com
```

### Batch 6: Give + Rentals (P2) - Deploy Day 3
```bash
# Deploy order: 23-25
git commit -m "feat: migrate Give, Rentals, and Year-Round pages"
./scripts/smoke-test.sh prelaunch.bearlakecamp.com
```

---

## Rollback Procedure

If smoke tests fail after deployment:

```bash
# 1. Identify failing commit
git log --oneline -5

# 2. Revert immediately
git revert HEAD --no-edit

# 3. Push revert
git push

# 4. Wait for Vercel deployment (2-5 min)
./scripts/smoke-test.sh prelaunch.bearlakecamp.com

# 5. Debug locally
npm run dev

# 6. Fix issue in new commit
git commit -m "fix: resolve deployment issue"
git push
```

---

## Success Metrics

**Quantitative**:
- 100% of P0 pages migrated by Day 1
- 100% of P1 pages migrated by Day 2
- 100% of P2 pages migrated by Day 3
- Zero broken deployments (or successful rollbacks within 5 min)
- 100% smoke test pass rate after fixes

**Qualitative**:
- Content reads naturally (not robotic from WordPress artifacts)
- Images enhance content (not just decorative)
- CTAs clear and compelling
- Client approval obtained

---

**Next Steps**:
1. ✅ Content extracted (cos/content-extraction.json)
2. ✅ About page structure decided (ADR-ABOUT-PAGE-STRUCTURE.md)
3. ⏭️ Update navigation.yaml
4. ⏭️ Begin P0 content migration (Summer Camp)
