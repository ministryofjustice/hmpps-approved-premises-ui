import { ListPage, TaskListPage } from '../../../cypress_shared/pages/assess'
import ReviewPage from '../../../cypress_shared/pages/assess/review'
import Page from '../../../cypress_shared/pages/page'

import assessmentFactory from '../../../server/testutils/factories/assessment'

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
      const assessment = assessmentFactory.build({ decision: undefined, application: { data: applicationData } })

      cy.task('stubAssessments', [assessment])
      cy.task('stubAssessment', assessment)
      cy.task('stubAssessmentUpdate', assessment)

      // When I visit the assessments dashboard
      const listPage = ListPage.visit([assessment])

      // And I click on the assessment
      listPage.clickAssessment(assessment)

      // Then I should be taken to the task list
      Page.verifyOnPage(TaskListPage)

      // When I click on the 'review application' link
      cy.get('[data-cy-task-name="review-application"]').click()

      // Then I should be taken to the review page
      const reviewPage = new ReviewPage()

      // And be able to complete the form
      reviewPage.shouldShowAnswers(assessment)
      reviewPage.completeForm()
      reviewPage.clickSubmit()

      // Then I should be taken to the task list
      Page.verifyOnPage(TaskListPage)
    })
  })
})
