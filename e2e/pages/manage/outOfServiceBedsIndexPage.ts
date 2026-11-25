import { Page, expect } from '@playwright/test'
import { PaginatedPage } from '../paginatedPage'

export class OutOfServiceBedsPremisesListPage extends PaginatedPage {
  static async initialize(page: Page, premisesName: string) {
    await expect(page.locator('h1')).toContainText('Out of service beds')
    await expect(page.locator('.govuk-caption-l a')).toContainText(premisesName)
    return new OutOfServiceBedsPremisesListPage(page)
  }

  async selectFutureTab() {
    await this.page.getByRole('link', { name: 'Future' }).click()
  }

  async selectOutOfServiceBed(referenceNumber: string) {
    const row = await this.findRowWithValues([referenceNumber])
    await row.getByRole('link', { name: 'View' }).click()
  }

  async showsTotalOutOfServiceBedsMatchingFilters() {
    await expect(this.page.getByText('Total out of service beds matching filters')).toBeVisible()
  }
}
