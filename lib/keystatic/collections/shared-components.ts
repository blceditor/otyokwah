/**
 * Shared Markdoc Components for Keystatic Collections
 * REQ-KEYSTATIC-001: Modular config structure
 * REQ-CMS-003: Container Width/Height/Background Options
 *
 * These components are used in both pages and staff collections.
 */
import { fields } from "@keystatic/core";
import {
  LUCIDE_ICON_OPTIONS,
  CTA_TEXT_COLOR_OPTIONS,
  BACKGROUND_COLOR_OPTIONS,
} from "../constants";

// REQ-CMS-004: Icon Size Options
const ICON_SIZE_OPTIONS = [
  { label: "Small (16px)", value: "sm" },
  { label: "Medium (24px)", value: "md" },
  { label: "Large (32px)", value: "lg" },
  { label: "Extra Large (48px)", value: "xl" },
] as const;

// REQ-CMS-003: Shared container dimension fields
// REQ-UAT-017: Width options include Auto, 25%, 50%, 75%, 100%, Custom
export const containerWidthField = fields.select({
  label: "Width",
  options: [
    { label: "Auto", value: "auto" },
    { label: "25%", value: "25" },
    { label: "50%", value: "50" },
    { label: "60%", value: "60" },
    { label: "75%", value: "75" },
    { label: "100%", value: "100" },
    { label: "Custom", value: "custom" },
  ],
  defaultValue: "auto",
});

// REQ-UAT-017: Custom width field for when "Custom" is selected
export const containerCustomWidthField = fields.text({
  label: "Custom Width",
  description: "Enter custom width (e.g., 320px, 45%, 80vw). Only used when Width is set to Custom.",
});

export const containerHeightField = fields.select({
  label: "Height",
  options: [
    { label: "Auto", value: "auto" },
    { label: "Small (200px)", value: "200" },
    { label: "Medium (400px)", value: "400" },
    { label: "Large (600px)", value: "600" },
  ],
  defaultValue: "auto",
});

// REQ-UAT-017: Background color presets with theme colors
// P1-05: Derives from BACKGROUND_COLOR_OPTIONS with added "Custom" option
export const CONTAINER_BG_COLOR_PRESETS = [
  ...BACKGROUND_COLOR_OPTIONS,
  { label: "Custom", value: "custom" },
] as const;

export const containerBackgroundPresetField = fields.select({
  label: "Background Color",
  description: "Choose a theme preset or select Custom to enter a hex code",
  options: [...CONTAINER_BG_COLOR_PRESETS],
  defaultValue: "",
});

export const containerBackgroundColorField = fields.text({
  label: "Custom Background Color",
  description:
    "Hex color code (e.g., #f5f0e8 for cream, #e8f5e9 for light green). Only used when Background Color is set to Custom.",
});

// REQ-UAT-017: Background image picker option
export const containerBackgroundImageField = fields.text({
  label: "Background Image Path",
  description: "Path to background image (e.g., /images/backgrounds/photo.jpg). Takes priority over background color.",
  defaultValue: "",
});

// REQ-404: Image Component
// REQ-CMS-006: Improved field descriptions for usability
export const imageComponent = {
  label: "Image",
  description: "Insert an image with optional caption",
  kind: "wrapper" as const,
  schema: {
    src: fields.text({
      label: "Image Path",
      description: "Path to image (e.g., /images/content/photo.jpg)",
      defaultValue: "",
    }),
    alt: fields.text({
      label: "Alt Text",
      description:
        "Describe the image for screen reader users (e.g., 'Campers gathered around a bonfire at sunset')",
    }),
    caption: fields.text({
      label: "Caption",
      description: "Optional text displayed below the image",
      defaultValue: "",
    }),
  },
};

// REQ-405: Call-to-Action Component
// REQ-CMS-006: Improved field descriptions for usability
export const ctaComponent = {
  label: "Call to Action",
  description: "Add a prominent call-to-action section",
  kind: "wrapper" as const,
  schema: {
    heading: fields.text({
      label: "Heading",
      description: "Main call-to-action headline",
    }),
    text: fields.text({
      label: "Supporting Text",
      description: "Brief description encouraging the action",
      multiline: true,
    }),
    buttonText: fields.text({
      label: "Button Text",
      description: 'Action text (e.g., "Register Now", "Learn More")',
    }),
    buttonLink: fields.text({
      label: "Button Link",
      description: "URL or page path (e.g., /summer-camp or https://example.com)",
    }),
  },
};

