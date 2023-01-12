import assessmentFactory from '../../../server/testutils/factories/assessment'
import documentFactory from '../../../server/testutils/factories/document'
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
})
