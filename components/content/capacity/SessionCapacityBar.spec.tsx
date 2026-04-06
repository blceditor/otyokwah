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
      expect(screen.getAllByText("Waitlist").length).toBeGreaterThanOrEqual(1);
    });

    it("renders 'Filling Fast' pill when one gender has waitlist but other has spots", () => {
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
      expect(screen.getByText("Filling Fast")).toBeInTheDocument();
    });

    it("REQ-CAP-002: renders 'Waitlist' pill when open beds equal waitlist count (reserved for waitlisted families)", () => {
      render(
        <SessionCapacityBar
          session={makeSession({
            totalEnrollment: 48,
            maxTotal: 50,
            maleEnrollment: 24,
            maxMales: 25,
            femaleEnrollment: 24,
            maxFemales: 25,
            totalWaitListCount: 2,
          })}
        />
      );
      expect(screen.getAllByText("Waitlist").length).toBeGreaterThanOrEqual(1);
    });

    it("REQ-CAP-002: renders 'Waitlist' pill when open beds are fewer than waitlist count", () => {
      render(
        <SessionCapacityBar
          session={makeSession({
            totalEnrollment: 49,
            maxTotal: 50,
            maleEnrollment: 24,
            maxMales: 25,
            femaleEnrollment: 25,
            maxFemales: 25,
            totalWaitListCount: 3,
          })}
        />
      );
      expect(screen.getAllByText("Waitlist").length).toBeGreaterThanOrEqual(1);
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
      
      expect(screen.queryByText(/Almost Full/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Filling Fast/i)).not.toBeInTheDocument();
    });
  });

  describe("REQ-CAP-003: Per-gender waitlist-hold state machine", () => {
    it("State 1: AT_CAPACITY — shows Waitlist when enrollment >= max (all sessions allow waitlists)", () => {
      render(
        <SessionCapacityBar
          session={makeSession({
            maleEnrollment: 36, maxMales: 36,
            femaleEnrollment: 45, maxFemales: 45,
            totalWaitListCount: 0,
          })}
        />,
      );
      const waitlistLabels = screen.getAllByText("Waitlist");
      expect(waitlistLabels.length).toBeGreaterThanOrEqual(2);
    });

    it("State 2: WAITLIST_HOLD — shows Waitlist for gender with open bed reserved", () => {
      // Jr. High 1 scenario: girls=44/45 (1 spot), waitlist=5
      render(
        <SessionCapacityBar
          session={makeSession({
            maleEnrollment: 30, maxMales: 36,
            femaleEnrollment: 44, maxFemales: 45,
            totalWaitListCount: 5,
          })}
        />,
      );
      expect(screen.getByText("6 spots left")).toBeInTheDocument();
      expect(screen.getAllByText("Waitlist").length).toBeGreaterThanOrEqual(1);
    });

    it("State 2: WAITLIST_HOLD — shows Waitlist for both when both have fewer spots than waitlist", () => {
      render(
        <SessionCapacityBar
          session={makeSession({
            maleEnrollment: 34, maxMales: 36,
            femaleEnrollment: 43, maxFemales: 45,
            totalWaitListCount: 5,
          })}
        />,
      );
      const waitlistLabels = screen.getAllByText("Waitlist");
      expect(waitlistLabels.length).toBeGreaterThanOrEqual(2);
    });

    it("State 3: AVAILABLE — shows spots when gender has more open than waitlist count", () => {
      // Boys have 20 spots open, waitlist only 2 — boys are genuinely available
      // Girls at capacity → "Full" (atCapacity, not waitlistHold)
      render(
        <SessionCapacityBar
          session={makeSession({
            maleEnrollment: 16, maxMales: 36,
            femaleEnrollment: 45, maxFemales: 45,
            totalWaitListCount: 2,
          })}
        />,
      );
      expect(screen.getByText("20 spots left")).toBeInTheDocument();
      expect(screen.getAllByText("Waitlist").length).toBeGreaterThanOrEqual(1);
    });

    it("State 3: AVAILABLE — shows spots for both when no waitlist", () => {
      render(
        <SessionCapacityBar
          session={makeSession({
            maleEnrollment: 23, maxMales: 36,
            femaleEnrollment: 43, maxFemales: 45,
            totalWaitListCount: 0,
          })}
        />,
      );
      expect(screen.getByText("13 spots left")).toBeInTheDocument();
      expect(screen.getByText("2 spots left")).toBeInTheDocument();
      expect(screen.queryByText("Full")).not.toBeInTheDocument();
    });

    it("Mixed: one gender at capacity, other available, no waitlist → Waitlist (all sessions allow waitlists)", () => {
      render(
        <SessionCapacityBar
          session={makeSession({
            maleEnrollment: 36, maxMales: 36,
            femaleEnrollment: 20, maxFemales: 45,
            totalWaitListCount: 0,
          })}
        />,
      );
      expect(screen.getAllByText("Waitlist").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("25 spots left")).toBeInTheDocument();
    });

    it("Edge: exactly 1 spot left, singular 'spot' text", () => {
      render(
        <SessionCapacityBar
          session={makeSession({
            maleEnrollment: 35, maxMales: 36,
            femaleEnrollment: 20, maxFemales: 45,
            totalWaitListCount: 0,
          })}
        />,
      );
      expect(screen.getByText("1 spot left")).toBeInTheDocument();
    });

    it("Edge: waitlist=1, boys 1 spot open → Waitlist, girls at capacity → Waitlist", () => {
      render(
        <SessionCapacityBar
          session={makeSession({
            maleEnrollment: 35, maxMales: 36,
            femaleEnrollment: 45, maxFemales: 45,
            totalWaitListCount: 1,
          })}
        />,
      );
      expect(screen.getAllByText("Waitlist").length).toBeGreaterThanOrEqual(2);
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
      const waitlistLabels = screen.getAllByText("Waitlist");
      expect(waitlistLabels.length).toBeGreaterThanOrEqual(1);
    });
  });
});
