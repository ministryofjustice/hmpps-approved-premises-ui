import {
  StartPage,
  EnterCRNPage,
  ConfirmDetailsPage,
  SentenceTypePage,
  SituationPage,
  PlacementStartPage,
  ReleaseDatePage,
  TaskListPage,
  TypeOfApPage,
  DescribeLocationFactors,
  RoomSharingPage,
  VulnerabilityPage,
  PreviousPlacements,
  ComplexCaseBoard,
  CateringPage,
  ArsonPage,
} from '../../../cypress_shared/pages/apply'
import ConvictedOffences from '../../../cypress_shared/pages/apply/convictedOffences'
import DateOfOffence from '../../../cypress_shared/pages/apply/dateOfOffence'
import PduTransferPage from '../../../cypress_shared/pages/apply/pduTransfer'
import PlacementPurposePage from '../../../cypress_shared/pages/apply/placementPurpose'
import RehabilitativeInterventions from '../../../cypress_shared/pages/apply/rehabilitativeInterventions'
import RiskManagementFeatures from '../../../cypress_shared/pages/apply/riskManagementFeatures'
import TypeOfConvictedOffence from '../../../cypress_shared/pages/apply/typeOfConvictedOffence'

import Page from '../../../cypress_shared/pages/page'
import applicationFactory from '../../../server/testutils/factories/application'
import personFactory from '../../../server/testutils/factories/person'
import risksFactory from '../../../server/testutils/factories/risks'
import { mapApiPersonRisksForUi } from '../../../server/utils/utils'
import AccessNeedsPage from '../../../cypress_shared/pages/apply/accessNeeds'
import AccessNeedsMobilityPage from '../../../cypress_shared/pages/apply/accessNeedsMobility'
import CovidPage from '../../../cypress_shared/pages/apply/covid'

