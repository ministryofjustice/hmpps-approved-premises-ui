import { getDate, getMonth, getYear } from 'date-fns'
import { Page, expect } from '@playwright/test'
import { BasePage } from '../basePage'

export class CancellationPage extends BasePage {
  static async initialize(page: Page, title?: string) {
    if (title) {
      await expect(page.locator('h1')).toContainText(title)
    }
    return new CancellationPage(page)
  }

  async enterCancellationDate() {
    const cancellationLabel = 'What is the date of withdrawal?'
    await this.page
      .getByRole('group', { name: cancellationLabel })
      .getByLabel('Day')
      .fill(getDate(new Date()).toString())
    await this.page
      .getByRole('group', { name: cancellationLabel })
      .getByLabel('Month')
      .fill((getMonth(new Date()) + 1).toString())
    await this.page
      .getByRole('group', { name: cancellationLabel })
      .getByLabel('Year')
      .fill(getYear(new Date()).toString())
  }

  async fillInNotes() {
    await this.page.getByLabel('Additional notes').fill('Test cancellation')
  }

  async completeForm() {
    await this.enterCancellationDate()
    await this.checkRadio('The placement is being transferred')
    await this.fillInNotes()
  }
}
