import { Page } from '@playwright/test'
import { TestOptions } from '@approved-premises/e2e'
import { test } from '../../test'
import { visitDashboard } from '../../steps/apply'
import { PremisesListPage } from '../../pages/manage/premisesListPage'
import { PremisesPage } from '../../pages/manage/premisesPage'
import { PlacementPage } from '../../pages/manage/placementPage'
import { CancellationPage } from '../../pages/manage/cancellationPage'
import { ConfirmationPage } from '../../pages/manage/confirmationPage'
import { CRNPage } from '../../pages/apply'
import { CreatePlacementPage } from '../../pages/manage/createPlacementPage'
import { ChangePlacementDatesPage } from '../../pages/manage/changePlacementDates'
import { signIn } from '../../steps/signIn'

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

  await page.goto(`${premisesPage.page.url()}/bookings/${bookingId}`)
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

test('Manually create a placement', async ({ page, person, cruMember }) => {
  await signIn(page, cruMember)

  await manuallyBookPlacement({ page, person, filterPremisesPage: true })
})

test('Cancel a manually created placement', async ({ page, cruMember, personForAdHocBooking }) => {
  await signIn(page, cruMember)

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

test('Change placement dates', async ({ page, person, cruMember }) => {
  await signIn(page, cruMember)

  const bookingId = await manuallyBookPlacement({ page, person })

  await navigateToGivenBooking(page, bookingId)

  // And I am on the placement's page
  const placementPage = await PlacementPage.initialize(page, 'Placement details')

  // When I click the 'Extend' link
  await placementPage.clickChangePlacementDates()

  // Then I should see the extension form
  const extensionFormPage = await ChangePlacementDatesPage.initialize(page, 'Update placement date')

  // When I complete the form
  await extensionFormPage.completeForm()
  await extensionFormPage.clickSubmit()

  // Then I should see the placement page with a banner
  const confirmationPage = new ConfirmationPage(page)
  await confirmationPage.shouldShowBookingChangeSuccessMessage()
})
