import { Page, expect } from '@playwright/test'
import { BasePage } from '../basePage'

export class BedPage extends BasePage {
  static async initialize(page: Page, title?: string) {
    if (title) {
      await expect(page.locator('h1')).toContainText(title)
    }
    return new BedPage(page)
  }

  async clickActions() {
    await this.page.getByRole('button', { name: 'Actions' }).click()
  }

  async clickBookBed() {
    await this.clickActions()
    await this.page.getByRole('menuitem', { name: 'Create a placement' }).click()
  }

  async clickMarkBedAsOutOfService() {
    await this.clickActions()
    await this.page.getByRole('menuitem', { name: 'Create out of service bed record' }).click()
  }
}
