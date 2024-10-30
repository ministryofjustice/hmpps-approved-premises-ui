import { test } from '../../test'
import { createApplication, visitDashboard } from '../../steps/apply'
import { CancellationPage } from '../../pages/manage/cancellationPage'
import { CreatePlacementPage } from '../../pages/manage/v1/createPlacementPage'
import { ChangePlacementDatesPage } from '../../pages/manage/changePlacementDates'
import { signIn } from '../../steps/signIn'
import { assessApplication } from '../../steps/assess'
import { ListPage, PlacementRequestPage } from '../../pages/workflow'
import { PlacementSelectPage } from '../../pages/manage/placementSelectPage'
import { WithdrawalSelectionPage } from '../../pages/manage/withdrawalSelectionPage'
import { PlacementPage } from '../../pages/manage/v1/placementPage'

test('Apply, assess, and match an application, then book, update and cancel a placement through the V1 flow', async ({
  page,
  assessor,
  person,
  oasysSections,
}) => {
  await signIn(page, assessor)
  const { id } = await createApplication({ page, person, oasysSections, applicationType: 'standard' }, true, false)
  await assessApplication({ page, assessor, person }, id)

  // Given I visit the Dashboard
  const dashboard = await visitDashboard(page)

  // And I click the link to the CRU Dashboard
  await dashboard.clickCruDashboard()

  const cruDashboard = new ListPage(page)

  // And I select the placement request
  await cruDashboard.choosePlacementApplicationWithId(id)

  let placementRequestPage = new PlacementRequestPage(page)

  // And I click the 'Create placement' button
  await placementRequestPage.clickCreatePlacement()

  // Then I should see the "Record an AP Placement" screen
  const createPlacement = new CreatePlacementPage(page)

  // When I submit the form
  await createPlacement.completeForm()
  await createPlacement.clickSave()

  // Then I should see confirmation that the placement has been booked
  placementRequestPage = new PlacementRequestPage(page)
  await placementRequestPage.shouldShowPlacementSuccessMessage()

  // And I can navigate to the placement
  await placementRequestPage.navigateToPlacement()
  const placementPage = await PlacementPage.initialize(page, 'Placement details')

  // When I click the 'Change placement dates' action
  await placementPage.clickChangePlacementDates()

  // Then I should see the date change form
  const changePlacementDatesPage = await ChangePlacementDatesPage.initialize(page, 'Update placement date')

  // When I complete the form
  await changePlacementDatesPage.completeForm()
  await changePlacementDatesPage.clickSubmit()

  // Then I should see the placement page with a success banner
  await placementPage.showsPlacementDateChangeSuccessMessage()

  // When I click the 'Withdraw placement' action
  await placementPage.clickMarkCancelled()

  // Then I should see the withdrawal selection page
  const withdrawalSelectionPage = await WithdrawalSelectionPage.initialize(page, 'What do you want to withdraw?')

  // When I complete the form
  await withdrawalSelectionPage.selectPlacementRadio()
  await withdrawalSelectionPage.clickContinue()

  // Then I should see the placement selection page
  const selectPlacementPage = await PlacementSelectPage.initialize(page, 'Select your placement')

  // When I complete the form
  await selectPlacementPage.completeForm()
  await selectPlacementPage.clickContinue()

  // Then I should see the withdrawal confirmation form
  const withdrawalConfirmationPage = await CancellationPage.initialize(page, 'Confirm withdrawn placement')

  // When I complete the form
  await withdrawalConfirmationPage.completeForm()
  await withdrawalConfirmationPage.clickWithdraw()

  // Then I should see the placement request page with a success banner
  await placementPage.showsCancellationLoggedMessage()
})
