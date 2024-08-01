import { Page, expect } from '@playwright/test'
import { addDays, addMonths, getDate, getMonth, getYear } from 'date-fns'
import { faker } from '@faker-js/faker/locale/en_GB'
import { BasePage } from '../basePage'

export class V2MarkBedAsOutOfServicePage extends BasePage {
  startDate: Date

  static async initialize(page: Page, title?: string) {
    if (title) {
      await expect(page.locator('h1')).toContainText(title)
    }
    const instance = new V2MarkBedAsOutOfServicePage(page)
    instance.startDate = faker.date.soon({ days: 12000 })
    return instance
  }

  endDate() {
    const endDate = addDays(this.startDate, 2)

    return endDate
  }

  async enterOutOfServiceFromDate() {
    const { startDate } = this
    await this.page.getByRole('group', { name: 'Start date' }).getByLabel('Day').fill(getDate(startDate).toString())
    await this.page
      .getByRole('group', { name: 'Start date' })
      .getByLabel('Month')
      .fill((getMonth(startDate) + 1).toString())
    await this.page.getByRole('group', { name: 'Start date' }).getByLabel('Year').fill(getYear(startDate).toString())
  }

  async enterOutOfServiceToDate() {
    const endDate = this.endDate()
    await this.page.getByRole('group', { name: 'End date' }).getByLabel('Day').fill(getDate(endDate).toString())
    await this.page
      .getByRole('group', { name: 'End date' })
      .getByLabel('Month')
      .fill((getMonth(endDate) + 1).toString())
    await this.page.getByRole('group', { name: 'End date' }).getByLabel('Year').fill(getYear(endDate).toString())
  }

  async completeForm() {
    await this.enterOutOfServiceFromDate()
    await this.enterOutOfServiceToDate()
    await this.checkRadio('Planned Refurbishment')
    await this.page.getByLabel('Work order reference number').fill('123456789')
    await this.page
      .getByLabel(
        'Provide  detail about why the bed is out of service. If FM works are required you should update this record with any progress on that work.',
      )
      .fill('Reasons for bed being out of service')
  }

  async isBedNotAvailableMessageVisible(): Promise<boolean> {
    return this.page.getByRole('heading', { name: 'This bedspace is not available for the dates entered' }).isVisible()
  }

  async addMonthsToStartDate(numberOfMonths: number) {
    this.startDate = addMonths(this.startDate, numberOfMonths)
  }

  async ensureNoBookingConflict() {
    if (await this.isBedNotAvailableMessageVisible()) {
      await this.addMonthsToStartDate(1)
      await this.completeForm()
      await this.clickSave()

      await this.ensureNoBookingConflict()
    }
  }
}
