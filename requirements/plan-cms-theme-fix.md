# Plan: CMS Theme Fix (REQ-CMS-008)

## Problem Analysis

Based on user screenshots:

### Issue 1: Dark Mode Shows White Elements
- Input fields have wrong colors (dark inputs on white background)
- Inconsistent theme application across Keystatic components
- Likely cause: Race condition between theme providers or cached CSS

### Issue 2: Light Mode Dropdown Menus "White on White"
- Our custom KeystaticToolsHeader dropdowns have hardcoded dark styling
- `bg-gray-900` and `text-gray-200` don't adapt to theme
- In light mode, if CSS conflicts occur, text could become invisible

## Root Causes Identified

1. **localStorage Key Mismatch**: Detected `theme: "dark"` AND `keystatic-color-scheme: "light"` simultaneously
2. **Nested Theme Providers**: Keystatic creates internal `.kui-theme` elements that may initialize before our sync
3. **Hardcoded Dropdown Colors**: Nav dropdowns don't respond to light/dark theme
4. **Missing CSS Variable Override**: Keystatic uses `--kui-*` CSS variables we're not controlling

## Implementation Plan

### Step 1: Clean Up localStorage Keys (1 SP)
**File**: `components/keystatic/ThemeProvider.tsx`
- Remove stale `theme` key conflicts
- Ensure single source of truth for theme state
- Add cleanup on mount

### Step 2: Force Theme on All kui-theme Elements (1 SP)
**File**: `components/keystatic/ThemeProvider.tsx`
- Apply theme classes immediately on mount (before hydration completes)
- Use more aggressive MutationObserver that triggers on any DOM change
- Add interval-based sync for first 5 seconds after load

### Step 3: Make Dropdown Menus Theme-Aware (2 SP)
**File**: `components/keystatic/KeystaticToolsHeader.tsx`
- Replace hardcoded `bg-gray-900` with `bg-gray-900 dark:bg-gray-900` (keep dark in both for nav)
- OR make dropdown adapt: `bg-white dark:bg-gray-900`
- Update text colors: `text-gray-800 dark:text-gray-200`

### Step 4: Add CSS Override for Keystatic Variables (1 SP)
**File**: `app/keystatic/[[...params]]/layout.tsx` or global CSS
- Override `--kui-*` CSS variables based on `.dark` class
- Ensure inputs, backgrounds, borders use correct theme colors

## Total Estimate: 5 SP

## Test Scenarios
1. Fresh page load in light mode - all elements light
2. Fresh page load in dark mode - all elements dark
3. Toggle light → dark - instant switch, no white remnants
4. Toggle dark → light - instant switch, dropdowns readable
5. Page refresh - theme persists correctly
6. Open dropdown in light mode - readable text
7. Open dropdown in dark mode - readable text
