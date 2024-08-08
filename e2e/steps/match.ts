import { Page } from '@playwright/test'
import { TestOptions } from '@approved-premises/e2e'
import { visitDashboard } from './apply'
import { ConfirmPage, ConfirmationPage } from '../pages/match'

export const confirmBooking = async (page: Page) => {
  const confirmPage = new ConfirmPage(page)
  await confirmPage.clickConfirm()
}

export const shouldShowBookingConfirmation = async (page: Page) => {
  const confirmationPage = new ConfirmationPage(page)
  await confirmationPage.shouldShowSuccessMessage()
}

export const matchAndBookApplication = async ({ page, person }: { page: Page; person: TestOptions['person'] }) => {
  // Given I visit the Dashboard
  const dashboard = await visitDashboard(page)

  // And I click the link to the CRU Dashboard
  await dashboard.clickCruDashboard()

  // And I confirm my booking
  await confirmBooking(page)
}
