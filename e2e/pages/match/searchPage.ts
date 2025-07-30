import { Page, expect } from '@playwright/test'
import { MatchBasePage } from './matchBasePage'
import { Premises } from '../../../server/@types/shared'
import { ApTypeLabel } from '../../../server/utils/apTypeLabels'
import { E2EDatesOfPlacement } from '../../steps/assess'

export class SearchPage extends MatchBasePage {
  static async initialize(page: Page) {
    await expect(page.locator('h1')).toContainText('Find a space in an Approved Premises')

    return new SearchPage(page)
  }

  async clickUpdate() {
    await this.page.getByRole('button', { name: 'Update' }).click()
  }

  async selectAp(premisesName: string) {
    await this.page
      .locator('.govuk-summary-card', { has: this.page.getByRole('heading', { name: premisesName }) })
      .getByRole('link', { name: 'View spaces' })
      .click()
  }

  async shouldShowApplicationDetails({
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
  }): Promise<void> {
    await this.shouldShowDatesOfPlacement(datesOfPlacement, duration)
    await this.shouldShowApType(apType)
    await this.shouldShowPreferredPostcode(preferredPostcode)
    await this.shouldShowPreferredAps(preferredAps)
  }

  async shouldShowPreferredAps(preferredAps: Array<Premises['name']>) {
    return Promise.all(
      preferredAps.map(async (preferredAp, index) => {
        await expect(this.page.getByText(preferredAp, { exact: true }).nth(index)).toBeVisible()
      }),
    )
  }

  async shouldShowApType(apType: ApTypeLabel) {
    await expect(this.page.locator('.govuk-details').getByText(apType)).toBeVisible()
  }

  async shouldShowPreferredPostcode(postcode: string) {
    await expect(this.page.locator('.govuk-details').getByText(postcode)).toBeVisible()
  }
}
