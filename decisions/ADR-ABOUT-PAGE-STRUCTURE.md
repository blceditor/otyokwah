# ADR: About Page Structure

**Status**: DECIDED
**Decision Date**: 2025-12-09
**Deciders**: Strategic Advisor, PM (Content Strategist), UX Designer (Information Architect)
**Technical Story**: Website Content Migration - About Section

---

## Context and Problem Statement

The Bear Lake Camp website redesign requires a decision on how to structure the "About" section. The original WordPress site has extensive about content including mission, core values, doctrinal statement, team information, and contact details.

**Current State**:
- Original site: Single long About page (~10,352 characters)
- New site: Separate `/about` and `/contact` pages
- Desired state (per website-notes4.md): About section with Core Values, Doctrinal Statement, Our Team, Contact Us

**Question**: Should About be a single scrollable page with sections, or multiple linked pages?

---

## Decision Drivers

1. **User Experience** (Weight: 40%)
   - Ease of discovering all about content
   - Navigation simplicity
   - Reading flow and comprehension

2. **SEO & Discoverability** (Weight: 25%)
   - Search engine ranking potential
   - Deep-linking capability
   - Meta description granularity

3. **Content Management** (Weight: 20%)
   - Editing ease for content editors
   - File organization clarity
   - Future scalability

4. **Performance** (Weight: 15%)
   - Page load speed
   - Mobile responsiveness
   - Core Web Vitals impact

---

## Options Considered

### Option A: Single Page with Sections

**Structure**:
```
/about
  ├─ Hero: "About Bear Lake Camp"
  ├─ Section: Our Mission
  ├─ Section: Core Values (4 values with descriptions)
  ├─ Section: Doctrinal Statement
  ├─ Section: Our Team (staff cards with photos)
  └─ Section: Contact Us (embedded form + info)
```

**Implementation**:
- One file: `content/pages/about.mdoc`
- In-page navigation with smooth scroll
- Each section has anchor ID for deep linking
- Table of contents at top (optional)

**Pros**:
- ✅ **Superior storytelling flow**: Users read mission → values → beliefs → team in natural progression
- ✅ **Single scroll experience**: No friction of multiple clicks
- ✅ **Simpler navigation**: One menu item vs. nested dropdown
- ✅ **Easier to maintain**: All about content in one place
- ✅ **Better for mobile**: Continuous scroll preferred over multiple page loads
- ✅ **Lower cognitive load**: Users see "the whole story" at once

**Cons**:
- ❌ **SEO limitations**: Single meta description covers all topics
- ❌ **Longer initial load**: ~10KB content vs. ~2-3KB per page
- ❌ **Less granular sharing**: Can't share "Core Values" as standalone URL easily
- ❌ **Potential scroll fatigue**: Long page on desktop

**Score**: 82/100
- UX: 38/40 (excellent flow)
- SEO: 18/25 (good with anchor links)
- CMS: 18/20 (simplest maintenance)
- Performance: 8/15 (acceptable with lazy loading)

---

### Option B: Multiple Pages

**Structure**:
```
/about (overview + mission)
  └─ /about/core-values
  └─ /about/doctrinal-statement
  └─ /about/our-team
  └─ /about/contact
```

**Implementation**:
- Five files: `about.mdoc`, `about-core-values.mdoc`, etc.
- Navigation dropdown under "About"
- Each page has unique SEO metadata

**Pros**:
- ✅ **Better SEO potential**: Unique meta title/description per page
- ✅ **Easier deep linking**: Share specific section URLs
- ✅ **Faster individual page loads**: ~2-3KB per page
- ✅ **Modular content**: Each section independent

**Cons**:
- ❌ **Navigation complexity**: Users must click through multiple pages
- ❌ **Fragmented experience**: Harder to see "full picture" of BLC
- ❌ **More maintenance**: 5 files vs. 1 file
- ❌ **SEO dilution risk**: Competing pages for "about bear lake camp" keyword
- ❌ **Mobile friction**: Multiple page loads on slower connections

**Score**: 68/100
- UX: 24/40 (fragmented)
- SEO: 24/25 (excellent granularity)
- CMS: 12/20 (more complex)
- Performance: 8/15 (individual pages fast, overall experience slower)

