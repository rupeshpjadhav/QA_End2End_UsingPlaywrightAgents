import { test, expect } from '../fixtures';
import { PRODUCTS } from '../fixtures/test-data';

test.describe('Cart Review Functionality - AC1', () => {
  test.beforeEach(async ({ productsPage }) => {
    await productsPage.goto();
  });

  test('should display all cart items with correct details', async ({ page, productsPage, cartPage }) => {
    await productsPage.addToCart(PRODUCTS.backpack.dataTestKey);
    await productsPage.addToCart(PRODUCTS.bikeLight.dataTestKey);
    await productsPage.addToCart(PRODUCTS.onesie.dataTestKey);

    await productsPage.goToCart();
    await expect(page).toHaveURL(/.*cart\.html/);
    await expect(cartPage.title).toContainText('Your Cart');

    const backpackItem = cartPage.itemByName(PRODUCTS.backpack.name);
    await expect(backpackItem.locator('[data-test="inventory-item-name"]')).toHaveText(PRODUCTS.backpack.name);
    await expect(backpackItem.locator('[data-test="inventory-item-desc"]')).toContainText('carry.allTheThings()');
    await expect(backpackItem.locator('[data-test="inventory-item-price"]')).toHaveText(`$${PRODUCTS.backpack.price}`);

    const bikeLightItem = cartPage.itemByName(PRODUCTS.bikeLight.name);
    await expect(bikeLightItem.locator('[data-test="inventory-item-name"]')).toHaveText(PRODUCTS.bikeLight.name);
    await expect(bikeLightItem.locator('[data-test="inventory-item-price"]')).toHaveText(`$${PRODUCTS.bikeLight.price}`);

    const onesieItem = cartPage.itemByName(PRODUCTS.onesie.name);
    await expect(onesieItem.locator('[data-test="inventory-item-name"]')).toHaveText(PRODUCTS.onesie.name);
    await expect(onesieItem.locator('[data-test="inventory-item-price"]')).toHaveText(`$${PRODUCTS.onesie.price}`);
  });

  test('should show a quantity of 1 per item regardless of add order', async ({ productsPage, cartPage }) => {
    await productsPage.addToCart(PRODUCTS.backpack.dataTestKey);
    await productsPage.goToCart();

    await expect(cartPage.itemByName(PRODUCTS.backpack.name).locator('[data-test="item-quantity"]')).toHaveText('1');
  });

  test('should have functional Continue Shopping button preserving cart', async ({ page, productsPage }) => {
    await productsPage.addToCart(PRODUCTS.backpack.dataTestKey);
    await productsPage.addToCart(PRODUCTS.bikeLight.dataTestKey);

    await productsPage.goToCart();
    await page.locator('[data-test="continue-shopping"]').click();

    await expect(page).toHaveURL(/.*inventory\.html/);
    await expect(productsPage.cartBadge).toHaveText('2');
    await expect(productsPage.removeButton(PRODUCTS.backpack.dataTestKey)).toBeVisible();
    await expect(productsPage.removeButton(PRODUCTS.bikeLight.dataTestKey)).toBeVisible();
  });

  test('should have functional Remove button updating cart count', async ({ productsPage, cartPage }) => {
    await productsPage.addToCart(PRODUCTS.backpack.dataTestKey);
    await productsPage.addToCart(PRODUCTS.bikeLight.dataTestKey);
    await productsPage.addToCart(PRODUCTS.fleeceJacket.dataTestKey);

    await productsPage.goToCart();
    await expect(productsPage.cartBadge).toHaveText('3');

    await cartPage.removeItem(PRODUCTS.bikeLight.dataTestKey);
    await expect(cartPage.itemByName(PRODUCTS.bikeLight.name)).not.toBeVisible();
    await expect(productsPage.cartBadge).toHaveText('2');

    await cartPage.continueShopping();
    await expect(productsPage.addToCartButton(PRODUCTS.bikeLight.dataTestKey)).toBeVisible();
  });

  test('should have functional Checkout button', async ({ page, productsPage, cartPage, checkoutInfoPage }) => {
    await productsPage.addToCart(PRODUCTS.backpack.dataTestKey);
    await productsPage.goToCart();

    await cartPage.checkout();

    await expect(page).toHaveURL(/.*checkout-step-one\.html/);
    await expect(checkoutInfoPage.title).toContainText('Checkout: Your Information');
  });
});
