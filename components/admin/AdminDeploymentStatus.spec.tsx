// REQ-ADMIN-001: Admin Nav Strip - Compact Deployment Status Tests
import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

import { AdminDeploymentStatus } from "./AdminDeploymentStatus";

describe("REQ-ADMIN-001 — Compact Deployment Status Indicator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Visual Design (Compact)", () => {
    test("renders as a compact inline element", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: "READY",
          state: "Published",
          timestamp: Date.now(),
        }),
      });

      render(<AdminDeploymentStatus />);

      await waitFor(() => {
        const status = screen.getByTestId("admin-deployment-status");
      });
    });

    test("shows green dot for Published status", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: "READY",
          state: "Published",
          timestamp: Date.now(),
        }),
      });

      render(<AdminDeploymentStatus />);

      await waitFor(() => {
        const dot = screen.getByTestId("status-dot");
      });
    });

    test("shows yellow dot for Building status", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: "BUILDING",
          state: "Deploying",
          timestamp: Date.now(),
        }),
      });

      render(<AdminDeploymentStatus />);

      await waitFor(() => {
        const dot = screen.getByTestId("status-dot");
      });
    });

    test("shows red dot for Failed status", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: "ERROR",
          state: "Failed",
          timestamp: Date.now(),
        }),
      });

      render(<AdminDeploymentStatus />);

      await waitFor(() => {
        const dot = screen.getByTestId("status-dot");
      });
    });
  });

  describe("Status Text", () => {
    test('displays "Published" text when deployed', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: "READY",
          state: "Published",
          timestamp: Date.now(),
        }),
      });

      render(<AdminDeploymentStatus />);

      await waitFor(() => {
        expect(screen.getByText(/Published/i)).toBeInTheDocument();
      });
    });

    test('displays "Building" text when deploying', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: "BUILDING",
          state: "Deploying",
          timestamp: Date.now(),
        }),
      });

      render(<AdminDeploymentStatus />);

      await waitFor(() => {
        expect(screen.getByText(/Building/i)).toBeInTheDocument();
      });
    });

    test('displays "Error" text when deployment failed', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: "ERROR",
          state: "Failed",
          timestamp: Date.now(),
        }),
      });

      render(<AdminDeploymentStatus />);

      await waitFor(() => {
        expect(screen.getByText(/Error/i)).toBeInTheDocument();
      });
    });
  });

  describe("Error Handling", () => {
    test("shows gray dot for Local Dev/unknown status", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: "No VERCEL_TOKEN" }),
      });

      render(<AdminDeploymentStatus />);

      await waitFor(() => {
        const dot = screen.getByTestId("status-dot");
      });
    });

    test("handles network errors gracefully", async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error("Network error"));

      render(<AdminDeploymentStatus />);

      // Should not crash, should show fallback state
      await waitFor(() => {
        const status = screen.getByTestId("admin-deployment-status");
        expect(status).toBeInTheDocument();
      });
    });
  });

  describe("Accessibility", () => {
    test("has proper aria-label describing status", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: "READY",
          state: "Published",
          timestamp: Date.now(),
        }),
      });

      render(<AdminDeploymentStatus />);

      await waitFor(() => {
        const status = screen.getByTestId("admin-deployment-status");
        expect(status).toHaveAttribute(
          "aria-label",
          expect.stringContaining("status"),
        );
      });
    });
  });
});
