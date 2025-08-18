import { Page, expect } from '@playwright/test'
import { faker } from '@faker-js/faker'
import { BasePage } from '../basePage'

export class EditKeyworkerPage extends BasePage {
  static async initialize(page: Page) {
    // TODO: Remove condition when new flow has been released (APS-2644)
    if (await page.locator('select#staffCode').isVisible()) {
      await expect(page.locator('h1')).toContainText('Edit keyworker details')
      return new EditKeyworkerPage(page)
    }

    await expect(page.locator('h1')).toContainText('Assign or change someone’s keyworker')
    return new EditKeyworkerPage(page)
  }

  async selectKeyworker() {
    // TODO: Remove condition when new flow has been released (APS-2644)
    if (await this.page.locator('select#staffCode').isVisible()) {
      const keyworkerSelect = this.page.getByRole('combobox', { name: 'Select keyworker' })

      const options = (await keyworkerSelect.locator('option').allTextContents()).filter(
        label => !label.startsWith('Select'),
      )
      const keyworkerName = faker.helpers.arrayElement(options)
      await keyworkerSelect.selectOption(keyworkerName)

      await this.clickSubmit()

      return { keyworkerName }
    }

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
