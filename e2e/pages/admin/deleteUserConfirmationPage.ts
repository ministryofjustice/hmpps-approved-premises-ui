import { Page, expect } from '@playwright/test'
import { BasePage } from '../basePage'

export class DeleteUserConfirmationPage extends BasePage {
  static async initialize(page: Page) {
    await expect(page.locator('h1')).toContainText("Confirm user's access to AP service should be removed")

    return new DeleteUserConfirmationPage(page)
  }

  async clickRemoveAccess() {
    await this.page.getByRole('button', { name: 'Remove access' }).click()
  }
}