// REQ-406: Feature Grid Component
// REQ-CMS-006: Improved field descriptions for usability
export const featuresComponent = {
  label: "Feature Grid",
  description: "Display features in a 3-column grid",
  kind: "wrapper" as const,
  schema: {
    features: fields.array(
      fields.object({
        icon: fields.select({
          label: "Icon",
          description: "Lucide icon to represent this feature",
          options: [...LUCIDE_ICON_OPTIONS],
          defaultValue: "",
        }),
        title: fields.text({
          label: "Feature Title",
          description: "Short, compelling title",
        }),
        description: fields.text({
          label: "Description",
          description: "Brief explanation of the feature",
        }),
      }),
      {
        label: "Features",
        itemLabel: (props) => props.fields.title.value || "Feature",
      },
    ),
  },
};

// REQ-407: Photo Gallery Component
// REQ-CMS-006: Improved field descriptions for usability
export const galleryComponent = {
  label: "Photo Gallery",
  description: "Add a responsive photo gallery",
  kind: "wrapper" as const,
  schema: {
    images: fields.array(
      fields.object({
        image: fields.text({
          label: "Image Path",
          description: "Path to image (e.g., /images/gallery/photo.jpg)",
          defaultValue: "",
        }),
        alt: fields.text({
          label: "Alt Text",
          description: "Describe the image for screen reader users",
        }),
        caption: fields.text({
          label: "Caption",
          description: "Optional text shown below the image",
          defaultValue: "",
        }),
      }),
      {
        label: "Gallery Images",
        itemLabel: (props) => props.fields.alt.value || "Gallery Image",
      },
    ),
    columns: fields.integer({
      label: "Columns",
      description: "Number of columns in the gallery grid (default: 3)",
      defaultValue: 3,
    }),
  },
};

// REQ-408: YouTube Component
// REQ-CMS-006: Improved field descriptions for usability
export const youtubeComponent = {
  label: "YouTube Video",
  description: "Embed a YouTube video",
  kind: "wrapper" as const,
  schema: {
    id: fields.text({
      label: "Video ID",
      description:
        'The ID from the YouTube URL (e.g., for youtube.com/watch?v=dQw4w9WgXcQ, enter "dQw4w9WgXcQ")',
    }),
    title: fields.text({
      label: "Video Title",
      description:
        "Descriptive title for accessibility (read by screen readers)",
    }),
    maxWidth: fields.select({
      label: "Max Width",
      description: "Maximum width of the video player",
      options: [
        { label: "Small (576px)", value: "sm" },
        { label: "Medium (768px)", value: "md" },
        { label: "Large (1024px)", value: "lg" },
        { label: "Full Width", value: "full" },
      ],
      defaultValue: "md",
    }),
  },
};

// REQ-409: Testimonial Component
// REQ-CMS-006: Improved field descriptions for usability
export const testimonialComponent = {
  label: "Testimonial",
  description: "Add a testimonial with quote and author",
  kind: "wrapper" as const,
  schema: {
    quote: fields.text({
      label: "Quote",
      description: "The testimonial text (without quotation marks)",
      multiline: true,
    }),
    author: fields.text({
      label: "Author Name",
      description: "Full name of the person giving the testimonial",
    }),
    role: fields.text({
      label: "Role or Relationship",
      description: 'E.g., "Parent of 2023 Camper" or "Former Staff Member"',
    }),
    photo: fields.text({
      label: "Author Photo Path",
      description: "Path to headshot (e.g., /images/testimonials/photo.jpg)",
      defaultValue: "",
    }),
  },
};

// REQ-410: Accordion Component
// REQ-CMS-006: Improved field descriptions for usability
export const accordionComponent = {
  label: "Simple Accordion",
  description: "Add a self-contained accordion with inline Q&A items (for quick lists)",
  kind: "wrapper" as const,
  schema: {
    items: fields.array(
      fields.object({
        question: fields.text({
          label: "Question",
          description: "The question visitors might ask",
        }),
        answer: fields.text({
          label: "Answer",
          description: "The response - keep it clear and helpful",
          multiline: true,
        }),
      }),
      {
        label: "FAQ Items",
        itemLabel: (props) => props.fields.question.value || "FAQ Item",
      },
    ),
  },
};

