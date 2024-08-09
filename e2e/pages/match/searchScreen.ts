import { Page, expect } from '@playwright/test'
import { BasePage } from '../basePage'
import { Premises } from '../../../server/@types/shared'
import { ApTypeLabel } from '../../../server/utils/apTypeLabels'
import { E2EDatesOfPlacement, E2EPlacementCharacteristics } from '../../steps/assess'

export class SearchScreen extends BasePage {
  static async initialize(page: Page) {
    await expect(page.locator('h1')).toContainText('Find a space in an Approved Premises')

    return new SearchScreen(page)
  }

  async clickUpdate() {
    await this.page.getByRole('button', { name: 'Update' }).click()
  }

  shouldShowApplicationDetails({
    preferredAps,
    datesOfPlacement,
    duration,
    apType,
    preferredPostcode,
    placementCharacteristics,
  }: {
    preferredAps: Array<Premises['name']>
    datesOfPlacement: E2EDatesOfPlacement
    duration: string
    apType: ApTypeLabel
    preferredPostcode: string
    placementCharacteristics: E2EPlacementCharacteristics
  }): void {
    this.shouldShowDatesOfPlacement(datesOfPlacement, duration)
    this.shouldShowApType(apType)
    this.shouldShowPreferredPostcode(preferredPostcode)
    this.shouldShowPreferredAps(preferredAps)
    this.shouldShowPlacementCharacteristics(placementCharacteristics)
  }

  async shouldShowPreferredAps(preferredAps: Array<Premises['name']>) {
    preferredAps.forEach(async (preferredAp, index) => {
      await this.page.getByText(preferredAp, { exact: true }).nth(index).isVisible()
    })
  }

  async shouldShowApType(apType: ApTypeLabel) {
    await this.page.locator('.govuk-details').getByText(apType).isVisible()
  }

  async shouldShowPreferredPostcode(postcode: string) {
    await this.page.locator('.govuk-details').getByText(postcode).isVisible()
  }

  async shouldShowDatesOfPlacement({ startDate, endDate }: E2EDatesOfPlacement, duration: string) {
    ;[startDate, endDate, duration].forEach(async date => {
      await this.page.locator('.govuk-details').getByText(date).isVisible()
    })
  }

  async shouldShowPlacementCharacteristics({
    essentialCharacteristics,
    desirableCharacteristics,
  }: E2EPlacementCharacteristics) {
    essentialCharacteristics.forEach(async characteristic => {
      await this.page.locator('.govuk-details').getByText(characteristic).isVisible()
    })

    desirableCharacteristics.forEach(async characteristic => {
      await this.page.locator('.govuk-details').getByText(characteristic).isVisible()
    })
  }
}
