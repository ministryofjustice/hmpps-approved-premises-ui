import DashboardPage from '../pages/dashboard'
import AuthSignInPage from '../pages/authSignIn'
import Page from '../pages/page'
import AuthManageDetailsPage from '../pages/authManageDetails'
import { userProfileFactory } from '../../server/testutils/factories/user'
import { userFactory } from '../../server/testutils/factories'
import DeliusMissingStaffDetails from '../pages/deliusMissingStaffDetails'

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
    cy.task('stubAuthUser', { name: 'J. Smith' })
    cy.signIn()
    const indexPage = Page.verifyOnPage(DashboardPage)
    indexPage.headerUserName().should('contain.text', 'J. Smith')
  })

  it('User can log out', () => {
    cy.signIn()
    const indexPage = Page.verifyOnPage(DashboardPage)
    indexPage.signOut().click()
    Page.verifyOnPage(AuthSignInPage)
  })

  it('User can manage their details', () => {
    cy.signIn()
    const indexPage = Page.verifyOnPage(DashboardPage)

    indexPage.manageDetails().get('a').invoke('removeAttr', 'target')
    indexPage.manageDetails().click()
    Page.verifyOnPage(AuthManageDetailsPage)
  })

  it('Token verification failure takes user to sign in page', () => {
    cy.signIn()
    Page.verifyOnPage(DashboardPage)
    cy.task('stubVerifyToken', false)

    // can't do a visit here as cypress requires only one domain
    cy.request('/').its('body').should('contain', 'Sign in')
  })

  it('Token verification failure clears user session', () => {
    cy.signIn()
    const indexPage = Page.verifyOnPage(DashboardPage)
    cy.task('stubVerifyToken', false)

    // can't do a visit here as cypress requires only one domain
    cy.request('/').its('body').should('contain', 'Sign in')

    cy.task('stubVerifyToken', true)
    cy.task('stubAuthUser', { name: 'B. BROWN' })
    cy.signIn()

    indexPage.headerUserName().contains('B. Brown')
  })

  it('Delius account missing staff details user directed to DeliusMissingStaffDetails', () => {
    const profile = userProfileFactory.build({ user: userFactory.build(), loadError: 'staff_record_not_found' })
    cy.task('stubAuthUser', { name: 'J. Smith', profile })
    cy.signIn()
    Page.verifyOnPage(DeliusMissingStaffDetails)
  })
})
