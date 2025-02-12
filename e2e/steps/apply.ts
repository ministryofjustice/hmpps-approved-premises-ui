import { Page, expect } from '@playwright/test'

import { AppealDecision, ApplicationType, TestOptions } from '@approved-premises/e2e'
import { Premises } from '@approved-premises/api'
import {
  ApplyPage,
  CRNPage,
  CheckYourAnswersPage,
  ConfirmPersonPage,
  ConfirmationPage,
  DashboardPage,
  ListPage,
  StartPage,
  TasklistPage,
} from '../pages/apply'
import { BasePage } from '../pages/basePage'
import { ShowPage } from '../pages/apply/showPage'
import { assessmentShouldHaveCorrectDeadlineAndAllocatedUser } from './workflow'
import { SelectIndexOffencePage } from '../pages/apply/selectIndexOffencePage'
import { visitDashboard } from './signIn'

export const startAnApplication = async (dashboard: DashboardPage, page: Page) => {
  await dashboard.clickApply()

  const listPage = new ListPage(page)
  await listPage.startApplication()

  const startPage = new StartPage(page)
  await startPage.createApplication()
}

export const enterAndConfirmCrn = async (page: Page, crn: string) => {
  const crnPage = new CRNPage(page)
  await crnPage.enterCrn(crn)
  await crnPage.clickSave()

  const confirmPersonPage = new ConfirmPersonPage(page)
  await confirmPersonPage.clickSave()

  const selectIndexOffencePage = new SelectIndexOffencePage(page)
  await selectIndexOffencePage.selectFirstOffence()
  await selectIndexOffencePage.clickSave()

  const url = page.url()

  return url.match(/applications\/(.+)\/tasks/)[1]
}

