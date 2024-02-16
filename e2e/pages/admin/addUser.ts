import { Page, expect } from '@playwright/test'
import { BasePage } from '../basePage'

export class AddUser extends BasePage {
  static async initialize(page: Page) {
    await expect(page.locator('h1')).toContainText('Find a new user')

    return new AddUser(page)
  }

  async search(searchTerm: string) {
    await this.page.getByLabel('Search for a person').fill(searchTerm)
    await this.page.click('button[type="submit"]')
  }
}
