import { BasePage } from '../basePage'

export class ListPage extends BasePage {
  async clickFirstPlacementRequest(personName: string) {
    await this.page.getByRole('link', { name: personName }).first().click()
  }

  async clickPlacementApplicationWithId(id: string) {
    await this.page
      .getByRole('row')
      .filter({ has: this.page.locator(`[data-cy-applicationId="${id}"]`) })
      .first()
      .getByRole('link')
      .click()
  }

  async clickPlacementApplications() {
    await this.page.getByRole('tab', { name: 'Placement Applications' }).click()
  }
}
