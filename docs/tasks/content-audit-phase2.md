# REQ-CONTENT-002: Content Audit & Text Verbatim Migration

**Status**: In Progress
**Story Points**: 5 SP
**Priority**: High

## Objective

Review original WordPress content and update all mdoc files to match original text verbatim.

## Data Sources

1. **SQL Dump**: `/bearlakecamp-original/bearlakecamp_com.sql`
2. **XML Export**: `/bearlakecamp-original/bearlakecamp.WordPress.2025-10-31.xml`
3. **Current Site**: prelaunch.bearlakecamp.com
4. **Mdoc Files**: `/content/pages/*.mdoc`

## Process

### Phase 1: Extract Original Content (0.5 SP)
- [ ] Parse XML export to extract all pages/posts
- [ ] Extract post titles, content, slugs
- [ ] Create mapping: original slug → current mdoc file

### Phase 2: Content Comparison (1 SP)
- [ ] Compare each current mdoc with original WordPress content
- [ ] Identify differences in:
  - Headings
  - Body text
  - Bullet points
  - Links
  - Images
- [ ] Document discrepancies

### Phase 3: Verbatim Migration (2 SP)
- [ ] Update mdoc files with original text
- [ ] Preserve frontmatter (title, heroImage, seo)
- [ ] Update content section only
- [ ] Verify links still valid
- [ ] Document 404s

### Phase 4: Verification (1 SP)
- [ ] Spot-check 5 representative pages
- [ ] Run link validation
- [ ] Visual regression test
- [ ] Integration test: all pages render

### Phase 5: Documentation (0.5 SP)
- [ ] Create content mapping document
- [ ] Document all link changes
- [ ] List 404s for future resolution
- [ ] Update SEO metadata if improved

## Current Mdoc Files (24 total)

1. index.mdoc (Homepage)
2. about.mdoc
3. summer-camp.mdoc
4. summer-camp-senior-high.mdoc
5. summer-camp-junior-high.mdoc
6. summer-camp-what-to-bring.mdoc
7. summer-camp-faq.mdoc
8. work-at-camp.mdoc
9. work-at-camp-counselors.mdoc
10. work-at-camp-kitchen-staff.mdoc
11. work-at-camp-year-round.mdoc
12. summer-staff.mdoc
13. retreats.mdoc
14. retreats-youth-groups.mdoc
15. retreats-adult-retreats.mdoc
16. retreats-rentals.mdoc
17. facilities.mdoc
18. facilities-chapel.mdoc
19. facilities-dining-hall.mdoc
20. facilities-cabins.mdoc
21. facilities-rec-center.mdoc
22. facilities-outdoor.mdoc
23. give.mdoc
24. contact.mdoc

## Test Strategy

### Automated Tests

```typescript
// tests/integration/content-migration.spec.ts
describe('REQ-CONTENT-002: Content Migration', () => {
  it('should have all original pages migrated', async ({ page }) => {
    // Test that all expected pages exist
  });

  it('should have no broken internal links', async ({ page }) => {
    // Link validation
  });

  it('should preserve SEO metadata', async ({ page }) => {
    // Verify meta tags
  });
});
```

### Manual Review Checklist

- [ ] Homepage text matches original
- [ ] All program pages accurate
- [ ] Staff pages complete
- [ ] Retreats information current
- [ ] Facilities descriptions correct
- [ ] Contact information accurate

## Risks

1. **Data Loss**: Original content may be lost in migration
   - Mitigation: Git backup before changes
2. **Link Rot**: Some links may no longer be valid
   - Mitigation: Document 404s, update where possible
3. **SEO Impact**: Changing content may affect rankings
   - Mitigation: Preserve meta descriptions and titles

## Dependencies

- Original WordPress export files must be accessible
- Current mdoc files must be backed up via git

## Completion Criteria

- [ ] All 24 mdoc files reviewed
- [ ] Original text migrated verbatim where appropriate
- [ ] Content mapping document created
- [ ] Link validation complete
- [ ] All tests pass
- [ ] No regression in SEO metadata

## Notes

This task requires human review and judgment to:
1. Determine which original content is still relevant
2. Decide if new content is better than original
3. Validate that links and references are still accurate
4. Ensure voice and tone are consistent

**Recommendation**: Execute as separate, focused task with dedicated content review session.
