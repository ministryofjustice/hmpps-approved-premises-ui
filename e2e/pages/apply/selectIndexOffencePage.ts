import { expect } from '@playwright/test'
import { BasePage } from '../basePage'

export class SelectIndexOffencePage extends BasePage {
  async selectFirstOffence() {
    await expect(this.page.getByRole('heading', { name: /Select index offence for/i })).toBeVisible()
    await this.page.locator('input[name="offenceId"]').first().check()
  }
}
