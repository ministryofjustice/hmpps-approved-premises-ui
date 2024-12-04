import { Page, expect } from '@playwright/test'
import { ApplicationType } from '@approved-premises/e2e'
import { faker } from '@faker-js/faker'
import { addDays, addMonths } from 'date-fns'
import { BasePage } from '../basePage'

export class ApplyPage extends BasePage {
  static async initialize(page: Page, title?: string) {
    if (title) {
      await expect(page.locator('h1').first()).toContainText(title)
    }
    return new ApplyPage(page)
  }

  async fillReleaseDateField(applicationType: ApplicationType) {
    const today = new Date()

    let releaseDate: Date

    if (applicationType === 'emergency') {
      releaseDate = faker.date.between({ from: addDays(today, 1), to: addDays(today, 8) })
    } else if (applicationType === 'shortNotice') {
      releaseDate = faker.date.between({ from: addDays(today, 9), to: addDays(today, 29) })
    } else {
      releaseDate = faker.date.soon({ days: 30, refDate: addMonths(today, 7) })
    }

    const [year, month, day] = releaseDate.toISOString().split(/\D/)

    await this.fillDateField({ year, month, day })
  }

  async clickTab(title: string) {
    await this.page.getByRole('link', { name: title }).click()
  }

  async fillDurationField({ weeks, days }: { weeks: number; days: number }) {
    await this.page.getByLabel('Weeks', { exact: true }).first().fill(weeks.toString())
    await this.page.getByLabel('Days', { exact: true }).first().fill(days.toString())
  }
}
