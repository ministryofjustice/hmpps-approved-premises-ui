import { expect } from '@playwright/test'
import { BasePage } from '../basePage'

export class ListPage extends BasePage {
  async clickFirstAssessment(personName: string) {
    await this.page.getByRole('link', { name: personName }).first().click()
  }

  async clickAssessmentWithApplicationId(applicationId: string) {
    const assessmentRow = this.page
      .getByRole('row')
      .filter({ has: this.page.locator(`[data-cy-applicationid="${applicationId}"]`) })
      .first()
      .getByRole('link')
    const nextLink = this.page.getByRole('link', { name: 'Next' })

    try {
      await expect(assessmentRow).toBeVisible({ timeout: 1000 })
      await assessmentRow.click()
    } catch (err) {
      try {
        await expect(nextLink).toBeVisible()
      } catch {
        throw err
      }
      await nextLink.click()
      await this.clickAssessmentWithApplicationId(applicationId)
    }
  }
}
