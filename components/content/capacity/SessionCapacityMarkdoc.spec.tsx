/**
 * REQ-PRICE-002, REQ-PRICE-003, REQ-PRICE-004: sessionCapacity Markdoc tag
 * passes showPricing through the transform to every session bar
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { UltraCampSession } from "@/lib/ultracamp/sessions";
import { MarkdocRenderer } from "../MarkdocRenderer";

vi.mock("@/lib/ultracamp/useSessionCapacity", () => ({
  useSessionCapacity: (sessions: UltraCampSession[]) => ({
    sessions,
    isRefreshing: false,
  }),
}));

function makeSession(
  overrides: Partial<UltraCampSession> = {},
): UltraCampSession {
  return {
    sessionId: "1001",
    sessionName: "Junior 1",
    plainSessionName: "Junior 1",
    beginDate: "6/14/2026",
    endDate: "6/19/2026",
    cost: "$390",
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
    ...overrides,
  };
}

const sessions = [
  makeSession(),
  makeSession({
    sessionId: "1002",
    sessionName: "Junior 2",
    plainSessionName: "Junior 2",
    cost: "$440",
  }),
];

describe("sessionCapacity Markdoc tag pricing toggle", () => {
  it("REQ-PRICE-004 — showPricing=false hides the price in every bar of the block", () => {
    render(
      <MarkdocRenderer
        content={`{% sessionCapacity sessions=["Junior 1", "Junior 2"] showPricing=false /%}`}
        ultracampSessions={sessions}
      />,
    );
    expect(screen.getByText("Junior 1")).toBeInTheDocument();
    expect(screen.getByText("Junior 2")).toBeInTheDocument();
    expect(screen.queryAllByText(/\$\d/)).toHaveLength(0);
  });

  it("REQ-PRICE-004 — showPricing=true shows the price in every bar", () => {
    render(
      <MarkdocRenderer
        content={`{% sessionCapacity sessions=["Junior 1", "Junior 2"] showPricing=true /%}`}
        ultracampSessions={sessions}
      />,
    );
    expect(screen.getAllByText(/\$\d/)).toHaveLength(2);
  });

  it("REQ-PRICE-003 — absent showPricing attribute shows pricing", () => {
    render(
      <MarkdocRenderer
        content={`{% sessionCapacity sessions=["Junior 1", "Junior 2"] /%}`}
        ultracampSessions={sessions}
      />,
    );
    expect(screen.getAllByText(/\$\d/)).toHaveLength(2);
  });
});
