/**
 * SessionCapacityBar Component Tests
 * REQ-CAP-001: Remove waitlist count from capacity bars, keep waitlist banner pill
 */

import { render, screen } from "@testing-library/react";
import type { UltraCampSession } from "@/lib/ultracamp/sessions";
import { SessionCapacityBar } from "./SessionCapacityBar";

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

describe("SessionCapacityBar", () => {
  describe("REQ-CAP-001a: No waitlist count text in capacity bars", () => {
    it("does not render 'on waitlist' text when totalWaitListCount > 0", () => {
      render(<SessionCapacityBar session={makeSession({ totalWaitListCount: 5 })} />);
      expect(screen.queryByText(/on waitlist/i)).not.toBeInTheDocument();
    });

    it("does not render 'on waitlist' text when totalWaitListCount is 0", () => {
      render(<SessionCapacityBar session={makeSession({ totalWaitListCount: 0 })} />);
      expect(screen.queryByText(/on waitlist/i)).not.toBeInTheDocument();
    });
  });

  describe("REQ-CAP-001b: Waitlist status pill still renders", () => {
    it("renders 'Waitlist' pill when session is full and has a waitlist", () => {
      render(
        <SessionCapacityBar
          session={makeSession({
            totalEnrollment: 50,
            maxTotal: 50,
            maleEnrollment: 25,
            maxMales: 25,
            femaleEnrollment: 25,
            maxFemales: 25,
            totalWaitListCount: 3,
          })}
        />
      );
      expect(screen.getByText("Waitlist")).toBeInTheDocument();
    });

    it("renders 'Almost Full!' pill when session has a waitlist but spots remain", () => {
      render(
        <SessionCapacityBar
          session={makeSession({
            totalEnrollment: 40,
            maxTotal: 50,
            maleEnrollment: 20,
            maxMales: 25,
            femaleEnrollment: 20,
            maxFemales: 25,
            totalWaitListCount: 2,
          })}
        />
      );
      expect(screen.getByText("Almost Full!")).toBeInTheDocument();
    });

    it("does not render a status pill when capacity is comfortably available", () => {
      render(
        <SessionCapacityBar
          session={makeSession({
            totalEnrollment: 10,
            maxTotal: 50,
            maleEnrollment: 5,
            maxMales: 25,
            femaleEnrollment: 5,
            maxFemales: 25,
            totalWaitListCount: 0,
          })}
        />
      );
      expect(screen.queryByText("Waitlist")).not.toBeInTheDocument();
      expect(screen.queryByText(/Almost Full/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Filling Fast/i)).not.toBeInTheDocument();
    });
  });

  describe("REQ-CAP-001c: Capacity bars show spots remaining only", () => {
    it("renders 'spots left' count for boys bar without enrollment/max ratio", () => {
      render(
        <SessionCapacityBar
          session={makeSession({
            maleEnrollment: 18,
            maxMales: 25,
          })}
        />
      );
      // Should show spots left
      expect(screen.getByText("7 spots left")).toBeInTheDocument();
      // Should NOT show enrollment/max ratio
      expect(screen.queryByText(/18\/25/)).not.toBeInTheDocument();
      expect(screen.queryByText(/registered/i)).not.toBeInTheDocument();
    });

    it("renders 'spots left' count for girls bar without enrollment/max ratio", () => {
      render(
        <SessionCapacityBar
          session={makeSession({
            femaleEnrollment: 20,
            maxFemales: 25,
          })}
        />
      );
      expect(screen.getByText("5 spots left")).toBeInTheDocument();
      expect(screen.queryByText(/20\/25/)).not.toBeInTheDocument();
      expect(screen.queryByText(/registered/i)).not.toBeInTheDocument();
    });

    it("renders 'Full' when no spots remain", () => {
      render(
        <SessionCapacityBar
          session={makeSession({
            maleEnrollment: 25,
            maxMales: 25,
            femaleEnrollment: 25,
            maxFemales: 25,
          })}
        />
      );
      const fullLabels = screen.getAllByText("Full");
      expect(fullLabels.length).toBeGreaterThanOrEqual(1);
    });
  });
});
