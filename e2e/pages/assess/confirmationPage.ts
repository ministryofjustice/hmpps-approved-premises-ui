import { expect } from '@playwright/test'
import { BasePage } from '../basePage'

export class ConfirmationPage extends BasePage {
  async shouldShowSuccessMessage() {
    await expect(this.page.locator('h1.govuk-panel__title')).toContainText('You have marked this application as')
  }
}
