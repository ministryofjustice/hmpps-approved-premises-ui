import { Page, expect } from '@playwright/test'
import { addYears, getDate, getMonth, getYear } from 'date-fns'
import { BasePage } from '../basePage'

export class MarkBedOutOfServicePage extends BasePage {
  static async initialize(page: Page, title?: string) {
    if (title) {
      await expect(page.locator('h1')).toContainText(title)
    }
    return new MarkBedOutOfServicePage(page)
  }

  async enterOutOfServiceFromDate() {
    const aDateNextYear = addYears(new Date(), 1)
    await this.page
      .getByRole('group', { name: 'Out of service from' })
      .getByLabel('Day')
      .fill(getDate(aDateNextYear).toString())
    await this.page
      .getByRole('group', { name: 'Out of service from' })
      .getByLabel('Month')
      .fill(getMonth(aDateNextYear).toString())
      .toString()
    await this.page
      .getByRole('group', { name: 'Out of service from' })
      .getByLabel('Year')
      .fill(getYear(aDateNextYear).toString())
  }

  async enterOutOfServiceToDate() {
    await this.page.getByRole('group', { name: 'End date' }).getByLabel('Day').fill('1')
    await this.page.getByRole('group', { name: 'End date' }).getByLabel('Month').fill('2')
    await this.page.getByRole('group', { name: 'End date' }).getByLabel('Year').fill('2025')
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
}
