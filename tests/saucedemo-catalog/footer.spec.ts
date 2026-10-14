// spec: specs/saucedemo-catalog-navigation-test-plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '../fixtures';

test.describe('Footer', () => {
  test('Social links and copyright', async ({ page, productsPage }) => {
    // 1. Scroll to the footer on the Products page
    await productsPage.goto();
    const footer = page.locator('[data-test="footer"]');
    await footer.scrollIntoViewIfNeeded();
    await expect(page.locator('[data-test="social-x"]')).toHaveAttribute('href', 'https://x.com/saucelabs');
    await expect(page.locator('[data-test="social-facebook"]')).toHaveAttribute('href', 'https://www.facebook.com/saucelabs');
    await expect(page.locator('[data-test="social-linkedin"]')).toHaveAttribute('href', 'https://www.linkedin.com/company/sauce-labs/');
    await expect(page.locator('[data-test="footer-copy"]')).toContainText(/© \d{4} Sauce Labs\. All Rights Reserved\./);
  });
});
