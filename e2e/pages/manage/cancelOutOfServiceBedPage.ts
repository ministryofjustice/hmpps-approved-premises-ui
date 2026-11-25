import { Page, expect } from '@playwright/test'
import { BasePage } from '../basePage'

export class CancelOutOfServiceBedPage extends BasePage {
  static async initialize(page: Page) {
    await expect(page.locator('h1')).toContainText('Cancel this out of service bed?')
    return new CancelOutOfServiceBedPage(page)
  }

  async confirmCancellation() {
    await this.clickSubmit('Cancel out of service bed')
  }
}
