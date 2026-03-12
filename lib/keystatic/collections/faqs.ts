/**
 * FAQs Collection for Keystatic
 * REQ-KEYSTATIC-001: Modular config structure
 * REQ-F004: FAQ Collection
 */
import { fields, collection } from "@keystatic/core";

export const faqs = collection({
  label: "FAQs",
  slugField: "question",
  path: "content/faqs/*",
  schema: {
    question: fields.slug({
      name: {
        label: "Question",
        validation: { isRequired: true },
      },
    }),
    answer: fields.text({
      label: "Answer",
      multiline: true,
      validation: { isRequired: true },
    }),
    category: fields.select({
      label: "Category",
      options: [
        { label: "Summer Camp", value: "summer-camp" },
        { label: "Registration", value: "registration" },
        { label: "Staff", value: "staff" },
        { label: "LIT", value: "lit" },
        { label: "General", value: "general" },
      ],
      defaultValue: "general",
    }),
    order: fields.integer({
      label: "Display Order",
      description: "Lower numbers appear first",
      defaultValue: 0,
    }),
    published: fields.checkbox({
      label: "Published",
      description: "Show this FAQ on the website",
      defaultValue: true,
    }),
  },
});
