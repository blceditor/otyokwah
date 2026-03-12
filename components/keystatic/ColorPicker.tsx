"use client";

/**
 * REQ-CMS-005: Color Picker with Theme Presets
 * Story Points: 4 SP
 *
 * Color picker component for Keystatic CMS that provides:
 * - Theme color presets from tailwind.config.ts
 * - Standard web color grid
 * - Hex input with validation
 * - Real-time preview
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

// Theme colors from tailwind.config.ts
export const THEME_COLOR_PRESETS = [
  { name: "Emerald/Forest Green", hex: "#047857" },
  { name: "Sky Blue", hex: "#0284c7" },
  { name: "Amber/Gold", hex: "#d97706" },
  { name: "Purple", hex: "#7e22ce" },
  { name: "Cream", hex: "#f5f0e8" },
  { name: "Bark/Dark", hex: "#1f2937" },
] as const;

// Standard web colors grid
export const STANDARD_WEB_COLORS = [
  // Row 1: Reds
  "#ff0000",
  "#ff4444",
  "#ff6666",
  "#ff8888",
  "#ffaaaa",
  "#ffcccc",
  // Row 2: Oranges
  "#ff6600",
  "#ff8833",
  "#ffaa55",
  "#ffbb77",
  "#ffcc99",
  "#ffddbb",
  // Row 3: Yellows
  "#ffff00",
  "#ffff44",
  "#ffff77",
  "#ffffaa",
  "#ffffcc",
  "#ffffee",
  // Row 4: Greens
  "#00ff00",
  "#44ff44",
  "#77ff77",
  "#aaffaa",
  "#ccffcc",
  "#eeffee",
  // Row 5: Cyans
  "#00ffff",
  "#44ffff",
  "#77ffff",
  "#aaffff",
  "#ccffff",
  "#eeffff",
  // Row 6: Blues
  "#0000ff",
  "#4444ff",
  "#6666ff",
  "#8888ff",
  "#aaaaff",
  "#ccccff",
  // Row 7: Purples
  "#ff00ff",
  "#ff44ff",
  "#ff77ff",
  "#ffaaff",
  "#ffccff",
  "#ffeeff",
  // Row 8: Grays
  "#000000",
  "#333333",
  "#666666",
  "#999999",
  "#cccccc",
  "#ffffff",
] as const;

/**
 * Validates a hex color string
 * Accepts formats: #RGB, #RRGGBB (case insensitive)
 */
export function isValidHexColor(value: string): boolean {
  const hexPattern = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
  return hexPattern.test(value);
}

/**
 * Normalizes a hex color to 6-digit format
 */
export function normalizeHexColor(value: string): string {
  if (!isValidHexColor(value)) return value;

  const hex = value.slice(1).toUpperCase();
  if (hex.length === 3) {
    return `#${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`;
  }
  return `#${hex}`;
}

/**
 * Determines if text should be light or dark based on background color
 */
export function getContrastTextColor(hexColor: string): "light" | "dark" {
  const normalized = normalizeHexColor(hexColor);
  if (!isValidHexColor(normalized)) return "dark";

  const hex = normalized.slice(1);
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  // Using relative luminance formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "dark" : "light";
}

export interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
  disabled?: boolean;
}

/**
 * Color picker component with theme presets and standard colors
 */
export function ColorPicker({
  value,
  onChange,
  label = "Color",
  disabled = false,
}: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hexInput, setHexInput] = useState(value || "");
  const [hexError, setHexError] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Sync hex input with value prop
  useEffect(() => {
    setHexInput(value || "");
    setHexError(false);
  }, [value]);

  const handleHexInputChange = useCallback(
    (inputValue: string) => {
      // Add # if not present
      let processedValue = inputValue;
      if (processedValue && !processedValue.startsWith("#")) {
        processedValue = `#${processedValue}`;
      }

      setHexInput(processedValue);

      // Validate and update
      if (processedValue === "" || processedValue === "#") {
        setHexError(false);
        onChange("");
      } else if (isValidHexColor(processedValue)) {
        setHexError(false);
        onChange(normalizeHexColor(processedValue));
      } else {
        setHexError(true);
      }
    },
    [onChange],
  );

  const handleColorSelect = useCallback(
    (color: string) => {
      onChange(color);
      setHexInput(color);
      setHexError(false);
      setIsOpen(false);
    },
    [onChange],
  );

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Get display color for preview
  const displayColor = value && isValidHexColor(value) ? value : "transparent";
  const hasValidColor = value && isValidHexColor(value);

  return (
    <div className="color-picker-container">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}

      <div className="flex items-center gap-2">
        {/* Color Preview Button */}
        <button
          ref={buttonRef}
          type="button"
          onClick={() => !disabled && setIsOpen(true)}
          disabled={disabled}
          data-testid="color-preview"
          className={`
            w-10 h-10 rounded-lg border-2 transition-all
            ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:scale-105"}
            ${hasValidColor ? "border-gray-300 dark:border-gray-600" : "border-dashed border-gray-400 dark:border-gray-500"}
          `}
          style={{
            backgroundColor: displayColor,
          }}
          aria-label={`Selected color: ${value || "none"}. Click to pick a color.`}
        >
          {!hasValidColor && <span className="text-gray-400 text-xs">?</span>}
        </button>

        {/* Hex Input */}
        <input
          type="text"
          value={hexInput}
          onChange={(e) => handleHexInputChange(e.target.value)}
          disabled={disabled}
          placeholder="#000000"
          data-testid="color-hex-input"
          className={`
            w-24 px-2 py-1.5 text-sm font-mono
            border rounded-md
            bg-white dark:bg-gray-800
            text-gray-900 dark:text-white
            placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent
            ${hexError ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"}
            ${disabled ? "cursor-not-allowed opacity-50" : ""}
          `}
          aria-label="Hex color value"
          aria-invalid={hexError}
        />

        {hexError && (
          <span className="text-red-500 text-xs" role="alert">
            Invalid hex
          </span>
        )}
      </div>

      {isOpen && (
        <ColorPickerModal
          value={value}
          onSelect={handleColorSelect}
          onClose={handleClose}
        />
      )}
    </div>
  );
}

