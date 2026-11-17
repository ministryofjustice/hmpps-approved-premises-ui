import { expect } from '@playwright/test'
import { PaginatedPage } from '../paginatedPage'

export class ListPage extends PaginatedPage {
  async getAssignmentWithId(id: string, isAllocated: boolean, crn?: string) {
    await this.updateAreaFilter(crn)
    if (!isAllocated) {
      await this.page
        .getByRole('link')
        .filter({ has: this.page.getByText('Unallocated') })
        .first()
        .click()
    }

    if (crn) {
      await this.sortDescendingBy('createdAt')
    }

    return this.getAssessmentRow(id, crn)
  }

  async sortDescendingBy(field: string) {
    const url = new URL(this.page.url())
    url.searchParams.set('sortBy', field)
    url.searchParams.set('sortDirection', 'desc')
    await this.page.goto(url.toString())
  }

  async getAssessmentRow(id: string, crn?: string) {
    const assessmentRow = this.page
      .getByRole('row')
      .filter({ has: this.page.getByText('Assessment') })
      .filter({ has: this.page.locator(`[data-cy-applicationId="${id}"]`) })
      .first()

    if (crn) {
      await expect(assessmentRow).toBeVisible()
      return assessmentRow
    }

    return this.tryNextPageUntilFound(assessmentRow)
  }

  async chooseAssessmentWithId(id: string, isAllocated: boolean, crn?: string) {
    const row = await this.getAssignmentWithId(id, isAllocated, crn)

    await row.getByRole('link').click()
  }

  async shouldHaveCorrectDeadlineAndAllocation(
    id: string,
    expectedDeadlineInDays: number,
    user?: string | null,
    crn?: string,
  ) {
    const row = await this.getAssignmentWithId(id, !!user, crn)

    // Either 'Today' or 'X days'
    const actualDeadline: string = await row.locator('td').nth(0).innerText()

    // Either 'Today' or 'X' where X is the number of days
    const numberOfDaysOrToday: string = actualDeadline.split(' ')[0]

    const actualDeadlineInDays: number = numberOfDaysOrToday === 'Today' ? 0 : Number(numberOfDaysOrToday)

    expect(actualDeadlineInDays).toBeGreaterThanOrEqual(expectedDeadlineInDays)
    expect(actualDeadlineInDays).toBeLessThanOrEqual(expectedDeadlineInDays + 4)

    if (user) {
      await expect(row.locator('td').nth(2)).toContainText(user)
    }
  }

  async updateAreaFilter(crn?: string) {
    await this.page.getByLabel('AP area').selectOption({ label: 'All areas' })
    if (crn) {
      await this.page.getByLabel('CRN or Name').fill(crn)
    }
    await this.page.getByRole('button', { name: 'Apply filters' }).click()
  }

  async choosePlacementApplicationWithId(id: string, crn?: string) {
    if (crn) {
      await this.updateAreaFilter(crn)
      await this.sortDescendingBy('createdAt')
    }

    const placementApplication = this.page
      .getByRole('row')
      .filter({ has: this.page.locator(`[data-cy-applicationId="${id}"]`) })
      .first()
      .getByRole('link')

    if (crn) {
      await expect(placementApplication).toBeVisible()
      return placementApplication.click()
    }

    return (await this.tryNextPageUntilFound(placementApplication)).click()
  }

  async searchCruDashboardByCrn(crn: string) {
    await this.page.getByRole('link', { name: 'Search' }).click()
    await this.page.getByLabel('Find a placement').fill(crn)
    await this.page.getByRole('button', { name: 'Apply filters' }).click()

    await this.sortDescendingBy('created_at')
  }

  async choosePlacementApplicationWithCrn(id: string, crn: string) {
    await this.searchCruDashboardByCrn(crn)

    const placementApplication = this.page
      .getByRole('row')
      .filter({ has: this.page.locator(`[data-cy-applicationId="${id}"]`) })
      .first()
      .getByRole('link')

    await expect(placementApplication).toBeVisible()
    return placementApplication.click()
  }

  async findRowWithValuesSortedByCreatedAt(values: Array<string>) {
    await this.sortDescendingBy('created_at')

    let row = this.page.getByRole('row')

    values.forEach(value => {
      row = row.filter({ hasText: value })
    })

    const foundRow = row.first()
    await expect(foundRow).toBeVisible()
    return foundRow
  }
}
