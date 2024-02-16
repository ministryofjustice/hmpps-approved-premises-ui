import { getDate, getMonth, getYear } from 'date-fns'
import { Page, expect } from '@playwright/test'
import { BasePage } from '../basePage'

export class NonarrivalFormPage extends BasePage {
  static async initialize(page: Page, title?: string) {
    if (title) {
      await expect(page.locator('h1')).toContainText(title)
    }
    return new NonarrivalFormPage(page)
  }

  async completeExpectedArrivalDate() {
    await this.page
      .getByRole('group', { name: 'What was the expected arrival date?' })
      .getByLabel('Day')
      .fill(getDate(new Date()).toString())
    await this.page
      .getByRole('group', { name: 'What was the expected arrival date?' })
      .getByLabel('Month')
      .fill((getMonth(new Date()) + 1).toString())
    await this.page
      .getByRole('group', { name: 'What was the expected arrival date?' })
      .getByLabel('Year')
      .fill(getYear(new Date()).toString())
  }

  async selectReason() {
    await this.page.getByText('Failed to Arrive').click()
  }

  async completeForm() {
    await this.completeExpectedArrivalDate()
    await this.selectReason()
    await this.clickSubmit()
  }
}
