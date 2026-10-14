import { test, expect } from '../fixtures';
import { PRODUCTS, VALID_CHECKOUT_INFO } from '../fixtures/test-data';

// Runs on every project, but only asserts on the "Mobile Chrome" / "Mobile
// Safari" projects (see playwright.config.ts), which emulate real device
// viewports, touch input, and mobile user agents via Playwright's `devices`.
test.describe('Mobile Responsiveness', () => {
  test.beforeEach(async ({ isMobile }) => {
    test.skip(!isMobile, 'Mobile-only checks — run with --project="Mobile Chrome" or "Mobile Safari"');
  });

  test('checkout flow is fully usable on a mobile viewport', async ({
    page,
    productsPage,
    cartPage,
    checkoutInfoPage,
    checkoutOverviewPage,
    checkoutCompletePage,
  }) => {
    await productsPage.goto();

    await productsPage.addToCart(PRODUCTS.backpack.dataTestKey);
    await expect(productsPage.cartBadge).toHaveText('1');

    await productsPage.goToCart();
    // Reachable by scrolling on a phone-sized viewport, not necessarily
    // already on-screen without scrolling — that's the realistic mobile bar.
    await cartPage.checkoutButton.scrollIntoViewIfNeeded();
    await expect(cartPage.checkoutButton).toBeVisible();

    await cartPage.checkout();
    await expect(checkoutInfoPage.firstNameInput).toBeVisible();

    await checkoutInfoPage.fillInfo(VALID_CHECKOUT_INFO);
    await checkoutInfoPage.continue();

    await checkoutOverviewPage.finishButton.scrollIntoViewIfNeeded();
    await expect(checkoutOverviewPage.finishButton).toBeVisible();
    await checkoutOverviewPage.finish();

    await expect(page).toHaveURL(/.*checkout-complete\.html/);
    await expect(checkoutCompletePage.backHomeButton).toBeVisible();
  });

  test('form fields and buttons remain tappable-sized and accessible', async ({ productsPage, cartPage, checkoutInfoPage }) => {
    await productsPage.goto();
    await productsPage.addToCart(PRODUCTS.backpack.dataTestKey);
    await productsPage.goToCart();
    await cartPage.checkout();

    for (const field of [checkoutInfoPage.firstNameInput, checkoutInfoPage.lastNameInput, checkoutInfoPage.postalCodeInput]) {
      const box = await field.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.height).toBeGreaterThanOrEqual(24); // minimum comfortable tap target height
    }
  });

  test('browser back navigation works correctly on mobile', async ({ page, productsPage, cartPage }) => {
    await productsPage.goto();
    await productsPage.addToCart(PRODUCTS.backpack.dataTestKey);
    await productsPage.goToCart();
    await cartPage.checkout();

    await page.goBack();
    await expect(page).toHaveURL(/.*cart\.html/);
  });
});
