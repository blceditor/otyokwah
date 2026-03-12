import { notFound } from "next/navigation";
import { reader, readRawPageContent } from "@/lib/keystatic-reader";
import { isValidSlug } from "@/lib/security/validate-slug";
import { isSafeImageUrl } from "@/lib/security/validate-url";
import Image from "next/image";
import { normalizeImagePath } from "@/lib/image-utils";
import { MarkdocRenderer } from "@/components/content/MarkdocRenderer";
import HeroVideo from "@/components/hero/HeroVideo";
import YouTubeHero from "@/components/hero/YouTubeHero";
import { getHeroHeightClass } from "@/lib/templates/shared";
import { getPublishedTestimonials } from "@/lib/testimonials";

// ISR: static by default, revalidated on-demand via webhook
export const revalidate = false;
export const fetchCache = 'default-no-store';

export default async function Home() {
  // P0-SEC-003: Validate slug before file system access
  const slug = "index";
  if (!isValidSlug(slug)) {
    notFound();
  }

  // REQ-PROD-004: Fetch all required data from CMS
  const page = await reader().collections.pages.read(slug);

  if (!page) {
    notFound();
  }

  // Normalize hero image path — Keystatic stores relative filenames in YAML
  const heroImage = page.hero.heroImage
    ? normalizeImagePath(page.hero.heroImage)
    : null;

  let bodyContent: string;
  try {
    bodyContent = await readRawPageContent(slug);
  } catch (error) {
    console.error(`[ISR] Failed to fetch content for ${slug}:`, error);
    throw error; // Let Next.js return 500; ISR serves stale via stale-while-revalidate
  }

  const heroHeightClass = getHeroHeightClass(page.hero.heroHeight || undefined);
  const testimonials = await getPublishedTestimonials();

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero section - YouTube > Video > Image */}
      {page.hero.heroYouTubeId ? (
        <YouTubeHero
          videoId={page.hero.heroYouTubeId}
          fallbackImage={heroImage || undefined}
          title={page.title}
          subtitle={page.hero.heroTagline || undefined}
        />
      ) : page.hero.heroVideo ? (
        <HeroVideo
          src={page.hero.heroVideo}
          poster={heroImage || undefined}
          title={page.title}
          subtitle={page.hero.heroTagline || undefined}
        />
      ) : heroImage && isSafeImageUrl(heroImage) ? (
        <header
          data-testid="hero-section"
          className={`relative w-full ${heroHeightClass} flex items-center justify-center text-center overflow-hidden`}
        >
          <Image
            src={heroImage}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div
            data-testid="hero-overlay"
            className="absolute inset-0 bg-black/40"
          />
          <div className="relative z-10 px-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-textured-hero">
              {page.title}
            </h1>
            {page.hero.heroTagline && (
              <p className="text-xl md:text-2xl lg:text-3xl font-semibold text-textured-hero">
                {page.hero.heroTagline}
              </p>
            )}
          </div>
        </header>
      ) : (
        <header className="sr-only">
          <h1>{page.title}</h1>
        </header>
      )}

      {/* Body Content rendered via Markdoc (includes TrustBar, Mission, Gallery, CTA, etc.) */}
      {bodyContent ? (
        <MarkdocRenderer content={bodyContent} testimonials={testimonials} />
      ) : (
        <div className="flex items-center justify-center py-20 bg-cream">
          <p className="text-lg text-bark/60">Content is being updated.</p>
        </div>
      )}
    </div>
  );
}
