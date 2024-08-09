import { Page, expect } from '@playwright/test'
import { BasePage } from '../basePage'

export class ReportsPage extends BasePage {
  static async initialize(page: Page, title: string) {
    await expect(page.locator('h1')).toContainText(title)

    return new ReportsPage(page)
  }

  async downloadLostBedsReports({ month, year }: { month: string; year: string }) {
    await this.checkRadio('Lost beds (no longer in use)')
    return this.downloadReports({ month, year })
  }

  async downloadApplicationsReports({ month, year }: { month: string; year: string }) {
    await this.checkRadio('Raw combined applications and placement requests')
    return this.downloadReports({ month, year })
  }

  async downloadRawRequestsForPlacementsReports({ month, year }: { month: string; year: string }) {
    await this.checkRadio('Raw requests for placement')
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
