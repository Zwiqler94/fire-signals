import {defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['test/**/*.emulator.spec.ts'],
    passWithNoTests: true,
    testTimeout: 30000,
  },
});
