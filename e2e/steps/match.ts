import { Page } from '@playwright/test'
import { visitDashboard } from './apply'
import { E2EDatesOfPlacement } from './assess'
import { ListPage, PlacementRequestPage } from '../pages/workflow'
import { ApprovedPremisesApplication as Application, Premises } from '../../server/@types/shared'
import { ApTypeLabel } from '../../server/utils/apTypeLabels'
import { SearchScreen } from '../pages/match/searchScreen'
import { BookingScreen } from '../pages/match/bookingScreen'
import { OccupancyViewScreen } from '../pages/match/occupancyViewScreen'

export const matchAndBookApplication = async ({
  applicationId,
  page,
  datesOfPlacement,
  duration,
  apType,
  preferredAps,
  preferredPostcode,
}: {
  applicationId: Application['id']
  page: Page
  datesOfPlacement: E2EDatesOfPlacement
  duration: string
  apType: ApTypeLabel
  preferredAps: Array<Premises['name']>
  preferredPostcode: string
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
  })

  // And I select an AP
  const premisesName = await searchScreen.retrieveFirstAPName()
  await searchScreen.selectFirstAP()

  // Then I should see the occupancy view screen for that AP
  const occupancyViewScreen = await OccupancyViewScreen.initialize(page, premisesName)
  // And I continue to booking
  await occupancyViewScreen.clickContinue()

  // Then I should see the booking screen for that AP
  const bookingScreen = await BookingScreen.initialize(page, premisesName)

  // Should show the booking details
  await bookingScreen.shouldShowDatesOfPlacement(datesOfPlacement)

  // And I confirm the booking
  await bookingScreen.clickConfirm()

  // Then I should see the CRU dashboard matched tab
  cruDashboard = new ListPage(page)
}
