import ListPage from '../../pages/tasks/listPage'

import { taskFactory } from '../../../server/testutils/factories'

context('Tasks', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
  })

  const apAreaId = '0544d95a-f6bb-43f8-9be7-aae66e3bf244'

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

    cy.task('stubApAreaReferenceData', {
      id: apAreaId,
      name: 'Midlands',
    })

    // When I visit the tasks dashboard
    const listPage = ListPage.visit(allocatedTasks, unallocatedTasks)

    // Then I should see the tasks that are allocated
    listPage.shouldShowAllocatedTasks()

    // And the tasks that are unallocated
    listPage.clickTab('Unallocated')
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

    cy.task('stubApAreaReferenceData', {
      id: apAreaId,
      name: 'Midlands',
    })

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

    cy.task('stubApAreaReferenceData', {
      id: apAreaId,
      name: 'Midlands',
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

  it('allows filter', () => {
    cy.task('stubAuthUser')

    // Given I am logged in
    cy.signIn()

    const allocatedTasks = taskFactory.buildList(10)
    const allocatedTasksFiltered = taskFactory.buildList(1)
    const unallocatedTasks = taskFactory.buildList(1, { allocatedToStaffMember: undefined })

    cy.task('stubReallocatableTasks', { tasks: allocatedTasks, allocatedFilter: 'allocated', page: '1' })
    cy.task('stubApAreaReferenceData', {
      id: apAreaId,
      name: 'Midlands',
    })

    // When I visit the tasks dashboard
    const listPage = ListPage.visit(allocatedTasks, unallocatedTasks)

    // Then I should see the tasks that are allocated
    listPage.shouldShowAllocatedTasks()

    // When I filter by region
    cy.task('stubReallocatableTasks', {
      tasks: allocatedTasksFiltered,
      allocatedFilter: 'allocated',
      page: '1',
      sortDirection: 'asc',
      apAreaId,
    })

    listPage.searchBy('areas', apAreaId)
    listPage.clickApplyFilter()

    // Then the page should show the results
    listPage.shouldShowAllocatedTasks(allocatedTasksFiltered)
  })

  it('retains the unallocated filter when applying other filters', () => {
    cy.task('stubAuthUser')

    // Given I am logged in
    cy.signIn()

    const allocatedTasks = taskFactory.buildList(10)
    const unallocatedTasks = taskFactory.buildList(10, { allocatedToStaffMember: undefined })
    const unallocatedTasksFiltered = taskFactory.buildList(1, { allocatedToStaffMember: undefined })

    cy.task('stubReallocatableTasks', {
      tasks: unallocatedTasks,
      allocatedFilter: 'unallocated',
      page: '1',
      sortDirection: 'asc',
    })
    cy.task('stubApAreaReferenceData', {
      id: apAreaId,
      name: 'Midlands',
    })

    // Given I am on the tasks dashboard filtering by the unallocated tab
    const listPage = ListPage.visit(allocatedTasks, unallocatedTasks, 'allocatedFilter=unallocated')

    // Then I should see the tasks that are allocated
    listPage.shouldShowUnallocatedTasks()

    // When I filter by region
    cy.task('stubReallocatableTasks', {
      tasks: unallocatedTasksFiltered,
      allocatedFilter: 'unallocated',
      page: '1',
      sortDirection: 'asc',
      apAreaId,
    })

    listPage.searchBy('areas', apAreaId)
    listPage.clickApplyFilter()

    // Then the status filter should be retained and allocated results should be shown
    listPage.shouldHaveActiveTab('Unallocated')
    listPage.shouldShowUnallocatedTasks(unallocatedTasksFiltered)
  })
})