interface ColorPickerModalProps {
  value: string;
  onSelect: (color: string) => void;
  onClose: () => void;
}

/**
 * Modal component displaying color presets and grid
 */
export function ColorPickerModal({
  value,
  onSelect,
  onClose,
}: ColorPickerModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [hexInput, setHexInput] = useState(value || "");
  const [hexError, setHexError] = useState(false);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleHexSubmit = useCallback(() => {
    let processedValue = hexInput;
    if (processedValue && !processedValue.startsWith("#")) {
      processedValue = `#${processedValue}`;
    }

    if (isValidHexColor(processedValue)) {
      onSelect(normalizeHexColor(processedValue));
    } else {
      setHexError(true);
    }
  }, [hexInput, onSelect]);

  const handleHexKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleHexSubmit();
      }
    },
    [handleHexSubmit],
  );

  // Get display color for preview
  const previewColor =
    hexInput &&
    isValidHexColor(hexInput.startsWith("#") ? hexInput : `#${hexInput}`)
      ? hexInput.startsWith("#")
        ? hexInput
        : `#${hexInput}`
      : value && isValidHexColor(value)
        ? value
        : "transparent";

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="color-picker-title"
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2
            id="color-picker-title"
            className="text-lg font-semibold text-gray-900 dark:text-white"
          >
            Select Color
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Preview and Hex Input */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <div
              data-testid="color-preview"
              className="w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center"
              style={{
                backgroundColor: previewColor,
              }}
            >
              {previewColor === "transparent" && (
                <span className="text-gray-400 text-sm">?</span>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={hexInput}
                  onChange={(e) => {
                    setHexInput(e.target.value);
                    setHexError(false);
                  }}
                  onKeyDown={handleHexKeyDown}
                  placeholder="#000000"
                  data-testid="color-hex-input"
                  className={`
                    flex-1 px-3 py-2 text-sm font-mono
                    border rounded-md
                    bg-white dark:bg-gray-800
                    text-gray-900 dark:text-white
                    placeholder-gray-400
                    focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent
                    ${hexError ? "border-red-500" : "border-gray-300 dark:border-gray-600"}
                  `}
                  aria-label="Enter hex color"
                  aria-invalid={hexError}
                />
                <button
                  type="button"
                  onClick={handleHexSubmit}
                  className="px-3 py-2 text-sm font-medium text-white bg-secondary hover:bg-secondary-dark rounded-md transition-colors"
                >
                  Apply
                </button>
              </div>
              {hexError && (
                <span className="text-red-500 text-xs mt-1 block" role="alert">
                  Invalid hex color format
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Theme Presets */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Theme Colors
          </h3>
          <div className="flex flex-wrap gap-2">
            {THEME_COLOR_PRESETS.map((preset) => {
              const isSelected =
                value?.toLowerCase() === preset.hex.toLowerCase();
              const textColor = getContrastTextColor(preset.hex);

              return (
                <button
                  key={preset.hex}
                  type="button"
                  onClick={() => onSelect(preset.hex)}
                  data-testid="theme-color-preset"
                  title={`${preset.name}: ${preset.hex}`}
                  className={`
                    w-10 h-10 rounded-lg transition-all hover:scale-110
                    ${isSelected ? "ring-2 ring-offset-2 ring-secondary" : ""}
                  `}
                  style={{ backgroundColor: preset.hex }}
                  aria-label={`${preset.name}: ${preset.hex}`}
                >
                  {isSelected && (
                    <span
                      className={`text-sm font-bold ${textColor === "light" ? "text-white" : "text-gray-900"}`}
                    >
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Standard Web Colors Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Standard Colors
          </h3>
          <div className="grid grid-cols-6 gap-1">
            {STANDARD_WEB_COLORS.map((color, index) => {
              const isSelected = value?.toLowerCase() === color.toLowerCase();

              return (
                <button
                  key={`${color}-${index}`}
                  type="button"
                  onClick={() => onSelect(color)}
                  title={color}
                  className={`
                    w-8 h-8 rounded transition-all hover:scale-110
                    ${isSelected ? "ring-2 ring-offset-1 ring-secondary" : ""}
                  `}
                  style={{ backgroundColor: color }}
                  aria-label={`Color ${color}`}
                />
              );
            })}
          </div>
        </div>

        {/* Clear Button */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => onSelect("")}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
          >
            Clear Color
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default ColorPicker;
