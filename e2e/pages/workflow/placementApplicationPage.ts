import { BasePage } from '../basePage'

export class PlacementApplicationPage extends BasePage {
  async selectStaffMember(userName: string) {
    await this.page.locator('select').selectOption(userName)
  }
}
