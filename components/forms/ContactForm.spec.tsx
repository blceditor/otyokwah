/**
 * REQ-OP005: Contact Form Captcha Tests
 * Story Points: 3 SP
 *
 * Tests for Cloudflare Turnstile integration and security
 */

import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ContactForm } from './ContactForm';

describe('REQ-OP005 — Contact Form Captcha', () => {
  test('renders Cloudflare Turnstile captcha widget', () => {
    render(<ContactForm />);

    // Turnstile widget should be present (typically via iframe or div with specific class)
    const form = screen.getByRole('form', { name: /contact/i });
    expect(form).toBeInTheDocument();

    // Should have turnstile container
    const turnstileContainer = form.querySelector('[data-turnstile]') ||
                               form.querySelector('.cf-turnstile');
    expect(turnstileContainer).toBeTruthy();
  });

  test('captcha validates before form submission', async () => {
    const mockSubmit = vi.fn();
    render(<ContactForm onSubmit={mockSubmit} />);

    const submitButton = screen.getByRole('button', { name: /submit|send/i });

    // Try to submit without captcha completion
    fireEvent.click(submitButton);

    // Should not submit until captcha is validated
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  test('form submits to API endpoint with captcha token', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(<ContactForm />);

    // Fill out form
    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const messageInput = screen.getByLabelText(/message/i);

    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(messageInput, { target: { value: 'Test message' } });

    // Mock captcha completion
    const form = screen.getByRole('form', { name: /contact/i });
    const captchaInput = form.querySelector('input[name="cf-turnstile-response"]');
    if (captchaInput) {
      fireEvent.change(captchaInput, { target: { value: 'mock-token' } });
    }

    const submitButton = screen.getByRole('button', { name: /submit|send/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/contact/),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('turnstile-response'),
        })
      );
    });
  });

  test('silently handles invalid email addresses', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(<ContactForm />);

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const messageInput = screen.getByLabelText(/message/i);

    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.change(messageInput, { target: { value: 'Test message' } });

    // Mock captcha completion
    const form = screen.getByRole('form', { name: /contact/i });
    const captchaInput = form.querySelector('input[name="cf-turnstile-response"]');
    if (captchaInput) {
      fireEvent.change(captchaInput, { target: { value: 'mock-token' } });
    }

    const submitButton = screen.getByRole('button', { name: /submit|send/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    // Should show success message even for invalid email (silent handling)
    // Or no user-facing error
    const errorMessage = screen.queryByText(/invalid.*email/i);
    expect(errorMessage).not.toBeInTheDocument();
  });

  test('no secrets in client-side code', () => {
    const { container } = render(<ContactForm />);

    // Should not have secret key in DOM
    const html = container.innerHTML;
    expect(html).not.toMatch(/[a-f0-9]{64}/); // Likely secret key format
    expect(html).not.toContain('secret');
    expect(html).not.toContain('TURNSTILE_SECRET');
  });

  test('accessible captcha implementation', () => {
    render(<ContactForm />);

    const form = screen.getByRole('form', { name: /contact/i });

    // Form fields should have proper labels
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();

    // Submit button should be accessible
    expect(screen.getByRole('button', { name: /submit|send/i })).toBeInTheDocument();
  });

  test('works on mobile viewport', () => {
    global.innerWidth = 375; // iPhone SE width
    global.innerHeight = 667;

    render(<ContactForm />);

    const form = screen.getByRole('form', { name: /contact/i });
    expect(form).toBeInTheDocument();

    // Form should be visible and functional
    const submitButton = screen.getByRole('button', { name: /submit|send/i });
    expect(submitButton).toBeVisible();
  });
});
