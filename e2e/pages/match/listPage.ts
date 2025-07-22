import { BasePage } from '../basePage'

export class ListPage extends BasePage {
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
