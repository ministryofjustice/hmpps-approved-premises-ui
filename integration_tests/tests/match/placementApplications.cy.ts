import { ReleaseTypeOption } from '@approved-premises/api'
import { faker } from '@faker-js/faker'
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
import SameAp from '../../pages/match/placementRequestForm/sameAp'
import AdditionalPlacementDetailsPage from '../../pages/match/placementRequestForm/additionalPlacementDetails'
import DecisionToRelease from '../../pages/match/placementRequestForm/decisionToRelease'
import AdditionalDocuments from '../../pages/match/placementRequestForm/additionalDocuments'
import Page from '../../pages/page'
import paths from '../../../server/paths/api'
import ReviewApplicationConfirmPage from '../../pages/match/reviewApplicationForm/confirmPage'
import { defaultUserId } from '../../mockApis/auth'
import applicationDocument from '../../fixtures/applicationDocument.json'
import { signIn } from '../signIn'
import { AND, GIVEN, THEN, WHEN } from '../../helpers'
import Helper, { SentenceTypeOptions } from '../../helpers/placementApplication'

context('Placement Applications', () => {
  beforeEach(() => {
    cy.task('reset')

    GIVEN('I am signed in as an assessor')
    signIn('assessor', {
      id: defaultUserId,
    })
  })

  describe('Create a placement application', () => {
    const person = personFactory.build()
    const completedApplication = applicationFactory.completed('accepted').build({
      createdByUserId: defaultUserId,
      person,
      document: applicationDocument,
    })

    const placementApplication = placementApplicationFactory.build({
      applicationId: completedApplication.id,
    })

    const documents = documentFactory.buildList(4)

    const requestForPlacement = requestForPlacementFactory.build({})

    beforeEach(() => {
      GIVEN('I have completed an application I am viewing a completed application')
      cy.task('stubApplicationGet', { application: completedApplication })
      cy.task('stubApplications', [completedApplication])

      AND('there is a placement application in the DB')

      cy.task('stubCreatePlacementApplication', placementApplication)
      cy.task('stubPlacementApplicationUpdate', placementApplication)
      cy.task('stubSubmitPlacementApplication', placementApplication)
      cy.task('stubPlacementApplication', placementApplication)
      documents.forEach(document => {
        cy.task('stubPersonDocument', { person, document })
      })
      cy.task('stubApplicationDocuments', { application: completedApplication, documents })

      cy.task('stubApplicationRequestsForPlacement', {
        applicationId: completedApplication.id,
        requestsForPlacement: [requestForPlacement],
      })
    })

    it('allows me to complete form selecting a standard release type', () => {
      WHEN('I start creating the placement application and select a release type of licence')
      const releaseType: ReleaseTypeOption = faker.helpers.arrayElement([
        'licence',
        'hdc',
        'pss',
        'reReleasedPostRecall',
        'reReleasedFollowingFixedTermRecall',
      ])
      const helper = new Helper(completedApplication, placementApplication)
      const { checkSentenceTypePage, sentenceTypePage, releaseTypePage } = helper.startApplication({
        sentenceType: 'standardDeterminate',
        releaseType,
      })

      THEN('I should be on the additional placements details page')
      const additionalPlacementDetailsPage = new AdditionalPlacementDetailsPage()

      WHEN('I add additional details and submit')
      additionalPlacementDetailsPage.completeForm()
      additionalPlacementDetailsPage.clickSubmit()
      cy.task('stubPlacementApplicationFromLastUpdate', { placementApplication })

      helper.completeApplication({
        pageList: [checkSentenceTypePage, sentenceTypePage, releaseTypePage, additionalPlacementDetailsPage],
        sentenceType: 'standardDeterminate',
        releaseType,
      })
    })

    it('allows me to complete form selecting a situation flow', () => {
      WHEN('I start creating the placement application and select a release type of in community')
      const sentenceTypeOptions: SentenceTypeOptions = { sentenceType: 'communityOrder', situation: 'riskManagement' }
      const helper = new Helper(completedApplication, placementApplication)
      const { checkSentenceTypePage, sentenceTypePage, situationPage } = helper.startApplication(sentenceTypeOptions)

      THEN('I should be on the additional placements details page')
      const additionalPlacementDetailsPage = new AdditionalPlacementDetailsPage()

      WHEN('I add addditional details and submit')
      additionalPlacementDetailsPage.completeForm()
      additionalPlacementDetailsPage.clickSubmit()
      cy.task('stubPlacementApplicationFromLastUpdate', { placementApplication })

      helper.completeApplication({
        pageList: [checkSentenceTypePage, sentenceTypePage, situationPage, additionalPlacementDetailsPage],
        ...sentenceTypeOptions,
      })
    })

    it('allows me to complete the form if the reason for placement is ROTL', () => {
      const helper = new Helper(completedApplication, placementApplication)
      WHEN('I start creating the placement application and select a release type of ROTL')
      const { checkSentenceTypePage, sentenceTypePage, releaseTypePage } = helper.startApplication({
        sentenceType: 'standardDeterminate',
        releaseType: 'rotl',
      })

      AND('I complete the previous ROTL form')
      const previousRotlPlacementPage = new PreviousRotlPlacement()
      previousRotlPlacementPage.completeForm()
      previousRotlPlacementPage.clickSubmit()
      cy.task('stubPlacementApplicationFromLastUpdate', { placementApplication })

      const sameApPage = new SameAp()
      sameApPage.checkOnPage()
      sameApPage.completeForm()
      sameApPage.clickSubmit()
      cy.task('stubPlacementApplicationFromLastUpdate', { placementApplication })

      THEN('I am on the multiple ROTL dates page')
      const datesOfPlacementPage = Page.verifyOnPage(DateOfPlacement)
      AND('I can add and remove dates and populate the dates')
      datesOfPlacementPage.exercisePage()

      WHEN('I submit the form')
      datesOfPlacementPage.clickButton('Save and continue')
      cy.task('stubPlacementApplicationFromLastUpdate', { placementApplication })

      helper.completeApplication({
        pageList: [
          checkSentenceTypePage,
          sentenceTypePage,
          releaseTypePage,
          previousRotlPlacementPage,
          sameApPage,
          datesOfPlacementPage,
        ],
        releaseType: 'rotl',
        sentenceType: 'standardDeterminate',
      })
    })

    it('allows me to complete form if the release type is parole', () => {
      WHEN('I start creating the placement application and select a release type of parole')
      const helper = new Helper(completedApplication, placementApplication)
      const { checkSentenceTypePage, sentenceTypePage, releaseTypePage } = helper.startApplication({
        sentenceType: 'standardDeterminate',
        releaseType: 'paroleDirectedLicence',
      })

      THEN('I should be on the decision to release page')
      const decisionToReleasePage = Page.verifyOnPage(DecisionToRelease, placementApplication.id)

      WHEN('I complete the page and submit')
      decisionToReleasePage.completeForm()
      decisionToReleasePage.clickSubmit()
      cy.task('stubPlacementApplicationFromLastUpdate', { placementApplication })

      THEN('I should be on the add documents page')
      const additionalDocumentsPage = Page.verifyOnPage(AdditionalDocuments, documents, documents.slice(0, 2))
      additionalDocumentsPage.shouldDisplayDocuments()

      WHEN('I complete the documents page and submit')
      additionalDocumentsPage.completeForm()
      additionalDocumentsPage.clickSubmit()

      helper.completeApplication({
        pageList: [
          checkSentenceTypePage,
          sentenceTypePage,
          releaseTypePage,
          decisionToReleasePage,
          additionalDocumentsPage,
        ],
        sentenceType: 'standardDeterminate',
        releaseType: 'paroleDirectedLicence',
      })
    })

    it('uses the licence release type copied from the assessment', () => {
      cy.task('stubApplicationGet', {
        application: { ...completedApplication, releaseType: 'licence', sentenceType: 'standardDeterminate' },
      })
      WHEN('I start creating the placement and say that the release type has not changed')
      const helper = new Helper(completedApplication, placementApplication)
      const { checkSentenceTypePage } = helper.startApplication()

      AND('I complete he additional details')
      const additionalPlacementDetailsPage = Page.verifyOnPage(AdditionalPlacementDetailsPage)
      additionalPlacementDetailsPage.completeForm()
      additionalPlacementDetailsPage.clickSubmit()
      cy.task('stubPlacementApplicationFromLastUpdate', { placementApplication })

      AND('I complete the rest of the form')
      helper.completeApplication({
        pageList: [checkSentenceTypePage, additionalPlacementDetailsPage],
        sentenceType: 'standardDeterminate',
        releaseType: 'licence',
      })
    })

    it('uses the rotl release type copied from the assessment', () => {
      cy.task('stubApplicationGet', {
        application: { ...completedApplication, releaseType: 'rotl', sentenceType: 'standardDeterminate' },
      })
      WHEN('I start creating the placement and say that the release type has not changed')
      const helper = new Helper(completedApplication, placementApplication)
      const { checkSentenceTypePage } = helper.startApplication()

      THEN('I should be on the previous ROTL page')
      const previousRotlPlacementPage = new PreviousRotlPlacement()

      WHEN('I enter previous ROTL information')
      previousRotlPlacementPage.completeForm()
      previousRotlPlacementPage.clickSubmit()
      cy.task('stubPlacementApplicationFromLastUpdate', { placementApplication })

      AND('I complete the same AP page')
      const sameApPage = Page.verifyOnPage(SameAp)
      sameApPage.completeForm()
      sameApPage.clickSubmit()
      cy.task('stubPlacementApplicationFromLastUpdate', { placementApplication })

      AND('I add one placement date')
      const datesOfPlacementPage = Page.verifyOnPage(DateOfPlacement)
      datesOfPlacementPage.populateBlock(0, datesOfPlacementPage.datesOfPlacement[0])
      datesOfPlacementPage.clickButton('Save and continue')
      cy.task('stubPlacementApplicationFromLastUpdate', { placementApplication })

      helper.completeApplication({
        pageList: [checkSentenceTypePage, previousRotlPlacementPage, sameApPage, datesOfPlacementPage],
        sentenceType: 'standardDeterminate',
        releaseType: 'rotl',
      })
    })

    it('uses the parole release type copied from the assessment', () => {
      cy.task('stubApplicationGet', {
        application: {
          ...completedApplication,
          releaseType: 'paroleDirectedLicence',
          sentenceType: 'standardDeterminate',
        },
      })
      WHEN('I start creating the placement and say that the release type has not changed')
      const helper = new Helper(completedApplication, placementApplication)
      const { checkSentenceTypePage } = helper.startApplication()

      THEN('I should be on the the decision to release page')
      const decisionToReleasePage = Page.verifyOnPage(DecisionToRelease, placementApplication.id)

      WHEN('I complete the decision to release page')
      decisionToReleasePage.completeForm()
      decisionToReleasePage.clickSubmit()
      cy.task('stubPlacementApplicationFromLastUpdate', { placementApplication })

      AND('I complete the add documents page')
      const additionalDocumentsPage = Page.verifyOnPage(AdditionalDocuments, documents, documents.slice(0, 2))
      additionalDocumentsPage.shouldDisplayDocuments()
      additionalDocumentsPage.completeForm()
      additionalDocumentsPage.clickSubmit()

      AND('I complete the rest of the form')
      helper.completeApplication({
        pageList: [checkSentenceTypePage, decisionToReleasePage, additionalDocumentsPage],
        sentenceType: 'standardDeterminate',
        releaseType: 'paroleDirectedLicence',
      })
    })
  })

  describe('Review a placement application', () => {
    it('allows me to review a placement application', () => {
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

      WHEN('I complete the form')
      page.completeForm()
      page.clickSubmit()

      THEN('I should be taken to the decision page')

      const decisionPage = Page.verifyOnPage(ReviewApplicationDecisionPage)

      WHEN('I complete the form')

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

      WHEN('I click submit without entering text')
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

      WHEN('I complete the form')
      page.completeForm()

      THEN('I should be taken to the decision page')
      const decisionPage = Page.verifyOnPage(ReviewApplicationDecisionPage)

      WHEN('I click submit')
      decisionPage.clickSubmit()

      THEN('the page should render with errors')
      decisionPage.shouldShowErrorMessagesForFields(['decision', 'decisionSummary'], {
        decision: 'You must provide a decision',
        decisionSummary: 'You must provide a decision summary',
      })
    })
  })

  describe('Check suitability of application', () => {
    it('does not allow me to create a placement application if I did not create the application', () => {
      GIVEN('there is an accepted application that I did not create')
      const application = applicationFactory.completed('accepted').build({
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
})
