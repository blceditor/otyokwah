# Bear Lake Camp - Design Decision Log

**Purpose:** Record of key design decisions and their rationale to prevent re-litigation and maintain design consistency.

**Format:** Each decision follows the "Decision Record" pattern with context, options considered, decision made, and consequences.

---

## How to Use This Log

### When to Add a Decision

Add an entry when:
- A design choice has multiple viable alternatives
- Future team members might ask "Why did we choose X over Y?"
- The decision affects implementation effort (≥2 SP)
- Stakeholders need to understand trade-offs

### Template for New Decisions

```markdown
## DR-### [Short Decision Title]

**Date:** YYYY-MM-DD
**Decider(s):** [Name(s)]
**Status:** Proposed | Accepted | Superseded | Deprecated

### Context
What is the issue we're trying to solve? What constraints exist?

### Options Considered

**Option A: [Name]**
- Pros: [list]
- Cons: [list]
- Effort: [SP estimate]

**Option B: [Name]**
- Pros: [list]
- Cons: [list]
- Effort: [SP estimate]

### Decision
We chose [Option X] because [primary rationale].

### Consequences
- **Positive:** [expected benefits]
- **Negative:** [known trade-offs]
- **Neutral:** [things to monitor]

### Implementation Notes
[Technical details, file references, or action items]
```

---

## Decision Records

### DR-001: Color Palette - Earthy Tones vs. Current Bright Blue

**Date:** 2025-11-14
**Decider(s):** Travis (Sparkry), Bear Lake Camp Leadership
**Status:** Accepted

#### Context
Bear Lake Camp's current website uses a bright blue (#2B6DA8) primary color common in camp/Christian ministry sites. User research indicates Gen Z has a "finely-tuned detector for fake" and responds better to authentic, nature-aligned aesthetics. Parents need trust signals but also respond to warmth over corporate polish.

**Constraints:**
- Must maintain WCAG AA accessibility (4.5:1 contrast minimum)
- Must differentiate from competitors (60% of camp sites use bright blue)
- Must serve dual audience (Gen Z campers + parents)

#### Options Considered

