import { Page } from '@playwright/test'
import { TestOptions } from '@approved-premises/e2e'
import { DashboardPage } from '../pages/dashboardPage'
import { AssessmentPage, ListPage } from '../pages/workflow'

export const assessmentShouldHaveCorrectDeadlineAndAllocatedUser = async (
  dashboard: DashboardPage,
  page: Page,
  id: string,
  deadline: number,
  user: string | null,
) => {
  await dashboard.clickWorkflow()
  const workflowListPage = new ListPage(page)
  await workflowListPage.shouldHaveCorrectDeadlineAndAllocation(id, deadline, user)
}

export const assignAssessmentToMe = async (
  dashboard: DashboardPage,
  page: Page,
  userName: TestOptions['assessor']['username'],
  id: string,
  isAllocated?: boolean,
) => {
  const workflowListPage = new ListPage(page)
  await workflowListPage.chooseAssessmentWithId(id, isAllocated)

  const assessmentPage = new AssessmentPage(page)
  await assessmentPage.selectStaffMember(userName)
}
