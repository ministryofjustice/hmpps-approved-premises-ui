import { Page } from '@playwright/test'
import { DashboardPage } from '../pages/dashboardPage'
import { AssessmentPage, ListPage, PlacementRequestPage } from '../pages/workflow'

export const assessmentShouldHaveCorrectDeadlineAndAllocatedUser = async (
  dashboard: DashboardPage,
  page: Page,
  id: string,
  deadline: string,
  user: string | null,
) => {
  await dashboard.clickWorkflow()
  const workflowListPage = new ListPage(page)
  await workflowListPage.shouldHaveCorrectDeadlineAndAllocation(id, deadline, user)
}

export const assignAssessmentToMe = async (
  dashboard: DashboardPage,
  page: Page,
  userName: string,
  id: string,
  isAllocated?: boolean,
) => {
  const workflowListPage = new ListPage(page)
  await workflowListPage.chooseAssessmentWithId(id, isAllocated)

  const assessmentPage = new AssessmentPage(page)
  await assessmentPage.selectStaffMember(userName)
}

export const assignPlacementRequestToMe = async (
  dashboard: DashboardPage,
  page: Page,
  userName: string,
  id: string,
) => {
  await dashboard.clickWorkflow()

  const workflowListPage = new ListPage(page)
  await workflowListPage.choosePlacementRequestWithId(id)

  const placementRequestPage = new PlacementRequestPage(page)
  await placementRequestPage.selectStaffMember(userName)
  await placementRequestPage.clickSubmit()
}
