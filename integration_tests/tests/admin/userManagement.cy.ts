import { userFactory } from '../../../server/testutils/factories'
import ListPage from '../../pages/admin/userManagement/listPage'
import { ShowPage } from '../../pages/admin/userManagement/showPage'
import Page from '../../pages/page'

context('User management', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')

    // Given I am logged in
    cy.signIn()
  })

  it('allows the user to view users', () => {
    // Given there are users in the DB
    const users = userFactory.buildList(10)
    const user = users[0]
    cy.task('stubUsers', { users })

    // When I visit the list page
    const page = ListPage.visit()
    page.checkForBackButton('/')

    // Then I should see the users and their details
    page.shouldShowUsers(users)

    // Given I want to manage a user's permissions
    // When I click on a user's name
    page.clickUser(user.name)

    // Then I am taken to the user's permissions page
    const showPage = Page.verifyOnPage(ShowPage)
    showPage.checkForBackButton(paths.admin.userManagement.index({}))
    showPage.shouldShowUserDetails(user)
  })

  it('allows searching for users', () => {
    const usersForResults = userFactory.buildList(10)
    const initialUsers = userFactory.buildList(10)
    cy.task('stubUsers', { users: initialUsers })

    // When I visit the list page
    const page = ListPage.visit()
    page.checkForBackButton('/')

    // Then I should see the users and their details
    page.shouldShowUsers(initialUsers)

    // When I search for a user
    const searchTerm = 'search term'
    cy.task('stubUserSearch', { results: usersForResults, searchTerm })
    page.search(searchTerm)

    // Then the page should show the results
    page.shouldShowUsers(usersForResults)
  })
})
