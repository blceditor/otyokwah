/**
 * Keystatic Singletons
 * REQ-KEYSTATIC-001: Modular config structure
 */
import { fields, singleton } from "@keystatic/core";
import { siteConfig } from "./site-config";

export const siteNavigation = singleton({
  label: "Site Navigation",
  path: "content/navigation/navigation",
  schema: {
    menuItems: fields.array(
      fields.object({
        label: fields.text({ label: "Menu Label" }),
        href: fields.text({ label: "Link URL (optional for dropdowns)" }),
        children: fields.array(
          fields.object({
            label: fields.text({ label: "Dropdown Item Label" }),
            href: fields.text({ label: "Dropdown Item URL" }),
            external: fields.checkbox({
              label: "Open in new tab",
              defaultValue: false,
            }),
          }),
          {
            label: "Dropdown Items",
            itemLabel: (props) => props.fields.label.value || "Dropdown Item",
          },
        ),
      }),
      {
        label: "Menu Items",
        description:
          "Main navigation menu items (Summer Camp, Work at Camp, Retreats, Give, About)",
        itemLabel: (props) => props.fields.label.value || "Menu Item",
      },
    ),
    primaryCTA: fields.object({
      label: fields.text({
        label: "Button Text",
        defaultValue: "Register Now",
      }),
      href: fields.text({
        label: "Button URL",
        description: "Usually links to UltraCamp registration",
      }),
      external: fields.checkbox({
        label: "Open in new tab",
        defaultValue: true,
      }),
    }),
  },
});

export const singletons = {
  siteNavigation,
  siteConfig,
};
