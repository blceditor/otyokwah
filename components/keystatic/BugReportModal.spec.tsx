// REQ-006: Bug Submission to GitHub - Component Tests
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BugReportModal from './BugReportModal';
import '@testing-library/jest-dom/vitest';
import { TEST_GITHUB } from '@/tests/fixtures/config';

describe('REQ-006 — Bug Report Modal Component', () => {
  const mockPageContext = {
    slug: 'about/staff',
    fieldValues: {
      title: 'Staff Page',
      content: 'Meet our amazing team'
    },
    timestamp: '2025-11-21T10:00:00Z'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.navigator.userAgent
    Object.defineProperty(window.navigator, 'userAgent', {
      writable: true,
      configurable: true,
      value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
    });
  });

  test('modal opens on button click', async () => {
    const user = userEvent.setup();

    render(<BugReportModal pageContext={mockPageContext} />);

    // Modal should be closed initially
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Click trigger button
    const triggerButton = screen.getByRole('button', { name: /report bug/i });
    await user.click(triggerButton);

    // Modal should now be open
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  test('form has title and description fields (required)', async () => {
    const user = userEvent.setup();

    render(<BugReportModal pageContext={mockPageContext} />);

    // Open modal
    const triggerButton = screen.getByRole('button', { name: /report bug/i });
    await user.click(triggerButton);

    // Check for required fields
    await waitFor(() => {
      const titleInput = screen.getByLabelText(/title/i);
      const descriptionInput = screen.getByLabelText(/description/i);

      expect(titleInput).toBeInTheDocument();
      expect(titleInput).toBeRequired();

      expect(descriptionInput).toBeInTheDocument();
      expect(descriptionInput).toBeRequired();
    });
  });

  test('include context checkbox checked by default', async () => {
    const user = userEvent.setup();

    render(<BugReportModal pageContext={mockPageContext} />);

    // Open modal
    const triggerButton = screen.getByRole('button', { name: /report bug/i });
    await user.click(triggerButton);

    // Check for context checkbox
    await waitFor(() => {
      const contextCheckbox = screen.getByRole('checkbox', {
        name: /include page context/i
      });

      expect(contextCheckbox).toBeInTheDocument();
      expect(contextCheckbox).toBeChecked();
    });
  });

  test('captures current page slug', async () => {
    const user = userEvent.setup();
    const mockSubmit = vi.fn();

    render(
      <BugReportModal pageContext={mockPageContext} onSubmit={mockSubmit} />
    );

    // Open modal and fill form
    const triggerButton = screen.getByRole('button', { name: /report bug/i });
    await user.click(triggerButton);

    await waitFor(async () => {
      const titleInput = screen.getByLabelText(/title/i);
      const descriptionInput = screen.getByLabelText(/description/i);

      await user.type(titleInput, 'Image upload fails');
      await user.type(descriptionInput, 'Cannot upload images larger than 2MB');
    });

    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);

    // Verify slug is included in submission
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          context: expect.objectContaining({
            slug: 'about/staff'
          })
        })
      );
    });
  });

  test('captures browser info (userAgent)', async () => {
    const user = userEvent.setup();
    const mockSubmit = vi.fn();

    render(
      <BugReportModal pageContext={mockPageContext} onSubmit={mockSubmit} />
    );

    // Open modal and submit
    const triggerButton = screen.getByRole('button', { name: /report bug/i });
    await user.click(triggerButton);

    await waitFor(async () => {
      const titleInput = screen.getByLabelText(/title/i);
      const descriptionInput = screen.getByLabelText(/description/i);

      await user.type(titleInput, 'Browser compatibility issue');
      await user.type(descriptionInput, 'Feature not working in Safari');
    });

    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);

    // Verify userAgent is captured
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          context: expect.objectContaining({
            browser: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
          })
        })
      );
    });
  });

  test('form validation prevents empty submission', async () => {
    const user = userEvent.setup();

    // Mock failed API to verify submission doesn't happen
    global.fetch = vi.fn();

    render(
      <BugReportModal pageContext={mockPageContext} />
    );

    // Open modal
    const triggerButton = screen.getByRole('button', { name: /report bug/i });
    await user.click(triggerButton);

    // Wait for modal to be open
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Get form fields and verify they are required
    const titleInput = screen.getByLabelText(/title/i);
    const descriptionInput = screen.getByLabelText(/description/i);

    expect(titleInput).toBeRequired();
    expect(descriptionInput).toBeRequired();

    // Try to submit without filling fields
    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);

    // HTML5 validation should prevent fetch from being called
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('shows success message after submission', async () => {
    const user = userEvent.setup();

    // Mock successful API response
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        issueUrl: `https://github.com/${TEST_GITHUB.full}/issues/42`
      })
    });

    render(<BugReportModal pageContext={mockPageContext} />);

    // Open modal and submit valid form
    const triggerButton = screen.getByRole('button', { name: /report bug/i });
    await user.click(triggerButton);

    await waitFor(async () => {
      const titleInput = screen.getByLabelText(/title/i);
      const descriptionInput = screen.getByLabelText(/description/i);

      await user.type(titleInput, 'Test bug report');
      await user.type(descriptionInput, 'This is a test description');
    });

    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);

    // Should show success message
    await waitFor(() => {
      const successMessage = screen.getByText(/bug report submitted successfully|submitted|success/i);
      expect(successMessage).toBeInTheDocument();
    });
  });

  test('closes modal after successful submission', async () => {
    const user = userEvent.setup();

    // Mock successful API response
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        issueUrl: `https://github.com/${TEST_GITHUB.full}/issues/42`
      })
    });

    render(<BugReportModal pageContext={mockPageContext} />);

    // Open modal
    const triggerButton = screen.getByRole('button', { name: /report bug/i });
    await user.click(triggerButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Submit form
    await waitFor(async () => {
      const titleInput = screen.getByLabelText(/title/i);
      const descriptionInput = screen.getByLabelText(/description/i);

      await user.type(titleInput, 'Test bug');
      await user.type(descriptionInput, 'Test description');
    });

    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);

    // Modal should close after 2 second delay
    await waitFor(
      () => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  test('shows error message if submission fails', async () => {
    const user = userEvent.setup();

    // Mock failed API response
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({
        error: 'GitHub API error'
      })
    });

    render(<BugReportModal pageContext={mockPageContext} />);

    // Open modal and submit
    const triggerButton = screen.getByRole('button', { name: /report bug/i });
    await user.click(triggerButton);

    await waitFor(async () => {
      const titleInput = screen.getByLabelText(/title/i);
      const descriptionInput = screen.getByLabelText(/description/i);

      await user.type(titleInput, 'Test bug');
      await user.type(descriptionInput, 'Test description');
    });

    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);

    // Should show error message
    await waitFor(() => {
      const errorMessage = screen.getByText(/failed to submit|error|something went wrong/i);
      expect(errorMessage).toBeInTheDocument();
    });
  });

  test('modal accessible (ARIA, keyboard nav)', async () => {
    const user = userEvent.setup();

    render(<BugReportModal pageContext={mockPageContext} />);

    // Open modal
    const triggerButton = screen.getByRole('button', { name: /report bug/i });
    await user.click(triggerButton);

    await waitFor(() => {
      const dialog = screen.getByRole('dialog');

      // Dialog should have accessible attributes
      expect(dialog).toBeInTheDocument();
      expect(
        dialog.hasAttribute('aria-labelledby') ||
          dialog.hasAttribute('aria-label')
      ).toBeTruthy();

      // Should have close button accessible via keyboard
      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toBeInTheDocument();
    });

    // Test keyboard navigation (ESC to close) - fire on backdrop which has onKeyDown handler
    const dialog = screen.getByRole('dialog');
    const backdrop = dialog.parentElement!;
    fireEvent.keyDown(backdrop, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
