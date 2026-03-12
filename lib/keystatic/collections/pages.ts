/**
 * Pages Collection for Keystatic
 * REQ-KEYSTATIC-001: Modular config structure
 * REQ-CMS-003: Container Width/Height/Background Options
 */
import { fields, collection } from "@keystatic/core";
import {
  LUCIDE_ICON_OPTIONS,
  BACKGROUND_COLOR_OPTIONS,
  TEXT_COLOR_OPTIONS,
} from "../constants";
import {
  sharedComponents,
  ctaButtonComponentWithColor,
  containerWidthField,
  containerHeightField,
  containerBackgroundColorField,
} from "./shared-components";

export const pages = collection({
  label: "Pages",
  slugField: "title",
  path: "content/pages/*",
  format: { contentField: "body" },
  schema: {
    title: fields.slug({
      name: { label: "Page Title" },
    }),

    // Bug 5: Hero fields wrapped in collapsible object group
    hero: fields.object(
      {
        heroImage: fields.text({
          label: "Hero Image Path",
          description:
            "Path to hero image (e.g., summer-program-and-general/photo.jpg). Used as fallback if no video.",
          defaultValue: "",
        }),

        heroVideo: fields.text({
          label: "Hero Video Path",
          description:
            "Path to hero video (e.g., /videos/hero-home.mp4). If set, displays video instead of image.",
          defaultValue: "",
        }),

        // REQ-SUMMER-001: YouTube Hero Video support
        heroYouTubeId: fields.text({
          label: "Hero YouTube Video ID",
          description:
            'YouTube video ID or URL for hero background (e.g., "dQw4w9WgXcQ" or full URL). Takes priority over heroVideo and heroImage.',
          defaultValue: "",
        }),

        heroTagline: fields.text({
          label: "Hero Tagline",
          description:
            'Short text overlay on hero image (e.g., "To Know Christ - Phil. 3:10")',
          defaultValue: "",
        }),

        // REQ-BRING-001: Hero height control for images that need more vertical space
        heroHeight: fields.select({
          label: "Hero Height",
          description:
            "Control the hero image height. Use 'tall' for images where heads are cut off.",
          options: [
            { label: "None (no hero)", value: "none" },
            { label: "Standard (480px)", value: "standard" },
            { label: "Medium (576px)", value: "medium" },
            { label: "Tall (672px)", value: "tall" },
            { label: "Extra Tall (768px)", value: "xtall" },
            { label: "Full Screen", value: "full" },
          ],
          defaultValue: "standard",
        }),
      },
      { label: "Hero Section" },
    ),

    // Template selection: standard or fullbleed layout
    templateFields: fields.conditional(
      fields.select({
        label: "Page Template",
        description: "Choose the layout type for this page",
        options: [
          { label: "Standard Page", value: "standard" },
          { label: "Full-Width Hero Page", value: "fullbleed" },
        ],
        defaultValue: "standard",
      }),
      {
        standard: fields.empty(),
        fullbleed: fields.empty(),
      },
    ),

    body: fields.markdoc({
      label: "Page Content",
      description:
        "Main content - write your page text here with headings and formatting",
      components: {
        // Shared components
        ...sharedComponents,

        // Override ctaButton with version that has textColor
        ctaButton: ctaButtonComponentWithColor,

        // Modern Design Components (Cho-Yeh inspired)

        // Section with background color
        // REQ-CMS-003: Added width, height, customBackgroundColor options
        // P1-05: Removed dead fields (themeBackgroundColor, backgroundImage) not consumed by ColoredSection
        section: {
          label: "Colored Section",
          description:
            "Create a section with colored background (inspired by modern camp designs)",
          kind: "wrapper",
          schema: {
            backgroundColor: fields.select({
              label: "Background Color",
              description: "Choose a background color for this section",
              options: [
                { label: "White", value: "white" },
                { label: "Cream", value: "cream" },
                { label: "Primary Blue", value: "primary" },
                { label: "Secondary Green", value: "secondary" },
                { label: "Accent Brown", value: "accent" },
                { label: "Bark (Dark Brown)", value: "bark" },
              ],
              defaultValue: "white",
            }),
            centered: fields.checkbox({
              label: "Center content",
              description: "Center text and constrain width",
              defaultValue: true,
            }),
            width: containerWidthField,
            height: containerHeightField,
            customBackgroundColor: containerBackgroundColorField,
          },
        },

        // Inset content box
        // REQ-CMS-003: Added width, height, customBackgroundColor options
        // P1-05: Removed dead fields (themeBackgroundColor, backgroundImage) not consumed by ContentBox
        contentBox: {
          label: "Content Box",
          description:
            "Create an inset box with background (great for highlighting content)",
          kind: "wrapper",
          schema: {
            style: fields.select({
              label: "Box Style",
              options: [
                { label: "White Card", value: "white" },
                { label: "Light Background", value: "light" },
                { label: "Colored Card", value: "colored" },
                { label: "With Border", value: "bordered" },
              ],
              defaultValue: "white",
            }),
            padding: fields.select({
              label: "Padding Size",
              options: [
                { label: "Small", value: "sm" },
                { label: "Medium", value: "md" },
                { label: "Large", value: "lg" },
              ],
              defaultValue: "md",
            }),
            width: containerWidthField,
            height: containerHeightField,
          },
        },

        // Stats/Metrics section
        stats: {
          label: "Stats & Metrics",
          description:
            'Display key numbers and metrics (e.g., "By the Numbers")',
          kind: "wrapper",
          schema: {
            heading: fields.text({
              label: "Section Heading",
              description: 'E.g., "By the Numbers"',
            }),
            items: fields.array(
              fields.object({
                number: fields.text({
                  label: "Number/Stat",
                  description: 'E.g., "500+" or "50 years"',
                }),
                label: fields.text({
                  label: "Label",
                  description: 'E.g., "Campers served annually"',
                }),
                description: fields.text({
                  label: "Description (optional)",
                  defaultValue: "",
                }),
              }),
              {
                label: "Stats",
                itemLabel: (props) => props.fields.label.value || "Stat",
              },
            ),
            layout: fields.select({
              label: "Layout",
              options: [
                { label: "2 Columns", value: "two" },
                { label: "3 Columns", value: "three" },
                { label: "4 Columns", value: "four" },
              ],
              defaultValue: "three",
            }),
          },
        },

        // Value proposition cards
        valueCards: {
          label: "Value Cards",
          description:
            "Display value propositions or key features with icons/images",
          kind: "wrapper",
          schema: {
            heading: fields.text({
              label: "Section Heading",
              description: 'E.g., "Why Choose Bear Lake?"',
            }),
            cards: fields.array(
              fields.object({
                image: fields.text({
                  label: "Card Image Path",
                  description:
                    "Path to card image (e.g., /images/cards/photo.jpg)",
                  defaultValue: "",
                }),
                icon: fields.select({
                  label: "Icon (optional)",
                  description: "Lucide icon as alternative to image",
                  options: [...LUCIDE_ICON_OPTIONS],
                  defaultValue: "",
                }),
                title: fields.text({ label: "Card Title" }),
                description: fields.text({
                  label: "Description",
                  multiline: true,
                }),
              }),
              {
                label: "Value Cards",
                itemLabel: (props) => props.fields.title.value || "Card",
              },
            ),
            columns: fields.select({
              label: "Columns",
              options: [
                { label: "2 Columns", value: "two" },
                { label: "3 Columns", value: "three" },
              ],
              defaultValue: "three",
            }),
          },
        },

        // Position/role cards
        positionCards: {
          label: "Position Cards",
          description: "Display job positions or roles (great for staff pages)",
          kind: "wrapper",
          schema: {
            heading: fields.text({
              label: "Section Heading",
              description: 'E.g., "Open Positions"',
            }),
            positions: fields.array(
              fields.object({
                image: fields.text({
                  label: "Position Image Path",
                  description:
                    "Path to position image (e.g., /images/positions/photo.jpg)",
                  defaultValue: "",
                }),
                title: fields.text({ label: "Position Title" }),
                description: fields.text({
                  label: "Description",
                  multiline: true,
                }),
                requirements: fields.text({
                  label: "Requirements (optional)",
                  multiline: true,
                  defaultValue: "",
                }),
                applyLink: fields.text({
                  label: "Apply Link (optional)",
                  defaultValue: "",
                }),
              }),
              {
                label: "Positions",
                itemLabel: (props) => props.fields.title.value || "Position",
              },
            ),
          },
        },

        // Large image section
        imageSection: {
          label: "Image Section",
          description: "Large prominent image with optional text overlay",
          kind: "wrapper",
          schema: {
            image: fields.text({
              label: "Image Path",
              description: "Path to image (e.g., /images/sections/photo.jpg)",
              defaultValue: "",
            }),
            alt: fields.text({
              label: "Alt Text",
              description: "Required for accessibility",
            }),
            overlayText: fields.text({
              label: "Overlay Text (optional)",
              description: "Text to display over the image",
              defaultValue: "",
            }),
            overlayPosition: fields.select({
              label: "Overlay Position",
              options: [
                { label: "Center", value: "center" },
                { label: "Bottom", value: "bottom" },
                { label: "Top", value: "top" },
              ],
              defaultValue: "center",
            }),
            height: fields.select({
              label: "Image Height",
              options: [
                { label: "Small (300px)", value: "sm" },
                { label: "Medium (500px)", value: "md" },
                { label: "Large (700px)", value: "lg" },
                { label: "Extra Large (900px)", value: "xl" },
              ],
              defaultValue: "md",
            }),
          },
        },

        // Two-column layout
        // REQ-CMS-006: Improved field descriptions for usability
        twoColumns: {
          label: "Two Column Layout",
          description: "Split content into two side-by-side columns",
          kind: "wrapper",
          schema: {
            reverseOnMobile: fields.checkbox({
              label: "Reverse order on mobile",
              description:
                "When checked, the second column appears first on mobile devices",
              defaultValue: false,
            }),
          },
        },

        // REQ-UI-005: Session Card Component (for camp session dates)
        sessionCard: {
          label: "Session Card",
          description:
            "Display camp session information with dates and pricing",
          kind: "inline",
          schema: {
            title: fields.text({
              label: "Session Title",
              description: 'E.g., "Jr. High Week 1"',
            }),
            dates: fields.text({
              label: "Dates",
              description: 'E.g., "June 14-20, 2025"',
            }),
            grades: fields.text({
              label: "Grades",
              description: 'E.g., "Grades 6-8"',
            }),
            pricing: fields.text({
              label: "Pricing",
              description: 'E.g., "$350"',
            }),
            earlyBird: fields.text({
              label: "Early Bird Price (optional)",
              description: 'E.g., "Early Bird: $325"',
              defaultValue: "",
            }),
            registrationLink: fields.text({
              label: "Registration Link (optional)",
              description: "URL to registration",
              defaultValue: "",
            }),
          },
        },

        // REQ-GRID-001: Grid Square Component
        // REQ-CMS-003: Added width, height options (backgroundColor already exists)
        gridSquare: {
          label: "Grid Square",
          description:
            "A square in a grid - either full-bleed image or colored background with content",
          kind: "wrapper",
          schema: {
            contentType: fields.select({
              label: "Content Type",
              options: [
                { label: "Full-Bleed Image", value: "image" },
                { label: "Color Background", value: "color" },
              ],
              defaultValue: "color",
            }),
            image: fields.text({
              label: "Image Path",
              description:
                "Path to image for grid square (e.g., /images/grid/photo.jpg). Required for image type.",
              defaultValue: "",
            }),
            imageAlt: fields.text({
              label: "Image Alt Text",
              description:
                "Descriptive alt text for accessibility. Required for image type.",
              defaultValue: "",
            }),
            backgroundColor: fields.select({
              label: "Background Color",
              description: "Choose a background color for the grid square",
              options: [...BACKGROUND_COLOR_OPTIONS],
              defaultValue: "#f5f0e8",
            }),
            textColor: fields.select({
              label: "Text Color",
              options: [...TEXT_COLOR_OPTIONS],
              defaultValue: "dark",
            }),
            aspectRatio: fields.select({
              label: "Aspect Ratio",
              options: [
                { label: "Square (1:1)", value: "square" },
                { label: "Portrait (3:4)", value: "portrait" },
                { label: "Landscape (4:3)", value: "landscape" },
              ],
              defaultValue: "square",
            }),
            id: fields.text({
              label: "Section ID",
              description: 'Anchor ID for navigation (e.g., "jr-high-camp")',
              defaultValue: "",
            }),
            width: containerWidthField,
            height: containerHeightField,
          },
        },

        // REQ-U03-003: Anchor Navigation Component
        // REQ-CMS-006: Improved description for usability
        anchorNav: {
          label: "Anchor Navigation",
          description:
            "Add quick-jump links to sections on this page. Place Anchor Nav Items inside.",
          kind: "wrapper",
          schema: {},
        },

        // REQ-U03-003: Anchor Navigation Item
        anchorNavItem: {
          label: "Anchor Nav Item",
          description: "A navigation item linking to a section",
          kind: "inline",
          schema: {
            id: fields.text({
              label: "Section ID",
              description:
                'ID of the section to scroll to (e.g., "jr-high-camp")',
            }),
            label: fields.text({
              label: "Label",
              description: "Display text for the navigation item",
            }),
            grades: fields.text({
              label: "Grades (optional)",
              description:
                'Grade range to display below label (e.g., "Grades 7-9")',
              defaultValue: "",
            }),
          },
        },

        // REQ-U03-002: Session Card Group Container
        // REQ-CMS-006: Improved description for usability
        sessionCardGroup: {
          label: "Session Card Group",
          description:
            "Container for multiple session cards. Place Inline Session Cards inside.",
          kind: "wrapper",
          schema: {},
        },

        // REQ-U03-002: Inline Session Card
        inlineSessionCard: {
          label: "Inline Session Card",
          description: "Compact session card for grid sections",
          kind: "inline",
          schema: {
            title: fields.text({
              label: "Session Title",
              description: 'E.g., "Junior 1" or "Jr. High 2"',
            }),
            dates: fields.text({
              label: "Dates",
              description: 'E.g., "June 14-19, 2026"',
            }),
            pricing: fields.text({
              label: "Pricing",
              description: 'E.g., "$390 / $440"',
            }),
            pricingNote: fields.text({
              label: "Pricing Note",
              description:
                'E.g., "Early Bird / Regular" or "One-night program"',
              defaultValue: "Early Bird / Regular",
            }),
          },
        },

        // Live session capacity bars from UltraCamp API
        sessionCapacity: {
          label: "Session Capacity",
          description:
            "Display live registration capacity bars for camp sessions",
          kind: "inline",
          schema: {
            sessions: fields.array(
              fields.text({ label: "Session Name" }),
              {
                label: "Sessions",
                itemLabel: (props) => props.value || "Session",
              },
            ),
          },
        },

        // Table Component (for tabular data in content)
        table: {
          label: "Table",
          description: "Display data in a table format with headers and rows",
          kind: "wrapper",
          schema: {},
        },

        // REQ-GRID-002: Square Grid Container
        // REQ-CMS-003: Added width, height, backgroundColor options
        // P1-05: Unified backgroundColor to use BACKGROUND_COLOR_OPTIONS select
        squareGrid: {
          label: "Square Grid",
          description:
            "Responsive grid of squares (1 column on mobile, 2-4 on desktop)",
          kind: "wrapper",
          schema: {
            columns: fields.select({
              label: "Columns (Desktop)",
              options: [
                { label: "2 Columns", value: "2" },
                { label: "3 Columns", value: "3" },
                { label: "4 Columns", value: "4" },
              ],
              defaultValue: "2",
            }),
            gap: fields.select({
              label: "Gap Between Squares",
              options: [
                { label: "None", value: "none" },
                { label: "Small (0.5rem)", value: "sm" },
                { label: "Medium (1rem)", value: "md" },
                { label: "Large (1.5rem)", value: "lg" },
              ],
              defaultValue: "none",
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
        },
      },
    }),

    // SEO fields - below Page Content, enhanced as collapsible accordion
    seo: fields.object(
      {
        metaTitle: fields.text({
          label: "Meta Title",
          description: "50-60 characters recommended",
          validation: { length: { max: 60 } },
        }),
        metaDescription: fields.text({
          label: "Meta Description",
          description: "150-155 characters recommended",
          validation: { length: { max: 160 } },
          multiline: true,
        }),
        ogTitle: fields.text({
          label: "Open Graph Title",
          description: "Defaults to Meta Title if empty",
        }),
        ogDescription: fields.text({
          label: "Open Graph Description",
          description: "Defaults to Meta Description if empty",
          multiline: true,
        }),
        ogImage: fields.text({
          label: "Social Share Image Path",
          description:
            "Path to social share image (recommended: 1200x630px, e.g., /og-images/page.jpg)",
          defaultValue: "",
        }),
        twitterCard: fields.select({
          label: "Twitter Card Type",
          options: [
            { label: "Summary", value: "summary" },
            { label: "Summary Large Image", value: "summary_large_image" },
          ],
          defaultValue: "summary_large_image",
        }),
        noIndex: fields.checkbox({
          label: "Hide from search engines",
          defaultValue: false,
        }),
      },
      { label: "SEO & Social Media" },
    ),
  },
});
