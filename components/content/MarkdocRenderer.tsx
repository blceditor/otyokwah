/**
 * MarkdocRenderer Component
 *
 * REQ-MARKDOC-001: Parse and render Markdoc content with custom components
 * Transforms Markdoc syntax ({% %}) to React components using @markdoc/markdoc
 */

import React from "react";
import Markdoc from "@markdoc/markdoc";
import { ContentCard } from "./ContentCard";
import { SectionCard } from "./SectionCard";
import { CardGrid } from "./CardGrid";
import { SessionCard } from "./SessionCard"; // REQ-UI-005
import { DonateButton } from "./DonateButton";
import { CtaSection } from "./CtaSection";
import { YouTubeEmbed } from "./YouTubeEmbed";
import { FAQAccordion } from "./FAQAccordion";
import { CTAButton } from "../ui/CTAButton";
import type { CTAButtonProps } from "../ui/CTAButton";
import { ContactForm } from "../forms/ContactForm";
import { FeatureGrid } from "./FeatureGrid";
import { ImageGallery } from "./ImageGallery";
import { Testimonial } from "./Testimonial";
import { Accordion } from "./Accordion";
import { InfoCard } from "./InfoCard";
import { ColoredSection } from "./ColoredSection";
import { ContentBox } from "./ContentBox";
import { TwoColumnLayout } from "./TwoColumnLayout";
import { StatsSection } from "./StatsSection";
import { ValueCards } from "./ValueCards";
import { PositionCards } from "./PositionCards";
import { ImageSection } from "./ImageSection";
import { GridSquare } from "./GridSquare";
import { SquareGrid } from "./SquareGrid";
import { InlineSessionCard } from "./InlineSessionCard";
import { SessionCardGroup } from "./SessionCardGroup";
import { AnchorNav } from "./AnchorNav";
import { CampSessionCard } from "./CampSessionCard";
import { CampSessionCardGrid } from "./CampSessionCardGrid";
import { WideCard } from "./WideCard";
import { WorkAtCampSection } from "./WorkAtCampSection";
import { TrustBarMarkdoc, TrustBarItem } from "./TrustBarMarkdoc";
import { MissionSection } from "./MissionSection";
import { TestimonialWidget } from "./TestimonialWidget";
import { DocumentLink } from "./DocumentLink";
import { SessionCapacityLive } from "./capacity/SessionCapacityLive";
import { DESIGN_TOKEN_HEX } from "@/lib/keystatic/constants";
import { normalizeImagePath } from "@/lib/image-utils";

import type { TestimonialData } from "./TestimonialWidget";
import type { UltraCampSession } from "@/lib/ultracamp/sessions";

export interface MarkdocRendererProps {
  content: string;
  testimonials?: TestimonialData[];
  ultracampSessions?: UltraCampSession[];
}

function Heading({
  level,
  children,
}: {
  level: number;
  children?: React.ReactNode;
}) {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  return <Tag>{children}</Tag>;
}

function Link({
  href,
  children,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const isExternal =
    href?.startsWith("http://") || href?.startsWith("https://");

  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    );
  }

  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
}

function CTAButtonWrapper({
  align,
  ...props
}: CTAButtonProps & { align?: string }) {
  const alignClasses: Record<string, string> = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };
  const wrapperClass = alignClasses[align || "left"] || "";
  return (
    <div className={`${wrapperClass} py-2`}>
      <CTAButton {...props} />
    </div>
  );
}

function CtaBlock({
  heading,
  text,
  buttonText,
  buttonLink,
}: {
  heading?: string;
  text?: string;
  buttonText?: string;
  buttonLink?: string;
}) {
  return (
    <div className="bg-cream/50 rounded-lg p-6 my-6 text-center">
      {heading && <h3 className="text-xl font-bold text-primary mb-2">{heading}</h3>}
      {text && <p className="text-secondary mb-4">{text}</p>}
      {buttonText && buttonLink && (
        <CTAButton href={buttonLink} variant="primary">{buttonText}</CTAButton>
      )}
    </div>
  );
}

