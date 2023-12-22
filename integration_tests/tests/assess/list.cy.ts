import { assessmentSummaryFactory } from '../../../server/testutils/factories'
import { ListPage } from '../../pages/assess'
import { awaitingAssessmentStatuses } from '../../../server/utils/assessments/utils'

context('List assessments', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
  })

  it('should list assessments', () => {
    // Given I am logged in
    cy.signIn()

    // And I have some assessments
    const awaitingAssessments = assessmentSummaryFactory.buildList(6)
    const awaitingResponseAssessments = assessmentSummaryFactory.buildList(6)
    const completedAssessments = assessmentSummaryFactory.buildList(6)

    cy.task('stubAssessments', {
      assessments: awaitingAssessments,
      statuses: awaitingAssessmentStatuses,
    })
    cy.task('stubAssessments', {
      assessments: awaitingResponseAssessments,
      statuses: ['awaiting_response'],
    })
    cy.task('stubAssessments', {
      assessments: completedAssessments,
      statuses: ['completed'],
    })

    // And I visit the list page
    const listPage = ListPage.visit()

    // Then I should see the awaiting assessments
    listPage.shouldShowAssessments(awaitingAssessments, 'awaiting_assessment')

    // And I click the requested further information tab
    listPage.clickRequestedFurtherInformation()

    // Then I should see the assessments that are awaiting a response
    listPage.shouldShowAssessments(awaitingResponseAssessments, 'awaiting_response')

    // And I click the completed tab
    listPage.clickCompleted()

    // Then I should see the completed assessments
    listPage.shouldShowAssessments(completedAssessments, 'completed')
  })
})
