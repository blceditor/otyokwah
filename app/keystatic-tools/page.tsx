// REQ-TOOLS-001: /keystatic-tools Page Component
// REQ-TOOLS-003: Component Integration
//
// This page renders CMS tools for content editors using Keystatic.
// Components organized into semantic sections for accessibility and usability.

"use client";

import ProductionLink from "@/components/keystatic/ProductionLink";
import DeploymentStatus from "@/components/keystatic/DeploymentStatus";
import BugReportModal from "@/components/keystatic/BugReportModal";
import SparkryBranding from "@/components/keystatic/SparkryBranding";
import GenerateSEOButton from "@/components/keystatic/GenerateSEOButton";

export default function KeystaticToolsPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">Keystatic CMS</h1>
      <p className="text-gray-600 mb-8">
        Utilities for managing content and deployments.
      </p>

      <section className="mb-8" aria-labelledby="production-heading">
        <h2 id="production-heading" className="text-2xl font-semibold mb-4">
          Production & Deployment
        </h2>
        <div className="space-y-4">
          <ProductionLink />
          <DeploymentStatus />
        </div>
      </section>

      <section className="mb-8" aria-labelledby="content-heading">
        <h2 id="content-heading" className="text-2xl font-semibold mb-4">
          SEO Generation
        </h2>
        <GenerateSEOButton
          pageContent={{
            title: "CMS Tools",
            body: "Utility tools for content management",
          }}
          onSEOGenerated={() => {
            // SEO data handled by GenerateSEOButton component
          }}
        />
      </section>

      <section aria-labelledby="support-heading">
        <h2 id="support-heading" className="text-2xl font-semibold mb-4">
          Support
        </h2>
        <div className="space-y-4">
          <BugReportModal pageContext={{ slug: "keystatic-tools" }} />
          <SparkryBranding />
        </div>
      </section>
    </div>
  );
}
