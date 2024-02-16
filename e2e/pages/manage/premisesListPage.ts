import { Page, expect } from '@playwright/test'
import { BasePage } from '../basePage'

export class PremisesListPage extends BasePage {
  static async initialize(page: Page, title?: string) {
    if (title) {
      await expect(page.locator('h1')).toContainText(title)
    }
    return new PremisesListPage(page)
  }

  async choosePremises(premisesName: string) {
    await this.page.getByRole('link', { name: `View about ${premisesName}`, exact: true }).click()
  }

  async filterPremises(apArea: string) {
    await this.page.getByLabel('Areas').selectOption({ label: apArea })
  }
}
