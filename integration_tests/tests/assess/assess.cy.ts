import { ListPage, TaskListPage } from '../../../cypress_shared/pages/assess'
import Page from '../../../cypress_shared/pages/page'

import assessmentFactory from '../../../server/testutils/factories/assessment'
import risksFactory from '../../../server/testutils/factories/risks'

context('Assess', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
  })

  it('allows me to assess an application', () => {
    // Given I am logged in
    cy.signIn()

    // And there is an application awaiting assessment
    const assessment = assessmentFactory.build({ decision: undefined })

    const { person } = assessment.application
    const risks = risksFactory.build({ crn: person.crn })

    cy.task('stubAssessments', [assessment])
    cy.task('stubAssessment', assessment)
    cy.task('stubPersonRisks', { person, risks })

    // When I visit the assessments dashboard
    const listPage = ListPage.visit([assessment])

    // And I click on the assessment
    listPage.clickAssessment(assessment)

    // Then I should be taken to the task list
    Page.verifyOnPage(TaskListPage)
  })
})
