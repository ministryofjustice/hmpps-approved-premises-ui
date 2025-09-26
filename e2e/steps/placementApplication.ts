import { Page } from '@playwright/test'
import { TestOptions } from '@approved-premises/e2e'
import { ApplyPage, DashboardPage, ListPage } from '../pages/apply'
import { ListPage as WorkflowListPage } from '../pages/workflow'
import { ListPage as MatchListPage } from '../pages/match'
import { PlacementApplicationReviewPage as ReviewPage } from '../pages/match/placement-applications/reviewPage'
import { PlacementApplicationDecisionPage as DecisionPage } from '../pages/match/placement-applications/decisionPage'
import { PlacementApplicationConfirmationPage as ConfirmationPage } from '../pages/match/placement-applications/confirmationPage'
import { PlacementConfirmPage } from '../pages/apply/placementConfirmPage'
import { ShowPage } from '../pages/apply/showPage'
import { PlacementApplicationPage } from '../pages/workflow/placementApplicationPage'
import { visitDashboard } from './signIn'

export const assignPlacementApplicationToMe = async (
  dashboard: DashboardPage,
  page: Page,
  userName: string,
  id: string,
) => {
  await dashboard.clickWorkflow()

  const workflowListPage = new WorkflowListPage(page)
  await workflowListPage.choosePlacementApplicationWithId(id)

  const placementRequestPage = new PlacementApplicationPage(page)
  await placementRequestPage.selectStaffMember(userName)
  await placementRequestPage.clickSubmit()
}

export const startPlacementApplication = async ({ page }: { page: Page }, applicationId: string) => {
  // When I visit the Dashboard
  const dashboard = await visitDashboard(page)

  await dashboard.clickApply()

  const listPage = new ListPage(page)
  await listPage.clickSubmitted()
  await listPage.clickApplicationWithId(applicationId)

  const showPage = new ShowPage(page)
  await showPage.createPlacementRequest()
}

export const createPlacementApplication = async ({ page }: { page: Page }) => {
  const checkSentenceTypePage = await ApplyPage.initialize(page, 'Check the sentencing information')
  await checkSentenceTypePage.checkRadioInGroup('Has the sentence or release type changed?', 'Yes')
  await checkSentenceTypePage.clickSave()

  const sentenceTypePage = await ApplyPage.initialize(page, 'Which sentence type does the person have?')
  await sentenceTypePage.checkRadio('Standard determinate custody')
  await sentenceTypePage.clickSave()

  const releaseTypePage = await ApplyPage.initialize(page, 'What is the release type?')
  await releaseTypePage.checkRadio('Release on Temporary Licence (ROTL)')
  await releaseTypePage.clickSave()

  const previousPlacementPage = await ApplyPage.initialize(page, 'Request for placement')
  await previousPlacementPage.checkRadioInGroup(
    'Has this person previously had a placement at an Approved Premises for ROTL?',
    'No',
  )
  await previousPlacementPage.clickSave()

  const datePage = new ApplyPage(page)
  await datePage.fillReleaseDateField('standard')
  await datePage.fillDurationField({ weeks: 12, days: 0 })
  await datePage.checkRadio('Yes')
  await datePage.clickContinue()

  const updatesToPlacementPage = new ApplyPage(page)
  await updatesToPlacementPage.checkRadioInGroup(
    'Have there been any significant events since the application was assessed?',
    'No',
  )
  await updatesToPlacementPage.checkRadioInGroup(
    "Has the person's circumstances changed which affect the planned AP placement?",
    'No',
  )
  await updatesToPlacementPage.checkRadioInGroup(
    "Has the person's risk factors changed since the application was assessed?",
    'No',
  )
  await updatesToPlacementPage.checkRadioInGroup(
    "Has the person's access or healthcare needs changed since the application was assessed?",
    'No',
  )
  await updatesToPlacementPage.checkRadioInGroup(
    "Has the person's location factors changed since the application was assessed?",
    'No',
  )
  await updatesToPlacementPage.clickSave()

  const checkYourAnswersPage = new ApplyPage(page)
  await checkYourAnswersPage.checkCheckBoxes([
    'I confirm the information provided is complete, accurate and up to date.',
  ])
  await checkYourAnswersPage.clickSubmit()

  const placementConfirmPage = new PlacementConfirmPage(page)
  await placementConfirmPage.shouldShowSuccessMessage()
}

export const startAndCreatePlacementApplication = async ({ page }: { page: Page }, applicationId: string) => {
  await startPlacementApplication({ page }, applicationId)
  await createPlacementApplication({ page })
}

export const reviewAndApprovePlacementApplication = async (
  { page, user }: { page: Page; user: TestOptions['user'] },
  applicationId: string,
) => {
  const dashboard = await visitDashboard(page)
  await assignPlacementApplicationToMe(dashboard, page, user.name, applicationId)

  await visitDashboard(page)

  const listPage = new MatchListPage(page)
  await listPage.clickPlacementApplications()
  await listPage.clickPlacementApplicationWithId(applicationId)

  const reviewPage = new ReviewPage(page)
  await reviewPage.fillField(
    'Summarise any significant changes that have happened between the assessment and this placement request',
    'nothing has changed',
  )
  await reviewPage.clickSave()

  const decisionPage = new DecisionPage(page)
  await decisionPage.checkRadio('Accept - proceed to match')
  await decisionPage.fillField('Summarise your decision', 'a decision summary')
  await decisionPage.clickSubmit()

  const confirmationPage = new ConfirmationPage(page)
  await confirmationPage.shouldShowSuccessMessage()
}

export const withdrawPlacementApplication = async (page: Page, applicationId: string) => {
  const dashboard = await visitDashboard(page)
  await dashboard.clickApply()

  const listPage = new ListPage(page)
  await listPage.clickSubmitted()
  await listPage.clickApplicationWithId(applicationId)

  const showPage = new ShowPage(page)
  await showPage.withdrawPlacementApplication()
}
