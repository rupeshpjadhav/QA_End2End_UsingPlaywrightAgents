// spec: specs/saucedemo-catalog-navigation-test-plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '../fixtures';
import { ALL_PRODUCT_KEYS, PRODUCTS, USERS } from '../fixtures/test-data';

test.describe('Burger Menu and Session', () => {
  test.beforeEach(async ({ productsPage }) => {
    await productsPage.goto();
  });

  test('Menu opens and closes', async ({ sideMenu }) => {
    // 1. Click the menu button
    await sideMenu.open();
    await expect(sideMenu.allItemsLink).toHaveText('All Items');
    await expect(sideMenu.dynamicCatalogLink).toHaveText('Dynamic Catalog');
    await expect(sideMenu.aboutLink).toHaveText('About');
    await expect(sideMenu.logoutLink).toHaveText('Logout');
    await expect(sideMenu.resetLink).toHaveText('Reset App State');

    // 2. Click the close (X) button
    await sideMenu.closeButton.click();
    await expect(sideMenu.panel).toHaveAttribute('aria-hidden', 'true');
  });

  test('About links to saucelabs.com', async ({ sideMenu }) => {
    // 1. Open the menu
    await sideMenu.open();
    await expect(sideMenu.aboutLink).toHaveAttribute('href', 'https://saucelabs.com/');
  });

  test('All Items returns to Products and closes the menu', async ({ page, sideMenu, productDetailsPage }) => {
    // 1. Open a product's details, open the menu, click "All Items"
    await productDetailsPage.goto(4);
    await sideMenu.open();
    await sideMenu.allItemsLink.click();
    await expect(page).toHaveURL(/inventory\.html$/);
    await expect(sideMenu.panel).toHaveAttribute('aria-hidden', 'true');
  });

  test('Logout ends the session', async ({ page, sideMenu, loginPage }) => {
    // 1. Open the menu and click "Logout"
    await sideMenu.logout();
    await expect(loginPage.loginButton).toBeVisible();

    // 2. Press the browser Back button
    await page.goBack();
    await expect(loginPage.errorMessage).toHaveText(
      "Epic sadface: You can only access '/inventory.html' when you are logged in.",
    );
  });

  test('Cart persists across logout and login', async ({ sideMenu, loginPage, productsPage }) => {
    // 1. Add Bike Light to the cart, log out, log back in as standard_user
    await productsPage.addToCart(PRODUCTS.bikeLight.dataTestKey);
    await sideMenu.logout();
    await loginPage.login(USERS.standard.username, USERS.standard.password);
    await expect(productsPage.cartBadge).toHaveText('1');
  });

  // Known app defect: Reset App State clears the badge but the product buttons
  // keep showing "Remove" until the page is reloaded.
  test.fixme('Reset App State empties the cart and resets buttons', async ({ sideMenu, productsPage }) => {
    // 1. Add Backpack and Onesie, open the menu, click "Reset App State"
    await productsPage.addToCart(PRODUCTS.backpack.dataTestKey);
    await productsPage.addToCart(PRODUCTS.onesie.dataTestKey);
    await sideMenu.open();
    await sideMenu.resetLink.click();
    await expect(productsPage.cartBadge).toHaveCount(0);
    // Fails here: Backpack and Onesie still show "Remove".
    for (const key of ALL_PRODUCT_KEYS) {
      await expect(productsPage.addToCartButton(PRODUCTS[key].dataTestKey)).toBeVisible();
    }
  });
});