// REQ-CONTENT-007: Donate Button
// REQ-CMS-004: Added iconSize option
export const donateButtonComponent = {
  label: "Donate Button",
  description: "Add a donation call-to-action button",
  kind: "wrapper" as const,
  schema: {
    label: fields.text({
      label: "Button Text",
      description: "Text displayed on the button",
      defaultValue: "Donate Now",
    }),
    icon: fields.select({
      label: "Icon",
      description: "Lucide icon to display",
      options: [...LUCIDE_ICON_OPTIONS],
      defaultValue: "Heart",
    }),
    iconSize: fields.select({
      label: "Icon Size",
      options: [...ICON_SIZE_OPTIONS],
      defaultValue: "md",
    }),
    variant: fields.select({
      label: "Button Style",
      options: [
        { label: "Primary", value: "primary" },
        { label: "Secondary", value: "secondary" },
        { label: "Outline", value: "outline" },
      ],
      defaultValue: "primary",
    }),
    href: fields.url({
      label: "Donation Link",
      description: "URL to donation page",
    }),
    external: fields.checkbox({
      label: "Open in new tab",
      defaultValue: true,
    }),
  },
};

// REQ-U03-FIX-008: CTA Section for full-width colored sections
export const ctaSectionComponent = {
  label: "CTA Section",
  description:
    "Full-width colored section with heading, description, and button",
  kind: "wrapper" as const,
  schema: {
    heading: fields.text({
      label: "Heading",
      description: "Section heading text",
    }),
    description: fields.text({
      label: "Description",
      description: "Description text below heading",
      multiline: true,
    }),
    buttonLabel: fields.text({
      label: "Button Label",
      description: "Text on the call-to-action button",
    }),
    buttonHref: fields.text({
      label: "Button Link",
      description: "URL for the button",
    }),
    variant: fields.select({
      label: "Color Variant",
      options: [
        { label: "Green (Scholarships)", value: "green" },
        { label: "Brown (Register)", value: "brown" },
      ],
      defaultValue: "green",
    }),
    external: fields.checkbox({
      label: "Open in new tab",
      defaultValue: false,
    }),
  },
};

// REQ-DESIGN-001: Content Card
// REQ-CMS-003: Added width, height, backgroundColor options
// REQ-CMS-004: Added iconSize option
export const contentCardComponent = {
  label: "Content Card",
  description: "A card component for highlighting content",
  kind: "wrapper" as const,
  schema: {
    icon: fields.select({
      label: "Icon (optional)",
      description: "Lucide icon to display",
      options: [...LUCIDE_ICON_OPTIONS],
      defaultValue: "",
    }),
    iconSize: fields.select({
      label: "Icon Size",
      options: [...ICON_SIZE_OPTIONS],
      defaultValue: "md",
    }),
    title: fields.text({
      label: "Card Title (optional)",
      description: "Title for the card",
      defaultValue: "",
    }),
    headingLevel: fields.select({
      label: "Heading Level",
      options: [
        { label: "H2", value: "2" },
        { label: "H3", value: "3" },
        { label: "H4", value: "4" },
        { label: "H5", value: "5" },
        { label: "H6", value: "6" },
      ],
      defaultValue: "3",
    }),
    width: containerWidthField,
    height: containerHeightField,
    backgroundColor: fields.select({
      label: "Background Color",
      description: "Choose from theme colors",
      options: [...BACKGROUND_COLOR_OPTIONS],
      defaultValue: "",
    }),
  },
};

// Info Card Component (used for grid of cards with headings and lists)
// REQ-CMS-004: Added iconSize option
export const infoCardComponent = {
  label: "Info Card",
  description:
    "A card with heading, icon, and list items (used in info-card-grid)",
  kind: "wrapper" as const,
  schema: {
    icon: fields.select({
      label: "Icon",
      description: "Lucide icon to display",
      options: [...LUCIDE_ICON_OPTIONS],
      defaultValue: "",
    }),
    iconSize: fields.select({
      label: "Icon Size",
      options: [...ICON_SIZE_OPTIONS],
      defaultValue: "lg",
    }),
    heading: fields.text({
      label: "Card Heading",
      description: "Heading for the card",
    }),
    items: fields.array(
      fields.text({
        label: "List Item",
      }),
      {
        label: "List Items",
        itemLabel: (props) => props.value || "Item",
      },
    ),
  },
};

