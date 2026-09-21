import { BasePage } from '../basePage'

export class StartWarningPage extends BasePage {
  async continue() {
    await this.page.getByRole('link', { name: 'Continue' }).click()
  }
}
