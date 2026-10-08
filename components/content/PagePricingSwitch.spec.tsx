/**
 * REQ-PRICE-005, REQ-PRICE-006, REQ-PRICE-007: page-level "Show pricing" switch
 * hides the price element in every price-bearing component
 */
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { readFileSync } from "fs";
import type { UltraCampSession } from "@/lib/ultracamp/sessions";
import { MarkdocRenderer } from "./MarkdocRenderer";
import { SessionCard } from "./SessionCard";
import { InlineSessionCard } from "./InlineSessionCard";
import { SessionCardGrid } from "./SessionCardGrid";
import { PricingTable } from "./PricingTable";
import {
  SessionCapacityCard,
  SessionCapacityCardGrid,
} from "./capacity/SessionCapacityCard";
import { renderPageContent } from "@/lib/templates/page-renderer";
import type { PageData } from "@/lib/templates/page-renderer";

const CURRENCY = /\$\s?\d/;

const mocks = vi.hoisted(() => ({
  sessions: [] as unknown[],
}));

vi.mock("@/lib/ultracamp/useSessionCapacity", () => ({
  useSessionCapacity: (sessions: UltraCampSession[]) => ({
    sessions,
    isRefreshing: false,
  }),
}));

vi.mock("@/lib/ultracamp/sessions", () => ({
  fetchUltraCampSessions: async () => mocks.sessions,
}));

vi.mock("@/lib/testimonials", () => ({
  getPublishedTestimonials: async () => [],
}));

function makeSession(name: string, id: number): UltraCampSession {
  return {
    sessionId: String(id),
    sessionName: name,
    plainSessionName: name,
    beginDate: "6/13/2027",
    endDate: "6/18/2027",
    cost: `$${400 + id}.00`,
    totalEnrollment: 30,
    maxTotal: 50,
    maleEnrollment: 15,
    maxMales: 25,
    femaleEnrollment: 15,
    maxFemales: 25,
    totalHoldCount: 0,
    totalWaitListCount: 0,
    open: true,
    registrationLink: "https://example.com/register",
    category: "Summer Camp",
    subCategory1: "Junior",
  };
}

const SUMMER_SESSION_NAMES = [
  "Pioneer Camp",
  "Junior 1",
  "Junior 2",
  "Jr High 1",
  "Jr High 2",
  "Sr. High",
];
const summerSessions = SUMMER_SESSION_NAMES.map((name, i) =>
  makeSession(name, i + 1),
);

const sessionCardProps = {
  title: "Junior 1",
  dates: "June 13-18, 2027",
  grades: "Grades 3-6",
  pricing: "$390 / $440",
  earlyBird: "save $50",
};

const inlineProps = {
  title: "Junior 1",
  dates: "June 13-18, 2027",
  pricing: "$390 / $440",
};

const gridProps = {
  heading: "Sessions",
  image: "/images/test.jpg",
  imageAlt: "Campers",
  cards: [
    { title: "Junior 1", dates: "June 13-18, 2027", price: "$390" },
    {
      title: "Junior 2",
      dates: "June 20-25, 2027",
      price: "$440",
      ctaText: "Register",
      ctaHref: "/register",
    },
  ],
};

const tiers = [
  {
    name: "Week",
    price: 390,
    period: "/week",
    features: ["Lodging"],
    cta: { text: "Register", url: "/register" },
  },
];

const componentCases: Array<{
  name: string;
  on: () => JSX.Element;
  explicitOn: () => JSX.Element;
  off: () => JSX.Element;
  kept: string[];
}> = [
  {
    name: "SessionCard",
    on: () => <SessionCard {...sessionCardProps} />,
    explicitOn: () => <SessionCard {...sessionCardProps} showPricing />,
    off: () => <SessionCard {...sessionCardProps} showPricing={false} />,
    kept: ["Junior 1", "June 13-18, 2027", "Grades 3-6"],
  },
  {
    name: "InlineSessionCard",
    on: () => <InlineSessionCard {...inlineProps} />,
    explicitOn: () => <InlineSessionCard {...inlineProps} showPricing />,
    off: () => <InlineSessionCard {...inlineProps} showPricing={false} />,
    kept: ["Junior 1", "June 13-18, 2027"],
  },
  {
    name: "SessionCardGrid",
    on: () => <SessionCardGrid {...gridProps} />,
    explicitOn: () => <SessionCardGrid {...gridProps} showPricing />,
    off: () => <SessionCardGrid {...gridProps} showPricing={false} />,
    kept: ["Junior 1", "June 13-18, 2027", "June 20-25, 2027"],
  },
  {
    name: "PricingTable",
    on: () => <PricingTable tiers={tiers} />,
    explicitOn: () => <PricingTable tiers={tiers} showPricing />,
    off: () => <PricingTable tiers={tiers} showPricing={false} />,
    kept: ["Week", "Lodging", "Register"],
  },
  {
    name: "SessionCapacityCard",
    on: () => <SessionCapacityCard session={summerSessions[1]} />,
    explicitOn: () => (
      <SessionCapacityCard session={summerSessions[1]} showPricing />
    ),
    off: () => (
      <SessionCapacityCard session={summerSessions[1]} showPricing={false} />
    ),
    kept: ["Junior 1", "Jun 13-18, 2027"],
  },
  {
    name: "SessionCapacityCardGrid",
    on: () => <SessionCapacityCardGrid sessions={summerSessions} />,
    explicitOn: () => (
      <SessionCapacityCardGrid sessions={summerSessions} showPricing />
    ),
    off: () => (
      <SessionCapacityCardGrid sessions={summerSessions} showPricing={false} />
    ),
    kept: ["Pioneer Camp", "Sr. High"],
  },
];

