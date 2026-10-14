import { Locator, Page } from '@playwright/test';

export class ProductsPage {
  readonly page: Page;
  readonly title: Locator;
  readonly cartBadge: Locator;
  readonly cartLink: Locator;
  readonly inventoryItems: Locator;
  readonly itemNames: Locator;
  readonly itemPrices: Locator;
  readonly sortSelect: Locator;
  readonly activeSortOption: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('[data-test="title"]');
    this.cartBadge = page.locator('[data-test="shopping-cart-badge"]');
    this.cartLink = page.locator('[data-test="shopping-cart-link"]');
    this.inventoryItems = page.locator('[data-test="inventory-item"]');
    this.itemNames = page.locator('[data-test="inventory-item-name"]');
    this.itemPrices = page.locator('[data-test="inventory-item-price"]');
    this.sortSelect = page.locator('[data-test="product-sort-container"]');
    this.activeSortOption = page.locator('[data-test="active-option"]');
  }

  async goto() {
    await this.page.goto('/inventory.html');
  }

  addToCartButton(productKey: string): Locator {
    return this.page.locator(`[data-test="add-to-cart-${productKey}"]`);
  }

  removeButton(productKey: string): Locator {
    return this.page.locator(`[data-test="remove-${productKey}"]`);
  }

  async addToCart(productKey: string) {
    await this.addToCartButton(productKey).click();
  }

  async removeFromCart(productKey: string) {
    await this.removeButton(productKey).click();
  }

  async sortBy(option: 'az' | 'za' | 'lohi' | 'hilo') {
    await this.sortSelect.selectOption(option);
  }

  /** Displayed prices as numbers, in page order. */
  async priceValues(): Promise<number[]> {
    return (await this.itemPrices.allTextContents()).map(p => Number(p.replace('$', '')));
  }

  async goToCart() {
    await this.cartLink.click();
  }
}
