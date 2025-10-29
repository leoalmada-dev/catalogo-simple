import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',               // <-- necesario para usar @vitest/coverage-v8
      reporter: ['text', 'lcov'],
      reportsDirectory: './coverage',
      exclude: ['**/.next/**', '**/node_modules/**', '**/*.d.ts']
    }
  }
});