export const completeBasicInformationTask = async (
  page: Page,
  withReleaseDate = true,
  applicationType: ApplicationType = 'standard',
  testMappaFlow = false,
  completeCaseManagerSection = false,
) => {
  const notEligiblePage = await ApplyPage.initialize(page, 'This application is not eligible')
  await notEligiblePage.checkRadio('Yes')
  await notEligiblePage.clickSave()

  const exemptionApplicationPage = await ApplyPage.initialize(page, 'Provide details for exemption application')
  await exemptionApplicationPage.checkRadio('Yes')
  await exemptionApplicationPage.fillField('Name of senior manager', 'Some text')
  await exemptionApplicationPage.fillDateField({ year: '2022', month: '3', day: '12' })
  await exemptionApplicationPage.fillField(
    'Provide a summary of the reasons why this is an exempt application',
    'Some text',
  )
  await exemptionApplicationPage.clickSave()

  const confirmYourDetailsPage = await ApplyPage.initialize(page, 'Confirm your details')
  await confirmYourDetailsPage.checkCheckBoxes(['Phone number'])
  await confirmYourDetailsPage.fillField('Phone number', '01234567890')
  await confirmYourDetailsPage.checkRadio('Yes')
  await confirmYourDetailsPage.clickSave()

  if (completeCaseManagerSection) {
    const caseManagerPage = await ApplyPage.initialize(page, 'Add case manager information')
    await caseManagerPage.fillField('Case manager name', 'Bob Case')
    await caseManagerPage.fillField('Case manager email', 'bob@moj.com')
    await caseManagerPage.fillField('Case manager phone number', '01234567890')
    await caseManagerPage.clickSave()
  }

  const transgenderPage = await ApplyPage.initialize(
    page,
    `Is the person transgender or do they have a transgender history?`,
  )
  await transgenderPage.checkRadio('No')
  await transgenderPage.clickSave()

  const relevantDatesPage = await ApplyPage.initialize(page, 'Which of the following dates are relevant?')
  await relevantDatesPage.checkCheckBoxes(['Parole eligibility date', 'Licence expiry date', 'Sentence expiry date'])
  await relevantDatesPage.fillNamedDateField({ year: '2022', month: '3', day: '12' }, 'paroleEligibilityDate')
  await relevantDatesPage.fillNamedDateField({ year: '2022', month: '3', day: '12' }, 'licenceExpiryDate')
  await relevantDatesPage.fillNamedDateField({ year: '2022', month: '3', day: '12' }, 'sentenceExpiryDate')
  await relevantDatesPage.clickSave()

  if (testMappaFlow) {
    const sentenceTypePage = await ApplyPage.initialize(
      page,
      'Which of the following best describes the sentence type the person is on?',
    )
    await sentenceTypePage.checkRadio('Non-statutory, MAPPA case')
    await sentenceTypePage.clickSave()

    const managedByMappaPage = await ApplyPage.initialize(page, 'Is the person managed by MAPPA?')
    await managedByMappaPage.checkRadio('No')
    await managedByMappaPage.clickSave()
  }

  const sentenceTypePage = await ApplyPage.initialize(
    page,
    'Which of the following best describes the sentence type the person is on?',
  )
  await sentenceTypePage.checkRadio('Standard determinate custody')
  await sentenceTypePage.clickSave()

  const releaseTypePage = await ApplyPage.initialize(page, 'What type of release will the application support?')

  const releaseType = 'Licence'
  await releaseTypePage.checkRadio(releaseType)
  await releaseTypePage.clickSave()

  const releaseDatePage = await ApplyPage.initialize(page, `Do you know the person's release date?`)

  if (withReleaseDate) {
    await releaseDatePage.checkRadio('Yes')
    await releaseDatePage.fillReleaseDateField(applicationType)
    await releaseDatePage.clickSave()

    const placementDatePage = await ApplyPage.initialize(page)
    await placementDatePage.checkRadio('Yes')
    await placementDatePage.clickSave()

    if (applicationType === 'emergency' || applicationType === 'shortNotice') {
      const title = applicationType === 'emergency' ? 'Emergency application' : 'Short notice application'
      const emergencyApplicationPage = await ApplyPage.initialize(page, title)
      await emergencyApplicationPage.checkRadio('The risk level has recently escalated')
      await emergencyApplicationPage.clickSave()
    }
  } else {
    await releaseDatePage.checkRadio('No, the release date is to be determined by the parole board or other hearing')
    await releaseDatePage.clickSave()

    const oralHearingDatePage = await ApplyPage.initialize(page, `Do you know the person's oral hearing date?`)
    await oralHearingDatePage.checkRadio('No')
    await oralHearingDatePage.clickSave()
  }

  const purposePage = await ApplyPage.initialize(page, 'What is the purpose of the Approved Premises (AP) placement?')
  await purposePage.checkCheckBoxes(['Public protection', 'Prevent contact with known individuals or victims'])
  await purposePage.clickSave()

  return releaseType
}

export const completeTypeOfApTask = async (page: Page) => {
  const typeOfAp = 'Standard (all AP types)'

  const taskListPage = new TasklistPage(page)
  await taskListPage.clickTask('Type of AP required')

  const typeOfApPage = await ApplyPage.initialize(page, `Which type of AP does the person require?`)
  await typeOfApPage.checkRadio('Standard (all AP types)')
  await typeOfApPage.clickSave()

  return typeOfAp
}

export const completeOasysImportTask = async (page: Page, oasysSections: Array<string>) => {
  const taskListPage = new TasklistPage(page)
  await taskListPage.clickTask('Choose sections of OASys to import')

  const oasysPage = await ApplyPage.initialize(page, 'Which of the following sections of OASys do you want to import?')
  await oasysPage.checkCheckBoxes(oasysSections)
  await oasysPage.clickSave()

  const roshSummaryPage = await ApplyPage.initialize(page)
  await roshSummaryPage.clickSave()

  const offenceAnalysisPage = await ApplyPage.initialize(page)
  await offenceAnalysisPage.clickSave()

  const supportingInformationPage = await ApplyPage.initialize(page)
  page.getByLabel('Alcohol misuse issues contributing to risks of offending and harm').fill('Some details')
  await supportingInformationPage.clickSave()

  const riskManagementPage = await ApplyPage.initialize(page)
  await riskManagementPage.clickSave()

  const riskToSelfPage = await ApplyPage.initialize(page)
  await riskToSelfPage.clickSave()
}

