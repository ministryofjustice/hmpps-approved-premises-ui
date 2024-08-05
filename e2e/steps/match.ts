import { Page } from '@playwright/test'
import { TestOptions } from '@approved-premises/e2e'
import { visitDashboard } from './apply'
import { ConfirmPage, ConfirmationPage } from '../pages/match'
import { CruDashboard } from '../pages/match/cruDashboard'
import { E2EDatesOfPlacement } from './assess'
import { PlacementRequestPage } from '../pages/workflow'

export const confirmBooking = async (page: Page) => {
  const confirmPage = new ConfirmPage(page)
  await confirmPage.clickConfirm()
}

export const shouldShowBookingConfirmation = async (page: Page) => {
  const confirmationPage = new ConfirmationPage(page)
  await confirmationPage.shouldShowSuccessMessage()
}

export const matchAndBookApplication = async ({
  page,
  person,
  datesOfPlacement,
  duration,
  isParole,
  applicationDate,
}: {
  page: Page
  person: TestOptions['person']
  datesOfPlacement: E2EDatesOfPlacement
  duration: string
  isParole: boolean
  applicationDate: string
}) => {
  // Given I visit the Dashboard
  const dashboard = await visitDashboard(page)

  // And I click the link to the CRU Dashboard
  await dashboard.clickCruDashboard()

  const cruDashboard = new CruDashboard(page)

  // And I select the placement request
  cruDashboard.selectPlacementRequest({
    applicationDate,
    person,
    arrivalDate: datesOfPlacement.startDate,
    isParole,
    lengthOfStay: duration,
  })

  const placementRequestPage = new PlacementRequestPage(page)
}
