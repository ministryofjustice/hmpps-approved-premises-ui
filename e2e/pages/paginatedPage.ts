import { Locator, expect } from '@playwright/test'
import { BasePage } from './basePage'

export class PaginatedPage extends BasePage {
  async tryNextPageUntilFound(locator: Locator) {
    const nextLink = this.page.getByRole('link', { name: 'Next' })

    try {
      await expect(locator).toBeVisible({ timeout: 1000 })
    } catch (err) {
      try {
        await expect(nextLink).toBeVisible()
      } catch {
        throw err
      }
      await nextLink.click()
      await this.tryNextPageUntilFound(locator)
    }

    return locator
  }

  async findRowWithValues(values: Array<string>) {
    let row = this.page.getByRole('row')

    values.forEach(value => {
      row = row.filter({ hasText: value })
    })

    return this.tryNextPageUntilFound(row.first())
  }
}
