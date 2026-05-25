import { defineWorkspace } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineWorkspace([
  {
    name: 'packages',
    extends: 'vitest/config',
    plugins: [react()],
    test: {
      environment: 'happy-dom',
      globals: true,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: [
          'node_modules/',
          'dist/',
          '**/*.test.ts',
          '**/*.test.tsx',
        ],
      },
    },
    resolve: {
      alias: {
        '@rara/types': path.resolve(__dirname, './packages/types/src'),
        '@rara/utils': path.resolve(__dirname, './packages/utils/src'),
        '@rara/mock-data': path.resolve(__dirname, './packages/mock-data/src'),
        '@rara/hooks': path.resolve(__dirname, './packages/hooks/src'),
      },
    },
  },
  {
    name: 'apps',
    extends: 'vitest/config',
    plugins: [react()],
    test: {
      environment: 'jsdom',
      globals: true,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: [
          'node_modules/',
          'dist/',
          '**/*.test.ts',
          '**/*.test.tsx',
        ],
      },
    },
    resolve: {
      alias: {
        '@rara/types': path.resolve(__dirname, './packages/types/src'),
        '@rara/utils': path.resolve(__dirname, './packages/utils/src'),
        '@rara/mock-data': path.resolve(__dirname, './packages/mock-data/src'),
        '@rara/hooks': path.resolve(__dirname, './packages/hooks/src'),
      },
    },
  },
]);
