import { Page, expect } from '@playwright/test'
import { BasePage } from '../basePage'

export class PlacementSelectPage extends BasePage {
  static async initialize(page: Page, title?: string) {
    if (title) {
      await expect(page.locator('h1')).toContainText(title)
    }
    return new PlacementSelectPage(page)
  }

  async completeForm() {
    await this.page.getByRole('radio').first().click()
  }
}
