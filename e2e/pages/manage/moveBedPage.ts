import { Page, expect } from '@playwright/test'
import { BasePage } from '../basePage'

export class MoveBedPage extends BasePage {
  static async initialize(page: Page, title?: string) {
    if (title) {
      await expect(page.locator('h1')).toContainText(title)
    }
    return new MoveBedPage(page)
  }

  async completeForm() {
    await this.page.locator('select').selectOption({ label: 'Bed name: 101 - 1, room name: 101' })
    await this.page.locator('text=Any other information').fill('102')
    await this.clickSubmit()
  }
}
