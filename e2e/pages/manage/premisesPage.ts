import { Page, expect } from '@playwright/test'
import { BasePage } from '../basePage'

export class PremisesPage extends BasePage {
  static async initialize(page: Page, title?: string) {
    if (title) {
      await expect(page.locator('h1')).toContainText(title)
    }
    return new PremisesPage(page)
  }

  async viewRooms() {
    await this.page.getByRole('button', { name: 'Actions' }).click()
    await this.page.getByRole('menuitem', { name: 'Manage beds' }).click()
  }

  async viewOutOfServiceBedRecords() {
    await this.page.getByRole('button', { name: 'Actions' }).click()
    await this.page.getByRole('menuitem', { name: 'Manage out of service bed records' }).click()
  }
}
