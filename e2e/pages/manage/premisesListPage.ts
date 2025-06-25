import { Page, expect } from '@playwright/test'
import { BasePage } from '../basePage'

export class PremisesListPage extends BasePage {
  static async initialize(page: Page, title?: string) {
    if (title) {
      await expect(page.locator('h1')).toContainText(title)
    }
    return new PremisesListPage(page)
  }

  async choosePremises(premisesName: string) {
    if (!(await this.page.getByRole('link', { name: premisesName }).isVisible())) {
      await this.page.getByRole('combobox', { name: 'AP area' }).selectOption('All areas')
      await this.page.getByRole('button', { name: 'Apply filter' }).click()
    }

    await this.page.getByRole('link', { name: premisesName, exact: true }).click()
  }
}
