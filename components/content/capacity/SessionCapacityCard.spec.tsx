/**
 * SessionCapacityCard Component Tests
 * REQ-CAP-001: Remove waitlist count from capacity cards, keep status pill
 */

import { render, screen } from "@testing-library/react";
import type { UltraCampSession } from "@/lib/ultracamp/sessions";
import { SessionCapacityCard } from "./SessionCapacityCard";

function makeSession(overrides: Partial<UltraCampSession> = {}): UltraCampSession {
  return {
    sessionId: "1001",
    sessionName: "Test Session",
    plainSessionName: "Test Session",
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

describe("SessionCapacityCard", () => {
  describe("REQ-CAP-001a: No waitlist count text", () => {
    it("does not render 'on waitlist' text when totalWaitListCount > 0", () => {
      render(<SessionCapacityCard session={makeSession({ totalWaitListCount: 8 })} />);
      expect(screen.queryByText(/on waitlist/i)).not.toBeInTheDocument();
    });

    it("does not render 'on waitlist' text when totalWaitListCount is 0", () => {
      render(<SessionCapacityCard session={makeSession({ totalWaitListCount: 0 })} />);
      expect(screen.queryByText(/on waitlist/i)).not.toBeInTheDocument();
    });
  });

  describe("REQ-CAP-001b: Status pill still renders", () => {
    it("renders 'Almost Full!' status pill for high-capacity sessions", () => {
      render(
        <SessionCapacityCard
          session={makeSession({
            totalEnrollment: 46,
            maxTotal: 50,
          })}
        />
      );
      expect(screen.getByText("Almost Full!")).toBeInTheDocument();
    });

    it("renders 'Filling Fast' status pill for moderately full sessions", () => {
      render(
        <SessionCapacityCard
          session={makeSession({
            totalEnrollment: 37,
            maxTotal: 50,
          })}
        />
      );
      expect(screen.getByText("Filling Fast")).toBeInTheDocument();
    });

    it("renders 'Spots Available' status pill when capacity is low", () => {
      render(
        <SessionCapacityCard
          session={makeSession({
            totalEnrollment: 10,
            maxTotal: 50,
          })}
        />
      );
      expect(screen.getByText("Spots Available")).toBeInTheDocument();
    });
  });

  describe("REQ-CAP-001c: Capacity display shows spots remaining only", () => {
    it("renders spots left count without enrollment/max ratio", () => {
      render(
        <SessionCapacityCard
          session={makeSession({
            totalEnrollment: 35,
            maxTotal: 50,
          })}
        />
      );
      expect(screen.getByText("15 spots left")).toBeInTheDocument();
      expect(screen.queryByText(/35\/50/)).not.toBeInTheDocument();
      expect(screen.queryByText(/registered/i)).not.toBeInTheDocument();
    });

    it("renders 'Full' when no spots remain", () => {
      render(
        <SessionCapacityCard
          session={makeSession({
            totalEnrollment: 50,
            maxTotal: 50,
          })}
        />
      );
      expect(screen.getByText("Full")).toBeInTheDocument();
      expect(screen.queryByText(/50\/50/)).not.toBeInTheDocument();
    });
  });
});
