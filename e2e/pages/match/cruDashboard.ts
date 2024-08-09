import { Page, expect } from '@playwright/test'
import { TestOptions } from '@approved-premises/e2e'
import { BasePage } from '../basePage'

export class CruDashboard extends BasePage {
  static async initialize(page: Page) {
    await expect(page.locator('h1')).toContainText('CRU Dashboard')

    return new CruDashboard(page)
  }

  async selectPlacementRequest({
    person,
    arrivalDate,
    lengthOfStay,
    applicationDate,
    isParole,
  }: {
    person: TestOptions['person']
    arrivalDate: string
    lengthOfStay: string
    applicationDate: string
    isParole: boolean
  }) {
    const placementRequestRow = this.page
      .getByRole('row')
      .filter({
        has:
          this.page.getByRole('cell', { name: person.name }) &&
          this.page.getByRole('cell', { name: person.tier }) &&
          this.page.getByRole('cell', { name: arrivalDate }) &&
          this.page.getByRole('cell', { name: lengthOfStay }) &&
          this.page.getByRole('cell', { name: applicationDate }) &&
          this.page.getByRole('cell', { name: isParole ? 'Parole' : 'Standard release' }),
      })
      .first()
    await placementRequestRow.getByRole('link').click()
  }
}
