import type { ReactElement } from "react";
import Image from "next/image";
import { MarkdocRenderer } from "@/components/content/MarkdocRenderer";
import { FullBleedTemplate } from "@/components/templates/FullBleedTemplate";
import { isSafeImageUrl } from "@/lib/security/validate-url";
import { normalizeImagePath } from "@/lib/image-utils";
import HeroVideo from "@/components/hero/HeroVideo";
import YouTubeHero from "@/components/hero/YouTubeHero";
import { getHeroHeightClass } from "@/lib/templates/shared";
import { getPublishedTestimonials } from "@/lib/testimonials";
import type { TestimonialData } from "@/components/content/TestimonialWidget";
import { fetchUltraCampSessions } from "@/lib/ultracamp/sessions";
import type { UltraCampSession } from "@/lib/ultracamp/sessions";

interface HeroFields {
  heroImage: string | null;
  heroVideo: string | null;
  heroYouTubeId?: string | null;
  heroTagline: string | null;
  heroHeight?: string | null;
}

type TemplateFields =
  | { discriminant: "fullbleed"; value: Record<string, never> | null }
  | { discriminant: "standard"; value: Record<string, never> | null };

export interface PageData {
  title: string;
  hero: HeroFields;
  templateFields: TemplateFields;
}

function renderFullBleedTemplate(
  page: PageData,
  bodyContent: string,
  testimonials?: TestimonialData[],
  ultracampSessions?: UltraCampSession[],
): ReactElement {
  return (
    <FullBleedTemplate
      title={page.title}
      bodyContent={bodyContent}
      heroImage={page.hero.heroImage ?? undefined}
      heroVideo={page.hero.heroVideo ?? undefined}
      heroYouTubeId={page.hero.heroYouTubeId ?? undefined}
      heroTagline={page.hero.heroTagline ?? undefined}
      testimonials={testimonials}
      ultracampSessions={ultracampSessions}
    />
  );
}

function renderStandardTemplate(
  page: PageData,
  bodyContent: string,
  testimonials?: TestimonialData[],
): ReactElement {
  const heroHeightClass = getHeroHeightClass(page.hero.heroHeight || undefined);

  return (
    <div className="min-h-screen">
      {page.hero.heroYouTubeId ? (
        <YouTubeHero
          videoId={page.hero.heroYouTubeId}
          fallbackImage={page.hero.heroImage || undefined}
          title={page.title}
          subtitle={page.hero.heroTagline || undefined}
        />
      ) : page.hero.heroVideo ? (
        <HeroVideo
          src={page.hero.heroVideo}
          poster={page.hero.heroImage || undefined}
          title={page.title}
          subtitle={page.hero.heroTagline || undefined}
        />
      ) : page.hero.heroImage && isSafeImageUrl(page.hero.heroImage) ? (
        <div
          className={`relative ${heroHeightClass} flex items-center justify-center overflow-hidden`}
        >
          <Image
            src={page.hero.heroImage}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 text-white text-center px-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-4">
              {page.title}
            </h1>
            {page.hero.heroTagline && (
              <p className="text-xl md:text-2xl">{page.hero.heroTagline}</p>
            )}
          </div>
        </div>
      ) : null}

      <div className="py-16 bg-white bg-textured">
        <div className="max-w-4xl mx-auto px-6">
          {!page.hero.heroImage && !page.hero.heroVideo && (
            <h1 className="text-4xl font-heading font-bold mb-8 text-bark">
              {page.title}
            </h1>
          )}
          <MarkdocRenderer content={bodyContent} testimonials={testimonials} />
        </div>
      </div>
    </div>
  );
}

export async function renderPageContent(
  page: PageData,
  bodyContent: string,
): Promise<ReactElement> {
  // Normalize hero image path — Keystatic stores relative filenames in YAML
  if (page.hero.heroImage) {
    page.hero.heroImage = normalizeImagePath(page.hero.heroImage);
  }

  const templateType = page.templateFields.discriminant;
  const [testimonials, ultracampSessions] = await Promise.all([
    getPublishedTestimonials(),
    fetchUltraCampSessions(),
  ]);

  if (templateType === "fullbleed") {
    return renderFullBleedTemplate(page, bodyContent, testimonials, ultracampSessions);
  }

  return renderStandardTemplate(page, bodyContent, testimonials);
}
