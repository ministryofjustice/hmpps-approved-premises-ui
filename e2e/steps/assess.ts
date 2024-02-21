import { Page } from '@playwright/test'
import { AssessPage, ConfirmationPage, ListPage, TasklistPage } from '../pages/assess'
import { visitDashboard } from './apply'
import { assignAssessmentToMe } from './workflow'
import { TestOptions } from '../testOptions'

export const startAssessment = async (page: Page, personName: string, applicationId: string) => {
  const dashboard = await visitDashboard(page)
  await dashboard.clickAssess()

  const listPage = new ListPage(page)
  await listPage.clickAssessmentWithApplicationId(applicationId)
}

export const reviewApplication = async (page: Page) => {
  const tasklistPage = new TasklistPage(page)
  await tasklistPage.clickTask('Review application and documents')

  const reviewPage = await AssessPage.initialize(page, 'Review application')
  await reviewPage.checkRadio('Yes')
  await reviewPage.clickSubmit()
}

export const confirmInformation = async (page: Page) => {
  const tasklistPage = new TasklistPage(page)
  await tasklistPage.clickTask('Check there is sufficient information to make a decision')

  const confirmPage = await AssessPage.initialize(page, 'Suitability Assessment')
  await confirmPage.checkRadio('Yes')
  await confirmPage.clickSubmit()
}

export const confirmInsufficientInformation = async (page: Page) => {
  const tasklistPage = new TasklistPage(page)
  await tasklistPage.clickTask('Check there is sufficient information to make a decision')

  const additionalInformationPage = await AssessPage.initialize(page, 'Suitability Assessment')
  await additionalInformationPage.checkRadio('No, I need to contact the probation practitioner for more information')
  await additionalInformationPage.fillField('What additional information is needed?', 'This is a test')
  await additionalInformationPage.clickSubmit()

  const confirmPage = await AssessPage.initialize(page, 'Suitability Assessment')
  await confirmPage.checkRadio('Yes')
  await confirmPage.clickSubmit()
}

export const addAdditionalInformation = async (page: Page) => {
  const additionalInformationPage = await AssessPage.initialize(page, 'Additional information')
  await additionalInformationPage.checkRadio('Yes')
  await additionalInformationPage.fillField(
    'Provide the additional information received from the probation practitioner',
    'Additional information',
  )
  await additionalInformationPage.fillDateField({ year: '2023', month: '3', day: '12' })

  await additionalInformationPage.clickSubmit()
}

export const assessSuitability = async (page: Page, emergencyApplication = false) => {
  const tasklistPage = new TasklistPage(page)
  await tasklistPage.clickTask('Assess suitability of application')

  const assessPage = await AssessPage.initialize(page, 'Suitability assessment')
  await assessPage.checkRadioInGroup(
    'Does the application identify the risk factors that an Approved Premises (AP) placement can support?',
    'Yes',
  )
  await assessPage.checkRadioInGroup(
    'Does the application explain how an AP placement would be beneficial for risk management?',
    'Yes',
  )
  await assessPage.checkRadioInGroup('Are there factors to consider regarding the location of placement?', 'Yes')
  await assessPage.checkRadioInGroup('Is the move on plan sufficient?', 'Yes')
  await assessPage.clickSubmit()

  if (emergencyApplication) {
    const applicationTimelinessPage = await AssessPage.initialize(page, 'Application timeliness')
    await applicationTimelinessPage.checkRadioInGroup(
      `Do you agree with the applicant's reason for submission outside of National Standards timescales?`,
      'Yes',
    )
    await applicationTimelinessPage.clickSubmit()

    const contingencyPlansSufficientPage = await AssessPage.initialize(page, 'Suitability assessment')
    await contingencyPlansSufficientPage.checkRadioInGroup(
      'Is the contingency plan sufficient to manage behaviour or a failure to return out of hours?',
      'Yes',
    )
    await contingencyPlansSufficientPage.fillField('Additional comments', 'Some comments')
    await contingencyPlansSufficientPage.clickSubmit()
  }
}

export const provideRequirements = async (page: Page) => {
  const tasklistPage = new TasklistPage(page)
  await tasklistPage.clickTask('Provide any requirements to support placement')

  const requirementsPage = await AssessPage.initialize(page, 'Required actions to support a placement')
  await requirementsPage.checkRadioInGroup(
    'Are there any additional actions required by the probation practitioner to make a placement viable?',
    'No',
  )
  await requirementsPage.checkRadioInGroup('Are any additional curfews or sign ins recommended?', 'No')
  await requirementsPage.checkRadioInGroup(
    'Are there concerns that the person poses a potentially unmanageable risk to staff or others?',
    'No',
  )
  await requirementsPage.checkRadioInGroup(
    'Are there any additional recommendations for the receiving AP manager?',
    'No',
  )
  await requirementsPage.clickSubmit()
}

