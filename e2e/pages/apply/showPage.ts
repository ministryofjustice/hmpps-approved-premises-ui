import { expect } from '@playwright/test'
import { BasePage } from '../basePage'
import { AppealApplicationPage } from './appealApplicationPage'

export class ShowPage extends BasePage {
  async createPlacementRequest(): Promise<void> {
    await this.clickPlacementRequestsTab()
    await this.page.getByRole('button', { name: 'Create placement request', exact: true }).click()
  }

  async clickPlacementRequestsTab(): Promise<void> {
    await this.page
      .getByLabel('Secondary navigation region')
      .getByRole('link', { name: 'Request for placement' })
      .click()
  }

  async appealApplication(): Promise<void> {
    await this.page.getByRole('button', { name: 'Actions' }).click()
    await this.page.getByRole('menuitem', { name: 'Process an appeal' }).click()

    const appealApplicationPage = new AppealApplicationPage(this.page)
    await appealApplicationPage.fillForm()
  }

  async withdrawPlacementApplication(): Promise<void> {
    await this.clickPlacementRequestsTab()
    await this.page.getByRole('link', { name: 'Withdraw' }).click()

    const typePage = new BasePage(this.page)
    await typePage.checkRadio('Request for placement')
    await typePage.clickContinue()

    const placementRequestsPage = new BasePage(this.page)
    await placementRequestsPage.page.getByRole('radio').first().click()
    await placementRequestsPage.clickContinue()

    const reasonPage = new BasePage(this.page)
    await reasonPage.page.getByRole('radio').first().click()
    await reasonPage.clickContinue()

    expect(this.page.getByRole('heading', { name: 'Placement application withdrawn' })).toBeTruthy()
  }

  async shouldShowAssessmentReopenedBanner(): Promise<void> {
    await expect(this.page.getByRole('alert')).toContainText('Assessment reopened')
  }
}
