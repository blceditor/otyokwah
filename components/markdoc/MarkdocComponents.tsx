// REQ-404 to REQ-411: Rich Content Markdoc Components
// REQ-UI-002: InfoCard Component
// REQ-DESIGN-001: SectionCard and ContentCard Components
// REQ-CONTENT-007: DonateButton Component
// REQ-U03-FIX-008: CtaSection Component
// REQ-HOME-004: CampSessionCard Component
// REQ-HOME-005: WorkAtCampSection Component
// REQ-HOME-006: WideCard Component
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { InfoCard } from "../content/InfoCard";
import { SectionCard } from "../content/SectionCard";
import { ContentCard } from "../content/ContentCard";
import { DonateButton } from "../content/DonateButton";
import { CtaSection } from "../content/CtaSection";
import { CampSessionCard } from "../content/CampSessionCard";
import { CampSessionCardGrid } from "../content/CampSessionCardGrid";
import { WideCard } from "../content/WideCard";
import { WorkAtCampSection } from "../content/WorkAtCampSection";
import type { WorkAtCampItem } from "../content/WorkAtCampSection";
import type { BulletType } from "../content/CampSessionCard";
import type { ImagePosition } from "../content/WideCard";

// REQ-404: Image Component
export interface ImageComponentProps {
  src: string;
  alt: string;
  caption?: string;
}

