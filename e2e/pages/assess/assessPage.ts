import { Page, expect } from '@playwright/test'
import { BasePage } from '../basePage'

export class AssessPage extends BasePage {
  static async initialize(page: Page, title?: string) {
    if (title) {
      await expect(page.locator('h1')).toContainText(title)
    }
    return new AssessPage(page)
  }

  async checkRequirement(requirement: string, status: string) {
    await this.page.getByLabel(`${requirement} ${status}`, { exact: true }).check()
  }
}
