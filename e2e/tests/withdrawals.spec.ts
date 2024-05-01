import { Page } from '@playwright/test'
import { TestOptions } from '@approved-premises/e2e'
import { test } from '../test'
import {
  enterAndConfirmCrn,
  startAnApplication,
  visitDashboard,
  withdrawAnApplicationBeforeSubmission,
} from '../steps/apply'

import { ListPage } from '../pages/apply'

import { ShowPage } from '../pages/apply/showPage'

test('Withdraw an application before submission', async ({
  page,
  person,
}: {
  page: Page
  person: TestOptions['person']
}) => {
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
