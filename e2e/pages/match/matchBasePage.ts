import { expect } from '@playwright/test'
import { E2EDatesOfPlacement } from '../../steps/assess'
import { DateFormats } from '../../../server/utils/dateUtils'
import { BasePage } from '../basePage'

export class MatchBasePage extends BasePage {
  async shouldShowDatesOfPlacement({ startDate, endDate }: E2EDatesOfPlacement, duration: string) {
    if (startDate) {
      await expect(this.page.locator('.govuk-details').getByText(DateFormats.isoDateToUIDate(startDate))).toBeVisible()
    }
    if (endDate) {
      await expect(this.page.locator('.govuk-details').getByText(DateFormats.isoDateToUIDate(endDate))).toBeVisible()
    }
    if (duration) {
      await expect(this.page.locator('.govuk-details').getByText(duration)).toBeVisible()
    }
  }
}
