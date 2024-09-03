import { Page } from '@playwright/test'
import { TestOptions } from '@approved-premises/e2e'
import { test } from '../test'
import { visitDashboard } from '../steps/apply'
import { PremisesListPage } from '../pages/manage/premisesListPage'
import { PremisesPage } from '../pages/manage/premisesPage'
import { PlacementPage } from '../pages/manage/placementPage'
import { BedsPage } from '../pages/manage/bedsPage'
import { BedPage } from '../pages/manage/bedPage'
import { ConfirmationPage } from '../pages/manage/confirmationPage'
import { CRNPage } from '../pages/apply'
import { CreatePlacementPage } from '../pages/manage/createPlacementPage'
import { MarkBedOutOfServicePage } from '../pages/manage/markBedOutOfServicePage'
import { CancellationPage } from '../pages/manage/cancellationPage'
import { signIn } from '../steps/signIn'
import { OutOfServiceBedsPage } from '../pages/manage/outOfServiceBedsPage'

test.describe.configure({ mode: 'parallel' })

const premisesName = 'Test AP 10'
const apArea = 'South West & South Central'

const navigateToPremisesPage = async (page: Page, { filterPremisesPage } = { filterPremisesPage: false }) => {
  // Given I visit the dashboard
  const dashboard = await visitDashboard(page)

  // When I click the Manage link
  await dashboard.clickManage()

  // Then I should see the a list of premises
  const listPage = await PremisesListPage.initialize(page, 'List of Approved Premises')

  if (filterPremisesPage) {
    await listPage.filterPremises(apArea)
  }

  // When I click on a Premises' 'View' link
  await listPage.choosePremises(premisesName)
}

const navigateToGivenBooking = async (page: Page, bookingId: string) => {
  await navigateToPremisesPage(page)

  const premisesPage = await PremisesPage.initialize(page, premisesName)

  await premisesPage.clickGivenBooking(bookingId)
}

const navigateToCurrentResident = async (page: Page) => {
  await navigateToPremisesPage(page)

  const premisesPage = await PremisesPage.initialize(page, premisesName)

  await premisesPage.clickManageCurrentResident()
}

const manuallyBookPlacement = async ({
  page,
  person,
  filterPremisesPage,
}: {
  page: Page
  person: TestOptions['personForAdHocBooking']
  filterPremisesPage?: boolean
}) => {
  const bookingId = () => {
    const url = page.url()
    return url.match(/bookings\/(.+)\/confirmation/)[1]
  }

  await navigateToPremisesPage(page, { filterPremisesPage })

  // Then I should see the premises view page
  const premisesPage = await PremisesPage.initialize(page, premisesName)

  // And I navigate to create a placement
  premisesPage.clickCreatePlacement()

  // Given I am on the CRN entry page
  const crnPage = new CRNPage(page)
  // When I enter a CRN
  await crnPage.enterCrn(person.crn)
  await crnPage.clickSearch()

  // Then I should see the placement page
  // Given I am on the placement page
  const createPlacementPage = new CreatePlacementPage(page)
  // When I complete the form
  await createPlacementPage.completeForm()
  createPlacementPage.clickSubmit()

  // Then I should be taken to the confirmation page
  const confirmationPage = new ConfirmationPage(page)
  await confirmationPage.shouldShowPlacementSuccessMessage()

  return bookingId()
}

test('Manually book a bed', async ({ page, person, legacyManager }) => {
  // Given I am signed in as a legacy manager
  await signIn(page, legacyManager)

  await manuallyBookPlacement({ page, person, filterPremisesPage: true })
})

test('Mark a booking as cancelled', async ({ page, legacyManager, personForAdHocBooking }) => {
  // Given I am signed in as a legacy manager
  await signIn(page, legacyManager)

  // And there is a placement for today
  const bookingId = await manuallyBookPlacement({ page, person: personForAdHocBooking, filterPremisesPage: true })

  await navigateToGivenBooking(page, bookingId)
  // And I am on the placement's page
  const placementPage = await PlacementPage.initialize(page, 'Placement details')

  // When I click the 'Mark cancelled' link
  await placementPage.clickMarkCancelled()

  // Then I should see the cancellation form
  const cancellationFormPage = await CancellationPage.initialize(page, 'Confirm withdrawn placement')

  // When I complete the form
  await cancellationFormPage.completeForm()
  await cancellationFormPage.clickWithdraw()

  // Then I should see the placement page with a banner
  await placementPage.showsCancellationLoggedMessage()
})

test('Mark a bed as out of service', async ({ page, legacyManager }) => {
  // Given I am signed in as a legacy manager
  await signIn(page, legacyManager)

  // And I am on the list of premises page
  const dashboard = await visitDashboard(page)
  await dashboard.clickManage()
  const listPage = await PremisesListPage.initialize(page, 'List of Approved Premises')

  // When I click on a Premises' 'View' link
  await listPage.choosePremises(premisesName)

  // Then I should see the premises view page
  const premisesPage = await PremisesPage.initialize(page, premisesName)

  // When I view a premises room
  await premisesPage.viewRooms()
  const bedsPage = await BedsPage.initialize(page, 'Manage beds')
  await bedsPage.viewAvailableBed()

  // Then I should be able to mark a bed as out of service
  const bedPage = await BedPage.initialize(page, 'Manage beds')
  await bedPage.clickMarkBedAsOutOfService()

  // When I fill in and submit the form
  const markBedOutOfServicePage = await MarkBedOutOfServicePage.initialize(page, 'Mark a bed as out of service')
  await markBedOutOfServicePage.completeForm()
  await markBedOutOfServicePage.clickSave()

  // Then I should be taken to the AP view page
  await premisesPage.showsLostBedLoggedMessage()
})

test('View all out of service beds', async ({ page, cruMember }) => {
  // Given I am signed in as a CRU Member
  await signIn(page, cruMember)

  // And I am on the dashboard page
  const dashboard = await visitDashboard(page)

  // And I click the 'View out of service beds' tile
  dashboard.clickOutOfServiceBeds()

  // Then I am taken to the out of service beds page
  await OutOfServiceBedsPage.initialize(page, 'Out of service beds')
})
