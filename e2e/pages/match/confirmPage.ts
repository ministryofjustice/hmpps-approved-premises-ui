import { BasePage } from '../basePage'

export class ConfirmPage extends BasePage {
  async clickConfirm() {
    await this.page.getByRole('button', { name: 'Confirm and submit' }).click()
  }
}
