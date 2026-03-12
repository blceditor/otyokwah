# Technical Debt Log

**Last Updated:** 2025-11-19

---

## Active Debt

### DEBT-001: Instagram API Integration
**Component:** `components/homepage/InstagramFeed.tsx:19`
**Priority:** P2 (Phase 3)
**Story Points:** 3 SP
**Created:** 2025-11-19

**Description:**
Currently using placeholder posts. Need to integrate Instagram Basic Display API for live feed.

**Implementation Options:**
1. **Instagram Basic Display API** (free, requires app approval)
2. **Smash Balloon Social Feed** ($49/year, no API setup)
3. **Static embed** (manual update, no API)

**Acceptance Criteria:**
- Fetch 6 most recent posts from @bearlakecamp
- Daily refresh
- Loading/error states
- Fallback to placeholders on API failure

**References:**
- REQ-Q2-005: Integrate Instagram Feed
- requirements/requirements.lock.md:114-143
- Phase 3 backlog item

**Notes:**
- Defer to Phase 3 per requirements.lock.md
- Current placeholder implementation satisfies Phase 2 acceptance criteria
- Recommendation: Use Smash Balloon widget for Phase 2 (fastest implementation), migrate to API in Phase 3 if needed

---

## Resolved Debt

_No resolved debt items yet._
