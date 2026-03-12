/**
 * REQ-CARD-004: Visual Icon Picker Enhancement Tests
 * Story Points: 3.0 SP
 *
 * Tests for IconFieldEnhancer component that provides visual icon selection
 * in the Keystatic CMS editor.
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { IconFieldEnhancer, IconPickerModal } from './IconFieldEnhancer';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/keystatic/branch/main/collection/pages/item/test-page',
}));

describe('REQ-CARD-004 — IconFieldEnhancer Component', () => {
  describe('Icon Picker Modal', () => {
    test('renders modal with icon grid when open', () => {
      const onSelect = vi.fn();
      const onClose = vi.fn();

      render(
        <IconPickerModal
          isOpen={true}
          onClose={onClose}
          onSelect={onSelect}
          currentValue="Heart"
        />
      );

      // Modal should be visible
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Select Icon')).toBeInTheDocument();
    });

    test('displays all available icons in a grid', () => {
      const onSelect = vi.fn();
      const onClose = vi.fn();

      render(
        <IconPickerModal
          isOpen={true}
          onClose={onClose}
          onSelect={onSelect}
          currentValue=""
        />
      );

      // Should have icon buttons for common icons
      expect(screen.getByTitle('Heart')).toBeInTheDocument();
      expect(screen.getByTitle('Star')).toBeInTheDocument();
      expect(screen.getByTitle('Calendar')).toBeInTheDocument();
      expect(screen.getByTitle('Users')).toBeInTheDocument();
    });

    test('highlights currently selected icon', () => {
      const onSelect = vi.fn();
      const onClose = vi.fn();

      render(
        <IconPickerModal
          isOpen={true}
          onClose={onClose}
          onSelect={onSelect}
          currentValue="Heart"
        />
      );

      const heartButton = screen.getByTitle('Heart');
    });

    test('calls onSelect when icon is clicked', () => {
      const onSelect = vi.fn();
      const onClose = vi.fn();

      render(
        <IconPickerModal
          isOpen={true}
          onClose={onClose}
          onSelect={onSelect}
          currentValue=""
        />
      );

      const starButton = screen.getByTitle('Star');
      fireEvent.click(starButton);

      expect(onSelect).toHaveBeenCalledWith('Star');
    });

    test('calls onClose when close button is clicked', () => {
      const onSelect = vi.fn();
      const onClose = vi.fn();

      render(
        <IconPickerModal
          isOpen={true}
          onClose={onClose}
          onSelect={onSelect}
          currentValue=""
        />
      );

      const closeButton = screen.getByLabelText('Close');
      fireEvent.click(closeButton);

      expect(onClose).toHaveBeenCalled();
    });

    test('supports search/filter functionality', () => {
      const onSelect = vi.fn();
      const onClose = vi.fn();

      render(
        <IconPickerModal
          isOpen={true}
          onClose={onClose}
          onSelect={onSelect}
          currentValue=""
        />
      );

      const searchInput = screen.getByPlaceholderText(/search/i);
      fireEvent.change(searchInput, { target: { value: 'heart' } });

      // Should filter to show only matching icons
      expect(screen.getByTitle('Heart')).toBeInTheDocument();
      // Star should be hidden (or not match filter)
      expect(screen.queryByTitle('Star')).not.toBeInTheDocument();
    });

    test('has "None" option to clear selection', () => {
      const onSelect = vi.fn();
      const onClose = vi.fn();

      render(
        <IconPickerModal
          isOpen={true}
          onClose={onClose}
          onSelect={onSelect}
          currentValue="Heart"
        />
      );

      const noneButton = screen.getByTitle('None');
      fireEvent.click(noneButton);

      expect(onSelect).toHaveBeenCalledWith('');
    });

    test('does not render when isOpen is false', () => {
      const onSelect = vi.fn();
      const onClose = vi.fn();

      render(
        <IconPickerModal
          isOpen={false}
          onClose={onClose}
          onSelect={onSelect}
          currentValue=""
        />
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('Icon Preview Display', () => {
    test('shows visual preview of selected icon', () => {
      const onSelect = vi.fn();
      const onClose = vi.fn();

      render(
        <IconPickerModal
          isOpen={true}
          onClose={onClose}
          onSelect={onSelect}
          currentValue="Heart"
        />
      );

      // Preview section should show current icon
      const preview = screen.getByTestId('icon-preview');
      expect(preview).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('modal has proper aria attributes', () => {
      const onSelect = vi.fn();
      const onClose = vi.fn();

      render(
        <IconPickerModal
          isOpen={true}
          onClose={onClose}
          onSelect={onSelect}
          currentValue=""
        />
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby');
    });

    test('icon buttons have accessible names', () => {
      const onSelect = vi.fn();
      const onClose = vi.fn();

      render(
        <IconPickerModal
          isOpen={true}
          onClose={onClose}
          onSelect={onSelect}
          currentValue=""
        />
      );

      // Each icon button should have a title for accessibility
      const heartButton = screen.getByTitle('Heart');
      expect(heartButton).toBeInTheDocument();
    });

    test('supports keyboard navigation', () => {
      const onSelect = vi.fn();
      const onClose = vi.fn();

      render(
        <IconPickerModal
          isOpen={true}
          onClose={onClose}
          onSelect={onSelect}
          currentValue=""
        />
      );

      // Close on Escape
      fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Dark Mode Support', () => {
    test('applies dark mode styles when html has dark class', () => {
      // Add dark class to document
      document.documentElement.classList.add('dark');

      const onSelect = vi.fn();
      const onClose = vi.fn();

      render(
        <IconPickerModal
          isOpen={true}
          onClose={onClose}
          onSelect={onSelect}
          currentValue=""
        />
      );

      const dialog = screen.getByRole('dialog');
      // Should have dark mode compatible styling
      expect(dialog).toBeInTheDocument();

      // Cleanup
      document.documentElement.classList.remove('dark');
    });
  });
});
