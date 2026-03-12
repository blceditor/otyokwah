# Requirements Lock - Phase 5: Other Pages

> **Snapshot Date**: 2025-12-12
> **Source**: requirements/current.md
> **Phase**: Phase 5 - Other Pages (9.5 SP)

---

## REQ-OP001: Rentals Gallery (1 SP)

**Description**: Add gallery component to rentals page

**Acceptance Criteria**:
- Gallery component added to rentals.mdoc page
- Displays facility images in grid layout
- Uses existing ImageGallery component
- Responsive across mobile/tablet/desktop
- Images show rental facilities (placeholder images acceptable)

**Non-Goals**: Custom gallery implementation (reuse existing component)

---

## REQ-OP002: Give Page Styling (3 SP)

**Description**: Fix wall-of-text, add card sections with design language matching other pages

**Acceptance Criteria**:
- Give page uses SectionCard or ContentCard components
- Content broken into logical visual sections
- Matches design language from Summer Camp and Work at Camp pages
- Card-based layout with proper spacing
- Responsive design across all viewports
- Visual hierarchy with headings and spacing

**Non-Goals**: Change donation amounts or content text

---

## REQ-OP003: Give Page Wishlist Links (0.5 SP)

**Description**: Add Walmart and Amazon wishlist links to Give page

**Acceptance Criteria**:
- Walmart wishlist link added (placeholder URL acceptable)
- Amazon wishlist link added (placeholder URL acceptable)
- Links open in new tab
- Clear visual CTAs for each wishlist
- Located in appropriate section on Give page

**Content Dependency**: Waiting on Ben for actual URLs, use placeholders

---

## REQ-OP004: DonorBox Integration (2 SP)

**Description**: Integrate DonorBox donation widget/embed on Give page

**Acceptance Criteria**:
- DonorBox embed integrated at URL: https://donorbox.org/donate-to-blc
- Widget displays correctly on desktop and mobile
- Either iframe embed or DonorBox script integration
- Positioned prominently on Give page
- Fallback link if script fails to load
- No console errors from integration

**Non-Goals**: Custom donation processing (use DonorBox)

---

## REQ-OP005: Contact Form Captcha (3 SP)

**Description**: Cloudflare Turnstile integration with silent invalid email handling

**Acceptance Criteria**:
- Cloudflare Turnstile captcha integrated
- Captcha validates before form submission
- Form submits to edge function or API endpoint
- Silent handling of invalid email addresses (no user-facing error, but logged)
- Security-focused implementation (no PII leakage)
- Accessible captcha implementation
- Works on mobile and desktop
- Edge function validates turnstile token server-side

**Security Requirements**:
- No secrets in client code
- Server-side turnstile validation
- Rate limiting on submission endpoint
- Input sanitization for all form fields
- CSRF protection

**Non-Goals**: Email service integration (focus on captcha and validation)

---

## Story Point Summary

| REQ-ID | Description | Story Points |
|--------|-------------|--------------|
| REQ-OP001 | Rentals Gallery | 1 SP |
| REQ-OP002 | Give Page Styling | 3 SP |
| REQ-OP003 | Give Page Wishlist Links | 0.5 SP |
| REQ-OP004 | DonorBox Integration | 2 SP |
| REQ-OP005 | Contact Form Captcha | 3 SP |
| **TOTAL** | **Phase 5** | **9.5 SP** |

---

## Dependencies

- REQ-OP001: Existing ImageGallery component
- REQ-OP002: Existing SectionCard/ContentCard components
- REQ-OP003: Content from Ben (use placeholders)
- REQ-OP004: DonorBox account and embed URL
- REQ-OP005: Cloudflare Turnstile account (site key and secret key)

---

## Build Order

1. REQ-OP001 (low complexity, no dependencies)
2. REQ-OP003 (quick win, no dependencies)
3. REQ-OP002 (medium complexity, component reuse)
4. REQ-OP004 (third-party integration)
5. REQ-OP005 (highest complexity, security requirements)
