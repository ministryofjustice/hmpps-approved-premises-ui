import { test } from '../test'
import {
  createApplication,
  enterAndConfirmCrn,
  recordAnAppealOnApplication,
  startAnApplication,
  visitDashboard,
  withdrawAnApplicationAfterSubmission,
  withdrawAnApplicationBeforeSubmission,
} from '../steps/apply'
import { assessApplication, requestAndAddAdditionalInformation } from '../steps/assess'
// import { matchAndBookApplication } from '../steps/match'

// import { reviewAndApprovePlacementApplication, startAndCreatePlacementApplication } from '../steps/placementApplication'
import { startAndCreatePlacementApplication, withdrawPlacementApplication } from '../steps/placementApplication'

import { ListPage } from '../pages/apply'
import { setRoles } from '../steps/admin'

test('Apply, assess, match and book an application for an Approved Premises with a release date', async ({
  page,
  user,
  person,
  indexOffenceRequired,
  oasysSections,
}) => {
  await setRoles(page, [])
  const id = await createApplication({ page, person, indexOffenceRequired, oasysSections }, true, false, true)
  await assessApplication({ page, user, person }, id)
  await withdrawAnApplicationAfterSubmission(page, id)
  // Skip match until it's back
  // await matchAndBookApplication({ page, user, person }, id)
})

test('Apply, assess, match and book an emergency application for an Approved Premises', async ({
  page,
  user,
  person,
  indexOffenceRequired,
  oasysSections,
}) => {
  await setRoles(page, ['Emergency APs'])

  const id = await createApplication({ page, person, indexOffenceRequired, oasysSections }, true, true)
  await assessApplication({ page, user, person }, id, { emergencyApplication: true })
  // Skip match until it's back
  // await matchAndBookApplication({ page, user, person }, id)
})

test('Apply, assess, match and book an application for an Approved Premises without a release date', async ({
  page,
  user,
  person,
  indexOffenceRequired,
  oasysSections,
}) => {
  await setRoles(page, [])

  const id = await createApplication({ page, person, indexOffenceRequired, oasysSections }, false, false)
  await assessApplication({ page, user, person }, id)
  await startAndCreatePlacementApplication({ page }, id)
  await withdrawPlacementApplication(page, id)

  // Skip match until it's back
  // await reviewAndApprovePlacementApplication({ page, user }, id)
  // TODO: Match and book once approval is done
})

test('Withdraw an application before submission', async ({ page, person, indexOffenceRequired }) => {
  const dashboard = await visitDashboard(page)

  await startAnApplication(dashboard, page)
  const applicationId = await enterAndConfirmCrn(page, person.crn, indexOffenceRequired)

  await visitDashboard(page)
  await dashboard.clickApply()

  await withdrawAnApplicationBeforeSubmission(page, applicationId)

  const listPage = new ListPage(page)
  await listPage.shouldShowWithdrawalConfirmationMessage()
})

test('Request further information on an Application, adds it and proceeds with the assessment', async ({
  page,
  user,
  person,
  indexOffenceRequired,
  oasysSections,
}) => {
  await setRoles(page, [])

  const id = await createApplication({ page, person, indexOffenceRequired, oasysSections }, true, false)
  await requestAndAddAdditionalInformation({ page, user, person }, id)
})

test('Record an appeal against a rejected application', async ({
  page,
  user,
  person,
  indexOffenceRequired,
  oasysSections,
}) => {
  await setRoles(page, [])
  const id = await createApplication({ page, person, indexOffenceRequired, oasysSections }, true, false, true)
  await assessApplication({ page, user, person }, id, { acceptApplication: false })
  await recordAnAppealOnApplication(page, id)
})
