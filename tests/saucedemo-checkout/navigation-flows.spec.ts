import { test, expect } from '../fixtures';
import { PRODUCTS, VALID_CHECKOUT_INFO } from '../fixtures/test-data';

test.describe('Navigation Flow Testing', () => {
  test.beforeEach(async ({ productsPage }) => {
    await productsPage.goto();
  });

  test('Cancel on checkout information page returns to cart with contents preserved', async ({
    page,
    productsPage,
    cartPage,
    checkoutInfoPage,
  }) => {
    await productsPage.addToCart(PRODUCTS.backpack.dataTestKey);
    await productsPage.goToCart();
    await cartPage.checkout();

    await checkoutInfoPage.cancel();

    await expect(page).toHaveURL(/.*cart\.html/);
    await expect(cartPage.itemByName(PRODUCTS.backpack.name)).toBeVisible();
  });

  test('Cancel on checkout overview page returns to products with cart preserved', async ({
    page,
    productsPage,
    cartPage,
    checkoutInfoPage,
    checkoutOverviewPage,
  }) => {
    await productsPage.addToCart(PRODUCTS.backpack.dataTestKey);
    await productsPage.addToCart(PRODUCTS.bikeLight.dataTestKey);
    await productsPage.goToCart();
    await cartPage.checkout();
    await checkoutInfoPage.fillInfo(VALID_CHECKOUT_INFO);
    await checkoutInfoPage.continue();

    await checkoutOverviewPage.cancel();

    await expect(page).toHaveURL(/.*inventory\.html/);
    await expect(productsPage.cartBadge).toHaveText('2');
  });

  test('Continue Shopping from cart always returns to products page with cart intact', async ({
    page,
    productsPage,
    cartPage,
  }) => {
    await productsPage.addToCart(PRODUCTS.onesie.dataTestKey);
    await productsPage.goToCart();

    await cartPage.continueShopping();

    await expect(page).toHaveURL(/.*inventory\.html/);
    await expect(productsPage.cartBadge).toHaveText('1');
  });

  test('user can navigate the full checkout loop without completing purchase and lose no data', async ({
    page,
    productsPage,
    cartPage,
    checkoutInfoPage,
  }) => {
    await productsPage.addToCart(PRODUCTS.backpack.dataTestKey);
    await productsPage.goToCart();
    await cartPage.checkout();
    await checkoutInfoPage.cancel();

    await expect(page).toHaveURL(/.*cart\.html/);
    await cartPage.continueShopping();

    await expect(page).toHaveURL(/.*inventory\.html/);
    await expect(productsPage.cartBadge).toHaveText('1');
    await expect(productsPage.removeButton(PRODUCTS.backpack.dataTestKey)).toBeVisible();
  });
});
