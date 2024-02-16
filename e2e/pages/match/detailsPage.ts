import { BasePage } from '../basePage'

export class DetailsPage extends BasePage {
  async clickSearch() {
    await this.page.getByRole('link', { name: 'Search' }).click()
  }
}
