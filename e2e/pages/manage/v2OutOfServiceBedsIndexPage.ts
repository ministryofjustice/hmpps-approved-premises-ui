import { Page, expect } from '@playwright/test'
import { BasePage } from '../basePage'

export class OutOfServiceBedsPremisesListPage extends BasePage {
  static async initialize(page: Page, premisesName: string) {
    await expect(page.locator('h1')).toContainText('Out of service beds')
    await expect(page.locator('.govuk-caption-l a')).toContainText(premisesName)
    return new OutOfServiceBedsPremisesListPage(page)
  }

  async selectFutureTab() {
    await this.page.getByRole('link', { name: 'Future' }).click()
  }

  async selectOutOfServiceBed() {
    await this.page.getByRole('link', { name: 'View' }).first().click()
  }
}
