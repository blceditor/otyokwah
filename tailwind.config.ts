import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
    "./content/**/*.{md,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary: Water/Sky (Muted Lake Blue)
        primary: {
          DEFAULT: "#4A7A9E",
          light: "#7A9DB8",
          dark: "#2F5A7A",
        },
        // Secondary: Forest/Moss (Deep Forest Green)
        secondary: {
          DEFAULT: "#2F4F3D",
          light: "#5A7A65",
          dark: "#0C3F23", // REQ-F001: Dark green for distressed text on light backgrounds
        },
        // Accent: Earth/Clay
        accent: {
          DEFAULT: "#A07856",
          light: "#C4A882",
        },
        // REQ-DESIGN-002: Accessible Link Color System
        // WCAG AA compliant bright green - link #4d8401 (4.55:1 contrast on white)
        // Note: Hover #5d9b01 would be 10% lighter but fails WCAG (3.41:1)
        // Therefore using same color for hover with underline differentiation
        // Visited #3d6b01 is 10% darker and passes WCAG (6.36:1)
        link: {
          DEFAULT: "#4d8401",
          light: "#4d8401", // Same as DEFAULT for WCAG compliance
          dark: "#3d6b01",
        },
        // Neutrals: Natural Tones
        cream: "#F5F0E8",
        sand: "#D4C5B0",
        stone: "#8A8A7A",
        bark: "#5A4A3A",
        // REQ-FUTURE-020: Dark mode color palette for Keystatic CMS
        dark: {
          bg: "#0f172a",
          surface: "#1e293b",
          border: "#334155",
          text: "#f1f5f9",
          muted: "#94a3b8",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Oxygen",
          "Ubuntu",
          "Cantarell",
          "sans-serif",
        ],
        handwritten: ["var(--font-caveat)", "Caveat", "cursive"],
        heading: ["var(--font-tradesmith)", "sans-serif"],
      },
      spacing: {
        xs: "0.5rem",
        sm: "1rem",
        md: "1.5rem",
        lg: "2rem",
        xl: "3rem",
        xxl: "4rem",
        "section-y": "4rem", // 64px (py-16)
        "section-y-md": "5rem", // 80px (py-20)
      },
      zIndex: {
        "skip-link": "100",
        "mobile-menu": "60",
        "admin-nav": "55", // REQ-ADMIN-001: Above header, below mobile menu
        "draft-banner": "50",
        dropdown: "45",
        header: "40",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-in-right": "slideInRight 0.3s ease-out",
        "slide-down": "slideDown 0.2s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideInRight: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [typography],
  // REQ-PROC-001: Safelist for prose and heading utilities
  // These are used in GridSquare.tsx and need explicit safelisting for JIT
  safelist: [
    // REQ-PROC-002: Force text-inherit with !important to override prose plugin defaults
    '[&_h2]:!text-inherit',
    '[&_h3]:!text-inherit',
    '[&_p]:!text-inherit',
    '[&_li]:!text-inherit',
    '[&_strong]:!text-inherit',
    '[&_a]:!text-inherit',
    // Explicit child selector overrides with !important (for GridSquare)
    // These override the global .prose h2 { text-align: center } rule
    '[&_h2]:!text-left',
    '[&_h2]:!text-[3rem]',
    '[&_h2]:!leading-none',
    '[&_h2]:!font-bold',
    '[&_h2]:!mb-2',
    '[&_h2]:!mt-0',
    '[&_h3]:!text-left',
    '[&_h3]:!text-2xl',
  ],
};

export default config;
