import { ApprovedPremisesAssessment as Assessment } from '../../../server/@types/shared'
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
  ContingencyPlanSuitabilityPage,
  ListPage,
  RfapSuitabilityPage,
  ShowPage,
  SuitabilityAssessmentPage,
  TaskListPage,
} from '../../pages/assess'
import Page from '../../pages/page'
import { awaitingAssessmentStatuses } from '../../../server/utils/assessments/utils'
import { addResponseToFormArtifact, addResponsesToFormArtifact } from '../../../server/testutils/addToApplication'

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
      cy.fixture('assessmentData.json').then(assessmentData => {
        const clarificationNote = clarificationNoteFactory.build({ response: undefined })
        const assessment = assessmentFactory.build({
          decision: undefined,
          application: { data: applicationData, person: personFactory.build() },
          clarificationNotes: [clarificationNote],
        })

        assessment.data = assessmentData
        const documents = documentFactory.buildList(4)
        assessment.application = overwriteApplicationDocuments(assessment.application, documents)
        const user = userFactory.build()

        const assessmentNeedingClarification = addResponsesToFormArtifact<Assessment>(
          { ...assessment },
          {
            task: 'sufficient-information',
            page: 'sufficient-information',
            keyValuePairs: {
              sufficientInformation: 'no',
              query: 'clarification note text',
            },
          },
        )

        cy.wrap(assessment).as('assessment')
        cy.wrap(assessmentNeedingClarification).as('assessmentNeedingClarification')
        cy.wrap(documents).as('documents')
        cy.wrap(user).as('user')
        cy.wrap(clarificationNote).as('clarificationNote')
      })
    })
  })

  it('allows me to assess an application', function test() {
    const assessHelper = new AssessHelper(this.assessment, this.documents, this.user, this.clarificationNote)
    assessHelper.setupStubs()

    // And I start an assessment
    assessHelper.startAssessment()

    // And I complete an assessment
    assessHelper.completeAssessment()

    // Then the API should have received the correct data
    cy.task('verifyAssessmentAcceptance', this.assessment).then(requests => {
      expect(requests).to.have.length(1)

      const body = JSON.parse(requests[0].body)
      expect(body).to.deep.equal(acceptanceData(this.assessment))
    })
  })

  it('shows a banner when the assessment has come from an appeal', function test() {
    // Given there is an assessment that has come from an appeal
    const assessmentFromAppeal = { ...this.assessment, createdFromAppeal: true }
    const assessHelper = new AssessHelper(assessmentFromAppeal, this.documents, this.user, this.clarificationNote)
    assessHelper.setupStubs()

    // And I start an assessment
    const taskList = assessHelper.startAssessment()

    // Then I should see a banner telling me that the assessment has come from an appeal
    taskList.shouldShowAppealBanner()
  })

  it('allows me to create and update a clarification note', function test() {
    let assessmentNeedingClarification = addResponsesToFormArtifact<Assessment>(this.assessment, {
      task: 'sufficient-information',
      page: 'sufficient-information',
      keyValuePairs: {
        sufficientInformation: 'no',
        query: 'clarification note text',
      },
    })
    addResponsesToFormArtifact<Assessment>(assessmentNeedingClarification, {
      task: 'sufficient-information',
      page: 'sufficient-information-confirm',
      keyValuePairs: {
        confirm: 'yes',
      },
    })
    assessmentNeedingClarification = addResponsesToFormArtifact<Assessment>(assessmentNeedingClarification, {
      task: 'sufficient-information',
      page: 'information-received',
      keyValuePairs: {
        informationReceived: 'yes',
        response: 'response text',
        'responseReceivedOn-year': '2023',
        'responseReceivedOn-month': '09',
        'responseReceivedOn-day': '02',
      },
    })
    const assessHelper = new AssessHelper(
      assessmentNeedingClarification,
      this.documents,
      this.user,
      this.clarificationNote,
    )
    assessHelper.setupStubs()

    // And I start an assessment
    assessHelper.startAssessment()

    // And I add a clarification note
    assessHelper.addClarificationNote()

    cy.task('verifyClarificationNoteCreate', assessmentNeedingClarification)
      .then(requests => {
        // Then the API should have had a clarification note added
        expect(requests).to.have.length(1)
        const body = JSON.parse(requests[0].body)

        expect(body.query).equal('clarification note text')
      })
      .then(() => {
        // Given my assessment is put into an awaiting response state
        assessHelper.updateAssessmentStatus('awaiting_response')
      })
      .then(() => {
        // When I am redirected to the dashboard
        const listPage = Page.verifyOnPage(ListPage)

        // And I click on my assessment
        listPage.clickAssessment(assessmentNeedingClarification)

        // And I complete the form
        assessHelper.updateClarificationNote('yes')

        // Then I should be redirected to the tasklist page
        const tasklistPage = Page.verifyOnPage(TaskListPage, this.assessment)

        // And the sufficient information task should show a completed status
        tasklistPage.shouldShowTaskStatus('review-application', 'Completed')
      })
      .then(() => {
        cy.task('verifyClarificationNoteUpdate', assessmentNeedingClarification)
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
    let assessment = addResponsesToFormArtifact<Assessment>(this.assessment, {
      task: 'sufficient-information',
      page: 'sufficient-information',
      keyValuePairs: {
        sufficientInformation: 'no',
        query: 'clarification note text',
      },
    })
    assessment = addResponsesToFormArtifact<Assessment>(assessment, {
      task: 'sufficient-information',
      page: 'sufficient-information-confirm',
      keyValuePairs: {
        confirm: 'yes',
      },
    })
    assessment = addResponseToFormArtifact<Assessment>(assessment, {
      task: 'sufficient-information',
      page: 'information-received',
      key: 'informationReceived',
      value: 'no',
    })
    assessment = addResponsesToFormArtifact<Assessment>(assessment, {
      task: 'make-a-decision',
      page: 'make-a-decision',
      keyValuePairs: {
        decision: 'otherReasons',
        decisionRationale: 'reject reason',
      },
    })
    delete assessment.data['matching-information']
    const assessHelper = new AssessHelper(assessment, this.documents, this.user, this.clarificationNote)

    assessHelper.setupStubs()

    // Given I start an assessment
    assessHelper.startAssessment()

    // And I add a clarification note
    assessHelper
      .addClarificationNote()
      .then(() => {
        const listPage = Page.verifyOnPage(ListPage)

        // When I click on my assessment
        listPage.clickAssessment(this.assessment)
        // And I respond 'no' to the 'informationReceived' question
        assessHelper.updateClarificationNote('no')
        // Then I should be redirected to the tasklist page
        const tasklistPage = Page.verifyOnPage(TaskListPage, this.assessment)

        // And the sufficient information task should show a completed status
        tasklistPage.shouldShowTaskStatus('review-application', 'Completed')

        // And I should see the AssessApplication section
        assessHelper.completeSuitabilityOfAssessmentQuestion({ isShortNoticeApplication: false })

        // And I fill out the required actions
        assessHelper.completeRequiredActionsQuestion()

        // When I make a decision
        assessHelper.completeMakeADecisionPage()

        // Then I should not see the MatchingInformation section
        tasklistPage.shouldNotShowSection('Information for matching')

        // When I check my answers
        assessHelper.completeCheckYourAnswersPage()

        // And I submit the application
        assessHelper.submitAssessment(false)
      })
      .then(() => {
        // Then the API should have received the correct data
        cy.task('verifyAssessmentRejection', assessment).then(requests => {
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
    cy.task('stubAssessments', { assessments: [], statuses: awaitingAssessmentStatuses })
    cy.task('stubAssessments', { assessments: [updatedAssessmentSummary], statuses: ['completed'] })

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
      cy.task('stubAssessmentUpdate', assessment)

      // And I visit the tasklist
      TaskListPage.visit(assessment)

      // And I click on a task
      cy.get('[data-cy-task-name="suitability-assessment"]').click()

      // And I change my response
      const suitabilityAssessmentPage = new SuitabilityAssessmentPage(assessment)
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

    let assessment = assessmentFactory.build({ data: this.assessment.data, status: 'in_progress' })

    assessment = addResponsesToFormArtifact<Assessment>(this.assessment, {
      page: 'application-timeliness',
      task: 'suitability-assessment',
      keyValuePairs: {
        agreeWithShortNoticeReason: 'yes',
        agreeWithShortNoticeReasonComments: 'comments',
        reasonForLateApplication: 'other',
      },
    })

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
    const rfapSuitabilityAssessmentPage = new RfapSuitabilityPage(assessment)
    rfapSuitabilityAssessmentPage.clickSubmit()
    const contingencyPlanPage = new ContingencyPlanSuitabilityPage(assessment)
    contingencyPlanPage.clickSubmit()

    Page.verifyOnPage(TaskListPage, assessment)

    // Then the application should be updated with the Check Your Answers section removed
    cy.task('verifyAssessmentUpdate', assessment).then((requests: Array<{ body: string }>) => {
      expect(requests).to.have.length(3)
      const body = JSON.parse(requests[0].body)

      expect(body.data).to.have.any.keys(['check-your-answers'])
    })
  })
})
