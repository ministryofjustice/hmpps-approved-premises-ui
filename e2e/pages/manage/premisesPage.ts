import { Locator, Page, expect } from '@playwright/test'
import { PaginatedPage } from '../paginatedPage'

export class PremisesPage extends PaginatedPage {
  static async initialize(page: Page, title?: string) {
    if (title) {
      await expect(page.locator('h1')).toContainText(title)
    }
    return new PremisesPage(page)
  }

  async viewRooms() {
    await this.page.getByRole('button', { name: 'Actions' }).click()
    await this.page.getByRole('button', { name: 'Manage beds' }).click()
  }

  async showsLostBedLoggedMessage() {
    await this.page.getByRole('heading', { name: 'Success' })
  }

  async clickManageTodaysArrival() {
    const table = this.page.getByRole('table', { name: 'Arriving Today' })
    await table.getByRole('link', { name: 'Manage' }).first().click()
  }

  async clickGivenBooking(bookingId: string) {
    await this.page.locator(`[data-cy-booking-id="${bookingId}"]`).first().click()
  }

  async clickManageCurrentResident() {
    const table = this.page.getByRole('table', { name: 'Current residents' })
    await table.getByRole('link', { name: 'Manage' }).first().click()
  }

  async showsArrivalLoggedMessage() {
    await this.page.waitForSelector('text=Arrival logged')
  }

  async clickCreatePlacement() {
    await this.clickActions()
    await this.page.getByRole('button', { name: 'Create a placement' }).click()
  }

  async viewOutOfServiceBedRecords() {
    await this.page.getByRole('button', { name: 'Actions' }).click()
    await this.page.getByRole('button', { name: 'Manage out of service bed records' }).click()
  }

  async openBookingFromRow(bookingRow: Locator) {
    await bookingRow.getByRole('link').click()
  }
}
