import ListPage from '../../../cypress_shared/pages/tasks/listPage'

import taskFactory from '../../../server/testutils/factories/task'

context('Tasks', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
  })

  it('shows a list of tasks', () => {
    cy.task('stubAuthUser')

    // Given I am logged in
    cy.signIn()

    const allocatedTasks = taskFactory.buildList(5)
    const unallocatedTasks = taskFactory.buildList(5, { allocatedToStaffMember: undefined })

    cy.task('stubTasks', [...allocatedTasks, ...unallocatedTasks])

    // When I visit the tasks dashboard
    const listPage = ListPage.visit(allocatedTasks, unallocatedTasks)

    // Then I should see the tasks that are allocated
    listPage.shouldShowAllocatedTasks()

    // And the tasks that are unallocated
    listPage.shouldShowUnallocatedTasks()
  })
})
