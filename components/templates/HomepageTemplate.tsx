"use client";

/**
 * Homepage Template Component
 * REQ-PM-002: Homepage template with hero section, markdown content, photo gallery, and CTA
 * REQ-HERO-001: Hero Image Carousel Component
 * REQ-LP-V5-005: Markdoc component rendering support
 */

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import rehypeRaw from "rehype-raw";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function stripMdProps({ ref, node, ...rest }: any) { void ref; void node; return rest; }
import {
  YouTubeEmbed,
  extractVideoId,
} from "@/components/content/YouTubeEmbed";
import Image from "next/image";
import { isSafeImageUrl, isSafeLinkUrl } from "@/lib/security/validate-url";
import { HeroCarousel, CarouselImage } from "@/components/content/HeroCarousel";
import { TexturedHeading } from "@/components/content/TexturedHeading";

export interface GalleryImage {
  image: string;
  alt: string;
  caption?: string;
}

export interface HomepageTemplateProps {
  title: string;
  bodyContent: string;
  heroImage?: string;
  heroTagline?: string;
  templateFields: {
    heroImages?: CarouselImage[]; // REQ-HERO-001: Carousel images (optional)
    galleryImages?: GalleryImage[];
    ctaHeading?: string;
    ctaButtonText?: string;
    ctaButtonLink?: string;
  };
}

/**
 * Strips HTML comments from markdown content
 */
function stripHtmlComments(content: string): string {
  return content.replace(/<!--[\s\S]*?-->/g, "");
}

/**
 * Detects if a line contains a bare YouTube URL
 */
function isYouTubeUrl(text: string): boolean {
  const trimmed = text.trim();
  return (
    (trimmed.startsWith("https://youtu.be/") ||
      trimmed.startsWith("https://www.youtube.com/watch") ||
      trimmed.startsWith("https://m.youtube.com/watch") ||
      trimmed.startsWith("https://youtube.com/watch")) &&
    !trimmed.includes("```")
  );
}

/**
 * Processes markdown content to prepare for rendering
 */
