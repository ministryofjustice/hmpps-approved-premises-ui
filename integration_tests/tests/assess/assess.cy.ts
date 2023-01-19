import assessmentFactory from '../../../server/testutils/factories/assessment'
import documentFactory from '../../../server/testutils/factories/document'
import clarificationNoteFactory from '../../../server/testutils/factories/clarificationNote'

import { overwriteApplicationDocuments } from '../../../server/utils/applicationUtils'

import AssessHelper from '../../../cypress_shared/helpers/assess'

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

      const assessHelper = new AssessHelper(assessment, documents)

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
      const assessment = assessmentFactory.build({
        decision: undefined,
        application: { data: applicationData },
      })
      assessment.data = {}
      const documents = documentFactory.buildList(4)
      const clarificationNote = clarificationNoteFactory.build()
      assessment.application = overwriteApplicationDocuments(assessment.application, documents)

      const assessHelper = new AssessHelper(assessment, documents, clarificationNote)

      assessHelper.setupStubs()

      // And I start an assessment
      assessHelper.startAssessment()

      // And I add a clarification note
      const note = 'Note goes here'
      assessHelper.addClarificationNote(note)

      // Then the API should have had a clarification note added
      cy.task('verifyClarificationNoteCreate', assessment).then(requests => {
        expect(requests).to.have.length(1)
        const body = JSON.parse(requests[0].body)

        expect(body.query).equal(note)
      })
    })
  })
})
