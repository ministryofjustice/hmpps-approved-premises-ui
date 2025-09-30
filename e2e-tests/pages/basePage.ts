import { Locator, Page } from '@playwright/test'

export default class BasePage {
  readonly headingLocator: Locator

  constructor(page: Page) {
    this.headingLocator = page.getByRole('heading', { level: 1 })
  }
}
