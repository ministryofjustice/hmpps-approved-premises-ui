import { ApprovedPremisesApplication as Application } from '../../../server/@types/shared'
import {
  applicationFactory,
  documentFactory,
  personFactory,
  placementApplicationFactory,
  placementApplicationTaskFactory,
  requestForPlacementFactory,
} from '../../../server/testutils/factories'
import ListPage from '../../pages/assess/listPage'
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
import { defaultUserId } from '../../mockApis/auth'
import applicationDocument from '../../fixtures/applicationDocument.json'
import { signIn } from '../signIn'
import { AND, GIVEN, THEN, WHEN } from '../../helpers'

context('Placement Applications', () => {
  beforeEach(() => {
    cy.task('reset')

    GIVEN('I am signed in as an assessor')
    signIn('assessor', {
      id: defaultUserId,
    })
  })

  it('allows me to complete form if the reason for placement is ROTL', () => {
    cy.fixture('rotlPlacementApplicationData.json').then(placementApplicationData => {
      GIVEN('I have completed an application I am viewing a completed application')
      const completedApplication = applicationFactory.completed('accepted').build({
        id: '123',
        createdByUserId: defaultUserId,
        person: personFactory.build(),
        document: applicationDocument,
      })
      cy.task('stubApplicationGet', { application: completedApplication })
      cy.task('stubApplications', [completedApplication])

      AND('there is a placement application in the DB')
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

      const requestForPlacement = requestForPlacementFactory.build({})
      cy.task('stubApplicationRequestsForPlacement', {
        applicationId: completedApplication.id,
        requestsForPlacement: [requestForPlacement],
      })

      GIVEN('I am on the readonly application view')
      const showPage = ShowPage.visit(completedApplication)

      WHEN('I click the Request Placement Application tab')
      showPage.clickRequestAPlacementTab()

      THEN('I should be able to create a placement')
      showPage.clickCreatePlacementButton()

      GIVEN('I am on the placement application form and start an application')
      const placementReasonPage = ReasonForPlacementPage.visit(placementApplication.id)

      WHEN('I complete the form')
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

      THEN('I should be taken to the confirmation page')
      Page.verifyOnPage(ConfirmationPage)
      cy.task('verifyPlacementApplicationSubmit', placementApplication.id).then(requests => {
        expect(requests).to.have.length(1)

        expect(requests[0].url).to.equal(paths.placementApplications.submit({ id: placementApplication.id }))

        const body = JSON.parse(requests[0].body)

        expect(body).to.have.keys('requestedPlacementPeriods', 'placementType', 'translatedDocument')
      })
    })
  })

  it('allows me to complete form if the reason for placement is an additional placement on an existing application', () => {
    cy.fixture('existingApplicationPlacementApplication.json').then(placementApplicationData => {
      GIVEN('I have completed an application I am viewing a completed application')
      const completedApplication = applicationFactory.completed('accepted').build({
        id: '123',
        createdByUserId: defaultUserId,
        person: personFactory.build(),
        document: applicationDocument,
      })
      cy.task('stubApplicationGet', { application: completedApplication })
      cy.task('stubApplications', [completedApplication])

      AND('there is a placement application in the DB')
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
      const requestForPlacement = requestForPlacementFactory.build({})
      cy.task('stubApplicationRequestsForPlacement', {
        applicationId: completedApplication.id,
        requestsForPlacement: [requestForPlacement],
      })

      GIVEN('I am on the readonly application view')
      const showPage = ShowPage.visit(completedApplication)

      WHEN('I click the Request Placement Application tab')
      showPage.clickRequestAPlacementTab()

      THEN('I should be able to create a placement')
      showPage.clickCreatePlacementButton()

      GIVEN('I am on the placement application form and start and application')
      const placementReasonPage = ReasonForPlacementPage.visit(placementApplicationId)

      WHEN('I complete the form')
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

      THEN('I should be taken to the confirmation page')
      Page.verifyOnPage(ConfirmationPage)
      cy.task('verifyPlacementApplicationSubmit', placementApplication.id).then(requests => {
        expect(requests).to.have.length(1)

        expect(requests[0].url).to.equal(paths.placementApplications.submit({ id: placementApplication.id }))

        const body = JSON.parse(requests[0].body)

        expect(body).to.have.keys('requestedPlacementPeriods', 'placementType', 'translatedDocument')
      })
    })
  })

  it('allows me to complete form if the reason for placement is parole board', () => {
    cy.fixture('paroleBoardPlacementApplication.json').then(placementApplicationData => {
      GIVEN('I have completed an application I am viewing a completed application')
      const person = personFactory.build()
      let completedApplication = applicationFactory.completed('accepted').build({
        id: '123',
        createdByUserId: defaultUserId,
        person,
        document: applicationDocument,
      })
      completedApplication = addResponseToFormArtifact(completedApplication, {
        task: 'type-of-ap',
        page: 'ap-type',
        key: 'type',
        value: 'normal',
      }) as Application

      cy.task('stubApplicationGet', { application: completedApplication })
      cy.task('stubApplications', [completedApplication])

      AND('there is a placement application in the DB')
      const placementApplicationId = '123'
      const placementApplication = placementApplicationFactory.build({
        id: placementApplicationId,
        data: placementApplicationData,
        applicationId: completedApplication.id,
      })
      const documents = documentFactory.buildList(4)
      documents.forEach(document => {
        cy.task('stubPersonDocument', { person, document })
      })
      cy.task('stubCreatePlacementApplication', placementApplication)
      cy.task('stubPlacementApplicationUpdate', placementApplication)
      cy.task('stubSubmitPlacementApplication', placementApplication)
      cy.task('stubPlacementApplication', placementApplication)
      cy.task('stubApplicationDocuments', { application: completedApplication, documents })
      const requestForPlacement = requestForPlacementFactory.build({})
      cy.task('stubApplicationRequestsForPlacement', {
        applicationId: completedApplication.id,
        requestsForPlacement: [requestForPlacement],
      })

      GIVEN('I am on the readonly application view')
      const showPage = ShowPage.visit(completedApplication)

      WHEN('I click the Request Placement Application tab')
      showPage.clickRequestAPlacementTab()

      THEN('I should be able to create a placement')
      showPage.clickCreatePlacementButton()

      GIVEN('I am on the placement application form and start and application')
      const placementReasonPage = ReasonForPlacementPage.visit(placementApplicationId)

      WHEN('I complete the form')
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
    GIVEN('there is a placement request task and placement application in the database')
    const placementApplicationTasks = placementApplicationTaskFactory.buildList(1)

    const document = {
      'request-a-placement': [{ 'test question 1': 'test answer 1' }, { 'test question 2': 'test answer 2' }],
    }
    const placementApplication = placementApplicationFactory.build({ id: placementApplicationTasks[0].id, document })
    cy.task('stubPlacementApplication', placementApplication)

    cy.task('stubGetAllTasks', {
      types: ['PlacementApplication'],
      tasks: placementApplicationTasks,
      allocatedToUserId: defaultUserId,
      allocatedFilter: 'allocated',
      sortBy: null,
      sortDirection: null,
    })

    WHEN('I visit the placementRequests dashboard')
    const listPage = ListPage.visit('requests_for_placement')
    listPage.clickRequestsForPlacement()

    AND('I click on the first name')
    listPage.clickPersonName(placementApplicationTasks[0].personName)

    THEN('I should be taken to the review applications page')
    const page = Page.verifyOnPage(ReviewApplicationPage)
    page.checkPageContents(placementApplication)

    AND('when I complete the form')
    page.completeForm()
    page.clickSubmit()

    THEN('I should be taken to the decision page')

    const decisionPage = Page.verifyOnPage(ReviewApplicationDecisionPage)

    AND('when I complete the form')

    cy.task('stubSubmitPlacementApplicationDecision', placementApplication)

    decisionPage.checkRadioByNameAndValue('decision', 'accepted')
    decisionPage.getTextInputByIdAndEnterDetails('decisionSummary', 'some summary notes')
    decisionPage.clickSubmit()

    THEN('I should be taken to the confirm submission page')
    cy.task('verifyPlacementApplicationReviewSubmit', placementApplication.id).then(requests => {
      expect(requests).to.have.length(1)
      expect(requests[0].url).to.equal(paths.placementApplications.submitDecision({ id: placementApplication.id }))

      const body = JSON.parse(requests[0].body)

      expect(body).to.contain.keys('decision', 'decisionSummary', 'summaryOfChanges')
    })

    Page.verifyOnPage(ReviewApplicationConfirmPage)
  })

  it('renders with errors if I do not complete the summary of changes in the review', () => {
    GIVEN('there is a placement request task and placement application in the database')
    const placementApplicationTasks = placementApplicationTaskFactory.buildList(1)

    const document = {
      'request-a-placement': [{ 'test question 1': 'test answer 1' }, { 'test question 2': 'test answer 2' }],
    }
    const placementApplication = placementApplicationFactory.build({ id: placementApplicationTasks[0].id, document })
    cy.task('stubPlacementApplication', placementApplication)

    cy.task('stubGetAllTasks', {
      type: 'PlacementApplication',
      tasks: placementApplicationTasks,
      allocatedToUserId: defaultUserId,
      allocatedFilter: 'allocated',
      sortBy: null,
      sortDirection: null,
    })

    WHEN('I visit the placementRequests dashboard')
    const listPage = ListPage.visit('requests_for_placement')

    AND('I click on the first name')
    listPage.clickPersonName(placementApplicationTasks[0].personName)

    THEN('I should be taken to the review applications page')
    const page = Page.verifyOnPage(ReviewApplicationPage)

    AND('when I click submit without entering text')
    page.clickSubmit()

    THEN('the page should render with errors')
    page.shouldShowErrorMessagesForFields(['summaryOfChanges'], {
      summaryOfChanges: 'You must provide a summary of the changes',
    })
  })

  it('renders with errors if I do not complete the decision summary in the review', () => {
    GIVEN('there is a placement request task and placement application in the database')
    const placementApplicationTasks = placementApplicationTaskFactory.buildList(1)

    const document = {
      'request-a-placement': [{ 'test question 1': 'test answer 1' }, { 'test question 2': 'test answer 2' }],
    }
    const placementApplication = placementApplicationFactory.build({ id: placementApplicationTasks[0].id, document })
    cy.task('stubPlacementApplication', placementApplication)
    cy.task('stubGetAllTasks', {
      type: 'PlacementApplication',
      tasks: placementApplicationTasks,
      allocatedToUserId: defaultUserId,
      allocatedFilter: 'allocated',
      sortBy: null,
      sortDirection: null,
    })

    WHEN('I visit the placementRequests dashboard')
    const listPage = ListPage.visit('requests_for_placement')

    AND('I click on the first name')
    listPage.clickPersonName(placementApplicationTasks[0].personName)

    THEN('I should be taken to the review applications page')
    const page = Page.verifyOnPage(ReviewApplicationPage)

    AND('when I complete the form')
    page.completeForm()

    THEN('I should be taken to the decision page')
    const decisionPage = Page.verifyOnPage(ReviewApplicationDecisionPage)

    AND('when I click submit')
    decisionPage.clickSubmit()

    THEN('the page should render with errors')
    decisionPage.shouldShowErrorMessagesForFields(['decision', 'decisionSummary'], {
      decision: 'You must provide a decision',
      decisionSummary: 'You must provide a decision summary',
    })
  })

  it('does not allow me to create a placement application if I did not create the application', () => {
    GIVEN('there is an accepted application that I did not create')
    const application = applicationFactory.completed('accepted').build({
      id: '123',
      person: personFactory.build(),
      document: applicationDocument,
    })
    cy.task('stubApplicationGet', { application })

    WHEN('I visit the readonly application view')
    const showPage = ShowPage.visit(application)

    THEN('I should not be able to click submit')
    showPage.shouldNotShowCreatePlacementButton()
  })

  it('does not allow me to create a placement application if the assessment was rejected', () => {
    GIVEN('there is an rejected application that I created')
    const application = applicationFactory.completed('rejected').build({
      id: '123',
      createdByUserId: defaultUserId,
      person: personFactory.build(),
      document: applicationDocument,
    })
    cy.task('stubApplicationGet', { application })

    WHEN('I visit the readonly application view')
    const showPage = ShowPage.visit(application)

    THEN('I should not be able to click submit')
    showPage.shouldNotShowCreatePlacementButton()
  })

  it('does not allow me to create a placement application if the assessment is not yet assessed', () => {
    GIVEN('there is an unassesed application that I created')
    const application = applicationFactory.build({
      status: 'awaitingAssesment',
      id: '123',
      createdByUserId: defaultUserId,
      assessmentDecision: undefined,
      person: personFactory.build(),
      document: applicationDocument,
    })
    cy.task('stubApplicationGet', { application })

    WHEN('I visit the readonly application view')
    const showPage = ShowPage.visit(application)

    THEN('I should not be able to click submit')
    showPage.shouldNotShowCreatePlacementButton()
  })
})
