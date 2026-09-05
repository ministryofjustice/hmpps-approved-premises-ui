/* eslint-disable import/no-extraneous-dependencies */
import { Page } from '@playwright/test'
import {
  login as loginOasys,
  UserType,
} from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/oasys/login.mjs'

export const loginOasysWithRetry = async (page: Page, attempt = 1): Promise<void> => {
  try {
    await loginOasys(page, UserType.Booking)
  } catch (error) {
    const isServiceUnavailable = await page
      .getByRole('heading', { name: '503 Service Temporarily Unavailable' })
      .isVisible()
      .catch(() => false)

    if (!isServiceUnavailable || attempt >= 3) {
      throw error
    }

    await page.waitForTimeout(5_000)
    await loginOasysWithRetry(page, attempt + 1)
  }
}
