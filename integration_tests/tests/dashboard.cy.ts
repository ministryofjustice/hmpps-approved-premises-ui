import { signInWithRolesAndPermissions } from '../helpers'
import DashboardPage from '../pages/dashboard'

context('Dashboard', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
  })

  it('displays all services when a user has all roles and permissions', () => {
    signInWithRolesAndPermissions(['assessor', 'manager'], ['cas1_view_assigned_assessments'])

    const dashboardPage = DashboardPage.visit()

    dashboardPage.shouldShowCard('apply')
    dashboardPage.shouldShowCard('assess')
    dashboardPage.shouldShowCard('manage')
  })

  it('only displays the apply and assess services to users with "cas1_view_assigned_assessments" permission', () => {
    signInWithRolesAndPermissions([], ['cas1_view_assigned_assessments'])

    const dashboardPage = DashboardPage.visit()

    dashboardPage.shouldShowCard('apply')
    dashboardPage.shouldShowCard('assess')

    dashboardPage.shouldNotShowCard('manage')
  })

  it('only displays the apply service when someone has no roles', () => {
    signInWithRolesAndPermissions([])

    const dashboardPage = DashboardPage.visit()

    dashboardPage.shouldShowCard('apply')

    dashboardPage.shouldNotShowCard('assess')
    dashboardPage.shouldNotShowCard('manage')
  })

  it('only displays the apply and manage services to managers', () => {
    signInWithRolesAndPermissions(['manager'])

    const dashboardPage = DashboardPage.visit()

    dashboardPage.shouldShowCard('manage')
    dashboardPage.shouldShowCard('apply')

    dashboardPage.shouldNotShowCard('assess')
  })

  it('displays the apply and user management services to users with "role_admin"', () => {
    signInWithRolesAndPermissions(['role_admin'])

    const dashboardPage = DashboardPage.visit()

    dashboardPage.shouldShowCard('apply')
    dashboardPage.shouldShowCard('userManagement')

    dashboardPage.shouldNotShowCard('assess')
    dashboardPage.shouldNotShowCard('manage')
  })
})
