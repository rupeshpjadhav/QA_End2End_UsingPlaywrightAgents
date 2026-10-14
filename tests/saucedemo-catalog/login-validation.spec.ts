// spec: specs/saucedemo-catalog-navigation-test-plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '../fixtures';
import { USERS } from '../fixtures/test-data';

// Runs under the "unauthenticated" project (logged-out context).
test.describe('Login Validation and Access Control', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('Username is required', async ({ page, loginPage }) => {
    // 1. Leave Username empty, type any password, click Login
    await loginPage.passwordInput.fill('any_password');
    await loginPage.loginButton.click();
    await expect(loginPage.errorMessage).toHaveText('Epic sadface: Username is required');
    await expect(page).toHaveURL(/saucedemo\.com\/?$/);
  });

  test('Password is required', async ({ loginPage }) => {
    // 1. Type standard_user, leave Password empty, click Login
    await loginPage.usernameInput.fill(USERS.standard.username);
    await loginPage.loginButton.click();
    await expect(loginPage.errorMessage).toHaveText('Epic sadface: Password is required');
  });

  test('Unknown user is rejected', async ({ loginPage }) => {
    // 1. Type an unknown username and password, click Login
    await loginPage.login('unknown_user', 'wrong_password');
    await expect(loginPage.errorMessage).toHaveText(
      'Epic sadface: Username and password do not match any user in this service',
    );
  });

  test('Protected pages redirect to login with a message', async ({ page, loginPage }) => {
    // 1. Open /inventory.html directly without logging in
    await page.goto('/inventory.html');
    await expect(loginPage.loginButton).toBeVisible();
    await expect(loginPage.errorMessage).toHaveText(
      "Epic sadface: You can only access '/inventory.html' when you are logged in.",
    );
  });

  test('Accepted usernames are listed on the login page', async ({ page }) => {
    // 1. Read the credentials box on the login page
    const credentials = page.locator('[data-test="login-credentials"]');
    for (const user of ['standard_user', 'locked_out_user', 'problem_user', 'performance_glitch_user', 'error_user', 'visual_user']) {
      await expect(credentials).toContainText(user);
    }
  });
});
