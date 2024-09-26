import { Page, expect } from '@playwright/test'
import { BasePage } from '../basePage'

export class BedsPage extends BasePage {
  static async initialize(page: Page, title?: string) {
    if (title) {
      await expect(page.locator('h1')).toContainText(title)
    }
    return new BedsPage(page)
  }

  async viewBed() {
    const rowLocator = this.page.locator('tr')

    const bedRows = rowLocator.filter({ hasText: 'Manage' })

    await bedRows.first().getByRole('link', { name: 'Manage' }).click()
  }
}
