import { Page, expect } from '@playwright/test'
import { BasePage } from '../basePage'

export class CheckYourAnswersPage extends BasePage {
  static async initialize(page: Page) {
    await expect(page.locator('h1')).toContainText(' Check your answers ')
    return new CheckYourAnswersPage(page)
  }

  async clickContinue() {
    await this.page.getByRole('button', { name: 'Continue' }).click()
  }
}
