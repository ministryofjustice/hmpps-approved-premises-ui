import { Page, expect } from '@playwright/test'
import { addDays } from 'date-fns'
import { BasePage } from '../basePage'
import { DateFormats } from '../../../server/utils/dateUtils'

export class RecordArrivalPage extends BasePage {
  static async initialize(page: Page, title?: string) {
    if (title) {
      await expect(page.locator('h1')).toContainText(title)
    }
    return new RecordArrivalPage(page)
  }

  async recordArrival() {
    const arrivalDateTime = addDays(new Date(), -1) // Yesterday same time
    const [year, month, day, hours, minutes] = DateFormats.dateObjToIsoDateTime(arrivalDateTime).split(/\D/)
    await this.fillDateField({ year, month, day })
    await this.fillField('What is the time of arrival?', `${hours}:${minutes}`)

    await this.clickSubmit()

    return { arrivalDateTime }
  }
}
