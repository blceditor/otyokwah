'use client';

/**
 * REQ-CARD-004: Visual Icon Picker Enhancement
 * Story Points: 3.0 SP
 *
 * Enhances Keystatic icon select fields with a visual grid picker.
 * Uses MutationObserver to detect icon fields and inject picker buttons.
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { usePathname } from 'next/navigation';
import { createPortal } from 'react-dom';
import * as LucideIcons from 'lucide-react';
import { X } from 'lucide-react';

// Icon options matching LUCIDE_ICON_OPTIONS in keystatic.config.ts
const ICON_OPTIONS = [
  '',
  'Award',
  'Backpack',
  'Ban',
  'Bed',
  'Book',
  'Calendar',
  'Camera',
  'Car',
  'Check',
  'CheckCircle',
  'ClipboardCheck',
  'ClipboardList',
  'Clock',
  'Cross',
  'DollarSign',
  'Droplet',
  'Flower',
  'Gamepad2',
  'Gift',
  'GraduationCap',
  'Heart',
  'Leaf',
  'Lightbulb',
  'Mail',
  'MessageCircle',
  'Mountain',
  'Phone',
  'Pill',
  'Search',
  'Shield',
  'Shirt',
  'Smartphone',
  'Star',
  'Stethoscope',
  'Sun',
  'Users',
  'Wallet',
] as const;

type IconName = (typeof ICON_OPTIONS)[number];

interface IconPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (iconName: string) => void;
  currentValue: string;
}

/**
 * Modal component displaying a visual grid of icons
 */
