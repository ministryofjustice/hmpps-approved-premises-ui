import { Page, expect } from '@playwright/test'
import { BasePage } from '../basePage'

export class UserList extends BasePage {
  static async initialize(page: Page) {
    await expect(page.locator('h1')).toContainText('User management dashboard')

    return new UserList(page)
  }

  async search(searchTerm: string) {
    await this.page.getByLabel('Find a user').fill(searchTerm)
    await this.page.click('button[type="submit"]')
  }

  async clickEditUser(username: string) {
    await this.page.getByRole('link', { name: username }).click()
  }

  async clickAddUser() {
    await this.page.getByRole('button', { name: 'Add new user' }).click()
  }

  async shouldShowUserDeletedBanner() {
    await expect(this.page.locator('h3')).toContainText('User deleted')
  }

  async shouldNotShowUser(username: string) {
    await expect(this.page.getByRole('link', { name: username })).toHaveCount(0)
  }

  async shouldShowUser(username: string) {
    await expect(this.page.getByRole('link', { name: username })).toHaveCount(1)
  }
}
