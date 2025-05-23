import { Page, expect } from '@playwright/test'
import { addHours } from 'date-fns'
import { faker } from '@faker-js/faker'
import { BasePage } from '../basePage'
import { DateFormats } from '../../../server/utils/dateUtils'

export class RecordDeparturePage extends BasePage {
  static async initialize(page: Page, title?: string) {
    if (title) {
      await expect(page.locator('h1')).toContainText(title)
    }
    return new RecordDeparturePage(page)
  }

  async recordDeparture() {
    const departureDateTime = addHours(new Date(), -1) // One hour ago
    const [year, month, day, hours, minutes] = DateFormats.dateObjToIsoDateTime(departureDateTime)
      .split(/\D/)
      .map(part => part.replace(/^0+/, '')) // remove leading zeros for realistic input

    await this.fillDateField({ year, month, day })
    await this.fillField('What is the time of departure?', `${hours}:${minutes}`)

    const reason = await this.selectAnyRadioOption('reasonId')
    await this.clickContinue()
    await this.page.waitForLoadState()

    let breachOrRecallReason: string

    if (await this.page.getByText('Breach or recall').isVisible()) {
      breachOrRecallReason = await this.selectAnyRadioOption('breachOrRecallReasonId')
      await this.clickContinue()
      await this.page.waitForLoadState()
    }

    let moveOnCategory: string

    if (await this.page.getByText('Move on').isVisible()) {
      moveOnCategory = await this.selectAnyRadioOption('moveOnCategoryId', ['Transferred to different AP'])
      await this.clickContinue()
    }

    const notes = faker.word.words(10)

    await this.fillField('Provide more information', notes)

    await this.clickSubmit()

    return { departureDateTime, reason, breachOrRecallReason, moveOnCategory, notes }
  }
}
