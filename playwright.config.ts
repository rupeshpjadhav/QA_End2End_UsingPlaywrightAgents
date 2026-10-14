import { defineConfig, devices } from '@playwright/test';

const STORAGE_STATE = 'playwright/.auth/standard_user.json';

// Specs that must start logged out (they test login itself or log in as other
// users). They run once, in Chromium, under the `unauthenticated` project and
// are excluded from the session-reusing browser projects.
const UNAUTHENTICATED_SPECS = /.*\/(login|login-validation|user-variants|seed)\.spec\.ts/;

export default defineConfig({
  testDir: './tests',
  outputDir: './test-results/artifacts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,

  // html: the full report (screenshots, videos and traces of failed tests are
  //       embedded). json: machine-readable results, used by CI to write the
  //       run summary. github: failure annotations on the PR/commit in CI.
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list'],
    ...(process.env.CI ? [['github'] as const] : []),
  ],

  use: {
    baseURL: process.env.BASE_URL || 'https://www.saucedemo.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // Logs in once as standard_user and saves session state for the
    // browser projects below to reuse. Replaces the shared `seed.spec.ts`
    // referenced (but never implemented) in specs/saucedemo-checkout-test-plan.md.
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },

    // Auth-independent tests (e.g. login form itself) run with a clean,
    // unauthenticated context and don't depend on the setup project.
    // seed.spec.ts (the Playwright Test Agents' seed) and user-variants.spec.ts
    // log in themselves, so they run here too.
    {
      name: 'unauthenticated',
      testMatch: UNAUTHENTICATED_SPECS,
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'chromium',
      testIgnore: UNAUTHENTICATED_SPECS,
      use: { ...devices['Desktop Chrome'], storageState: STORAGE_STATE },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      testIgnore: UNAUTHENTICATED_SPECS,
      use: { ...devices['Desktop Firefox'], storageState: STORAGE_STATE },
      dependencies: ['setup'],
    },
    {
      name: 'webkit',
      testIgnore: UNAUTHENTICATED_SPECS,
      use: { ...devices['Desktop Safari'], storageState: STORAGE_STATE },
      dependencies: ['setup'],
    },

    // Mobile viewport coverage (specs/saucedemo-checkout-test-plan.md #1.10)
    {
      name: 'Mobile Chrome',
      testIgnore: UNAUTHENTICATED_SPECS,
      use: { ...devices['Pixel 7'], storageState: STORAGE_STATE },
      dependencies: ['setup'],
    },
    {
      name: 'Mobile Safari',
      testIgnore: UNAUTHENTICATED_SPECS,
      use: { ...devices['iPhone 14'], storageState: STORAGE_STATE },
      dependencies: ['setup'],
    },
  ],
});