export const completeRisksAndNeedsTask = async (page: Page) => {
  const taskListPage = new TasklistPage(page)
  await taskListPage.clickTask('Add detail about managing risks and needs')

  const riskManagementFeaturesPage = await ApplyPage.initialize(
    page,
    'What features of an Approved Premises (AP) will support the management of risk?',
  )
  await riskManagementFeaturesPage.fillField(
    `Describe why an AP placement is needed to manage the risk of the person`,
    'Some text',
  )
  await riskManagementFeaturesPage.fillField(
    'Provide details of any additional measures that will be necessary for the management of risk',
    'Some text',
  )
  await riskManagementFeaturesPage.clickSave()

  const convictedOffencesPage = await ApplyPage.initialize(
    page,
    `Has the person ever been convicted of the following offences?`,
  )
  await convictedOffencesPage.checkRadio('No')
  await convictedOffencesPage.clickSave()

  const rehabilativeActivitiesPage = await ApplyPage.initialize(
    page,
    "Which of the rehabilitative activities will assist the person's rehabilitation in the Approved Premises (AP)?",
  )
  await rehabilativeActivitiesPage.checkCheckBoxes(['Health', 'Children and families', 'Finance, benefits and debt'])
  await rehabilativeActivitiesPage.fillField(
    'Provide a summary of how these interventions will assist the persons rehabilitation in the AP.',
    'Some text',
  )
  await rehabilativeActivitiesPage.clickSave()
}

export const completePrisonNotesTask = async (page: Page) => {
  const taskListPage = new TasklistPage(page)
  await taskListPage.clickTask('Review prison information')

  const prisonInformationPage = await ApplyPage.initialize(page, 'Prison information')
  // TODO once this CRN has prison case notes again
  // await prisonInformationPage.checkCheckBoxes(['Select case note from Thursday 21 April 2022'])
  await prisonInformationPage.clickTab('Adjudications')
  await prisonInformationPage.clickTab('ACCT')
  await prisonInformationPage.clickTab('Prison case notes')
  await prisonInformationPage.clickSave()
}

export const completeLocationFactorsTask = async (
  page: Page,
): Promise<{ preferredAps: Array<Premises['name']>; preferredPostcode: string }> => {
  const preferredPostcode = 'B71'
  const taskListPage = new TasklistPage(page)
  await taskListPage.clickTask('Describe location factors')

  const locationFactorsPage = await ApplyPage.initialize(page, 'Location factors')
  await locationFactorsPage.fillField(
    'What is the preferred postcode area for the Approved Premises (AP) placement?',
    preferredPostcode,
  )
  await locationFactorsPage.fillField('Give details of why this postcode area would benefit the person', 'Some text')
  await locationFactorsPage.checkRadioInGroup(
    'If an AP Placement is not available in the persons preferred area, would a placement further away be considered?',
    'No',
  )
  await locationFactorsPage.checkRadioInGroup('Are there any restrictions linked to placement location?', 'No')
  await locationFactorsPage.clickSave()

  const preferredApsPage = await ApplyPage.initialize(page, 'Select a preferred AP')

  const firstChoiceAp = await preferredApsPage.selectFirstPremises('First choice AP')
  const secondChoiceAp = await preferredApsPage.selectFirstPremises('Second choice AP')
  const thirdChoiceAp = await preferredApsPage.selectFirstPremises('Third choice AP')
  const fourthChoiceAp = await preferredApsPage.selectFirstPremises('Fourth choice AP')

  preferredApsPage.clickSave()

  return { preferredAps: [firstChoiceAp, secondChoiceAp, thirdChoiceAp, fourthChoiceAp], preferredPostcode }
}

