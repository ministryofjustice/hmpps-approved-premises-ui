import { expect } from '@playwright/test'
import { BasePage } from '../basePage'

export class PlacementConfirmPage extends BasePage {
  async shouldShowSuccessMessage() {
    await expect(this.page.locator('h1.govuk-panel__title')).toContainText('Request for placement confirmed')
  }
}
