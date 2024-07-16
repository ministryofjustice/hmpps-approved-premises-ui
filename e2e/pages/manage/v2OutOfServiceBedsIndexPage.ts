import { Page, expect } from '@playwright/test'
import { BasePage } from '../basePage'

export class OutOfServiceBedsPremisesListPage extends BasePage {
  static async initialize(page: Page) {
    await expect(page.locator('h1')).toContainText('Manage out of service beds')
    return new OutOfServiceBedsPremisesListPage(page)
  }

  async selectFutureTab() {
    await this.page.getByRole('link', { name: 'Future' }).click()
  }

  async selectOutOfServiceBed() {
    await this.page.getByRole('link', { name: 'View' }).first().click()
  }
}
