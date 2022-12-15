import { ListPage } from '../../../cypress_shared/pages/assess'

import assessmentFactory from '../../../server/testutils/factories/assessment'

context('Assess', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
  })

  it('shows a list of assessments', () => {
    // Given I am logged in
    cy.signIn()

    const assessments = []

    // Given there are some applications awaiting assessment
    const assessmentsAwaiting = assessmentFactory.createdXDaysAgo(2).buildList(3, { decision: undefined })
    assessments.push(assessmentsAwaiting)

    // And two of those assessments are running close to the due date
    const assessmentsCloseToDueDate = [
      assessmentFactory.createdXDaysAgo(8).build({ decision: undefined }),
      assessmentFactory.createdXDaysAgo(8).build({ decision: undefined }),
    ]

    assessments.push(assessmentsCloseToDueDate)
    // And there are some completed assessments
    const completedAssesssments = [
      assessmentFactory.build({ decision: 'accepted' }),
      assessmentFactory.build({ decision: 'accepted' }),
      assessmentFactory.build({ decision: 'rejected' }),
    ]

    assessments.push(completedAssesssments)

    cy.task('stubAssessments', assessments.flat())

    // When I visit the assessments dashboard
    const listPage = ListPage.visit(assessmentsAwaiting, assessmentsCloseToDueDate, completedAssesssments)

    // Then I should see the assessments that are awaiting
    listPage.shouldShowAwaitingAssessments()

    // And there should be a notification
    listPage.shouldShowNotification()

    // And the assessments that are running close to the due date should be highlighted
    listPage.shouldHighlightAssessmentsApproachingDueDate()

    // When I click on the completed tab
    listPage.clickCompleted()

    // Then I should see the completed assessments
    listPage.shouldShowCompletedAssessments()
  })
})
