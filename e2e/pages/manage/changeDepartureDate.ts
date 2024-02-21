import { addMonths, getDate, getMonth, getYear } from 'date-fns'
import { Page, expect } from '@playwright/test'
import { BasePage } from '../basePage'

export class ChangeDepartureDatePage extends BasePage {
  static async initialize(page: Page, title?: string) {
    if (title) {
      await expect(page.locator('h1')).toContainText(title)
    }
    return new ChangeDepartureDatePage(page)
  }

  async selectAndEnterNewDepartureDate() {
    const newDate = addMonths(new Date(), 2)

    const departureDateLabel = 'What is the new departure date?'
    await this.page.getByRole('group', { name: departureDateLabel }).getByLabel('Day').fill(getDate(newDate).toString())
    await this.page
      .getByRole('group', { name: departureDateLabel })
      .getByLabel('Month')
      .fill((getMonth(newDate) + 1).toString())
    await this.page
      .getByRole('group', { name: departureDateLabel })
      .getByLabel('Year')
      .fill(getYear(newDate).toString())
  }

  async completeForm() {
    await this.selectAndEnterNewDepartureDate()
  }
}
