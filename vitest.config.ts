import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: [
      'src/lib/prompt/__tests__/**/*.test.ts',
      'src/lib/productStudioV2/__tests__/**/*.test.ts',
      'src/lib/productStudioV2/tests/**/*.test.ts',
    ],
    coverage: {
      reporter: ['text', 'html'],
      provider: 'v8',
    },
  },
});
