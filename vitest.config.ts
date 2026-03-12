import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react({
    jsxRuntime: 'automatic',
  })],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    server: {
      deps: {
        inline: [
          'next/font',
          'next/image',
          'next/link',
          'react-markdown',
          'remark-gfm',
          'rehype-sanitize',
          'rehype-raw',
        ],
      },
    },
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: [
      'tests/e2e/**',
      'node_modules/**',
      'dist/**',
      '.next/**',
      '.claude/worktrees/**',
      'archive/**',
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
      "next/font/google": path.resolve(__dirname, "./__mocks__/next-font-google.ts"),
      "next/image": path.resolve(__dirname, "./__mocks__/next-image.tsx"),
      "next/link": path.resolve(__dirname, "./__mocks__/next-link.tsx"),
    },
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],
  },
});
