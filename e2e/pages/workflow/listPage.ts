import { BasePage } from '../basePage'

export class ListPage extends BasePage {
  async chooseAssessmentWithId(id: string) {
    await this.page.getByRole('link', { name: 'Due ▲' }).click()

    const assessmentRows = this.page.getByRole('row').filter({ has: this.page.getByText('Assessment') })

    const assessmentRow = await assessmentRows.filter({ has: this.page.locator(`[data-cy-applicationId="${id}"]`) })

    if (!(await assessmentRow.isVisible())) {
      await this.page
        .getByRole('link')
        .filter({ has: this.page.getByText('Unallocated') })
        .first()
        .click()
    }

    await assessmentRow.first().getByRole('link').click()
  }

  async choosePlacementApplicationWithId(id: string) {
    const assessmentRows = this.page.getByRole('row').filter({ has: this.page.getByText('Placement application') })

    await assessmentRows
      .filter({ has: this.page.locator(`[data-cy-applicationId="${id}"]`) })
      .first()
      .getByRole('link')
      .click()
  }

  async chooseFirstAssessment() {
    await this.page
      .getByRole('row')
      .filter({ has: this.page.getByText('Assessment') })
      .first()
      .getByRole('link')
      .click()
  }

  async chooseFirstPlacementRequest() {
    await this.page
      .getByRole('row')
      .filter({ has: this.page.getByText('Placement request') })
      .first()
      .getByRole('link')
      .click()
  }

  async choosePlacementRequestWithId(id: string) {
    const assessmentRows = this.page.getByRole('row').filter({ has: this.page.getByText('Placement request') })

    await assessmentRows
      .filter({ has: this.page.locator(`[data-cy-applicationId="${id}"]`) })
      .first()
      .getByRole('link')
      .click()
  }
}
