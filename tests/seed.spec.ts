import { test, expect } from './fixtures';
import { USERS } from './fixtures/test-data';

// Seed for the Playwright Test Agents (planner / generator / healer):
// leaves the page logged in as standard_user on the Products page.
// Runs under the `unauthenticated` project, so it logs in itself.
test.describe('Test group', () => {
  test('seed', async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.login(USERS.standard.username, USERS.standard.password);
    await expect(page).toHaveURL(/.*inventory\.html/);
  });
});
