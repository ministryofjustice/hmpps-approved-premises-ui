import assessmentFactory from '../../../server/testutils/factories/assessment'
import documentFactory from '../../../server/testutils/factories/document'
import clarificationNoteFactory from '../../../server/testutils/factories/clarificationNote'
import userFactory from '../../../server/testutils/factories/user'

import { overwriteApplicationDocuments } from '../../../server/utils/applicationUtils'

import AssessHelper from '../../../cypress_shared/helpers/assess'
import { ListPage, TaskListPage } from '../../../cypress_shared/pages/assess'
import Page from '../../../cypress_shared/pages/page'

context('Assess', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
  })

  it('allows me to assess an application', () => {
    // Given I am logged in
    cy.signIn()
    cy.fixture('applicationData.json').then(applicationData => {
      // And there is an application awaiting assessment
      const assessment = assessmentFactory.build({
        decision: undefined,
        application: { data: applicationData },
      })
      assessment.data = {}
      const documents = documentFactory.buildList(4)
      assessment.application = overwriteApplicationDocuments(assessment.application, documents)
      const user = userFactory.build()

      const assessHelper = new AssessHelper(assessment, documents, user)

      assessHelper.setupStubs()

      // And I start an assessment
      assessHelper.startAssessment()

      // And I complete an assessment
      assessHelper.completeAssessment()
    })
  })

  it('allows me to create and update a clarification note', () => {
    // Given I am logged in
    cy.signIn()
    cy.fixture('applicationData.json').then(applicationData => {
      // And there is an application awaiting assessment
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

      assessHelper.setupStubs()

      // And I start an assessment
      assessHelper.startAssessment()

      // And I add a clarification note
      const note = 'Note goes here'
      assessHelper.addClarificationNote(note)

      // Then the API should have had a clarification note added
      cy.task('verifyClarificationNoteCreate', assessment)
        .then(requests => {
          expect(requests).to.have.length(1)
          const body = JSON.parse(requests[0].body)

          expect(body.query).equal(note)
        })
        .then(() => {
          // And I should be on redirected to the dashboard
          const listPage = Page.verifyOnPage(ListPage)

          // And my assessment should be put into a pending state
          assessHelper.updateAssessmentStatus('pending').then(() => {
            // When I click on my assessment
            listPage.clickAssessment(assessment)

            // And I complete the form
            assessHelper.updateClarificationNote('response text', '2023-09-02')

            // Then I should be redirected to the tasklist page
            const tasklistPage = Page.verifyOnPage(TaskListPage)

            // And the sufficient information task should show a completed status
            tasklistPage.shouldShowTaskStatus('review-application', 'Completed')

            // And the API should have had a clarification note update request
            cy.task('verifyClarificationNoteUpdate', assessment).then(requests => {
              expect(requests).to.have.length(1)
              const body = JSON.parse(requests[0].body)

              expect(body.response).equal('response text')
              expect(body.responseReceivedOn).equal('2023-09-02')
            })
          })
        })
    })
  })
})
