import { defineConfig } from 'vitest/config';
import path from 'node:path';

// Cermin dari tsconfig.json "paths" — vitest tidak membaca tsconfig paths sendiri.
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // WAJIB ada — begitu berkas config ini ada, plugin Vitest milik knip berhenti
  // memakai pola bawaan **/*.test.ts sebagai entry point dan hanya membaca dari
  // test.include di sini. Tanpa key ini, import.test.ts dilaporkan "Unused files".
  test: {
    include: ['src/**/*.test.ts'],
  },
});
