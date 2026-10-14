import { test, expect } from '../fixtures';
import { PRODUCTS, calculateTotals, VALID_CHECKOUT_INFO, EXPECTED_TEXT, money } from '../fixtures/test-data';

const ITEM_KEYS = ['backpack', 'bikeLight', 'fleeceJacket'] as const;

test.describe('Order Overview Verification - AC3', () => {
  test.beforeEach(async ({ productsPage, cartPage, checkoutInfoPage }) => {
    await productsPage.goto();
    for (const key of ITEM_KEYS) await productsPage.addToCart(PRODUCTS[key].dataTestKey);

    await productsPage.goToCart();
    await cartPage.checkout();

    await checkoutInfoPage.fillInfo(VALID_CHECKOUT_INFO);
    await checkoutInfoPage.continue();
  });

  test('should display all order items with correct details', async ({ page, checkoutOverviewPage }) => {
    await expect(page).toHaveURL(/.*checkout-step-two\.html/);
    await expect(checkoutOverviewPage.title).toContainText('Checkout: Overview');

    for (const key of ITEM_KEYS) {
      const product = PRODUCTS[key];
      await expect(checkoutOverviewPage.itemByName(product.name)).toBeVisible();
      await expect(
        checkoutOverviewPage.itemByName(product.name).locator('[data-test="inventory-item-price"]')
      ).toHaveText(money(product.price));
    }
  });

  test('should display correct payment and shipping information', async ({ checkoutOverviewPage }) => {
    await expect(checkoutOverviewPage.paymentInfo).toContainText(EXPECTED_TEXT.paymentInfo);
    await expect(checkoutOverviewPage.shippingInfo).toContainText(EXPECTED_TEXT.shippingInfo);
  });

  test('should display accurate price calculations', async ({ checkoutOverviewPage }) => {
    const { subtotal, tax, total } = calculateTotals([...ITEM_KEYS]);

    await expect(checkoutOverviewPage.subtotalLabel).toContainText(`Item total: ${money(subtotal)}`);
    await expect(checkoutOverviewPage.taxLabel).toContainText(`Tax: ${money(tax)}`);
    await expect(checkoutOverviewPage.totalLabel).toContainText(`Total: ${money(total)}`);
  });

  test('should have functional Cancel button', async ({ page, productsPage, checkoutOverviewPage }) => {
    await checkoutOverviewPage.cancel();

    await expect(page).toHaveURL(/.*inventory\.html/);
    await expect(productsPage.cartBadge).toHaveText(String(ITEM_KEYS.length));
  });

  test('should have functional Finish button', async ({ page, checkoutOverviewPage, checkoutCompletePage }) => {
    await checkoutOverviewPage.finish();

    await expect(page).toHaveURL(/.*checkout-complete\.html/);
    await expect(checkoutCompletePage.title).toContainText('Checkout: Complete!');
  });
});
