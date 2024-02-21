import { Page, expect } from '@playwright/test'
import { BasePage } from '../basePage'

export class BedsPage extends BasePage {
  static async initialize(page: Page, title?: string) {
    if (title) {
      await expect(page.locator('h1')).toContainText(title)
    }
    return new BedsPage(page)
  }

  async viewAvailableBed() {
    const rowLocator = this.page.locator('tr')

    const availableBedRows = rowLocator.filter({ hasText: 'Available' })

    await availableBedRows.first().getByRole('link', { name: 'Manage' }).click()
  }

  async viewOccupiedBed() {
    const rowLocator = this.page.locator('tr')

    const occupiedBedRows = rowLocator.filter({ hasText: 'Occupied' })

    await occupiedBedRows.first().getByRole('link', { name: 'Manage' }).click()
  }
}