context('Apply', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
  })

  it('shows the details of a person from their CRN', () => {
    const application = applicationFactory.build()
    cy.task('stubApplicationCreate', { application })
    cy.task('stubApplicationUpdate', { application })

    // Given I am logged in
    cy.signIn()

    // And a person is in Delius
    const person = personFactory.build()
    cy.task('stubFindPerson', { person })

    // And I have started an application
    const startPage = StartPage.visit()
    startPage.startApplication()

    // When I enter a CRN
    const crnPage = new EnterCRNPage()
    crnPage.enterCrn(person.crn)
    crnPage.clickSubmit()

    // Then I should see the person's detail
    const confirmDetailsPage = new ConfirmDetailsPage(person)
    confirmDetailsPage.verifyPersonIsVisible()

    // When I click submit
    confirmDetailsPage.clickSubmit()

    // Then I should be on the Sentence Type page
    const sentenceTypePage = new SentenceTypePage()

    // When I select 'Bail Placement'
    sentenceTypePage.checkRadioByNameAndValue('sentenceType', 'bailPlacement')
    sentenceTypePage.clickSubmit()

    // Then I should be on the Situation Page
    const situationPage = new SituationPage()

    // When I select 'Bail Sentence'
    situationPage.checkRadioByNameAndValue('situation', 'bailSentence')
    situationPage.clickSubmit()

    // Then I should be asked if I know the release date
    Page.verifyOnPage(ReleaseDatePage, application.person)

    // And the API should have recieved the updated application
    cy.task('verifyApplicationUpdate', application.id).then(requests => {
      expect(requests).to.have.length(2)

      const firstRequestData = JSON.parse(requests[0].body).data
      const secondRequestData = JSON.parse(requests[1].body).data

      expect(firstRequestData['basic-information']['sentence-type'].sentenceType).equal('bailPlacement')
      expect(secondRequestData['basic-information'].situation.situation).equal('bailSentence')
    })
  })

  it('shows an error message if the person is not found', () => {
    // Given I am logged in
    cy.signIn()

    // And the person I am about to search for is not in Delius
    const person = personFactory.build()
    cy.task('stubPersonNotFound', { person })

    // And I have started an application
    const startPage = StartPage.visit()
    startPage.startApplication()

    // When I enter a CRN
    const crnPage = new EnterCRNPage()
    crnPage.enterCrn(person.crn)
    crnPage.clickSubmit()

    // Then I should see an error message
    crnPage.shouldShowErrorMessage(person)
  })

  it('allows completion of the form', () => {
    const person = personFactory.build()
    const application = applicationFactory.build({ person })
    const apiRisks = risksFactory.build({ crn: person.crn })
    const uiRisks = mapApiPersonRisksForUi(apiRisks)

    cy.task('stubApplicationCreate', { application })
    cy.task('stubApplicationUpdate', { application })

    // Given I am logged in
    cy.signIn()

    // And a person is in Delius
    cy.task('stubPersonRisks', { person, risks: apiRisks })
    cy.task('stubFindPerson', { person })

    // And I have started an application
    const startPage = StartPage.visit()
    startPage.startApplication()

    // And I complete the first step
    const crnPage = new EnterCRNPage()
    crnPage.enterCrn(person.crn)
    crnPage.clickSubmit()

    const confirmDetailsPage = new ConfirmDetailsPage(person)
    confirmDetailsPage.clickSubmit()

    const sentenceTypePage = new SentenceTypePage()
    sentenceTypePage.checkRadioByNameAndValue('sentenceType', 'bailPlacement')
    sentenceTypePage.clickSubmit()

    const situationPage = new SituationPage()
    situationPage.checkRadioByNameAndValue('situation', 'bailSentence')
    situationPage.clickSubmit()

    const releaseDate = new Date().toISOString()
    const releaseDatePage = new ReleaseDatePage(application.person)
    releaseDatePage.checkRadioByNameAndValue('knowReleaseDate', 'yes')
    releaseDatePage.completeDateInputs('releaseDate', releaseDate)
    situationPage.clickSubmit()

    const placementStartPage = new PlacementStartPage(releaseDate)
    placementStartPage.checkRadioByNameAndValue('startDateSameAsReleaseDate', 'yes')
    placementStartPage.clickSubmit()

    const placementPurposePage = new PlacementPurposePage()
    placementPurposePage.completeForm()
    placementPurposePage.clickSubmit()

    // // Then I should be redirected to the task list
    const tasklistPage = Page.verifyOnPage(TaskListPage)

    // And the task should be marked as completed
    tasklistPage.shouldShowTaskStatus('basic-information', 'Completed')

    // And the next task should be marked as not started
    tasklistPage.shouldShowTaskStatus('type-of-ap', 'Not started')

    // And the risk widgets should be visible
    tasklistPage.shouldShowRiskWidgets(uiRisks)

    // And I should be able to start the next task
    cy.get('[data-cy-task-name="type-of-ap"]').click()
    Page.verifyOnPage(TypeOfApPage, application.person)

    // Given I am on the Type of AP Page
    const typeOfApPage = new TypeOfApPage(person)

    // When I complete the form and click submit
    typeOfApPage.completeForm()
    typeOfApPage.clickSubmit()

    // Then the Type of AP task should show as completed
    tasklistPage.shouldShowTaskStatus('type-of-ap', 'Completed')
    // And the Risk Management Features task should show as not started
    tasklistPage.shouldShowTaskStatus('risk-management-features', 'Not started')

    // Given I click the 'Add detail about managing risks and needs' task
    cy.get('[data-cy-task-name="risk-management-features"]').click()

    // When I complete the form
    const riskManagementFeaturesPage = new RiskManagementFeatures()
    riskManagementFeaturesPage.completeForm()
    riskManagementFeaturesPage.clickSubmit()

    const convictedOffencesPage = new ConvictedOffences(person)
    convictedOffencesPage.completeForm()
    convictedOffencesPage.clickSubmit()

    const typeOfConvictedOffencePage = new TypeOfConvictedOffence(person)
    typeOfConvictedOffencePage.completeForm()
    typeOfConvictedOffencePage.clickSubmit()

    const dateOfOffencePage = new DateOfOffence()
    dateOfOffencePage.completeForm()
    dateOfOffencePage.clickSubmit()

    const rehabilitativeInterventionsPage = new RehabilitativeInterventions()
    rehabilitativeInterventionsPage.completeForm()
    rehabilitativeInterventionsPage.clickSubmit()

    // Then I should be taken back to the task list
    // And the risk management task should show a completed status
    tasklistPage.shouldShowTaskStatus('risk-management-features', 'Completed')

    // Given I click the 'Describe location factors' task
    cy.get('[data-cy-task-name="location-factors"]').click()

    // When I complete the form
    const describeLocationFactorsPage = new DescribeLocationFactors()
    describeLocationFactorsPage.completeForm()
    describeLocationFactorsPage.clickSubmit()

    const pduTransferPage = new PduTransferPage(person)
    pduTransferPage.completeForm()
    pduTransferPage.clickSubmit()

    // Then I should be taken back to the task list
    // And the location factors task should show a completed status
    tasklistPage.shouldShowTaskStatus('location-factors', 'Completed')

    // Given I click the 'Provide access and healthcare information' task
    cy.get('[data-cy-task-name="access-and-healthcare"]').click()

    // When I complete the form
    const accessNeedsPage = new AccessNeedsPage()
    accessNeedsPage.completeForm()
    accessNeedsPage.clickSubmit()

    const accessNeedsMobilityPage = new AccessNeedsMobilityPage(person)
    accessNeedsMobilityPage.completeForm()
    accessNeedsMobilityPage.clickSubmit()

    const covidPage = new CovidPage()
    covidPage.completeForm()
    covidPage.clickSubmit()

    Page.verifyOnPage(TaskListPage)

    // Given I click the 'Detail further considerations for placement' task
    cy.get('[data-cy-task-name="further-considerations"]').click()

    // And I complete the Room Sharing page
    const roomSharingPage = new RoomSharingPage()
    roomSharingPage.completeForm()
    roomSharingPage.clickSubmit()

    // And I complete the Vulnerability page
    const vulnerabilityPage = new VulnerabilityPage(person)
    vulnerabilityPage.completeForm()
    vulnerabilityPage.clickSubmit()

    // And I complete the Previous Placements page
    const previousPlacementsPage = new PreviousPlacements(person)
    previousPlacementsPage.completeForm()
    previousPlacementsPage.clickSubmit()

    // And I complete the Complex Case Board page
    const complexCaseBoardPage = new ComplexCaseBoard(person)
    complexCaseBoardPage.completeForm()
    complexCaseBoardPage.clickSubmit()

    // And I complete the Catering page
    const cateringPage = new CateringPage(person)
    cateringPage.completeForm()
    cateringPage.clickSubmit()

    // And I complete the Arson page
    const arsonPage = new ArsonPage(person)
    arsonPage.completeForm()
    arsonPage.clickSubmit()

    // Then I should be taken back to the task list
    // And the further considerations task should show a completed status
    tasklistPage.shouldShowTaskStatus('further-considerations', 'Completed')
  })
})
