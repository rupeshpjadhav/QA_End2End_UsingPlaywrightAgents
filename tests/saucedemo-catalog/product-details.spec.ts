// spec: specs/saucedemo-catalog-navigation-test-plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '../fixtures';
import { PRODUCTS } from '../fixtures/test-data';

test.describe('Product Details', () => {
  test.beforeEach(async ({ productsPage }) => {
    await productsPage.goto();
  });

  test('Open details from the product name', async ({ page, productDetailsPage }) => {
    // 1. Click the "Sauce Labs Backpack" name
    await page.locator('[data-test="item-4-title-link"]').click();
    await expect(page).toHaveURL(/inventory-item\.html\?id=4$/);
    await expect(productDetailsPage.name).toHaveText(PRODUCTS.backpack.name);
    await expect(productDetailsPage.description).toContainText('carry.allTheThings()');
    await expect(productDetailsPage.price).toHaveText('$29.99');
    await expect(productDetailsPage.image).toBeVisible();
    await expect(productDetailsPage.backButton).toBeVisible();
  });

  test('Open details from the product image', async ({ page, productDetailsPage }) => {
    // 1. Click the Bike Light image
    await page.locator('[data-test="item-0-img-link"]').click();
    await expect(page).toHaveURL(/inventory-item\.html\?id=0$/);
    // Healer: the URL changes before the details view replaces the product
    // list, so wait for it; otherwise the name locator matches all 6 products.
    await expect(productDetailsPage.backButton).toBeVisible();
    await expect(productDetailsPage.name).toHaveText(PRODUCTS.bikeLight.name);
  });

  test('Add and remove from the details page', async ({ productsPage, productDetailsPage }) => {
    // 1. Open Backpack details and click "Add to cart"
    await productDetailsPage.goto(4);
    await productDetailsPage.addToCartButton.click();
    await expect(productsPage.cartBadge).toHaveText('1');
    await expect(productDetailsPage.removeButton).toBeVisible();

    // 2. Click "Remove"
    await productDetailsPage.removeButton.click();
    await expect(productsPage.cartBadge).toHaveCount(0);
    await expect(productDetailsPage.addToCartButton).toBeVisible();
  });

  test('Back to products keeps the cart', async ({ page, productsPage, productDetailsPage }) => {
    // 1. Open Backpack details, add it to the cart, click "Back to products"
    await productDetailsPage.goto(4);
    await productDetailsPage.addToCartButton.click();
    await productDetailsPage.backButton.click();
    await expect(page).toHaveURL(/inventory\.html$/);
    await expect(productsPage.removeButton(PRODUCTS.backpack.dataTestKey)).toBeVisible();
    await expect(productsPage.cartBadge).toHaveText('1');
  });

  test('Invalid product id shows "not found"', async ({ productDetailsPage }) => {
    // 1. Open /inventory-item.html?id=999
    await productDetailsPage.goto(999);
    await expect(productDetailsPage.name).toHaveText('ITEM NOT FOUND');

    // 2. Open /inventory-item.html?id=abc
    await productDetailsPage.goto('abc');
    await expect(productDetailsPage.name).toHaveText('ITEM NOT FOUND');
  });
});
