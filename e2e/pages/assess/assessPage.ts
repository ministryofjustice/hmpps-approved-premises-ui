import { Page, expect } from '@playwright/test'
import { BasePage } from '../basePage'

export class AssessPage extends BasePage {
  static async initialize(page: Page, title?: string) {
    if (title) {
      await expect(page.locator('h1')).toContainText(title)
    }
    return new AssessPage(page)
  }

  async checkListOfRequirements(
    requirements: Array<string>,
    relevancy: 'essential' | 'desirable' | 'notRelevant' | 'relevant',
  ) {
    for (const requirement of requirements) {
      // eslint-disable-next-line no-await-in-loop
      await this.checkRequirement(requirement, relevancy)
    }
  }

  async checkRequirement(requirement: string, status: string) {
    await this.checkRadio(`${requirement} ${status}`)
  }
}
