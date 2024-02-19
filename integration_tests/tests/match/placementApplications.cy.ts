import { ApprovedPremisesApplication as Application } from '../../../server/@types/shared'
import {
  applicationFactory,
  documentFactory,
  personFactory,
  placementApplicationFactory,
  placementApplicationTaskFactory,
} from '../../../server/testutils/factories'
import ListPage from '../../pages/match/listPlacementRequestsPage'
import ReviewApplicationPage from '../../pages/match/reviewApplicationForm/reviewApplicationPage'
import ReviewApplicationDecisionPage from '../../pages/match/reviewApplicationForm/decisionPage'
import { ShowPage } from '../../pages/apply'
import DateOfPlacement from '../../pages/match/placementRequestForm/datesOfPlacement'
import PreviousRotlPlacement from '../../pages/match/placementRequestForm/previousRotlPlacement'
import ReasonForPlacementPage from '../../pages/match/placementRequestForm/reasonForPlacement'
import SameAp from '../../pages/match/placementRequestForm/sameAp'
import UpdatesToApplication from '../../pages/match/placementRequestForm/updatesToApplication'
import CheckYourAnswers from '../../pages/match/placementRequestForm/checkYourAnswers'
import ConfirmationPage from '../../pages/match/placementRequestForm/confirmationPage'
import AdditionalPlacementDetailsPage from '../../pages/match/placementRequestForm/additionalPlacementDetails'
import DecisionToRelease from '../../pages/match/placementRequestForm/decisionToRelease'
import AdditionalDocuments from '../../pages/match/placementRequestForm/additionalDocuments'
import Page from '../../pages/page'
import paths from '../../../server/paths/api'
import { addResponseToFormArtifact } from '../../../server/testutils/addToApplication'
import ReviewApplicationConfirmPage from '../../pages/match/reviewApplicationForm/confirmPage'

