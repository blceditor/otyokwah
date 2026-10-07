| Date (UTC) | Test File | Test Name | REQ-ID | Bug | Fix SP | Commit |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-10-07 | lib/keystatic/cms-pipeline-validation.spec.ts | all internal navigation links point to existing pages | REQ-OTY-CONTENT-001 | Trailing whitespace prevents the BOLD link resolving | 0.1 | This PR |
| 2026-10-07 | lib/keystatic/content-schema-validation.spec.ts | hero images in pages reference existing files | REQ-OTY-CONTENT-002 | Three rental hero images reference deleted exterior assets | 0.1 | This PR |
| 2026-10-07 | tests/integration/content-integrity.spec.ts | all hero images referenced in .mdoc files exist in public/images/ | REQ-OTY-CONTENT-002 | Rental hero references fail the content integrity check | 0.1 | This PR |
| 2026-10-07 | components/keystatic/BugReportModal.spec.tsx | captures current page slug; captures browser info (userAgent) | REQ-006 | Awaited typing inside waitFor exceeds its deadline under load; await input discovery and typing separately | 0.2 | This PR |
