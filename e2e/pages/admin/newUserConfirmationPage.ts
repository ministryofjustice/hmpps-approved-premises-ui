import { Page, expect } from '@playwright/test'
import { BasePage } from '../basePage'

export class NewUserConfirmationPage extends BasePage {
  static async initialize(page: Page) {
    await expect(page.locator('h1')).toContainText('Confirm new user')

    return new NewUserConfirmationPage(page)
  }

  async clickContinue() {
    await this.page.getByRole('button', { name: 'Continue' }).click()
  }
}
