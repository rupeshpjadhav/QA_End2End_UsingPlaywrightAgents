import { test, expect } from '../fixtures';
import { PRODUCTS } from '../fixtures/test-data';

test.describe('Checkout Information Entry Validation - AC2', () => {
  test.beforeEach(async ({ productsPage, cartPage }) => {
    await productsPage.goto();
    await productsPage.addToCart(PRODUCTS.backpack.dataTestKey);
    await productsPage.goToCart();
    await cartPage.checkout();
  });

  test('should display error when no fields are filled', async ({ page, checkoutInfoPage }) => {
    await expect(page).toHaveURL(/.*checkout-step-one\.html/);

    await checkoutInfoPage.continue();

    await expect(checkoutInfoPage.errorMessage).toBeVisible();
    await expect(checkoutInfoPage.errorMessage).toContainText('Error: First Name is required');
    await expect(page).toHaveURL(/.*checkout-step-one\.html/);
  });

  test('should display error when only First Name is filled', async ({ checkoutInfoPage }) => {
    await checkoutInfoPage.fillInfo({ firstName: 'John' });
    await checkoutInfoPage.continue();

    await expect(checkoutInfoPage.errorMessage).toBeVisible();
    await expect(checkoutInfoPage.errorMessage).toContainText('Error: Last Name is required');
    await expect(checkoutInfoPage.firstNameInput).toHaveValue('John');
  });

  test('should display error when First Name and Last Name are filled but Zip is empty', async ({ checkoutInfoPage }) => {
    await checkoutInfoPage.fillInfo({ firstName: 'John', lastName: 'Doe' });
    await checkoutInfoPage.continue();

    await expect(checkoutInfoPage.errorMessage).toBeVisible();
    await expect(checkoutInfoPage.errorMessage).toContainText('Error: Postal Code is required');
    await expect(checkoutInfoPage.firstNameInput).toHaveValue('John');
    await expect(checkoutInfoPage.lastNameInput).toHaveValue('Doe');
  });

  test('should dismiss error message when X button is clicked', async ({ checkoutInfoPage }) => {
    await checkoutInfoPage.continue();
    await expect(checkoutInfoPage.errorMessage).toBeVisible();

    await checkoutInfoPage.dismissError();

    await expect(checkoutInfoPage.errorMessage).not.toBeVisible();
    await expect(checkoutInfoPage.firstNameInput).toBeVisible();
    await expect(checkoutInfoPage.lastNameInput).toBeVisible();
    await expect(checkoutInfoPage.postalCodeInput).toBeVisible();
  });

  test('should accept valid data and proceed to overview', async ({ page, checkoutInfoPage, checkoutOverviewPage }) => {
    await checkoutInfoPage.fillInfo({ firstName: 'John', lastName: 'Doe', postalCode: '12345' });
    await checkoutInfoPage.continue();

    await expect(page).toHaveURL(/.*checkout-step-two\.html/);
    await expect(checkoutOverviewPage.title).toContainText('Checkout: Overview');
  });
});
