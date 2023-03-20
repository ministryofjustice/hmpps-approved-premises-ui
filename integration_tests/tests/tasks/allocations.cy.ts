import TaskListPage from '../../../cypress_shared/pages/tasks/listPage'
import AllocationsPage from '../../../cypress_shared/pages/tasks/allocationPage'
import Page from '../../../cypress_shared/pages/page'

import taskFactory from '../../../server/testutils/factories/task'
import userFactory from '../../../server/testutils/factories/user'
import applicationFactory from '../../../server/testutils/factories/application'

context('Tasks', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')

    // Given there are some users in the database
    const users = userFactory.buildList(3)
    const selectedUser = users[0]

    cy.task('stubUsers', { users, roles: ['assessor'], qualifications: ['pipe'] })

    // And there is an allocated task
    const application = applicationFactory
      .withReleaseDate()
      .build({ isPipeApplication: true, isWomensApplication: false })
    const task = taskFactory.build({ allocatedToStaffMember: userFactory.build(), applicationId: application.id })

    cy.task('stubTasks', [task])
    cy.task('stubApplicationGet', { application })

    // And I am logged in as a workflow manager
    const me = userFactory.build()
    cy.task('stubAuthUser', { roles: ['workflow_manager'], userId: me.id })
    cy.signIn()

    cy.wrap(task).as('task')
    cy.wrap(users).as('users')
    cy.wrap(selectedUser).as('selectedUser')
    cy.wrap(application).as('application')
  })

  it('allows me to allocate a task', function test() {
    cy.task('stubTaskAllocationCreate', {
      application: this.application,
      task: { ...this.task, allocatedToStaffMember: this.selectedUser },
    })

    // When I visit the task list page
    const taskListPage = TaskListPage.visit([this.task], [])

    // And I click to allocate the task
    taskListPage.clickTask(this.task)

    // Then I should be on the Allocations page for that task
    const allocationsPage = Page.verifyOnPage(AllocationsPage, this.application)

    // And I should see some information about that task
    allocationsPage.shouldShowInformationAboutTask()

    // And I should see a list of staff members who can be allocated to that task
    allocationsPage.shouldShowUsers(this.users)

    // When I select a new user to allocate the application to
    allocationsPage.selectUser(this.selectedUser)
    allocationsPage.clickSubmit()

    // Then I should be redirected to the index page
    Page.verifyOnPage(TaskListPage, [], [])

    // And I should see a confirmation message
    taskListPage.shouldShowBanner(`Case has been allocated to ${this.selectedUser.name}`)

    // And the API should have received the correct data
    cy.task('verifyAllocationCreate', this.application).then(requests => {
      // Then the API should have had a clarification note added
      expect(requests).to.have.length(1)
      const body = JSON.parse(requests[0].body)

      expect(body.userId).equal(this.selectedUser.id)
    })
  })

  it('shows an error when I do not select a user', function test() {
    cy.task('stubAllocationErrors', this.application)

    // Given I am on the allocations page
    const allocationsPage = AllocationsPage.visit(this.application)

    // And I click submit without selecting a user
    allocationsPage.clickSubmit()

    // Then I should see an error
    allocationsPage.shouldShowErrorMessagesForFields(['userId'])
  })
})
