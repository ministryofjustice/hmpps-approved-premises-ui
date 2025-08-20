import { Page } from '@playwright/test'
import { addDays, addYears } from 'date-fns'
import { E2EDatesOfPlacement } from './assess'
import { ListPage, PlacementRequestPage } from '../pages/workflow'
import { ApprovedPremisesApplication as Application, Premises } from '../../server/@types/shared'
import { ApTypeLabel } from '../../server/utils/apTypeLabels'
import { SearchPage } from '../pages/match/searchPage'
import { BookingPage } from '../pages/match/bookingPage'
import { OccupancyViewPage } from '../pages/match/occupancyViewPage'
import { DateFormats } from '../../server/utils/dateUtils'
import { visitDashboard } from './signIn'
import { ReleaseTypeLabel } from '../../server/utils/applications/releaseTypeUtils'
import { ChangePlacementPage } from '../pages/manage/changePlacementPage'
import { datePartStrings } from '../utils'

export type E2EMatchAndBookResult = {
  premisesName: string
  premisesId: string
  newDatesOfPlacement: E2EDatesOfPlacement
}

export const matchAndBookApplication = async ({
  applicationId,
  page,
  datesOfPlacement,
  duration,
  apType,
  releaseType,
  preferredAps,
  preferredPostcode,
}: {
  applicationId: Application['id']
  page: Page
  datesOfPlacement: E2EDatesOfPlacement
  duration: string
  apType: ApTypeLabel
  releaseType: ReleaseTypeLabel
  preferredAps: Array<Premises['name']>
  preferredPostcode: string
}): Promise<E2EMatchAndBookResult> => {
  // Given I visit the Dashboard
  const dashboard = await visitDashboard(page)

  // And I click the link to the CRU Dashboard
  await dashboard.clickCruDashboard()

  let cruDashboard = new ListPage(page)

  // And I select the placement request
  await cruDashboard.choosePlacementApplicationWithId(applicationId)

  let placementRequestPage = new PlacementRequestPage(page)

  // And I click the 'Search for a space' button
  await placementRequestPage.clickSearchForASpace()

  // Then I should see the search screen
  const searchScreen = new SearchPage(page)

  // Should show details
  await searchScreen.shouldShowApplicationDetails({
    preferredAps,
    datesOfPlacement,
    duration,
    apType,
    preferredPostcode,
  })

  // And I click the 'Update' button
  await searchScreen.clickUpdate()

  // Should show details again
  await searchScreen.shouldShowApplicationDetails({
    preferredAps,
    datesOfPlacement,
    duration,
    apType,
    preferredPostcode,
  })

  // And I select an AP
  const premisesName = 'SWSC Men Premise 1'
  await searchScreen.selectAp(premisesName)

  // Then I should see the occupancy view screen for that AP
  const occupancyViewPage = await OccupancyViewPage.initialize(page, premisesName)

  // Should show details
  await occupancyViewPage.shouldShowMatchingDetails({
    datesOfPlacement,
    duration,
    releaseType,
  })

  // Then enter valid dates into the 'Book your placement' form and submit
  const dateToday = new Date()
  const oneYearFromNow = addYears(dateToday, 1)

  await occupancyViewPage.fillNamedDateField(datePartStrings(dateToday), 'arrivalDate')
  await occupancyViewPage.fillNamedDateField(datePartStrings(oneYearFromNow), 'departureDate')
  await occupancyViewPage.clickContinue()

  // Then I should see the booking screen for that AP
  const bookingPage = await BookingPage.initialize(page)

  // Should show the booking details (inc. new dates)
  const newDatesOfPlacement: E2EDatesOfPlacement = {
    startDate: DateFormats.dateObjToIsoDate(dateToday),
    endDate: DateFormats.dateObjToIsoDate(oneYearFromNow),
  }
  await bookingPage.shouldShowDatesOfPlacement(newDatesOfPlacement)

  // And I confirm the booking
  const premisesId = page.url().match(/space-bookings\/(.[^/]*)/)[1] // Path: /match/placement-requests/:id/space-bookings/:premisesId/new
  await bookingPage.clickConfirm()

  // Then I should see the Booked tab on the CRU dashboard
  cruDashboard = new ListPage(page)

  // And the placement should be listed
  await cruDashboard.findRowWithValues([
    DateFormats.isoDateToUIDate(datesOfPlacement.startDate, { format: 'short' }),
    premisesName,
    'Booked',
  ])

  // When I reopen the placement request to change the dates
  await cruDashboard.choosePlacementApplicationWithId(applicationId)

  placementRequestPage = new PlacementRequestPage(page)

  // And I click the 'Change placement' button
  await placementRequestPage.clickChangePlacement()

  // Then I should see the Change placement page
  const changePlacementPage = new ChangePlacementPage(page)

  // When I enter new dates for the placement
  const changedArrivalDate = addDays(dateToday, 1)
  const changedDepartureDate = addDays(oneYearFromNow, 1)
  await changePlacementPage.changePlacementDates(changedArrivalDate, changedDepartureDate)

  // Then I should see the placement request page with a success banner
  placementRequestPage = new PlacementRequestPage(page)

  await placementRequestPage.shouldShowSuccessBanner('Booking changed successfully')

  newDatesOfPlacement.startDate = DateFormats.dateObjToIsoDate(changedArrivalDate)
  newDatesOfPlacement.endDate = DateFormats.dateObjToIsoDate(changedDepartureDate)

  return { premisesName, premisesId, newDatesOfPlacement }
}
