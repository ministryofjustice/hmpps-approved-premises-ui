import { Page, expect } from '@playwright/test'
import { BasePage } from '../basePage'

export class ReportsPage extends BasePage {
  static async initialize(page: Page, title: string) {
    await expect(page.locator('h1')).toContainText(title)

    return new ReportsPage(page)
  }

  async downloadOutOfServiceBedsReports({ startDate, endDate }: { startDate: string; endDate: string }) {
    await this.checkRadio('Out of service beds')
    return this.downloadReports({ startDate, endDate })
  }

  async downloadDailyMetricsReports({ startDate, endDate }: { startDate: string; endDate: string }) {
    await this.checkRadio('Daily metrics')
    return this.downloadReports({ startDate, endDate })
  }

  async downloadReports({ startDate, endDate }: { startDate: string; endDate: string }) {
    await this.page.getByRole('textbox', { name: 'Start date' }).fill(startDate)
    await this.page.getByRole('textbox', { name: 'End date' }).fill(endDate)

    const downloadPromise = this.page.waitForEvent('download')
    await this.page.getByRole('button', { name: 'Download data' }).click()
    const download = await downloadPromise

    return download
  }
}
