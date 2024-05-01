import { test } from '../../test'
import {
  enterAndConfirmCrn,
  startAnApplication,
  visitDashboard,
  withdrawAnApplicationBeforeSubmission,
} from '../../steps/apply'

import { ListPage } from '../../pages/apply'

test('Withdraw an application before submission', async ({ page, person }) => {
  const dashboard = await visitDashboard(page)

  await startAnApplication(dashboard, page)
  const applicationId = await enterAndConfirmCrn(page, person.crn)

  await visitDashboard(page)
  await dashboard.clickApply()

  await withdrawAnApplicationBeforeSubmission(page, applicationId)

  const listPage = new ListPage(page)
  await listPage.shouldShowWithdrawalConfirmationMessage()
})
