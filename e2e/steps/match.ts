import { Page } from '@playwright/test'
import { visitDashboard } from './apply'
import { ConfirmPage, ConfirmationPage } from '../pages/match'
import { E2EDatesOfPlacement, E2EPlacementCharacteristics } from './assess'
import { ListPage, PlacementRequestPage } from '../pages/workflow'
import { ApprovedPremisesApplication as Application, Premises } from '../../server/@types/shared'
import { ApTypeLabel } from '../../server/utils/apTypeLabels'
import { SearchScreen } from '../pages/match/searchScreen'

export const confirmBooking = async (page: Page) => {
  const confirmPage = new ConfirmPage(page)
  await confirmPage.clickConfirm()
}

export const shouldShowBookingConfirmation = async (page: Page) => {
  const confirmationPage = new ConfirmationPage(page)
  await confirmationPage.shouldShowSuccessMessage()
}

export const matchAndBookApplication = async ({
  applicationId,
  page,
  datesOfPlacement,
  duration,
  apType,
  preferredAps,
  placementCharacteristics,
  preferredPostcode,
}: {
  applicationId: Application['id']
  page: Page
  datesOfPlacement: E2EDatesOfPlacement
  duration: string
  apType: ApTypeLabel
  preferredAps: Array<Premises['name']>
  preferredPostcode: string
  placementCharacteristics: E2EPlacementCharacteristics
}) => {
  // Given I visit the Dashboard
  const dashboard = await visitDashboard(page)

  // And I click the link to the CRU Dashboard
  await dashboard.clickCruDashboard()

  let cruDashboard = new ListPage(page)

  // And I select the placement request
  cruDashboard.choosePlacementApplicationWithId(applicationId)

  const placementRequestPage = new PlacementRequestPage(page)

  // And I click the 'Search for a space' button
  await placementRequestPage.clickSearchForASpace()

  // Then I should see the search screen
  const searchScreen = new SearchScreen(page)

  // Should show details
  searchScreen.shouldShowApplicationDetails({
    preferredAps,
    datesOfPlacement,
    duration,
    apType,
    preferredPostcode,
    placementCharacteristics,
  })

  // And I click the 'Update' button
  await searchScreen.clickUpdate()

  // Should show details again
  searchScreen.shouldShowApplicationDetails({
    preferredAps,
    datesOfPlacement,
    duration,
    apType,
    preferredPostcode,
    placementCharacteristics,
  })
}
