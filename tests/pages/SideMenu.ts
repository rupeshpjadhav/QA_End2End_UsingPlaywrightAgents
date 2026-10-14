import { Locator, Page } from '@playwright/test';

/** The burger menu shared by every logged-in page. */
export class SideMenu {
  readonly page: Page;
  readonly openButton: Locator;
  readonly closeButton: Locator;
  readonly panel: Locator;
  readonly allItemsLink: Locator;
  readonly dynamicCatalogLink: Locator;
  readonly aboutLink: Locator;
  readonly logoutLink: Locator;
  readonly resetLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.openButton = page.getByRole('button', { name: 'Open Menu' });
    this.closeButton = page.getByRole('button', { name: 'Close Menu' });
    this.panel = page.locator('.bm-menu-wrap');
    this.allItemsLink = page.locator('[data-test="inventory-sidebar-link"]');
    this.dynamicCatalogLink = page.locator('[data-test="dynamic-catalog-sidebar-link"]');
    this.aboutLink = page.locator('[data-test="about-sidebar-link"]');
    this.logoutLink = page.locator('[data-test="logout-sidebar-link"]');
    this.resetLink = page.locator('[data-test="reset-sidebar-link"]');
  }

  async open() {
    await this.openButton.click();
    await this.logoutLink.waitFor({ state: 'visible' });
  }

  async logout() {
    await this.open();
    await this.logoutLink.click();
  }
}
