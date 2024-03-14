import ListPage from '../../pages/tasks/listPage'

import { apAreaFactory, taskFactory, userFactory } from '../../../server/testutils/factories'

context('Task Allocation', () => {
  const users = userFactory.buildList(5)

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubUserList', { users, roles: ['assessor', 'matcher'] })
  })

  const apAreaId = '0544d95a-f6bb-43f8-9be7-aae66e3bf244'

  it('shows a list of tasks', () => {
    cy.task('stubAuthUser')

    // Given I am logged in
    cy.signIn()

    const allocatedTasks = taskFactory.buildList(5)
    const unallocatedTasks = taskFactory.buildList(5, { allocatedToStaffMember: undefined })

    cy.task('stubGetAllTasks', {
      tasks: allocatedTasks,
      allocatedFilter: 'allocated',
      page: '1',
      sortDirection: 'asc',
    })

    cy.task('stubGetAllTasks', {
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

    cy.task('stubGetAllTasks', { tasks: allocatedTasksPage1, allocatedFilter: 'allocated', page: '1' })

    cy.task('stubGetAllTasks', { tasks: allocatedTasksPage2, allocatedFilter: 'allocated', page: '2' })

    cy.task('stubGetAllTasks', { tasks: allocatedTasksPage9, allocatedFilter: 'allocated', page: '9' })

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
    const sortFields = ['dueAt', 'person', 'allocatedTo']
    cy.task('stubAuthUser')

    // Given I am logged in
    cy.signIn()

    const tasks = taskFactory.buildList(10)

    cy.task('stubGetAllTasks', {
      tasks,
      allocatedFilter: 'allocated',
      sortDirection: 'asc',
      sortBy: 'createdAt',
    })

    sortFields.forEach(sortField => {
      cy.task('stubGetAllTasks', {
        tasks,
        allocatedFilter: 'allocated',
        page: '1',
        sortDirection: 'asc',
        sortBy: sortField,
      })

      cy.task('stubGetAllTasks', {
        tasks,
        allocatedFilter: 'allocated',
        page: '1',
        sortDirection: 'desc',
        sortBy: sortField,
      })
    })

    cy.task('stubApAreaReferenceData', {
      id: apAreaId,
      name: 'Midlands',
    })

    // When I visit the tasks dashboard
    const listPage = ListPage.visit(tasks, [])

    // Then I should see the tasks that are allocated
    listPage.shouldShowAllocatedTasks()

    sortFields.forEach(sortField => {
      // When I sort by the sortField in ascending order
      listPage.clickSortBy(sortField)

      // Then the dashboard should be sorted by the sortField in ascending order
      listPage.shouldBeSortedByField(sortField, 'ascending')

      // When I sort by the sortField in descending order
      listPage.clickSortBy(sortField)

      // Then the dashboard should be sorted by the sortField in ascending order
      listPage.shouldBeSortedByField(sortField, 'descending')

      // And the API should have received a request for the correct sort order
      cy.task('verifyTasksRequests', {
        allocatedFilter: 'allocated',
        page: '1',
        sortDirection: 'desc',
        sortBy: sortField,
      }).then(requests => {
        expect(requests).to.have.length(1)
      })
    })
  })

  const filterOptions = {
    area: {
      apiKey: 'apAreaId',
      value: apAreaId,
    },
    allocatedToUserId: {
      apiKey: 'allocatedToUserId',
      value: users[0].id,
    },
    requiredQualification: {
      apiKey: 'requiredQualification',
      value: 'womens',
    },
    crnOrName: {
      apiKey: 'crnOrName',
      value: 'CRN123',
      type: 'input',
    },
  }

  Object.keys(filterOptions).forEach(key => {
    it(`allows filter by ${key}`, () => {
      cy.task('stubAuthUser')

      // Given I am logged in
      cy.signIn()

      const allocatedTasks = taskFactory.buildList(10)
      const allocatedTasksFiltered = taskFactory.buildList(1)
      const unallocatedTasks = taskFactory.buildList(1, { allocatedToStaffMember: undefined })

      cy.task('stubGetAllTasks', { tasks: allocatedTasks, allocatedFilter: 'allocated', page: '1' })
      cy.task('stubApAreaReferenceData', {
        id: apAreaId,
        name: 'Midlands',
      })

      // When I visit the tasks dashboard
      const listPage = ListPage.visit(allocatedTasks, unallocatedTasks)

      // Then I should see the tasks that are allocated
      listPage.shouldShowAllocatedTasks()

      // When I filter by region
      cy.task('stubGetAllTasks', {
        tasks: allocatedTasksFiltered,
        allocatedFilter: 'allocated',
        page: '1',
        sortDirection: 'asc',
        [filterOptions[key].apiKey]: filterOptions[key].value,
      })

      if (filterOptions[key].type === 'input') {
        listPage.clearAndCompleteTextInputById(key, filterOptions[key].value)
      } else {
        listPage.searchBy(key, filterOptions[key].value)
      }
      listPage.clickApplyFilter()

      // Then the page should show the results
      listPage.shouldShowAllocatedTasks(allocatedTasksFiltered)
    })
  })

  it('maintains filter on tab change', () => {
    cy.task('stubAuthUser')

    // Given I am logged in
    cy.signIn()

    const allocatedTasks = taskFactory.buildList(10)
    const allocatedTasksFiltered = taskFactory.buildList(1)
    const unallocatedTasks = taskFactory.buildList(1, { allocatedToStaffMember: undefined })

    cy.task('stubGetAllTasks', { tasks: allocatedTasks, allocatedFilter: 'allocated', page: '1' })
    cy.task('stubApAreaReferenceData', {
      id: apAreaId,
      name: 'Midlands',
    })

    // When I visit the tasks dashboard
    const listPage = ListPage.visit(allocatedTasks, unallocatedTasks)

    // Then I should see the tasks that are allocated
    listPage.shouldShowAllocatedTasks()

    // When I filter by region
    cy.task('stubGetAllTasks', {
      tasks: allocatedTasksFiltered,
      allocatedFilter: 'allocated',
      page: '1',
      sortDirection: 'asc',
      apAreaId,
    })

    cy.task('stubGetAllTasks', {
      tasks: allocatedTasksFiltered,
      allocatedFilter: 'unallocated',
      page: '1',
      sortDirection: 'asc',
      apAreaId,
    })

    listPage.searchBy('area', apAreaId)
    listPage.clickApplyFilter()

    // Then the page should show the results
    listPage.shouldShowAllocatedTasks(allocatedTasksFiltered)

    // And click on unallocated tab
    listPage.clickTab('Unallocated')

    // Then the page should keep the area filter
    listPage.shouldHaveSelectText('area', 'Midlands')
  })

  it('retains the unallocated filter when applying other filters', () => {
    cy.task('stubAuthUser')

    // Given I am logged in
    cy.signIn()

    const allocatedTasks = taskFactory.buildList(10)
    const unallocatedTasks = taskFactory.buildList(10, { allocatedToStaffMember: undefined })
    const unallocatedTasksFiltered = taskFactory.buildList(1, { allocatedToStaffMember: undefined })

    cy.task('stubGetAllTasks', {
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
    cy.task('stubGetAllTasks', {
      tasks: unallocatedTasksFiltered,
      allocatedFilter: 'unallocated',
      page: '1',
      sortDirection: 'asc',
      apAreaId,
    })

    listPage.searchBy('area', apAreaId)
    listPage.clickApplyFilter()

    // Then the status filter should be retained and allocated results should be shown
    listPage.shouldHaveActiveTab('Unallocated')
    listPage.shouldShowUnallocatedTasks(unallocatedTasksFiltered)
  })

  it('defaults to user area but allows filter by all areas', () => {
    // Given I have a default area
    const apArea = apAreaFactory.build()
    cy.task('stubAuthUser', { apArea })

    // And i am signed in
    cy.signIn()

    const allocatedTasks = taskFactory.buildList(1)
    const allocatedTasksFiltered = taskFactory.buildList(10)
    const allocatedTasksFilteredPage2 = taskFactory.buildList(10)
    const unallocatedTasks = taskFactory.buildList(1, { allocatedToStaffMember: undefined })

    cy.task('stubGetAllTasks', {
      tasks: allocatedTasks,
      allocatedFilter: 'allocated',
      page: '1',
      apAreaId: apArea.id,
    })

    cy.task('stubGetAllTasks', {
      tasks: allocatedTasksFiltered,
      allocatedFilter: 'allocated',
      page: '1',
      apAreaId: '',
    })

    cy.task('stubGetAllTasks', {
      tasks: allocatedTasksFilteredPage2,
      allocatedFilter: 'allocated',
      page: '2',
      apAreaId: '',
    })

    cy.task('stubGetAllTasks', {
      tasks: allocatedTasksFiltered,
      allocatedFilter: 'allocated',
      sortDirection: 'asc',
      page: '1',
      sortBy: 'dueAt',
      apAreaId: '',
    })

    cy.task('stubApAreaReferenceData', apArea)

    // When I visit the tasks dashboard
    const listPage = ListPage.visit(allocatedTasks, unallocatedTasks)

    // Then I should see the tasks that are allocated to my area
    listPage.shouldShowAllocatedTasks()

    // When I filter by all regions
    listPage.searchBy('area', 'all')
    listPage.clickApplyFilter()

    // Then the page should show the results
    listPage.shouldShowAllocatedTasks(allocatedTasksFiltered)

    // When I visit the next page
    listPage.clickNext()

    cy.task('verifyTasksRequests', { page: '2', allocatedFilter: 'allocated' }).then(requests => {
      expect(requests).to.have.length(1)
    })

    // Then the page should show the results
    listPage.shouldShowAllocatedTasks(allocatedTasksFilteredPage2)

    // When I sort by the due date at in ascending order
    listPage.clickSortBy('dueAt')

    // Then the dashboard should be sorted by the due date
    listPage.shouldBeSortedByField('dueAt', 'ascending')

    // Then the page should show the filtered results
    listPage.shouldShowAllocatedTasks(allocatedTasksFiltered)
  })
})
