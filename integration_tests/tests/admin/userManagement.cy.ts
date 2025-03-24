import { ApprovedPremisesUserRole, UserQualification } from '@approved-premises/api'
import paths from '../../../server/paths/admin'
import { cruManagementAreaFactory, userFactory } from '../../../server/testutils/factories'
import ConfirmDeletionPage from '../../pages/admin/userManagement/confirmDeletionPage'
import ConfirmUserDetailsPage from '../../pages/admin/userManagement/confirmUserDetailsPage'
import ListPage from '../../pages/admin/userManagement/listPage'
import SearchDeliusPage from '../../pages/admin/userManagement/searchDeliusPage'
import ShowPage from '../../pages/admin/userManagement/showPage'
import Page from '../../pages/page'
import { signIn } from '../signIn'

context('User management', () => {
  beforeEach(() => {
    cy.task('reset')

    // Given I am signed in as a User manager
    signIn('user_manager')
  })

  it('allows the user to view and update users', () => {
    // Given there are users in the DB
    const users = userFactory.buildList(10, { roles: ['assessor'], cruManagementAreaOverride: undefined })
    const user = users[0]
    const cruManagementAreas = cruManagementAreaFactory.buildList(5)
    cy.task('stubFindUser', { user, id: user.id })
    cy.task('stubUsers', { users })
    cy.task('stubCruManagementAreaReferenceData', { cruManagementAreas })

    // When I visit the list page
    const listPage = ListPage.visit()

    // Then I should see the users and their details
    listPage.shouldShowUsers(users)

    // Given I want to manage a user's permissions
    // When I click on a user's name
    listPage.clickUser(user.name)

    // Then I am taken to the user's permissions page
    const showPage = Page.verifyOnPage(ShowPage)

    showPage.checkForBackButton(paths.admin.userManagement.index({}))
    showPage.shouldShowUserDetails(user)

    // When I update the user's CRU management area, roles and qualifications
    const updatedCruManagementArea = cruManagementAreas[1]
    const updatedRoles = {
      roles: ['cru_member', 'report_viewer'] as const,
      allocationRoles: [
        'excluded_from_assess_allocation',
        'excluded_from_match_allocation',
        'excluded_from_placement_application_allocation',
      ] as const,
      qualifications: ['pipe', 'emergency', 'esap', 'lao', 'recovery_focused', 'mental_health_specialist'] as const,
    }
    showPage.completeForm({
      roles: updatedRoles.roles,
      allocationRoles: updatedRoles.allocationRoles,
      qualifications: updatedRoles.qualifications,
      cruManagementArea: updatedCruManagementArea,
    })
    const updatedUser = {
      ...user,
      roles: [...updatedRoles.roles, ...updatedRoles.allocationRoles],
      qualifications: [...updatedRoles.qualifications],
      cruManagementAreaOverride: updatedCruManagementArea,
    }
    cy.task('stubUserUpdate', {
      user: updatedUser,
    })
    cy.task('stubFindUser', { user: updatedUser, id: user.id })
    showPage.clickSubmit()

    // Then the user is updated in the DB
    cy.task('verifyUserUpdate', user.id).then(requests => {
      expect(requests).to.have.length(1)

      const body = JSON.parse(requests[0].body)

      expect(body).to.deep.equal({
        roles: updatedUser.roles,
        qualifications: updatedRoles.qualifications,
        cruManagementAreaOverrideId: updatedCruManagementArea.id,
      })
    })

    // And I should see a message confirming the details have been updated
    showPage.shouldShowBanner('User updated')

    // And I should see updated user roles
    const revisitedListPage = ListPage.visit()
    revisitedListPage.shouldShowUsers(users)
    revisitedListPage.clickUser(user.name)
    showPage.shouldHaveCriteriaSelected(updatedRoles.roles as unknown as Array<string>)
  })

  it('allows searching for users', () => {
    const usersForResults = userFactory.buildList(10)
    const initialUsers = userFactory.buildList(10)
    cy.task('stubUsers', { users: initialUsers })
    cy.task('stubCruManagementAreaReferenceData')

    // When I visit the list page
    const page = ListPage.visit()

    // Then I should see the users and their details
    page.shouldShowUsers(initialUsers)

    // When I search for a user
    const searchTerm = 'search term'
    cy.task('stubUserSearch', { results: usersForResults, searchTerm })
    page.search(searchTerm)

    // Then the page should show the results
    page.shouldShowUsers(usersForResults)
  })

  it('enables adding a user from Delius', () => {
    const users = userFactory.buildList(10)
    cy.task('stubCruManagementAreaReferenceData')
    cy.task('stubUsers', { users })
    // Given I am on the list page
    const listPage = ListPage.visit()

    // When I click the add user button
    listPage.clickAddUser()

    // Then I am taken to the add user page
    const searchDeliusPage = Page.verifyOnPage(SearchDeliusPage)
    searchDeliusPage.checkForBackButton(paths.admin.userManagement.index({}))

    // When I search for a username that doesn't exist
    const notFoundSearchTerm = 'user not in delius'
    cy.task('stubNotFoundDeliusUserSearch', { searchTerm: notFoundSearchTerm })
    searchDeliusPage.searchForUser(notFoundSearchTerm)

    // Then I should see an error
    searchDeliusPage.shouldShowErrorMessagesForFields(['username'], {
      username: 'User not found. Enter the NDelius username as appears on NDelius',
    })

    // When I search for a user
    const newUser = userFactory.build()
    cy.task('stubDeliusUserSearch', { result: newUser, searchTerm: newUser.deliusUsername })
    searchDeliusPage.searchForUser(newUser.deliusUsername)

    // Then I should be taken to the confirm details of the new user page
    const confirmationPage = Page.verifyOnPage(ConfirmUserDetailsPage)
    confirmationPage.checkForBackButton(paths.admin.userManagement.new({}))
    confirmationPage.shouldShowUserDetails(newUser)

    // When I click 'continue'
    cy.task('stubFindUser', { user: newUser, id: newUser.id })
    confirmationPage.clickContinue()

    // Then I should be taken to the user management dashboard
    Page.verifyOnPage(ShowPage)
  })

  it('enables deleting a user', () => {
    const users = userFactory.buildList(10)
    const userToDelete = users[0]
    cy.task('stubUsers', { users })
    cy.task('stubFindUser', { user: userToDelete, id: userToDelete.id })
    cy.task('stubCruManagementAreaReferenceData')

    // Given I am on a user's permissions page
    const permissionsPage = ShowPage.visit(userToDelete.id)

    // When I click the delete user button
    permissionsPage.clickRemoveAccess()

    // Then I should be taken to the confirmation screen
    const confirmationPage = Page.verifyOnPage(ConfirmDeletionPage)
    confirmationPage.checkForBackButton(paths.admin.userManagement.edit({ id: userToDelete.id }))

    // When I click 'Remove access'
    cy.task('stubUserDelete', { id: userToDelete.id })
    confirmationPage.clickSubmit()

    // Then I should be redirected to the user management dashboard
    const listPage = Page.verifyOnPage(ListPage)

    // And I should see a message confirming the user has been deleted
    listPage.shouldShowBanner('User deleted')
  })

  it('supports pagination', () => {
    const usersPage1 = userFactory.buildList(10)
    const usersPage2 = userFactory.buildList(10)
    const usersPage9 = userFactory.buildList(10)

    cy.task('stubCruManagementAreaReferenceData')
    cy.task('stubUsers', {
      users: usersPage1,
      page: '1',
    })
    cy.task('stubUsers', {
      users: usersPage2,
      page: '2',
    })
    cy.task('stubUsers', {
      users: usersPage9,
      page: '9',
    })

    // When I visit the tasks dashboard
    const listPage = ListPage.visit()

    // Then I should see a list of placement requests
    listPage.shouldShowUsers(usersPage1)

    // When I click next
    listPage.clickNext()

    // Then the API should have received a request for the next page
    cy.task('verifyUsersRequest', { page: '2' }).then(requests => {
      expect(requests).to.have.length(1)
    })

    // And the second page of users should be shown
    listPage.shouldShowUsers(usersPage2)

    // When I click on a page number
    listPage.clickPageNumber('9')

    // Then the API should have received a request for the next page
    cy.task('verifyUsersRequest', { page: '9' }).then(requests => {
      expect(requests).to.have.length(1)
    })

    // And the users for that page number should be shown
    listPage.shouldShowUsers(usersPage9)
  })

  it('supports sorting', () => {
    const users = userFactory.buildList(10)

    cy.task('stubUsers', {
      users,
    })

    cy.task('stubUsers', {
      users,
      sortBy: 'name',
      sortDirection: 'asc',
    })
    cy.task('stubUsers', {
      users,
      sortBy: 'name',
      sortDirection: 'desc',
    })
    cy.task('stubCruManagementAreaReferenceData')

    // When I visit the tasks dashboard
    const listPage = ListPage.visit()

    // Then I should see a list of placement requests
    listPage.shouldShowUsers(users)

    // When I sort by expected arrival in ascending order
    listPage.clickSortBy('name')

    // Then the dashboard should be sorted by expected arrival
    listPage.shouldBeSortedByField('name', 'ascending')

    // And the API should have received a request for the correct sort order
    cy.task('verifyUsersRequest', {
      sortBy: 'name',
      sortDirection: 'asc',
    }).then(requests => {
      expect(requests).to.have.length.greaterThan(0)
    })

    // When I sort by expected arrival in descending order
    listPage.clickSortBy('name')

    // Then the dashboard should be sorted by expected arrival in descending order
    listPage.shouldBeSortedByField('name', 'descending')

    // And the API should have received a request for the correct sort order
    cy.task('verifyUsersRequest', {
      sortBy: 'name',
      sortDirection: 'desc',
    }).then(requests => {
      expect(requests).to.have.length(1)
    })
  })

  it('allows filter for users', () => {
    const usersForResultsPage1 = userFactory.buildList(1)
    const usersForResultsPage2 = userFactory.buildList(1)
    const cruManagementAreas = cruManagementAreaFactory.buildList(5)

    const initialUsers = userFactory.buildList(10)
    cy.task('stubUsers', { users: initialUsers })
    cy.task('stubCruManagementAreaReferenceData', { cruManagementAreas })

    // When I visit the list page
    const page = ListPage.visit()

    // Then I should see the users and their details
    page.shouldShowUsers(initialUsers)

    // When I search for a user
    cy.task('stubUsers', {
      users: usersForResultsPage1,
      roles: ['assessor'] as Array<ApprovedPremisesUserRole>,
      qualifications: ['lao'] as Array<UserQualification>,
      cruManagementAreaId: cruManagementAreas[2].id,
    })
    cy.task('stubUsers', {
      users: usersForResultsPage2,
      roles: ['assessor'] as Array<ApprovedPremisesUserRole>,
      qualifications: ['lao'] as Array<UserQualification>,
      cruManagementAreaId: cruManagementAreas[2].id,
      page: '2',
    })
    page.searchBy('role', 'assessor')
    page.searchBy('area', cruManagementAreas[2].id)
    page.searchBy('qualification', 'lao')
    page.clickApplyFilter()

    // Then the page should show the results
    page.shouldShowUsers(usersForResultsPage1)

    // When I click on a page number
    page.clickPageNumber('2')

    // Then the page should show the results for the second page
    page.shouldShowUsers(usersForResultsPage2)
  })
})
