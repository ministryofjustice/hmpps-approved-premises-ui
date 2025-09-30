/* eslint max-classes-per-file: "off" -- splitting out these classes would cause an import dependency loop */

import { Locator, Page, expect } from '@playwright/test'
import BasePage from './basePage'

export default class HomePage extends BasePage {
  readonly expect: HomePageAssertions

  readonly trackCommunityPaybackProgressLink: Locator

  constructor(private readonly page: Page) {
    super(page)
    this.expect = new HomePageAssertions(this)
    this.trackCommunityPaybackProgressLink = page.getByRole('link', { name: 'Track progress on Community Payback' })
  }

  async visit() {
    await this.page.goto('/')
  }
}

class HomePageAssertions {
  constructor(private readonly page: HomePage) {}

  async toBeOnThePage() {
    await expect(this.page.headingLocator).toContainText('Community Payback')
  }
}
