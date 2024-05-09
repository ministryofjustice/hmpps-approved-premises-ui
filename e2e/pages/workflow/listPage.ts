/* eslint-disable no-await-in-loop */
import { expect } from '@playwright/test'
import { BasePage } from '../basePage'

export class ListPage extends BasePage {
  async getAssignmentWithId(id: string, isAllocated: boolean) {
    if (!isAllocated) {
      await this.page
        .getByRole('link')
        .filter({ has: this.page.getByText('Unallocated') })
        .first()
        .click()
    }

    return this.getAssessmentRow(id)
  }

  async getAssessmentRow(id: string) {
    const assessmentRow = this.page
      .getByRole('row')
      .filter({ has: this.page.getByText('Assessment') })
      .filter({ has: this.page.locator(`[data-cy-applicationId="${id}"]`) })
    const nextLink = this.page.getByRole('link', { name: 'Next' })

    try {
      await expect(assessmentRow).toBeVisible()
    } catch (err) {
      try {
        await expect(nextLink).toBeVisible()
      } catch {
        throw err
      }
      await nextLink.click()
      await this.getAssessmentRow(id)
    }

    return assessmentRow.first()
  }

  async chooseAssessmentWithId(id: string, isAllocated: boolean) {
    const row = await this.getAssignmentWithId(id, isAllocated)

    await row.getByRole('link').click()
  }

  async shouldHaveCorrectDeadlineAndAllocation(id: string, expectedDeadlineInDays: number, user?: string | null) {
    const row = await this.getAssignmentWithId(id, !!user)

    // Either 'Today' or 'X days'
    const actualDeadline: string = await row.locator('td').nth(0).innerText()

    // Either 'Today' or 'X' where X is the number of days
    const numberOfDaysOrToday: string = actualDeadline.split(' ')[0]

    const actualDeadlineInDays: number = numberOfDaysOrToday === 'Today' ? 0 : Number(numberOfDaysOrToday)

    expect(actualDeadlineInDays).toBeGreaterThanOrEqual(expectedDeadlineInDays)
    expect(actualDeadlineInDays).toBeLessThanOrEqual(expectedDeadlineInDays + 4)

    if (user) {
      await expect(row.locator('td').nth(1)).toContainText(user)
    }
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
