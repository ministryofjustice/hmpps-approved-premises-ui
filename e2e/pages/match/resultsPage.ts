import { BasePage } from '../basePage'

export class ResultsPage extends BasePage {
  async chooseBed() {
    await this.page.locator('.govuk-summary-card').first().getByRole('link').click()
  }
}
