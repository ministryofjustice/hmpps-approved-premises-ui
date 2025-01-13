import { Page, expect } from '@playwright/test'
import { E2EDatesOfPlacement } from 'e2e/steps/assess'
import { BasePage } from '../basePage'
import { DateFormats } from '../../../server/utils/dateUtils'

export class BookingPage extends BasePage {
  static async initialize(page: Page) {
    await expect(page.locator('h1')).toContainText('Confirm booking')

    return new BookingPage(page)
  }

  async clickConfirm() {
    await this.page.getByRole('button', { name: 'Confirm and book' }).click()
  }

  async shouldShowDatesOfPlacement(datesOfPlacement: E2EDatesOfPlacement) {
    await expect(
      this.page
        .locator('.govuk-summary-list__value')
        .filter({ hasText: DateFormats.isoDateToUIDate(datesOfPlacement.startDate) }),
    ).toBeVisible()

    await expect(
      this.page
        .locator('.govuk-summary-list__value')
        .filter({ hasText: DateFormats.isoDateToUIDate(datesOfPlacement.endDate) }),
    ).toBeVisible()
  }
}
