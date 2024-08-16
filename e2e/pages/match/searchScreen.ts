import { Page, expect } from '@playwright/test'
import { BasePage } from '../basePage'
import { Premises } from '../../../server/@types/shared'
import { ApTypeLabel } from '../../../server/utils/apTypeLabels'
import { E2EDatesOfPlacement } from '../../steps/assess'

export class SearchScreen extends BasePage {
  static async initialize(page: Page) {
    await expect(page.locator('h1')).toContainText('Find a space in an Approved Premises')

    return new SearchScreen(page)
  }

  async clickUpdate() {
    await this.page.getByRole('button', { name: 'Update' }).click()
  }

  async selectFirstAP() {
    await this.page.getByRole('link', { name: 'View spaces' }).first().click()
  }

  shouldShowApplicationDetails({
    preferredAps,
    datesOfPlacement,
    duration,
    apType,
    preferredPostcode,
  }: {
    preferredAps: Array<Premises['name']>
    datesOfPlacement: E2EDatesOfPlacement
    duration: string
    apType: ApTypeLabel
    preferredPostcode: string
  }): void {
    this.shouldShowDatesOfPlacement(datesOfPlacement, duration)
    this.shouldShowApType(apType)
    this.shouldShowPreferredPostcode(preferredPostcode)
    this.shouldShowPreferredAps(preferredAps)
  }

  async shouldShowPreferredAps(preferredAps: Array<Premises['name']>) {
    preferredAps.forEach(async (preferredAp, index) => {
      await expect(this.page.getByText(preferredAp, { exact: true }).nth(index)).toBeVisible()
    })
  }

  async shouldShowApType(apType: ApTypeLabel) {
    await expect(this.page.locator('.govuk-details').getByText(apType)).toBeVisible()
  }

  async shouldShowPreferredPostcode(postcode: string) {
    await expect(this.page.locator('.govuk-details').getByText(postcode)).toBeVisible()
  }

  async shouldShowDatesOfPlacement({ startDate, endDate }: E2EDatesOfPlacement, duration: string) {
    ;[startDate, endDate, duration].forEach(async date => {
      if (date) await expect(this.page.locator('.govuk-details').getByText(date)).toBeVisible()
    })
  }

  async retrieveFirstAPName(): Promise<Premises['name']> {
    return this.page.locator('.govuk-summary-card__title').first().innerText()
  }
}
