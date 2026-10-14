// spec: specs/saucedemo-catalog-navigation-test-plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '../fixtures';
import { PRODUCTS } from '../fixtures/test-data';

test.describe('Dynamic Catalog', () => {
  test('Menu link opens the Dynamic Catalog options', async ({ page, productsPage, sideMenu }) => {
    // 1. Open the menu and click "Dynamic Catalog"
    await productsPage.goto();
    await sideMenu.open();
    await sideMenu.dynamicCatalogLink.click();
    await expect(page.locator('[data-test="dynamic-catalog-lazy-load-link"]')).toBeVisible();
    await expect(page.locator('[data-test="dynamic-catalog-spinner-link"]')).toBeVisible();
    await expect(page.locator('[data-test="dynamic-catalog-slider-link"]')).toBeVisible();
  });

  test('Spinner shows, then products load', async ({ page }) => {
    // 1. Open /dynamic-catalog-spinner.html
    await page.goto('/dynamic-catalog-spinner.html');
    await expect(page.locator('[data-test="title"]')).toHaveText('Dynamic Catalog - Spinner');
    await expect(page.locator('[data-test="dynamic-catalog-spinner"]')).toBeVisible();
    const items = page.locator('[data-test="dynamic-catalog-spinner-grid"] [data-test$="-name"]');
    await expect(items).toHaveCount(6, { timeout: 15_000 });
    await expect(page.locator('[data-test="dynamic-catalog-spinner"]')).toHaveCount(0);
    for (let i = 0; i < 6; i++) {
      await expect(page.locator(`[data-test="spinner-item-${i}-price"]`)).toHaveText(/^\$\d+\.\d{2}$/);
      await expect(page.locator(`[data-test="spinner-item-${i}-img"]`)).toBeVisible();
    }
  });

  // Known app defect: every lazy-loaded batch lists
  // "Test.allTheThings() T-Shirt (Red) (L)" twice.
  test.fixme('Lazy load adds products on scroll', async ({ page }) => {
    const names = page.locator('[data-test^="lazy-load-item-"][data-test$="-name"]');

    // 1. Open /dynamic-catalog-lazy-load.html
    await page.goto('/dynamic-catalog-lazy-load.html');
    await expect(page.locator('[data-test="title"]')).toHaveText('Dynamic Catalog - Lazy Load');
    await expect(names.first()).toBeVisible();
    const initial = await names.count();

    // 2. Scroll to the bottom of the list
    await page.locator('[data-test="dynamic-catalog-lazy-load-sentinel"]').scrollIntoViewIfNeeded();
    await expect.poll(() => names.count(), { timeout: 15_000 }).toBeGreaterThan(initial);

    // 3. Inspect a batch of loaded products
    // Fails here: the "(L)" T-Shirt appears twice in the batch.
    const firstBatch = (await names.allTextContents()).slice(0, 22);
    expect(new Set(firstBatch).size, `duplicates in ${firstBatch.join(', ')}`).toBe(firstBatch.length);
  });

  test('Slider dots switch the product', async ({ page }) => {
    // 1. Open /dynamic-catalog-slider.html
    await page.goto('/dynamic-catalog-slider.html');
    await expect(page.locator('[data-test="title"]')).toHaveText('Dynamic Catalog - Slider');
    await expect(page.locator('[data-test^="dynamic-catalog-slider-dot-"]')).toHaveCount(6);

    // 2. Click the 4th dot
    const dot = page.locator('[data-test="dynamic-catalog-slider-dot-3"]');
    await dot.click();
    await expect(page.locator('[data-test="dynamic-catalog-slider-item-name"]')).toHaveText(PRODUCTS.redTShirt.name);
    await expect(dot).toHaveAttribute('aria-current', 'true');
  });
});
