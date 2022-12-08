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
  PlacementDurationPage,
  ForeignNationalPage,
  CheckYourAnswersPage,
  ListPage,
  SelectOffencePage,
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
import prisonCaseNotesFactory from '../../../server/testutils/factories/prisonCaseNotes'
import personFactory from '../../../server/testutils/factories/person'
import activeOffenceFactory from '../../../server/testutils/factories/activeOffence'
import risksFactory from '../../../server/testutils/factories/risks'
import adjudicationsFactory from '../../../server/testutils/factories/adjudication'
import { mapApiPersonRisksForUi } from '../../../server/utils/utils'
import AccessNeedsPage from '../../../cypress_shared/pages/apply/accessNeeds'
import AccessNeedsMobilityPage from '../../../cypress_shared/pages/apply/accessNeedsMobility'
import CovidPage from '../../../cypress_shared/pages/apply/covid'
import AccessNeedsAdditionalAdjustmentsPage from '../../../cypress_shared/pages/apply/accessNeedsAdditionalAdjustments'
import RelocationRegionPage from '../../../cypress_shared/pages/apply/relocationRegion'
import PlansInPlacePage from '../../../cypress_shared/pages/apply/plansInPlace'
import TypeOfAccomodationPage from '../../../cypress_shared/pages/apply/typeOfAccommodation'
import CaseNotesPage from '../../../cypress_shared/pages/apply/caseNotes'
import SubmissionConfirmation from '../../../cypress_shared/pages/apply/submissionConfirmation'

