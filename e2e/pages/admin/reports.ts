import { Page, expect } from '@playwright/test'
import { BasePage } from '../basePage'

export class ReportsPage extends BasePage {
  static async initialize(page: Page, title: string) {
    await expect(page.locator('h1')).toContainText(title)

    return new ReportsPage(page)
  }

  async downloadOutOfServiceBedsReports({ month, year }: { month: string; year: string }) {
    await this.checkRadio('Out of service beds')
    return this.downloadReports({ month, year })
  }

  async downloadDailyMetricsReports({ month, year }: { month: string; year: string }) {
    await this.checkRadio('Daily metrics')
    return this.downloadReports({ month, year })
  }

  async downloadReports({ month, year }: { month: string; year: string }) {
    await this.page.getByRole('combobox', { name: 'Month' }).selectOption({ index: Number(month) })
    await this.page.getByRole('combobox', { name: 'Year' }).selectOption({ label: year })

    const downloadPromise = this.page.waitForEvent('download')
    await this.page.getByRole('button', { name: 'Download data' }).click()
    const download = await downloadPromise

    return download
  }
}
