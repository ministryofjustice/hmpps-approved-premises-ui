import { Page, expect } from '@playwright/test'
import { BasePage } from '../basePage'

export class WithdrawalSelectionPage extends BasePage {
  static async initialize(page: Page, title?: string) {
    if (title) {
      await expect(page.locator('h1')).toContainText(title)
    }
    return new WithdrawalSelectionPage(page)
  }

  async selectPlacementRadio() {
    await this.checkRadio('Placement/Booking')
  }
}
