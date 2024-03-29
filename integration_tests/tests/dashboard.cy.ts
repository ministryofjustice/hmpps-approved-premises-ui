import { signInWithRoles } from '../helpers'
import DashboardPage from '../pages/dashboard'

context('Dashboard', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
  })

  it('displays all services when a user has all roles', () => {
    signInWithRoles(['assessor', 'manager'])

    const dashboardPage = DashboardPage.visit()

    dashboardPage.shouldShowCard('apply')
    dashboardPage.shouldShowCard('assess')
    dashboardPage.shouldShowCard('manage')
  })

  it('only displays the apply and assess services to assessors', () => {
    signInWithRoles(['assessor'])

    const dashboardPage = DashboardPage.visit()

    dashboardPage.shouldShowCard('apply')
    dashboardPage.shouldShowCard('assess')

    dashboardPage.shouldNotShowCard('manage')
  })

  it('only displays the apply service when someone has no roles', () => {
    signInWithRoles([])

    const dashboardPage = DashboardPage.visit()

    dashboardPage.shouldShowCard('apply')

    dashboardPage.shouldNotShowCard('assess')
    dashboardPage.shouldNotShowCard('manage')
  })

  it('only displays the apply and manage services to managers', () => {
    signInWithRoles(['manager'])

    const dashboardPage = DashboardPage.visit()

    dashboardPage.shouldShowCard('manage')
    dashboardPage.shouldShowCard('apply')

    dashboardPage.shouldNotShowCard('assess')
  })

  it('displays the apply and user management services to users with "role_admin"', () => {
    signInWithRoles(['role_admin'])

    const dashboardPage = DashboardPage.visit()

    dashboardPage.shouldShowCard('apply')
    dashboardPage.shouldShowCard('userManagement')

    dashboardPage.shouldNotShowCard('assess')
    dashboardPage.shouldNotShowCard('manage')
  })
})
