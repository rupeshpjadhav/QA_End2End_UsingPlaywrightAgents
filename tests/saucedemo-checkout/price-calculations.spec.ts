import { test, expect } from '../fixtures';
import { ALL_PRODUCT_KEYS, PRODUCTS, VALID_CHECKOUT_INFO, calculateTotals, money } from '../fixtures/test-data';
import { ProductsPage } from '../pages/ProductsPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutInfoPage } from '../pages/CheckoutInfoPage';

async function proceedToOverview(
  productKeys: (keyof typeof PRODUCTS)[],
  fixtures: { productsPage: ProductsPage; cartPage: CartPage; checkoutInfoPage: CheckoutInfoPage }
) {
  const { productsPage, cartPage, checkoutInfoPage } = fixtures;
  await productsPage.goto();
  for (const key of productKeys) await productsPage.addToCart(PRODUCTS[key].dataTestKey);
  await productsPage.goToCart();
  await cartPage.checkout();
  await checkoutInfoPage.fillInfo(VALID_CHECKOUT_INFO);
  await checkoutInfoPage.continue();
}

test.describe('Price Calculation and Tax Verification', () => {
  test('single low-price item calculates 8% tax correctly', async ({ productsPage, cartPage, checkoutInfoPage, checkoutOverviewPage }) => {
    await proceedToOverview(['bikeLight'], { productsPage, cartPage, checkoutInfoPage });
    const { subtotal, tax, total } = calculateTotals(['bikeLight']);

    await expect(checkoutOverviewPage.subtotalLabel).toContainText(`Item total: ${money(subtotal)}`);
    await expect(checkoutOverviewPage.taxLabel).toContainText(`Tax: ${money(tax)}`);
    await expect(checkoutOverviewPage.totalLabel).toContainText(`Total: ${money(total)}`);
  });

  test('multiple items with different prices sum and tax correctly', async ({ productsPage, cartPage, checkoutInfoPage, checkoutOverviewPage }) => {
    const keys = ['backpack', 'boltTShirt', 'onesie'] as const;
    await proceedToOverview([...keys], { productsPage, cartPage, checkoutInfoPage });
    const { subtotal, tax, total } = calculateTotals([...keys]);

    await expect(checkoutOverviewPage.subtotalLabel).toContainText(`Item total: ${money(subtotal)}`);
    await expect(checkoutOverviewPage.taxLabel).toContainText(`Tax: ${money(tax)}`);
    await expect(checkoutOverviewPage.totalLabel).toContainText(`Total: ${money(total)}`);
  });

  test('all 6 products can be added and the grand total calculates correctly', async ({
    productsPage,
    cartPage,
    checkoutInfoPage,
    checkoutOverviewPage,
  }) => {
    await proceedToOverview([...ALL_PRODUCT_KEYS], { productsPage, cartPage, checkoutInfoPage });
    const { subtotal, tax, total } = calculateTotals([...ALL_PRODUCT_KEYS]);

    await expect(checkoutOverviewPage.items).toHaveCount(ALL_PRODUCT_KEYS.length);
    await expect(checkoutOverviewPage.subtotalLabel).toContainText(`Item total: ${money(subtotal)}`);
    await expect(checkoutOverviewPage.taxLabel).toContainText(`Tax: ${money(tax)}`);
    await expect(checkoutOverviewPage.totalLabel).toContainText(`Total: ${money(total)}`);
  });

  test('all monetary values are formatted with $ and two decimal places', async ({
    productsPage,
    cartPage,
    checkoutInfoPage,
    checkoutOverviewPage,
  }) => {
    await proceedToOverview(['fleeceJacket'], { productsPage, cartPage, checkoutInfoPage });

    await expect(checkoutOverviewPage.subtotalLabel).toContainText(/Item total: \$\d+\.\d{2}/);
    await expect(checkoutOverviewPage.taxLabel).toContainText(/Tax: \$\d+\.\d{2}/);
    await expect(checkoutOverviewPage.totalLabel).toContainText(/Total: \$\d+\.\d{2}/);
  });
});
