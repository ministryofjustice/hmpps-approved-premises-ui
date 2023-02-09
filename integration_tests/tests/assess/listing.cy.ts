import { AllocationsListPage, ListPage } from '../../../cypress_shared/pages/assess'
import Page from '../../../cypress_shared/pages/page'

import assessmentFactory from '../../../server/testutils/factories/assessment'
import clarificationNoteFactory from '../../../server/testutils/factories/clarificationNote'
import userFactory from '../../../server/testutils/factories/user'

context('Assess', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
  })

  it('shows a list of assessments', () => {
    cy.task('stubAuthUser')

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

  it('shows a list of assigned and unassigned assessments', () => {
    const me = userFactory.build()

    // Given there are some allocated assessments
    const allocatedAssessments = assessmentFactory.buildList(5, { allocatedToStaffMember: userFactory.build() })

    // And there are some unallocated assessments
    const unallocatedAssessments = assessmentFactory.buildList(5, { allocatedToStaffMember: null })

    // And there are some assessments allocated to me
    const assessmentsAllocatedToMe = assessmentFactory
      .createdXDaysAgo(2)
      .buildList(3, { status: 'active', allocatedToStaffMember: me })

    cy.task('stubAssessments', [assessmentsAllocatedToMe, allocatedAssessments, unallocatedAssessments].flat())

    // And I am logged in as a workflow manager
    cy.task('stubAuthUser', { roles: ['workflow_manager'], userId: me.id })
    cy.signIn()

    // When I visit the allocations section
    const allocationsListPage = AllocationsListPage.visit(
      [allocatedAssessments, assessmentsAllocatedToMe].flat(),
      unallocatedAssessments,
    )

    // Then I should see the allocated assessments
    allocationsListPage.shouldShowAllocatedAssessments()

    // When I click the unallocated tab
    allocationsListPage.clickUnallocated()

    // Then I should see the unallocated assessments
    allocationsListPage.shouldShowUnallocatedAssessments()

    // When I click to see my assessments
    allocationsListPage.clickMyAssessments()

    // Then I should see the default list page view
    const listPage = Page.verifyOnPage(ListPage, assessmentsAllocatedToMe, [], [])

    // Then I should see my assessments
    listPage.shouldShowAwaitingAssessments()
  })
})
