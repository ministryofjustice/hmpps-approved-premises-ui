import { faker } from '@faker-js/faker/locale/en_GB'
import { UserLoginDetails } from '@approved-premises/e2e'
import { Page } from '@playwright/test'
import { OutOfServiceBedsPremisesListPage } from '../pages/manage/v2OutOfServiceBedsIndexPage'
import { OutOfServiceBedPage } from '../pages/manage/v2OutOfServiceBedPage'
import { test } from '../test'
import { visitDashboard } from '../steps/apply'
import { PremisesListPage } from '../pages/manage/premisesListPage'
import { PremisesPage } from '../pages/manage/premisesPage'
import { V2BedsPage } from '../pages/manage/v2BedsPage'
import { V2BedPage } from '../pages/manage/v2BedPage'
import { V2MarkBedAsOutOfServicePage } from '../pages/manage/v2MarkBedAsOutOfServicePage'
import { signIn } from '../steps/signIn'
import { UpdateOutOfServiceBedPage } from '../pages/manage/v2UpdateOutOfServiceBedPage'

test.describe.configure({ mode: 'parallel' })

const premisesName = 'Test AP 10'

const markABedAsOutOfService = async (page: Page, futureManager: UserLoginDetails) => {
  // Given I am signed in as a future manager
  await signIn(page, futureManager)

  // And I am on the list of premises page
  const dashboard = await visitDashboard(page)
  await dashboard.clickManage()
  const premisesListPage = await PremisesListPage.initialize(page, 'List of Approved Premises')

  // When choose to view the detail of a particular premises
  await premisesListPage.choosePremises(premisesName)

  // Then I should see the premises page
  const premisesPage = await PremisesPage.initialize(page, premisesName)

  // When I choose to manage its beds
  await premisesPage.viewRooms()
  const manageBedsPage = await V2BedsPage.initialize(page, 'Manage beds')

  // And I pick a particular bed to manage
  await manageBedsPage.viewBed()

  // Then I see the V2 Bed page
  const v2BedPage = await V2BedPage.initialize(page, premisesName)

  // And I should be able to mark a bed as out of service
  await v2BedPage.clickMarkBedAsOutOfService()

  // When I fill in and submit the v2 Manage out-of-service-bed form
  const v2MarkBedAsOutOfServicePage = await V2MarkBedAsOutOfServicePage.initialize(page, 'Mark a bed as out of service')
  await v2MarkBedAsOutOfServicePage.completeForm()
  await v2MarkBedAsOutOfServicePage.clickSave()

  // If there is a booking conflict then add 3 days to the start date and try again
  await v2MarkBedAsOutOfServicePage.ensureNoBookingConflict()

  // Then I am redirected back to the V2 bed page
  const revisitedV2BedPage = await V2BedPage.initialize(page, premisesName)

  // // And I see the success message on the 'history' pane of the bed page
  await revisitedV2BedPage.showsOutOfServiceBedRecordedSuccessMessage()
}

test('Future manager marks a bed as out of service in the V2 Manage area', async ({ page, futureManager }) => {
  await markABedAsOutOfService(page, futureManager)
})

test('Future manager updates an out of service bed', async ({ page, futureManager }) => {
  // Given there is an Out of Service bed
  await markABedAsOutOfService(page, futureManager)

  // And I am on the list of premises page
  const dashboard = await visitDashboard(page)
  await dashboard.clickManage()
  const premisesListPage = await PremisesListPage.initialize(page, 'List of Approved Premises')

  // When choose to view the detail of a particular premises
  await premisesListPage.choosePremises(premisesName)

  // Then I should see the premises page
  const premisesPage = await PremisesPage.initialize(page, premisesName)

  // When I choose to manage its out of service beds
  await premisesPage.viewOutOfServiceBedRecords()

  // Then I should see the out of service beds list page for the premises
  const manageOOSBedsPage = await OutOfServiceBedsPremisesListPage.initialize(page, premisesName)

  // When I select the 'future' tab and select the out of service bed created earlier
  await manageOOSBedsPage.selectFutureTab()
  await manageOOSBedsPage.selectOutOfServiceBed()

  // Then I should see the out of service bed page
  const outOfServiceBedPage = await OutOfServiceBedPage.initialize(page)

  // When I select 'Update record'
  await outOfServiceBedPage.selectUpdateRecord()

  // Then I should see the update out of service bed record page
  const updateOOSBedPage = await UpdateOutOfServiceBedPage.initialize(page)

  // When I update the out of service bed record
  const uniqueReferenceNumber = faker.string.uuid()
  const update = {
    referenceNumber: uniqueReferenceNumber,
    additionalInformation: `Additional information about update ${uniqueReferenceNumber}`,
  }
  await updateOOSBedPage.updateBed(update)
  await updateOOSBedPage.clickSave()

  // Then I should see the out of service bed timeline page with the updated details
  const outOfServiceBedPage2 = await OutOfServiceBedPage.initialize(page)
  await outOfServiceBedPage2.shouldShowUpdatedDetails(update)

  // When I select the details tab
  await outOfServiceBedPage2.selectDetails()

  // Then I should see the updated details
  await outOfServiceBedPage2.shouldShowUpdatedDetails(update)
})
