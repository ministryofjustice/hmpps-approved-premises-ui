import { BasePage } from '../basePage'

export class PlacementRequestPage extends BasePage {
  async selectStaffMember(userName: string) {
    await this.page.locator('select').selectOption(userName)
  }
}
