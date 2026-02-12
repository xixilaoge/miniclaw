import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    transformMode: 'ssr',
  },
  resolve: {
    alias: {
      '/src/': new URL('./src/', import.meta.url).pathname,
    },
  },
});
