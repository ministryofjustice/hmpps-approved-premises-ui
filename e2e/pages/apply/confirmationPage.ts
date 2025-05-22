import { expect } from '@playwright/test'
import { BasePage } from '../basePage'

export class ConfirmationPage extends BasePage {
  async shouldShowSuccessMessage() {
    await expect(this.page.locator('h1.govuk-panel__title')).toContainText('Application confirmation')
  }

  async shouldShowLinkToSurvey() {
    await expect(this.page.locator('a', { hasText: 'What did you think of this service?' })).toHaveAttribute(
      'href',
      'https://forms.office.com/e/jSiRQFF82r',
    )
  }
}