export function IconPickerModal({
  isOpen,
  onClose,
  onSelect,
  currentValue,
}: IconPickerModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  // Filter icons based on search
  const filteredIcons = ICON_OPTIONS.filter((icon) =>
    icon.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Get icon component by name
  const getIconComponent = (name: string) => {
    if (!name) return null;
    const icons = LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>;
    const IconComponent = icons[name];
    return IconComponent || null;
  };

  const CurrentIcon = currentValue ? getIconComponent(currentValue) : null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="icon-picker-title"
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 id="icon-picker-title" className="text-lg font-semibold text-gray-900 dark:text-white">
            Select Icon
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Preview */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 dark:text-gray-400">Current:</span>
            <div
              data-testid="icon-preview"
              className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600"
            >
              {CurrentIcon ? (
                <>
                  <CurrentIcon className="h-5 w-5 text-secondary" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{currentValue}</span>
                </>
              ) : (
                <span className="text-sm text-gray-400 italic">None</span>
              )}
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <input
            type="text"
            placeholder="Search icons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
          />
        </div>

        {/* Icon Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-6 gap-2">
            {filteredIcons.map((iconName) => {
              const Icon = iconName ? getIconComponent(iconName) : null;
              const isSelected = iconName === currentValue;
              const isEmpty = iconName === '';

              return (
                <button
                  key={iconName || 'none'}
                  type="button"
                  title={isEmpty ? 'None' : iconName}
                  onClick={() => {
                    onSelect(iconName);
                    onClose();
                  }}
                  className={`
                    flex flex-col items-center justify-center p-2 rounded-md transition-all
                    hover:bg-gray-100 dark:hover:bg-gray-700
                    ${isSelected ? 'ring-2 ring-secondary bg-secondary/10' : ''}
                    ${isEmpty ? 'border-2 border-dashed border-gray-300 dark:border-gray-600' : ''}
                  `}
                >
                  {isEmpty ? (
                    <div className="h-6 w-6 flex items-center justify-center">
                      <X className="h-4 w-4 text-gray-400" />
                    </div>
                  ) : Icon ? (
                    <Icon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                  ) : (
                    <div className="h-6 w-6" />
                  )}
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 truncate max-w-full">
                    {isEmpty ? 'None' : iconName}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

/**
 * Enhancer component that injects icon pickers into Keystatic editor
 */
export function IconFieldEnhancer() {
  const pathname = usePathname() ?? "";
  const observerRef = useRef<MutationObserver | null>(null);
  const enhancedFieldsRef = useRef<Set<Element>>(new Set());
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    targetInput: HTMLElement | null;
    currentValue: string;
  }>({
    isOpen: false,
    targetInput: null,
    currentValue: '',
  });

  // Check if we're on an editor route
  const isEditorRoute = useCallback(() => {
    return pathname?.includes('/keystatic/') ?? false;
  }, [pathname]);

  // Find and enhance icon select fields
  const enhanceIconFields = useCallback(() => {
    if (!isEditorRoute()) return;

    // Find labels containing "Icon"
    const labels = document.querySelectorAll('label, span');

    labels.forEach((label) => {
      const labelText = label.textContent?.toLowerCase() || '';
      if (!labelText.includes('icon')) return;

      // Find the field container
      const fieldContainer =
        label.closest('[data-field]') ||
        label.closest('fieldset') ||
        label.parentElement?.parentElement;

      if (!fieldContainer) return;

      // Look for select or button that Keystatic renders
      const selectElement = fieldContainer.querySelector(
        'select, button[aria-haspopup="listbox"], [role="combobox"]'
      );

      if (!selectElement) return;
      if (enhancedFieldsRef.current.has(selectElement)) return;

      // Mark as enhanced
      enhancedFieldsRef.current.add(selectElement);

      // Create preview + picker button container
      const container = document.createElement('div');
      container.className = 'icon-field-enhancer inline-flex items-center gap-2 ml-2';
      container.setAttribute('data-icon-enhancer', 'true');

      // Create preview element
      const preview = document.createElement('div');
      preview.className = 'icon-preview-box flex items-center justify-center w-8 h-8 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800';
      preview.setAttribute('data-icon-preview-box', 'true');

      // Create picker button
      const pickerBtn = document.createElement('button');
      pickerBtn.type = 'button';
      pickerBtn.className = 'icon-picker-btn px-2 py-1 text-xs font-medium text-secondary bg-secondary/10 border border-secondary/30 rounded hover:bg-secondary/20 transition-colors';
      pickerBtn.textContent = 'Pick Icon';

      container.appendChild(preview);
      container.appendChild(pickerBtn);

      // Insert after the select element
      selectElement.parentElement?.insertBefore(container, selectElement.nextSibling);

      // Function to update preview
      const updatePreview = () => {
        let value = '';

        // Get value from select or Keystatic's custom dropdown
        if (selectElement instanceof HTMLSelectElement) {
          value = selectElement.value;
        } else {
          // Keystatic uses a custom button with aria-haspopup
          const selectedText = selectElement.textContent?.trim() || '';
          // Check if it's a valid icon name
          if (ICON_OPTIONS.includes(selectedText as IconName)) {
            value = selectedText;
          }
        }

        // Render icon preview
        preview.innerHTML = '';
        if (value && value !== 'None') {
          const icons = LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>;
            const IconComponent = icons[value];
          if (IconComponent) {
            const iconEl = document.createElement('span');
            iconEl.className = 'flex items-center justify-center';
            // We'll use inline SVG since we can't render React here easily
            preview.innerHTML = `<svg class="h-5 w-5 text-secondary" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="8" fill="currentColor">${value.slice(0, 2)}</text></svg>`;
          }
        } else {
          preview.innerHTML = '<span class="text-gray-400 text-xs">—</span>';
        }
      };

      // Initial preview update
      updatePreview();

      // Listen for changes
      selectElement.addEventListener('change', updatePreview);

      // Also observe for Keystatic's custom dropdown changes
      const observer = new MutationObserver(() => {
        setTimeout(updatePreview, 100);
      });
      observer.observe(selectElement, { childList: true, subtree: true, characterData: true });

      // Picker button click handler
      pickerBtn.addEventListener('click', () => {
        let currentValue = '';
        if (selectElement instanceof HTMLSelectElement) {
          currentValue = selectElement.value;
        } else {
          const selectedText = selectElement.textContent?.trim() || '';
          if (ICON_OPTIONS.includes(selectedText as IconName)) {
            currentValue = selectedText;
          }
        }

        setModalState({
          isOpen: true,
          targetInput: selectElement as HTMLElement,
          currentValue,
        });
      });
    });
  }, [isEditorRoute]);

  // Handle icon selection from modal
  const handleIconSelect = useCallback((iconName: string) => {
    const { targetInput } = modalState;
    if (!targetInput) return;

    // Update the select/dropdown value
    if (targetInput instanceof HTMLSelectElement) {
      targetInput.value = iconName;
      targetInput.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      // For Keystatic's custom dropdown, we need to click it and select the option
      // This is tricky - we'll trigger a click and then find the option
      targetInput.click();

      // Wait for dropdown to open
      setTimeout(() => {
        const listbox = document.querySelector('[role="listbox"]');
        if (listbox) {
          const options = listbox.querySelectorAll('[role="option"]');
          options.forEach((option) => {
            if (option.textContent?.trim() === iconName || (iconName === '' && option.textContent?.trim() === 'None')) {
              (option as HTMLElement).click();
            }
          });
        }
      }, 100);
    }

    // Update preview
    setTimeout(() => {
      const preview = targetInput.parentElement?.querySelector('[data-icon-preview-box]');
      if (preview && iconName) {
        const abbrev = iconName.slice(0, 2);
        preview.innerHTML = `<svg class="h-5 w-5 text-secondary" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="8" fill="currentColor">${abbrev}</text></svg>`;
      } else if (preview) {
        preview.innerHTML = '<span class="text-gray-400 text-xs">—</span>';
      }
    }, 200);
  }, [modalState]);

  // Set up observer
  useEffect(() => {
    if (!isEditorRoute()) return;

    // Initial enhancement
    const initialTimeout = setTimeout(enhanceIconFields, 1000);

    // Observer for dynamic content
    observerRef.current = new MutationObserver(() => {
      setTimeout(enhanceIconFields, 500);
    });

    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true,
    });

    const currentObserver = observerRef.current;
    const currentEnhanced = enhancedFieldsRef.current;
    return () => {
      clearTimeout(initialTimeout);
      currentObserver?.disconnect();
      currentEnhanced.clear();
    };
  }, [pathname, isEditorRoute, enhanceIconFields]);

  return (
    <IconPickerModal
      isOpen={modalState.isOpen}
      onClose={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
      onSelect={handleIconSelect}
      currentValue={modalState.currentValue}
    />
  );
}

export default IconFieldEnhancer;
