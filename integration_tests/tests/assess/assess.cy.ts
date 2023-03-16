import assessmentFactory from '../../../server/testutils/factories/assessment'
import documentFactory from '../../../server/testutils/factories/document'
import clarificationNoteFactory from '../../../server/testutils/factories/clarificationNote'
import userFactory from '../../../server/testutils/factories/user'

import { overwriteApplicationDocuments } from '../../../server/utils/assessments/documentUtils'

import AssessHelper from '../../../cypress_shared/helpers/assess'
import { ListPage, TaskListPage } from '../../../cypress_shared/pages/assess'
import Page from '../../../cypress_shared/pages/page'

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
        application: { data: applicationData },
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
      expect(body).to.have.keys('document', 'requirements')
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
        // Given my assessment is put into a pending state
        this.assessHelper.updateAssessmentStatus('pending')
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
        // And my assessment is put into a pending state
        this.assessHelper.updateAssessmentStatus('pending')
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

        // And I should not see the AssessApplication section
        tasklistPage.shouldNotShowSection('Assess application')

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
})