// CTA Button Component (for call-to-action buttons in content)
// Note: Pages version has textColor field, staff version does not
export const ctaButtonComponentBase = {
  label: "CTA Button",
  description: "Add a call-to-action button",
  kind: "inline" as const,
  schema: {
    label: fields.text({
      label: "Button Text",
      description: "Text displayed on the button",
    }),
    href: fields.text({
      label: "Link URL",
      description: "URL the button links to",
    }),
    variant: fields.select({
      label: "Variant",
      options: [
        { label: "Primary", value: "primary" },
        { label: "Secondary", value: "secondary" },
        { label: "Outline", value: "outline" },
      ],
      defaultValue: "primary",
    }),
    size: fields.select({
      label: "Size",
      options: [
        { label: "Small", value: "sm" },
        { label: "Medium", value: "md" },
        { label: "Large", value: "lg" },
      ],
      defaultValue: "lg",
    }),
    align: fields.select({
      label: "Alignment",
      description: "Horizontal alignment of the button",
      options: [
        { label: "Left", value: "left" },
        { label: "Center", value: "center" },
        { label: "Right", value: "right" },
      ],
      defaultValue: "left",
    }),
  },
};

// Extended CTA Button with textColor (for pages)
export const ctaButtonComponentWithColor = {
  ...ctaButtonComponentBase,
  schema: {
    ...ctaButtonComponentBase.schema,
    variant: fields.select({
      label: "Variant",
      options: [
        { label: "Primary", value: "primary" },
        { label: "Secondary", value: "secondary" },
        { label: "Outline", value: "outline" },
        { label: "Inverse (transparent)", value: "inverse" },
      ],
      defaultValue: "primary",
    }),
    textColor: fields.select({
      label: "Text Color",
      description: "Text color for the button",
      options: [...CTA_TEXT_COLOR_OPTIONS],
      defaultValue: "",
    }),
  },
};

// FAQ Accordion wrapper (for nested faqItem tags)
export const faqAccordionComponent = {
  label: "FAQ Accordion",
  description: "Container for FAQ items that expand/collapse",
  kind: "wrapper" as const,
  schema: {
    title: fields.text({
      label: "Title",
      description: 'Heading shown above the FAQ section (e.g., "Summer Staff FAQ")',
      defaultValue: "Frequently Asked Questions",
    }),
    titleAlign: fields.select({
      label: "Title Alignment",
      description: "Horizontal alignment of the FAQ section title",
      options: [
        { label: "Left", value: "left" },
        { label: "Center", value: "center" },
        { label: "Right", value: "right" },
      ],
      defaultValue: "left",
    }),
    allowMultiple: fields.checkbox({
      label: "Allow Multiple Open",
      description: "Allow multiple FAQ items to be open at once",
      defaultValue: false,
    }),
  },
};

// FAQ Item (nested inside faqAccordion)
// REQ-U03-FIX-010: Changed from 'inline' to 'wrapper' to allow child content
// REQ-CMS-006: Improved field descriptions for usability
export const faqItemComponent = {
  label: "FAQ Item",
  description: "A single FAQ question and answer",
  kind: "wrapper" as const,
  schema: {
    question: fields.text({
      label: "Question",
      description: 'The question visitors might ask (e.g., "What should I pack?")',
    }),
    answer: fields.text({
      label: "Answer",
      description: "The answer to the question - keep it clear and concise",
      multiline: true,
    }),
    category: fields.text({
      label: "Category",
      description:
        'Optional grouping (e.g., "Registration", "Packing", "Health"). Leave empty if not grouping.',
    }),
  },
};

