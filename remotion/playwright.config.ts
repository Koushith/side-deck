import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './capture',
  timeout: 90_000,
  retries: 0,
  reporter: 'list',
  use: {
    headless: true,
  },
});
