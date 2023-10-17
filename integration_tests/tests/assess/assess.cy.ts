import {
  assessmentFactory,
  assessmentSummaryFactory,
  clarificationNoteFactory,
  documentFactory,
  personFactory,
  userFactory,
} from '../../../server/testutils/factories'

import { overwriteApplicationDocuments } from '../../../server/utils/assessments/documentUtils'
import { acceptanceData } from '../../../server/utils/assessments/acceptanceData'

import AssessHelper from '../../helpers/assess'
import {
  ApplicationTimelinessPage,
  ListPage,
  ShowPage,
  SuitabilityAssessmentPage,
  TaskListPage,
} from '../../pages/assess'
import Page from '../../pages/page'
import SuitabilityAssessment from '../../../server/form-pages/assess/assessApplication/suitablityAssessment/suitabilityAssessment'
import ContingencyPlanSuitabilityPage from '../../pages/assess/contingencyPlanSuitability'

context('Assess', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
  })
  beforeEach(() => {
    // Given I am logged in
    cy.signIn()
    // And there is an application awaiting assessment
    cy.fixture('applicationData.json').then(applicationData => {
      const clarificationNote = clarificationNoteFactory.build({ response: undefined })
      const assessment = assessmentFactory.build({
        decision: undefined,
        application: { data: applicationData, person: personFactory.build() },
        clarificationNotes: [clarificationNote],
      })

      assessment.data = {}
      const documents = documentFactory.buildList(4)
      assessment.application = overwriteApplicationDocuments(assessment.application, documents)
      const user = userFactory.build()

      const assessHelper = new AssessHelper(assessment, documents, user, clarificationNote)

      cy.wrap(assessment).as('assessment')
      cy.wrap(assessHelper).as('assessHelper')
    })
  })

  it('allows me to assess an application', function test() {
    this.assessHelper.setupStubs()

    // And I start an assessment
    this.assessHelper.startAssessment()

    // And I complete an assessment
    this.assessHelper.completeAssessment()

    // Then the API should have received the correct data
    cy.task('verifyAssessmentAcceptance', this.assessment).then(requests => {
      expect(requests).to.have.length(1)

      const body = JSON.parse(requests[0].body)
      expect(body).to.deep.equal(acceptanceData(this.assessHelper.assessment))
    })
  })

  it('allows me to create and update a clarification note', function test() {
    this.assessHelper.setupStubs()

    // And I start an assessment
    this.assessHelper.startAssessment()

    // And I add a clarification note
    const note = 'Note goes here'
    this.assessHelper.addClarificationNote(note)

    cy.task('verifyClarificationNoteCreate', this.assessment)
      .then(requests => {
        // Then the API should have had a clarification note added
        expect(requests).to.have.length(1)
        const body = JSON.parse(requests[0].body)

        expect(body.query).equal(note)
      })
      .then(() => {
        // Given my assessment is put into an awaiting response state
        this.assessHelper.updateAssessmentStatus('awaiting_response')
      })
      .then(() => {
        // When I am redirected to the dashboard
        const listPage = Page.verifyOnPage(ListPage)

        // And I click on my assessment
        listPage.clickAssessment(this.assessment)

        // And I complete the form
        this.assessHelper.updateClarificationNote('yes', 'response text', '2023-09-02')

        // Then I should be redirected to the tasklist page
        const tasklistPage = Page.verifyOnPage(TaskListPage)

        // And the sufficient information task should show a completed status
        tasklistPage.shouldShowTaskStatus('review-application', 'Completed')
      })
      .then(() => {
        cy.task('verifyClarificationNoteUpdate', this.assessment)
      })
      .then(requests => {
        // And the API should have had a clarification note update request
        expect(requests).to.have.length(1)
        const body = JSON.parse(requests[0].body)

        expect(body.response).equal('response text')
        expect(body.responseReceivedOn).equal('2023-09-02')
      })
  })

  it('should allow me to reject an application where I have not received the correct information', function test() {
    this.assessHelper.setupStubs()

    // Given I start an assessment
    this.assessHelper.startAssessment()

    // And I add a clarification note
    this.assessHelper
      .addClarificationNote('Note goes here')
      .then(() => {
        // And my assessment is put into an awaiting response state
        this.assessHelper.updateAssessmentStatus('awaiting_response')
      })
      .then(() => {
        const listPage = Page.verifyOnPage(ListPage)

        // When I click on my assessment
        listPage.clickAssessment(this.assessment)

        // And I respond 'no' to the 'informationReceived' question
        this.assessHelper.updateClarificationNote('no')

        // Then I should be redirected to the tasklist page
        const tasklistPage = Page.verifyOnPage(TaskListPage)

        // And the sufficient information task should show a completed status
        tasklistPage.shouldShowTaskStatus('review-application', 'Completed')

        // And I should see the AssessApplication section
        this.assessHelper.completeSuitabilityOfAssessmentQuestion()

        // When I make a decision
        this.assessHelper.completeMakeADecisionPage('otherReasons')

        // Then I should not see the MatchingInformation section
        tasklistPage.shouldNotShowSection('Information for matching')

        // When I check my answers
        this.assessHelper.completeCheckYourAnswersPage()

        // And I submit the application
        this.assessHelper.submitAssessment(false)
      })
      .then(() => {
        // Then the API should have received the correct data
        cy.task('verifyAssessmentRejection', this.assessment).then(requests => {
          expect(requests).to.have.length(1)

          const body = JSON.parse(requests[0].body)
          expect(body).to.have.keys('document', 'rejectionRationale')
        })
      })
  })

  it('shows a read-only version of the assessment', function test() {
    // Given I have completed an assessment
    const updatedAssessment = { ...this.assessment, status: 'completed' }
    const updatedAssessmentSummary = assessmentSummaryFactory.build({
      id: this.assessment.id,
      status: 'completed',
      person: personFactory.build(),
    })
    cy.task('stubAssessment', updatedAssessment)
    cy.task('stubAssessments', [updatedAssessmentSummary])

    // And I visit the list page
    const listPage = ListPage.visit()

    // When I click on the Completed tab
    listPage.clickCompleted()

    // And I click on my assessment
    listPage.clickAssessment(this.assessment)

    // Then I should see a read-only version of the assessment
    const showPage = Page.verifyOnPage(ShowPage, this.assessment)

    showPage.shouldShowPersonInformation()
    showPage.shouldShowResponses()
  })

  it('invalidates the check your answers step if an answer is changed', function test() {
    // Given there is a complete application in the database
    cy.fixture('assessmentData.json').then(assessmentData => {
      const assessment = assessmentFactory.build({ data: assessmentData, status: 'in_progress' })
      assessment.application.person = personFactory.build()

      cy.task('stubAssessment', assessment)

      // And I visit the tasklist
      TaskListPage.visit(assessment)

      // And I click on a task
      cy.get('[data-cy-task-name="suitability-assessment"]').click()

      // And I change my response
      const suitabilityAssessmentPage = new SuitabilityAssessmentPage(assessment)
      suitabilityAssessmentPage.pageClass = new SuitabilityAssessment(
        {
          riskFactors: 'no',
          riskFactorsComments: '',
          riskManagement: 'yes',
          riskManagementComments: '',
          locationOfPlacement: 'no',
          locationOfPlacementComments: '',
          moveOnPlan: 'yes',
          moveOnPlanComments: '',
        },
        assessment,
      )
      suitabilityAssessmentPage.completeForm()
      suitabilityAssessmentPage.clickSubmit()

      // Then the application should be updated with the Check Your Answers section removed
      cy.task('verifyAssessmentUpdate', assessment).then((requests: Array<{ body: string }>) => {
        expect(requests).to.have.length(1)
        const body = JSON.parse(requests[0].body)

        expect(body.data).not.to.have.keys(['check-your-answers'])
      })
    })
  })

  it('does not invalidate the check your answers step if an answer is reviewed and not changed', function test() {
    // Given there is a complete application in the database
    cy.fixture('assessmentData.json').then(assessmentData => {
      const assessment = assessmentFactory.build({ data: assessmentData, status: 'in_progress' })
      assessment.application.person = personFactory.build()

      cy.task('stubAssessment', assessment)
      cy.task('stubAssessmentUpdate', assessment)

      // And I visit the tasklist
      TaskListPage.visit(assessment)

      // And I click on a task
      cy.get('[data-cy-task-name="suitability-assessment"]').click()

      // And I review a section
      const suitabilityAssessmentPage = new SuitabilityAssessmentPage(assessment)
      suitabilityAssessmentPage.clickSubmit()
      const applicationTimeliness = new ApplicationTimelinessPage(assessment)
      applicationTimeliness.clickSubmit()
      const contingencyPlanPage = new ContingencyPlanSuitabilityPage(assessment)
      contingencyPlanPage.clickSubmit()

      Page.verifyOnPage(TaskListPage)

      // Then the application should be updated with the Check Your Answers section removed
      cy.task('verifyAssessmentUpdate', assessment).then((requests: Array<{ body: string }>) => {
        expect(requests).to.have.length(3)
        const body = JSON.parse(requests[0].body)

        expect(body.data).to.have.any.keys(['check-your-answers'])
      })
    })
  })
})
