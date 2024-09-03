import { expect } from '@playwright/test'
import { BasePage } from '../basePage'

export class ConfirmationPage extends BasePage {
  async shouldShowPlacementSuccessMessage() {
    await expect(this.page.locator('h1.govuk-panel__title')).toContainText('Placement confirmed')
  }
}
