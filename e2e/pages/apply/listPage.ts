import { expect } from '@playwright/test'
import { BasePage } from '../basePage'

export class ListPage extends BasePage {
  async startApplication() {
    await this.page.getByRole('button', { name: 'Start now' }).click()
  }

  async clickSubmitted(): Promise<void> {
    await this.page.getByRole('tab', { name: 'Submitted' }).click()
  }

  async clickApplicationWithId(applicationId: string): Promise<void> {
    await this.page
      .getByRole('rowheader')
      .filter({ has: this.page.locator(`[data-cy-id="${applicationId}"]`) })
      .first()
      .getByRole('link')
      .click()
  }

  async filterApplicationsBy(option: string) {
    await this.selectAllApplications()
    await this.page.getByLabel('Statuses').selectOption({ label: option })
    await this.page.getByRole('button', { name: 'Apply filters' }).click()
  }

  async selectAllApplications(): Promise<void> {
    await this.page.getByRole('link', { name: 'All applications' }).click()
  }

  async shouldShowWithdrawalConfirmationMessage() {
    await expect(this.page.getByRole('alert', { name: 'Success' })).toContainText('Success')
    await expect(this.page.getByRole('heading', { name: 'Application withdrawn' })).toContainText(
      'Application withdrawn',
    )
  }

  async shouldShowWithdrawnApplication(applicationId: string) {
    // If there are multiple pages of applications, click through them to find the withdrawn application
    await this.clickNextPage()

    await expect(
      this.page.getByRole('row').filter({ has: this.page.locator(`[data-cy-id="${applicationId}"]`) }),
    ).toContainText('Application withdrawn')
  }

  async clickNextPage() {
    if (await this.page.getByRole('link', { name: 'Next' }).isVisible()) {
      await this.page.getByRole('link', { name: 'Next page' }).click()
      await this.clickNextPage()
    }
  }
}
