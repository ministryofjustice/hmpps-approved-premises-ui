import { Page, expect } from '@playwright/test'
import { BasePage } from '../basePage'

export class OutOfServiceBedPage extends BasePage {
  static async initialize(page: Page) {
    await expect(page.locator('h1')).toContainText('Out of service bed record')
    return new OutOfServiceBedPage(page)
  }

  async selectUpdateRecord() {
    await this.page.getByRole('button', { name: 'Update record' }).click()
  }

  async shouldShowUpdatedDetails(update: Record<string, string>) {
    await expect(this.page.getByText(update.referenceNumber)).toBeVisible()
    await expect(this.page.getByText(update.additionalInformation)).toBeVisible()
  }

  async selectDetails() {
    await this.page.getByRole('link', { name: 'Details', exact: true }).click()
  }
}
