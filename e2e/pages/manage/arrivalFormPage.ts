import { addMonths, getDate, getMonth, getYear } from 'date-fns'
import { Page, expect } from '@playwright/test'
import { BasePage } from '../basePage'

export class ArrivalFormPage extends BasePage {
  static async initialize(page: Page, title?: string) {
    if (title) {
      await expect(page.locator('h1')).toContainText(title)
    }
    return new ArrivalFormPage(page)
  }

  async completeArrivalDate() {
    await this.page
      .getByRole('group', { name: 'What is the arrival date?' })
      .getByLabel('Day')
      .fill(getDate(new Date()).toString())
    await this.page
      .getByRole('group', { name: 'What is the arrival date?' })
      .getByLabel('Month')
      .fill((getMonth(new Date()) + 1).toString())
    await this.page
      .getByRole('group', { name: 'What is the arrival date?' })
      .getByLabel('Year')
      .fill(getYear(new Date()).toString())
  }

  async completeArrivalTime() {
    await this.page.getByLabel('What is the time of arrival?').fill('12:30')
  }

  async completeExpectedDepartureDate() {
    const newDate = addMonths(new Date(), 1)

    await this.page
      .getByRole('group', { name: 'What is their expected departure date?' })
      .getByLabel('Day')
      .fill(getDate(newDate).toString())
    await this.page
      .getByRole('group', { name: 'What is their expected departure date?' })
      .getByLabel('Month')
      .fill((getMonth(newDate) + 1).toString())
    await this.page
      .getByRole('group', { name: 'What is their expected departure date?' })
      .getByLabel('Year')
      .fill(getYear(newDate).toString())
  }

  async selectKeyWorker() {
    await this.page.getByRole('combobox', { name: 'Key Worker' }).selectOption({ index: 1 })
  }

  async completeForm() {
    await this.completeArrivalDate()
    await this.completeArrivalTime()
    await this.completeExpectedDepartureDate()
    await this.selectKeyWorker()
    await this.clickSubmit()
  }
}
