/**
 * Keystatic Singletons
 * REQ-KEYSTATIC-001: Modular config structure
 */
import { fields, singleton } from "@keystatic/core";
import { siteConfig } from "./site-config";

export const contactEmailTemplate = singleton({
  label: "Contact Form Email",
  path: "content/singletons/contact-email/contact-email",
  schema: {
    confirmationSubject: fields.text({
      label: "Confirmation Email Subject",
      description: "Subject line for the auto-reply sent to the person who submitted the form",
      defaultValue: "Thank you for contacting Camp Otyokwah",
    }),
    confirmationHeading: fields.text({
      label: "Confirmation Email Heading",
      defaultValue: "We Received Your Message",
    }),
    confirmationBody: fields.text({
      label: "Confirmation Email Body",
      description: "The main message body. Use {name} to insert the sender's name.",
      multiline: true,
      defaultValue:
        "Hi {name},\n\nThank you for reaching out to Camp Otyokwah! We've received your message and a member of our team will get back to you shortly.\n\nIf your matter is urgent, please call us at (419) 883-3854.\n\nGod bless,\nThe Camp Otyokwah Team",
    }),
    confirmationFooter: fields.text({
      label: "Confirmation Email Footer",
      defaultValue: "Camp Otyokwah | 3380 Tugend Rd, Butler, OH 44822 | otyokwah.org",
    }),
  },
});

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
  contactEmailTemplate,
};
