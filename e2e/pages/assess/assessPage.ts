import { Page, expect } from '@playwright/test'
import { BasePage } from '../basePage'

export class AssessPage extends BasePage {
  static async initialize(page: Page, title?: string) {
    if (title) {
      await expect(page.locator('h1')).toContainText(title)
    }
    return new AssessPage(page)
  }

  checkListOfRequirements(
    requirements: Array<string>,
    relevancy: 'essential' | 'desirable' | 'notRelevant' | 'relevant',
  ) {
    return Promise.all(
      requirements.map(async requirement => {
        await this.checkRequirement(requirement, relevancy)
      }),
    )
  }

  async checkRequirement(requirement: string, status: string) {
    await this.checkRadio(`${requirement} ${status}`)
  }
}
