import { faker } from '@faker-js/faker/locale/en_GB'
import { UserLoginDetails } from '@approved-premises/e2e'
import { Page } from '@playwright/test'
import { OutOfServiceBedsPremisesListPage } from '../../pages/manage/outOfServiceBedsIndexPage'
import { OutOfServiceBedPage } from '../../pages/manage/outOfServiceBedPage'
import { CancelOutOfServiceBedPage } from '../../pages/manage/cancelOutOfServiceBedPage'
import { test } from '../../test'
import { PremisesListPage } from '../../pages/manage/premisesListPage'
import { PremisesPage } from '../../pages/manage/premisesPage'
import { BedsPage } from '../../pages/manage/bedsPage'
import { BedPage } from '../../pages/manage/bedPage'
import { MarkBedAsOutOfServicePage } from '../../pages/manage/markBedAsOutOfServicePage'
import { signIn, visitDashboard } from '../../steps/signIn'
import { UpdateOutOfServiceBedPage } from '../../pages/manage/updateOutOfServiceBedPage'
import { OutOfServiceBedsPage } from '../../pages/manage/outOfServiceBedsPage'

test.describe.configure({ mode: 'parallel' })

const premisesName = 'NE Men Premise 1'

const markABedAsOutOfService = async (page: Page, futureManager: UserLoginDetails, referenceNumber: string) => {
  // Given I am signed in as a future manager
  await signIn(page, futureManager)

  // And I am on the list of premises page
  const dashboard = await visitDashboard(page)
  await dashboard.clickManage()
  const premisesListPage = await PremisesListPage.initialize(page, 'Approved Premises (AP)')

  // When choose to view the detail of a particular premises
  await premisesListPage.choosePremises(premisesName)

  // Then I should see the premises page
  const premisesPage = await PremisesPage.initialize(page, premisesName)

  // When I choose to manage its beds
  await premisesPage.viewRooms()
  const manageBedsPage = await BedsPage.initialize(page, 'Manage beds')

  // And I pick a particular bed to manage
  await manageBedsPage.viewBed()

  // Then I see the bed page
  const bedPage = await BedPage.initialize(page, premisesName)

  // And I should be able to mark a bed as out of service
  await bedPage.clickMarkBedAsOutOfService()

  // When I fill in and submit the manage out-of-service-bed form
  const markBedAsOutOfServicePage = await MarkBedAsOutOfServicePage.initialize(page, 'Mark a bed as out of service')
  await markBedAsOutOfServicePage.completeForm(referenceNumber)
  await markBedAsOutOfServicePage.clickSubmit('Save')

  // If there is a booking conflict then add 3 days to the start date and try again
  await markBedAsOutOfServicePage.ensureNoBookingConflict()

  // Then I am redirected back to the bed page
  const revisitedBedPage = await BedPage.initialize(page, premisesName)

  // // And I see the success message on the 'history' pane of the bed page
  await revisitedBedPage.showsOutOfServiceBedRecordedSuccessMessage()
}

const navigateToOutOfServiceBedRecord = async (page: Page, referenceNumber: string) => {
  // Given I am on the dashboard page
  const dashboard = await visitDashboard(page)

  // And I am on the list of premises page
  await dashboard.clickManage()
  const premisesListPage = await PremisesListPage.initialize(page, 'Approved Premises (AP)')

  // When I choose to view the detail of a particular premises
  await premisesListPage.choosePremises(premisesName)

  // Then I should see the premises page
  const premisesPage = await PremisesPage.initialize(page, premisesName)

  // When I choose to view the out of service bed records for the premises
  await premisesPage.viewOutOfServiceBedRecords()
  const manageOOSBedsPage = await OutOfServiceBedsPremisesListPage.initialize(page, premisesName)
  await manageOOSBedsPage.showsTotalOutOfServiceBedsMatchingFilters()

  // And I am on the future out of service beds tab
  await manageOOSBedsPage.selectFutureTab()

  // When I select the out of service bed 
  await manageOOSBedsPage.selectOutOfServiceBed(referenceNumber)

  // Then I should be taken to the out of service bed page
  return OutOfServiceBedPage.initialize(page)
}


const cleanUpOutOfServiceBed = async (page: Page, referenceNumber: string) => {
  try {
    const outOfServiceBedPage = await navigateToOutOfServiceBedRecord(page, referenceNumber)
    await outOfServiceBedPage.selectCancelRecord()

    const cancelOutOfServiceBedPage = await CancelOutOfServiceBedPage.initialize(page)
    await cancelOutOfServiceBedPage.confirmCancellation()

    await cancelOutOfServiceBedPage.shouldShowSuccessBanner('Cancelled out of service bed')
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn(`Could not clean up out of service bed with reference number ${referenceNumber}:`, error)
  }
}

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

test('Future manager marks a bed as out of service in the manage area', async ({ page, futureManager }) => {
  const referenceNumber = faker.string.alpha({ length: 32 })

  try {
    await markABedAsOutOfService(page, futureManager, referenceNumber)
  } finally {
    await cleanUpOutOfServiceBed(page, referenceNumber)
  }
})

test('Future manager updates an out of service bed', async ({ page, futureManager }) => {
  // Given there is an Out of Service bed
  let referenceNumber = faker.string.alpha({ length: 10 })

  try {
    await markABedAsOutOfService(page, futureManager, referenceNumber)

    // And I view an out of service bed
    const outOfServiceBedPage = await navigateToOutOfServiceBedRecord(page, referenceNumber)

    // When I select 'Update record'
    await outOfServiceBedPage.selectUpdateRecord()

    // Then I should see the update out of service bed record page
    const updateOOSBedPage = await UpdateOutOfServiceBedPage.initialize(page)

    // When I update the out of service bed record
    const uniqueReferenceNumber = faker.string.alpha({ length: 10 })
    const update = {
      referenceNumber: uniqueReferenceNumber,
      additionalInformation: `Additional information about update ${uniqueReferenceNumber}`,
    }
    await updateOOSBedPage.updateBed(update)
    await updateOOSBedPage.clickSubmit('Save')

    referenceNumber = uniqueReferenceNumber

    // Then I should see the out of service bed timeline page with the updated details
    const outOfServiceBedPage2 = await OutOfServiceBedPage.initialize(page)
    await outOfServiceBedPage2.shouldShowUpdatedDetails(update)

    // When I select the details tab
    await outOfServiceBedPage2.selectDetails()

    // Then I should see the updated details
    await outOfServiceBedPage2.shouldShowUpdatedDetails(update)
  } finally {
    // Cancel the out of service bed
    await cleanUpOutOfServiceBed(page, referenceNumber)
  }
})
