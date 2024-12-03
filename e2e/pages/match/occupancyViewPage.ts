import { Page, expect } from '@playwright/test'
import { Premises } from '@approved-premises/api'
import { MatchBasePage } from './matchBasePage'
import { E2EDatesOfPlacement } from '../../steps/assess'
import { ReleaseTypeLabel } from '../../../server/utils/applications/releaseTypeUtils'

export class OccupancyViewPage extends MatchBasePage {
  static async initialize(page: Page, premisesName: Premises['name']) {
    await expect(page.locator('h1')).toContainText(`View spaces in ${premisesName}`)

    return new OccupancyViewPage(page)
  }

  async shouldShowMatchingDetails({
    datesOfPlacement,
    duration,
    releaseType,
  }: {
    datesOfPlacement: E2EDatesOfPlacement
    duration: string
    releaseType: ReleaseTypeLabel
  }): Promise<void> {
    await this.shouldShowDatesOfPlacement(datesOfPlacement, duration)
    await this.shouldShowReleaseType(releaseType)
  }

  async shouldShowReleaseType(releaseType: ReleaseTypeLabel) {
    await expect(this.page.locator('.govuk-details').getByText(releaseType)).toBeVisible()
  }

  async clickContinue() {
    await this.page.getByRole('link', { name: 'Continue' }).first().click()
  }
}