context('Apply', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
  })

  it('allows the user to select an index offence if there is more than one offence', () => {
    // Given I am logged in
    cy.signIn()

    // And a person is in Delius
    const person = personFactory.build()
    cy.task('stubFindPerson', { person })

    // And that person has more than one offence listed under their CRN
    const offences = activeOffenceFactory.buildList(4)
    cy.task('stubPersonOffences', { person, offences })

    // And I have started an application
    cy.fixture('applicationData.json').then(applicationData => {
      const application = applicationFactory.build({ person, data: applicationData })
      cy.task('stubApplicationCreate', { application })

      const startPage = StartPage.visit()
      startPage.startApplication()

      // When I enter a CRN
      const crnPage = new EnterCRNPage()
      crnPage.enterCrn(person.crn)
      crnPage.clickSubmit()

      // And I click submit
      const confirmDetailsPage = new ConfirmDetailsPage(person)
      confirmDetailsPage.clickSubmit()

      // Then I should be forwarded to select an offence
      const selectOffencePage = Page.verifyOnPage(SelectOffencePage, person, offences)
      selectOffencePage.shouldDisplayOffences()

      // When I select an offence
      const selectedOffence = offences[0]
      selectOffencePage.selectOffence(selectedOffence)

      // And I click submit
      selectOffencePage.clickSubmit()

      // Then the API should have created the application with my selected offence
      cy.task('verifyApplicationCreate').then(requests => {
        expect(requests).to.have.length(1)

        const body = JSON.parse(requests[0].body)

        expect(body.crn).equal(person.crn)
        expect(body.convictionId).equal(selectedOffence.convictionId)
        expect(body.deliusEventNumber).equal(selectedOffence.deliusEventNumber)
        expect(body.offenceId).equal(selectedOffence.offenceId)
      })

      // Then I should be on the Sentence Type page
      Page.verifyOnPage(SentenceTypePage, application)
    })
  })

  it('shows the details of a person from their CRN', () => {
    // Given I am logged in
    cy.signIn()

    // And a person is in Delius
    const person = personFactory.build()
    const offences = activeOffenceFactory.buildList(1)
    cy.task('stubFindPerson', { person })
    cy.task('stubPersonOffences', { person, offences })

    // And I have started an application
    cy.fixture('applicationData.json').then(applicationData => {
      const application = applicationFactory.build({ person, data: applicationData })
      cy.task('stubApplicationCreate', { application })
      cy.task('stubApplicationUpdate', { application })
      cy.task('stubApplicationGet', { application })

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

      // Then the API should have created the application
      cy.task('verifyApplicationCreate').then(requests => {
        expect(requests).to.have.length(1)

        const body = JSON.parse(requests[0].body)
        const offence = offences[0]

        expect(body.crn).equal(person.crn)
        expect(body.convictionId).equal(offence.convictionId)
        expect(body.deliusEventNumber).equal(offence.deliusEventNumber)
        expect(body.offenceId).equal(offence.offenceId)
      })

      // Then I should be on the Sentence Type page
      const sentenceTypePage = new SentenceTypePage(application)

      // When I select 'Bail Placement'
      sentenceTypePage.checkRadioByNameAndValue('sentenceType', 'bailPlacement')
      sentenceTypePage.clickSubmit()

      // Then I should be on the Situation Page
      const situationPage = new SituationPage(application)

      // When I select 'Bail Sentence'
      situationPage.checkRadioByNameAndValue('situation', 'bailSentence')
      situationPage.clickSubmit()

      // Then I should be asked if I know the release date
      Page.verifyOnPage(ReleaseDatePage, application)

      // And the API should have recieved the updated application
      cy.task('verifyApplicationUpdate', application.id).then(requests => {
        expect(requests).to.have.length(2)

        const firstRequestData = JSON.parse(requests[0].body).data
        const secondRequestData = JSON.parse(requests[1].body).data

        expect(firstRequestData['basic-information']['sentence-type'].sentenceType).equal('bailPlacement')
        expect(secondRequestData['basic-information'].situation.situation).equal('bailSentence')
      })
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
    const apiRisks = risksFactory.build({ crn: person.crn })
    const uiRisks = mapApiPersonRisksForUi(apiRisks)
    const offences = activeOffenceFactory.buildList(1)

    // Given I am logged in
    cy.signIn()

    // And a person is in Delius
    cy.task('stubPersonRisks', { person, risks: apiRisks })
    cy.task('stubFindPerson', { person })
    cy.task('stubPersonOffences', { person, offences })

    // And I have started an application
    cy.fixture('applicationData.json').then(applicationData => {
      const application = applicationFactory.build({ person })
      application.data = applicationData
      cy.task('stubApplicationCreate', { application })
      cy.task('stubApplicationUpdate', { application })
      cy.task('stubApplicationGet', { application })

      const startPage = StartPage.visit()
      startPage.startApplication()

      // And I complete the first step
      const crnPage = new EnterCRNPage()
      crnPage.enterCrn(person.crn)
      crnPage.clickSubmit()

      const confirmDetailsPage = new ConfirmDetailsPage(person)
      confirmDetailsPage.clickSubmit()

      const sentenceTypePage = new SentenceTypePage(application)
      sentenceTypePage.completeForm()
      sentenceTypePage.clickSubmit()

      const situationPage = new SituationPage(application)
      situationPage.completeForm()
      situationPage.clickSubmit()

      const releaseDatePage = new ReleaseDatePage(application)
      releaseDatePage.completeForm()
      releaseDatePage.clickSubmit()

      const placementStartPage = new PlacementStartPage(application)
      placementStartPage.completeForm()
      placementStartPage.clickSubmit()

      const placementPurposePage = new PlacementPurposePage(application)
      placementPurposePage.completeForm()
      placementPurposePage.clickSubmit()

      const basicInformationPages = [sentenceTypePage, releaseDatePage, placementStartPage, placementPurposePage]

      // Then I should be redirected to the task list
      const tasklistPage = Page.verifyOnPage(TaskListPage)

      // And the task should be marked as completed
      tasklistPage.shouldShowTaskStatus('basic-information', 'Completed')

      // And the next task should be marked as not started
      tasklistPage.shouldShowTaskStatus('type-of-ap', 'Not started')

      // And the risk widgets should be visible
      tasklistPage.shouldShowRiskWidgets(uiRisks)

      // And I should be able to start the next task
      cy.get('[data-cy-task-name="type-of-ap"]').click()
      Page.verifyOnPage(TypeOfApPage, application)

      // Given I am on the Type of AP Page
      const typeOfApPage = new TypeOfApPage(application)

      // When I complete the form and click submit
      typeOfApPage.completeForm()
      typeOfApPage.clickSubmit()

      // Then the Type of AP task should show as completed
      tasklistPage.shouldShowTaskStatus('type-of-ap', 'Completed')
      // And the Risk Management Features task should show as not started
      tasklistPage.shouldShowTaskStatus('risk-management-features', 'Not started')

      // Given I click the 'Add detail about managing risks and needs' task
      cy.get('[data-cy-task-name="risk-management-features"]').click()

      const typeOfApPages = [typeOfApPage]

      // When I complete the form
      const riskManagementFeaturesPage = new RiskManagementFeatures(application)
      riskManagementFeaturesPage.completeForm()
      riskManagementFeaturesPage.clickSubmit()

      const convictedOffencesPage = new ConvictedOffences(application)
      convictedOffencesPage.completeForm()
      convictedOffencesPage.clickSubmit()

      const typeOfConvictedOffencePage = new TypeOfConvictedOffence(application)
      typeOfConvictedOffencePage.completeForm()
      typeOfConvictedOffencePage.clickSubmit()

      const dateOfOffencePage = new DateOfOffence(application)
      dateOfOffencePage.completeForm()
      dateOfOffencePage.clickSubmit()

      const rehabilitativeInterventionsPage = new RehabilitativeInterventions(application)
      rehabilitativeInterventionsPage.completeForm()
      rehabilitativeInterventionsPage.clickSubmit()

      const riskManagementPages = [
        riskManagementFeaturesPage,
        convictedOffencesPage,
        typeOfConvictedOffencePage,
        dateOfOffencePage,
        rehabilitativeInterventionsPage,
      ]

      // Then I should be taken back to the task list
      // And the risk management task should show a completed status
      tasklistPage.shouldShowTaskStatus('risk-management-features', 'Completed')

      // Given there is prison case notes for the person in the DB
      const prisonCaseNote1 = prisonCaseNotesFactory.build({
        authorName: 'Denise Collins',
        id: 'a30173ca-061f-42c9-a1a2-28c70b282d3f',
        createdAt: '2022-11-10',
        occurredAt: '2022-10-19',
        sensitive: false,
        subType: 'Ressettlement',
        type: 'Social Care',
        note: 'Note 1',
      })
      const prisonCaseNote2 = prisonCaseNotesFactory.build({
        authorName: 'Leticia Mann',
        id: '4a477187-b77f-4fcc-a919-43a6633ee868',
        createdAt: '2022-07-24',
        occurredAt: '2022-09-22',
        sensitive: true,
        subType: 'Quality Work',
        type: 'General',
        note: 'Note 2',
      })
      const prisonCaseNote3 = prisonCaseNotesFactory.build()
      const prisonCaseNotes = [prisonCaseNote1, prisonCaseNote2, prisonCaseNote3]
      const selectedPrisonCaseNotes = [prisonCaseNote1, prisonCaseNote2]

      const adjudication1 = adjudicationsFactory.build({
        id: 69927,
        reportedAt: '2022-10-09',
        establishment: 'Hawthorne',
        offenceDescription: 'Nam vel nisi fugiat veniam possimus omnis.',
        hearingHeld: false,
        finding: 'NOT_PROVED',
      })
      const adjudication2 = adjudicationsFactory.build({
        id: 39963,
        reportedAt: '2022-07-10',
        establishment: 'Oklahoma City',
        offenceDescription: 'Illum maxime enim explicabo soluta sequi voluptas.',
        hearingHeld: true,
        finding: 'PROVED',
      })
      const adjudication3 = adjudicationsFactory.build({
        id: 77431,
        reportedAt: '2022-05-30',
        establishment: 'Jurupa Valley',
        offenceDescription: 'Quis porro nemo voluptates doloribus atque quis provident iure.',
        hearingHeld: false,
        finding: 'PROVED',
      })
      const adjudications = [adjudication1, adjudication2, adjudication3]
      const moreDetail = 'some details'

      cy.task('stubPrisonCaseNotes', { prisonCaseNotes, person })
      cy.task('stubAdjudications', { adjudications, person })

      // And I click the 'Review prison information' task
      cy.get('[data-cy-task-name="prison-information"]').click()

      const caseNotesPage = new CaseNotesPage(application, selectedPrisonCaseNotes)
      caseNotesPage.shouldDisplayAdjudications(adjudications)
      caseNotesPage.completeForm(moreDetail)
      caseNotesPage.clickSubmit()

      // Given I click the 'Describe location factors' task
      cy.get('[data-cy-task-name="location-factors"]').click()

      // When I complete the form
      const describeLocationFactorsPage = new DescribeLocationFactors(application)
      describeLocationFactorsPage.completeForm()
      describeLocationFactorsPage.clickSubmit()

      const pduTransferPage = new PduTransferPage(application)
      pduTransferPage.completeForm()
      pduTransferPage.clickSubmit()

      const locationFactorsPages = [describeLocationFactorsPage, pduTransferPage]

      // Then I should be taken back to the task list
      // And the location factors task should show a completed status
      tasklistPage.shouldShowTaskStatus('location-factors', 'Completed')

      // Given I click the 'Provide access and healthcare information' task
      cy.get('[data-cy-task-name="access-and-healthcare"]').click()

      // When I complete the form
      const accessNeedsPage = new AccessNeedsPage(application)
      accessNeedsPage.completeForm()
      accessNeedsPage.clickSubmit()

      const accessNeedsMobilityPage = new AccessNeedsMobilityPage(application)
      accessNeedsMobilityPage.completeForm()
      accessNeedsMobilityPage.clickSubmit()

      const accessNeedsAdditionalAdjustmentsPage = new AccessNeedsAdditionalAdjustmentsPage(application)
      accessNeedsAdditionalAdjustmentsPage.completeForm()
      accessNeedsAdditionalAdjustmentsPage.clickSubmit()

      const covidPage = new CovidPage(application)
      covidPage.completeForm()
      covidPage.clickSubmit()

      const accessAndHealthcarePages = [
        accessNeedsPage,
        accessNeedsMobilityPage,
        accessNeedsAdditionalAdjustmentsPage,
        covidPage,
      ]

      Page.verifyOnPage(TaskListPage)

      // Given I click the 'Detail further considerations for placement' task
      cy.get('[data-cy-task-name="further-considerations"]').click()

      // And I complete the Room Sharing page
      const roomSharingPage = new RoomSharingPage(application)
      roomSharingPage.completeForm()
      roomSharingPage.clickSubmit()

      // And I complete the Vulnerability page
      const vulnerabilityPage = new VulnerabilityPage(application)
      vulnerabilityPage.completeForm()
      vulnerabilityPage.clickSubmit()

      // And I complete the Previous Placements page
      const previousPlacementsPage = new PreviousPlacements(application)
      previousPlacementsPage.completeForm()
      previousPlacementsPage.clickSubmit()

      // And I complete the Complex Case Board page
      const complexCaseBoardPage = new ComplexCaseBoard(application)
      complexCaseBoardPage.completeForm()
      complexCaseBoardPage.clickSubmit()

      // And I complete the Catering page
      const cateringPage = new CateringPage(application)
      cateringPage.completeForm()
      cateringPage.clickSubmit()

      // And I complete the Arson page
      const arsonPage = new ArsonPage(application)
      arsonPage.completeForm()
      arsonPage.clickSubmit()

      const furtherConsiderationsPages = [
        roomSharingPage,
        vulnerabilityPage,
        previousPlacementsPage,
        complexCaseBoardPage,
        cateringPage,
        arsonPage,
      ]

      // Then I should be taken back to the task list
      // And the further considerations task should show a completed status
      tasklistPage.shouldShowTaskStatus('further-considerations', 'Completed')

      // Given I click the 'Add move on information' task
      cy.get('[data-cy-task-name="move-on"]').click()

      // And I complete the Placement Duration page
      const placementDurationPage = new PlacementDurationPage(application)
      placementDurationPage.completeForm()
      placementDurationPage.clickSubmit()

      // And I complete the relocation region page
      const relocationRegion = new RelocationRegionPage(application)
      relocationRegion.completeForm()
      relocationRegion.clickSubmit()

      // And I complete the plans in place page
      const plansInPlacePage = new PlansInPlacePage(application)
      plansInPlacePage.completeForm()
      plansInPlacePage.clickSubmit()

      // And I complete the type of accommodation page
      const typeOfAccommodationPage = new TypeOfAccomodationPage(application)
      typeOfAccommodationPage.completeForm()
      typeOfAccommodationPage.clickSubmit()

      const foreignNationalPage = new ForeignNationalPage(application)
      foreignNationalPage.completeForm()
      foreignNationalPage.clickSubmit()

      const moveOnPages = [
        placementDurationPage,
        relocationRegion,
        plansInPlacePage,
        typeOfAccommodationPage,
        foreignNationalPage,
      ]

      // Then I should be taken back to the task list
      // And the move on information task should show a completed status
      tasklistPage.shouldShowTaskStatus('move-on', 'Completed')

      // Given I click the check your answers task
      cy.get('[data-cy-task-name="check-your-answers"]').click()

      // Then I should be on the check your answers page
      const checkYourAnswersPage = new CheckYourAnswersPage()

      // And the page should be populated with my answers
      checkYourAnswersPage.shouldShowPersonInformation(person)
      checkYourAnswersPage.shouldShowBasicInformationAnswers(basicInformationPages)
      checkYourAnswersPage.shouldShowTypeOfApAnswers(typeOfApPages)
      checkYourAnswersPage.shouldShowRiskManagementAnswers(riskManagementPages)
      checkYourAnswersPage.shouldShowCaseNotes(selectedPrisonCaseNotes)
      checkYourAnswersPage.shouldShowAdjudications(adjudications)
      checkYourAnswersPage.shouldShowLocationFactorsAnswers(locationFactorsPages)
      checkYourAnswersPage.shouldShowAccessAndHealthcareAnswers(accessAndHealthcarePages)
      checkYourAnswersPage.shouldShowFurtherConsiderationsAnswers(furtherConsiderationsPages)
      checkYourAnswersPage.shouldShowMoveOnAnswers(moveOnPages)

      // When I have checked my answers
      checkYourAnswersPage.clickSubmit()

      // Then I should be taken back to the task list
      Page.verifyOnPage(TaskListPage)

      // And the check your answers task should show a completed status
      tasklistPage.shouldShowTaskStatus('check-your-answers', 'Completed')

      // Given the application exists in the database
      cy.task('stubApplicationSubmit', { application })

      // When I click submit
      tasklistPage.clickSubmit()

      // Then the application should be submitted to the API
      cy.task('verifyApplicationUpdate', application.id).then(requests => {
        expect(requests).to.have.length(30)
        const requestBody = JSON.parse(requests[29].body)

        expect(requestBody.data).to.deep.equal(applicationData)

        cy.task('validateBodyAgainstApplySchema', requestBody.data).then(result => {
          expect(result).to.equal(true)
        })
      })

      cy.task('verifyApplicationSubmit', application.id).then(requests => {
        expect(requests).to.have.length(1)

        expect(requests[0].url).to.equal(`/applications/${application.id}/submission`)
      })

      // And I should be taken to the confirmation page
      const confirmationPage = new SubmissionConfirmation()

      // Given there are applications in the database
      const applications = applicationFactory.withReleaseDate().buildList(5)
      cy.task('stubApplications', applications)

      // And there are risks in the database
      const risks = risksFactory.buildList(5)
      applications.forEach((stubbedApplication, i) => {
        cy.task('stubPersonRisks', { person: stubbedApplication.person, risks: risks[i] })
      })

      // When I click 'Back to dashboard'
      confirmationPage.clickBackToDashboard()

      // Then I am taken back to the dashboard
      Page.verifyOnPage(ListPage)
    })
  })
})
