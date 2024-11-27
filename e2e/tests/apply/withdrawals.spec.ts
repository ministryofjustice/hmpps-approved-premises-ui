import { test } from '../../test'
import { enterAndConfirmCrn, startAnApplication, withdrawAnApplicationBeforeSubmission } from '../../steps/apply'

import { ListPage } from '../../pages/apply'

import { ShowPage } from '../../pages/apply/showPage'
import { signIn, visitDashboard } from '../../steps/signIn'

test('Withdraw an application before submission', async ({ page, person, userWithoutRoles }) => {
  await signIn(page, userWithoutRoles)

  const dashboard = await visitDashboard(page)

  await startAnApplication(dashboard, page)
  const applicationId = await enterAndConfirmCrn(page, person.crn)

  await visitDashboard(page)
  await dashboard.clickApply()

  await withdrawAnApplicationBeforeSubmission(page, applicationId)

  const listPage = new ListPage(page)
  await listPage.shouldShowWithdrawalConfirmationMessage()

  await listPage.selectAllApplications()
  await listPage.shouldShowWithdrawnApplication(applicationId)
  await listPage.clickApplicationWithId(applicationId)

  const showPage = new ShowPage(page)
  await showPage.shouldShowWithdrawnTag()
})
