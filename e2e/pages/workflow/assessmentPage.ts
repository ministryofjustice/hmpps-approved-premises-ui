import { BasePage } from '../basePage'

export class AssessmentPage extends BasePage {
  async selectStaffMember(userName: string) {
    await this.page
      .getByRole('row')
      .filter({ has: this.page.getByText(userName) })
      .first()
      .getByRole('button')
      .click()
  }
}
