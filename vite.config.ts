/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  // Relative asset paths: the build works from any sub-path, e.g. GitHub Pages' /<repo>/.
  base: './',
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    coverage: {
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/main.tsx', 'src/test-setup.ts', 'src/**/*.test.*'],
      thresholds: { lines: 90, branches: 85, functions: 90, statements: 90 },
    },
  },
});
