import { Page, expect } from '@playwright/test'
import { faker } from '@faker-js/faker'
import { BasePage } from '../basePage'

export class EditKeyworkerPage extends BasePage {
  static async initialize(page: Page, title?: string) {
    if (title) {
      await expect(page.locator('h1')).toContainText(title)
    }
    return new EditKeyworkerPage(page)
  }

  async selectKeyworker() {
    const keyworkerSelect = this.page.getByRole('combobox', { name: 'Select keyworker' })

    const options = (await keyworkerSelect.locator('option').allTextContents()).filter(
      label => !label.startsWith('Select'),
    )
    const keyworkerName = faker.helpers.arrayElement(options)
    await keyworkerSelect.selectOption(keyworkerName)

    await this.clickSubmit()

    return { keyworkerName }
  }
}
