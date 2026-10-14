import { test, expect } from '../fixtures';
import { PRODUCTS, VALID_CHECKOUT_INFO, EXPECTED_TEXT } from '../fixtures/test-data';

test.describe('Order Completion Confirmation - AC4', () => {
  test.beforeEach(async ({ productsPage, cartPage, checkoutInfoPage, checkoutOverviewPage }) => {
    await productsPage.goto();
    await productsPage.addToCart(PRODUCTS.backpack.dataTestKey);
    await productsPage.addToCart(PRODUCTS.bikeLight.dataTestKey);

    await productsPage.goToCart();
    await cartPage.checkout();
    await checkoutInfoPage.fillInfo(VALID_CHECKOUT_INFO);
    await checkoutInfoPage.continue();
    await checkoutOverviewPage.finish();
  });

  test('should display order confirmation page with success messaging', async ({ page, checkoutCompletePage }) => {
    await expect(page).toHaveURL(/.*checkout-complete\.html/);
    await expect(checkoutCompletePage.title).toContainText('Checkout: Complete!');

    await expect(checkoutCompletePage.completeHeader).toContainText(EXPECTED_TEXT.completeHeader);
    await expect(checkoutCompletePage.completeText).toContainText('dispatched');
    await expect(checkoutCompletePage.completeText).toContainText('pony');
    await expect(checkoutCompletePage.ponyExpressImage).toBeVisible();
  });

  test('should clear cart after order completion', async ({ productsPage, cartPage }) => {
    await expect(productsPage.cartBadge).not.toBeVisible();

    await productsPage.goToCart();
    await expect(cartPage.items).toHaveCount(0);
  });

  test('should have functional Back Home button', async ({ page, productsPage, checkoutCompletePage }) => {
    await expect(checkoutCompletePage.backHomeButton).toBeVisible();

    await checkoutCompletePage.backToProducts();

    await expect(page).toHaveURL(/.*inventory\.html/);
    await expect(productsPage.title).toContainText('Products');
    await expect(productsPage.addToCartButton(PRODUCTS.backpack.dataTestKey)).toBeVisible();
    await expect(productsPage.addToCartButton(PRODUCTS.bikeLight.dataTestKey)).toBeVisible();

    await productsPage.addToCart(PRODUCTS.backpack.dataTestKey);
    await expect(productsPage.cartBadge).toHaveText('1');
  });
});
