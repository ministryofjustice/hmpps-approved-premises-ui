import ListPage from '../../pages/tasks/listPage'

import { taskFactory } from '../../../server/testutils/factories'

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

    cy.task('stubReallocatableTasks', {
      tasks: allocatedTasks,
      allocatedFilter: 'allocated',
      page: '1',
      sortDirection: 'asc',
    })

    cy.task('stubReallocatableTasks', {
      tasks: [...unallocatedTasks],
      allocatedFilter: 'unallocated',
      page: '1',
      sortDirection: 'asc',
    })

    // When I visit the tasks dashboard
    const listPage = ListPage.visit(allocatedTasks, unallocatedTasks)

    // Then I should see the tasks that are allocated
    listPage.shouldShowAllocatedTasks()

    // And the tasks that are unallocated
    listPage.shouldShowUnallocatedTasks()
  })

  it('supports pagination', () => {
    cy.task('stubAuthUser')

    // Given I am logged in
    cy.signIn()

    const allocatedTasksPage1 = taskFactory.buildList(10)
    const allocatedTasksPage2 = taskFactory.buildList(10)
    const allocatedTasksPage9 = taskFactory.buildList(10)
    const unallocatedTasks = taskFactory.buildList(1, { allocatedToStaffMember: undefined })

    cy.task('stubReallocatableTasks', { tasks: allocatedTasksPage1, allocatedFilter: 'allocated', page: '1' })

    cy.task('stubReallocatableTasks', { tasks: allocatedTasksPage2, allocatedFilter: 'allocated', page: '2' })

    cy.task('stubReallocatableTasks', { tasks: allocatedTasksPage9, allocatedFilter: 'allocated', page: '9' })

    // When I visit the tasks dashboard
    const listPage = ListPage.visit(allocatedTasksPage1, unallocatedTasks)

    // Then I should see the tasks that are allocated
    listPage.shouldShowAllocatedTasks()
    // When I click next
    listPage.clickNext()

    // Then the API should have received a request for the next page
    cy.task('verifyTasksRequests', { page: '2', allocatedFilter: 'allocated' }).then(requests => {
      expect(requests).to.have.length(1)
    })

    // And I should see the tasks that are allocated
    listPage.shouldShowAllocatedTasks(allocatedTasksPage2)

    // When I click on a page number
    listPage.clickPageNumber('9')

    // Then the API should have received a request for the that page number
    cy.task('verifyTasksRequests', { page: '9', allocatedFilter: 'allocated' }).then(requests => {
      expect(requests).to.have.length(1)
    })

    // And I should see the tasks that are allocated
    listPage.shouldShowAllocatedTasks(allocatedTasksPage9)
  })

  it('supports sorting', () => {
    cy.task('stubAuthUser')

    // Given I am logged in
    cy.signIn()

    const tasks = taskFactory.buildList(10)

    cy.task('stubReallocatableTasks', {
      tasks,
      allocatedFilter: 'allocated',
      page: '1',
      sortDirection: 'asc',
      sortField: 'createdAt',
    })
    cy.task('stubReallocatableTasks', {
      tasks,
      allocatedFilter: 'allocated',
      sortDirection: 'desc',
      sortField: 'createdAt',
    })

    // When I visit the tasks dashboard
    const listPage = ListPage.visit(tasks, [])

    // Then I should see the tasks that are allocated
    listPage.shouldShowAllocatedTasks()

    // When I sort by created at in ascending order
    listPage.clickSortBy('createdAt')

    // Then the dashboard should be sorted by created at
    listPage.shouldBeSortedByField('createdAt', 'descending')

    // And the API should have received a request for the correct sort order
    cy.task('verifyTasksRequests', {
      allocatedFilter: 'allocated',
      page: '1',
      sortDirection: 'desc',
      sortField: 'createdAt',
    }).then(requests => {
      expect(requests).to.have.length(1)
    })
  })
})