export const makeDecision = async (page: Page, options: { acceptApplication: boolean }) => {
  const tasklistPage = new TasklistPage(page)
  await tasklistPage.clickTask('Make a decision')

  const decisionPage = await AssessPage.initialize(page, 'Make a decision')

  const decision = options.acceptApplication ? 'Accept' : 'Accommodation need only'
  await decisionPage.checkRadio(decision)
  await decisionPage.clickSubmit()
}

export const addMatchingInformation = async (page: Page) => {
  const tasklistPage = new TasklistPage(page)
  await tasklistPage.clickTask('Matching information')

  const matchingInformationPage = await AssessPage.initialize(page, 'Matching information')

  await matchingInformationPage.checkRadio('Standard AP')

  await matchingInformationPage.checkRequirement('Is wheelchair designated', 'notRelevant')
  await matchingInformationPage.checkRequirement('Is single', 'notRelevant')
  await matchingInformationPage.checkRequirement('Is step free designated', 'notRelevant')
  await matchingInformationPage.checkRequirement('Is catered', 'notRelevant')
  await matchingInformationPage.checkRequirement('Is ground floor', 'notRelevant')
  await matchingInformationPage.checkRequirement('Has en suite', 'notRelevant')
  await matchingInformationPage.checkRequirement('Is suited for sex offenders', 'notRelevant')
  await matchingInformationPage.checkRequirement('Is arson designated', 'notRelevant')

  await matchingInformationPage.checkRequirement('Is suitable for vulnerable', 'notRelevant')
  await matchingInformationPage.checkRequirement('Accepts sex offenders', 'notRelevant')
  await matchingInformationPage.checkRequirement('Accepts child sex offenders', 'notRelevant')
  await matchingInformationPage.checkRequirement('Accepts non sexual child offenders', 'notRelevant')
  await matchingInformationPage.checkRequirement('Accepts hate crime offenders', 'notRelevant')
  await matchingInformationPage.checkRequirement('Is arson suitable', 'notRelevant')

  await matchingInformationPage.checkRadio('Yes')

  await matchingInformationPage.clickSubmit()
}

export const checkAssessAnswers = async (page: Page) => {
  const tasklistPage = new TasklistPage(page)
  await tasklistPage.clickTask('Check assessment answers')

  const checkYourAnswersPage = await AssessPage.initialize(page, 'Check your answers')
  await checkYourAnswersPage.clickContinue()
}

export const submitAssessment = async (page: Page) => {
  const tasklistPage = new TasklistPage(page)
  await tasklistPage.submitAssessment()
}

export const shouldSeeAssessmentConfirmationScreen = async (page: Page) => {
  const confirmationPage = new ConfirmationPage(page)
  await confirmationPage.shouldShowSuccessMessage()
}

export const assessApplication = async (
  { page, user, person }: { page: Page; user: { name: string }; person: TestOptions['person'] },
  applicationId: string,
  { emergencyApplication = false, acceptApplication = true } = {},
) => {
  // Given I visit the Dashboard
  const dashboard = await visitDashboard(page)

  // And I allocate the assessement to myself
  await assignAssessmentToMe(dashboard, page, user.name, applicationId)

  // And I start the assessment
  await startAssessment(page, person.name, applicationId)

  // And I Review the application
  await reviewApplication(page)

  // And I confirm there is enough information in the Assessment
  await confirmInformation(page)

  // And I assess the suitablity of the Application
  await assessSuitability(page, emergencyApplication)

  // And I provide the requirements to support the placement
  await provideRequirements(page)

  // And I make a decision
  await makeDecision(page, { acceptApplication })

  // And I provide matching information if application is accepted
  if (acceptApplication) {
    await addMatchingInformation(page)
  }

  // And I check my answers
  await checkAssessAnswers(page)

  // And I submit my Assessment
  await submitAssessment(page)

  // Then I should see a confirmation screen
  await shouldSeeAssessmentConfirmationScreen(page)
}

export const requestAndAddAdditionalInformation = async (
  { page, user, person }: { page: Page; user: TestOptions['user']; person: TestOptions['person'] },
  applicationId: string,
) => {
  // When I start the assessment
  const dashboard = await visitDashboard(page)
  await assignAssessmentToMe(dashboard, page, user.name, applicationId)
  await startAssessment(page, person.name, applicationId)
  await reviewApplication(page)

  // And I confirm there is not enough information in the Assessment
  await confirmInsufficientInformation(page)

  // Then I am shown a page detailing how to request the information from the PP
  page.getByRole('heading', { name: 'Request information from probation practitioner' })

  // Given I have requested further information
  // When I visit the Dashboard
  await page.getByRole('button', { name: 'Return to dashboard' }).click()

  // Then I should see the application in the 'Requested further information' section
  await page.getByRole('link', { name: 'Requested further information' }).click()
  await page.getByRole('link', { name: person.name }).first().click()

  // And I should be able to add the additional information
  await addAdditionalInformation(page)
}