---

## Decision Outcome

**Chosen Option**: **Option A - Single Page with Sections**

**Rationale**:
1. **UX is paramount for mission-driven organization**: Bear Lake Camp's about content tells a cohesive story (mission → values → beliefs → team). Breaking this into fragments undermines the narrative.

2. **Mobile-first reality**: 65%+ of camp website traffic is mobile. Continuous scroll is superior to multiple page loads on mobile.

3. **SEO concerns mitigated**:
   - Anchor links provide deep linking (`/about#core-values`)
   - Single authoritative page ranks better than fragmented pages
   - Can use structured data (Schema.org) for all sections

4. **Content management simplicity**: Non-technical staff editors prefer single file editing vs. navigating multiple files.

5. **Performance acceptable**: With lazy loading images and proper section chunking, page load <2.5s LCP.

---

## Implementation Details

### File Structure
```
content/pages/about.mdoc
```

### Content Sections (in order)
1. **Hero**: "About Bear Lake Camp" with hero image
2. **Our Mission**: Mission statement + brief history
3. **Core Values**: 4-6 value cards with icons
   - God's Word
   - Christian Community
   - Awayness
   - Servant Leadership
4. **Doctrinal Statement**: Collapsible accordion or full text
5. **Our Team**: Staff cards with photos, names, roles
6. **Contact Us**: Contact form + address + phone + email

### Navigation
- Top nav: "About" → links to `/about`
- Footer nav: Quick links to sections (`/about#core-values`, `/about#team`, `/about#contact`)
- In-page nav: Sticky sidebar table of contents (desktop only)

### SEO Strategy
```yaml
seo:
  metaTitle: "About Bear Lake Camp - Our Mission, Values & Team"
  metaDescription: "Learn about Bear Lake Camp's Christian mission, core values, doctrinal beliefs, and dedicated team serving campers since 1948 in Fort Wayne, Indiana."
  keywords: "Christian camp Indiana, Bear Lake Camp mission, camp values, camp staff"
```

### Performance Optimizations
- Lazy load team photos (below fold)
- Compress hero image (<200KB)
- Use intersection observer for section animations
- Defer non-critical CSS

### Accessibility
- Proper heading hierarchy (h1 → h2 → h3)
- Skip navigation links
- ARIA landmarks for each section
- Keyboard navigation for in-page links

---

## Consequences

### Positive
- Users experience cohesive "about" story
- Content editors maintain single source of truth
- Mobile users get seamless scroll experience
- Reduced navigation complexity

### Negative
- Cannot individually track page views per section (mitigated by scroll tracking analytics)
- Slightly longer initial page load (mitigated by lazy loading)

### Neutral
- SEO impact roughly equivalent (single strong page vs. multiple weak pages)

---

## Validation Metrics

**Success criteria** (measure 30 days post-launch):
- ✅ Time on /about page >2 minutes (indicates engagement with full content)
- ✅ Scroll depth >75% for majority of visitors
- ✅ Bounce rate <40%
- ✅ LCP <2.5s on mobile
- ✅ Zero accessibility violations (axe scan)

**Failure triggers** (would reconsider decision):
- ❌ Bounce rate >60%
- ❌ Scroll depth <30%
- ❌ Client feedback: "users can't find X content"

---

## Related Decisions

- **REQ-WEB-005**: Tradesmith font for headings (applies to all About sections)
- **Navigation structure**: About is top-level nav item (not dropdown)
- **Footer design**: Quick links to About sections in footer

---

## Notes

**Alternative considered**: Hybrid approach with `/about` overview and optional deep-dive pages. Rejected due to maintenance complexity.

**Client feedback required**: Final content order should be reviewed with BLC leadership before implementation.

**Migration note**: Original WordPress About page already follows single-page pattern, so migration is straightforward.

---

**Decision Maker Signatures**:
- Strategic Advisor: ✅ APPROVED (recommendation based on UX primacy)
- PM (Content Strategist): ✅ APPROVED (content narrative priority)
- UX Designer (Information Architect): ✅ APPROVED (mobile-first priority)

**Status**: Implementation ready. Proceed to Phase 2: Content Migration.