export const completeAccessCulturalAndHealthcareTask = async (page: Page) => {
  const taskListPage = new TasklistPage(page)
  await taskListPage.clickTask('Add access, cultural and healthcare needs')

  const accessNeedsPage = await ApplyPage.initialize(page, 'Access, cultural and healthcare needs')
  await accessNeedsPage.checkCheckBoxes(['None of the above'])
  await accessNeedsPage.checkRadioInGroup(`Does the person have any religious or cultural needs?`, 'No')
  await accessNeedsPage.checkRadioInGroup(`Does the person need an interpreter?`, 'No')
  await accessNeedsPage.checkRadioInGroup('Does this person have care and support needs?', 'No')
  await accessNeedsPage.checkRadioInGroup('Has a care act assessment been completed?', 'No')
  await accessNeedsPage.clickSave()

  const covidPage = await ApplyPage.initialize(page, 'COVID information')
  await covidPage.checkRadioInGroup(`Is the person eligible for COVID-19 vaccination boosters?`, 'No')
  await covidPage.checkRadioInGroup(
    `Is the person immunosuppressed, eligible for nMAB treatment or higher risk as per the definitions in the COVID-19 guidance?`,
    'No',
  )
  await covidPage.clickSave()
}

export const completeFurtherConsiderationsTask = async (page: Page, applicationType: ApplicationType = 'standard') => {
  const taskListPage = new TasklistPage(page)
  await taskListPage.clickTask('Detail further considerations for placement')

  const roomSharingPage = await ApplyPage.initialize(page, 'Room sharing')
  await roomSharingPage.checkRadioInGroup('Is there any evidence that the person may pose a risk to AP staff?', 'No')
  await roomSharingPage.checkRadioInGroup(
    'Is there any evidence that the person may pose a risk to other AP residents?',
    'No',
  )
  await roomSharingPage.checkRadioInGroup(
    'Is there any evidence that the person may pose a risk to other AP residents?',
    'No',
  )
  await roomSharingPage.checkRadioInGroup('Do you have any concerns about the person sharing a bedroom?', 'No')
  await roomSharingPage.checkRadioInGroup(
    'Is there any evidence of previous trauma or significant event in the persons history which would indicate that room share may not be suitable?',
    'No',
  )
  await roomSharingPage.checkRadioInGroup('Is there potential for the person to benefit from a room share?', 'No')
  await roomSharingPage.clickSave()

  const vulnerabilityPage = await ApplyPage.initialize(page, 'Vulnerability')
  await vulnerabilityPage.checkRadioInGroup(
    `Are you aware that the person is vulnerable to exploitation from others?`,
    'No',
  )
  await vulnerabilityPage.checkRadioInGroup(
    `Is there any evidence or expectation that the person may groom, radicalise or exploit others?`,
    'No',
  )
  await vulnerabilityPage.clickSave()

  const previousPlacementsPage = await ApplyPage.initialize(page, 'Previous Approved Premises (AP) placements')
  await previousPlacementsPage.checkRadio('No')
  await previousPlacementsPage.clickSave()

  const cateringRequirementsPage = await ApplyPage.initialize(page, 'Catering requirements')
  await cateringRequirementsPage.checkRadio('No')
  await cateringRequirementsPage.fillField('Provide details', 'Some details')
  await cateringRequirementsPage.clickSave()

  const arsonPage = await ApplyPage.initialize(page, 'Arson')
  await arsonPage.checkRadio('No')
  await arsonPage.clickSave()

  const additionalCircumstancesPage = await ApplyPage.initialize(page, 'Additional circumstances')
  await additionalCircumstancesPage.checkRadio('No')
  await additionalCircumstancesPage.clickSave()

  if (applicationType === 'shortNotice' || applicationType === 'emergency') {
    const contingencyPlansPage = await ApplyPage.initialize(page, 'Contingency plans')
    await contingencyPlansPage.fillField(
      'If the person does not return to the AP for curfew, what actions should be taken?',
      'None',
    )
    await contingencyPlansPage.fillField(
      "If the person's placement needs to be withdrawn out of hours, what actions should be taken?",
      'None',
    )
    await contingencyPlansPage.fillField(
      'If the person does not return to the AP for curfew, what actions should be taken?',
      'None',
    )
    await contingencyPlansPage.fillField(
      'Provide any victim considerations that the AP need to be aware of when out of hours',
      'None',
    )
    await contingencyPlansPage.fillField(
      'In the event of an out of hours placement withdrawal, provide any unsuitable addresses that the person cannot reside at',
      'None',
    )
    await contingencyPlansPage.fillField(
      'In the event of an out of hours placement withdrawal, provide alternative suitable addresses that the person can reside at',
      'None',
    )
    await contingencyPlansPage.fillField(
      'In the event of a breach, provide any further information to support Out of Hours (OoH) decision making',
      'None',
    )
    await contingencyPlansPage.fillField('Are there any other considerations?', 'None')
    await contingencyPlansPage.clickSave()

    const triggerPlansPage = await ApplyPage.initialize(page, 'Contingency plans')
    await triggerPlansPage.checkRadioInGroup('Is there a trigger plan in place?', 'No')
    await triggerPlansPage.checkRadioInGroup(
      'Have additional Licence conditions been requested as an alternative to recall?',
      'No',
    )
    await triggerPlansPage.clickSave()
  }
}

