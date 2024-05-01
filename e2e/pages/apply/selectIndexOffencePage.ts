import { BasePage } from '../basePage'

export class SelectIndexOffencePage extends BasePage {
  async selectFirstOffence() {
    await this.page.getByRole('radio').first().click()
  }
}
