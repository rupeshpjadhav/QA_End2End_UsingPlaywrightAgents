import { Locator, Page } from '@playwright/test';

export class ProductDetailsPage {
  readonly page: Page;
  readonly name: Locator;
  readonly description: Locator;
  readonly price: Locator;
  readonly image: Locator;
  readonly addToCartButton: Locator;
  readonly removeButton: Locator;
  readonly backButton: Locator;

  constructor(page: Page) {
    this.page = page;
    // Scoped to the details view: the Products list uses the same data-test
    // names, and right after navigation the URL can change before the list is
    // replaced. Unscoped, these locators would match all 6 list items.
    const details = page.locator('.inventory_details');
    this.name = details.locator('[data-test="inventory-item-name"]');
    this.description = details.locator('[data-test="inventory-item-desc"]');
    this.price = details.locator('[data-test="inventory-item-price"]');
    this.image = details.locator('.inventory_details_img');
    this.addToCartButton = page.locator('[data-test="add-to-cart"]');
    this.removeButton = page.locator('[data-test="remove"]');
    this.backButton = page.locator('[data-test="back-to-products"]');
  }

  async goto(id: number | string) {
    await this.page.goto(`/inventory-item.html?id=${id}`);
  }
}
