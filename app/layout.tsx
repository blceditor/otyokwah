import type { Metadata } from "next";
import "./globals.css";
import { getSiteConfig } from "@/lib/config/site-config";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import DraftModeBanner from "../components/DraftModeBanner";
import ScrollAnimationsInit from "../components/ScrollAnimationsInit"; // REQ-Q2-007
import { Header } from "../components/navigation";
import { Footer } from "../components/footer"; // REQ-UI-003
import { getNavigation } from "../lib/keystatic/navigation"; // REQ-415
import { OrganizationJsonLd } from "../lib/seo/schemas/organization"; // REQ-SEO-002
import { Caveat } from "next/font/google";
import localFont from "next/font/local";
import { AdminNavStrip } from "../components/admin"; // REQ-ADMIN-001, REQ-ADMIN-002
import { VitalsReporter } from "../components/VitalsReporter";

const caveat = Caveat({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
});

const tradesmith = localFont({
  src: "../public/TradesmithStamp.woff",
  variable: "--font-tradesmith",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  return {
    title: `${config.siteName} - Where Faith Grows Wild`,
    description:
      "Christian summer camp for Jr. High and High School students. Faith. Adventure. Transformation.",
    openGraph: {
      title: config.siteName,
      description: "Where Faith Grows Wild",
      images: ["/og-image.jpg"],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [navigation, siteConfig] = await Promise.all([
    getNavigation(),
    getSiteConfig(),
  ]);

  return (
    <html lang="en" className={`${caveat.variable} ${tradesmith.variable}`}>
      {/* GA4 script injected via middleware.ts for Google tag verification compatibility */}
      <head />
      <body className="font-sans text-[1.125rem] leading-relaxed text-bark bg-cream">
        <OrganizationJsonLd config={siteConfig} />
        {/* REQ-ADMIN-001, REQ-ADMIN-002: Admin nav strip checks auth client-side */}
        <AdminNavStrip />
        <a href="#main-content" className="skip-link sr-only focus:not-sr-only">
          Skip to main content
        </a>
        <Header navigation={navigation} />
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
        <Footer config={siteConfig} />
        <DraftModeBanner />
        <Analytics />
        <SpeedInsights />
        <VitalsReporter />
        <ScrollAnimationsInit />{" "}
        {/* REQ-Q2-007: Initialize scroll animations */}
      </body>
    </html>
  );
}
