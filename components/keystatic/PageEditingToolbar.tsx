/**
 * REQ-CMS-001, REQ-CMS-012, REQ-FUTURE-017: Page Editing Toolbar
 *
 * Provides modal dialogs for page editing tools.
 * UI buttons moved to KeystaticToolsHeader for better UX.
 *
 * Exposes:
 * - SEOGenerationPanel modal
 * - LinkValidator modal
 *
 * Note: The floating toolbar UI has been moved to the top navigation
 * for a cleaner editing experience.
 */
"use client";

import { useState, useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";
import { SEOGenerationPanel } from "./SEOGenerationPanel";
import { LinkValidator } from "./LinkValidator";
import { usePageContent } from "@/lib/hooks/usePageContent";
import type { SEOData } from "@/lib/types/seo";

function extractPageInfo(
  pathname: string,
): { slug: string } | null {
  const normalizedPath = pathname.replace(/\/+$/, "");
  // Keystatic routes include branch name: /keystatic/branch/{branch}/collection/pages/item/{slug}
  // Also handle legacy routes without branch: /keystatic/collection/pages/item/{slug}
  const match = normalizedPath.match(
    /\/keystatic\/(?:branch\/[^/]+\/)?collection\/pages\/(?:item\/)?([^/]+)/
  );

  if (!match) return null;

  const slug = match[1].replace(/^\/+|\/+$/g, "");
  return {
    slug,
  };
}

export function PageEditingToolbar() {
  const pathname = usePathname();
  const pageInfo = pathname ? extractPageInfo(pathname) : null;
  const [showSEOPanel, setShowSEOPanel] = useState(false);
  const [showLinkValidator, setShowLinkValidator] = useState(false);

  // Get page content for SEO generation and link validation
  const pageContent = usePageContent(pageInfo?.slug || "");

  // Handle SEO generation result (panel auto-applies, this is optional callback)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSEOGenerated = useCallback((_seoData: SEOData) => {
    // Panel now handles auto-apply and auto-close
    // This callback is optional for any additional handling needed
  }, []);

  // Listen for custom events from header to trigger modals
  useEffect(() => {
    const handleShowSEOPanel = () => setShowSEOPanel(true);
    const handleShowLinkValidator = () => setShowLinkValidator(true);

    window.addEventListener('show-seo-panel', handleShowSEOPanel);
    window.addEventListener('show-link-validator', handleShowLinkValidator);

    return () => {
      window.removeEventListener('show-seo-panel', handleShowSEOPanel);
      window.removeEventListener('show-link-validator', handleShowLinkValidator);
    };
  }, []);

  return (
    <>
      {/* SEO Generation Panel - REQ-CMS-020: Auto-start generation (page-specific) */}
      {pageInfo && showSEOPanel && (
        <SEOGenerationPanel
          pageContent={pageContent}
          onClose={() => setShowSEOPanel(false)}
          onGenerated={handleSEOGenerated}
          autoStart={true}
        />
      )}

      {/* REQ-FUTURE-017: Site-wide Link Validator Modal */}
      {showLinkValidator && (
        <LinkValidator
          onClose={() => setShowLinkValidator(false)}
        />
      )}
    </>
  );
}

export default PageEditingToolbar;
