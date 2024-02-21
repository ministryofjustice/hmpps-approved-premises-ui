import { BasePage } from '../basePage'

export class StartPage extends BasePage {
  async createApplication() {
    await this.page.getByRole('button', { name: 'Start now' }).click()
  }
}
