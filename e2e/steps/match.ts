import { Page } from '@playwright/test'
import { E2EDatesOfPlacement } from './assess'
import { ListPage, PlacementRequestPage } from '../pages/workflow'
import { ApprovedPremisesApplication as Application, Premises } from '../../server/@types/shared'
import { ApTypeLabel } from '../../server/utils/apTypeLabels'
import { SearchScreen } from '../pages/match/searchScreen'
import { BookingScreen } from '../pages/match/bookingScreen'
import { OccupancyViewScreen } from '../pages/match/occupancyViewScreen'
import { DateFormats } from '../../server/utils/dateUtils'
import { visitDashboard } from './signIn'

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
  await cruDashboard.choosePlacementApplicationWithId(applicationId)

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
  const premisesId = page.url().match(/premisesId=(.[^&]*)/)[1] // premisesId=338e22f3-70be-4519-97ab-f08c6c2dfb0b
  await bookingScreen.clickConfirm()

  // Then I should see the Matched tab on the CRU dashboard
  cruDashboard = new ListPage(page)

  // And the placement should be listed
  await cruDashboard.findRowWithValues([
    DateFormats.isoDateToUIDate(datesOfPlacement.startDate, { format: 'short' }),
    premisesName,
    'Matched',
  ])

  return { premisesName, premisesId }
}
