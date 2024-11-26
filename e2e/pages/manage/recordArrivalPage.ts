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
    const yesterday = addDays(new Date(), -1)
    const [year, month, day] = DateFormats.dateObjToIsoDateTime(yesterday).split('-')
    const hours = faker.number.int({ min: 8, max: 20 })
    const minutes = faker.number.int({ min: 0, max: 59 }).toString().padStart(2, '0')
    await this.fillDateField({ year, month, day })
    await this.fillField('What is the time of arrival?', `${hours}:${minutes}`)

    await this.clickSubmit()

    return { arrivalDateTime: new Date(Number(year), Number(month) - 1, Number(day), hours, Number(minutes)) }
  }
}
