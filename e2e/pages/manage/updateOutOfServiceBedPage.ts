import { Page, expect } from '@playwright/test'
import { BasePage } from '../basePage'

export class UpdateOutOfServiceBedPage extends BasePage {
  static async initialize(page: Page) {
    await expect(page.locator('h1')).toContainText('Update out of service bed record')
    return new UpdateOutOfServiceBedPage(page)
  }

  async updateBed(update: Record<string, string>) {
    await this.page.getByLabel('Work order reference number').fill(update.referenceNumber)
    await this.page.getByLabel('Provide additional information').fill(update.additionalInformation)
  }
}