// Card Grid (for laying out cards in columns)
// REQ-CMS-003: Added width, height, backgroundColor options
export const cardGridComponent = {
  label: "Card Grid",
  description: "Layout cards in a grid",
  kind: "wrapper" as const,
  schema: {
    cols: fields.select({
      label: "Columns",
      options: [
        { label: "2 Columns", value: "2" },
        { label: "3 Columns", value: "3" },
        { label: "4 Columns", value: "4" },
      ],
      defaultValue: "2",
    }),
    width: containerWidthField,
    height: containerHeightField,
    backgroundColor: fields.select({
      label: "Background Color",
      description: "Choose from theme colors",
      options: [...BACKGROUND_COLOR_OPTIONS],
      defaultValue: "",
    }),
  },
};

// REQ-CMS-003: Section card width options
const SECTION_CARD_WIDTH_OPTIONS = [
  { label: "Auto (full)", value: "auto" },
  { label: "50%", value: "50" },
  { label: "60%", value: "60" },
  { label: "75%", value: "75" },
  { label: "100%", value: "100" },
] as const;

// Section Card (for position/feature cards with links)
// REQ-CMS-003: Added width option
// REQ-CMS-006: Improved field descriptions for usability
export const sectionCardComponent = {
  label: "Section Card",
  description: "A card with title, content, and optional link",
  kind: "wrapper" as const,
  schema: {
    title: fields.text({
      label: "Card Title",
      description: "The heading displayed at the top of the card",
    }),
    linkHref: fields.text({
      label: "Link URL",
      description: "Where to go when clicked (e.g., /about or https://example.com)",
    }),
    linkText: fields.text({
      label: "Link Text",
      description: 'Text for the link (e.g., "Learn More", "Read Full Story")',
      defaultValue: "Learn More",
    }),
    variant: fields.select({
      label: "Card Style",
      description: "Elevated adds a shadow effect",
      options: [
        { label: "Flat (no shadow)", value: "default" },
        { label: "Elevated (with shadow)", value: "elevated" },
      ],
      defaultValue: "default",
    }),
    background: fields.select({
      label: "Background Style",
      options: [
        { label: "Light", value: "light" },
        { label: "Dark", value: "dark" },
        { label: "Transparent", value: "none" },
      ],
      defaultValue: "none",
    }),
    width: fields.select({
      label: "Card Width",
      description: "How wide the card should be (60% recommended for centered content)",
      options: [...SECTION_CARD_WIDTH_OPTIONS],
      defaultValue: "auto",
    }),
  },
};

// Contact Form Component
export const contactFormComponent = {
  label: "Contact Form",
  description: "Embed the contact form with Turnstile captcha",
  kind: "inline" as const,
  schema: {},
};

// REQ-HOME-004: Camp Session Card Component
export const campSessionCardComponent = {
  label: "Camp Session Card",
  description: "Card with image, heading, bullets, and CTA for camp sessions",
  kind: "inline" as const,
  schema: {
    image: fields.text({
      label: "Card Image Path",
      description: "Path to card image (e.g., /images/sessions/photo.jpg)",
      defaultValue: "",
    }),
    imageAlt: fields.text({
      label: "Image Alt Text",
      description: "Accessible description of the image",
    }),
    heading: fields.text({
      label: "Session Name",
      description: "E.g., 'Jr. High Camp'",
    }),
    subheading: fields.text({
      label: "Age Group",
      description: "E.g., 'Rising 7th-9th Graders'",
      defaultValue: "",
    }),
    bulletType: fields.select({
      label: "Bullet Style",
      options: [
        { label: "Checkmark", value: "checkmark" },
        { label: "Bullet", value: "bullet" },
        { label: "Diamond", value: "diamond" },
        { label: "Numbers", value: "numbers" },
      ],
      defaultValue: "checkmark",
    }),
    bullets: fields.array(fields.text({ label: "Bullet Item" }), {
      label: "Features",
      itemLabel: (props) => props.value || "Feature",
    }),
    ctaLabel: fields.text({
      label: "Button Text",
      defaultValue: "See Dates & Pricing",
    }),
    ctaHref: fields.text({
      label: "Button Link",
      description: "URL the button links to",
    }),
  },
};

