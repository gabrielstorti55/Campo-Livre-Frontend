import { defineConfig, devices } from '@playwright/test';

const porta = process.env['PLAYWRIGHT_PORT'] ?? '4173';
const baseURL = `http://127.0.0.1:${porta}`;

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: 'test-results',
  fullyParallel: true,
  workers: 1,
  timeout: 120_000,
  forbidOnly: Boolean(process.env['CI']),
  retries: process.env['CI'] ? 2 : 0,
  expect: { timeout: 15_000 },
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: `npm run dev -- --hostname 127.0.0.1 --port ${porta}`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: Number(process.env['PLAYWRIGHT_WEB_SERVER_TIMEOUT'] ?? 300_000),
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
