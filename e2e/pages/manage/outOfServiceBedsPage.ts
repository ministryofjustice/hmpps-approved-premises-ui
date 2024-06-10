import { Page, expect } from '@playwright/test'
import { BasePage } from '../basePage'

export class OutOfServiceBedsPage extends BasePage {
  static async initialize(page: Page, title?: string) {
    if (title) {
      await expect(page.locator('h1')).toContainText(title)
    }
    return new OutOfServiceBedsPage(page)
  }
}
