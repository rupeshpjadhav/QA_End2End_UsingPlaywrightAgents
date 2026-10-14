import { test, expect } from '../fixtures';
import { PRODUCTS, VALID_CHECKOUT_INFO } from '../fixtures/test-data';

test.describe('Error Handling and Edge Cases - AC5', () => {
  test.beforeEach(async ({ productsPage, cartPage }) => {
    await productsPage.goto();
    await productsPage.addToCart(PRODUCTS.backpack.dataTestKey);
    await productsPage.goToCart();
    await cartPage.checkout();
  });

  test('accepts special characters in name fields and proceeds', async ({ page, checkoutInfoPage }) => {
    await checkoutInfoPage.fillInfo({ firstName: "O'Brien-@#$%", lastName: 'Doe & Sons', postalCode: '12345' });
    await checkoutInfoPage.continue();

    await expect(checkoutInfoPage.errorMessage).not.toBeVisible();
    await expect(page).toHaveURL(/.*checkout-step-two\.html/);
  });

  test('accepts very long input without breaking the form', async ({ page, checkoutInfoPage }) => {
    const longName = 'A'.repeat(300);

    await checkoutInfoPage.fillInfo({ firstName: longName, lastName: longName, postalCode: '12345' });
    await checkoutInfoPage.continue();

    await expect(checkoutInfoPage.errorMessage).not.toBeVisible();
    await expect(page).toHaveURL(/.*checkout-step-two\.html/);
  });

  test('validates fields in a fixed order regardless of which ones are filled', async ({ checkoutInfoPage }) => {
    // Last Name and Postal Code filled, First Name left empty: the required-field
    // check still reports First Name first rather than whichever field is blank.
    await checkoutInfoPage.fillInfo({ lastName: 'Doe', postalCode: '12345' });
    await checkoutInfoPage.continue();

    await expect(checkoutInfoPage.errorMessage).toBeVisible();
    await expect(checkoutInfoPage.errorMessage).toContainText('First Name is required');

    // Correcting just the missing field allows the user to proceed
    await checkoutInfoPage.fillInfo({ firstName: 'John' });
    await checkoutInfoPage.continue();
    await expect(checkoutInfoPage.errorMessage).not.toBeVisible();
  });

  test('rapid repeated clicks on Continue do not duplicate navigation or errors', async ({ page, checkoutInfoPage }) => {
    await checkoutInfoPage.fillInfo(VALID_CHECKOUT_INFO);

    // Fire several clicks back-to-back; once the first navigates away, the
    // button no longer exists, so later clicks must fail fast (short timeout)
    // rather than hang until the page reappears.
    await Promise.all(
      Array.from({ length: 3 }, () => checkoutInfoPage.continueButton.click({ force: true, timeout: 2000 }).catch(() => {}))
    );

    await expect(page).toHaveURL(/.*checkout-step-two\.html/);
  });

  test('browser back button during checkout preserves cart contents', async ({ page, productsPage }) => {
    await page.goBack(); // back to cart.html
    await expect(page).toHaveURL(/.*cart\.html/);

    await page.goBack(); // back to inventory.html
    await expect(page).toHaveURL(/.*inventory\.html/);
    await expect(productsPage.cartBadge).toHaveText('1');
  });
});
