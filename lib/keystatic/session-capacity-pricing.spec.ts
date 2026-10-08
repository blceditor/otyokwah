/**
 * REQ-PRICE-001: sessionCapacity CMS component exposes a "Show pricing" checkbox
 * REQ-PRICE-009: pages collection exposes a page-level "Show pricing" checkbox
 */
import { describe, test, expect, vi } from "vitest";

vi.mock("@keystatic/core", async () => {
  const actual =
    await vi.importActual<typeof import("@keystatic/core")>("@keystatic/core");
  const capture =
    <T extends (...args: never[]) => object>(fn: T) =>
    (...args: Parameters<T>) => ({ ...fn(...args), __opts: args[0] });
  return {
    ...actual,
    fields: {
      ...actual.fields,
      markdoc: capture(actual.fields.markdoc as never),
      checkbox: capture(actual.fields.checkbox as never),
    },
  };
});

import { pages } from "./collections/pages";

interface CheckboxOpts {
  label: string;
  description?: string;
  defaultValue?: boolean;
}

function getShowPricingOpts(): CheckboxOpts | undefined {
  const body = pages.schema.body as unknown as {
    __opts: {
      components: Record<
        string,
        { schema: Record<string, { __opts?: CheckboxOpts }> }
      >;
    };
  };
  return body.__opts.components.sessionCapacity.schema.showPricing?.__opts;
}

describe("REQ-PRICE-001 — sessionCapacity Show pricing checkbox", () => {
  test("REQ-PRICE-001 — field showPricing exists with label 'Show pricing'", () => {
    expect(getShowPricingOpts()?.label).toBe("Show pricing");
  });

  test("REQ-PRICE-001 — showPricing defaults to true", () => {
    expect(getShowPricingOpts()?.defaultValue).toBe(true);
  });

  test("REQ-PRICE-001 — description says unchecking hides prices and keeps dates", () => {
    const description = getShowPricingOpts()?.description ?? "";
    expect(description).toMatch(/uncheck/i);
    expect(description).toMatch(/price/i);
    expect(description).toMatch(/dates/i);
  });
});

describe("REQ-PRICE-009 — page-level Show pricing checkbox", () => {
  const pageField = (
    pages.schema as unknown as { showPricing?: { __opts?: CheckboxOpts } }
  ).showPricing?.__opts;

  test("REQ-PRICE-009 — pages schema has showPricing labelled 'Show pricing'", () => {
    expect(pageField?.label).toBe("Show pricing");
  });

  test("REQ-PRICE-009 — page showPricing defaults to true", () => {
    expect(pageField?.defaultValue).toBe(true);
  });

  test("REQ-PRICE-009 — description tells editors it hides all prices and keeps dates", () => {
    expect(pageField?.description).toBe(
      "Uncheck to hide all prices on this page; dates stay",
    );
  });
});
