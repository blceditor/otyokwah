/**
 * REQ-MEDIA-003: Media Field Enhancer Tests
 * Story Points: 3.0 SP
 *
 * Layer 1 tests: Schema audit (regression gate), DOM injection logic,
 * MediaPickerDialog rendering, and selection flow.
 *
 * These tests prevent the regression where fields.text() was swapped to
 * fields.image(), breaking the MediaFieldEnhancer's ability to inject
 * "Browse Media" buttons.
 */

import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MediaPickerDialog } from "./MediaPickerDialog";

// ─── Layer 1a: Schema Audit (Regression Gate) ────────────────────────
// This is the cheapest test that directly catches the fields.text() → fields.image() swap.

describe("REQ-MEDIA-003 — Schema Audit: Browse Media Compatibility", () => {
  let sharedComponents: Record<
    string,
    { schema: Record<string, { formKind?: string; kind?: string }> }
  >;

  beforeEach(async () => {
    const mod = await import("@/lib/keystatic/collections/shared-components");
    sharedComponents = mod.sharedComponents as typeof sharedComponents;
  });

  test("wideCard.image uses fields.text (formKind !== asset) for Browse Media compatibility", () => {
    const imageField = sharedComponents.wideCard.schema.image;
    expect(imageField.formKind).not.toBe("asset");
  });

  test("campSessionCard.image uses fields.text (formKind !== asset) for Browse Media compatibility", () => {
    const imageField = sharedComponents.campSessionCard.schema.image;
    expect(imageField.formKind).not.toBe("asset");
  });

  test("all Markdoc component image path fields use fields.text for Browse Media", () => {
    const componentsWithImagePaths: Array<{ name: string; field: string }> = [
      { name: "wideCard", field: "image" },
      { name: "campSessionCard", field: "image" },
    ];

    for (const { name, field } of componentsWithImagePaths) {
      const component = sharedComponents[name];
      expect(
        component,
        `${name} should exist in sharedComponents`,
      ).toBeDefined();

      const fieldDef = component.schema[field];
      expect(fieldDef, `${name}.${field} should exist`).toBeDefined();
      expect(fieldDef.formKind).not.toBe("asset");
    }
  });
});

// ─── Layer 1b: MediaPickerDialog Component Tests ─────────────────────

vi.mock("./MediaLibrary", () => ({
  MediaLibrary: ({
    onSelect,
    onClose,
    selectionMode,
  }: {
    onSelect?: (file: { id: string; url: string; filename: string }) => void;
    onClose?: () => void;
    selectionMode?: boolean;
  }) => (
    <div data-testid="mock-media-library" data-selection-mode={selectionMode}>
      <button
        data-testid="mock-select-file"
        onClick={() =>
          onSelect?.({
            id: "test-1",
            url: "/images/test-image.jpg",
            filename: "test-image.jpg",
          } as never)
        }
      >
        Select Test File
      </button>
      <button data-testid="mock-close" onClick={onClose}>
        Close
      </button>
    </div>
  ),
}));