// Define custom Markdoc tags and nodes
const config = {
  nodes: {
    heading: {
      render: "Heading",
      attributes: {
        level: { type: Number, required: true },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transform(node: any, config: any) {
        const children = node.transformChildren(config);
        const level = node.attributes.level === 1 ? 2 : node.attributes.level;
        return new Markdoc.Tag("Heading", { level }, children);
      },
    },
    link: {
      render: "Link",
      attributes: {
        href: { type: String, required: true },
        title: { type: String },
      },
    },
  },
  tags: {
    // REQ-CMS-003: Added width, height, backgroundColor attributes
    // REQ-CMS-004: Added iconSize attribute
    contentCard: {
      render: "ContentCard",
      attributes: {
        title: { type: String },
        icon: { type: String },
        iconSize: { type: String },
        headingLevel: { type: String },
        width: { type: String },
        height: { type: String },
        backgroundColor: { type: String },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transform(node: any, config: any) {
        const children = node.transformChildren(config);
        // Parse headingLevel from string to number
        const headingLevel = node.attributes.headingLevel
          ? parseInt(node.attributes.headingLevel, 10)
          : undefined;
        return new Markdoc.Tag(
          "ContentCard",
          {
            title: node.attributes.title,
            icon: node.attributes.icon,
            iconSize: node.attributes.iconSize,
            headingLevel,
            width: node.attributes.width,
            height: node.attributes.height,
            backgroundColor: node.attributes.backgroundColor,
          },
          children,
        );
      },
    },
    // REQ-UI-005: SessionCard for camp session dates
    sessionCard: {
      render: "SessionCard",
      selfClosing: true,
      attributes: {
        title: { type: String, required: true },
        dates: { type: String, required: true },
        grades: { type: String, required: true },
        pricing: { type: String, required: true },
        earlyBird: { type: String },
        registrationLink: { type: String },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transform(node: any) {
        return new Markdoc.Tag("SessionCard", {
          title: node.attributes.title,
          dates: node.attributes.dates,
          grades: node.attributes.grades,
          pricing: node.attributes.pricing,
          earlyBird: node.attributes.earlyBird,
          registrationLink: node.attributes.registrationLink,
        });
      },
    },
    // REQ-CMS-003: Added width attribute
    sectionCard: {
      render: "SectionCard",
      attributes: {
        variant: { type: String },
        background: { type: String },
        width: { type: String },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transform(node: any, config: any) {
        const children = node.transformChildren(config);
        return new Markdoc.Tag(
          "SectionCard",
          {
            variant: node.attributes.variant,
            background: node.attributes.background,
            width: node.attributes.width,
          },
          children,
        );
      },
    },
    // REQ-CMS-003: Added width, height, backgroundColor attributes
    cardGrid: {
      render: "CardGrid",
      attributes: {
        cols: { type: String },
        width: { type: String },
        height: { type: String },
        backgroundColor: { type: String },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transform(node: any, config: any) {
        const children = node.transformChildren(config);
        return new Markdoc.Tag(
          "CardGrid",
          {
            cols: node.attributes.cols,
            width: node.attributes.width,
            height: node.attributes.height,
            backgroundColor: node.attributes.backgroundColor,
          },
          children,
        );
      },
    },
    donateButton: {
      render: "DonateButton",
      attributes: {
        label: { type: String, required: true },
        href: { type: String, required: true },
        icon: { type: String },
        iconSize: { type: String },
        variant: { type: String },
        external: { type: Boolean },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transform(node: any) {
        return new Markdoc.Tag("DonateButton", {
          label: node.attributes.label,
          href: node.attributes.href,
          icon: node.attributes.icon,
          iconSize: node.attributes.iconSize,
          variant: node.attributes.variant,
          external: node.attributes.external,
        });
      },
    },
    // REQ-U03-FIX-008: CTA Section for full-width colored sections
    ctaSection: {
      render: "CtaSection",
      attributes: {
        heading: { type: String, required: true },
        description: { type: String, required: true },
        buttonLabel: { type: String },
        buttonHref: { type: String },
        variant: { type: String, required: true },
        external: { type: Boolean },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transform(node: any) {
        return new Markdoc.Tag("CtaSection", {
          heading: node.attributes.heading,
          description: node.attributes.description,
          buttonLabel: node.attributes.buttonLabel,
          buttonHref: node.attributes.buttonHref,
          variant: node.attributes.variant,
          external: node.attributes.external,
        });
      },
    },
    cta: {
      render: "CtaBlock",
      selfClosing: true,
      attributes: {
        heading: { type: String },
        text: { type: String },
        buttonText: { type: String },
        buttonLink: { type: String },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transform(node: any) {
        return new Markdoc.Tag("CtaBlock", {
          heading: node.attributes.heading,
          text: node.attributes.text,
          buttonText: node.attributes.buttonText,
          buttonLink: node.attributes.buttonLink,
        });
      },
    },
    youtube: {
      render: "YouTubeEmbed",
      attributes: {
        id: { type: String, required: true },
        title: { type: String },
        caption: { type: String },
        startTime: { type: Number },
        maxWidth: { type: String },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transform(node: any) {
        return new Markdoc.Tag("YouTubeEmbed", {
          videoId: node.attributes.id,
          title: node.attributes.title,
          caption: node.attributes.caption,
          startTime: node.attributes.startTime,
          maxWidth: node.attributes.maxWidth || "md",
        });
      },
    },
    // REQ-FAQ002: FAQ Accordion tag for Markdoc
    faqAccordion: {
      render: "FAQAccordion",
      attributes: {
        title: { type: String },
        titleAlign: { type: String },
        allowMultiple: { type: Boolean },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transform(node: any) {
        // Parse children to extract FAQ items from nested faqItem tags
        // REQ-SEC-001: Markdoc automatically escapes string attributes
        // preventing XSS. Verify this continues in future Markdoc upgrades.
        // See: https://markdoc.dev/docs/attributes#security
        const items: Array<{
          question: string;
          answer: string;
          category?: string;
        }> = [];
        for (const child of node.children || []) {
          if (child.tag === "faqItem" && child.attributes) {
            items.push({
              question: child.attributes.question || "",
              answer: child.attributes.answer || "",
              category: child.attributes.category,
            });
          }
        }
        return new Markdoc.Tag("FAQAccordion", {
          items,
          title: node.attributes?.title,
          titleAlign: node.attributes?.titleAlign || "left",
          allowMultiple: node.attributes?.allowMultiple || false,
        });
      },
    },
    faqItem: {
      render: "FAQItem",
      selfClosing: true,
      attributes: {
        question: { type: String, required: true },
        answer: { type: String, required: true },
        category: { type: String },
      },
    },
    // REQ-SC006: CTA Button tag for Markdoc
    ctaButton: {
      render: "CTAButtonWrapper",
      attributes: {
        label: { type: String },
        href: { type: String },
        variant: { type: String },
        size: { type: String },
        external: { type: Boolean },
        textColor: { type: String },
        align: { type: String },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transform(node: any) {
        return new Markdoc.Tag("CTAButtonWrapper", {
          children: node.attributes.label,
          href: node.attributes.href,
          variant: node.attributes.variant || "primary",
          size: node.attributes.size || "lg",
          textColor: node.attributes.textColor,
          align: node.attributes.align || "left",
        });
      },
    },
    // REQ-OP005: Contact Form tag for Markdoc
    ContactForm: {
      render: "ContactForm",
      selfClosing: true,
      attributes: {},
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transform() {
        return new Markdoc.Tag("ContactForm", {});
      },
    },
    // REQ-406: Feature Grid tag for Markdoc
    features: {
      render: "FeatureGrid",
      attributes: {
        features: { type: Array },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transform(node: any) {
        // Map keystatic 'title' to component 'heading'
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const features = (node.attributes.features || []).map((f: any) => ({
          icon: f.icon || "",
          heading: f.title || "",
          description: f.description || "",
        }));
        return new Markdoc.Tag("FeatureGrid", { features });
      },
    },
    // REQ-407: Gallery tag for Markdoc
    gallery: {
      render: "ImageGallery",
      attributes: {
        images: { type: Array },
        layout: { type: String },
        columns: { type: Number },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transform(node: any) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const images = (node.attributes.images || []).map((img: any) => {
          const src =
            typeof img === "string" ? img :
            typeof img.image === "string" ? img.image :
            typeof img.src === "string" ? img.src :
            img.image?.src || img.src?.src || "";
          return {
            src: normalizeImagePath(src),
            alt: img.alt || "",
            caption: img.caption || "",
          };
        });
        return new Markdoc.Tag("ImageGallery", {
          images: images.filter((img: { src: string }) => img.src),
          layout: node.attributes.layout || "grid",
          columns: node.attributes.columns || 3,
        });
      },
    },
    // REQ-409: Testimonial tag for Markdoc
    testimonial: {
      render: "Testimonial",
      attributes: {
        quote: { type: String, required: true },
        author: { type: String, required: true },
        role: { type: String },
        photo: { type: String },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transform(node: any) {
        return new Markdoc.Tag("Testimonial", {
          quote: node.attributes.quote || "",
          author: node.attributes.author || "",
          role: node.attributes.role,
          avatar: node.attributes.photo ? normalizeImagePath(node.attributes.photo) : undefined,
        });
      },
    },
    // REQ-410: Accordion tag for Markdoc (different from FAQAccordion)
    accordion: {
      render: "Accordion",
      attributes: {
        items: { type: Array },
        allowMultiple: { type: Boolean },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transform(node: any) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const items = (node.attributes.items || []).map((item: any) => ({
          question: item.question || "",
          answer: item.answer || "",
        }));
        return new Markdoc.Tag("Accordion", {
          items,
          allowMultiple: node.attributes.allowMultiple || false,
        });
      },
    },
    // REQ-UI-002: Info Card tag for Markdoc
    infoCard: {
      render: "InfoCard",
      attributes: {
        icon: { type: String },
        iconSize: { type: String },
        heading: { type: String, required: true },
        items: { type: Array },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transform(node: any) {
        return new Markdoc.Tag("InfoCard", {
          icon: node.attributes.icon,
          iconSize: node.attributes.iconSize,
          heading: node.attributes.heading || "",
          items: node.attributes.items || [],
        });
      },
    },
    // REQ-501: Colored Section wrapper for Markdoc
    // REQ-CMS-003: Added width, height, customBackgroundColor attributes
    section: {
      render: "ColoredSection",
      attributes: {
        backgroundColor: { type: String },
        centered: { type: Boolean },
        width: { type: String },
        height: { type: String },
        customBackgroundColor: { type: String },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transform(node: any, config: any) {
        const children = node.transformChildren(config);
        return new Markdoc.Tag(
          "ColoredSection",
          {
            backgroundColor: node.attributes.backgroundColor || "white",
            centered: node.attributes.centered !== false,
            width: node.attributes.width,
            height: node.attributes.height,
            customBackgroundColor: node.attributes.customBackgroundColor,
          },
          children,
        );
      },
    },
    // REQ-527: Content Box wrapper for Markdoc
    // REQ-CMS-003: Added width, height, customBackgroundColor attributes
    contentBox: {
      render: "ContentBox",
      attributes: {
        style: { type: String },
        padding: { type: String },
        width: { type: String },
        height: { type: String },
        customBackgroundColor: { type: String },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transform(node: any, config: any) {
        const children = node.transformChildren(config);
        return new Markdoc.Tag(
          "ContentBox",
          {
            style: node.attributes.style || "white",
            padding: node.attributes.padding || "md",
            width: node.attributes.width,
            height: node.attributes.height,
            customBackgroundColor: node.attributes.customBackgroundColor,
          },
          children,
        );
      },
    },
    // REQ-723: Two Column Layout wrapper for Markdoc
    twoColumns: {
      render: "TwoColumnLayout",
      attributes: {
        reverseOnMobile: { type: Boolean },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transform(node: any, config: any) {
        const children = node.transformChildren(config);
        return new Markdoc.Tag(
          "TwoColumnLayout",
          {
            reverseOnMobile: node.attributes.reverseOnMobile || false,
          },
          children,
        );
      },
    },
    // REQ-555: Stats Section tag for Markdoc
    stats: {
      render: "StatsSection",
      attributes: {
        heading: { type: String },
        items: { type: Array },
        layout: { type: String },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transform(node: any) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const items = (node.attributes.items || []).map((item: any) => ({
          number: item.number || "",
          label: item.label || "",
          description: item.description || "",
        }));
        return new Markdoc.Tag("StatsSection", {
          heading: node.attributes.heading,
          items,
          layout: node.attributes.layout || "three",
        });
      },
    },
    // REQ-597: Value Cards tag for Markdoc
    valueCards: {
      render: "ValueCards",
      attributes: {
        heading: { type: String },
        cards: { type: Array },
        columns: { type: String },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transform(node: any) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cards = (node.attributes.cards || []).map((card: any) => ({
          image: normalizeImagePath(
            typeof card.image === "string" ? card.image : card.image?.src || "",
          ),
          icon: card.icon || "",
          title: card.title || "",
          description: card.description || "",
        }));
        return new Markdoc.Tag("ValueCards", {
          heading: node.attributes.heading,
          cards,
          columns: node.attributes.columns || "three",
        });
      },
    },
    // REQ-641: Position Cards tag for Markdoc
    positionCards: {
      render: "PositionCards",
      attributes: {
        heading: { type: String },
        positions: { type: Array },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transform(node: any) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const positions = (node.attributes.positions || []).map((pos: any) => ({
          image: normalizeImagePath(
            typeof pos.image === "string" ? pos.image : pos.image?.src || "",
          ),
          title: pos.title || "",
          description: pos.description || "",
          requirements: pos.requirements || "",
          applyLink: pos.applyLink || "",
        }));
        return new Markdoc.Tag("PositionCards", {
          heading: node.attributes.heading,
          positions,
        });
      },
    },
    // REQ-681: Image Section tag for Markdoc
    imageSection: {
      render: "ImageSection",
      attributes: {
        image: { type: String, required: true },
        alt: { type: String, required: true },
        overlayText: { type: String },
        overlayPosition: { type: String },
        height: { type: String },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transform(node: any) {
        return new Markdoc.Tag("ImageSection", {
          image: normalizeImagePath(
            typeof node.attributes.image === "string"
              ? node.attributes.image
              : node.attributes.image?.src || "",
          ),
          alt: node.attributes.alt || "",
          overlayText: node.attributes.overlayText,
          overlayPosition: node.attributes.overlayPosition || "center",
          height: node.attributes.height || "md",
        });
      },
    },
    // Call to Action (alias for CTAButton with different attribute names)
    callToAction: {
      render: "CTAButton",
      attributes: {
        buttonText: { type: String },
        buttonLink: { type: String },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transform(node: any) {
        return new Markdoc.Tag("CTAButton", {
          children: node.attributes.buttonText || "Learn More",
          href: node.attributes.buttonLink || "/",
          variant: "primary",
          size: "lg",
        });
      },
    },
    // ImageGallery (case-sensitive alias for gallery)
    ImageGallery: {
      render: "ImageGallery",
      attributes: {
        images: { type: Array },
        layout: { type: String },
        columns: { type: Number },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transform(node: any) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const images = (node.attributes.images || []).map((img: any) => {
          const src =
            typeof img === "string" ? img :
            typeof img.src === "string" ? img.src :
            typeof img.image === "string" ? img.image :
            img.src?.src || img.image?.src || "";
          return {
            src: normalizeImagePath(src),
            alt: img.alt || "",
            caption: img.caption || "",
          };
        });
        return new Markdoc.Tag("ImageGallery", {
          images: images.filter((img: { src: string }) => img.src),
          layout: node.attributes.layout || "grid",
          columns: node.attributes.columns || 3,
        });
      },
    },
    // REQ-GRID-001: Grid Square component for 2-column layouts
    // REQ-CMS-003: Added width, height attributes (backgroundColor already exists)
    gridSquare: {
      render: "GridSquare",
      attributes: {
        contentType: { type: String, required: true },
        image: { type: String },
        imageAlt: { type: String },
        backgroundColor: { type: String },
        textColor: { type: String },
        aspectRatio: { type: String },
        id: { type: String },
        width: { type: String },
        height: { type: String },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transform(node: any, config: any) {
        const children = node.transformChildren(config);
        return new Markdoc.Tag(
          "GridSquare",
          {
            contentType: node.attributes.contentType || "color",
            image: node.attributes.image ? normalizeImagePath(node.attributes.image) : node.attributes.image,
            imageAlt: node.attributes.imageAlt,
            backgroundColor: node.attributes.backgroundColor || DESIGN_TOKEN_HEX.cream,
            textColor: node.attributes.textColor || "dark",
            aspectRatio: node.attributes.aspectRatio || "square",
            id: node.attributes.id,
            width: node.attributes.width,
            height: node.attributes.height,
          },
          children,
        );
      },
    },
    // REQ-GRID-002: Square Grid container for GridSquare components
    // REQ-CMS-003: Added width, height, backgroundColor attributes
    squareGrid: {
      render: "SquareGrid",
      attributes: {
        columns: { type: String },
        gap: { type: String },
        width: { type: String },
        height: { type: String },
        backgroundColor: { type: String },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transform(node: any, config: any) {
        const children = node.transformChildren(config);
        return new Markdoc.Tag(
          "SquareGrid",
          {
            columns: node.attributes.columns || "2",
            gap: node.attributes.gap || "none",
            width: node.attributes.width,
            height: node.attributes.height,
            backgroundColor: node.attributes.backgroundColor,
          },
          children,
        );
      },
    },
    // REQ-GRID-013: Inline Session Card for compact session display
    inlineSessionCard: {
      render: "InlineSessionCard",
      selfClosing: true,
      attributes: {
        title: { type: String, required: true },
        dates: { type: String, required: true },
        pricing: { type: String, required: true },
        pricingNote: { type: String },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transform(node: any) {
        return new Markdoc.Tag("InlineSessionCard", {
          title: node.attributes.title,
          dates: node.attributes.dates,
          pricing: node.attributes.pricing,
          pricingNote: node.attributes.pricingNote || "Early Bird / Regular",
        });
      },
    },
    // REQ-GRID-013: Session Card Group wrapper for grid layout
    sessionCardGroup: {
      render: "SessionCardGroup",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transform(node: any, config: any) {
        const children = node.transformChildren(config);
        return new Markdoc.Tag("SessionCardGroup", {}, children);
      },
    },
    // REQ-U03-003: Anchor navigation for page sections (non-sticky)
    anchorNav: {
      render: "AnchorNav",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transform(node: any) {
        // Parse children to extract anchor items from nested anchorNavItem tags
        const items: Array<{ id: string; label: string; grades?: string }> = [];
        for (const child of node.children || []) {
          if (child.tag === "anchorNavItem" && child.attributes) {
            items.push({
              id: child.attributes.id || "",
              label: child.attributes.label || "",
              grades: child.attributes.grades,
            });
          }
        }
        return new Markdoc.Tag("AnchorNav", { items });
      },
    },
    // REQ-U03-003: Anchor nav item (child of anchorNav)
    anchorNavItem: {
      render: "AnchorNavItem",
      selfClosing: true,
      attributes: {
        id: { type: String, required: true },
        label: { type: String, required: true },
        grades: { type: String },
      },
    },
    // REQ-HOME-004: Camp Session Card for homepage
    campSessionCard: {
      render: "CampSessionCard",
      selfClosing: true,
      attributes: {
        image: { type: String, required: true },
        imageAlt: { type: String, required: true },
        heading: { type: String, required: true },
        subheading: { type: String },
        bulletType: { type: String },
        bullets: { type: Array },
        ctaLabel: { type: String },
        ctaHref: { type: String },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transform(node: any) {
        const img = node.attributes.image;
        return new Markdoc.Tag("CampSessionCard", {
          image: normalizeImagePath(typeof img === "string" ? img : img?.src || ""),
          imageAlt: node.attributes.imageAlt,
          heading: node.attributes.heading,
          subheading: node.attributes.subheading,
          bulletType: node.attributes.bulletType || "checkmark",
          bullets: node.attributes.bullets || [],
          ctaLabel: node.attributes.ctaLabel || "See Dates & Pricing",
          ctaHref: node.attributes.ctaHref || "#",
        });
      },
    },
    // REQ-COMP-001: Camp Session Card Grid wrapper
    campSessionCardGrid: {
      render: "CampSessionCardGrid",
      attributes: {
        columns: { type: String },
        gap: { type: String },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transform(node: any, config: any) {
        const children = node.transformChildren(config);
        return new Markdoc.Tag(
          "CampSessionCardGrid",
          {
            columns: node.attributes.columns || "4",
            gap: node.attributes.gap || "md",
          },
          children,
        );
      },
    },
    // REQ-HOME-006: Wide Card for Retreats/Rentals sections
    wideCard: {
      render: "WideCard",
      selfClosing: true,
      attributes: {
        image: { type: String, required: true },
        imageAlt: { type: String, required: true },
        imagePosition: { type: String },
        heading: { type: String, required: true },
        description: { type: String, required: true },
        ctaLabel: { type: String },
        ctaHref: { type: String },
        backgroundColor: { type: String },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transform(node: any) {
        const img = node.attributes.image;
        return new Markdoc.Tag("WideCard", {
          image: normalizeImagePath(typeof img === "string" ? img : img?.src || ""),
          imageAlt: node.attributes.imageAlt,
          imagePosition: node.attributes.imagePosition || "left",
          heading: node.attributes.heading,
          description: node.attributes.description,
          ctaLabel: node.attributes.ctaLabel || "Learn More",
          ctaHref: node.attributes.ctaHref || "#",
          backgroundColor: node.attributes.backgroundColor || DESIGN_TOKEN_HEX.cream,
        });
      },
    },
    // REQ-HOME-005: Work At Camp Section for homepage
    workAtCampSection: {
      render: "WorkAtCampSection",
      attributes: {
        heading: { type: String },
        subheading: { type: String },
        items: { type: Array },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transform(node: any) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const items = (node.attributes.items || []).map((item: any) => ({
          icon: item.icon || "Users",
          title: item.title || "",
          description: item.description || "",
          linkHref: item.linkHref || "#",
          linkLabel: item.linkLabel || "Learn More",
        }));
        return new Markdoc.Tag("WorkAtCampSection", {
          heading: node.attributes.heading || "Work at Camp",
          subheading: node.attributes.subheading || "",
          items,
        });
      },
    },
    // REQ-TRUST-001: TrustBar Markdoc Component (uses child tag pattern)
    trustBarMarkdoc: {
      render: "TrustBarMarkdoc",
      attributes: {
        backgroundColor: { type: String },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transform(node: any, config: any) {
        // CHILD TAG PATTERN: children are rendered separately
        const children = node.transformChildren(config);
        return new Markdoc.Tag(
          "TrustBarMarkdoc",
          {
            backgroundColor: node.attributes.backgroundColor || "secondary",
          },
          children,
        );
      },
    },
    // REQ-TRUST-001: TrustBar Item (child of trustBarMarkdoc)
    trustBarItem: {
      render: "TrustBarItem",
      selfClosing: true,
      attributes: {
        icon: { type: String },
        text: { type: String, required: true },
        iconSize: { type: String },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transform(node: any) {
        return new Markdoc.Tag("TrustBarItem", {
          icon: node.attributes.icon || "Calendar",
          text: node.attributes.text,
          iconSize: node.attributes.iconSize || "md",
        });
      },
    },
    // P1-09: TestimonialWidget Markdoc Component
    testimonialWidget: {
      render: "TestimonialWidget",
      selfClosing: true,
      attributes: {
        mode: { type: String },
        quote: { type: String },
        author: { type: String },
        role: { type: String },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transform(node: any) {
        return new Markdoc.Tag("TestimonialWidget", {
          mode: node.attributes.mode || "specific",
          quote: node.attributes.quote,
          author: node.attributes.author,
          role: node.attributes.role,
        });
      },
    },
    sessionCapacity: {
      render: "SessionCapacityLive",
      selfClosing: true,
      attributes: {
        sessions: { type: Array, required: true },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transform(node: any) {
        return new Markdoc.Tag("SessionCapacityLive", {
          sessionNames: node.attributes.sessions || [],
        });
      },
    },
    // REQ-MISSION-001: MissionSection Markdoc Component
    missionSection: {
      render: "MissionSection",
      selfClosing: true,
      attributes: {
        line1Text: { type: String },
        line1Font: { type: String },
        line1Size: { type: String },
        line1Color: { type: String },
        line2Text: { type: String },
        line2Font: { type: String },
        line2Size: { type: String },
        line2Color: { type: String },
        line2Bold: { type: Boolean },
        line3Text: { type: String },
        line3Font: { type: String },
        line3Size: { type: String },
        line3Color: { type: String },
        backgroundImage: { type: String },
        overlayOpacity: { type: String },
        enableParallax: { type: Boolean },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transform(node: any) {
        const attrs = { ...node.attributes };
        if (attrs.backgroundImage) {
          attrs.backgroundImage = normalizeImagePath(attrs.backgroundImage);
        }
        return new Markdoc.Tag("MissionSection", attrs);
      },
    },
    textAlign: {
      render: "TextAlign",
      attributes: {
        align: { type: String },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transform(node: any, config: any) {
        const children = node.transformChildren(config);
        return new Markdoc.Tag(
          "TextAlign",
          { align: node.attributes.align || "center" },
          children,
        );
      },
    },
    sectionHeading: {
      render: "SectionHeading",
      selfClosing: true,
      attributes: {
        text: { type: String, required: true },
        level: { type: String },
        align: { type: String },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transform(node: any) {
        return new Markdoc.Tag("SectionHeading", {
          text: node.attributes.text,
          level: node.attributes.level || "2",
          align: node.attributes.align || "center",
        });
      },
    },
    // REQ-BUG9: DocumentLink for downloadable file links
    documentLink: {
      render: "DocumentLink",
      selfClosing: true,
      attributes: {
        href: { type: String, required: true },
        label: { type: String, required: true },
        description: { type: String },
        fileSize: { type: String },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transform(node: any) {
        return new Markdoc.Tag("DocumentLink", {
          href: node.attributes.href,
          label: node.attributes.label,
          description: node.attributes.description,
          fileSize: node.attributes.fileSize,
        });
      },
    },
  },
};

function SectionHeading({ text, level, align }: { text: string; level?: string; align?: string }) {
  const Tag = `h${level || "2"}` as "h2" | "h3" | "h4";
  const alignClasses: Record<string, string> = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };
  return <Tag className={alignClasses[align || "center"] || ""}>{text}</Tag>;
}

// Text alignment wrapper component
function TextAlign({ align, children }: { align?: string; children: React.ReactNode }) {
  const alignClasses: Record<string, string> = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };
  return <div className={alignClasses[align || "center"] || ""}>{children}</div>;
}

// Placeholder for faqItem (doesn't actually render, just holds data)
function FAQItem() {
  return null;
}

// Placeholder for anchorNavItem (doesn't render, data extracted by anchorNav)
function AnchorNavItem() {
  return null;
}

// Component map for rendering
const components = {
  Heading,
  Link,
  ContentCard,
  SectionCard,
  SessionCard, // REQ-UI-005
  CardGrid,
  DonateButton,
  CtaSection,
  CtaBlock,
  YouTubeEmbed,
  FAQAccordion,
  FAQItem,
  CTAButton,
  CTAButtonWrapper,
  ContactForm,
  FeatureGrid,
  ImageGallery,
  Testimonial,
  Accordion,
  InfoCard,
  ColoredSection,
  ContentBox,
  TwoColumnLayout,
  StatsSection,
  ValueCards,
  PositionCards,
  ImageSection,
  GridSquare,
  SquareGrid,
  InlineSessionCard,
  SessionCardGroup,
  AnchorNav,
  AnchorNavItem,
  CampSessionCard, // REQ-HOME-004
  CampSessionCardGrid, // REQ-COMP-001
  WideCard, // REQ-HOME-006
  WorkAtCampSection, // REQ-HOME-005
  TrustBarMarkdoc, // REQ-TRUST-001
  TrustBarItem, // REQ-TRUST-001
  MissionSection, // REQ-MISSION-001
  TestimonialWidget, // P1-09
  DocumentLink, // REQ-BUG9
  TextAlign,
  SectionHeading,
  SessionCapacityLive,
};

// Full-width component tags that should render outside prose wrapper
const FULL_WIDTH_TAGS = ["TrustBarMarkdoc", "MissionSection"];

// Round 6 fix: Use displayName instead of .name (survives minification)
function getComponentDisplayName(
  element: React.ReactElement,
): string | undefined {
  const type = element.type as React.ComponentType & { displayName?: string };
  return type.displayName || type.name || undefined;
}

/**
 * Renders content with full-width component support.
 * Full-width components (TrustBarMarkdoc, MissionSection) render outside the prose wrapper.
 * Other content renders inside prose for proper typography styling.
 */
function renderWithFullWidthSupport(
  nodes: React.ReactNode,
): React.ReactNode {
  const result: React.ReactNode[] = [];
  let proseContent: React.ReactNode[] = [];
  let keyIndex = 0;

  React.Children.forEach(nodes, (child) => {
    // Round 6 fix: Use getComponentDisplayName() for minification safety
    const componentName = React.isValidElement(child)
      ? getComponentDisplayName(child)
      : undefined;

    if (componentName && FULL_WIDTH_TAGS.includes(componentName)) {
      // Flush prose content first
      if (proseContent.length > 0) {
        result.push(
          <div
            key={`prose-${keyIndex++}`}
            className="prose prose-lg max-w-none"
          >
            {proseContent}
          </div>,
        );
        proseContent = [];
      }
      // Add full-width component outside prose
      result.push(child);
    } else {
      proseContent.push(child);
    }
  });

  // Flush remaining prose content
  if (proseContent.length > 0) {
    result.push(
      <div key={`prose-${keyIndex++}`} className="prose prose-lg max-w-none">
        {proseContent}
      </div>,
    );
  }

  return result.length === 1 ? result[0] : <>{result}</>;
}

/**
 * MarkdocRenderer Component
 * Parses Markdoc syntax and renders to React
 * REQ-TRUST-001, REQ-MISSION-001: Supports full-width components outside prose wrapper
 */
export function MarkdocRenderer({
  content,
  testimonials,
  ultracampSessions,
}: MarkdocRendererProps): JSX.Element {
  try {
    // Parse Markdoc content
    const ast = Markdoc.parse(content);

    // Transform AST with our custom config
    const renderableTree = Markdoc.transform(ast, config);

    // Create component map with server-fetched data injected
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const renderComponents: Record<string, any> = { ...components };

    if (testimonials) {
      // eslint-disable-next-line react/display-name
      renderComponents.TestimonialWidget = (props: Record<string, unknown>) => (
        <TestimonialWidget {...props} testimonials={testimonials} />
      );
    }

    if (ultracampSessions) {
      const now = new Date();
      const earlyBirdDeadline = new Date("2026-04-14");
      const isEarlyBirdActive = now < earlyBirdDeadline;

      // eslint-disable-next-line react/display-name
      renderComponents.SessionCapacityLive = (props: Record<string, unknown>) => (
        <SessionCapacityLive
          initialSessions={ultracampSessions}
          sessionNames={(props.sessionNames as string[]) || []}
          isEarlyBirdActive={isEarlyBirdActive}
        />
      );
    }

    // Render to React
    const renderedContent = Markdoc.renderers.react(renderableTree, React, {
      components: renderComponents,
    });

    // Use full-width support to handle TrustBar/MissionSection outside prose
    return <>{renderWithFullWidthSupport(renderedContent)}</>;
  } catch {
    return <div className="prose prose-lg max-w-none">{content}</div>;
  }
}
