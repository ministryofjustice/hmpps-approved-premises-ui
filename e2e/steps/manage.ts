import { Page } from '@playwright/test'
import { E2EDatesOfPlacement } from './assess'
import { DateFormats } from '../../server/utils/dateUtils'
import { SpaceBookingPage } from '../pages/manage/spaceBookingPage'
import { PremisesPage } from '../pages/manage/premisesPage'
import { PremisesListPage } from '../pages/manage/premisesListPage'
import { EditKeyworkerPage } from '../pages/manage/editKeyworkerPage'
import { visitDashboard } from './signIn'

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
  await assignKeyWorker({ page, datesOfPlacement })
}

export const assignKeyWorker = async ({
  page,
  datesOfPlacement,
}: {
  page: Page
  datesOfPlacement: E2EDatesOfPlacement
}) => {
  // When I open the page for a given placement
  const bookingPage = await SpaceBookingPage.initialize(page, datesOfPlacement)

  // And I click on 'Assign keyworker'
  await bookingPage.clickEditKeyworker()

  // Then I see the page to edit the keyworker
  const editKeyworkerPage = await EditKeyworkerPage.initialize(page, 'Edit keyworker details')

  // When I assign a new keyworker
  const { keyworkerName } = await editKeyworkerPage.selectKeyworker()

  // Then I should see the placement page with a success banner
  await bookingPage.shouldShowSuccessBanner('Keyworker assigned')

  // And the details should show the assigned keyworker
  await bookingPage.shouldShowPlacementDetail('Key worker', keyworkerName)
}