context('Placement Applications', () => {
  const userId = 'some-user-id'

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser', { userId })
  })

  beforeEach(() => {
    cy.signIn()
  })

  it('allows me to complete form if the reason for placement is ROTL', () => {
    cy.fixture('rotlPlacementApplicationData.json').then(placementApplicationData => {
      // Given I have completed an application I am viewing a completed application
      const completedApplication = applicationFactory.completed('accepted').build({
        id: '123',
        createdByUserId: userId,
        person: personFactory.build(),
      })
      cy.task('stubApplicationGet', { application: completedApplication })
      cy.task('stubApplications', [completedApplication])

      // And there is a placement application in the DB
      const placementApplicationId = '123'
      const placementApplication = placementApplicationFactory.build({
        id: placementApplicationId,
        data: placementApplicationData,
        applicationId: completedApplication.id,
      })
      cy.task('stubCreatePlacementApplication', placementApplication)
      cy.task('stubPlacementApplicationUpdate', placementApplication)
      cy.task('stubSubmitPlacementApplication', placementApplication)
      cy.task('stubPlacementApplication', placementApplication)
      cy.task('stubApplicationPlacementRequests', {
        applicationId: completedApplication.id,
        placementApplications: [placementApplication],
      })

      // Given I am on the readonly application view
      const showPage = ShowPage.visit(completedApplication)

      // When I click the Request Placement Application tab
      showPage.clickRequestAPlacementTab()

      // Then I should be able to create a placement
      showPage.clickCreatePlacementButton()

      // Given I am on the placement application form and start and application
      const placementReasonPage = ReasonForPlacementPage.visit(placementApplicationId)

      // When I complete the form
      placementReasonPage.completeForm('rotl')
      placementReasonPage.clickSubmit()

      const previousRotlPlacementPage = new PreviousRotlPlacement()
      previousRotlPlacementPage.completeForm()
      previousRotlPlacementPage.clickSubmit()

      const sameApPage = new SameAp()
      sameApPage.completeForm()
      sameApPage.clickSubmit()

      const datesOfPlacementPage = new DateOfPlacement()
      datesOfPlacementPage.completeForm()
      datesOfPlacementPage.clickSaveAndContinue()

      const updatesToApplication = new UpdatesToApplication()
      updatesToApplication.completeForm()
      updatesToApplication.clickSubmit()

      const checkYourAnswersPage = new CheckYourAnswers()
      checkYourAnswersPage.completeForm()
      checkYourAnswersPage.clickSubmit()

      // Then I should be taken to the confirmation page
      Page.verifyOnPage(ConfirmationPage)
      cy.task('verifyPlacementApplicationSubmit', placementApplication.id).then(requests => {
        expect(requests).to.have.length(1)

        expect(requests[0].url).to.equal(paths.placementApplications.submit({ id: placementApplication.id }))

        const body = JSON.parse(requests[0].body)

        expect(body).to.have.keys('placementDates', 'placementType', 'translatedDocument')
      })
    })
  })

  it('allows me to complete form if the reason for placement is an additional placement on an existing application', () => {
    cy.fixture('existingApplicationPlacementApplication.json').then(placementApplicationData => {
      // Given I have completed an application I am viewing a completed application
      const completedApplication = applicationFactory.completed('accepted').build({
        id: '123',
        createdByUserId: userId,
        person: personFactory.build(),
      })
      cy.task('stubApplicationGet', { application: completedApplication })
      cy.task('stubApplications', [completedApplication])

      // And there is a placement application in the DB
      const placementApplicationId = '123'
      const placementApplication = placementApplicationFactory.build({
        id: placementApplicationId,
        data: placementApplicationData,
        applicationId: completedApplication.id,
      })
      cy.task('stubCreatePlacementApplication', placementApplication)
      cy.task('stubPlacementApplicationUpdate', placementApplication)
      cy.task('stubSubmitPlacementApplication', placementApplication)
      cy.task('stubPlacementApplication', placementApplication)
      cy.task('stubApplicationPlacementRequests', {
        applicationId: completedApplication.id,
        placementApplications: [placementApplication],
      })

      // Given I am on the readonly application view
      const showPage = ShowPage.visit(completedApplication)

      // When I click the Request Placement Application tab
      showPage.clickRequestAPlacementTab()

      // Then I should be able to create a placement
      showPage.clickCreatePlacementButton()

      // Given I am on the placement application form and start and application
      const placementReasonPage = ReasonForPlacementPage.visit(placementApplicationId)

      // When I complete the form
      placementReasonPage.completeForm('additional_placement')
      placementReasonPage.clickSubmit()

      const additionalPlacementDetailsPage = new AdditionalPlacementDetailsPage()
      additionalPlacementDetailsPage.completeForm()
      additionalPlacementDetailsPage.clickSubmit()

      const updatesToApplication = new UpdatesToApplication()
      updatesToApplication.completeForm()
      updatesToApplication.clickSubmit()

      const checkYourAnswersPage = new CheckYourAnswers()
      checkYourAnswersPage.completeForm()
      checkYourAnswersPage.clickSubmit()

      // Then I should be taken to the confirmation page
      Page.verifyOnPage(ConfirmationPage)
      cy.task('verifyPlacementApplicationSubmit', placementApplication.id).then(requests => {
        expect(requests).to.have.length(1)

        expect(requests[0].url).to.equal(paths.placementApplications.submit({ id: placementApplication.id }))

        const body = JSON.parse(requests[0].body)

        expect(body).to.have.keys('placementDates', 'placementType', 'translatedDocument')
      })
    })
  })

  it('allows me to complete form if the reason for placement is parole board', () => {
    cy.fixture('paroleBoardPlacementApplication.json').then(placementApplicationData => {
      // Given I have completed an application I am viewing a completed application
      const person = personFactory.build()
      let completedApplication = applicationFactory.completed('accepted').build({
        id: '123',
        createdByUserId: userId,
        person,
      })
      completedApplication = addResponseToFormArtifact(completedApplication, {
        task: 'type-of-ap',
        page: 'ap-type',
        key: 'type',
        value: 'standard',
      }) as Application

      cy.task('stubApplicationGet', { application: completedApplication })
      cy.task('stubApplications', [completedApplication])

      // And there is a placement application in the DB
      const placementApplicationId = '123'
      const placementApplication = placementApplicationFactory.build({
        id: placementApplicationId,
        data: placementApplicationData,
        applicationId: completedApplication.id,
      })
      const documents = documentFactory.buildList(4)
      documents.forEach(document => {
        cy.task('stubPersonDocument', { person: personFactory, document })
      })
      cy.task('stubCreatePlacementApplication', placementApplication)
      cy.task('stubPlacementApplicationUpdate', placementApplication)
      cy.task('stubSubmitPlacementApplication', placementApplication)
      cy.task('stubPlacementApplication', placementApplication)
      cy.task('stubApplicationDocuments', { application: completedApplication, documents })
      cy.task('stubApplicationPlacementRequests', {
        applicationId: completedApplication.id,
        placementApplications: [placementApplication],
      })

      // Given I am on the readonly application view
      const showPage = ShowPage.visit(completedApplication)

      // When I click the Request Placement Application tab
      showPage.clickRequestAPlacementTab()

      // Then I should be able to create a placement
      showPage.clickCreatePlacementButton()

      // Given I am on the placement application form and start and application
      const placementReasonPage = ReasonForPlacementPage.visit(placementApplicationId)

      // When I complete the form
      placementReasonPage.completeForm('release_following_decision')
      placementReasonPage.clickSubmit()

      const decisionToReleasePage = new DecisionToRelease()
      decisionToReleasePage.completeForm()
      decisionToReleasePage.clickSubmit()

      const additionalDocumentsPage = new AdditionalDocuments(documents, documents.slice(0, 2))
      additionalDocumentsPage.shouldDisplayDocuments()
      additionalDocumentsPage.completeForm()
      additionalDocumentsPage.clickSubmit()

      const updatesToApplication = new UpdatesToApplication()
      updatesToApplication.completeForm()
      updatesToApplication.clickSubmit()

      const checkYourAnswersPage = new CheckYourAnswers()

      checkYourAnswersPage.completeForm()
      checkYourAnswersPage.clickSubmit()
    })
  })

  it('allows me to review an application', () => {
    // Given there is a placement request task and placement application in the database
    const placementApplicationTasks = placementApplicationTaskFactory.buildList(1)

    const document = {
      'request-a-placement': [{ 'test question 1': 'test answer 1' }, { 'test question 2': 'test answer 2' }],
    }
    const placementApplication = placementApplicationFactory.build({ id: placementApplicationTasks[0].id, document })
    cy.task('stubPlacementApplication', placementApplication)

    cy.task('stubGetAllTasks', {
      type: 'PlacementApplication',
      tasks: placementApplicationTasks,
      allocatedToUserId: 'some-user-id',
      allocatedFilter: 'allocated',
    })

    // When I visit the placementRequests dashboard
    const listPage = ListPage.visit()
    listPage.clickPlacementApplications()

    // And I click on the first name
    listPage.clickPersonName(placementApplicationTasks[0].personName)

    // Then I should be taken to the review applications page
    const page = Page.verifyOnPage(ReviewApplicationPage)
    page.checkPageContents(placementApplication)

    // And when I complete the form
    page.completeForm()
    page.clickSubmit()

    // Then I should be taken to the decision page

    const decisionPage = Page.verifyOnPage(ReviewApplicationDecisionPage)

    // And when I complete the form

    cy.task('stubSubmitPlacementApplicationDecision', placementApplication)

    decisionPage.checkRadioByNameAndValue('decision', 'accepted')
    decisionPage.getTextInputByIdAndEnterDetails('decisionSummary', 'some summary notes')
    decisionPage.clickSubmit()

    // Then I should be taken to the confirm submission page
    cy.task('verifyPlacementApplicationReviewSubmit', placementApplication.id).then(requests => {
      expect(requests).to.have.length(1)
      expect(requests[0].url).to.equal(paths.placementApplications.submitDecision({ id: placementApplication.id }))

      const body = JSON.parse(requests[0].body)

      expect(body).to.contain.keys('decision', 'decisionSummary', 'summaryOfChanges')
    })

    Page.verifyOnPage(ReviewApplicationConfirmPage)
  })

  it('renders with errors if I do not complete the summary of changes in the review', () => {
    // Given there is a placement request task and placement application in the database
    const placementApplicationTasks = placementApplicationTaskFactory.buildList(1)

    const document = {
      'request-a-placement': [{ 'test question 1': 'test answer 1' }, { 'test question 2': 'test answer 2' }],
    }
    const placementApplication = placementApplicationFactory.build({ id: placementApplicationTasks[0].id, document })
    cy.task('stubPlacementApplication', placementApplication)

    cy.task('stubGetAllTasks', {
      type: 'PlacementApplication',
      tasks: placementApplicationTasks,
      allocatedToUserId: 'some-user-id',
      allocatedFilter: 'allocated',
    })

    // When I visit the placementRequests dashboard
    const listPage = ListPage.visit()
    listPage.clickPlacementApplications()

    // And I click on the first name
    listPage.clickPersonName(placementApplicationTasks[0].personName)

    // Then I should be taken to the review applications page
    const page = Page.verifyOnPage(ReviewApplicationPage)

    // And when I click submit without entering text
    page.clickSubmit()

    // Then the page should render with errors
    page.shouldShowErrorMessagesForFields(['summaryOfChanges'], {
      summaryOfChanges: 'You must provide a summary of the changes',
    })
  })

  it('renders with errors if I do not complete the decision summary in the review', () => {
    // Given there is a placement request task and placement application in the database
    const placementApplicationTasks = placementApplicationTaskFactory.buildList(1)

    const document = {
      'request-a-placement': [{ 'test question 1': 'test answer 1' }, { 'test question 2': 'test answer 2' }],
    }
    const placementApplication = placementApplicationFactory.build({ id: placementApplicationTasks[0].id, document })
    cy.task('stubPlacementApplication', placementApplication)
    cy.task('stubGetAllTasks', {
      type: 'PlacementApplication',
      tasks: placementApplicationTasks,
      allocatedToUserId: 'some-user-id',
      allocatedFilter: 'allocated',
    })

    // When I visit the placementRequests dashboard
    const listPage = ListPage.visit()
    listPage.clickPlacementApplications()

    // And I click on the first name
    listPage.clickPersonName(placementApplicationTasks[0].personName)

    // Then I should be taken to the review applications page
    const page = Page.verifyOnPage(ReviewApplicationPage)

    // And when I complete the form
    page.completeForm()

    // Then I should be taken to the decision page
    const decisionPage = Page.verifyOnPage(ReviewApplicationDecisionPage)

    // And when I click submit
    decisionPage.clickSubmit()

    // Then the page should render with errors
    decisionPage.shouldShowErrorMessagesForFields(['decision', 'decisionSummary'], {
      decision: 'You must provide a decision',
      decisionSummary: 'You must provide a decision summary',
    })
  })

  it('does not allow me to create a placement application if I did not create the application', () => {
    // Given there is an accepted application that I did not create
    const application = applicationFactory.completed('accepted').build({
      id: '123',
      person: personFactory.build(),
    })
    cy.task('stubApplicationGet', { application })

    // When I visit the readonly application view
    const showPage = ShowPage.visit(application)

    // Then I should not be able to click submit
    showPage.shouldNotShowCreatePlacementButton()
  })

  it('does not allow me to create a placement application if the assessment was rejected', () => {
    // Given there is an rejected application that I created
    const application = applicationFactory.completed('rejected').build({
      id: '123',
      createdByUserId: userId,
      person: personFactory.build(),
    })
    cy.task('stubApplicationGet', { application })

    // When I visit the readonly application view
    const showPage = ShowPage.visit(application)

    // Then I should not be able to click submit
    showPage.shouldNotShowCreatePlacementButton()
  })

  it('does not allow me to create a placement application if the assessment is not yet assessed', () => {
    // Given there is an unassesed application that I created
    const application = applicationFactory.build({
      status: 'submitted',
      id: '123',
      createdByUserId: userId,
      assessmentDecision: undefined,
      person: personFactory.build(),
    })
    cy.task('stubApplicationGet', { application })

    // When I visit the readonly application view
    const showPage = ShowPage.visit(application)

    // Then I should not be able to click submit
    showPage.shouldNotShowCreatePlacementButton()
  })
})
