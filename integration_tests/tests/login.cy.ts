import DashboardPage from '../pages/dashboard'
import AuthSignInPage from '../pages/authSignIn'
import Page from '../pages/page'
import AuthManageDetailsPage from '../pages/authManageDetails'
import { userProfileFactory } from '../../server/testutils/factories/user'
import { userFactory } from '../../server/testutils/factories'
import DeliusMissingStaffDetails from '../pages/deliusMissingStaffDetails'
import ShowPage from '../pages/admin/userManagement/showPage'
import { signIn } from './signIn'

context('SignIn', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
  })

  it('Unauthenticated user directed to auth', () => {
    cy.visit('/')
    Page.verifyOnPage(AuthSignInPage)
  })

  it('Unauthenticated user navigating to sign in page directed to auth', () => {
    cy.visit('/sign-in')
    Page.verifyOnPage(AuthSignInPage)
  })

  it('User name visible in header', () => {
    signIn({ name: 'J. Smith' })

    const indexPage = Page.verifyOnPage(DashboardPage)
    indexPage.headerUserName().should('contain.text', 'J. Smith')
  })

  it('User can log out', () => {
    signIn()

    const indexPage = Page.verifyOnPage(DashboardPage)
    indexPage.signOut().click()
    Page.verifyOnPage(AuthSignInPage)
  })

  it('User can manage their details', () => {
    signIn()

    const indexPage = Page.verifyOnPage(DashboardPage)

    indexPage.manageDetails().get('a').invoke('removeAttr', 'target')
    indexPage.manageDetails().click()
    Page.verifyOnPage(AuthManageDetailsPage)
  })

  it('Token verification failure takes user to sign in page', () => {
    signIn()

    Page.verifyOnPage(DashboardPage)
    cy.task('stubVerifyToken', false)

    // can't do a visit here as cypress requires only one domain
    cy.request('/').its('body').should('contain', 'Sign in')
  })

  it('Token verification failure clears user session', () => {
    signIn()

    const indexPage = Page.verifyOnPage(DashboardPage)
    cy.task('stubVerifyToken', false)

    // can't do a visit here as cypress requires only one domain
    cy.request('/').its('body').should('contain', 'Sign in')

    cy.task('stubVerifyToken', true)
    signIn({ name: 'B. BROWN' })

    indexPage.headerUserName().contains('B. Brown')
  })

  it('Delius account missing staff details user directed to DeliusMissingStaffDetails', () => {
    const profile = userProfileFactory.build({ user: userFactory.build(), loadError: 'staff_record_not_found' })
    cy.task('stubAuthUser', { name: 'J. Smith', profile })
    cy.signIn()

    Page.verifyOnPage(DeliusMissingStaffDetails)
  })

  it('refreshes user details from the API if an API call returns a changed user version', () => {
    const newUserVersion = '987654321'
    const authUser = userFactory.build({ permissions: ['cas1_user_management'] })

    // Given I log in with an admin user without reporter role
    cy.task('stubAuthUser', { ...authUser })
    cy.signIn()

    // And I view the dashboard
    let dashboardPage = Page.verifyOnPage(DashboardPage)
    dashboardPage.shouldNotShowCard('reports')

    // When my user roles have been updated
    cy.task('stubAuthUser', { ...authUser, permissions: ['cas1_user_management', 'cas1_reports_view'] })
    cy.task('stubFindUser', { user: authUser, id: authUser.id, userVersion: newUserVersion })
    cy.task('stubCruManagementAreaReferenceData')

    // And I visit a page that calls the API
    const userPage = ShowPage.visit(authUser.id)

    // Then I visit another page
    userPage.clickMenuItem('Home')

    dashboardPage = Page.verifyOnPage(DashboardPage)

    // Then the updated user roles have been fetched from the API and the UI is updated
    dashboardPage.shouldShowCard('reports')
  })
})
