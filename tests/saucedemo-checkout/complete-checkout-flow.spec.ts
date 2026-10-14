import { test, expect } from '../fixtures';
import { PRODUCTS, calculateTotals, VALID_CHECKOUT_INFO, EXPECTED_TEXT, money } from '../fixtures/test-data';

test.describe('Complete Checkout Flow - Happy Path', () => {
  test.beforeEach(async ({ productsPage }) => {
    await productsPage.goto();
  });

  test('should complete end-to-end checkout process successfully', async ({
    page,
    productsPage,
    cartPage,
    checkoutInfoPage,
    checkoutOverviewPage,
    checkoutCompletePage,
  }) => {
    const items = [PRODUCTS.backpack, PRODUCTS.bikeLight, PRODUCTS.fleeceJacket];
    const { subtotal, tax, total } = calculateTotals(['backpack', 'bikeLight', 'fleeceJacket']);

    // Step 1: products page is already authenticated via the "setup" project
    await expect(page).toHaveURL(/.*inventory\.html/);
    await expect(productsPage.title).toContainText('Products');

    // Step 2: add multiple products to cart
    for (const item of items) await productsPage.addToCart(item.dataTestKey);
    await expect(productsPage.cartBadge).toHaveText(String(items.length));
    for (const item of items) await expect(productsPage.removeButton(item.dataTestKey)).toBeVisible();

    // Step 3: navigate to cart page
    await productsPage.goToCart();
    await expect(page).toHaveURL(/.*cart\.html/);
    await expect(cartPage.title).toContainText('Your Cart');
    for (const item of items) await expect(cartPage.itemByName(item.name)).toBeVisible();
    await expect(cartPage.continueShoppingButton).toBeVisible();
    await expect(cartPage.checkoutButton).toBeVisible();

    // Step 4: click Checkout
    await cartPage.checkout();
    await expect(page).toHaveURL(/.*checkout-step-one\.html/);
    await expect(checkoutInfoPage.title).toContainText('Checkout: Your Information');
    await expect(checkoutInfoPage.firstNameInput).toBeVisible();
    await expect(checkoutInfoPage.lastNameInput).toBeVisible();
    await expect(checkoutInfoPage.postalCodeInput).toBeVisible();
    await expect(checkoutInfoPage.cancelButton).toBeVisible();
    await expect(checkoutInfoPage.continueButton).toBeVisible();

    // Step 5: fill in checkout information
    await checkoutInfoPage.fillInfo(VALID_CHECKOUT_INFO);
    await expect(checkoutInfoPage.errorMessage).not.toBeVisible();

    // Step 6: continue to overview
    await checkoutInfoPage.continue();
    await expect(page).toHaveURL(/.*checkout-step-two\.html/);
    await expect(checkoutOverviewPage.title).toContainText('Checkout: Overview');
    for (const item of items) await expect(checkoutOverviewPage.itemByName(item.name)).toBeVisible();
    await expect(checkoutOverviewPage.paymentInfo).toContainText(EXPECTED_TEXT.paymentInfo);
    await expect(checkoutOverviewPage.shippingInfo).toContainText(EXPECTED_TEXT.shippingInfo);
    await expect(checkoutOverviewPage.subtotalLabel).toContainText(`Item total: ${money(subtotal)}`);
    await expect(checkoutOverviewPage.taxLabel).toContainText(`Tax: ${money(tax)}`);
    await expect(checkoutOverviewPage.totalLabel).toContainText(`Total: ${money(total)}`);

    // Step 7: finish the order
    await checkoutOverviewPage.finish();
    await expect(page).toHaveURL(/.*checkout-complete\.html/);
    await expect(checkoutCompletePage.title).toContainText('Checkout: Complete!');
    await expect(checkoutCompletePage.completeHeader).toContainText(EXPECTED_TEXT.completeHeader);
    await expect(checkoutCompletePage.completeText).toContainText('dispatched');
    await expect(checkoutCompletePage.backHomeButton).toBeVisible();

    // Step 8: back home
    await checkoutCompletePage.backToProducts();
    await expect(page).toHaveURL(/.*inventory\.html/);
    await expect(productsPage.cartBadge).not.toBeVisible();
    for (const item of items) await expect(productsPage.addToCartButton(item.dataTestKey)).toBeVisible();
  });
});
