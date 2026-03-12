// REQ-002: Deployment Status Indicator - Component Tests
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import DeploymentStatus from './DeploymentStatus';
import '@testing-library/jest-dom/vitest';

describe('REQ-002 — Graceful Fallback to Local Dev State', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('shows "Local Dev" when API returns 500 error', async () => {
    // Mock fetch to return 500 server error (missing VERCEL_TOKEN env var)
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({
        error: 'VERCEL_TOKEN environment variable is not set',
      }),
    });

    render(<DeploymentStatus />);

    // Should show "Local Dev" label instead of infinite "Checking..." spinner
    await waitFor(() => {
      expect(screen.getByText(/Local Dev/i)).toBeInTheDocument();
    });

    // Should NOT show "Checking..." spinner indefinitely
    expect(screen.queryByText(/Checking/i)).not.toBeInTheDocument();

    // Should have appropriate styling (gray or neutral)
    const statusElement = screen.getByText(/Local Dev/i).closest('div');
  });

  test('shows "Local Dev" when API returns error response', async () => {
    // Mock fetch to return error JSON with ok: false
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({
        error: 'Internal server error',
      }),
    });

    render(<DeploymentStatus />);

    // Verify graceful fallback to "Local Dev" state
    await waitFor(() => {
      expect(screen.getByText(/Local Dev/i)).toBeInTheDocument();
    });

    // Component should not crash or show error state
    expect(screen.queryByText(/Failed/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Error/i)).not.toBeInTheDocument();
  });

  test('handles network errors gracefully without crashing', async () => {
    // Mock fetch to throw network error (e.g., no internet connection)
    (global.fetch as any).mockRejectedValueOnce(new Error('Network request failed'));

    render(<DeploymentStatus />);

    // Should show "Local Dev" instead of crashing
    await waitFor(() => {
      expect(screen.getByText(/Local Dev/i)).toBeInTheDocument();
    });

    // Component should render without throwing
    const statusElement = screen.getByText(/Local Dev/i).closest('div');
    expect(statusElement).toBeInTheDocument();

    // Should NOT show infinite spinner
    expect(screen.queryByText(/Checking/i)).not.toBeInTheDocument();
  });

  test('still shows deployment status when API succeeds', async () => {
    // Mock fetch to return valid deployment data (Published state)
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: 'READY',
        state: 'Published',
        timestamp: Date.now() - 120000, // 2 minutes ago
      }),
    });

    render(<DeploymentStatus />);

    // Should show correct deployment state when API succeeds
    await waitFor(() => {
      expect(screen.getByText(/Published/i)).toBeInTheDocument();
    });

    // Should NOT show "Local Dev" when API works correctly
    expect(screen.queryByText(/Local Dev/i)).not.toBeInTheDocument();
  });

  test('shows "Local Dev" for 404 endpoint not found', async () => {
    // Mock fetch to return 404 (API route doesn't exist in local dev)
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: async () => ({
        error: 'Route not found',
      }),
    });

    render(<DeploymentStatus />);

    // Should show "Local Dev" for 404 errors
    await waitFor(() => {
      expect(screen.getByText(/Local Dev/i)).toBeInTheDocument();
    });

    // Should have neutral/gray styling (not error red)
    const statusElement = screen.getByText(/Local Dev/i).closest('div');
  });

  test('shows "Local Dev" when API returns malformed JSON', async () => {
    // Mock fetch to return invalid JSON response
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => {
        throw new SyntaxError('Unexpected token in JSON');
      },
    });

    render(<DeploymentStatus />);

    // Should gracefully handle JSON parse errors
    await waitFor(() => {
      expect(screen.getByText(/Local Dev/i)).toBeInTheDocument();
    });

    // Component should not crash on malformed responses
    expect(screen.queryByText(/Checking/i)).not.toBeInTheDocument();
  });
});