function preprocessMarkdown(content: string): string {
  let processed = stripHtmlComments(content);

  const parts = processed.split(/(```[\s\S]*?```|`[^`]+`)/);

  processed = parts
    .map((part, index) => {
      if (index % 2 === 1) {
        return part;
      }

      const lines = part.split("\n");
      return lines
        .map((line) => {
          if (isYouTubeUrl(line)) {
            const videoId = extractVideoId(line);
            if (videoId) {
              return `[YOUTUBE:${videoId}]`;
            }
          }
          return line;
        })
        .join("\n");
    })
    .join("");

  return processed;
}

export function HomepageTemplate({
  title,
  bodyContent,
  heroImage,
  heroTagline,
  templateFields,
}: HomepageTemplateProps): JSX.Element {
  const {
    heroImages = [],
    galleryImages = [],
    ctaHeading,
    ctaButtonText,
    ctaButtonLink,
  } = templateFields;

  // Determine if CTA should be rendered
  const showCta = ctaButtonText && ctaButtonLink;

  // Use carousel if heroImages provided, otherwise fallback to single heroImage
  const useCarousel = heroImages && heroImages.length > 0;

  return (
    <div className="min-h-screen bg-cream sm:px-2 md:px-4 lg:px-6">
      {/* Hero Section - Carousel or Static Background */}
      <header
        data-testid="hero-section"
        className="relative w-full min-h-[500px] flex items-center justify-center text-center"
      >
        {useCarousel ? (
          /* REQ-HERO-001: Hero Carousel */
          <div className="absolute inset-0">
            <HeroCarousel
              images={heroImages}
              interval={5000}
              showIndicators={true}
            />
          </div>
        ) : (
          /* Fallback: Static Background Image */
          <div
            className={`absolute inset-0 ${
              !heroImage
                ? "bg-gradient-to-r from-secondary to-secondary-light"
                : ""
            }`}
            style={
              heroImage && isSafeImageUrl(heroImage)
                ? {
                    backgroundImage: `url(${heroImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : undefined
            }
          />
        )}

        {/* Overlay */}
        <div
          data-testid="hero-overlay"
          className="absolute inset-0 bg-black/40"
        />

        {/* Hero Text Content */}
        <div className="relative z-10 px-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            {title}
          </h1>
          {heroTagline && (
            <p className="text-xl md:text-2xl lg:text-3xl text-white font-semibold">
              {heroTagline}
            </p>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Body Content */}
        <article className="mb-12">
            <div className="prose prose-lg max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeSanitize]}
                components={{
                  // P2-27: Suppress h1 from CMS markdown (hero already renders title as h1)
                  h1: (allProps) => {
                    const { children, ...props } = stripMdProps(allProps);
                    return <h2 className="text-3xl font-bold mt-10 mb-6 text-bark" {...props}>{children}</h2>;
                  },
                  // REQ-TEXT-002: Textured H2 for homepage
                  h2: (allProps) => <TexturedHeading level={2} className="text-3xl font-bold mt-10 mb-6" {...stripMdProps(allProps)} />,
                  h3: (allProps) => <h3 className="text-2xl font-bold mt-8 mb-4 text-bark" {...stripMdProps(allProps)} />,
                  p: (allProps) => {
                    const { children, ...props } = stripMdProps(allProps);
                    const childText = String(children);
                    if (childText.startsWith("[YOUTUBE:") && childText.endsWith("]")) {
                      return <YouTubeEmbed videoId={childText.slice(9, -1)} />;
                    }
                    return <p className="mb-4 leading-relaxed" {...props}>{children}</p>;
                  },
                  a: (allProps) => {
                    const { href, children, ...props } = stripMdProps(allProps);
                    if (!isSafeLinkUrl(href) || !href || href === "" || href === "()") {
                      return <span>{children}</span>;
                    }
                    const isExternal = href.startsWith("http");
                    return (
                      <a
                        href={href}
                        className="text-secondary hover:underline font-medium"
                        {...(isExternal && { target: "_blank", rel: "noopener noreferrer" })}
                        {...props}
                      >
                        {children}
                      </a>
                    );
                  },
                  img: (allProps) => {
                    const { src, alt, ...props } = stripMdProps(allProps);
                    if (!src) return null;
                    // eslint-disable-next-line @next/next/no-img-element -- CMS markdown images lack width/height
                    return <img src={src} alt={alt || ""} loading="lazy" className="rounded-lg shadow-md my-4 w-full h-auto" {...props} />;
                  },
                  code: (allProps) => {
                    const { inline, className, children, ...props } = stripMdProps(allProps);
                    if (inline) {
                      return <code className="bg-cream rounded px-1 py-0.5 text-sm font-mono" {...props}>{children}</code>;
                    }
                    return <code className={`block bg-cream rounded p-4 text-sm font-mono overflow-x-auto ${className || ""}`} {...props}>{children}</code>;
                  },
                  ul: (allProps) => <ul className="list-disc list-inside mb-4 space-y-2" {...stripMdProps(allProps)} />,
                  ol: (allProps) => <ol className="list-decimal list-inside mb-4 space-y-2" {...stripMdProps(allProps)} />,
                  li: (allProps) => <li className="leading-relaxed" {...stripMdProps(allProps)} />,
                  strong: (allProps) => <strong className="font-bold text-bark" {...stripMdProps(allProps)} />,
                  em: (allProps) => <em className="italic" {...stripMdProps(allProps)} />,
                  blockquote: (allProps) => <blockquote className="border-l-4 border-secondary pl-4 italic my-4 text-bark/80" {...stripMdProps(allProps)} />,
                }}
              >
                {preprocessMarkdown(bodyContent)}
              </ReactMarkdown>
            </div>
        </article>

        {/* Photo Gallery Grid */}
        {galleryImages.length > 0 && (
          <section aria-label="Photo Gallery" className="mb-12">
            <div
              data-testid="gallery-grid"
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            >
              {galleryImages.map((item, index) => (
                <div key={index} className="flex flex-col">
                  <div className="relative aspect-square overflow-hidden rounded-lg shadow-md">
                    <Image
                      src={item.image}
                      alt={item.alt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  </div>
                  {item.caption && (
                    <p className="text-sm text-bark/80 mt-2 text-center">
                      {item.caption}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CTA Section */}
        {showCta && (
          <section
            data-testid="cta-section"
            aria-label="Call to Action"
            className="text-center py-12 bg-bark/5 bg-textured rounded-lg mx-auto"
          >
            {ctaHeading && (
              <TexturedHeading level={2} className="text-3xl font-bold mb-6">
                {ctaHeading}
              </TexturedHeading>
            )}
            <a
              href={ctaButtonLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-secondary hover:bg-secondary-light text-white font-bold text-xl px-8 py-4 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-secondary"
            >
              {ctaButtonText}
            </a>
          </section>
        )}
      </div>
    </div>
  );
}
