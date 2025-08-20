import { Page, expect } from '@playwright/test'
import { BasePage } from '../basePage'

export class EditKeyworkerPage extends BasePage {
  static async initialize(page: Page) {
    await expect(page.locator('h1')).toContainText('Assign or change someone’s keyworker')
    return new EditKeyworkerPage(page)
  }

  async selectKeyworker() {
    await this.checkRadio('Assign a different keyworker')
    await this.clickSubmit()

    await this.fillField('Name or email address', 'AP_USER')
    await this.clickSubmit('Search')

    const row = this.page.getByRole('row', { name: /AP_USER/ }).first()
    const keyworkerName = await row.getByRole('cell', { name: /AP_USER/ }).textContent()
    await row.getByRole('button', { name: 'Assign keyworker' }).click()

    return { keyworkerName }
  }
}