export const completeMoveOnTask = async (page: Page) => {
  const taskListPage = new TasklistPage(page)
  await taskListPage.clickTask('Add move on information')

  const placementDurationPage = await ApplyPage.initialize(page, 'Placement duration and move on')
  await placementDurationPage.checkRadio('No')
  await placementDurationPage.clickSave()

  const moveOnPage = await ApplyPage.initialize(page, 'Placement duration and move on')
  await moveOnPage.fillField(`Where is the person most likely to live when they move on from the AP?`, 'WS1')
  await moveOnPage.clickSave()

  const moveOnArrangementsPage = await ApplyPage.initialize(page, 'Placement duration and move on')
  await moveOnArrangementsPage.checkRadio('No')
  await moveOnArrangementsPage.fillField(
    'Provide detail about any plans to secure accommodation in preparation for move on',
    'Some text',
  )
  await moveOnArrangementsPage.clickSave()

  const typeOfAccommodationPage = await ApplyPage.initialize(page, 'Placement duration and move on')
  await typeOfAccommodationPage.checkRadio('Living with partner, family or friends')
  await typeOfAccommodationPage.clickSave()
}

export const completeAttachRequiredDocuments = async (page: Page) => {
  const taskListPage = new TasklistPage(page)
  await taskListPage.clickTask('Attach required documents')

  const requiredDocumentsPage = await ApplyPage.initialize(
    page,
    'Select any relevant documents to support your application',
  )
  await requiredDocumentsPage.clickSave()
}

export const checkApplyAnswers = async (page: Page) => {
  const taskListPage = new TasklistPage(page)
  await taskListPage.clickTask('Check your answers')

  const checkYourAnswersPage = await CheckYourAnswersPage.initialize(page)
  await checkYourAnswersPage.clickContinue()
}

export const submitApplication = async (page: Page) => {
  const taskListPage = new TasklistPage(page)
  await taskListPage.submitApplication()
}

export const shouldSeeConfirmationPage = async (page: Page) => {
  const confirmationPage = new ConfirmationPage(page)
  await confirmationPage.shouldShowSuccessMessage()
}

