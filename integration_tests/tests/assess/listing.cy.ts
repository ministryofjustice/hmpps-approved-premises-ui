import { ListPage } from '../../../cypress_shared/pages/assess'

import assessmentFactory from '../../../server/testutils/factories/assessment'
import clarificationNoteFactory from '../../../server/testutils/factories/clarificationNote'

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
    const assessmentsAwaiting = assessmentFactory.createdXDaysAgo(2).buildList(3, { status: 'active' })
    assessments.push(assessmentsAwaiting)

    // And two of those assessments are running close to the due date
    const assessmentsCloseToDueDate = [
      assessmentFactory.createdXDaysAgo(8).build({ status: 'active' }),
      assessmentFactory.createdXDaysAgo(8).build({ status: 'active' }),
    ]

    assessments.push(assessmentsCloseToDueDate)

    // And there are some pending assessments
    const pendingAssessments = assessmentFactory
      .createdXDaysAgo(3)
      .buildList(4, { status: 'pending', clarificationNotes: [clarificationNoteFactory.createdXDaysAgo(1).build()] })

    assessments.push(pendingAssessments)

    // And there are some completed assessments
    const completedAssesssments = [
      assessmentFactory.build({ status: 'completed' }),
      assessmentFactory.build({ status: 'completed' }),
      assessmentFactory.build({ status: 'completed' }),
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

    // When I click on the awaiting tab
    listPage.clickRequestedFurtherInformation()

    // Then I should see the assessments that are pending
    listPage.shouldShowPendingAssessments()

    // When I click on the completed tab
    listPage.clickCompleted()

    // Then I should see the completed assessments
    listPage.shouldShowCompletedAssessments()
  })
})
