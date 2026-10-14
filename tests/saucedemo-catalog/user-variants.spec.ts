// spec: specs/saucedemo-catalog-navigation-test-plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '../fixtures';
import { ALL_PRODUCT_KEYS, PRODUCTS, USERS } from '../fixtures/test-data';

// Runs under the "unauthenticated" project: each test logs in as its own user.
// Every test asserts the *correct* behavior, so it fails while that user's
// simulated defect is present.
test.describe('Special Test Users (simulated defects)', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('locked_out_user cannot log in', async ({ loginPage }) => {
    // 1. Log in as locked_out_user
    await loginPage.login(USERS.lockedOut.username, USERS.lockedOut.password);
    await expect(loginPage.errorMessage).toHaveText('Epic sadface: Sorry, this user has been locked out.');
  });

  test('performance_glitch_user can still shop', async ({ page, loginPage, productsPage }) => {
    // 1. Log in as performance_glitch_user
    await loginPage.login(USERS.performanceGlitch.username, USERS.performanceGlitch.password);
    await expect(page).toHaveURL(/inventory\.html$/);

    // 2. Sort by "Price (high to low)", add Fleece Jacket to the cart
    await productsPage.sortBy('hilo');
    await expect(productsPage.itemNames.first()).toHaveText(PRODUCTS.fleeceJacket.name);
    await productsPage.addToCart(PRODUCTS.fleeceJacket.dataTestKey);
    await expect(productsPage.cartBadge).toHaveText('1');
  });

  // Simulated defect: every product image is the same sl-404 placeholder.
  test.fixme('problem_user sees correct product images', async ({ page, loginPage }) => {
    // 1. Log in as problem_user
    await loginPage.login(USERS.problem.username, USERS.problem.password);
    const sources = await page.locator('.inventory_item_img img').evaluateAll(imgs => imgs.map(i => i.getAttribute('src')));
    // Fails here (see above).
    expect(new Set(sources).size).toBe(6);
  });

  // Simulated defect: choosing a sort option does not reorder the list.
  test.fixme('problem_user can sort products', async ({ loginPage, productsPage }) => {
    // 1. Log in as problem_user, select "Name (Z to A)"
    await loginPage.login(USERS.problem.username, USERS.problem.password);
    await productsPage.sortBy('za');
    // Fails here (see above).
    await expect(productsPage.itemNames.first()).toHaveText(PRODUCTS.redTShirt.name);
  });

  // Simulated defect: clicking Backpack opens the Fleece Jacket (id=5) instead.
  test.fixme('problem_user opens the right product', async ({ page, loginPage, productDetailsPage }) => {
    // 1. Log in as problem_user, click the "Sauce Labs Backpack" name
    await loginPage.login(USERS.problem.username, USERS.problem.password);
    await page.getByText(PRODUCTS.backpack.name, { exact: true }).click();
    // Fails here (see above).
    await expect(productDetailsPage.name).toHaveText(PRODUCTS.backpack.name);
  });

  // Simulated defect: sorting shows the alert "Sorting is broken! This error has been reported to Backtrace." and the order does not change.
  test.fixme('error_user can sort products', async ({ page, loginPage, productsPage }) => {
    const dialogs: string[] = [];
    page.on('dialog', d => { dialogs.push(d.message()); void d.dismiss(); });

    // 1. Log in as error_user, select "Name (Z to A)"
    await loginPage.login(USERS.error.username, USERS.error.password);
    await productsPage.sortBy('za');
    // Fails here (see above).
    await expect(productsPage.itemNames.first()).toHaveText(PRODUCTS.redTShirt.name);
    expect(dialogs).toEqual([]);
  });

  // Simulated defect: only 3 of the 6 Add to cart buttons work, so the badge shows 3.
  test.fixme('error_user can add every product', async ({ loginPage, productsPage }) => {
    // 1. Log in as error_user, click "Add to cart" on all 6 products
    await loginPage.login(USERS.error.username, USERS.error.password);
    for (const key of ALL_PRODUCT_KEYS) {
      await productsPage.addToCart(PRODUCTS[key].dataTestKey);
    }
    // Fails here (see above).
    await expect(productsPage.cartBadge).toHaveText('6');
  });

  // Simulated defect: prices are random and change on every page load.
  test.fixme('visual_user sees catalog prices', async ({ loginPage, productsPage }) => {
    // 1. Log in as visual_user
    await loginPage.login(USERS.visual.username, USERS.visual.password);
    // Fails here (see above).
    await expect(productsPage.itemPrices).toHaveText(ALL_PRODUCT_KEYS.map(k => `$${PRODUCTS[k].price}`));
  });
});
