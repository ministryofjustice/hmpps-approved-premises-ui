import { Page, expect } from '@playwright/test'
import { BasePage } from '../basePage'

export class CancellationPage extends BasePage {
  static async initialize(page: Page, title?: string) {
    if (title) {
      await expect(page.locator('h1')).toContainText(title)
    }
    return new CancellationPage(page)
  }

  async completeForm() {
    await this.checkRadio('Probation Practitioner requested it')
  }
}