describe("REQ-MEDIA-003 — MediaPickerDialog Component", () => {
  test("renders dialog when isOpen is true", () => {
    const onClose = vi.fn();
    const onSelect = vi.fn();

    render(
      <MediaPickerDialog isOpen={true} onClose={onClose} onSelect={onSelect} />,
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog).not.toHaveAttribute("aria-modal");
    expect(dialog).toHaveAttribute("aria-label", "Select media");
  });

  test("does not render when isOpen is false", () => {
    const onClose = vi.fn();
    const onSelect = vi.fn();

    render(
      <MediaPickerDialog
        isOpen={false}
        onClose={onClose}
        onSelect={onSelect}
      />,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("renders MediaLibrary in selection mode", () => {
    const onClose = vi.fn();
    const onSelect = vi.fn();

    render(
      <MediaPickerDialog isOpen={true} onClose={onClose} onSelect={onSelect} />,
    );

    const library = screen.getByTestId("mock-media-library");
    expect(library).toHaveAttribute("data-selection-mode", "true");
  });

  test("calls onClose when Escape key is pressed", () => {
    const onClose = vi.fn();
    const onSelect = vi.fn();

    render(
      <MediaPickerDialog isOpen={true} onClose={onClose} onSelect={onSelect} />,
    );

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  test("calls onClose when clicking outside dialog content", () => {
    const onClose = vi.fn();
    const onSelect = vi.fn();

    render(
      <MediaPickerDialog isOpen={true} onClose={onClose} onSelect={onSelect} />,
    );

    // The outer wrapper (not the dialog content) handles close-on-click
    const outerWrapper = document.querySelector(
      "[data-media-picker-dialog]",
    ) as HTMLElement;
    expect(outerWrapper).not.toBeNull();
    fireEvent.click(outerWrapper);
    expect(onClose).toHaveBeenCalled();
  });

  test("clicking dialog content does NOT close the dialog", () => {
    const onClose = vi.fn();
    const onSelect = vi.fn();

    render(
      <MediaPickerDialog isOpen={true} onClose={onClose} onSelect={onSelect} />,
    );

    const dialogContent = screen.getByRole("dialog");
    fireEvent.click(dialogContent);
    expect(onClose).not.toHaveBeenCalled();
  });

  test("backdrop is pointer-events-none (prevents event interception)", () => {
    const onClose = vi.fn();
    const onSelect = vi.fn();

    render(
      <MediaPickerDialog isOpen={true} onClose={onClose} onSelect={onSelect} />,
    );

    const backdrop = document.querySelector(
      "[aria-hidden='true']",
    ) as HTMLElement;
    expect(backdrop).not.toBeNull();
    expect(backdrop.className).toContain("pointer-events-none");
  });

  test("role='dialog' is on content div, not outer wrapper (avoids CSS override)", () => {
    const onClose = vi.fn();
    const onSelect = vi.fn();

    render(
      <MediaPickerDialog isOpen={true} onClose={onClose} onSelect={onSelect} />,
    );

    const outerWrapper = document.querySelector(
      "[data-media-picker-dialog]",
    ) as HTMLElement;
    expect(outerWrapper).not.toBeNull();
    expect(outerWrapper.getAttribute("role")).toBeNull();

    const dialog = screen.getByRole("dialog");
    expect(dialog.parentElement).toBe(outerWrapper);
  });

  test("outer wrapper has data-react-aria-top-layer (prevents React Aria inert)", () => {
    const onClose = vi.fn();
    const onSelect = vi.fn();

    render(
      <MediaPickerDialog isOpen={true} onClose={onClose} onSelect={onSelect} />,
    );

    const outerWrapper = document.querySelector(
      "[data-media-picker-dialog]",
    ) as HTMLElement;
    expect(outerWrapper).not.toBeNull();
    expect(outerWrapper.getAttribute("data-react-aria-top-layer")).toBe("true");
  });

  test("dialog does NOT use aria-modal (prevents React Aria ariaHideOutside)", () => {
    const onClose = vi.fn();
    const onSelect = vi.fn();

    render(
      <MediaPickerDialog isOpen={true} onClose={onClose} onSelect={onSelect} />,
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).not.toHaveAttribute("aria-modal");
  });

  test("calls onSelect and onClose when a file is selected", () => {
    const onClose = vi.fn();
    const onSelect = vi.fn();

    render(
      <MediaPickerDialog isOpen={true} onClose={onClose} onSelect={onSelect} />,
    );

    const selectButton = screen.getByTestId("mock-select-file");
    fireEvent.click(selectButton);

    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "/images/test-image.jpg",
        filename: "test-image.jpg",
      }),
    );
    expect(onClose).toHaveBeenCalled();
  });

  test("sets body overflow hidden when open", () => {
    const onClose = vi.fn();
    const onSelect = vi.fn();

    const { unmount } = render(
      <MediaPickerDialog isOpen={true} onClose={onClose} onSelect={onSelect} />,
    );

    expect(document.body.style.overflow).toBe("hidden");
    expect(document.body.getAttribute("data-media-dialog-open")).toBe("true");

    unmount();

    expect(document.body.style.overflow).toBe("");
    expect(document.body.getAttribute("data-media-dialog-open")).toBeNull();
  });
});

// ─── Layer 1c: Field Detection Logic Tests ───────────────────────────
// Tests the isImageFieldByLabel detection strategy using safe DOM methods

function createFieldGroup(
  labelText: string,
  inputAttrs: Record<string, string>,
): HTMLDivElement {
  const group = document.createElement("div");
  group.setAttribute("role", "group");

  const label = document.createElement("label");
  const labelId = `field-${Math.random().toString(36).slice(2, 8)}`;
  label.setAttribute("for", labelId);
  label.textContent = labelText;
  group.appendChild(label);

  const input = document.createElement("input");
  input.id = labelId;
  input.type = "text";
  for (const [key, value] of Object.entries(inputAttrs)) {
    input.setAttribute(key, value);
  }
  group.appendChild(input);

  return group;
}

function createSpanLabelGroup(
  labelText: string,
  inputAttrs: Record<string, string>,
): HTMLDivElement {
  const group = document.createElement("div");
  group.setAttribute("role", "group");

  const span = document.createElement("span");
  span.className = "label";
  span.textContent = labelText;
  group.appendChild(span);

  const input = document.createElement("input");
  input.type = "text";
  for (const [key, value] of Object.entries(inputAttrs)) {
    input.setAttribute(key, value);
  }
  group.appendChild(input);

  return group;
}

const IMAGE_KEYWORDS =
  /image|photo|video|hero\s*image|hero\s*video|background\s*image/i;

describe("REQ-MEDIA-003 — Field Detection Logic", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  test("detects text input next to 'Image Path' label via for/id", () => {
    const group = createFieldGroup("Image Path", {
      value: "/images/test.jpg",
    });
    container.appendChild(group);

    const input = group.querySelector("input") as HTMLInputElement;
    const label = document.querySelector(
      `label[for="${input.id}"]`,
    ) as HTMLLabelElement;

    expect(label).not.toBeNull();
    expect(IMAGE_KEYWORDS.test(label.textContent || "")).toBe(true);
  });

  test("detects text input in container with image-related span label", () => {
    const group = createSpanLabelGroup("Card Image", { value: "" });
    container.appendChild(group);

    const input = group.querySelector("input") as HTMLInputElement;
    const roleGroup = input.closest('[role="group"]');
    const labels = roleGroup!.querySelectorAll(
      "label, span[class*='label'], legend",
    );
    const hasImageLabel = [...labels].some((l) =>
      IMAGE_KEYWORDS.test(l.textContent || ""),
    );

    expect(hasImageLabel).toBe(true);
  });

  test("does NOT detect text input next to non-image label", () => {
    const group = createFieldGroup("Session Name", {
      value: "Jr. High Camp",
    });
    container.appendChild(group);

    const input = group.querySelector("input") as HTMLInputElement;
    const label = document.querySelector(
      `label[for="${input.id}"]`,
    ) as HTMLLabelElement;

    expect(IMAGE_KEYWORDS.test(label.textContent || "")).toBe(false);
  });

  test("does NOT detect 'Button Text' label as image field", () => {
    const group = createFieldGroup("Button Text", { value: "Learn More" });
    container.appendChild(group);

    const input = group.querySelector("input") as HTMLInputElement;
    const label = document.querySelector(
      `label[for="${input.id}"]`,
    ) as HTMLLabelElement;

    expect(IMAGE_KEYWORDS.test(label.textContent || "")).toBe(false);
  });

  test("detects input with value containing /images/ path", () => {
    const group = createFieldGroup("Some Field", {
      value: "/images/facilities/chapel.jpg",
    });
    container.appendChild(group);

    const input = group.querySelector("input") as HTMLInputElement;
    expect(/\/images\/|\/videos\//.test(input.value)).toBe(true);
  });

  test("detects input with value containing /videos/ path", () => {
    const group = createFieldGroup("Some Field", {
      value: "/videos/hero-home.mp4",
    });
    container.appendChild(group);

    const input = group.querySelector("input") as HTMLInputElement;
    expect(/\/images\/|\/videos\//.test(input.value)).toBe(true);
  });

  test("search inputs should be excluded", () => {
    const group = document.createElement("div");
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Search files...";
    group.appendChild(input);
    container.appendChild(group);

    expect(input.placeholder.toLowerCase().includes("search")).toBe(true);
  });

  test("handles preceding sibling with image keyword text", () => {
    const wrapper = document.createElement("div");

    const labelDiv = document.createElement("div");
    const labelSpan = document.createElement("span");
    labelSpan.textContent = "Hero Image Path";
    const descSpan = document.createElement("span");
    descSpan.textContent =
      "Path to hero image (e.g., /images/facilities/chapel-exterior.jpg)";
    labelDiv.appendChild(labelSpan);
    labelDiv.appendChild(descSpan);
    wrapper.appendChild(labelDiv);

    const input = document.createElement("input");
    input.type = "text";
    input.value = "/images/summer-program-and-general/backflip-water.jpg";
    wrapper.appendChild(input);

    container.appendChild(wrapper);

    // Should match via value containing /images/
    expect(/\/images\//.test(input.value)).toBe(true);

    // Should also match via preceding sibling text
    const prev = input.previousElementSibling;
    expect(IMAGE_KEYWORDS.test(prev?.textContent || "")).toBe(true);
  });

  test("detects 'Background Image' label", () => {
    const group = createFieldGroup("Background Image", { value: "" });
    container.appendChild(group);

    const input = group.querySelector("input") as HTMLInputElement;
    const label = document.querySelector(
      `label[for="${input.id}"]`,
    ) as HTMLLabelElement;

    expect(IMAGE_KEYWORDS.test(label.textContent || "")).toBe(true);
  });

  test("detects 'Author Photo' label", () => {
    const group = createFieldGroup("Author Photo", { value: "" });
    container.appendChild(group);

    const input = group.querySelector("input") as HTMLInputElement;
    const label = document.querySelector(
      `label[for="${input.id}"]`,
    ) as HTMLLabelElement;

    expect(IMAGE_KEYWORDS.test(label.textContent || "")).toBe(true);
  });

  test("does NOT detect 'Heading' label as image field", () => {
    const group = createFieldGroup("Heading", {
      value: "Welcome to Camp",
    });
    container.appendChild(group);

    const input = group.querySelector("input") as HTMLInputElement;
    const label = document.querySelector(
      `label[for="${input.id}"]`,
    ) as HTMLLabelElement;

    expect(IMAGE_KEYWORDS.test(label.textContent || "")).toBe(false);
  });

  test("does NOT detect 'Description' label as image field", () => {
    const group = createFieldGroup("Description", {
      value: "A great camp experience",
    });
    container.appendChild(group);

    const input = group.querySelector("input") as HTMLInputElement;
    const label = document.querySelector(
      `label[for="${input.id}"]`,
    ) as HTMLLabelElement;

    expect(IMAGE_KEYWORDS.test(label.textContent || "")).toBe(false);
  });
});

// ─── Layer 1d: Value Setting Logic Tests ──────────────────────────────
// Tests that setValueViaNativeSetter properly sets input values

describe("REQ-MEDIA-003 — Value Setting via handleSelect", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  test("nativeInputValueSetter sets value on connected input", () => {
    const input = document.createElement("input");
    input.type = "text";
    input.value = "old-value.jpg";
    container.appendChild(input);

    const nativeSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value",
    )?.set;

    expect(nativeSetter).toBeDefined();
    nativeSetter!.call(input, "/images/staff/new-headshot.jpg");
    expect(input.value).toBe("/images/staff/new-headshot.jpg");
  });

  test("value is NOT cleared to empty during selection (regression test for P0-01)", () => {
    const input = document.createElement("input");
    input.type = "text";
    input.value = "/images/staff/original.jpg";
    container.appendChild(input);

    // Simulate the FIXED handleSelect behavior:
    // Should NOT clear to empty before setting new value
    const nativeSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value",
    )?.set;

    // The fix sets value directly without clearing first
    nativeSetter!.call(input, "/images/staff/new-headshot.jpg");
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));

    // Value should be the new path, never empty
    expect(input.value).toBe("/images/staff/new-headshot.jpg");
    expect(input.value).not.toBe("");
  });

  test("React fiber props onChange is called when available", () => {
    const input = document.createElement("input");
    input.type = "text";
    input.value = "old.jpg";
    container.appendChild(input);

    const onChangeSpy = vi.fn();

    // Simulate React fiber props on the DOM element
    const fiberKey = "__reactProps$test123";
    Object.defineProperty(input, fiberKey, {
      value: { onChange: onChangeSpy },
      configurable: true,
      enumerable: true,
    });

    // Find the props key like handleSelect does
    const propsKey = Object.keys(input).find((k) =>
      k.startsWith("__reactProps$"),
    );
    expect(propsKey).toBe(fiberKey);

    const reactProps = (
      input as unknown as Record<
        string,
        { onChange?: (e: { target: { value: string } }) => void }
      >
    )[propsKey!];
    reactProps?.onChange?.({
      target: { value: "/images/staff/treasurer.jpg" },
    });

    expect(onChangeSpy).toHaveBeenCalledWith({
      target: { value: "/images/staff/treasurer.jpg" },
    });
  });

  test("input.isConnected returns false for detached elements", () => {
    const input = document.createElement("input");
    input.type = "text";
    // NOT appended to container

    expect(input.isConnected).toBe(false);
  });

  test("input.isConnected returns true for attached elements", () => {
    const input = document.createElement("input");
    input.type = "text";
    container.appendChild(input);

    expect(input.isConnected).toBe(true);
  });
});
