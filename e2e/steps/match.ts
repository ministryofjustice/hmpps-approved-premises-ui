import { Page } from '@playwright/test'
import { addYears } from 'date-fns'
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

  const placementRequestPage = new PlacementRequestPage(page)

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
  const premisesName = await searchScreen.retrieveFirstAPName()
  await searchScreen.selectFirstAP()

  // Then I should see the occupancy view screen for that AP
  const occupancyViewPage = await OccupancyViewPage.initialize(page, premisesName)

  // Should show details
  await occupancyViewPage.shouldShowMatchingDetails({
    datesOfPlacement,
    duration,
    releaseType,
  })

  // Then enter valid dates into the 'Book you placement' form and submit
  const { today, oneYearFromNow } = todayAndOneYearFromNow()
  await occupancyViewPage.fillNamedDateField(today, 'arrivalDate')
  await occupancyViewPage.fillNamedDateField(oneYearFromNow, 'departureDate')
  await occupancyViewPage.clickContinue()

  // Then I should see the booking screen for that AP
  const bookingPage = await BookingPage.initialize(page, premisesName)

  // Should show the booking details (inc. new dates)
  const newDatesOfPlacement: E2EDatesOfPlacement = {
    startDate: `${today.year}-${today.month}-${today.day}`,
    endDate: `${oneYearFromNow.year}-${oneYearFromNow.month}-${oneYearFromNow.day}`,
  }
  await bookingPage.shouldShowDatesOfPlacement(newDatesOfPlacement)

  // And I confirm the booking
  const premisesId = page.url().match(/premisesId=(.[^&]*)/)[1] // premisesId=338e22f3-70be-4519-97ab-f08c6c2dfb0b
  await bookingPage.clickConfirm()

  // Then I should see the Matched tab on the CRU dashboard
  cruDashboard = new ListPage(page)

  // And the placement should be listed
  await cruDashboard.findRowWithValues([
    DateFormats.isoDateToUIDate(datesOfPlacement.startDate, { format: 'short' }),
    premisesName,
    'Matched',
  ])

  return { premisesName, premisesId, newDatesOfPlacement }
}

export const todayAndOneYearFromNow = () => {
  const dateToday = new Date()
  const dateOneYearFromNow = addYears(dateToday, 1)
  return {
    today: {
      year: dateToday.getFullYear().toString(),
      month: (dateToday.getMonth() + 1).toString(),
      day: dateToday.getDate().toString(),
    },
    oneYearFromNow: {
      year: dateOneYearFromNow.getFullYear().toString(),
      month: (dateOneYearFromNow.getMonth() + 1).toString(),
      day: dateOneYearFromNow.getDate().toString(),
    },
  }
}
