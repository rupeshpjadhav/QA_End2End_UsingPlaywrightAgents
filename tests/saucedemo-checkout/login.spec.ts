import { test, expect } from '../fixtures';
import { USERS } from '../fixtures/test-data';

// Runs against the "unauthenticated" project (see playwright.config.ts) so it
// starts with a clean, logged-out browser context instead of the shared
// standard_user session the other specs reuse.
test.describe('Login', () => {
  test('standard_user can log in and reach the products page', async ({ page, loginPage, productsPage }) => {
    await loginPage.goto();
    await loginPage.login(USERS.standard.username, USERS.standard.password);

    await expect(page).toHaveURL(/.*inventory\.html/);
    await expect(productsPage.title).toContainText('Products');
  });

  test('locked_out_user is denied access with an error message', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(USERS.lockedOut.username, USERS.lockedOut.password);

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText('locked out');
  });

  test('login fails with an invalid password', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(USERS.standard.username, 'wrong_password');

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText('do not match');
  });

  test('checkout is inaccessible without logging in first', async ({ page }) => {
    // Business rule: "Users must be logged in to access checkout."
    await page.goto('/checkout-step-one.html');

    await expect(page).toHaveURL(/.*index\.html|.*saucedemo\.com\/?$/);
  });
});