// REQ-COMP-001: Camp Session Card Grid (responsive grid for session cards)
export const campSessionCardGridComponent = {
  label: "Camp Session Cards",
  description: "Grid container for camp session cards with responsive layout",
  kind: "wrapper" as const,
  schema: {
    columns: fields.select({
      label: "Columns (Desktop)",
      options: [
        { label: "2 Columns", value: "2" },
        { label: "3 Columns", value: "3" },
        { label: "4 Columns", value: "4" },
      ],
      defaultValue: "4",
    }),
    gap: fields.select({
      label: "Gap",
      options: [
        { label: "Small", value: "sm" },
        { label: "Medium", value: "md" },
        { label: "Large", value: "lg" },
      ],
      defaultValue: "md",
    }),
  },
};

// REQ-HOME-005: Work At Camp Section for homepage
export const workAtCampSectionComponent = {
  label: "Work At Camp Section",
  description:
    "Section highlighting 3 work programs with icons, titles, descriptions, and links",
  kind: "wrapper" as const,
  schema: {
    heading: fields.text({
      label: "Section Heading",
      description: "Main heading for the section",
      defaultValue: "Work at Camp",
    }),
    subheading: fields.text({
      label: "Subheading",
      description: "Optional subheading below the main heading",
      defaultValue: "",
    }),
    items: fields.array(
      fields.object({
        icon: fields.select({
          label: "Icon",
          description: "Lucide icon to display",
          options: [...LUCIDE_ICON_OPTIONS],
          defaultValue: "Users",
        }),
        title: fields.text({
          label: "Title",
          description: "Program title (e.g., 'Summer Staff')",
        }),
        description: fields.text({
          label: "Description",
          description: "Brief description of the program",
          multiline: true,
        }),
        linkHref: fields.text({
          label: "Link URL",
          description: "URL to the program page",
        }),
        linkLabel: fields.text({
          label: "Link Label",
          description: "Text for the link button",
          defaultValue: "Learn More",
        }),
      }),
      {
        label: "Work Programs",
        itemLabel: (props) => props.fields.title.value || "Work Program",
      },
    ),
  },
};

// REQ-HOME-006: Wide Card Component for homepage sections (Retreats/Rentals)
export const wideCardComponent = {
  label: "Wide Card",
  description:
    "Full-width card with image and content side-by-side (for Retreats/Rentals)",
  kind: "inline" as const,
  schema: {
    image: fields.text({
      label: "Card Image Path",
      description: "Path to card image (e.g., /images/rentals/photo.jpg)",
      defaultValue: "",
    }),
    imageAlt: fields.text({
      label: "Image Alt Text",
      description: "Accessible description of the image",
    }),
    imagePosition: fields.select({
      label: "Image Position",
      options: [
        { label: "Left", value: "left" },
        { label: "Right", value: "right" },
      ],
      defaultValue: "left",
    }),
    heading: fields.text({
      label: "Heading",
      description: "Card heading text",
    }),
    description: fields.text({
      label: "Description",
      description: "Card description text",
      multiline: true,
    }),
    ctaLabel: fields.text({
      label: "Button Text",
      defaultValue: "Learn More",
    }),
    ctaHref: fields.text({
      label: "Button Link",
      description: "URL the button links to",
    }),
    backgroundColor: fields.select({
      label: "Background Color",
      description: "Choose a background color for the card",
      options: [...BACKGROUND_COLOR_OPTIONS],
      defaultValue: "#f5f0e8",
    }),
  },
};

// REQ-TRUST-001: TrustBar Markdoc Component (uses child tag pattern)
// P1-05: Unified to use BACKGROUND_COLOR_OPTIONS from constants
export const trustBarMarkdocComponent = {
  label: "Trust Bar",
  description:
    "Horizontal bar with trust signals (icons + text). Add TrustBarItem children.",
  kind: "wrapper" as const,
  schema: {
    backgroundColor: fields.select({
      label: "Background Color",
      description: "Choose from theme colors",
      options: [...BACKGROUND_COLOR_OPTIONS],
      defaultValue: "#2F4F3D",
    }),
  },
};

// REQ-TRUST-001: Child component for TrustBar items
export const trustBarItemComponent = {
  label: "Trust Bar Item",
  description: "Single trust signal (icon + text)",
  kind: "inline" as const,
  schema: {
    icon: fields.select({
      label: "Icon",
      options: [...LUCIDE_ICON_OPTIONS],
      defaultValue: "Calendar",
    }),
    text: fields.text({
      label: "Text",
      description: "Short trust signal (max 30 characters)",
    }),
  },
};

