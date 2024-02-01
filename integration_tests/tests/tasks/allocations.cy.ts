import TaskListPage from '../../pages/tasks/listPage'
import AllocationsPage from '../../pages/tasks/allocationPage'
import Page from '../../pages/page'

import {
  applicationFactory,
  personFactory,
  reallocationFactory,
  taskFactory,
  userFactory,
  userWithWorkloadFactory,
} from '../../../server/testutils/factories'

context('Tasks', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')

    // Given there are some users in the database
    const users = userWithWorkloadFactory.buildList(3)
    const selectedUser = users[0]

    // And there is an allocated task
    const application = applicationFactory
      .withReleaseDate()
      .build({ isPipeApplication: true, isWomensApplication: false })
    const task = taskFactory.build({
      allocatedToStaffMember: userFactory.build(),
      applicationId: application.id,
      taskType: 'Assessment',
    })

    const restrictedPerson = personFactory.build({ isRestricted: true })
    const applicationForRestrictedPerson = applicationFactory.withReleaseDate().build({
      isPipeApplication: true,
      person: restrictedPerson,
      isWomensApplication: false,
    })

    const taskWithRestrictedPerson = taskFactory.build({
      allocatedToStaffMember: userFactory.build(),
      applicationId: applicationForRestrictedPerson.id,
      taskType: 'Assessment',
    })

    const tasks = [task, taskWithRestrictedPerson]

    cy.task('stubReallocatableTasks', {
      tasks,
      allocatedFilter: 'allocated',
      page: '1',
      sortDirection: 'asc',
    })
    cy.task('stubTaskGet', { application, task, users })
    cy.task('stubApplicationGet', { application })
    cy.task('stubApAreaReferenceData', {
      id: '0544d95a-f6bb-43f8-9be7-aae66e3bf244',
      name: 'Midlands',
    })

    // And I am logged in as a workflow manager
    const me = userFactory.build()
    cy.task('stubAuthUser', { roles: ['workflow_manager'], userId: me.id })
    cy.signIn()

    cy.wrap(task).as('task')
    cy.wrap(taskWithRestrictedPerson).as('taskWithRestrictedPerson')
    cy.wrap(tasks).as('tasks')
    cy.wrap(users).as('users')
    cy.wrap(selectedUser).as('selectedUser')
    cy.wrap(application).as('application')
    cy.wrap(applicationForRestrictedPerson).as('applicationForRestrictedPerson')
  })

  it('allows me to allocate a task', function test() {
    cy.task('stubTaskAllocationCreate', {
      task: { ...this.task, applicationId: this.application.id, allocatedToStaffMember: this.selectedUser },
      reallocation: reallocationFactory.build({ taskType: this.task.taskType, user: this.selectedUser }),
    })

    // When I visit the task list page
    const taskListPage = TaskListPage.visit([this.tasks], [])

    // And I click to allocate the task
    taskListPage.clickTask(this.task)

    // Then I should be on the Allocations page for that task
    const allocationsPage = Page.verifyOnPage(AllocationsPage, this.application, this.task)

    // And I should see some information about that task
    allocationsPage.shouldShowInformationAboutTask()

    // And I should see a list of staff members who can be allocated to that task
    allocationsPage.shouldShowUserTable(this.users, this.task)

    // When I select a new user to allocate the application to
    allocationsPage.clickAllocateToUser(this.users[0])

    // Then I should be redirected to the index page
    Page.verifyOnPage(TaskListPage, [], [])

    // And I should see a confirmation message
    taskListPage.shouldShowBanner(`Assessment has been allocated to ${this.selectedUser.name}`)

    // And the API should have received the correct data
    cy.task('verifyAllocationCreate', this.task).then(requests => {
      // Then the API should have had a clarification note added
      expect(requests).to.have.length(1)
      const body = JSON.parse(requests[0].body)

      expect(body.userId).equal(this.selectedUser.id)
    })
  })

  it('highlights if a person is limited access offender', function test() {
    cy.task('stubTaskGet', {
      application: this.applicationForRestrictedPerson,
      task: this.taskWithRestrictedPerson,
      users: this.users,
    })
    cy.task('stubApplicationGet', { application: this.applicationForRestrictedPerson })

    // When I visit the task list page
    const taskListPage = TaskListPage.visit([this.tasks], [])
    taskListPage.clickTask(this.taskWithRestrictedPerson)

    // Then I should be on the Allocations page for that task
    const allocationsPage = Page.verifyOnPage(
      AllocationsPage,
      this.applicationForRestrictedPerson,
      this.taskWithRestrictedPerson,
    )

    allocationsPage.shouldShowPersonIsLimitedAccessOffender()
  })
})
