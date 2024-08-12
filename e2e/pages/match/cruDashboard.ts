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
    const columns = [person.name, person.tier, lengthOfStay, applicationDate, isParole ? 'Parole' : 'Standard release']

    if (arrivalDate) {
      columns.push(arrivalDate)
    }

    const placementRequestRow = this.page
      .getByRole('row')
      .filter({
        has:
          columns.every(column => this.page.getByRole('cell', { name: column })) &&
          this.page.getByRole('cell', { name: columns[columns.length] }),
      })
      .first()
    await placementRequestRow.getByRole('link').click()
  }
}