describe("REQ-PRICE-005 — each price component hides its price when pricing is off", () => {
  it.each(componentCases)(
    "REQ-PRICE-005 — $name renders no currency text with showPricing=false",
    ({ on, off, kept }) => {
      expect(render(on()).container.textContent).toMatch(CURRENCY);
      const hidden = render(off()).container;
      expect(hidden.textContent).not.toMatch(CURRENCY);
      for (const text of kept) {
        expect(hidden.textContent).toContain(text);
      }
    },
  );

  it("REQ-PRICE-005 — PricingTable drops the period with the price", () => {
    const { container } = render(
      <PricingTable tiers={tiers} showPricing={false} />,
    );
    expect(container.textContent).not.toContain("/week");
  });

  it("REQ-PRICE-005 — InlineSessionCard drops the pricing note with the price", () => {
    const { container } = render(
      <InlineSessionCard {...inlineProps} showPricing={false} />,
    );
    expect(container.textContent).not.toContain("Early Bird");
  });
});

describe("REQ-PRICE-006 — default on leaves markup unchanged", () => {
  it.each(componentCases)(
    "REQ-PRICE-006 — $name markup is identical with showPricing absent and true",
    ({ on, explicitOn }) => {
      expect(render(on()).container.innerHTML).toBe(
        render(explicitOn()).container.innerHTML,
      );
    },
  );
});

const markdocContent = `
{% sessionCard title="Junior 1" dates="June 13-18, 2027" grades="Grades 3-6" pricing="$390 / $440" earlyBird="save $50" /%}

{% inlineSessionCard title="Junior 2" dates="June 20-25, 2027" pricing="$395 / $445" /%}

{% sessionCapacity sessions=["Jr High 1"] /%}
`;

describe("REQ-PRICE-007 — page switch reaches every Markdoc price component", () => {
  it("REQ-PRICE-007 — showPricing=false on the renderer removes every component price", () => {
    const { container } = render(
      <MarkdocRenderer
        content={markdocContent}
        ultracampSessions={summerSessions}
        showPricing={false}
      />,
    );
    expect(container.textContent).not.toMatch(CURRENCY);
    expect(container.textContent).toContain("Junior 1");
    expect(container.textContent).toContain("Junior 2");
    expect(container.textContent).toContain("Jr High 1");
  });

  it("REQ-PRICE-007 — renderer markup is identical with showPricing absent and true", () => {
    const absent = render(
      <MarkdocRenderer
        content={markdocContent}
        ultracampSessions={summerSessions}
      />,
    );
    const explicit = render(
      <MarkdocRenderer
        content={markdocContent}
        ultracampSessions={summerSessions}
        showPricing
      />,
    );
    expect(absent.container.textContent).toMatch(CURRENCY);
    expect(absent.container.innerHTML).toBe(explicit.container.innerHTML);
  });

  it("REQ-PRICE-007 — per-block showPricing=false still hides when the page switch is on", () => {
    const { container } = render(
      <MarkdocRenderer
        content={`{% sessionCapacity sessions=["Jr High 1"] showPricing=false /%}`}
        ultracampSessions={summerSessions}
        showPricing
      />,
    );
    expect(container.textContent).not.toMatch(CURRENCY);
  });

  it("REQ-PRICE-007 — page switch off wins over per-block showPricing=true", () => {
    const { container } = render(
      <MarkdocRenderer
        content={`{% sessionCapacity sessions=["Jr High 1"] showPricing=true /%}`}
        ultracampSessions={summerSessions}
        showPricing={false}
      />,
    );
    expect(container.textContent).not.toMatch(CURRENCY);
  });
});

function readSessionsPageBody(): string {
  const raw = readFileSync("content/pages/summer-camp-sessions.mdoc", "utf-8");
  const match = raw.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);
  if (!match) throw new Error("summer-camp-sessions.mdoc has no frontmatter");
  return match[1];
}

async function renderSessionsPage(showPricing?: boolean) {
  mocks.sessions = summerSessions;
  const page: PageData = {
    title: "Camp Sessions",
    hero: { heroImage: null, heroVideo: null, heroTagline: null },
    templateFields: { discriminant: "fullbleed", value: null },
    showPricing,
  };
  const element = await renderPageContent(page, readSessionsPageBody());
  return render(element).container;
}

function priceSlotTexts(container: HTMLElement): string[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(".not-prose.grid.gap-3 > div"),
  ).map((bar) => bar.textContent ?? "");
}

describe("REQ-PRICE-008 — Camp Sessions page follows the page switch", () => {
  it("REQ-PRICE-008 — page switch off: zero currency matches in every session bar", async () => {
    const slots = priceSlotTexts(await renderSessionsPage(false));
    expect(slots).toHaveLength(SUMMER_SESSION_NAMES.length);
    for (const text of slots) {
      expect(text).not.toMatch(CURRENCY);
      expect(text).toMatch(/Jun 13-18, 2027|June 13-18, 2027/);
    }
  });

  it("REQ-PRICE-008 — page switch on: every session bar shows a price", async () => {
    const slots = priceSlotTexts(await renderSessionsPage(true));
    expect(slots).toHaveLength(SUMMER_SESSION_NAMES.length);
    for (const text of slots) {
      expect(text).toMatch(CURRENCY);
    }
  });

  it("REQ-PRICE-008 — a page saved before the switch existed shows prices", async () => {
    const absent = await renderSessionsPage(undefined);
    const on = await renderSessionsPage(true);
    expect(priceSlotTexts(absent)).toEqual(priceSlotTexts(on));
  });
});
