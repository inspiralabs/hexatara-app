import { defineConfig } from 'vitest/config';
import path from 'node:path';

// Cermin dari tsconfig.json "paths" — vitest tidak membaca tsconfig paths sendiri.
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