// Text color options for MissionSection
const MISSION_TEXT_COLOR_OPTIONS = [
  { label: "Cream", value: "cream" },
  { label: "Cream (90%)", value: "cream/90" },
  { label: "Accent Light", value: "accent-light" },
  { label: "White", value: "white" },
  { label: "Dark (Bark)", value: "bark" },
] as const;

// Font family options for MissionSection
const MISSION_FONT_OPTIONS = [
  { label: "Body", value: "body" },
  { label: "Heading", value: "heading" },
  { label: "Handwritten", value: "handwritten" },
] as const;

// Font size options for MissionSection
const MISSION_SIZE_OPTIONS = [
  { label: "Body Text (lg)", value: "lg" },
  { label: "Subheading (xl)", value: "xl" },
  { label: "Large (2xl)", value: "2xl" },
  { label: "Section Title (3xl)", value: "3xl" },
  { label: "Page Title (5xl)", value: "5xl" },
  { label: "Hero (6xl)", value: "6xl" },
] as const;

// Overlay opacity options for MissionSection
const MISSION_OVERLAY_OPTIONS = [
  { label: "Light (20%)", value: "20" },
  { label: "Medium (40%) - Recommended", value: "40" },
  { label: "Dark (60%)", value: "60" },
] as const;

// REQ-MISSION-001: MissionSection Markdoc Component
export const missionSectionComponent = {
  label: "Mission Section",
  description:
    "Full-width mission section with background image and parallax support",
  kind: "inline" as const,
  schema: {
    line1Text: fields.text({
      label: "Line 1 Text",
      description: "Kicker text (e.g., 'Our Mission')",
    }),
    line1Font: fields.select({
      label: "Line 1 Font",
      options: [...MISSION_FONT_OPTIONS],
      defaultValue: "handwritten",
    }),
    line1Size: fields.select({
      label: "Line 1 Size",
      options: [...MISSION_SIZE_OPTIONS],
      defaultValue: "2xl",
    }),
    line1Color: fields.select({
      label: "Line 1 Color",
      options: [...MISSION_TEXT_COLOR_OPTIONS],
      defaultValue: "accent-light",
    }),
    line2Text: fields.text({
      label: "Line 2 Text",
      description: "Main heading (e.g., 'Faith. Adventure. Transformation.')",
    }),
    line2Font: fields.select({
      label: "Line 2 Font",
      options: [...MISSION_FONT_OPTIONS],
      defaultValue: "heading",
    }),
    line2Size: fields.select({
      label: "Line 2 Size",
      options: [...MISSION_SIZE_OPTIONS],
      defaultValue: "5xl",
    }),
    line2Color: fields.select({
      label: "Line 2 Color",
      options: [...MISSION_TEXT_COLOR_OPTIONS],
      defaultValue: "cream",
    }),
    line2Bold: fields.checkbox({
      label: "Line 2 Bold",
      defaultValue: true,
    }),
    line3Text: fields.text({
      label: "Line 3 Text",
      description: "Full mission description",
      multiline: true,
    }),
    line3Font: fields.select({
      label: "Line 3 Font",
      options: [...MISSION_FONT_OPTIONS],
      defaultValue: "body",
    }),
    line3Size: fields.select({
      label: "Line 3 Size",
      options: [...MISSION_SIZE_OPTIONS],
      defaultValue: "lg",
    }),
    line3Color: fields.select({
      label: "Line 3 Color",
      options: [...MISSION_TEXT_COLOR_OPTIONS],
      defaultValue: "cream/90",
    }),
    backgroundImage: fields.text({
      label: "Background Image Path",
      description: "Path to background image (e.g., /images/homepage/photo.jpg)",
      defaultValue: "",
    }),
    overlayOpacity: fields.select({
      label: "Overlay Opacity",
      description: "Darkness of the overlay for text readability",
      options: [...MISSION_OVERLAY_OPTIONS],
      defaultValue: "40",
    }),
    enableParallax: fields.checkbox({
      label: "Enable Parallax",
      description: "Enable parallax scrolling effect (desktop only)",
      defaultValue: true,
    }),
  },
};

