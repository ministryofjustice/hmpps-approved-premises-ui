import { Page } from '@playwright/test'
import { TestOptions } from '@approved-premises/e2e'
import { test } from '../test'
import { visitDashboard } from '../steps/apply'
import { PremisesListPage } from '../pages/manage/premisesListPage'
import { PremisesPage } from '../pages/manage/premisesPage'
import { ConfirmationPage } from '../pages/manage/confirmationPage'
import { CRNPage } from '../pages/apply'
import { CreatePlacementPage } from '../pages/manage/createPlacementPage'
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
