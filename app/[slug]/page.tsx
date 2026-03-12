import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { reader, readRawPageContent } from "@/lib/keystatic-reader";
import { isValidSlug } from "@/lib/security/validate-slug";
import { renderPageContent } from "@/lib/templates/page-renderer";
import type { PageData } from "@/lib/templates/page-renderer";

// ISR: pages are static by default, revalidated on-demand via webhook
// fetchCache = 'default-no-store' ensures fresh GitHub data on each ISR re-render
// while the Full Route Cache still serves cached HTML from CDN
export const revalidate = false;
export const fetchCache = 'default-no-store';

// dynamicParams = false: Next.js auto-returns 404 for slugs not in generateStaticParams
// without running the page component — avoids Next.js 14 Vercel bug where notFound()
// during on-demand ISR returns 500 instead of 404.
// Tradeoff: new CMS pages require a rebuild/deploy to become accessible.
export const dynamicParams = false;

export async function generateStaticParams() {
  const pages = await reader().collections.pages.list();
  return pages
    .filter((slug) => slug !== 'index')
    .map((slug) => ({ slug }));
}

// REQ-102: Generate metadata from Keystatic SEO fields
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  try {
    const page = await reader().collections.pages.read(params.slug);

    if (!page) {
      return {
        title: "Page Not Found",
        description: "The requested page could not be found.",
      };
    }

    const metaTitle = page.seo?.metaTitle || page.title;
    const metaDescription = page.seo?.metaDescription || "";
    const ogTitle = page.seo?.ogTitle || metaTitle;
    const ogDescription = page.seo?.ogDescription || metaDescription;
    const ogImage = page.seo?.ogImage;

    return {
      title: metaTitle,
      description: metaDescription,
      openGraph: {
        title: ogTitle,
        description: ogDescription,
        ...(ogImage && {
          images: [
            {
              url: ogImage,
              width: 1200,
              height: 630,
              alt: ogTitle,
            },
          ],
        }),
      },
      twitter: {
        title: ogTitle,
        description: ogDescription,
        ...(ogImage && {
          images: [ogImage],
        }),
      },
      robots: {
        index: !page.seo?.noIndex,
        follow: !page.seo?.noIndex,
        googleBot: {
          index: !page.seo?.noIndex,
          follow: !page.seo?.noIndex,
        },
      },
    };
  } catch (error) {
    console.error(`[ISR] Failed to generate metadata for ${params.slug}:`, error);
    return {
      title: "Page Not Found",
      description: "The requested page could not be found.",
    };
  }
}

export default async function Page({ params }: { params: { slug: string } }) {
  if (!isValidSlug(params.slug)) {
    notFound();
  }

  let page;
  try {
    page = await reader().collections.pages.read(params.slug);
  } catch {
    notFound();
  }
  if (!page || !page.title || !page.templateFields) {
    notFound();
  }

  try {
    const bodyContent = await readRawPageContent(params.slug);
    return renderPageContent(page as PageData, bodyContent);
  } catch (error) {
    console.error(`[ISR] Failed to fetch content for ${params.slug}:`, error);
    throw error; // Let Next.js return 500; ISR serves stale via stale-while-revalidate
  }
}
