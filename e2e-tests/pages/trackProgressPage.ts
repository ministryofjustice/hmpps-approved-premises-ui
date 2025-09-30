/* eslint max-classes-per-file: "off" -- splitting out these classes would cause an import dependency loop */

import { Locator, Page, expect } from '@playwright/test'
import BasePage from './basePage'

export default class TrackProgressPage extends BasePage {
  readonly expect: TrackProgressPageAssertions

  readonly fromDayFieldLocator: Locator

  readonly fromMonthFieldLocator: Locator

  readonly fromYearFieldLocator: Locator

  readonly toDayFieldLocator: Locator

  readonly toMonthFieldLocator: Locator

  readonly toYearFieldLocator: Locator

  readonly searchButtonLocator: Locator

  readonly resultItemsLocator: Locator

  constructor(page: Page) {
    super(page)
    this.expect = new TrackProgressPageAssertions(this)

    this.fromDayFieldLocator = page.getByLabel('day').nth(0)
    this.fromMonthFieldLocator = page.getByLabel('month').nth(0)
    this.fromYearFieldLocator = page.getByLabel('year').nth(0)
    this.toDayFieldLocator = page.getByLabel('day').nth(1)
    this.toMonthFieldLocator = page.getByLabel('month').nth(1)
    this.toYearFieldLocator = page.getByLabel('year').nth(1)
    this.searchButtonLocator = page.getByRole('button', { name: 'Search' })
    this.resultItemsLocator = page.getByRole('table').getByRole('row')
  }

  async completeSearchForm() {
    await this.fromDayFieldLocator.fill('07')
    await this.fromMonthFieldLocator.fill('08')
    await this.fromYearFieldLocator.fill('2025')
    await this.toDayFieldLocator.fill('09')
    await this.toMonthFieldLocator.fill('10')
    await this.toYearFieldLocator.fill('2025')
  }

  resultCount(): Promise<number> {
    return this.resultItemsLocator.count()
  }

  async submitForm() {
    await this.searchButtonLocator.click()
  }
}

class TrackProgressPageAssertions {
  constructor(private readonly page: TrackProgressPage) {}

  async toBeOnThePage() {
    await expect(this.page.headingLocator).toContainText('Track progress on Community Payback')
  }

  async toSeeResults() {
    const resultCount = await this.page.resultCount()
    expect(resultCount).toBeGreaterThan(1)
  }
}
