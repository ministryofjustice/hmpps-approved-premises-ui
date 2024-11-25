import { Page, expect } from '@playwright/test'
import { BasePage } from '../basePage'
import { E2EDatesOfPlacement } from '../../steps/assess'
import { DateFormats } from '../../../server/utils/dateUtils'

export class SpaceBookingPage extends BasePage {
  static async initialize(page: Page, datesOfPlacement?: E2EDatesOfPlacement) {
    if (datesOfPlacement) {
      const [startDate, endDate] = ['startDate', 'endDate'].map(key =>
        DateFormats.isoDateToUIDate(datesOfPlacement[key], { format: 'short' }),
      )
      await expect(page.locator('h1')).toContainText(`${startDate} to ${endDate}`)
    }
    return new SpaceBookingPage(page)
  }

  async shouldShowPlacementDetail(label: string, value: string) {
    await expect(this.page.locator('.govuk-summary-list__row').filter({ hasText: label })).toContainText(value)
  }

  async clickEditKeyworker() {
    await this.clickActions()
    await this.page.getByRole('menuitem', { name: 'Edit keyworker' }).click()
  }
}
