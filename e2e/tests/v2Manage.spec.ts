import { test } from '../test'
import { visitDashboard } from '../steps/apply'
import { PremisesListPage } from '../pages/manage/premisesListPage'
import { PremisesPage } from '../pages/manage/premisesPage'
import { BedsPage } from '../pages/manage/bedsPage'
import { V2BedPage } from '../pages/manage/v2BedPage'
import { V2MarkBedAsOutOfServicePage } from '../pages/manage/v2MarkBedAsOutOfServicePage'
import { signIn } from '../steps/signIn'

test.describe.configure({ mode: 'parallel' })

const premisesName = 'Test AP 10'

test('Future manager marks a bed as out of service in the V2 Manage area', async ({ page, futureManager }) => {
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
  const manageBedsPage = await BedsPage.initialize(page, 'Manage beds')

  // And I pick a particular bed to manage
  await manageBedsPage.viewAvailableBed()

  // Then I see the V2 Bed page
  const v2BedPage = await V2BedPage.initialize(page, premisesName)

  // And I should be able to mark a bed as out of service
  await v2BedPage.clickMarkBedAsOutOfService()

  // When I fill in and submit the v2 Manage out-of-service-bed form
  const v2MarkBedAsOutOfServicePage = await V2MarkBedAsOutOfServicePage.initialize(page, 'Mark a bed as out of service')
  await v2MarkBedAsOutOfServicePage.completeForm()
  await v2MarkBedAsOutOfServicePage.clickSave()

  // Then I am redirected back to the V2 bed page
  const revisitedV2BedPage = await V2BedPage.initialize(page, premisesName)

  // And I see the success message on the 'history' pane of the bed page
  await revisitedV2BedPage.showsOutOfServiceBedRecordedSuccessMessage()
})
