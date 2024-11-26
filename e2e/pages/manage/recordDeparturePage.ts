import { Page, expect } from '@playwright/test'
import { addHours } from 'date-fns'
import { faker } from '@faker-js/faker'
import { BasePage } from '../basePage'
import { BREACH_OR_RECALL_REASON_ID, PLANNED_MOVE_ON_REASON_ID } from '../../../server/utils/placements'

export class RecordDeparturePage extends BasePage {
  static async initialize(page: Page, title?: string) {
    if (title) {
      await expect(page.locator('h1')).toContainText(title)
    }
    return new RecordDeparturePage(page)
  }

  async recordDeparture() {
    const departureDateTime = addHours(new Date(), -1) // One hour ago
    const [year, month, day, hours, minutes] = departureDateTime.toISOString().split(/\D/)

    await this.fillDateField({ year, month, day })
    await this.fillField('What is the time of departure?', `${hours}:${minutes}`)

    const reasons = await this.page
      .locator(`[name="reasonId"][type="radio"]`)
      .locator(`:not([value!="${BREACH_OR_RECALL_REASON_ID}"])`)
      .locator(`:not([value!="${PLANNED_MOVE_ON_REASON_ID}"])`)
      .allTextContents()
    const reason = faker.helpers.arrayElement(reasons)

    await this.checkRadio(reason)

    await this.clickSubmit()

    const notes = faker.word.words(10)

    await this.fillField('Provide more information', notes)

    return { departureDateTime, reason, notes }
  }
}
