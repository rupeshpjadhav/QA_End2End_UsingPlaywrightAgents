// spec: specs/saucedemo-catalog-navigation-test-plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '../fixtures';
import { ALL_PRODUCT_KEYS, PRODUCTS } from '../fixtures/test-data';

const NAMES_A_TO_Z = ALL_PRODUCT_KEYS.map(k => PRODUCTS[k].name).sort();

test.describe('Product Sorting', () => {
  test.beforeEach(async ({ productsPage }) => {
    await productsPage.goto();
  });

  test('Default order is Name (A to Z)', async ({ productsPage }) => {
    // 1. Open the Products page
    await expect(productsPage.activeSortOption).toHaveText('Name (A to Z)');
    await expect(productsPage.itemNames).toHaveText(NAMES_A_TO_Z);
  });

  test('Sort by Name (Z to A)', async ({ productsPage }) => {
    // 1. Select "Name (Z to A)" in the sort dropdown
    await productsPage.sortBy('za');
    await expect(productsPage.itemNames).toHaveText([...NAMES_A_TO_Z].reverse());
    await expect(productsPage.itemNames.first()).toHaveText(PRODUCTS.redTShirt.name);
    await expect(productsPage.activeSortOption).toHaveText('Name (Z to A)');
  });

  test('Sort by Price (low to high)', async ({ productsPage }) => {
    // 1. Select "Price (low to high)"
    await productsPage.sortBy('lohi');
    await expect(productsPage.itemNames.first()).toHaveText(PRODUCTS.onesie.name);
    await expect(productsPage.itemNames.last()).toHaveText(PRODUCTS.fleeceJacket.name);
    const prices = await productsPage.priceValues();
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  test('Sort by Price (high to low)', async ({ productsPage }) => {
    // 1. Select "Price (high to low)"
    await productsPage.sortBy('hilo');
    await expect(productsPage.itemPrices.first()).toHaveText('$49.99');
    await expect(productsPage.itemPrices.last()).toHaveText('$7.99');
    const prices = await productsPage.priceValues();
    expect(prices).toEqual([...prices].sort((a, b) => b - a));
  });

  test('Cart state survives re-sorting', async ({ productsPage }) => {
    // 1. Add Backpack and Onesie to the cart
    await productsPage.addToCart(PRODUCTS.backpack.dataTestKey);
    await productsPage.addToCart(PRODUCTS.onesie.dataTestKey);

    // 2. Change sort to "Price (high to low)", then "Name (Z to A)"
    await productsPage.sortBy('hilo');
    await productsPage.sortBy('za');
    await expect(productsPage.cartBadge).toHaveText('2');
    await expect(productsPage.removeButton(PRODUCTS.backpack.dataTestKey)).toBeVisible();
    await expect(productsPage.removeButton(PRODUCTS.onesie.dataTestKey)).toBeVisible();
  });
});