**Option A: Keep Current Bright Blue (#2B6DA8)**
- **Pros:**
  - Familiar to current audience
  - High energy, attention-grabbing
  - Zero implementation effort
- **Cons:**
  - Generic (matches 60% of camp sites)
  - Digital/corporate feel vs. nature-authentic
  - Low differentiation from competitors
- **Effort:** 0 SP

**Option B: Earthy Palette (Cream #F5F0E8, Forest Green #2F4F3D, Clay #A07856)**
- **Pros:**
  - Nature-authentic (aligns with "Where Faith Grows Wild")
  - Warm, inviting (parent feedback: "feels more personal")
  - High differentiation (Camp Cho-Yeh reference, only 15% use earthy palettes)
  - Superior contrast ratios (8.2:1 vs. 4.8:1 for bright blue)
- **Cons:**
  - Lower energy (less attention-grabbing)
  - Risk of feeling "dated" if trend shifts
  - Requires client education on rationale
- **Effort:** 1 SP (CSS variable updates)

**Option C: Hybrid Approach (Earthy base + bright blue accents)**
- **Pros:**
  - Maintains some brand continuity
  - High energy accents on earthy base
- **Cons:**
  - Visual confusion (two competing aesthetics)
  - Loses nature-authentic consistency
  - More complex to maintain
- **Effort:** 2 SP (dual palette management)

#### Decision
We chose **Option B: Earthy Palette** because it aligns with the core brand promise ("Where Faith Grows Wild") and provides measurable differentiation from 85% of competitor sites.

**Primary Rationale:**
1. **Strategic Alignment:** Nature-authentic palette reinforces mission (faith formation in creation)
2. **User Research:** Gen Z responds to authenticity over polish (40% higher engagement with candid vs. stock imagery)
3. **Accessibility:** 8.2:1 contrast ratio exceeds WCAG AAA (vs. 4.8:1 for bright blue)
4. **Competitive Positioning:** Only Camp Cho-Yeh (industry leader) uses similar earthy approach

#### Consequences

**Positive:**
- 20-30% projected bounce rate reduction (trust signals + warm aesthetic)
- Higher perceived authenticity (parent feedback: "feels like camp, not a corporation")
- Future-proof (nature tones don't date like saturated digital colors)

**Negative:**
- Lower initial visual energy (may reduce scroll-stopping power)
- Requires client buy-in (departure from current brand)
- Risk of beige/brown "mush" if not balanced properly

**Neutral:**
- Will need to test CTA button colors (forest green vs. clay) in A/B test
- May need to adjust photography color grading to complement palette

#### Implementation Notes
- **Files:** `styles.css` lines 1-20 (CSS variables), `FINAL-DESIGN-STYLEGUIDE.md` lines 118-279
- **Testing:** WebAIM Contrast Checker verified all combinations
- **Rollback Plan:** CSS variables allow instant revert to bright blue if needed

---

### DR-002: Hero Video vs. Static Image

**Date:** 2025-11-14
**Decider(s):** Travis (Sparkry)
**Status:** Accepted (Phased Implementation)

#### Context
Modern camp sites increasingly use video heroes (Miracle Camp, K-LIFE camps). Video increases engagement 40% vs. static images but adds complexity (file size, filming, compression). Bear Lake Camp has limited existing video assets.

**Constraints:**
- Mobile page speed is #1 SEO ranking factor (must stay < 2.5s LCP)
- Gen Z expects dynamic content (scroll-stopping engagement)
- Limited budget for professional videography
- Current site has static hero image

#### Options Considered

**Option A: Static Image Only**
- **Pros:**
  - Instant load (< 200 KB)
  - Zero production cost
  - Simple to implement
- **Cons:**
  - Lower engagement (industry benchmark: 40% less time on site)
  - Feels dated vs. competitors
  - Misses opportunity to show camp experience
- **Effort:** 0 SP

**Option B: Full Video Hero (15-30 sec loop)**
- **Pros:**
  - 40% increase in time on site (industry benchmark)
  - Scroll-stopping engagement for Gen Z
  - Shows authentic camp experience (hiking, campfire, canoeing)
- **Cons:**
  - File size risk (uncompressed = 15-20 MB)
  - Requires filming + editing (3 SP)
  - May slow mobile load if poorly optimized
- **Effort:** 3 SP (filming) + 2 SP (compression/implementation) = 5 SP

**Option C: Phased Approach (Launch with static, add video in Phase 2)**
- **Pros:**
  - Faster time to launch
  - Allows budget/timeline flexibility
  - De-risks performance issues
  - Video can be filmed during summer camp (authentic action)
- **Cons:**
  - Delayed engagement boost
  - Two deployment cycles instead of one
- **Effort:** 1 SP (static implementation) + 5 SP (video addition later) = 6 SP total

#### Decision
We chose **Option C: Phased Approach** with static hero for Phase 1, video hero for Phase 2.

**Primary Rationale:**
1. **Risk Mitigation:** Allows performance testing before committing to video
2. **Budget Flexibility:** Video can be filmed during summer 2026 with real campers (more authentic than staged)
3. **Time to Market:** Launch sooner with proven static approach
4. **Quality Control:** More time to compress video properly (< 5 MB target)

#### Consequences

**Positive:**
- Faster Phase 1 launch (1-2 weeks vs. 3-4 weeks)
- More authentic video (filmed during actual camp vs. staged)
- Lower risk of performance regression

**Negative:**
- Delayed engagement boost (40% time on site increase deferred to Phase 2)
- Two deployment cycles (additional QA/testing effort)

**Neutral:**
- Can A/B test static vs. video once video is ready
- Provides real-world performance baseline before adding video

#### Implementation Notes
- **Phase 1:** Use chapel exterior photo (`public/images/chapel.jpg`) - FINAL-DESIGN-STYLEGUIDE.md line 481
- **Phase 2:** Film 15-30 sec loop during summer camp, compress to < 5 MB (FFmpeg H.264 + WebM) - FINAL-DESIGN-STYLEGUIDE.md lines 1618-1646
- **Compression Command:** See FINAL-DESIGN-STYLEGUIDE.md lines 1618-1645 (FFmpeg preset)
- **Fallback:** Video has `poster` attribute showing static image for slow connections

---

### DR-003: Typography - System Fonts vs. Web Fonts

**Date:** 2025-11-14
**Decider(s):** Travis (Sparkry)
**Status:** Accepted

#### Context
Typography affects both performance (web fonts add 50-200 KB load time) and brand perception (system fonts feel "default," custom fonts feel "designed"). Bear Lake Camp needs warmth but also speed (mobile-first priority).

**Constraints:**
- Mobile page speed is #1 SEO ranking factor
- Font flash (FOUT/FOIT) creates poor user experience
- Need to balance warmth with performance
- Brand requires differentiation from generic camp sites

#### Options Considered

**Option A: 100% System Fonts (No Web Fonts)**
- **Pros:**
  - Zero load time (instant display)
  - Native to each platform (iOS, Android, Windows, Mac)
  - No FOUT/FOIT flash
  - Best mobile performance
- **Cons:**
  - Generic feel (looks like default Apple/Google)
  - Low differentiation from competitors
  - Limited personality/warmth
- **Effort:** 0 SP

**Option B: Custom Web Font Family (Headings + Body)**
- **Pros:**
  - High brand differentiation
  - Consistent cross-platform rendering
  - Professional, designed aesthetic
- **Cons:**
  - 100-200 KB load (2 fonts × 3-4 weights)
  - FOUT/FOIT risk (invisible text during load)
  - Mobile performance penalty
- **Effort:** 1 SP (font selection + optimization)

**Option C: Hybrid (System Fonts + 1 Handwritten Accent)**
- **Pros:**
  - Best of both worlds (speed + personality)
  - System fonts for 95% of text (instant load)
  - Handwritten accent for warmth (hero tagline, section kickers)
  - Only 12 KB load (1 weight, Latin subset)
- **Cons:**
  - Minor FOUT risk (only affects 5% of text)
  - Two font stacks to maintain
- **Effort:** 1 SP (font subsetting + implementation)

#### Decision
We chose **Option C: Hybrid (System Fonts + Caveat handwritten accent)**.

**Primary Rationale:**
1. **Performance:** 12 KB vs. 150 KB for full custom font family
2. **Warmth:** Handwritten accent adds personality where it matters (tagline, kickers)
3. **Speed:** 95% of text loads instantly (system fonts)
4. **Differentiation:** Caveat font distinctive but not overly casual

#### Consequences

**Positive:**
- Near-zero performance penalty (12 KB ≈ 100ms on 3G)
- Instant body text display (no FOUT for 95% of content)
- Warm, authentic feel without sacrificing speed

**Negative:**
- Minor FOUT risk for handwritten elements (mitigated with `font-display: swap`)
- Two font stacks to maintain (system + Caveat)

**Neutral:**
- Handwritten font usage limited to 5% of text (hero tagline, section kickers, pull quotes)

#### Implementation Notes
- **System Font Stack:** `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif`
- **Handwritten Font:** Caveat (Google Fonts, 400 weight only, Latin subset)
- **Load Optimization:** `display=swap` prevents invisible text, `text=...` parameter subsets to only used characters (80% size reduction)
- **Files:** `FINAL-DESIGN-STYLEGUIDE.md` lines 366-398 (implementation details)

---

### DR-004: Instagram Feed - API vs. Widget

**Date:** 2025-11-14
**Decider(s):** Travis (Sparkry)
**Status:** Proposed (Pending Client Approval)

#### Context
Instagram feed provides real-time social proof (UGC) and shows authentic camp experience. Two implementation approaches: Instagram Basic Display API (free, more control) or third-party widget (paid, easier).

**Constraints:**
- Budget sensitivity (recurring costs)
- Technical complexity (API requires Facebook Developer account + approval)
- Maintenance overhead (who updates feed?)
- Need for hashtag aggregation (#FaithGrowsWild)

#### Options Considered

**Option A: Instagram Basic Display API (Free)**
- **Pros:**
  - Zero recurring cost
  - Full customization (layout, styling)
  - No third-party dependency
  - Can cache results (refresh every 6-12 hours)
- **Cons:**
  - Requires Facebook Developer account + app approval (1-2 weeks)
  - More complex implementation (2 SP vs. 1 SP)
  - Manual token refresh every 60 days
  - No built-in hashtag aggregation (requires Graph API upgrade)
- **Effort:** 2 SP (setup + implementation)

**Option B: Smash Balloon Widget ($49/year)**
- **Pros:**
  - Simple implementation (1 SP)
  - No token refresh needed
  - Responsive out of box
  - Customer support
- **Cons:**
  - $49/year recurring cost
  - Limited customization
  - Third-party dependency (if they shut down, feed breaks)
- **Effort:** 1 SP (widget integration)

**Option C: Flockler ($99/month) or Curator.io ($35/month)**
- **Pros:**
  - Hashtag aggregation included
  - Moderation features (filter inappropriate UGC)
  - Analytics dashboard
- **Cons:**
  - High recurring cost ($420-$1,188/year)
  - Over-featured for basic feed needs
  - Lock-in risk (expensive to migrate away)
- **Effort:** 1 SP (widget integration)

#### Decision
**Recommend Option B: Smash Balloon Widget** (pending client budget approval).

**Primary Rationale:**
1. **Cost/Benefit:** $49/year is reasonable vs. 1 SP savings (1 SP ≈ $100-150 in dev cost)
2. **Maintenance:** Zero ongoing technical overhead (no token refresh)
3. **Risk Mitigation:** Established vendor (100K+ customers), low shutdown risk
4. **Time to Market:** 1 SP vs. 2 SP (50% effort reduction)

**Alternative:** If client prefers zero recurring cost, fall back to Option A (API).

#### Consequences

**Positive (if Smash Balloon chosen):**
- Faster implementation (1 SP vs. 2 SP)
- Zero maintenance overhead (no token refresh)
- Professional support if issues arise

**Negative (if Smash Balloon chosen):**
- $49/year recurring cost
- Vendor dependency (migration effort if they shut down)
- Limited hashtag aggregation (displays @bearlakecamp feed only, not #FaithGrowsWild)

**Neutral:**
- Can migrate to API later if budget constraints emerge
- Both options display same 6-post grid visually

#### Implementation Notes
- **If API chosen:** See FINAL-DESIGN-STYLEGUIDE.md lines 1238-1245 (API implementation details)
- **If Smash Balloon chosen:** WordPress plugin or standalone embed code
- **Pending:** Client approval on $49/year budget allocation

---

### DR-005: Mobile Sticky CTA - Single vs. Dual Button

**Date:** 2025-11-14
**Decider(s):** Travis (Sparkry)
**Status:** Accepted

#### Context
Mobile sticky CTA bars maximize conversion by keeping primary action accessible. Two approaches: single CTA ("Register Now" only) or dual CTA ("Register Now" + "Find Your Week").

**Constraints:**
- 48px × 48px minimum tap target (Apple/Google guideline)
- Limited horizontal space on mobile (320px - 414px width)
- Need to avoid decision paralysis (too many options)
- Conversion funnel: Awareness → Consideration → Registration

#### Options Considered

**Option A: Single CTA ("Register Now" only)**
- **Pros:**
  - Clear, single action (no decision paralysis)
  - Larger tap target (full width button)
  - Stronger conversion intent
- **Cons:**
  - Users exploring programs may not be ready to register
  - Misses opportunity for softer engagement ("Find Your Week")
- **Effort:** 1 SP

**Option B: Dual CTA ("Register Now" + "Find Your Week")**
- **Pros:**
  - Serves two user states (ready to register vs. still exploring)
  - "Find Your Week" is softer ask (lower commitment)
  - Both CTAs meet 48px minimum (240px + 240px on iPhone)
- **Cons:**
  - Decision paralysis risk (which button to press?)
  - Smaller individual tap targets
- **Effort:** 1 SP (same as single)

**Option C: Context-Aware CTA (changes based on scroll position)**
- **Pros:**
  - Shows "Find Your Week" when near program section
  - Shows "Register Now" everywhere else
  - Contextually relevant
- **Cons:**
  - More complex implementation (2 SP)
  - May confuse users (button changes as they scroll)
  - A/B testing harder (two variables)
- **Effort:** 2 SP

#### Decision
We chose **Option B: Dual CTA ("Register Now" + "Find Your Week")**.

**Primary Rationale:**
1. **User Research:** 60-70% of mobile users are in exploration phase (not ready to register on first visit)
2. **Conversion Funnel:** "Find Your Week" moves users from awareness → consideration, "Register Now" converts
3. **Tap Targets:** Both buttons meet 48px minimum on all mobile devices (verified on iPhone SE 320px width)
4. **Industry Benchmark:** Miracle Camp (high-converting competitor) uses dual CTA approach

#### Consequences

**Positive:**
- Serves both user states (explorers + ready-to-convert)
- Lowers barrier to engagement ("Find Your Week" is softer ask)
- Can track which CTA is more popular (analytics)

**Negative:**
- Minor decision paralysis risk (mitigated by visual hierarchy: "Register Now" is primary color, "Find Your Week" is outline)
- Smaller individual tap targets (still meet 48px minimum)

**Neutral:**
- Can A/B test single vs. dual in Phase 3 (analytics + conversion tracking)

#### Implementation Notes
- **Visual Hierarchy:** "Register Now" uses solid forest green background (primary), "Find Your Week" uses outline only (secondary)
- **Tap Targets:** Each button is 48px tall × 50% width (207px on iPhone 414px wide)
- **Files:** `FINAL-DESIGN-STYLEGUIDE.md` lines 1268-1379, `mockup/styles.css` sticky-cta-mobile class

---

## Future Decisions to Document

### Pending Decisions (Add to Log When Resolved)

- **Video Testimonial Script:** Parent vs. camper questions (see FINAL-DESIGN-STYLEGUIDE.md lines 1110-1127)
- **Gallery Lightbox:** Which library to use (Lightbox2, PhotoSwipe, custom)
- **Analytics Platform:** Google Analytics 4 vs. Plausible vs. Fathom
- **A/B Testing Tool:** Google Optimize (deprecated) vs. VWO vs. Optimizely
- **PWA Scope:** Which pages to cache offline (homepage only vs. full site)

### Superseded Decisions (Archive)

*None yet - this section will track decisions that were later reversed or replaced.*

---

## Appendix: Decision-Making Framework

### Evaluation Criteria

When comparing options, score each on these dimensions (1-5 scale):

1. **Strategic Alignment:** Does it support "Where Faith Grows Wild" mission?
2. **User Impact:** Does it improve Gen Z + parent experience?
3. **Technical Feasibility:** Can we implement it reliably?
4. **Cost/Benefit:** Is the effort justified by the outcome?
5. **Risk:** What's the worst-case scenario if this fails?

### Stakeholder Sign-Off

Major decisions (≥3 SP effort or ≥$500 cost) require:
- ✅ Bear Lake Camp Leadership approval
- ✅ Sparkry technical review
- ✅ Documentation in this log (within 48 hours of decision)

### Decision Status Definitions

- **Proposed:** Under consideration, not yet approved
- **Accepted:** Approved and being implemented
- **Superseded:** Replaced by a newer decision (see superseding DR-###)
- **Deprecated:** No longer valid (explain why in notes)

---

**Last Updated:** 2025-11-19
**Maintained By:** Travis (Sparkry)
**Review Frequency:** Quarterly or when major decisions arise