// REQ-BUG9: Document Link component for embedding downloadable file links
const documentLinkComponent = {
  label: "Document Link",
  description: "Embed a downloadable document link (PDF, DOCX, XLSX)",
  kind: "inline" as const,
  schema: {
    href: fields.text({
      label: "File Path",
      description: "Path to document (e.g., /documents/camp-handbook.pdf)",
    }),
    label: fields.text({
      label: "Link Label",
      description: "Display text for the download link",
    }),
    description: fields.text({
      label: "Description (optional)",
      description: "Brief description of the document",
      defaultValue: "",
    }),
    fileSize: fields.text({
      label: "File Size (optional)",
      description: "E.g., \"2.4 MB\"",
      defaultValue: "",
    }),
  },
};

// Testimonial Widget - pulls from testimonials collection or displays inline
export const testimonialWidgetComponent = {
  label: "Testimonial Widget",
  description:
    "Display a testimonial from the collection (random) or inline (specific)",
  kind: "inline" as const,
  schema: {
    mode: fields.select({
      label: "Mode",
      description: "Random picks from collection; Specific uses fields below",
      options: [
        { label: "Random from Collection", value: "random" },
        { label: "Specific (inline)", value: "specific" },
      ],
      defaultValue: "random",
    }),
    quote: fields.text({
      label: "Quote (specific mode only)",
      description: "The testimonial text",
      multiline: true,
    }),
    author: fields.text({
      label: "Author (specific mode only)",
      description: "Name of the person",
    }),
    role: fields.text({
      label: "Role (specific mode only)",
      description: 'E.g., "Former Summer Staff"',
    }),
  },
};

// Self-closing section heading with alignment control
// Solves the problem of centering headings independently inside non-centered sections
// (wrapper-in-wrapper doesn't work in Keystatic's editor)
export const sectionHeadingComponent = {
  label: "Section Heading",
  description: "A standalone heading with alignment control (works inside any section)",
  kind: "inline" as const,
  schema: {
    text: fields.text({
      label: "Heading Text",
      description: "The heading text to display",
    }),
    level: fields.select({
      label: "Heading Level",
      options: [
        { label: "H2", value: "2" },
        { label: "H3", value: "3" },
        { label: "H4", value: "4" },
      ],
      defaultValue: "2",
    }),
    align: fields.select({
      label: "Alignment",
      options: [
        { label: "Left", value: "left" },
        { label: "Center", value: "center" },
        { label: "Right", value: "right" },
      ],
      defaultValue: "center",
    }),
  },
};

// Text alignment wrapper for centering or aligning content blocks
const textAlignComponent = {
  label: "Text Align",
  description: "Wrap content to align it left, center, or right",
  kind: "wrapper" as const,
  schema: {
    align: fields.select({
      label: "Alignment",
      options: [
        { label: "Left", value: "left" },
        { label: "Center", value: "center" },
        { label: "Right", value: "right" },
      ],
      defaultValue: "center",
    }),
  },
};

// Base shared components used in both pages and staff
export const sharedComponents = {
  image: imageComponent,
  cta: ctaComponent,
  features: featuresComponent,
  gallery: galleryComponent,
  youtube: youtubeComponent,
  testimonial: testimonialComponent,
  accordion: accordionComponent,
  donateButton: donateButtonComponent,
  ctaSection: ctaSectionComponent,
  contentCard: contentCardComponent,
  infoCard: infoCardComponent,
  faqAccordion: faqAccordionComponent,
  faqItem: faqItemComponent,
  cardGrid: cardGridComponent,
  sectionCard: sectionCardComponent,
  ContactForm: contactFormComponent,
  campSessionCard: campSessionCardComponent,
  campSessionCardGrid: campSessionCardGridComponent,
  workAtCampSection: workAtCampSectionComponent,
  wideCard: wideCardComponent,
  trustBarMarkdoc: trustBarMarkdocComponent,
  trustBarItem: trustBarItemComponent,
  missionSection: missionSectionComponent,
  documentLink: documentLinkComponent,
  testimonialWidget: testimonialWidgetComponent,
  textAlign: textAlignComponent,
  sectionHeading: sectionHeadingComponent,
};
