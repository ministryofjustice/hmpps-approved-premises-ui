import { Page, expect } from '@playwright/test'
import { BasePage } from '../basePage'
import { Premises } from '../../../server/@types/shared'

export class OccupancyViewScreen extends BasePage {
  static async initialize(page: Page, premisesName: Premises['name']) {
    await expect(page.locator('h1')).toContainText(`View spaces in ${premisesName}`)

    return new OccupancyViewScreen(page)
  }

  async clickContinue() {
    await this.page.getByRole('link', { name: 'Continue' }).first().click()
  }
}
