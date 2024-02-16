import { BasePage } from '../basePage'

export class ListPage extends BasePage {
  async clickFirstAssessment(personName: string) {
    await this.page.getByRole('link', { name: personName }).first().click()
  }

  async clickAssessmentWithApplicationId(applicationId: string) {
    await this.page
      .getByRole('row')
      .filter({ has: this.page.locator(`[data-cy-applicationid="${applicationId}"]`) })
      .first()
      .getByRole('link')
      .click()
  }
}