export function ImageComponent({ src, alt, caption }: ImageComponentProps) {
  return (
    <figure className="my-8">
      <Image
        src={src}
        alt={alt}
        width={800}
        height={600}
        className="rounded-lg w-full h-auto"
      />
      {caption && (
        <figcaption className="mt-2 text-sm text-stone text-center italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

// REQ-405: Call-to-Action Component
export interface CTAComponentProps {
  heading: string;
  text: string;
  buttonText: string;
  buttonLink: string;
}

export function CTAComponent({
  heading,
  text,
  buttonText,
  buttonLink,
}: CTAComponentProps) {
  return (
    <div className="bg-secondary text-cream rounded-lg p-8 my-12 text-center">
      <h2 className="text-3xl font-bold mb-4">{heading}</h2>
      <p className="text-lg mb-6 whitespace-pre-line">{text}</p>
      <Link
        href={buttonLink}
        className="inline-block bg-accent hover:bg-accent-light text-cream font-semibold px-8 py-3 rounded-lg transition-colors duration-200"
      >
        {buttonText}
      </Link>
    </div>
  );
}

// REQ-406: Feature Grid Component
export interface Feature {
  icon: string;
  title: string;
  description: string;
}

export interface FeatureGridComponentProps {
  features: Feature[];
}

export function FeatureGridComponent({ features }: FeatureGridComponentProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-12">
      {features.map((feature, index) => (
        <div key={index} className="text-center">
          <div className="text-4xl mb-4">{feature.icon}</div>
          <h3 className="text-xl font-bold mb-2 text-secondary">
            {feature.title}
          </h3>
          <p className="text-stone">{feature.description}</p>
        </div>
      ))}
    </div>
  );
}

// REQ-407: Photo Gallery Component
export interface GalleryImage {
  image: string;
  alt: string;
  caption: string;
}

export interface PhotoGalleryComponentProps {
  images: GalleryImage[];
}

export function PhotoGalleryComponent({ images }: PhotoGalleryComponentProps) {
  return (
    <div
      data-component="gallery"
      className="grid grid-cols-2 md:grid-cols-3 gap-4 my-12"
    >
      {images.map((img, index) => (
        <figure key={index} className="group">
          <Image
            src={img.image}
            alt={img.alt}
            width={400}
            height={400}
            className="rounded-lg w-full h-auto object-cover"
          />
          {img.caption && (
            <figcaption className="mt-2 text-sm text-stone text-center">
              {img.caption}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}

// REQ-408: YouTube Component
export interface YouTubeComponentProps {
  videoId: string;
  title: string;
}

export function YouTubeComponent({ videoId, title }: YouTubeComponentProps) {
  return (
    <div className="my-12">
      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title={title}
          allowFullScreen
          className="absolute top-0 left-0 w-full h-full rounded-lg"
        />
      </div>
    </div>
  );
}

// REQ-409: Testimonial Component
export interface TestimonialComponentProps {
  quote: string;
  author: string;
  role: string;
  photo?: string;
}

export function TestimonialComponent({
  quote,
  author,
  role,
  photo,
}: TestimonialComponentProps) {
  return (
    <blockquote className="border-l-4 border-accent pl-6 py-4 my-8 bg-cream rounded-r-lg">
      <p className="text-lg italic mb-4 whitespace-pre-line">{quote}</p>
      <div className="flex items-center gap-3">
        {photo && (
          <Image
            src={photo}
            alt={author}
            width={48}
            height={48}
            className="rounded-full object-cover"
          />
        )}
        <div>
          <div className="font-semibold text-secondary">{author}</div>
          <div className="text-sm text-stone">{role}</div>
        </div>
      </div>
    </blockquote>
  );
}

// REQ-410: Accordion Component
export interface AccordionItem {
  question: string;
  answer: string;
}

export interface AccordionComponentProps {
  items: AccordionItem[];
}

export function AccordionComponent({ items }: AccordionComponentProps) {
  return (
    <div className="my-12 space-y-2">
      {items.map((item, index) => (
        <details key={index} className="border-b border-sand py-4 group">
          <summary className="font-semibold text-secondary cursor-pointer list-none flex justify-between items-center">
            <span>{item.question}</span>
            <span className="ml-2 text-primary group-open:rotate-180 transition-transform">
              ▼
            </span>
          </summary>
          <p className="mt-4 text-stone whitespace-pre-line">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}

// REQ-UI-002: InfoCard Component for CMS
export interface InfoCardComponentProps {
  icon?: string;
  iconSize?: "sm" | "md" | "lg" | "xl";
  heading: string;
  description?: string;
  items: string[];
}

export function InfoCardComponent(props: InfoCardComponentProps) {
  return <InfoCard {...props} />;
}

// REQ-UI-002: InfoCardGrid Component for multiple cards
export interface InfoCardGridComponentProps {
  cards: InfoCardComponentProps[];
  columns?: 2 | 3;
}

export function InfoCardGridComponent({
  cards,
  columns = 2,
}: InfoCardGridComponentProps) {
  const gridClass =
    columns === 2
      ? "grid grid-cols-1 md:grid-cols-2 gap-6 my-12"
      : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-12";

  return (
    <div className={gridClass}>
      {cards.map((card, index) => (
        <InfoCard key={index} {...card} />
      ))}
    </div>
  );
}

// REQ-DESIGN-001: SectionCard Component for CMS
export interface SectionCardComponentProps {
  children?: React.ReactNode;
  variant?: "default" | "elevated" | "flat" | "full-width";
  background?: "cream" | "white";
  className?: string;
}

export function SectionCardComponent(props: SectionCardComponentProps) {
  return <SectionCard {...props} />;
}

// REQ-DESIGN-001: ContentCard Component for CMS
export interface ContentCardComponentProps {
  title?: string;
  icon?: string;
  children?: React.ReactNode;
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  className?: string;
}

export function ContentCardComponent(props: ContentCardComponentProps) {
  return <ContentCard {...props} />;
}

// REQ-CONTENT-007: DonateButton Component for CMS
export interface DonateButtonComponentProps {
  label?: string;
  icon?: string;
  href?: string;
  variant?: "primary" | "secondary" | "outline";
  external?: boolean;
  "aria-label"?: string;
}

export function DonateButtonComponent(props: DonateButtonComponentProps) {
  // Provide defaults for required props
  const { label = "Donate", href = "#", variant, ...rest } = props;
  // Map outline variant to secondary since DonateButton doesn't support outline
  const mappedVariant = variant === "outline" ? "secondary" : variant;
  return (
    <DonateButton label={label} href={href} variant={mappedVariant} {...rest} />
  );
}

// REQ-U03-FIX-008: CtaSection Component for CMS
export interface CtaSectionComponentProps {
  heading: string;
  description: string;
  buttonLabel: string;
  buttonHref: string;
  variant: "green" | "brown";
  external?: boolean;
}

export function CtaSectionComponent(props: CtaSectionComponentProps) {
  return <CtaSection {...props} />;
}

// REQ-HOME-004: CampSessionCard Component for CMS
export interface CampSessionCardComponentProps {
  image: string;
  imageAlt: string;
  heading: string;
  subheading?: string;
  bulletType?: BulletType;
  bullets: string[];
  ctaLabel?: string;
  ctaHref?: string;
}

export function CampSessionCardComponent(props: CampSessionCardComponentProps) {
  return <CampSessionCard {...props} />;
}

// REQ-COMP-001: CampSessionCardGrid Component for CMS
export interface CampSessionCardGridComponentProps {
  children: React.ReactNode;
  columns?: "2" | "3" | "4";
  gap?: "sm" | "md" | "lg";
}

export function CampSessionCardGridComponent(
  props: CampSessionCardGridComponentProps,
) {
  return <CampSessionCardGrid {...props} />;
}

// REQ-HOME-006: WideCard Component for CMS
export interface WideCardComponentProps {
  image: string;
  imageAlt: string;
  imagePosition?: ImagePosition;
  heading: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
  backgroundColor?: string;
}

export function WideCardComponent(props: WideCardComponentProps) {
  return <WideCard {...props} />;
}

// REQ-HOME-005: WorkAtCampSection Component for CMS
export interface WorkAtCampSectionComponentProps {
  heading?: string;
  subheading?: string;
  items: WorkAtCampItem[];
}

export function WorkAtCampSectionComponent(
  props: WorkAtCampSectionComponentProps,
) {
  return <WorkAtCampSection {...props} />;
}
