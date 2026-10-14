import { test, expect } from '../fixtures';
import { PRODUCTS, VALID_CHECKOUT_INFO, EXPECTED_TEXT } from '../fixtures/test-data';

// This suite doesn't pick a browser itself — Playwright's project matrix in
// playwright.config.ts (chromium / firefox / webkit) runs it, and every other
// spec in this directory, against all three engines automatically. This file
// exists to satisfy specs/saucedemo-checkout-test-plan.md #1.9 with an
// explicit, minimal smoke test rather than duplicating the full E2E spec.
test.describe('Cross-Browser Compatibility Smoke Test', () => {
  test('checkout flow completes end-to-end on the current browser engine', async ({
    page,
    productsPage,
    cartPage,
    checkoutInfoPage,
    checkoutOverviewPage,
    checkoutCompletePage,
  }, testInfo) => {
    test.skip(testInfo.project.name.includes('Mobile'), 'Mobile engines are covered by mobile-responsiveness.spec.ts');

    await productsPage.goto();
    await productsPage.addToCart(PRODUCTS.backpack.dataTestKey);
    await productsPage.goToCart();
    await cartPage.checkout();
    await checkoutInfoPage.fillInfo(VALID_CHECKOUT_INFO);
    await checkoutInfoPage.continue();

    await expect(checkoutOverviewPage.paymentInfo).toContainText(EXPECTED_TEXT.paymentInfo);

    await checkoutOverviewPage.finish();

    await expect(page).toHaveURL(/.*checkout-complete\.html/);
    await expect(checkoutCompletePage.completeHeader).toContainText(EXPECTED_TEXT.completeHeader);
  });
});
