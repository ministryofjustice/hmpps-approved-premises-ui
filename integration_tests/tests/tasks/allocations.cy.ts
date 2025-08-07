import { AND, GIVEN, THEN, WHEN } from '../../helpers'
import TaskListPage from '../../pages/tasks/listPage'
import AllocationsPage from '../../pages/tasks/allocationPage'
import Page from '../../pages/page'
import {
  applicationFactory,
  cas1TimelineEventFactory,
  cruManagementAreaFactory,
  personFactory,
  reallocationFactory,
  taskFactory,
  userFactory,
  userWithWorkloadFactory,
} from '../../../server/testutils/factories'
import { qualificationFactory } from '../../../server/testutils/factories/user'
import { applicationUserDetailsFactory } from '../../../server/testutils/factories/application'
import { fullPersonFactory } from '../../../server/testutils/factories/person'
import { signIn } from '../signIn'

context('Task Allocation', () => {
  const cruManagementArea = cruManagementAreaFactory.build()

  const cruManagementAreas = [...cruManagementAreaFactory.buildList(4), cruManagementArea]
  const qualifications = qualificationFactory.buildList(2)

  const applicantUserDetails = applicationUserDetailsFactory.build()
  const caseManagerUserDetails = applicationUserDetailsFactory.build()
  const application = applicationFactory.build({
    person: fullPersonFactory.build(),
    applicantUserDetails,
    caseManagerUserDetails,
    caseManagerIsNotApplicant: true,
    apType: 'pipe',
    isWomensApplication: false,
  })

  const task = taskFactory.build({
    allocatedToStaffMember: userFactory.build(),
    applicationId: application.id,
    taskType: 'Assessment',
    probationDeliveryUnit: { id: '2', name: 'East Sussex (includes Brighton and Hove)' },
  })

  const restrictedPerson = personFactory.build({ isRestricted: true })
  const applicationForRestrictedPerson = applicationFactory.withReleaseDate().build({
    apType: 'pipe',
    person: restrictedPerson,
    isWomensApplication: false,
  })

  const taskWithRestrictedPerson = taskFactory.build({
    allocatedToStaffMember: userFactory.build(),
    applicationId: applicationForRestrictedPerson.id,
    taskType: 'Assessment',
    probationDeliveryUnit: { id: '1', name: 'East Sussex (includes Brighton and Hove)' },
  })

  const tasks = [task, taskWithRestrictedPerson]
  describe('when logged in as CRU member', () => {
    beforeEach(() => {
      cy.task('reset')
      GIVEN('there are some users in the database')
      const users = [...userWithWorkloadFactory.buildList(3), userWithWorkloadFactory.build({ qualifications })]

      AND('there is an allocated task')
      cy.task('stubGetAllTasks', {
        tasks,
        allocatedFilter: 'allocated',
        page: '1',
        sortDirection: 'asc',
        cruManagementAreaId: cruManagementArea.id,
      })
      cy.task('stubTaskGet', { application, task, users })
      cy.task('stubApplicationGet', { application })
      cy.task('stubCruManagementAreaReferenceData', { cruManagementAreas })
      cy.task('stubUserSummaryList', { users, roles: ['assessor', 'appeals_manager'] })
      cy.task('stubUserList', { users, roles: ['assessor', 'appeals_manager'] })

      GIVEN('I am signed in as a CRU member with the correct CRU management area')
      signIn('cru_member', { cruManagementArea })

      WHEN('I visit the task list page')
      const taskListPage = TaskListPage.visit()

      cy.wrap(task).as('task')
      cy.wrap(taskListPage).as('taskListPage')
      cy.wrap(taskWithRestrictedPerson).as('taskWithRestrictedPerson')
      cy.wrap(tasks).as('tasks')
      cy.wrap(users).as('users')
      cy.wrap(users[0]).as('selectedUser')
      cy.wrap(application).as('application')
      cy.wrap(applicationForRestrictedPerson).as('applicationForRestrictedPerson')
      cy.wrap(cruManagementArea).as('cruManagementArea')
      cy.wrap(qualifications).as('qualification')
    })

    it('allows me to allocate a task', function test() {
      cy.task('stubTaskAllocationCreate', {
        task: { ...this.task, applicationId: this.application.id, allocatedToStaffMember: this.selectedUser },
        reallocation: reallocationFactory.build({ taskType: this.task.taskType, user: this.selectedUser }),
      })

      AND('I click to allocate the task')
      this.taskListPage.clickTask(this.task)

      THEN('I should be on the Allocations page for that task')
      const allocationsPage = Page.verifyOnPage(AllocationsPage, this.application, this.task)

      AND('I should see some information about that task')
      allocationsPage.shouldShowInformationAboutTask()

      AND('I should see a list of staff members who can be allocated to that task')
      allocationsPage.shouldShowUserTable(this.users, this.task)

      WHEN('I select a new user to allocate the application to')
      allocationsPage.clickAllocateToUser(this.users[0])

      THEN('I should be redirected to the index page')
      Page.verifyOnPage(TaskListPage, [], [])

      AND('I should see a confirmation message')
      this.taskListPage.shouldShowBanner(`Assessment has been allocated to ${this.selectedUser.name}`)

      AND('the API should have received the correct data')
      cy.task('verifyAllocationCreate', this.task).then(requests => {
        THEN('the API should have had a clarification note added')
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

      WHEN('I click on a task for a restricted person')
      this.taskListPage.clickTask(this.taskWithRestrictedPerson)

      THEN('I should be on the Allocations page for that task')
      const allocationsPage = Page.verifyOnPage(
        AllocationsPage,
        this.applicationForRestrictedPerson,
        this.taskWithRestrictedPerson,
      )

      allocationsPage.shouldShowPersonIsLimitedAccessOffender()
    })

    it('allows filters on users dashboard', function test() {
      AND('I click to view the task')
      this.taskListPage.clickTask(this.task)

      THEN('I should be on the Allocations page for that task')
      const allocationsPage = Page.verifyOnPage(AllocationsPage, this.application, this.task)

      AND('I should see a list of staff members who can be allocated to that task')
      allocationsPage.shouldShowUserTable(this.users, this.task)

      AND('the table should be sortable')
      allocationsPage.shouldBeSortableBy('Tasks pending')
      allocationsPage.shouldBeSortableBy('Name')
      allocationsPage.shouldBeSortableBy('Tasks completed in previous 7 days')
      allocationsPage.shouldBeSortableBy('Tasks completed in previous 30 days')

      WHEN('I filter by CRU Management Area')
      allocationsPage.searchBy('cruManagementAreaId', this.cruManagementArea.id)
      allocationsPage.clickApplyFilter()

      THEN('I should be shown a list of users with that CRU Management Area')
      let expectedUsers = this.users.filter(user => user.cruManagementArea.id === this.cruManagementArea.id)
      allocationsPage.shouldShowUserTable(expectedUsers, this.task)

      WHEN('I filter by all areas it should clear the filter')
      allocationsPage.searchBy('cruManagementAreaId', '')
      allocationsPage.clickApplyFilter()

      THEN('I should be shown a list of users for all areas')
      allocationsPage.shouldShowUserTable(this.users, this.task)

      WHEN('I filter by qualifications')
      allocationsPage.searchBy('qualification', this.qualification[0])
      allocationsPage.clickApplyFilter()

      THEN('I should be shown a list of users with that qualification')
      expectedUsers = this.users.filter(user => user.qualifications?.includes(this.qualification[0]))
      allocationsPage.shouldShowUserTable(expectedUsers, this.task)

      WHEN('I filter by both filters')
      allocationsPage.searchBy('cruManagementAreaId', this.cruManagementArea.id)
      allocationsPage.clickApplyFilter()

      THEN('I should be shown a list of users with that qualification and CRU Management Area')
      expectedUsers = expectedUsers.filter(user => user.cruManagementArea.id === this.cruManagementArea.id)
      allocationsPage.shouldShowUserTable(expectedUsers, this.task)
    })

    it('allows me to view timeline for task', function test() {
      const timeline = cas1TimelineEventFactory.buildList(10)
      cy.task('stubTaskAllocationCreate', {
        task: { ...this.task, applicationId: this.application.id, allocatedToStaffMember: this.selectedUser },
        reallocation: reallocationFactory.build({ taskType: this.task.taskType, user: this.selectedUser }),
      })
      const updatedApplication = { ...this.application, status: 'awaitingAssesment' }
      cy.task('stubApplicationGet', { application: updatedApplication })
      cy.task('stubApplicationTimeline', { applicationId: updatedApplication.id, timeline })

      AND('I click to allocate the task')
      this.taskListPage.clickTask(this.task)

      THEN('I should be on the Allocations page for that task')
      const allocationsPage = Page.verifyOnPage(AllocationsPage, this.application, this.task)

      AND('I should see some information about that task')
      allocationsPage.shouldShowInformationAboutTask()

      THEN('I should see timeline page')
      allocationsPage.clickViewTimeline()
      allocationsPage.shouldShowTimelineTab()
    })
  })

  describe('when logged in as an AP area manager', () => {
    it('should prevent access to the allocate page', () => {
      AND('I am signed in as an ap area manager')
      signIn('ap_area_manager')
      THEN('I should see an error if I attempt to access the allocation page')
      AllocationsPage.visitUnauthorised(task)
    })
  })
})
