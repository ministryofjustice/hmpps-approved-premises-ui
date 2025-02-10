import { expect } from '@playwright/test'
import { BasePage } from '../basePage'

export class PlacementRequestPage extends BasePage {
  async navigateToPlacement() {
    await this.page.getByRole('link', { name: 'View timeline' }).click()
    await this.page.getByRole('link', { name: 'View placement' }).click()
  }

  async clickSearchForASpace() {
    await this.clickActions()
    await this.page.getByRole('menuitem', { name: 'Search for a space' }).click()
  }

  async clickCreatePlacement() {
    await this.clickActions()
    await this.page.getByRole('menuitem', { name: 'Create placement' }).click()
  }

  async shouldShowPlacementSuccessMessage() {
    await expect(this.page.locator('.govuk-notification-banner')).toContainText('Placement created')
  }

  async clickChangePlacement() {
    await this.clickActions()
    await this.page.getByRole('menuitem', { name: 'Change placement' }).click()
  }
}
