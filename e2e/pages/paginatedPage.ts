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

  async findRowWithValues(values: Array<string>, sortBy?: string) {
    if (sortBy) {
      await this.sortDescendingBy(sortBy)
    }

    let row = this.page.getByRole('row')

    values.forEach(value => {
      row = row.filter({ hasText: value })
    })

    const foundRow = row.first()

    if (sortBy) {
      await expect(foundRow).toBeVisible()
      return foundRow
    }

    return this.tryNextPageUntilFound(foundRow)
  }

  async sortDescendingBy(field: string) {
    const url = new URL(this.page.url())
    url.searchParams.set('sortBy', field)
    url.searchParams.set('sortDirection', 'desc')
    await this.page.goto(url.toString())
  }
}