export const createApplication = async (
  {
    page,
    person,
    oasysSections,
    applicationType,
  }: {
    page: Page
    person: TestOptions['person']
    oasysSections: Array<string>
    applicationType: ApplicationType
  },
  withReleaseDate: boolean,
  testMappaFlow?: boolean,
) => {
  // Given I visit the Dashboard
  const dashboard = await visitDashboard(page)

  // And I start an application
  await startAnApplication(dashboard, page)

  // And I enter and confirm a CRN
  await enterAndConfirmCrn(page, person.crn)

  // And I complete the basic information Task
  const releaseType = await completeBasicInformationTask(page, withReleaseDate, applicationType, testMappaFlow)

  // And I complete the Type of AP Task
  const apType = await completeTypeOfApTask(page)

  // And I complete the Oasys Import Task
  await completeOasysImportTask(page, oasysSections)

  // And I complete the the Risks and Needs Task
  await completeRisksAndNeedsTask(page)

  // And I complete the prison notes Task
  await completePrisonNotesTask(page)

  // And I complete the Location Factors Task
  const { preferredAps, preferredPostcode } = await completeLocationFactorsTask(page)

  // And I complete the Access, Cultural and Healthcare Task
  await completeAccessCulturalAndHealthcareTask(page)

  // And I complete the Further Considerations Task
  await completeFurtherConsiderationsTask(page, applicationType)

  // And I complete the Move On Task
  await completeMoveOnTask(page)

  // And I complete the Attach Required Documemts Task
  await completeAttachRequiredDocuments(page)

  // And I check my answers
  await checkApplyAnswers(page)

  // And I submit my application
  await submitApplication(page)

  // Then I should see a confirmation message
  await shouldSeeConfirmationPage(page)

  const url = page.url()

  return { id: url.match(/applications\/(.+)\//)[1], preferredAps, apType, preferredPostcode, releaseType }
}

export const withdrawAnApplicationBeforeSubmission = async (page: Page, applicationId: string) => {
  await clickWithdrawLink(page, applicationId)

  await withdrawApplication(page)
}

export const withdrawAnApplicationAfterSubmission = async (page: Page, applicationId: string) => {
  const dashboard = visitDashboard(page)

  ;(await dashboard).clickApply()

  const listPage = new ListPage(page)
  await listPage.clickSubmitted()
  await clickWithdrawLink(page, applicationId)

  await withdrawApplication(page)

  await expect(page.getByRole('alert', { name: 'Success' })).toContainText('Success')
}

export const recordAnAppealOnApplication = async (page: Page, applicationId: string, decision: AppealDecision) => {
  const dashboard = visitDashboard(page)

  ;(await dashboard).clickApply()

  const listPage = new ListPage(page)
  await listPage.filterApplicationsBy('Application rejected')
  await listPage.clickApplicationWithId(applicationId)

  const showPage = new ShowPage(page)
  await showPage.appealApplication(decision)
  if (decision === 'Appeal successful') {
    await showPage.shouldShowAssessmentReopenedBanner()
  } else {
    await showPage.shouldShowAppealRejectedBanner()
  }
}

export const assessmentShouldBeAllocatedToCorrectUser = async (page: Page, applicationId: string, user: string) => {
  const dashboard = await visitDashboard(page)
  await assessmentShouldHaveCorrectDeadlineAndAllocatedUser(dashboard, page, applicationId, 10, user)
}

const withdrawApplication = async (page: Page) => {
  const withdrawalTypePage = new BasePage(page)
  await withdrawalTypePage.checkRadio('Application')
  await withdrawalTypePage.clickContinue()

  const confirmWithdrawalPage = new BasePage(page)
  await confirmWithdrawalPage.checkRadio('There was an error in the application')
  await confirmWithdrawalPage.clickWithdraw()
}

const clickWithdrawLink = async (page: Page, applicationId: string) => {
  await page
    .getByRole('row')
    .filter({ has: page.locator(`[data-cy-id="${applicationId}"]`) })
    .first()
    .getByRole('link')
    .filter({ has: page.getByText('Withdraw') })
    .first()
    .click()
}
