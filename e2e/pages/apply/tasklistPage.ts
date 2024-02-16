import { BasePage } from '../basePage'

export class TasklistPage extends BasePage {
  async clickTask(taskName: string) {
    await this.page.getByRole('link', { name: taskName }).click()
  }

  async submitApplication() {
    await this.page.getByLabel('I confirm the information provided is complete, accurate and up to date.').check()
    await this.page.getByRole('button', { name: 'Submit application' }).click()
  }
}
