import { Page, expect } from '@playwright/test'
import { BasePage } from '../basePage'

export class PremisesPage extends BasePage {
  static async initialize(page: Page, title?: string) {
    if (title) {
      await expect(page.locator('h1')).toContainText(title)
    }
    return new PremisesPage(page)
  }

  async viewRooms() {
    await this.page.getByRole('button', { name: 'Actions' }).click()
    await this.page.getByRole('menuitem', { name: 'Manage beds' }).click()
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
    await this.page.getByRole('menuitem', { name: 'Create a placement' }).click()
  }

  async viewOutOfServiceBedRecords() {
    await this.page.getByRole('button', { name: 'Actions' }).click()
    await this.page.getByRole('menuitem', { name: 'Manage out of service bed records' }).click()
  }
}
