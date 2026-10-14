import { test as setup } from '../fixtures';
import { expect } from '@playwright/test';
import { USERS } from './test-data';

const STORAGE_STATE = 'playwright/.auth/standard_user.json';

// Runs once before the chromium/firefox/webkit/mobile projects and saves an
// authenticated session so individual specs don't need to repeat the login
// flow in every beforeEach. Login itself is still covered independently by
// tests/saucedemo-checkout/login.spec.ts (which runs unauthenticated).
setup('authenticate as standard_user', async ({ page, loginPage }) => {
  await loginPage.goto();
  await loginPage.login(USERS.standard.username, USERS.standard.password);
  await expect(page).toHaveURL(/.*inventory\.html/);

  await page.context().storageState({ path: STORAGE_STATE });
});
