import { BasePage } from '../basePage'

export class PlacementRequestPage extends BasePage {
  async selectStaffMember(userName: string) {
    await this.page.locator('select').selectOption(userName)
  }

  async clickSearchForASpace() {
    await this.clickActions()
    await this.page.getByRole('menuitem', { name: 'Search for a space' }).click()
  }
}
