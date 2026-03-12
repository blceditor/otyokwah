/**
 * Testimonials Collection for Keystatic
 * REQ-KEYSTATIC-001: Modular config structure
 * REQ-F003: Testimonials Collection
 */
import { fields, collection } from "@keystatic/core";

export const testimonials = collection({
  label: "Testimonials",
  slugField: "name",
  path: "content/testimonials/*",
  schema: {
    quote: fields.text({
      label: "Quote",
      multiline: true,
      validation: { isRequired: true },
    }),
    name: fields.slug({
      name: {
        label: "Name",
        validation: { isRequired: true },
      },
    }),
    role: fields.text({
      label: "Role/Relationship",
      description: 'E.g., "Parent", "Camper", "Staff Member"',
    }),
    tags: fields.multiselect({
      label: "Tags",
      description: "Categories for filtering testimonials",
      options: [
        { label: "Summer Camp", value: "summer-camp" },
        { label: "Giving", value: "giving" },
        { label: "Staff", value: "staff" },
        { label: "Parent", value: "parent" },
        { label: "Camper", value: "camper" },
        { label: "LIT", value: "lit" },
      ],
    }),
    published: fields.checkbox({
      label: "Published",
      description: "Only published testimonials are visible on the site",
      defaultValue: true,
    }),
  },
});
