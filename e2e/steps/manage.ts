import { Page } from '@playwright/test'
import { E2EDatesOfPlacement } from './assess'
import { DateFormats } from '../../server/utils/dateUtils'
import { SpaceBookingPage } from '../pages/manage/spaceBookingPage'
import { PremisesPage } from '../pages/manage/premisesPage'
import { PremisesListPage } from '../pages/manage/premisesListPage'
import { EditKeyworkerPage } from '../pages/manage/editKeyworkerPage'
import { visitDashboard } from './signIn'
import { RecordArrivalPage } from '../pages/manage/recordArrivalPage'
import { RecordDeparturePage } from '../pages/manage/recordDeparturePage'

export const manageBooking = async ({
  page,
  premisesName,
  datesOfPlacement,
}: {
  page: Page
  premisesName: string
  datesOfPlacement: E2EDatesOfPlacement
}) => {
  // Process a booking: assign key worker, record arrival, record departure

  // Given I visit the Dashboard
  const dashboard = await visitDashboard(page)

  // And I click the link to Manage
  await dashboard.clickManage()

  // When I view the list of premises
  const premisesListPage = new PremisesListPage(page)

  // And I open the page for the given premises
  await premisesListPage.choosePremises(premisesName)

  // Then I see the page for the given premises
  const premisesPage = await PremisesPage.initialize(page, premisesName)

  // And I select the upcoming tab
  await premisesPage.clickTab('Upcoming')

  // And I can see the placement in the list of upcoming placements
  const bookingRow = await premisesPage.findRowWithValues([
    DateFormats.isoDateToUIDate(datesOfPlacement.startDate, { format: 'short' }),
    DateFormats.isoDateToUIDate(datesOfPlacement.endDate, { format: 'short' }),
  ])

  // When I open the placement
  await premisesPage.openBookingFromRow(bookingRow)

  // Then I see the placement details page
  await SpaceBookingPage.initialize(page, datesOfPlacement)

  // Then I can assign a keyworker
  await assignKeyWorker({ page })

  // And I can record the person's arrival
  await recordArrival({ page })

  // And I can record the person's departure
  await recordDeparture({ page })
}

export const assignKeyWorker = async ({ page }: { page: Page }) => {
  // When I open the page for a given placement
  const bookingPage = await SpaceBookingPage.initialize(page)

  // And I click on the 'Edit keyworker' action
  await bookingPage.clickAction('Edit keyworker')

  // Then I see the page to edit the keyworker
  const editKeyworkerPage = await EditKeyworkerPage.initialize(page, 'Edit keyworker details')

  // When I assign a new keyworker
  const { keyworkerName } = await editKeyworkerPage.selectKeyworker()

  // Then I should see the placement page with a success banner
  await bookingPage.shouldShowSuccessBanner('Keyworker assigned')

  // And the details should show the assigned keyworker
  await bookingPage.shouldShowSummaryItem('Key worker', keyworkerName)
}

export const recordArrival = async ({ page }: { page: Page }) => {
  // When I open the page for a given placement
  const bookingPage = await SpaceBookingPage.initialize(page)

  // And I click on the 'Record arrival' action
  await bookingPage.clickAction('Record arrival')

  // Then I see the page to record the arrival
  const recordArrivalPage = await RecordArrivalPage.initialize(page, 'Record someone as arrived')

  // When I record the person as arrived
  const { arrivalDateTime } = await recordArrivalPage.recordArrival()

  // Then I should see the placement page with a success banner
  await recordArrivalPage.shouldShowSuccessBanner('You have recorded this person as arrived')

  // And the details should show the recorded arrival
  await recordArrivalPage.shouldShowSummaryItem('Actual arrival date', DateFormats.dateObjtoUIDate(arrivalDateTime))
  await recordArrivalPage.shouldShowSummaryItem('Arrival time', DateFormats.timeFromDate(arrivalDateTime))
}

const recordDeparture = async ({ page }: { page: Page }) => {
  // When I open the page for a given placement
  const bookingPage = await SpaceBookingPage.initialize(page)

  // And I click on the 'Record departure' action
  await bookingPage.clickAction('Record departure')

  // Then I see the page to record the arrival
  const recordDeparturePage = await RecordDeparturePage.initialize(page, 'Record a departure')

  // When I record the person as arrived
  const { departureDateTime, reason, notes } = await recordDeparturePage.recordDeparture()

  // Then I should see the placement page with a success banner
  await recordDeparturePage.shouldShowSuccessBanner('You have recorded this person as departed')

  // And the details should show the recorded arrival
  await recordDeparturePage.shouldShowSummaryItem(
    'Actual departure date',
    DateFormats.dateObjtoUIDate(departureDateTime),
  )
  await recordDeparturePage.shouldShowSummaryItem('Departure time', DateFormats.timeFromDate(departureDateTime))
  await recordDeparturePage.shouldShowSummaryItem('Departure reason', reason)
  await recordDeparturePage.shouldShowSummaryItem('More information', notes)
}
